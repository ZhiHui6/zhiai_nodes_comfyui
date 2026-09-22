import { app } from "/scripts/app.js";

/**
 * 潪AI节点包内置汉化运行时（中/英自适应）
 *
 * 替代原先依赖 ComfyUI-DD-Translation 的汉化方式：词典随插件分发在 web/locale/zh/ 下，
 * 运行时按当前 ComfyUI 语言决定显示：
 *   - 节点标题、节点描述
 *   - 控件（widget）标签、输入/输出端口名
 *   - 下拉选项的显示文本（仅显示层，提交值仍为英文原值）
 *
 * 语言检测优先级：Comfy.Locale 设置 → localStorage → 浏览器语言 → <html lang> → en；
 * 语言变化时立即重刷已存在节点，无需刷新页面。
 */

const NODES_URL = new URL("./locale/zh/nodes.json", import.meta.url);
const VALUES_URL = new URL("./locale/zh/values.json", import.meta.url);

const LOCALE_KEYS = ["Comfy.Locale", "Comfy.Language"];
const STORAGE_KEYS = ["Comfy.Locale", "Comfy.Language", "i18nextLng"];
const COMBO_TYPES = new Set(["combo", "COMBO"]);
const CJK = /[\u4e00-\u9fff]/;

const dicts = { nodes: {}, values: {} };
/** 节点注册表：className -> { def, type, originalTitle, originalDescription } */
const registry = new Map();

let dictPromise = null;
let activeLocale = null;

/* ------------------------------- 语言检测 ------------------------------- */

function unwrapSetting(value) {
	if (typeof value !== "string") return value;
	const text = value.trim();
	if (!text.startsWith("{") && !text.startsWith('"')) return value;
	try {
		const parsed = JSON.parse(text);
		if (typeof parsed === "string") return parsed;
		if (parsed && typeof parsed === "object") {
			return parsed.locale ?? parsed.language ?? parsed.value ?? parsed.id ?? null;
		}
	} catch (_) {
		/* 非 JSON 文本，按原文处理 */
	}
	return value;
}

function normalizeLocale(value) {
	const text = String(unwrapSetting(value) ?? "").trim().toLowerCase();
	if (!text) return null;
	if (/^(zh|cn|chinese)/.test(text) || text.includes("chinese") || CJK.test(text)) return "zh";
	if (/^(en|english)/.test(text) || text.includes("english")) return "en";
	return null;
}

function storageLocale() {
	try {
		for (const key of STORAGE_KEYS) {
			const locale = normalizeLocale(localStorage.getItem(key));
			if (locale) return locale;
		}
	} catch (_) {
		/* 隐私模式等场景忽略 */
	}
	return null;
}

export function getLocale() {
	const settings = app?.ui?.settings;
	for (const key of LOCALE_KEYS) {
		const locale = normalizeLocale(settings?.getSettingValue?.(key));
		if (locale) return locale;
	}
	const stored = storageLocale();
	if (stored) return stored;
	for (const language of [...(navigator?.languages ?? []), navigator?.language]) {
		const locale = normalizeLocale(language);
		if (locale) return locale;
	}
	return normalizeLocale(document?.documentElement?.lang) ?? "en";
}

/* ------------------------------- 词典访问 ------------------------------- */

async function fetchJson(url, label) {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return await response.json();
	} catch (error) {
		console.warn(`[zhihui_nodes] ${label}词典加载失败，汉化降级为英文：${url.href}`, error);
		return {};
	}
}

function loadDicts() {
	if (!dictPromise) {
		dictPromise = Promise.all([fetchJson(NODES_URL, "节点"), fetchJson(VALUES_URL, "选项")]).then(
			([nodes, values]) => {
				if (nodes && typeof nodes === "object") dicts.nodes = nodes;
				if (values && typeof values === "object") dicts.values = values;
				return dicts;
			}
		);
	}
	return dictPromise;
}

function nodeDict(className) {
	const entry = dicts.nodes[className];
	return entry && typeof entry === "object" ? entry : null;
}

function textOf(value) {
	return typeof value === "string" && value ? value : null;
}

/** 节点标题 / 描述的汉化文本 */
function zhText(className, key) {
	return textOf(nodeDict(className)?.[key]);
}

/** 控件或输入端口的汉化标签 */
function zhLabel(className, name) {
	const entry = nodeDict(className);
	if (!entry) return null;
	return textOf(entry.inputs?.[name]) ?? textOf(entry.widgets?.[name]);
}

/** 输出端口的汉化标签 */
function zhOutput(className, name) {
	return textOf(nodeDict(className)?.outputs?.[name]) ?? zhLabel(className, name);
}

/** 下拉选项的汉化文本（节点专属 options 优先，其次全局扁平表） */
function zhOption(className, widgetName, value) {
	const text = String(value ?? "");
	if (!text) return null;
	return textOf(nodeDict(className)?.options?.[widgetName]?.[text]) ?? textOf(dicts.values[text]);
}

/* ------------------------------- 通用改写 ------------------------------- */

function redraw() {
	try {
		app?.graph?.setDirtyCanvas?.(true, true);
		app?.canvas?.setDirty?.(true, true);
	} catch (_) {
		/* 画布尚未就绪 */
	}
}

function registryEntry(className) {
	let entry = registry.get(className);
	if (!entry) {
		entry = { def: null, type: null, originalTitle: null, originalDescription: "" };
		registry.set(className, entry);
	}
	return entry;
}

/** 只记录尚未被汉化的文本作为原文，避免把汉化结果当成原文 */
function captureOriginal(candidate, cached) {
	if (typeof candidate === "string" && candidate && !CJK.test(candidate)) return candidate;
	return cached ?? null;
}

/**
 * 写入显示标签。
 * 仅当当前值仍是「原始状态」时写入：为空、等于自身 name、或等于本模块上次写入的值；
 * 其它模块或用户自定义的标签不被侵占，切回英文时也能准确还原。
 */
function applyLabel(item, zhTextValue, extra) {
	if (!item || typeof item.name !== "string") return false;
	const name = item.name;
	const managed = item._zhihuiLabel;
	const current = item.label;
	if (typeof managed === "string") {
		if (current !== managed) {
			delete item._zhihuiLabel;
			return false;
		}
	} else if (typeof current === "string" && current && current !== name) {
		return false;
	}
	const next = getLocale() === "zh" && zhTextValue ? zhTextValue : name;
	let changed = false;
	if (current !== next) {
		item.label = next;
		changed = true;
	}
	if ("localized_name" in item && item.localized_name !== next) {
		item.localized_name = next;
		changed = true;
	}
	if (extra) changed = extra(next) || changed;
	item._zhihuiLabel = next;
	return changed;
}

function applyWidgetLabel(widget, zhTextValue) {
	return applyLabel(widget, zhTextValue, (next) => {
		if (!widget.options || widget.options.label === next) return false;
		widget.options.label = next;
		return true;
	});
}

function isComboWidget(widget) {
	return COMBO_TYPES.has(widget.type) || Array.isArray(widget.options?.values);
}

/**
 * 下拉选项仅改显示文本：getOptionLabel 每次调用实时读取当前语言；
 * 不改 widget.value 与 widget.options.values，提交值及后端逻辑不受影响。
 */
function applyOptionLabel(className, widget) {
	const options = widget.options;
	if (!options || options._zhihuiOptionLabel) return false;
	if (typeof options.getOptionLabel === "function") return false;
	options.getOptionLabel = (value) => {
		if (value === null || value === undefined || getLocale() !== "zh") return value;
		return zhOption(className, widget.name, value) ?? value;
	};
	options._zhihuiOptionLabel = true;
	return true;
}

/* ------------------------------- 节点改写 ------------------------------- */

function nodeClassName(node) {
	return node?.comfyClass || node?.constructor?.comfyClass || node?.type || "";
}

function originalTitleOf(className) {
	return registry.get(className)?.originalTitle ?? className;
}

function applyNodeTitle(node, className) {
	const zhTitle = zhText(className, "title");
	if (!zhTitle) return false;
	const current = node.title;
	const managed = node._zhihuiTitle;
	if (typeof managed === "string") {
		if (current !== managed) {
			delete node._zhihuiTitle;
			return false;
		}
	} else if (typeof current === "string" && current && current !== className && current !== originalTitleOf(className)) {
		return false;
	}
	const next = getLocale() === "zh" ? zhTitle : originalTitleOf(className);
	if (current === next) {
		node._zhihuiTitle = next;
		return false;
	}
	node.title = next;
	node._zhihuiTitle = next;
	return true;
}

function applyNode(node) {
	const className = nodeClassName(node);
	if (!className || !nodeDict(className)) return false;
	let changed = applyNodeTitle(node, className);
	for (const input of node.inputs ?? []) {
		changed = applyLabel(input, zhLabel(className, input.name)) || changed;
	}
	for (const output of node.outputs ?? []) {
		changed = applyLabel(output, zhOutput(className, output.name)) || changed;
	}
	for (const widget of node.widgets ?? []) {
		if (typeof widget?.name !== "string") continue;
		changed = applyWidgetLabel(widget, zhLabel(className, widget.name)) || changed;
		if (isComboWidget(widget)) changed = applyOptionLabel(className, widget) || changed;
	}
	return changed;
}

/* --------------------------- 节点定义/类型改写 --------------------------- */

/** 节点定义：影响节点添加菜单、节点库与节点说明 */
function registerNodeDef(def) {
	const className = def?.name;
	if (typeof className !== "string" || !className) return;
	const entry = registryEntry(className);
	if (entry.def !== def) {
		entry.def = def;
		entry.originalTitle = captureOriginal(def.display_name, entry.originalTitle);
		entry.originalDescription =
			typeof def.description === "string" && !CJK.test(def.description)
				? def.description
				: entry.originalDescription;
	}
	applyNodeDef(entry);
}

function applyNodeDef(entry) {
	const className = entry.def?.name;
	if (!className) return false;
	const zhTitle = zhText(className, "title");
	const zhDescription = zhText(className, "description");
	if (!zhTitle && !zhDescription) return false;
	const zh = getLocale() === "zh";
	let changed = false;
	const nextName = zh && zhTitle ? zhTitle : entry.originalTitle;
	if (nextName && entry.def.display_name !== nextName) {
		entry.def.display_name = nextName;
		changed = true;
	}
	if (entry.originalDescription) {
		const nextDescription = zh && zhDescription ? zhDescription : entry.originalDescription;
		if (entry.def.description !== nextDescription) {
			entry.def.description = nextDescription;
			changed = true;
		}
	}
	return changed;
}

/** 已注册节点类型：决定新拖出节点的默认标题与说明快照 */
function applyRegisteredTypes() {
	const registered = globalThis.LiteGraph?.registered_node_types;
	if (!registered) return false;
	const zh = getLocale() === "zh";
	let changed = false;
	for (const [className, nodeType] of Object.entries(registered)) {
		const zhTitle = zhText(className, "title");
		if (!zhTitle || !nodeType) continue;
		const entry = registryEntry(className);
		if (entry.type !== nodeType) {
			entry.type = nodeType;
			entry.originalTitle = captureOriginal(nodeType.title, entry.originalTitle);
		}
		const next = zh ? zhTitle : entry.originalTitle;
		if (next && nodeType.title !== next) {
			nodeType.title = next;
			changed = true;
		}
		const snapshot = nodeType.nodeData;
		if (!snapshot) continue;
		if ("backendDisplayName" in snapshot) {
			entry.originalTitle = captureOriginal(snapshot.backendDisplayName, entry.originalTitle);
			const nextDisplay = zh ? zhTitle : entry.originalTitle;
			if (nextDisplay && snapshot.backendDisplayName !== nextDisplay) {
				snapshot.backendDisplayName = nextDisplay;
				changed = true;
			}
		}
		if (!entry.originalDescription) {
			entry.originalDescription =
				typeof snapshot.backendDescription === "string" && !CJK.test(snapshot.backendDescription)
					? snapshot.backendDescription
					: "";
		}
		const zhDescription = zhText(className, "description");
		if (zhDescription && "backendDescription" in snapshot) {
			const nextDescription = zh ? zhDescription : entry.originalDescription;
			if (nextDescription && snapshot.backendDescription !== nextDescription) {
				snapshot.backendDescription = nextDescription;
				changed = true;
			}
		}
	}
	return changed;
}

/* ------------------------------- 全量刷新 ------------------------------- */

/** 遍历根图与其子图中的所有节点 */
function eachGraphNode(visit) {
	const seen = new Set();
	const walk = (graph) => {
		if (!graph || seen.has(graph)) return;
		seen.add(graph);
		for (const node of graph._nodes ?? []) {
			visit(node);
			if (node?.subgraph) walk(node.subgraph);
		}
	};
	walk(app?.graph);
}

function applyAll(force = false) {
	const locale = getLocale();
	if (!force && locale === activeLocale) return;
	activeLocale = locale;
	let changed = false;
	for (const entry of registry.values()) {
		changed = applyNodeDef(entry) || changed;
	}
	changed = applyRegisteredTypes() || changed;
	eachGraphNode((node) => {
		changed = applyNode(node) || changed;
	});
	if (changed) redraw();
}

function bindLocaleWatchers() {
	const settings = app?.ui?.settings;
	try {
		for (const key of LOCALE_KEYS) {
			settings?.addEventListener?.(`${key}.change`, () => applyAll(true));
		}
	} catch (_) {
		/* 旧版前端无该事件，交由轮询兜底 */
	}
	window.addEventListener("storage", () => applyAll(true));
	window.addEventListener("languagechange", () => applyAll(true));
	// 兜底轮询：与仓库既有 GroupSwitchManager.js 的约定一致
	setInterval(() => applyAll(), 1000);
}

app.registerExtension({
	name: "zhihui_nodes.I18N",
	async setup() {
		await loadDicts();
		applyAll(true);
		bindLocaleWatchers();
		// 兜底：部分节点在 setup 之后才反序列化
		setTimeout(() => applyAll(true), 500);
	},
	async beforeRegisterNodeDef(nodeType, nodeData) {
		const className = nodeData?.name;
		if (!className) return;
		registerNodeDef(nodeData);
		if (!nodeDict(className)) return;
		const onNodeCreated = nodeType.prototype.onNodeCreated;
		nodeType.prototype.onNodeCreated = function () {
			const result = onNodeCreated?.apply(this, arguments);
			applyNode(this);
			return result;
		};
		const onConfigure = nodeType.prototype.onConfigure;
		nodeType.prototype.onConfigure = function () {
			const result = onConfigure?.apply(this, arguments);
			setTimeout(() => {
				if (applyNode(this)) redraw();
			}, 0);
			return result;
		};
	},
	nodeCreated(node) {
		applyNode(node);
	},
	loadedGraphNode(node) {
		applyNode(node);
	},
	beforeRegisterVueAppNodeDefs(nodeDefs) {
		for (const def of nodeDefs ?? []) registerNodeDef(def);
	},
});