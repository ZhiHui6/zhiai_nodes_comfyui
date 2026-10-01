const STYLE_ID = "zhiai-template-category-styles";
const MAX_LENGTH = 24;

export const CATEGORY_ALL = "__all__";
export const CATEGORY_NONE = "__none__";
export const CATEGORY_MAX_LENGTH = MAX_LENGTH;

const RENAME_URL = "/zhihui_nodes/template_categories/rename";
const REMOVE_URL = "/zhihui_nodes/template_categories/remove";

const ICONS = {
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m6 6 1 14h10l1-14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
};

const CATEGORY_CSS = `
.tc-filter { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.tc-filter[hidden] { display: none; }
.tc-chip {
    display: inline-flex; align-items: center; gap: 5px; max-width: 100%;
    padding: 4px 10px; font-family: inherit; font-size: var(--tc-chip-font, 12px); line-height: 1.45;
    color: var(--tc-chip-fg, #AFC4DC); background: var(--tc-chip-bg, rgba(255,255,255,.05));
    border: 1px solid var(--tc-chip-border, rgba(255,255,255,.12)); border-radius: var(--tc-chip-radius, 999px);
    cursor: pointer; transition: color 140ms ease, background-color 140ms ease, border-color 140ms ease;
}
.tc-chip:not(.tc-chip--active):hover {
    color: var(--tc-chip-fg-hover, #DCE9F7); background: var(--tc-chip-bg-hover, rgba(255,255,255,.09));
    border-color: var(--tc-chip-border-hover, rgba(255,255,255,.22));
}
.tc-chip--active {
    color: var(--tc-chip-fg-active, #0A1120); background: var(--tc-chip-bg-active, #9CC2F5);
    border-color: var(--tc-chip-border-active, #9CC2F5);
}
.tc-chip__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc-chip__count { font-size: 0.92em; opacity: 0.7; }
.tc-tool {
    display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; padding: 0;
    color: inherit; background: transparent; border: none; border-radius: 50%; cursor: pointer; opacity: 0.62;
    transition: opacity 140ms ease, background-color 140ms ease;
}
.tc-tool:hover { opacity: 1; background: var(--tc-tool-bg-hover, rgba(255,255,255,.18)); }
.tc-tool--accent { color: var(--tc-accent, #93C5FD); opacity: 0.9; }
.tc-tool--danger { color: var(--tc-danger, #DC2626); opacity: 0.9; }
.tc-filter :focus-visible { outline: 2px solid var(--tc-focus, #9CC2F5); outline-offset: 2px; }
.tc-manage-btn {
    display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px;
    font-family: inherit; font-size: var(--tc-chip-font, 12px); line-height: 1.45;
    color: var(--tc-chip-fg, #AFC4DC); background: transparent;
    border: 1px dashed var(--tc-chip-border, rgba(255,255,255,.12));
    border-radius: var(--tc-chip-radius, 999px); cursor: pointer;
    transition: color 140ms ease, background-color 140ms ease, border-color 140ms ease;
}
.tc-manage-btn:hover {
    color: var(--tc-chip-fg-hover, #DCE9F7); background: var(--tc-chip-bg-hover, rgba(255,255,255,.09));
    border-color: var(--tc-chip-border-hover, rgba(255,255,255,.22));
}
.tc-manage {
    position: fixed; z-index: 10050; box-sizing: border-box; overflow: hidden;
    display: flex; flex-direction: column; padding: 10px 12px 12px;
    font-family: inherit; font-size: var(--tc-field-font, 13px); color: var(--tc-field-fg, #DDE9F5);
    max-height: min(320px, 60vh); max-width: calc(100vw - 12px);
    background: var(--tc-popover-bg, rgba(9,17,32,.97)); border: 1px solid var(--tc-popover-border, #2C5080);
    border-radius: var(--tc-popover-radius, 8px); box-shadow: var(--tc-popover-shadow, 0 18px 40px rgba(2,6,23,.62));
    outline: none;
}
.tc-manage__head { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; }
.tc-manage__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 1.08em; font-weight: 600; }
.tc-manage__close {
    display: inline-flex; align-items: center; justify-content: center; flex: none; width: 26px; height: 26px; padding: 0;
    color: #FFFFFF; background: var(--tc-danger, #DC2626); border: 1px solid var(--tc-danger, #DC2626); border-radius: 6px; cursor: pointer;
    transition: background-color 120ms ease, border-color 120ms ease;
}
.tc-manage__close:hover { background: var(--tc-danger-hover, #EF4444); border-color: var(--tc-danger-hover, #EF4444); }
.tc-manage__list {
    display: flex; flex-direction: column; gap: 4px; min-height: 0; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: var(--tc-popover-border, #2C5080) transparent;
}
.tc-manage__list::-webkit-scrollbar { width: 8px; }
.tc-manage__list::-webkit-scrollbar-thumb { background: var(--tc-popover-border, #2C5080); border-radius: 4px; }
.tc-manage__list::-webkit-scrollbar-track { background: transparent; }
.tc-manage__row { display: flex; align-items: center; gap: 8px; min-height: 30px; padding: 3px 4px 3px 10px; border-radius: 6px; }
.tc-manage__row:hover { background: var(--tc-popover-hover, rgba(59,130,246,.16)); }
.tc-manage__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc-manage__actions { display: inline-flex; align-items: center; gap: 2px; flex: none; }
.tc-manage__row .tc-tool { width: 24px; height: 24px; border-radius: 6px; }
.tc-manage__row .tc-input { flex: 1; min-width: 0; }
.tc-manage__create {
    display: flex; align-items: center; gap: 6px; flex: none;
    margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--tc-popover-divider, rgba(96,165,250,.18));
}
.tc-manage__create .tc-input { flex: 1; min-width: 0; }
.tc-manage__create .tc-tool { width: 24px; height: 24px; border-radius: 6px; }
.tc-manage__empty { padding: 20px 8px; text-align: center; opacity: 0.72; }
.tc-manage :focus-visible { outline: 2px solid var(--tc-focus, #9CC2F5); outline-offset: 2px; }
.tc-badge {
    display: inline-flex; align-items: center; padding: 1px 8px; font-size: var(--tc-badge-font, 11.5px); line-height: 1.5;
    color: var(--tc-badge-fg, #9CC2F5); background: var(--tc-badge-bg, rgba(156,194,245,.12));
    border: 1px solid var(--tc-badge-border, rgba(156,194,245,.28)); border-radius: var(--tc-badge-radius, 999px);
}
.tc-picker { display: inline-flex; align-items: center; gap: 6px; width: 100%; }
.tc-select, .tc-input {
    box-sizing: border-box; font-family: inherit; font-size: var(--tc-field-font, 13px); line-height: 1.5;
    color: var(--tc-field-fg, #DDE9F5); background: var(--tc-field-bg, rgba(255,255,255,.04));
    border: 1px solid var(--tc-field-border, #2C5080); border-radius: var(--tc-field-radius, 6px);
    padding: var(--tc-field-padding, 7px 9px);
}
.tc-select {
    flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px;
    text-align: left; cursor: pointer;
}
.tc-select__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc-select__caret { flex: none; display: inline-flex; opacity: 0.75; }
.tc-select[aria-expanded="true"] { border-color: var(--tc-field-border-focus, #3B82F6); }
.tc-select:hover { border-color: var(--tc-field-border-hover, #3B82F6); }
.tc-select:focus, .tc-input:focus { outline: none; border-color: var(--tc-field-border-focus, #3B82F6); }
.tc-input { flex: 1; min-width: 0; }
.tc-picker :focus-visible { outline: 2px solid var(--tc-focus, #9CC2F5); outline-offset: 2px; }
.tc-popup {
    position: fixed; z-index: 10050; box-sizing: border-box;
    display: flex; flex-direction: column; padding: 6px;
    max-width: calc(100vw - 12px);
    font-family: inherit; font-size: var(--tc-field-font, 13px); color: var(--tc-field-fg, #DDE9F5);
    max-height: var(--tc-popover-max-height, 264px); overflow-y: auto;
    background: var(--tc-popover-bg, rgba(9,17,32,.97)); border: 1px solid var(--tc-popover-border, #2C5080);
    border-radius: var(--tc-popover-radius, 8px); box-shadow: var(--tc-popover-shadow, 0 18px 40px rgba(2,6,23,.62));
    scrollbar-width: thin; scrollbar-color: var(--tc-popover-border, #2C5080) transparent;
}
.tc-popup::-webkit-scrollbar { width: 8px; }
.tc-popup::-webkit-scrollbar-thumb { background: var(--tc-popover-border, #2C5080); border-radius: 4px; }
.tc-popup::-webkit-scrollbar-track { background: transparent; }
.tc-option {
    display: flex; align-items: center; gap: 8px; flex: none; width: 100%;
    padding: 7px 8px; font-family: inherit; font-size: inherit; line-height: 1.4; text-align: left;
    color: inherit; background: transparent; border: none; border-radius: 6px; cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
}
.tc-option:hover {
    color: var(--tc-popover-fg-hover, #F2FAFF); background: var(--tc-popover-hover, rgba(59,130,246,.16));
}
.tc-option:focus-visible {
    outline: 2px solid var(--tc-focus, #9CC2F5); outline-offset: -2px;
    color: var(--tc-popover-fg-hover, #F2FAFF); background: var(--tc-popover-hover, rgba(59,130,246,.16));
}
.tc-option__label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc-option__mark { flex: none; display: inline-flex; color: var(--tc-popover-check, #93C5FD); opacity: 0; }
.tc-option[aria-selected="true"] { color: var(--tc-popover-fg-hover, #F2FAFF); font-weight: 500; }
.tc-option[aria-selected="true"] .tc-option__mark { opacity: 1; }
`;

export const COMFY_CATEGORY_THEME = {
    "tc-chip-font": "11.5px",
    "tc-chip-fg": "var(--descrip-text)",
    "tc-chip-bg": "rgba(255, 255, 255, 0.03)",
    "tc-chip-border": "var(--border-color)",
    "tc-chip-fg-hover": "var(--input-text)",
    "tc-chip-bg-hover": "rgba(102, 126, 234, 0.14)",
    "tc-chip-border-hover": "#667eea",
    "tc-chip-bg-active": "#667eea",
    "tc-chip-fg-active": "#FFFFFF",
    "tc-chip-border-active": "#667eea",
    "tc-tool-bg-hover": "rgba(255, 255, 255, 0.16)",
    "tc-focus": "#667eea",
    "tc-badge-font": "11px",
    "tc-badge-fg": "#A5B4FC",
    "tc-badge-bg": "rgba(102, 126, 234, 0.16)",
    "tc-badge-border": "rgba(102, 126, 234, 0.4)",
    "tc-field-font": "13px",
    "tc-field-fg": "var(--input-text)",
    "tc-field-bg": "var(--comfy-input-bg)",
    "tc-field-border": "var(--border-color)",
    "tc-field-border-hover": "#667eea",
    "tc-field-border-focus": "#667eea",
    "tc-field-radius": "6px",
    "tc-popover-bg": "var(--comfy-menu-bg)",
    "tc-popover-border": "var(--border-color)",
    "tc-popover-hover": "rgba(102, 126, 234, 0.18)",
    "tc-popover-fg-hover": "var(--input-text)",
    "tc-popover-radius": "8px",
    "tc-popover-shadow": "0 16px 36px rgba(0, 0, 0, 0.5)",
    "tc-popover-check": "#A5B4FC",
    "tc-popover-divider": "var(--border-color)",
    "tc-popover-max-height": "264px",
    "tc-accent": "#667eea",
    "tc-danger": "#DC2626",
    "tc-danger-hover": "#EF4444",
};

export function applyCategoryTheme(element, theme) {
    for (const [key, value] of Object.entries(theme || {})) {
        element.style.setProperty("--" + key.replace(/^-+/, ""), String(value));
    }
    return element;
}

function ensureTemplateCategoryStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CATEGORY_CSS;
    document.head.appendChild(style);
}

function iconSvg(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + (ICONS[name] || "") + "</svg>";
}

export function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function normalizeCategory(value) {
    const chars = [];
    for (const char of String(value ?? "").trim()) {
        const code = char.codePointAt(0);
        if (code >= 32 && code !== 127) chars.push(char);
        if (chars.length >= MAX_LENGTH) break;
    }
    return chars.join("").trim();
}

const LOCAL_CATEGORY_NAMES = new Set();

export function deriveCategories(templates) {
    const names = [];
    for (const template of templates || []) {
        const name = normalizeCategory(template && template.category);
        if (name && !names.includes(name)) names.push(name);
    }
    for (const name of LOCAL_CATEGORY_NAMES) {
        if (!names.includes(name)) names.push(name);
    }
    return names;
}

function isLocalOnly(name) {
    return LOCAL_CATEGORY_NAMES.has(name);
}

function registerLocalCategory(name) {
    LOCAL_CATEGORY_NAMES.add(name);
}

export function countByCategory(templates) {
    const counts = new Map();
    for (const template of templates || []) {
        const name = normalizeCategory(template && template.category);
        counts.set(name, (counts.get(name) || 0) + 1);
    }
    return counts;
}

function normalizeFilter(value) {
    if (value === CATEGORY_ALL || value === CATEGORY_NONE) return value;
    const name = normalizeCategory(value);
    return name || CATEGORY_NONE;
}

export function matchesCategory(template, filter) {
    const name = normalizeCategory(template && template.category);
    if (!filter || filter === CATEGORY_ALL) return true;
    if (filter === CATEGORY_NONE) return name === "";
    return name === normalizeCategory(filter);
}

async function postCategoryRequest(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const result = await response.json().catch(() => ({}));
        const categories = Array.isArray(result && result.categories)
            ? result.categories.map(normalizeCategory).filter(Boolean)
            : null;
        return { ok: response.ok && result && result.status === "success", result, categories };
    } catch (error) {
        return { ok: false, result: null, error };
    }
}

export function requestCategoryRename(from, to) {
    const source = normalizeCategory(from);
    if (!source) return Promise.resolve({ ok: false, result: null, error: "empty-category" });
    return postCategoryRequest(RENAME_URL, { from: source, to: normalizeCategory(to) });
}

export function requestCategoryRemove(name) {
    const source = normalizeCategory(name);
    if (!source) return Promise.resolve({ ok: false, result: null, error: "empty-category" });
    return postCategoryRequest(REMOVE_URL, { name: source });
}

export function categoryBadgeHtml(category, filter) {
    if (filter === CATEGORY_ALL) return "";
    const name = normalizeCategory(category);
    if (!name) return "";
    return '<span class="tc-badge">' + escapeHtml(name) + "</span>";
}

export function buildCategoryFilter(options = {}) {
    ensureTemplateCategoryStyles();
    const {
        allLabel = "All",
        noneLabel = "Uncategorized",
        renameLabel = "Rename",
        removeLabel = "Delete",
        manageLabel = "Manage categories",
        manageEmptyLabel = "No categories yet",
        newPlaceholder = "New category",
        confirmLabel = "OK",
        cancelLabel = "Cancel",
        closeLabel = "Close",
        manage = true,
        showCounts = true,
        onPick = () => {},
        onRenamed = () => {},
        onRequestRemove = () => {},
        onError = () => {},
    } = options;

    let templates = Array.isArray(options.templates) ? options.templates : [];
    let active = options.active == null ? CATEGORY_ALL : normalizeFilter(options.active);
    let editing = null;
    let panel = null;
    let anchor = null;

    const element = document.createElement("div");
    element.className = "tc-filter";

    function entries() {
        const counts = countByCategory(templates);
        const list = [{ key: CATEGORY_ALL, label: allLabel, count: templates.length, category: null }];
        for (const name of deriveCategories(templates)) {
            list.push({ key: name, label: name, count: counts.get(name) || 0, category: name });
        }
        const uncategorized = counts.get("") || 0;
        if (uncategorized > 0) list.push({ key: CATEGORY_NONE, label: noneLabel, count: uncategorized, category: null });
        return list;
    }

    function pick(key) {
        if (key !== active) {
            active = key;
            render();
            onPick(active);
        }
    }

    function toolButton(icon, label, handler, variant) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = variant ? "tc-tool tc-tool--" + variant : "tc-tool";
        button.title = label;
        button.setAttribute("aria-label", label);
        button.innerHTML = iconSvg(icon, 12);
        button.onclick = (event) => {
            event.stopPropagation();
            handler();
        };
        return button;
    }

    function chip(entry) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = entry.key === active ? "tc-chip tc-chip--active" : "tc-chip";

        const label = document.createElement("span");
        label.className = "tc-chip__label";
        label.textContent = entry.label;
        button.appendChild(label);

        if (showCounts && entry.count > 0) {
            const count = document.createElement("span");
            count.className = "tc-chip__count";
            count.textContent = String(entry.count);
            button.appendChild(count);
        }

        button.onclick = () => pick(entry.key);
        return button;
    }

    function manageButton() {
        if (anchor) return anchor;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tc-manage-btn";
        button.title = manageLabel;
        button.setAttribute("aria-label", manageLabel);
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-expanded", "false");
        const label = document.createElement("span");
        label.className = "tc-chip__label";
        label.textContent = manageLabel;
        button.innerHTML = iconSvg("gear", 12);
        button.appendChild(label);
        button.onclick = openManager;
        anchor = button;
        return button;
    }

    function displayRow(name) {
        const row = document.createElement("div");
        row.className = "tc-manage__row";

        const label = document.createElement("span");
        label.className = "tc-manage__name";
        label.textContent = name;
        row.appendChild(label);

        const actions = document.createElement("span");
        actions.className = "tc-manage__actions";
        actions.append(
            toolButton("pen", renameLabel, () => {
                editing = name;
                renderPanel();
            }, "accent"),
            toolButton("trash", removeLabel, () => removeCategory(name), "danger")
        );
        row.appendChild(actions);
        return row;
    }

    function hasTemplates(name) {
        return (countByCategory(templates).get(name) || 0) > 0;
    }

    function removeCategory(name) {
        LOCAL_CATEGORY_NAMES.delete(name);
        if (hasTemplates(name)) {
            onRequestRemove(name);
            return;
        }
        render();
    }

    function renameRow(name) {
        const row = document.createElement("div");
        row.className = "tc-manage__row";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "tc-input";
        input.maxLength = MAX_LENGTH;
        input.value = name;
        input.setAttribute("aria-label", renameLabel);

        const commit = async () => {
            const next = normalizeCategory(input.value);
            editing = null;
            if (!next || next === name) {
                render();
                return;
            }
            if (!hasTemplates(name)) {
                LOCAL_CATEGORY_NAMES.delete(name);
                if (!deriveCategories(templates).includes(next)) LOCAL_CATEGORY_NAMES.add(next);
                if (active === name) active = next;
                render();
                return;
            }
            const response = await requestCategoryRename(name, next);
            if (response.ok) {
                if (active === name) active = next;
                await onRenamed(name, next, response.categories);
                render();
            } else {
                render();
                onError(response);
            }
        };

        input.onkeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                commit();
            } else if (event.key === "Escape") {
                event.stopPropagation();
                editing = null;
                render();
            }
        };

        const actions = document.createElement("span");
        actions.className = "tc-manage__actions";
        actions.append(
            toolButton("check", confirmLabel, commit, "accent"),
            toolButton("close", cancelLabel, () => {
                editing = null;
                render();
            })
        );

        row.append(input, actions);
        requestAnimationFrame(() => {
            input.focus();
            input.select();
        });
        return row;
    }

    function createForm() {
        const wrap = document.createElement("div");
        wrap.className = "tc-manage__create";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "tc-input";
        input.maxLength = MAX_LENGTH;
        input.placeholder = newPlaceholder;
        input.setAttribute("aria-label", newPlaceholder);

        const commit = () => {
            const name = normalizeCategory(input.value);
            if (!name) return;
            input.value = "";
            if (!deriveCategories(templates).includes(name)) registerLocalCategory(name);
            render();
        };

        input.onkeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                commit();
            } else if (event.key === "Escape") {
                event.stopPropagation();
                input.value = "";
            }
        };

        wrap.append(input, toolButton("check", confirmLabel, commit, "accent"));
        return wrap;
    }

    function renderPanel() {
        if (!panel) return;
        const listEl = panel.querySelector(".tc-manage__list");
        const names = deriveCategories(templates);
        if (!names.length) {
            const empty = document.createElement("div");
            empty.className = "tc-manage__empty";
            empty.textContent = manageEmptyLabel;
            listEl.replaceChildren(empty);
            return;
        }
        listEl.replaceChildren(...names.map((name) => (
            editing === name ? renameRow(name) : displayRow(name)
        )));
    }

    function placeManager() {
        if (!panel || !anchor || !anchor.isConnected) return;
        const rect = anchor.getBoundingClientRect();
        const gap = 6;
        panel.style.minWidth = Math.round(Math.max(rect.width, 200)) + "px";
        const width = panel.offsetWidth;
        const height = panel.offsetHeight;
        const below = window.innerHeight - rect.bottom - gap;
        const above = rect.top - gap;
        let top = height > below && above > below ? rect.top - height - gap : rect.bottom + gap;
        let left = rect.left;
        if (left + width > window.innerWidth - gap) left = window.innerWidth - width - gap;
        top = Math.max(gap, Math.min(top, window.innerHeight - height - gap));
        panel.style.top = Math.round(top) + "px";
        panel.style.left = Math.round(Math.max(gap, left)) + "px";
    }

    function onManagerOutside(event) {
        if (panel && (panel.contains(event.target) || (anchor && anchor.contains(event.target)))) return;
        closeManager();
    }

    function onManagerShift() {
        if (!anchor || !anchor.isConnected) closeManager();
        else placeManager();
    }

    function closeManager() {
        if (!panel) return;
        panel.remove();
        panel = null;
        editing = null;
        if (anchor) anchor.setAttribute("aria-expanded", "false");
        document.removeEventListener("pointerdown", onManagerOutside, true);
        window.removeEventListener("scroll", onManagerShift, true);
        window.removeEventListener("resize", onManagerShift);
    }

    function openManager() {
        if (panel || !anchor) return;
        const shell = document.createElement("div");
        shell.className = "tc-manage";
        shell.tabIndex = -1;
        shell.setAttribute("role", "dialog");
        shell.setAttribute("aria-label", manageLabel);

        const head = document.createElement("div");
        head.className = "tc-manage__head";
        const title = document.createElement("span");
        title.className = "tc-manage__title";
        title.textContent = manageLabel;
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "tc-manage__close";
        closeButton.title = closeLabel;
        closeButton.setAttribute("aria-label", closeLabel);
        closeButton.innerHTML = iconSvg("close", 14);
        closeButton.onclick = closeManager;
        head.append(title, closeButton);

        const listEl = document.createElement("div");
        listEl.className = "tc-manage__list";

        shell.append(head, listEl, createForm());
        shell.onkeydown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                closeManager();
                anchor.focus();
            }
        };

        panel = shell;
        anchor.setAttribute("aria-expanded", "true");
        mirrorTheme(element, shell);
        document.body.appendChild(shell);
        renderPanel();
        placeManager();
        document.addEventListener("pointerdown", onManagerOutside, true);
        window.addEventListener("scroll", onManagerShift, true);
        window.addEventListener("resize", onManagerShift);
    }

    function render() {
        const list = entries();
        if (editing !== null && !list.some((entry) => entry.category === editing)) editing = null;
        const names = deriveCategories(templates);
        element.hidden = names.length === 0 && !manage;
        const nodes = list.map((entry) => chip(entry));
        if (manage) nodes.unshift(manageButton());
        element.replaceChildren(...nodes);
        renderPanel();
    }

    function sync(nextTemplates) {
        templates = Array.isArray(nextTemplates) ? nextTemplates : [];
        const list = entries();
        if (active !== CATEGORY_ALL && (deriveCategories(templates).length === 0 || !list.some((entry) => entry.key === active))) {
            active = CATEGORY_ALL;
            onPick(active);
        }
        render();
    }

    render();

    return {
        element,
        sync,
        render,
        getActive: () => active,
        setActive: (key) => {
            active = normalizeFilter(key);
            render();
        },
    };
}

const THEME_VARS = [
    "tc-chip-font", "tc-chip-fg", "tc-chip-bg", "tc-chip-border", "tc-chip-fg-hover",
    "tc-chip-bg-hover", "tc-chip-border-hover", "tc-chip-radius", "tc-tool-bg-hover",
    "tc-field-font", "tc-field-fg", "tc-field-bg", "tc-field-border", "tc-field-radius",
    "tc-field-padding", "tc-field-border-hover", "tc-field-border-focus",
    "tc-popover-bg", "tc-popover-border", "tc-popover-hover", "tc-popover-fg-hover",
    "tc-popover-radius", "tc-popover-shadow", "tc-popover-check", "tc-popover-divider",
    "tc-popover-max-height", "tc-focus", "tc-accent", "tc-danger", "tc-danger-hover",
];

let openPicker = null;

function mirrorTheme(source, target) {
    const computed = window.getComputedStyle(source);
    target.style.fontFamily = computed.fontFamily;
    for (const name of THEME_VARS) {
        const value = computed.getPropertyValue("--" + name).trim();
        if (value) target.style.setProperty("--" + name, value);
    }
}

export function buildCategoryPicker(options = {}) {
    ensureTemplateCategoryStyles();
    const { noneLabel = "Uncategorized" } = options;

    let categories = Array.isArray(options.categories)
        ? options.categories.map(normalizeCategory).filter(Boolean)
        : [];
    let selected = normalizeCategory(options.value);

    const element = document.createElement("div");
    element.className = "tc-picker";

    const select = document.createElement("button");
    select.type = "button";
    select.className = "tc-select";
    select.setAttribute("aria-haspopup", "listbox");
    select.setAttribute("aria-expanded", "false");

    const selectLabel = document.createElement("span");
    selectLabel.className = "tc-select__label";

    const caret = document.createElement("span");
    caret.className = "tc-select__caret";
    caret.innerHTML = iconSvg("chevron", 14);

    select.append(selectLabel, caret);
    element.append(select);

    let popup = null;

    function paint() {
        closePopup();
        selectLabel.textContent = selected || noneLabel;
    }

    function optionRow(value, label, isSelected) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "tc-option";
        row.dataset.value = value;
        row.setAttribute("role", "option");
        row.setAttribute("aria-selected", String(!!isSelected));
        const text = document.createElement("span");
        text.className = "tc-option__label";
        text.textContent = label;
        const mark = document.createElement("span");
        mark.className = "tc-option__mark";
        mark.innerHTML = iconSvg("check", 13);
        row.append(text, mark);
        return row;
    }

    function optionRows() {
        return popup ? [...popup.querySelectorAll(".tc-option")] : [];
    }

    function focusRow(step) {
        const items = optionRows();
        if (!items.length) return;
        const index = items.indexOf(document.activeElement);
        if (index < 0) {
            const marked = items.findIndex((row) => row.getAttribute("aria-selected") === "true");
            items[marked >= 0 ? marked : 0].focus();
            return;
        }
        items[(index + step + items.length) % items.length].focus();
    }

    function focusEdge(last) {
        const items = optionRows();
        if (items.length) items[last ? items.length - 1 : 0].focus();
    }

    function place() {
        if (!popup || !select.isConnected) return;
        const rect = select.getBoundingClientRect();
        const gap = 6;
        popup.style.minWidth = Math.round(Math.min(rect.width, window.innerWidth - gap * 2)) + "px";
        const width = popup.offsetWidth;
        const height = popup.offsetHeight;
        const below = window.innerHeight - rect.bottom - gap;
        const above = rect.top - gap;
        let top = height > below && above > below ? rect.top - height - gap : rect.bottom + gap;
        let left = rect.left;
        if (left + width > window.innerWidth - gap) left = window.innerWidth - width - gap;
        top = Math.max(gap, Math.min(top, window.innerHeight - height - gap));
        popup.style.top = Math.round(top) + "px";
        popup.style.left = Math.round(Math.max(gap, left)) + "px";
    }

    function closePopup() {
        if (!popup) return;
        popup.remove();
        popup = null;
        select.setAttribute("aria-expanded", "false");
        document.removeEventListener("pointerdown", onOutsidePointerDown, true);
        window.removeEventListener("scroll", onViewportShift, true);
        window.removeEventListener("resize", onViewportShift);
        if (openPicker === closePopup) openPicker = null;
    }

    function onOutsidePointerDown(event) {
        if (popup && (popup.contains(event.target) || select.contains(event.target))) return;
        closePopup();
    }

    function onViewportShift() {
        if (select.isConnected) place();
        else closePopup();
    }

    function onOptionClick(event) {
        const row = event.target.closest(".tc-option");
        if (!row || !popup || !popup.contains(row)) return;
        selected = row.dataset.value === CATEGORY_NONE ? "" : row.dataset.value;
        closePopup();
        paint();
        select.focus();
    }

    function onPopupKeyDown(event) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            focusRow(event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            focusEdge(event.key === "End");
        } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            closePopup();
            select.focus();
        } else if (event.key === "Tab") {
            closePopup();
        }
    }

    function openPopup() {
        if (popup || !select.isConnected) return;
        if (openPicker) openPicker();
        const popupEl = document.createElement("div");
        popupEl.className = "tc-popup";
        popupEl.setAttribute("role", "listbox");
        popupEl.append(optionRow(CATEGORY_NONE, noneLabel, !selected));
        for (const name of categories) popupEl.append(optionRow(name, name, name === selected));
        popupEl.addEventListener("click", onOptionClick);
        popupEl.addEventListener("keydown", onPopupKeyDown);

        popup = popupEl;
        document.body.appendChild(popupEl);
        mirrorTheme(select, popupEl);
        select.setAttribute("aria-expanded", "true");
        openPicker = closePopup;
        place();
        document.addEventListener("pointerdown", onOutsidePointerDown, true);
        window.addEventListener("scroll", onViewportShift, true);
        window.addEventListener("resize", onViewportShift);
        focusRow(0);
    }

    select.onclick = () => {
        if (popup) closePopup();
        else openPopup();
    };

    select.onkeydown = (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (popup) focusRow(event.key === "ArrowDown" ? 1 : -1);
            else openPopup();
        } else if (event.key === "Escape" && popup) {
            event.preventDefault();
            closePopup();
        }
    };

    paint();

    return {
        element,
        select,
        value: () => selected,
        setCategories(list) {
            categories = (Array.isArray(list) ? list : []).map(normalizeCategory).filter(Boolean);
            if (selected && !categories.includes(selected)) selected = "";
            paint();
        },
        setValue(next) {
            const name = normalizeCategory(next);
            if (name && !categories.includes(name)) categories.push(name);
            selected = name;
            paint();
        },
    };
}