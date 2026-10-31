import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { getLocale } from "./zhiai_i18n.js";
import { drawNodeSettingsButton, hideTitleTip, titleTipHovered } from "./node_title_icons.js";
import { PANEL_TOKENS, attachMiddleDragPan, attachWheelForwarding, injectPanelStyles, watchNodeModeVisual } from "./panel_kit.js";

const NODE_NAME = "ImagePreviewCompare";
const MIN_WIDTH = 360;
const MIN_HEIGHT = 480;
const STAGE_MIN_HEIGHT = 210;
const MIN_WIDGET_HEIGHT = 300;
const FOOTER_HEIGHT = 20;
const EDGE_PAD = 6;
const TITLE_ICON_SIZE = 24;
const TITLE_ICON_GAP = 4;
const TITLE_ICON_MARGIN = 4;
const NATIVE_PREVIEW_WIDGET = "$$canvas-image-preview";
const EMPTY_IMAGE_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const TEXT = {
	zh: {
		empty: "接入图像 A / B 后在此对比",
		hintDrag: "双图对比模式",
		hintSingle: "单图预览模式",
		hintNone: "没有图片输入",
		pageTip: "点击切换列表中的下一张",
		settings: "设置",
		settingsTip: "节点设置",
		outputImage: "输出图像",
		splitVertical: "上下分割",
		hideHandle: "隐藏把手",
	},
	en: {
		empty: "Connect image A / B to compare",
		hintDrag: "Dual image compare mode",
		hintSingle: "Single image preview",
		hintNone: "No image input",
		pageTip: "Click to cycle through the list",
		settings: "Settings",
		settingsTip: "Node settings",
		outputImage: "Output image",
		splitVertical: "Split top / bottom",
		hideHandle: "Hide handle",
	},
};

function t(key) {
	const dict = TEXT[getLocale()] ?? TEXT.en;
	return dict[key] ?? key;
}

const C = PANEL_TOKENS.color;
const RADIUS = PANEL_TOKENS.radius;
const TYPE = PANEL_TOKENS.type;
const MOTION = PANEL_TOKENS.motion;

const STYLE = `
.zpc-host,
.zpc-host * { box-sizing: border-box; }
.zpc-host {
	position: relative;
	width: 100%;
	height: 100%;
	padding: ${EDGE_PAD}px;
	font-family: inherit;
}
.zpc {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	min-width: 0;
	overflow: hidden;
	background:
		linear-gradient(180deg, rgba(59, 130, 246, 0.26), rgba(59, 130, 246, 0.08) 38px, transparent 38px),
		linear-gradient(180deg, #0e1a2e, #070e1b);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
	--zpc-split: 50%;
}
.zpc-stage {
	position: relative;
	flex: 1 1 auto;
	min-height: 0;
	background:
		radial-gradient(120% 90% at 50% 0%, rgba(59, 130, 246, 0.10), transparent 62%),
		${C.base};
	cursor: crosshair;
	touch-action: none;
	user-select: none;
}
.zpc-frame {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	overflow: hidden;
	background: #02050c;
}
.zpc-img {
	position: absolute;
	inset: 0;
	display: none;
	width: 100%;
	height: 100%;
	object-fit: contain;
	pointer-events: none;
	-webkit-user-drag: none;
}
.zpc-img--a {
	clip-path: inset(0 calc(100% - var(--zpc-split)) 0 0);
}
.zpc--hsplit .zpc-img--a {
	clip-path: inset(0 0 calc(100% - var(--zpc-split)) 0);
}
.zpc:not(.zpc-both) .zpc-img--a {
	clip-path: none;
}
.zpc-split {
	position: absolute;
	top: 0;
	bottom: 0;
	left: calc(var(--zpc-split) - 0.5px);
	width: 1px;
	pointer-events: none;
	z-index: 3;
	background: ${C.primary};
}
.zpc-handle {
	position: absolute;
	top: 50%;
	left: var(--zpc-split);
	transform: translate(-50%, -50%);
	width: 24px;
	height: 15px;
	padding: 0;
	gap: 0;
	border-radius: 2px;
	border: none;
	background: rgba(13, 28, 51, 0.74);
	color: ${C.textBright};
	box-shadow: 0 3px 12px rgba(2, 6, 23, 0.55);
	z-index: 2;
	pointer-events: none;
}
.zpc-handle b {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	width: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 9px;
	font-weight: 700;
	line-height: 1;
}
.zpc-handle b:first-child { color: ${C.primaryLight}; }
.zpc-handle b:last-child {
	left: auto;
	right: 0;
	color: #C4B5FD;
}
.zpc:not(.zpc-both) .zpc-split,
.zpc:not(.zpc-both) .zpc-handle {
	display: none;
}
.zpc.zpc-no-handle .zpc-handle {
	display: none;
}
.zpc--hsplit .zpc-split {
	left: 0;
	right: 0;
	top: calc(var(--zpc-split) - 0.5px);
	bottom: auto;
	width: auto;
	height: 1px;
}
.zpc--hsplit .zpc-handle {
	left: 50%;
	top: var(--zpc-split);
	width: 15px;
	height: 24px;
}
.zpc--hsplit .zpc-handle b {
	left: 0;
	right: 0;
	width: auto;
	height: 50%;
	bottom: auto;
}
.zpc--hsplit .zpc-handle b:last-child {
	top: auto;
	bottom: 0;
}
.zpc-chip {
	display: none;
	align-items: center;
	gap: 5px;
	height: 16px;
	padding: 0;
	min-width: 0;
	max-width: 46%;
	overflow: hidden;
	border-radius: ${RADIUS.sm};
	background: transparent;
	color: ${C.textDim};
	font-size: ${TYPE.micro};
	line-height: 1;
	white-space: nowrap;
	pointer-events: none;
}
.zpc-chip,
.zpc-chip * {
	background: transparent;
	border: 0;
	box-shadow: none;
	user-select: none;
	-webkit-user-select: none;
}
.zpc-chip ::selection {
	background: transparent;
	color: inherit;
}
.zpc-chip__tag {
	font-weight: 700;
	letter-spacing: 0.04em;
}
.zpc-chip__dims {
	overflow: hidden;
	color: ${C.textLabel};
	font-variant-numeric: tabular-nums;
	text-overflow: ellipsis;
}
.zpc-chip--a .zpc-chip__tag { color: ${C.primaryLight}; }
.zpc-chip--b {
	flex: 0 0 auto;
	max-width: none;
}
.zpc-chip--b .zpc-chip__tag { color: #C4B5FD; }
.zpc-empty {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	color: ${C.textFaint};
	font-size: ${TYPE.label};
	letter-spacing: 0.02em;
	pointer-events: none;
}
.zpc-empty svg {
	width: 26px;
	height: 26px;
	color: ${C.textGhost};
}
.zpc-foot {
	position: relative;
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 8px;
	height: ${FOOTER_HEIGHT}px;
	padding: 0 9px;
	background: linear-gradient(180deg, rgba(59, 130, 246, 0.10), rgba(59, 130, 246, 0.02));
	color: ${C.textDim};
	font-size: ${TYPE.micro};
	line-height: 1;
	white-space: nowrap;
}
.zpc-foot__right {
	display: flex;
	flex: 0 0 auto;
	align-items: center;
	gap: 8px;
	margin-left: auto;
}
.zpc-foot__hint {
	position: absolute;
	inset: 0;
	margin: auto;
	width: max-content;
	height: 13px;
	line-height: 1;
	padding: 0 4px;
	max-width: 46%;
	overflow: hidden;
	border: 1px solid #A1C4FA;
	border-radius: 3px;
	background: transparent;
	color: #A1C4FA;
	font-size: 8px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
	text-overflow: ellipsis;
	white-space: nowrap;
	pointer-events: none;
}
.zpc-page {
	flex: 0 0 auto;
	display: none;
	align-items: center;
	justify-content: center;
	min-width: 46px;
	height: 16px;
	padding: 0 8px;
	border-radius: ${RADIUS.pill};
	border: 1px solid ${C.border};
	background: ${C.glassSoft};
	color: ${C.primaryLight};
	font-family: inherit;
	font-size: ${TYPE.micro};
	font-variant-numeric: tabular-nums;
	line-height: 1;
	cursor: pointer;
	transition: background ${MOTION.fast} ${MOTION.easing}, border-color ${MOTION.fast} ${MOTION.easing};
}
.zpc-page:hover {
	background: ${C.glassHover};
	border-color: ${C.borderHi};
}
.zpc-page:focus-visible {
	outline: 1px solid ${C.primaryLight};
	outline-offset: 1px;
}
.zpc-menu {
	position: fixed;
	left: 0;
	top: 0;
	display: none;
	flex-direction: column;
	gap: 6px;
	min-width: 128px;
	padding: 8px 10px;
	border: 1px solid ${C.border};
	border-radius: ${RADIUS.sm};
	background: rgba(10, 18, 32, 0.96);
	box-shadow: 0 6px 18px rgba(2, 6, 23, 0.55);
	font-family: inherit;
	transform-origin: top left;
	z-index: 10050;
}
.zpc-menu.zpc-menu--open {
	display: flex;
}
.zpc-menu__row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	color: ${C.textDim};
	font-size: ${TYPE.micro};
	line-height: 1;
	cursor: pointer;
}
.zpc-menu__row input {
	width: 12px;
	height: 12px;
	margin: 0;
	accent-color: #A1C4FA;
	cursor: pointer;
}
`;

const EMPTY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.6" cy="10" r="1.5"/><path d="m20.6 15.2-4.7-4.7-8.9 8.9"/></svg>';
const HANDLE_LABEL = '<b>A</b><b>B</b>';

const LABEL_METRIC_CACHE = new Map();
let labelMeasureCtx = null;

// 实测字形墨迹与行盒基线位置，把 A/B 在各自半格内做视觉居中（横排/竖排通用）。
// 只依赖浏览器实际排版结果，不写死任何字体数值。
function measureLabelOffset(label) {
	const style = getComputedStyle(label);
	const cellHeight = label.clientHeight;
	if (!cellHeight) return null;
	const key = [style.fontStyle, style.fontWeight, style.fontFamily, style.fontSize, label.textContent, cellHeight].join("|");
	const cached = LABEL_METRIC_CACHE.get(key);
	if (cached) return cached;

	const ctx = (labelMeasureCtx ||= document.createElement("canvas").getContext("2d"));
	if (!ctx) return null;

	// 字形墨迹用大字号量：6px 这种小字号会被 hinting 取整，量出来的轮廓偏大。
	const REF = 200;
	ctx.font = `${style.fontStyle} ${style.fontWeight} ${REF}px ${style.fontFamily}`;
	const ink = ctx.measureText(label.textContent);
	const scale = (parseFloat(style.fontSize) || 9) / REF;
	const inkLeft = ink.actualBoundingBoxLeft ?? 0;
	const inkRight = ink.actualBoundingBoxRight ?? 0;
	const inkAbove = (ink.actualBoundingBoxAscent ?? 0) * scale;
	const inkBelow = (ink.actualBoundingBoxDescent ?? 0) * scale;

	// 在当前半格里放入零高基线标记和文字，让两者共处一个行盒，量出这一行真实基线到格顶的距离。
	// 这样连 flex 居中、行盒取整等排版结果都一并纳入，不需要写死字体数值。
	const text = label.textContent;
	const wrapper = document.createElement("span");
	const marker = document.createElement("span");
	marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;";
	wrapper.appendChild(marker);
	wrapper.appendChild(document.createTextNode(text));
	label.textContent = "";
	label.appendChild(wrapper);
	const labelRect = label.getBoundingClientRect();
	const markerRect = marker.getBoundingClientRect();
	label.textContent = text;

	// DOM 宽度会被画布缩放放大，先还原成 CSS 像素；文字基线本身按整像素落位，取其整数位。
	const zoom = labelRect.height / cellHeight;
	const baseline = zoom ? Math.round((markerRect.bottom - labelRect.top) / zoom) : 0;

	const metrics = {
		dx: (ink.width / 2 - (inkRight - inkLeft) / 2) * scale,
		dy: cellHeight / 2 - baseline + (inkAbove - inkBelow) / 2,
	};
	LABEL_METRIC_CACHE.set(key, metrics);
	return metrics;
}

function opticalCenterHandleLabels(handle) {
	handle.querySelectorAll("b").forEach((label) => {
		const metrics = measureLabelOffset(label);
		if (!metrics) return;
		label.style.transform = `translate(${metrics.dx.toFixed(3)}px, ${metrics.dy.toFixed(3)}px)`;
	});
}


function isTargetNode(node) {
	const type = node?.constructor?.comfyClass || node?.comfyClass || node?.type;
	return type === NODE_NAME;
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function cloneRef(ref) {
	return ref && ref.filename ? { ...ref } : null;
}

function imageRefs(value) {
	return Array.isArray(value) ? value.filter((ref) => ref?.filename) : [];
}

function refsFromMessage(message, key, depth = 0) {
	if (!message || typeof message !== "object" || depth > 3) return [];
	const direct = imageRefs(message[key]);
	if (direct.length) return direct;
	const uiRefs = imageRefs(message.ui?.[key]);
	if (uiRefs.length) return uiRefs;
	const outputRefs = imageRefs(message.output?.[key]);
	if (outputRefs.length) return outputRefs;
	for (const value of Object.values(message)) {
		if (value && typeof value === "object") {
			const nested = refsFromMessage(value, key, depth + 1);
			if (nested.length) return nested;
		}
	}
	return [];
}

function imageKey(ref) {
	return ref?.filename ? `${ref.type || ""}/${ref.subfolder || ""}/${ref.filename}` : "";
}

function makeViewUrl(ref) {
	const params = new URLSearchParams(ref || {});
	return api.apiURL(`/view?${params.toString()}`);
}

function releaseEntry(entry) {
	if (!entry?.img) return;
	entry.img.onload = null;
	entry.img.onerror = null;
	try {
		entry.img.src = EMPTY_IMAGE_SRC;
	} catch (_) {
	}
}

function suppressNativePreviewWidget(node) {
	if (!node) return;
	node.preview = undefined;
	const widgets = node.widgets || [];
	const index = widgets.findIndex((widget) => widget?.name === NATIVE_PREVIEW_WIDGET);
	if (index >= 0) {
		widgets[index]?.onRemove?.();
		widgets.splice(index, 1);
	}
}

function ensureState(node) {
	if (node._zpcState) return node._zpcState;
	node._zpcState = {
		split: 50,
		aspect: 1,
		entries: { a: null, b: null },
		lists: { a: [], b: [] },
		index: 0,
		previous: null,
		dragging: false,
		splitVertical: false,
		hideHandle: false,
		settingsOpen: false,
		settingsHovered: false,
		ui: null,
	};
	return node._zpcState;
}

function buildUI(node) {
	const state = ensureState(node);
	if (state.ui) return state.ui;

	const host = document.createElement("div");
	host.className = "zpc-host";

	const root = document.createElement("div");
	root.className = "zpc";

	const stage = document.createElement("div");
	stage.className = "zpc-stage";

	const frame = document.createElement("div");
	frame.className = "zpc-frame";

	const imgB = document.createElement("img");
	imgB.className = "zpc-img zpc-img--b";
	imgB.alt = "B";
	imgB.draggable = false;

	const imgA = document.createElement("img");
	imgA.className = "zpc-img zpc-img--a";
	imgA.alt = "A";
	imgA.draggable = false;

	const split = document.createElement("div");
	split.className = "zpc-split";

	const handle = document.createElement("div");
	handle.className = "zpc-handle";
	handle.innerHTML = HANDLE_LABEL;

	const chipA = document.createElement("div");
	chipA.className = "zpc-chip zpc-chip--a";
	chipA.innerHTML = '<span class="zpc-chip__tag">A</span><span class="zpc-chip__dims"></span>';

	const chipB = document.createElement("div");
	chipB.className = "zpc-chip zpc-chip--b";
	chipB.innerHTML = '<span class="zpc-chip__dims"></span><span class="zpc-chip__tag">B</span>';

	const empty = document.createElement("div");
	empty.className = "zpc-empty";
	empty.innerHTML = `${EMPTY_ICON}<span></span>`;

	frame.append(imgB, imgA, split, handle);
	stage.append(frame, empty);

	const foot = document.createElement("div");
	foot.className = "zpc-foot";

	const hint = document.createElement("span");
	hint.className = "zpc-foot__hint";

	const page = document.createElement("button");
	page.type = "button";
	page.className = "zpc-page";
	page.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
		cyclePage(node);
	});

	const menu = document.createElement("div");
	menu.className = "zpc-menu";
	menu.innerHTML = `<label class="zpc-menu__row"><span>${t("outputImage")}</span><input type="checkbox" data-role="output"></label><label class="zpc-menu__row"><span>${t("splitVertical")}</span><input type="checkbox" data-role="vertical"></label><label class="zpc-menu__row"><span>${t("hideHandle")}</span><input type="checkbox" data-role="hideHandle"></label>`;
	const outputToggle = menu.querySelector('[data-role="output"]');
	const verticalToggle = menu.querySelector('[data-role="vertical"]');
	const hideHandleToggle = menu.querySelector('[data-role="hideHandle"]');

	const rightGroup = document.createElement("div");
	rightGroup.className = "zpc-foot__right";
	rightGroup.append(page, chipB);

	foot.append(chipA, hint, rightGroup);
	root.append(stage, foot);
	host.append(root);
	document.body.appendChild(menu);

	watchNodeModeVisual(node, host);
	attachMiddleDragPan(host);
	attachWheelForwarding(host);

	const widget = node.addDOMWidget("zhiai_image_preview_compare", "div", host, {});
	opticalCenterHandleLabels(handle);
	requestAnimationFrame(() => opticalCenterHandleLabels(handle));
	widget.serialize = false;
	// 用 computeLayoutSize 声明固定最小高度 + 弹性最大高度：
	// node.computeSize() 取 minHeight 作为缩放下限，剩余空间由前端布局分配，
	// 避免高度依赖 node.size 形成自引用（拉大后无法缩小的根因）。
	widget.computeLayoutSize = () => ({
		minHeight: Math.max(MIN_WIDGET_HEIGHT, STAGE_MIN_HEIGHT + FOOTER_HEIGHT + EDGE_PAD * 2),
		maxHeight: 1000000,
		minWidth: 0,
	});

	const ui = { host, root, stage, frame, imgA, imgB, split, handle, chipA, chipB, empty, hint, page, menu, outputToggle, verticalToggle, hideHandleToggle, widget };
	state.ui = ui;

	bindStageEvents(node, ui);
	observeStage(node, ui);
	ui.cleanupSettings = bindSettings(node, ui);
	return ui;
}

function autoOutputWidget(node) {
	return node.widgets?.find((widget) => widget?.name === "auto_output");
}

function setAutoOutput(node, value) {
	const widget = autoOutputWidget(node);
	if (!widget) return;
	widget.value = value;
	widget.callback?.(value);
	node.graph?.setDirtyCanvas?.(true, true);
}

function hideAutoOutputWidget(node) {
	const widget = autoOutputWidget(node);
	if (!widget) return;
	widget.type = "hidden";
	widget.computeSize = () => [0, -4];
}

function settingsIconLeft(node) {
	return node.size[0] - TITLE_ICON_SIZE - TITLE_ICON_MARGIN - TITLE_ICON_SIZE - TITLE_ICON_GAP;
}

function settingsIconTop() {
	return -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - TITLE_ICON_SIZE) / 2;
}

function hitSettingsIcon(node, localPos) {
	if (!localPos || !node?.size) return false;
	const left = settingsIconLeft(node);
	const top = settingsIconTop();
	return localPos[0] > left && localPos[0] < left + TITLE_ICON_SIZE
		&& localPos[1] > top && localPos[1] < top + TITLE_ICON_SIZE;
}

function localFromEvent(node, event) {
	const el = app.canvas?.canvas;
	if (!el || !node) return null;
	const rect = el.getBoundingClientRect();
	const ds = app.canvas.ds ?? {};
	const scale = typeof ds.scale === "number" && ds.scale ? ds.scale : 1;
	const offset = ds.offset ?? [0, 0];
	return [
		(event.clientX - rect.left) / scale - (offset[0] ?? 0) - node.pos[0],
		(event.clientY - rect.top) / scale - (offset[1] ?? 0) - node.pos[1],
	];
}

function placeSettingsMenu(node) {
	const menu = node._zpcState?.ui?.menu;
	const el = app.canvas?.canvas;
	if (!menu || !el) return;
	const ds = app.canvas.ds ?? {};
	const scale = typeof ds.scale === "number" && ds.scale ? ds.scale : 1;
	const bcr = el.getBoundingClientRect();
	const nodeScreenX = bcr.x + ((node.pos?.[0] ?? 0) + (ds.offset?.[0] ?? 0)) * scale;
	const nodeScreenY = bcr.y + ((node.pos?.[1] ?? 0) + (ds.offset?.[1] ?? 0)) * scale;
	const width = menu.offsetWidth * scale;
	const height = menu.offsetHeight * scale;
	const gap = 6;
	let left = nodeScreenX + settingsIconLeft(node) * scale - gap - width;
	let top = nodeScreenY + settingsIconTop() * scale + (TITLE_ICON_SIZE * scale - height) / 2;
	left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
	top = Math.max(8, Math.min(top, window.innerHeight - height - 8));
	menu.style.transform = `scale(${scale})`;
	menu.style.left = `${left}px`;
	menu.style.top = `${top}px`;
}

function setSettingsOpen(node, open) {
	const state = node._zpcState;
	const ui = state?.ui;
	if (!state || !ui) return;
	state.settingsOpen = Boolean(open);
	ui.menu.classList.toggle("zpc-menu--open", state.settingsOpen);
	if (state.settingsOpen) {
		ui.outputToggle.checked = Boolean(autoOutputWidget(node)?.value ?? true);
		ui.verticalToggle.checked = Boolean(state.splitVertical);
		ui.hideHandleToggle.checked = Boolean(state.hideHandle);
		placeSettingsMenu(node);
	}
	node.setDirtyCanvas?.(true, true);
}

function bindSettings(node, ui) {
	const { menu, outputToggle, verticalToggle, hideHandleToggle } = ui;
	outputToggle.addEventListener("change", () => setAutoOutput(node, outputToggle.checked));
	verticalToggle.addEventListener("change", () => {
		const state = node._zpcState;
		if (!state) return;
		state.splitVertical = verticalToggle.checked;
		persistRefs(node);
		render(node);
	});
	hideHandleToggle.addEventListener("change", () => {
		const state = node._zpcState;
		if (!state) return;
		state.hideHandle = hideHandleToggle.checked;
		persistRefs(node);
		render(node);
	});
	const onDocDown = (event) => {
		if (menu.contains(event.target)) return;
		if (hitSettingsIcon(node, localFromEvent(node, event))) return;
		if (node._zpcState?.settingsOpen) setSettingsOpen(node, false);
	};
	document.addEventListener("pointerdown", onDocDown, true);
	return () => document.removeEventListener("pointerdown", onDocDown, true);
}

function bindStageEvents(node, ui) {
	ui.stage.addEventListener("pointerdown", (event) => {
		const state = node._zpcState;
		if (!state || event.button !== 0 || !hasBothImages(state)) return;
		event.preventDefault();
		state.dragging = true;
		ui.stage.setPointerCapture?.(event.pointerId);
		updateSplitFromEvent(node, event);
	});

	ui.stage.addEventListener("pointermove", (event) => {
		const state = node._zpcState;
		if (!state?.dragging) return;
		updateSplitFromEvent(node, event);
	});

	const stop = (event) => {
		const state = node._zpcState;
		if (!state?.dragging) return;
		state.dragging = false;
		try {
			ui.stage.releasePointerCapture?.(event.pointerId);
		} catch (_) {
		}
	};
	ui.stage.addEventListener("pointerup", stop);
	ui.stage.addEventListener("pointercancel", stop);

	ui.frame.addEventListener("contextmenu", (event) => {
		const state = node._zpcState;
		if (!state) return;
		event.preventDefault();
		event.stopPropagation();
		const hasA = Boolean(state.entries.a?.ref);
		const hasB = Boolean(state.entries.b?.ref);
		const rect = ui.frame.getBoundingClientRect();
		const vertical = Boolean(state.splitVertical);
		const splitPos = vertical
			? rect.top + rect.height * (state.split / 100)
			: rect.left + rect.width * (state.split / 100);
		const onA = vertical ? event.clientY <= splitPos : event.clientX <= splitPos;
		const side = hasA && hasB ? (onA ? "a" : "b") : hasA ? "a" : "b";
		selectNativeImage(node, side);
		openNodeContextMenu(node, event);
	});
}

function openNodeContextMenu(node, event) {
	const canvas = app.canvas || node?.graph?.canvas;
	if (!canvas) return;
	try {
		if (typeof canvas.adjustMouseEvent === "function") canvas.adjustMouseEvent(event);
		const rect = canvas.canvas?.getBoundingClientRect?.();
		if (rect) {
			const canvasX = event.clientX - rect.left;
			const canvasY = event.clientY - rect.top;
			let graphPos = null;
			if (typeof canvas.convertCanvasToOffset === "function") {
				graphPos = canvas.convertCanvasToOffset([canvasX, canvasY]);
			} else {
				const ds = canvas.ds || {};
				const scale = ds.scale || 1;
				const offset = ds.offset || [0, 0];
				graphPos = [canvasX / scale - offset[0], canvasY / scale - offset[1]];
			}
			if (graphPos) {
				event.graphX = graphPos[0];
				event.graphY = graphPos[1];
				canvas.graph_mouse = [graphPos[0], graphPos[1]];
			}
			canvas.canvas_mouse = [canvasX, canvasY];
		}
	} catch (err) {
		console.warn("[image-preview-compare] context menu coordinate sync failed:", err);
	}
	if (typeof canvas.processContextMenu === "function") {
		canvas.processContextMenu(node, event);
	}
}

function observeStage(node, ui) {
	if (typeof ResizeObserver === "undefined") return;
	const observer = new ResizeObserver(() => layout(node));
	observer.observe(ui.stage);
	node._zpcObserver = observer;
}

function updateSplitFromEvent(node, event) {
	const state = node._zpcState;
	const frame = state?.ui?.frame;
	if (!frame) return;
	const rect = frame.getBoundingClientRect();
	if (!rect.height) return;
	const ratio = state.splitVertical
		? (event.clientY - rect.top) / Math.max(rect.height, 1)
		: (event.clientX - rect.left) / Math.max(rect.width, 1);
	state.split = clamp(ratio * 100, 0, 100);
	state.ui.root.style.setProperty("--zpc-split", `${state.split}%`);
}

function hasBothImages(state) {
	return Boolean(state?.entries.a?.ref && state.entries.b?.ref);
}

function layout(node) {
	const state = node._zpcState;
	const stage = state?.ui?.stage;
	const frame = state?.ui?.frame;
	if (!stage || !frame) return;
	const width = stage.clientWidth;
	const height = stage.clientHeight;
	if (!width || !height) return;
	const aspect = state.aspect > 0 ? state.aspect : 1;
	let frameWidth = width;
	let frameHeight = width / aspect;
	if (frameHeight > height) {
		frameHeight = height;
		frameWidth = height * aspect;
	}
	frame.style.width = `${Math.max(1, Math.round(frameWidth))}px`;
	frame.style.height = `${Math.max(1, Math.round(frameHeight))}px`;
}

function updateAspect(state) {
	const pick = [state.entries.a, state.entries.b].find((entry) => entry?.img?.naturalWidth && entry?.img?.naturalHeight);
	if (pick) state.aspect = pick.img.naturalWidth / pick.img.naturalHeight;
}

function syncLayer(node, slot) {
	const state = node._zpcState;
	const ui = state.ui;
	const entry = state.entries[slot];
	const layer = slot === "a" ? ui.imgA : ui.imgB;
	const key = imageKey(entry?.ref);
	if (layer.dataset.key !== key) {
		layer.dataset.key = key;
		if (key) layer.src = makeViewUrl(entry.ref);
		else layer.removeAttribute("src");
	}
	layer.style.display = key ? "block" : "none";
	const chip = slot === "a" ? ui.chipA : ui.chipB;
	const dims = entry?.img?.naturalWidth && entry?.img?.naturalHeight
		? `${entry.img.naturalWidth} × ${entry.img.naturalHeight}`
		: "";
	chip.style.display = key ? "inline-flex" : "none";
	chip.querySelector(".zpc-chip__dims").textContent = dims;
}

function render(node) {
	const state = node._zpcState;
	const ui = state?.ui;
	if (!ui) return;
	const hasA = Boolean(state.entries.a?.ref);
	const hasB = Boolean(state.entries.b?.ref);
	const both = hasA && hasB;

	ui.root.classList.toggle("zpc-both", both);
	ui.root.classList.toggle("zpc--hsplit", Boolean(state.splitVertical));
	ui.root.classList.toggle("zpc-no-handle", Boolean(state.hideHandle));
	ui.frame.style.display = hasA || hasB ? "block" : "none";
	ui.empty.style.display = hasA || hasB ? "none" : "flex";
	ui.empty.querySelector("span").textContent = t("empty");
	ui.root.style.setProperty("--zpc-split", `${state.split}%`);
	if (both && !state.hideHandle) opticalCenterHandleLabels(ui.handle);

	syncLayer(node, "a");
	syncLayer(node, "b");

	const total = listLength(state);
	ui.hint.textContent = both ? t("hintDrag") : (hasA || hasB ? t("hintSingle") : t("hintNone"));
	ui.page.style.display = total > 1 ? "inline-flex" : "none";
	ui.page.textContent = total > 1 ? `${state.index + 1} / ${total}` : "";
	ui.page.title = t("pageTip");

	requestAnimationFrame(() => layout(node));
}

function loadSlot(node, slot, ref) {
	const state = node._zpcState;
	const clean = cloneRef(ref);
	const key = imageKey(clean);
	const old = state.entries[slot];

	if (!key) {
		state.entries[slot] = null;
		if (old) releaseEntry(old);
		updateAspect(state);
		render(node);
		return;
	}
	if (old?.key === key) return;

	const reusable = ["a", "b"]
		.map((name) => state.entries[name])
		.find((entry) => entry && entry !== old && entry.key === key);
	if (reusable) {
		state.entries[slot] = reusable;
		if (old) releaseEntry(old);
		updateAspect(state);
		render(node);
		return;
	}

	const img = new Image();
	const entry = { key, ref: clean, img };
	img.onload = () => {
		if (state.entries[slot] !== entry) return;
		updateAspect(state);
		render(node);
		app.graph?.setDirtyCanvas?.(true, true);
	};
	img.onerror = () => {
		if (state.entries[slot] !== entry) return;
		state.entries[slot] = null;
		render(node);
		app.graph?.setDirtyCanvas?.(true, true);
	};
	img.src = makeViewUrl(clean);
	state.entries[slot] = entry;
	if (old) releaseEntry(old);
	updateAspect(state);
	render(node);
}

function listLength(state) {
	const lists = state?.lists || {};
	return Math.max(lists.a?.length || 0, lists.b?.length || 0);
}

function refAt(list, index) {
	if (!Array.isArray(list) || !list.length || index < 0) return null;
	return list[Math.min(index, list.length - 1)];
}

function applyListIndex(node, index) {
	const state = node._zpcState;
	const total = listLength(state);
	if (!total) return;
	state.index = clamp(index, 0, total - 1);
	const aList = state.lists.a || [];
	const bList = state.lists.b || [];
	const onlyA = aList.length > 1 && !bList.length;
	const onlyB = bList.length > 1 && !aList.length;
	const currentA = onlyB ? refAt(bList, state.index - 1) : refAt(aList, state.index);
	const currentB = onlyA ? refAt(aList, state.index - 1) : refAt(bList, state.index);
	loadSlot(node, "a", currentA);
	loadSlot(node, "b", currentB);
}

function cyclePage(node) {
	const state = node._zpcState;
	const total = listLength(state);
	if (total <= 1) return;
	applyListIndex(node, (state.index + 1) % total);
	persistRefs(node);
	render(node);
}

function persistRefs(node) {
	const state = node._zpcState;
	if (!state) return;
	node.properties = node.properties || {};
	node.properties.zhiaiPreviewCompare = {
		a: cloneRef(state.entries.a?.ref),
		b: cloneRef(state.entries.b?.ref),
		splitVertical: Boolean(state.splitVertical),
		hideHandle: Boolean(state.hideHandle),
	};
}

function restoreRefs(node) {
	const saved = node.properties?.zhiaiPreviewCompare;
	if (!saved) return;
	const state = node._zpcState;
	if (!state) return;
	state.splitVertical = Boolean(saved.splitVertical);
	state.hideHandle = Boolean(saved.hideHandle);
	if (saved.a?.filename) loadSlot(node, "a", saved.a);
	if (saved.b?.filename) loadSlot(node, "b", saved.b);
	render(node);
}

function receivePreviewRefs(node, message) {
	const state = node._zpcState;
	if (!state) return;
	const aRefs = refsFromMessage(message, "a_images");
	const bRefs = refsFromMessage(message, "b_images");
	const total = Math.max(aRefs.length, bRefs.length);
	if (!total) return;

	if (total > 1) {
		state.lists = {
			a: aRefs.map((ref) => ({ ...ref })),
			b: bRefs.map((ref) => ({ ...ref })),
		};
		state.index = total - 1;
		applyListIndex(node, state.index);
		if (!bRefs.length && aRefs.length) state.previous = { ...aRefs[aRefs.length - 1] };
		else if (!aRefs.length && bRefs.length) state.previous = { ...bRefs[bRefs.length - 1] };
		persistRefs(node);
		render(node);
		return;
	}

	state.lists = { a: [], b: [] };
	state.index = 0;
	const currentA = aRefs[0];
	const currentB = bRefs[0];

	if (currentA && currentB) {
		loadSlot(node, "a", currentA);
		loadSlot(node, "b", currentB);
	} else if (currentA) {
		loadSlot(node, "b", state.previous);
		loadSlot(node, "a", currentA);
		state.previous = { ...currentA };
	} else if (currentB) {
		loadSlot(node, "a", state.previous);
		loadSlot(node, "b", currentB);
		state.previous = { ...currentB };
	}
	persistRefs(node);
	render(node);
}

function selectNativeImage(node, side) {
	const state = node._zpcState;
	if (!state) return;
	const entries = state.entries;
	const entry = entries[side]?.ref
		? entries[side]
		: entries.a?.ref
			? entries.a
			: entries.b;
	if (!entry?.ref) return;
	node.imgs = entry.img?.naturalWidth ? [entry.img] : [];
	node.images = [{ ...entry.ref }];
	node.imageIndex = 0;
	node.overIndex = 0;
}

function initNode(node) {
	if (!isTargetNode(node)) return;
	node.properties = node.properties || {};
	ensureState(node);
	suppressNativePreviewWidget(node);
	hideAutoOutputWidget(node);
	buildUI(node);
	render(node);
	if (typeof node.setSize === "function") {
		node.setSize([
			Math.max(node.size?.[0] || 0, MIN_WIDTH),
			Math.max(node.size?.[1] || 0, MIN_HEIGHT),
		]);
	}
	requestAnimationFrame(() => layout(node));
	setTimeout(() => {
		if (!node.graph) return;
		hideAutoOutputWidget(node);
		layout(node);
		app.graph?.setDirtyCanvas?.(true, true);
	}, 160);
}

function disposeNode(node) {
	disposeObserver(node);
	const state = node._zpcState;
	if (state) {
		state.ui?.cleanupSettings?.();
		state.ui?.menu?.remove?.();
		for (const slot of ["a", "b"]) releaseEntry(state.entries[slot]);
	}
	node._zpcState = null;
	node._zpcObserver = null;
	node.imgs = undefined;
	node.images = undefined;
}

function disposeObserver(node) {
	node._zpcObserver?.disconnect?.();
	node._zpcObserver = null;
}

app.registerExtension({
	name: "ZhiAI.ImagePreviewCompare",
	async beforeRegisterNodeDef(nodeType, nodeData) {
		if (nodeData?.name !== NODE_NAME) return;

		const onNodeCreated = nodeType.prototype.onNodeCreated;
		nodeType.prototype.onNodeCreated = function () {
			const result = onNodeCreated?.apply(this, arguments);
			initNode(this);
			return result;
		};

		const onConfigure = nodeType.prototype.onConfigure;
		nodeType.prototype.onConfigure = function () {
			const result = onConfigure?.apply(this, arguments);
			setTimeout(() => {
				if (!this.graph) return;
				initNode(this);
				restoreRefs(this);
			}, 0);
			return result;
		};

		const onRemoved = nodeType.prototype.onRemoved;
		nodeType.prototype.onRemoved = function () {
			disposeNode(this);
			return onRemoved?.apply(this, arguments);
		};

		const onResize = nodeType.prototype.onResize;
		nodeType.prototype.onResize = function (size) {
			if (isTargetNode(this)) {
				if (size[0] < MIN_WIDTH) {
					size[0] = MIN_WIDTH;
					this.size[0] = MIN_WIDTH;
				}
				if (size[1] < MIN_HEIGHT) {
					size[1] = MIN_HEIGHT;
					this.size[1] = MIN_HEIGHT;
				}
			}
			const result = onResize?.apply(this, arguments);
			if (isTargetNode(this)) {
				requestAnimationFrame(() => layout(this));
			}
			return result;
		};

		const onDrawBackground = nodeType.prototype.onDrawBackground;
		nodeType.prototype.onDrawBackground = function () {
			if (!isTargetNode(this)) return onDrawBackground?.apply(this, arguments);
			const imgs = this.imgs;
			const images = this.images;
			this.imgs = undefined;
			this.images = undefined;
			try {
				return onDrawBackground?.apply(this, arguments);
			} finally {
				this.imgs = imgs;
				this.images = images;
			}
		};

		const onExecuted = nodeType.prototype.onExecuted;
		nodeType.prototype.onExecuted = function (message) {
			const result = onExecuted?.apply(this, arguments);
			if (!isTargetNode(this)) return result;
			suppressNativePreviewWidget(this);
			receivePreviewRefs(this, message);
			return result;
		};

		// 标题栏设置图标（位于原生帮助图标左侧）
		const onDrawForeground = nodeType.prototype.onDrawForeground;
		nodeType.prototype.onDrawForeground = function (ctx) {
			const result = onDrawForeground?.apply(this, arguments);
			if (!isTargetNode(this) || this.flags?.collapsed) return result;
			const state = this._zpcState;
			if (!state) return result;
			if (state.settingsOpen) placeSettingsMenu(this);
			ctx.save();
			ctx.translate(settingsIconLeft(this), settingsIconTop());
			ctx.scale(TITLE_ICON_SIZE / 32, TITLE_ICON_SIZE / 32);
			drawNodeSettingsButton(ctx, !!(state.settingsOpen || state.settingsHovered));
			ctx.restore();
			return result;
		};

		const onMouseDown = nodeType.prototype.onMouseDown;
		nodeType.prototype.onMouseDown = function (e, localPos) {
			const result = onMouseDown?.apply(this, arguments);
			if (!isTargetNode(this) || this.flags?.collapsed) return result;
			if (hitSettingsIcon(this, localPos)) {
				hideTitleTip();
				setSettingsOpen(this, !this._zpcState?.settingsOpen);
				return true;
			}
			return result;
		};

		const onMouseMove = nodeType.prototype.onMouseMove;
		nodeType.prototype.onMouseMove = function (e, localPos) {
			const result = onMouseMove?.apply(this, arguments);
			if (!isTargetNode(this) || this.flags?.collapsed) return result;
			const hovered = hitSettingsIcon(this, localPos);
			if (hovered !== this._zpcState?.settingsHovered) {
				if (this._zpcState) this._zpcState.settingsHovered = hovered;
				this.setDirtyCanvas?.(true, true);
			}
			titleTipHovered(hovered, t("settingsTip"), e);
			return result;
		};

		const onMouseLeave = nodeType.prototype.onMouseLeave;
		nodeType.prototype.onMouseLeave = function () {
			const result = onMouseLeave?.apply(this, arguments);
			if (!isTargetNode(this)) return result;
			if (this._zpcState?.settingsHovered) {
				this._zpcState.settingsHovered = false;
				this.setDirtyCanvas?.(true, true);
			}
			hideTitleTip();
			return result;
		};
	},

	nodeCreated(node) {
		if (isTargetNode(node)) initNode(node);
	},
});

injectPanelStyles("zhiai-image-preview-compare", STYLE);
