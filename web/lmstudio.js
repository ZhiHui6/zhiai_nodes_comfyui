import { app } from "../../scripts/app.js";
import { applyNode } from "./zhihui_i18n.js";
import { NODE_TITLE_GLYPH, drawNodeHelpButton, drawNodeTitleChip } from "./node_title_icons.js";
import {
    CATEGORY_ALL,
    buildCategoryFilter,
    buildCategoryPicker,
    categoryBadgeHtml,
    deriveCategories,
    escapeHtml,
    matchesCategory,
    requestCategoryRemove,
} from "./template_categories.js";

const LMSTUDIO_EXT_ID = "ZhihuiNodes.LMStudio";

const i18n = {
    zh: {
        title: "LM Studio 节点设置",
        connected: "已连接",
        disconnected: "未连接",
        corsWarning: "如检测到跨域问题，请确保 LM Studio 服务器已启用 CORS 支持。",
        corsSteps: "操作步骤：打开 LM Studio → 进入 Developer → 选择 Local Server → 找到 Server Settings 选项卡 → 启用 \"Enable CORS\" 选项，然后重启服务器。",
        availableModels: "可用模型列表",
        refresh: "🔄 刷新",
        refreshStatus: "刷新状态",
        serviceStatus: "服务状态",
        serviceEndpoint: "服务端点",
        loadedModels: "已加载模型",
        none: "无",
        checking: "检查中...",
        paramPreset: "参数组预设",
        timeoutSettings: "超时设置",
        fetchModelsTimeout: "获取模型列表超时",
        apiCallTimeout: "API 调用超时",
        unloadModelListTimeout: "模型列表卸载超时",
        unloadModelTimeout: "模型卸载超时",
        seconds: "秒",
        saveAll: "保存所有设置",
        resetDefault: "恢复默认",
        confirmReset: "确定要恢复默认设置吗？这将重置所有配置为默认值。",
        saveSuccess: "所有设置已保存到配置文件",
        saveSuccessRefresh: "设置已保存，请刷新页面以更新主节点的预设选项",
        saveFailed: "保存设置失败",
        endpointUnsavedRefresh: "服务端点已修改但尚未保存，保存后才会对节点生效。是否保存并刷新状态？",
        settingsUnsavedClose: "有设置项已修改但尚未保存，是否保存后关闭？（放弃会把各项恢复为上次保存的值，窗口保持在设置页）",
        resetSuccess: "已恢复默认设置并保存",
        resetFailed: "保存默认设置失败",
        ignore: "默认",
        ignoreDesc: "使用当前节点已设置的参数值，不做任何预设参数替换。",
        custom: "自定义参数",
        customDesc: "不改动任何参数，保持当前节点的取值。",
        precise: "精确模式",
        balanced: "平衡模式",
        creative: "创意模式",
        preciseDesc: "低随机性：低温（0.3）并收紧采样范围（top_p 0.85 / top_k 20），重复惩罚压到最小以免误伤代码与术语；适合代码、数学、逻辑推理与精确标注。",
        balancedDesc: "中等随机性：温度（0.6）与采样范围居中，兼顾准确性与自然表达；适合大多数图像标注与日常对话场景。",
        creativeDesc: "高随机性：高温（0.9）搭配更宽的采样范围与存在惩罚，鼓励更丰富的用词与新话题；适合创意写作、故事、诗歌等创作。",
        /* 采样参数名：中文界面用中文（Top P / Top K 为算法专有名，保持英文原名） */
        maxTokens: "最大词元数",
        temperature: "温度",
        topP: "Top P",
        topK: "Top K",
        repetition: "重复惩罚",
        presencePenalty: "存在惩罚",
        seed: "随机种子",
        enableLogPanel: "开启日志信息栏",
        showLogPanelDesc: "在节点底部显示推理日志信息，包含模型、参数、耗时等详细信息",
        clearLog: "清屏",
        refreshModels: "刷新模型列表",
        settings: "节点设置",
        refreshModelsSuccess: "模型列表已刷新",
        refreshModelsFailed: "获取模型列表失败",
        noModelsFound: "未找到模型",
        template: "模板",
        createTemplate: "新建模板",
        editTemplate: "编辑快捷系统提示词模板",
        templateName: "模板名称",
        templateContent: "模板内容",
        templateNamePlaceholder: "请输入模板名称",
        templateContentPlaceholder: "请输入系统提示词内容",
        noTemplates: "暂无模板，点击设置按钮进行模板管理",
        confirmDelete: "确定要删除此模板吗？",
        templateCreated: "模板创建成功",
        templateUpdated: "模板更新成功",
        templateDeleted: "模板删除成功",
        templateCreateFailed: "模板创建失败",
        templateUpdateFailed: "模板更新失败",
        templateDeleteFailed: "模板删除失败",
        templateNameRequired: "模板名称不能为空",
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
        sortByName: "按名称排序",
        sortByTime: "按时间排序",
        templateApplied: "模板已应用",
        manageTemplates: "管理模板",
        selectTemplate: "选择模板",
        templateTooltip: "点击选择系统提示词模板",
        clearContent: "清空内容",
        restoreContent: "恢复内容",
        clearTooltip: "点击清空当前输入框内容",
        restoreTooltip: "点击恢复上次清空的内容",
        noContentToClear: "没有可清空的内容",
        noContentToRestore: "没有可恢复的内容",
        cancel: "取消",
        discard: "放弃",
        confirm: "确定",
        close: "关闭",
        save: "保存",
        edit: "编辑模板",
        delete: "删除",
        recursiveMode: "递归遍历模式",
        sequentialMode: "顺序轮次模式",
        recursiveModeDesc: "一次性遍历所有子文件夹",
        sequentialModeDesc: "按文件夹名称顺序依次处理",
        navTemplates: "模板管理",
        helpTitle: "LM Studio 节点",
        helpDescription: "连接本地 LM Studio 服务器，调用本地部署的大语言模型（含视觉模型）进行图像分析与文本生成。",
        helpFeatures: "功能特性",
        helpFeature1: "支持本地 LM Studio 服务器连接，并自动发现已加载的模型",
        helpFeature2: "参数预设：精确 / 平衡 / 创意模式，一键套用推理参数",
        helpFeature3: "提示词预设：通用标注、专业详细、角色特征、场景分析、风格识别、差异比对",
        helpFeature4: "支持输出语言、篇幅与格式（JSON / Tag / 自然语言）控制，及图像分析、多图对比、文件夹批量打标",
        helpUsage: "使用说明",
        helpUsage1: "启动 LM Studio 并开启 Local Server（加载具备视觉能力的模型）",
        helpUsage2: "在节点中填写服务器地址，点击「刷新模型」加载可用模型",
        helpUsage3: "选择参数预设与提示词预设即可开始；关闭「使用预设」后可自定义用户 / 系统提示词",
        helpInput: "输入",
        helpInputDesc: "文本提示词，以及可选的图像输入（最多 4 张）",
        helpOutput: "输出",
        helpOutputDesc: "返回模型生成的文本结果（可在节点下方查看推理日志）",
        refreshing: "刷新中…",
        panelSubtitle: "配置本地服务、模型与推理参数",
        groupConnection: "连接与服务",
        groupOutputLog: "输出与日志",
        groupBatchFolder: "批量与文件夹",
        backToSettings: "返回设置",
        noTemplatesInPanel: "暂无模板，点击右上角「新建模板」添加",

        /* --- 自绘参数面板 --- */
        panelAria: "LM Studio 参数面板",
        cardPrompt: "提示词",
        cardInference: "推理参数",
        cardOutput: "输出控制",
        cardBatch: "批处理",
        cardLog: "推理日志",
        fieldUsePreset: "使用预设",
        fieldPresetPrompt: "模式",
        presetPromptGeneral: "通用标注",
        presetPromptDetailed: "专业详细",
        presetPromptCharacter: "角色特征",
        presetPromptScene: "场景分析",
        presetPromptStyle: "风格识别",
        presetPromptDiff: "差异比对",
        fieldPromptLength: "篇幅",
        promptLengthStandard: "标准",
        promptLengthShort: "短",
        promptLengthMedium: "中",
        promptLengthLong: "长",
        fieldPromptFormat: "格式",
        promptFormatStructured: "结构化Json",
        promptFormatTag: "Tag标签",
        promptFormatNatural: "自然语言",
        fieldOutputLanguage: "语言",
        fieldUserPrompt: "用户提示词",
        fieldSystemPrompt: "系统提示词",
        promptAvailableTip: "可用：关闭「使用预设」后本项生效",
        fieldModel: "模型",
        fieldMaxTokens: "最大词元数",
        fieldTemperature: "温度",
        fieldTopP: "Top P",
        fieldTopK: "Top K",
        fieldRepetition: "重复惩罚",
        fieldPresence: "存在惩罚",
        fieldSeed: "随机种子",
        fieldSeedControl: "生成后控制",
        seedCtlFixed: "固定",
        seedCtlIncrement: "递增",
        seedCtlDecrement: "递减",
        seedCtlRandomize: "随机",
        fieldSizeLimit: "图像边长",
        fieldRemoveThink: "移除思考",
        fieldUnloadModel: "卸载模型",
        fieldBatchMode: "批处理模式",
        fieldBatchFolder: "批处理路径",
        fieldSkipExists: "跳过重复",
        outputLanguageChinese: "中文",
        outputLanguageEnglish: "英文",
        /* 简称：避免下拉框为最长文案撑宽 */
        outputLanguageBoth: "中英",
        linkedByInput: "由输入连线控制",
        noLogYet: "暂无日志，运行节点后在此显示推理信息",
        batchFolderPlaceholder: "例如 D:\\dataset\\images",
        folderPickBtn: "设定",
        folderPickTooltip: "选择批处理文件夹；也可把文件夹直接拖到输入框，或手动输入 / 粘贴路径",
        folderDropNoPath: "浏览器安全限制：无法读取拖入文件夹的完整路径，请点击「设定」选择目录",
        folderPickFailed: "未能获取文件夹路径",
        folderNotFound: "未能自动定位该文件夹，请点击「设定」选择目录",
        folderLocateUnavailable: "定位接口不可用，请重启 ComfyUI 后重试（或直接点击「设定」）",
        userPromptPlaceholder: "自定义发送给模型的指令或问题，关闭「使用预设」后生效",
        systemPromptPlaceholder: "设定模型的角色与回复规则，仅在关闭「使用预设」时生效"
    },
    en: {
        title: "LM Studio Node Settings",
        connected: "Connected",
        disconnected: "Disconnected",
        corsWarning: "If a cross-origin issue is detected, make sure the LM Studio server has CORS support enabled.",
        corsSteps: "Steps: open LM Studio → go to Developer → select Local Server → find the Server Settings tab → enable the \"Enable CORS\" option, then restart the server.",
        availableModels: "Available Models",
        refresh: "🔄 Refresh",
        refreshStatus: "Refresh Status",
        serviceStatus: "Status",
        serviceEndpoint: "Service Endpoint",
        loadedModels: "Loaded Models",
        none: "None",
        checking: "Checking...",
        paramPreset: "Parameter Preset",
        timeoutSettings: "Timeout Settings",
        fetchModelsTimeout: "Fetch Models Timeout",
        apiCallTimeout: "API Call Timeout",
        unloadModelListTimeout: "Unload Model List Timeout",
        unloadModelTimeout: "Unload Model Timeout",
        seconds: "S",
        saveAll: "Save All Settings",
        resetDefault: "Reset Default",
        confirmReset: "Are you sure you want to reset to default settings? This will reset all configurations.",
        saveSuccess: "All settings saved to configuration file",
        saveSuccessRefresh: "Settings saved, please refresh page to update main node preset options",
        saveFailed: "Failed to save settings",
        endpointUnsavedRefresh: "The endpoint has been modified but not saved; it only takes effect after saving. Save and refresh status?",
        settingsUnsavedClose: "Some settings have been modified but not saved. Save before closing? (Discard restores the last saved values and keeps this window on the settings page)",
        resetSuccess: "Reset to default and saved",
        resetFailed: "Failed to save default settings",
        ignore: "Default",
        ignoreDesc: "Uses the parameter values already set on the node, with no preset replacement.",
        custom: "Custom",
        customDesc: "Leaves every parameter untouched at its current value.",
        precise: "Precise Mode",
        balanced: "Balanced Mode",
        creative: "Creative Mode",
        preciseDesc: "Low randomness: low temperature (0.3) with a tighter sampling range (top_p 0.85 / top_k 20) and minimal repetition penalty so code and terminology are not distorted; best for code, math, logic reasoning and precise captioning.",
        balancedDesc: "Medium randomness: temperature (0.6) and sampling range in the middle, balancing accuracy with natural phrasing; best for most captioning and everyday dialogue.",
        creativeDesc: "High randomness: higher temperature (0.9) with a wider sampling range and a presence penalty to encourage richer wording and new topics; best for creative writing, stories and poetry.",
        maxTokens: "Max Tokens",
        temperature: "Temperature",
        topP: "Top P",
        topK: "Top K",
        repetition: "Repetition",
        presencePenalty: "Presence Penalty",
        seed: "Seed",
        enableLogPanel: "Enable Log Panel",
        showLogPanelDesc: "Display inference log information at the bottom of the node, including model, parameters, duration, etc.",
        clearLog: "Clear",
        refreshModels: "Refresh Models",
        settings: "Node Settings",
        refreshModelsSuccess: "Model list refreshed",
        refreshModelsFailed: "Failed to fetch model list",
        noModelsFound: "No models found",
        template: "Template",
        createTemplate: "Create Template",
        editTemplate: "Edit Quick System Prompt Template",
        templateName: "Template Name",
        templateContent: "Template Content",
        templateNamePlaceholder: "Enter template name",
        templateContentPlaceholder: "Enter system prompt content",
        confirmDelete: "Are you sure you want to delete this template?",
        templateCreated: "Template created successfully",
        templateUpdated: "Template updated successfully",
        templateDeleted: "Template deleted successfully",
        templateCreateFailed: "Failed to create template",
        templateUpdateFailed: "Failed to update template",
        templateDeleteFailed: "Failed to delete template",
        templateNameRequired: "Template name is required",
        noTemplates: "No templates yet, click the settings button to manage templates",
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
        sortByName: "Sort by name",
        sortByTime: "Sort by time",
        templateApplied: "Template applied",
        manageTemplates: "Manage Templates",
        selectTemplate: "Select Template",
        templateTooltip: "Click to select system prompt template",
        clearContent: "Clear Content",
        restoreContent: "Restore Content",
        clearTooltip: "Click to clear current input content",
        restoreTooltip: "Click to restore last cleared content",
        noContentToClear: "No content to clear",
        noContentToRestore: "No content to restore",
        cancel: "Cancel",
        discard: "Discard",
        confirm: "Confirm",
        close: "Close",
        save: "Save",
        edit: "Edit Template",
        delete: "Delete",
        recursiveMode: "Recursive Mode",
        sequentialMode: "Sequential Mode",
        recursiveModeDesc: "Traverse all subfolders at once",
        sequentialModeDesc: "Process folders in order by name",
        navTemplates: "Template Manager",
        helpTitle: "LM Studio Node",
        helpDescription: "Connect to a local LM Studio server and call locally deployed LLMs (including vision models) for image analysis and text generation.",
        helpFeatures: "Features",
        helpFeature1: "Connect to local LM Studio server with automatic model discovery",
        helpFeature2: "Parameter presets: Precise / Balanced / Creative mode to apply inference params in one click",
        helpFeature3: "Prompt presets: General Caption, Detailed Pro, Character, Scene, Style, Diff Compare",
        helpFeature4: "Output language, length and format (JSON / Tag / Natural) control, plus image analysis, multi-image compare and folder batch captioning",
        helpUsage: "Usage",
        helpUsage1: "Launch LM Studio and enable Local Server (load a vision-capable model)",
        helpUsage2: "Enter the server address in the node and click “Refresh Models” to load available models",
        helpUsage3: "Pick parameter and prompt presets to start; turn off “Use Preset” to use custom user / system prompts",
        helpInput: "Input",
        helpInputDesc: "Text prompt, plus optional image input (up to 4 images)",
        helpOutput: "Output",
        helpOutputDesc: "Returns the text generated by the model (inference log shown under the node)",
        refreshing: "Refreshing…",
        panelSubtitle: "Configure the local service, model and inference parameters",
        groupConnection: "Connection & Service",
        groupOutputLog: "Output & Log",
        groupBatchFolder: "Batch & Folders",
        backToSettings: "Back to Settings",
        noTemplatesInPanel: "No templates yet. Use “New Template” in the top right corner.",

        /* --- custom parameter panel --- */
        panelAria: "LM Studio parameter panel",
        cardPrompt: "Prompt",
        cardInference: "Inference",
        cardOutput: "Output",
        cardBatch: "Batch",
        cardLog: "Inference Log",
        fieldUsePreset: "Use Preset",
        fieldPresetPrompt: "Mode",
        presetPromptGeneral: "Annotation",
        presetPromptDetailed: "Detailed",
        presetPromptCharacter: "Character",
        presetPromptScene: "Scene",
        presetPromptStyle: "Style",
        presetPromptDiff: "Comparison",
        fieldPromptLength: "Length",
        promptLengthStandard: "Standard",
        promptLengthShort: "Short",
        promptLengthMedium: "Medium",
        promptLengthLong: "Long",
        fieldPromptFormat: "Format",
        promptFormatStructured: "Structured JSON",
        promptFormatTag: "Tag Style",
        promptFormatNatural: "Natural Language",
        fieldOutputLanguage: "Language",
        fieldUserPrompt: "User Prompt",
        fieldSystemPrompt: "System Prompt",
        promptAvailableTip: "Available: this field takes effect when Use Preset is off",
        fieldModel: "Model",
        fieldMaxTokens: "Max Tokens",
        fieldTemperature: "Temperature",
        fieldTopP: "Top P",
        fieldTopK: "Top K",
        fieldRepetition: "Repetition",
        fieldPresence: "Presence Penalty",
        fieldSeed: "Seed",
        fieldSeedControl: "After-Generate Control",
        seedCtlFixed: "Fixed",
        seedCtlIncrement: "Increment",
        seedCtlDecrement: "Decrement",
        seedCtlRandomize: "Randomize",
        fieldSizeLimit: "Image Edge Length",
        fieldRemoveThink: "Remove Thinking",
        fieldUnloadModel: "Unload Model",
        fieldBatchMode: "Batch Mode",
        fieldBatchFolder: "Batch Path",
        fieldSkipExists: "Skip Duplicates",
        outputLanguageChinese: "Chinese",
        outputLanguageEnglish: "English",
        /* 简称：避免下拉框为最长文案撑宽 */
        outputLanguageBoth: "CN + EN",
        linkedByInput: "Controlled by input link",
        noLogYet: "No log yet. Run the node to see inference details.",
        batchFolderPlaceholder: "e.g. D:\\dataset\\images",
        folderPickBtn: "Set",
        folderPickTooltip: "Pick the batch folder; you can also drop a folder onto the input, or type / paste the path",
        folderDropNoPath: "Browser security blocks reading the dropped folder's full path — use “Set” to pick the directory",
        folderPickFailed: "No folder path received",
        folderNotFound: "Could not locate that folder automatically — use “Set” to pick it",
        folderLocateUnavailable: "Locate API unavailable — restart ComfyUI and retry (or click “Set”)",
        userPromptPlaceholder: "Custom instruction or question sent to the model — applies when “Use Preset” is off",
        systemPromptPlaceholder: "Sets the model's role and response rules — applies only when “Use Preset” is off"
    }
};

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function getLMStudioHelpHTML() {
    const locale = getLocale();
    const t = (key) => i18n[locale][key] || i18n['en'][key] || key;
    return `<h3 style="margin:0 0 12px 0;color:#93c5fd;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(147, 197, 253, 0.2);letter-spacing:0.2px;">${t('helpTitle')}</h3>
<p style="margin:0 0 16px 0;color:#e2e8f0;">${t('helpDescription')}</p>
<h4 style="margin:12px 0 8px 0;color:#60a5fa;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('helpFeatures')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature4')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#60a5fa;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('helpUsage')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpUsage1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpUsage2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpUsage3')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#60a5fa;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('helpInput')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpInputDesc')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#60a5fa;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('helpOutput')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpOutputDesc')}</li>
</ul>`;
}

function createLMStudioHelpPopup(description) {
    const docElement = document.createElement('div');
    docElement.style.cssText = `
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        position: absolute;
        color: #e2e8f0;
        font: 13px 'Segoe UI', system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        padding: 20px 24px 24px 24px;
        border-radius: 10px;
        border: 1px solid rgba(147, 197, 253, 0.3);
        z-index: 1000;
        overflow: hidden;
        max-width: 560px;
        max-height: 600px;
        min-width: 400px;
        box-shadow: 
            0 0 40px rgba(59, 130, 246, 0.15),
            0 20px 60px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    `;

    docElement.innerHTML = `<div style="overflow-y:auto;max-height:540px;padding-right:8px;scrollbar-width:thin;scrollbar-color:rgba(147,197,253,0.3) transparent;">${description}</div>`;

    document.body.appendChild(docElement);
    return docElement;
}

function $t(key) {
    const locale = getLocale();
    return i18n[locale][key] || i18n['en'][key] || key;
}

/**
 * 取推理日志文本：后端一次下发 {"zh": ..., "en": ...} 两版，
 * 这里按界面语言选择，语言切换时可即时重渲染。
 */
function pickLMSLogText(pair) {
    if (!pair || typeof pair !== "object") return "";
    const locale = getLocale();
    return String(pair[locale] ?? pair.zh ?? pair.en ?? "");
}

/* =========================================================================
 * Inference parameter presets
 * Shared by the node toolbar selector and the settings panel.
 * "Ignore" keeps the current node values, "Custom" leaves them untouched.
 * ========================================================================= */

const LMS_PARAM_PRESETS = {
    /* 不替换任何参数：params 必须为空，否则提示文案会列出并不会生效的值 */
    "Ignore": {
        params: {},
        labelKey: "ignore",
        descKey: "ignoreDesc",
    },
    /* 低随机性：低温 + 窄采样；重复惩罚压到最小，避免代码/术语被误伤 */
    "Precise": {
        params: {
            max_tokens: 4096,
            temperature: 0.3,
            top_p: 0.85,
            top_k: 20,
            repetition_penalty: 1.05,
            presence_penalty: 0.0,
        },
        labelKey: "precise",
        descKey: "preciseDesc",
    },
    /* 中等随机性：各参数居中，兼顾准确与自然表达 */
    "Balanced": {
        params: {
            max_tokens: 4096,
            temperature: 0.6,
            top_p: 0.9,
            top_k: 40,
            repetition_penalty: 1.1,
            presence_penalty: 0.1,
        },
        labelKey: "balanced",
        descKey: "balancedDesc",
    },
    /* 高随机性：高温 + 宽采样 + 存在惩罚，鼓励更丰富的用词与新话题 */
    "Creative": {
        params: {
            max_tokens: 4096,
            temperature: 0.9,
            top_p: 0.95,
            top_k: 60,
            repetition_penalty: 1.1,
            presence_penalty: 0.4,
        },
        labelKey: "creative",
        descKey: "creativeDesc",
    },
    /* 不修改任何参数 */
    "Custom": {
        params: {},
        labelKey: "custom",
        descKey: "customDesc",
    },
};

const LMS_PARAM_LABEL_KEYS = {
    max_tokens: "maxTokens",
    temperature: "temperature",
    top_p: "topP",
    top_k: "topK",
    repetition_penalty: "repetition",
    presence_penalty: "presencePenalty",
    seed: "seed",
};

const LMS_PRESET_WIDGETS = {
    max_tokens: "max_tokens",
    temperature: "temperature",
    top_p: "top_p",
    top_k: "top_k",
    repetition_penalty: "repetition_penalty",
    presence_penalty: "presence_penalty",
    seed: "seed",
};

function getLMSParamPreset(presetName) {
    return LMS_PARAM_PRESETS[presetName] || LMS_PARAM_PRESETS["Ignore"];
}

/** 该参数预设接管的 widget 名（Custom / Ignore 的 params 为空，即不接管任何参数） */
function getLMSPresetLockedWidgets(presetName) {
    const preset = getLMSParamPreset(presetName);
    return Object.keys(preset.params || {})
        .map((key) => LMS_PRESET_WIDGETS[key])
        .filter(Boolean);
}

function describeLMSParamPreset(presetName) {
    const preset = getLMSParamPreset(presetName);
    const desc = $t(preset.descKey);
    const entries = Object.entries(preset.params || {});
    if (entries.length === 0) return desc;
    const params = entries
        .map(([key, value]) => `${$t(LMS_PARAM_LABEL_KEYS[key] || key)}: ${value}`)
        .join(", ");
    return `${desc} · ${params}`;
}

function applyLMSParamPresetToNode(node, presetName) {
    const preset = getLMSParamPreset(presetName);
    if (!preset || presetName === "Custom" || presetName === "Ignore") return 0;

    let applied = 0;
    Object.entries(preset.params).forEach(([key, value]) => {
        const widgetName = LMS_PRESET_WIDGETS[key];
        if (!widgetName) return;
        const widget = node.widgets?.find((w) => w.name === widgetName);
        if (!widget) return;
        widget.value = value;
        if (widget.callback) widget.callback(value);
        applied++;
    });

    return applied;
}

const LMS_DEFAULT_ENDPOINT = "http://localhost:1234";

/* 模型占位值：与 lmstudio_node.py 的 NO_MODELS_FOUND 保持一致；
   提交/序列化沿用该英文标识，显示时由面板按界面语言本地化 */
const LMS_NO_MODELS_PLACEHOLDER = "(no models found)";

function normalizeEndpoint(value) {
    const text = String(value ?? "").trim();
    if (!text) return "";
    return text.replace(/\/+$/, "");
}

async function saveLMSPresetConfig(presetName) {
    try {
        await fetch("/zhihui/lmstudio/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ preset: presetName }),
        });
        return true;
    } catch (e) {
        return false;
    }
}

/* =========================================================================
 * UI foundation: glassmorphism tokens and shared components
 * Shared by the node toolbar, the template quick icons and the settings panel.
 * ========================================================================= */

const LMS_TOKENS = {
    color: {
        /* 科技感冷色系：午夜蓝底 + 青蓝主色 */
        base: "#070D1A",
        glass: "rgba(9, 17, 32, 0.74)",
        glassDeep: "rgba(5, 11, 22, 0.88)",
        glassSoft: "rgba(59, 130, 246, 0.08)",
        glassHover: "rgba(59, 130, 246, 0.16)",
        border: "rgba(96, 165, 250, 0.18)",
        borderHi: "rgba(147, 197, 253, 0.42)",
        /* 界面统一边线：整圈只用这一个不透明单色、1px 实线。
           半透明描边会分别叠在标题栏色带与卡片深底上，同一圈线呈现上下两种蓝 */
        line: "#2C5080",
        text: "#DDE9F5",
        textBright: "#F2FAFF",
        textDim: "#93A9C4",
        textFaint: "#7C93B0",
        primary: "#3B82F6",
        primaryDeep: "#2563EB",
        primaryLight: "#93C5FD",
        primaryGlow: "rgba(59, 130, 246, 0.35)",
        accent: "#8B5CF6",
        success: "#34D399",
        error: "#F87171",
        warn: "#FBBF24",
        info: "#60A5FA",
    },
    radius: { sm: "6px", md: "8px", lg: "10px", pill: "999px" },
    controlHeight: "24px",
    action: {
        primary: "#2563EB",
        primaryHover: "#3B82F6",
        danger: "#DC2626",
        dangerHover: "#EF4444",
        success: "#059669",
        successHover: "#10B981",
        neutral: "#475569",
        neutralHover: "#64748B",
        quiet: "#334155",
    },
    type: {
        display: "19px",
        title: "15px",
        body: "13.5px",
        label: "12.5px",
        micro: "11.5px",
        lhTight: "1.5",
        lhBase: "1.7",
    },
    blur: { panel: "blur(18px) saturate(1.5)", control: "blur(10px) saturate(1.3)" },
    shadow: {
        control: "0 4px 14px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        toolbar: "0 10px 26px rgba(2, 6, 23, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.07)",
        panel: "0 34px 90px rgba(2, 6, 23, 0.66), inset 0 1px 0 rgba(255, 255, 255, 0.09)",
        inset: "inset 0 2px 6px rgba(2, 6, 23, 0.40)",
    },
    motion: { fast: "140ms", base: "220ms", slow: "320ms", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    font: "PingFang SC, Source Han Sans SC, Noto Sans, 'Microsoft YaHei', sans-serif",
};

/* 提示词竖排标题栏与预设组标题块共用的底/墨色（半透明蓝底 + 淡蓝字，色号唯一来源） */
const LMS_TITLE_CHIP_BG = "linear-gradient(180deg, rgba(96, 165, 250, 0.30), rgba(59, 130, 246, 0.20))";
const LMS_TITLE_CHIP_INK = "#DBEAFE";

const LMS_ICONS = {
    refresh: '<path d="M20.6 12a8.6 8.6 0 1 1-2.6-6.1"/><polyline points="20.6 4.3 20.6 9.5 15.4 9.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    clear: '<rect x="3" y="3" width="18" height="18" rx="5"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/>',
    /* 回退箭头（undo）：与 refresh 的环形箭头明显区分 */
    restore: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
    layers: '<path d="m12 2.6 9 4.7-9 4.7-9-4.7z"/><path d="m3 12.6 9 4.7 9-4.7"/><path d="m3 17.4 9 4.7 9-4.7"/>',
    sliders: '<line x1="4" y1="7" x2="20" y2="7"/><circle cx="9.5" cy="7" r="2.1"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="15" cy="17" r="2.1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.6 14.1"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="3.2"/><polyline points="7.4 9.4 10.4 12.4 7.4 15.4"/><line x1="12.8" y1="15.4" x2="17" y2="15.4"/>',
    folder: '<path d="M3 7.2A2.2 2.2 0 0 1 5.2 5h3.4l1.9 2.2H19A2.2 2.2 0 0 1 21 9.4v8.4A2.2 2.2 0 0 1 18.8 20H5.2A2.2 2.2 0 0 1 3 17.8z"/>',
    close: '<line x1="6.4" y1="6.4" x2="17.6" y2="17.6"/><line x1="17.6" y1="6.4" x2="6.4" y2="17.6"/>',
    check: '<polyline points="5 12.8 9.8 17.6 19 6.4"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.6"/><circle cx="12" cy="7.8" r="1"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    pen: '<path d="M12 20h9"/><path d="M16.6 3.4a2.1 2.1 0 0 1 3 3L7.2 18.8 3 20l1.2-4.2z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m6 6 1 14h10l1-14"/>',
    arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="11 18 5 12 11 6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14.5 14.5 0 0 1 0 18a14.5 14.5 0 0 1 0-18z"/>',
    link: '<path d="M9.6 14.4 14.4 9.6"/><path d="M7.7 10.3 5.6 12.4a3.5 3.5 0 0 0 5 5l2.1-2.1"/><path d="M16.3 13.7l2.1-2.1a3.5 3.5 0 0 0-5-5l-2.1 2.1"/>',
    /* 可用性状态标识：风格同 zhiai-image-inverse-engine 的「对勾 / 禁止符」 */
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
};

function lmsSvg(iconKey, size) {
    const glyph = LMS_ICONS[iconKey] || "";
    const dim = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + dim + '" height="' + dim + '" fill="none" stroke="currentColor" '
        + 'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + glyph + "</svg>";
}

const _lmsStyleChunks = new Set();

function injectLMSStyles(chunkId, css) {
    if (_lmsStyleChunks.has(chunkId)) return;
    _lmsStyleChunks.add(chunkId);
    let styleEl = document.getElementById("lmstudio-ui-styles");
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "lmstudio-ui-styles";
        document.head.appendChild(styleEl);
    }
    styleEl.appendChild(document.createTextNode("\n/* " + chunkId + " */\n" + css));
}

/* ---- hover tooltip (glass) ---------------------------------------------- */

let _lmsTooltipEl = null;
let _lmsTooltipAnchor = null;

function showLMSGlassTooltip(anchorEl, text) {
    hideLMSGlassTooltip();
    if (!anchorEl || !text) return;
    _lmsTooltipAnchor = anchorEl;
    _lmsTooltipEl = document.createElement("div");
    _lmsTooltipEl.className = "lms-tooltip";
    _lmsTooltipEl.textContent = text;
    document.body.appendChild(_lmsTooltipEl);

    const btnRect = anchorEl.getBoundingClientRect();
    const tipRect = _lmsTooltipEl.getBoundingClientRect();
    let left = btnRect.left + (btnRect.width / 2) - (tipRect.width / 2);
    // 统一悬浮在目标上方，仅当上方空间不足时才回落到下方
    let top = btnRect.top - tipRect.height - 8;
    let placement = "top";

    if (left < 6) left = 6;
    if (left + tipRect.width > window.innerWidth - 6) left = window.innerWidth - tipRect.width - 6;
    if (top < 6) {
        top = btnRect.bottom + 8;
        placement = "bottom";
    }

    _lmsTooltipEl.style.left = left + "px";
    _lmsTooltipEl.style.top = top + "px";
    _lmsTooltipEl.dataset.placement = placement;
    requestAnimationFrame(() => _lmsTooltipEl && _lmsTooltipEl.classList.add("lms-tooltip--visible"));
}

function hideLMSGlassTooltip() {
    if (_lmsTooltipEl) {
        _lmsTooltipEl.remove();
        _lmsTooltipEl = null;
    }
    _lmsTooltipAnchor = null;
}

function attachLMSGlassTooltip(el, text) {
    const resolveText = () => (typeof text === "function" ? text() : text);
    const show = () => showLMSGlassTooltip(el, resolveText());
    el.addEventListener("mouseenter", show);
    el.addEventListener("focus", show);
    el.addEventListener("mouseleave", hideLMSGlassTooltip);
    el.addEventListener("blur", hideLMSGlassTooltip);
    el.addEventListener("click", hideLMSGlassTooltip);
}

/* ---- icon button --------------------------------------------------------- */

function createLMSIconButton(options) {
    const opts = options || {};
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lms-icon-btn lms-icon-btn--" + (opts.variant || "default")
        + " lms-icon-btn--" + (opts.size || "md");
    btn.innerHTML = '<span class="lms-icon-btn__glyph">' + lmsSvg(opts.icon, opts.iconSize) + "</span>";
    const label = opts.label || "";
    if (label) {
        btn.setAttribute("aria-label", label);
        btn.title = "";
    }

    let revertTimer = null;

    const clearRevert = () => {
        if (revertTimer) {
            clearTimeout(revertTimer);
            revertTimer = null;
        }
    };

    const setState = (state, revertAfter) => {
        clearRevert();
        btn.classList.remove("lms-icon-btn--loading", "lms-icon-btn--success", "lms-icon-btn--error");
        if (state && state !== "idle") btn.classList.add("lms-icon-btn--" + state);
        const busy = state === "loading";
        btn.setAttribute("aria-busy", busy ? "true" : "false");
        btn.disabled = busy || !!opts.disabled;
        if (revertAfter) {
            revertTimer = setTimeout(() => setState("idle"), revertAfter);
        }
    };

    const setDisabled = (value) => {
        opts.disabled = !!value;
        btn.disabled = !!value;
        btn.classList.toggle("lms-icon-btn--disabled", !!value);
    };

    const api = {
        el: btn,
        setState,
        setDisabled,
        setTooltip: (text) => { opts.tooltip = text; },
        dispose: () => {
            clearRevert();
            hideLMSGlassTooltip();
            btn.remove();
        },
    };

    const handleClick = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (btn.disabled) return;
        if (opts.onClick) {
            try {
                await opts.onClick(api);
            } catch (err) {
                console.error("[LMStudio] toolbar action failed:", err);
                setState("error", 1400);
            }
        }
    };

    btn.addEventListener("click", handleClick);
    btn.addEventListener("pointerdown", (e) => e.stopPropagation());
    if (opts.tooltip) {
        attachLMSGlassTooltip(btn, () => (typeof opts.tooltip === "function" ? opts.tooltip() : opts.tooltip));
    }

    return api;
}

const LMS_FOUNDATION_CSS = `
.lms-preset {
    position: relative;
    display: flex;
    align-items: center;
    flex: 0 1 auto;
    min-width: 88px;
    max-width: 156px;
    /* 框架高度与提示词行内下拉（「语言」等）一致：整框 22px（含边框） */
    height: 22px;
    box-sizing: border-box;
    /* 标题栏专用风格：描边式（透明底 + 常显细边框）。
       与参数区「深底 + 描边」的矩形下拉框仍可区分（这里底色透明） */
    background: transparent;
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    color: ${LMS_TOKENS.color.text};
}
.lms-preset:hover {
    color: ${LMS_TOKENS.color.textBright};
    background: ${LMS_TOKENS.color.glassHover};
    border-color: ${LMS_TOKENS.color.borderHi};
}
/* 下拉指示器箭头：SVG 矢量符号 + mask 填充 currentColor */
.lms-preset::after {
    content: "";
    position: absolute;
    right: 7px;
    top: 50%;
    width: 8px;
    height: 8px;
    aspect-ratio: 1 / 1;
    margin-top: -4px;
    box-sizing: border-box;
    background: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpolyline points='1,2.5 4,5.5 7,2.5' fill='none' stroke='%23fff' stroke-width='1.4'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpolyline points='1,2.5 4,5.5 7,2.5' fill='none' stroke='%23fff' stroke-width='1.4'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    pointer-events: none;
}
/* 展开态：箭头绕中心翻转 180°，关闭向下、打开向上（无过渡，瞬切） */
.lms-preset:has(.lms-preset-select:open)::after,
.lms-preset.lms-open::after {
    transform: rotate(180deg);
}
/* 展开态：浅蓝底 + 主题色描边（与参数区下拉同一套：只亮边框、不加聚焦环） */
.lms-preset:has(.lms-preset-select:open),
.lms-preset.lms-open {
    color: ${LMS_TOKENS.color.textBright};
    background: ${LMS_TOKENS.color.glassSoft};
    border-color: ${LMS_TOKENS.color.primary};
}
.lms-preset-select {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    /* 减去外框上下各 1px 边框：外框 22px 时内芯为 20px */
    height: 20px;
    padding: 0 24px 0 8px;
    font-family: inherit;
    /* 与选单选项字号共用同一令牌（type.micro） */
    font-size: ${LMS_TOKENS.type.micro};
    color: inherit;
    background: transparent;
    border: none;
    border-radius: ${LMS_TOKENS.radius.sm};
    outline: none;
    cursor: pointer;
    /* 同 .lms-select：标题栏下拉也保持单行，超长预设名裁切而不换行溢出 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
/* 悬停/聚焦样式由外框容器承担，内部原生 select 保持透明 */
.lms-preset-select:hover { color: ${LMS_TOKENS.color.textBright}; }
.lms-preset-select:focus-visible {
    color: ${LMS_TOKENS.color.textBright};
    outline: 2px solid ${LMS_TOKENS.color.primaryLight};
    outline-offset: 1px;
}
.lms-preset-select option {
    background: ${LMS_TOKENS.color.base};
    color: ${LMS_TOKENS.color.text};
}
.lms-icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 0;
    background: transparent;
    color: ${LMS_TOKENS.color.textDim};
    border: none;
    border-radius: ${LMS_TOKENS.radius.sm};
    cursor: pointer;
    transition: color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                box-shadow ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
/* 图标按钮悬停底为正方形：宽高都取控件高度 */
.lms-icon-btn--md,
.lms-icon-btn--sm { width: ${LMS_TOKENS.controlHeight}; height: ${LMS_TOKENS.controlHeight}; }
.lms-icon-btn__glyph { display: inline-flex; align-items: center; justify-content: center; line-height: 0; }
.lms-icon-btn:hover {
    color: ${LMS_TOKENS.color.textBright};
    background: ${LMS_TOKENS.color.glassHover};
    box-shadow: ${LMS_TOKENS.shadow.control};
}
.lms-icon-btn--restore:hover { color: ${LMS_TOKENS.color.success}; }
.lms-icon-btn--clear:hover { color: ${LMS_TOKENS.color.error}; }
.lms-icon-btn--template:hover { color: ${LMS_TOKENS.color.primaryLight}; }
.lms-icon-btn:focus-visible {
    outline: 2px solid ${LMS_TOKENS.color.primaryLight};
    outline-offset: 2px;
}
.lms-icon-btn[disabled] { opacity: 0.55; cursor: not-allowed; }
.lms-icon-btn--loading {
    color: ${LMS_TOKENS.color.primaryLight};
    background: rgba(59, 130, 246, 0.16);
}
.lms-icon-btn--loading .lms-icon-btn__glyph { animation: lms-spin 900ms linear infinite; }
.lms-icon-btn--success {
    color: ${LMS_TOKENS.color.success};
    background: rgba(52, 211, 153, 0.16);
    box-shadow: 0 6px 18px rgba(52, 211, 153, 0.22);
}
.lms-icon-btn--error {
    color: ${LMS_TOKENS.color.error};
    background: rgba(248, 113, 113, 0.16);
    box-shadow: 0 6px 18px rgba(248, 113, 113, 0.22);
}
@keyframes lms-spin { to { transform: rotate(360deg); } }

.lms-tooltip {
    position: fixed;
    z-index: 10060;
    box-sizing: border-box;
    width: max-content;
    max-width: 320px;
    padding: 6px 10px;
    border-radius: ${LMS_TOKENS.radius.sm};
    background: ${LMS_TOKENS.color.glassDeep};
    border: 1px solid ${LMS_TOKENS.color.borderHi};
    box-shadow: ${LMS_TOKENS.shadow.control};
    backdrop-filter: ${LMS_TOKENS.blur.control};
    -webkit-backdrop-filter: ${LMS_TOKENS.blur.control};
    color: ${LMS_TOKENS.color.textBright};
    font-family: ${LMS_TOKENS.font};
    /* 提示文案比原来大一号 */
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0.01em;
    overflow-wrap: anywhere;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-3px);
    transition: opacity ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                transform ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-tooltip--visible { opacity: 1; transform: translateY(0); }
.lms-tooltip[data-placement="top"] { transform: translateY(3px); }
.lms-tooltip[data-placement="top"].lms-tooltip--visible { transform: translateY(0); }

/* 多行文本框的滚动条改为真实 DOM 覆盖层（构建见 attachLMSScrollbar）。
   原因：Chrome 对 ::-webkit-scrollbar 系列伪元素只应用 display / width / height / background，
   cursor 写在滑块或箭头上不生效（实测悬停滑块仍是指针箭头），要「悬停变手型」只能自绘。
   这里把 UA 滚动条收干净：display:none 管 Chromium，scrollbar-width:none 管 Firefox；
   两者都不影响键盘 ↑/↓ 与滚轮滚动。
   注意别再给这两个元素写 scrollbar-color —— 一旦设成非 auto，Chrome 会忽略整组
   ::-webkit-scrollbar（实测同一元素加 scrollbar-width:thin 后轨道从 8px 变回 10px），
   弹窗那几处细滚动条正是这种情况，所以它们实际占 10px 而不是规则里写的 6px。 */
.lms-textarea::-webkit-scrollbar,
.lms-editor__textarea::-webkit-scrollbar { display: none; width: 0; height: 0; }
.lms-textarea,
.lms-editor__textarea { scrollbar-width: none; }

/* ---- 自绘滚动条 ---------------------------------------------------------- */
/* 12px 宽与原 UA 轨道同量级；高度由 JS 按输入框实际高度写入 —— align-self: center
   只管垂直居中，不等高（外层 .lms-field__frame 是 stretch，竖排标题可能比框更高） */
.lms-scroll {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 12px;
    align-self: center;
    user-select: none;
}
.lms-scroll[hidden] { display: none; }
.lms-scroll__bar {
    position: relative;
    flex: 1 1 auto;
    width: 8px;
    border-radius: ${LMS_TOKENS.radius.pill};
    background: rgba(148, 163, 184, 0.12);
}
.lms-scroll__thumb {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    min-height: 20px;
    border-radius: ${LMS_TOKENS.radius.pill};
    background-color: rgba(147, 197, 253, 0.45);
    cursor: pointer;
    touch-action: none;
    transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-scroll__thumb:hover,
.lms-scroll__thumb[data-dragging="true"] { background-color: rgba(147, 197, 253, 0.7); }
.lms-scroll__btn {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    padding: 0;
    border: none;
    border-radius: 3px;
    background: transparent;
    color: ${LMS_TOKENS.color.textDim};
    cursor: pointer;
    transition: color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-scroll__btn:hover { color: ${LMS_TOKENS.color.textBright}; background: ${LMS_TOKENS.color.glassHover}; }
.lms-scroll__btn > svg { flex: 0 0 auto; margin: auto; }
/* 滚动条紧贴输入框右缘：.lms-control 默认的 7px 间距是给「控件 + 按钮」组合用的 */
.lms-control:has(.lms-scroll) { gap: 0; }

@media (prefers-reduced-motion: reduce) {
    .lms-icon-btn,
    .lms-tooltip { transition: none; }
    .lms-icon-btn--loading .lms-icon-btn__glyph { animation: none; opacity: 0.6; }
}
`;

injectLMSStyles("foundation", LMS_FOUNDATION_CSS);

const LMS_EDITOR_CSS = `
.lms-editor-overlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10005;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(2, 6, 23, 0.62);
    backdrop-filter: blur(10px) saturate(1.25);
    -webkit-backdrop-filter: blur(10px) saturate(1.25);
}
.lms-editor {
    display: flex;
    flex-direction: column;
    width: 640px;
    max-width: 92vw;
    height: 85vh;
    max-height: 820px;
    padding: 0;
    overflow: hidden;
    border-radius: 12px;
    background: ${LMS_TOKENS.color.glassDeep};
    border: 1px solid ${LMS_TOKENS.color.line};
    box-shadow: 0 34px 90px rgba(2, 6, 23, 0.66);
    backdrop-filter: ${LMS_TOKENS.blur.panel};
    -webkit-backdrop-filter: ${LMS_TOKENS.blur.panel};
    color: ${LMS_TOKENS.color.text};
    font-family: ${LMS_TOKENS.font};
    animation: lms-editor-in ${LMS_TOKENS.motion.base} ${LMS_TOKENS.motion.easing};
}
@keyframes lms-editor-in {
    from { opacity: 0; transform: translateY(10px) scale(0.985); }
    to { opacity: 1; transform: none; }
}
.lms-editor__head {
    display: flex;
    align-items: center;
    gap: 11px;
    flex: 0 0 auto;
    padding: 15px 24px;
    border-bottom: 1px solid ${LMS_TOKENS.color.line};
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.22), rgba(59, 130, 246, 0));
}
.lms-editor__head-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex: 0 0 auto;
    border-radius: 6px;
    color: ${LMS_TOKENS.color.primaryLight};
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.26), rgba(37, 99, 235, 0.12));
    border: 1px solid ${LMS_TOKENS.color.line};
}
.lms-editor__title {
    margin: 0;
    font-size: ${LMS_TOKENS.type.display};
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: 0.01em;
    color: ${LMS_TOKENS.color.textBright};
}
.lms-editor__body { display: flex; flex-direction: column; flex: 1; min-height: 0; padding: 20px 24px 22px; }
.lms-editor__field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
.lms-editor__field--grow { flex: 1; min-height: 0; margin-bottom: 18px; }
/* 正文框与覆盖层滚动条成一行：滚动条覆盖在框的右缘内侧（不占宽度，两框右缘才齐），
   高度由 JS 按框的实际高度写入 */
.lms-editor__grow-row { position: relative; display: flex; align-items: stretch; flex: 1; min-height: 0; }
.lms-editor__grow-row .lms-scroll { position: absolute; right: 5px; top: 0; }
.lms-editor__label { font-size: ${LMS_TOKENS.type.label}; font-weight: 500; letter-spacing: 0.01em; color: ${LMS_TOKENS.color.textDim}; }
.lms-editor__input,
.lms-editor__textarea {
    width: 100%;
    padding: 10px 12px;
    font-family: inherit;
    font-size: ${LMS_TOKENS.type.body};
    color: ${LMS_TOKENS.color.text};
    background: rgba(4, 11, 22, 0.66);
    border: 1px solid ${LMS_TOKENS.color.line};
    border-radius: ${LMS_TOKENS.radius.sm};
    outline: none;
    transition: border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-editor__input::placeholder,
.lms-editor__textarea::placeholder { color: ${LMS_TOKENS.color.textFaint}; }
.lms-editor__input:focus,
.lms-editor__textarea:focus {
    border-color: ${LMS_TOKENS.color.primary};
}
.lms-editor__textarea { flex: 1; min-height: 260px; resize: none; padding-right: 26px; line-height: ${LMS_TOKENS.type.lhBase}; }
.lms-editor .tc-select,
.lms-editor .tc-input { line-height: inherit; }
.lms-editor__actions { display: flex; justify-content: flex-end; gap: 10px; }
.lms-editor__btn {
    padding: 10px 22px;
    font-family: inherit;
    font-size: ${LMS_TOKENS.type.body};
    font-weight: 600;
    border: none;
    border-radius: ${LMS_TOKENS.radius.md};
    cursor: pointer;
    transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-editor__btn:focus-visible { outline: 2px solid ${LMS_TOKENS.color.primaryLight}; outline-offset: 2px; }
.lms-editor__btn--ghost {
    color: #FFFFFF;
    background: ${LMS_TOKENS.action.primary};
}
.lms-editor__btn--ghost:hover {
    color: #FFFFFF;
    background: ${LMS_TOKENS.action.primaryHover};
}
.lms-editor__btn--primary {
    color: #FFFFFF;
    background: ${LMS_TOKENS.action.primary};
}
.lms-editor__btn--primary:hover { background: ${LMS_TOKENS.action.primaryHover}; }

@media (prefers-reduced-motion: reduce) {
    .lms-editor { animation: none; }
    .lms-editor__btn { transition: none; }
}
`;

injectLMSStyles("template-editor", LMS_EDITOR_CSS);

injectLMSStyles("template-category", `
.lms-tc-scope {
    --tc-chip-font: ${LMS_TOKENS.type.label};
    --tc-chip-fg: ${LMS_TOKENS.color.textDim};
    --tc-chip-bg: ${LMS_TOKENS.color.glassSoft};
    --tc-chip-border: ${LMS_TOKENS.color.border};
    --tc-chip-fg-hover: ${LMS_TOKENS.color.textBright};
    --tc-chip-bg-hover: ${LMS_TOKENS.color.glassHover};
    --tc-chip-border-hover: ${LMS_TOKENS.color.borderHi};
    --tc-chip-bg-active: ${LMS_TOKENS.color.primaryLight};
    --tc-chip-fg-active: #0A1120;
    --tc-chip-border-active: ${LMS_TOKENS.color.primaryLight};
    --tc-tool-bg-hover: rgba(255, 255, 255, 0.18);
    --tc-focus: ${LMS_TOKENS.color.primaryLight};
    --tc-badge-font: ${LMS_TOKENS.type.micro};
    --tc-badge-fg: ${LMS_TOKENS.color.primaryLight};
    --tc-badge-bg: ${LMS_TOKENS.color.glassHover};
    --tc-badge-border: ${LMS_TOKENS.color.borderHi};
    --tc-field-font: ${LMS_TOKENS.type.body};
    --tc-field-fg: ${LMS_TOKENS.color.text};
    --tc-field-bg: rgba(4, 11, 22, 0.66);
    --tc-field-border: ${LMS_TOKENS.color.line};
    --tc-field-border-hover: ${LMS_TOKENS.color.primary};
    --tc-field-border-focus: ${LMS_TOKENS.color.primary};
    --tc-field-radius: ${LMS_TOKENS.radius.sm};
    --tc-field-padding: 10px 12px;
    --tc-popover-bg: ${LMS_TOKENS.color.glassDeep};
    --tc-popover-border: ${LMS_TOKENS.color.line};
    --tc-popover-hover: ${LMS_TOKENS.color.glassHover};
    --tc-popover-fg-hover: ${LMS_TOKENS.color.textBright};
    --tc-popover-radius: ${LMS_TOKENS.radius.md};
    --tc-popover-shadow: ${LMS_TOKENS.shadow.toolbar};
    --tc-popover-check: ${LMS_TOKENS.color.primaryLight};
    --tc-popover-divider: ${LMS_TOKENS.color.border};
    --tc-popover-max-height: 264px;
    --tc-accent: ${LMS_TOKENS.color.primaryLight};
    --tc-danger: ${LMS_TOKENS.action.danger};
    --tc-danger-hover: ${LMS_TOKENS.action.dangerHover};
}
`);

/* =========================================================================
 * Custom parameter panel: glass cards, fields and hand-drawn controls
 * Replaces the native ComfyUI widgets on the node body while keeping the
 * original widgets alive (hidden) for serialization and backend submission.
 * ========================================================================= */

const LMS_PANEL_CSS = `
.lms-panel-host,
.lms-panel-host *,
.lms-panel,
.lms-panel * { box-sizing: border-box; }
.lms-panel-host {
    width: 100%;
    padding: 0 0 2px;
    background: none;
    border: none;
}
.lms-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    min-width: 0;
    /* 透明：卡片之间透出节点背景，呈现彼此独立的功能区块（卡片本身仍为实底） */
    background: none;
    border-radius: ${LMS_TOKENS.radius.lg};
    font-family: ${LMS_TOKENS.font};
    font-size: ${LMS_TOKENS.type.body};
    line-height: ${LMS_TOKENS.type.lhTight};
    color: ${LMS_TOKENS.color.text};
}

/* ---- card ---------------------------------------------------------------- */
.lms-card {
    position: relative;
    border-radius: ${LMS_TOKENS.radius.lg};
    /* 标题栏色带直接画在卡片自身背景上（高度与 .lms-card__head 一致）：
       与圆角同源裁切，标题栏底色块在任意缩放下都不会越出边框 */
    background:
        linear-gradient(180deg, rgba(59, 130, 246, 0.26), rgba(59, 130, 246, 0.08) 38px, transparent 38px),
        linear-gradient(180deg, #0e1a2e, #070e1b);
    /* 无任何阴影：既不投影也不做 inset 内高光（后者会在卡片顶部出现一条亮线），
       功能区的边界只由 1px 单色外框线表达 */
}
/* 外框线：用 overlay 单独绘制 —— 1px 线宽的中心正好压在卡片边缘（半内半外，
   与边缘同心），并置于卡片内容之上（z-index 最高，不被标题栏底色或字段遮挡）。
   描边取不透明单色：半透明色会分别叠在标题栏蓝色带与卡片深色底上，同一圈框线
   上下呈现两种蓝（顶≈#325C97 / 底≈#264369），不再是单色；不透明后整圈同色 */
.lms-card::after {
    content: "";
    position: absolute;
    inset: -0.5px;
    border: 1px solid #2C5080;
    border-radius: calc(${LMS_TOKENS.radius.lg} + 0.5px);
    pointer-events: none;
    z-index: 3;
}
.lms-card__head {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
    /* 高度与卡片背景里的标题栏色带保持一致（38px） */
    height: 38px;
    padding: 7px 10px;
    /* 标题栏自身不绘制底色：底色由卡片统一绘制，避免两层圆角错位 */
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
}
.lms-card__head:focus-visible {
    outline: 2px solid ${LMS_TOKENS.color.primaryLight};
    outline-offset: -2px;
}
.lms-card__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    border-radius: ${LMS_TOKENS.radius.sm};
    color: ${LMS_TOKENS.color.primaryLight};
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(37, 99, 235, 0.10));
    border: 1px solid rgba(59, 130, 246, 0.30);
    /* 不使用 box-shadow：画布缩放会把模糊外发光放大成柔光层（「双框/错位」观感），
       也会把 1px inset 内高光放大成内层轮廓线（四角直角叠痕、顶部亮带） */
    line-height: 0;
}
.lms-card__title {
    flex: 0 0 auto;
    font-size: ${LMS_TOKENS.type.body};
    font-weight: 600;
    letter-spacing: 0.01em;
    color: ${LMS_TOKENS.color.textBright};
    white-space: nowrap;
}
/* 标题栏右侧操作区（提示词卡片的模板/恢复/清空按钮） */
.lms-card__actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
}
/* 预设开关排在按钮组右侧，额外留白使其明显远离按钮 */
.lms-card__actions > .lms-field {
    margin-left: 14px;
}
.lms-card__body { display: block; }
.lms-fields {
    display: flex;
    flex-direction: column;
    gap: 9px;
    /* 上内边距与字段间距一致（gap），使标题栏到首个字段的距离等于字段之间的距离 */
    padding: 9px 11px 12px;
}

/* 单行并列字段组（如 模式 / 篇幅 / 格式 / 语言）：等宽若干列。列数由子项数量自动决定。
   每格的标题做成「实心色块」，与右侧下拉拼成一个整控件（结构参照 zhiai-image-inverse-engine
   的 output-preset-group：左侧实心标题块 + 右侧深色数值区，中间无缝隙、无分隔线） */
.lms-fields__row {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    /* 紧凑版式：列距由 8px 收窄到 6px */
    gap: 6px;
    align-items: center;
    min-width: 0;
}
.lms-fields__row .lms-field {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    /* 标题块与数值区贴合：0 间隙，拼成一个整控件 */
    gap: 0;
    min-width: 0;
    /* 紧凑版式：整组框架显式定高 22px（含边框）。
       不定高度时标题块文字的默认行高（约 17px）会把外框撑高，
       出现「标题下方缺一块」式的超高框架 */
    height: 22px;
    box-sizing: border-box;
    /* 整组外框画在组容器上：标题块与数值区都不再自行描边，
       默认也保留与模型下拉一致的可见边框，避免静止状态下控件轮廓消失 */
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    overflow: hidden;
    transition: border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
/* 标题块：底色与墨字采用提示词竖排标题栏的同款色号（半透明蓝底 + 淡蓝字），
   固定宽（两字标题等宽，故四个下拉也等宽对齐）；自身不描边，圆角由组容器裁切 */
.lms-fields__row .lms-field__label {
    flex: 0 0 auto;
    justify-content: center;
    min-width: 0;
    /* 不固定高度，随 flex stretch 填满整组框架；
       行高收紧为 1，防止 11.5px 字号的默认行高超出 15px 框架把文字裁切 */
    line-height: 1;
    padding: 0 4px;
    border: none;
    /* 字号与「用户提示词」竖排标题同号（micro），保证两组标题视觉一致 */
    font-size: ${LMS_TOKENS.type.micro};
    /* 填充用平色：垂直渐变的上下边缘各露出一像素行（亮蓝/深蓝），
       在深色卡片上会呈现两条不同色的线，故取渐变的中点色平铺 */
    background: rgba(78, 148, 248, 0.25);
    color: ${LMS_TITLE_CHIP_INK};
    font-weight: 600;
}
/* 数值区：占满剩余宽度；同样不自行描边 */
.lms-fields__row .lms-control {
    flex: 1 1 0;
    min-width: 0;
}
/* 行内下拉只保留「无描边、圆角交给组容器裁切」的合并式版式：
   箭头符号的几何完全沿用参数区标准下拉（同「生成后控制」），不再单独覆盖位置；
   右侧内边距收窄到 22px（箭头 right 12px + 宽 8px，再留 2px 间隙），
   左侧 5px：把空间让给选项文字，避免四字选项（如「差异比对」）在收起态被省略号裁切 */
.lms-fields__row .lms-select {
    /* 紧凑版式：与整组框架同高 22px；
       标题块随 flex stretch 同高；左内边距收 1px 让给文字 */
    height: 22px;
    /* 单行控件行高收紧为 1：默认 1.5 行高（约 17px）会超出 15px 盒高导致文字被裁 */
    line-height: 1;
    padding: 0 22px 0 4px;
    border: none;
    border-radius: 0;
    /* 显示文字与标题块同号（micro），与「用户提示词」标题字号一致 */
    font-size: ${LMS_TOKENS.type.micro};
}
/* 悬停 / 展开：整组框线亮起（悬停浅蓝、展开主题色） */
.lms-fields__row .lms-field:hover { border-color: ${LMS_TOKENS.color.borderHi}; }
.lms-fields__row .lms-field:has(.lms-select:open),
.lms-fields__row .lms-field:has(.lms-open) { border-color: ${LMS_TOKENS.color.primary}; }
/* 被门控禁用时：标题块与数值区一起降透明度（数值区的灰化由通用规则负责） */
.lms-fields__row .lms-field[data-locked="true"] .lms-field__label { opacity: 0.45; }

/* ---- 等宽多格并排（如输出控制：大小限制 / 移除思考 / 卸载模型） ------------ */
/* 每格「标签 + 控件」同处一行（不上下分行），整组在格内居中；格宽由字段数自动等分，
   格间以 1px 竖线分隔。格内控件按窄格优化（见下），
   保证三项在 360px 节点宽度下仍是一行 */
.lms-fields--tiles {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: 0;
    /* 整区总高 3+26+3 = 32px，与推理参数棋盘格的单行行高一致 */
    padding: 3px;
}
.lms-fields--tiles .lms-field {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 0;
    height: 26px;
    padding: 0 5px;
}
/* 格间竖线：只画在后继格上，首格不描边 */
.lms-fields--tiles .lms-field + .lms-field { border-left: 1px solid ${LMS_TOKENS.color.border}; }
/* 标签：micro 号且不收缩（窄格下先压缩控件，避免标签被截断） */
.lms-fields--tiles .lms-field__label {
    flex: 0 0 auto;
    font-size: ${LMS_TOKENS.type.micro};
}
.lms-fields--tiles .lms-control {
    flex: 0 1 auto;
    justify-content: center;
    gap: 0;
}
/* 数字框：宽度按 5 位数设计，空间不足时才收缩（保底 40px）；
   高度与推理参数数值框一致（20px 紧凑档） */
.lms-fields--tiles .lms-number {
    flex: 0 1 auto;
    width: calc(5ch + 16px);
    min-width: 40px;
    height: 20px;
}
/* 开关（窄格紧凑版）：不做本地缩放，规格由标准开关组件统一决定
   （.lms-switch CSS，42×16 深灰胶囊轨 + 固定圆角 LED 灯板），所有功能区同一外观。
   曾试过在窄格整体缩小一号，但画布缩放/非整数像素下边距会被抗锯齿吃掉，
   灯体视觉上顶破轨道圆角，故任何布局都不再覆写开关尺寸 */

/* 棋盘格卡片里的「整行字段」容器（如模型下拉框）：文字与格内左缘对齐（3 + 8 = 11px） */
/* 「模型」整行容器：无上下内边距，行高与棋盘格行相同——色带（含深色带）逐条等高贯通 */
.lms-fields--wide { padding: 0 3px; }
.lms-fields--wide .lms-field {
    padding: 4px 8px;
    height: calc(${LMS_TOKENS.controlHeight} + 8px);
}
/* 「模型」行内的刷新按钮：与下拉框成一组，按钮不收缩、下拉框可收缩以免溢出 */
.lms-fields--wide .lms-icon-btn { flex: 0 0 auto; }

/* ---- chessboard grid（等宽单元格 · 每项单行 · 交错底色分隔） ---------------- */
.lms-fields--grid {
    display: grid;
    /* 列数由布局声明（cardSpec.columns）注入，默认 2 列 */
    grid-template-columns: repeat(var(--lms-grid-cols, 2), minmax(0, 1fr));
    /* 行高固定为「控件高 + 上下内边距」：与内容无关，每条色带尺寸严格一致 */
    grid-auto-rows: calc(${LMS_TOKENS.controlHeight} + 8px);
    /* 不用表格线也不用缝隙：格子紧贴相连，靠交错底色区分（连成整块色带）；
       上下不留内边距（留白会使首/末条深色带显得比其它色带高）；
       左右同样不留内边距 —— 容器只要留 3px，色带就会在卡片描边前停住，
       右缘显出一条断开的暗缝。缩进改由格子的 11px 横向内边距承担，
       文字左缘仍与其它卡片对齐（11px） */
    gap: 0;
    padding: 0;
    /* stretch：同行单元格等高填满，纵向也不会出现缝隙（内容仍各自居中） */
    align-items: stretch;
}
/* 单元格：单行显示（标签在左、控件在右），直角方格（不用圆角） */
.lms-fields--grid .lms-field {
    display: flex;
    flex-direction: row;
    /* 仅当出现「由输入接管」提示时才换行，正常情况恒为单行 */
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    min-width: 0;
    /* 横向 11px：容器已不再留左右内边距，缩进全部落在格子内，色带因此顶到卡片描边 */
    padding: 4px 11px;
    border-radius: 0;
}
/* 连线接管状态提示独占格内首行 */
.lms-fields--grid .lms-field__note {
    flex: 0 0 100%;
    margin-bottom: 0;
}
/* 棋盘底色：按「行」整行交错着色（2 列 = 4n+1/4n+2 整行着色，3 列 = 6n+1..6n+3），
   横向色带把相邻设置行在视觉上分隔开，无需任何线条 */
.lms-fields--grid[data-cols="2"] .lms-field:not(.lms-field--span):nth-child(4n+1),
.lms-fields--grid[data-cols="2"] .lms-field:not(.lms-field--span):nth-child(4n+2),
.lms-fields--grid[data-cols="3"] .lms-field:not(.lms-field--span):nth-child(6n+1),
.lms-fields--grid[data-cols="3"] .lms-field:not(.lms-field--span):nth-child(6n+2),
.lms-fields--grid[data-cols="3"] .lms-field:not(.lms-field--span):nth-child(6n+3) {
    background: rgba(59, 130, 246, 0.08);
}
/* 列间竖向分隔线：右列格子的左缘画 1px 竖线（与外框同色号），
   把左右两列参数在视觉上分开；跨列字段（占满整行）不画 */
.lms-fields--grid[data-cols="2"] .lms-field:not(.lms-field--span):nth-child(2n) {
    border-left: 1px solid ${LMS_TOKENS.color.border};
}
/* 列间间距在「格子自身」上调节（棋盘格 gap 保持 0，色带仍贯通）：
   左列加大右内边距、右列加大左内边距，把两侧内容从中缝各撑开 12px */
.lms-fields--grid[data-cols="2"] .lms-field:not(.lms-field--span):nth-child(2n+1) {
    padding-right: 20px;
}
.lms-fields--grid[data-cols="2"] .lms-field:not(.lms-field--span):nth-child(2n) {
    padding-left: 20px;
}
.lms-fields--grid[data-cols="3"] .lms-field:not(.lms-field--span):nth-child(3n+2),
.lms-fields--grid[data-cols="3"] .lms-field:not(.lms-field--span):nth-child(3n+3) {
    border-left: 1px solid ${LMS_TOKENS.color.border};
}
/* 兜底：跨列字段（当前 wide 字段改用独立容器，这里仅作兼容） */
.lms-fields--grid .lms-field--span { grid-column: 1 / -1; }
/* 标签按文字实际宽度取宽（上限 42% 防长文案挤压控件）：标签紧跟其后控件，
   「参数名 + 控件」聚成一个整体，保持紧凑不脱节 */
.lms-fields--grid .lms-field__label {
    flex: 0 0 auto;
    max-width: 42%;
}
/* 控件吃满格子剩余宽度（basis 0：宽度完全由剩余空间决定，避免被原生宽度干扰）。
   格内最后一件控件因此落在格子右内边距上 → 同列控件的右缘成一条竖线 */
.lms-fields--grid .lms-control {
    flex: 1 1 0;
    min-width: 0;
}
/* 数值框统一定宽：全部固定为「5 个字符」宽（5ch 即 5 个数字的排版宽度，
   叠加左右内边距 16px 与边框 2px），随字号自适应。
   不再有任何「弹性拉满」的例外——逐行宽度一致，右缘才能对齐 */
.lms-fields--grid .lms-number {
    flex: 0 0 auto;
    width: calc(5ch + 18px);
    min-width: 0;
    /* 紧凑高度：24px → 20px（与同排滑块的 20px 一致） */
    height: 20px;
}
/* 随机种子单独一档固定宽（约 10 位）：种子是长整数，需要更宽的显示区，
   但宽度仍为固定值（不再拉满整格），右缘与其它数值框对齐；
   更长的种子沿用 .lms-number 既有的「框内横向滚动」承载。
   高度不单独覆盖：随 .lms-number 紧凑化（20px），与 Top P 等数值框一致 */
.lms-fields--grid .lms-field[data-widget="seed"] .lms-number {
    width: calc(10ch + 18px);
}
/* 「生成后控制」下拉：与提示词行内下拉（「语言」等）同高 22px；
   收起态文字与字段标题同号（micro） */
.lms-fields--grid .lms-field[data-widget="control_after_generate"] .lms-select {
    height: 22px;
    line-height: 20px;
    font-size: ${LMS_TOKENS.type.micro};
}
/* 「批处理路径」输入框：降到与数值框一致的紧凑高度（20px）；
   批处理路径在独立卡片、不在棋盘格容器内，故选择器不带 .lms-fields--grid 前缀
   （.lms-control--folder 仅此字段使用）；同组「设定」按钮高度在其自身规则处同步 */
.lms-control--folder .lms-input {
    height: 20px;
}
/* 占位提示字符比正文缩小一点（正文 13.5px） */
.lms-control--folder .lms-input::placeholder {
    font-size: 12px;
}
/* 滑块格（滑块 + 数值框）：整组吃满控件区并靠右排布，标签留在格子左侧。
   由于滑块宽度固定、数值框宽度固定，整组的宽度与右缘都不再随标签长度变化 ——
   所有行的滑块左右缘、数值框右缘因此各自落在同一条竖线上。
   （代价：标签与滑块之间的空档随标签长度变化，即「标签靠左、控件靠右」的表格式版式） */
.lms-fields--grid .lms-field--range { justify-content: flex-start; }
.lms-fields--grid .lms-control--split {
    /* 吃满控件区并把组内控件推到右端。
       flex-basis 必须为 0（不能用 auto）：row 是 flex-wrap 容器，basis:auto 会以
       「滑块固有宽 + 数值框」为基准参与换行计算，窄格下整组被判为放不下而换行，
       控件被挤到第二行、与标签重叠；basis:0 时该组按 0 宽参与，永不触发换行 */
    flex: 1 1 0;
    justify-content: flex-end;
    gap: 8px;
}
/* 滑块宽度：统一固定 96px（原先「吃满余量」时约 150~175px，缩短约四成），
   所有行完全等长；格子空间不足时才收缩（保底 56px，与 53px 的数值框同量级） */
.lms-fields--grid .lms-control--split .lms-range-wrap {
    flex: 0 1 96px;
    min-width: 56px;
}
/* 数值/开关格：控件贴齐格子右缘（覆盖 .lms-control--end 的靠左基础规则），
   与滑块行的数值框落在同一条竖线上 */
.lms-fields--grid .lms-control--end { justify-content: flex-end; }

/* ---- field row ----------------------------------------------------------- */
.lms-field {
    display: grid;
    grid-template-columns: minmax(74px, 34%) minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    min-width: 0;
}
.lms-field--block {
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
    gap: 6px;
}
.lms-field[data-disabled="true"] { opacity: 0.58; }
/* 可用状态标识：图标随状态切换（可用 = 圆圈对勾，禁用 = 禁止符），风格参照
   zhiai-image-inverse-engine —— 提示词标题栏内图标随标题取 currentColor */
.lms-field__flag {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    color: ${LMS_TOKENS.color.success};
}
.lms-field[data-locked="true"] .lms-field__flag { color: ${LMS_TOKENS.color.textFaint}; }
/* 竖排标题栏里的状态图标与标题文字同色（不参与上方的绿/灰状态色；
   选择器与上方 [data-locked] 规则同权重且更靠后，确保两种状态下都跟随标题色） */
.lms-field--side-title .lms-field__label .lms-field__flag {
    color: inherit;
    writing-mode: horizontal-tb;
}
/* 被「使用预设」等开关门控而禁用的字段：只把控件灰化，标题与图标沿用原有配色 */
.lms-field[data-locked="true"] .lms-control {
    opacity: 0.45;
    cursor: not-allowed;
}
.lms-field__label {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    font-size: ${LMS_TOKENS.type.label};
    font-weight: 500;
    letter-spacing: 0.01em;
    color: ${LMS_TOKENS.color.textDim};
}
.lms-field__label-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.lms-field__link {
    flex: 0 0 auto;
    display: inline-flex;
    color: ${LMS_TOKENS.color.info};
    line-height: 0;
}
.lms-field__note {
    grid-column: 1 / -1;
    font-size: ${LMS_TOKENS.type.micro};
    color: ${LMS_TOKENS.color.textFaint};
    margin-bottom: -3px;
}
.lms-control {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

/* ---- prompt side-title frame（版式参考 zhiai-image-inverse-engine） -------- */
/* 标题移入输入框内部最左侧、竖排成标题栏，与输入框共享「一圈连续外框」：
   外框线由 .lms-field__frame 统一绘制（子元素不描边），因此无接缝、圆角必然对齐 */
.lms-field--side-title .lms-field__frame {
    display: flex;
    align-items: stretch;
    min-width: 0;
    /* 无论字段是单列（block）还是两列，外框都占满整行 */
    grid-column: 1 / -1;
    /* 输入框底色上移到外框：圆角处不会露出面板底色 */
    background: rgba(4, 11, 22, 0.66);
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    overflow: hidden;
    transition: border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-field--side-title .lms-field__frame:focus-within {
    border-color: ${LMS_TOKENS.color.primary};
}
/* 禁用态（勾选「使用预设」，输入框由预设接管）：沿用 zhiai-image-inverse-engine 的同款颜色 ——
   标题栏文字与图标用 blocked-ink（#FFC2B5）、底色用 blocked-bg（珊瑚色半透明）、
   整圈外框线用 blocked-line（#9C5C5A），一眼区分「可用 / 被接管」 */
.lms-field--side-title[data-locked="true"] .lms-field__label {
    color: #FFC2B5;
    background: linear-gradient(180deg, rgba(255, 138, 117, 0.30), rgba(255, 138, 117, 0.20));
}
.lms-field--side-title[data-locked="true"] .lms-field__frame { border-color: #9C5C5A; }
/* 竖排标题栏：点它即可聚焦对应输入框（label 自带 htmlFor） */
.lms-field--side-title .lms-field__label {
    flex: 0 0 auto;
    display: flex;
    /* 注意：竖排书写模式下 flex-direction: row 的主轴即「垂直方向」，天然上下排列 */
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 5px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: ${LMS_TOKENS.type.micro};
    /* 竖排标题不用粗体：与字段标题同样只保留中等字重 */
    font-weight: 500;
    letter-spacing: 0.14em;
    white-space: nowrap;
    /* 提亮：文字上提一档淡蓝，底色改为更亮的蓝色渐变（与原纯色同色系，仅提高明度） */
    color: ${LMS_TITLE_CHIP_INK};
    background: ${LMS_TITLE_CHIP_BG};
    cursor: pointer;
}
/* 竖排容器里的图标保持正向 */
.lms-field--side-title .lms-field__link { writing-mode: horizontal-tb; }
.lms-field--side-title .lms-control { flex: 1 1 auto; min-width: 0; }
/* 输入框：不描边、不设底色，完全交给外框，保证框线只有一层 */
.lms-field--side-title .lms-textarea {
    flex: 1 1 auto;
    min-width: 0;
    line-height: 1.3;
    height: calc(3px + 6 * 15.6px);
    /* 外框是 align-items: stretch，竖排标题比输入框高时（「System Prompt」比「User Prompt」
       长两个字母）会把框拉到标题那么高，整行高度又被打散；center 让框只用自己的高度。
       框本身透明底、不描边，上下那点空隙由外框的同一底色补上，看不出接缝 */
    align-self: center;
    padding: 1px 3px 2px;
    background: transparent;
    border: none;
    border-radius: 0;
    /* 固定高度、不允许拖拽改变尺寸（拖拽会再次破坏整行高度） */
    resize: none;
    /* 滚到顶/底就停在这里，不把滚动链给外层面板（配合 lmsFindScrollable 的「提示词框
       无条件吃掉滚轮」：既不缩放画布，也不连带把面板滚走） */
    overscroll-behavior: contain;
}

/* ---- select -------------------------------------------------------------- */
/* 下拉框按内容收缩后右对齐：箭头用绝对定位锚在控件框右侧，右对齐才能保持贴合 */
.lms-control--select { justify-content: flex-end; }
/* 箭头：8×8 固定字符盒 */
.lms-control--select::after {
    content: "";
    position: absolute;
    right: 12px;
    top: 50%;
    width: 8px;
    height: 8px;
    aspect-ratio: 1 / 1;
    margin-top: -4px;
    box-sizing: border-box;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpolyline points='1,2.5 4,5.5 7,2.5' fill='none' stroke='%2393C5FD' stroke-width='1.4'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    pointer-events: none;
}
/* 展开态：箭头绕中心翻转 180°，关闭向下、打开向上（无过渡，瞬切） */
.lms-control--select:has(.lms-select:open)::after,
.lms-control--select.lms-open::after {
    transform: rotate(180deg);
}
/* 展开态：只亮边框，不加聚焦环 */
.lms-control--select:has(.lms-select:open) .lms-select,
.lms-control--select.lms-open .lms-select {
    border-color: ${LMS_TOKENS.color.primary};
    box-shadow: none;
}
.lms-select {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: ${LMS_TOKENS.controlHeight};
    /* 文本垂直居中：行高 = 高度 - 上下各 1px 边框 */
    line-height: calc(${LMS_TOKENS.controlHeight} - 2px);
    align-content: center;
    /* 文本在「箭头符号左侧区域」居中：左侧 10px；右侧 33px 为箭头区 + 间距，
       这样文本到左边框与到箭头的间距同为 10px */
    padding: 0 33px 0 10px;
    font-family: inherit;
    font-size: ${LMS_TOKENS.type.body};
    text-align: center;
    color: ${LMS_TOKENS.color.text};
    background: rgba(4, 11, 22, 0.66);
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    outline: none;
    cursor: pointer;
    /* 单行显示：white-space 会继承进 select 的内部内容（阴影树亦生效），
       配合宿主 overflow:hidden —— 长模型名不再换行溢出框外 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.lms-select:hover:not([disabled]) {
    border-color: ${LMS_TOKENS.color.borderHi};
    background: rgba(8, 18, 34, 0.80);
}
.lms-select:focus-visible {
    border-color: ${LMS_TOKENS.color.primary};
    box-shadow: 0 0 0 2px ${LMS_TOKENS.color.primaryGlow};
}
.lms-select option {
    background: ${LMS_TOKENS.color.base};
    color: ${LMS_TOKENS.color.text};
    /* 选单（弹出层）字号：覆盖原生弹层沿用控件字号的默认行为，统一到 16px */
    font-size: 16px;
}

/* ---- checkbox（标题栏里的「使用预设」） ------------------------------------ */
/* 风格参照 zhiai-image-inverse-engine 的「启用反推预设」：
   方角小框 + 常驻高亮描边（不勾选时为空框）、勾选后主色实底 + 白色对勾。
   方框尺寸用 1em 表达：字号下沉到 .lms-check，方框因此恒等于「字符高」，
   且宽高同源、必为正方形（13px 固定值会让方框比 11.5px 的文字高出一截）；
   只有方框是点击目标，右侧文字只是说明（不整块设 cursor: pointer） */
.lms-check {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: ${LMS_TOKENS.controlHeight};
    /* 字号挂在容器上：方框的 1em 与文字字号同源，改字号时两者一起变 */
    font-size: ${LMS_TOKENS.type.label};
    color: ${LMS_TOKENS.color.textDim};
    line-height: 1;
    white-space: nowrap;
    user-select: none;
}
.lms-check__box {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    flex: 0 0 auto;
    /* 正方形 + 高等于字符高：1em = 容器字号；input 不默认继承字号，故显式声明 */
    font-size: inherit;
    width: 1em;
    height: 1em;
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
    margin: 0;
    padding: 0;
    aspect-ratio: 1;
    border: 1px solid ${LMS_TOKENS.color.primaryLight};
    border-radius: 0;
    background: rgba(4, 11, 22, 0.66);
    cursor: pointer;
    transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-check__box:hover:not(:checked):not(:disabled) {
    background: rgba(59, 130, 246, 0.22);
}
.lms-check__box:checked {
    background: ${LMS_TOKENS.color.primary};
    border-color: ${LMS_TOKENS.color.primary};
}
.lms-check__box:checked::after {
    content: "";
    position: absolute;
    /* 对勾用内联 SVG 蒙版绘制：该折线（含圆头描边）的墨迹包围盒中心恰好是
       viewBox 的 (12,12)，配合 background-position:center 即与方框同心，
       水平与垂直都天然居中，无需任何位移百分比。
       （原写法是「右边框 + 下边框拼成 L 再旋转 45°」——旋转后墨迹重心并不落在
       元素中心，实测垂直偏下 0.5px，只能靠手调 translate 百分比去凑。）
       蒙版盒与 viewBox 同为正方形，宽高同值即等比缩放、不会拉伸变形；
       100% 时实测墨迹约占方框 76%×58%（左右各留 12%、上下各留 21%）。
       原先的 120% 把「墨迹占 viewBox 的比例」误当成「占方框的比例」，
       实际墨迹撑到 92%×68%，左右只剩 4% 空隙，看着像顶到了边框 */
    inset: 0;
    background: #FFFFFF;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='5.4 13.2 10 16.3 18.6 7.7' fill='none' stroke='%23fff' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='5.4 13.2 10 16.3 18.6 7.7' fill='none' stroke='%23fff' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
}
.lms-check__box:focus-visible {
    outline: 2px solid ${LMS_TOKENS.color.primaryGlow};
    outline-offset: 2px;
}
.lms-check__label {
    /* 字号由 .lms-check 统一给出（方框的 1em 与它同源），此处不再单独声明 */
    font-weight: 600;
    color: inherit;
}
/* 标题栏字段：不再是卡片字段的网格行，退化为普通行内元素（不加外框架） */
.lms-card__head .lms-field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    grid-template-columns: none;
}
/* 标题栏里的复选框整体包一层底色块，文字缩小一档使其贴合色块 */
.lms-card__head .lms-check {
    gap: 4px;
    height: auto;
    padding: 3px 8px;
    background: rgba(4, 11, 22, 0.55);
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    /* 文字缩小一档；方框是 1em，会随这个字号一起缩到「与字符同高」 */
    font-size: ${LMS_TOKENS.type.micro};
}
.lms-card__head .lms-check__label {
    font-weight: 500;
}

/* ---- text inputs --------------------------------------------------------- */
.lms-input,
.lms-textarea {
    width: 100%;
    min-width: 0;
    font-family: inherit;
    font-size: ${LMS_TOKENS.type.label};
    color: ${LMS_TOKENS.color.text};
    background: rgba(4, 11, 22, 0.66);
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    outline: none;
    transition: border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                box-shadow ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
/* 与下拉框统一高度（controlHeight），保证同一行/相邻字段高度一致 */
.lms-input { height: ${LMS_TOKENS.controlHeight}; padding: 0 9px; }
.lms-textarea {
    min-height: 74px;
    max-height: 220px;
    padding: 8px 9px;
    /* 正文比字段标题（label）小一档，避免与设置项标题同号 */
    font-size: 12px;
    line-height: ${LMS_TOKENS.type.lhBase};
    resize: vertical;
}
.lms-input::placeholder,
.lms-textarea::placeholder { color: ${LMS_TOKENS.color.textFaint}; }
.lms-input:hover:not([disabled]),
.lms-textarea:hover:not([disabled]) { border-color: ${LMS_TOKENS.color.borderHi}; }
.lms-input:focus-visible,
.lms-textarea:focus-visible {
    /* 聚焦仅高亮边框：不再叠加边框外的发光环，保持单层描边 */
    border-color: ${LMS_TOKENS.color.primary};
    box-shadow: none;
}
.lms-input:disabled,
.lms-textarea:disabled,
.lms-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ---- folder path field（设定按钮 + 拖拽落点） ------------------------------ */
.lms-control--folder { gap: 7px; }
/* 批处理文件夹字段：标题列收缩为文字实际宽度，输入区随之加宽、
   尽量贴近标题（仅保留字段原有的 8px 间距），其余字段不受影响 */
.lms-field:has(.lms-control--folder) {
    grid-template-columns: minmax(74px, auto) minmax(0, 1fr);
}
/* 输入框占满剩余宽度，按钮固定宽度，不被输入框的原生宽度挤压 */
.lms-control--folder .lms-input { flex: 1 1 auto; width: auto; min-width: 0; }
/* 「设定」按钮：纯实心块（蓝色单色实底，无渐变、无描边、无投影、无内高光），与输入框等高并成一组。
   注：按钮同时带有 .lms-mini-btn（幽灵按钮基础样式，且定义在本段之后），
   选择器统一带上 .lms-control--folder 以取得更高权重，确保实心样式生效 */
.lms-control--folder .lms-field__folder-btn {
    flex: 0 0 auto;
    height: 20px;
    padding: 0 6px;
    font-size: ${LMS_TOKENS.type.micro};
    font-weight: 400;
    color: #F8FAFC;
    /* 纯色（不用渐变）：渐变会让圆角上下缘的明暗不同，边缘那条半透明过渡带
       在 150% 显示缩放下被拉宽后，被看成一条多余的边线；单色则整圈一致 */
    background: ${LMS_TOKENS.color.primary};
    /* 纯色块：不要外边框（保留 1px 透明描边以维持盒模型尺寸），也不要任何投影/内高光 */
    border: 1px solid transparent;
    /* 圆角跟随同排输入框，形成一组控件（覆盖 .lms-mini-btn 的 pill） */
    border-radius: ${LMS_TOKENS.radius.sm};
    box-shadow: none;
}
.lms-control--folder .lms-field__folder-btn:hover {
    color: #FFFFFF;
    /* 悬停同样只用单色：比常态亮一档（不加渐变），保持整圈一致 */
    background: #4F8FF7;
    border-color: transparent;
    box-shadow: none;
}
.lms-control--folder .lms-field__folder-btn:active {
    box-shadow: none;
}
.lms-control--folder .lms-field__folder-btn[disabled] {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
}
.lms-mini-btn__glyph { display: inline-flex; line-height: 0; }
/* 拖拽悬停：只高亮输入框，按钮保持常态 */
.lms-control--folder.lms-drop-active .lms-input {
    border-color: ${LMS_TOKENS.color.primary};
    background: rgba(59, 130, 246, 0.14);
}
/* 正在按名称定位文件夹：输入框给出「处理中」状态 */
.lms-control--folder.lms-locating .lms-input {
    border-color: ${LMS_TOKENS.color.primary};
    background: rgba(59, 130, 246, 0.10);
}

/* ---- number + range ------------------------------------------------------ */
/* 参数数字框：宽度只按 5 个数位设计（超出部分可在框内横向滚动），不占满整行 */
.lms-number {
    flex: 0 0 auto;
    width: 56px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    padding: 0 8px;
}
.lms-number--combo { flex: 0 0 56px; }
.lms-number::-webkit-outer-spin-button,
.lms-number::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.lms-number[type="number"] { -moz-appearance: textfield; appearance: textfield; }
/* 滑柄定位父级：UA 滑柄已隐藏，改由 .lms-range__thumb 覆盖层绘制（见 syncRange） */
.lms-range-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
}
.lms-range {
    --lms-range-fill: 50%;
    width: 100%;
    min-width: 0;
    height: 20px;
    margin: 0;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
}
/* 滑动杆统一规格（所有参数一致）：
   轨道 4px、填充段用纯色 primary（不再用渐亮色，避免填充段视觉上“更粗/更大”）、
   未填充段统一为清晰可见的中性灰蓝 */
.lms-range::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: ${LMS_TOKENS.radius.pill};
    background: linear-gradient(90deg,
        ${LMS_TOKENS.color.primary} 0%,
        ${LMS_TOKENS.color.primary} var(--lms-range-fill),
        rgba(148, 163, 184, 0.40) var(--lms-range-fill),
        rgba(148, 163, 184, 0.40) 100%);
}
/* UA 滑柄隐藏：它的落点是 fraction*(W-thumbW)，在画布 transform: scale 下落在
   非整数设备像素上，且左右缘的抗锯齿余量随步进点漂移 —— 观感就是「推到某个
   步进点宽度会变」。尺寸取 0 让 UA 落点与填充段百分比完全重合，可见滑柄改由
   .lms-range__thumb 画 */
.lms-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 0;
    height: 0;
    margin: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    opacity: 0;
}
.lms-range:focus-visible {
    outline: 2px solid ${LMS_TOKENS.color.primaryLight};
    outline-offset: 3px;
    border-radius: ${LMS_TOKENS.radius.pill};
}
.lms-range::-moz-range-track {
    height: 4px;
    border-radius: ${LMS_TOKENS.radius.pill};
    background: rgba(148, 163, 184, 0.40);
}
.lms-range::-moz-range-progress {
    height: 4px;
    border-radius: ${LMS_TOKENS.radius.pill};
    background: ${LMS_TOKENS.color.primary};
}
.lms-range::-moz-range-thumb {
    width: 0;
    height: 0;
    border: none;
    background: transparent;
    opacity: 0;
}
/* 自绘滑柄：规格逐项对齐替换前的 UA 滑柄 —— 8×14 外框含 1px 主色描边、
   圆角 3px、近白底、向下投影。UA 伪元素不吃 .lms-panel * 的 border-box，
   实测其外框就是 8×14，故这里显式写死 box-sizing 以免继承歧义。
   同样不加任何 transition：面板在祖先 transform scale 下，带过渡的滑柄会被
   提升为合成层，拖拽释放后可能复用过期光栅缓存而残留放大态 */
.lms-range__thumb {
    position: absolute;
    top: 50%;
    left: 0;
    box-sizing: border-box;
    width: 8px;
    height: 14px;
    /* -14/2：滑柄在 20px 高的控件区里垂直居中（轨道居中于同一控件区） */
    margin-top: -7px;
    border-radius: 3px;
    background: #EFF6FF;
    border: 1px solid ${LMS_TOKENS.color.primary};
    box-shadow: 0 2px 6px rgba(2, 6, 23, 0.60);
    pointer-events: none;
}

/* ---- switch -------------------------------------------------------------- */
/* 电器式指示灯开关：深灰胶囊轨道（1px 蓝色描边，与功能区卡片同色）+ 轨道右端的
   圆角 LED 灯板。状态字（On / Off）固定在轨道左侧，不随状态位移、不带光晕，
   关灯时白色、开灯时转为主题蓝。开启时灯板「点火」亮起（瞬时过冲提亮后稳定为
   主题蓝并投出辉光），关闭时熄灭为暗灰——只有明灭，没有滑动。
   纯 CSS 几何（无 SVG/图片）；只用背景/颜色/阴影过渡，不用 transform 动画与
   filter：两者会在画布分数倍缩放下触发合成层按旧比例缓存栅格，灯体被拉成
   模糊椭圆。可读名称由 aria-label 提供 */
.lms-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
    /* 1px 外圈：开关放大后仍要留在三格并排行的可用宽度内（见 .lms-fields--tiles） */
    padding: 1px;
    background: transparent;
    border: 0;
    border-radius: 999px;
    color: inherit;
    font: inherit;
    cursor: pointer;
}
.lms-switch__track {
    position: relative;
    /* 自身即灯板的定位容器：灯板改为 flex 子项（右对齐 + 垂直居中），
       因此灯板的位置由布局引擎算出，不再手写 top/left 偏移量 */
    display: flex;
    align-items: center;
    justify-content: flex-end;
    /* 右侧留边 = 1px 描边 + 2px 内边距，与上下的 3px 等值；左侧不留内边距，
       状态字的居中区间因此从轨道左缘算起（状态字吃满灯板左侧余量后自身居中） */
    padding: 0 2px 0 0;
    flex: 0 0 auto;
    box-sizing: border-box;
    /* 宽度 42 是「状态字四周间距相等」反推出来的：内宽 40 − 右侧内边距 2 − 灯板 16
       = 状态字可用区 22px，恰好等于墨迹宽 15px + 上下留白 2×3.5px。
       若加宽轨道，多出的宽度会平摊到文字左右两侧，四周间距立刻不再相等；
       灯板尺寸与其上/下/右各 3px 留边不受影响（留边自右缘与上下缘推出） */
    width: 42px;
    /* 高度取偶数 16（原 15）：奇数高度在 150% 显示缩放下是 22.5 个设备像素，
       盒体自带半像素，灯板上/下边缘落在不同的抗锯齿相位（4.5 / 18.0），
       灯板看上去整体偏移。16px 下上下边缘同为 x.5 相位，两侧虚化程度一致 */
    height: 16px;
    /* 尺寸锁定：防止外部全局样式把轨道压扁拉长（曾有先例） */
    min-width: 42px;
    max-width: 42px;
    min-height: 16px;
    max-height: 16px;
    /* 描边取与功能区卡片同一支蓝（#2C5080），开关与卡片共用一套描边语言；
       border-box 下加边不改变 42×16 外框，灯板与状态字的位置依旧由内边距推出 */
    border: 1px solid #2C5080;
    border-radius: 999px;
    background: #2B2E33;
    transition: background-color ${LMS_TOKENS.motion.base} ${LMS_TOKENS.motion.easing};
}
/* 状态字：无光晕，占满灯板左侧的全部余量并在其中水平居中——居中位置由布局
   算出，灯板改宽/改窄时自动跟随（不再手写 left 偏移）；垂直方向由轨道的
   align-items:center 居中。灯灭时白色、灯亮时转为与灯板同色的主题蓝，
   随状态一起明灭。text-transform 保证无论 content 怎么写都渲染为全大写。
   不再用分数外边距做「光学居中」（原 margin-bottom:1.25px）：该补偿把行盒推到
   3.125/10.875，上下边缘的抗锯齿相位在分数缩放下不再相同，文字反而与灯板不同心；
   改为由布局居中，字墨本身的微小下偏（约 0.5px）在任何缩放下都一致 */
.lms-switch__track::before {
    content: "Off";
    /* 作为轨道的 flex 子项排在最前：flex:1 吃满剩余宽度后，文字居中于
       「轨道左缘 ↔ 灯板左缘」之间 */
    flex: 1 1 auto;
    min-width: 0;
    text-align: center;
    text-transform: uppercase;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.01em;
    line-height: 1;
    color: #FFFFFF;
    transition: color ${LMS_TOKENS.motion.base} ${LMS_TOKENS.motion.easing};
}
/* LED 灯板：圆角灯板（16×10，圆角 5px），占满轨道内高的 10/14。
   高度取偶数 10（原 9）：与轨道内高 14 相配，上下留边同为 2px（整数），
   灯板上下边缘在 150% 缩放下落在同一抗锯齿相位，不会出现「偏上/偏下」。
   作为轨道的 flex 子项被 align-items:center 垂直居中、justify-content:flex-end
   右对齐，右边距 = 轨道的 3px 内边距 —— 三边留边均由布局引擎推出（各 3px），
   不再手写 top/left：外部样式里残留的 top/left（含历史版本）从此都失效，
   也不会再出现"灯板在轨道里偏上/偏下" */
.lms-switch__lamp {
    flex: 0 0 auto;
    width: 16px;
    height: 10px;
    min-width: 16px;
    max-width: 16px;
    min-height: 10px;
    max-height: 10px;
    margin: 0;
    border: 0;
    border-radius: 5px;
    background: #4A5058;
    transition: background-color ${LMS_TOKENS.motion.base} ${LMS_TOKENS.motion.easing},
                box-shadow ${LMS_TOKENS.motion.base} ${LMS_TOKENS.motion.easing};
}
/* 开启态：切换状态字并点亮灯条，字色转为主题蓝（与灯条同色） */
.lms-switch[aria-checked="true"] .lms-switch__track::before {
    content: "On";
    color: ${LMS_TOKENS.color.primary};
}
.lms-switch[aria-checked="true"] .lms-switch__lamp {
    background: ${LMS_TOKENS.color.primary};
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.85);
    animation: lms-switch-ignite 300ms ${LMS_TOKENS.motion.easing};
}
/* 电器启闭的点火过冲：先暗后爆亮再回落，模拟灯丝通电瞬间的亮度冲击
   （辉光与灯条同比放大并提高不透明度，亮灯更醒目；色阶取自主题蓝的三档） */
@keyframes lms-switch-ignite {
    0% { background: ${LMS_TOKENS.color.primaryDeep}; box-shadow: 0 0 2px rgba(59, 130, 246, 0.40); }
    45% { background: ${LMS_TOKENS.color.primaryLight}; box-shadow: 0 0 8px rgba(96, 165, 250, 0.95); }
    100% { background: ${LMS_TOKENS.color.primary}; box-shadow: 0 0 4px rgba(59, 130, 246, 0.85); }
}
/* 按压反馈：轨道瞬时压暗，像按下实体翘板开关（置于状态规则之后以覆盖两态底色） */
.lms-switch:active .lms-switch__track { background: #1C1F23; }
.lms-switch:focus-visible {
    outline: 2px solid ${LMS_TOKENS.color.primaryLight};
    outline-offset: 2px;
}

/* ---- mini button (card actions) ----------------------------------------- */
.lms-mini-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex: 0 0 auto;
    /* 标题栏不再有说明文字占位，靠外边距把按钮推到最右 */
    margin-left: auto;
    height: 22px;
    padding: 0 9px;
    font-family: inherit;
    font-size: ${LMS_TOKENS.type.micro};
    color: ${LMS_TOKENS.color.textDim};
    background: transparent;
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.pill};
    cursor: pointer;
    transition: color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-mini-btn:hover {
    color: ${LMS_TOKENS.color.textBright};
    background: ${LMS_TOKENS.color.glassHover};
    border-color: ${LMS_TOKENS.color.borderHi};
}
.lms-mini-btn:focus-visible {
    outline: 2px solid ${LMS_TOKENS.color.primaryLight};
    outline-offset: 1px;
}

/* ---- log card ------------------------------------------------------------ */
.lms-log__text {
    min-height: 38px;
    max-height: 120px;
    overflow: auto;
    padding: 8px 9px;
    background: rgba(3, 9, 18, 0.62);
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    font-size: ${LMS_TOKENS.type.micro};
    line-height: ${LMS_TOKENS.type.lhBase};
    color: ${LMS_TOKENS.color.text};
    white-space: pre-wrap;
    word-break: break-word;
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 197, 253, 0.45) transparent;
}
.lms-log__text::-webkit-scrollbar { width: 4px; }
.lms-log__text::-webkit-scrollbar-track { background: transparent; }
.lms-log__text::-webkit-scrollbar-thumb {
    background: rgba(147, 197, 253, 0.5);
    border-radius: 2px;
}
.lms-log__text[data-empty="true"] { color: ${LMS_TOKENS.color.textFaint}; }

@media (prefers-reduced-motion: reduce) {
    .lms-card,
    .lms-mini-btn,
    .lms-switch__track,
    .lms-switch__track::before,
    .lms-switch__lamp { transition: none; animation: none; }
}
`;

injectLMSStyles("panel", LMS_PANEL_CSS);

injectLMSStyles("panel-extra", `
.lms-control--end { justify-content: flex-end; }
.lms-control--split { gap: 8px; }
.lms-card__head--static { cursor: default; }
/* 组件自带 display，需显式恢复 hidden 属性的语义 */
.lms-field[hidden],
.lms-field__link[hidden] { display: none; }
`);

/* 浮层共享样式：toast / 确认框 / 下拉 的关键帧与滚动条，统一注入一次 */
injectLMSStyles("overlays", `
@keyframes lms-toast-in {
    from { opacity: 0; transform: translate(-50%, 12px) scale(0.98); }
    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
}
@keyframes fadeScaleDialog {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
@keyframes dropdownSlideIn {
    from { transform: translateY(-8px) scale(0.95); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes dropdownSlideOut {
    from { transform: translateY(0) scale(1); opacity: 1; }
    to { transform: translateY(-8px) scale(0.95); opacity: 0; }
}
.template-select-list::-webkit-scrollbar { width: 6px; }
.template-select-list::-webkit-scrollbar-track {
    background: rgba(148, 163, 184, 0.08);
    border-radius: 3px;
}
.template-select-list::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(147, 197, 253, 0.6), rgba(37, 99, 235, 0.6));
    border-radius: 3px;
}
.template-select-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(147, 197, 253, 0.85), rgba(37, 99, 235, 0.85));
}
@media (prefers-reduced-motion: reduce) {
    .lms-toast, .lms-confirm-overlay, .lms-dropdown { animation: none !important; }
}
`);

/* =========================================================================
 * Popover theme: native <select> dropdown list
 * 原生下拉弹层在 Chromium 135+ 可通过 ::picker(select) 定制。
 * 这里只允许命中本扩展自建的 .lms-* 元素：画布上的 litegraph ContextMenu 是全图
 * 共用 chrome，给它配色会外溢到其他节点的右键菜单（曾经就因此把别的包的菜单
 * 染成了本主题色），所以不再尝试主题化。
 * ========================================================================= */

injectLMSStyles("popover-theme", `
@supports (appearance: base-select) {
    .lms-select,
    .lms-preset-select,
    .template-sort {
        appearance: base-select;
        -webkit-appearance: base-select;
    }
    .lms-select,
    .lms-preset-select {
        /* base-select 下文本由内部内容盒承载，需显式垂直居中 */
        display: flex;
        align-items: center;
    }
    /* 关闭浏览器默认箭头（箭头由 .lms-control--select::after 自绘） */
    .lms-select::picker-icon,
    .lms-preset-select::picker-icon { display: none; }
    /* base-select 下由 selectedcontent 承载选中项文本，需自行处理溢出省略 */
    .lms-select selectedcontent,
    .lms-preset-select selectedcontent,
    .template-sort selectedcontent {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
    }
    /* 参数面板下拉框的选中项居中（工具条下拉框保持左对齐）：在箭头左侧区域内居中 */
    .lms-select selectedcontent { text-align: center; }
    .lms-select { justify-content: center; }
    .lms-select::picker(select),
    .lms-preset-select::picker(select),
    .template-sort::picker(select) {
        appearance: base-select;
        /* 选单固定在控件下方展开：只允许横向让位，不再翻转到控件上方 */
        position-area: block-end;
        position-try-fallbacks: flip-inline;
        margin-top: 4px;
        padding: 4px;
        background: linear-gradient(180deg, rgba(12, 22, 40, 0.98), rgba(6, 12, 24, 0.98));
        border: 1px solid rgba(96, 165, 250, 0.24);
        border-radius: ${LMS_TOKENS.radius.md};
        box-shadow: 0 18px 40px rgba(2, 6, 23, 0.62), 0 0 0 1px rgba(59, 130, 246, 0.08);
        color: ${LMS_TOKENS.color.text};
        max-height: 320px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(59, 130, 246, 0.45) transparent;
    }
    /* 提示词功能区（模式 / 篇幅 / 格式 / 语言）行内下拉：弹框对齐整组设置项框架
       （左侧标题块 + 右侧数值区）且同宽，不再按最宽选项拉伸。
       四个字段以 nth-child 各分得唯一锚名；弹框的 top/left/width 全部
       按名引用所在框架（显式 anchor()/anchor-size() 按名解析，不依赖
       伪元素上的 position-anchor 支持），并以 position-area: none 关闭
       公共规则基于控件自身的展开定位 */
    .lms-fields__row .lms-field:nth-child(1) { anchor-name: --lms-row-f1; }
    .lms-fields__row .lms-field:nth-child(2) { anchor-name: --lms-row-f2; }
    .lms-fields__row .lms-field:nth-child(3) { anchor-name: --lms-row-f3; }
    .lms-fields__row .lms-field:nth-child(4) { anchor-name: --lms-row-f4; }
    .lms-fields__row .lms-select::picker(select) { box-sizing: border-box; }
    .lms-fields__row .lms-field:nth-child(1) .lms-select::picker(select) {
        position-area: none;
        top: anchor(--lms-row-f1 bottom);
        left: anchor(--lms-row-f1 left);
        width: anchor-size(--lms-row-f1 width);
    }
    .lms-fields__row .lms-field:nth-child(2) .lms-select::picker(select) {
        position-area: none;
        top: anchor(--lms-row-f2 bottom);
        left: anchor(--lms-row-f2 left);
        width: anchor-size(--lms-row-f2 width);
    }
    .lms-fields__row .lms-field:nth-child(3) .lms-select::picker(select) {
        position-area: none;
        top: anchor(--lms-row-f3 bottom);
        left: anchor(--lms-row-f3 left);
        width: anchor-size(--lms-row-f3 width);
    }
    .lms-fields__row .lms-field:nth-child(4) .lms-select::picker(select) {
        position-area: none;
        top: anchor(--lms-row-f4 bottom);
        left: anchor(--lms-row-f4 left);
        width: anchor-size(--lms-row-f4 width);
    }
    /* 提示词功能区（行内组）与推理参数棋盘格弹窗选项文字居中：
       与收起态控件文字的对齐方式一致。
       option 可能是 flex 布局（text-align 对其子项无效），
       故同时声明 justify-content: center 兜底两种布局 */
    .lms-fields__row .lms-select option,
    .lms-fields--grid .lms-select option {
        position: relative;
        text-align: center;
        justify-content: center;
    }
    /* 勾选符号绝对定位到左缘、脱离布局流：文字是唯一流内容，居中即以文字为基准 */
    .lms-fields__row .lms-select option::checkmark,
    .lms-fields--grid .lms-select option::checkmark {
        position: absolute;
        left: 8px;
        top: 50%;
        translate: 0 -50%;
    }
    .lms-select option,
    .lms-preset-select option {
        padding: 6px 8px;
        border-radius: ${LMS_TOKENS.radius.sm};
        background: transparent;
        color: ${LMS_TOKENS.color.text};
        /* 选单是覆盖式弹层，不受参数区密排宽度约束，字号特意大于控件自身
           （13.5px）：选项在弹出时才需要逐条扫读，大一号更易辨认。
           收起态的控件文字仍用控件自身字号，不受此项影响 */
        font-size: 16px;
    }
    /* 标题栏上的参数预设下拉框：选单选项字号与参数区下拉（16px）一致；
       选项文字居中（兼容 flex 布局），✓ 绝对定位到左缘、以文字为基准居中 */
    .lms-preset-select option {
        position: relative;
        font-size: 16px;
        text-align: center;
        justify-content: center;
    }
    .lms-preset-select option::checkmark {
        position: absolute;
        left: 8px;
        top: 50%;
        translate: 0 -50%;
    }
    .lms-select option:hover,
    .lms-select option:focus,
    .lms-preset-select option:hover,
    .lms-preset-select option:focus {
        background: rgba(59, 130, 246, 0.16);
        color: ${LMS_TOKENS.color.textBright};
    }
    .lms-select option:checked,
    .lms-preset-select option:checked {
        /* 取消选中项的高亮色块：不加背景，仅保留提亮文字与中等字重作选中标识 */
        background: none;
        color: ${LMS_TOKENS.color.textBright};
        font-weight: 500;
    }
    .lms-select option::checkmark,
    .lms-preset-select option::checkmark { color: ${LMS_TOKENS.color.primaryLight}; }
}
`);

/* 语言的合法选项（与后端 INPUT_TYPES 一致）：显式声明是为了在加载老工作流时，
   把它带进来的已删除值（Ignore / 不指定）连同被前端塞回选项列表的幽灵项一起清掉 */
const LMS_OUTPUT_LANGUAGES = ["Chinese", "English", "Chinese&English"];

/* ---- panel layout description -------------------------------------------- */
/* 每个 field.name 必须与后端 INPUT_TYPES 中的参数名严格一致，面板只负责显示。 */

/* 节点面板最小宽度：由「推理参数」卡片的棋盘格双列排版反推，保证最紧的一行
   在任何语言下都不换行、不溢出。单格可用宽度 c 需满足（格内左右内边距合计 16px）：
       标签 + 6(gap) + 滑块下限 56 + 8(gap) + 数值框 + 16 ≤ c
   代入实测：长标签的滑块行（标签 94 上限 + 53 数值框）→ c ≥ 233；
   种子行（标签 49 + 88 种子框）→ c ≥ 223。取 c = 240。
   面板最小宽度 = 2×240 + 棋盘格左右内边距 6 + 卡片左右内边距 22 = 494 → 排版下限 510。
   该值同时用于两处 computeSize 与 onResize 的宽度钳制，低于它时节点会被抬回，
   加载旧工作流时也会在挂载后先抬到该下限。
   100% 缩放截图复核（解码像素量的）：比例尺先用 .lms-switch__track 的 42px 校准为 1:1，
   当时节点外框 507×881、面板本体宽 487 —— 与 510 相符（差的 3px 落在圆角边框与抗锯齿上）。
   按要求在排版下限 510 之上再加 40 → 550。 */
const LMS_PANEL_MIN_WIDTH = 550;

const LMS_PANEL_LAYOUT = [
    {
        id: "prompt",
        titleKey: "cardPrompt",
        icon: "template",
        fields: [
            // 「使用预设」：方框高 = 字符高（1em）的正方形复选框，挂在卡片标题栏右侧（关闭后整组预设禁用、提示词输入框才可用）
            { name: "use_preset", labelKey: "fieldUsePreset", kind: "checkbox", header: true },
            // 以下四项 inline：合并排在同一行（模式 / 篇幅 / 格式 / 语言）
            {
                name: "preset_prompt",
                labelKey: "fieldPresetPrompt",
                kind: "select",
                inline: true,
                disabledWhen: { widget: "use_preset", value: false },
                // 预设文件里的键名（本身即中文）统一映射到 i18n，
                // 选项值仍提交原始键名给后端，只有显示文案随界面语言切换
                widgetLabelKeys: {
                    "通用标注": "presetPromptGeneral",
                    "专业详细": "presetPromptDetailed",
                    "角色特征": "presetPromptCharacter",
                    "场景分析": "presetPromptScene",
                    "风格识别": "presetPromptStyle",
                    "差异比对": "presetPromptDiff",
                },
            },
            {
                name: "prompt_length",
                labelKey: "fieldPromptLength",
                kind: "select",
                inline: true,
                disabledWhen: { widget: "use_preset", value: false },
                // 选项值提交给后端（Standard/Short/Medium/Long），面板显示中文
                widgetLabelKeys: {
                    Standard: "promptLengthStandard",
                    Short: "promptLengthShort",
                    Medium: "promptLengthMedium",
                    Long: "promptLengthLong",
                },
            },
            {
                name: "prompt_format",
                labelKey: "fieldPromptFormat",
                kind: "select",
                inline: true,
                disabledWhen: { widget: "use_preset", value: false },
                widgetLabelKeys: {
                    "Structured JSON": "promptFormatStructured",
                    Tag: "promptFormatTag",
                    Natural: "promptFormatNatural",
                },
            },
            {
                name: "output_language",
                labelKey: "fieldOutputLanguage",
                kind: "select",
                inline: true,
                disabledWhen: { widget: "use_preset", value: false },
                widgetLabelKeys: {
                    Chinese: "outputLanguageChinese",
                    English: "outputLanguageEnglish",
                    "Chinese&English": "outputLanguageBoth",
                },
            },
            {
                name: "user_prompt",
                labelKey: "fieldUserPrompt",
                kind: "textarea",
                placeholderKey: "userPromptPlaceholder",
                block: true,
                // 使用预设时禁用（此时由预设提示词决定分析指令）
                disabledWhen: { widget: "use_preset", value: true },
                // 可用状态标记 + 悬停说明
                available: "promptAvailableTip",
            },
            {
                name: "system_prompt",
                labelKey: "fieldSystemPrompt",
                kind: "textarea",
                placeholderKey: "systemPromptPlaceholder",
                block: true,
                // 使用预设时禁用（系统提示词只在「不使用预设」模式下生效）
                disabledWhen: { widget: "use_preset", value: true },
                // 可用状态标记 + 悬停说明
                available: "promptAvailableTip",
            },
        ],
    },
    {
        id: "inference",
        titleKey: "cardInference",
        icon: "sliders",
        // 2 列棋盘格排版（每格一个参数，等宽 + 纵向按列交错的底色分隔）
        columns: 2,
        fields: [
            {
                name: "model",
                labelKey: "fieldModel",
                kind: "select",
                // 模型名较长：独占整行显示，不参与 2 列分格
                wide: true,
                // 占位值本地化：后端英文标识 + 历史版本可能写入的中文值都映射到同一文案
                widgetLabelKeys: {
                    [LMS_NO_MODELS_PLACEHOLDER]: "noModelsFound",
                    "未找到模型": "noModelsFound",
                },
            },
            { name: "max_tokens", labelKey: "fieldMaxTokens", kind: "number", integer: true },
            { name: "temperature", labelKey: "fieldTemperature", kind: "range", step: 0.1 },
            { name: "top_p", labelKey: "fieldTopP", kind: "range", step: 0.1 },
            { name: "top_k", labelKey: "fieldTopK", kind: "range", integer: true },
            { name: "repetition_penalty", labelKey: "fieldRepetition", kind: "range", step: 0.1 },
            { name: "presence_penalty", labelKey: "fieldPresence", kind: "range", step: 0.1 },
            { name: "seed", labelKey: "fieldSeed", kind: "number", integer: true },
            {
                name: "control_after_generate",
                labelKey: "fieldSeedControl",
                kind: "select",
                widgetLabelKeys: {
                    fixed: "seedCtlFixed",
                    increment: "seedCtlIncrement",
                    decrement: "seedCtlDecrement",
                    randomize: "seedCtlRandomize",
                },
            },
        ],
    },
    {
        id: "output",
        titleKey: "cardOutput",
        icon: "layers",
        // 等宽三格并排：每格「标签 + 控件」同处一行，三项共处一行
        tiles: true,
        fields: [
            { name: "size_limitation", labelKey: "fieldSizeLimit", kind: "number", integer: true },
            { name: "remove_think_tags", labelKey: "fieldRemoveThink", kind: "switch" },
            { name: "unload_model", labelKey: "fieldUnloadModel", kind: "switch" },
        ],
    },
    {
        id: "batch",
        titleKey: "cardBatch",
        icon: "folder",
        fields: [
            { name: "batch_mode", labelKey: "fieldBatchMode", kind: "switch" },
            {
                name: "batch_folder_path",
                labelKey: "fieldBatchFolder",
                kind: "text",
                placeholderKey: "batchFolderPlaceholder",
                // 常驻显示：关闭「批处理模式」只禁用，不隐藏（避免节点高度跳变）
                disabledWhen: { widget: "batch_mode", value: false },
                // 三种设定方式：拖拽文件夹 / 「设定」按钮选目录 / 直接输入
                folderPicker: true,
            },
            {
                name: "skip_exists",
                labelKey: "fieldSkipExists",
                kind: "switch",
                disabledWhen: { widget: "batch_mode", value: false },
            },
        ],
    },
];

/** 由面板接管并隐藏的原生 widget（endpoint 早已由节点配置面板管理） */
const LMS_PANEL_MANAGED_WIDGETS = LMS_PANEL_LAYOUT.flatMap((card) => card.fields.map((field) => field.name));

/* ---- small helpers ------------------------------------------------------- */

let _lmsFieldSeq = 0;

function lmsNextFieldId(name) {
    _lmsFieldSeq += 1;
    return `lms-${name}-${_lmsFieldSeq.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function lmsThrottle(fn, wait) {
    let timer = null;
    let args = null;
    return function throttled() {
        args = arguments;
        if (timer) return;
        timer = setTimeout(() => {
            timer = null;
            fn.apply(null, args);
        }, wait);
    };
}

function getLMSWidget(node, name) {
    return node?.widgets?.find((w) => w.name === name) || null;
}

/** widget 是否被输入连线接管（ComfyUI 会把 widget 转成输入端口） */
function isLMSWidgetLinked(node, widget) {
    if (!widget) return false;
    if (widget.type === "converted-widget") return true;
    const inputs = node?.inputs ?? [];
    return inputs.some((input) => input.name === widget.name && input.link != null);
}

function toLMSNumber(raw, spec, options) {
    const parsed = typeof raw === "number" ? raw : parseFloat(raw);
    if (!Number.isFinite(parsed)) return 0;
    const min = options?.min ?? spec.min;
    const max = options?.max ?? spec.max;
    let value = spec.integer ? Math.round(parsed) : parsed;
    if (typeof min === "number") value = Math.max(min, value);
    if (typeof max === "number") value = Math.min(max, value);
    return value;
}

function writeLMSWidget(node, widget, value, options) {
    if (!widget) return;
    widget.value = value;
    if (typeof widget.callback === "function") {
        try {
            widget.callback(value);
        } catch (err) {
            console.error("[LMStudio] widget callback failed:", err);
        }
    }
    if (!options?.deferDirty) {
        node.setDirtyCanvas?.(true, true);
    }
}

/* ---- control factory ----------------------------------------------------- */
/* 统一契约：{ el, name, setValue, getValue, setDisabled, setOptions, refreshLabels, destroy } */

/** 已登记的展开态跟踪项；所有下拉共用同一个 document 监听 */
const _lmsOpenSelects = new Set();

/**
 * 点击组件以外区域 → 复位展开态。
 *
 * 不能只依赖 blur：点击画布等区域时浏览器/ComfyUI 会阻止默认行为，
 * 焦点仍留在 select 上，blur 不触发，箭头会一直停在"展开"方向。
 * 这里用 document 级 mousedown 兜底（元素已卸载的登记项顺带清理）。
 */
document.addEventListener("mousedown", (event) => {
    const target = event.target;
    _lmsOpenSelects.forEach((entry) => {
        if (!entry.select.isConnected) {
            _lmsOpenSelects.delete(entry);
            return;
        }
        if (entry.select === target || entry.select.contains(target)) return;
        entry.setOpen(false);
    });
});

/**
 * 跟踪原生 <select> 的展开状态，用于驱动外框/箭头指示器。
 *
 * 原生 select 没有 open/close 事件，关闭后也往往仍保持焦点，
 * 因此不能用 :focus-within 判断（关闭后指示器会一直停在"展开"）。
 * 这里以「点击切换」为主动作，配合上面 document 级的点击外部复位、
 * 以及 change / blur / Escape 等信号，保证指示器始终与实际状态一致。
 */
function attachLMSSelectOpenState(select, target) {
    if (!select || !target) return;
    const setOpen = (open) => target.classList.toggle("lms-open", !!open);
    const entry = { select, setOpen };

    setOpen(false);
    _lmsOpenSelects.add(entry);

    select.addEventListener("mousedown", () => {
        // 每次按下都是在开 / 关之间切换
        setOpen(!target.classList.contains("lms-open"));
    });
    select.addEventListener("change", () => setOpen(false));
    select.addEventListener("blur", () => setOpen(false));
    // 原生弹层里再次选中同一项时不会触发 change，用 click（base-select 下选项是 select 的子节点）兜底
    select.addEventListener("click", (event) => {
        if (event.target !== select) setOpen(false);
    });
    select.addEventListener("keydown", (event) => {
        if (event.key === "Escape" || event.key === "Tab") {
            setOpen(false);
            return;
        }
        // 键盘打开弹层（Enter / 空格 / 方向键）
        if (event.key === "Enter" || event.key === " " || event.key.startsWith("Arrow")) {
            setOpen(true);
        }
    });
}

/**
 * 下拉框宽度收缩到「最长选项文本」所需的宽度（英文文案通常最长）。
 * 用 offsetWidth 测量：它取布局像素，不受画布 transform 缩放影响，
 * 而 getBoundingClientRect() 返回的是屏幕像素，缩放下会漂移。
 */
function fitLMSSelectWidth(select) {
    if (!select || select.options.length === 0) return;
    // 棋盘格（推理参数）与整行容器（模型）里的下拉宽度由栅格决定——吃满控件区、
    // 右缘与同列数值框对齐；此处按内容写内联宽度会压过 CSS 的 width:100%，
    // 使下拉缩成内容宽后被推到格子右端（正是「生成后控制」错位的成因）
    if (select.closest(".lms-fields--grid, .lms-fields--wide")) {
        select.style.removeProperty("width");
        return;
    }
    const styles = window.getComputedStyle(select);
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;";
    probe.style.fontFamily = styles.fontFamily;
    probe.style.fontSize = styles.fontSize;
    probe.style.fontWeight = styles.fontWeight;
    probe.style.letterSpacing = styles.letterSpacing;
    (select.parentElement || document.body).appendChild(probe);

    let content = 0;
    Array.from(select.options).forEach((option) => {
        probe.textContent = option.textContent || "";
        content = Math.max(content, probe.offsetWidth);
    });
    probe.remove();
    // 元素尚未挂载时测量结果为 0，此时不写入宽度（挂载后会再测一次）
    if (content <= 0) return;

    const box = ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]
        .reduce((total, key) => total + (parseFloat(styles[key]) || 0), 0);
    // +2px 抵消文本测量与真实排版的取整误差
    select.style.width = `${Math.ceil(content + box) + 2}px`;
}

/* ---- folder picker（批处理文件夹路径：拖拽 / 设定按钮 / 直接输入） ---------- */

/** 拖拽内容 → 本地路径：识别 file:/// URI 或「像绝对路径」的纯文本；识别不出返回 "" */
function lmsNormalizeDroppedPath(raw) {
    if (!raw) return "";
    const lines = String(raw).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
        if (line.startsWith("#")) continue;
        if (/^file:\/\//i.test(line)) {
            let text = "";
            try {
                text = decodeURIComponent(new URL(line).pathname);
            } catch (err) {
                text = decodeURIComponent(line.replace(/^file:\/\//i, ""));
            }
            // Windows 的 file:///D:/dir 会被解析成 /D:/dir
            if (/^\/[a-zA-Z]:[\\/]/.test(text)) text = text.slice(1);
            return text;
        }
        // Windows 盘符 / UNC / Unix 绝对路径
        if (/^(?:[a-zA-Z]:[\\/]|\\\\|\/)/.test(line)) return line;
    }
    return "";
}

/**
 * 从 drop 事件里尽力取绝对路径：
 * ① Electron（ComfyUI 桌面版）会给 File.path；② 资源管理器地址栏等来源会带 uri-list / 纯文本路径。
 * 普通浏览器中拖文件夹只会给「名称」，此时返回空串，由调用方提示改用「设定」按钮。
 */
function lmsExtractDroppedPath(event) {
    const dt = event?.dataTransfer;
    if (!dt) return "";
    const file = dt.files && dt.files[0];
    if (file && typeof file.path === "string" && file.path.trim()) return file.path.trim();
    for (const type of ["text/uri-list", "text/plain"]) {
        let raw = "";
        try {
            raw = dt.getData(type) || "";
        } catch (err) {
            raw = "";
        }
        const path = lmsNormalizeDroppedPath(raw);
        if (path) return path;
    }
    return "";
}

/**
 * 拖入的文件夹名：优先取 webkitGetAsEntry() 的目录名，退回 File.name。
 * 浏览器不给绝对路径，只有名称 —— 名称交给服务端按名称定位。
 */
function lmsExtractDroppedName(event) {
    const dt = event?.dataTransfer;
    if (!dt) return "";
    const items = dt.items ? Array.from(dt.items) : [];
    for (const item of items) {
        if (item.kind !== "file") continue;
        let entry = null;
        try {
            entry = item.webkitGetAsEntry?.() || null;
        } catch (err) {
            entry = null;
        }
        if (entry && entry.isDirectory && entry.name) return entry.name;
    }
    const file = dt.files && dt.files[0];
    return file?.name || "";
}

/** 记住最近使用的批处理文件夹：下次「按名称定位」优先在其父目录里搜索 */
async function rememberLMSBatchFolder(path) {
    if (!path) return;
    try {
        await fetch("/zhihui/lmstudio/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_batch_folder: path }),
        });
    } catch (err) {
        // 记忆失败不影响主流程
    }
}

/**
 * 标准开关组件（全节点唯一工厂）：节点面板字段、设置对话框等所有开关一律
 * 由此创建，样式统一走 .lms-switch 系列 CSS（深灰胶囊轨 + 圆角 LED 灯板 +
 * 靠左全大写 ON/OFF 状态字），不再允许局部另写开关样式。
 * 返回 { el, set, get }：set(true/false) 同步视觉状态，get() 读当前布尔值；
 * 用户点击时组件自行翻转并派发 "lms-change"（detail 为新布尔值），调用方
 * 监听该事件落值/发消息；程序化赋值走 set()（不派发事件）。
 */
function createLmsSwitchElement({ id = "", label = "" } = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lms-switch";
    button.setAttribute("role", "switch");
    button.setAttribute("aria-checked", "false");
    if (id) button.id = id;
    // 开关无可见文案，可读名称由 aria-label 提供（随语言刷新由调用方负责）
    if (label) button.setAttribute("aria-label", label);
    // 指示灯为纯 CSS 几何（见 .lms-switch__lamp）：随面板图层重栅格化，画布缩放下不模糊
    button.innerHTML = '<span class="lms-switch__track"><span class="lms-switch__lamp"></span></span>';
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = button.getAttribute("aria-checked") !== "true";
        button.setAttribute("aria-checked", next ? "true" : "false");
        button.dispatchEvent(new CustomEvent("lms-change", { detail: next }));
    });
    button.addEventListener("pointerdown", (e) => e.stopPropagation());
    return {
        el: button,
        set: (on) => button.setAttribute("aria-checked", on ? "true" : "false"),
        get: () => button.getAttribute("aria-checked") === "true",
    };
}

/**
 * 批处理文件夹路径的三合一定值控件：
 * ① 拖入文件夹（有路径直接用；只有名称时按名称在服务端定位并请用户确认）
 * ② 点「设定」用服务端原生对话框选目录 ③ 直接输入。
 * 返回 { button, refreshLabels }，供调用方纳入 disabled 联动与语言刷新。
 */
function attachLMSFolderPicker(control, inputEl, api) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lms-mini-btn lms-field__folder-btn";
    button.innerHTML = '<span class="lms-mini-btn__glyph">' + lmsSvg("folder", 13) + "</span>"
        + "<span></span>";
    const buttonText = button.querySelector("span:last-child");

    const refreshLabels = () => {
        buttonText.textContent = $t("folderPickBtn");
        button.setAttribute("aria-label", $t("folderPickBtn"));
    };
    refreshLabels();
    attachLMSGlassTooltip(button, () => $t("folderPickTooltip"));
    // 挂到控件行右侧（输入框占满剩余宽度，按钮固定宽度）
    control.appendChild(button);

    const setDropState = (active) => control.classList.toggle("lms-drop-active", !!active);
    const setLocating = (active) => control.classList.toggle("lms-locating", !!active);

    const commitPath = (path) => {
        api.commit(path);
        rememberLMSBatchFolder(path);
    };

    /** 只有文件夹名时：请服务端在候选根目录里定位，命中后请用户确认 */
    const locateByName = async (name) => {
        if (!name) {
            showToast($t("folderDropNoPath"), "warning");
            return;
        }
        button.disabled = true;
        setLocating(true);
        try {
            const response = await fetch(
                `/zhihui/lmstudio/locate_folder?name=${encodeURIComponent(name)}`,
            );
            if (!response.ok) {
                // 路由缺失通常是后端未重启（新增接口在启动时注册）
                console.warn("[LMStudio] locate endpoint unavailable:", response.status);
                showToast($t("folderLocateUnavailable"), "error");
                return;
            }
            const data = await response.json().catch(() => ({}));
            const matches = Array.isArray(data?.matches) ? data.matches : [];
            console.debug("[LMStudio] locate result:", data?.scanned, data?.roots, matches);
            if (matches.length === 0) {
                showToast($t("folderNotFound"), "warning");
                return;
            }
            // 命中即直接填入，不再弹确认框（路径会显示在输入框里，可随时手动改）
            commitPath(matches[0]);
        } catch (err) {
            console.error("[LMStudio] locate folder failed:", err);
            showToast($t("folderPickFailed"), "error");
        } finally {
            button.disabled = false;
            setLocating(false);
        }
    };

    button.addEventListener("pointerdown", (e) => e.stopPropagation());
    button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (button.disabled) return;
        button.disabled = true;
        try {
            const response = await fetch("/zhihui/lmstudio/select_directory");
            const data = await response.json().catch(() => ({}));
            const path = String(data?.path || "").trim();
            if (path) {
                commitPath(path);
            } else if (!data?.cancelled) {
                showToast($t("folderPickFailed"), "error");
            }
        } catch (err) {
            console.error("[LMStudio] folder picker failed:", err);
            showToast($t("folderPickFailed"), "error");
        } finally {
            button.disabled = false;
        }
    });

    // 落点覆盖整行（输入框 + 「设定」按钮）：比只挂输入框更容易命中
    control.addEventListener("dragover", (event) => {
        // 阻止冒泡：否则画布会接管这次拖拽去做文件上传
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
        setDropState(true);
    });
    control.addEventListener("dragleave", () => setDropState(false));
    control.addEventListener("drop", (event) => {
        const path = lmsExtractDroppedPath(event);
        const name = lmsExtractDroppedName(event);
        const isFolderDrop = !!name
            || !!(event.dataTransfer?.files && event.dataTransfer.files.length > 0);
        setDropState(false);
        // 纯文本拖拽（非文件、也非路径）交回浏览器默认插入，避免打断正常粘贴
        if (!path && !isFolderDrop) return;
        event.preventDefault();
        event.stopPropagation();
        if (path) {
            commitPath(path);
            return;
        }
        // 浏览器只给了文件夹名（不给绝对路径）：请服务端按名称定位
        console.debug("[LMStudio] dropped folder without path, locating by name:", name);
        locateByName(name);
    });

    return { button, refreshLabels };
}

/**
 * 给多行文本框挂一层自绘滚动条（上箭头 + 轨道滑块 + 下箭头），UA 滚动条已在 CSS 里收掉。
 *
 * 之所以不用 ::-webkit-scrollbar 主题化：Chrome 对那组伪元素只应用 display / width /
 * height / background，cursor 写了不生效（实测悬停滑块仍是指针箭头），要「悬停变手型」
 * 只能把滚动条做成真实元素。与 .lms-range__thumb 同一套路 —— 隐藏 UA 控件、覆盖层自绘。
 *
 * 返回 { sync }：程序改写 textarea.value 不触发 input/scroll，调用方要在赋值后补一次 sync。
 */
function attachLMSScrollbar(host, textarea) {
    const bar = document.createElement("div");
    bar.className = "lms-scroll";
    bar.setAttribute("aria-hidden", "true");

    const caret = (up) => '<svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" '
        + 'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        + '<polyline points="' + (up ? "1 5 5 1 9 5" : "1 1 5 5 9 1") + '"/></svg>';
    const button = (up) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.tabIndex = -1;
        btn.className = "lms-scroll__btn";
        btn.innerHTML = caret(up);
        // 焦点留在输入框：:focus 光环不闪断，连按也无需重新点框
        btn.onmousedown = (e) => e.preventDefault();
        btn.onclick = () => {
            const line = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
            textarea.scrollBy({ top: up ? -line : line });
        };
        return btn;
    };

    const track = document.createElement("div");
    track.className = "lms-scroll__bar";
    const thumb = document.createElement("div");
    thumb.className = "lms-scroll__thumb";
    track.appendChild(thumb);
    bar.append(button(true), track, button(false));
    host.appendChild(bar);

    const sync = () => {
        bar.style.height = textarea.offsetHeight + "px";
        const overflow = textarea.scrollHeight - textarea.clientHeight;
        if (overflow <= 0) {
            bar.hidden = true;
            return;
        }
        bar.hidden = false;
        const lane = track.clientHeight;
        const size = Math.max(20, Math.round((lane * textarea.clientHeight) / textarea.scrollHeight));
        thumb.style.height = size + "px";
        thumb.style.transform = "translateY(" + Math.round(((lane - size) * textarea.scrollTop) / overflow) + "px)";
    };

    textarea.addEventListener("scroll", sync, { passive: true });
    textarea.addEventListener("input", sync);
    if (typeof ResizeObserver === "function") new ResizeObserver(sync).observe(textarea);
    // 滚轮落在滚动条上时归输入框，不外溢给画布缩放
    bar.addEventListener("wheel", (e) => {
        e.preventDefault();
        e.stopPropagation();
        textarea.scrollTop += e.deltaY;
    }, { passive: false });

    thumb.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        const overflow = textarea.scrollHeight - textarea.clientHeight;
        const travel = track.clientHeight - thumb.offsetHeight;
        if (overflow <= 0 || travel <= 0) return;
        const startY = e.clientY;
        const startScroll = textarea.scrollTop;
        thumb.dataset.dragging = "true";
        thumb.setPointerCapture(e.pointerId);
        thumb.onpointermove = (move) => {
            textarea.scrollTop = startScroll + ((move.clientY - startY) / travel) * overflow;
        };
        thumb.onpointerup = () => {
            delete thumb.dataset.dragging;
            thumb.onpointermove = null;
            thumb.onpointerup = null;
        };
    });

    // 点轨道空白处按位置跳转（原生滚动条是分页，这里对齐滑块中心更直观）
    track.addEventListener("pointerdown", (e) => {
        if (e.target !== track) return;
        const rect = track.getBoundingClientRect();
        const travel = track.clientHeight - thumb.offsetHeight;
        if (travel <= 0) return;
        const ratio = (e.clientY - rect.top - thumb.offsetHeight / 2) / travel;
        textarea.scrollTop = ratio * (textarea.scrollHeight - textarea.clientHeight);
        sync();
    });

    requestAnimationFrame(sync);
    return { sync };
}

function createLMSControl(spec, widget, handlers) {
    const field = document.createElement("div");
    field.className = "lms-field"
        + (spec.block ? " lms-field--block" : "")
        // 滑块字段单独标记：棋盘格下用于「标签 ↔ 滑块」间距与滑块宽度的差异化处理
        + (spec.kind === "range" ? " lms-field--range" : "");
    field.dataset.widget = spec.name;
    if (spec.dependsOn) field.dataset.dependsOn = spec.dependsOn;

    const inputId = lmsNextFieldId(spec.name);
    const label = document.createElement("label");
    label.className = "lms-field__label";
    label.htmlFor = inputId;
    const labelText = document.createElement("span");
    labelText.className = "lms-field__label-text";
    // 可用状态标识（仅布局中声明 available 的字段，如用户/系统提示词）：
    // 风格参照 zhiai-image-inverse-engine —— 可用 = 圆圈对勾，禁用 = 禁止符（非红点）
    let availableMark = null;
    if (spec.available) {
        availableMark = document.createElement("span");
        availableMark.className = "lms-field__flag";
        availableMark.setAttribute("aria-hidden", "true");
        availableMark.innerHTML = lmsSvg("checkCircle", 12);
        attachLMSGlassTooltip(availableMark, () => $t(spec.available));
        label.appendChild(availableMark);
    }
    label.appendChild(labelText);

    const linkMark = document.createElement("span");
    linkMark.className = "lms-field__link";
    linkMark.innerHTML = lmsSvg("link", 12);
    linkMark.hidden = true;
    attachLMSGlassTooltip(linkMark, () => $t("linkedByInput"));
    label.appendChild(linkMark);

    const control = document.createElement("div");
    control.className = "lms-control"
        + (spec.kind === "select" ? " lms-control--select" : "")
        // 数字框与开关一样靠右对齐，与已收缩的下拉框保持同一列对齐
        + (spec.kind === "switch" || spec.kind === "number" ? " lms-control--end" : "")
        + (spec.kind === "range" ? " lms-control--split" : "")
        // 文件夹路径字段：输入框占满剩余宽度 + 右侧「设定」按钮
        + (spec.folderPicker ? " lms-control--folder" : "");

    field.appendChild(label);
    field.appendChild(control);
    // 标题栏字段（header）自带文字说明，去掉卡片内的字段标题（须在挂载后移除才生效）
    if (spec.header) label.remove();

    let disabled = false;
    // 门控禁用（如「使用预设」关闭时整组预设不可编辑）：只灰化，不显示「由输入接管」提示
    let locked = false;
    let defaultValue = null;
    let interactive = [];

    const emit = (value) => {
        if (disabled || locked) return;
        defaultValue = value;
        handlers?.onChange?.(value);
    };

    /** 统一的禁用态渲染：disabled = 被输入连线接管，locked = 被其它开关门控 */
    const applyDisabledState = () => {
        field.dataset.disabled = disabled ? "true" : "false";
        field.dataset.locked = locked ? "true" : "false";
        linkMark.hidden = !disabled;
        // 可用性图标随门控状态切换：可用 = 圆圈对勾，禁用 = 禁止符
        if (availableMark) availableMark.innerHTML = lmsSvg(locked ? "ban" : "checkCircle", 12);
        interactive.forEach((el) => { el.disabled = disabled || locked; });
    };

    const setDisabled = (flag) => {
        disabled = !!flag;
        applyDisabledState();
    };

    /** 由布局声明（disabledWhen）下发的门控禁用 */
    const setLocked = (flag) => {
        locked = !!flag;
        applyDisabledState();
    };

    const refreshLabels = () => {
        labelText.textContent = $t(spec.labelKey);
        // 复选框自带文字说明（卡片内不使用字段标题），随语言刷新；
        // 文字不是 <label>，可读名称由方框的 aria-label 提供
        if (spec.kind === "checkbox") {
            control.querySelector(".lms-check__label").textContent = $t(spec.labelKey);
            interactive[0]?.setAttribute("aria-label", $t(spec.labelKey));
        }
        // 开关无可见文案，可读名称随语言刷新
        if (spec.kind === "switch") {
            interactive[0]?.setAttribute("aria-label", $t(spec.labelKey));
        }
        if (spec.kind === "textarea" || spec.kind === "text") {
            interactive[0]?.setAttribute("placeholder", spec.placeholderKey ? $t(spec.placeholderKey) : "");
        }
        if (spec.kind === "select") {
            const select = interactive[0];
            Array.from(select?.options ?? []).forEach((option) => {
                option.textContent = spec.widgetLabelKeys?.[option.value]
                    ? $t(spec.widgetLabelKeys[option.value])
                    : option.dataset.rawLabel || option.textContent;
            });
            // 文案随语言变化，宽度需要按新的最长选项重新收缩
            // （单行组内的下拉由格宽决定宽度，不参与定宽，否则节点加宽后数值区填不满）
            if (!spec.inline) fitLMSSelectWidth(select);
        }
        // 文件夹字段的「设定」按钮文案同样随语言更新
        api.refreshFolderPicker?.();
    };

    const applyNote = (text) => {
        let note = field.querySelector(".lms-field__note");
        if (!text) {
            note?.remove();
            return;
        }
        if (!note) {
            note = document.createElement("span");
            note.className = "lms-field__note";
            // 说明提示统一显示在控件上方（字段内最前，跨两列）
            field.prepend(note);
        }
        note.textContent = text;
    };

    const api = {
        el: field,
        name: spec.name,
        spec,
        getValue: () => defaultValue,
        /** 外部写入并提交：回显到控件 + 写回 widget（拖拽 / 选目录等非键入式赋值） */
        commit: (value) => {
            api.setValue(value);
            emit(api.getValue());
        },
        setDisabled,
        setLocked,
        refreshLabels,
        applyNote,
        destroy: () => field.remove(),
    };

    if (spec.kind === "select") {
        const select = document.createElement("select");
        select.className = "lms-select";
        select.id = inputId;
        select.addEventListener("change", () => emit(select.value));
        select.addEventListener("pointerdown", (e) => e.stopPropagation());
        control.appendChild(select);
        interactive = [select];
        // 展开态（驱动箭头翻转与外框高亮）；不使用 :focus-within，关闭后指示器会立刻复位
        attachLMSSelectOpenState(select, control);
        // 选项文案被格宽截断时（如窄格里的模型名）才用玻璃提示补全，未截断则不弹
        attachLMSGlassTooltip(select, () => {
            const box = select.querySelector("selectedcontent") || select;
            const text = box.textContent || select.value || "";
            return box.scrollWidth > box.clientWidth + 1 ? text : "";
        });

        api.setOptions = (values, current) => {
            const list = Array.isArray(values) ? values : [];
            select.textContent = "";
            list.forEach((value) => {
                const option = document.createElement("option");
                option.value = String(value);
                option.dataset.rawLabel = String(value);
                option.textContent = spec.widgetLabelKeys?.[String(value)]
                    ? $t(spec.widgetLabelKeys[String(value)])
                    : String(value);
                select.appendChild(option);
            });
            api.setValue(current);
            if (!spec.inline) fitLMSSelectWidth(select);
        };

        api.setValue = (value) => {
            const text = value == null ? "" : String(value);
            defaultValue = text;
            let added = false;
            if (!Array.from(select.options).some((option) => option.value === text)) {
                const option = document.createElement("option");
                option.value = text;
                option.dataset.rawLabel = text;
                option.textContent = text || "—";
                select.appendChild(option);
                added = true;
            }
            select.value = text;
            if (added && !spec.inline) fitLMSSelectWidth(select);
        };

        api.getValue = () => select.value;
    } else if (spec.kind === "checkbox") {
        // 复选框（标题栏里的「使用预设」）：方框 + 文字说明，只有方框可点
        const box = document.createElement("input");
        box.type = "checkbox";
        box.className = "lms-check__box";
        box.id = inputId;
        const textEl2 = document.createElement("span");
        textEl2.className = "lms-check__label";
        box.addEventListener("change", () => {
            api.setValue(box.checked);
            emit(box.checked);
        });
        box.addEventListener("pointerdown", (e) => e.stopPropagation());
        control.classList.add("lms-check");
        control.appendChild(box);
        control.appendChild(textEl2);
        interactive = [box];

        api.setValue = (value) => {
            const on = value === true || value === "true" || value === 1;
            defaultValue = on;
            box.checked = on;
        };

        api.getValue = () => box.checked;
    } else if (spec.kind === "switch") {
        // 标准开关：与设置对话框等所有开关同一工厂、同一套 CSS（见 createLmsSwitchElement）
        const sw = createLmsSwitchElement({ id: inputId, label: $t(spec.labelKey) });
        const button = sw.el;
        button.addEventListener("lms-change", (event) => {
            api.setValue(event.detail);
            emit(event.detail);
        });
        control.appendChild(button);
        interactive = [button];

        api.setValue = (value) => {
            const on = value === true || value === "true" || value === 1;
            defaultValue = on;
            sw.set(on);
        };

        api.getValue = sw.get;
    } else if (spec.kind === "range") {
        const numberInput = document.createElement("input");
        numberInput.type = "number";
        numberInput.className = "lms-input lms-number lms-number--combo";
        const min = widget?.options?.min;
        const max = widget?.options?.max;
        const step = spec.step ?? widget?.options?.step ?? (spec.integer ? 1 : 0.1);
        if (typeof min === "number") numberInput.min = min;
        if (typeof max === "number") numberInput.max = max;
        numberInput.step = step;

        const stepDecimals = (() => {
            const text = String(step ?? "");
            return text.includes(".") ? Math.min(6, text.split(".")[1].length) : 0;
        })();
        const quantize = (value) => (spec.integer ? Math.round(value) : Number(value.toFixed(stepDecimals)));

        const range = document.createElement("input");
        range.type = "range";
        range.className = "lms-range";
        range.id = inputId;
        if (typeof min === "number") range.min = min;
        if (typeof max === "number") range.max = max;
        // 允许承载任意取值（拖动时再对齐到业务步进），避免工作流历史值被强制取整
        range.step = "any";

        /* 滑柄自绘覆盖层。UA 原生滑柄的落点是 fraction*(W-thumbW)，画布缩放
           （祖先 transform: scale）把它推到非整数设备像素上，且左右缘的抗锯齿
           覆盖比例随小数相位变化 —— 观感就是「推到某个步进点宽度会变」。
           这里把滑柄左缘吸附到设备像素栅格：宽度是常量 + 左缘落在整格 ⇒
           右缘的亚像素余量也是常量，每个步进点画出的一样宽。 */
        const rangeWrap = document.createElement("span");
        rangeWrap.className = "lms-range-wrap";
        const thumb = document.createElement("i");
        thumb.className = "lms-range__thumb";
        const THUMB_OUTER_W = 8;

        const syncRange = () => {
            const lo = Number(range.min);
            const hi = Number(range.max);
            const value = Number(range.value);
            const frac = hi > lo ? Math.max(0, Math.min(1, (value - lo) / (hi - lo))) : 0;
            range.style.setProperty("--lms-range-fill", `${frac * 100}%`);

            const trackW = range.clientWidth;
            if (!trackW) return;
            const half = THUMB_OUTER_W / 2;
            const rect = range.getBoundingClientRect();
            const scale = range.offsetWidth ? rect.width / range.offsetWidth : 1;
            const unit = (window.devicePixelRatio || 1) * (scale || 1);
            const center = Math.max(half, Math.min(trackW - half, frac * trackW));
            const left = unit > 0 ? Math.round((center - half) * unit) / unit : center - half;
            thumb.style.left = `${left}px`;
        };

        const applyNumber = (raw) => {
            const value = toLMSNumber(raw, { ...spec, step }, { min, max });
            defaultValue = value;
            if (numberInput.value !== String(value)) numberInput.value = String(value);
            range.value = String(value);
            syncRange();
            return value;
        };

        range.addEventListener("input", () => emit(applyNumber(quantize(Number(range.value)))));
        // 画布缩放不改变 CSS 像素宽度，ResizeObserver 不会因此回调；
        // 按下时补算一次，保证吸附用的缩放系数是当前值
        range.addEventListener("pointerdown", (e) => { e.stopPropagation(); syncRange(); });
        numberInput.addEventListener("change", () => emit(applyNumber(numberInput.value)));
        numberInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") numberInput.blur();
        });
        numberInput.addEventListener("pointerdown", (e) => e.stopPropagation());

        rangeWrap.appendChild(range);
        rangeWrap.appendChild(thumb);
        control.appendChild(rangeWrap);
        control.appendChild(numberInput);
        interactive = [range, numberInput];

        // 节点宽度变化会改变轨道像素宽，需重算滑柄落点
        const rangeResize = new ResizeObserver(syncRange);
        rangeResize.observe(rangeWrap);
        api.destroy = () => rangeResize.disconnect();

        api.setValue = (value) => {
            const next = value == null || value === "" ? 0 : toLMSNumber(value, { ...spec, step }, { min, max });
            applyNumber(next);
        };

        api.getValue = () => Number(range.value);
    } else if (spec.kind === "number") {
        const numberInput = document.createElement("input");
        numberInput.type = "number";
        numberInput.className = "lms-input lms-number";
        numberInput.id = inputId;
        const min = widget?.options?.min;
        const max = widget?.options?.max;
        if (typeof min === "number") numberInput.min = min;
        if (typeof max === "number") numberInput.max = max;
        numberInput.step = spec.step ?? widget?.options?.step ?? (spec.integer ? 1 : 0.1);
        numberInput.addEventListener("change", () => {
            const value = toLMSNumber(numberInput.value, spec, { min, max });
            numberInput.value = String(value);
            emit(value);
        });
        numberInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") numberInput.blur();
        });
        numberInput.addEventListener("pointerdown", (e) => e.stopPropagation());
        control.appendChild(numberInput);
        interactive = [numberInput];

        api.setValue = (value) => {
            const next = value == null || value === "" ? 0 : toLMSNumber(value, spec, { min, max });
            defaultValue = next;
            numberInput.value = String(next);
        };

        api.getValue = () => Number(numberInput.value);
    } else {
        const isMultiline = spec.kind === "textarea";
        const textEl = document.createElement(isMultiline ? "textarea" : "input");
        if (!isMultiline) textEl.type = "text";
        textEl.className = isMultiline ? "lms-textarea" : "lms-input";
        textEl.id = inputId;
        if (spec.placeholderKey) textEl.placeholder = $t(spec.placeholderKey);
        textEl.addEventListener("input", () => {
            defaultValue = textEl.value;
            if (!disabled) handlers?.onChange?.(textEl.value, { deferDirty: true });
        });
        textEl.addEventListener("change", () => {
            if (!disabled) handlers?.onChange?.(textEl.value);
        });
        textEl.addEventListener("pointerdown", (e) => e.stopPropagation());
        control.appendChild(textEl);
        const scroller = isMultiline ? attachLMSScrollbar(control, textEl) : null;
        interactive = [textEl];

        api.setValue = (value) => {
            const text = value == null ? "" : String(value);
            defaultValue = text;
            if (textEl.value !== text) textEl.value = text;
            // 程序赋值不触发 input/scroll，覆盖层滚动条要手动重算
            scroller?.sync();
        };

        api.getValue = () => textEl.value;

        // 文件夹路径字段：追加「设定」按钮 + 拖拽支持（与直接输入并存）
        if (spec.folderPicker && !isMultiline) {
            const picker = attachLMSFolderPicker(control, textEl, api);
            api.refreshFolderPicker = picker.refreshLabels;
            interactive = [textEl, picker.button];
        }
    }

    // 提示词输入框版式（参考 zhiai-image-inverse-engine）：标题移入框内左侧竖排成标题栏，
    // 与输入框共用同一圈外框（外框由 .lms-field__frame 统一绘制）
    if (spec.kind === "textarea") {
        const frame = document.createElement("div");
        frame.className = "lms-field__frame";
        field.classList.add("lms-field--side-title");
        field.insertBefore(frame, label);
        frame.appendChild(label);
        frame.appendChild(control);
    }

    refreshLabels();
    return api;
}

/* ---- panel construction -------------------------------------------------- */

function createLMSPanel(node) {
    const host = document.createElement("div");
    host.className = "lms-panel-host";
    // 面板内的右键改为弹出节点原生菜单（屏蔽浏览器菜单）
    attachLMSNodeContextMenu(host, node);
    // 滚轮转发给画布，保证指针停在面板上时仍能缩放画布
    attachLMSWheelForwarding(host);

    const panel = document.createElement("div");
    panel.className = "lms-panel";
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", $t("panelAria"));
    host.appendChild(panel);

    const state = node.lmstudioState || (node.lmstudioState = { lastParamPreset: "Ignore", showLogPanel: true });

    const controls = new Map();
    const cardRefs = new Map();
    // 由标题栏「参数预设」接管的参数 widget 名：对应字段禁用（Custom / Ignore 时为空集）
    let presetLocked = new Set();
    const throttledDirty = lmsThrottle(() => node.setDirtyCanvas?.(true, true), 140);

    /** 被其它字段门控的开关名（显隐：dependsOn；禁用：disabledWhen.widget） */
    const dependencyGates = new Set();
    LMS_PANEL_LAYOUT.forEach((cardSpec) => {
        cardSpec.fields.forEach((fieldSpec) => {
            if (fieldSpec.dependsOn) dependencyGates.add(fieldSpec.dependsOn);
            if (fieldSpec.disabledWhen?.widget) dependencyGates.add(fieldSpec.disabledWhen.widget);
        });
    });

    LMS_PANEL_LAYOUT.forEach((cardSpec) => {
        const card = document.createElement("section");
        card.className = "lms-card";
        const head = document.createElement("div");
        head.className = "lms-card__head lms-card__head--static";
        head.innerHTML = '<span class="lms-card__icon">' + lmsSvg(cardSpec.icon, 13) + "</span>"
            + '<span class="lms-card__title"></span>';

        const body = document.createElement("div");
        body.className = "lms-card__body";
        // columns ≥ 2 → 棋盘格（字段变为等宽单元格，列数通过 CSS 变量注入）
        const gridMode = Number(cardSpec.columns) > 1;
        // 标记 wide 的字段（如模型名较长的下拉框）单独占一行：
        // 用独立容器承载，避免跨列项打乱棋盘底色的交错序（nth-child 计数不受影响）
        let wideFields = null;
        if (gridMode) {
            wideFields = document.createElement("div");
            wideFields.className = "lms-fields lms-fields--wide";
            body.appendChild(wideFields);
        }
        const fields = document.createElement("div");
        // tiles：等宽多格并排（标签上置居中），列数由字段数决定
        const tileMode = cardSpec.tiles === true;
        fields.className = "lms-fields"
            + (gridMode ? " lms-fields--grid" : "")
            + (tileMode ? " lms-fields--tiles" : "");
        if (gridMode) {
            fields.dataset.cols = String(cardSpec.columns);
            fields.style.setProperty("--lms-grid-cols", String(cardSpec.columns));
        }
        body.appendChild(fields);

        card.appendChild(head);
        card.appendChild(body);
        panel.appendChild(card);

        const cardRef = {
            spec: cardSpec,
            el: card,
            head,
            title: head.querySelector(".lms-card__title"),
        };
        cardRef.setTexts = () => {
            cardRef.title.textContent = $t(cardSpec.titleKey);
        };
        cardRefs.set(cardSpec.id, cardRef);

        // 连续 inline 字段共用的「单行组」容器（遇到非 inline 字段即收尾另起）
        let inlineRow = null;

        cardSpec.fields.forEach((fieldSpec) => {
            const widget = getLMSWidget(node, fieldSpec.name);
            const control = createLMSControl(fieldSpec, widget, {
                onChange: (value, options) => {
                    writeLMSWidget(node, widget, value, options);
                    if (options?.deferDirty) throttledDirty();
                    if (dependencyGates.has(fieldSpec.name)) {
                        applyDependencies();
                        api.resize();
                    }
                },
            });
            controls.set(fieldSpec.name, control);
            // header 字段（如「使用预设」）：挂到卡片标题栏右侧操作区，与模板/恢复/清空按钮同排
            if (fieldSpec.header) {
                let actions = head.querySelector(".lms-card__actions");
                if (!actions) {
                    actions = document.createElement("div");
                    actions.className = "lms-card__actions";
                    head.appendChild(actions);
                }
                actions.appendChild(control.el);
                return;
            }
            // wide 字段进「整行容器」，其余字段进棋盘格容器
            let target = gridMode && fieldSpec.wide && wideFields ? wideFields : fields;
            // inline 字段：连续的若干项合并到同一个「单行组」容器（如 模式/篇幅/格式/语言）
            if (fieldSpec.inline && !gridMode) {
                if (!inlineRow) {
                    inlineRow = document.createElement("div");
                    inlineRow.className = "lms-fields__row";
                    fields.appendChild(inlineRow);
                }
                target = inlineRow;
            } else {
                inlineRow = null;
            }
            target.appendChild(control.el);
        });

        cardRef.setTexts();
    });

    /** 依赖字段显隐 / 禁用（例如批处理相关字段、预设组与提示词输入框的联动） */
    const applyDependencies = () => {
        let changed = false;
        LMS_PANEL_LAYOUT.forEach((cardSpec) => {
            cardSpec.fields.forEach((fieldSpec) => {
                const control = controls.get(fieldSpec.name);
                if (!control) return;

                // ① 显隐门控：依赖的开关为假时隐藏该字段（会改变节点高度）
                if (fieldSpec.dependsOn) {
                    const gate = getLMSWidget(node, fieldSpec.dependsOn);
                    const visible = gate ? gate.value === true : true;
                    if (control.el.hidden === visible) {
                        control.el.hidden = !visible;
                        changed = true;
                    }
                }

                // ② 禁用门控：disabledWhen 声明的开关条件，或被「参数预设」接管（布局不变，仅灰化）
                if (typeof control.setLocked === "function") {
                    let locked = presetLocked.has(fieldSpec.name);
                    if (fieldSpec.disabledWhen) {
                        const gate = getLMSWidget(node, fieldSpec.disabledWhen.widget);
                        const gateOn = gate ? gate.value === true : false;
                        locked = locked || gateOn === Boolean(fieldSpec.disabledWhen.value);
                    }
                    control.setLocked(locked);
                }
            });
        });
        return changed;
    };

    const api = {
        host,
        panel,
        widget: null,
        controls,
        cards: cardRefs,

        /** 参数预设锁定：由标题栏「参数预设」下发（传空集即全部解锁，对应自定义参数） */
        setParamPresetLock(names) {
            presetLocked = new Set(Array.isArray(names) ? names : []);
            applyDependencies();
        },

        /** widget -> 控件：外部逻辑（预设/刷新/加载/语言）改动后回显 */
        sync() {
            const active = document.activeElement;
            LMS_PANEL_LAYOUT.forEach((cardSpec) => {
                const cardRef = cardRefs.get(cardSpec.id);
                cardSpec.fields.forEach((fieldSpec) => {
                    const control = controls.get(fieldSpec.name);
                    const widget = getLMSWidget(node, fieldSpec.name);
                    if (!control) return;
                    if (!widget) {
                        control.setDisabled(true);
                        return;
                    }

                    // 原生 DOM 输入元素保持隐藏（前端可能在交互后重新显示它）
                    hideNativeWidgetElement(widget);

                    // 正在输入的控件不打断用户
                    const isEditing = active && control.el.contains(active)
                        && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
                    if (!isEditing) {
                        if (typeof control.setOptions === "function" && Array.isArray(widget.options?.values)) {
                            control.setOptions(widget.options.values, widget.value);
                        } else {
                            control.setValue(widget.value);
                        }
                    }

                    const linked = isLMSWidgetLinked(node, widget);
                    control.setDisabled(linked, $t("linkedByInput"));
                    refreshControlNote(control, widget, linked);
                });
            });
            applyDependencies();
        },

        /** 语言切换时刷新所有文案 */
        refreshLabels() {
            panel.setAttribute("aria-label", $t("panelAria"));
            cardRefs.forEach((cardRef) => cardRef.setTexts());
            controls.forEach((control) => {
                control.refreshLabels();
                const widget = getLMSWidget(node, control.name);
                refreshControlNote(control, widget, widget ? isLMSWidgetLinked(node, widget) : false);
            });
        },

        /** 字段显隐等变化后重算节点高度（等一帧确保测量到最终布局） */
        resize() {
            window.requestAnimationFrame(() => {
                try {
                    const computed = typeof node.computeSize === "function" ? node.computeSize() : null;
                    if (computed) node.setSize([node.size[0], Math.max(120, Math.round(computed[1]))]);
                    node.setDirtyCanvas?.(true, true);
                } catch (err) {
                    console.error("[LMStudio] panel resize failed:", err);
                }
            });
        },

        dispose() {
            controls.forEach((control) => control.destroy?.());
            controls.clear();
            cardRefs.clear();
            host.remove();
        },
    };

    api.sync();
    // 初始锁定：沿用上次使用的参数预设（配置恢复可能晚于面板创建，故此处再同步一次）
    api.setParamPresetLock(getLMSPresetLockedWidgets(state.lastParamPreset));
    return api;
}

/**
 * 隐藏原生 widget 的 DOM 输入元素。
 * 不同前端版本分别用 `widget.element`（新版 canvas DOM 输入）或 `widget.inputEl` 承载，
 * 只隐藏 canvas 绘制不足以移除这些元素，必须显式隐藏，否则会浮在自绘控件之上造成重影。
 */
function hideNativeWidgetElement(widget) {
    const el = widget?.element || widget?.inputEl;
    if (!el || !el.style) return;
    el.disabled = true;
    if (typeof el.setAttribute === "function") el.setAttribute("tabindex", "-1");
    if (el.style.display !== "none") el.style.display = "none";
    el.style.pointerEvents = "none";
}

/** 当前画布缩放比例（用于把屏幕像素换算回图坐标） */
function lmsCanvasScale() {
    const scale = app?.canvas?.ds?.scale;
    return typeof scale === "number" && scale > 0 ? scale : 1;
}

/** 元素最近一次可用高度（图坐标）。画布缩放过小时 DOM widget 会被隐藏，
 *  此时若回退到默认值，节点布局会错位且不会自动恢复。 */
const _lmsLastHeights = new WeakMap();

/**
 * 测量元素的可见高度（图坐标）。
 *
 * 必须使用布局尺寸：DOM widget 会被画布 transform 缩放，getBoundingClientRect()
 * 得到的是屏幕像素（= 布局高度 × 画布缩放），若直接当作图坐标返回，computeSize
 * 会随缩放漂移，并在放大后被固化成过大的节点高度，缩小后表现为内容位移 + 大片空白。
 * 仅当布局尺寸不可用时才回退到屏幕测量并换算回图坐标。
 * 注意：不能测量 DOM widget 的容器元素——它的高度由节点布局按上一帧的
 * computedHeight 反向决定，会形成自引用而使高度无法收缩。
 */
function measureElementHeight(el, fallback) {
    if (!el) return fallback ?? 28;
    const base = fallback ?? 28;
    const layout = el.offsetHeight || el.clientHeight || 0;
    if (layout > 0) {
        _lmsLastHeights.set(el, layout);
        return Math.max(base, Math.round(layout));
    }
    const cached = _lmsLastHeights.get(el);
    if (cached > 0) return Math.max(base, Math.round(cached));
    const rect = typeof el.getBoundingClientRect === "function" ? el.getBoundingClientRect() : null;
    const screenHeight = rect && rect.height ? rect.height / lmsCanvasScale() : 0;
    return Math.max(base, Math.round(screenHeight));
}

/**
 * 面板是真实 DOM，右键会弹出浏览器菜单。
 * 这里在面板上拦截右键，转交画布弹出与「在节点上右键」一致的节点菜单
 * （刷新节点 / 转换为子工作流 / 属性 / 折叠 / 复制 / 删除 / Mark as …）。
 */
function attachLMSNodeContextMenu(el, node) {
    el.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openLMSNodeContextMenu(node, event);
    });
}

/**
 * 面板是覆盖在画布之上的真实 DOM，滚轮事件到不了 litegraph 画布，
 * 于是指针停在面板上时画布不缩放。这里把滚轮转发给画布（与官方 DOM widget 同一做法）：
 * 日志框等内部可滚动区域优先原生滚动，滚到尽头后才交给画布；
 * 提示词输入框是例外 —— 它的滚轮只用来翻页，滚到顶/底也不交还画布，免得改长文本时误缩放；
 * Ctrl/Cmd + 滚轮（触控板捏合）一律按缩放手势转发。
 */
function attachLMSWheelForwarding(el) {
    el.addEventListener("wheel", (event) => {
        const canvasEl = app?.canvas?.canvas;
        if (!canvasEl) return;
        const zoomGesture = event.ctrlKey || event.metaKey;
        if (!zoomGesture && lmsFindScrollable(event)) return;

        event.preventDefault();
        event.stopPropagation();
        canvasEl.dispatchEvent(new WheelEvent("wheel", {
            clientX: event.clientX,
            clientY: event.clientY,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaMode: event.deltaMode,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            cancelable: true,
        }));
    }, { passive: false });
}

/** 滚轮落点下「这次滚动归它自己」的容器（返回它就表示不转发给画布），没有则 null。
 *  提示词输入框无条件归它：只翻页，滚到顶或底也不交还画布去缩放；
 *  其余可滚动容器（日志框等）要还能继续滚、且没到尽头，才归它 */
function lmsFindScrollable(event) {
    let el = event.target instanceof Element ? event.target : null;
    while (el && el !== document.body) {
        if (el.matches(".lms-textarea")) return el;
        const overflowY = getComputedStyle(el).overflowY;
        const scrollable = (overflowY === "auto" || overflowY === "scroll")
            && el.scrollHeight > el.clientHeight + 1;
        if (scrollable) {
            const atTop = event.deltaY < 0 && el.scrollTop <= 0;
            const atEnd = event.deltaY > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            if (!atTop && !atEnd) return el;
        }
        el = el.parentElement;
    }
    return null;
}

/** 打开指定节点的原生右键菜单（等价于在画布上对该节点右键） */
function openLMSNodeContextMenu(node, event) {
    const canvas = app?.canvas;
    if (!canvas || !node) return;

    // 事件来自面板而非画布：先记下屏幕坐标（菜单定位与坐标换算都以它为准），
    // 再让画布补齐 canvasX/canvasY 等内部字段，最后同步菜单读取的鼠标图坐标。
    const clientX = event.clientX;
    const clientY = event.clientY;
    try {
        if (typeof canvas.adjustMouseEvent === "function") canvas.adjustMouseEvent(event);
        const rect = canvas.canvas?.getBoundingClientRect?.();
        if (rect) {
            const canvasX = clientX - rect.left;
            const canvasY = clientY - rect.top;
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
        // 坐标同步失败不阻断菜单，仅可能位置略有偏差
    }

    if (typeof canvas.processContextMenu === "function") {
        canvas.processContextMenu(node, event);
        return;
    }

    // 退化路径：交给画布自身的 contextmenu 监听处理
    const canvasEl = canvas.canvas;
    if (!canvasEl) return;
    canvasEl.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 2,
        buttons: 2,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
    }));
}

/** 隐藏面板接管的所有原生 widget（保留序列化与后端提交） */
function hideLMSParamWidgets(node) {
    LMS_PANEL_MANAGED_WIDGETS.forEach((name) => {
        const widget = getLMSWidget(node, name);
        if (!widget) return;
        widget.hidden = true;
        if (widget.options && typeof widget.options === "object") widget.options.hidden = true;
        widget.computeSize = () => [0, -4];
        hideNativeWidgetElement(widget);
    });
}

/** 控件上方状态提示：仅连线接管时显示 */
function refreshControlNote(control, widget, linked) {
    control.applyNote(linked ? $t("linkedByInput") : "");
}

function showToast(message, type = "info") {
    const toast = document.createElement("div");
    const accent = type === "success"
        ? LMS_TOKENS.color.success
        : type === "error"
            ? LMS_TOKENS.color.error
            : type === "warning"
                ? LMS_TOKENS.color.warn
                : LMS_TOKENS.color.primary;
    toast.style.cssText = `
        position: fixed;
        right: 24px;
        bottom: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        background: ${LMS_TOKENS.color.glassDeep};
        backdrop-filter: ${LMS_TOKENS.blur.panel};
        -webkit-backdrop-filter: ${LMS_TOKENS.blur.panel};
        color: ${LMS_TOKENS.color.textBright};
        font-family: ${LMS_TOKENS.font};
        padding: 14px 24px;
        border: 1px solid ${accent}66;
        border-radius: ${LMS_TOKENS.radius.lg};
        font-size: 13.5px;
        font-weight: 500;
        letter-spacing: 0.01em;
        z-index: 10003;
        box-shadow: 0 20px 48px rgba(2, 6, 23, 0.55), 0 0 0 1px ${accent}22;
        animation: lms-toast-in 0.3s ${LMS_TOKENS.motion.easing};
        min-width: 200px;
        max-width: min(560px, 88vw);
    `;
    const accentDot = document.createElement("span");
    accentDot.style.cssText = "flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:"
        + accent + ";box-shadow:0 0 10px " + accent + "99;";
    const textEl = document.createElement("span");
    textEl.textContent = message;
    toast.appendChild(accentDot);
    toast.appendChild(textEl);

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "lms-toast-in 0.3s " + LMS_TOKENS.motion.easing + " reverse";
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

function showConfirm(message, onConfirm, onCancel, cancelText = $t('cancel')) {
    const overlay = document.createElement("div");
    overlay.className = "lms-confirm-overlay";
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(2, 6, 23, 0.62);
        backdrop-filter: blur(10px) saturate(1.25);
        -webkit-backdrop-filter: blur(10px) saturate(1.25);
        z-index: 10004;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const dialog = document.createElement("div");
    dialog.style.cssText = `
        position: relative;
        background: ${LMS_TOKENS.color.glassDeep};
        border: 1px solid ${LMS_TOKENS.color.borderHi};
        border-radius: ${LMS_TOKENS.radius.lg};
        /* 上内边距比左右多 8px：右上角要放 28px 的关闭按钮，留出无重叠的排版区 */
        padding: 34px 32px 26px;
        max-width: 420px;
        text-align: center;
        font-family: ${LMS_TOKENS.font};
        box-shadow: ${LMS_TOKENS.shadow.panel};
        backdrop-filter: ${LMS_TOKENS.blur.panel};
        -webkit-backdrop-filter: ${LMS_TOKENS.blur.panel};
        animation: fadeScaleDialog 0.2s ${LMS_TOKENS.motion.easing};
    `;

    /* 关闭 = 单纯收掉确认框，界面停在原处：既不保存也不回退，
       所以这里不调 onCancel —— 那两条都会动内容，只有「放弃」按钮才走回退 */
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", $t('close'));
    closeBtn.innerHTML = lmsSvg('close', 13);
    closeBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        color: #FFFFFF;
        background: ${LMS_TOKENS.action.danger};
        border: none;
        border-radius: ${LMS_TOKENS.radius.md};
        cursor: pointer;
        transition: transform ${LMS_TOKENS.motion.base} ${LMS_TOKENS.motion.easing},
                    background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
    `;
    closeBtn.onmouseover = () => {
        closeBtn.style.background = LMS_TOKENS.action.dangerHover;
        closeBtn.style.transform = "rotate(90deg)";
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.background = LMS_TOKENS.action.danger;
        closeBtn.style.transform = "rotate(0deg)";
    };
    closeBtn.onclick = () => {
        overlay.remove();
    };

    const messageEl = document.createElement("p");
    messageEl.style.cssText = `
        color: ${LMS_TOKENS.color.text};
        font-size: ${LMS_TOKENS.type.title};
        line-height: ${LMS_TOKENS.type.lhBase};
        margin: 0 0 24px 0;
    `;
    messageEl.textContent = message;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: center;
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = cancelText;
    cancelBtn.style.cssText = `
        padding: 10px 22px;
        font-family: inherit;
        background: transparent;
        color: ${LMS_TOKENS.color.text};
        border: 1px solid ${LMS_TOKENS.color.border};
        border-radius: ${LMS_TOKENS.radius.md};
        cursor: pointer;
        font-size: ${LMS_TOKENS.type.body};
        font-weight: 500;
        transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                    border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                    color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
    `;
    cancelBtn.onmouseover = () => {
        cancelBtn.style.background = LMS_TOKENS.color.glassSoft;
        cancelBtn.style.borderColor = LMS_TOKENS.color.borderHi;
        cancelBtn.style.color = LMS_TOKENS.color.textBright;
    };
    cancelBtn.onmouseout = () => {
        cancelBtn.style.background = "transparent";
        cancelBtn.style.borderColor = LMS_TOKENS.color.border;
        cancelBtn.style.color = LMS_TOKENS.color.text;
    };

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.textContent = $t('confirm');
    confirmBtn.style.cssText = `
        padding: 10px 22px;
        font-family: inherit;
        background: ${LMS_TOKENS.action.primary};
        color: #FFFFFF;
        border: none;
        border-radius: ${LMS_TOKENS.radius.md};
        cursor: pointer;
        font-size: ${LMS_TOKENS.type.body};
        font-weight: 600;
        box-shadow: 0 3px 10px rgba(37, 99, 235, 0.28);
        transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                    box-shadow ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
    `;
    confirmBtn.onmouseover = () => {
        confirmBtn.style.background = LMS_TOKENS.action.primaryHover;
        confirmBtn.style.boxShadow = "0 5px 14px rgba(59, 130, 246, 0.34)";
    };
    confirmBtn.onmouseout = () => {
        confirmBtn.style.background = LMS_TOKENS.action.primary;
        confirmBtn.style.boxShadow = "0 3px 10px rgba(37, 99, 235, 0.28)";
    };

    cancelBtn.onclick = () => {
        overlay.remove();
        if (onCancel) onCancel();
    };

    confirmBtn.onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    dialog.appendChild(closeBtn);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

const LMS_IMAGE_SLOT_MAX = 12;
const lmsImageSlotName = (index) => (index === 1 ? "image" : `image_${index}`);
const lmsIsImageSlotName = (name) => /^image(?:_\d+)?$/i.test(String(name ?? ""));

function lmsPlanImageSlots(slots, max = LMS_IMAGE_SLOT_MAX) {
    let lastLinked = -1;
    slots.forEach((slot, index) => {
        if (slot?.linked) lastLinked = index;
    });
    const want = Math.max(1, Math.min(max, lastLinked + 2));
    return {
        want,
        remove: Math.max(0, slots.length - want),
        add: Math.max(0, want - slots.length),
    };
}

function lmsSyncImageSlots(node) {
    if (!Array.isArray(node?.inputs) || !node.inputs.length) return false;
    const imageSlots = node.inputs.filter((input) => lmsIsImageSlotName(input?.name));
    if (!imageSlots.length) return false;
    const { want, remove } = lmsPlanImageSlots(
        imageSlots.map((input) => ({ linked: input.link != null }))
    );
    let changed = false;
    for (let n = 0; n < remove; n++) {
        for (let index = node.inputs.length - 1; index >= 0; index--) {
            const input = node.inputs[index];
            if (!lmsIsImageSlotName(input?.name) || input.link != null) continue;
            node.removeInput?.(index);
            changed = true;
            break;
        }
    }
    const current = node.inputs.filter((input) => lmsIsImageSlotName(input?.name)).length;
    for (let index = current; index < want; index++) {
        node.addInput?.(lmsImageSlotName(index + 1), "IMAGE", { optional: true });
        changed = true;
    }
    return changed;
}

function lmsSyncImageSlotsFor(node) {
    if (!node || node._lmsImageSlotSyncing) return;
    node._lmsImageSlotSyncing = true;
    try {
        if (!lmsSyncImageSlots(node)) return;
        applyNode(node);
        node.setDirtyCanvas?.(true, true);
    } finally {
        node._lmsImageSlotSyncing = false;
    }
}

app.registerExtension({
    name: LMSTUDIO_EXT_ID,
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "LMStudioNode") {
            /**
             * 宽度下限钳制：参数面板的棋盘格双列排版在窄宽度下会被压到溢出，
             * 故把节点宽度钉在 LMS_PANEL_MIN_WIDTH。computeSize 已提供缩放下限，
             * 这里兜住键盘微调、脚本改尺寸与旧工作流等绕过缩放的路径。
             * setSize 会再次触发 onResize，但那时条件已不成立，无递归风险。
             */
            nodeType.prototype.onResize = function(size) {
                if (size[0] < LMS_PANEL_MIN_WIDTH) {
                    this.setSize([LMS_PANEL_MIN_WIDTH, size[1]]);
                }
                /* 高度钉不住常数：面板实测高度会随字段显隐、日志栏卡片变化（100% 截图里
                   是 881，含 LiteGraph 标题栏），所以只能按 computeSize 重算。
                   面板是盖在节点上的真实 DOM —— 拖矮会在底部露出节点底色，拖高就是空白，
                   两种都不是想要的形态。api.resize() 最终走 setSize，
                   而 LiteGraph 的 setSize 遇到相同尺寸直接返回，因此不会递归。 */
                this._lmsPanel?.resize();
            };

            /**
             * 自绘参数面板：隐藏全部原生 widget，由 DOM 面板接管显示与交互。
             * 原生 widget 仍保留在 node.widgets 中，序列化与后端提交完全不变。
             */
            nodeType.prototype._createParamPanel = function() {
                if (this._lmsPanel) return this._lmsPanel;

                hideLMSParamWidgets(this);

                const api = createLMSPanel(this);
                const host = api.host;
                const panelEl = api.panel;

                const domWidget = this.addDOMWidget("lmstudio_param_panel", "div", host, {});
                domWidget.serialize = false;
                // 以面板自身的可见高度参与布局，字段显隐后才能正确收缩
                domWidget.computeSize = function(width) {
                    // 最小宽度由 LMS_PANEL_MIN_WIDTH 决定：ComfyUI 以 computeSize 作为
                    // 节点缩放下限，因此用户无法把节点拖到排版会被压缩的宽度
                    const minWidth = Math.max(LMS_PANEL_MIN_WIDTH, width || LMS_PANEL_MIN_WIDTH);
                    return [minWidth, measureElementHeight(panelEl) + 2];
                };

                api.widget = domWidget;
                this._lmsPanel = api;
                this._panelControls = api.controls;

                this._attachCardActions(api);

                setTimeout(() => {
                    if (!this.graph) return;
                    // 老工作流里可能存着窄于下限的节点尺寸：挂载时先抬回最小宽度
                    if (this.size[0] < LMS_PANEL_MIN_WIDTH) {
                        this.setSize([LMS_PANEL_MIN_WIDTH, this.size[1]]);
                    }
                    api.sync();
                    api.resize();
                }, 0);
                // 初次布局的两次校正：字体/样式就绪后再量一次高度
                setTimeout(() => {
                    if (!this.graph) return;
                    api.resize();
                }, 160);
                setTimeout(() => {
                    if (!this.graph) return;
                    api.resize();
                }, 460);

                return api;
            };

            /** 外部逻辑改动 widget 值后刷新面板（预设应用 / 模型刷新 / 工作流加载 / 连线变化） */
            nodeType.prototype._syncParamPanel = function() {
                // 先校正残留的选项值（老工作流可能带着已删除的选项），再回显面板
                this._validatePresetPrompt();
                this._lmsPanel?.sync();
            };

            /** 把工具栏创建的操作按钮/下拉框移入对应卡片标题栏（靠右）：prompt / inference 等 */
            nodeType.prototype._attachCardActions = function(panel) {
                const groups = this._cardActionButtons;
                if (!panel || !groups) return;
                groups.forEach((buttons, cardId) => {
                    if (!Array.isArray(buttons) || buttons.length === 0) return;
                    const head = panel.cards?.get(cardId)?.head;
                    if (!head) return;

                    let actions = head.querySelector(".lms-card__actions");
                    if (!actions) {
                        actions = document.createElement("div");
                        actions.className = "lms-card__actions";
                        head.appendChild(actions);
                    }
                    // 按钮组排在预设开关左侧：统一插到已有的标题栏字段（如「使用预设」）之前
                    const anchor = actions.querySelector(".lms-field");
                    buttons.forEach((el) => {
                        if (!el) return;
                        if (anchor) actions.insertBefore(el, anchor);
                        else actions.appendChild(el);
                    });
                });

                // 刷新模型按钮：插到「模型」下拉框左侧（推理参数卡片第一行）
                const refreshEl = this._refreshModelButtonEl;
                const modelControl = panel.controls?.get("model")?.el
                    ?.querySelector(".lms-control");
                if (refreshEl && modelControl) {
                    modelControl.insertBefore(refreshEl, modelControl.firstChild);
                }

                // 面板挂到画布之前测不到文本宽度，等布局就绪后再按最长文案测一次
                window.setTimeout(() => {
                    if (!this.graph) return;
                    groups.forEach((_buttons, cardId) => {
                        panel.cards?.get(cardId)?.head?.querySelectorAll("select")
                            ?.forEach((sel) => fitLMSSelectWidth(sel));
                    });
                    // 面板主体里的模型下拉框同样按最长文案重测一次
                    modelControl?.querySelectorAll("select")
                        ?.forEach((sel) => fitLMSSelectWidth(sel));
                }, 220);
            };

            nodeType.prototype._disposeParamPanel = function() {
                if (!this._lmsPanel) return;
                this._lmsPanel.dispose();
                this._lmsPanel = null;
                this._panelControls = null;
            };

            /** 推理日志：与参数面板同族的玻璃卡片（行为与输出内容保持原样） */
            nodeType.prototype._createLogPanel = function() {
                const outer = document.createElement("div");
                outer.className = "lms-panel-host";
                // 日志卡片同样右键弹节点菜单，避免出现浏览器菜单
                attachLMSNodeContextMenu(outer, this);
                attachLMSWheelForwarding(outer);

                const panel = document.createElement("div");
                panel.className = "lms-panel";

                const card = document.createElement("section");
                card.className = "lms-card";

                const head = document.createElement("div");
                head.className = "lms-card__head lms-card__head--static";

                const icon = document.createElement("span");
                icon.className = "lms-card__icon";
                icon.innerHTML = lmsSvg("terminal", 13);

                const title = document.createElement("span");
                title.className = "lms-card__title";

                const clearBtn = document.createElement("button");
                clearBtn.type = "button";
                clearBtn.className = "lms-mini-btn";
                clearBtn.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this._clearLogPanel();
                });
                clearBtn.addEventListener("pointerdown", (event) => event.stopPropagation());

                head.appendChild(icon);
                head.appendChild(title);
                head.appendChild(clearBtn);

                const fields = document.createElement("div");
                fields.className = "lms-fields";

                const textEl = document.createElement("div");
                textEl.className = "lms-log__text";
                textEl.setAttribute("role", "log");
                textEl.setAttribute("aria-live", "polite");
                fields.appendChild(textEl);

                card.appendChild(head);
                card.appendChild(fields);
                panel.appendChild(card);
                outer.appendChild(panel);

                const refreshLabels = () => {
                    title.textContent = $t("cardLog");
                    clearBtn.textContent = $t("clearLog");
                    clearBtn.setAttribute("aria-label", $t("clearLog"));
                    if (textEl.dataset.empty !== "false") this._clearLogPanel();
                };

                const domWidget = this.addDOMWidget("lmstudio_log_panel", "div", outer, {});
                domWidget.serialize = false;
                domWidget.computeSize = (width) => {
                    const minWidth = Math.max(LMS_PANEL_MIN_WIDTH, width || LMS_PANEL_MIN_WIDTH);
                    // 配置关闭日志栏时不占位
                    if (outer.style.display === "none") return [minWidth, 0];
                    return [minWidth, measureElementHeight(card, 60) + 2];
                };

                this._logPanelHost = outer;
                this._logTextEl = textEl;
                this._refreshLogPanelLabels = refreshLabels;

                refreshLabels();

                this._loadLMStudioConfig();
            };

            nodeType.prototype._clearLogPanel = function() {
                // 清屏后不再按语言回填旧日志
                this._logInfoI18n = null;
                const textEl = this._logTextEl;
                if (!textEl) return;
                textEl.textContent = $t("noLogYet");
                textEl.dataset.empty = "true";
            };
            
            nodeType.prototype._loadLMStudioConfig = async function() {
                try {
                    const response = await fetch("/zhihui/lmstudio/config");
                    if (response.ok) {
                        const config = await response.json();
                        const showLog = config.show_log_panel !== false;
                        this.lmstudioState.showLogPanel = showLog;
                        if (this._logPanelHost) {
                            this._logPanelHost.style.display = showLog ? "block" : "none";
                        }
                        // 日志栏显隐会改变节点高度
                        this._lmsPanel?.resize();
                        
                        const savedPreset = config.preset || "Ignore";
                        const presetName = LMS_PARAM_PRESETS[savedPreset] ? savedPreset : "Ignore";
                        this.lmstudioState.lastParamPreset = presetName;
                        if (this._presetSelect) {
                            this._presetSelect.value = presetName;
                        }
                        // 恢复上次的参数预设时，同步锁定被它接管的参数
                        this._lmsPanel?.setParamPresetLock(getLMSPresetLockedWidgets(presetName));
                    }
                } catch (e) {
                    this.lmstudioState.showLogPanel = true;
                }
            };
            
            nodeType.prototype._updateLogPanel = function(logText) {
                if (!this.lmstudioState?.showLogPanel) return;
                const textEl = this._logTextEl;
                if (!textEl) return;
                const text = (logText ?? "").trim();
                if (!text) {
                    this._clearLogPanel();
                    return;
                }
                textEl.textContent = text;
                textEl.dataset.empty = "false";
                textEl.scrollTop = textEl.scrollHeight;
            };
            
            /** 构建节点内操作控件（提示词操作按钮 / 预设下拉框 / 刷新模型），随后挂到各卡片标题栏 */
            nodeType.prototype._createNodeActions = function() {
                const getSystemPromptWidget = () => this.widgets?.find(w => w.name === "system_prompt");
                const getPromptInput = () => getSystemPromptWidget()?.inputEl || null;
                const getPromptControl = () => this._panelControls?.get("system_prompt") || null;

                // 面板优先：原生 widget 已隐藏，其 inputEl 不再可靠
                const readPromptValue = () => {
                    const control = getPromptControl();
                    if (control) return control.getValue();
                    const inputEl = getPromptInput();
                    if (inputEl) return inputEl.value;
                    return getSystemPromptWidget()?.value || "";
                };

                const writePromptValue = (value) => {
                    const widget = getSystemPromptWidget();
                    const inputEl = getPromptInput();
                    const control = getPromptControl();
                    if (control) control.setValue(value);
                    if (widget) widget.value = value;
                    if (inputEl) {
                        inputEl.value = value;
                        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    this.setDirtyCanvas(true, true);
                };
                
                const presetWrapper = document.createElement("div");
                presetWrapper.className = "lms-preset";
                
                const presetSelect = document.createElement("select");
                presetSelect.className = "lms-preset-select";
                presetSelect.setAttribute("aria-label", $t('paramPreset'));
                presetSelect.addEventListener("change", () => {
                    const presetName = LMS_PARAM_PRESETS[presetSelect.value] ? presetSelect.value : "Ignore";
                    if (this.lmstudioState) {
                        this.lmstudioState.lastParamPreset = presetName;
                    }
                    // 预设接管的参数改为只读（「默认参数 / 自定义参数」不接管任何参数，即全部可调）
                    this._lmsPanel?.setParamPresetLock(getLMSPresetLockedWidgets(presetName));
                    const applied = applyLMSParamPresetToNode(this, presetName);
                    if (applied > 0) {
                        this._syncParamPanel?.();
                        this.setDirtyCanvas(true, true);
                    }
                    saveLMSPresetConfig(presetName);
                });
                presetSelect.addEventListener("pointerdown", (e) => e.stopPropagation());
                attachLMSGlassTooltip(presetSelect, () => describeLMSParamPreset(presetSelect.value));
                presetWrapper.appendChild(presetSelect);
                // 展开态（驱动箭头翻转与外框高亮）
                attachLMSSelectOpenState(presetSelect, presetWrapper);
                
                this._presetSelect = presetSelect;
                this._syncPresetSelectOptions();
                
                const restoreButton = createLMSIconButton({
                    icon: "restore",
                    size: "sm",
                    variant: "restore",
                    label: $t('restoreContent'),
                    tooltip: () => $t('restoreTooltip'),
                    onClick: (button) => {
                        if (this._lastClearedContent === undefined) {
                            showToast($t('noContentToRestore'), "warning");
                            return false;
                        }
                        writePromptValue(this._lastClearedContent);
                        this._lastClearedContent = undefined;
                        button.setState("success", 1200);
                        showToast($t('restoreContent'), "success");
                        return true;
                    },
                });
                
                const clearButton = createLMSIconButton({
                    icon: "clear",
                    size: "sm",
                    variant: "clear",
                    label: $t('clearContent'),
                    tooltip: () => $t('clearTooltip'),
                    onClick: (button) => {
                        const current = readPromptValue();
                        if (!current.trim()) {
                            showToast($t('noContentToClear'), "warning");
                            return false;
                        }
                        this._lastClearedContent = current;
                        writePromptValue("");
                        button.setState("success", 1200);
                        showToast($t('clearContent'), "success");
                        return true;
                    },
                });
                
                const templateButton = createLMSIconButton({
                    icon: "template",
                    size: "sm",
                    variant: "template",
                    label: $t('template'),
                    tooltip: () => $t('templateTooltip'),
                    onClick: () => {
                        // 已打开则再次点击关闭（面板没有关闭按钮）
                        if (_closeTemplateSelector) {
                            _closeTemplateSelector();
                            return;
                        }
                        // 点按钮时先触发了外部点击关闭，这次点击不再重新打开
                        if (Date.now() - _templateSelectorClosedAt < 300) return;
                        const rect = templateButton.el.getBoundingClientRect();
                        showTemplateSelector(this, rect);
                    },
                });
                
                const refreshButton = createLMSIconButton({
                    icon: "refresh",
                    label: $t('refreshModels'),
                    tooltip: () => (refreshButton.el.classList.contains("lms-icon-btn--loading")
                        ? $t('refreshing')
                        : $t('refreshModels')),
                    onClick: async (button) => {
                        button.setState("loading");
                        const ok = await this._refreshModelsList();
                        button.setState(ok ? "success" : "error", 1300);
                    },
                });
                
                // 操作按钮与参数预设下拉框改为挂在对应卡片标题栏右侧（节点创建时面板尚未建立，先暂存）
                this._cardActionButtons = new Map([
                    ["prompt", [templateButton.el, restoreButton.el, clearButton.el]],
                    ["inference", [presetWrapper]],
                ]);
                // 刷新模型按钮挂在「模型」下拉框左侧（见 _attachCardActions）
                this._refreshModelButtonEl = refreshButton.el;

                // 设置按钮已改为节点标题栏上的自绘图标（见 onDrawForeground / onMouseDown）
                this._templateBtn = templateButton.el;
                this._clearBtn = clearButton.el;
                this._restoreBtn = restoreButton.el;
            };
            
            nodeType.prototype._hideEndpointWidget = function() {
                const widget = this.widgets?.find(w => w.name === "endpoint");
                if (!widget) return;
                widget.hidden = true;
                if (widget.options && typeof widget.options === "object") widget.options.hidden = true;
                // 服务地址由设置弹窗管理，节点上不再显示原生输入元素
                hideNativeWidgetElement(widget);
                this.setDirtyCanvas(true, true);
            };
            
            /** 下拉值不在选项列表中时（选项被删除 / 预设文件变动）回落到第一项 */
            const validateSelectWidget = (name) => {
                const widget = this.widgets?.find(w => w.name === name);
                const values = widget?.options?.values;
                if (!widget || !Array.isArray(values) || values.length === 0) return false;
                if (values.includes(widget.value)) return false;
                widget.value = values[0];
                return true;
            };

            /**
             * 语言：老工作流带进来的「Ignore / 不指定」会被前端重新塞进选项列表，
             * 因此这里以代码里的合法列表为准重建选项列表，并把取值校正到第一项。
             */
            const validateOutputLanguage = () => {
                const widget = this.widgets?.find(w => w.name === "output_language");
                if (!widget) return false;
                let changed = false;
                const values = Array.isArray(widget.options?.values) ? widget.options.values : null;
                if (values && (values.length !== LMS_OUTPUT_LANGUAGES.length
                    || LMS_OUTPUT_LANGUAGES.some((lang) => !values.includes(lang)))) {
                    widget.options.values = [...LMS_OUTPUT_LANGUAGES];
                    changed = true;
                }
                if (!LMS_OUTPUT_LANGUAGES.includes(widget.value)) {
                    widget.value = LMS_OUTPUT_LANGUAGES[0];
                    changed = true;
                }
                return changed;
            };

            /**
             * 预设提示词：已不再提供「不使用预设」（Ignore）选项，
             * 老工作流带进来的该值同样会被前端塞回选项列表，需要连同取值一起清掉。
             */
            const stripLegacyIgnorePreset = () => {
                const widget = this.widgets?.find(w => w.name === "preset_prompt");
                if (!widget) return false;
                let changed = false;
                const values = Array.isArray(widget.options?.values) ? widget.options.values : null;
                if (values && values.includes("Ignore")) {
                    widget.options.values = values.filter((value) => value !== "Ignore");
                    changed = true;
                }
                if (widget.value === "Ignore") {
                    widget.value = widget.options?.values?.[0] ?? widget.value;
                    changed = true;
                }
                return changed;
            };

            nodeType.prototype._validatePresetPrompt = function() {
                // preset_prompt：预设文件键名变动 / 已删除的 Ignore；output_language：已删除「不指定」
                const changed = [
                    stripLegacyIgnorePreset(),
                    validateSelectWidget("preset_prompt"),
                    validateOutputLanguage(),
                ].some(Boolean);
                if (changed) this.setDirtyCanvas(true, true);
            };
            
            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function() {
                const result = onConfigure ? onConfigure.apply(this, arguments) : undefined;
                this._validatePresetPrompt();
                // 工作流加载完成后回显面板（此时 widget 值才全部就绪）
                window.setTimeout(() => {
                    lmsSyncImageSlotsFor(this);
                    this._syncParamPanel?.();
                    this._lmsPanel?.resize();
                }, 0);
                return result;
            };

            // 连线变化（widget 转为输入端口或被断开）后同步面板禁用态
            const onConnectionsChange = nodeType.prototype.onConnectionsChange;
            nodeType.prototype.onConnectionsChange = function() {
                const result = onConnectionsChange ? onConnectionsChange.apply(this, arguments) : undefined;
                window.setTimeout(() => {
                    lmsSyncImageSlotsFor(this);
                    this._syncParamPanel?.();
                    this._lmsPanel?.resize();
                }, 0);
                return result;
            };
            
            nodeType.prototype._syncPresetSelectOptions = function() {
                const select = this._presetSelect;
                if (!select) return;
                const current = select.value || this.lmstudioState?.lastParamPreset || "Ignore";
                select.textContent = "";
                Object.entries(LMS_PARAM_PRESETS).forEach(([name, preset]) => {
                    const option = document.createElement("option");
                    option.value = name;
                    option.textContent = $t(preset.labelKey);
                    select.appendChild(option);
                });
                select.value = LMS_PARAM_PRESETS[current] ? current : "Ignore";
                // 尺寸随最长预设文案自适应（英文 “Creative Mode” 等较长）
                fitLMSSelectWidth(select);
            };
            
            nodeType.prototype._disposeNodeActions = function() {
                this._cardActionButtons = null;
                this._refreshModelButtonEl = null;
                this._templateBtn = null;
                this._clearBtn = null;
                this._restoreBtn = null;
                this._presetSelect = null;
            };
            
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function() {
                const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                this._lmstudioHelp = false;
                this._lmstudioHelpLocale = getLocale();
                
                if (!this.lmstudioState) {
                    this.lmstudioState = {
                        lastParamPreset: "Ignore",
                        showLogPanel: true
                    };
                }
                
                this._createNodeActions();
                this._createParamPanel();
                lmsSyncImageSlotsFor(this);
                

                
                this._createLogPanel();
                
                this._hideEndpointWidget();
                
                return result;
            };
            
            nodeType.prototype._fetchModelsFromServer = async function(endpoint) {
                try {
                    const response = await fetch("/zhihui/lmstudio/refresh_models", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ endpoint })
                    });
                    if (!response.ok) return [];
                    const data = await response.json();
                    return data.models || [];
                } catch (e) {
                    return [];
                }
            };
            
            nodeType.prototype._fetchModelsFromEndpoint = async function(base) {
                try {
                    const response = await fetch(base + "/v1/models");
                    if (response.ok) {
                        const data = await response.json();
                        const models = data.data?.map(m => m.id) || [];
                        if (models.length > 0) return models;
                    }
                } catch (e) {
                }
                
                try {
                    const response = await fetch(base + "/api/v1/models");
                    if (response.ok) {
                        const data = await response.json();
                        return data.models?.map(m => m.key) || [];
                    }
                } catch (e) {
                    return [];
                }
                
                return [];
            };
            
            nodeType.prototype._refreshModelsList = async function() {
                const endpointWidget = this.widgets?.find(w => w.name === "endpoint");
                const modelWidget = this.widgets?.find(w => w.name === "model");
                
                if (!endpointWidget || !modelWidget) {
                    showToast($t('refreshModelsFailed'), "error");
                    return false;
                }
                
                const endpoint = endpointWidget.value || "http://localhost:1234";
                const base = endpoint.replace(/\/+$/, "").replace(/\/v1$/, "");
                
                let models = await this._fetchModelsFromServer(endpoint);
                
                if (models.length === 0) {
                    models = await this._fetchModelsFromEndpoint(base);
                }
                
                if (models.length > 0) {
                    modelWidget.options.values = models;
                    if (!models.includes(modelWidget.value)) {
                        modelWidget.value = models[0];
                    }
                    this._syncParamPanel?.();
                    showToast($t('refreshModelsSuccess'), "success");
                    return true;
                }

                // 写入与后端一致的英文标识，显示文案由面板按语言本地化
                modelWidget.options.values = [LMS_NO_MODELS_PLACEHOLDER];
                modelWidget.value = LMS_NO_MODELS_PLACEHOLDER;
                this._syncParamPanel?.();
                showToast($t('refreshModelsFailed'), "error");
                return false;
            };
            
            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function(message) {
                onExecuted?.apply(this, arguments);

                // 后端同时下发中英两版：存起来，按当前界面语言渲染
                const pair = message?.log_info_i18n?.[0];
                if (pair && typeof pair === "object") {
                    this._logInfoI18n = pair;
                    const text = pickLMSLogText(pair);
                    if (text.trim()) this._updateLogPanel(text);
                    return;
                }

                if (message?.log_info && this._logPanelHost) {
                    const logText = message.log_info[0];
                    if (logText && logText.trim()) {
                        this._updateLogPanel(logText);
                    }
                }
            };

            const iconSize = 24;
            const iconMargin = 4;
            const iconGap = 4;
            let helpElement = null;
            let currentHelpLocale = null;

            // 沿用原先工具条里的 Feather 齿轮图标数据（中心孔 + 轮齿路径），24 视窗
            const _lmsGearPath = (() => {
                const path = new Path2D();
                path.arc(12, 12, 3, 0, Math.PI * 2);
                const bodyD = (LMS_ICONS.settings.match(/<path d="([^"]+)"/) || [])[1];
                if (bodyD) path.addPath(new Path2D(bodyD));
                return path;
            })();

            /** 设置图标：原先的 Feather 齿轮（细描边轮廓） */
            const drawTitleIconGear = (ctx, active) => {
                const color = active ? NODE_TITLE_GLYPH.active : NODE_TITLE_GLYPH.idle;
                const gearScale = 0.75; // 24 视窗的齿轮缩放到方块内（约与卡片图标 glyph 比例一致）
                ctx.save();
                ctx.translate(16, 16);
                ctx.scale(gearScale, gearScale);
                ctx.translate(-12, -12);
                ctx.strokeStyle = color;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                // 抵消缩放，使有效线宽 ≈ 帮助圆圈的 2px
                ctx.lineWidth = 2 / gearScale;
                ctx.stroke(_lmsGearPath);
                ctx.restore();
            };

            const drawFg = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const currentLocale = getLocale();
                if (this._lmstudioHelpLocale !== currentLocale) {
                    this._lmstudioHelpLocale = currentLocale;
                    this._syncPresetSelectOptions();
                    this._lmsPanel?.refreshLabels();
                    this._refreshLogPanelLabels?.();
                    // 已有推理日志时按新语言即时重渲染
                    if (this._logInfoI18n) {
                        const logText = pickLMSLogText(this._logInfoI18n);
                        if (logText.trim()) this._updateLogPanel(logText);
                    }
                }
                
                const r = drawFg ? drawFg.apply(this, arguments) : undefined;
                if (this.flags.collapsed) return r;

                const helpX = this.size[0] - iconSize - iconMargin;
                const settingsX = helpX - iconSize - iconGap;
                const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;

                // 设置弹窗关闭后自动取消高亮（弹窗根节点为 .lms-modal）
                if (this._lmstudioSettingsOpen && !document.querySelector(".lms-modal")) {
                    this._lmstudioSettingsOpen = false;
                }
                // 弹窗打开中或鼠标悬停时高亮
                const settingsActive = !!this._lmstudioSettingsOpen || !!this._lmstudioSettingsHovered;

                if (this._lmstudioHelp && helpElement === null) {
                    currentHelpLocale = currentLocale;
                    helpElement = createLMStudioHelpPopup(getLMStudioHelpHTML());
                }
                else if (!this._lmstudioHelp && helpElement !== null) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                else if (this._lmstudioHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                    helpElement.querySelector('div').innerHTML = getLMStudioHelpHTML();
                    currentHelpLocale = currentLocale;
                }

                if (this._lmstudioHelp && helpElement !== null) {
                    const rect = ctx.canvas.getBoundingClientRect();
                    const scaleX = rect.width / ctx.canvas.width;
                    const scaleY = rect.height / ctx.canvas.height;

                    const transform = new DOMMatrix()
                        .scaleSelf(scaleX, scaleY)
                        .multiplySelf(ctx.getTransform())
                        .translateSelf(this.size[0] * scaleX * Math.max(1.0, window.devicePixelRatio), 0)
                        .translateSelf(10, -32);

                    const bcr = app.canvas.canvas.getBoundingClientRect();
                    helpElement.style.left = `${transform.e + bcr.x}px`;
                    helpElement.style.top = `${transform.f + bcr.y}px`;
                }

                // 设置图标（圆角方块 + 齿轮）：紧邻帮助按钮左侧
                ctx.save();
                ctx.translate(settingsX, y);
                ctx.scale(iconSize / 32, iconSize / 32);
                drawNodeTitleChip(ctx, settingsActive);
                drawTitleIconGear(ctx, settingsActive);
                ctx.restore();

                // 帮助图标（展开中或悬停时高亮）
                const helpActive = !!this._lmstudioHelp || !!this._lmstudioHelpHovered;
                ctx.save();
                ctx.translate(helpX, y);
                ctx.scale(iconSize / 32, iconSize / 32);
                drawNodeHelpButton(ctx, helpActive);

                ctx.restore();
                return r;
            };

            /** 标题栏图标（kind: "settings" | "help"）的左边界 */
            nodeType.prototype._titleIconLeft = function (kind) {
                const helpX = this.size[0] - iconSize - iconMargin;
                return kind === "help" ? helpX : helpX - iconSize - iconGap;
            };

            /** 标题栏图标命中判定（localPos 为节点局部坐标） */
            nodeType.prototype._hitTitleIcon = function (localPos, kind) {
                if (!localPos) return false;
                const left = this._titleIconLeft(kind);
                const top = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;
                return localPos[0] > left
                    && localPos[0] < left + iconSize
                    && localPos[1] > top
                    && localPos[1] < top + iconSize;
            };

            const mouseDown = nodeType.prototype.onMouseDown;
            nodeType.prototype.onMouseDown = function (e, localPos, canvas) {
                const r = mouseDown ? mouseDown.apply(this, arguments) : undefined;

                if (this._hitTitleIcon(localPos, "settings")) {
                    // 与原来的设置按钮行为一致：先收起模板下拉，再打开设置弹窗
                    document.querySelector(".lms-dropdown")?.remove();
                    this._lmstudioSettingsOpen = true;
                    showLMStudioSettings(this);
                    return true;
                }
                if (this._hitTitleIcon(localPos, "help")) {
                    this._lmstudioHelp = !this._lmstudioHelp;
                    return true;
                }
                return r;
            };

            // 标题栏图标（设置 / 帮助）悬停高亮
            const mouseMove = nodeType.prototype.onMouseMove;
            nodeType.prototype.onMouseMove = function (e, localPos, canvas) {
                const r = mouseMove ? mouseMove.apply(this, arguments) : undefined;
                const settingsHovered = this._hitTitleIcon(localPos, "settings");
                const helpHovered = this._hitTitleIcon(localPos, "help");
                if (settingsHovered !== this._lmstudioSettingsHovered
                    || helpHovered !== this._lmstudioHelpHovered) {
                    this._lmstudioSettingsHovered = settingsHovered;
                    this._lmstudioHelpHovered = helpHovered;
                    this.setDirtyCanvas?.(true, true);
                }
                return r;
            };

            const mouseLeave = nodeType.prototype.onMouseLeave;
            nodeType.prototype.onMouseLeave = function () {
                const r = mouseLeave ? mouseLeave.apply(this, arguments) : undefined;
                if (this._lmstudioSettingsHovered || this._lmstudioHelpHovered) {
                    this._lmstudioSettingsHovered = false;
                    this._lmstudioHelpHovered = false;
                    this.setDirtyCanvas?.(true, true);
                }
                return r;
            };

            const onRemoved = nodeType.prototype.onRemoved;
            nodeType.prototype.onRemoved = function () {
                const r = onRemoved ? onRemoved.apply(this, []) : undefined;
                hideLMSGlassTooltip();
                this._lmstudioSettingsOpen = false;
                this._lmstudioSettingsHovered = false;
                this._lmstudioHelpHovered = false;
                this._disposeNodeActions();
                this._disposeParamPanel();
                if (helpElement) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                return r;
            };
        }
    }
});

/* 当前打开的模板选择器：再次点击模板按钮即关闭（无关闭按钮） */
let _closeTemplateSelector = null;
let _templateSelectorClosedAt = 0;

async function showTemplateSelector(node, btnRect) {
    let closed = false;
    const overlay = document.createElement("div");
    overlay.className = "lms-dropdown";
    overlay.style.cssText = `
        position: fixed;
        z-index: 10001;
        animation: dropdownSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        transform-origin: top center;
    `;
    
    const dialog = document.createElement("div");
    dialog.style.cssText = `
        width: 328px;
        max-width: 90vw;
        max-height: 350px;
        background: ${LMS_TOKENS.color.glassDeep};
        border: 1px solid ${LMS_TOKENS.color.borderHi};
        border-radius: ${LMS_TOKENS.radius.lg};
        padding: 14px;
        color: ${LMS_TOKENS.color.text};
        box-shadow: ${LMS_TOKENS.shadow.panel};
        backdrop-filter: ${LMS_TOKENS.blur.panel};
        -webkit-backdrop-filter: ${LMS_TOKENS.blur.panel};
        font-family: ${LMS_TOKENS.font};
        display: flex;
        flex-direction: column;
    `;
    
    const header = document.createElement("div");
    header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    `;
    
    const title = document.createElement("h3");
    title.style.cssText = `
        margin: 0;
        font-size: 14.5px;
        font-weight: 600;
        letter-spacing: 0.02em;
        background: linear-gradient(90deg, ${LMS_TOKENS.color.primaryLight}, ${LMS_TOKENS.color.primary});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    title.textContent = $t('selectTemplate');
    
    header.appendChild(title);
    
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = $t('searchTemplates');
    searchInput.style.cssText = `
        width: 100%;
        padding: 7px 10px;
        background: rgba(4, 11, 22, 0.66);
        border: 1px solid ${LMS_TOKENS.color.border};
        border-radius: ${LMS_TOKENS.radius.sm};
        color: ${LMS_TOKENS.color.text};
        font-family: ${LMS_TOKENS.font};
        font-size: 12px;
        margin-bottom: 9px;
        box-sizing: border-box;
        outline: none;
        transition: border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                    box-shadow ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
    `;
    searchInput.onfocus = () => {
        searchInput.style.borderColor = LMS_TOKENS.color.primary;
        searchInput.style.boxShadow = "0 0 0 2px " + LMS_TOKENS.color.primaryGlow;
    };
    searchInput.onblur = () => {
        searchInput.style.borderColor = LMS_TOKENS.color.border;
        searchInput.style.boxShadow = "none";
    };
    
    const listContainer = document.createElement("div");
    listContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        border: 1px solid ${LMS_TOKENS.color.border};
        border-radius: ${LMS_TOKENS.radius.md};
        background: rgba(2, 6, 23, 0.28);
        min-height: 60px;
        max-height: 380px;
        scrollbar-width: thin;
        scrollbar-color: rgba(59, 130, 246, 0.55) transparent;
    `;
    
    listContainer.className = "template-select-list";

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
    selectorFilter.element.style.marginBottom = "9px";
    dialog.classList.add("lms-tc-scope");
    
    const loadingEl = document.createElement("div");
    loadingEl.style.cssText = `
        padding: 20px;
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
    `;
    loadingEl.textContent = $t('checking');
    listContainer.appendChild(loadingEl);
    
    dialog.appendChild(header);
    dialog.appendChild(searchInput);
    dialog.appendChild(selectorFilter.element);
    dialog.appendChild(listContainer);
    
    const manageBtn = document.createElement("button");
    manageBtn.type = "button";
    manageBtn.style.cssText = `
        margin-top: 10px;
        padding: 7px 0;
        width: 100%;
        background: linear-gradient(135deg, ${LMS_TOKENS.color.primary}, ${LMS_TOKENS.color.primaryDeep});
        color: #F8FAFC;
        border: 1px solid rgba(147, 197, 253, 0.35);
        border-radius: ${LMS_TOKENS.radius.sm};
        box-shadow: 0 2px 8px ${LMS_TOKENS.color.primaryGlow};
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
    manageBtn.onmouseenter = () => { manageBtn.style.opacity = "0.85"; };
    manageBtn.onmouseleave = () => { manageBtn.style.opacity = "1"; };
    manageBtn.onclick = () => {
        close();
        showLMStudioSettings(node);
    };
    dialog.appendChild(manageBtn);
    
    overlay.appendChild(dialog);
    
    const close = () => {
        if (closed) return;
        closed = true;
        if (_closeTemplateSelector === close) _closeTemplateSelector = null;
        _templateSelectorClosedAt = Date.now();
        overlay.style.animation = "dropdownSlideOut 0.15s ease forwards";
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 150);
    };

    // 注册给模板按钮：再次点击模板按钮即关闭本面板
    _closeTemplateSelector = close;
    
    const handleClickOutside = (e) => {
        if (!overlay.contains(e.target)) {
            close();
            document.removeEventListener("mousedown", handleClickOutside);
        }
    };
    setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
    }, 10);
    
    const renderList = (templates, searchTerm = "") => {
        let filtered = templates.filter(t => matchesCategory(t, selectedCategory));
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(t => 
                t.name.toLowerCase().includes(term) || 
                t.content.toLowerCase().includes(term)
            );
        }
        
        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                    ${$t('noTemplates')}
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = filtered.map(template => `
            <div class="template-select-item" data-id="${template.id}" style="
                padding: 10px 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                cursor: pointer;
                transition: background 0.15s ease;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px; font-weight: 500; color: #e8e8e8;">${escapeHtml(template.name)}</span>
                    ${categoryBadgeHtml(template.category, selectedCategory)}
                </div>
            </div>
        `).join("");
        
        listContainer.querySelectorAll(".template-select-item").forEach(item => {
            item.onmouseover = () => {
                item.style.background = LMS_TOKENS.color.glassHover;
            };
            item.onmouseout = () => {
                item.style.background = "transparent";
            };
            item.onclick = () => {
                const template = templates.find(t => t.id === item.dataset.id);
                if (template) {
                    const systemPromptWidget = node.widgets?.find(w => w.name === "system_prompt");
                    if (systemPromptWidget) {
                        systemPromptWidget.value = template.content;
                        if (systemPromptWidget.callback) {
                            systemPromptWidget.callback(template.content);
                        }
                        node.setDirtyCanvas(true, true);
                        showToast($t('templateApplied'), "success");
                    }
                }
                close();
            };
        });
    };
    
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value;
        renderList(currentTemplates, searchTerm);
    });
    
    let currentTemplates = [];
    
    try {
        const response = await fetch("/zhihui_nodes/qwen3vl/templates");
        if (response.ok) {
            const data = await response.json();
            currentTemplates = data.templates || [];
            selectorFilter.sync(currentTemplates);
            renderList(currentTemplates);
        } else {
            listContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #ef4444; font-size: 12px;">
                    ${$t('templateDeleteFailed')}
                </div>
            `;
        }
    } catch (e) {
        listContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #ef4444; font-size: 12px;">
                ${$t('templateDeleteFailed')}
            </div>
        `;
    }

    // 加载模板期间已被再次点击关闭：不要再挂出面板
    if (closed) return;

    document.body.appendChild(overlay);
    
    const dialogRect = dialog.getBoundingClientRect();
    let left = btnRect.left;
    let top = btnRect.bottom + 4;
    
    if (left + dialogRect.width > window.innerWidth - 10) {
        left = window.innerWidth - dialogRect.width - 10;
    }
    
    if (top + dialogRect.height > window.innerHeight - 10) {
        top = btnRect.top - dialogRect.height - 4;
    }
    
    if (top < 10) {
        top = 10;
    }
    
    if (left < 10) {
        left = 10;
    }
    
    overlay.style.left = left + "px";
    overlay.style.top = top + "px";
    
    searchInput.focus();
}

function showLMStudioSettings(node) {
    // 弹窗外框与动效：按 chunk 注入一次，不再每次打开都向 <head> 追加 <style>
    injectLMSStyles("dialog-motion", `
@keyframes lmstudioDialogIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes lmstudioDialogOut {
    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    to { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }
}
@keyframes lmstudioOverlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes lmstudioOverlayOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
/* 自有命名空间：不依赖 ComfyUI 标准弹窗样式 */
.lms-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10001;
}
.lms-modal {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10002;
}
@media (prefers-reduced-motion: reduce) {
    .lms-modal-overlay,
    .lms-modal { animation: none !important; }
}
`);

    const overlay = document.createElement("div");
    overlay.className = "lms-modal-overlay";
    overlay.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(2, 6, 23, 0.62);
        backdrop-filter: blur(10px) saturate(1.25);
        -webkit-backdrop-filter: blur(10px) saturate(1.25);
        z-index: 10001;
        opacity: 0;
        animation: lmstudioOverlayIn 0.2s ease forwards;
    `;

    const dialog = document.createElement("div");
    dialog.className = "lms-modal";
    dialog.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        /* 上限 1104px 由「已加载模型」格反推：目标串 text-embedding-nomic-embed-text-v1.5
           在数值排版（13.5px / 600 / 等宽数字 / 本弹窗字体栈）下墨迹宽 276.6px，
           一排三格需要 366.7（端点）+ 10 + 184（状态）+ 10 + 449.3（标签 120.8 + 组距 12
           + 数值 290.5 + 内边距边框 26）= 1020px 行宽，再加弹窗左右 40 + 卡片边框 2
           + card-body 32 + 细滚动条 10。二分实测精确下限：英文界面 1091px、中文界面 1014px，
           这里多留约 14px 给跨平台字体回退差异。
           窄于此宽度时数值退化为省略号而不是溢出（溢出阈值约 790px，所以下限仍取 820px） */
        width: clamp(820px, 94vw, 1104px);
        height: auto;
        max-height: 90vh;
        background: ${LMS_TOKENS.color.glassDeep};
        border: 1px solid ${LMS_TOKENS.color.line};
        border-radius: 12px;
        /* 关掉容器自身的焦点环：本函数末尾会主动 dialog.focus()，而 Chromium 的
           默认焦点环（outline: auto，白 + 深双色、2px）是画在边框外沿的 ——
           在深色遮罩上外侧那半圈就是一圈「白边」，还会把下面这条 #2C5080 边框压掉。
           它跟随 border-radius，所以白边看着和弹窗圆角严丝合缝，像一条自带描边。
           键盘反馈不受影响：内部控件各自有 :focus-visible（按钮/输入框/卡片标题栏） */
        outline: none;
        /* 只保留外投影：去掉 shadow.panel 的 inset 顶部高光线，弹窗边界只剩一条线 */
        box-shadow: 0 34px 90px rgba(2, 6, 23, 0.66);
        backdrop-filter: ${LMS_TOKENS.blur.panel};
        -webkit-backdrop-filter: ${LMS_TOKENS.blur.panel};
        padding: 0;
        color: ${LMS_TOKENS.color.text};
        overflow: hidden;
        opacity: 0;
        animation: lmstudioDialogIn 0.25s ${LMS_TOKENS.motion.easing} forwards;
        z-index: 10002;
        display: flex;
        flex-direction: column;
    `;
    
    const uniqueId = `lmstudio-settings-${Math.random().toString(36).substring(2, 9)}`;
    
    dialog.innerHTML = `
        <style>
            #${uniqueId} {
                display: flex;
                flex-direction: column;
                min-height: 0;
                max-height: calc(90vh - 2px);
                font-family: ${LMS_TOKENS.font};
                color: ${LMS_TOKENS.color.text};
                /* 排版标准：五级字号 + 两档行高 */
                --fs-display: ${LMS_TOKENS.type.display};
                --fs-title: ${LMS_TOKENS.type.title};
                --fs-body: ${LMS_TOKENS.type.body};
                --fs-label: ${LMS_TOKENS.type.label};
                --lh-tight: ${LMS_TOKENS.type.lhTight};
                --lh-base: ${LMS_TOKENS.type.lhBase};
                font-size: var(--fs-body);
                line-height: var(--lh-tight);
            }
            #${uniqueId} * { box-sizing: border-box; }

            #${uniqueId} .ui-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                border-bottom: 1px solid ${LMS_TOKENS.color.line};
                /* 标题栏色带与节点面板卡片标题栏同源（蓝色系，不再用中性石板灰） */
                background: linear-gradient(180deg, rgba(59, 130, 246, 0.22), rgba(59, 130, 246, 0));
            }
            #${uniqueId} .ui-header__icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                flex: 0 0 auto;
                border-radius: 6px;
                color: ${LMS_TOKENS.color.primaryLight};
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.26), rgba(37, 99, 235, 0.12));
                border: 1px solid ${LMS_TOKENS.color.line};
                box-shadow: 0 0 18px rgba(59, 130, 246, 0.22);
            }
            #${uniqueId} .ui-header__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
            #${uniqueId} .ui-title {
                margin: 0;
                font-size: var(--fs-display);
                font-weight: 600;
                line-height: 1.35;
                letter-spacing: 0.01em;
                color: ${LMS_TOKENS.color.textBright};
            }
            #${uniqueId} .ui-subtitle {
                margin: 0;
                font-size: var(--fs-label);
                line-height: var(--lh-tight);
                letter-spacing: 0.01em;
                color: ${LMS_TOKENS.color.textFaint};
            }
            #${uniqueId} .ui-header__actions { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; }

            #${uniqueId} .view-switch-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 7px 16px;
                font-family: inherit;
                font-size: var(--fs-body);
                font-weight: 600;
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.primary};
                border: none;
                border-radius: ${LMS_TOKENS.radius.md};
                cursor: pointer;
                transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .view-switch-btn:hover {
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.primaryHover};
            }
            #${uniqueId} .view-switch-btn:focus-visible,
            #${uniqueId} .circle-close:focus-visible {
                outline: 2px solid ${LMS_TOKENS.color.primaryLight};
                outline-offset: 2px;
            }
            #${uniqueId} .circle-close {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                padding: 0;
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.danger};
                border: none;
                border-radius: ${LMS_TOKENS.radius.md};
                cursor: pointer;
                transition: transform ${LMS_TOKENS.motion.base} ${LMS_TOKENS.motion.easing},
                            background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .circle-close:hover {
                background: ${LMS_TOKENS.action.dangerHover};
                transform: rotate(90deg);
            }

            #${uniqueId} .page-content { display: none; }
            #${uniqueId} .page-content.active {
                display: flex;
                flex-direction: column;
                gap: 14px;
                flex: 1;
                min-height: 0;
                padding: 16px 20px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(147, 197, 253, 0.45) transparent;
            }
            #${uniqueId} .page-content::-webkit-scrollbar,
            #${uniqueId} .template-list::-webkit-scrollbar,
            #${uniqueId} .dashboard-item.models .dashboard-item-value::-webkit-scrollbar { width: 6px; }
            #${uniqueId} .page-content::-webkit-scrollbar-track,
            #${uniqueId} .template-list::-webkit-scrollbar-track,
            #${uniqueId} .dashboard-item.models .dashboard-item-value::-webkit-scrollbar-track {
                background: rgba(96, 165, 250, 0.10);
                border-radius: 3px;
            }
            #${uniqueId} .page-content::-webkit-scrollbar-thumb,
            #${uniqueId} .template-list::-webkit-scrollbar-thumb,
            #${uniqueId} .dashboard-item.models .dashboard-item-value::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(147, 197, 253, 0.55), rgba(37, 99, 235, 0.55));
                border-radius: 3px;
            }

            #${uniqueId} .settings-card {
                border-radius: ${LMS_TOKENS.radius.lg};
                /* 与节点面板的功能卡片同一套底色（午夜蓝实底）；
                   边界只用统一单色描边表达，不投影、不做内高光 */
                background: linear-gradient(180deg, #0e1a2e, #070e1b);
                border: 1px solid ${LMS_TOKENS.color.line};
                overflow: hidden;
            }
            /* 两张卡片并排一行（超时设置 | 批量与文件夹）。
               左列取 max-content 而不是等分：超时卡要两列排布，整卡内容宽实测 604px
               （2 × 单条 280 + 10 列距 + 内边距边框 34），等分只有 520px、单条 238px，
               英文最长标签那条要 280px。右列给 1fr 吃剩余，并留 290px 下限 ——
               那是「批量与文件夹」单条选项放下英文说明所需的最小宽度，
               再窄就要把说明挤成多行。
               两卡固有高度不同，align-items:start 让矮卡保持自身高度，不被拉伸出底部空白 */
            #${uniqueId} .settings-row {
                display: grid;
                grid-template-columns: minmax(0, max-content) minmax(290px, 1fr);
                gap: 14px;
                align-items: start;
            }
            #${uniqueId} .card-head {
                display: flex;
                align-items: center;
                gap: 9px;
                padding: 12px 16px;
                /* 硬性等高：标题栏是 flex 居中容器，内容最高者决定整条高度。
                   「连接与服务」多了刷新按钮（23.5px），其余四格只有 21px 的标题文字，
                   不写死下限就会一高一矮。50px = 12 + 25 + 12 + 1px 下边框，
                   内容盒 25px 同时容得下按钮与标题。 */
                min-height: 50px;
                border-bottom: 1px solid ${LMS_TOKENS.color.line};
                /* 卡片标题栏色带：节点面板蓝（0.26 → 0.08）的浅色版 */
                background: linear-gradient(180deg, rgba(59, 130, 246, 0.18), rgba(59, 130, 246, 0));
            }
            #${uniqueId} .card-head__icon { display: inline-flex; color: ${LMS_TOKENS.color.primaryLight}; line-height: 0; }
            #${uniqueId} .card-head__title {
                margin: 0;
                font-size: var(--fs-title);
                font-weight: 600;
                line-height: 1.4;
                letter-spacing: 0.02em;
                color: ${LMS_TOKENS.color.textBright};
            }
            #${uniqueId} .card-body { display: flex; flex-direction: column; gap: 12px; padding: 14px 16px 16px; }

            #${uniqueId} .dashboard-refresh {
                margin-left: auto;
                /* 上下各 5px 内边距 + line-height 1 → 外框 23.5px（13.5px 文字上下各留 5px）。
                   line-height 必须显式写死：不写就继承弹窗的 1.5，行盒先到 20.25px，
                   再加内边距会把标题栏顶得更高。整条标题栏的等高由 .card-head 的 min-height 兜住 */
                padding: 5px 15px;
                line-height: 1;
                font-family: inherit;
                font-size: var(--fs-body);
                font-weight: 500;
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.primary};
                border: none;
                /* 圆角矩形，与底部「保存设置 / 恢复默认」同一档 radius.md（8px） */
                border-radius: ${LMS_TOKENS.radius.md};
                cursor: pointer;
                transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            opacity ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .dashboard-refresh:hover { color: #FFFFFF; background: ${LMS_TOKENS.action.primaryHover}; }
            #${uniqueId} .dashboard-refresh:disabled { opacity: 0.6; cursor: progress; }

            #${uniqueId} .dashboard-row {
                display: grid;
                /* 状态格定宽 184px：等于其英文内容的 max-content（标签 "STATUS" +
                   最长数值 "Disconnected" + 12px 组距 + 22px 内边距/边框）。定宽后数值在
                   已连接 / 未连接 / 检查中… 之间切换时格子不缩放，右缘也不会跳动。
                   端点列按内容取宽、下限 0，窄弹窗时由输入框先让位；
                   剩余宽度归「已加载模型」格。
                   「可用模型列表」用 grid-column: 1/-1 独占第二行。
                   第三列下限必须是 0 而不是 max-content：跨满三列的模型列表会把自身的
                   max-content（3 × 最长模型名）分配给所跨的各列，把第三列下限顶到 936px，
                   于是整排在 938px 弹窗下被撑到 1140.5px、端点格压成 22px（输入框 18px）。
                   改为 minmax(0, 1fr) 后实测：1104px 弹窗 → 366.7 / 184 / 449.3，
                   938px 弹窗 → 366.7 / 184 / 283.3，三格均不越界 */
                grid-template-columns: minmax(0, max-content) 184px minmax(0, 1fr);
                gap: 10px;
            }
            #${uniqueId} .dashboard-item {
                display: flex;
                flex-direction: column;
                gap: 5px;
                padding: 10px 12px;
                border-radius: ${LMS_TOKENS.radius.md};
                background: rgba(59, 130, 246, 0.06);
                border: 1px solid ${LMS_TOKENS.color.line};
            }
            #${uniqueId} .dashboard-item-label {
                font-size: var(--fs-label);
                font-weight: 600;
                line-height: var(--lh-tight);
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: ${LMS_TOKENS.color.textFaint};
            }
            #${uniqueId} .dashboard-item-value {
                font-size: var(--fs-body);
                line-height: var(--lh-tight);
                color: ${LMS_TOKENS.color.text};
                word-break: break-all;
            }
            #${uniqueId} .dashboard-item-value.loading { color: ${LMS_TOKENS.color.info}; }
            #${uniqueId} .dashboard-item-value.connected { color: ${LMS_TOKENS.color.success}; font-weight: 600; }
            #${uniqueId} .dashboard-item-value.disconnected { color: ${LMS_TOKENS.color.error}; font-weight: 600; }

            /* 单行版式（服务状态 / 已加载模型）：标签靠左、数值排在其右侧的剩余空间里，
               两格形成一致的「标签 → 数值」读序，扫起来是状态条而不是两段说明。
               基线对齐 —— 标签 12.5px 与数值 13.5px 字号不同，按中线对齐会显歪。
               仅这两格用该版式：可用模型列表要换行滚动，仍是标签在上、列表在下 */
            #${uniqueId} .dashboard-item--inline {
                flex-direction: row;
                align-items: baseline;
                /* 单行内容，上下内边距比堆叠版式收 2px，整条状态带更扁 */
                gap: 12px;
                padding: 8px 12px;
            }
            #${uniqueId} .dashboard-item--inline .dashboard-item-label {
                flex: 0 0 auto;
                white-space: nowrap;
            }
            #${uniqueId} .dashboard-item--inline .dashboard-item-value {
                flex: 0 1 auto;
                min-width: 0;
                margin-left: auto;
                text-align: right;
                font-weight: 600;
                /* 等宽数字：值在 3 / 12 / 168 之间变化时右缘不跳动 */
                font-variant-numeric: tabular-nums;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            /* 「已加载模型」的数值在标签之外的剩余空间里水平居中，
               不像服务状态那样贴住格子右缘 —— 该列吸收整行的剩余宽度，
               值（模型名）靠左聚成一团会显歪 */
            #${uniqueId} .dashboard-item--loaded .dashboard-item-value {
                flex: 1 1 auto;
                margin-left: 0;
                text-align: center;
            }
            #${uniqueId} .dashboard-item.models { grid-column: 1 / -1; }
            #${uniqueId} .dashboard-item.models .dashboard-item-value {
                max-height: 132px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(147, 197, 253, 0.45) transparent;
            }
            #${uniqueId} .models-list {
                margin: 0;
                padding-left: 18px;
                /* 三列等宽：minmax(0,1fr) 而非 1fr —— 模型名很长时 1fr 的
                   auto 最小尺寸会被内容撑破，整条列表横向溢出滚动区。
                   实测单列宽 221.3px（820px 弹窗）～ 316px（1104px 弹窗）：
                   宽弹窗下 36 字符的单行、窄弹窗下 31 字符以内单行，更长的由
                   .dashboard-item-value 的 break-all 折行、不顶穿列宽，
                   所以三列不需要随弹窗宽度调整列数 */
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                /* 行距沿用原来的 4px，另给列间 14px，三列文字不会贴在一起 */
                gap: 4px 14px;
                font-size: var(--fs-body);
                line-height: var(--lh-tight);
            }
            #${uniqueId} .cors-notice {
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding: 10px 12px;
                border-radius: ${LMS_TOKENS.radius.md};
                background: rgba(224, 242, 254, 0.14);
                border: 1px solid rgba(125, 211, 252, 0.55);
            }
            #${uniqueId} .cors-notice-content { margin: 0; font-size: var(--fs-body); line-height: var(--lh-base); color: #E0F2FE; }

            #${uniqueId} .endpoint-input,
            #${uniqueId} .timeout-input,
            #${uniqueId} .template-search,
            #${uniqueId} .template-sort {
                font-family: inherit;
                font-size: var(--fs-body);
                line-height: var(--lh-tight);
                color: ${LMS_TOKENS.color.text};
                background: rgba(4, 11, 22, 0.66);
                border: 1px solid ${LMS_TOKENS.color.line};
                border-radius: ${LMS_TOKENS.radius.sm};
                padding: 8px 10px;
                outline: none;
                transition: box-shadow ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            /* 服务端点格：与同排两格严格等高。格子上下内边距 5px、输入框 2px，
               配 13.5px × 1.5 行盒与输入框自身 1px 边框 → 5+26.25+5+2 = 38.25px，
               与「服务状态 / 已加载模型」两格同高，不会靠网格同行等高把三格一起顶高。
               min-width:0 取代原先的 220px 下限 —— 三列布局下固定下限会撑破格子 */
            #${uniqueId} .dashboard-item--endpoint {
                align-items: center;
                gap: 10px;
                padding: 5px 10px;
            }
            #${uniqueId} .dashboard-item--endpoint .endpoint-input {
                /* 定宽 260px：原先 flex:1 吃满格子，宽弹窗下约 380px，这里减三分之一。
                   flex-shrink:1 + min-width:0 保证弹窗收窄时输入框先让位，不撑破格子 */
                flex: 0 1 auto;
                width: 260px;
                min-width: 0;
                padding: 2px 8px;
                line-height: var(--lh-tight);
            }
            /* 聚焦只加外发光环，不改描边色：描边在全界面保持同一单色 */
            #${uniqueId} .endpoint-input:focus,
            #${uniqueId} .timeout-input:focus,
            #${uniqueId} .template-search:focus,
            #${uniqueId} .template-sort:focus {
                box-shadow: 0 0 0 2px ${LMS_TOKENS.color.primaryGlow};
            }
            #${uniqueId} .template-sort option {
                padding: 6px 8px;
                border-radius: ${LMS_TOKENS.radius.sm};
                background: transparent;
                color: ${LMS_TOKENS.color.text};
                font-size: 16px;
            }
            #${uniqueId} .template-sort option:hover,
            #${uniqueId} .template-sort option:focus {
                background: rgba(59, 130, 246, 0.16);
                color: ${LMS_TOKENS.color.textBright};
            }
            #${uniqueId} .template-sort option:checked {
                background: none;
                color: ${LMS_TOKENS.color.textBright};
                font-weight: 500;
            }
            #${uniqueId} .template-sort option::checkmark {
                color: ${LMS_TOKENS.color.primaryLight};
            }

            /* 两列两行：单条要 280px（英文最长标签 "Unload Model List Timeout" 墨迹 162.5
               + 输入框 72 + 单位 7.5 + 两段 8px 间距 + 内边距边框 22）。
               实测单条正好 280、标签框 162.5 = 墨迹宽度，没有余量 —— 但左列是按
               max-content 取宽的，标签在别的字体下变宽整卡就跟着变宽，所以不会裁切；
               只有行宽不够、右列被 290px 下限顶住时才开始收缩（约弹窗 954px 以下） */
            #${uniqueId} .timeout-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
            }
            /* 单行版式（紧凑）：标签靠左，输入框与单位「秒」成组靠右 —— 四条的输入框
               因此同宽、同右缘，纵向读下来是一条直线。
               基线对齐：标签 12.5px 与输入框文字 13.5px 字号不同，按中线对齐会显歪。
               实测整条 38.25px（5 + 输入框 26.25 + 5 + 边框 2）；「服务端点」那一格是
               40.75px，两者输入框同高，差的 2.5px 来自那格用居中对齐 */
            #${uniqueId} .timeout-item {
                display: flex;
                align-items: baseline;
                gap: 8px;
                padding: 5px 10px;
                border-radius: ${LMS_TOKENS.radius.md};
                background: rgba(59, 130, 246, 0.06);
                border: 1px solid ${LMS_TOKENS.color.line};
            }
            #${uniqueId} .timeout-label {
                flex: 1 1 auto;
                min-width: 0;
                white-space: nowrap;
                /* 弹窗窄到左列拿不满 604px 时，标签收进省略号而不是压到输入框上 */
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: var(--fs-label);
                line-height: var(--lh-tight);
                color: ${LMS_TOKENS.color.text};
            }
            /* 高度对齐端点地址输入框：共用规则给的 8px 纵向内边距在这里收到 2px，
               13.5px × 1.5 行盒 + 2 + 2 + 上下边框 2 = 26.25px。
               宽度 65px：本字体栈下数字等宽，13.5px 单个 7.92px、四个 31.67px（到 x=40.67）；
               右缘留给自绘步进器 14px + 内缩 3px（占 x=48..62），
               即最宽数字与步进器之间还有 7.33px，不会压字 */
            #${uniqueId} .timeout-input {
                flex: 0 0 auto;
                width: 65px;
                padding: 2px 8px;
                -moz-appearance: textfield;
                appearance: textfield;
            }
            /* UA 的上下箭头是系统灰底控件（约 #3B3B3B 底 + 浅灰符号），在暗蓝主题里自成一套；
               隐藏后由下面的 .timeout-stepper 顶替同一位置 */
            #${uniqueId} .timeout-input::-webkit-outer-spin-button,
            #${uniqueId} .timeout-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            /* 步进器要压在输入框内右缘，所以框上需要一层定位上下文。
               inline-flex 的基线取自第一个子项（就是输入框本身），包这一层不打乱
               .timeout-item 的 baseline 对齐；flex: 0 0 auto 与输入框各留一份，
               外层管自己在行内的伸缩，内层管框宽不被压缩 */
            #${uniqueId} .timeout-number {
                position: relative;
                display: inline-flex;
                align-items: center;
                flex: 0 0 auto;
            }
            #${uniqueId} .timeout-stepper {
                position: absolute;
                right: 3px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                gap: 1px;
            }
            /* 两枚 11px + 1px 间距 = 23px，输入框内高 24.25px，上下各余 0.6px。
               常态字色 textDim 对框底 7.88:1；悬停换成整圈通用的 glassHover 底 + textBright
               字（14.92:1），不新造第三种悬停色。
               tabindex=-1 + aria-hidden：键盘仍在框内用 ↑/↓ 步进，这两枚只是鼠标位置 */
            #${uniqueId} .timeout-stepper__btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 14px;
                height: 11px;
                padding: 0;
                border: none;
                border-radius: 3px;
                background: transparent;
                color: ${LMS_TOKENS.color.textDim};
                cursor: pointer;
                transition: color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .timeout-stepper__btn:hover {
                color: ${LMS_TOKENS.color.textBright};
                background: ${LMS_TOKENS.color.glassHover};
            }
            #${uniqueId} .timeout-unit {
                flex: 0 0 auto;
                font-size: var(--fs-label);
                line-height: var(--lh-tight);
                letter-spacing: 0.02em;
                color: ${LMS_TOKENS.color.textFaint};
                white-space: nowrap;
            }

            #${uniqueId} .log-panel-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
            /* 日志栏开关复用标准开关组件（createLmsSwitchElement → .lms-switch）：
               标题在最左、说明随后、开关顶到行尾，读序与超时项一致 */
            #${uniqueId} .log-panel-title { font-size: var(--fs-body); font-weight: 600; line-height: var(--lh-tight); color: ${LMS_TOKENS.color.textBright}; }
            #${uniqueId} .log-panel-checkbox { display: inline-flex; align-items: center; margin-left: auto; user-select: none; }
            #${uniqueId} .log-panel-hint { font-size: var(--fs-label); line-height: var(--lh-base); color: ${LMS_TOKENS.color.textFaint}; }
            /* 这一行的开关比节点面板放大一档：轨道 42×16 → 50×18、灯板 16×10 → 18×12、
               状态字 8px → 9px。尺寸都取偶数（奇数高在 150% 显示缩放下上下边缘的抗锯齿
               相位不同，灯板会显偏）。min/max 是组件里锁死尺寸用的，覆盖时要一起改，
               否则新值被夹回 42×16。只作用于设置弹窗，节点面板三格行仍是 42×16 ——
               那边宽度是反推出来的「状态字四周间距相等」值，加宽就会破坏间距。 */
            #${uniqueId} .log-panel-checkbox .lms-switch__track {
                width: 50px; height: 18px;
                min-width: 50px; max-width: 50px;
                min-height: 18px; max-height: 18px;
            }
            #${uniqueId} .log-panel-checkbox .lms-switch__lamp {
                width: 18px; height: 12px;
                min-width: 18px; max-width: 18px;
                min-height: 12px; max-height: 12px;
            }
            #${uniqueId} .log-panel-checkbox .lms-switch__track::before { font-size: 9px; }

            /* 两个模式竖排：单行版式下英文整条要 375.7px（模式名 115.3 + 组距 8 +
               说明 196.4 + 圆点 16 + 间距 10 + 内边距边框 30），横向两列时单条只有
               182px，放不下。
               间距 10px、上下内边距 7.5px 是为了和左边的超时卡对齐：单条 = 7.5 + 21.25
               行盒 + 7.5 + 边框 2 = 38.25px，与单条超时项同高；两条 + 10px 间距 = 86.5px
               也与超时网格的 2 × 38.25 + 10 相同，于是两卡等高（168.5px）、
               内部两行的位置互相平齐 */
            #${uniqueId} .folder-read-mode-options {
                display: grid;
                grid-template-columns: minmax(0, 1fr);
                gap: 10px;
            }
            #${uniqueId} .folder-read-mode-option {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 7.5px 14px;
                border-radius: ${LMS_TOKENS.radius.md};
                background: rgba(59, 130, 246, 0.06);
                border: 1px solid ${LMS_TOKENS.color.line};
                cursor: pointer;
            }
            /* 单行：模式名与说明同处一行，两者按基线对齐（13.5px 与 12.5px 字号不同，
               按中线对齐会显歪）。整条从两行的 71.5px 降到 47.25px */
            #${uniqueId} .folder-read-mode-option-body {
                display: flex;
                align-items: baseline;
                gap: 8px;
                min-width: 0;
            }
            #${uniqueId} .folder-read-mode-option input[type="radio"] {
                -webkit-appearance: none;
                appearance: none;
                flex: 0 0 auto;
                width: 16px;
                height: 16px;
                /* 整条改成垂直居中后不再需要 2px 手动下压（那是两行版式里对齐首行用的） */
                margin: 0;
                border-radius: 50%;
                background: rgba(2, 6, 23, 0.5);
                border: 1px solid ${LMS_TOKENS.color.line};
                cursor: pointer;
                transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            /* 选中态是一枚实心蓝点：整块交给 background-color 铺，不再画径向渐变。
               两件事一起解决：
               1) 中孔去掉 —— 直径 6px 的暗孔在 16px 控件上占比太小，缩放后不成圆。
               2) 边缘变干净 —— 渐变的硬色停在半径 7px，和 border-radius 的抗锯齿裁切
                  是两套边缘处理，叠在小控件上会看出毛边；描边与填充同色后，外缘只剩
                  一层圆形裁切。描边仍留 1px 宽（改成 0 会让控件缩 2px） */
            #${uniqueId} .folder-read-mode-option input[type="radio"]:checked {
                border-color: ${LMS_TOKENS.color.primary};
                background-color: ${LMS_TOKENS.color.primary};
            }
            #${uniqueId} .folder-read-mode-option-label {
                flex: 0 0 auto;
                white-space: nowrap;
                font-size: var(--fs-body);
                font-weight: 600;
                line-height: var(--lh-tight);
                color: ${LMS_TOKENS.color.textBright};
            }
            /* 说明是这行里次要的一半，窄弹窗（右列顶在 290px 下限）时先牺牲它 */
            #${uniqueId} .folder-read-mode-option-desc {
                flex: 0 1 auto;
                min-width: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: var(--fs-label);
                line-height: var(--lh-base);
                color: ${LMS_TOKENS.color.textFaint};
            }

            #${uniqueId} .save-section {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 14px 20px;
                border-top: 1px solid ${LMS_TOKENS.color.line};
                background: linear-gradient(0deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0));
            }
            #${uniqueId} .reset-default-btn {
                padding: 9px 17px;
                font-family: inherit;
                font-size: var(--fs-body);
                font-weight: 500;
                color: #F1F5F9;
                background: ${LMS_TOKENS.action.neutral};
                border: none;
                border-radius: ${LMS_TOKENS.radius.md};
                cursor: pointer;
                transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .reset-default-btn:hover {
                /* 悬停仍在灰阶内提亮，不再借用橙色警示：#475569 → #64748B，
                   白字 4.76:1（AA），#F1F5F9 只有 4.34:1 所以字色必须换成纯白 */
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.neutralHover};
            }
            #${uniqueId} .save-all-btn {
                margin-left: auto;
                display: inline-flex;
                align-items: center;
                gap: 7px;
                padding: 10px 21px;
                font-family: inherit;
                font-size: var(--fs-body);
                font-weight: 600;
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.primary};
                border: none;
                border-radius: ${LMS_TOKENS.radius.md};
                cursor: pointer;
                box-shadow: 0 3px 10px rgba(37, 99, 235, 0.28);
                transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            box-shadow ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            opacity ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .save-all-btn:hover { background: ${LMS_TOKENS.action.primaryHover}; box-shadow: 0 5px 14px rgba(59, 130, 246, 0.34); }
            #${uniqueId} .reset-default-btn:focus-visible,
            #${uniqueId} .save-all-btn:focus-visible,
            #${uniqueId} .dashboard-refresh:focus-visible,
            #${uniqueId} .template-create-btn:focus-visible,
            #${uniqueId} .template-action-btn:focus-visible {
                outline: 2px solid ${LMS_TOKENS.color.primaryLight};
                outline-offset: 2px;
            }

            #${uniqueId} .template-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
            #${uniqueId} .template-toolbar .template-filter { flex: 1 0 100%; }
            #${uniqueId} .template-search { flex: 1; min-width: 180px; }
            #${uniqueId} .template-sort { min-width: 132px; }
            #${uniqueId} .template-create-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 15px;
                font-family: inherit;
                font-size: var(--fs-body);
                font-weight: 500;
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.primary};
                border: none;
                border-radius: ${LMS_TOKENS.radius.md};
                cursor: pointer;
                transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .template-create-btn:hover {
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.primaryHover};
            }
            #${uniqueId} .template-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 8px;
                max-height: 46vh;
                overflow-y: auto;
                padding-right: 2px;
                scrollbar-width: thin;
                scrollbar-color: rgba(147, 197, 253, 0.45) transparent;
            }
            #${uniqueId} .template-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                border-radius: ${LMS_TOKENS.radius.md};
                background: rgba(59, 130, 246, 0.06);
                border: 1px solid ${LMS_TOKENS.color.line};
            }
            #${uniqueId} .template-item-name {
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: var(--fs-body);
                font-weight: 500;
                color: ${LMS_TOKENS.color.textBright};
            }
            #${uniqueId} .template-item-actions { display: inline-flex; gap: 6px; }
            #${uniqueId} .template-action-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                padding: 0;
                line-height: 0;
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.primary};
                border: none;
                border-radius: ${LMS_TOKENS.radius.md};
                cursor: pointer;
                transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .template-edit-btn { color: #FFFFFF; background: ${LMS_TOKENS.action.primary}; }
            #${uniqueId} .template-delete-btn { color: #FEF2F2; background: ${LMS_TOKENS.action.danger}; }
            #${uniqueId} .template-action-btn:hover { color: #FFFFFF; }
            #${uniqueId} .template-edit-btn:hover { color: #FFFFFF; background: ${LMS_TOKENS.action.primaryHover}; }
            #${uniqueId} .template-delete-btn:hover { background: ${LMS_TOKENS.action.dangerHover}; }
            #${uniqueId} .template-empty {
                grid-column: 1 / -1;
                padding: 28px 12px;
                text-align: center;
                font-size: var(--fs-body);
                line-height: var(--lh-base);
                color: ${LMS_TOKENS.color.textFaint};
                border: 1px solid ${LMS_TOKENS.color.line};
                border-radius: ${LMS_TOKENS.radius.md};
            }

            @media (prefers-reduced-motion: reduce) {
                #${uniqueId} * { animation: none !important; transition: none !important; }
            }
        </style>
        <div id="${uniqueId}">
            <header class="ui-header">
                <span class="ui-header__icon">${lmsSvg('sliders', 18)}</span>
                <div class="ui-header__text">
                    <h3 class="ui-title" id="${uniqueId}-title">${$t('title')}</h3>
                    <p class="ui-subtitle">${$t('panelSubtitle')}</p>
                </div>
                <div class="ui-header__actions">
                    <button class="view-switch-btn" data-page="templates" type="button">
                        ${lmsSvg('layers', 14)}
                        <span>${$t('navTemplates')}</span>
                    </button>
                    <button class="circle-close" type="button" aria-label="${$t('close')}">${lmsSvg('close', 15)}</button>
                </div>
            </header>
            <div class="page-content active" id="page-settings">
                <section class="settings-card">
                    <header class="card-head">
                        <span class="card-head__icon">${lmsSvg('globe', 16)}</span>
                        <h4 class="card-head__title">${$t('groupConnection')}</h4>
                        <button class="dashboard-refresh" type="button">${$t('refreshStatus')}</button>
                    </header>
                    <div class="card-body">
                        <div class="dashboard-row">
                            <div class="dashboard-item dashboard-item--inline dashboard-item--endpoint">
                                <label class="dashboard-item-label" for="lmstudio-endpoint-input">${$t('serviceEndpoint')}</label>
                                <input type="text" class="endpoint-input" id="lmstudio-endpoint-input" placeholder="http://localhost:1234" spellcheck="false" autocomplete="off">
                            </div>
                            <div class="dashboard-item dashboard-item--inline">
                                <span class="dashboard-item-label">${$t('serviceStatus')}</span>
                                <span class="dashboard-item-value" id="lmstudio-status">${$t('disconnected')}</span>
                            </div>
                            <div class="dashboard-item dashboard-item--inline dashboard-item--loaded">
                                <span class="dashboard-item-label">${$t('loadedModels')}</span>
                                <span class="dashboard-item-value" id="lmstudio-loaded">-</span>
                            </div>
                            <div class="dashboard-item models">
                                <span class="dashboard-item-label">${$t('availableModels')}</span>
                                <span class="dashboard-item-value" id="lmstudio-models-list">-</span>
                            </div>
                        </div>
                        <div class="cors-notice">
                            <p class="cors-notice-content">${$t('corsWarning')}</p>
                            <p class="cors-notice-content">${$t('corsSteps')}</p>
                        </div>
                    </div>
                </section>
                <div class="settings-row">
                    <section class="settings-card">
                        <header class="card-head">
                            <span class="card-head__icon">${lmsSvg('clock', 16)}</span>
                            <h4 class="card-head__title">${$t('timeoutSettings')}</h4>
                        </header>
                        <div class="card-body">
                            <div class="timeout-grid">
                                <div class="timeout-item">
                                    <label class="timeout-label" for="lmstudio-timeout-fetch">${$t('fetchModelsTimeout')}</label>
                                    <input type="number" class="timeout-input" id="lmstudio-timeout-fetch" min="1" max="60" step="1" value="5">
                                    <span class="timeout-unit">${$t('seconds')}</span>
                                </div>
                                <div class="timeout-item">
                                    <label class="timeout-label" for="lmstudio-timeout-api">${$t('apiCallTimeout')}</label>
                                    <input type="number" class="timeout-input" id="lmstudio-timeout-api" min="10" max="600" step="10" value="450">
                                    <span class="timeout-unit">${$t('seconds')}</span>
                                </div>
                                <div class="timeout-item">
                                    <label class="timeout-label" for="lmstudio-timeout-list">${$t('unloadModelListTimeout')}</label>
                                    <input type="number" class="timeout-input" id="lmstudio-timeout-list" min="1" max="60" step="1" value="10">
                                    <span class="timeout-unit">${$t('seconds')}</span>
                                </div>
                                <div class="timeout-item">
                                    <label class="timeout-label" for="lmstudio-timeout-unload">${$t('unloadModelTimeout')}</label>
                                    <input type="number" class="timeout-input" id="lmstudio-timeout-unload" min="5" max="120" step="5" value="30">
                                    <span class="timeout-unit">${$t('seconds')}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="settings-card">
                        <header class="card-head">
                            <span class="card-head__icon">${lmsSvg('folder', 16)}</span>
                            <h4 class="card-head__title">${$t('groupBatchFolder')}</h4>
                        </header>
                        <div class="card-body">
                            <div class="folder-read-mode-row">
                                <div class="folder-read-mode-options">
                                    <label class="folder-read-mode-option">
                                        <input type="radio" name="folder_read_mode" value="recursive" id="lmstudio-folder-mode-recursive" checked>
                                        <div class="folder-read-mode-option-body">
                                            <div class="folder-read-mode-option-label">${$t('recursiveMode')}</div>
                                            <div class="folder-read-mode-option-desc">${$t('recursiveModeDesc')}</div>
                                        </div>
                                    </label>
                                    <label class="folder-read-mode-option">
                                        <input type="radio" name="folder_read_mode" value="sequential" id="lmstudio-folder-mode-sequential">
                                        <div class="folder-read-mode-option-body">
                                            <div class="folder-read-mode-option-label">${$t('sequentialMode')}</div>
                                            <div class="folder-read-mode-option-desc">${$t('sequentialModeDesc')}</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <section class="settings-card">
                    <header class="card-head">
                        <span class="card-head__icon">${lmsSvg('terminal', 16)}</span>
                        <h4 class="card-head__title">${$t('groupOutputLog')}</h4>
                    </header>
                    <div class="card-body">
                        <div class="log-panel-row">
                            <span class="log-panel-title">${$t('enableLogPanel')}</span>
                            <span class="log-panel-hint">${$t('showLogPanelDesc')}</span>
                            <span class="log-panel-checkbox" id="lmstudio-show-log-panel-box"></span>
                        </div>
                    </div>
                </section>
            </div>
            <div class="page-content" id="page-templates">
                <section class="settings-card">
                    <header class="card-head">
                        <span class="card-head__icon">${lmsSvg('layers', 16)}</span>
                        <h4 class="card-head__title">${$t('navTemplates')}</h4>
                    </header>
                    <div class="card-body">
                        <div class="template-toolbar">
                            <input type="text" class="template-search" id="lmstudio-template-search" placeholder="${$t('searchTemplates')}">
                            <select class="template-sort" id="lmstudio-template-sort">
                                <option value="name">${$t('sortByName')}</option>
                                <option value="time">${$t('sortByTime')}</option>
                            </select>
                            <button class="template-create-btn" type="button" id="lmstudio-template-create">
                                ${lmsSvg('plus', 13)}
                                <span>${$t('createTemplate')}</span>
                            </button>
                        </div>
                        <div class="template-list" id="lmstudio-template-list">
                            <div class="template-empty">${$t('noTemplatesInPanel')}</div>
                        </div>
                    </div>
                </section>
            </div>
            <footer class="save-section">
                <button class="reset-default-btn" type="button" id="lmstudio-reset-default">${$t('resetDefault')}</button>
                <button class="save-all-btn" type="button" id="lmstudio-save-all">
                    ${lmsSvg('check', 15)}
                    <span>${$t('saveAll')}</span>
                </button>
            </footer>
        </div>
    `;
    
    const close = () => {
        overlay.style.animation = "lmstudioOverlayOut 0.15s ease forwards";
        dialog.style.animation = "lmstudioDialogOut 0.15s ease forwards";
        setTimeout(() => {
            document.removeEventListener("keydown", keydownHandler, true);
            document.removeEventListener("keyup", keyupHandler, true);
            document.removeEventListener("keypress", keypressHandler, true);
            if (overlay.parentNode) document.body.removeChild(overlay);
        }, 150);
    };

    const keydownHandler = (e) => {
        e.stopPropagation();
    };

    const keyupHandler = (e) => {
        e.stopPropagation();
    };

    const keypressHandler = (e) => {
        e.stopPropagation();
    };

    document.addEventListener("keydown", keydownHandler, true);
    document.addEventListener("keyup", keyupHandler, true);
    document.addEventListener("keypress", keypressHandler, true);
    
    const closeBtn = dialog.querySelector(".circle-close");

    const settingsPage = dialog.querySelector("#page-settings");
    const templatesPage = dialog.querySelector("#page-templates");
    const viewButtons = dialog.querySelectorAll("[data-page]");
    
    const switchPage = (pageName) => {
        viewButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.page === pageName);
        });
        
        if (!settingsPage || !templatesPage) return;
        
        settingsPage.classList.toggle("active", pageName === "settings");
        templatesPage.classList.toggle("active", pageName === "templates");

        // 标题栏按钮双态：设置页显示「模板管理」（去模板页），
        // 模板页原地变为「返回设置」（回设置页）——替代原模板卡片内的返回按钮
        const headerSwitchBtn = dialog.querySelector(".view-switch-btn");
        if (headerSwitchBtn) {
            const inTemplates = pageName === "templates";
            headerSwitchBtn.dataset.page = inTemplates ? "settings" : "templates";
            headerSwitchBtn.innerHTML = inTemplates
                ? `${lmsSvg('arrowLeft', 14)}<span>${$t('backToSettings')}</span>`
                : `${lmsSvg('layers', 14)}<span>${$t('navTemplates')}</span>`;
        }
    };
    
    viewButtons.forEach(btn => {
        btn.onclick = () => switchPage(btn.dataset.page);
    });
    
    const refreshBtn = dialog.querySelector(".dashboard-refresh");
    const endpointInput = dialog.querySelector("#lmstudio-endpoint-input");
    const getEndpointWidget = () => node.widgets?.find(w => w.name === "endpoint");
    endpointInput.value = normalizeEndpoint(getEndpointWidget()?.value) || LMS_DEFAULT_ENDPOINT;
    // 已保存端点基准：输入框与之不同即为「临时输入」，刷新状态时弹保存警告
    let savedEndpoint = normalizeEndpoint(endpointInput.value);
    const isEndpointUnsaved = () => normalizeEndpoint(endpointInput.value) !== savedEndpoint;

    // 关闭弹窗：任一设置项未保存时先弹警告
    // 确认=保存并关闭；放弃=退回上次保存的值并留在设置页；右上角 ✕ = 只收掉提示，改动原样留着
    closeBtn.onclick = () => {
        if (isSettingsDirty()) {
            // 未保存的两处提示里，第二条按钮语义是「丢弃改动」，所以标「放弃」而不是「取消」
            showConfirm($t('settingsUnsavedClose'), async () => {
                await saveAllSettings();
                close();
            }, () => {
                if (savedSettings) applySettingsSnapshot(savedSettings);
                // 放弃后不关窗：切回设置页，恢复结果当场可见（从模板页点关闭时尤其需要）
                switchPage("settings");
            }, $t('discard'));
            return;
        }
        close();
    };
    
    const refreshDashboard = async () => {
        const statusEl = dialog.querySelector("#lmstudio-status");
        const modelsListEl = dialog.querySelector("#lmstudio-models-list");
        const loadedEl = dialog.querySelector("#lmstudio-loaded");  
        const currentEndpoint = normalizeEndpoint(endpointInput.value) || getEndpointWidget()?.value || LMS_DEFAULT_ENDPOINT;
        
        statusEl.textContent = $t('checking');
        statusEl.className = "dashboard-item-value loading";
        modelsListEl.textContent = "-";
        loadedEl.textContent = "-";
        
        refreshBtn.disabled = true;
        
        try {
            const base = currentEndpoint.replace(/\/+$/, "").replace(/\/v1$/, "");
            const v1Url = base + "/v1/models";
            const apiModelsUrl = base + "/api/v1/models";
            
            let availableModels = [];
            let loadedModels = [];
            
            try {
                const response = await fetch(v1Url);
                if (response.ok) {
                    const data = await response.json();
                    availableModels = data.data?.map(m => m.id) || [];
                }
            } catch (e) {
                availableModels = [];
            }
            
            try {
                const response = await fetch(apiModelsUrl);
                if (response.ok) {
                    const data = await response.json();
                    const models = data.models || data.data || [];
                    loadedModels = [];
                    models.forEach(m => {
                        if (m.loaded_instances && Array.isArray(m.loaded_instances)) {
                            m.loaded_instances.forEach(inst => {
                                if (inst.id) loadedModels.push(inst.id);
                            });
                        }
                    });
                }
            } catch (e) {
                loadedModels = [];
            }
            
            statusEl.textContent = availableModels.length > 0 ? $t('connected') : $t('disconnected');
            statusEl.className = "dashboard-item-value " + (availableModels.length > 0 ? "connected" : "disconnected");

            if (availableModels.length > 0) {
                modelsListEl.innerHTML = "<ul class='models-list'>" +
                    availableModels.map(m => `<li>${m}</li>`).join("") +
                    "</ul>";
            } else {
                modelsListEl.textContent = $t('disconnected');
            }
            
            if (loadedModels.length > 0) {
                loadedEl.innerHTML = loadedModels.map(m => `<div>${m}</div>`).join("");
            } else {
                loadedEl.textContent = $t('none');
            }
            
        } catch (e) {
            statusEl.textContent = $t('disconnected');
            statusEl.className = "dashboard-item-value disconnected";
        }
        
        refreshBtn.disabled = false;
    };
    
    refreshBtn.onclick = () => {
        // 端点是临时输入时先弹保存警告：确认则保存后再刷新，取消不动
        if (isEndpointUnsaved()) {
            showConfirm($t('endpointUnsavedRefresh'), async () => {
                if (await saveAllSettings()) refreshDashboard();
            }, null, $t('discard'));
            return;
        }
        refreshDashboard();
    };
    
    const saveAllBtn = dialog.querySelector("#lmstudio-save-all");
    const resetDefaultBtn = dialog.querySelector("#lmstudio-reset-default");
    const timeoutFetchInput = dialog.querySelector("#lmstudio-timeout-fetch");
    const timeoutApiInput = dialog.querySelector("#lmstudio-timeout-api");
    const timeoutListInput = dialog.querySelector("#lmstudio-timeout-list");
    const timeoutUnloadInput = dialog.querySelector("#lmstudio-timeout-unload");
    /* 数字框步进器：UA 箭头已隐藏，这里补两枚自绘箭头到框内右缘（样式见 .timeout-stepper）。
       步进交给 stepUp/stepDown，min/max/step 由浏览器夹取（实测空值与非数字会落到 min）。
       箭头用 10×6 的 polyline 现画，不走 lmsSvg —— 那个固定 1.7 描边缩到 10px 只剩 0.7px */
    const timeoutMaxDigits = 4;
    dialog.querySelectorAll(".timeout-input").forEach((input) => {
        input.addEventListener("input", () => {
            const digits = input.value.replace(/\D+/g, "").slice(0, timeoutMaxDigits);
            if (digits !== input.value) input.value = digits;
        });
        const wrap = document.createElement("span");
        wrap.className = "timeout-number";
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);
        const stepper = document.createElement("span");
        stepper.className = "timeout-stepper";
        [true, false].forEach((isUp) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "timeout-stepper__btn";
            btn.tabIndex = -1;
            btn.setAttribute("aria-hidden", "true");
            btn.innerHTML = '<svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" '
                + 'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
                + '<polyline points="' + (isUp ? "1 5 5 1 9 5" : "1 1 5 5 9 1") + '"/></svg>';
            // 别把焦点从输入框抢走：:focus 光环不闪断，连按也不用重新点框
            btn.onmousedown = (e) => e.preventDefault();
            btn.onclick = () => { if (isUp) input.stepUp(); else input.stepDown(); };
            stepper.appendChild(btn);
        });
        wrap.appendChild(stepper);
    });
    let originalPromptVersion = "default";
    // 日志栏开关：标准开关组件（与节点面板开关同一工厂、同一套 CSS）
    const showLogPanelSwitch = createLmsSwitchElement({ id: "lmstudio-show-log-panel-switch", label: $t("enableLogPanel") });
    const showLogPanelBox = dialog.querySelector("#lmstudio-show-log-panel-box");
    showLogPanelBox.appendChild(showLogPanelSwitch.el);
    
    let templates = [];
    let templateSearchInput = dialog.querySelector("#lmstudio-template-search");
    let templateSortSelect = dialog.querySelector("#lmstudio-template-sort");
    let templateListEl = dialog.querySelector("#lmstudio-template-list");
    let templateCreateBtn = dialog.querySelector("#lmstudio-template-create");
    let templateCategoryFilter = CATEGORY_ALL;

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
        onPick: (key) => {
            templateCategoryFilter = key;
            renderTemplateList();
        },
        onRenamed: async () => {
            showToast($t('categoryRenamed'), "success");
            await loadTemplates();
        },
        onRequestRemove: (name) => {
            showConfirm($t('confirmDeleteCategory').replace("{name}", name), async () => {
                const result = await requestCategoryRemove(name);
                if (result.ok) {
                    showToast($t('categoryDeleted'), "success");
                    await loadTemplates();
                } else {
                    showToast($t('categoryDeleteFailed'), "error");
                }
            });
        },
        onError: () => {
            showToast($t('categoryRenameFailed'), "error");
        },
    });
    categoryFilter.element.classList.add("lms-tc-scope", "template-filter");
    dialog.querySelector(".template-toolbar").appendChild(categoryFilter.element);
    
    const loadTemplates = async () => {
        try {
            const response = await fetch("/zhihui_nodes/qwen3vl/templates");
            if (response.ok) {
                const data = await response.json();
                templates = data.templates || [];
                categoryFilter.sync(templates);
                renderTemplateList();
            }
        } catch (e) {
            templates = [];
            categoryFilter.sync(templates);
            renderTemplateList();
        }
    };
    
    const renderTemplateList = () => {
        let filteredTemplates = templates.filter(t => matchesCategory(t, templateCategoryFilter));
        
        const searchTerm = templateSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredTemplates = filteredTemplates.filter(t => 
                t.name.toLowerCase().includes(searchTerm) || 
                t.content.toLowerCase().includes(searchTerm)
            );
        }
        
        const sortBy = templateSortSelect.value;
        if (sortBy === "name") {
            filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            filteredTemplates.sort((a, b) => b.updated_at - a.updated_at);
        }
        
        if (filteredTemplates.length === 0) {
            templateListEl.innerHTML = `<div class="template-empty">${$t('noTemplates')}</div>`;
            return;
        }
        
        templateListEl.innerHTML = filteredTemplates.map(template => `
            <div class="template-item" data-id="${template.id}">
                <span class="template-item-name">${escapeHtml(template.name)}</span>
                ${categoryBadgeHtml(template.category, templateCategoryFilter)}
                <div class="template-item-actions">
                    <button class="template-action-btn template-edit-btn" data-id="${template.id}" title="${$t('edit')}" aria-label="${$t('edit')}">${lmsSvg('pen', 14)}</button>
                    <button class="template-action-btn template-delete-btn" data-id="${template.id}" title="${$t('delete')}" aria-label="${$t('delete')}">${lmsSvg('trash', 14)}</button>
                </div>
            </div>
        `).join("");
        
        templateListEl.querySelectorAll(".template-edit-btn").forEach(btn => {
            btn.onclick = () => showTemplateEditor(btn.dataset.id);
        });
        
        templateListEl.querySelectorAll(".template-delete-btn").forEach(btn => {
            btn.onclick = () => deleteTemplate(btn.dataset.id);
        });
    };
    
    const showTemplateEditor = (templateId = null) => {
        const template = templateId ? templates.find(t => t.id === templateId) : null;
        const isEdit = !!template;
        
        const editorOverlay = document.createElement("div");
        editorOverlay.className = "lms-editor-overlay";
        
        const editorDialog = document.createElement("div");
        editorDialog.className = "lms-editor lms-tc-scope";
        editorDialog.setAttribute("role", "dialog");
        editorDialog.setAttribute("aria-modal", "true");
        
        editorDialog.innerHTML = `
            <header class="lms-editor__head">
                <span class="lms-editor__head-icon">${lmsSvg('pen', 16)}</span>
                <h3 class="lms-editor__title">${isEdit ? $t('editTemplate') : $t('createTemplate')}</h3>
            </header>
            <div class="lms-editor__body">
            <div class="lms-editor__field">
                <label class="lms-editor__label" for="template-name-input">${$t('templateName')}</label>
                <input type="text" class="lms-editor__input" id="template-name-input" value="${template ? escapeHtml(template.name) : ''}" placeholder="${$t('templateNamePlaceholder')}">
            </div>
            <div class="lms-editor__field">
                <label class="lms-editor__label" for="template-category-select">${$t('templateCategory')}</label>
                <div id="template-category-slot"></div>
            </div>
            <div class="lms-editor__field lms-editor__field--grow">
                <label class="lms-editor__label" for="template-content-input">${$t('templateContent')}</label>
                <div class="lms-editor__grow-row" id="template-content-row">
                    <textarea class="lms-editor__textarea" id="template-content-input" placeholder="${$t('templateContentPlaceholder')}">${template ? template.content : ''}</textarea>
                </div>
            </div>
            <div class="lms-editor__actions">
                <button class="lms-editor__btn lms-editor__btn--ghost" type="button" id="template-cancel-btn">${$t('cancel')}</button>
                <button class="lms-editor__btn lms-editor__btn--primary" type="button" id="template-save-btn">${$t('save')}</button>
            </div>
            </div>
        `;
        
        /* 模板正文框同样是多行文本框，配同一层自绘滚动条（UA 滚动条改不了指针形状） */
        attachLMSScrollbar(
            editorDialog.querySelector("#template-content-row"),
            editorDialog.querySelector("#template-content-input")
        );

        const categoryPicker = buildCategoryPicker({
            categories: deriveCategories(templates),
            value: template ? template.category : "",
            noneLabel: $t('categoryNone'),
        });
        categoryPicker.select.id = "template-category-select";
        editorDialog.querySelector("#template-category-slot").appendChild(categoryPicker.element);
        
        const closeEditor = () => {
            editorOverlay.remove();
        };
        
        editorDialog.querySelector("#template-cancel-btn").onclick = closeEditor;
        
        editorDialog.querySelector("#template-save-btn").onclick = async () => {
            const nameInput = editorDialog.querySelector("#template-name-input");
            const contentInput = editorDialog.querySelector("#template-content-input");
            
            const name = nameInput.value.trim();
            const content = contentInput.value.trim();
            
            if (!name) {
                showToast($t('templateNameRequired'), "error");
                return;
            }
            
            try {
                let response;
                if (isEdit) {
                    response = await fetch(`/zhihui_nodes/qwen3vl/templates/${templateId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, content, category: categoryPicker.value() })
                    });
                } else {
                    response = await fetch("/zhihui_nodes/qwen3vl/templates", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, content, category: categoryPicker.value() })
                    });
                }
                
                const result = await response.json();
                
                if (result.status === "success") {
                    showToast(isEdit ? $t('templateUpdated') : $t('templateCreated'), "success");
                    closeEditor();
                    await loadTemplates();
                } else {
                    showToast(isEdit ? $t('templateUpdateFailed') : $t('templateCreateFailed'), "error");
                }
            } catch (e) {
                showToast(isEdit ? $t('templateUpdateFailed') : $t('templateCreateFailed'), "error");
            }
        };
        
        editorOverlay.appendChild(editorDialog);
        document.body.appendChild(editorOverlay);
        
        editorDialog.querySelector("#template-name-input").focus();
    };
    
    const deleteTemplate = async (templateId) => {
        showConfirm($t('confirmDelete'), async () => {
            try {
                const response = await fetch(`/zhihui_nodes/qwen3vl/templates/${templateId}`, {
                    method: "DELETE"
                });
                
                const result = await response.json();
                
                if (result.status === "success") {
                    showToast($t('templateDeleted'), "success");
                    await loadTemplates();
                } else {
                    showToast($t('templateDeleteFailed'), "error");
                }
            } catch (e) {
                showToast($t('templateDeleteFailed'), "error");
            }
        });
    };
    
    templateSearchInput.addEventListener("input", renderTemplateList);
    templateSortSelect.addEventListener("change", renderTemplateList);
    templateCreateBtn.onclick = () => showTemplateEditor();
    
    const loadConfig = async () => {
        try {
            const response = await fetch("/zhihui/lmstudio/config");
            if (response.ok) {
                const config = await response.json();
                const savedPreset = config.preset || "Ignore";
                const presetName = LMS_PARAM_PRESETS[savedPreset] ? savedPreset : "Ignore";
                node.lmstudioState.lastParamPreset = presetName;
                if (node._presetSelect) {
                    node._presetSelect.value = presetName;
                }
                
                const timeouts = config.timeouts || {};
                timeoutFetchInput.value = timeouts.fetch_models || 5;
                timeoutApiInput.value = timeouts.api_call || 450;
                timeoutListInput.value = timeouts.unload_model_list || 10;
                timeoutUnloadInput.value = timeouts.unload_model || 30;
                
                originalPromptVersion = config.prompt_version || "default";
                
                const showLogPanel = config.show_log_panel !== false;
                showLogPanelSwitch.set(showLogPanel);
                node.lmstudioState.showLogPanel = showLogPanel;
                
                const folderReadMode = config.folder_read_mode || "recursive";
                const recursiveRadio = dialog.querySelector("#lmstudio-folder-mode-recursive");
                const sequentialRadio = dialog.querySelector("#lmstudio-folder-mode-sequential");
                if (folderReadMode === "sequential") {
                    sequentialRadio.checked = true;
                } else {
                    recursiveRadio.checked = true;
                }
            }
        } catch (e) {
            timeoutFetchInput.value = 5;
            timeoutApiInput.value = 450;
            timeoutListInput.value = 10;
            timeoutUnloadInput.value = 30;
            showLogPanelSwitch.set(true);
            node.lmstudioState.showLogPanel = true;
        }
        // 配置回填完成后再取基准：此后任何改动都算「未保存」
        savedSettings = readSettingsSnapshot();
    };

    /** 当前弹窗内全部设置项的快照（端点 + 超时 + 日志栏开关 + 文件夹模式） */
    const readSettingsSnapshot = () => ({
        endpoint: normalizeEndpoint(endpointInput.value),
        show_log_panel: showLogPanelSwitch.get(),
        folder_read_mode: dialog.querySelector("#lmstudio-folder-mode-recursive").checked ? "recursive" : "sequential",
        timeouts: [
            timeoutFetchInput.value,
            timeoutApiInput.value,
            timeoutListInput.value,
            timeoutUnloadInput.value,
        ].join("|"),
    });
    let savedSettings = null;
    const isSettingsDirty = () => savedSettings !== null
        && JSON.stringify(readSettingsSnapshot()) !== JSON.stringify(savedSettings);

    /** 把快照写回弹窗内的控件，即「放弃」时的恢复；只动界面，不改基准也无需改 ——
        恢复后当前值与 savedSettings 相同，isSettingsDirty 自然回到 false */
    const applySettingsSnapshot = (s) => {
        endpointInput.value = s.endpoint;
        showLogPanelSwitch.set(s.show_log_panel);
        const isRecursive = s.folder_read_mode === "recursive";
        dialog.querySelector("#lmstudio-folder-mode-recursive").checked = isRecursive;
        dialog.querySelector("#lmstudio-folder-mode-sequential").checked = !isRecursive;
        const timeouts = s.timeouts.split("|");
        timeoutFetchInput.value = timeouts[0];
        timeoutApiInput.value = timeouts[1];
        timeoutListInput.value = timeouts[2];
        timeoutUnloadInput.value = timeouts[3];
    };

    /** 保存全部设置；返回是否成功，供「保存并刷新 / 保存并关闭」复用 */
    const saveAllSettings = async () => {
        const showLogPanel = showLogPanelSwitch.get();
        const folderReadMode = dialog.querySelector("#lmstudio-folder-mode-recursive").checked ? "recursive" : "sequential";
        const endpoint = normalizeEndpoint(endpointInput.value) || LMS_DEFAULT_ENDPOINT;
        endpointInput.value = endpoint;

        const config = {
            endpoint: endpoint,
            show_log_panel: showLogPanel,
            folder_read_mode: folderReadMode,
            timeouts: {
                fetch_models: parseInt(timeoutFetchInput.value),
                api_call: parseInt(timeoutApiInput.value),
                unload_model_list: parseInt(timeoutListInput.value),
                unload_model: parseInt(timeoutUnloadInput.value)
            }
        };

        try {
            const response = await fetch("/zhihui/lmstudio/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                savedEndpoint = endpoint;
                savedSettings = readSettingsSnapshot();
                node.lmstudioState.showLogPanel = showLogPanel;
                if (node._logPanelHost) {
                    node._logPanelHost.style.display = showLogPanel ? "block" : "none";
                }

                const endpointWidget = getEndpointWidget();
                if (endpointWidget) {
                    endpointWidget.value = endpoint;
                    endpointWidget.callback?.(endpoint);
                }
                node.setDirtyCanvas(true, true);

                showToast($t('saveSuccess'), "success");
                return true;
            }
            showToast($t('saveFailed'), "error");
        } catch (e) {
            showToast($t('saveFailed') + ": " + e.message, "error");
        }
        return false;
    };

    saveAllBtn.onclick = saveAllSettings;

    resetDefaultBtn.onclick = () => {
        showConfirm(
            $t('confirmReset'),
            async () => {
                const needRefresh = originalPromptVersion !== "default";
                
                node.lmstudioState.lastParamPreset = "Ignore";
                if (node._presetSelect) {
                    node._presetSelect.value = "Ignore";
                }

                timeoutFetchInput.value = 5;
                timeoutApiInput.value = 450;
                timeoutListInput.value = 10;
                timeoutUnloadInput.value = 30;
                endpointInput.value = LMS_DEFAULT_ENDPOINT;
                const endpointWidget = getEndpointWidget();
                if (endpointWidget) {
                    endpointWidget.value = LMS_DEFAULT_ENDPOINT;
                    endpointWidget.callback?.(LMS_DEFAULT_ENDPOINT);
                }
                originalPromptVersion = "default";
                showLogPanelSwitch.set(false);
                node.lmstudioState.showLogPanel = false;
                if (node._logPanelHost) {
                    node._logPanelHost.style.display = "none";
                }
                
                const recursiveRadio = dialog.querySelector("#lmstudio-folder-mode-recursive");
                const sequentialRadio = dialog.querySelector("#lmstudio-folder-mode-sequential");
                recursiveRadio.checked = true;
                sequentialRadio.checked = false;

                const config = {
                    preset: "Ignore",
                    prompt_version: "default",
                    endpoint: LMS_DEFAULT_ENDPOINT,
                    show_log_panel: false,
                    folder_read_mode: "recursive",
                    timeouts: {
                        fetch_models: 5,
                        api_call: 450,
                        unload_model_list: 10,
                        unload_model: 30
                    }
                };

                try {
                    const response = await fetch("/zhihui/lmstudio/config", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(config)
                    });

                    if (response.ok) {
                        savedEndpoint = LMS_DEFAULT_ENDPOINT;
                        savedSettings = readSettingsSnapshot();
                        if (needRefresh) {
                            showToast($t('saveSuccessRefresh'), "success");
                        } else {
                            showToast($t('resetSuccess'), "success");
                        }
                    } else {
                        showToast($t('resetFailed'), "error");
                    }
                } catch (e) {
                    showToast($t('resetFailed') + ": " + e.message, "error");
                }
            }
        );
    };

    loadConfig();
    loadTemplates();
    
    refreshDashboard();

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", uniqueId + "-title");
    dialog.tabIndex = -1;
    try {
        dialog.focus({ preventScroll: true });
    } catch (e) {
    }
}
