import { app } from "../../scripts/app.js";
import { getLocale, zhNodeInfo } from "./zhiai_i18n.js";
import { drawNodeHelpButton, titleTipHovered, hideTitleTip } from "./node_title_icons.js";

const HELP_ICON_SIZE = 24;
const HELP_ICON_MARGIN = 4;
const POPUP_GAP = 10;
const EDGE_PAD = 8;

const CUSTOM_HELP_TYPES = new Set([
    "MultimediaAdvancedLoader",
    "ShowAny",
    "LMStudioNode",
    "ImageAspectRatio",
    "GroupSwitchManager",
    "ImageUnderstandingOnline",
    "TagSelector",
    "TextEditorWithContinue",
]);

const PACK_CATEGORY = /^zhi\.ai/i;
const EXTRA_PACK_TYPES = new Set(["AudioDuration"]);

const TEXT = {
    zh: {
        help: "节点帮助",
        overview: "说明",
        category: "分类",
        inputs: "输入",
        outputs: "输出",
        required: "必填",
        optional: "可选",
        none: "无",
        list: "列表",
        options: "可选项",
        default: "默认",
        more: "其余",
        items: "项",
    },
    en: {
        help: "Node help",
        overview: "Overview",
        category: "Category",
        inputs: "Inputs",
        outputs: "Outputs",
        required: "required",
        optional: "optional",
        none: "none",
        list: "list",
        options: "options",
        default: "default",
        more: "plus",
        items: "items",
    },
};

const STYLE = {
    title: "margin:0 0 4px 0;color:#93C5FD;font-size:18px;font-weight:600;letter-spacing:0.2px;",
    sub: "margin:0 0 12px 0;padding-bottom:10px;border-bottom:1px solid rgba(147,197,253,0.2);color:#7C93B0;font-size:12px;",
    heading: "margin:14px 0 6px 0;color:#60A5FA;font-size:14px;font-weight:600;letter-spacing:0.5px;",
    body: "margin:0;color:#E2E8F0;",
    row: "margin:3px 0;color:#E2E8F0;",
    name: "color:#F2FAFF;font-weight:600;",
    tag: "display:inline-block;margin-left:6px;padding:0 5px;border-radius:4px;border:1px solid rgba(147,197,253,0.28);color:#93A9C4;font-size:11px;",
    meta: "color:#93A9C4;",
    mono: "font-family:Consolas,'Courier New',monospace;color:#93C5FD;",
    empty: "margin:3px 0;color:#7C93B0;",
};

const MAX_OPTION_ITEMS = 8;

function t(key) {
    const locale = getLocale();
    return TEXT[locale]?.[key] ?? TEXT.en[key] ?? key;
}

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[ch]);
}

function shortText(value, limit) {
    const text = typeof value === "string" ? value : JSON.stringify(value);
    if (text === undefined || text === null) return "";
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function inputKind(types, spec) {
    if (Array.isArray(spec?.options)) return { options: spec.options };
    if (Array.isArray(types) && types.length > 1 && spec && Object.prototype.hasOwnProperty.call(spec, "default") && types.includes(spec.default)) {
        return { options: types };
    }
    return { socket: Array.isArray(types) ? types.map((v) => String(v)).join(" / ") : String(types ?? "") };
}

function kindLine(kind, spec) {
    const bits = [];
    if (kind.options) {
        const shown = kind.options.slice(0, MAX_OPTION_ITEMS).map((v) => esc(shortText(v, 24))).join(" · ");
        const rest = kind.options.length - MAX_OPTION_ITEMS;
        bits.push(`<span style="${STYLE.meta}">${t("options")}: ${shown}${rest > 0 ? ` … ${t("more")} ${rest} ${t("items")}` : ""}</span>`);
    } else if (kind.socket) {
        bits.push(`<span style="${STYLE.mono}">${esc(kind.socket)}</span>`);
    }
    if (spec && Object.prototype.hasOwnProperty.call(spec, "default") && !kind.options) {
        const dflt = shortText(spec.default, 40);
        if (dflt) bits.push(`<span style="${STYLE.meta}">${t("default")}: ${esc(dflt)}</span>`);
    }
    return bits.length ? ` <span style="${STYLE.meta}">—</span> ${bits.join(" · ")}` : "";
}

function inputSection(nodeData, zh) {
    const groups = [
        [t("required"), nodeData.input?.required],
        [t("optional"), nodeData.input?.optional],
    ];
    const rows = [];
    for (const [tag, entries] of groups) {
        for (const [name, def] of Object.entries(entries ?? {})) {
            const pair = Array.isArray(def) ? def : [def, undefined];
            const label = zh.inputLabel(name) || name;
            const hidden = pair[1]?.hidden === true || String(name).startsWith("_");
            if (hidden) continue;
            rows.push(`<p style="${STYLE.row}"><span style="${STYLE.name}">${esc(label)}</span><span style="${STYLE.tag}">${esc(tag)}</span>${kindLine(inputKind(pair[0], pair[1]), pair[1])}</p>`);
        }
    }
    return rows.length ? rows.join("") : `<p style="${STYLE.empty}">${t("none")}</p>`;
}

function outputSection(nodeData, zh) {
    const names = Array.isArray(nodeData.output_name) ? nodeData.output_name : [];
    const types = Array.isArray(nodeData.output) ? nodeData.output : [];
    const lists = Array.isArray(nodeData.output_is_list) ? nodeData.output_is_list : [];
    if (!types.length && !names.length) return `<p style="${STYLE.empty}">${t("none")}</p>`;
    return types.map((type, i) => {
        const raw = names[i] ?? type ?? "";
        const label = zh.outputLabel(raw) || raw;
        return `<p style="${STYLE.row}"><span style="${STYLE.name}">${esc(label)}</span>${lists[i] ? `<span style="${STYLE.tag}">${t("list")}</span>` : ""} <span style="${STYLE.mono}">${esc(String(type))}</span></p>`;
    }).join("");
}

export function buildHelpHtml(nodeData) {
    const locale = getLocale();
    const zh = zhNodeInfo(nodeData.name);
    const title = (locale === "zh" && zh.title) || nodeData.display_name || nodeData.name;
    const desc = (locale === "zh" && zh.description) || nodeData.description || "";
    const category = nodeData.category ? String(nodeData.category).split("/").map((p) => p.trim()).filter(Boolean).join(" / ") : "";
    return `<h3 style="${STYLE.title}">${esc(title)}</h3>
<p style="${STYLE.sub}">${esc(nodeData.name)}${category ? ` · ${esc(category)}` : ""}</p>
${desc ? `<h4 style="${STYLE.heading}">${t("overview")}</h4><p style="${STYLE.body}">${esc(desc)}</p>` : ""}
<h4 style="${STYLE.heading}">${t("inputs")}</h4>${inputSection(nodeData, zh)}
<h4 style="${STYLE.heading}">${t("outputs")}</h4>${outputSection(nodeData, zh)}`;
}

function createPopup(nodeData) {
    const popup = document.createElement("div");
    popup.className = "zhai-node-help";
    popup.style.cssText = [
        "background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
        "backdrop-filter: blur(16px)",
        "-webkit-backdrop-filter: blur(16px)",
        "position: fixed",
        "color: #E2E8F0",
        "font: 13px 'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
        "line-height: 1.6",
        "padding: 18px 22px 22px 22px",
        "border-radius: 10px",
        "border: 1px solid rgba(147, 197, 253, 0.3)",
        "z-index: 10000",
        "overflow: hidden",
        "width: 460px",
        "max-width: calc(100vw - 16px)",
        "box-shadow: 0 0 40px rgba(59, 130, 246, 0.15), 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    ].join(";") + ";";
    const scroller = document.createElement("div");
    scroller.style.cssText = "overflow-y:auto;max-height:min(60vh,540px);padding-right:8px;scrollbar-width:thin;scrollbar-color:rgba(147,197,253,0.3) transparent;";
    scroller.innerHTML = buildHelpHtml(nodeData);
    popup.appendChild(scroller);
    document.body.appendChild(popup);
    return popup;
}

const active = { node: null, popup: null, locale: null };

function closePopup() {
    active.popup?.remove();
    active.popup = null;
    active.node = null;
    active.locale = null;
}

function openPopup(node) {
    closePopup();
    active.node = node;
    active.locale = getLocale();
    active.popup = createPopup(node.__zhaiHelpData ?? { name: node.type });
}

function placePopup(popup, node, ctx) {
    const canvasEl = app.canvas?.canvas;
    if (!canvasEl || !ctx?.canvas) return;

    const rect = ctx.canvas.getBoundingClientRect();
    const scaleX = rect.width / ctx.canvas.width;
    const scaleY = rect.height / ctx.canvas.height;
    const transform = new DOMMatrix()
        .scaleSelf(scaleX, scaleY)
        .multiplySelf(ctx.getTransform())
        .translateSelf(node.size[0] * scaleX * Math.max(1.0, window.devicePixelRatio), 0)
        .translateSelf(POPUP_GAP, -32);

    const bcr = canvasEl.getBoundingClientRect();
    const w = popup.offsetWidth;
    const h = popup.offsetHeight;

    let left = transform.e + bcr.x;
    if (left + w > window.innerWidth - EDGE_PAD) left = Math.max(EDGE_PAD, window.innerWidth - w - EDGE_PAD);
    if (left < EDGE_PAD) left = EDGE_PAD;

    let top = transform.f + bcr.y;
    if (top + h > window.innerHeight - EDGE_PAD) top = Math.max(EDGE_PAD, window.innerHeight - h - EDGE_PAD);
    if (top < EDGE_PAD) top = EDGE_PAD;

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
}

function helpIconTop() {
    return -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - HELP_ICON_SIZE) / 2;
}

function helpIconLeft(node) {
    return node.size[0] - HELP_ICON_SIZE - HELP_ICON_MARGIN;
}

function hitHelp(node, localPos) {
    if (!localPos) return false;
    const left = helpIconLeft(node);
    const top = helpIconTop();
    return localPos[0] > left && localPos[0] < left + HELP_ICON_SIZE
        && localPos[1] > top && localPos[1] < top + HELP_ICON_SIZE;
}

function isPackNode(nodeData) {
    const name = nodeData?.name;
    if (!name || CUSTOM_HELP_TYPES.has(name)) return false;
    return PACK_CATEGORY.test(String(nodeData.category ?? "")) || EXTRA_PACK_TYPES.has(name);
}

function localFromEvent(node, event) {
    const el = app.canvas?.canvas;
    if (!el || !node) return null;
    const rect = el.getBoundingClientRect();
    const ds = app.canvas.ds ?? app.canvas;
    const scale = typeof ds?.scale === "number" && ds.scale ? ds.scale : 1;
    const offset = ds?.offset ?? [0, 0];
    return [
        (event.clientX - rect.left) / scale - (offset[0] ?? 0) - node.pos[0],
        (event.clientY - rect.top) / scale - (offset[1] ?? 0) - node.pos[1],
    ];
}

let outsideBound = false;
function bindOutsideClose() {
    if (outsideBound) return;
    outsideBound = true;
    const dismiss = (event) => {
        const node = active.node;
        if (!node || !active.popup) return;
        if (active.popup.contains(event.target)) return;
        if (event.type === "pointerdown" && hitHelp(node, localFromEvent(node, event))) return;
        closePopup();
        hideTitleTip();
        node._zhaiHelp = false;
        node.setDirtyCanvas?.(true, true);
    };
    window.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") dismiss(event);
    });
}

function patchNodeType(nodeType, nodeData) {
    nodeType.prototype.__zhaiHelpData = nodeData;

    const onDrawForeground = nodeType.prototype.onDrawForeground;
    nodeType.prototype.onDrawForeground = function (ctx) {
        const result = onDrawForeground?.apply(this, arguments);
        if (this.flags?.collapsed) return result;
        if (this._zhaiHelp) {
            if (!active.popup || active.node !== this) openPopup(this);
            if (active.locale !== getLocale()) {
                active.popup.querySelector("div").innerHTML = buildHelpHtml(this.__zhaiHelpData);
                active.locale = getLocale();
            }
            placePopup(active.popup, this, ctx);
        }
        const activeBtn = !!this._zhaiHelp || !!this._zhaiHelpHovered;
        ctx.save();
        ctx.translate(helpIconLeft(this), helpIconTop());
        ctx.scale(HELP_ICON_SIZE / 32, HELP_ICON_SIZE / 32);
        drawNodeHelpButton(ctx, activeBtn);
        ctx.restore();
        return result;
    };

    const onMouseDown = nodeType.prototype.onMouseDown;
    nodeType.prototype.onMouseDown = function (e, localPos) {
        const result = onMouseDown?.apply(this, arguments);
        if (hitHelp(this, localPos)) {
            hideTitleTip();
            if (this._zhaiHelp) {
                this._zhaiHelp = false;
                closePopup();
            } else {
                this._zhaiHelp = true;
                bindOutsideClose();
                openPopup(this);
            }
            this.setDirtyCanvas?.(true, true);
            return true;
        }
        return result;
    };

    const onMouseMove = nodeType.prototype.onMouseMove;
    nodeType.prototype.onMouseMove = function (e, localPos) {
        const result = onMouseMove?.apply(this, arguments);
        const hovered = hitHelp(this, localPos);
        if (hovered !== this._zhaiHelpHovered) {
            this._zhaiHelpHovered = hovered;
            this.setDirtyCanvas?.(true, true);
        }
        titleTipHovered(hovered, t("help"), e);
        return result;
    };

    const onMouseLeave = nodeType.prototype.onMouseLeave;
    nodeType.prototype.onMouseLeave = function () {
        const result = onMouseLeave?.apply(this, arguments);
        if (this._zhaiHelpHovered) {
            this._zhaiHelpHovered = false;
            this.setDirtyCanvas?.(true, true);
        }
        hideTitleTip();
        return result;
    };

    const onRemoved = nodeType.prototype.onRemoved;
    nodeType.prototype.onRemoved = function () {
        const result = onRemoved?.apply(this, arguments);
        if (active.node === this) closePopup();
        this._zhaiHelp = false;
        this._zhaiHelpHovered = false;
        return result;
    };
}

app.registerExtension({
    name: "ZhiaiNodes.NodeHelp",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (!isPackNode(nodeData)) return;
        patchNodeType(nodeType, nodeData);
    },
});