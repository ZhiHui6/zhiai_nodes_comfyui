import { app } from "/scripts/app.js";


const NODES_URL = "/zhiai_nodes/locale/zh/nodes";
const VALUES_URL = "/zhiai_nodes/locale/zh/values";

const LOCALE_KEYS = ["Comfy.Locale", "Comfy.Language"];
const STORAGE_KEYS = ["Comfy.Locale", "Comfy.Language", "i18nextLng"];
const VUE_NODES_KEYS = ["Comfy.VueNodes.Enabled"];
const COMBO_TYPES = new Set(["combo", "COMBO"]);
const CJK = /[\u4e00-\u9fff]/;

const dicts = { nodes: {}, values: {} };
const registry = new Map();

let dictPromise = null;
let activeLocale = null;


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

export function isVueNodeRendering() {
	try {
		const settings = app?.ui?.settings;
		for (const key of VUE_NODES_KEYS) {
			const value = settings?.getSettingValue?.(key);
			if (value === true || value === "true") return true;
			if (value === false || value === "false") return false;
		}
	} catch (_) {
	}
	return false;
}


async function fetchJson(url, label) {
	try {
		const response = await fetch(url, { cache: "no-cache" });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return await response.json();
	} catch (error) {
		console.warn(`[zhiai_nodes] ${label}词典加载失败，汉化降级为英文：${url}`, error);
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

function zhText(className, key) {
	return textOf(nodeDict(className)?.[key]);
}

function zhLabel(className, name) {
	const entry = nodeDict(className);
	if (!entry) return null;
	return textOf(entry.inputs?.[name]) ?? textOf(entry.widgets?.[name]);
}

function zhOutput(className, name) {
	return textOf(nodeDict(className)?.outputs?.[name]) ?? zhLabel(className, name);
}

function zhOption(className, widgetName, value) {
	const text = String(value ?? "");
	if (!text) return null;
	return textOf(nodeDict(className)?.options?.[widgetName]?.[text]) ?? textOf(dicts.values[text]);
}

function canonicalOptionValue(className, widgetName, value) {
	const entry = nodeDict(className)?.options?.[widgetName];
	if (!entry) return null;
	const text = String(value ?? "");
	for (const [raw, zh] of Object.entries(entry)) {
		if (zh === text) return raw;
	}
	return null;
}

function wrapComboSerialize(widget, className) {
	if (widget._zhiaiSerializeWrap) return;
	const originalSerialize = widget.serializeValue;
	widget._zhiaiSerializeWrap = function (node, index) {
		const display = this.value;
		const raw = canonicalOptionValue(className, this.name, display);
		let result;
		if (raw != null) this.value = raw;
		try {
			result = originalSerialize
				? originalSerialize.call(this, node, index)
				: raw ?? display;
		} finally {
			this.value = display;
		}
		return result;
	};
	widget.serializeValue = widget._zhiaiSerializeWrap;
}

function applyComboValues(className, widget) {
	const options = widget.options;
	if (!isComboWidget(widget) || !Array.isArray(options?.values)) return false;
	if (!Array.isArray(widget._zhiaiOriginalValues)) {
		widget._zhiaiOriginalValues = options.values.map((value) => String(value));
	}
	const original = widget._zhiaiOriginalValues;
	const zh = getLocale() === "zh";
	const next = zh
		? original.map((value) => zhOption(className, widget.name, value) ?? value)
		: original.slice();
	if (widget.value != null) {
		if (!next.includes(widget.value)) {
			const index = original.indexOf(String(widget.value));
			if (index >= 0) {
				widget.value = next[index];
			} else {
				const raw = canonicalOptionValue(className, widget.name, widget.value);
				if (raw != null) {
					const rawIndex = original.indexOf(raw);
					if (rawIndex >= 0) widget.value = next[rawIndex];
				}
			}
		}
	}
	const unchanged =
		next.length === options.values.length &&
		next.every((value, index) => options.values[index] === value);
	if (unchanged) return false;
	options.values = next;
	wrapComboSerialize(widget, className);
	return true;
}

export function zhNodeInfo(className) {
	return {
		title: zhText(className, "title"),
		description: zhText(className, "description"),
		inputLabel: (name) => zhLabel(className, name),
		outputLabel: (name) => zhOutput(className, name),
	};
}


function redraw() {
	try {
		app?.graph?.setDirtyCanvas?.(true, true);
		app?.canvas?.setDirty?.(true, true);
	} catch (_) {
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

function captureOriginal(candidate, cached) {
	if (typeof candidate === "string" && candidate && !CJK.test(candidate)) return candidate;
	return cached ?? null;
}

function applyLabel(item, zhTextValue, extra) {
	if (!item || typeof item.name !== "string") return false;
	const name = item.name;
	const managed = item._zhiaiLabel;
	const current = item.label;
	if (typeof managed === "string") {
		if (current !== managed) {
			if (current !== zhTextValue) {
				delete item._zhiaiLabel;
				return false;
			}
		}
	} else if (typeof current === "string" && current && current !== name && current !== zhTextValue) {
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
	item._zhiaiLabel = next;
	return changed;
}

function applyLiveLabel(item, resolveZh) {
	if (!item || typeof item.name !== "string") return false;
	if (item._zhiaiLiveLabel) return false;
	const zh = resolveZh(item.name);
	const current = item.label;
	if (typeof current === "string" && current && current !== item.name && current !== zh) return false;
	const fallback =
		typeof current === "string" && current && current !== item.name ? current : item.name;
	try {
		Object.defineProperty(item, "label", {
			configurable: true,
			enumerable: true,
			get() {
				const text = resolveZh(this.name);
				const value = this._zhiaiLabelOverride;
				if (typeof value === "string" && value && value !== this.name && value !== text) return value;
				const name = this.name;
				const resolved = textOf(text);
				if (getLocale() === "zh" && resolved && resolved !== name) return resolved;
				if (typeof fallback === "string" && fallback && fallback !== name) return fallback;
				const dot = name.lastIndexOf(".");
				if (dot >= 0 && dot < name.length - 1) return name.slice(dot + 1);
				return name;
			},
			set(value) {
				this._zhiaiLabelOverride = value;
			},
		});
	} catch (_) {
		return applyLabel(item, zh);
	}
	return true;
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

function applyOptionLabel(className, widget) {
	const options = widget.options;
	if (!options) return false;
	if (!isVueNodeRendering()) return clearOptionLabel(options);
	if (options._zhiaiOptionLabel) return false;
	if (typeof options.getOptionLabel === "function") return false;
	const mapLabel = (value) => {
		if (value === null || value === undefined || getLocale() !== "zh") return value;
		return zhOption(className, widget.name, value) ?? value;
	};
	options.getOptionLabel = mapLabel;
	options._zhiaiOptionLabel = mapLabel;
	return true;
}

function clearOptionLabel(options) {
	const injected = options._zhiaiOptionLabel;
	if (!injected) return false;
	if (options.getOptionLabel === injected) delete options.getOptionLabel;
	delete options._zhiaiOptionLabel;
	return true;
}


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
	const managed = node._zhiaiTitle;
	if (typeof managed === "string") {
		if (current !== managed) {
			delete node._zhiaiTitle;
			return false;
		}
	} else if (typeof current === "string" && current && current !== className && current !== originalTitleOf(className)) {
		return false;
	}
	const next = getLocale() === "zh" ? zhTitle : originalTitleOf(className);
	if (current === next) {
		node._zhiaiTitle = next;
		return false;
	}
	node.title = next;
	node._zhiaiTitle = next;
	return true;
}

export function applyNode(node) {
	const className = nodeClassName(node);
	if (!className || !nodeDict(className)) return false;
	let changed = applyNodeTitle(node, className);
	for (const input of node.inputs ?? []) {
		changed = applyLiveLabel(input, (name) => zhLabel(className, name)) || changed;
	}
	for (const output of node.outputs ?? []) {
		changed = applyLiveLabel(output, (name) => zhOutput(className, name)) || changed;
	}
	for (const widget of node.widgets ?? []) {
		if (typeof widget?.name !== "string") continue;
		changed = applyWidgetLabel(widget, zhLabel(className, widget.name)) || changed;
		if (isComboWidget(widget)) {
			changed = applyComboValues(className, widget) || changed;
			changed = applyOptionLabel(className, widget) || changed;
		}
	}
	return changed;
}


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
	}
	window.addEventListener("storage", () => applyAll(true));
	window.addEventListener("languagechange", () => applyAll(true));
	setInterval(() => applyAll(), 1000);
}

app.registerExtension({
	name: "zhiai_nodes.I18N",
	async setup() {
		await loadDicts();
		applyAll(true);
		bindLocaleWatchers();
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