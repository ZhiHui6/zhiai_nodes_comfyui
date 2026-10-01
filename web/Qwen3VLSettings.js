import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import {
    CATEGORY_ALL,
    COMFY_CATEGORY_THEME,
    applyCategoryTheme,
    buildCategoryFilter,
    buildCategoryPicker,
    categoryBadgeHtml,
    deriveCategories,
    escapeHtml,
    matchesCategory,
    requestCategoryRemove,
} from "./template_categories.js";

const SETTINGS_CATEGORY_THEME = {
    ...COMFY_CATEGORY_THEME,
    "tc-chip-fg": "#9CA3AF",
    "tc-chip-bg": "rgba(255, 255, 255, 0.04)",
    "tc-chip-border": "rgba(255, 255, 255, 0.15)",
    "tc-chip-fg-hover": "#E8E8E8",
    "tc-chip-bg-hover": "rgba(255, 255, 255, 0.09)",
    "tc-chip-bg-active": "#6366F1",
    "tc-chip-border-active": "#6366F1",
    "tc-focus": "#6366F1",
    "tc-field-fg": "#E8E8E8",
    "tc-field-bg": "#111827",
    "tc-field-border": "rgba(255, 255, 255, 0.15)",
    "tc-field-border-hover": "#6366F1",
    "tc-field-border-focus": "#6366F1",
    "tc-field-font": "14px",
    "tc-field-padding": "10px 12px",
    "tc-popover-bg": "#1F2937",
    "tc-popover-border": "rgba(255, 255, 255, 0.15)",
    "tc-popover-hover": "rgba(99, 102, 241, 0.2)",
    "tc-popover-fg-hover": "#E8E8E8",
    "tc-popover-shadow": "0 12px 28px rgba(0, 0, 0, 0.5)",
    "tc-popover-divider": "rgba(255, 255, 255, 0.12)",
    "tc-accent": "#6366F1",
};

const i18n = {
    zh: {
        modelManager: "⚙️ 模型管理",
        templateTooltip: "点击选择系统提示词模板",
        clearTooltip: "点击清空当前输入框内容",
        restoreTooltip: "点击恢复上次清空的内容",
        clearContent: "已清空内容",
        restoreContent: "已恢复内容",
        noContentToClear: "没有可清空的内容",
        noContentToRestore: "没有可恢复的内容",
        manageTemplates: "管理模板",
        selectTemplate: "选择模板",
        searchTemplates: "搜索模板...",
        templateCategory: "分类",
        categoryAll: "全部",
        categoryNone: "未分类",
        categoryNamePlaceholder: "输入分类名称",
        categoryRename: "重命名分类",
        categoryDelete: "删除分类",
        confirmDeleteCategory: "确定要删除分类「{name}」吗？该分类下的模板会变为未分类。",
        categoryDeleted: "分类已删除",
        categoryDeleteFailed: "分类删除失败",
        categoryRenamed: "分类已重命名",
        categoryRenameFailed: "分类重命名失败",
        categoryManage: "管理分类",
        categoryManageEmpty: "暂无分类",
        close: "关闭",
        noTemplates: "暂无模板，请在设置界面中管理模板",
        templateApplied: "模板已应用",
        checking: "加载中...",
        edit: "编辑",
        delete: "删除",
        cancel: "取消",
        confirm: "确定",
        save: "保存",
        createTemplate: "创建模板",
        importFromLM: "从LM模板调用",
        templateNamePlaceholder: "模板名称",
        templateContentPlaceholder: "模板内容",
        templateNameRequired: "请输入模板名称",
        templateCreated: "模板已创建",
        templateUpdated: "模板已更新",
        templateDeleted: "模板已删除",
        templateCreateFailed: "创建模板失败",
        templateUpdateFailed: "更新模板失败",
        templateDeleteFailed: "删除模板失败",
        confirmDelete: "确认删除此模板？"
    },
    en: {
        modelManager: "⚙️ Model Manager",
        templateTooltip: "Click to select a system prompt template",
        clearTooltip: "Click to clear the current input content",
        restoreTooltip: "Click to restore the last cleared content",
        clearContent: "Content cleared",
        restoreContent: "Content restored",
        noContentToClear: "No content to clear",
        noContentToRestore: "No content to restore",
        manageTemplates: "Manage Templates",
        selectTemplate: "Select Template",
        searchTemplates: "Search templates...",
        templateCategory: "Category",
        categoryAll: "All",
        categoryNone: "Uncategorized",
        categoryNamePlaceholder: "Enter category name",
        categoryRename: "Rename category",
        categoryDelete: "Delete category",
        confirmDeleteCategory: "Delete the category “{name}”? Its templates will become uncategorized.",
        categoryDeleted: "Category deleted",
        categoryDeleteFailed: "Failed to delete category",
        categoryRenamed: "Category renamed",
        categoryRenameFailed: "Failed to rename category",
        categoryManage: "Manage categories",
        categoryManageEmpty: "No categories yet",
        close: "Close",
        noTemplates: "No templates yet. Manage templates in the settings interface",
        templateApplied: "Template applied",
        checking: "Loading...",
        edit: "Edit",
        delete: "Delete",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        createTemplate: "Create Template",
        importFromLM: "Import from LM Presets",
        templateNamePlaceholder: "Template name",
        templateContentPlaceholder: "Template content",
        templateNameRequired: "Template name is required",
        templateCreated: "Template created",
        templateUpdated: "Template updated",
        templateDeleted: "Template deleted",
        templateCreateFailed: "Failed to create template",
        templateUpdateFailed: "Failed to update template",
        templateDeleteFailed: "Failed to delete template",
        confirmDelete: "Are you sure you want to delete this template?"
    }
};

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function $t(key) {
    const locale = getLocale();
    return i18n[locale][key] || i18n['en'][key] || key;
}

const Utils = {
    formatSpeed(bps) {
        if (!bps || bps <= 0) return "0 MB/s";
        const mbps = bps / (1024 * 1024);
        if (mbps < 1) return `${(bps / 1024).toFixed(1)} KB/s`;
        return `${mbps.toFixed(2)} MB/s`;
    },
    humanSize(bytes) {
        const b = Number(bytes || 0);
        if (b <= 0) return "0 B";
        const units = ["B", "KB", "MB", "GB", "TB"];
        let i = 0, v = b;
        while (v >= 1024 && i < units.length - 1) {
            v /= 1024;
            i++;
        }
        return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
    },
    async apiCall(url, options = {}) {
        try {
            const resp = await api.fetchApi(url, options);
            if (resp.ok) {
                let data = null;
                try { data = await resp.json(); } catch { data = null; }
                return { ok: true, data, error: null };
            } else {
                let bodyText = "";
                let bodyJson = null;
                try { bodyJson = await resp.json(); } catch { bodyJson = null; }
                if (bodyJson && typeof bodyJson === "object") {
                    bodyText = bodyJson.error || bodyJson.message || JSON.stringify(bodyJson);
                } else {
                    try { bodyText = await resp.text(); } catch { bodyText = ""; }
                }
                const code = resp.status || "";
                const reason = resp.statusText || "";
                const composed = [code, reason, bodyText].filter(Boolean).join(" • ");
                return { ok: false, data: null, error: composed };
            }
        } catch (error) {
            return { ok: false, data: null, error: String(error && error.message || error) };
        }
    }
};

const StyleManager = {
    getStyles() {
        return {
            base: "max-width:980px;width:96%;background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.4);padding:16px 18px;color:#e8e8e8;z-index:10002;display:block;opacity:1;visibility:visible;pointer-events:auto;",
            overlay: "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:10001;display:flex;align-items:center;justify-content:center;",
            input: "background:linear-gradient(145deg,#2a2a3e,#1e1e32); color:#e8e8e8; border:1px solid #4a5568; border-radius:6px; padding:10px 14px; font-size:14px; transition:all .3s ease; height:38px;",
            button: "border:none; border-radius:6px; padding:10px 14px; font-size:14px; cursor:pointer; transition:all .3s ease;",
            buttonPrimary: "background:linear-gradient(145deg,#667eea,#764ba2); color:white;",
            buttonSuccess: "background:linear-gradient(145deg,#22c55e,#16a34a); color:white;",
            buttonDanger: "background: #dc2626; color: #fff; border:none; border-radius:6px; padding:4px 8px; font-size:12px; cursor:pointer;",
            progressBar: "width:100%; height:12px; background:#1e1e32; border:1px solid #4a5568; border-radius:6px; overflow:hidden;",
            progressFill: "height:100%; width:0%; background:linear-gradient(90deg, #22c55e, #16a34a); transition:width .2s ease;"
        };
    },
    getUniqueStyles(uniqueId) {
        const styles = this.getStyles();
        return `
            <style>
                #${uniqueId} .ui-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.1); }
                #${uniqueId} .ui-title { font-size:14px; font-weight:600; color:#f0f0f0; }
                #${uniqueId} .circle-close { width:28px; height:28px; border-radius:50%; border:1px solid rgba(255,255,255,0.25); background:#1f2937; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:background .2s ease, border-color .2s ease, box-shadow .2s ease; }
                #${uniqueId} .circle-close::before { content:"×"; color:#e8e8e8; font-size:16px; line-height:1; }
                #${uniqueId} .circle-close:hover { background:#b91c1c; border-color:#ef4444; box-shadow:0 0 0 2px rgba(239,68,68,0.25); }
                #${uniqueId} .ui-controls { display:flex; flex-direction:column; gap:10px; }
                #${uniqueId} .input-group { display:flex; flex-direction:column; gap:6px; max-width:650px; width:100%; }
                #${uniqueId} .inline-controls { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
                #${uniqueId} .model-row { gap:2px; }
                #${uniqueId} .inline-controls label { flex: 0 0 auto; }
                #${uniqueId} .inline-controls label span { white-space: nowrap; flex-shrink: 0; font-weight: 600; }
                #${uniqueId} .input-group > span { font-weight: 600; }
                #${uniqueId} .inline-controls .select-wrapper { flex: 0 1 auto; min-width: 240px; }
                #${uniqueId} .model-row .provider-item .select-wrapper { min-width: 160px; max-width: 220px; }
                #${uniqueId} .inline-controls .model-name { margin-left: 0; flex: 0 1 420px; min-width: 360px; }
                #${uniqueId} .inline-controls .download-button { flex: 0 0 auto; }
                #${uniqueId} .text-input, #${uniqueId} .select-input { ${styles.input} }
                #${uniqueId} .select-input { width:100%; appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:36px; display:block; }
                #${uniqueId} .select-wrapper { position:relative; display:flex; align-items:center; align-self:flex-start; }
                #${uniqueId} .select-wrapper::after { content:""; position:absolute; right:12px; top:50%; transform:translateY(-50%); border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid #e8e8e8; pointer-events:none; }
                #${uniqueId} .select-input option, #${uniqueId} .select-input optgroup { background-color:#1e1e32; color:#e8e8e8; }
                #${uniqueId} .text-input:focus, #${uniqueId} .select-input:focus { outline:none; border-color:#4299e1; box-shadow:0 0 0 3px rgba(66,153,225,0.1); }
                #${uniqueId} .download-button { ${styles.button} ${styles.buttonPrimary} }
                #${uniqueId} .status { font-size:14px; color:#9aa0a6; }
                #${uniqueId} .status.highlight { color:#22c55e; }
                #${uniqueId} .status.success { color:#22c55e; font-weight:600; }
                #${uniqueId} .status.error { color:#ef4444; font-weight:600; }
                #${uniqueId} .status.warning { color:#f59e0b; font-weight:600; }
                #${uniqueId} .progress-container { margin-top:10px; display:none; }
                #${uniqueId} .progress-bar { ${styles.progressBar} }
                #${uniqueId} .progress-fill { ${styles.progressFill} }
                #${uniqueId} .progress-text { margin-top:6px; font-size:14px; color:#e8e8e8; }
                #${uniqueId} .manage { margin-top: 12px; border: 1px solid transparent; border-radius: 8px; padding: 10px; max-width: 920px; width: 100%; background: linear-gradient(145deg, #1a202c, #2d3748) padding-box, linear-gradient(145deg, #4a5568, #718096) border-box; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset; position: relative; }
                #${uniqueId} .manage-header { display:flex; align-items:center; justify-content:space-between; }
                #${uniqueId} .manage-title { font-size:15px; font-weight:600; }
                #${uniqueId} .manage-list { margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:160px; overflow:auto; }
                #${uniqueId} .manage-item { display:flex; align-items:center; justify-content:space-between; gap:8px; background:#0f1623; border:1px solid #243249; border-radius:6px; padding:6px 8px; }
                #${uniqueId} .manage-item > div:first-child { flex: 1 1 auto; min-width: 0; }
                #${uniqueId} .manage-item .name { font-size:14px; flex: 0 0 auto; }
                #${uniqueId} .manage-item .meta { font-size:12px; color: #9aa0a6; margin-left:8px; flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                #${uniqueId} .manage-item .subline { display:flex; align-items:center; gap:6px; }
                #${uniqueId} .manage-item .actions { display:flex; align-items:center; gap:8px; flex: 0 0 auto; }
                #${uniqueId} .btn-refresh { ${styles.button} background: #ff7f00; color: #fff; padding:4px 8px; font-size:12px; }
                #${uniqueId} .btn-activate { ${styles.button} background: #4299e1; color: #fff; padding:4px 8px; font-size:12px; }
                #${uniqueId} .btn-delete { ${styles.buttonDanger} }
                @media (min-width: 760px) {
                    #${uniqueId} .inline-controls { flex-wrap: nowrap; }
                    #${uniqueId} .inline-controls .select-wrapper { min-width: 240px; }
                    #${uniqueId} .model-row .provider-item .select-wrapper { min-width: 160px; max-width: 220px; }
                    #${uniqueId} .inline-controls .model-name { min-width: 420px; }
                }
            </style>
        `;
    }
};

function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "comfy-modal-overlay";
    overlay.style.cssText = StyleManager.getStyles().overlay;
    return overlay;
}

function createDialog() {
    const dialog = document.createElement("div");
    dialog.className = "comfy-modal";
    dialog.style.cssText = StyleManager.getStyles().base;
    return dialog;
}

async function openSettings(node) {
    const configResult = await Utils.apiCall("/zhihui_nodes/qwen3vl/config", { method: "GET" });
    let cfg = { cache_dir: "", provider: "huggingface", hf_mirror_url: "https://hf-mirror.com", use_default_cache: true, default_cache_dir: "" };
    if (configResult.ok && configResult.data) {
        cfg = { ...cfg, ...configResult.data };
    }

    const modelWidget = node.widgets?.find(w => w.name === "model");
    let displayOptions = [
        "Qwen3-VL-4B-Instruct",
        "Qwen3-VL-4B-Thinking",
        "Qwen3-VL-4B-Instruct-FP8",
        "Qwen3-VL-4B-Thinking-FP8",
        "Qwen3-VL-8B-Instruct",
        "Qwen3-VL-8B-Thinking",
        "Qwen3-VL-8B-Instruct-FP8",
        "Qwen3-VL-8B-Thinking-FP8",
        "Qwen3-VL-32B-Instruct",
        "Qwen3-VL-32B-Thinking",
        "Qwen3-VL-32B-Instruct-FP8",
        "Qwen3-VL-32B-Thinking-FP8",
        "Huihui-Qwen3-VL-8B-Instruct-abliterated",
        "Huihui-Qwen3-VL-8B-Thinking-abliterated",
    ];
    if (modelWidget) {
        const modelOptions = Array.isArray(modelWidget.options) ? modelWidget.options : (modelWidget.options?.values || []);
        displayOptions = modelOptions.length > 0 ? modelOptions.map(s => String(s)) : displayOptions;
    }

    const overlay = createOverlay();
    const dialog = createDialog();
    const uniqueId = `qwen3vl-settings-${Math.random().toString(36).substring(2, 9)}`;
    

    dialog.innerHTML = `
        ${StyleManager.getUniqueStyles(uniqueId)}
        <div id="${uniqueId}">
            <div class="ui-header">
                <h3 class="ui-title">⚙️模型管理</h3>
                <button id="qwen3vl-close-circle" class="circle-close" type="button"></button>
            </div>
            <div class="ui-controls">
                <div class="inline-controls model-row">
                    <label class="provider-item" style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">下载源:</span>
                        <div class="select-wrapper">
                            <select id="qwen3vl-provider" class="select-input">
                                <option value="huggingface" ${cfg.provider === "huggingface" ? "selected" : ""}>HuggingFace</option>
                                <option value="hf-mirror" ${cfg.provider === "hf-mirror" ? "selected" : ""}>HF Mirror</option>
                                <option value="modelscope" ${cfg.provider === "modelscope" ? "selected" : ""}>ModelScope</option>
                            </select>
                        </div>
                    </label>
                    <label class="model-name" style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">模型名称:</span>
                        <div class="select-wrapper">
                            <select id="qwen3vl-model" class="select-input">
                                ${displayOptions.map(m => `<option value="${m}" ${m === (modelWidget?.value || displayOptions[0]) ? "selected" : ""}>${m}</option>`).join("")}
                            </select>
                        </div>
                    </label>
                    <button id="qwen3vl-download" class="download-button" type="button">下载</button>
                </div>
                <div id="qwen3vl-status" class="status"></div>
                <div id="qwen3vl-progress" class="progress-container">
                    <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
                    <div class="progress-text">0% • 0 MB/s</div>
                </div>
                <div class="manage">
                    <div class="manage-header">
                        <div class="manage-title">📦已下载模型</div>
                        <button id="qwen3vl-refresh" class="btn-refresh" type="button">刷新</button>
                    </div>
                    <div id="qwen3vl-model-list" class="manage-list"></div>
                </div>
            </div>
        </div>
    `;

    const close = () => {
        if (overlay.parentNode) document.body.removeChild(overlay);
        if (dialog.parentNode) document.body.removeChild(dialog);
    };

    const updateConfig = async (updates) => {
        const result = await Utils.apiCall("/zhihui_nodes/qwen3vl/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
        });
        return result.ok;
    };

    const providerEl = dialog.querySelector("#qwen3vl-provider");
    const modelEl = dialog.querySelector("#qwen3vl-model");
    providerEl.onchange = async () => {
        await updateConfig({ provider: providerEl.value });
    };

    const updateProgressUI = (p) => {
        const cont = dialog.querySelector(`#${uniqueId} .progress-container`);
        const isDownloading = p && p.status === "downloading";
        cont.style.display = isDownloading ? "block" : "none";
        if (isDownloading) {
            const fill = dialog.querySelector(`#${uniqueId} .progress-fill`);
            const text = dialog.querySelector(`#${uniqueId} .progress-text`);
            const pct = Math.max(0, Math.min(100, Number(p?.percent || 0)));
            fill.style.width = `${pct}%`;
            text.textContent = `${pct.toFixed(1)}% • ${Utils.formatSpeed(Number(p?.speed_bps || 0))}`;
        }
    };

    const renderModelList = (list, activeName) => {
        const cont = dialog.querySelector(`#${uniqueId} #qwen3vl-model-list`);
        cont.innerHTML = "";
        if (!Array.isArray(list) || list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "manage-item";
            empty.innerHTML = `<div class="name">暂无已下载模型</div>`;
            cont.appendChild(empty);
            return;
        }
        list.forEach((m) => {
            const row = document.createElement("div");
            row.className = "manage-item";
            const left = document.createElement("div");
            left.style.cssText = "display:flex; flex-direction:column; gap:4px; align-items:flex-start;";
            const name = document.createElement("div");
            name.className = "name";
            name.textContent = m.name;
            const meta = document.createElement("div");
            meta.className = "meta";
            meta.textContent = `${Utils.humanSize(m.size_bytes)} • ${m.path}`;
            const badge = document.createElement("span");
            badge.style.cssText = "margin-left:8px; padding:2px 6px; border-radius:10px; font-size:12px;";
            if (m.valid) {
                badge.textContent = "文件完整";
                badge.style.background = "rgba(34,197,94,0.12)";
                badge.style.color = "#22c55e";
                badge.style.border = "1px solid rgba(34,197,94,0.3)";
            } else {
                badge.textContent = "文件不完整";
                badge.style.background = "rgba(239,68,68,0.12)";
                badge.style.color = "#ef4444";
                badge.style.border = "1px solid rgba(239,68,68,0.3)";
            }
            const activeBadge = document.createElement("span");
            if (m.active || (activeName && m.name === activeName)) {
                activeBadge.textContent = "已激活";
                activeBadge.style.cssText = "margin-left:6px; padding:2px 6px; border-radius:10px; font-size:12px; background:rgba(0, 255, 85, 0.12); color:#3b82f6; border:1px solid rgba(59,130,246,0.3);";
            }
            const subline = document.createElement("div");
            subline.className = "subline";
            subline.appendChild(meta);
            subline.appendChild(badge);
            if (activeBadge.textContent) subline.appendChild(activeBadge);
            left.appendChild(name);
            left.appendChild(subline);
            const actions = document.createElement("div");
            actions.className = "actions";
            const activate = document.createElement("button");
            activate.className = "btn-activate";
            activate.textContent = "激活";
            activate.onclick = async () => {
                const status = dialog.querySelector("#qwen3vl-status");
                status.classList.remove("success", "error", "warning", "highlight");
                status.textContent = "正在激活...";
                const result = await Utils.apiCall("/zhihui_nodes/qwen3vl/activate_model", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: m.name })
                });
                if (result.ok) {
                    status.classList.add("success");
                    status.textContent = `已激活：${m.name}`;
                    await fetchModelList();
                } else {
                    status.classList.add("error");
                    status.textContent = `激活失败：${result.error || '未知错误'}`;
                }
            };
            actions.appendChild(activate);
            const del = document.createElement("button");
            del.className = "btn-delete";
            del.textContent = "删除";
            del.onclick = async () => {
                if (!window.confirm(`确认删除模型：${m.name}？`)) return;
                const status = dialog.querySelector("#qwen3vl-status");
                status.classList.remove("success", "error", "warning", "highlight");
                status.textContent = "正在删除...";
                const result = await Utils.apiCall("/zhihui_nodes/qwen3vl/delete_model", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: m.name })
                });
                if (result.ok) {
                    status.classList.add("success");
                    status.textContent = `已删除：${m.name}`;
                    await fetchModelList();
                } else {
                    status.classList.add("error");
                    status.textContent = `删除失败：${result.error || '未知错误'}`;
                }
            };
            actions.appendChild(del);
            row.appendChild(left);
            row.appendChild(actions);
            cont.appendChild(row);
        });
    };

    const fetchModelList = async () => {
        const result = await Utils.apiCall("/zhihui_nodes/qwen3vl/list_models", { method: "GET" });
        if (result.ok && result.data) {
            renderModelList(result.data.models || [], result.data.active_model_name || "");
        }
    };

    let progressPoll = null;
    dialog.querySelector("#qwen3vl-download").onclick = async () => {
        const provider = dialog.querySelector("#qwen3vl-provider").value;
        const model_name = dialog.querySelector("#qwen3vl-model").value;
        const status = dialog.querySelector("#qwen3vl-status");
        const checkResult = await Utils.apiCall(`/zhihui_nodes/qwen3vl/check_model?model=${encodeURIComponent(model_name)}`, { method: "GET" });
        if (checkResult.ok && checkResult.data?.exists) {
            status.classList.remove("success", "error");
            status.classList.add("warning");
            status.textContent = "模型已存在，请先删除后再下载";
            return;
        }
        status.classList.remove("success", "error", "warning", "highlight");
        status.textContent = "开始下载...";
        if (progressPoll) { clearInterval(progressPoll); progressPoll = null; }
        progressPoll = setInterval(async () => {
            const progressResult = await Utils.apiCall("/zhihui_nodes/qwen3vl/progress", { method: "GET" });
            if (progressResult.ok && progressResult.data) {
                updateProgressUI(progressResult.data);
                if (progressResult.data.status === "done" || progressResult.data.status === "error") {
                    clearInterval(progressPoll);
                    progressPoll = null;
                }
            }
        }, 500);
        const payload = { provider, model_name };
        const downloadResult = await Utils.apiCall("/zhihui_nodes/qwen3vl/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (downloadResult.ok) {
            const data = downloadResult.data;
            status.classList.remove("error", "warning");
            status.classList.add("success");
            status.textContent = data.local_dir ? `下载完成：${data.local_dir}` : "下载完成";
            updateProgressUI({ percent: 100, speed_bps: 0, status: "done" });
            await fetchModelList();
        } else {
            status.classList.remove("success", "warning");
            status.classList.add("error");
            status.textContent = `下载失败：${downloadResult.error || '未知错误'}`;
            updateProgressUI({ percent: 0, speed_bps: 0, status: "error" });
        }
    };

    dialog.querySelector("#qwen3vl-refresh").onclick = fetchModelList;
    dialog.querySelector("#qwen3vl-close-circle").onclick = close;
    dialog.addEventListener('click', (e) => e.stopPropagation());
    overlay.addEventListener('click', (e) => e.stopPropagation());
    if (document.body.firstChild) {
        document.body.insertBefore(overlay, document.body.firstChild);
    } else {
        document.body.appendChild(overlay);
    }
    overlay.appendChild(dialog);
    await fetchModelList();
    const initProg = await Utils.apiCall("/zhihui_nodes/qwen3vl/progress", { method: "GET" });
    if (initProg.ok && initProg.data && initProg.data.status === "downloading") {
        const status = dialog.querySelector("#qwen3vl-status");
        status.classList.remove("success", "error", "warning", "highlight");
        status.textContent = "正在下载...";
        updateProgressUI(initProg.data);
        if (progressPoll) { clearInterval(progressPoll); progressPoll = null; }
        progressPoll = setInterval(async () => {
            const progressResult = await Utils.apiCall("/zhihui_nodes/qwen3vl/progress", { method: "GET" });
            if (progressResult.ok && progressResult.data) {
                updateProgressUI(progressResult.data);
                if (progressResult.data.status === "done" || progressResult.data.status === "error") {
                    clearInterval(progressPoll);
                    progressPoll = null;
                }
            }
        }, 500);
    }
}

let _qwen3vlTooltipEl = null;

function showQwen3VLTooltip(btnEl, text) {
    if (_qwen3vlTooltipEl) _qwen3vlTooltipEl.remove();
    const tip = document.createElement("div");
    tip.style.cssText = "position:fixed;z-index:10002;padding:4px 8px;background:#1f2937;border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:#e8e8e8;font-size:11px;pointer-events:none;white-space:nowrap;";
    tip.textContent = text;
    document.body.appendChild(tip);
    const rect = btnEl.getBoundingClientRect();
    tip.style.left = (rect.left + rect.width / 2 - tip.offsetWidth / 2) + "px";
    tip.style.top = (rect.top - tip.offsetHeight - 4) + "px";
    _qwen3vlTooltipEl = tip;
}

function hideQwen3VLTooltip() {
    if (_qwen3vlTooltipEl) { _qwen3vlTooltipEl.remove(); _qwen3vlTooltipEl = null; }
}

function showQwen3VLToast(message, type = "info") {
    const toast = document.createElement("div");
    const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b", info: "#667eea" };
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:8px 16px;background:#1f2937;border:1px solid ${colors[type] || colors.info};border-radius:6px;color:#e8e8e8;font-size:13px;z-index:10003;animation:qwen3vlToastIn 0.3s ease;`;
    toast.textContent = message;
    if (!document.querySelector("style[data-qwen3vl-toast-style]")) {
        const s = document.createElement("style");
        s.setAttribute("data-qwen3vl-toast-style", "");
        s.textContent = "@keyframes qwen3vlToastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes qwen3vlToastOut{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(-10px)}}";
        document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = "qwen3vlToastOut 0.3s ease forwards"; setTimeout(() => toast.remove(), 300); }, 2000);
}

async function showQwen3VLTemplateSelector(node, btnRect) {
    const existingOverlay = document.getElementById("qwen3vl-settings-template-selector");
    if (existingOverlay) { existingOverlay.remove(); }
    
    const overlay = document.createElement("div");
    overlay.id = "qwen3vl-settings-template-selector";
    overlay.style.cssText = "position:fixed;z-index:10001;";
    
    const dialog = document.createElement("div");
    dialog.style.cssText = "width:320px;max-width:90vw;max-height:350px;background:#1f2937;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:12px;color:#e8e8e8;box-shadow:0 8px 32px rgba(0,0,0,0.4);display:flex;flex-direction:column;";
    
    const header = document.createElement("div");
    header.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;";
    const title = document.createElement("h3");
    title.style.cssText = "margin:0;font-size:15px;font-weight:600;background:linear-gradient(90deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;";
    title.textContent = $t('selectTemplate');
    const closeBtn = document.createElement("button");
    closeBtn.style.cssText = "width:20px;height:20px;border-radius:50%;border:1px solid rgba(255,255,255,0.25);background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;";
    closeBtn.innerHTML = "×";
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = $t('searchTemplates');
    searchInput.style.cssText = "width:100%;padding:6px 10px;background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#e8e8e8;font-size:12px;margin-bottom:8px;box-sizing:border-box;";
    
    const listContainer = document.createElement("div");
    listContainer.style.cssText = "flex:1;overflow-y:auto;border:1px solid rgba(255,255,255,0.1);border-radius:6px;min-height:60px;max-height:380px;";
    
    const loadingEl = document.createElement("div");
    loadingEl.style.cssText = "padding:20px;text-align:center;color:#9ca3af;font-size:12px;";
    loadingEl.textContent = $t('checking');
    listContainer.appendChild(loadingEl);

    let selectedCategory = CATEGORY_ALL;

    const selectorFilter = buildCategoryFilter({
        templates: [],
        allLabel: $t('categoryAll'),
        noneLabel: $t('categoryNone'),
        manage: false,
        showCounts: false,
        onPick: (key) => {
            selectedCategory = key;
            renderList(currentTemplates, searchInput.value);
        },
    });
    selectorFilter.element.style.marginBottom = "8px";
    applyCategoryTheme(dialog, SETTINGS_CATEGORY_THEME);

    dialog.appendChild(header);
    dialog.appendChild(searchInput);
    dialog.appendChild(selectorFilter.element);
    dialog.appendChild(listContainer);
    
    const manageBtn = document.createElement("button");
    manageBtn.type = "button";
    manageBtn.style.cssText = `
        margin-top: 8px;
        padding: 6px 0;
        width: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    `;
    manageBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> ${$t('manageTemplates')}`;
    manageBtn.onmouseenter = () => { manageBtn.style.opacity = "0.85"; manageBtn.style.transform = "scale(1.02)"; };
    manageBtn.onmouseleave = () => { manageBtn.style.opacity = "1"; manageBtn.style.transform = "scale(1)"; };
    manageBtn.onclick = () => {
        close();
        showQwen3VLTemplateManager();
    };
    dialog.appendChild(manageBtn);
    
    overlay.appendChild(dialog);
    
    const close = () => { if (overlay.parentNode) overlay.remove(); };
    closeBtn.onclick = close;
    const handleClickOutside = (e) => { if (!overlay.contains(e.target)) { close(); document.removeEventListener("mousedown", handleClickOutside); } };
    setTimeout(() => { document.addEventListener("mousedown", handleClickOutside); }, 10);
    
    const renderList = (templates, searchTerm = "") => {
        let filtered = templates.filter(t => matchesCategory(t, selectedCategory));
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(t => t.name.toLowerCase().includes(term) || t.content.toLowerCase().includes(term));
        }
        if (filtered.length === 0) {
            listContainer.innerHTML = `<div style="padding:20px;text-align:center;color:#9ca3af;font-size:12px;">${$t('noTemplates')}</div>`;
            return;
        }
        listContainer.innerHTML = filtered.map(template => `<div data-id="${template.id}" style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:background 0.15s ease;"><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:14px;font-weight:500;color:#e8e8e8;">${escapeHtml(template.name)}</span>${categoryBadgeHtml(template.category, selectedCategory)}</div></div>`).join("");
        listContainer.querySelectorAll("[data-id]").forEach(item => {
            item.onmouseover = () => { item.style.background = "rgba(102,126,234,0.15)"; };
            item.onmouseout = () => { item.style.background = "transparent"; };
            item.onclick = () => {
                const template = templates.find(t => t.id === item.dataset.id);
                if (template) {
                    const systemPromptWidget = node.widgets?.find(w => w.name === "system_prompt");
                    if (systemPromptWidget) {
                        systemPromptWidget.value = template.content;
                        if (systemPromptWidget.callback) systemPromptWidget.callback(template.content);
                        node.setDirtyCanvas(true, true);
                        showQwen3VLToast($t('templateApplied'), "success");
                    }
                }
                close();
            };
        });
    };
    
    searchInput.addEventListener("input", (e) => { renderList(currentTemplates, e.target.value); });
    
    let currentTemplates = [];
    try {
        const response = await fetch("/zhihui_nodes/qwen3vl/templates");
        if (response.ok) {
            const data = await response.json();
            currentTemplates = data.templates || [];
            selectorFilter.sync(currentTemplates);
            renderList(currentTemplates);
        } else {
            listContainer.innerHTML = `<div style="padding:20px;text-align:center;color:#ef4444;font-size:12px;">${$t('noTemplates')}</div>`;
        }
    } catch (e) {
        listContainer.innerHTML = `<div style="padding:20px;text-align:center;color:#ef4444;font-size:12px;">${$t('noTemplates')}</div>`;
    }
    
    document.body.appendChild(overlay);
    
    const dialogRect = dialog.getBoundingClientRect();
    let left = btnRect.left;
    let top = btnRect.bottom + 4;
    if (left + dialogRect.width > window.innerWidth - 10) left = window.innerWidth - dialogRect.width - 10;
    if (top + dialogRect.height > window.innerHeight - 10) top = btnRect.top - dialogRect.height - 4;
    if (top < 10) top = 10;
    if (left < 10) left = 10;
    overlay.style.left = left + "px";
    overlay.style.top = top + "px";
    
    searchInput.focus();
}

async function showQwen3VLTemplateManager() {
    const existingOverlay = document.getElementById("qwen3vl-template-manager");
    if (existingOverlay) { existingOverlay.remove(); }
    
    const overlay = document.createElement("div");
    overlay.id = "qwen3vl-template-manager";
    overlay.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);backdrop-filter:blur(3px);z-index:10001;display:flex;align-items:center;justify-content:center;";
    
    const dialog = document.createElement("div");
    dialog.style.cssText = "max-width:980px;width:96%;background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.4);padding:16px 18px;color:#e8e8e8;display:flex;flex-direction:column;max-height:80vh;";
    
    const header = document.createElement("div");
    header.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1);";
    
    const title = document.createElement("h3");
    title.style.cssText = "margin:0;font-size:16px;font-weight:600;";
    title.textContent = $t('manageTemplates');
    
    const closeBtn = document.createElement("button");
    closeBtn.style.cssText = "width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.25);background:#1f2937;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#e8e8e8;font-size:16px;transition:all 0.2s ease;";
    closeBtn.innerHTML = "×";
    closeBtn.onmouseover = () => { closeBtn.style.background = "#b91c1c"; closeBtn.style.borderColor = "#ef4444"; };
    closeBtn.onmouseout = () => { closeBtn.style.background = "#1f2937"; closeBtn.style.borderColor = "rgba(255,255,255,0.25)"; };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    const toolbar = document.createElement("div");
    toolbar.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:10px;";
    
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = $t('searchTemplates');
    searchInput.style.cssText = "flex:1;padding:6px 10px;background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#e8e8e8;font-size:12px;";
    
    const createBtn = document.createElement("button");
    createBtn.style.cssText = "padding:6px 14px;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;white-space:nowrap;";
    createBtn.textContent = $t('createTemplate');

    const importLMBtn = document.createElement("button");
    importLMBtn.style.cssText = "padding:6px 14px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;white-space:nowrap;";
    importLMBtn.textContent = $t('importFromLM');

    toolbar.appendChild(searchInput);
    toolbar.appendChild(importLMBtn);
    toolbar.appendChild(createBtn);
    
    const listContainer = document.createElement("div");
    listContainer.style.cssText = "flex:1;overflow-y:auto;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:#111827;min-height:200px;";

    let activeCategory = CATEGORY_ALL;
    let knownCategories = [];

    const categoryFilter = buildCategoryFilter({
        templates: [],
        allLabel: $t('categoryAll'),
        noneLabel: $t('categoryNone'),
        renameLabel: $t('categoryRename'),
        removeLabel: $t('categoryDelete'),
        manageLabel: $t('categoryManage'),
        manageEmptyLabel: $t('categoryManageEmpty'),
        confirmLabel: $t('confirm'),
        cancelLabel: $t('cancel'),
        closeLabel: $t('close'),
        newPlaceholder: $t('categoryNamePlaceholder'),
        onPick: (key) => { activeCategory = key; renderList(searchInput.value); },
        onRenamed: async () => {
            showQwen3VLToast($t('categoryRenamed'), "success");
            await renderList(searchInput.value);
        },
        onRequestRemove: async (name) => {
            if (!window.confirm($t('confirmDeleteCategory').replace("{name}", name))) return;
            const result = await requestCategoryRemove(name);
            if (result.ok) {
                showQwen3VLToast($t('categoryDeleted'), "success");
                await renderList(searchInput.value);
            } else {
                showQwen3VLToast($t('categoryDeleteFailed'), "error");
            }
        },
        onError: () => {
            showQwen3VLToast($t('categoryRenameFailed'), "error");
        },
    });
    applyCategoryTheme(dialog, SETTINGS_CATEGORY_THEME);
    categoryFilter.element.style.marginBottom = "10px";

    dialog.appendChild(header);
    dialog.appendChild(toolbar);
    dialog.appendChild(categoryFilter.element);
    dialog.appendChild(listContainer);
    overlay.appendChild(dialog);
    
    const close = () => { if (overlay.parentNode) overlay.remove(); };
    closeBtn.onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
    
    const renderList = async (searchTerm = "") => {
        let templates = [];
        try {
            const response = await fetch("/zhihui_nodes/qwen3vl/templates");
            if (response.ok) {
                const data = await response.json();
                templates = data.templates || [];
            }
        } catch (e) {}
        
        categoryFilter.sync(templates);
        knownCategories = deriveCategories(templates);
        
        let filtered = templates.filter(t => matchesCategory(t, activeCategory));
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(t => t.name.toLowerCase().includes(term) || t.content.toLowerCase().includes(term));
        }
        
        if (filtered.length === 0) {
            listContainer.innerHTML = `<div style="padding:20px;text-align:center;color:#9ca3af;font-size:12px;">${$t('noTemplates')}</div>`;
            return;
        }
        
        listContainer.innerHTML = filtered.map(t => `
            <div data-id="${t.id}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;font-weight:500;color:#e8e8e8;display:flex;align-items:center;gap:8px;min-width:0;">
                        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(t.name)}</span>
                        ${categoryBadgeHtml(t.category, activeCategory)}
                    </div>
                    <div style="font-size:11px;color:#9ca3af;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.content.substring(0, 80)}${t.content.length > 80 ? '...' : ''}</div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0;margin-left:8px;">
                    <button class="edit-btn" data-id="${t.id}" style="padding:4px 10px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:#e8e8e8;cursor:pointer;font-size:11px;">${$t('edit')}</button>
                    <button class="delete-btn" data-id="${t.id}" style="padding:4px 10px;background:transparent;border:1px solid #ef4444;border-radius:4px;color:#ef4444;cursor:pointer;font-size:11px;">${$t('delete')}</button>
                </div>
            </div>
        `).join("");
        
        listContainer.querySelectorAll(".edit-btn").forEach(btn => {
            btn.onclick = async () => {
                const template = templates.find(t => t.id === btn.dataset.id);
                if (template) openTemplateEditor(template, renderList);
            };
        });
        
        listContainer.querySelectorAll(".delete-btn").forEach(btn => {
            btn.onclick = async () => {
                if (!window.confirm($t('confirmDelete'))) return;
                try {
                    const response = await fetch(`/zhihui_nodes/qwen3vl/templates/${btn.dataset.id}`, { method: "DELETE" });
                    if (response.ok) {
                        showQwen3VLToast($t('templateDeleted'), "success");
                        renderList(searchInput.value);
                    } else {
                        showQwen3VLToast($t('templateDeleteFailed'), "error");
                    }
                } catch (e) {
                    showQwen3VLToast($t('templateDeleteFailed'), "error");
                }
            };
        });
    };
    
    const openTemplateEditor = (template = null, onSave = null) => {
        const editorOverlay = document.createElement("div");
        editorOverlay.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:10002;display:flex;align-items:center;justify-content:center;";
        
        const editorDialog = document.createElement("div");
        editorDialog.style.cssText = "width:500px;max-width:90vw;background:#1f2937;border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:16px;color:#e8e8e8;display:flex;flex-direction:column;gap:10px;";
        
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = $t('templateNamePlaceholder');
        nameInput.value = template ? template.name : "";
        nameInput.style.cssText = "width:100%;padding:10px 12px;background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#e8e8e8;font-size:14px;box-sizing:border-box;";
        
        const contentInput = document.createElement("textarea");
        contentInput.placeholder = $t('templateContentPlaceholder');
        contentInput.value = template ? template.content : "";
        contentInput.style.cssText = "width:100%;min-height:250px;padding:10px 12px;background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#e8e8e8;font-size:13px;resize:none;box-sizing:border-box;font-family:inherit;";

        const categoryPicker = buildCategoryPicker({
            categories: knownCategories,
            value: template ? template.category : "",
            noneLabel: $t('categoryNone'),
        });
        applyCategoryTheme(editorDialog, SETTINGS_CATEGORY_THEME);
        categoryPicker.select.style.lineHeight = "inherit";
        categoryPicker.select.title = $t('templateCategory');
        categoryPicker.select.setAttribute("aria-label", $t('templateCategory'));
        
        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display:flex;justify-content:flex-end;gap:8px;";
        
        const cancelBtn = document.createElement("button");
        cancelBtn.style.cssText = "padding:10px 24px;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;";
        cancelBtn.textContent = $t('cancel');
        cancelBtn.onclick = () => { if (editorOverlay.parentNode) editorOverlay.remove(); };
        
        const saveBtn = document.createElement("button");
        saveBtn.style.cssText = "padding:10px 24px;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;";
        saveBtn.textContent = $t('save');
        saveBtn.onclick = async () => {
            const name = nameInput.value.trim();
            const content = contentInput.value.trim();
            if (!name) { showQwen3VLToast($t('templateNameRequired'), "error"); return; }
            try {
                let response;
                if (template && template.id) {
                    response = await fetch(`/zhihui_nodes/qwen3vl/templates/${template.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, content, category: categoryPicker.value() }) });
                } else {
                    response = await fetch("/zhihui_nodes/qwen3vl/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, content, category: categoryPicker.value() }) });
                }
                if (response.ok) {
                    showQwen3VLToast(template ? $t('templateUpdated') : $t('templateCreated'), "success");
                    if (editorOverlay.parentNode) editorOverlay.remove();
                    if (onSave) onSave();
                } else {
                    showQwen3VLToast($t('templateUpdateFailed'), "error");
                }
            } catch (e) {
                showQwen3VLToast($t('templateUpdateFailed'), "error");
            }
        };
        
        btnRow.appendChild(cancelBtn);
        btnRow.appendChild(saveBtn);
        
        editorDialog.appendChild(nameInput);
        editorDialog.appendChild(categoryPicker.element);
        editorDialog.appendChild(contentInput);
        editorDialog.appendChild(btnRow);
        editorOverlay.appendChild(editorDialog);
        editorOverlay.onclick = (e) => { if (e.target === editorOverlay) { if (editorOverlay.parentNode) editorOverlay.remove(); } };
        
        document.body.appendChild(editorOverlay);
        nameInput.focus();
    };
    
    // 「从LM模板调用」：列出 LM Studio 节点的提示词预设，点选后预填进模板编辑器（保存即入库）
    const openLMPresetPicker = () => {
        const pickerOverlay = document.createElement("div");
        pickerOverlay.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:10002;display:flex;align-items:center;justify-content:center;";

        const pickerDialog = document.createElement("div");
        pickerDialog.style.cssText = "width:420px;max-width:90vw;max-height:70vh;background:#1f2937;border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:14px;color:#e8e8e8;display:flex;flex-direction:column;gap:10px;";

        const pickerTitle = document.createElement("div");
        pickerTitle.style.cssText = "font-size:14px;font-weight:600;";
        pickerTitle.textContent = $t('importFromLM');

        const pickerList = document.createElement("div");
        pickerList.style.cssText = "flex:1;overflow-y:auto;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:#111827;min-height:120px;";
        pickerList.innerHTML = `<div style="padding:20px;text-align:center;color:#9ca3af;font-size:12px;">${$t('checking')}</div>`;

        pickerOverlay.onclick = (e) => { if (e.target === pickerOverlay) pickerOverlay.remove(); };

        pickerDialog.appendChild(pickerTitle);
        pickerDialog.appendChild(pickerList);
        pickerOverlay.appendChild(pickerDialog);
        document.body.appendChild(pickerOverlay);

        fetch("/zhihui_nodes/lm_prompt_presets").then(r => r.json()).then(data => {
            const presets = data.presets || [];
            if (!presets.length) {
                pickerList.innerHTML = `<div style="padding:20px;text-align:center;color:#9ca3af;font-size:12px;">${$t('noTemplates')}</div>`;
                return;
            }
            pickerList.innerHTML = presets.map((p, i) => `
                <div data-idx="${i}" style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;">
                    <div style="font-size:14px;font-weight:500;color:#e8e8e8;">${p.name}</div>
                    <div style="font-size:11px;color:#9ca3af;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${String(p.content).substring(0, 80)}${String(p.content).length > 80 ? '...' : ''}</div>
                </div>
            `).join("");
            pickerList.querySelectorAll("[data-idx]").forEach(item => {
                item.onmouseover = () => { item.style.background = "rgba(59,130,246,0.15)"; };
                item.onmouseout = () => { item.style.background = "transparent"; };
                item.onclick = () => {
                    const preset = presets[Number(item.dataset.idx)];
                    pickerOverlay.remove();
                    // 不带 id：走「新建」流程，把 LM 预设保存为一条共用模板
                    openTemplateEditor({ name: preset.name, content: preset.content }, () => renderList(searchInput.value));
                };
            });
        }).catch(() => {
            pickerList.innerHTML = `<div style="padding:20px;text-align:center;color:#ef4444;font-size:12px;">${$t('templateCreateFailed')}</div>`;
        });
    };
    importLMBtn.onclick = openLMPresetPicker;

    createBtn.onclick = () => openTemplateEditor(null, () => renderList(searchInput.value));
    searchInput.addEventListener("input", (e) => renderList(e.target.value));
    
    document.body.appendChild(overlay);
    renderList();
}

function addQwen3VLInputButtons(node) {
    const systemPromptWidget = node.widgets?.find(w => w.name === "system_prompt");
    if (!systemPromptWidget || !systemPromptWidget.inputEl) return;
    
    const inputEl = systemPromptWidget.inputEl;
    const parentEl = inputEl.parentElement;
    if (!parentEl) return;
    
    if (parentEl.querySelector('.qwen3vl-btn-container')) return;
    
    parentEl.style.position = "relative";
    parentEl.style.paddingTop = "20px";
    parentEl.style.marginTop = "-15px";
    
    const btnContainer = document.createElement("div");
    btnContainer.className = "qwen3vl-btn-container";
    btnContainer.style.cssText = `
        display: flex;
        gap: 4px;
        justify-content: flex-end;
        padding-right: 2px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
    `;
    
    const restoreBtn = document.createElement("button");
    restoreBtn.type = "button";
    restoreBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:auto;"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;
    restoreBtn.style.cssText = `
        width: 18px;
        height: 18px;
        padding: 0;
        background: rgba(34, 197, 94, 0.35);
        border: none;
        border-radius: 3px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: rgba(34, 197, 94, 0.9);
    `;
    restoreBtn.onmouseenter = () => {
        restoreBtn.style.background = "rgba(34, 197, 94, 0.6)";
        restoreBtn.style.color = "rgba(34, 197, 94, 1)";
        restoreBtn.style.transform = "scale(1.1)";
        showQwen3VLTooltip(restoreBtn, $t('restoreTooltip'));
    };
    restoreBtn.onmouseleave = () => {
        restoreBtn.style.background = "rgba(34, 197, 94, 0.35)";
        restoreBtn.style.color = "rgba(34, 197, 94, 0.9)";
        restoreBtn.style.transform = "scale(1)";
        hideQwen3VLTooltip();
    };
    restoreBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (node._lastClearedContent !== undefined) {
            inputEl.value = node._lastClearedContent;
            systemPromptWidget.value = node._lastClearedContent;
            node._lastClearedContent = undefined;
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            showQwen3VLToast($t('restoreContent'), "success");
        } else {
            showQwen3VLToast($t('noContentToRestore'), "warning");
        }
    };
    btnContainer.appendChild(restoreBtn);
    
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:auto;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    clearBtn.style.cssText = `
        width: 18px;
        height: 18px;
        padding: 0;
        background: rgba(239, 68, 68, 0.35);
        border: none;
        border-radius: 3px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: rgba(239, 68, 68, 0.9);
    `;
    clearBtn.onmouseenter = () => {
        clearBtn.style.background = "rgba(239, 68, 68, 0.6)";
        clearBtn.style.color = "rgba(239, 68, 68, 1)";
        clearBtn.style.transform = "scale(1.1)";
        showQwen3VLTooltip(clearBtn, $t('clearTooltip'));
    };
    clearBtn.onmouseleave = () => {
        clearBtn.style.background = "rgba(239, 68, 68, 0.35)";
        clearBtn.style.color = "rgba(239, 68, 68, 0.9)";
        clearBtn.style.transform = "scale(1)";
        hideQwen3VLTooltip();
    };
    clearBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inputEl.value.trim()) {
            node._lastClearedContent = inputEl.value;
            inputEl.value = "";
            systemPromptWidget.value = "";
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            showQwen3VLToast($t('clearContent'), "success");
        } else {
            showQwen3VLToast($t('noContentToClear'), "warning");
        }
    };
    btnContainer.appendChild(clearBtn);
    
    const templateBtn = document.createElement("button");
    templateBtn.type = "button";
    templateBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:auto;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
    templateBtn.style.cssText = `
        width: 18px;
        height: 18px;
        padding: 0;
        background: rgba(102, 126, 234, 0.35);
        border: none;
        border-radius: 3px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: rgba(102, 126, 234, 0.9);
    `;
    templateBtn.onmouseenter = () => {
        templateBtn.style.background = "rgba(102, 126, 234, 0.6)";
        templateBtn.style.color = "rgba(102, 126, 234, 1)";
        templateBtn.style.transform = "scale(1.1)";
        showQwen3VLTooltip(templateBtn, $t('templateTooltip'));
    };
    templateBtn.onmouseleave = () => {
        templateBtn.style.background = "rgba(102, 126, 234, 0.35)";
        templateBtn.style.color = "rgba(102, 126, 234, 0.9)";
        templateBtn.style.transform = "scale(1)";
        hideQwen3VLTooltip();
    };
    templateBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = templateBtn.getBoundingClientRect();
        showQwen3VLTemplateSelector(node, rect);
    };
    btnContainer.appendChild(templateBtn);
    
    parentEl.appendChild(btnContainer);
}

app.registerExtension({
    name: "Qwen3VL.Settings",
    async beforeRegisterNodeDef(nodeType, nodeData, app_) {
        if (nodeData.name === "Qwen3VLAdvanced" || nodeData.name === "Qwen3VLBasic") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                const btn = this.addWidget("button", $t('modelManager'), "open_settings", () => {
                    setTimeout(() => openSettings(this), 0);
                }, { label: $t('modelManager') });
                btn.serialize = false;
                setTimeout(() => {
                    addQwen3VLInputButtons(this);
                    app.graph.setDirtyCanvas(true, true);
                }, 100);
                return r;
            };
        }
    }
});