import { app } from "/scripts/app.js";
import { drawNodeTitleChip, NODE_TITLE_GLYPH, titleTipHovered, hideTitleTip } from "./node_title_icons.js";
import { getLocale, zhNodeInfo } from "./zhiai_i18n.js";

// 「图像 / 文本 / 潜在空间」切换器的公共前端实现：
// - 标题栏「⚙ 设置」图标（位于帮助"?"图标左侧）：点击打开对话框编辑各端口的备注，
//   备份存于隐藏的 {prefix}{n}{suffix} 组件并写入节点属性（随工作流保存）
// - 备注内容绘制在对应输入端口名称后面，字体颜色可在对话框中自定义（随工作流保存）
//
// 三个节点 JS 只提供配置对象（见下方 registerSwitchDualMode 的 config 字段），
// 行为与原先的 ImageSwitchDualMode.js 完全一致。

const ICON_SIZE = 24;
const ICON_MARGIN = 4;
const ICON_GAP = 4; // 与帮助图标之间的间距

// 与 litegraph 绘制端口标签时使用的字体/基线保持一致（实测标签为 12px Inter + alphabetic 基线），
// 这样备注才能与标签严格同线
const NOTE_FONT = "12px Inter";
const NOTE_BASELINE = "alphabetic";
const DEFAULT_NOTE_COLOR = "#93C5FD";
// 对话框中的常用颜色板
const NOTE_PALETTE = [
    "#93C5FD", "#FFFFFF", "#CBD5E1", "#FBBF24", "#F59E0B",
    "#EF4444", "#F472B6", "#A78BFA", "#22D3EE", "#84CC16",
];

const DIALOG_KEYFRAMES_ID = "zhiai-promptcombiner-keyframes";

function fitText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let short = text;
    while (short.length > 1 && ctx.measureText(short + "…").width > maxWidth) {
        short = short.slice(0, -1);
    }
    return short + "…";
}

function commentIconLeft(node) {
    // 帮助图标位于 node.size[0] - ICON_SIZE - ICON_MARGIN，本图标紧邻其左侧
    return node.size[0] - ICON_SIZE - ICON_MARGIN - (ICON_SIZE + ICON_GAP);
}

function commentIconTop() {
    return -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - ICON_SIZE) / 2;
}

function hitCommentIcon(node, localPos) {
    if (!localPos || node.flags?.collapsed) return false;
    const left = commentIconLeft(node);
    const top = commentIconTop();
    return localPos[0] > left && localPos[0] < left + ICON_SIZE
        && localPos[1] > top && localPos[1] < top + ICON_SIZE;
}

function drawCommentIcon(ctx, active) {
    drawNodeTitleChip(ctx, active);
    ctx.font = "bold 24px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = active ? NODE_TITLE_GLYPH.active : NODE_TITLE_GLYPH.idle;
    // U+FE0E 变体选择符：强制使用文字字形，避免被渲染成彩色 emoji
    ctx.fillText("⚙\uFE0E", 16, 19);
}

function hideNoteWidget(widget) {
    if (!widget) return;
    widget.options = widget.options || {};
    widget.options.hidden = true;
    widget.options.collapsed = true;
    widget.hidden = true;
    widget.serialize = true;
    widget.computeSize = () => [0, -4];
    widget.draw = () => {};
}

// 备注编辑对话框：与「提示词组合」等节点一致的深蓝玻璃拟态风格
const NOTE_TOKENS = {
    // 统一配色：与「LoRA 堆加载器」设置面板一致
    glassDeep: "rgba(23, 36, 58, 0.94)",
    line: "#34577F",
    lineSoft: "rgba(64, 104, 154, 0.7)",
    text: "#DDE9F5",
    textBright: "#F2FAFF",
    textDim: "#C6D8EC",
    textFaint: "#98AECC",
    textMuted: "#93A9C4",
    fieldBg: "#181E2C",
    fieldBorder: "rgba(112, 152, 202, 0.32)",
    radiusSm: "6px",
    radiusMd: "8px",
    radiusPill: "999px",
    font: "'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
    blurPanel: "blur(18px) saturate(1.5)",
    shadowPanel: "0 34px 90px rgba(2, 6, 23, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    motionFast: "140ms",
    motionBase: "220ms",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    actionPrimary: "rgba(37, 99, 235, 0.85)",
    actionPrimaryHover: "#3B82F6",
    actionNeutral: "#334155",
    actionNeutralHover: "#475569",
};

function openNoteDialog(node, config, portBaseLabel, onSaved) {
    const overlayId = config.overlayId;
    if (document.getElementById(overlayId)) return;

    const T = NOTE_TOKENS;
    const count = node.getNoteCount();
    const zh = getLocale() === "zh";

    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.style.cssText =
        "position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:10001;" +
        "display:flex;align-items:center;justify-content:center;" +
        "background:rgba(2, 6, 23, 0.55);backdrop-filter:blur(6px) saturate(1.15);-webkit-backdrop-filter:blur(6px) saturate(1.15);";

    const panel = document.createElement("div");
    panel.style.cssText =
        "display:flex;flex-direction:column;width:560px;max-width:92vw;max-height:85vh;overflow:hidden;" +
        "border-radius:12px;background:" + T.glassDeep + ";border:1px solid " + T.line + ";" +
        "box-shadow:" + T.shadowPanel + ";backdrop-filter:" + T.blurPanel + ";-webkit-backdrop-filter:" + T.blurPanel + ";" +
        "color:" + T.text + ";font-family:" + T.font + ";font-size:14px;line-height:1.55;box-sizing:border-box;" +
        "animation:pcc-dialog-in " + T.motionBase + " " + T.easing + ";";
    if (!document.getElementById(DIALOG_KEYFRAMES_ID)) {
        const kf = document.createElement("style");
        kf.id = DIALOG_KEYFRAMES_ID;
        kf.textContent =
            "@keyframes pcc-dialog-in{from{opacity:0;transform:translateY(10px) scale(0.985)}to{opacity:1;transform:translateY(0) scale(1)}}";
        document.head.appendChild(kf);
    }

    const head = document.createElement("div");
    head.style.cssText =
        "display:flex;align-items:center;gap:11px;flex:0 0 auto;padding:16px 24px 12px;" +
        "border-bottom:1px solid " + T.line + ";background:transparent;";
    const title = document.createElement("div");
    title.textContent = zh ? config.dialogTitleZh : config.dialogTitleEn;
    title.style.cssText = "margin:0;font-size:14.5px;font-weight:600;line-height:1.35;letter-spacing:0.01em;color:" + T.textBright + ";";
    head.appendChild(title);
    panel.appendChild(head);

    const body = document.createElement("div");
    body.style.cssText = "display:flex;flex-direction:column;padding:20px 24px 22px;overflow-y:auto;";

    const hint = document.createElement("div");
    hint.textContent = zh ? config.hintZh : config.hintEn;
    hint.style.cssText = "font-size:12px;color:" + T.textFaint + ";margin-bottom:14px;line-height:1.6;";
    body.appendChild(hint);

    // 备注字体颜色（整节点统一）：单行显示，名称 → 色板 → 预览框 → 色号 → 默认
    const colorRow = document.createElement("div");
    colorRow.style.cssText =
        "display:flex;align-items:center;flex-wrap:nowrap;gap:6px;" +
        "margin-bottom:18px;padding:8px 12px;border:1px solid " + T.fieldBorder + ";" +
        "border-radius:" + T.radiusSm + ";background:" + T.fieldBg + ";";

    const colorLabel = document.createElement("div");
    colorLabel.textContent = zh ? "字体颜色" : "Text color";
    colorLabel.style.cssText =
        "flex:0 0 auto;font-size:12.5px;font-weight:500;letter-spacing:0.01em;color:" + T.textDim + ";";

    const colorValue = document.createElement("div");
    colorValue.style.cssText =
        "flex:0 0 auto;font-size:11px;font-family:'Consolas', monospace;color:" + T.textFaint + ";text-transform:uppercase;";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = node.getNoteColor();
    colorInput.style.cssText =
        "flex:0 0 auto;width:42px;height:26px;padding:0;border:1px solid " + T.fieldBorder + ";border-radius:4px;" +
        "background:transparent;cursor:pointer;";
    colorValue.textContent = colorInput.value.toUpperCase();

    const resetColorBtn = document.createElement("button");
    resetColorBtn.textContent = zh ? "默认" : "Default";
    resetColorBtn.style.cssText =
        "flex:0 0 auto;padding:3px 8px;font-family:inherit;font-size:12px;color:" + T.textMuted + ";cursor:pointer;" +
        "background:transparent;border:1px solid rgba(96, 165, 250, 0.28);border-radius:" + T.radiusPill + ";" +
        "transition:background-color " + T.motionFast + " ease,border-color " + T.motionFast + " ease,color " + T.motionFast + " ease;";
    resetColorBtn.onmouseenter = () => {
        resetColorBtn.style.color = "#60A5FA";
        resetColorBtn.style.borderColor = "#3B82F6";
        resetColorBtn.style.background = "rgba(59, 130, 246, 0.16)";
    };
    resetColorBtn.onmouseleave = () => {
        resetColorBtn.style.color = T.textMuted;
        resetColorBtn.style.borderColor = "rgba(96, 165, 250, 0.28)";
        resetColorBtn.style.background = "transparent";
    };
    resetColorBtn.onclick = () => {
        colorInput.value = DEFAULT_NOTE_COLOR;
        colorValue.textContent = DEFAULT_NOTE_COLOR.toUpperCase();
        updateSwatchSelection(DEFAULT_NOTE_COLOR);
    };
    colorInput.addEventListener("input", () => {
        colorValue.textContent = colorInput.value.toUpperCase();
        updateSwatchSelection(colorInput.value);
    });

    // 常用颜色板：与颜色预览框内部色块等高的方格，单行靠右对齐
    const swatchRow = document.createElement("div");
    swatchRow.style.cssText =
        "display:flex;flex-wrap:nowrap;align-items:center;gap:4px;flex:0 0 auto;";

    const swatches = [];
    const updateSwatchSelection = (value) => {
        const current = (value || "").toLowerCase();
        for (const sw of swatches) {
            const on = sw.dataset.color.toLowerCase() === current;
            sw.style.borderColor = on ? "#3B82F6" : "rgba(255, 255, 255, 0.16)";
            sw.style.boxShadow = on ? "0 0 0 2px rgba(59, 130, 246, 0.55)" : "none";
        }
    };

    NOTE_PALETTE.forEach((color) => {
        const sw = document.createElement("button");
        sw.type = "button";
        sw.dataset.color = color;
        sw.title = color;
        sw.style.cssText =
            "width:16px;height:16px;flex:0 0 auto;box-sizing:border-box;padding:0;border-radius:3px;cursor:pointer;" +
            "background:" + color + ";border:1px solid rgba(255, 255, 255, 0.16);" +
            "transition:transform " + T.motionFast + " " + T.easing + ",border-color " + T.motionFast + " " + T.easing + ";";
        sw.onmouseenter = () => { sw.style.transform = "scale(1.12)"; };
        sw.onmouseleave = () => { sw.style.transform = "scale(1)"; };
        sw.onclick = () => {
            colorInput.value = color;
            colorValue.textContent = color.toUpperCase();
            updateSwatchSelection(color);
        };
        swatches.push(sw);
        swatchRow.appendChild(sw);
    });
    updateSwatchSelection(colorInput.value);

    // 左侧留白撑开：字体颜色名称靠左，色板与颜色控件整组靠右对齐
    const colorSpacer = document.createElement("div");
    colorSpacer.style.cssText = "flex:1 1 auto;min-width:8px;";

    colorRow.appendChild(colorLabel);
    colorRow.appendChild(colorSpacer);
    colorRow.appendChild(swatchRow);
    colorRow.appendChild(colorInput);
    colorRow.appendChild(colorValue);
    colorRow.appendChild(resetColorBtn);
    body.appendChild(colorRow);

    const inputs = [];
    // 备注输入框使用 2 列网格布局（2×2 排布）
    const gridWrap = document.createElement("div");
    gridWrap.style.cssText =
        "display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));" +
        "column-gap:14px;row-gap:12px;";
    body.appendChild(gridWrap);

    for (let i = 1; i <= count; i++) {
        const cell = document.createElement("div");
        cell.style.cssText = "display:flex;flex-direction:column;min-width:0;";

        const label = document.createElement("div");
        label.textContent = `${portBaseLabel(i)}${zh ? " 备注" : " note"}`;
        label.style.cssText = "font-size:12.5px;font-weight:500;letter-spacing:0.01em;color:" + T.textDim + ";margin-bottom:6px;";
        cell.appendChild(label);

        const input = document.createElement("input");
        input.type = "text";
        input.value = node.getNote(i);
        input.placeholder = zh ? "留空则不显示备注" : "Leave empty for no note";
        input.style.cssText =
            "width:100%;box-sizing:border-box;padding:7px 10px;font-family:inherit;font-size:13px;line-height:1.6;" +
            "color:#E8F2FB;background:" + T.fieldBg + ";border:1px solid " + T.fieldBorder + ";" +
            "border-radius:" + T.radiusSm + ";outline:none;" +
            "transition:border-color " + T.motionFast + " ease,box-shadow " + T.motionFast + " ease;";
        input.addEventListener("focus", () => {
            input.style.borderColor = "#3B82F6";
            input.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.24)";
        });
        input.addEventListener("blur", () => {
            input.style.borderColor = T.fieldBorder;
            input.style.boxShadow = "none";
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); saveBtn.click(); }
        });
        cell.appendChild(input);
        gridWrap.appendChild(cell);
        inputs.push(input);
    }

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;justify-content:flex-end;gap:8px;margin-top:16px;";

    const mkBtn = (text, kind) => {
        const b = document.createElement("button");
        b.textContent = text;
        const base =
            "padding:6px 16px;font-family:inherit;font-size:13px;font-weight:600;line-height:1.45;cursor:pointer;color:#FFFFFF;" +
            "border:1px solid transparent;border-radius:" + T.radiusSm + ";" +
            "transition:background-color " + T.motionFast + " ease,border-color " + T.motionFast + " ease;";
        if (kind === "primary") {
            b.style.cssText = base + "background:" + T.actionPrimary + ";";
            b.onmouseenter = () => { b.style.background = T.actionPrimaryHover; };
            b.onmouseleave = () => { b.style.background = T.actionPrimary; };
        } else {
            b.style.cssText = base + "background:" + T.actionNeutral + ";";
            b.onmouseenter = () => { b.style.background = T.actionNeutralHover; };
            b.onmouseleave = () => { b.style.background = T.actionNeutral; };
        }
        return b;
    };

    const close = () => overlay.remove();

    const saveBtn = mkBtn(zh ? "保存" : "Save", "primary");
    saveBtn.onclick = () => {
        inputs.forEach((input, index) => node.setNote(index + 1, input.value.trim()));
        node.setNoteColor(colorInput.value);
        node.saveNoteValues();
        node.applyNoteLabels();
        if (typeof onSaved === "function") onSaved();
        close();
    };

    const cancelBtn = mkBtn(zh ? "取消" : "Cancel", "neutral");
    cancelBtn.onclick = close;

    // 左下角：清空全部备注
    const clearBtn = mkBtn(zh ? "清空全部备注" : "Clear all notes", "neutral");
    clearBtn.style.marginRight = "auto";
    clearBtn.style.background = "transparent";
    clearBtn.style.color = "#FCA5A5";
    clearBtn.style.borderColor = "rgba(248, 113, 113, 0.32)";
    clearBtn.onmouseenter = () => {
        clearBtn.style.color = "#FECACA";
        clearBtn.style.borderColor = "rgba(248, 113, 113, 0.62)";
        clearBtn.style.background = "rgba(248, 113, 113, 0.16)";
    };
    clearBtn.onmouseleave = () => {
        clearBtn.style.color = "#FCA5A5";
        clearBtn.style.borderColor = "rgba(248, 113, 113, 0.32)";
        clearBtn.style.background = "transparent";
    };
    clearBtn.onclick = () => {
        inputs.forEach(input => { input.value = ""; });
        for (let i = 1; i <= inputs.length; i++) node.setNote(i, "");
        node.applyNoteLabels();
        node.saveNoteValues();
        app.graph.setDirtyCanvas(true, true);
    };

    btnRow.appendChild(clearBtn);
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    body.appendChild(btnRow);
    panel.appendChild(body);

    overlay.appendChild(panel);
    overlay.addEventListener("mousedown", (e) => {
        if (e.target === overlay) close();
    });
    overlay.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
    document.body.appendChild(overlay);
    inputs[0]?.focus();
}

export function registerSwitchDualMode(config) {
    const {
        nodeClass,
        portPrefix,
        portType,
        noteSuffix,
        selectWidget,
        propKey,
        storageKey,
        labelZh,
        dialogTitleZh,
        dialogTitleEn,
        hintZh,
        hintEn,
    } = config;

    const portName = (i) => `${portPrefix}${i}`;
    const noteWidgetName = (i) => `${portPrefix}${i}${noteSuffix}`;
    const portRe = new RegExp(`^${portPrefix}(\\d+)$`);
    const noteRe = new RegExp(`^${portPrefix}(\\d+)${noteSuffix}$`);

    const portIndex = (name) => parseInt(portRe.exec(name || "")?.[1] ?? "");
    const noteIndex = (name) => parseInt(noteRe.exec(name || "")?.[1] ?? "");

    const readSaved = (node) => {
        // 工作流中保存的属性优先，localStorage 仅作为兜底
        let saved = node.properties?.[propKey] || null;
        if (!saved) {
            try { const raw = window.localStorage.getItem(node._noteStorageKey()); if (raw) saved = JSON.parse(raw); } catch (_) {}
        }
        return saved || null;
    };

    // 兼容旧字段 comments（旧版文本切换器保存为 {count, comments}）
    const savedNotes = (saved) => {
        if (Array.isArray(saved?.notes)) return saved.notes;
        if (Array.isArray(saved?.comments)) return saved.comments;
        return null;
    };

    const portBaseLabel = (i) => {
        const name = portName(i);
        const zh = zhNodeInfo(nodeClass)?.inputLabel(name);
        return getLocale() === "zh" ? (zh || `${labelZh}${i}`) : name;
    };

    app.registerExtension({
        name: `Zhi.AI.${nodeClass}.DynamicInputs`,
        async beforeRegisterNodeDef(nodeType, nodeData, app) {
            if (nodeData?.name !== nodeClass) return;

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                this._type = portType;
                this.properties = this.properties || {};

                // 保证「输入数量」排在「模式」上方（与后端 INPUT_TYPES 顺序一致，避免旧缓存顺序错位）
                this.normalizeWidgetOrder = function () {
                    const list = this.widgets;
                    if (!Array.isArray(list)) return;
                    const countIdx = list.findIndex(w => w?.name === "inputcount");
                    const modeIdx = list.findIndex(w => w?.name === "mode");
                    if (countIdx < 0 || modeIdx < 0 || countIdx < modeIdx) return;
                    const [item] = list.splice(countIdx, 1);
                    list.splice(modeIdx, 0, item);
                };
                this.normalizeWidgetOrder();

                this._noteStorageKey = () => {
                    try { return `${storageKey}_${this.id || 'unknown'}`; } catch(_) { return `${storageKey}_unknown`; }
                };

                this.getNoteCount = function () {
                    const w = this.widgets?.find(w => w.name === "inputcount");
                    return Math.max(1, parseInt(w?.value) || 1);
                };

                this.getNoteWidget = function (i) {
                    return this.widgets?.find(w => w.name === noteWidgetName(i));
                };

                this.getNote = function (i) {
                    return String(this.getNoteWidget(i)?.value ?? "");
                };

                this.setNote = function (i, value) {
                    const w = this.getNoteWidget(i);
                    if (w) w.value = value;
                };

                this.getNoteColor = function () {
                    const color = this.properties?.[propKey]?.color;
                    return typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color) ? color : DEFAULT_NOTE_COLOR;
                };

                this.setNoteColor = function (color) {
                    this.properties = this.properties || {};
                    const saved = this.properties[propKey];
                    this.properties[propKey] = Object.assign({}, saved, {
                        count: this.getNoteCount(),
                        notes: savedNotes(saved) || [],
                        color,
                    });
                };

                this.saveNoteValues = function () {
                    try {
                        const target = this.getNoteCount();
                        const notes = [];
                        for (let i = 1; i <= target; i++) notes.push(this.getNote(i));
                        const payload = { count: target, notes, color: this.getNoteColor() };
                        this.properties[propKey] = payload;
                        try { window.localStorage.setItem(this._noteStorageKey(), JSON.stringify(payload)); } catch(_){}
                    } catch(_){}
                };

                this.restoreNoteValues = function () {
                    try {
                        const saved = readSaved(this);
                        if (!saved) return;
                        if (typeof saved.color === "string") {
                            this.properties[propKey] = Object.assign({}, this.properties[propKey], { color: saved.color });
                        }
                        const notes = savedNotes(saved);
                        if (!notes) return;
                        const target = Math.max(1, parseInt(saved.count) || notes.length || 1);
                        for (let i = 1; i <= target; i++) {
                            if (notes[i - 1] !== undefined) this.setNote(i, notes[i - 1]);
                        }
                    } catch(_){}
                };

                // 备注单独绘制在端口名称后面，这里只负责端口基础名称
                this.applyNoteLabels = function () {
                    for (const inp of this.inputs || []) {
                        const match = portRe.exec(inp.name || "");
                        if (!match) continue;
                        const idx = parseInt(match[1]);
                        const base = portBaseLabel(idx);
                        if (inp.label !== base) inp.label = base;
                        // 兼容旧版把备注拼进 localized_name 的数据
                        if (typeof inp.localized_name === "string" && inp.localized_name.includes(" · ")) {
                            inp.localized_name = base;
                        }
                    }
                };

                // 在输入端口名称后绘制备注文字：紧跟 litegraph 绘制完端口标签之后执行，
                // 复用同一个槽位中心点、字体与基线，保证与标签严格对齐
                this.drawNoteTexts = function (ctx, opts) {
                    if (opts?.lowQuality) return;
                    const count = this.getNoteCount();
                    const color = this.getNoteColor();
                    const inputs = this.inputs || [];
                    for (let i = 0; i < inputs.length; i++) {
                        const inp = inputs[i];
                        // 转换为组件输入时 litegraph 不绘制标签，备注也不绘制
                        if (inp.isWidgetInputSlot) continue;
                        const match = portRe.exec(inp.name || "");
                        if (!match) continue;
                        const idx = parseInt(match[1]);
                        if (idx > count) continue;
                        const note = this.getNote(idx).trim();
                        if (!note) continue;

                        let cx = null;
                        let cy = null;
                        const centre = inp._centreOffset;
                        if (Array.isArray(centre)) {
                            cx = centre[0];
                            cy = centre[1];
                        } else if (typeof this.getConnectionPos === "function") {
                            const cp = this.getConnectionPos(true, i, []);
                            if (cp) {
                                cx = cp[0] - this.pos[0];
                                cy = cp[1] - this.pos[1];
                            }
                        }
                        if (cx === null) continue;

                        const labelText = inp.label || inp.localized_name || portBaseLabel(idx);
                        // 复刻 NodeSlot.draw 中标签的落点：dir 为 UP 时在端口上方，否则在右侧
                        const labelUp = inp.dir === LiteGraph.UP;
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
                            // 备注前加分隔符号「·」
                            ctx.fillText(fitText(ctx, `· ${note}`, maxWidth), noteX, labelY);
                        }
                        ctx.restore();
                    }
                };

                // 原型级补丁只装一次：否则每创建一个节点都会再包一层，叠加后导致栈溢出
                if (!nodeType.prototype._zhSlotsPatched) {
                    nodeType.prototype._zhSlotsPatched = true;
                    const drawSlotsOriginal = nodeType.prototype.drawSlots;
                    nodeType.prototype.drawSlots = function (ctx, opts) {
                        const result = drawSlotsOriginal ? drawSlotsOriginal.apply(this, arguments) : undefined;
                        try { this.drawNoteTexts?.(ctx, opts); } catch (_) {}
                        return result;
                    };
                }

                const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");

                this.updateInputs = function (n) {
                    if (!this.inputs) this.inputs = [];
                    const current = this.inputs.filter(i => portRe.test(i.name)).length;
                    if (n === current) return;
                    if (n < current) {
                        for (let i = this.inputs.length - 1; i >= 0; i--) {
                            const input = this.inputs[i];
                            if (portRe.test(input.name)) {
                                const num = portIndex(input.name);
                                if (num > n) this.removeInput(i);
                            }
                        }
                    } else {
                        for (let i = current + 1; i <= n; i++) {
                            const name = portName(i);
                            const exists = this.inputs.some(inp => inp.name === name);
                            if (!exists) this.addInput(name, this._type, { optional: true });
                        }
                    }
                    for (const inp of this.inputs || []) {
                        if (portRe.test(inp.name)) inp.optional = true;
                    }
                    this.applyNoteLabels();
                    this.size = this.computeSize(this.size);
                    app.graph.setDirtyCanvas(true, true);
                };

                this.getConnectedPortInputs = function () {
                    const connected = [];
                    if (!this.inputs) return connected;
                    for (const input of this.inputs) {
                        if (portRe.test(input.name) && input.link != null && input.link !== undefined) {
                            const num = portIndex(input.name);
                            connected.push(num);
                        }
                    }
                    return connected.sort((a, b) => a - b);
                };

                // auto 模式下禁用「选择」控件：灰显并拦截取值变化
                // 原始 draw/callback 存在闭包里而不是挂在组件对象上，避免前端克隆组件时产生自引用递归
                let zhSelectOrigDraw = null;
                let zhSelectOrigCallback = null;
                this.setSelectEnabled = function (enabled) {
                    const w = this.widgets?.find(x => x.name === selectWidget);
                    if (!w) return;
                    if (!zhSelectOrigDraw && typeof w.draw === "function") zhSelectOrigDraw = w.draw;
                    if (!w._zhDrawPatched && zhSelectOrigDraw) {
                        w._zhDrawPatched = true;
                        w.draw = function () {
                            const ctx = arguments[0];
                            if (!ctx || ctx.globalAlpha === undefined) return zhSelectOrigDraw.apply(this, arguments);
                            ctx.save();
                            ctx.globalAlpha = w._zhDisabled ? 0.42 : 1;
                            try { return zhSelectOrigDraw.apply(this, arguments); } finally { ctx.restore(); }
                        };
                    }
                    if (!zhSelectOrigCallback && typeof w.callback === "function") zhSelectOrigCallback = w.callback;
                    if (!w._zhCallbackPatched) {
                        w._zhCallbackPatched = true;
                        w.callback = function (value) {
                            if (w._zhDisabled) {
                                w.value = w._zhLastValue;
                                app.graph.setDirtyCanvas(true, true);
                                return;
                            }
                            w._zhLastValue = value;
                            return zhSelectOrigCallback ? zhSelectOrigCallback.apply(this, arguments) : undefined;
                        };
                    }
                    if (w._zhLastValue === undefined || enabled) w._zhLastValue = w.value;
                    w._zhDisabled = !enabled;
                    w.disabled = !enabled;
                    if (w.options && typeof w.options === "object" && !Array.isArray(w.options)) {
                        w.options.disabled = !enabled;
                    }
                };

                this.updateSelectOptions = function (n) {
                    const w = this.widgets?.find(w => w.name === selectWidget);
                    if (!w) return;
                    const modeWidget = this.widgets?.find(w => w.name === "mode");
                    const isManual = modeWidget?.value === "manual";
                    let opts;
                    if (isManual) {
                        const connected = this.getConnectedPortInputs();
                        opts = connected.length > 0 ? connected.map(String) : ["1"];
                    } else {
                        opts = Array.from({ length: Math.max(1, parseInt(n) || 1) }, (_, i) => String(i + 1));
                    }
                    if (Array.isArray(w.options)) w.options = opts; else if (w.options && typeof w.options === "object") w.options.values = opts; else w.options = opts;
                    const v = parseInt(w.value);
                    if (!v || !opts.includes(String(v))) {
                        w.value = opts[0] || "1";
                    }
                    this.setSelectEnabled(isManual);
                    this.size = this.computeSize(this.size);
                    app.graph.setDirtyCanvas(true, true);
                };

                // 备注控件不再直接显示在节点上，仅作为隐藏的数据载体（保存在工作流中）
                this.syncNoteWidgets = function (n) {
                    const target = Math.max(1, parseInt(n) || 1);
                    for (let i = (this.widgets?.length || 0) - 1; i >= 0; i--) {
                        const w = this.widgets[i];
                        if (w && noteRe.test(w.name)) {
                            const idx = noteIndex(w.name);
                            if (idx > target) {
                                w.onRemove?.();
                                this.widgets.splice(i, 1);
                            }
                        }
                    }
                    for (let i = 1; i <= target; i++) {
                        const name = noteWidgetName(i);
                        let w = this.widgets?.find(w => w.name === name);
                        if (!w) {
                            w = this.addWidget("text", name, "");
                            if (w) {
                                w.serialize = true;
                                const orig = w.callback;
                                w.callback = (val) => { if (orig) orig.call(this, val); this.saveNoteValues(); this.applyNoteLabels(); };
                            }
                        }
                        hideNoteWidget(w);
                    }
                    const posAfterInput = (this.widgets?.findIndex(w => w.name === "inputcount") ?? -1) + 1;
                    if (posAfterInput > 0) {
                        const others = [];
                        const notes = [];
                        for (const w of this.widgets || []) {
                            if (noteRe.test(w.name)) notes.push(w); else others.push(w);
                        }
                        this.widgets.length = 0;
                        const head = others.slice(0, posAfterInput);
                        const tail = others.slice(posAfterInput);
                        this.widgets.push(...head, ...notes, ...tail);
                        notes.forEach(hideNoteWidget);
                    }
                    this.restoreNoteValues();
                    this.applyNoteLabels();
                    this.size = this.computeSize(this.size);
                    app.graph.setDirtyCanvas(true, true);
                };

                if (inputcountWidget) {
                    const self = this;
                    const handleInputChange = () => {
                        const n = parseInt(inputcountWidget.value) || 1;
                        self.updateInputs(n);
                        self.updateSelectOptions(n);
                        self.syncNoteWidgets(n);
                        self.saveNoteValues();
                    };
                    const originalCallback = inputcountWidget.callback;
                    inputcountWidget.callback = function(value) {
                        if (originalCallback) originalCallback.call(this, value);
                        handleInputChange();
                    };
                    const originalMouseUp = inputcountWidget.mouseUp;
                    inputcountWidget.mouseUp = function(e, pos, node) {
                        const result = originalMouseUp ? originalMouseUp.call(this, e, pos, node) : undefined;
                        handleInputChange();
                        return result;
                    };
                    const originalOnKeyDown = inputcountWidget.onKeyDown;
                    inputcountWidget.onKeyDown = function(e) {
                        const result = originalOnKeyDown ? originalOnKeyDown.call(this, e) : undefined;
                        if (e.keyCode === 13) {
                            handleInputChange();
                        }
                        return result;
                    };
                    const saved = readSaved(this);
                    if (saved && typeof saved.count !== "undefined") {
                        inputcountWidget.value = saved.count;
                    }
                    const v = parseInt(inputcountWidget.value) || 1;
                    this.updateInputs(v);
                    this.updateSelectOptions(v);
                    this.syncNoteWidgets(v);
                    this.restoreNoteValues();
                    this.applyNoteLabels();
                }

                const modeWidget = this.widgets?.find(w => w.name === "mode");
                if (modeWidget) {
                    const self = this;
                    const originalModeCallback = modeWidget.callback;
                    modeWidget.callback = function(value) {
                        if (originalModeCallback) originalModeCallback.call(this, value);
                        const inputcountW = self.widgets?.find(w => w.name === "inputcount");
                        const n = parseInt(inputcountW?.value) || 1;
                        self.updateSelectOptions(n);
                    };
                }

                const onConnectionsChange = this.onConnectionsChange;
                this.onConnectionsChange = function (type, slot, connected, link_info) {
                    const result = onConnectionsChange ? onConnectionsChange.apply(this, arguments) : undefined;
                    if (type === 1) {
                        const inputcountW = this.widgets?.find(w => w.name === "inputcount");
                        const n = parseInt(inputcountW?.value) || 1;
                        this.updateSelectOptions(n);
                    }
                    return result;
                };

                if (!nodeType.prototype._zhConfigurePatched) {
                    nodeType.prototype._zhConfigurePatched = true;
                    const configure = nodeType.prototype.configure;
                    nodeType.prototype.configure = function (info) {
                        // 旧工作流按旧顺序（mode, select_*, inputcount）保存，加载时把两个值换回正确位置
                        try {
                            const wv = info?.widgets_values;
                            const isMode = (v) => v === "manual" || v === "auto";
                            if (Array.isArray(wv) && wv.length >= 3 && isMode(wv[0]) && wv[2] !== undefined && !isMode(wv[2])) {
                                const patched = wv.slice();
                                patched[0] = wv[2];
                                patched[2] = wv[0];
                                info.widgets_values = patched;
                            }
                        } catch (_) {}
                        const r2 = configure ? configure.apply(this, arguments) : undefined;
                        try { this.normalizeWidgetOrder(); } catch (_) {}
                        this.properties = this.properties || {};
                        return r2;
                    };

                    const onConfigure = nodeType.prototype.onConfigure;
                    nodeType.prototype.onConfigure = function () {
                        const r3 = onConfigure ? onConfigure.apply(this, arguments) : undefined;
                        try {
                            const saved = readSaved(this);
                            if (saved && typeof saved.count !== "undefined") {
                                const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
                                if (inputcountWidget) inputcountWidget.value = saved.count;
                                const n = parseInt(saved.count) || 1;
                                this.updateInputs(n);
                                this.updateSelectOptions(n);
                                this.syncNoteWidgets(n);
                                this.restoreNoteValues();
                            }
                            this.applyNoteLabels();
                        } catch (_) {}
                        return r3;
                    };

                    const onSerialize = nodeType.prototype.onSerialize;
                    nodeType.prototype.onSerialize = function (o) {
                        try { this.saveNoteValues(); } catch(_){}
                        return onSerialize ? onSerialize.apply(this, arguments) : undefined;
                    };

                    // 标题栏绘制「⚙ 设置」图标（帮助"?"图标左侧）
                    const onDrawForeground = nodeType.prototype.onDrawForeground;
                    nodeType.prototype.onDrawForeground = function (ctx) {
                        const result = onDrawForeground ? onDrawForeground.apply(this, arguments) : undefined;
                        if (this.flags?.collapsed) return result;
                        ctx.save();
                        ctx.translate(commentIconLeft(this), commentIconTop());
                        ctx.scale(ICON_SIZE / 32, ICON_SIZE / 32);
                        drawCommentIcon(ctx, !!this._zhaiNoteHovered);
                        ctx.restore();
                        return result;
                    };

                    const onMouseDown = nodeType.prototype.onMouseDown;
                    nodeType.prototype.onMouseDown = function (e, localPos) {
                        if (hitCommentIcon(this, localPos)) {
                            hideTitleTip();
                            openNoteDialog(this, config, portBaseLabel, () => {
                                this.saveNoteValues?.();
                                this.applyNoteLabels?.();
                                this.setDirtyCanvas?.(true, true);
                                app.graph.setDirtyCanvas(true, true);
                            });
                            return true;
                        }
                    return onMouseDown ? onMouseDown.apply(this, arguments) : undefined;
                };

                const onMouseMove = nodeType.prototype.onMouseMove;
                nodeType.prototype.onMouseMove = function (e, localPos) {
                    const result = onMouseMove ? onMouseMove.apply(this, arguments) : undefined;
                    const hovered = hitCommentIcon(this, localPos);
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
                    const result = onMouseLeave ? onMouseLeave.apply(this, arguments) : undefined;
                    if (this._zhaiNoteHovered) {
                        this._zhaiNoteHovered = false;
                        this.setDirtyCanvas?.(true, true);
                    }
                    hideTitleTip();
                    return result;
                };
                }

                return r;
            };
        }
    });
}
