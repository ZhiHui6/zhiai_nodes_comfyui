import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import { getLocale } from "./zhiai_i18n.js";
import {
    PANEL_TOKENS,
    attachPanelTooltip,
    createIconButton,
    createPanel,
    injectPanelStyles,
} from "./panel_kit.js";
import { orderedOutputRefs } from "./multimedia_advanced_loader.js";

const MANIFEST_KEY = "zinManifest";
const NON_IMAGE_KINDS = ["audio", "video"];
const PREVIEW_LIMIT = 32;
const LIVE_THUMB_EDGE = 128;

const INIT_WIDTH = 545;
const INIT_HEIGHT = 620;

const STRINGS = {
    zh: {
        gridTitle: "图像编号",
        empty: "运行后生成缩略图",
        stale: "预览已过期",
        staleHint: "重新运行节点即可刷新预览",
        liveNote: "实时预览 · 未运行",
        viewerClose: "关闭",
        missing: "该帧无法生成预览，编号仍保留",
    },
    en: {
        gridTitle: "Image Index",
        empty: "Run to generate thumbnails",
        stale: "Preview expired",
        staleHint: "Re-run the node to refresh the preview",
        liveNote: "Live preview · not run",
        viewerClose: "Close",
        missing: "No preview for this frame; its index is kept",
    },
};

function $t(key) {
    const locale = getLocale();
    const table = STRINGS[locale] || STRINGS.en;
    return table[key] ?? STRINGS.en[key] ?? key;
}

function zinLabel(index) {
    return getLocale() === "zh" ? `图${index}` : `Img ${index}`;
}

function zinSummaryText(total) {
    return getLocale() === "zh" ? `共 ${total} 张` : `${total} images`;
}

function zinLimitedText(shown) {
    return getLocale() === "zh"
        ? `仅预览前 ${shown} 张，编号仍覆盖全部`
        : `Only the first ${shown} previews are shown; numbering still covers all`;
}

const ICONS = {
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.6 16.4l3.9-3.9a1.7 1.7 0 0 1 2.4 0l3.5 3.5"/><path d="M13.9 18.4l3.1-3.1a1.7 1.7 0 0 1 2.4 0l1 1"/><circle cx="8.6" cy="9.4" r="1.4"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
};

function zinSvg(key, size = 14) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[key] || ""}</svg>`;
}

injectPanelStyles("image-indexer", `
.pk-panel-host.zin-panel .pk-card__note { margin-left: auto; }

.zin-grid {
    --zin-tile-w: 96px;
    --zin-tile-h: 128px;
    display: grid;
    grid-template-columns: repeat(auto-fill, var(--zin-tile-w));
    grid-auto-rows: var(--zin-tile-h);
    justify-content: start;
    align-content: start;
    gap: 8px;
}
.zin-tile {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;
    min-height: 0;
    margin: 0;
    padding: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
    background: rgba(2, 6, 23, 0.28);
    border: 1px solid ${PANEL_TOKENS.color.line};
    border-radius: ${PANEL_TOKENS.radius.sm};
    overflow: hidden;
    transition: background ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.zin-tile:hover,
.zin-tile:focus-visible {
    background: ${PANEL_TOKENS.color.glassHover};
}
.zin-tile:focus-visible { outline: 2px solid ${PANEL_TOKENS.color.primaryLight}; outline-offset: 1px; }
.zin-tile__frame {
    position: relative;
    display: block;
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    border-radius: calc(${PANEL_TOKENS.radius.sm} - 1px) calc(${PANEL_TOKENS.radius.sm} - 1px) 0 0;
    background: rgba(2, 6, 23, 0.42);
}
.zin-tile__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: filter ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.zin-tile:hover .zin-tile__img,
.zin-tile:focus-visible .zin-tile__img { filter: brightness(1.25); }
.zin-tile__badge {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 3;
    min-width: 20px;
    height: 16px;
    padding: 0 5px;
    border: 1px solid ${PANEL_TOKENS.color.primaryLight};
    border-radius: 4px;
    background: ${PANEL_TOKENS.color.primaryDeep};
    color: #FFFFFF;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
}
.zin-tile__meta {
    flex: 0 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    padding: 2px 5px 3px;
    border-radius: 0 0 calc(${PANEL_TOKENS.radius.sm} - 1px) calc(${PANEL_TOKENS.radius.sm} - 1px);
    background: #1A3562;
    text-align: center;
}
.zin-tile__name {
    display: block;
    max-width: 100%;
    font-size: 8.5px;
    line-height: 1.25;
    color: ${PANEL_TOKENS.color.primaryLight};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.zin-tile__size {
    display: block;
    font-size: 8px;
    line-height: 1.25;
    color: ${PANEL_TOKENS.color.primaryLight};
    font-variant-numeric: tabular-nums;
}
.zin-tile__stale {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    font-size: 11px;
    line-height: 1.4;
    color: ${PANEL_TOKENS.color.textFaint};
    text-align: center;
}
.zin-empty {
    font-size: ${PANEL_TOKENS.type.micro};
    color: ${PANEL_TOKENS.color.textFaint};
    text-align: center;
}
.pk-panel-host--fill .zin-empty {
    margin: auto;
    padding: 10px 0;
}

.zin-viewer {
    position: fixed;
    inset: 0;
    z-index: 10100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22px;
    background: rgba(2, 6, 23, 0.72);
    backdrop-filter: ${PANEL_TOKENS.blur.panel};
    -webkit-backdrop-filter: ${PANEL_TOKENS.blur.panel};
}
.zin-viewer__dialog {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: min(1180px, 94vw);
    max-height: 90vh;
    min-width: 0;
    padding: 0 12px 12px;
    border-radius: ${PANEL_TOKENS.radius.lg};
    background: linear-gradient(180deg, #0e1a2e, #070e1b);
    box-shadow: ${PANEL_TOKENS.shadow.panel};
    overflow: hidden;
}
.zin-viewer__dialog::after {
    content: "";
    position: absolute;
    inset: -0.5px;
    border: 1px solid ${PANEL_TOKENS.color.line};
    border-radius: calc(${PANEL_TOKENS.radius.lg} + 0.5px);
    pointer-events: none;
}
.zin-viewer__head {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    height: 38px;
    margin: 7px -12px 6px -12px;
    padding: 0 10px;
}
.zin-viewer__badge {
    flex: 0 0 auto;
    min-width: 18px;
    height: 18px;
    padding: 0 6px;
    border: 1px solid ${PANEL_TOKENS.color.primaryLight};
    border-radius: 4px;
    background: ${PANEL_TOKENS.color.primaryDeep};
    color: #FFFFFF;
    font-size: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-variant-numeric: tabular-nums;
}
.zin-viewer__name {
    min-width: 0;
    font-size: ${PANEL_TOKENS.type.body};
    font-weight: 600;
    color: ${PANEL_TOKENS.color.textBright};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.zin-viewer__size {
    flex: 0 0 auto;
    font-size: ${PANEL_TOKENS.type.micro};
    color: ${PANEL_TOKENS.color.textFaint};
    font-variant-numeric: tabular-nums;
}
.zin-viewer__tools {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
}
.zin-viewer__body {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    min-width: 0;
}
.zin-viewer__img {
    max-width: 100%;
    max-height: calc(90vh - 62px);
    object-fit: contain;
    display: block;
    border-radius: ${PANEL_TOKENS.radius.sm};
}
`);


const viewer = {
    overlay: null,
    tiles: [],
    position: 0,
    els: null,
    tools: null,
};

function viewerKeydown(event) {
    if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeViewer();
    }
}

function closeViewer() {
    if (!viewer.overlay) return;
    viewer.overlay.remove();
    viewer.overlay = null;
    viewer.els = null;
    viewer.tools = null;
    document.removeEventListener("keydown", viewerKeydown, true);
}

function renderViewer() {
    const tile = viewer.tiles[viewer.position];
    if (!tile || !viewer.els) return;
    const url = zinTileUrl(tile, "zoom");
    viewer.els.img.hidden = !url;
    if (url) viewer.els.img.src = url;
    viewer.els.img.alt = zinLabel(tile.index);
    viewer.els.badge.textContent = zinLabel(tile.index);
    viewer.els.name.textContent = tile.source || "";
    viewer.els.size.textContent = zinSizeText(tile);
}

function openViewer(tiles, position) {
    closeViewer();
    viewer.tiles = tiles;
    viewer.position = position;

    const overlay = document.createElement("div");
    overlay.className = "zin-viewer";
    overlay.tabIndex = -1;
    overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
    overlay.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });

    const dialog = document.createElement("div");
    dialog.className = "zin-viewer__dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");

    const head = document.createElement("div");
    head.className = "zin-viewer__head";
    const badge = document.createElement("span");
    badge.className = "zin-viewer__badge";
    const name = document.createElement("span");
    name.className = "zin-viewer__name";
    const size = document.createElement("span");
    size.className = "zin-viewer__size";
    const tools = document.createElement("div");
    tools.className = "zin-viewer__tools";

    const mkBtn = (icon, label, onClick, variant) => createIconButton({
        icon,
        iconSize: 15,
        size: "sm",
        render: zinSvg,
        label,
        tooltip: label,
        variant,
        onClick,
    });

    viewer.tools = {
        close: mkBtn("close", $t("viewerClose"), closeViewer, "danger"),
    };
    tools.append(viewer.tools.close.el);
    head.append(badge, name, size, tools);

    const body = document.createElement("div");
    body.className = "zin-viewer__body";
    const img = document.createElement("img");
    img.className = "zin-viewer__img";
    body.appendChild(img);

    dialog.append(head, body);
    overlay.appendChild(dialog);
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay || event.target === body) closeViewer();
    });

    document.body.appendChild(overlay);
    viewer.overlay = overlay;
    viewer.els = { badge, name, size, img };
    document.addEventListener("keydown", viewerKeydown, true);
    renderViewer();
    overlay.focus();
}


function zinTileUrl(tile, kind) {
    if (!tile) return "";
    if (tile.live) {
        if (!tile.ref) return "";
        return kind === "zoom" ? zinLoaderOriginalUrl(tile.ref) : zinLoaderThumbUrl(tile.ref);
    }
    if (!tile.subfolder) return "";
    const file = kind === "zoom" ? (tile.zoom || tile.thumb) : (tile.thumb || tile.zoom);
    if (!file) return "";
    return api.apiURL(`/view?filename=${encodeURIComponent(file)}&type=temp&subfolder=${encodeURIComponent(tile.subfolder)}`);
}

function zinSizeText(tile) {
    return tile.width && tile.height ? `${tile.width}×${tile.height}` : "";
}

function zinEmptyManifest() {
    return { tiles: [], total: 0, limited: false };
}

function zinReadStored(node) {
    const stored = node?.properties?.[MANIFEST_KEY];
    return stored && Array.isArray(stored.tiles) ? stored : zinEmptyManifest();
}

function zinCurrentManifest(node) {
    return node._zinManifest || zinReadStored(node);
}

function zinWriteStored(node, manifest) {
    node.properties = node.properties || {};
    node.properties[MANIFEST_KEY] = manifest;
}

function zinUpstreamLoader(node) {
    const source = node?.getInputNode?.(0);
    return source && source.comfyClass === "MultimediaAdvancedLoader" ? source : null;
}

function zinLoaderWidget(source, name) {
    return (source?.widgets || []).find((entry) => entry?.name === name) || null;
}

function zinUpstreamSignature(node) {
    const source = zinUpstreamLoader(node);
    if (!source) return "";
    const selected = source._zhmlSelected instanceof Set ? [...source._zhmlSelected].sort((a, b) => a - b) : [];
    return [
        zinLoaderWidget(source, "load_mode")?.value ?? "",
        zinLoaderWidget(source, "output_mode")?.value ?? "",
        zinLoaderWidget(source, "media_files")?.value ?? "",
        selected.join(","),
    ].join("|");
}

function zinNormalizeRef(ref) {
    if (typeof ref === "string") {
        const text = ref.trim().replace(/\\/g, "/");
        const parts = text.split("/").filter((part) => part && part !== ".");
        const name = parts.pop() || "";
        const relative = Boolean(name) && !text.startsWith("/") && !/^[A-Za-z]:/.test(text) && !parts.includes("..");
        return {
            source: name || text,
            width: 0,
            height: 0,
            urlRef: relative ? { name, subfolder: parts.join("/"), type: "input" } : null,
        };
    }
    if (!ref || typeof ref !== "object") return null;
    const name = String(ref.name || "").split(/[\\/]/).pop() || "";
    if (!name) return null;
    return {
        source: name,
        width: Number(ref.width) || 0,
        height: Number(ref.height) || 0,
        urlRef: {
            name,
            subfolder: String(ref.subfolder || "").replace(/^[/\\]+|[/\\]+$/g, ""),
            type: String(ref.type || "input") || "input",
        },
    };
}

function zinUpstreamImageRefs(node) {
    const source = zinUpstreamLoader(node);
    if (!source) return null;
    let refs;
    try {
        refs = orderedOutputRefs(source);
    } catch (err) {
        return null;
    }
    if (!Array.isArray(refs)) return null;
    const images = [];
    for (const ref of refs) {
        const kind = String((ref && typeof ref === "object" ? ref.kind : "") || "image").toLowerCase();
        if (NON_IMAGE_KINDS.includes(kind)) continue;
        const entry = zinNormalizeRef(ref);
        if (entry) images.push(entry);
    }
    return images;
}

function zinLoaderThumbUrl(ref) {
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    const params = new URLSearchParams();
    params.set("name", ref.name);
    params.set("type", ref.type || "input");
    params.set("size", String(LIVE_THUMB_EDGE * dpr));
    if (ref.subfolder) params.set("subfolder", ref.subfolder);
    return api.apiURL(`/zhiai/media_loader/thumbnail?${params.toString()}`);
}

function zinLoaderOriginalUrl(ref) {
    const params = new URLSearchParams();
    params.set("filename", ref.name);
    params.set("type", ref.type || "input");
    if (ref.subfolder) params.set("subfolder", ref.subfolder);
    return api.apiURL(`/view?${params.toString()}`);
}

function zinLiveManifest(node) {
    const refs = zinUpstreamImageRefs(node);
    if (!refs) return null;
    const tiles = refs.slice(0, PREVIEW_LIMIT).map((entry, index) => ({
        index: index + 1,
        source: entry.source,
        width: entry.width,
        height: entry.height,
        live: true,
        ref: entry.urlRef,
    }));
    return { tiles, total: refs.length, limited: refs.length > PREVIEW_LIMIT, live: true };
}

function zinResolveSources(node, tileCount) {
    const refs = zinUpstreamImageRefs(node);
    if (!refs) return [];
    const names = refs.map((entry) => entry.source);
    return names.length === tileCount ? names : [];
}

function zinManifestState(node) {
    const executed = zinCurrentManifest(node);
    const live = zinLiveManifest(node);
    const armed = Boolean(node._zinUpstreamWatch?.armed);
    const hasExecuted = Boolean((executed.tiles || []).length);
    if (!live || (hasExecuted && !armed)) return { manifest: executed, live: false };
    const executedNames = (executed.tiles || []).map((tile) => tile.source || "");
    const liveNames = live.tiles.map((tile) => tile.source || "");
    const same = executedNames.length === liveNames.length
        && liveNames.every((name, index) => name && name === executedNames[index]);
    return same ? { manifest: executed, live: false } : { manifest: live, live: true };
}

function zinBuildGrid(node) {
    const body = node._zinCardBody;
    if (!body) return;

    const state = zinManifestState(node);
    const manifest = state.manifest;
    const tiles = manifest.tiles || [];
    body.textContent = "";

    if (!tiles.length) {
        const empty = document.createElement("div");
        empty.className = "zin-empty";
        empty.textContent = $t("empty");
        attachPanelTooltip(empty, () => $t("staleHint"));
        body.appendChild(empty);
    } else {
        const grid = document.createElement("div");
        grid.className = "zin-grid";
        grid.setAttribute("role", "list");
        tiles.forEach((tile, index) => {
            grid.appendChild(zinCreateTile(node, tile, index, tiles));
        });
        body.appendChild(grid);
    }

    const notes = [zinSummaryText(manifest.total || tiles.length)];
    if (manifest.limited) notes.push(zinLimitedText(tiles.length));
    if (state.live) notes.push($t("liveNote"));
    node._zinCard?.setNote(notes.join("  ·  "));
}

function zinCreateTile(node, tile, index, tiles) {
    const tileEl = document.createElement("button");
    tileEl.type = "button";
    tileEl.className = "zin-tile";
    tileEl.setAttribute("role", "listitem");
    tileEl.setAttribute("aria-label", zinLabel(tile.index));

    const frame = document.createElement("span");
    frame.className = "zin-tile__frame";
    const badge = document.createElement("span");
    badge.className = "zin-tile__badge";
    badge.textContent = zinLabel(tile.index);
    frame.appendChild(badge);

    const thumbUrl = zinTileUrl(tile, "thumb");
    if (thumbUrl) {
        const img = document.createElement("img");
        img.className = "zin-tile__img";
        img.src = thumbUrl;
        img.alt = zinLabel(tile.index);
        img.decoding = "async";
        img.addEventListener("error", () => {
            img.remove();
            const stale = document.createElement("span");
            stale.className = "zin-tile__stale";
            stale.textContent = $t("stale");
            frame.appendChild(stale);
            zinResizeToContent(node);
        });
        frame.appendChild(img);
    } else {
        const stale = document.createElement("span");
        stale.className = "zin-tile__stale";
        stale.textContent = $t("missing");
        frame.appendChild(stale);
    }

    const meta = document.createElement("span");
    meta.className = "zin-tile__meta";
    if (tile.source) {
        const name = document.createElement("span");
        name.className = "zin-tile__name";
        name.textContent = tile.source;
        attachPanelTooltip(name, () => `${zinLabel(tile.index)} · ${tile.source}`);
        meta.appendChild(name);
    }
    const sizeText = zinSizeText(tile);
    if (sizeText) {
        const size = document.createElement("span");
        size.className = "zin-tile__size";
        size.textContent = sizeText;
        meta.appendChild(size);
    }

    tileEl.appendChild(frame);
    if (meta.childElementCount) tileEl.appendChild(meta);
    tileEl.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!zinTileUrl(tile, "zoom")) return;
        openViewer(tiles, index);
    });
    return tileEl;
}

function zinResizeToContent(node) {
    if (!node || typeof node.computeSize !== "function") return;
    window.requestAnimationFrame(() => {
        if (!node.graph || node._zinResizing) return;
        node._zinPanel?.measure?.();
        const computed = node.computeSize();
        if (!Array.isArray(computed)) return;
        const width = node.size?.[0] ?? computed[0];
        const currentHeight = node.size?.[1] ?? 0;
        const height = Math.max(computed[1], currentHeight);
        if (height === currentHeight) return;
        node._zinResizing = true;
        try {
            node.setSize([width, height]);
        } finally {
            node._zinResizing = false;
        }
        node.graph?.setDirtyCanvas?.(true, true);
    });
}

function zinEnsurePanel(node) {
    if (node._zinPanel || !node.addDOMWidget) return;
    const panelApi = createPanel({
        node,
        layout: [{ id: "zin", titleKey: "gridTitle", icon: "image" }],
        className: "zin-panel",
        widgetName: "zin_panel",
        minWidth: 0,
        fill: true,
        fillMinHeight: 240,
        t: $t,
        icon: zinSvg,
    });
    if (!panelApi) return;
    node._zinPanel = panelApi;
    const card = panelApi.cards.get("zin");
    if (!card) return;
    node._zinCard = card;
    node._zinCardBody = card.fields;
}

function zinRefresh(node, manifest) {
    if (manifest) node._zinManifest = manifest;
    zinBuildGrid(node);
    zinResizeToContent(node);
}

function zinWatchUpstream(node) {
    if (node._zinUpstreamWatch) return;
    const state = { signature: zinUpstreamSignature(node), seen: false, armed: false };
    node._zinUpstreamWatch = state;
    const previousDraw = node.onDrawForeground;
    node.onDrawForeground = function () {
        const signature = zinUpstreamSignature(node);
        if (signature === state.signature) {
            if (signature) state.seen = true;
            return previousDraw ? previousDraw.apply(this, arguments) : undefined;
        }
        if (signature && state.seen) state.armed = true;
        state.signature = signature;
        if (signature) state.seen = true;
        window.requestAnimationFrame(() => {
            if (node.graph) zinRefresh(node);
        });
        return previousDraw ? previousDraw.apply(this, arguments) : undefined;
    };
}

app.registerExtension({
    name: "zhiai_nodes.ImageIndexer",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData?.name !== "ImageIndexer") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
            this.properties = this.properties || {};
            this.setSize([INIT_WIDTH, INIT_HEIGHT]);
            window.setTimeout(() => {
                zinEnsurePanel(this);
                zinWatchUpstream(this);
                zinRefresh(this);
                window.setTimeout(() => { if (this.graph) zinResizeToContent(this); }, 160);
                window.setTimeout(() => { if (this.graph) zinResizeToContent(this); }, 460);
            }, 100);
            return result;
        };

        const onExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function (message) {
            onExecuted?.apply(this, arguments);
            const tiles = Array.isArray(message?.zin_tiles) ? message.zin_tiles : [];
            const sources = zinResolveSources(this, tiles.length);
            tiles.forEach((tile, index) => {
                if (sources[index]) tile.source = sources[index];
            });
            const manifest = {
                tiles,
                total: Number(message?.zin_total?.[0] ?? tiles.length) || 0,
                limited: Boolean(message?.zin_limited?.[0]),
            };
            zinWriteStored(this, manifest);
            zinEnsurePanel(this);
            zinRefresh(this, manifest);
        };

        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            const result = onConfigure ? onConfigure.apply(this, arguments) : undefined;
            window.setTimeout(() => {
                zinEnsurePanel(this);
                zinWatchUpstream(this);
                zinRefresh(this, zinReadStored(this));
                window.setTimeout(() => { if (this.graph) zinResizeToContent(this); }, 200);
            }, 0);
            return result;
        };

        const onResize = nodeType.prototype.onResize;
        nodeType.prototype.onResize = function (size) {
            const result = onResize ? onResize.apply(this, arguments) : undefined;
            const free = typeof this.computeSize === "function" ? this.computeSize() : null;
            if (Array.isArray(size) && Array.isArray(free) && size[1] < free[1]) {
                this.setSize([size[0], free[1]]);
            }
            window.requestAnimationFrame(() => {
                if (this.graph) this.setDirtyCanvas?.(true, true);
            });
            return result;
        };

        const onRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function () {
            onRemoved?.apply(this, arguments);
            closeViewer();
            this._zinPanel?.destroy?.();
            this._zinPanel = null;
            this._zinCard = null;
            this._zinCardBody = null;
            this._zinManifest = null;
        };
    },
});
