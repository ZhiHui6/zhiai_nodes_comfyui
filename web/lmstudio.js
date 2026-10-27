import { app } from "../../scripts/app.js";
import { applyNode } from "./zhiai_i18n.js";
import { drawNodeHelpButton, drawNodeSettingsButton, drawNodeTitleChip, titleTipHovered, hideTitleTip } from "./node_title_icons.js";
import { watchNodeModeVisual } from "./panel_kit.js";
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

const LMSTUDIO_EXT_ID = "ZhiaiNodes.LMStudio";

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
        resetDefault: "恢复默认",
        autoSaveHint: "设置修改后即时保存",
        confirmReset: "确定要恢复默认设置吗？这将重置所有配置为默认值。",
        saveSuccess: "所有设置已保存到配置文件",
        saveSuccessRefresh: "设置已保存，请刷新页面以更新主节点的预设选项",
        saveFailed: "保存设置失败",
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
        helpTitle: "LM Studio 节点",
        helpDescription: "连接本地 LM Studio 服务器，调用本地部署的大语言模型（含视觉模型）进行图像分析与文本生成。",
        helpFeatures: "功能特性",
        helpFeature1: "支持本地 LM Studio 服务器连接，并自动发现已加载的模型",
        helpFeature2: "参数预设：精确 / 平衡 / 创意模式，一键套用推理参数",
        helpFeature3: "提示词预设：通用标注、专业详细、角色特征、场景分析、风格识别、差异比对",
        helpFeature4: "支持输出语言、篇幅与格式（JSON / Tag / 自然语言）控制，多媒体端口可接图像列表、视频抽帧与音频，另支持文件夹批量打标",
        helpUsage: "使用说明",
        helpUsage1: "启动 LM Studio 并开启 Local Server（加载具备视觉能力的模型）",
        helpUsage2: "在节点中填写服务器地址，点击「刷新模型」加载可用模型",
        helpUsage3: "选择参数预设与提示词预设即可开始；关闭「使用预设」后可自定义用户 / 系统提示词",
        helpInput: "输入",
        helpInputDesc: "文本提示词端口接任意文本输出（接入后整组提示词功能区禁用，提示词以连线内容为准），加上互斥的两个媒体端口：图像端口接图像列表（一次请求多图），媒体端口接媒体包（图像 / 视频抽帧 / 音频转 WAV）",
        helpOutput: "输出",
        helpOutputDesc: "返回模型生成的文本结果（可在节点下方查看推理日志）",
        refreshing: "刷新中…",
        panelSubtitle: "配置本地服务、模型与推理参数",
        groupConnection: "连接与服务",
        groupOutputLog: "输出与日志",
        groupBatchFolder: "批量与文件夹",
        noTemplatesInPanel: "暂无模板，点击右上角「新建模板」添加",

        panelAria: "LM Studio 参数面板",
        cardPrompt: "提示词",
        cardMedia: "前处理与后处理",
        cardInference: "推理参数",
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
        fieldVideoFrames: "视频帧数",
        mediaSocketSwitched: "已切换到另一个媒体端口，原连线可按 Ctrl+Z 还原",
        batchMediaConflict: "批处理模式仅从文件夹读取，不会使用媒体端口数据；请禁用上游节点的输出，或关闭批处理模式",
        panelOnlyInputsCut: "以下参数只在面板内填写，已断开接入它们的连线：{fields}",
        outputLanguageChinese: "中文",
        outputLanguageEnglish: "英文",
        outputLanguageBoth: "中英",
        linkedByInput: "由输入连线控制",
        textPortNote: "提示词由文本端口提供",
        textPortSlotLabel: "文本提示词",
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
        resetDefault: "Reset Default",
        autoSaveHint: "Changes are saved automatically",
        confirmReset: "Are you sure you want to reset to default settings? This will reset all configurations.",
        saveSuccess: "All settings saved to configuration file",
        saveSuccessRefresh: "Settings saved, please refresh page to update main node preset options",
        saveFailed: "Failed to save settings",
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
        helpTitle: "LM Studio Node",
        helpDescription: "Connect to a local LM Studio server and call locally deployed LLMs (including vision models) for image analysis and text generation.",
        helpFeatures: "Features",
        helpFeature1: "Connect to local LM Studio server with automatic model discovery",
        helpFeature2: "Parameter presets: Precise / Balanced / Creative mode to apply inference params in one click",
        helpFeature3: "Prompt presets: General Caption, Detailed Pro, Character, Scene, Style, Diff Compare",
        helpFeature4: "Output language, length and format (JSON / Tag / Natural) control, media ports for image lists, video frame sampling and audio, plus folder batch captioning",
        helpUsage: "Usage",
        helpUsage1: "Launch LM Studio and enable Local Server (load a vision-capable model)",
        helpUsage2: "Enter the server address in the node and click “Refresh Models” to load available models",
        helpUsage3: "Pick parameter and prompt presets to start; turn off “Use Preset” to use custom user / system prompts",
        helpInput: "Input",
        helpInputDesc: "The text port takes the prompt from any string output (while it is linked the whole prompt section is disabled and the linked text is used), plus two exclusive media ports: the image port takes an image list (one multi-image request), the media port takes a media bundle (images / video frames / WAV audio)",
        helpOutput: "Output",
        helpOutputDesc: "Returns the text generated by the model (inference log shown under the node)",
        refreshing: "Refreshing…",
        panelSubtitle: "Configure the local service, model and inference parameters",
        groupConnection: "Connection & Service",
        groupOutputLog: "Output & Log",
        groupBatchFolder: "Batch & Folders",
        noTemplatesInPanel: "No templates yet. Use “New Template” in the top right corner.",

        panelAria: "LM Studio parameter panel",
        cardPrompt: "Prompt",
        cardMedia: "Pre- and Post-processing",
        cardInference: "Inference",
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
        fieldVideoFrames: "Video Frames",
        mediaSocketSwitched: "Switched to the other media port; press Ctrl+Z to restore the link",
        batchMediaConflict: "Batch mode reads from the folder only and ignores the media ports; mute the upstream node's output, or turn batch mode off",
        panelOnlyInputsCut: "These parameters are filled in the panel only; input links wired to them were removed: {fields}",
        outputLanguageChinese: "Chinese",
        outputLanguageEnglish: "English",
        outputLanguageBoth: "CN + EN",
        linkedByInput: "Controlled by input link",
        textPortNote: "Prompt supplied by the text port",
        textPortSlotLabel: "Text Prompt",
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
        font: 13px "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
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

function pickLMSLogText(pair) {
    if (!pair || typeof pair !== "object") return "";
    const locale = getLocale();
    return String(pair[locale] ?? pair.zh ?? pair.en ?? "");
}


const LMS_PARAM_PRESETS = {
    "Ignore": {
        params: {},
        labelKey: "ignore",
        descKey: "ignoreDesc",
    },
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

const LMS_NO_MODELS_PLACEHOLDER = "(no models found)";

function normalizeEndpoint(value) {
    const text = String(value ?? "").trim();
    if (!text) return "";
    return text.replace(/\/+$/, "");
}

async function saveLMSPresetConfig(presetName) {
    try {
        await fetch("/zhiai/lmstudio/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ preset: presetName }),
        });
        return true;
    } catch (e) {
        return false;
    }
}


const LMS_TOKENS = {
    color: {
        base: "#070D1A",
        glass: "rgba(9, 17, 32, 0.74)",
        glassDeep: "rgba(5, 11, 22, 0.88)",
        glassSoft: "rgba(59, 130, 246, 0.08)",
        glassHover: "rgba(59, 130, 246, 0.16)",
        glassSunken: "rgba(2, 6, 23, 0.28)",
        border: "rgba(96, 165, 250, 0.18)",
        borderHi: "rgba(147, 197, 253, 0.42)",
        line: "#2C5080",
        text: "#DDE9F5",
        textBright: "#F2FAFF",
        textDim: "#93A9C4",
        textLabel: "#B4C7DE",
        textFaint: "#7C93B0",
        textGhost: "#4E617E",
        primary: "#3B82F6",
        primaryDeep: "#2563EB",
        primaryLight: "#93C5FD",
        primaryGlow: "rgba(59, 130, 246, 0.35)",
        accent: "#8B5CF6",
        success: "#34D399",
        error: "#F87171",
        warn: "#FBBF24",
        info: "#60A5FA",
        toastBg: "rgba(255, 214, 10, 0.1)",
        toastInk: "#FFF8E1",
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
    font: "'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
};

const LMS_TITLE_CHIP_BG = "linear-gradient(180deg, rgba(96, 165, 250, 0.30), rgba(59, 130, 246, 0.20))";
const LMS_TITLE_CHIP_INK = "#DBEAFE";

const LMS_ICONS = {
    refresh: '<path d="M20.6 12a8.6 8.6 0 1 1-2.6-6.1"/><polyline points="20.6 4.3 20.6 9.5 15.4 9.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    clear: '<rect x="3" y="3" width="18" height="18" rx="5"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/>',
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


let _lmsTooltipEl = null;
let _lmsTooltipAnchor = null;
let _lmsTooltipTimer = null;
let _lmsTooltipShownAt = 0;

const LMS_TOOLTIP_DELAY = 420;
const LMS_TOOLTIP_DELAY_WARM = 90;
const LMS_TOOLTIP_WARM_WINDOW = 700;

function cancelLMSGlassTooltipTimer() {
    if (_lmsTooltipTimer) {
        clearTimeout(_lmsTooltipTimer);
        _lmsTooltipTimer = null;
    }
}

function showLMSGlassTooltip(anchorEl, text) {
    cancelLMSGlassTooltipTimer();
    hideLMSGlassTooltip();
    if (!anchorEl || !text) return;
    _lmsTooltipAnchor = anchorEl;
    _lmsTooltipEl = document.createElement("div");
    _lmsTooltipEl.className = "lms-tooltip";
    _lmsTooltipEl.textContent = text;
    document.body.appendChild(_lmsTooltipEl);
    _lmsTooltipShownAt = Date.now();

    const btnRect = anchorEl.getBoundingClientRect();
    const tipRect = _lmsTooltipEl.getBoundingClientRect();
    let left = btnRect.left + (btnRect.width / 2) - (tipRect.width / 2);
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
    cancelLMSGlassTooltipTimer();
    if (_lmsTooltipEl) {
        _lmsTooltipEl.remove();
        _lmsTooltipEl = null;
    }
    _lmsTooltipAnchor = null;
}

function attachLMSGlassTooltip(el, text) {
    const resolveText = () => (typeof text === "function" ? text() : text);
    const schedule = () => {
        cancelLMSGlassTooltipTimer();
        const warm = Date.now() - _lmsTooltipShownAt < LMS_TOOLTIP_WARM_WINDOW;
        _lmsTooltipTimer = window.setTimeout(() => {
            _lmsTooltipTimer = null;
            showLMSGlassTooltip(el, resolveText());
        }, warm ? LMS_TOOLTIP_DELAY_WARM : LMS_TOOLTIP_DELAY);
    };
    el.addEventListener("mouseenter", schedule);
    el.addEventListener("focus", schedule);
    el.addEventListener("mouseleave", hideLMSGlassTooltip);
    el.addEventListener("blur", hideLMSGlassTooltip);
    el.addEventListener("click", hideLMSGlassTooltip);
}


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
    height: 22px;
    box-sizing: border-box;
    background: ${LMS_TOKENS.color.glassSunken};
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    color: ${LMS_TOKENS.color.text};
}
.lms-preset:hover {
    color: ${LMS_TOKENS.color.textBright};
    background: ${LMS_TOKENS.color.glassHover};
    border-color: ${LMS_TOKENS.color.borderHi};
}
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
.lms-preset:has(.lms-preset-select:open)::after,
.lms-preset.lms-open::after {
    transform: rotate(180deg);
}
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
    height: 20px;
    padding: 0 24px 0 8px;
    font-family: inherit;
    font-size: ${LMS_TOKENS.type.micro};
    color: inherit;
    background: transparent;
    border: none;
    border-radius: ${LMS_TOKENS.radius.sm};
    outline: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
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

.lms-textarea::-webkit-scrollbar,
.lms-editor__textarea::-webkit-scrollbar { display: none; width: 0; height: 0; }
.lms-textarea,
.lms-editor__textarea { scrollbar-width: none; }

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
    background: none;
    border-radius: ${LMS_TOKENS.radius.lg};
    font-family: ${LMS_TOKENS.font};
    font-size: ${LMS_TOKENS.type.body};
    line-height: ${LMS_TOKENS.type.lhTight};
    color: ${LMS_TOKENS.color.text};
}

.lms-card {
    position: relative;
    border-radius: ${LMS_TOKENS.radius.lg};
    background:
        linear-gradient(180deg, rgba(59, 130, 246, 0.26), rgba(59, 130, 246, 0.08) 38px, transparent 38px),
        linear-gradient(180deg, #0e1a2e, #070e1b);
}
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
    height: 38px;
    padding: 7px 10px;
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
.lms-card__actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
}
.lms-card__actions > .lms-field {
    margin-left: 14px;
}
.lms-card__body { display: block; }
.lms-fields {
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 9px 11px 12px;
}

.lms-fields__row {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: 6px;
    align-items: center;
    min-width: 0;
}
.lms-fields__row .lms-field {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 0;
    min-width: 0;
    height: 22px;
    box-sizing: border-box;
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    overflow: hidden;
    transition: border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-fields__row .lms-field__label {
    flex: 0 0 auto;
    justify-content: center;
    min-width: 0;
    line-height: 1;
    padding: 0 4px;
    border: none;
    font-size: ${LMS_TOKENS.type.micro};
    background: rgba(78, 148, 248, 0.25);
    color: ${LMS_TITLE_CHIP_INK};
    font-weight: 600;
}
.lms-fields__row .lms-control {
    flex: 1 1 0;
    min-width: 0;
}
.lms-fields__row .lms-select {
    height: 22px;
    line-height: 1;
    padding: 0 22px 0 4px;
    border: none;
    border-radius: 0;
    font-size: ${LMS_TOKENS.type.micro};
}
.lms-fields__row .lms-field:hover { border-color: ${LMS_TOKENS.color.borderHi}; }
.lms-fields__row .lms-field:has(.lms-select:open),
.lms-fields__row .lms-field:has(.lms-open) { border-color: ${LMS_TOKENS.color.primary}; }
.lms-fields__row .lms-field[data-locked="true"] .lms-field__label { opacity: 0.45; }

.lms-fields--tiles {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: 0;
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
.lms-fields--tiles .lms-field + .lms-field { border-left: 1px solid ${LMS_TOKENS.color.border}; }
.lms-fields--tiles .lms-field__label {
    flex: 0 0 auto;
    font-size: ${LMS_TOKENS.type.micro};
}
.lms-fields--tiles .lms-control {
    flex: 0 1 auto;
    justify-content: center;
    gap: 0;
}
.lms-fields--tiles .lms-number {
    flex: 0 1 auto;
    width: calc(5ch + 16px);
    min-width: 40px;
    height: 20px;
}

.lms-fields--wide { padding: 0 3px; }
.lms-fields--wide .lms-field {
    padding: 4px 8px;
    height: calc(${LMS_TOKENS.controlHeight} + 8px);
}
.lms-fields--wide .lms-icon-btn { flex: 0 0 auto; }

.lms-fields--grid {
    display: grid;
    grid-template-columns: repeat(var(--lms-grid-cols, 2), minmax(0, 1fr));
    grid-auto-rows: calc(${LMS_TOKENS.controlHeight} + 8px);
    gap: 0;
    padding: 0;
    align-items: stretch;
}
.lms-fields--grid .lms-field {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 4px 11px;
    border-radius: 0;
}
.lms-fields--grid .lms-field__note {
    flex: 0 0 100%;
    margin-bottom: 0;
}
.lms-fields--grid[data-cols="2"] .lms-field:not(.lms-field--span):nth-child(4n+1),
.lms-fields--grid[data-cols="2"] .lms-field:not(.lms-field--span):nth-child(4n+2),
.lms-fields--grid[data-cols="3"] .lms-field:not(.lms-field--span):nth-child(6n+1),
.lms-fields--grid[data-cols="3"] .lms-field:not(.lms-field--span):nth-child(6n+2),
.lms-fields--grid[data-cols="3"] .lms-field:not(.lms-field--span):nth-child(6n+3) {
    background: rgba(59, 130, 246, 0.08);
}
.lms-fields--grid[data-band-flip="true"][data-cols="2"] .lms-field:not(.lms-field--span):nth-child(4n+1),
.lms-fields--grid[data-band-flip="true"][data-cols="2"] .lms-field:not(.lms-field--span):nth-child(4n+2) {
    background: none;
}
.lms-fields--grid[data-band-flip="true"][data-cols="2"] .lms-field:nth-child(4n+3),
.lms-fields--grid[data-band-flip="true"][data-cols="2"] .lms-field:nth-child(4n+4) {
    background: rgba(59, 130, 246, 0.08);
}
.lms-fields--grid[data-cols="2"] .lms-field:not(.lms-field--span):nth-child(2n) {
    border-left: 1px solid ${LMS_TOKENS.color.border};
}
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
.lms-fields--grid .lms-field--span { grid-column: 1 / -1; }
.lms-fields--grid .lms-field__label {
    flex: 0 0 auto;
    max-width: 42%;
}
.lms-fields--grid .lms-control {
    flex: 1 1 0;
    min-width: 0;
}
.lms-fields--grid .lms-number {
    flex: 0 0 auto;
    width: calc(5ch + 18px);
    min-width: 0;
    height: 20px;
}
.lms-fields--grid .lms-field[data-widget="seed"] .lms-number {
    width: calc(10ch + 18px);
}
.lms-fields--grid .lms-field[data-widget="control_after_generate"] .lms-select {
    height: 22px;
    line-height: 20px;
    font-size: ${LMS_TOKENS.type.micro};
}
.lms-control--folder .lms-input {
    height: 20px;
}
.lms-control--folder .lms-input::placeholder {
    font-size: 12px;
}
.lms-fields--grid .lms-field--range { justify-content: flex-start; }
.lms-fields--grid .lms-control--split {
    flex: 1 1 0;
    justify-content: flex-end;
    gap: 8px;
}
.lms-fields--grid .lms-control--split .lms-range-wrap {
    flex: 0 1 96px;
    min-width: 56px;
}
.lms-fields--grid .lms-control--end { justify-content: flex-end; }

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
.lms-field__flag {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    color: ${LMS_TOKENS.color.success};
}
.lms-field[data-locked="true"] .lms-field__flag { color: ${LMS_TOKENS.color.textFaint}; }
.lms-field--side-title .lms-field__label .lms-field__flag {
    color: inherit;
    writing-mode: horizontal-tb;
}
.lms-field[data-locked="true"] .lms-control {
    opacity: 0.45;
    cursor: not-allowed;
}
.lms-card[data-dim-locked="true"] .lms-field[data-locked="true"] .lms-field__label {
    opacity: 0.45;
}
.lms-field__label {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    font-size: ${LMS_TOKENS.type.label};
    font-weight: 500;
    letter-spacing: 0.01em;
    color: ${LMS_TOKENS.color.textLabel};
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

.lms-field--side-title .lms-field__frame {
    display: flex;
    align-items: stretch;
    min-width: 0;
    grid-column: 1 / -1;
    background: rgba(4, 11, 22, 0.66);
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    overflow: hidden;
    transition: border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
}
.lms-field--side-title .lms-field__frame:focus-within {
    border-color: ${LMS_TOKENS.color.primary};
}
.lms-field--side-title[data-locked="true"] .lms-field__label {
    color: #FFC2B5;
    background: linear-gradient(180deg, rgba(255, 138, 117, 0.30), rgba(255, 138, 117, 0.20));
}
.lms-field--side-title[data-locked="true"] .lms-field__frame { border-color: #9C5C5A; }
.lms-field--side-title .lms-field__label {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 5px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: ${LMS_TOKENS.type.micro};
    font-weight: 500;
    letter-spacing: 0.14em;
    white-space: nowrap;
    color: ${LMS_TITLE_CHIP_INK};
    background: ${LMS_TITLE_CHIP_BG};
    cursor: default;
    user-select: none;
}
.lms-field--side-title .lms-field__label[data-inert="true"] { pointer-events: none; }
.lms-field--side-title .lms-field__link { writing-mode: horizontal-tb; }
.lms-field--side-title .lms-control { flex: 1 1 auto; min-width: 0; }
.lms-field--side-title .lms-textarea {
    flex: 1 1 auto;
    min-width: 0;
    line-height: 1.3;
    height: calc(3px + 6 * 15.6px);
    align-self: center;
    padding: 1px 3px 2px;
    background: transparent;
    border: none;
    border-radius: 0;
    resize: none;
    overscroll-behavior: contain;
}

.lms-control--select { justify-content: flex-end; }
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
.lms-control--select:has(.lms-select:open)::after,
.lms-control--select.lms-open::after {
    transform: rotate(180deg);
}
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
    line-height: calc(${LMS_TOKENS.controlHeight} - 2px);
    align-content: center;
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
    font-size: 16px;
}

.lms-check {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: ${LMS_TOKENS.controlHeight};
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
    font-weight: 600;
    color: inherit;
}
.lms-card__head .lms-field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    grid-template-columns: none;
}
.lms-card__head .lms-check {
    gap: 4px;
    height: auto;
    padding: 3px 8px;
    background: rgba(4, 11, 22, 0.55);
    border: 1px solid ${LMS_TOKENS.color.border};
    border-radius: ${LMS_TOKENS.radius.sm};
    font-size: ${LMS_TOKENS.type.micro};
}
.lms-card__head .lms-check__label {
    font-weight: 500;
}

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
.lms-input { height: ${LMS_TOKENS.controlHeight}; padding: 0 9px; }
.lms-textarea {
    min-height: 74px;
    max-height: 220px;
    padding: 8px 9px;
    font-size: 12px;
    line-height: ${LMS_TOKENS.type.lhBase};
    resize: vertical;
}
.lms-input::placeholder,
.lms-textarea::placeholder { color: ${LMS_TOKENS.color.textGhost}; }
.lms-input:hover:not([disabled]),
.lms-textarea:hover:not([disabled]) { border-color: ${LMS_TOKENS.color.borderHi}; }
.lms-input:focus-visible,
.lms-textarea:focus-visible {
    border-color: ${LMS_TOKENS.color.primary};
    box-shadow: none;
}
.lms-input:disabled,
.lms-textarea:disabled,
.lms-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.lms-control--folder { gap: 7px; }
.lms-field:has(.lms-control--folder) {
    grid-template-columns: minmax(74px, auto) minmax(0, 1fr);
}
.lms-control--folder .lms-input { flex: 1 1 auto; width: auto; min-width: 0; }
.lms-control--folder .lms-field__folder-btn {
    flex: 0 0 auto;
    height: 20px;
    padding: 0 6px;
    font-size: ${LMS_TOKENS.type.micro};
    font-weight: 400;
    color: #F8FAFC;
    background: ${LMS_TOKENS.color.primary};
    border: 1px solid transparent;
    border-radius: ${LMS_TOKENS.radius.sm};
    box-shadow: none;
}
.lms-control--folder .lms-field__folder-btn:hover {
    color: #FFFFFF;
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
.lms-control--folder.lms-drop-active .lms-input {
    border-color: ${LMS_TOKENS.color.primary};
    background: rgba(59, 130, 246, 0.14);
}
.lms-control--folder.lms-locating .lms-input {
    border-color: ${LMS_TOKENS.color.primary};
    background: rgba(59, 130, 246, 0.10);
}

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
.lms-range::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: ${LMS_TOKENS.radius.pill};
    background: linear-gradient(90deg,
        ${LMS_TOKENS.color.primary} 0%,
        ${LMS_TOKENS.color.primary} var(--lms-range-fill),
        rgba(148, 163, 184, 0.40) var(--lms-range-fill),
        rgba(148, 163, 184, 0.40) 100%);
}
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
.lms-range__thumb {
    position: absolute;
    top: 50%;
    left: 0;
    box-sizing: border-box;
    width: 8px;
    height: 14px;
    margin-top: -7px;
    border-radius: 3px;
    background: #EFF6FF;
    border: 1px solid ${LMS_TOKENS.color.primary};
    box-shadow: 0 2px 6px rgba(2, 6, 23, 0.60);
    pointer-events: none;
}

.lms-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
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
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 2px 0 0;
    flex: 0 0 auto;
    box-sizing: border-box;
    width: 42px;
    height: 16px;
    min-width: 42px;
    max-width: 42px;
    min-height: 16px;
    max-height: 16px;
    border: 1px solid #2C5080;
    border-radius: 999px;
    background: #2B2E33;
    transition: background-color ${LMS_TOKENS.motion.base} ${LMS_TOKENS.motion.easing};
}
.lms-switch__track::before {
    content: "Off";
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
.lms-switch[aria-checked="true"] .lms-switch__track::before {
    content: "On";
    color: ${LMS_TOKENS.color.primary};
}
.lms-switch[aria-checked="true"] .lms-switch__lamp {
    background: ${LMS_TOKENS.color.primary};
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.85);
    animation: lms-switch-ignite 300ms ${LMS_TOKENS.motion.easing};
}
@keyframes lms-switch-ignite {
    0% { background: ${LMS_TOKENS.color.primaryDeep}; box-shadow: 0 0 2px rgba(59, 130, 246, 0.40); }
    45% { background: ${LMS_TOKENS.color.primaryLight}; box-shadow: 0 0 8px rgba(96, 165, 250, 0.95); }
    100% { background: ${LMS_TOKENS.color.primary}; box-shadow: 0 0 4px rgba(59, 130, 246, 0.85); }
}
.lms-switch:active .lms-switch__track { background: #1C1F23; }
.lms-switch:focus-visible {
    outline: 2px solid ${LMS_TOKENS.color.primaryLight};
    outline-offset: 2px;
}

.lms-mini-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex: 0 0 auto;
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
.lms-field[hidden],
.lms-field__link[hidden],
.lms-card__note[hidden] { display: none; }
.lms-card__note {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    height: 20px;
    line-height: 18px;
    padding: 0 8px;
    font-size: ${LMS_TOKENS.type.micro};
    color: ${LMS_TOKENS.color.warn};
    background: rgba(251, 191, 36, 0.13);
    border: 1px solid rgba(251, 191, 36, 0.42);
    border-radius: ${LMS_TOKENS.radius.sm};
}
.lms-card[data-group-locked="true"] .lms-card__body { pointer-events: none; }
.lms-card[data-group-locked="true"] .lms-card__actions .lms-icon-btn,
.lms-card[data-group-locked="true"] .lms-card__actions .lms-mini-btn,
.lms-card[data-group-locked="true"] .lms-card__actions .lms-check {
    pointer-events: none;
    opacity: 0.5;
}
`);

injectLMSStyles("overlays", `
@keyframes lms-toast-in {
    from { opacity: 0; transform: translateY(-12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
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
        display: flex;
        align-items: center;
    }
    .lms-select::picker-icon,
    .lms-preset-select::picker-icon { display: none; }
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
    .lms-select selectedcontent { text-align: center; }
    .lms-select { justify-content: center; }
    .lms-select::picker(select),
    .lms-preset-select::picker(select),
    .template-sort::picker(select) {
        appearance: base-select;
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
    .lms-fields__row .lms-select option,
    .lms-fields--grid .lms-select option {
        position: relative;
        text-align: center;
        justify-content: center;
    }
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
        font-size: 16px;
    }
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
        background: none;
        color: ${LMS_TOKENS.color.textBright};
        font-weight: 500;
    }
    .lms-select option::checkmark,
    .lms-preset-select option::checkmark { color: ${LMS_TOKENS.color.primaryLight}; }
}
`);

const LMS_OUTPUT_LANGUAGES = ["Chinese", "English", "Chinese&English"];


const LMS_PANEL_MIN_WIDTH = 367;

const LMS_PANEL_HEIGHT_PAD = 18;

const LMS_PANEL_LAYOUT = [
    {
        id: "prompt",
        titleKey: "cardPrompt",
        icon: "template",
        promptGroup: true,
        lockNoteKey: "textPortNote",
        fields: [
            { name: "use_preset", labelKey: "fieldUsePreset", kind: "checkbox", header: true },
            {
                name: "preset_prompt",
                labelKey: "fieldPresetPrompt",
                kind: "select",
                inline: true,
                disabledWhen: { widget: "use_preset", value: false },
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
                disabledWhen: { widget: "use_preset", value: true },
                available: true,
            },
            {
                name: "system_prompt",
                labelKey: "fieldSystemPrompt",
                kind: "textarea",
                placeholderKey: "systemPromptPlaceholder",
                block: true,
                disabledWhen: { widget: "use_preset", value: true },
                available: true,
            },
        ],
    },
    {
        id: "media",
        titleKey: "cardMedia",
        icon: "link",
        columns: 2,
        bandFlip: true,
        fields: [
            { name: "size_limitation", labelKey: "fieldSizeLimit", kind: "number", integer: true },
            {
                name: "video_frames",
                labelKey: "fieldVideoFrames",
                kind: "number",
                integer: true,
            },
            { name: "remove_think_tags", labelKey: "fieldRemoveThink", kind: "switch" },
            { name: "unload_model", labelKey: "fieldUnloadModel", kind: "switch" },
        ],
    },
    {
        id: "inference",
        titleKey: "cardInference",
        icon: "sliders",
        columns: 2,
        fields: [
            {
                name: "model",
                labelKey: "fieldModel",
                kind: "select",
                wide: true,
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
        id: "batch",
        titleKey: "cardBatch",
        icon: "folder",
        columns: 2,
        bandFlip: true,
        dimLockedLabels: true,
        fields: [
            { name: "batch_mode", labelKey: "fieldBatchMode", kind: "switch" },
            {
                name: "skip_exists",
                labelKey: "fieldSkipExists",
                kind: "switch",
                disabledWhen: { widget: "batch_mode", value: false },
            },
            {
                name: "batch_folder_path",
                labelKey: "fieldBatchFolder",
                kind: "text",
                placeholderKey: "batchFolderPlaceholder",
                disabledWhen: { widget: "batch_mode", value: false },
                folderPicker: true,
                span: true,
            },
        ],
    },
];

const LMS_PANEL_MANAGED_WIDGETS = LMS_PANEL_LAYOUT.flatMap((card) => card.fields.map((field) => field.name));


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


const _lmsOpenSelects = new Set();

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

function attachLMSSelectOpenState(select, target) {
    if (!select || !target) return;
    const setOpen = (open) => target.classList.toggle("lms-open", !!open);
    const entry = { select, setOpen };

    setOpen(false);
    _lmsOpenSelects.add(entry);

    select.addEventListener("mousedown", () => {
        setOpen(!target.classList.contains("lms-open"));
    });
    select.addEventListener("change", () => setOpen(false));
    select.addEventListener("blur", () => setOpen(false));
    select.addEventListener("click", (event) => {
        if (event.target !== select) setOpen(false);
    });
    select.addEventListener("keydown", (event) => {
        if (event.key === "Escape" || event.key === "Tab") {
            setOpen(false);
            return;
        }
        if (event.key === "Enter" || event.key === " " || event.key.startsWith("Arrow")) {
            setOpen(true);
        }
    });
}

function fitLMSSelectWidth(select) {
    if (!select || select.options.length === 0) return;
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
    if (content <= 0) return;

    const box = ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]
        .reduce((total, key) => total + (parseFloat(styles[key]) || 0), 0);
    select.style.width = `${Math.ceil(content + box) + 2}px`;
}


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
            if (/^\/[a-zA-Z]:[\\/]/.test(text)) text = text.slice(1);
            return text;
        }
        if (/^(?:[a-zA-Z]:[\\/]|\\\\|\/)/.test(line)) return line;
    }
    return "";
}

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

async function rememberLMSBatchFolder(path) {
    if (!path) return;
    try {
        await fetch("/zhiai/lmstudio/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_batch_folder: path }),
        });
    } catch (err) {
    }
}

function createLmsSwitchElement({ id = "", label = "" } = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lms-switch";
    button.setAttribute("role", "switch");
    button.setAttribute("aria-checked", "false");
    if (id) button.id = id;
    if (label) button.setAttribute("aria-label", label);
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
    control.appendChild(button);

    const setDropState = (active) => control.classList.toggle("lms-drop-active", !!active);
    const setLocating = (active) => control.classList.toggle("lms-locating", !!active);

    const commitPath = (path) => {
        api.commit(path);
        rememberLMSBatchFolder(path);
    };

    const locateByName = async (name) => {
        if (!name) {
            showToast($t("folderDropNoPath"), "warning");
            return;
        }
        button.disabled = true;
        setLocating(true);
        try {
            const response = await fetch(
                `/zhiai/lmstudio/locate_folder?name=${encodeURIComponent(name)}`,
            );
            if (!response.ok) {
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
            const response = await fetch("/zhiai/lmstudio/select_directory");
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

    control.addEventListener("dragover", (event) => {
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
        if (!path && !isFolderDrop) return;
        event.preventDefault();
        event.stopPropagation();
        if (path) {
            commitPath(path);
            return;
        }
        console.debug("[LMStudio] dropped folder without path, locating by name:", name);
        locateByName(name);
    });

    return { button, refreshLabels };
}

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
        + (spec.kind === "range" ? " lms-field--range" : "");
    field.dataset.widget = spec.name;
    if (spec.dependsOn) field.dataset.dependsOn = spec.dependsOn;

    const inputId = lmsNextFieldId(spec.name);
    const label = document.createElement("label");
    label.className = "lms-field__label";
    label.htmlFor = inputId;
    const labelText = document.createElement("span");
    labelText.className = "lms-field__label-text";
    let availableMark = null;
    if (spec.available) {
        availableMark = document.createElement("span");
        availableMark.className = "lms-field__flag";
        availableMark.setAttribute("aria-hidden", "true");
        availableMark.innerHTML = lmsSvg("checkCircle", 12);
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
        + (spec.kind === "switch" || spec.kind === "number" ? " lms-control--end" : "")
        + (spec.kind === "range" ? " lms-control--split" : "")
        + (spec.folderPicker ? " lms-control--folder" : "");

    field.appendChild(label);
    field.appendChild(control);
    if (spec.header) label.remove();

    let disabled = false;
    let locked = false;
    let defaultValue = null;
    let interactive = [];

    const emit = (value) => {
        if (disabled || locked) return;
        defaultValue = value;
        handlers?.onChange?.(value);
    };

    const applyDisabledState = () => {
        field.dataset.disabled = disabled ? "true" : "false";
        field.dataset.locked = locked ? "true" : "false";
        linkMark.hidden = !disabled;
        if (availableMark) availableMark.innerHTML = lmsSvg(locked ? "ban" : "checkCircle", 12);
        interactive.forEach((el) => { el.disabled = disabled || locked; });
    };

    const setDisabled = (flag) => {
        disabled = !!flag;
        applyDisabledState();
    };

    const setLocked = (flag) => {
        locked = !!flag;
        applyDisabledState();
    };

    const refreshLabels = () => {
        labelText.textContent = $t(spec.labelKey);
        if (spec.kind === "checkbox") {
            control.querySelector(".lms-check__label").textContent = $t(spec.labelKey);
            interactive[0]?.setAttribute("aria-label", $t(spec.labelKey));
        }
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
            if (!spec.inline) fitLMSSelectWidth(select);
        }
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
            field.prepend(note);
        }
        note.textContent = text;
    };

    const api = {
        el: field,
        name: spec.name,
        spec,
        getValue: () => defaultValue,
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
        attachLMSSelectOpenState(select, control);
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
        range.step = "any";

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
            scroller?.sync();
        };

        api.getValue = () => textEl.value;

        if (spec.folderPicker && !isMultiline) {
            const picker = attachLMSFolderPicker(control, textEl, api);
            api.refreshFolderPicker = picker.refreshLabels;
            interactive = [textEl, picker.button];
        }
    }

    if (spec.kind === "textarea") {
        const frame = document.createElement("div");
        frame.className = "lms-field__frame";
        field.classList.add("lms-field--side-title");
        field.insertBefore(frame, label);
        frame.appendChild(label);
        frame.appendChild(control);
        label.removeAttribute("for");
        label.dataset.inert = "true";
    }

    refreshLabels();
    return api;
}


function createLMSPanel(node) {
    const host = document.createElement("div");
    host.className = "lms-panel-host";
    attachLMSNodeContextMenu(host, node);
    attachLMSWheelForwarding(host);

    const panel = document.createElement("div");
    panel.className = "lms-panel";
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", $t("panelAria"));
    host.appendChild(panel);
    watchNodeModeVisual(node, host);

    const state = node.lmstudioState || (node.lmstudioState = { lastParamPreset: "Ignore", showLogPanel: true });

    const controls = new Map();
    const cardRefs = new Map();
    let presetLocked = new Set();
    let textPortLocked = false;
    const throttledDirty = lmsThrottle(() => node.setDirtyCanvas?.(true, true), 140);

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
        if (cardSpec.dimLockedLabels) card.dataset.dimLocked = "true";
        const head = document.createElement("div");
        head.className = "lms-card__head lms-card__head--static";
        head.innerHTML = '<span class="lms-card__icon">' + lmsSvg(cardSpec.icon, 13) + "</span>"
            + '<span class="lms-card__title"></span>';

        const body = document.createElement("div");
        body.className = "lms-card__body";
        const gridMode = Number(cardSpec.columns) > 1;
        let wideFields = null;
        if (gridMode) {
            wideFields = document.createElement("div");
            wideFields.className = "lms-fields lms-fields--wide";
            body.appendChild(wideFields);
        }
        const fields = document.createElement("div");
        const tileMode = cardSpec.tiles === true;
        fields.className = "lms-fields"
            + (gridMode ? " lms-fields--grid" : "")
            + (tileMode ? " lms-fields--tiles" : "");
        if (gridMode) {
            fields.dataset.cols = String(cardSpec.columns);
            fields.style.setProperty("--lms-grid-cols", String(cardSpec.columns));
            if (cardSpec.bandFlip) fields.dataset.bandFlip = "true";
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
        let lockNote = null;
        if (cardSpec.lockNoteKey) {
            lockNote = document.createElement("span");
            lockNote.className = "lms-card__note";
            lockNote.hidden = true;
            head.appendChild(lockNote);
        }
        cardRef.setGroupLocked = (flag) => {
            card.dataset.groupLocked = flag ? "true" : "false";
            if (lockNote) lockNote.hidden = !flag;
        };
        cardRef.setTexts = () => {
            cardRef.title.textContent = $t(cardSpec.titleKey);
            if (lockNote) lockNote.textContent = $t(cardSpec.lockNoteKey);
        };
        cardRefs.set(cardSpec.id, cardRef);

        let inlineRow = null;

        cardSpec.fields.forEach((fieldSpec) => {
            const widget = getLMSWidget(node, fieldSpec.name);
            const control = createLMSControl(fieldSpec, widget, {
                onChange: (value, options) => {
                    writeLMSWidget(node, widget, value, options);
                    if (options?.deferDirty) throttledDirty();
                    if (fieldSpec.name === "batch_mode") {
                        lmsSettleMediaNode(node);
                    }
                    if (dependencyGates.has(fieldSpec.name)) {
                        applyDependencies();
                        api.resize();
                    }
                },
            });
            controls.set(fieldSpec.name, control);
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
            let target = gridMode && fieldSpec.wide && wideFields ? wideFields : fields;
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
            if (gridMode && fieldSpec.span) control.el.classList.add("lms-field--span");
            target.appendChild(control.el);
        });

        cardRef.setTexts();
    });

    const applyDependencies = () => {
        let changed = false;
        LMS_PANEL_LAYOUT.forEach((cardSpec) => {
            const groupLocked = Boolean(cardSpec.promptGroup) && textPortLocked;
            cardRefs.get(cardSpec.id)?.setGroupLocked?.(groupLocked);
            cardSpec.fields.forEach((fieldSpec) => {
                const control = controls.get(fieldSpec.name);
                if (!control) return;

                if (fieldSpec.dependsOn) {
                    const gate = getLMSWidget(node, fieldSpec.dependsOn);
                    const visible = gate ? gate.value === true : true;
                    if (control.el.hidden === visible) {
                        control.el.hidden = !visible;
                        changed = true;
                    }
                }

                if (typeof control.setLocked === "function") {
                    let locked = groupLocked || presetLocked.has(fieldSpec.name);
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

        setParamPresetLock(names) {
            presetLocked = new Set(Array.isArray(names) ? names : []);
            applyDependencies();
        },

        sync() {
            const active = document.activeElement;
            textPortLocked = lmsTextPortLinked(node);
            lmsApplyTextPortLabel(node);
            (node.widgets ?? []).forEach((widget) => {
                if (!widget || LMS_PANEL_DOM_WIDGETS.has(widget.name) || controls.has(widget.name)) return;
                widget.hidden = true;
                if (widget.options && typeof widget.options === "object") widget.options.hidden = true;
                hideNativeWidgetElement(widget);
            });
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

                    hideNativeWidgetElement(widget);

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

        refreshLabels() {
            panel.setAttribute("aria-label", $t("panelAria"));
            cardRefs.forEach((cardRef) => cardRef.setTexts());
            controls.forEach((control) => {
                control.refreshLabels();
                const widget = getLMSWidget(node, control.name);
                refreshControlNote(control, widget, widget ? isLMSWidgetLinked(node, widget) : false);
            });
        },

        resize() {
            window.requestAnimationFrame(() => {
                try {
                    if (!node.graph) return;
                    node.arrange?.();
                    const widget = api.widget;
                    const bottom = widget?.y != null && widget.computedHeight > 0
                        ? Math.round(widget.y + widget.computedHeight)
                        : 0;
                    const height = bottom || Math.round(node.computeSize()[1]);
                    node.setSize([node.size[0], Math.max(120, height)]);
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
    api.setParamPresetLock(getLMSPresetLockedWidgets(state.lastParamPreset));
    return api;
}

const LMS_PANEL_DOM_WIDGETS = new Set(["lmstudio_param_panel"]);

function hideNativeWidgetElement(widget) {
    const el = widget?.element || widget?.inputEl;
    if (!el || !el.style) return;
    el.disabled = true;
    if (typeof el.setAttribute === "function") el.setAttribute("tabindex", "-1");
    if (el.style.display !== "none") el.style.display = "none";
    el.style.pointerEvents = "none";
}

function lmsCanvasScale() {
    const scale = app?.canvas?.ds?.scale;
    return typeof scale === "number" && scale > 0 ? scale : 1;
}

const _lmsLastHeights = new WeakMap();

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

function attachLMSNodeContextMenu(el, node) {
    el.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openLMSNodeContextMenu(node, event);
    });
}

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

function openLMSNodeContextMenu(node, event) {
    const canvas = app?.canvas;
    if (!canvas || !node) return;

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
    }

    if (typeof canvas.processContextMenu === "function") {
        canvas.processContextMenu(node, event);
        return;
    }

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

function refreshControlNote(control, widget, linked) {
    control.applyNote(linked ? $t("linkedByInput") : "");
}

function getToastHost() {
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
    return host;
}

function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = "lms-toast";
    const accent = type === "success"
        ? LMS_TOKENS.color.success
        : type === "error"
            ? LMS_TOKENS.color.error
            : type === "warning"
                ? LMS_TOKENS.color.warn
                : LMS_TOKENS.color.primary;
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 100%;
        box-sizing: border-box;
        background: ${LMS_TOKENS.color.toastBg};
        backdrop-filter: ${LMS_TOKENS.blur.panel};
        -webkit-backdrop-filter: ${LMS_TOKENS.blur.panel};
        color: ${LMS_TOKENS.color.toastInk};
        font-family: ${LMS_TOKENS.font};
        padding: 14px 24px;
        border: 1px solid ${accent}66;
        border-radius: ${LMS_TOKENS.radius.lg};
        font-size: 13.5px;
        font-weight: 500;
        letter-spacing: 0.01em;
        box-shadow: 0 20px 48px rgba(2, 6, 23, 0.45), 0 0 0 1px ${accent}22;
        animation: lms-toast-in 0.3s ${LMS_TOKENS.motion.easing};
        min-width: 200px;
        pointer-events: auto;
    `;
    const accentDot = document.createElement("span");
    accentDot.style.cssText = "flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:"
        + accent + ";box-shadow:0 0 10px " + accent + "99;";
    const textEl = document.createElement("span");
    textEl.textContent = message;
    toast.appendChild(accentDot);
    toast.appendChild(textEl);

    getToastHost().appendChild(toast);
    const stayMs = 10000;
    setTimeout(() => {
        toast.style.animation = "lms-toast-in 0.3s " + LMS_TOKENS.motion.easing + " reverse";
        setTimeout(() => {
            toast.remove();
            const host = document.getElementById("lms-toast-host");
            if (host && !host.childElementCount) host.remove();
        }, 300);
    }, stayMs);
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
        padding: 34px 32px 26px;
        max-width: 420px;
        text-align: center;
        font-family: ${LMS_TOKENS.font};
        box-shadow: ${LMS_TOKENS.shadow.panel};
        backdrop-filter: ${LMS_TOKENS.blur.panel};
        -webkit-backdrop-filter: ${LMS_TOKENS.blur.panel};
        animation: fadeScaleDialog 0.2s ${LMS_TOKENS.motion.easing};
    `;

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

const LMS_MEDIA_BUNDLE_TYPE = "MINIMAX_H3_MEDIA_BUNDLE";
const LMS_OPTIONAL_SLOT_SHAPE = globalThis.LiteGraph?.SlotShape?.HollowCircle ?? 7;
const LMS_MEDIA_SLOTS = {
    bundle: { name: "media_bundle", type: LMS_MEDIA_BUNDLE_TYPE, shape: LMS_OPTIONAL_SLOT_SHAPE },
    images: { name: "image", type: "IMAGE", shape: LMS_OPTIONAL_SLOT_SHAPE },
};
const LMS_MEDIA_SLOT_BY_NAME = {
    [LMS_MEDIA_SLOTS.images.name]: LMS_MEDIA_SLOTS.images,
    [LMS_MEDIA_SLOTS.bundle.name]: LMS_MEDIA_SLOTS.bundle,
};
const LMS_MEDIA_SLOT_NAMES = [LMS_MEDIA_SLOTS.images.name, LMS_MEDIA_SLOTS.bundle.name];
const LMS_IS_MEDIA_SLOT = (name) => Object.prototype.hasOwnProperty.call(LMS_MEDIA_SLOT_BY_NAME, String(name ?? ""));

const LMS_TEXT_PORT = { name: "text_prompt", type: "STRING" };

function lmsTextPortLinked(node) {
    return (node?.inputs ?? []).some((slot) => slot?.name === LMS_TEXT_PORT.name && slot?.link != null);
}

function lmsApplyTextPortLabel(node) {
    const slot = (node?.inputs ?? []).find((entry) => entry?.name === LMS_TEXT_PORT.name);
    if (!slot) return false;
    const text = $t("textPortSlotLabel");
    let changed = slot.label !== text;
    if (changed) slot.label = text;
    if ("localized_name" in slot && slot.localized_name !== text) {
        slot.localized_name = text;
        changed = true;
    }
    if (slot.shape !== LMS_OPTIONAL_SLOT_SHAPE) {
        slot.shape = LMS_OPTIONAL_SLOT_SHAPE;
        changed = true;
    }
    return changed;
}

function lmsEnsureTextPort(node) {
    if (!Array.isArray(node?.inputs)) return false;
    if (!node.inputs.some((slot) => slot?.name === LMS_TEXT_PORT.name)) {
        node.addInput?.(LMS_TEXT_PORT.name, LMS_TEXT_PORT.type, { optional: true });
        node.graph?.afterChange?.(true);
    }
    return lmsApplyTextPortLabel(node);
}

function lmsLinkedMediaPorts(node) {
    return (node?.inputs ?? []).filter((slot) => slot?.link != null && LMS_IS_MEDIA_SLOT(slot.name));
}

function lmsReleaseMediaPorts(node, keepName) {
    const victims = lmsLinkedMediaPorts(node).filter((slot) => slot.name !== keepName);
    if (!victims.length) return false;
    node.graph?.beforeChange?.();
    for (const slot of victims) node.disconnectInput?.(node.inputs.indexOf(slot), true);
    node.graph?.afterChange?.(true);
    return true;
}

function lmsMediaSocketPlan(node) {
    const inputs = node?.inputs ?? [];
    const missing = [];
    let restyled = false;
    for (const name of LMS_MEDIA_SLOT_NAMES) {
        const wanted = LMS_MEDIA_SLOT_BY_NAME[name];
        const slot = inputs.find((entry) => entry?.name === name);
        if (!slot) {
            missing.push(name);
        } else if (slot.type !== wanted.type || (slot.shape ?? undefined) !== wanted.shape) {
            restyled = true;
        }
    }
    return { missing, restyled };
}

function lmsApplyMediaSocketPlan(node, plan) {
    node.graph?.beforeChange?.();
    for (const name of plan.missing) {
        node.addInput?.(name, LMS_MEDIA_SLOT_BY_NAME[name].type, { optional: true });
    }
    for (const name of LMS_MEDIA_SLOT_NAMES) {
        const slot = node.inputs.find((entry) => entry?.name === name);
        if (!slot) continue;
        const wanted = LMS_MEDIA_SLOT_BY_NAME[name];
        slot.type = wanted.type;
        slot.shape = wanted.shape;
    }
    node.graph?.afterChange?.(true);
}

function lmsBatchModeOn(node) {
    const widget = getLMSWidget(node, "batch_mode");
    if (!widget) return false;
    return widget.value === true || widget.value === 1 || widget.value === "1" || widget.value === "true";
}

function lmsSettleBatchMediaPorts(node) {
    if (!Array.isArray(node?.inputs)) return false;
    const conflict = lmsBatchModeOn(node) && lmsLinkedMediaPorts(node).length > 0;
    if (conflict === !!node._lmsBatchPortsLocked) return false;
    node._lmsBatchPortsLocked = conflict;
    if (conflict) showToast($t("batchMediaConflict"), "warning");
    return false;
}

function lmsSettleMediaNode(node, options = {}) {
    if (!Array.isArray(node?.inputs) || node._lmsMediaSocketSyncing) return;
    node._lmsMediaSocketSyncing = true;
    try {
        const batchSettled = lmsSettleBatchMediaPorts(node);
        const linked = lmsLinkedMediaPorts(node);
        const preferred = options.preferredName && linked.some((slot) => slot.name === options.preferredName)
            ? options.preferredName
            : null;
        const keepName = preferred ?? linked.sort((a, b) => (Number(b.link) || 0) - (Number(a.link) || 0))[0]?.name;
        const switched = keepName ? lmsReleaseMediaPorts(node, keepName) : false;
        const plan = lmsMediaSocketPlan(node);
        const restructured = plan.missing.length > 0 || plan.restyled;
        if (restructured) lmsApplyMediaSocketPlan(node, plan);
        if (!switched && !restructured && !batchSettled) return;
        applyNode(node);
        node.setDirtyCanvas?.(true, true);
        if (switched) showToast($t("mediaSocketSwitched"), "info");
    } finally {
        node._lmsMediaSocketSyncing = false;
    }
}

let _lmsTemplateModule = null;

async function loadTemplateManagerModule() {
    if (_lmsTemplateModule) return _lmsTemplateModule;
    const mod = await import("./template_manager.js").catch((err) => {
        console.error("[LMStudio] template manager module failed to load:", err);
        return null;
    });
    if (mod) _lmsTemplateModule = mod;
    return mod;
}

const LMS_WIDGET_ONLY_INPUTS = [
    ...LMS_PANEL_LAYOUT.flatMap((card) => card.fields.map((field) => ({
        name: field.name,
        labelKey: field.labelKey,
    }))),
    { name: "endpoint", labelKey: "serviceEndpoint" },
];
const LMS_WIDGET_ONLY_BY_NAME = new Map(LMS_WIDGET_ONLY_INPUTS.map((entry) => [entry.name, entry]));
const LMS_NATIVE_WIDGET_TYPES = { user_prompt: "customtext", system_prompt: "customtext", endpoint: "text" };

function lmsDropWidgetOnlyInputs(node) {
    if (!Array.isArray(node?.inputs)) return false;
    const victims = node.inputs
        .map((slot, index) => ({ slot, index }))
        .filter(({ slot }) => slot && LMS_WIDGET_ONLY_BY_NAME.has(slot.name))
        .sort((a, b) => b.index - a.index);
    if (!victims.length) return false;
    const wired = victims.filter(({ slot }) => slot.link != null);
    node.graph?.beforeChange?.();
    for (const { index } of victims) {
        if (node.inputs[index]?.link != null) node.disconnectInput?.(index, true);
        node.removeInput?.(index);
    }
    for (const [name, widgetType] of Object.entries(LMS_NATIVE_WIDGET_TYPES)) {
        const widget = node.widgets?.find((entry) => entry.name === name);
        if (widget?.type === "converted-widget") widget.type = widgetType;
    }
    node.graph?.afterChange?.(true);
    applyNode(node);
    node.setDirtyCanvas?.(true, true);
    if (wired.length) {
        const labels = wired.map(({ slot }) => $t(LMS_WIDGET_ONLY_BY_NAME.get(slot.name).labelKey));
        showToast(
            $t("panelOnlyInputsCut").replace("{fields}", labels.join(getLocale() === "zh" ? "、" : ", ")),
            "warning"
        );
    }
    return true;
}

app.registerExtension({
    name: LMSTUDIO_EXT_ID,
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "LMStudioNode") {
            nodeType.prototype.onResize = function(size) {
                if (size[0] < LMS_PANEL_MIN_WIDTH) {
                    this.setSize([LMS_PANEL_MIN_WIDTH, size[1]]);
                }
            };

            const computeNodeSize = nodeType.prototype.computeSize;
            nodeType.prototype.computeSize = function(out) {
                const size = computeNodeSize.call(this, out);
                const widget = this._lmsPanel?.widget;
                if (!this.flags?.collapsed && widget?.y != null && widget.computedHeight > 0) {
                    size[1] = Math.round(widget.y + widget.computedHeight);
                }
                return size;
            };

            nodeType.prototype._createParamPanel = function() {
                if (this._lmsPanel) return this._lmsPanel;

                hideLMSParamWidgets(this);

                const api = createLMSPanel(this);
                const host = api.host;
                const panelEl = api.panel;

                const domWidget = this.addDOMWidget("lmstudio_param_panel", "div", host, {});
                domWidget.serialize = false;
                domWidget.computeSize = function(width) {
                    const minWidth = Math.max(LMS_PANEL_MIN_WIDTH, width || LMS_PANEL_MIN_WIDTH);
                    return [minWidth, measureElementHeight(panelEl) + LMS_PANEL_HEIGHT_PAD];
                };

                api.widget = domWidget;
                this._lmsPanel = api;
                this._panelControls = api.controls;

                this._attachCardActions(api);

                setTimeout(() => {
                    if (!this.graph) return;
                    if (this.size[0] < LMS_PANEL_MIN_WIDTH) {
                        this.setSize([LMS_PANEL_MIN_WIDTH, this.size[1]]);
                    }
                    api.sync();
                    api.resize();
                }, 0);
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

            nodeType.prototype._syncParamPanel = function() {
                this._validatePresetPrompt();
                this._lmsPanel?.sync();
            };

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
                    const anchor = actions.querySelector(".lms-field");
                    buttons.forEach((el) => {
                        if (!el) return;
                        if (anchor) actions.insertBefore(el, anchor);
                        else actions.appendChild(el);
                    });
                });

                const refreshEl = this._refreshModelButtonEl;
                const modelControl = panel.controls?.get("model")?.el
                    ?.querySelector(".lms-control");
                if (refreshEl && modelControl) {
                    modelControl.insertBefore(refreshEl, modelControl.firstChild);
                }

                window.setTimeout(() => {
                    if (!this.graph) return;
                    groups.forEach((_buttons, cardId) => {
                        panel.cards?.get(cardId)?.head?.querySelectorAll("select")
                            ?.forEach((sel) => fitLMSSelectWidth(sel));
                    });
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

            nodeType.prototype._createLogPanel = function() {
                const panel = this._lmsPanel?.panel;
                if (!panel) return;

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

                const body = document.createElement("div");
                body.className = "lms-card__body";

                const fields = document.createElement("div");
                fields.className = "lms-fields";

                const textEl = document.createElement("div");
                textEl.className = "lms-log__text";
                textEl.setAttribute("role", "log");
                textEl.setAttribute("aria-live", "polite");
                fields.appendChild(textEl);

                body.appendChild(fields);
                card.appendChild(head);
                card.appendChild(body);
                panel.appendChild(card);

                const refreshLabels = () => {
                    title.textContent = $t("cardLog");
                    clearBtn.textContent = $t("clearLog");
                    clearBtn.setAttribute("aria-label", $t("clearLog"));
                    if (textEl.dataset.empty !== "false") this._clearLogPanel();
                };

                this._logPanelHost = card;
                this._logTextEl = textEl;
                this._refreshLogPanelLabels = refreshLabels;

                refreshLabels();

                this._lmsPanel?.resize();

                this._loadLMStudioConfig();
            };

            nodeType.prototype._clearLogPanel = function() {
                this._logInfoI18n = null;
                const textEl = this._logTextEl;
                if (!textEl) return;
                textEl.textContent = $t("noLogYet");
                textEl.dataset.empty = "true";
                this._lmsPanel?.resize();
            };
            
            nodeType.prototype._loadLMStudioConfig = async function() {
                try {
                    const response = await fetch("/zhiai/lmstudio/config");
                    if (response.ok) {
                        const config = await response.json();
                        const showLog = config.show_log_panel !== false;
                        this.lmstudioState.showLogPanel = showLog;
                        if (this._logPanelHost) {
                            this._logPanelHost.style.display = showLog ? "block" : "none";
                        }
                        this._lmsPanel?.resize();
                        
                        const savedPreset = config.preset || "Ignore";
                        const presetName = LMS_PARAM_PRESETS[savedPreset] ? savedPreset : "Ignore";
                        this.lmstudioState.lastParamPreset = presetName;
                        if (this._presetSelect) {
                            this._presetSelect.value = presetName;
                        }
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
                this._lmsPanel?.resize();
            };
            
            nodeType.prototype._createNodeActions = function() {
                const getSystemPromptWidget = () => this.widgets?.find(w => w.name === "system_prompt");
                const getPromptInput = () => getSystemPromptWidget()?.inputEl || null;
                const getPromptControl = () => this._panelControls?.get("system_prompt") || null;

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
                        const rect = templateButton.el.getBoundingClientRect();
                        loadTemplateManagerModule().then((mod) => {
                            if (!mod?.toggleTemplatePicker) return;
                            mod.toggleTemplatePicker({
                                anchorRect: rect,
                                theme: mod.TEMPLATE_MANAGER_THEME_GLASS,
                                onPick: (template) => {
                                    const widget = getLMSWidget(this, "system_prompt");
                                    if (!widget) return;
                                    writeLMSWidget(this, widget, template.content);
                                    this._lmsPanel?.sync();
                                },
                                onManage: () => mod.openTemplateManagerDialog({
                                    theme: mod.TEMPLATE_MANAGER_THEME_GLASS,
                                }),
                            });
                        });
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
                
                this._cardActionButtons = new Map([
                    ["prompt", [templateButton.el, restoreButton.el, clearButton.el]],
                    ["inference", [presetWrapper]],
                ]);
                this._refreshModelButtonEl = refreshButton.el;

                this._templateBtn = templateButton.el;
                this._clearBtn = clearButton.el;
                this._restoreBtn = restoreButton.el;
            };
            
            nodeType.prototype._hideEndpointWidget = function() {
                const widget = this.widgets?.find(w => w.name === "endpoint");
                if (!widget) return;
                widget.hidden = true;
                if (widget.options && typeof widget.options === "object") widget.options.hidden = true;
                hideNativeWidgetElement(widget);
                this.setDirtyCanvas(true, true);
            };
            
            const validateSelectWidget = (node, name) => {
                const widget = node.widgets?.find(w => w.name === name);
                const values = widget?.options?.values;
                if (!widget || !Array.isArray(values) || values.length === 0) return false;
                if (values.includes(widget.value)) return false;
                widget.value = values[0];
                return true;
            };

            const validateOutputLanguage = (node) => {
                const widget = node.widgets?.find(w => w.name === "output_language");
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

            const stripLegacyIgnorePreset = (node) => {
                const widget = node.widgets?.find(w => w.name === "preset_prompt");
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

            const validateVideoFrames = (node) => {
                const widget = node.widgets?.find(w => w.name === "video_frames");
                if (!widget) return false;
                const value = Number(widget.value);
                if (Number.isFinite(value)) return false;
                const fallback = Number(widget.options?.default);
                widget.value = Number.isFinite(fallback) ? fallback : 4;
                return true;
            };

            nodeType.prototype._validatePresetPrompt = function() {
                const changed = [
                    stripLegacyIgnorePreset(this),
                    validateSelectWidget(this, "preset_prompt"),
                    validateOutputLanguage(this),
                    validateVideoFrames(this),
                ].some(Boolean);
                if (changed) this.setDirtyCanvas(true, true);
            };
            
            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function() {
                const result = onConfigure ? onConfigure.apply(this, arguments) : undefined;
                this._validatePresetPrompt();
                window.setTimeout(() => {
                    lmsDropWidgetOnlyInputs(this);
                    lmsSettleMediaNode(this);
                    lmsEnsureTextPort(this);
                    this._syncParamPanel?.();
                    this._lmsPanel?.resize();
                }, 0);
                return result;
            };

            const onConnectionsChange = nodeType.prototype.onConnectionsChange;
            nodeType.prototype.onConnectionsChange = function(connectionType, slotIndex, connected) {
                const result = onConnectionsChange ? onConnectionsChange.apply(this, arguments) : undefined;
                const isInputSlot = connectionType === (globalThis.LiteGraph?.INPUT ?? 1);
                const changedSlot = isInputSlot && connected ? this.inputs?.[slotIndex] : null;
                const dockedMedia = changedSlot?.link != null && LMS_IS_MEDIA_SLOT(changedSlot.name) ? changedSlot.name : null;
                window.setTimeout(() => {
                    lmsDropWidgetOnlyInputs(this);
                    lmsSettleMediaNode(this, { preferredName: dockedMedia });
                    lmsEnsureTextPort(this);
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
                lmsDropWidgetOnlyInputs(this);
                lmsSettleMediaNode(this);
                lmsEnsureTextPort(this);
                

                
                this._createLogPanel();
                
                this._hideEndpointWidget();
                
                return result;
            };
            
            nodeType.prototype._fetchModelsFromServer = async function(endpoint) {
                try {
                    const response = await fetch("/zhiai/lmstudio/refresh_models", {
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

                modelWidget.options.values = [LMS_NO_MODELS_PLACEHOLDER];
                modelWidget.value = LMS_NO_MODELS_PLACEHOLDER;
                this._syncParamPanel?.();
                showToast($t('refreshModelsFailed'), "error");
                return false;
            };
            
            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function(message) {
                onExecuted?.apply(this, arguments);

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

            const drawFg = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const currentLocale = getLocale();
                if (this._lmstudioHelpLocale !== currentLocale) {
                    this._lmstudioHelpLocale = currentLocale;
                    this._syncPresetSelectOptions();
                    this._lmsPanel?.refreshLabels();
                    this._refreshLogPanelLabels?.();
                    lmsApplyTextPortLabel(this);
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

                if (this._lmstudioSettingsOpen && !document.querySelector(".lms-modal")) {
                    this._lmstudioSettingsOpen = false;
                }
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

                ctx.save();
                ctx.translate(settingsX, y);
                ctx.scale(iconSize / 32, iconSize / 32);
                drawNodeTitleChip(ctx, settingsActive);
                drawNodeSettingsButton(ctx, settingsActive);
                ctx.restore();

                const helpActive = !!this._lmstudioHelp || !!this._lmstudioHelpHovered;
                ctx.save();
                ctx.translate(helpX, y);
                ctx.scale(iconSize / 32, iconSize / 32);
                drawNodeHelpButton(ctx, helpActive);

                ctx.restore();
                return r;
            };

            nodeType.prototype._titleIconLeft = function (kind) {
                const helpX = this.size[0] - iconSize - iconMargin;
                return kind === "help" ? helpX : helpX - iconSize - iconGap;
            };

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
                    hideTitleTip();
                    document.querySelector(".lms-dropdown")?.remove();
                    this._lmstudioSettingsOpen = true;
                    showLMStudioSettings(this);
                    return true;
                }
                if (this._hitTitleIcon(localPos, "help")) {
                    hideTitleTip();
                    this._lmstudioHelp = !this._lmstudioHelp;
                    return true;
                }
                return r;
            };

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
                const locale = getLocale();
                if (settingsHovered) {
                    titleTipHovered(true, locale === "zh" ? "节点设置" : "Node Settings", e);
                } else if (helpHovered) {
                    titleTipHovered(true, locale === "zh" ? "节点帮助" : "Node help", e);
                } else {
                    hideTitleTip();
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
                hideTitleTip();
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


function showLMStudioSettings(node) {
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
        width: clamp(820px, 94vw, 1104px);
        height: auto;
        max-height: 90vh;
        background: ${LMS_TOKENS.color.glassDeep};
        border: 1px solid ${LMS_TOKENS.color.line};
        border-radius: 12px;
        outline: none;
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
                background: linear-gradient(180deg, #0e1a2e, #070e1b);
                border: 1px solid ${LMS_TOKENS.color.line};
                overflow: hidden;
            }
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
                min-height: 50px;
                border-bottom: 1px solid ${LMS_TOKENS.color.line};
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
                padding: 5px 15px;
                line-height: 1;
                font-family: inherit;
                font-size: var(--fs-body);
                font-weight: 500;
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.primary};
                border: none;
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

            #${uniqueId} .dashboard-item--inline {
                flex-direction: row;
                align-items: baseline;
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
                font-variant-numeric: tabular-nums;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
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
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
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
            #${uniqueId} .dashboard-item--endpoint {
                align-items: center;
                gap: 10px;
                padding: 5px 10px;
            }
            #${uniqueId} .dashboard-item--endpoint .endpoint-input {
                flex: 0 1 auto;
                width: 260px;
                min-width: 0;
                padding: 2px 8px;
                line-height: var(--lh-tight);
            }
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

            #${uniqueId} .timeout-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
            }
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
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: var(--fs-label);
                line-height: var(--lh-tight);
                color: ${LMS_TOKENS.color.text};
            }
            #${uniqueId} .timeout-input {
                flex: 0 0 auto;
                width: 65px;
                padding: 2px 8px;
                -moz-appearance: textfield;
                appearance: textfield;
            }
            #${uniqueId} .timeout-input::-webkit-outer-spin-button,
            #${uniqueId} .timeout-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
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
            #${uniqueId} .log-panel-title { font-size: var(--fs-body); font-weight: 600; line-height: var(--lh-tight); color: ${LMS_TOKENS.color.textBright}; }
            #${uniqueId} .log-panel-checkbox { display: inline-flex; align-items: center; margin-left: auto; user-select: none; }
            #${uniqueId} .log-panel-hint { font-size: var(--fs-label); line-height: var(--lh-base); color: ${LMS_TOKENS.color.textFaint}; }
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
                margin: 0;
                box-sizing: border-box;
                min-width: 16px;
                max-width: 16px;
                min-height: 16px;
                max-height: 16px;
                border-radius: 50%;
                background-color: rgba(2, 6, 23, 0.5);
                background-clip: padding-box;
                border: 1px solid ${LMS_TOKENS.color.line};
                cursor: pointer;
                transition: background-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing},
                            border-color ${LMS_TOKENS.motion.fast} ${LMS_TOKENS.motion.easing};
            }
            #${uniqueId} .folder-read-mode-option input[type="radio"]:checked {
                border-color: ${LMS_TOKENS.color.primary};
                background-color: ${LMS_TOKENS.color.primary};
                background-clip: padding-box;
            }
            #${uniqueId} .folder-read-mode-option-label {
                flex: 0 0 auto;
                white-space: nowrap;
                font-size: var(--fs-body);
                font-weight: 600;
                line-height: var(--lh-tight);
                color: ${LMS_TOKENS.color.textBright};
            }
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
            #${uniqueId} .save-section__hint {
                font-size: var(--fs-label);
                line-height: var(--lh-base);
                color: ${LMS_TOKENS.color.textFaint};
            }
            #${uniqueId} .reset-default-btn {
                margin-left: auto;
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
                color: #FFFFFF;
                background: ${LMS_TOKENS.action.neutralHover};
            }
            #${uniqueId} .reset-default-btn:focus-visible,
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
            <footer class="save-section">
                <span class="save-section__hint">${$t('autoSaveHint')}</span>
                <button class="reset-default-btn" type="button" id="lmstudio-reset-default">${$t('resetDefault')}</button>
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

    const refreshBtn = dialog.querySelector(".dashboard-refresh");
    const endpointInput = dialog.querySelector("#lmstudio-endpoint-input");
    const getEndpointWidget = () => node.widgets?.find(w => w.name === "endpoint");
    endpointInput.value = normalizeEndpoint(getEndpointWidget()?.value) || LMS_DEFAULT_ENDPOINT;

    closeBtn.onclick = async () => {
        await flushAutoSave();
        if (isSettingsDirty()) {
            showConfirm($t('settingsUnsavedClose'), async () => {
                await saveAllSettings();
                close();
            }, () => {
                if (savedSettings) applySettingsSnapshot(savedSettings);
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
    
    refreshBtn.onclick = async () => {
        await flushAutoSave();
        refreshDashboard();
    };
    
    const resetDefaultBtn = dialog.querySelector("#lmstudio-reset-default");
    const timeoutFetchInput = dialog.querySelector("#lmstudio-timeout-fetch");
    const timeoutApiInput = dialog.querySelector("#lmstudio-timeout-api");
    const timeoutListInput = dialog.querySelector("#lmstudio-timeout-list");
    const timeoutUnloadInput = dialog.querySelector("#lmstudio-timeout-unload");
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
            btn.onmousedown = (e) => e.preventDefault();
            btn.onclick = () => {
                if (isUp) input.stepUp(); else input.stepDown();
                scheduleAutoSave(260);
            };
            stepper.appendChild(btn);
        });
        wrap.appendChild(stepper);
    });
    let originalPromptVersion = "default";
    const showLogPanelSwitch = createLmsSwitchElement({ id: "lmstudio-show-log-panel-switch", label: $t("enableLogPanel") });
    const showLogPanelBox = dialog.querySelector("#lmstudio-show-log-panel-box");
    showLogPanelBox.appendChild(showLogPanelSwitch.el);
    
    const loadConfig = async () => {
        try {
            const response = await fetch("/zhiai/lmstudio/config");
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
        savedSettings = readSettingsSnapshot();
    };

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

    const saveAllSettings = async (silent = false) => {
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
            const response = await fetch("/zhiai/lmstudio/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });

            if (response.ok) {
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

                if (!silent) showToast($t('saveSuccess'), "success");
                return true;
            }
            showToast($t('saveFailed'), "error");
        } catch (e) {
            showToast($t('saveFailed') + ": " + e.message, "error");
        }
        return false;
    };

    let autoSaveTimer = null;
    let autoSaveInFlight = null;

    const runAutoSave = async () => {
        autoSaveTimer = null;
        if (!isSettingsDirty()) return;
        autoSaveInFlight = saveAllSettings(true);
        try {
            await autoSaveInFlight;
        } finally {
            autoSaveInFlight = null;
        }
    };

    const scheduleAutoSave = (delay = 0) => {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(runAutoSave, delay);
    };

    const flushAutoSave = async () => {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
            await runAutoSave();
        }
        if (autoSaveInFlight) await autoSaveInFlight;
    };

    endpointInput.addEventListener("change", () => scheduleAutoSave());
    showLogPanelSwitch.el.addEventListener("lms-change", () => scheduleAutoSave());
    dialog.querySelectorAll('input[name="folder_read_mode"]').forEach((radio) => {
        radio.addEventListener("change", () => scheduleAutoSave());
    });
    dialog.querySelectorAll(".timeout-input").forEach((input) => {
        input.addEventListener("change", () => {
            const value = parseInt(input.value, 10);
            const min = parseInt(input.min, 10);
            const max = parseInt(input.max, 10);
            let next = Number.isFinite(value) ? value : parseInt(input.defaultValue, 10);
            if (Number.isFinite(min)) next = Math.max(min, next);
            if (Number.isFinite(max)) next = Math.min(max, next);
            if (String(next) !== input.value) input.value = String(next);
            scheduleAutoSave(260);
        });
    });

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
                    const response = await fetch("/zhiai/lmstudio/config", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(config)
                    });

                    if (response.ok) {
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
