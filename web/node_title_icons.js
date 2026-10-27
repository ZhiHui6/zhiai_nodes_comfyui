import { app } from "/scripts/app.js";

export const NODE_TITLE_GLYPH = { idle: "#A1C4FA", active: "#D6E4FF" };

const BOX = 2;
const SIDE = 28;
const RADIUS = 8;
const STROKE = 2;
const STROKE_IDLE = "#76A4F6";
const STROKE_ACTIVE = "#A1C4FA";
const FILL_IDLE_TOP = "#3A486A";
const FILL_IDLE_BOTTOM = "#35405D";
const FILL_ACTIVE_TOP = "#455880";
const FILL_ACTIVE_BOTTOM = "#3E4C72";
const GLYPH_FONT = "bold 24px system-ui";
const GLYPH_X = 16;
const GLYPH_Y = 19;
const GEAR_CENTER = 16;
const GEAR_SCALE = 0.75;
const GEAR_VIEW = 12;
const GEAR_BODY_D = "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z";
const ACTION_CENTER = 16;
const ACTION_VIEW = 12;
const ACTION_SCALE = 0.75;
const ACTION_PATH_DATA = {
    restore: "M1 4 1 10 7 10 M23 4 23 10 17 10 M20.49 15a9 9 0 1 1-2.12-9.36L23 10",
    clear: "M20 4 4 20 M4 4 20 20",
};

export const NODE_TITLE_ACTION_TINTS = {
    restore: {
        top: "#2F6B4B",
        bottom: "#28603F",
        topActive: "#3A7D59",
        bottomActive: "#31704B",
        stroke: "#4ADE80",
        strokeActive: "#86EFAC",
        glyph: "#BBF7D0",
        glyphActive: "#DCFCE7",
    },
    clear: {
        top: "#6E3139",
        bottom: "#602B33",
        topActive: "#823C45",
        bottomActive: "#73343D",
        stroke: "#F87171",
        strokeActive: "#FCA5A5",
        glyph: "#FECACA",
        glyphActive: "#FEE2E2",
    },
    template: {
        top: "#414B80",
        bottom: "#3A4374",
        topActive: "#4E5994",
        bottomActive: "#454F86",
        stroke: "#8FA2F2",
        strokeActive: "#B4C2F8",
        glyph: "#D5DDFF",
        glyphActive: "#EAEEFF",
    },
};

const CHIP_DEFAULT = {
    top: FILL_IDLE_TOP,
    bottom: FILL_IDLE_BOTTOM,
    topActive: FILL_ACTIVE_TOP,
    bottomActive: FILL_ACTIVE_BOTTOM,
    stroke: STROKE_IDLE,
    strokeActive: STROKE_ACTIVE,
};

export function drawNodeTitleChip(ctx, active, tint) {
    const palette = tint || CHIP_DEFAULT;
    const grad = ctx.createLinearGradient(BOX, BOX, BOX + SIDE, BOX + SIDE);
    grad.addColorStop(0, active ? palette.topActive : palette.top);
    grad.addColorStop(1, active ? palette.bottomActive : palette.bottom);
    ctx.beginPath();
    ctx.roundRect(BOX, BOX, SIDE, SIDE, RADIUS);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = active ? palette.strokeActive : palette.stroke;
    ctx.lineWidth = STROKE;
    ctx.stroke();
}

export function drawNodeHelpButton(ctx, active) {
    drawNodeTitleChip(ctx, active);
    ctx.font = GLYPH_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = active ? NODE_TITLE_GLYPH.active : NODE_TITLE_GLYPH.idle;
    ctx.fillText("?", GLYPH_X, GLYPH_Y);
}

let _gearPath = null;

function gearPath() {
    if (_gearPath) return _gearPath;
    const path = new Path2D();
    path.arc(GEAR_VIEW, GEAR_VIEW, 3, 0, Math.PI * 2);
    path.addPath(new Path2D(GEAR_BODY_D));
    _gearPath = path;
    return path;
}

export function drawNodeSettingsButton(ctx, active) {
    drawNodeTitleChip(ctx, active);
    ctx.save();
    ctx.translate(GEAR_CENTER, GEAR_CENTER);
    ctx.scale(GEAR_SCALE, GEAR_SCALE);
    ctx.translate(-GEAR_VIEW, -GEAR_VIEW);
    ctx.strokeStyle = active ? NODE_TITLE_GLYPH.active : NODE_TITLE_GLYPH.idle;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = STROKE / GEAR_SCALE;
    ctx.stroke(gearPath());
    ctx.restore();
}

const _actionPaths = new Map();

function actionPath(kind) {
    if (_actionPaths.has(kind)) return _actionPaths.get(kind);
    let path;
    if (kind === "template") {
        path = new Path2D();
        path.roundRect(3, 3, 18, 18, 2);
        path.moveTo(3, 9);
        path.lineTo(21, 9);
        path.moveTo(9, 21);
        path.lineTo(9, 9);
    } else {
        path = new Path2D(ACTION_PATH_DATA[kind] || "");
    }
    _actionPaths.set(kind, path);
    return path;
}

export function drawNodeTitleAction(ctx, kind, active) {
    const tint = NODE_TITLE_ACTION_TINTS[kind];
    if (!tint) return;
    drawNodeTitleChip(ctx, active, tint);
    ctx.save();
    ctx.translate(ACTION_CENTER, ACTION_CENTER);
    ctx.scale(ACTION_SCALE, ACTION_SCALE);
    ctx.translate(-ACTION_VIEW, -ACTION_VIEW);
    ctx.strokeStyle = active ? tint.glyphActive : tint.glyph;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = STROKE / ACTION_SCALE;
    ctx.stroke(actionPath(kind));
    ctx.restore();
}

// ===== 标题栏图标悬停提示（画布图标无法使用 DOM title，使用共享浮层） =====

const TIP_STYLE =
    "position:fixed;z-index:10060;box-sizing:border-box;width:max-content;max-width:320px;" +
    "padding:6px 10px;border-radius:6px;background:rgba(5, 11, 22, 0.92);" +
    "border:1px solid rgba(147, 197, 253, 0.42);box-shadow:0 4px 14px rgba(2, 6, 23, 0.35);" +
    "backdrop-filter:blur(10px) saturate(1.3);-webkit-backdrop-filter:blur(10px) saturate(1.3);" +
    "color:#F2FAFF;font-family:'Microsoft YaHei','微软雅黑','PingFang SC','Hiragino Sans GB',sans-serif;" +
    "font-size:12px;line-height:1.5;letter-spacing:0.01em;overflow-wrap:anywhere;pointer-events:none;" +
    "opacity:0;transform:translateY(3px);" +
    "transition:opacity 140ms cubic-bezier(0.22, 1, 0.36, 1),transform 140ms cubic-bezier(0.22, 1, 0.36, 1);";

let _titleTipEl = null;
let _titleTipText = null;
// 记录最近一次"悬停显示"所属的鼠标事件：同一节点的多个标题图标各自独立处理
// 鼠标事件（如帮助"?"与注释"✎"），未悬停的一方会请求隐藏——若该请求来自
// 同一次鼠标事件，则说明另一方刚刚显示过提示，不应取消。
let _lastHoverEvent = null;

// 前端会在鼠标悬停节点标题栏时弹出"节点描述"浮层（NodeTooltip 组件，class=node-tooltip），
// 会盖住我们的图标提示。我们的图标提示显示期间临时抑制它。
const NODE_TIP_SUPPRESS_STYLE_ID = "zhiai-suppress-node-tooltip";
function setNodeTooltipSuppressed(on) {
    let el = document.getElementById(NODE_TIP_SUPPRESS_STYLE_ID);
    if (on && !el) {
        el = document.createElement("style");
        el.id = NODE_TIP_SUPPRESS_STYLE_ID;
        el.textContent = ".node-tooltip{display:none !important;}";
        document.head.appendChild(el);
    } else if (!on && el) {
        el.remove();
    }
}

// 全局永久禁用悬停节点时显示的"节点描述"浮层（ComfyUI NodeTooltip，class=node-tooltip）
//对所有节点生效，与下方临时抑制逻辑相互独立、永不移除
const NODE_TIP_DISABLE_STYLE_ID = "zhiai-disable-node-tooltip";
if (typeof document !== "undefined" && !document.getElementById(NODE_TIP_DISABLE_STYLE_ID)) {
    const disableEl = document.createElement("style");
    disableEl.id = NODE_TIP_DISABLE_STYLE_ID;
    disableEl.textContent = ".node-tooltip{display:none !important;}";
    document.head.appendChild(disableEl);
}

export function hideTitleTip() {
    if (_tipTimer) {
        clearTimeout(_tipTimer);
        _tipTimer = null;
    }
    if (_titleTipEl) {
        _titleTipEl.remove();
        _titleTipEl = null;
        _titleTipText = null;
    }
    _lastHoverEvent = null;
    setNodeTooltipSuppressed(false);
}

// 悬停提示统一延迟 800ms
const TIP_DELAY_DEFAULT = 800;
function getTipDelay() {
    return TIP_DELAY_DEFAULT;
}

let _tipTimer = null;
function armTitleTip(text, event) {
    if (_tipTimer) clearTimeout(_tipTimer);
    const x = event.clientX;
    const y = event.clientY;
    _tipTimer = window.setTimeout(() => {
        _tipTimer = null;
        showTitleTip(text, x, y);
    }, getTipDelay());
}

export function showTitleTip(text, clientX, clientY) {
    if (!text) {
        hideTitleTip();
        return;
    }
    setNodeTooltipSuppressed(true);
    // 常规 tooltip 行为：仅在实际创建时定位一次，悬停期间不跟随鼠标
    if (_titleTipEl && _titleTipEl.isConnected) {
        if (_titleTipText !== text) {
            _titleTipEl.textContent = text;
            _titleTipText = text;
        }
        return;
    }
    hideTitleTip();
    _titleTipEl = document.createElement("div");
    _titleTipEl.style.cssText = TIP_STYLE;
    _titleTipEl.textContent = text;
    _titleTipText = text;
    document.body.appendChild(_titleTipEl);
    const w = _titleTipEl.offsetWidth || 80;
    const h = _titleTipEl.offsetHeight || 28;
    // 弹出在按钮正上方并完全避开按钮：光标处于 24px 的按钮内，
    // 额外预留 30px 净空保证不压住按钮；顶部放不下时退回下方
    const x = Math.min(Math.max(8, clientX - w / 2), window.innerWidth - w - 8);
    let y = clientY - h - 30;
    if (y < 8) y = Math.min(clientY + 20, window.innerHeight - h - 8);
    _titleTipEl.style.left = x + "px";
    _titleTipEl.style.top = y + "px";
    requestAnimationFrame(() => {
        if (_titleTipEl) {
            _titleTipEl.style.opacity = "1";
            _titleTipEl.style.transform = "translateY(0)";
        }
    });
}

// 悬停状态变化时的便捷入口：
// - true：按标准延迟（鼠标在图标上停稳后）显示提示，移动会重新计时
// - false：请求取消/隐藏（同一事件内其他图标已登记悬停时忽略）
export function titleTipHovered(hovered, text, event) {
    if (hovered && event && typeof event.clientX === "number") {
        _lastHoverEvent = event;
        armTitleTip(text, event);
        return;
    }
    if (event && event === _lastHoverEvent) {
        // 本次鼠标移动中已有其他标题图标登记悬停，保持现状
        return;
    }
    hideTitleTip();
}
