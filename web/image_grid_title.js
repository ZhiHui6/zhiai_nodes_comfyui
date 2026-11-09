import { app } from "/scripts/app.js";
import { getLocale, isVueNodeRendering } from "./zhiai_i18n.js";

const NODE_NAME = "ImageGridTitle";
const IMAGE_TYPE = "IMAGE";
const TITLES_WIDGET = "titles";
const CONTAINER_NAME = "zhiai_title_rows";
const BOX_WIDTH = 160;
const BOX_HEIGHT = 24;
const RIGHT_MARGIN = 8;
const FALLBACK_ROW_HEIGHT = 30;
const PROBE_WIDTH = 100;
const MAX_OFFSET = 8000;
const BINDING_RE = /^\s*(\d+)\s*[:：=]\s*(.*)$/;

const STYLE_ID = "zhiai-image-grid-title-style";
const CSS = `
.zhiai-tgr-layer{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:5}
.zhiai-tgr-probe{position:absolute;left:0;top:0;width:${PROBE_WIDTH}px;height:1px;visibility:hidden;pointer-events:none}
.zhiai-tgr-layer input{position:absolute;pointer-events:auto;box-sizing:border-box;height:${BOX_HEIGHT}px;width:${BOX_WIDTH}px;background:var(--comfy-input-bg,#222222);border:1px solid var(--border-color,#444444);border-radius:6px;color:var(--fg-color,#dddddd);font-size:12px;line-height:1;padding:0 8px;outline:none}
.zhiai-tgr-layer input:focus{border-color:var(--comfy-accent-color,#3B82F6)}
.zhiai-tgr-layer.zhiai-tgr-fb{position:relative;width:100%;height:auto}
.zhiai-tgr-layer.zhiai-tgr-fb .zhiai-tgr-probe{display:none}
.zhiai-tgr-layer.zhiai-tgr-fb input{right:${RIGHT_MARGIN}px;left:auto}
`;

function ensureStyle() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = CSS;
	document.head.appendChild(style);
}

function imageSlots(node) {
	const slots = [];
	(node.inputs ?? []).forEach((slot, index) => {
		if (slot && slot.type === IMAGE_TYPE) slots.push({ slot, index });
	});
	return slots;
}

function parseTitles(value) {
	const explicit = new Map();
	const fallback = [];
	let binding = false;
	for (const line of String(value ?? "").split(/\r?\n/)) {
		const match = line.match(BINDING_RE);
		if (match) {
			binding = true;
			explicit.set(Number(match[1]) - 1, match[2].trim());
		} else if (line.trim()) {
			fallback.push(line.trim());
		}
	}
	return { explicit, fallback, binding };
}

function titlesForPorts(value, portCount) {
	const { explicit, fallback } = parseTitles(value);
	const lines = new Array(portCount).fill("");
	for (const [index, text] of explicit) {
		if (index >= 0 && index < portCount) lines[index] = text;
	}
	let fi = 0;
	for (let i = 0; i < portCount; i++) {
		if (lines[i] === "" && fi < fallback.length) {
			lines[i] = fallback[fi];
			fi++;
		}
	}
	return lines;
}

function serializeTitles(lines, binding) {
	return lines
		.map((text, index) => (binding ? `${index + 1}: ${text}` : text))
		.join("\n");
}

function commitValue(state, portCount, index, text) {
	const widget = state.titlesWidget;
	const lines = titlesForPorts(widget.value, portCount);
	lines[index] = text;
	let binding = parseTitles(widget.value).binding;
	const last = lines.reduce((acc, item, i) => (item ? i : acc), -1);
	const trimmed = lines.slice(0, last + 1);
	if (!binding && trimmed.some((item) => !item)) binding = true;
	widget.value = serializeTitles(trimmed, binding);
}

function placeholderFor(index) {
	return getLocale() === "zh" ? `第 ${index + 1} 张的标题` : `Title ${index + 1}`;
}

function rebuild(node, state) {
	const ports = imageSlots(node);
	const lines = titlesForPorts(state.titlesWidget.value, ports.length);
	const container = state.container;
	for (const child of [...container.children]) {
		if (child !== state.probe) child.remove();
	}
	state.inputs = ports.map(({ slot, index }, i) => {
		const input = document.createElement("input");
		input.type = "text";
		input.value = lines[i];
		input.placeholder = placeholderFor(i);
		input.addEventListener("input", () => {
			commitValue(state, ports.length, i, input.value);
		});
		container.appendChild(input);
		return { el: input, slotIndex: index };
	});
	state.signature = ports.map(({ slot }) => slot.name ?? "").join("|");
}

function hideTitlesWidget(state) {
	const widget = state.titlesWidget;
	if (!widget) return;
	if (widget.computeSize !== state.hideSize) widget.computeSize = state.hideSize;
	if (widget.computeLayoutSize !== state.hideLayout) widget.computeLayoutSize = state.hideLayout;
	if (widget.draw !== state.noopDraw) widget.draw = state.noopDraw;
	if (widget.options && widget.options.getMinHeight !== state.hideHeight) {
		widget.options.getMinHeight = state.hideHeight;
	}
	if (widget.element && widget.element.style.display !== "none") {
		widget.element.style.display = "none";
	}
}

function layerScale(state) {
	const rect = state.probe.getBoundingClientRect();
	if (rect.width > 0) return rect.width / PROBE_WIDTH;
	const scale = app.canvas?.ds?.scale;
	return typeof scale === "number" && scale > 0 ? scale : 0;
}

function applyCanvasLayout(node, state) {
	const ds = app.canvas?.ds;
	const canvasEl = app.canvas?.canvas;
	const ports = imageSlots(node);
	if (!ds || !canvasEl || !ports.length) return false;
	if (!isFinite(node.pos?.[0]) || !isFinite(node.pos?.[1])) return false;
	const canvasRect = canvasEl.getBoundingClientRect();
	if (!canvasRect.width || !canvasRect.height) return false;
	const boxRect = state.container.getBoundingClientRect();
	if (!isFinite(boxRect.left) || !isFinite(boxRect.top)) return false;
	const scale = layerScale(state);
	if (!isFinite(scale) || scale <= 0) return false;
	const zoom = ds.scale;
	const edge =
		canvasRect.left + (node.pos[0] + (node.size?.[0] ?? 0) - RIGHT_MARGIN + ds.offset[0]) * zoom;
	const localLeft = (edge - BOX_WIDTH * scale - boxRect.left) / scale;
	if (!isFinite(localLeft) || Math.abs(localLeft) > MAX_OFFSET) return false;
	const placed = [];
	for (const item of state.inputs) {
		const point = node.getConnectionPos(true, item.slotIndex, [0, 0]);
		if (!Array.isArray(point) || !isFinite(point[1])) return false;
		const centerY = canvasRect.top + (point[1] + ds.offset[1]) * zoom;
		const localTop = (centerY - (BOX_HEIGHT / 2) * scale - boxRect.top) / scale;
		if (!isFinite(localTop) || Math.abs(localTop) > MAX_OFFSET) return false;
		placed.push({ el: item.el, left: localLeft, top: localTop });
	}
	state.container.classList.remove("zhiai-tgr-fb");
	state.container.style.transform = "";
	state.container.style.height = "";
	state.container.style.width = "";
	for (const { el, left, top } of placed) {
		el.style.left = `${Math.round(left)}px`;
		el.style.top = `${Math.round(top)}px`;
		el.style.display = "";
	}
	return true;
}

function applyFallbackLayout(node, state) {
	state.container.classList.add("zhiai-tgr-fb");
	state.container.style.transform = "";
	state.container.style.height = `${Math.max(1, state.inputs.length) * FALLBACK_ROW_HEIGHT}px`;
	state.inputs.forEach((item, i) => {
		item.el.style.top = `${i * FALLBACK_ROW_HEIGHT + (FALLBACK_ROW_HEIGHT - BOX_HEIGHT) / 2}px`;
		item.el.style.left = "";
		item.el.style.display = "";
	});
}

function watchAndAlign(node, state) {
	if (state.destroyed || !document.body.contains(state.container)) return;
	hideTitlesWidget(state);
	const ports = imageSlots(node);
	const signature = ports.map(({ slot }) => slot.name ?? "").join("|");
	if (signature !== state.signature) rebuild(node, state);
	const visibleNodes = app.canvas?.visible_nodes;
	if (Array.isArray(visibleNodes) && !visibleNodes.includes(node)) return;
	if (!isVueNodeRendering()) {
		try {
			if (applyCanvasLayout(node, state)) return;
		} catch (_) {
		}
	}
	applyFallbackLayout(node, state);
}

function startLoop(node, state) {
	const tick = () => {
		if (state.destroyed) return;
		try {
			watchAndAlign(node, state);
		} catch (_) {
		}
		state.raf = requestAnimationFrame(tick);
	};
	state.raf = requestAnimationFrame(tick);
}

function setupNode(node) {
	if (node._zhiaiTitleRows) return;
	ensureStyle();
	const titlesWidget = node.widgets?.find((widget) => widget.name === TITLES_WIDGET);
	if (!titlesWidget || typeof node.addDOMWidget !== "function") return;
	const container = document.createElement("div");
	container.className = "zhiai-tgr-layer";
	const probe = document.createElement("div");
	probe.className = "zhiai-tgr-probe";
	container.appendChild(probe);
	const domWidget = node.addDOMWidget(CONTAINER_NAME, "custom", container, { serialize: false });
	domWidget.serializeValue = () => undefined;
	domWidget.computeSize = () => [0, 0];
	const state = {
		container,
		probe,
		titlesWidget,
		inputs: [],
		signature: "",
		raf: 0,
		destroyed: false,
		hideSize: () => [0, 0],
		hideLayout: () => ({ minHeight: 0, maxHeight: 0, minWidth: 0 }),
		hideHeight: () => 0,
		noopDraw: () => {},
	};
	node._zhiaiTitleRows = state;
	const fromIndex = node.widgets.indexOf(domWidget);
	if (fromIndex >= 0) node.widgets.splice(fromIndex, 1);
	const titlesIndex = node.widgets.indexOf(titlesWidget);
	node.widgets.splice(titlesIndex >= 0 ? titlesIndex + 1 : node.widgets.length, 0, domWidget);
	hideTitlesWidget(state);
	rebuild(node, state);
	startLoop(node, state);
}

app.registerExtension({
	name: "zhiai_nodes.ImageGridTitleTitles",
	beforeRegisterNodeDef(nodeType, nodeData) {
		if (nodeData?.name !== NODE_NAME) return;
		const onNodeCreated = nodeType.prototype.onNodeCreated;
		nodeType.prototype.onNodeCreated = function () {
			const result = onNodeCreated?.apply(this, arguments);
			setupNode(this);
			return result;
		};
		const onConfigure = nodeType.prototype.onConfigure;
		nodeType.prototype.onConfigure = function () {
			const result = onConfigure?.apply(this, arguments);
			const state = this._zhiaiTitleRows;
			if (state) setTimeout(() => {
				if (!state.destroyed) rebuild(this, state);
			}, 0);
			return result;
		};
		const onRemoved = nodeType.prototype.onRemoved;
		nodeType.prototype.onRemoved = function () {
			const state = this._zhiaiTitleRows;
			if (state) {
				state.destroyed = true;
				cancelAnimationFrame(state.raf);
				state.container.remove();
				this._zhiaiTitleRows = null;
			}
			return onRemoved?.apply(this, arguments);
		};
	},
});
