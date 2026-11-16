import { app } from "/scripts/app.js";
import { getLocale } from "./zhiai_i18n.js";
import {
	drawNodeSettingsButton,
	titleTipHovered,
	hideTitleTip,
} from "./node_title_icons.js";
import { openNoteDialog } from "./SwitchDualModeCommon.js";

// 图像拼接与标题（ImageGridTitle）的前端备注方案与「文本切换器」保持一致：
// - 标题栏齿轮图标（位于帮助"?"图标左侧）打开设置对话框，编辑每张图的备注；
// - 备注写入隐藏的 titles 组件（作为标题条文案，随工作流保存）；
// - 备注绘制在对应图像输入端口名称后面，作为节点上的即时提示。

const NODE_NAME = "ImageGridTitle";
const IMAGE_TYPE = "IMAGE";
const TITLES_WIDGET = "titles";
const PROP_KEY = "zh_imagegridtitle";
const OVERLAY_ID = "zhiai-imagegridtitle-note-overlay";
const DEFAULT_NOTE_COLOR = "#93C5FD";

const ICON_SIZE = 24;
const ICON_MARGIN = 4;
const ICON_GAP = 4;

// 与 litegraph 绘制端口标签时使用的字体/基线保持一致
const NOTE_FONT = "12px Inter";
const NOTE_BASELINE = "alphabetic";
const BINDING_RE = /^\s*(\d+)\s*[:：=]\s*(.*)$/;

function imageSlots(node) {
	const slots = [];
	(node.inputs ?? []).forEach((slot, index) => {
		if (slot && slot.type === IMAGE_TYPE) slots.push({ slot, index });
	});
	return slots;
}

function titlesWidget(node) {
	return node.widgets?.find((widget) => widget.name === TITLES_WIDGET);
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

function portBaseLabel(index) {
	return getLocale() === "zh" ? `图像${index}` : `Image ${index}`;
}

function fitText(ctx, text, maxWidth) {
	if (ctx.measureText(text).width <= maxWidth) return text;
	let short = text;
	while (short.length > 1 && ctx.measureText(short + "…").width > maxWidth) {
		short = short.slice(0, -1);
	}
	return short + "…";
}

function hideTitlesWidget(widget) {
	if (!widget) return;
	widget.options = widget.options || {};
	widget.options.hidden = true;
	widget.options.collapsed = true;
	widget.hidden = true;
	widget.serialize = true;
	widget.computeSize = () => [0, -4];
	widget.draw = () => {};
	if (widget.element && widget.element.style.display !== "none") {
		widget.element.style.display = "none";
	}
}

function settingsIconLeft(node) {
	// 帮助图标位于 node.size[0] - ICON_SIZE - ICON_MARGIN，本图标紧邻其左侧
	return node.size[0] - ICON_SIZE - ICON_MARGIN - (ICON_SIZE + ICON_GAP);
}

function settingsIconTop() {
	return -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - ICON_SIZE) / 2;
}

function hitSettingsIcon(node, localPos) {
	if (!localPos || node.flags?.collapsed) return false;
	const left = settingsIconLeft(node);
	const top = settingsIconTop();
	return (
		localPos[0] > left &&
		localPos[0] < left + ICON_SIZE &&
		localPos[1] > top &&
		localPos[1] < top + ICON_SIZE
	);
}

function noteLines(node) {
	const widget = titlesWidget(node);
	const slots = imageSlots(node);
	return titlesForPorts(widget?.value ?? "", slots.length);
}

function commitNote(node, index, text) {
	const widget = titlesWidget(node);
	if (!widget) return;
	const count = Math.max(imageSlots(node).length, index);
	const lines = titlesForPorts(widget.value ?? "", count);
	lines[index - 1] = String(text ?? "");
	let last = lines.length - 1;
	while (last >= 0 && !lines[last]) last -= 1;
	const trimmed = lines.slice(0, last + 1);
	let binding = parseTitles(widget.value ?? "").binding;
	if (!binding && trimmed.some((item) => !item)) binding = true;
	widget.value = serializeTitles(trimmed, binding);
}

function setupNode(node) {
	if (node._zhaiImageGridNotes) return;
	node._zhaiImageGridNotes = true;
	node.properties = node.properties || {};

	const widget = titlesWidget(node);
	hideTitlesWidget(widget);

	node.getNoteCount = function () {
		return Math.max(1, imageSlots(this).length);
	};

	node.getNote = function (index) {
		return noteLines(this)[index - 1] ?? "";
	};

	node.setNote = function (index, value) {
		commitNote(this, index, value);
	};

	node.getNoteColor = function () {
		const color = this.properties?.[PROP_KEY]?.color;
		return typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)
			? color
			: DEFAULT_NOTE_COLOR;
	};

	node.setNoteColor = function (color) {
		this.properties = this.properties || {};
		this.properties[PROP_KEY] = Object.assign({}, this.properties[PROP_KEY], {
			color,
		});
	};

	node.saveNoteValues = function () {
		try {
			const count = this.getNoteCount();
			const notes = [];
			for (let i = 1; i <= count; i++) notes.push(this.getNote(i));
			this.properties = this.properties || {};
			this.properties[PROP_KEY] = { count, notes, color: this.getNoteColor() };
		} catch (_) {}
	};

	// 端口基础名称不拼接备注，备注单独绘制在名称后面
	node.applyNoteLabels = function () {};

	// 在图像输入端口名称后绘制备注文字，与 litegraph 的标签落点保持一致
	node.drawImageNotes = function (ctx, opts) {
		if (opts?.lowQuality) return;
		const slots = imageSlots(this);
		if (!slots.length) return;
		const notes = noteLines(this);
		const color = this.getNoteColor();
		for (let i = 0; i < slots.length; i++) {
			const { slot, index } = slots[i];
			if (slot.isWidgetInputSlot) continue;
			const note = (notes[i] ?? "").trim();
			if (!note) continue;

			let cx = null;
			let cy = null;
			const centre = slot._centreOffset;
			if (Array.isArray(centre)) {
				cx = centre[0];
				cy = centre[1];
			} else if (typeof this.getConnectionPos === "function") {
				const cp = this.getConnectionPos(true, index, []);
				if (cp) {
					cx = cp[0] - this.pos[0];
					cy = cp[1] - this.pos[1];
				}
			}
			if (cx === null) continue;

			const labelText =
				slot.label || slot.localized_name || portBaseLabel(i + 1);
			const labelUp = slot.dir === LiteGraph.UP;
			const labelX = labelUp ? cx : cx + 10;
			const labelY = labelUp ? cy - 10 : cy + 5;

			ctx.save();
			ctx.font = NOTE_FONT;
			ctx.textAlign = "left";
			ctx.textBaseline = NOTE_BASELINE;
			const labelWidth = ctx.measureText(labelText).width;
			const noteX = labelX + labelWidth + 6;
			const maxWidth = this.size[0] - noteX - 8;
			if (maxWidth > 24) {
				ctx.fillStyle = color;
				ctx.fillText(fitText(ctx, `· ${note}`, maxWidth), noteX, labelY);
			}
			ctx.restore();
		}
	};
}

app.registerExtension({
	name: "zhiai_nodes.ImageGridTitleNotes",
	beforeRegisterNodeDef(nodeType, nodeData) {
		if (nodeData?.name !== NODE_NAME) return;

		const onNodeCreated = nodeType.prototype.onNodeCreated;
		nodeType.prototype.onNodeCreated = function () {
			const result = onNodeCreated?.apply(this, arguments);
			setupNode(this);
			return result;
		};

		// 原型级补丁只装一次，避免每创建一个节点再包一层
		if (!nodeType.prototype._zhImageGridNotesPatched) {
			nodeType.prototype._zhImageGridNotesPatched = true;

			const drawSlotsOriginal = nodeType.prototype.drawSlots;
			nodeType.prototype.drawSlots = function (ctx, opts) {
				const result = drawSlotsOriginal
					? drawSlotsOriginal.apply(this, arguments)
					: undefined;
				try {
					this.drawImageNotes?.(ctx, opts);
				} catch (_) {}
				return result;
			};

			// 标题栏绘制齿轮图标（帮助"?"图标左侧）
			const onDrawForeground = nodeType.prototype.onDrawForeground;
			nodeType.prototype.onDrawForeground = function (ctx) {
				const result = onDrawForeground
					? onDrawForeground.apply(this, arguments)
					: undefined;
				// 组件节点渲染可能在创建后延迟生成 DOM 元素，绘制时再兜底隐藏一次
				hideTitlesWidget(titlesWidget(this));
				if (this.flags?.collapsed) return result;
				ctx.save();
				ctx.translate(settingsIconLeft(this), settingsIconTop());
				ctx.scale(ICON_SIZE / 32, ICON_SIZE / 32);
				drawNodeSettingsButton(ctx, !!this._zhaiNoteHovered);
				ctx.restore();
				return result;
			};

			const onMouseDown = nodeType.prototype.onMouseDown;
			nodeType.prototype.onMouseDown = function (e, localPos) {
				if (hitSettingsIcon(this, localPos)) {
					hideTitleTip();
					openNoteDialog(
						this,
						{
							overlayId: OVERLAY_ID,
							dialogTitleZh: "图像拼接设置",
							dialogTitleEn: "Image Grid Settings",
							hintZh:
								"备注会显示在对应图像端口名称后面，并作为标题条文案写入输出图。",
							hintEn:
								"Notes are shown after the corresponding image port and used as title text in the output.",
						},
						(index) => portBaseLabel(index),
						() => {
							this.saveNoteValues?.();
							this.applyNoteLabels?.();
							this.setDirtyCanvas?.(true, true);
							app.graph.setDirtyCanvas(true, true);
						}
					);
					return true;
				}
				return onMouseDown?.apply(this, arguments);
			};

			const onMouseMove = nodeType.prototype.onMouseMove;
			nodeType.prototype.onMouseMove = function (e, localPos) {
				const result = onMouseMove?.apply(this, arguments);
				const hovered = hitSettingsIcon(this, localPos);
				if (hovered !== this._zhaiNoteHovered) {
					this._zhaiNoteHovered = hovered;
					this.setDirtyCanvas?.(true, true);
				}
				if (hovered) {
					titleTipHovered(true, getLocale() === "zh" ? "备注" : "Notes", e);
				} else if (!this._zhaiHelpHovered) {
					titleTipHovered(false, getLocale() === "zh" ? "备注" : "Notes", e);
				}
				return result;
			};

			const onMouseLeave = nodeType.prototype.onMouseLeave;
			nodeType.prototype.onMouseLeave = function () {
				const result = onMouseLeave?.apply(this, arguments);
				if (this._zhaiNoteHovered) {
					this._zhaiNoteHovered = false;
					this.setDirtyCanvas?.(true, true);
				}
				hideTitleTip();
				return result;
			};
		}
	},
});
