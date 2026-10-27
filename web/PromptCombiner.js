import { app } from "/scripts/app.js";
import { drawNodeTitleChip, NODE_TITLE_GLYPH, titleTipHovered, hideTitleTip } from "./node_title_icons.js";

// 提示词组合（PromptCombiner）前端：
// - 标题栏「✎ 注释」图标（位于帮助"?"图标左侧）：点击打开对话框编辑提示词1/2的注释，
//   保存到节点属性（随工作流保存）
// - 注释内容同时设置为 prompt1/prompt2 输入框的悬停提示（tooltip）

const ICON_SIZE = 24;
const ICON_MARGIN = 4;
const ICON_GAP = 4; // 与帮助图标之间的间距

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

function drawCommentIcon(ctx, active, hasComments) {
    drawNodeTitleChip(ctx, active);
    ctx.font = "bold 24px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = active ? NODE_TITLE_GLYPH.active : NODE_TITLE_GLYPH.idle;
    ctx.fillText("✎", 16, 19);
    if (hasComments) {
        // 已有注释时在图标右上角画一个小圆点提示
        ctx.beginPath();
        ctx.arc(25, 7, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "#FBBF24";
        ctx.fill();
    }
}

// 对话框主题：与 LM 工作室节点一致的深蓝玻璃拟态设计令牌（取自 lmstudio.js LMS_TOKENS）
const PCC_TOKENS = {
    glassDeep: "rgba(5, 11, 22, 0.88)",
    line: "#2C5080",
    border: "rgba(96, 165, 250, 0.18)",
    text: "#DDE9F5",
    textBright: "#F2FAFF",
    textDim: "#93A9C4",
    textFaint: "#7C93B0",
    primary: "#3B82F6",
    primaryLight: "#93C5FD",
    radiusSm: "6px",
    radiusMd: "8px",
    font: "'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
    blurPanel: "blur(18px) saturate(1.5)",
    shadowPanel: "0 34px 90px rgba(2, 6, 23, 0.66), inset 0 1px 0 rgba(255, 255, 255, 0.09)",
    motionFast: "140ms",
    motionBase: "220ms",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    actionPrimary: "#2563EB",
    actionPrimaryHover: "#3B82F6",
    actionNeutral: "#334155",
    actionNeutralHover: "#475569",
};

const PCC_PEN_SVG =
    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 20h9"/><path d="M16.6 3.4a2.1 2.1 0 0 1 3 3L7.2 18.8 3 20l1.2-4.2z"/></svg>';

function openCommentDialog(node, onSaved) {
    // 防止重复打开
    if (document.getElementById("zhiai-promptcombiner-overlay")) return;

    const comments = node.properties.prompt_comments || { prompt1: "", prompt2: "" };
    const T = PCC_TOKENS;

    const overlay = document.createElement("div");
    overlay.id = "zhiai-promptcombiner-overlay";
    overlay.style.cssText =
        "position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:10001;" +
        "display:flex;align-items:center;justify-content:center;" +
        "background:rgba(2, 6, 23, 0.62);backdrop-filter:blur(10px) saturate(1.25);-webkit-backdrop-filter:blur(10px) saturate(1.25);";

    const panel = document.createElement("div");
    panel.style.cssText =
        "display:flex;flex-direction:column;width:560px;max-width:92vw;max-height:85vh;overflow:hidden;" +
        "border-radius:12px;background:" + T.glassDeep + ";border:1px solid " + T.line + ";" +
        "box-shadow:" + T.shadowPanel + ";backdrop-filter:" + T.blurPanel + ";-webkit-backdrop-filter:" + T.blurPanel + ";" +
        "color:" + T.text + ";font-family:" + T.font + ";font-size:13.5px;" +
        "animation:pcc-dialog-in " + T.motionBase + " " + T.easing + ";";
    if (!document.getElementById("zhiai-promptcombiner-keyframes")) {
        const kf = document.createElement("style");
        kf.id = "zhiai-promptcombiner-keyframes";
        kf.textContent =
            "@keyframes pcc-dialog-in{from{opacity:0;transform:translateY(10px) scale(0.985)}to{opacity:1;transform:translateY(0) scale(1)}}";
        document.head.appendChild(kf);
    }

    // 头部：蓝色渐变 + 笔形图标（与 LM 工作室编辑器头部一致）
    const head = document.createElement("div");
    head.style.cssText =
        "display:flex;align-items:center;gap:11px;flex:0 0 auto;padding:15px 24px;" +
        "border-bottom:1px solid " + T.line + ";" +
        "background:linear-gradient(180deg, rgba(59, 130, 246, 0.22), rgba(59, 130, 246, 0));";
    const headIcon = document.createElement("div");
    headIcon.style.cssText =
        "display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;flex:0 0 auto;" +
        "border-radius:6px;color:" + T.primaryLight + ";" +
        "background:linear-gradient(135deg, rgba(59, 130, 246, 0.26), rgba(37, 99, 235, 0.12));" +
        "border:1px solid " + T.line + ";";
    headIcon.innerHTML = PCC_PEN_SVG;
    const title = document.createElement("div");
    title.textContent = "提示词组合 · 注释";
    title.style.cssText = "margin:0;font-size:19px;font-weight:600;line-height:1.35;letter-spacing:0.01em;color:" + T.textBright + ";";
    head.appendChild(headIcon);
    head.appendChild(title);
    panel.appendChild(head);

    // 主体
    const body = document.createElement("div");
    body.style.cssText = "display:flex;flex-direction:column;padding:20px 24px 22px;overflow-y:auto;";

    const hint = document.createElement("div");
    hint.textContent = "注释会作为悬停提示显示在对应提示词输入框上，并随工作流保存。";
    hint.style.cssText = "font-size:12px;color:" + T.textFaint + ";margin-bottom:14px;line-height:1.6;";
    body.appendChild(hint);

    const makeField = (labelText, key) => {
        const label = document.createElement("div");
        label.textContent = labelText;
        label.style.cssText = "font-size:12.5px;font-weight:500;letter-spacing:0.01em;color:" + T.textDim + ";margin-bottom:7px;";
        body.appendChild(label);

        const textarea = document.createElement("textarea");
        textarea.value = comments[key] || "";
        textarea.rows = 3;
        textarea.placeholder = labelText + "（留空则无提示）";
        textarea.style.cssText =
            "width:100%;box-sizing:border-box;padding:10px 12px;font-family:inherit;font-size:13.5px;line-height:1.7;" +
            "color:" + T.text + ";background:rgba(4, 11, 22, 0.66);border:1px solid " + T.line + ";" +
            "border-radius:" + T.radiusSm + ";outline:none;resize:vertical;margin-bottom:16px;" +
            "transition:border-color " + T.motionFast + " " + T.easing + ";";
        textarea.addEventListener("focus", () => { textarea.style.borderColor = T.primary; });
        textarea.addEventListener("blur", () => { textarea.style.borderColor = T.line; });
        body.appendChild(textarea);
        return textarea;
    };

    const ta1 = makeField("提示词1注释", "prompt1");
    const ta2 = makeField("提示词2注释", "prompt2");

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;justify-content:flex-end;gap:10px;margin-top:2px;";

    const mkBtn = (text, kind) => {
        const b = document.createElement("button");
        b.textContent = text;
        const base =
            "padding:10px 22px;font-family:inherit;font-size:13.5px;font-weight:600;border:none;" +
            "border-radius:" + T.radiusMd + ";cursor:pointer;color:#FFFFFF;" +
            "transition:background-color " + T.motionFast + " " + T.easing + ";";
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

    const saveBtn = mkBtn("保存", "primary");
    saveBtn.onclick = () => {
        node.properties.prompt_comments = {
            prompt1: ta1.value.trim(),
            prompt2: ta2.value.trim(),
        };
        if (typeof onSaved === "function") onSaved();
        close();
    };

    const cancelBtn = mkBtn("取消", "neutral");
    cancelBtn.onclick = close;

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
    ta1.focus();
}

app.registerExtension({
    name: "Zhi.AI.PromptCombiner",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "PromptCombiner") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            if (!this.properties) this.properties = {};
            if (!this.properties.prompt_comments) {
                this.properties.prompt_comments = { prompt1: "", prompt2: "" };
            }

            const getWidget = (name) => this.widgets?.find((w) => w.name === name);

            this.applyPromptComments = function () {
                const comments = this.properties.prompt_comments || {};
                for (const key of ["prompt1", "prompt2"]) {
                    const w = getWidget(key);
                    if (!w) continue;
                    const tip = comments[key] || "";
                    w.tooltip = tip || undefined;
                    if (w.options) w.options.tooltip = w.tooltip;
                }
                this._zhaiHasComments = !!(comments.prompt1 || comments.prompt2);
                this.syncCommentTitles?.();
            };

            // DOM 元素可能在节点创建后才渲染，每帧廉价比对一次确保 title 与注释一致
            const syncElTitle = (el, tip) => {
                if (!el) return;
                const current = el.getAttribute("title");
                if ((tip || null) !== current) {
                    if (tip) el.title = tip;
                    else el.removeAttribute("title");
                }
            };
            this.syncCommentTitles = function () {
                const comments = this.properties.prompt_comments || {};
                for (const key of ["prompt1", "prompt2"]) {
                    const w = getWidget(key);
                    if (!w) continue;
                    const tip = comments[key] || "";
                    // 兼容旧版 (inputEl) 与新版 Vue 前端 (element) 的 DOM 组件
                    syncElTitle(w.inputEl, tip);
                    syncElTitle(w.element, tip);
                }
            };

            this.applyPromptComments();

            return r;
        };

        // 标题栏绘制「✎ 注释」图标（帮助"?"图标左侧）
        const onDrawForeground = nodeType.prototype.onDrawForeground;
        nodeType.prototype.onDrawForeground = function (ctx) {
            const result = onDrawForeground ? onDrawForeground.apply(this, arguments) : undefined;
            if (this.flags?.collapsed) return result;
            this.syncCommentTitles?.();
            ctx.save();
            ctx.translate(commentIconLeft(this), commentIconTop());
            ctx.scale(ICON_SIZE / 32, ICON_SIZE / 32);
            drawCommentIcon(ctx, !!this._zhaiCommentHovered, !!this._zhaiHasComments);
            ctx.restore();
            return result;
        };

        const onMouseDown = nodeType.prototype.onMouseDown;
        nodeType.prototype.onMouseDown = function (e, localPos) {
            if (hitCommentIcon(this, localPos)) {
                hideTitleTip();
                openCommentDialog(this, () => {
                    this.applyPromptComments?.();
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
            // 内层（帮助图标）处理器已更新 _zhaiHelpHovered，这里做最终裁决
            const hovered = hitCommentIcon(this, localPos);
            if (hovered !== this._zhaiCommentHovered) {
                this._zhaiCommentHovered = hovered;
                this.setDirtyCanvas?.(true, true);
            }
            if (hovered) {
                titleTipHovered(true, "注释", e);
            } else if (!this._zhaiHelpHovered) {
                titleTipHovered(false, "注释", e);
            }
            return result;
        };

        const onMouseLeave = nodeType.prototype.onMouseLeave;
        nodeType.prototype.onMouseLeave = function () {
            const result = onMouseLeave ? onMouseLeave.apply(this, arguments) : undefined;
            if (this._zhaiCommentHovered) {
                this._zhaiCommentHovered = false;
                this.setDirtyCanvas?.(true, true);
            }
            hideTitleTip();
            return result;
        };

        // 加载工作流后恢复注释悬停提示
        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            const r = onConfigure ? onConfigure.apply(this, arguments) : undefined;
            if (!this.properties.prompt_comments) {
                this.properties.prompt_comments = { prompt1: "", prompt2: "" };
            }
            this.applyPromptComments?.();
            return r;
        };
    },
});
