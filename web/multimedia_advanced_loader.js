import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { applyNode, getLocale } from "./zhiai_i18n.js";
import { drawNodeHelpButton, titleTipHovered, hideTitleTip } from "./node_title_icons.js";
import { attachMiddleDragPan, watchNodeModeVisual } from "./panel_kit.js";

const NODE_CLASS = "MultimediaAdvancedLoader";
const INTERNAL_WIDGETS = ["media_files", "output_files", "output_mode", "load_mode"];
const OUTPUT_WIDGET = "output_files";
const MODE_WIDGET = "output_mode";
const LOAD_WIDGET = "load_mode";
const BUNDLE_OUTPUT = "media_bundle";
const IMAGES_OUTPUT = "images";
const IMAGE_TYPE = "IMAGE";
const MEDIA_BUNDLE_TYPE = "MINIMAX_H3_MEDIA_BUNDLE";
const LIST_SLOT_SHAPE = globalThis.LiteGraph?.SlotShape?.Grid ?? 6;
const LOAD_MODES = ["image", "media"];
const MEDIA_KINDS = ["image", "audio", "video"];
const IMAGE_KINDS = ["image"];
const FILTER_KEYS = ["all", "image", "audio", "video"];
const WIDGET_DEFAULTS = { media_files: "[]", output_files: "[]", output_mode: "select", load_mode: "media" };
const LOADER_MIN_WIDTH = 333;
const THUMB_MIN_SIZE = 80;
const THUMB_MAX_SIZE = 400;
const THUMB_DEFAULT_SIZE = 200;
const LOADER_MIN_HEIGHT = 333;
const DRAG_MIME = "application/x-zhiai-media-loader-index";
const BATCH_PER_FRAME = 12;

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "jfif", "webp", "avif", "bmp", "tif", "tiff", "gif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "mkv", "avi", "m4v", "mpg", "mpeg", "ts", "m2ts", "flv", "wmv"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "flac", "ogg", "oga", "m4a", "aac", "opus", "wma", "aiff", "aif"]);

const MEDIA_ACCEPT = "image/*,video/*,audio/*,.jfif,.avif,.mkv,.ts,.m2ts,.flv,.wmv,.aiff,.aif,.opus";
const IMAGE_ACCEPT = "image/*,.jfif,.avif,.bmp,.tif,.tiff,.gif,.webp,.png,.jpg,.jpeg";

const i18n = {
    zh: {
        load: "载入媒体",
        clear: "清空",
        linkDropped: "输出端口类型已变化，不兼容的连线已断开",
        clearConfirm: "确定清空已载入的全部媒体？此操作不可撤销。",
        confirm: "确定",
        cancel: "取消",
        thumbSize: "缩略图尺寸",
        maxThumbSize: "最大化缩略图",
        minThumbSize: "最小化缩略图",
        restoreThumbSize: "还原缩略图大小",
        uploading: "正在导入…",
        uploadFailed: "导入失败",
        uploadPartial: "部分文件导入失败",
        thumbFailed: "无法预览",
        zoomPreview: "放大预览",
        playPreview: "播放视频",
        closePreview: "关闭预览",
        empty: "尚未载入媒体",
        emptyHint: "点击「载入媒体」、拖入文件或 Ctrl+V 粘贴",
        kindsHint: "支持 图片 / 视频 / 音频",
        kindsHintImage: "支持 图片",
        filterAll: "全部",
        filterEmpty: "该分类暂无媒体",
        deleteItem: "从列表中移除",
        loaded: "项已载入",
        selected: "项已选中",
        loadModeLabel: "载入模式",
        loadModeImage: "仅图片",
        loadModeMedia: "默认",
        loadModeImageHint: "只载入并显示图片，隐藏音频 / 视频，输出图像端口",
        loadModeMediaHint: "载入图片 / 视频 / 音频，输出 H3 媒体包端口",
        skipNonImage: "已跳过非图片文件",
        modeLabel: "输出模式",
        modeSelect: "点击选中",
        modeNumbered: "智能编号",
        modeSelectHint: "仅输出选中项",
        modeNumberedHint: "全部按编号顺序输出",
        kindImage: "图片",
        kindVideo: "视频",
        kindAudio: "音频",
        totalSize: "合计",
        segMode: "模式",
        segHint: "提示",
        play: "播放",
        pause: "暂停",
        helpTitle: "多媒体加载器",
        helpDescription: "在一个节点内载入图片、视频与音频，以缩略图网格统一管理，并按需输出图像列表或 MiniMax H3 媒体包。",
        helpFeatures: "功能",
        helpFeature1: "缩略图网格：拖拽排序、类型筛选、缩略图尺寸调节",
        helpFeature2: "两种输出模式：点击选中 / 智能编号",
        helpFeature3: "混类型导入：一次可选择多个不同类型的文件",
        helpFeature4: "图片缩略图左上角放大预览、视频缩略图左上角播放，悬停右上角可移除条目",
        helpFeature5: "载入模式：默认输出 MiniMax H3 媒体包端口；仅图片隐藏音频 / 视频并只输出图像端口",
        helpUsage: "使用",
        helpUsage1: "点击筛选栏右侧「载入媒体」，或拖入文件、Ctrl+V 粘贴",
        helpUsage2: "点击缩略图选中，Ctrl / Shift 多选，Delete 移除所选",
        helpUsage3: "「智能编号」模式按 图片 / 视频 / 音频 分别编号并全部输出",
        helpInput: "输入",
        helpInputDesc: "无外部输入，媒体全部在节点面板内载入与管理。",
        helpOutput: "输出",
        helpOutputDesc: "单个输出端口随载入模式切换：默认为 media_bundle（MINIMAX_H3_MEDIA_BUNDLE），仅图片时为 images（IMAGE 列表）。",
    },
    en: {
        load: "Load media",
        clear: "Clear",
        linkDropped: "Output port type changed; incompatible links were dropped",
        clearConfirm: "Clear all loaded media? This cannot be undone.",
        confirm: "Confirm",
        cancel: "Cancel",
        thumbSize: "Size",
        maxThumbSize: "Maximize thumbnails",
        minThumbSize: "Minimize thumbnails",
        restoreThumbSize: "Restore thumbnail size",
        uploading: "Importing…",
        uploadFailed: "Import failed",
        uploadPartial: "Some files failed to import",
        thumbFailed: "No preview",
        zoomPreview: "Zoom preview",
        playPreview: "Play video",
        closePreview: "Close preview",
        empty: "No media loaded",
        emptyHint: "Click Load media, drop files or press Ctrl+V",
        kindsHint: "Images / videos / audio supported",
        kindsHintImage: "Images supported",
        filterAll: "All",
        filterEmpty: "No media in this category",
        deleteItem: "Remove from list",
        loaded: "items loaded",
        selected: "selected",
        loadModeLabel: "Load",
        loadModeImage: "Images Only",
        loadModeMedia: "Default",
        loadModeImageHint: "Loads and shows images only, hiding audio / video; outputs the image port",
        loadModeMediaHint: "Loads images / videos / audio; outputs the H3 media bundle port",
        skipNonImage: "Skipped non-image files",
        modeLabel: "Output",
        modeSelect: "Select",
        modeNumbered: "Numbered",
        modeSelectHint: "Output selected items only",
        modeNumberedHint: "Output all items in numbered order",
        kindImage: "Images",
        kindVideo: "Videos",
        kindAudio: "Audio",
        totalSize: "Total",
        segMode: "Mode",
        segHint: "Hint",
        play: "Play",
        pause: "Pause",
        helpTitle: "Multimedia Loader",
        helpDescription: "Load images, videos and audio in a single node, manage them in one thumbnail grid, and output an image list or a MiniMax H3 media bundle.",
        helpFeatures: "Features",
        helpFeature1: "Thumbnail grid: drag to reorder, type filters, adjustable thumbnail size",
        helpFeature2: "Two output modes: Click select / Smart numbering",
        helpFeature3: "Mixed import: pick several files of different types at once",
        helpFeature4: "Zoom a picture from its top-left corner, play a video from its top-left corner, hover its top-right corner to remove it",
        helpFeature5: "Load mode: Default outputs the MiniMax H3 media bundle port; Images Only hides audio / video and outputs the image port",
        helpUsage: "Usage",
        helpUsage1: "Click Load media at the right of the filter bar, or drop files / press Ctrl+V",
        helpUsage2: "Click a thumbnail to select, Ctrl / Shift to multi-select, Delete to remove",
        helpUsage3: "Smart numbering outputs every item numbered per image / video / audio",
        helpInput: "Input",
        helpInputDesc: "No external input; media is loaded and managed inside the node panel.",
        helpOutput: "Output",
        helpOutputDesc: "The single output follows the load mode: media_bundle (MINIMAX_H3_MEDIA_BUNDLE) by default, images (IMAGE list) in Images Only.",
    },
};

function $t(key) {
    const locale = getLocale();
    return i18n[locale]?.[key] ?? i18n.en[key] ?? key;
}

const UI_STATE_STORAGE_KEY = "zhiai_media_loader_ui_state";

function readUiState() {
    try {
        const raw = localStorage.getItem(UI_STATE_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
        return {};
    }
}

function rememberUiState(patch) {
    const state = readUiState();
    let changed = false;
    for (const [key, value] of Object.entries(patch)) {
        if (state[key] === value) continue;
        state[key] = value;
        changed = true;
    }
    if (!changed) return state;
    try {
        localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
    }
    return state;
}

function storedUiValue(key) {
    return readUiState()[key];
}

function clampThumbSize(value) {
    const size = Number(value);
    if (!Number.isFinite(size)) return THUMB_DEFAULT_SIZE;
    return Math.max(THUMB_MIN_SIZE, Math.min(THUMB_MAX_SIZE, Math.round(size)));
}

const KIND_LABEL_KEYS = { image: "kindImage", audio: "kindAudio", video: "kindVideo" };

const FOLDER_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H9l2 2h7.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/><path d="M3 9h18"/></svg>';
const CLEAR_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 4h4"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10.5 11v6"/><path d="M13.5 11v6"/></svg>';
const MIN_ICON = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h5V3"/><path d="M3 3l5 5"/><path d="M16 3v5h5"/><path d="M21 3l-5 5"/><path d="M3 16h5v5"/><path d="M3 21l5-5"/><path d="M21 16h-5v5"/><path d="M21 21l-5-5"/></svg>';
const MAX_ICON = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5"/><path d="M3 3l7 7"/><path d="M16 3h5v5"/><path d="M21 3l-7 7"/><path d="M8 21H3v-5"/><path d="M3 21l7-7"/><path d="M16 21h5v-5"/><path d="M21 21l-7-7"/></svg>';
const EMPTY_ICON = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.2" y="6.4" width="14" height="14" rx="2.4"/><path d="m3.2 16.4 4.6-4.6 4.2 4.2"/><circle cx="12.4" cy="10.8" r="1.35"/><path d="M20.8 8.6v9.2a2.4 2.4 0 0 1-2.4 2.4H9"/></svg>';
const PK_PLAY_D = "M12.6 10.3 L15.8 12 L12.6 13.7 Z";
const PK_PAUSE_D = "M12.7 10.2 L12.7 13.8 M15.3 10.2 L15.3 13.8";
const AUDIO_ICON = `<svg viewBox="0 0 28 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="8.6" x2="4" y2="15.4"/><line x1="9" y1="6.4" x2="9" y2="17.6"/><line x1="14" y1="4" x2="14" y2="20"/><line x1="19" y1="6.4" x2="19" y2="17.6"/><line x1="24" y1="8.6" x2="24" y2="15.4"/><g class="zml-pk zml-pk-play"><path class="zml-pk-halo" d="${PK_PLAY_D}"/><path class="zml-pk-glyph" d="${PK_PLAY_D}"/></g><g class="zml-pk zml-pk-pause"><path class="zml-pk-halo" d="${PK_PAUSE_D}"/><path class="zml-pk-glyph" d="${PK_PAUSE_D}"/></g></svg>`;
const DELETE_ICON = '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><line x1="6.6" y1="6.6" x2="17.4" y2="17.4"/><line x1="17.4" y1="6.6" x2="6.6" y2="17.4"/></svg>';
const ZOOM_ICON = '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 20.5 20.5"/><path d="M10.5 7.8v5.4"/><path d="M7.8 10.5h5.4"/></svg>';
const PLAY_ICON = '<svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true"><path d="M8.4 5.6 18.6 12 8.4 18.4 Z" fill="currentColor"/></svg>';

const localeCache = new WeakMap();
const audioState = { key: "", button: null, el: null };

function nodeClass(node) {
    return node?.comfyClass || node?.type || "";
}

function findWidget(node, name) {
    return (node.widgets || []).find((widget) => widget?.name === name);
}

function writeWidgetValue(widget, value) {
    if (!widget) return;
    widget.value = value;
    if (widget._state) widget._state.value = value;
    widget.callback?.(value);
}

function writeWidgetValueSilently(widget, value) {
    if (!widget) return;
    widget.value = value;
    if (widget._state) widget._state.value = value;
}

function markGraphChanged(node) {
    node?.graph?.change?.();
    node?.graph?.setDirtyCanvas?.(true, true);
}

function ensureInternalWidgets(node) {
    if (!node.widgets) node.widgets = [];
    for (const name of INTERNAL_WIDGETS) {
        let widget = findWidget(node, name);
        if (!widget && typeof node.addWidget === "function") {
            widget = node.addWidget("text", name, WIDGET_DEFAULTS[name], () => {});
        }
        if (!widget) continue;
        if (widget.value == null || widget.value === "") widget.value = WIDGET_DEFAULTS[name];
        widget.serialize = true;
    }
    hideInternalWidgets(node);
}

function hideInternalWidgets(node) {
    for (const widget of node.widgets || []) {
        if (!INTERNAL_WIDGETS.includes(widget.name)) continue;
        widget.options = widget.options || {};
        widget.options.hidden = true;
        widget.options.collapsed = true;
        widget.type = "converted-widget";
        widget.hidden = true;
        widget.serialize = true;
        widget.computeSize = () => [0, -4];
        widget.draw = () => {};
    }
}

function parseRefs(node) {
    const widget = findWidget(node, "media_files");
    if (!widget?.value) return [];
    try {
        const refs = JSON.parse(widget.value);
        return Array.isArray(refs) ? refs : [];
    } catch (_) {
        return [];
    }
}

function mediaKey(ref) {
    return [ref?.kind || "image", ref?.type || "input", ref?.subfolder || "", ref?.name || ""].join("/");
}

function outputMode(node) {
    const fromProperty = String(node.properties?.zhiai_media_loader_output_mode || "").trim().toLowerCase();
    if (fromProperty === "numbered" || fromProperty === "select") return fromProperty;
    const remembered = String(storedUiValue("output_mode") ?? "").trim().toLowerCase();
    if (remembered === "numbered" || remembered === "select") return remembered;
    const value = String(findWidget(node, MODE_WIDGET)?.value ?? "").trim().toLowerCase();
    return value === "numbered" ? "numbered" : "select";
}

function setOutputMode(node, mode) {
    const normalized = mode === "numbered" ? "numbered" : "select";
    writeWidgetValue(findWidget(node, MODE_WIDGET), normalized);
    node.properties = node.properties || {};
    node.properties.zhiai_media_loader_output_mode = normalized;
    rememberUiState({ output_mode: normalized });
    renderLoader(node);
    markGraphChanged(node);
}

function loadMode(node) {
    const fromProperty = String(node.properties?.zhiai_media_loader_load_mode || "").trim().toLowerCase();
    if (LOAD_MODES.includes(fromProperty)) return fromProperty;
    const remembered = String(storedUiValue("load_mode") ?? "").trim().toLowerCase();
    if (LOAD_MODES.includes(remembered)) return remembered;
    const value = String(findWidget(node, LOAD_WIDGET)?.value ?? "").trim().toLowerCase();
    return LOAD_MODES.includes(value) ? value : "media";
}

function rememberLoadMode(node, mode) {
    const normalized = LOAD_MODES.includes(mode) ? mode : "media";
    node.properties = node.properties || {};
    node.properties.zhiai_media_loader_load_mode = normalized;
    const widget = findWidget(node, LOAD_WIDGET);
    if (widget && widget.value !== normalized) {
        widget.value = normalized;
        if (widget._state) widget._state.value = normalized;
    }
    rememberUiState({ load_mode: normalized });
    return normalized;
}

function refIsImage(ref) {
    return (ref?.kind || "image") === "image";
}

function visibleKinds(node) {
    return loadMode(node) === "image" ? IMAGE_KINDS : MEDIA_KINDS;
}

function refIsVisible(kinds, ref) {
    return kinds.includes(ref?.kind || "image");
}

function ensureToastKeyframes() {
    if (document.getElementById("zhml-toast-keyframes")) return;
    const style = document.createElement("style");
    style.id = "zhml-toast-keyframes";
    style.textContent = `@keyframes zhml-toast-in {
        from { opacity: 0; transform: translateY(-12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }`;
    document.head.appendChild(style);
}

function showToast(message, type = "info") {
    ensureToastKeyframes();
    let host = document.getElementById("lms-toast-host");
    if (!host) {
        host = document.createElement("div");
        host.id = "lms-toast-host";
        host.style.cssText = `
            position: fixed;
            top: 72px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            z-index: 10003;
            pointer-events: none;
            max-width: min(560px, 88vw);
        `;
        document.body.appendChild(host);
    }
    const accent = type === "warning" ? "#F59E0B" : type === "error" ? "#EF4444" : "#2563EB";
    const toast = document.createElement("div");
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        box-sizing: border-box;
        background: rgba(15, 23, 42, 0.86);
        backdrop-filter: blur(14px) saturate(1.2);
        -webkit-backdrop-filter: blur(14px) saturate(1.2);
        color: #E2E8F0;
        padding: 14px 24px;
        border: 1px solid ${accent}66;
        border-radius: 14px;
        font-size: 13.5px;
        font-weight: 500;
        letter-spacing: 0.01em;
        min-width: 200px;
        box-shadow: 0 20px 48px rgba(2, 6, 23, 0.45), 0 0 0 1px ${accent}22;
        animation: zhml-toast-in 0.3s ease;
        pointer-events: auto;
    `;
    const dot = document.createElement("span");
    dot.style.cssText = "flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:"
        + accent + ";box-shadow:0 0 10px " + accent + "99;";
    const textEl = document.createElement("span");
    textEl.textContent = message;
    toast.append(dot, textEl);
    host.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "zhml-toast-in 0.3s ease reverse";
        setTimeout(() => {
            toast.remove();
            if (host && !host.childElementCount) host.remove();
        }, 300);
    }, 10000);
}

function dropIncompatibleOutputLinks(node) {
    const slot = node.outputs?.[0];
    if (!slot || !Array.isArray(slot.links) || !slot.links.length) return false;
    const graph = node.graph;
    const victims = [];
    for (const linkId of [...slot.links]) {
        const link = graph?.links?.[linkId];
        const target = link ? graph.getNodeById(link.target_id) : null;
        const input = target?.inputs?.[link.target_slot];
        if (!input || input.type == null || input.type === "*" || input.type === slot.type) continue;
        victims.push(target);
    }
    if (!victims.length) return false;
    graph?.beforeChange?.();
    for (const target of victims) node.disconnectOutput?.(0, target);
    graph?.afterChange?.(true);
    showToast($t("linkDropped"), "warning");
    return true;
}

function syncLoadModeSockets(node) {
    if (!Array.isArray(node.outputs)) return false;
    const imageOnly = loadMode(node) === "image";
    const name = imageOnly ? IMAGES_OUTPUT : BUNDLE_OUTPUT;
    const type = imageOnly ? IMAGE_TYPE : MEDIA_BUNDLE_TYPE;
    const shape = imageOnly ? LIST_SLOT_SHAPE : null;
    for (let index = node.outputs.length - 1; index >= 1; index -= 1) {
        node.removeOutput(index);
    }
    const slot = node.outputs[0];
    if (!slot) {
        node.addOutput(name, type, imageOnly ? { shape: LIST_SLOT_SHAPE } : {});
        return true;
    }
    let changed = false;
    if (slot.name !== name) {
        slot.name = name;
        changed = true;
    }
    if (slot.label !== name) {
        slot.label = name;
        changed = true;
    }
    if ("localized_name" in slot && slot.localized_name !== name) {
        slot.localized_name = name;
        changed = true;
    }
    if (slot.type !== type) {
        slot.type = type;
        changed = true;
    }
    if ((slot.shape ?? null) !== shape) {
        slot.shape = shape;
        changed = true;
    }
    if (dropIncompatibleOutputLinks(node)) changed = true;
    return changed;
}

function setLoadMode(node, mode) {
    const widget = findWidget(node, LOAD_WIDGET);
    writeWidgetValue(widget, rememberLoadMode(node, mode));
    if (syncLoadModeSockets(node)) applyNode(node);
    renderLoader(node);
    markGraphChanged(node);
    app.canvas?.setDirty?.(true, true);
}

function syncLoaderState(node) {
    ensureInternalWidgets(node);
    node.properties = node.properties || {};

    const loadValue = loadMode(node);
    rememberLoadMode(node, loadValue);

    const outputValue = outputMode(node);
    node.properties.zhiai_media_loader_output_mode = outputValue;
    writeWidgetValueSilently(findWidget(node, MODE_WIDGET), outputValue);

    node.properties.zhiai_media_loader_thumb_size = thumbSize(node);

    if (syncLoadModeSockets(node)) applyNode(node);
    return true;
}

function mediaFilter(node) {
    const value = String(node.properties?.zhiai_media_loader_filter || "").trim().toLowerCase();
    return FILTER_KEYS.includes(value) ? value : "all";
}

function setMediaFilter(node, value) {
    node.properties = node.properties || {};
    node.properties.zhiai_media_loader_filter = FILTER_KEYS.includes(value) ? value : "all";
    renderLoader(node);
    node.graph?.setDirtyCanvas?.(true, true);
}

function setMediaAndOutputRefs(node, mediaRefs, outputRefs = [], { markGraph = true } = {}) {
    ensureInternalWidgets(node);
    writeWidgetValue(findWidget(node, "media_files"), JSON.stringify(mediaRefs));
    writeWidgetValue(findWidget(node, OUTPUT_WIDGET), JSON.stringify(outputRefs));
    node.properties = node.properties || {};
    node.properties.zhiai_media_loader_output_keys = outputRefs.map(mediaKey);
    renderLoader(node);
    if (markGraph) node.graph?.change?.();
    node.graph?.setDirtyCanvas?.(true, true);
}

function clearStoredOutputRefs(node) {
    const output = findWidget(node, OUTPUT_WIDGET);
    if (!output || output.value === "[]") return;
    writeWidgetValue(output, "[]");
    node.properties = node.properties || {};
    node.properties.zhiai_media_loader_output_keys = [];
}

function selectedSet(node) {
    const refs = parseRefs(node);
    const kinds = visibleKinds(node);
    const current = node._zhmlSelected instanceof Set ? node._zhmlSelected : new Set();
    return new Set(
        [...current].filter((index) => Number.isInteger(index) && index >= 0 && index < refs.length
            && refIsVisible(kinds, refs[index])),
    );
}

function selectedRefs(node) {
    const refs = parseRefs(node);
    return [...selectedSet(node)]
        .sort((a, b) => a - b)
        .map((index) => refs[index])
        .filter(Boolean);
}

export function orderedOutputRefs(node) {
    const refs = parseRefs(node);
    if (loadMode(node) === "image") {
        return outputMode(node) === "numbered" ? refs.filter(refIsImage) : selectedRefs(node);
    }
    if (outputMode(node) === "numbered") {
        return MEDIA_KINDS.flatMap((kind) => refs.filter((ref) => (ref.kind || "image") === kind));
    }
    return selectedRefs(node);
}

function stageOutputRefs(node) {
    ensureInternalWidgets(node);
    const staged = orderedOutputRefs(node);
    const output = findWidget(node, OUTPUT_WIDGET);
    if (!output) return staged;
    writeWidgetValue(output, JSON.stringify(staged));
    node.properties = node.properties || {};
    node.properties.zhiai_media_loader_output_keys = staged.map(mediaKey);
    return staged;
}

function thumbSize(node) {
    const value = Number(node.properties?.zhiai_media_loader_thumb_size);
    if (Number.isFinite(value)) return clampThumbSize(value);
    const remembered = Number(storedUiValue("thumb_size"));
    return Number.isFinite(remembered) ? clampThumbSize(remembered) : THUMB_DEFAULT_SIZE;
}

function setThumbSize(node, value) {
    node.properties = node.properties || {};
    const size = clampThumbSize(Number(value) || THUMB_DEFAULT_SIZE);
    node.properties.zhiai_media_loader_thumb_size = size;
    rememberUiState({ thumb_size: size });
    renderLoader(node);
    markGraphChanged(node);
}

function toggleMaxThumbSize(node) {
    node.properties = node.properties || {};
    const current = thumbSize(node);
    if (current >= THUMB_MAX_SIZE) {
        const previous = Number(node.properties.zhiai_media_loader_prev_thumb_size);
        setThumbSize(node, Number.isFinite(previous) && previous < THUMB_MAX_SIZE ? previous : THUMB_DEFAULT_SIZE);
        return;
    }
    node.properties.zhiai_media_loader_prev_thumb_size = current;
    setThumbSize(node, THUMB_MAX_SIZE);
}

function toggleMinThumbSize(node) {
    node.properties = node.properties || {};
    const current = thumbSize(node);
    if (current <= THUMB_MIN_SIZE) {
        const previous = Number(node.properties.zhiai_media_loader_prev_thumb_size);
        setThumbSize(node, Number.isFinite(previous) && previous > THUMB_MIN_SIZE ? Math.min(previous, THUMB_MAX_SIZE) : THUMB_DEFAULT_SIZE);
        return;
    }
    node.properties.zhiai_media_loader_prev_thumb_size = current;
    setThumbSize(node, THUMB_MIN_SIZE);
}

function updateRangeFill(node) {
    const range = node?._zhmlEls?.sizeRange;
    if (!range) return;
    const min = Number(range.min) || 0;
    const max = Number(range.max) || 1;
    const value = Number(range.value) || 0;
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
    range.style.background = `linear-gradient(90deg, #2C5080 0%, #2C5080 ${percent}%, #050B16 ${percent}%, #050B16 100%)`;
}

function formatBytes(size) {
    const value = Number(size);
    return value ? `${(value / 1024 / 1024).toFixed(2)} MB` : "";
}

function formatDuration(value) {
    const total = Math.max(0, Math.round(Number(value) || 0));
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function totalSizeText(refs) {
    const total = refs.reduce((sum, ref) => sum + (Number(ref?.size) || 0), 0);
    return formatBytes(total);
}

function refMetricParts(ref) {
    const kind = ref?.kind || "image";
    const parts = [];
    const width = Number(ref?.width);
    const height = Number(ref?.height);
    if ((kind === "image" || kind === "video") && width && height) parts.push(`${width}x${height}`);
    const duration = Number(ref?.duration);
    if ((kind === "video" || kind === "audio") && duration > 0) parts.push(formatDuration(duration));
    const sizeText = formatBytes(ref?.size);
    if (sizeText) parts.push(sizeText);
    return parts;
}

function kindOrdinals(refs) {
    const counters = { image: 0, audio: 0, video: 0 };
    const ordinals = new Map();
    refs.forEach((ref, index) => {
        const kind = ref.kind || "image";
        counters[kind] += 1;
        ordinals.set(index, counters[kind]);
    });
    return ordinals;
}

function mediaKindForFile(file) {
    const mime = String(file?.type || "").toLowerCase();
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    const ext = String(file?.name || "").split(".").pop().toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) return "image";
    if (VIDEO_EXTENSIONS.has(ext)) return "video";
    if (AUDIO_EXTENSIONS.has(ext)) return "audio";
    return "";
}

function mediaFilesFromList(files) {
    return Array.from(files || []).filter((file) => mediaKindForFile(file));
}

function clipboardMediaFiles(event) {
    const itemFiles = Array.from(event?.clipboardData?.items || [])
        .filter((item) => item?.kind === "file")
        .map((item) => item.getAsFile?.())
        .filter(Boolean);
    const itemMedia = mediaFilesFromList(itemFiles);
    return itemMedia.length ? itemMedia : mediaFilesFromList(event?.clipboardData?.files);
}

function thumbUrl(ref, size) {
    if (!ref?.name) return "";
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    const params = new URLSearchParams();
    params.set("name", ref.name);
    params.set("type", ref.type || "input");
    params.set("size", String(Math.round(size * dpr)));
    if (ref.subfolder) params.set("subfolder", ref.subfolder);
    return api.apiURL(`/zhiai/media_loader/thumbnail?${params.toString()}`);
}

function originalUrl(ref) {
    if (!ref?.name) return "";
    const params = new URLSearchParams();
    params.set("filename", ref.name);
    params.set("type", ref.type || "input");
    if (ref.subfolder) params.set("subfolder", ref.subfolder);
    return api.apiURL(`/view?${params.toString()}`);
}

async function imageFileMeta(file) {
    const meta = { size: file?.size || 0 };
    if (!file) return meta;
    if (typeof createImageBitmap === "function") {
        try {
            const bitmap = await createImageBitmap(file);
            meta.width = bitmap.width;
            meta.height = bitmap.height;
            bitmap.close?.();
            return meta;
        } catch (_) {
        }
    }
    return await new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        const done = () => {
            URL.revokeObjectURL(url);
            resolve(meta);
        };
        img.onload = () => {
            meta.width = img.naturalWidth || 0;
            meta.height = img.naturalHeight || 0;
            done();
        };
        img.onerror = done;
        img.src = url;
    });
}

function elementFileMeta(file, tag) {
    const meta = { size: file?.size || 0 };
    if (!file) return Promise.resolve(meta);
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const element = document.createElement(tag);
        let settled = false;
        const done = () => {
            if (settled) return;
            settled = true;
            element.removeAttribute("src");
            URL.revokeObjectURL(url);
            resolve(meta);
        };
        element.preload = "metadata";
        element.onloadedmetadata = () => {
            if (tag === "video") {
                meta.width = element.videoWidth || 0;
                meta.height = element.videoHeight || 0;
            }
            if (Number.isFinite(element.duration) && element.duration > 0) meta.duration = element.duration;
            done();
        };
        element.onerror = done;
        element.src = url;
    });
}

function fileMeta(file, kind) {
    if (kind === "image") return imageFileMeta(file);
    if (kind === "video") return elementFileMeta(file, "video");
    return elementFileMeta(file, "audio");
}

function setPlayButton(button, playing) {
    if (!button) return;
    const label = playing ? $t("pause") : $t("play");
    setTip(button, label);
    button.setAttribute("aria-label", label);
    button.classList.toggle("is-playing", playing);
    button.parentElement?.classList.toggle("is-playing", playing);
}

function stopAudioPlayback() {
    if (audioState.el && !audioState.el.paused) audioState.el.pause();
    if (audioState.button) setPlayButton(audioState.button, false);
    audioState.key = "";
    audioState.button = null;
}

function toggleAudioPlayback(ref, button) {
    if (!audioState.el) {
        audioState.el = document.createElement("audio");
        audioState.el.preload = "none";
        audioState.el.addEventListener("ended", () => {
            if (audioState.button) setPlayButton(audioState.button, false);
        });
    }
    const element = audioState.el;
    const key = mediaKey(ref);
    if (audioState.key === key) {
        if (element.paused) {
            element.play().catch(() => setPlayButton(button, false));
            setPlayButton(button, true);
        } else {
            element.pause();
            setPlayButton(button, false);
        }
        audioState.button = button;
        return;
    }
    element.pause();
    if (audioState.button) setPlayButton(audioState.button, false);
    audioState.key = key;
    audioState.button = button;
    element.src = originalUrl(ref);
    element.play().catch(() => setPlayButton(button, false));
    setPlayButton(button, true);
}

function ensureStyleSheet() {
    if (document.getElementById("zhiai-media-loader-style")) return;
    const style = document.createElement("style");
    style.id = "zhiai-media-loader-style";
    style.textContent = `
.zml-root {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid #2C5080;
    border-radius: 10px;
    font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
    color: #DDE9F5;
    background: #0A1322;
    --zml-band:
        linear-gradient(180deg, rgba(59, 130, 246, 0.26), rgba(59, 130, 246, 0.08)),
        linear-gradient(180deg, #0E1A2E, #070E1B);
}
.zml-root *,
.zml-root *::before,
.zml-root *::after { box-sizing: border-box; }
.zml-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    padding: 10px;
    overflow: hidden;
}
.zml-toolbar {
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr);
    align-items: stretch;
    column-gap: 6px;
    width: 100%;
    min-width: 0;
}
.zml-btn {
    height: 24px;
    padding: 0;
    border: 1px solid #2C5080;
    border-radius: 4px;
    background: #0D1B30;
    color: #93C5FD;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    flex: 0 0 auto;
    font-family: inherit;
    font-size: 12px;
    transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.zml-btn--icon { width: 18px; height: 18px; }
.zml-btn--primary,
.zml-btn--clear {
    padding: 0 10px;
}
.zml-btn--primary,
.zml-btn--clear,
.zml-btn--icon {
    background: #2563EB;
    border-color: #2563EB;
    color: #FFFFFF;
}
.zml-btn--primary:hover,
.zml-btn--clear:hover,
.zml-btn--icon:hover { background: #3B82F6; border-color: #3B82F6; color: #FFFFFF; }
.zml-btn:not(.zml-btn--primary):not(.zml-btn--clear):not(.zml-btn--icon):hover { background: #12233C; border-color: #3B82F6; color: #F2FAFF; }
.zml-btn:disabled { opacity: 0.55; cursor: default; }
.zml-size {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    padding: 5px;
    border: 1px solid #2C5080;
    border-radius: 8px;
    background: var(--zml-band);
}
.zml-range {
    appearance: none;
    -webkit-appearance: none;
    flex: 1 1 auto;
    min-width: 0;
    height: 4px;
    margin: 0;
    border-radius: 999px;
    background: #050B16;
    outline: none;
    cursor: pointer;
}
.zml-range::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #2563EB;
    border: 0;
    box-shadow: 0 1px 4px rgba(2, 6, 23, 0.6);
    cursor: pointer;
    transition: background 140ms ease;
}
.zml-range::-webkit-slider-thumb:hover { background: #3B82F6; }
.zml-range::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: #050B16;
}
.zml-range::-moz-range-progress {
    height: 4px;
    border-radius: 999px;
    background: #2C5080;
}
.zml-range::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #2563EB;
    border: 0;
    cursor: pointer;
}
.zml-mode-frame {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
    border: 1px solid #2C5080;
    border-radius: 8px;
    background: var(--zml-band);
    flex: 0 0 auto;
}
.zml-mode-label,
.zml-size-label {
    color: #7C93B0;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.5;
    white-space: nowrap;
    user-select: none;
    flex: 0 0 auto;
}
.zml-mode-group {
    display: inline-flex;
    padding: 3px;
    border-radius: 7px;
    background: #050B16;
    box-shadow: inset 0 1px 2px rgba(2, 6, 23, 0.55);
    flex: 0 0 auto;
}
.zml-mode {
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: #93A9C4;
    font-size: 10px;
    line-height: 1.4;
    padding: 1px 8px;
    cursor: pointer;
    font-family: inherit;
    transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease;
}
.zml-mode:hover { color: #F2FAFF; background: rgba(59, 130, 246, 0.14); }
.zml-mode.is-active {
    background: #2563EB;
    color: #FFFFFF;
    box-shadow: 0 1px 2px rgba(2, 6, 23, 0.45);
}
.zml-tip {
    position: fixed;
    z-index: 10100;
    box-sizing: border-box;
    width: max-content;
    max-width: 320px;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(5, 11, 22, 0.88);
    border: 1px solid rgba(147, 197, 253, 0.42);
    box-shadow: 0 4px 14px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px) saturate(1.3);
    -webkit-backdrop-filter: blur(10px) saturate(1.3);
    color: #F2FAFF;
    font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0.01em;
    overflow-wrap: anywhere;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-3px);
    transition: opacity 140ms ease, transform 140ms ease;
}
.zml-tip.is-visible { opacity: 1; transform: translateY(0); }
.zml-tip[data-placement="bottom"] { transform: translateY(3px); }
.zml-tip[data-placement="bottom"].is-visible { transform: translateY(0); }
.zml-filters .zml-btn {
    margin-left: auto;
    height: 20px;
    padding: 0 8px;
    gap: 4px;
    font-size: 11px;
}
.zml-filters .zml-btn svg { width: 14px; height: 14px; }
.zml-filters {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    flex: 0 0 auto;
    padding: 8px 10px;
    background: var(--zml-band);
    overflow: hidden;
}
.zml-filter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 20px;
    padding: 0 8px;
    border: 1px solid #2C5080;
    border-radius: 999px;
    background: #0A1424;
    color: #93A9C4;
    font-size: 11px;
    line-height: 1;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    flex: 0 0 auto;
    transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.zml-filter-label { line-height: 1; }
.zml-filter:hover { color: #F2FAFF; border-color: #3B82F6; background: #0D1B30; }
.zml-filter.is-active {
    background: #2563EB;
    border-color: #2563EB;
    color: #F2FAFF;
    font-weight: 700;
}
.zml-preview {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #2C5080;
    border-radius: 8px;
    background: #050B16;
    box-shadow: inset 0 2px 10px rgba(2, 6, 23, 0.45);
    overflow: hidden;
    position: relative;
    outline: none;
}
.zml-scroll {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    outline: none;
}
.zml-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
.zml-scroll::-webkit-scrollbar-track { background: transparent; }
.zml-scroll::-webkit-scrollbar-thumb { background: #2C5080; border: 2px solid transparent; background-clip: padding-box; border-radius: 999px; }
.zml-scroll::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
.zml-scroll::-webkit-scrollbar-corner { background: transparent; }
.zml-preview.is-drop-target {
    border-color: #3B82F6;
    background: #081226;
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.45);
}
.zml-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 0 0 auto;
}
.zml-section + .zml-section {
    margin-top: -4px;
    padding-top: 10px;
    border-top: 1px solid #1B3355;
}
.zml-section-title {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #93C5FD;
    font-size: 10.5px;
    font-weight: 600;
    line-height: 1.5;
}
.zml-section-count {
    color: #7C93B0;
    font-variant-numeric: tabular-nums;
}
.zml-grid {
    display: flex;
    align-items: flex-start;
    align-content: flex-start;
    gap: 10px;
    flex-wrap: wrap;
    min-width: 0;
}
.zml-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    flex: 0 0 auto;
    cursor: pointer;
    user-select: none;
}
.zml-media {
    position: relative;
    display: block;
    border: 1px solid #2C5080;
    border-radius: 6px;
    background: #030712;
    overflow: hidden;
    transition: border-color 140ms ease, box-shadow 140ms ease;
}
.zml-card.is-selected { z-index: 1; }
.zml-card.is-selected .zml-media {
    border-color: #3B82F6;
    box-shadow: 0 0 0 1px #3B82F6, 0 0 10px rgba(59, 130, 246, 0.45), 0 0 22px rgba(59, 130, 246, 0.22);
}
.zml-media img,
.zml-media video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #030712;
    transition: filter 140ms ease;
}
.zml-card:hover .zml-media img,
.zml-card:hover .zml-media video { filter: brightness(1.25); }
.zml-badge {
    position: absolute;
    bottom: 4px;
    left: 4px;
    z-index: 2;
    min-width: 16px;
    height: 16px;
    padding: 0 2px;
    border-radius: 4px;
    border: 1px solid #93C5FD;
    background: #2563EB;
    color: #FFFFFF;
    font-size: 10px;
    line-height: 14px;
    text-align: center;
    font-variant-numeric: tabular-nums;
}
.zml-duration {
    position: absolute;
    right: 4px;
    bottom: 4px;
    z-index: 2;
    padding: 1px 5px;
    border-radius: 999px;
    border: 1px solid #2C5080;
    background: rgba(3, 10, 20, 0.85);
    color: #DDE9F5;
    font-size: 10px;
    line-height: 13px;
}
.zml-delete {
    position: absolute;
    top: -6px;
    right: -6px;
    z-index: 2;
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
    padding: 0;
    border: 1px solid #2C5080;
    border-radius: 50%;
    background: #0D1B30;
    color: #93A9C4;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    cursor: pointer;
    flex: 0 0 auto;
    opacity: 0;
    pointer-events: none;
    transition: opacity 140ms ease, background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.zml-delete > svg,
.zml-corner > svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
}
.zml-card:hover .zml-delete,
.zml-delete:focus-visible {
    opacity: 1;
    pointer-events: auto;
}
@media (hover: none) {
    .zml-delete { opacity: 1; pointer-events: auto; }
}
.zml-delete:hover { background: #DC2626; border-color: #EF4444; color: #FFFFFF; }
.zml-corner {
    position: absolute;
    top: -6px;
    left: -6px;
    z-index: 2;
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
    padding: 0;
    border: 1px solid #2C5080;
    border-radius: 50%;
    background: #0D1B30;
    color: #93A9C4;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    cursor: pointer;
    flex: 0 0 auto;
    opacity: 0;
    pointer-events: none;
    transition: opacity 140ms ease, background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.zml-card:hover .zml-corner,
.zml-corner:focus-visible {
    opacity: 1;
    pointer-events: auto;
}
@media (hover: none) {
    .zml-corner { opacity: 1; pointer-events: auto; }
}
.zml-corner:hover { background: #2563EB; border-color: #3B82F6; color: #FFFFFF; }
.zml-audio-name {
    max-width: 100%;
    min-width: 0;
    font-size: 10px;
    line-height: 15px;
    color: #93A9C4;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
    flex: 0 0 auto;
}
.zml-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 11.5px;
    line-height: 15px;
    color: #7C93B0;
    border: 1px dashed #2C5080;
    border-radius: 6px;
    background: #030712;
}
.zml-media--audio {
    background: #12233C;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 6px 6px 24px;
    transition: background 140ms ease;
}
.zml-card:hover .zml-media--audio { background: #1A3153; }
.zml-audio-icon {
    position: relative;
    display: flex;
    line-height: 0;
    color: #93C5FD;
    flex: 0 1 auto;
    min-height: 0;
}
.zml-audio-icon svg { pointer-events: none; }
.zml-pk {
    opacity: 0;
    transform: scale(.28) rotate(-60deg);
    transform-box: view-box;
    transform-origin: 14px 12px;
    transition: transform 220ms cubic-bezier(.34, 1.5, .64, 1), opacity 120ms linear, color 140ms ease;
}
.zml-pk-halo {
    fill: #12233C;
    stroke: #12233C;
    stroke-width: 6.2;
    stroke-linejoin: round;
    paint-order: stroke;
}
.zml-pk-glyph {
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linejoin: round;
    paint-order: stroke;
}
.zml-pk-pause { display: none; }
.zml-card:hover .zml-pk,
.zml-audio-icon.is-playing .zml-pk,
.zml-audio-icon:has(.zml-audio-play:focus-visible) .zml-pk {
    opacity: 1;
    transform: none;
}
.zml-audio-icon.is-playing .zml-pk-play { display: none; }
.zml-audio-icon.is-playing .zml-pk-pause { display: inline; }
.zml-audio-icon svg line {
    transform-box: fill-box;
    transform-origin: center;
}
.zml-audio-icon.is-playing svg line {
    animation: zml-audio-eq 900ms ease-in-out infinite alternate;
}
.zml-audio-icon.is-playing svg line:nth-of-type(2) { animation-delay: 120ms; }
.zml-audio-icon.is-playing svg line:nth-of-type(3) { animation-delay: 240ms; }
.zml-audio-icon.is-playing svg line:nth-of-type(4) { animation-delay: 360ms; }
.zml-audio-icon.is-playing svg line:nth-of-type(5) { animation-delay: 480ms; }
@keyframes zml-audio-eq {
    from { transform: scaleY(0.42); }
    to { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
    .zml-pk { transform: none; transition-duration: 1ms; }
    .zml-audio-icon.is-playing svg line { animation: none; }
}
.zml-audio-play {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 26px;
    height: 26px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    cursor: pointer;
    z-index: 2;
    pointer-events: none;
}
.zml-card:hover .zml-audio-play,
.zml-audio-icon.is-playing .zml-audio-play,
.zml-audio-play:focus-visible {
    pointer-events: auto;
}
.zml-audio-icon:has(.zml-audio-play:hover) .zml-pk,
.zml-audio-icon:has(.zml-audio-play:focus-visible) .zml-pk {
    color: #F2FAFF;
}
@media (hover: none) {
    .zml-audio-play { pointer-events: auto; }
}
.zml-empty {
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    flex: 0 0 auto;
    text-align: center;
    color: #7C93B0;
    font-size: 12.5px;
    line-height: 1.7;
}
.zml-empty-icon { color: #35577F; display: flex; }
.zml-empty-title {
    color: #93A9C4;
    font-size: 13.5px;
    line-height: 1.6;
}
.zml-empty-hint {
    color: #7C93B0;
    font-size: 12px;
    line-height: 1.7;
}
.zml-footer {
    display: flex;
    flex-direction: column;
    min-height: 16px;
    color: #7C93B0;
    overflow: hidden;
}
.zml-f-bar {
    display: flex;
    align-items: stretch;
    min-width: 0;
    border: 1px solid #2C5080;
    border-radius: 5px;
    background: #0D1B30;
    overflow: hidden;
}
.zml-f-seg {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 11px;
    min-width: 0;
    white-space: nowrap;
}
.zml-f-seg + .zml-f-seg {
    border-left: 1px solid #1B3355;
}
.zml-f-seg--flex { flex: 1 1 auto; }
.zml-f-seg--accent { background: rgba(59, 130, 246, 0.14); }
.zml-f-seg-label {
    display: inline-flex;
    align-items: center;
    column-gap: 5px;
    font-size: 9.5px;
    line-height: 26px;
    color: #93A9C4;
    letter-spacing: 0.04em;
    overflow: hidden;
    text-overflow: ellipsis;
}
.zml-f-seg-value {
    font-size: 11px;
    line-height: 26px;
    color: #7C93B0;
    font-variant-numeric: tabular-nums;
    overflow: hidden;
    text-overflow: ellipsis;
}
.zml-f-seg-value b {
    color: #DDE9F5;
    font-weight: 600;
}
.zml-f-seg--accent .zml-f-seg-value {
    color: #93C5FD;
    font-weight: 500;
}
.zml-f-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #38BDF8;
    flex: none;
}
.zml-f-dot--video { background: #A78BFA; }
.zml-f-dot--audio { background: #34D399; }
.zml-box {
    position: absolute;
    display: none;
    border: 1px solid #38BDF8;
    background: rgba(56, 189, 248, 0.14);
    pointer-events: none;
    z-index: 2;
}
.zml-viewer {
    position: fixed;
    inset: 0;
    z-index: 10080;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(2, 6, 23, 0.72);
    backdrop-filter: blur(10px) saturate(1.3);
    -webkit-backdrop-filter: blur(10px) saturate(1.3);
    font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
    color: #DDE9F5;
    outline: none;
}
.zml-viewer-dialog {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    max-width: min(1180px, 92vw);
    max-height: 88vh;
    border: 1px solid rgba(147, 197, 253, 0.3);
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.15), 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    overflow: hidden;
}
.zml-viewer-head {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 0 0 auto;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(147, 197, 253, 0.18);
    background:
        linear-gradient(180deg, rgba(59, 130, 246, 0.26), rgba(59, 130, 246, 0.08)),
        linear-gradient(180deg, #0E1A2E, #070E1B);
}
.zml-viewer-title {
    min-width: 0;
    color: #F2FAFF;
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.zml-viewer-meta {
    flex: 0 0 auto;
    color: #7C93B0;
    font-size: 11.5px;
    line-height: 18px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
.zml-viewer-close {
    margin-left: auto;
    width: 26px;
    height: 26px;
    min-width: 26px;
    min-height: 26px;
    padding: 0;
    border: 1px solid #2C5080;
    border-radius: 6px;
    background: #0D1B30;
    color: #93A9C4;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    cursor: pointer;
    flex: 0 0 auto;
    transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.zml-viewer-close > svg { display: block; width: 14px; height: 14px; }
.zml-viewer-close:hover { background: #DC2626; border-color: #EF4444; color: #FFFFFF; }
.zml-viewer-body {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    min-width: 320px;
    min-height: 220px;
    padding: 12px;
    background: #030712;
}
.zml-viewer-body img,
.zml-viewer-body video {
    display: block;
    max-width: 100%;
    max-height: calc(88vh - 76px);
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 6px;
    background: #030712;
}
.zml-filters .zml-btn--clear {
    margin-left: auto;
}
.zml-filters .zml-btn--clear + .zml-btn {
    margin-left: 0;
}
.zml-confirm-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(3, 7, 18, 0.62);
    z-index: 10070;
}
.zml-confirm {
    width: min(340px, 84vw);
    padding: 18px 20px 16px;
    border: 1px solid #2C5080;
    border-radius: 10px;
    background: #0A1322;
    color: #DDE9F5;
    font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 13px;
    line-height: 20px;
    box-shadow: 0 18px 44px rgba(2, 6, 23, 0.6);
}
.zml-confirm__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
}
.zml-confirm__actions .zml-btn {
    height: 26px;
    padding: 0 14px;
    font-size: 12px;
}
.dom-widget.zml-dom-widget {
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 10px;
}
`;
    document.head.appendChild(style);
}

function wireButton(button, onClick) {
    button.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
    });
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
    });
}

function makeIconButton(label, icon, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zml-btn zml-btn--icon";
    setTip(button, label);
    button.setAttribute("aria-label", label);
    button.innerHTML = icon;
    wireButton(button, onClick);
    return button;
}

function makeLabeledButton(text, icon, onClick, variant = "primary") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = variant ? `zml-btn zml-btn--${variant}` : "zml-btn";
    setTip(button, text);
    button.setAttribute("aria-label", text);
    button.innerHTML = icon;
    const label = document.createElement("span");
    label.className = "zml-btn-label";
    label.textContent = text;
    button.appendChild(label);
    wireButton(button, onClick);
    return button;
}

function makeDeleteButton(node, ref, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zml-delete";
    setTip(button, $t("deleteItem"));
    button.setAttribute("aria-label", $t("deleteItem"));
    button.innerHTML = DELETE_ICON;
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        removeRef(node, index);
    });
    return button;
}

const viewer = { overlay: null, media: null };

function onViewerKeydown(event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    closeMediaViewer();
}

function closeMediaViewer() {
    if (!viewer.overlay) return;
    viewer.media?.pause?.();
    viewer.overlay.remove();
    viewer.overlay = null;
    viewer.media = null;
    document.removeEventListener("keydown", onViewerKeydown, true);
}

function openMediaViewer(ref) {
    const url = originalUrl(ref);
    if (!url) return;
    closeMediaViewer();
    stopAudioPlayback();
    const isVideo = (ref?.kind || "image") === "video";
    const overlay = document.createElement("div");
    overlay.className = "zml-viewer";
    overlay.tabIndex = -1;

    const dialog = document.createElement("div");
    dialog.className = "zml-viewer-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", ref?.name || "");

    const head = document.createElement("div");
    head.className = "zml-viewer-head";
    const title = document.createElement("span");
    title.className = "zml-viewer-title";
    title.textContent = ref?.name || "";
    const meta = document.createElement("span");
    meta.className = "zml-viewer-meta";
    meta.textContent = refMetricParts(ref).join("  |  ");
    const close = document.createElement("button");
    close.type = "button";
    close.className = "zml-viewer-close";
    setTip(close, $t("closePreview"));
    close.setAttribute("aria-label", $t("closePreview"));
    close.innerHTML = DELETE_ICON;
    head.append(title, meta, close);

    const body = document.createElement("div");
    body.className = "zml-viewer-body";
    const media = document.createElement(isVideo ? "video" : "img");
    media.src = url;
    if (isVideo) {
        media.controls = true;
        media.autoplay = true;
        media.playsInline = true;
        media.preload = "metadata";
    } else {
        media.alt = ref?.name || "";
    }
    body.appendChild(media);

    dialog.append(head, body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    viewer.overlay = overlay;
    viewer.media = media;

    close.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMediaViewer();
    });
    overlay.addEventListener("pointerdown", (event) => {
        if (event.target === overlay) closeMediaViewer();
    });
    document.addEventListener("keydown", onViewerKeydown, true);
    overlay.focus({ preventScroll: true });
}

function makeCornerButton(ref, isVideo) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zml-corner";
    const label = $t(isVideo ? "playPreview" : "zoomPreview");
    setTip(button, label);
    button.setAttribute("aria-label", label);
    button.innerHTML = isVideo ? PLAY_ICON : ZOOM_ICON;
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openMediaViewer(ref);
    });
    return button;
}

function makeBadge(ordinal) {
    const badge = document.createElement("span");
    badge.className = "zml-badge";
    badge.textContent = String(ordinal);
    return badge;
}

function makeKindDot(kind) {
    const dot = document.createElement("span");
    dot.className = `zml-f-dot zml-f-dot--${kind || "image"}`;
    return dot;
}

function makeFallback(size) {
    const failed = document.createElement("div");
    failed.className = "zml-fallback";
    failed.textContent = $t("thumbFailed");
    failed.style.width = `${size}px`;
    failed.style.height = `${size}px`;
    return failed;
}

function buildEmptyState() {
    const wrap = document.createElement("div");
    wrap.className = "zml-empty";
    const icon = document.createElement("div");
    icon.className = "zml-empty-icon";
    icon.innerHTML = EMPTY_ICON;
    const title = document.createElement("div");
    title.className = "zml-empty-title";
    title.textContent = $t("empty");
    const hint = document.createElement("div");
    hint.className = "zml-empty-hint";
    hint.textContent = $t("emptyHint");
    wrap.append(icon, title, hint);
    return wrap;
}

function requestScrollToIndex(node, index) {
    const value = Number(index);
    if (!Number.isFinite(value) || value < 0) return;
    node._zhmlPendingScrollIndex = Math.floor(value);
}

function ensureIndexVisible(node, index) {
    const preview = node?._zhmlEls?.scroll;
    if (!preview) return false;
    const item = preview.querySelector(`[data-zml-card][data-index="${Number(index)}"]`);
    if (!item) return false;

    const margin = 8;
    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;
    const viewTop = preview.scrollTop;
    const viewBottom = viewTop + preview.clientHeight;
    let nextTop = viewTop;

    if (top < viewTop + margin) nextTop = Math.max(0, top - margin);
    else if (bottom > viewBottom - margin) nextTop = Math.max(0, bottom - preview.clientHeight + margin);

    if (nextTop !== viewTop) preview.scrollTo({ top: nextTop, behavior: "auto" });
    return true;
}

function previewPoint(preview, event) {
    const rect = preview.getBoundingClientRect();
    const scaleX = rect.width / Math.max(preview.offsetWidth, 1);
    const scaleY = rect.height / Math.max(preview.offsetHeight, 1);
    return {
        x: ((event.clientX - rect.left) / Math.max(scaleX, 0.001)) + preview.scrollLeft,
        y: ((event.clientY - rect.top) / Math.max(scaleY, 0.001)) + preview.scrollTop,
    };
}

function syncSelection(node, selected) {
    const refs = parseRefs(node);
    const next = new Set(
        [...selected].filter((index) => Number.isInteger(index) && index >= 0 && index < refs.length),
    );
    node._zhmlSelected = next;
    updateSelectionUi(node);
    if (next.size === 1) ensureIndexVisible(node, [...next][0]);
    node.graph?.setDirtyCanvas?.(true, true);
    app?.canvas?.setDirty?.(true, true);
}

function updateSelectionUi(node) {
    const els = node._zhmlEls;
    if (!els) return;
    const selected = selectedSet(node);
    for (const card of els.scroll.querySelectorAll("[data-zml-card]")) {
        const index = Number(card.dataset.index);
        card.classList.toggle("is-selected", selected.has(index));
    }
    updateFooter(node);
}

function footerSeg(parent, className) {
    const seg = document.createElement("div");
    seg.className = className ? `zml-f-seg ${className}` : "zml-f-seg";
    parent.append(seg);
    return seg;
}

function footerSegText(parent, className, text) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    parent.append(span);
}

function footerSegValue(text, bold) {
    const span = document.createElement("span");
    span.className = "zml-f-seg-value";
    if (bold) {
        const strong = document.createElement("b");
        strong.textContent = text;
        span.append(strong);
    } else {
        span.textContent = text;
    }
    return span;
}

function footerSegField(parent, className, label, valueNode) {
    const seg = footerSeg(parent, className);
    footerSegText(seg, "zml-f-seg-label", label);
    if (valueNode) seg.append(valueNode);
    return seg;
}

function footerKindSeg(parent, kind, label, valueText) {
    const seg = footerSeg(parent);
    const segLabel = document.createElement("span");
    segLabel.className = "zml-f-seg-label";
    const dot = document.createElement("span");
    dot.className = `zml-f-dot zml-f-dot--${kind}`;
    const labelText = document.createElement("span");
    labelText.textContent = label;
    segLabel.append(dot, labelText);
    seg.append(segLabel, footerSegValue(valueText, true));
    return seg;
}

function updateFooter(node) {
    const els = node._zhmlEls;
    if (!els) return;
    const bar = els.footerBar;
    const imageOnly = loadMode(node) === "image";
    const kinds = imageOnly ? IMAGE_KINDS : MEDIA_KINDS;
    const refs = parseRefs(node).filter((ref) => refIsVisible(kinds, ref));
    const mode = outputMode(node);
    bar.replaceChildren();
    if (!refs.length) {
        footerSegField(bar, "zml-f-seg--flex", $t("segHint"), footerSegValue($t(imageOnly ? "kindsHintImage" : "kindsHint")));
        return;
    }
    const totals = { image: 0, audio: 0, video: 0 };
    for (const ref of refs) totals[ref.kind || "image"] += 1;
    const stats = (mode === "numbered" ? refs : selectedRefs(node))
        .filter((ref) => refIsVisible(kinds, ref));
    const counts = { image: 0, audio: 0, video: 0 };
    for (const ref of stats) counts[ref.kind || "image"] += 1;
    const accent = `${imageOnly ? $t("loadModeImage") : $t("loadModeMedia")} · ${mode === "numbered" ? $t("modeNumbered") : $t("modeSelect")}`;
    footerSegField(bar, "zml-f-seg--accent", $t("segMode"), footerSegValue(accent));
    for (const kind of kinds) {
        const value = mode === "numbered" ? String(totals[kind]) : `[${counts[kind]}/${totals[kind]}]`;
        footerKindSeg(bar, kind, $t(KIND_LABEL_KEYS[kind]), value);
    }
    const total = totalSizeText(stats);
    if (total) footerSegField(bar, "zml-f-seg--flex", $t("totalSize"), footerSegValue(total, true));
}

function bindCardInteractions(node, card, index) {
    card.dataset.index = String(index);
    card.dataset.zmlCard = "1";
    card.draggable = true;
    card.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        node._zhmlEls?.preview?.focus?.({ preventScroll: true });
    });
    card.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData(DRAG_MIME, String(index));
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        card.style.opacity = "0.45";
    });
    card.addEventListener("dragend", () => {
        card.style.opacity = "";
    });
    card.addEventListener("dragover", (event) => {
        if (!Array.from(event.dataTransfer?.types || []).includes(DRAG_MIME)) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    card.addEventListener("drop", (event) => {
        const raw = event.dataTransfer?.getData(DRAG_MIME);
        if (raw == null || raw === "") return;
        event.preventDefault();
        event.stopPropagation();
        reorderRefs(node, Number(raw), index);
    });
    card.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const refs = parseRefs(node);
        const current = selectedSet(node);
        let next = new Set();
        if (event.shiftKey && Number.isInteger(node._zhmlAnchor)) {
            const start = Math.max(0, Math.min(node._zhmlAnchor, index));
            const end = Math.min(refs.length - 1, Math.max(node._zhmlAnchor, index));
            next = event.ctrlKey || event.metaKey ? new Set(current) : new Set();
            for (let itemIndex = start; itemIndex <= end; itemIndex += 1) next.add(itemIndex);
        } else if (event.ctrlKey || event.metaKey) {
            next = new Set(current);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            node._zhmlAnchor = index;
        } else if (current.size === 1 && current.has(index)) {
            node._zhmlAnchor = index;
        } else {
            next.add(index);
            node._zhmlAnchor = index;
        }
        syncSelection(node, next);
    });
}

function makeImageCard(node, ref, index, size, selected, ordinal) {
    const card = document.createElement("div");
    card.className = "zml-card";
    if (selected) card.classList.add("is-selected");
    card.style.width = `${size}px`;
    const media = document.createElement("div");
    media.className = "zml-media";
    media.style.width = `${size}px`;
    media.style.height = `${size}px`;
    const img = document.createElement("img");
    img.decoding = "async";
    img.draggable = false;
    img.src = thumbUrl(ref, size);
    img.onerror = () => img.replaceWith(makeFallback(size));
    media.appendChild(img);
    if (ordinal != null) media.appendChild(makeBadge(ordinal));
    card.append(media, makeCornerButton(ref, false), makeDeleteButton(node, ref, index));
    bindCardInteractions(node, card, index);
    return card;
}

function makeVideoCard(node, ref, index, size, selected, ordinal) {
    const card = document.createElement("div");
    card.className = "zml-card";
    if (selected) card.classList.add("is-selected");
    card.style.width = `${size}px`;
    const media = document.createElement("div");
    media.className = "zml-media";
    media.style.width = `${size}px`;
    media.style.height = `${size}px`;
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.draggable = false;
    video.src = originalUrl(ref);
    const duration = document.createElement("span");
    duration.className = "zml-duration";
    const known = Number(ref.duration);
    if (Number.isFinite(known) && known > 0) duration.textContent = formatDuration(known);
    video.addEventListener("loadedmetadata", () => {
        if (!duration.textContent && Number.isFinite(video.duration) && video.duration > 0) {
            duration.textContent = formatDuration(video.duration);
        }
    });
    media.appendChild(video);
    if (ordinal != null) media.appendChild(makeBadge(ordinal));
    media.appendChild(duration);
    card.append(media, makeCornerButton(ref, true), makeDeleteButton(node, ref, index));
    bindCardInteractions(node, card, index);
    return card;
}

function makeAudioCard(node, ref, index, size, selected, ordinal) {
    const card = document.createElement("div");
    card.className = "zml-card";
    if (selected) card.classList.add("is-selected");
    card.style.width = `${size}px`;
    const media = document.createElement("div");
    media.className = "zml-media zml-media--audio";
    media.style.width = `${size}px`;
    media.style.height = `${size}px`;
    const icon = document.createElement("span");
    icon.className = "zml-audio-icon";
    icon.style.width = `${Math.round(size * 0.5)}px`;
    icon.style.height = `${Math.round(size * 0.5)}px`;
    icon.innerHTML = AUDIO_ICON;
    const play = document.createElement("button");
    play.type = "button";
    play.className = "zml-audio-play";
    icon.appendChild(play);
    const resuming = audioState.key === mediaKey(ref) && !!audioState.el && !audioState.el.paused;
    setPlayButton(play, resuming);
    if (resuming) audioState.button = play;
    play.addEventListener("pointerdown", (event) => event.stopPropagation());
    play.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleAudioPlayback(ref, play);
    });
    const name = document.createElement("div");
    name.className = "zml-audio-name";
    name.textContent = ref.name || "";
    const duration = document.createElement("span");
    duration.className = "zml-duration";
    const known = Number(ref.duration);
    if (Number.isFinite(known) && known > 0) duration.textContent = formatDuration(known);
    media.append(icon, name, duration);
    if (ordinal != null) media.appendChild(makeBadge(ordinal));
    card.appendChild(media);
    card.appendChild(makeDeleteButton(node, ref, index));
    bindCardInteractions(node, card, index);
    return card;
}

function makeCardFor(node, ref, index, size, selected, ordinal) {
    const kind = ref.kind || "image";
    const card = kind === "video"
        ? makeVideoCard(node, ref, index, size, selected, ordinal)
        : kind === "audio"
            ? makeAudioCard(node, ref, index, size, selected, ordinal)
            : makeImageCard(node, ref, index, size, selected, ordinal);
    setTip(card, ref.name || "");
    return card;
}

function reorderRefs(node, fromIndex, toIndex) {
    const refs = parseRefs(node);
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= refs.length || toIndex >= refs.length) return;
    const target = refs[toIndex];
    const [moved] = refs.splice(fromIndex, 1);
    const insertAt = refs.indexOf(target) + (fromIndex < toIndex ? 1 : 0);
    refs.splice(insertAt, 0, moved);
    const nextSelected = new Set();
    for (const index of selectedSet(node)) {
        if (index === fromIndex) nextSelected.add(insertAt);
        else if (fromIndex < index && index <= insertAt) nextSelected.add(index - 1);
        else if (insertAt <= index && index < fromIndex) nextSelected.add(index + 1);
        else nextSelected.add(index);
    }
    node._zhmlSelected = nextSelected;
    if (nextSelected.has(insertAt)) node._zhmlAnchor = insertAt;
    requestScrollToIndex(node, insertAt);
    setMediaAndOutputRefs(node, refs, []);
}

function dropIndexFromPoint(preview, event) {
    const direct = event.target?.closest?.("[data-zml-card]");
    if (direct?.dataset?.index != null) return Number(direct.dataset.index);
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const item of preview.querySelectorAll("[data-zml-card]")) {
        const rect = item.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const distance = dx * dx + dy * dy;
        if (distance < bestDistance) {
            bestDistance = distance;
            best = item;
        }
    }
    return best?.dataset?.index == null ? -1 : Number(best.dataset.index);
}

function removeSelected(node) {
    const refs = parseRefs(node);
    const selected = selectedSet(node);
    if (!selected.size) return;
    const next = refs.filter((_, index) => !selected.has(index));
    node._zhmlSelected = new Set();
    setMediaAndOutputRefs(node, next, []);
}

function removeRef(node, index) {
    const refs = parseRefs(node);
    if (!Number.isInteger(index) || index < 0 || index >= refs.length) return;
    const selected = selectedSet(node);
    const next = refs.filter((_, itemIndex) => itemIndex !== index);
    const nextSelected = new Set();
    for (const itemIndex of selected) {
        if (itemIndex === index) continue;
        nextSelected.add(itemIndex > index ? itemIndex - 1 : itemIndex);
    }
    node._zhmlSelected = nextSelected;
    if (nextSelected.size === 1) {
        const only = [...nextSelected][0];
        node._zhmlAnchor = only;
        requestScrollToIndex(node, only);
    }
    setMediaAndOutputRefs(node, next, []);
}

function clearMedia(node) {
    stopAudioPlayback();
    node._zhmlSelected = new Set();
    setMediaAndOutputRefs(node, [], []);
}

function showClearConfirm(onConfirm) {
    const overlay = document.createElement("div");
    overlay.className = "zml-confirm-overlay";
    const box = document.createElement("div");
    box.className = "zml-confirm";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    const message = document.createElement("div");
    message.textContent = $t("clearConfirm");
    const actions = document.createElement("div");
    actions.className = "zml-confirm__actions";

    let closed = false;
    const close = () => {
        if (closed) return;
        closed = true;
        document.removeEventListener("keydown", onKeyDown, true);
        overlay.remove();
    };
    const onKeyDown = (event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        close();
    };
    const confirmBtn = makeLabeledButton($t("confirm"), "", () => {
        close();
        onConfirm();
    });
    const cancelBtn = makeLabeledButton($t("cancel"), "", close, "");
    actions.append(cancelBtn, confirmBtn);
    box.append(message, actions);
    overlay.appendChild(box);
    overlay.addEventListener("pointerdown", (event) => {
        if (event.target === overlay) close();
    });
    document.addEventListener("keydown", onKeyDown, true);
    document.body.appendChild(overlay);
    cancelBtn.focus();
}

function showLoadingPreview(node, text) {
    const els = node._zhmlEls;
    if (!els?.scroll) return;
    hideTip();
    els.scroll.replaceChildren();
    if (els.selectionBox) els.scroll.appendChild(els.selectionBox);
    const loading = document.createElement("div");
    loading.className = "zml-empty";
    loading.textContent = text;
    els.scroll.appendChild(loading);
}

function uploadMedia(node, files, { append = false } = {}) {
    const els = node._zhmlEls;
    const status = els?.status;
    const load = els?.load;
    const clear = els?.clear;
    const run = async () => {
        const mediaFiles = mediaFilesFromList(files);
        if (!mediaFiles.length) return;
        if (status) status.textContent = $t("uploading");
        showLoadingPreview(node, $t("uploading"));
        if (load) load.disabled = true;
        if (clear) clear.disabled = true;
        const refs = append ? parseRefs(node) : [];
        const firstAddedIndex = refs.length;
        const imageOnly = loadMode(node) === "image";
        let failed = 0;
        let skipped = 0;
        try {
            for (const file of mediaFiles) {
                const kind = mediaKindForFile(file);
                if (!kind) continue;
                if (imageOnly && kind !== "image") {
                    skipped += 1;
                    continue;
                }
                try {
                    const meta = await fileMeta(file, kind);
                    const body = new FormData();
                    body.append("image", file);
                    body.append("type", "input");
                    body.append("overwrite", "false");
                    const response = await api.fetchApi("/upload/image", { method: "POST", body });
                    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
                    const data = await response.json();
                    refs.push({
                        kind,
                        name: data.name,
                        subfolder: data.subfolder || "",
                        type: data.type || "input",
                        width: meta.width || 0,
                        height: meta.height || 0,
                        size: meta.size || 0,
                        duration: meta.duration || 0,
                    });
                } catch (error) {
                    failed += 1;
                    console.error("[MultimediaAdvancedLoader]", error);
                }
            }
            if (refs.length !== firstAddedIndex) {
                requestScrollToIndex(node, firstAddedIndex);
            }
            setMediaAndOutputRefs(node, refs, []);
            if (failed && status) {
                status.textContent = refs.length !== firstAddedIndex ? $t("uploadPartial") : $t("uploadFailed");
            } else if (skipped && status) {
                status.textContent = $t("skipNonImage");
            }
        } finally {
            if (load) load.disabled = false;
            if (clear) clear.disabled = !parseRefs(node).length;
        }
    };
    return run();
}

function hasFileDrag(event) {
    return Array.from(event?.dataTransfer?.types || []).includes("Files");
}

function installDropUpload(node, element, highlight) {
    let depth = 0;
    const setActive = (active) => {
        highlight?.classList?.toggle("is-drop-target", active);
    };
    const allowFileDrop = (event) => {
        if (!hasFileDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };
    element.addEventListener("dragenter", (event) => {
        if (!hasFileDrag(event)) return;
        depth += 1;
        setActive(true);
        allowFileDrop(event);
    });
    element.addEventListener("dragover", allowFileDrop);
    element.addEventListener("dragleave", () => {
        depth = Math.max(0, depth - 1);
        if (!depth) setActive(false);
    });
    element.addEventListener("drop", async (event) => {
        depth = 0;
        setActive(false);
        const mediaFiles = mediaFilesFromList(event.dataTransfer?.files);
        if (!mediaFiles.length) return;
        event.preventDefault();
        event.stopPropagation();
        await uploadMedia(node, mediaFiles, { append: true });
    });
}

function installPasteUpload(node, element) {
    element.addEventListener("paste", async (event) => {
        const mediaFiles = clipboardMediaFiles(event);
        if (!mediaFiles.length) return;
        event.preventDefault();
        event.stopPropagation();
        await uploadMedia(node, mediaFiles, { append: true });
    });
}

let tipEl = null;
let tipTarget = null;
let tipTimer = 0;
let tipWired = false;
let pointerActive = false;

const TIP_HOVER_DELAY = 1000;

function hideTip() {
    tipTarget = null;
    clearTimeout(tipTimer);
    if (tipEl) {
        tipEl.remove();
        tipEl = null;
    }
}

function showTip(anchor, text) {
    if (tipEl) {
        tipEl.remove();
        tipEl = null;
    }
    if (!anchor || !text) return;
    const tip = document.createElement("div");
    tip.className = "zml-tip";
    tip.textContent = text;
    document.body.appendChild(tip);
    const btn = anchor.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    let left = btn.left + btn.width / 2 - box.width / 2;
    let top = btn.top - box.height - 18;
    let placement = "top";
    if (left < 6) left = 6;
    if (left + box.width > window.innerWidth - 6) left = window.innerWidth - box.width - 6;
    if (top < 6) {
        top = btn.bottom + 8;
        placement = "bottom";
    }
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.dataset.placement = placement;
    tipEl = tip;
    requestAnimationFrame(() => { if (tipEl === tip) tip.classList.add("is-visible"); });
}

function setTip(element, text) {
    if (!element) return;
    if (text) element.dataset.zmlTip = String(text);
    else delete element.dataset.zmlTip;
    if (element.title) element.removeAttribute("title");
}

function scheduleTip(anchor) {
    const text = anchor.dataset.zmlTip;
    if (!text || pointerActive) return;
    tipTarget = anchor;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
        if (tipTarget === anchor) showTip(anchor, text);
    }, TIP_HOVER_DELAY);
}

function wireTips() {
    if (tipWired) return;
    tipWired = true;
    document.addEventListener("pointerover", (event) => {
        if (!event.buttons) pointerActive = false;
        const anchor = event.target?.closest?.("[data-zml-tip]");
        if (!anchor || anchor === tipTarget) return;
        scheduleTip(anchor);
    }, true);
    document.addEventListener("pointerout", (event) => {
        if (!tipTarget) return;
        if (event.target?.closest?.("[data-zml-tip]") !== tipTarget) return;
        if (event.relatedTarget && tipTarget.contains(event.relatedTarget)) return;
        hideTip();
    }, true);
    document.addEventListener("pointerdown", () => {
        pointerActive = true;
        hideTip();
    }, true);
    document.addEventListener("pointerup", () => { pointerActive = false; }, true);
    document.addEventListener("pointercancel", () => { pointerActive = false; }, true);
    document.addEventListener("scroll", hideTip, true);
    window.addEventListener("blur", () => {
        pointerActive = false;
        hideTip();
    });
}

function makeModeButton(labelKey, onClick, hintKey) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zml-mode";
    button.textContent = $t(labelKey);
    if (hintKey) setTip(button, $t(hintKey));
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
    });
    return button;
}

function makeUi(node) {
    ensureStyleSheet();
    wireTips();
    const root = document.createElement("div");
    root.className = "zml-root";
    watchNodeModeVisual(node, root);
    attachMiddleDragPan(root);

    const panel = document.createElement("div");
    panel.className = "zml-panel";
    root.appendChild(panel);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = MEDIA_ACCEPT;
    input.multiple = true;
    input.style.display = "none";

    const load = makeLabeledButton($t("load"), FOLDER_ICON, () => input.click());
    const clearBtn = makeLabeledButton($t("clear"), CLEAR_ICON, () => {
        if (!parseRefs(node).length) return;
        showClearConfirm(() => clearMedia(node));
    }, "clear");
    const maxSize = makeIconButton($t("maxThumbSize"), MAX_ICON, () => toggleMaxThumbSize(node));
    const minSize = makeIconButton($t("minThumbSize"), MIN_ICON, () => toggleMinThumbSize(node));

    const sizeControl = document.createElement("div");
    sizeControl.className = "zml-size";
    const sizeRange = document.createElement("input");
    sizeRange.type = "range";
    sizeRange.className = "zml-range";
    sizeRange.min = String(THUMB_MIN_SIZE);
    sizeRange.max = String(THUMB_MAX_SIZE);
    sizeRange.step = "5";
    sizeRange.value = String(thumbSize(node));
    let resizeTimer = null;
    sizeRange.addEventListener("pointerdown", (event) => event.stopPropagation());
    sizeRange.addEventListener("input", () => {
        node.properties = node.properties || {};
        const nextSize = clampThumbSize(Number(sizeRange.value));
        node.properties.zhiai_media_loader_thumb_size = nextSize;
        if (nextSize < THUMB_MAX_SIZE) node.properties.zhiai_media_loader_prev_thumb_size = nextSize;
        rememberUiState({ thumb_size: nextSize });
        updateRangeFill(node);
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => renderLoader(node), 180);
        node.graph?.change?.();
        node.graph?.setDirtyCanvas?.(true, true);
    });
    sizeRange.addEventListener("change", () => {
        clearTimeout(resizeTimer);
        const nextSize = clampThumbSize(Number(sizeRange.value));
        node.properties = node.properties || {};
        node.properties.zhiai_media_loader_thumb_size = nextSize;
        rememberUiState({ thumb_size: nextSize });
        updateRangeFill(node);
        renderLoader(node);
        markGraphChanged(node);
    });
    const sizeLabel = document.createElement("span");
    sizeLabel.className = "zml-size-label";
    sizeControl.append(sizeLabel, minSize, sizeRange, maxSize);

    const modeGroup = document.createElement("div");
    modeGroup.className = "zml-mode-group";
    const modeSelect = makeModeButton("modeSelect", () => setOutputMode(node, "select"), "modeSelectHint");
    const modeNumbered = makeModeButton("modeNumbered", () => setOutputMode(node, "numbered"), "modeNumberedHint");
    modeGroup.append(modeSelect, modeNumbered);
    const modeFrame = document.createElement("div");
    modeFrame.className = "zml-mode-frame";
    const modeLabel = document.createElement("span");
    modeLabel.className = "zml-mode-label";
    modeFrame.appendChild(modeLabel);
    modeFrame.appendChild(modeGroup);

    const loadGroup = document.createElement("div");
    loadGroup.className = "zml-mode-group";
    const loadImage = makeModeButton("loadModeImage", () => setLoadMode(node, "image"), "loadModeImageHint");
    const loadMedia = makeModeButton("loadModeMedia", () => setLoadMode(node, "media"), "loadModeMediaHint");
    loadGroup.append(loadMedia, loadImage);
    const loadFrame = document.createElement("div");
    loadFrame.className = "zml-mode-frame";
    const loadModeLabel = document.createElement("span");
    loadModeLabel.className = "zml-mode-label";
    loadFrame.append(loadModeLabel, loadGroup);

    const filtersRow = document.createElement("div");
    filtersRow.className = "zml-filters";
    const filters = {};
    for (const key of FILTER_KEYS) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "zml-filter";
        chip.dataset.filter = key;
        const label = document.createElement("span");
        label.className = "zml-filter-label";
        chip.append(label);
        wireButton(chip, () => setMediaFilter(node, key));
        filtersRow.appendChild(chip);
        filters[key] = { chip, label };
    }
    filtersRow.appendChild(clearBtn);
    filtersRow.appendChild(load);

    const preview = document.createElement("div");
    preview.className = "zml-preview";
    preview.tabIndex = 0;
    const scroll = document.createElement("div");
    scroll.className = "zml-scroll";
    preview.append(filtersRow, scroll);
    installDropUpload(node, root, preview);
    installDropUpload(node, preview, preview);
    installPasteUpload(node, preview);

    const selectionBox = document.createElement("div");
    selectionBox.className = "zml-box";
    scroll.appendChild(selectionBox);

    let boxStart = null;
    preview.addEventListener("pointerdown", (event) => {
        preview.focus({ preventScroll: true });
        if (event.button !== 0) return;
        if (event.target.closest("[data-zml-card]") || event.target.closest("button")) return;
        event.preventDefault();
        event.stopPropagation();
        boxStart = previewPoint(scroll, event);
        preview.setPointerCapture?.(event.pointerId);
        Object.assign(selectionBox.style, {
            display: "block",
            left: `${boxStart.x}px`,
            top: `${boxStart.y}px`,
            width: "0px",
            height: "0px",
        });
    });
    preview.addEventListener("pointermove", (event) => {
        if (!boxStart) return;
        event.preventDefault();
        const { x, y } = previewPoint(scroll, event);
        Object.assign(selectionBox.style, {
            left: `${Math.min(boxStart.x, x)}px`,
            top: `${Math.min(boxStart.y, y)}px`,
            width: `${Math.abs(x - boxStart.x)}px`,
            height: `${Math.abs(y - boxStart.y)}px`,
        });
    });
    preview.addEventListener("dragover", (event) => {
        if (!Array.from(event.dataTransfer?.types || []).includes(DRAG_MIME)) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    preview.addEventListener("drop", (event) => {
        const raw = event.dataTransfer?.getData(DRAG_MIME);
        if (raw == null || raw === "") return;
        event.preventDefault();
        event.stopPropagation();
        reorderRefs(node, Number(raw), dropIndexFromPoint(scroll, event));
    });
    const finishBoxSelect = (event) => {
        if (!boxStart) return;
        event.preventDefault();
        const boxRect = selectionBox.getBoundingClientRect();
        const next = new Set();
        const current = selectedSet(node);
        for (const item of preview.querySelectorAll("[data-zml-card]")) {
            const itemRect = item.getBoundingClientRect();
            const overlaps = itemRect.left <= boxRect.right
                && itemRect.right >= boxRect.left
                && itemRect.top <= boxRect.bottom
                && itemRect.bottom >= boxRect.top;
            if (overlaps) next.add(Number(item.dataset.index));
        }
        const finalSelection = event.ctrlKey || event.metaKey ? new Set(current) : next;
        if (event.ctrlKey || event.metaKey) {
            for (const index of next) finalSelection.delete(index);
        }
        selectionBox.style.display = "none";
        boxStart = null;
        syncSelection(node, finalSelection);
    };
    preview.addEventListener("pointerup", finishBoxSelect);
    preview.addEventListener("pointercancel", finishBoxSelect);
    preview.addEventListener("keydown", (event) => {
        const ctrl = event.ctrlKey || event.metaKey;
        if (ctrl && event.key.toLowerCase() === "a") {
            event.preventDefault();
            event.stopPropagation();
            syncSelection(node, new Set(parseRefs(node).map((_, index) => index)));
            return;
        }
        if ((event.key === "Delete" || event.key === "Backspace") && ctrl) {
            event.preventDefault();
            event.stopPropagation();
            clearMedia(node);
            return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault();
            event.stopPropagation();
            removeSelected(node);
            return;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            syncSelection(node, new Set());
        }
    });

    input.addEventListener("change", async () => {
        const files = Array.from(input.files || []);
        await uploadMedia(node, files);
        input.value = "";
    });

    const footer = document.createElement("div");
    footer.className = "zml-footer";
    const footerBar = document.createElement("div");
    footerBar.className = "zml-f-bar";
    footer.append(footerBar);

    const toolbar = document.createElement("div");
    toolbar.className = "zml-toolbar";
    toolbar.append(loadFrame, modeFrame, sizeControl, input);
    panel.append(toolbar, preview, footer);
    node._zhmlEls = {
        root,
        panel,
        load,
        loadLabel: load.querySelector(".zml-btn-label"),
        clear: clearBtn,
        clearLabel: clearBtn.querySelector(".zml-btn-label"),
        maxSize,
        minSize,
        sizeLabel,
        sizeRange,
        modeSelect,
        modeNumbered,
        modeLabel,
        loadImage,
        loadMedia,
        loadModeLabel,
        input,
        filtersRow,
        filters,
        preview,
        scroll,
        footerBar,
        selectionBox,
    };
    return root;
}

function syncLoaderFrame(node) {
    const els = node?._zhmlEls;
    if (!els) return;
    const wrapper = els.root.closest(".dom-widget");
    if (wrapper) {
        wrapper.classList.add("zml-dom-widget");
        wrapper.style.boxSizing = "border-box";
        wrapper.style.overflow = "hidden";
    }
    els.root.style.width = "100%";
    els.root.style.height = "100%";
    if (els.panel) {
        els.panel.style.width = "100%";
        els.panel.style.height = "100%";
    }
}

function renderLoader(node) {
    const els = node._zhmlEls;
    if (!els) return;
    syncLoaderFrame(node);
    stopAudioPlayback();
    const seq = (node._zhmlRenderSeq || 0) + 1;
    node._zhmlRenderSeq = seq;
    const scrollTop = els.scroll.scrollTop || 0;
    const pendingScrollIndex = Number.isInteger(node._zhmlPendingScrollIndex) ? node._zhmlPendingScrollIndex : null;
    node._zhmlPendingScrollIndex = null;
    const refs = parseRefs(node);
    node._zhmlRenderedMedia = String(findWidget(node, "media_files")?.value ?? "");
    const targetScrollIndex = pendingScrollIndex == null || !refs.length
        ? null
        : Math.max(0, Math.min(refs.length - 1, pendingScrollIndex));
    const selected = selectedSet(node);
    clearStoredOutputRefs(node);
    const size = thumbSize(node);
    const ordinals = kindOrdinals(refs);
    const mode = outputMode(node);
    const imageOnly = loadMode(node) === "image";
    const kinds = imageOnly ? IMAGE_KINDS : MEDIA_KINDS;
    const entries = refs
        .map((ref, index) => ({ ref, index }))
        .filter((entry) => refIsVisible(kinds, entry.ref));
    const storedFilter = mediaFilter(node);
    const filter = !imageOnly && (storedFilter === "all" || kinds.includes(storedFilter)) ? storedFilter : "all";
    const filterDefs = [
        { key: "all", label: $t("filterAll") },
        { key: "image", label: $t("kindImage") },
        { key: "audio", label: $t("kindAudio") },
        { key: "video", label: $t("kindVideo") },
    ];
    const hasMedia = !imageOnly && entries.length > 0;
    for (const def of filterDefs) {
        const entry = els.filters[def.key];
        entry.label.textContent = def.label;
        entry.chip.classList.toggle("is-active", filter === def.key);
        entry.chip.style.display = hasMedia ? "" : "none";
    }
    els.filtersRow.style.display = "flex";

    setTip(els.load, $t("load"));
    els.load.setAttribute("aria-label", $t("load"));
    if (els.loadLabel) els.loadLabel.textContent = $t("load");
    setTip(els.clear, $t("clear"));
    els.clear.setAttribute("aria-label", $t("clear"));
    if (els.clearLabel) els.clearLabel.textContent = $t("clear");
    els.clear.disabled = !refs.length;
    const maximizeTip = size >= THUMB_MAX_SIZE ? $t("restoreThumbSize") : $t("maxThumbSize");
    const minimizeTip = size <= THUMB_MIN_SIZE ? $t("restoreThumbSize") : $t("minThumbSize");
    setTip(els.maxSize, maximizeTip);
    els.maxSize.setAttribute("aria-label", maximizeTip);
    setTip(els.minSize, minimizeTip);
    els.minSize.setAttribute("aria-label", minimizeTip);
    if (Number(els.sizeRange.value) !== size) els.sizeRange.value = String(size);
    updateRangeFill(node);
    els.modeSelect.textContent = $t("modeSelect");
    els.modeNumbered.textContent = $t("modeNumbered");
    setTip(els.modeSelect, $t("modeSelectHint"));
    setTip(els.modeNumbered, $t("modeNumberedHint"));
    els.modeSelect.classList.toggle("is-active", mode === "select");
    els.modeNumbered.classList.toggle("is-active", mode === "numbered");
    els.modeLabel.textContent = $t("modeLabel");
    els.sizeLabel.textContent = $t("thumbSize");
    els.loadModeLabel.textContent = $t("loadModeLabel");
    els.loadImage.textContent = $t("loadModeImage");
    els.loadMedia.textContent = $t("loadModeMedia");
    setTip(els.loadImage, $t("loadModeImageHint"));
    setTip(els.loadMedia, $t("loadModeMediaHint"));
    els.loadImage.classList.toggle("is-active", imageOnly);
    els.loadMedia.classList.toggle("is-active", !imageOnly);
    els.input.accept = imageOnly ? IMAGE_ACCEPT : MEDIA_ACCEPT;

    updateFooter(node);

    hideTip();
    els.scroll.replaceChildren();
    if (els.selectionBox) els.scroll.appendChild(els.selectionBox);
    if (!entries.length) {
        els.scroll.appendChild(buildEmptyState());
        return;
    }

    const shownKinds = filter === "all" ? kinds : kinds.filter((kind) => kind === filter);
    const groups = shownKinds
        .map((kind) => ({ kind, entries: entries.filter((entry) => (entry.ref.kind || "image") === kind) }))
        .filter((group) => group.entries.length);
    if (!groups.length) {
        const empty = document.createElement("div");
        empty.className = "zml-empty";
        empty.textContent = $t("filterEmpty");
        els.scroll.appendChild(empty);
        return;
    }
    const grids = new Map();
    for (const group of groups) {
        const section = document.createElement("div");
        section.className = "zml-section";
        const title = document.createElement("div");
        title.className = "zml-section-title";
        const titleText = document.createElement("span");
        titleText.textContent = $t(KIND_LABEL_KEYS[group.kind]);
        const titleCount = document.createElement("span");
        titleCount.className = "zml-section-count";
        titleCount.textContent = `[${group.entries.length}]`;
        title.append(makeKindDot(group.kind), titleText, titleCount);
        const grid = document.createElement("div");
        grid.className = "zml-grid";
        section.append(title, grid);
        els.scroll.appendChild(section);
        grids.set(group.kind, grid);
    }

    const jobs = [];
    for (const group of groups) {
        for (const entry of group.entries) jobs.push({ group, entry });
    }
    let jobIndex = 0;
    const appendBatch = () => {
        if (seq !== node._zhmlRenderSeq) return;
        const end = Math.min(jobIndex + BATCH_PER_FRAME, jobs.length);
        for (; jobIndex < end; jobIndex += 1) {
            const { group, entry } = jobs[jobIndex];
            const card = makeCardFor(
                node,
                entry.ref,
                entry.index,
                size,
                selected.has(entry.index),
                mode === "numbered" ? ordinals.get(entry.index) || entry.index + 1 : null,
            );
            grids.get(group.kind).appendChild(card);
        }
        if (jobIndex === end) {
            els.scroll.scrollTop = scrollTop;
        }
        if (jobIndex < jobs.length) {
            requestAnimationFrame(appendBatch);
        } else if (targetScrollIndex != null) {
            requestAnimationFrame(() => ensureIndexVisible(node, targetScrollIndex));
        }
    };
    appendBatch();
}

function syncRenderedMedia(node) {
    if (!node._zhmlEls) return;
    const raw = String(findWidget(node, "media_files")?.value ?? "");
    if (raw === node._zhmlRenderedMedia) return;
    renderLoader(node);
}

function refreshLocaleIfNeeded(node) {
    const current = getLocale();
    if (localeCache.get(node) === current) return;
    localeCache.set(node, current);
    renderLoader(node);
}

function installLoaderUi(node) {
    if (node._zhmlWidget || typeof node.addDOMWidget !== "function") return;
    ensureInternalWidgets(node);
    syncLoaderState(node);
    const root = makeUi(node);
    const widget = node.addDOMWidget("multimedia_advanced_loader_panel", "div", root, {
        serialize: false,
        hideOnZoom: false,
    });
    widget.serialize = false;
    widget.computeLayoutSize = () => ({
        minWidth: LOADER_MIN_WIDTH,
        minHeight: LOADER_MIN_HEIGHT,
        maxWidth: 1000000,
        maxHeight: 1000000,
    });
    widget.beforeQueued = () => {
        stageOutputRefs(node);
    };
    Object.defineProperty(widget, "width", {
        configurable: true,
        get() {
            return this.node?.width || this.node?.size?.[0] || LOADER_MIN_WIDTH;
        },
        set() {},
    });
    const output = findWidget(node, OUTPUT_WIDGET);
    if (output) {
        output.serializeValue = () => JSON.stringify(stageOutputRefs(node));
    }
    node._zhmlWidget = widget;
    syncLoaderFrame(node);
    requestAnimationFrame(() => syncLoaderFrame(node));
    setTimeout(() => {
        if (!node.graph) return;
        const width = Math.max(node.size?.[0] ?? 0, LOADER_MIN_WIDTH);
        const height = Math.max(node.computeSize?.([width, 0])?.[1] ?? 0, LOADER_MIN_HEIGHT);
        if (node.size && (node.size[0] < width || node.size[1] < height)) {
            node.setSize([width, height]);
        }
    }, 0);
    localeCache.set(node, getLocale());
    renderLoader(node);
    applyNode(node);
}

const HELP_ICON_SIZE = 24;
const HELP_ICON_MARGIN = 4;

function getLoaderHelpHTML() {
    const heading = "margin:12px 0 8px 0;color:#60A5FA;font-size:14px;font-weight:600;letter-spacing:0.5px;";
    const item = "margin:4px 0;padding-left:6px;list-style:none;color:#E2E8F0;";
    const list = (keys) => `<ul style="margin:0;padding:0;">${keys.map((key) => `<li style="${item}">${$t(key)}</li>`).join("")}</ul>`;
    return `<h3 style="margin:0 0 12px 0;color:#93C5FD;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(147,197,253,0.2);letter-spacing:0.2px;">${$t("helpTitle")}</h3>
<p style="margin:0 0 16px 0;color:#E2E8F0;">${$t("helpDescription")}</p>
<h4 style="${heading}">${$t("helpFeatures")}</h4>
${list(["helpFeature1", "helpFeature2", "helpFeature3", "helpFeature4", "helpFeature5"])}
<h4 style="${heading}">${$t("helpUsage")}</h4>
${list(["helpUsage1", "helpUsage2", "helpUsage3"])}
<h4 style="${heading}">${$t("helpInput")}</h4>
${list(["helpInputDesc"])}
<h4 style="${heading}">${$t("helpOutput")}</h4>
${list(["helpOutputDesc"])}`;
}

function createLoaderHelpPopup() {
    const popup = document.createElement("div");
    popup.className = "zml-help";
    popup.style.cssText = [
        "background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
        "backdrop-filter: blur(16px)",
        "-webkit-backdrop-filter: blur(16px)",
        "position: absolute",
        "color: #E2E8F0",
        "font: 13px 'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
        "line-height: 1.6",
        "padding: 20px 24px 24px 24px",
        "border-radius: 10px",
        "border: 1px solid rgba(147, 197, 253, 0.3)",
        "z-index: 1000",
        "overflow: hidden",
        "max-width: 560px",
        "max-height: 600px",
        "min-width: 400px",
        "box-shadow: 0 0 40px rgba(59, 130, 246, 0.15), 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    ].join(";") + ";";
    popup.innerHTML = `<div style="overflow-y:auto;max-height:540px;padding-right:8px;scrollbar-width:thin;scrollbar-color:rgba(147,197,253,0.3) transparent;">${getLoaderHelpHTML()}</div>`;
    document.body.appendChild(popup);
    return popup;
}

app.registerExtension({
    name: "ZhiaiNodes.MultimediaAdvancedLoader",
    async nodeCreated(node) {
        if (nodeClass(node) !== NODE_CLASS) return;
        installLoaderUi(node);
    },
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== NODE_CLASS) return;
        const onCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            onCreated?.apply(this, arguments);
            installLoaderUi(this);
        };
        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            onConfigure?.apply(this, arguments);
            try {
                syncLoaderState(this);
            } catch (_) {
            }
            setTimeout(() => {
                installLoaderUi(this);
                try {
                    syncLoaderState(this);
                } catch (_) {
                }
                if (this._zhmlEls) renderLoader(this);
            }, 0);
        };
        const onSerialize = nodeType.prototype.onSerialize;
        nodeType.prototype.onSerialize = function (data) {
            let result;
            try {
                result = onSerialize?.apply(this, arguments);
            } catch (_) {
                result = undefined;
            }
            try {
                const loadValue = loadMode(this);
                const outputValue = outputMode(this);
                const size = thumbSize(this);
                this.properties = this.properties || {};
                this.properties.zhiai_media_loader_load_mode = loadValue;
                this.properties.zhiai_media_loader_output_mode = outputValue;
                this.properties.zhiai_media_loader_thumb_size = size;
                if (data && data.properties) {
                    data.properties.zhiai_media_loader_load_mode = loadValue;
                    data.properties.zhiai_media_loader_output_mode = outputValue;
                    data.properties.zhiai_media_loader_thumb_size = size;
                }
            } catch (_) {
            }
            return result;
        };
        const onResize = nodeType.prototype.onResize;
        nodeType.prototype.onResize = function (size) {
            onResize?.apply(this, arguments);
            if (size && size[0] < LOADER_MIN_WIDTH) {
                this.setSize([LOADER_MIN_WIDTH, size[1]]);
            }
            if (!this._zhmlEls) return;
            syncLoaderFrame(this);
            this.graph?.setDirtyCanvas?.(true, true);
        };
        const helpIconTop = () => -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - HELP_ICON_SIZE) / 2;
        nodeType.prototype._zhmlHelpIconLeft = function () {
            return this.size[0] - HELP_ICON_SIZE - HELP_ICON_MARGIN;
        };
        nodeType.prototype._zhmlHitHelp = function (localPos) {
            if (!localPos) return false;
            const left = this._zhmlHelpIconLeft();
            const top = helpIconTop();
            return localPos[0] > left && localPos[0] < left + HELP_ICON_SIZE
                && localPos[1] > top && localPos[1] < top + HELP_ICON_SIZE;
        };

        const onDrawForeground = nodeType.prototype.onDrawForeground;
        nodeType.prototype.onDrawForeground = function (ctx) {
            const result = onDrawForeground?.apply(this, arguments);
            if (this._zhmlEls) {
                refreshLocaleIfNeeded(this);
                syncRenderedMedia(this);
            }
            if (this.flags?.collapsed) return result;

            const locale = getLocale();
            if (this._zhmlHelp && !this._zhmlHelpPopup) {
                this._zhmlHelpPopupLocale = locale;
                this._zhmlHelpPopup = createLoaderHelpPopup();
            } else if (!this._zhmlHelp && this._zhmlHelpPopup) {
                this._zhmlHelpPopup.remove();
                this._zhmlHelpPopup = null;
                this._zhmlHelpPopupLocale = null;
            } else if (this._zhmlHelp && this._zhmlHelpPopup && this._zhmlHelpPopupLocale !== locale) {
                this._zhmlHelpPopup.querySelector("div").innerHTML = getLoaderHelpHTML();
                this._zhmlHelpPopupLocale = locale;
            }
            if (this._zhmlHelp && this._zhmlHelpPopup) {
                const rect = ctx.canvas.getBoundingClientRect();
                const scaleX = rect.width / ctx.canvas.width;
                const scaleY = rect.height / ctx.canvas.height;
                const canvasRect = app.canvas.canvas.getBoundingClientRect();
                const transform = new DOMMatrix()
                    .scaleSelf(scaleX, scaleY)
                    .multiplySelf(ctx.getTransform())
                    .translateSelf(this.size[0] * scaleX * Math.max(1.0, window.devicePixelRatio), 0)
                    .translateSelf(10, -32);
                this._zhmlHelpPopup.style.left = `${transform.e + canvasRect.x}px`;
                this._zhmlHelpPopup.style.top = `${transform.f + canvasRect.y}px`;
            }

            const active = !!this._zhmlHelp || !!this._zhmlHelpHovered;
            ctx.save();
            ctx.translate(this._zhmlHelpIconLeft(), helpIconTop());
            ctx.scale(HELP_ICON_SIZE / 32, HELP_ICON_SIZE / 32);
            drawNodeHelpButton(ctx, active);
            ctx.restore();
            return result;
        };

        const onMouseDown = nodeType.prototype.onMouseDown;
        nodeType.prototype.onMouseDown = function (e, localPos, canvas) {
            const result = onMouseDown?.apply(this, arguments);
            if (this._zhmlHitHelp(localPos)) {
                hideTitleTip();
                this._zhmlHelp = !this._zhmlHelp;
                this.setDirtyCanvas?.(true, true);
                return true;
            }
            return result;
        };

        const onMouseMove = nodeType.prototype.onMouseMove;
        nodeType.prototype.onMouseMove = function (e, localPos, canvas) {
            const result = onMouseMove?.apply(this, arguments);
            const hovered = this._zhmlHitHelp(localPos);
            if (hovered !== this._zhmlHelpHovered) {
                this._zhmlHelpHovered = hovered;
                this.setDirtyCanvas?.(true, true);
            }
            titleTipHovered(hovered, getLocale() === "zh" ? "节点帮助" : "Node help", e);
            return result;
        };

        const onMouseLeave = nodeType.prototype.onMouseLeave;
        nodeType.prototype.onMouseLeave = function () {
            const result = onMouseLeave?.apply(this, arguments);
            if (this._zhmlHelpHovered) {
                this._zhmlHelpHovered = false;
                this.setDirtyCanvas?.(true, true);
            }
            hideTitleTip();
            return result;
        };

        const onRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function () {
            const result = onRemoved?.apply(this, arguments);
            hideTip();
            if (this._zhmlHelpPopup) {
                this._zhmlHelpPopup.remove();
                this._zhmlHelpPopup = null;
                this._zhmlHelpPopupLocale = null;
            }
            this._zhmlHelp = false;
            this._zhmlHelpHovered = false;
            return result;
        };
    },
});
