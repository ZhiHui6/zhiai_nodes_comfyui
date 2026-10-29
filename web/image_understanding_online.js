import { app } from "/scripts/app.js";
import { drawNodeHelpButton, drawNodeSettingsButton, titleTipHovered, hideTitleTip } from "./node_title_icons.js";
import { api } from "/scripts/api.js";
import {
    attachPanelTooltip,
    createPanel,
    createIconButton,
    hideNativeWidget,
    hidePanelTooltip,
    measureElementHeight,
} from "./panel_kit.js";

const QVL_TOKENS = {
    color: {
        base: "#070D1A",
        glass: "rgba(9, 17, 32, 0.74)",
        glassDeep: "rgba(23, 36, 58, 0.94)",
        glassSoft: "rgba(59, 130, 246, 0.08)",
        glassHover: "rgba(59, 130, 246, 0.16)",
        border: "rgba(96, 165, 250, 0.18)",
        borderHi: "rgba(147, 197, 253, 0.42)",
        line: "#34577F",
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

const CUSTOM_CONFIG_KEYS = ['custom_1', 'custom_2', 'custom_3', 'custom_4', 'custom_5', 'custom_6'];

const QVL_NODE_MIN_WIDTH = 367;
const QVL_NODE_MIN_HEIGHT = 428;
const QVL_NODE_DEFAULT_WIDTH = 550;
const QVL_NODE_DEFAULT_HEIGHT = 840;

const IUO_OUTPUT_LANGUAGES = ["Chinese", "English", "Chinese&English"];

const QVL_ICONS = {
    sliders: '<line x1="4" y1="7" x2="20" y2="7"/><circle cx="9.5" cy="7" r="2.1"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="15" cy="17" r="2.1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14.5 14.5 0 0 1 0 18a14.5 14.5 0 0 1 0-18z"/>',
    layers: '<path d="m12 2.6 9 4.7-9 4.7-9-4.7z"/><path d="m3 12.6 9 4.7 9-4.7"/><path d="m3 17.4 9 4.7 9-4.7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.6 14.1"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="3.2"/><polyline points="7.4 9.4 10.4 12.4 7.4 15.4"/><line x1="12.8" y1="15.4" x2="17" y2="15.4"/>',
    folder: '<path d="M3 7.2A2.2 2.2 0 0 1 5.2 5h3.4l1.9 2.2H19A2.2 2.2 0 0 1 21 9.4v8.4A2.2 2.2 0 0 1 18.8 20H5.2A2.2 2.2 0 0 1 3 17.8z"/>',
    close: '<line x1="6.4" y1="6.4" x2="17.6" y2="17.6"/><line x1="17.6" y1="6.4" x2="6.4" y2="17.6"/>',
    clear: '<rect x="3" y="3" width="18" height="18" rx="5"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/>',
    check: '<polyline points="5 12.8 9.8 17.6 19 6.4"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><polyline points="7.8 12.4 10.9 15.4 16.4 9"/>',
    ban: '<circle cx="12" cy="12" r="9"/><line x1="5.9" y1="5.9" x2="18.1" y2="18.1"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.6"/><circle cx="12" cy="7.8" r="1"/>',
    eye: '<path d="M2.2 12S5.6 5.8 12 5.8 21.8 12 21.8 12 18.4 18.2 12 18.2 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="3.1"/>',
    eyeOff: '<path d="M10.6 5.9A9.6 9.6 0 0 1 12 5.8c6.4 0 9.8 6.2 9.8 6.2a17 17 0 0 1-3 3.7"/><path d="M6.4 6.6A16.7 16.7 0 0 0 2.2 12S5.6 18.2 12 18.2a9.5 9.5 0 0 0 4-.85"/><line x1="3.4" y1="3.4" x2="20.6" y2="20.6"/>',
    refresh: '<path d="M20.6 12a8.6 8.6 0 1 1-2.6-6.1"/><polyline points="20.6 4.3 20.6 9.5 15.4 9.5"/>',
    restore: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
    download: '<path d="M12 3.5v11"/><polyline points="7.6 10.2 12 14.6 16.4 10.2"/><path d="M4.5 19.5h15"/>',
    upload: '<path d="M12 20.5v-11"/><polyline points="7.6 13.8 12 9.4 16.4 13.8"/><path d="M4.5 4.5h15"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m6 6 1 14h10l1-14"/>',
    link: '<path d="M9.6 14.4 14.4 9.6"/><path d="M7.7 10.3 5.6 12.4a3.5 3.5 0 0 0 5 5l2.1-2.1"/><path d="M16.3 13.7l2.1-2.1a3.5 3.5 0 0 0-5-5l-2.1 2.1"/>',
    book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H6a2 2 0 0 1 0-4h14"/><path d="M4 4.5A1.5 1.5 0 0 1 5.5 6H20"/>',
    plug: '<path d="M9 2v6"/><path d="M15 2v6"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    chevronDown: '<polyline points="6.5 9.5 12 15 17.5 9.5"/>',
    chevronRight: '<polyline points="9.5 6.5 15 12 9.5 17.5"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
};

function qvlSvg(iconKey, size) {
    const glyph = QVL_ICONS[iconKey] || "";
    const dim = size || 16;
    return '<svg viewBox="0 0 24 24" width="' + dim + '" height="' + dim + '" fill="none" stroke="currentColor" '
        + 'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + glyph + "</svg>";
}

const _qvlStyleChunks = new Set();

function injectQVLStyles(chunkId, css) {
    if (_qvlStyleChunks.has(chunkId)) return;
    _qvlStyleChunks.add(chunkId);
    let styleEl = document.getElementById("iuo-ui-styles");
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "iuo-ui-styles";
        document.head.appendChild(styleEl);
    }
    styleEl.appendChild(document.createTextNode("\n/* " + chunkId + " */\n" + css));
}

let _templateModule = null;

async function loadTemplateModule() {
    if (_templateModule) return _templateModule;
    const mod = await import("./template_manager.js").catch((err) => {
        console.error("[ImageUnderstandingOnline] template manager module failed to load:", err);
        return null;
    });
    if (mod) _templateModule = mod;
    return mod;
}

const i18n = {
    zh: {
        settings: "设置",
        settingsTitle: "图像理解在线版设置",
        configApiKeys: "配置各平台的API地址、模型名称与密钥。配置后可在节点上直接切换使用。",
        statusBarTitle: "推理日志",
        statusBarIdle: "暂无日志，运行节点后在此显示推理信息",
        cardInference: "推理参数",
        cardPrompt: "提示词",
        fieldUserPrompt: "用户提示词",
        fieldSystemPrompt: "系统提示词",
        fieldPlatform: "平台",
        fieldPlatformModel: "平台与模型",
        fieldModel: "模型",
        modelList: "模型列表",
        modelAddShort: "添加",
        modelInputPlaceholder: "输入模型 ID，回车或点击添加",
        modelEmpty: "尚未添加模型",
        modelDuplicate: "该模型已在列表中",
        modelEmptyValue: "模型 ID 不能为空",
        modelNotConfigured: "未配置模型",
        removeModelRow: "移除此模型",
        modelProbe: "拉取模型",
        modelProbeTip: "用当前卡片的 API 地址与密钥，向上游拉取可用模型列表",
        modelProbeRunning: "拉取中…",
        modelProbeEmpty: "上游未返回任何模型",
        modelProbeFailed: "拉取失败",
        modelProbeNoApiBase: "请先填写 API 地址，再拉取模型列表",
        modelProbeNeedConfig: "请先填写 API 地址与密钥",
        modelProbeRefresh: "重新拉取",
        modelProbeBack: "返回",
        modelProbeSearchPlaceholder: "搜索模型…",
        modelProbeSelectAll: "全选",
        modelProbeClearSelection: "清空",
        modelProbeAddSelected: "添加选中",
        modelProbeGroupAdd: "整组加",
        modelProbeGroupOthers: "其他",
        modelProbeAddedToast: "已添加 {n} 个模型",
        modelProbeNoneSelected: "请先勾选要添加的模型",
        modelProbeNoMatch: "没有匹配的模型",
        modelProbeCount: "[{added}/{total}]",
        modelProbeUpdatedAt: "更新于 {time}",
        modelBulkDedupe: "去重",
        modelBulkDedupeTip: "移除列表中重复的模型",
        modelBulkSort: "排序",
        modelBulkSortTip: "按字母顺序重新排列模型",
        modelBulkClear: "清空",
        modelBulkClearTip: "清空当前卡片的模型列表",
        modelDedupeNone: "没有重复的模型",
        modelDedupeDone: "已移除 {n} 个重复项",
        modelSortDone: "已按字母排序",
        modelClearDone: "已清空模型列表",
        modelClearConfirm: "确定清空当前卡片的模型列表吗？",
        modelProbeResult: "模型列表",
        modelProbeIdle: "尚未拉取，点击上方按钮拉取模型列表",
        fieldUsePreset: "使用预设",
        fieldPresetPrompt: "模式",
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
        outputLanguageChinese: "中文",
        outputLanguageEnglish: "英文",
        outputLanguageBoth: "中英",
        userPromptPlaceholder: "自定义发送给模型的指令或问题，关闭「使用预设」后生效",
        systemPromptPlaceholder: "设定模型的角色与回复规则，仅在关闭「使用预设」时生效",
        fieldSizeLimitation: "图像边长",
        fieldMaxTokens: "最大词元数",
        fieldTemperature: "温度",
        fieldRepetitionPenalty: "重复惩罚",
        fieldTopK: "Top K采样",
        fieldTopP: "Top P采样",
        fieldSeed: "随机种子",
        fieldSeedControl: "生成后控制",
        seedCtlFixed: "固定",
        seedCtlIncrement: "递增",
        seedCtlDecrement: "递减",
        seedCtlRandomize: "随机",
        statusBarClear: "清除状态信息",
        statusBarEnableLabel: "显示状态栏",
        statusBarClearLabel: "清屏",
        statusBarCleared: "已清除状态信息",
        presetIgnore: "不使用预设",
        presetPromptGeneral: "通用标注",
        presetPromptDetailed: "专业详细",
        presetPromptCharacter: "角色特征",
        presetPromptScene: "场景分析",
        presetPromptStyle: "风格识别",
        presetPromptDiff: "差异比对",
        restoreDefault: "恢复初始",
        exportConfig: "导出配置",
        importConfig: "导入配置",
        apply: "应用",
        cancel: "取消",
        platform: "平台",
        apiKey: "API密钥",
        apiKeyDesc: "请输入平台的API密钥",
        customModel: "自定义模型",
        customModelDesc: "自定义模型名称（可选）",
        customBaseUrl: "自定义Base URL",
        customBaseUrlDesc: "自定义API请求地址（可选）",
        addPlatform: "添加平台",
        addCustomPlatform: "添加自定义平台",
        editPlatform: "编辑平台",
        deleteFailed: "删除失败",
        saveFailed: "保存失败",
        saveSuccess: "保存成功",
        invalidJson: "无效的JSON格式",
        importSuccess: "导入成功",
        importFailed: "导入失败",
        apiKeyLabel: "API密钥:",
        customConfig: "自定义配置{num}",
        imageSlotLabel: "图像输入",
        textPortSlotLabel: "文本提示词",
        textPortNote: "提示词由文本端口提供",
        linkedByInput: "由输入连线控制",
        panelOnlyInputsCut: "以下参数只在面板内填写，已断开接入它们的连线：{fields}",
        cardBatch: "批处理",
        batchNeedsRestart: "需重启 ComfyUI 后端后生效",
        fieldBatchMode: "批处理模式",
        fieldBatchFolder: "批处理路径",
        fieldSkipExists: "跳过重复",
        batchFolderPlaceholder: "例如 D:\\dataset\\images",
        folderPickBtn: "设定",
        folderPickTooltip: "选择批处理文件夹；也可把文件夹直接拖到输入框，或手动输入 / 粘贴路径",
        folderDropNoPath: "浏览器安全限制：无法读取拖入文件夹的完整路径，请点击「设定」选择目录",
        folderPickFailed: "未能获取文件夹路径",
        folderNotFound: "未能自动定位该文件夹，请点击「设定」选择目录",
        folderLocateUnavailable: "定位接口不可用，请重启 ComfyUI 后重试（或直接点击「设定」）",
        folderReadMode: "文件夹读取模式",
        recursiveMode: "递归遍历模式",
        recursiveModeDesc: "一次性遍历所有子文件夹",
        sequentialMode: "顺序轮次模式",
        sequentialModeDesc: "按文件夹名称顺序依次处理",
        batchConfigSaved: "批处理设置已保存",
        batchConfigFailed: "批处理设置保存失败",
        configNameLabel: "配置名称",
        apiAddress: "API地址:",
        apiAddressPlaceholder: "https://api.example.com/v1/chat/completions",
        apiKeyPlaceholderCustom: "your-api-key-here",
        showHidePassword: "显示/隐藏密码",
        configSaved: "配置已保存",
        configSaveFailed: "配置保存失败，请重试。",
        noConfig: "无配置可导出",
        importSuccessMsg: "配置导入成功，已更新为新配置",
        importFailedMsg: "配置导入失败，JSON格式无效。",
        deleteConfirm: "确定要删除此自定义配置吗？",
        deleteSuccess: "删除成功",
        deleteError: "删除失败，请重试",
        inputApiKey: "请输入API密钥",
        selectModel: "请选择模型",
        selectPlatform: "请选择平台",
        confirmRestoreDefault: "确定要恢复初始配置吗？这将清空所有当前设置。",
        restoreDefaultSuccess: "已恢复初始配置并已自动保存！",
        restoreDefaultFailed: "已恢复初始配置，但保存失败，请稍后重试或手动保存。",
        exportSuccess: "配置导出成功！",
        exportFailed: "导出配置失败，请重试。",
        confirmImportConfig: "确定要导入配置文件吗？这将覆盖当前的所有设置。",
        importError: "导入失败：{error}",
        templateTooltip: "点击选择系统提示词模板",
        clearTooltip: "点击清空当前输入框内容",
        restoreTooltip: "点击恢复上次清空的内容",
        resetInferenceLabel: "恢复初始",
        resetInferenceTooltip: "点击把推理参数恢复为初始值",
        resetInferenceDone: "已恢复初始参数",
        resetInferenceNone: "推理参数已是初始值",
        clearContent: "已清空内容",
        restoreContent: "已恢复内容",
        noContentToClear: "没有可清空的内容",
        noContentToRestore: "没有可恢复的内容",
        checking: "加载中...",
        helpTitle: "图像理解在线版节点",
        helpDescription: "通过任意 OpenAI 兼容的在线多模态接口进行图像理解，可在节点上切换平台。",
        helpFeatures: "功能特性",
        helpFeature1: "支持任意 OpenAI 兼容服务：填写 API 地址、模型名称与密钥即可",
        helpFeature2: "支持多套自定义配置，并在节点上直接切换",
        helpFeature3: "支持系统提示词模板管理",
        helpFeature4: "支持单图与多图输入（多图按一次提问处理）",
        helpUsage: "使用说明",
        helpUsage1: "在设置中配置好各平台的地址、模型与密钥",
        helpUsage2: "在节点的平台下拉中选择要使用的配置",
        helpUsage3: "输入提示词和图像进行图像理解",
        helpInput: "输入",
        helpInputDesc: "图像输入（单张或图像列表）；提示词在面板的「用户提示词 / 系统提示词」中填写",
        helpOutput: "输出",
        helpOutputDesc: "返回模型生成的文本回复"
    },
    en: {
        settings: "Settings",
        settingsTitle: "Image Understanding Online Settings",
        configApiKeys: "Configure the API address, model name and key for each platform. Once saved, they can be switched right on the node.",
        statusBarTitle: "Inference Log",
        statusBarIdle: "No log yet. Run the node to see inference details.",
        cardInference: "Inference",
        cardPrompt: "Prompt",
        fieldUserPrompt: "User Prompt",
        fieldSystemPrompt: "System Prompt",
        fieldPlatform: "Platform",
        fieldPlatformModel: "Platform & Model",
        fieldModel: "Model",
        modelList: "Models",
        modelAddShort: "Add",
        modelInputPlaceholder: "Type a model ID, press Enter or click Add",
        modelEmpty: "No models yet",
        modelDuplicate: "This model is already in the list",
        modelEmptyValue: "Model ID cannot be empty",
        modelNotConfigured: "No model configured",
        removeModelRow: "Remove this model",
        modelProbe: "Fetch models",
        modelProbeTip: "Fetch the available models from this card's API address and key",
        modelProbeRunning: "Fetching…",
        modelProbeEmpty: "The provider returned no models",
        modelProbeFailed: "Fetch failed",
        modelProbeNoApiBase: "Fill in the API address before fetching models",
        modelProbeNeedConfig: "Fill in the API address and key first",
        modelProbeRefresh: "Fetch again",
        modelProbeBack: "Back",
        modelProbeSearchPlaceholder: "Search models…",
        modelProbeSelectAll: "Select all",
        modelProbeClearSelection: "Clear",
        modelProbeAddSelected: "Add selected",
        modelProbeGroupAdd: "Add group",
        modelProbeGroupOthers: "Others",
        modelProbeAddedToast: "Added {n} model(s)",
        modelProbeNoneSelected: "Select at least one model first",
        modelProbeNoMatch: "No matching models",
        modelProbeCount: "[{added}/{total}]",
        modelProbeUpdatedAt: "Updated {time}",
        modelBulkDedupe: "Dedupe",
        modelBulkDedupeTip: "Remove duplicate models from the list",
        modelBulkSort: "Sort",
        modelBulkSortTip: "Sort models alphabetically",
        modelBulkClear: "Clear",
        modelBulkClearTip: "Clear this card's model list",
        modelDedupeNone: "No duplicates found",
        modelDedupeDone: "Removed {n} duplicate(s)",
        modelSortDone: "Sorted alphabetically",
        modelClearDone: "Model list cleared",
        modelClearConfirm: "Clear the model list of this card?",
        modelProbeResult: "Models",
        modelProbeIdle: "Not fetched yet — click the button above to load the list",
        fieldUsePreset: "Use Preset",
        fieldPresetPrompt: "Mode",
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
        outputLanguageChinese: "Chinese",
        outputLanguageEnglish: "English",
        outputLanguageBoth: "CN + EN",
        userPromptPlaceholder: "Custom instruction or question sent to the model — applies when “Use Preset” is off",
        systemPromptPlaceholder: "Sets the model's role and response rules — applies only when “Use Preset” is off",
        fieldSizeLimitation: "Image Edge Length",
        fieldMaxTokens: "Max Tokens",
        fieldTemperature: "Temperature",
        fieldRepetitionPenalty: "Repetition Penalty",
        fieldTopK: "Top K",
        fieldTopP: "Top P",
        fieldSeed: "Seed",
        fieldSeedControl: "After-Generate Control",
        seedCtlFixed: "Fixed",
        seedCtlIncrement: "Increment",
        seedCtlDecrement: "Decrement",
        seedCtlRandomize: "Randomize",
        statusBarClear: "Clear status messages",
        statusBarEnableLabel: "Show status bar",
        statusBarClearLabel: "Clear",
        statusBarCleared: "Status messages cleared",
        presetIgnore: "No Preset",
        presetPromptGeneral: "General Caption",
        presetPromptDetailed: "Detailed Analysis",
        presetPromptCharacter: "Character Traits",
        presetPromptScene: "Scene Analysis",
        presetPromptStyle: "Style Recognition",
        presetPromptDiff: "Difference Comparison",
        restoreDefault: "Restore Default",
        exportConfig: "Export Config",
        importConfig: "Import Config",
        apply: "Apply",
        cancel: "Cancel",
        platform: "Platform",
        apiKey: "API Key",
        apiKeyDesc: "Please enter the platform's API key",
        customModel: "Custom Model",
        customModelDesc: "Custom model name (optional)",
        customBaseUrl: "Custom Base URL",
        customBaseUrlDesc: "Custom API request address (optional)",
        addPlatform: "Add Platform",
        addCustomPlatform: "Add Custom Platform",
        editPlatform: "Edit Platform",
        deleteFailed: "Delete failed",
        saveFailed: "Save failed",
        saveSuccess: "Save successful",
        invalidJson: "Invalid JSON format",
        importSuccess: "Import successful",
        importFailed: "Import failed",
        apiKeyLabel: "API Key:",
        customConfig: "Custom Config {num}",
        imageSlotLabel: "Image Input",
        textPortSlotLabel: "Text Prompt",
        textPortNote: "Prompt supplied by the text port",
        linkedByInput: "Controlled by input link",
        panelOnlyInputsCut: "These parameters are filled in the panel only; input links wired to them were removed: {fields}",
        cardBatch: "Batch",
        batchNeedsRestart: "Restart the ComfyUI backend to enable",
        fieldBatchMode: "Batch Mode",
        fieldBatchFolder: "Batch Folder",
        fieldSkipExists: "Skip Existing",
        batchFolderPlaceholder: "e.g. D:\\dataset\\images",
        folderPickBtn: "Set",
        folderPickTooltip: "Pick the batch folder; you can also drag a folder onto the field, or type / paste a path",
        folderDropNoPath: "Browser security prevents reading the full path of a dropped folder. Click “Set” to choose the directory",
        folderPickFailed: "Could not get the folder path",
        folderNotFound: "Could not locate that folder automatically. Click “Set” to choose the directory",
        folderLocateUnavailable: "Locate endpoint unavailable. Restart ComfyUI and retry (or click “Set”)",
        folderReadMode: "Folder Read Mode",
        recursiveMode: "Recursive Mode",
        recursiveModeDesc: "Traverse all subfolders at once",
        sequentialMode: "Sequential Mode",
        sequentialModeDesc: "Process folders in order by name",
        batchConfigSaved: "Batch settings saved",
        batchConfigFailed: "Failed to save batch settings",
        configNameLabel: "Config Name",
        apiAddress: "API Address:",
        apiAddressPlaceholder: "https://api.example.com/v1/chat/completions",
        apiKeyPlaceholderCustom: "your-api-key-here",
        showHidePassword: "Show/Hide Password",
        configSaved: "Configuration saved",
        configSaveFailed: "Failed to save configuration, please try again.",
        noConfig: "No configuration to export",
        importSuccessMsg: "Configuration imported successfully, updated to new configuration",
        importFailedMsg: "Failed to import configuration, invalid JSON format.",
        deleteConfirm: "Are you sure you want to delete this custom configuration?",
        deleteSuccess: "Delete successful",
        deleteError: "Delete failed, please try again",
        inputApiKey: "Please enter API key",
        selectModel: "Please select model",
        selectPlatform: "Please select platform",
        confirmRestoreDefault: "Are you sure you want to restore default configuration? This will clear all current settings.",
        restoreDefaultSuccess: "Default configuration has been restored and automatically saved!",
        restoreDefaultFailed: "Default configuration has been restored, but saving failed. Please try again later or save manually.",
        exportSuccess: "Configuration exported successfully!",
        exportFailed: "Failed to export configuration, please try again.",
        confirmImportConfig: "Are you sure you want to import the configuration file? This will overwrite all current settings.",
        importError: "Import failed: {error}",
        templateTooltip: "Click to select a system prompt template",
        clearTooltip: "Click to clear the current input content",
        restoreTooltip: "Click to restore the last cleared content",
        resetInferenceLabel: "Reset",
        resetInferenceTooltip: "Click to restore the inference parameters to their defaults",
        resetInferenceDone: "Default parameters restored",
        resetInferenceNone: "Inference parameters are already at their defaults",
        clearContent: "Content cleared",
        restoreContent: "Content restored",
        noContentToClear: "No content to clear",
        noContentToRestore: "No content to restore",
        checking: "Loading...",
        helpTitle: "Image Understanding Online",
        helpDescription: "Image understanding through any OpenAI-compatible online multimodal endpoint, with platform switching on the node.",
        helpFeatures: "Features",
        helpFeature1: "Support any OpenAI-compatible service: just fill in the API address, model name and key",
        helpFeature2: "Multiple custom configurations, switchable right on the node",
        helpFeature3: "Support system prompt template management",
        helpFeature4: "Support single and multiple image input (a list is sent as one prompt)",
        helpUsage: "Usage",
        helpUsage1: "Configure each platform's address, model and key in the settings",
        helpUsage2: "Pick the configuration to use from the node's platform dropdown",
        helpUsage3: "Enter a prompt and image for image understanding",
        helpInput: "Input",
        helpInputDesc: "Image input (single image or image list); prompts are entered in the panel's User / System Prompt fields",
        helpOutput: "Output",
        helpOutputDesc: "Return text response generated by the model"
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

function getIUOHelpHTML() {
    return `<h3 style="margin:0 0 12px 0;color:#60a5fa;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(96, 165, 250, 0.2);letter-spacing:0.2px;">${$t('helpTitle')}</h3>
<p style="margin:0 0 16px 0;color:#e2e8f0;">${$t('helpDescription')}</p>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('helpFeatures')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpFeature1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpFeature2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpFeature3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpFeature4')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('helpUsage')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpUsage1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpUsage2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpUsage3')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('helpInput')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpInputDesc')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('helpOutput')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('helpOutputDesc')}</li>
</ul>`;
}

function createIUOHelpPopup(description) {
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
        border-radius: 16px;
        border: 1px solid rgba(99, 179, 237, 0.3);
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

    docElement.innerHTML = `<div style="overflow-y:auto;max-height:540px;padding-right:8px;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.3) transparent;">${description}</div>`;

    document.body.appendChild(docElement);
    return docElement;
}

class APIConfigManager {
    constructor() {
        this.config = null;
        this.isDialogOpen = false;     
    }

    async loadConfig() {
        const defaultConfig = this.getDefaultConfig();
        
        try {
            const response = await api.fetchApi(`/zhiai_nodes/communication_config`, {
                method: "GET"
            });
            if (response.ok) {
                const fileConfig = await response.json();
                this.config = { ...defaultConfig };
                this.config.active_target = this.normalizeActiveTarget(
                    fileConfig.active_target || fileConfig.active_custom
                );
                if (fileConfig.custom_configs) {
                    this.config.custom_configs = { ...this.config.custom_configs, ...fileConfig.custom_configs };
                }
                if (fileConfig.show_status_bar !== undefined) {
                    this.config.show_status_bar = fileConfig.show_status_bar !== false;
                }
            } else {
                this.config = defaultConfig;
            }
        } catch (error) {
            console.error("加载API配置失败:", error);
            this.config = defaultConfig;
        }
        return this.config;
    }

    async saveConfig(config) {
        try {
            const response = await api.fetchApi(`/zhiai_nodes/communication_config`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(config)
            });
            return response.ok;
        } catch (error) {
            console.error("保存API配置失败:", error);
            return false;
        }
    }

    getDefaultConfig() {
        return {
            custom_configs: {
                custom_1: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    models: [],
                    api_key: "",
                    active: false
                },
                custom_2: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    models: [],
                    api_key: "",
                    active: false
                },
                custom_3: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    models: [],
                    api_key: "",
                    active: false
                }
            },
            active_target: "custom_1",
            show_status_bar: true
        };
    }

    async showConfigDialog(buttonElement = null) {
        if (this.isDialogOpen) {
            return;
        }
        
        this.isDialogOpen = true;
        
        const config = await this.loadConfig();
        
        injectQVLStyles("dialog-motion", `
@keyframes iuoDialogIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes iuoDialogOut {
    from { opacity: 1; transform: translate(-50%, -50%) scale(0.97); }
    to { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }
}
@keyframes iuoOverlayIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes iuoOverlayOut { from { opacity: 1; } to { opacity: 0; } }
.qvl-modal-overlay { position: fixed; inset: 0; z-index: 10001; }
.qvl-modal { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 10002; }
@media (prefers-reduced-motion: reduce) {
    .qvl-modal-overlay, .qvl-modal { animation: none !important; }
}
`);

        const overlay = document.createElement("div");
        overlay.className = "qvl-modal-overlay";
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
            animation: iuoOverlayIn 0.2s ease forwards;
        `;

        const dialog = document.createElement("div");
        dialog.className = "qvl-modal";
        dialog.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: clamp(720px, 94vw, 1100px);
            height: auto;
            max-height: 94vh;
            background: ${QVL_TOKENS.color.glassDeep};
            border: 1px solid ${QVL_TOKENS.color.line};
            border-radius: 12px;
            outline: none;
            box-shadow: 0 34px 90px rgba(2, 6, 23, 0.66);
            backdrop-filter: ${QVL_TOKENS.blur.panel};
            -webkit-backdrop-filter: ${QVL_TOKENS.blur.panel};
            padding: 0;
            color: ${QVL_TOKENS.color.text};
            overflow: hidden;
            opacity: 0;
            animation: iuoDialogIn 0.25s ${QVL_TOKENS.motion.easing} forwards;
            z-index: 10002;
            display: flex;
            flex-direction: column;
        `;

        const uniqueId = `iuo-settings-${Math.random().toString(36).substring(2, 9)}`;

        dialog.innerHTML = `
        <style>
            #${uniqueId} {
                display: flex;
                flex-direction: column;
                min-height: 0;
                font-family: ${QVL_TOKENS.font};
                color: ${QVL_TOKENS.color.text};
                --fs-display: ${QVL_TOKENS.type.display};
                --fs-title: ${QVL_TOKENS.type.title};
                --fs-body: ${QVL_TOKENS.type.body};
                --fs-label: ${QVL_TOKENS.type.label};
                --lh-tight: ${QVL_TOKENS.type.lhTight};
                --lh-base: ${QVL_TOKENS.type.lhBase};
                font-size: var(--fs-body);
                line-height: var(--lh-tight);
            }
            #${uniqueId} * { box-sizing: border-box; }

            #${uniqueId} .ui-header {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 10px 14px 14px;
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
                color: ${QVL_TOKENS.color.primaryLight};
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.26), rgba(37, 99, 235, 0.12));
                border: 1px solid ${QVL_TOKENS.color.line};
                box-shadow: 0 0 18px rgba(59, 130, 246, 0.22);
            }
            #${uniqueId} .ui-header__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
            #${uniqueId} .ui-title {
                margin: 0;
                font-size: var(--fs-display);
                font-weight: 600;
                line-height: 1.35;
                letter-spacing: 0.01em;
                color: ${QVL_TOKENS.color.textBright};
            }
            #${uniqueId} .ui-subtitle {
                margin: 0;
                font-size: var(--fs-label);
                line-height: var(--lh-tight);
                letter-spacing: 0.01em;
                color: ${QVL_TOKENS.color.textFaint};
            }
            #${uniqueId} .ui-header__actions { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; }

            #${uniqueId} .circle-close {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                padding: 0;
                color: #FFFFFF;
                background: ${QVL_TOKENS.action.danger};
                border: none;
                border-radius: ${QVL_TOKENS.radius.md};
                cursor: pointer;
                transition: transform ${QVL_TOKENS.motion.base} ${QVL_TOKENS.motion.easing},
                            background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .circle-close:hover {
                background: ${QVL_TOKENS.action.dangerHover};
                transform: rotate(90deg);
            }
            #${uniqueId} .circle-close:focus-visible {
                outline: 2px solid ${QVL_TOKENS.color.primaryLight};
                outline-offset: 2px;
            }

            #${uniqueId} .page-content {
                display: flex;
                flex-direction: column;
                gap: 14px;
                flex: 1;
                min-height: 0;
                padding: 0 14px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(147, 197, 253, 0.45) transparent;
            }
            #${uniqueId} .page-content::-webkit-scrollbar { width: 6px; }
            #${uniqueId} .page-content::-webkit-scrollbar-track {
                background: rgba(96, 165, 250, 0.10);
                border-radius: 3px;
            }
            #${uniqueId} .page-content::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(147, 197, 253, 0.55), rgba(37, 99, 235, 0.55));
                border-radius: 3px;
            }

            #${uniqueId} .settings-card {
                border-radius: ${QVL_TOKENS.radius.lg};
                background: linear-gradient(180deg, #0e1a2e, #070e1b);
                border: 1px solid ${QVL_TOKENS.color.line};
                overflow: hidden;
            }
            #${uniqueId} .card-head {
                display: flex;
                align-items: center;
                gap: 9px;
                padding: 12px 16px;
                min-height: 50px;
                border-bottom: 1px solid ${QVL_TOKENS.color.line};
                background: linear-gradient(180deg, rgba(59, 130, 246, 0.18), rgba(59, 130, 246, 0));
            }
            #${uniqueId} .card-head__icon { display: inline-flex; color: ${QVL_TOKENS.color.primaryLight}; line-height: 0; }
            #${uniqueId} .card-head__title {
                margin: 0;
                font-size: var(--fs-title);
                font-weight: 600;
                line-height: 1.4;
                letter-spacing: 0.02em;
                color: ${QVL_TOKENS.color.textBright};
            }
            #${uniqueId} .platform-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                gap: 14px;
                align-items: stretch;
            }
            #${uniqueId} .platform-card {
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 12px;
                border-radius: ${QVL_TOKENS.radius.md};
                background: #12213A;
                border: 1px solid ${QVL_TOKENS.color.line};
                transition: border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .platform-card:hover { border-color: ${QVL_TOKENS.color.borderHi}; }
            #${uniqueId} .card-pane {
                display: flex;
                flex-direction: column;
                gap: 10px;
                min-width: 0;
            }
            #${uniqueId} .card-pane[hidden] { display: none; }

            #${uniqueId} .field { display: flex; flex-direction: column; gap: 5px; }
            #${uniqueId} .field-label {
                font-size: var(--fs-label);
                font-weight: 600;
                letter-spacing: 0.02em;
                color: ${QVL_TOKENS.color.textLabel};
            }
            #${uniqueId} .field-control { position: relative; display: flex; align-items: center; }
            #${uniqueId} .model-entry {
                position: relative;
                display: block;
            }
            #${uniqueId} .model-entry .model-entry-input {
                width: 100%;
                min-width: 0;
                padding-top: 4px;
                padding-bottom: 4px;
                padding-right: 50px;
            }
            #${uniqueId} .model-chips {
                display: flex;
                flex-wrap: wrap;
                align-content: flex-start;
                gap: 6px;
                height: 72px;
                overflow-y: auto;
                padding: 8px;
                background: rgba(4, 11, 22, 0.42);
                border: 1px solid ${QVL_TOKENS.color.line};
                border-radius: ${QVL_TOKENS.radius.sm};
                scrollbar-width: thin;
                scrollbar-color: rgba(147, 197, 253, 0.45) transparent;
            }
            #${uniqueId} .model-chips.is-sorting { border-color: ${QVL_TOKENS.color.borderHi}; }
            #${uniqueId} .model-empty {
                font-size: var(--fs-label);
                color: ${QVL_TOKENS.color.textGhost};
            }
            #${uniqueId} .model-chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                max-width: 100%;
                height: 24px;
                padding: 0 4px 0 9px;
                font-size: var(--fs-label);
                color: ${QVL_TOKENS.color.primaryLight};
                background: rgba(59, 130, 246, 0.16);
                border: 1px solid rgba(96, 165, 250, 0.32);
                border-radius: 999px;
                cursor: grab;
                user-select: none;
                transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .model-chip:hover {
                background: rgba(59, 130, 246, 0.24);
                border-color: ${QVL_TOKENS.color.borderHi};
            }
            #${uniqueId} .model-chip.is-dragging { opacity: 0.45; cursor: grabbing; }
            #${uniqueId} .model-chip__text {
                max-width: 170px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            #${uniqueId} .model-chip__input {
                width: 150px;
                max-width: 100%;
                height: 20px;
                padding: 0 6px;
                font-family: inherit;
                font-size: var(--fs-label);
                color: ${QVL_TOKENS.color.textBright};
                background: rgba(2, 6, 23, 0.72);
                border: 1px solid ${QVL_TOKENS.color.borderHi};
                border-radius: 999px;
                outline: none;
            }
            #${uniqueId} .model-chip__remove {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                width: 16px;
                height: 16px;
                padding: 0;
                color: ${QVL_TOKENS.color.textDim};
                background: transparent;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                transition: color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .model-chip__remove:hover {
                color: #FFFFFF;
                background: ${QVL_TOKENS.action.danger};
            }
            #${uniqueId} .field-label-row {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 7px;
            }
            #${uniqueId} .field-label-row .field-label { flex: 0 0 auto; }
            #${uniqueId} .model-count {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                min-width: 20px;
                height: 18px;
                padding: 0 6px;
                font-size: var(--fs-label);
                line-height: 18px;
                color: ${QVL_TOKENS.color.primaryLight};
                background: rgba(59, 130, 246, 0.14);
                border: 1px solid rgba(96, 165, 250, 0.32);
                border-radius: 4px;
                font-variant-numeric: tabular-nums;
            }
            #${uniqueId} .model-add-btn {
                position: absolute;
                right: 4px;
                top: 50%;
                transform: translateY(-50%);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                height: 20px;
                padding: 0 8px;
                font-family: inherit;
                font-size: var(--fs-label);
                line-height: 20px;
                color: #FFFFFF;
                background: ${QVL_TOKENS.action.primary};
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            opacity ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .model-add-btn:hover { background: ${QVL_TOKENS.action.primaryHover}; }
            #${uniqueId} .model-add-btn:focus-visible {
                outline: 2px solid ${QVL_TOKENS.color.primaryLight};
                outline-offset: 1px;
            }
            #${uniqueId} .model-probe-btn { margin-left: auto; }

            #${uniqueId} .model-toolbar { display: flex; align-items: center; gap: 8px; height: 20px; }
            #${uniqueId} .model-toolbar__btn,
            #${uniqueId} .model-probe-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                height: 20px;
                padding: 0 10px;
                font-family: inherit;
                font-size: var(--fs-label);
                line-height: 20px;
                color: ${QVL_TOKENS.color.primaryLight};
                background: rgba(59, 130, 246, 0.14);
                border: 1px solid rgba(96, 165, 250, 0.32);
                border-radius: 4px;
                cursor: pointer;
                transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            opacity ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .model-toolbar__btn:hover,
            #${uniqueId} .model-probe-btn:hover {
                background: rgba(59, 130, 246, 0.24);
                border-color: ${QVL_TOKENS.color.borderHi};
            }
            #${uniqueId} .model-toolbar__btn:focus-visible,
            #${uniqueId} .model-probe-btn:focus-visible {
                outline: 2px solid ${QVL_TOKENS.color.primaryLight};
                outline-offset: 1px;
            }
            #${uniqueId} .model-toolbar__btn:disabled,
            #${uniqueId} .model-toolbar__btn:disabled:hover,
            #${uniqueId} .model-probe-btn:disabled,
            #${uniqueId} .model-probe-btn:disabled:hover {
                color: ${QVL_TOKENS.color.textGhost};
                background: rgba(4, 11, 22, 0.42);
                border-color: ${QVL_TOKENS.color.line};
                opacity: 0.7;
                cursor: default;
            }
            #${uniqueId} .qvl-input {
                width: 100%;
                font-family: inherit;
                font-size: var(--fs-body);
                line-height: var(--lh-tight);
                color: ${QVL_TOKENS.color.text};
                background: rgba(4, 11, 22, 0.66);
                border: 1px solid ${QVL_TOKENS.color.line};
                border-radius: ${QVL_TOKENS.radius.sm};
                padding: 7px 10px;
                outline: none;
                transition: border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .qvl-input::placeholder { color: ${QVL_TOKENS.color.textGhost}; }
            #${uniqueId} .qvl-input:focus { border-color: ${QVL_TOKENS.color.primary}; }
            #${uniqueId} .qvl-input.is-invalid { border-color: ${QVL_TOKENS.action.danger}; }
            #${uniqueId} .field-control .qvl-input.has-trail { padding-right: 34px; }
            #${uniqueId} .field-trail {
                position: absolute;
                right: 4px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 26px;
                height: 26px;
                padding: 0;
                color: ${QVL_TOKENS.color.textDim};
                background: transparent;
                border: none;
                border-radius: ${QVL_TOKENS.radius.sm};
                cursor: pointer;
                transition: color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .field-trail:hover {
                color: ${QVL_TOKENS.color.textBright};
                background: rgba(59, 130, 246, 0.14);
            }
            #${uniqueId} .field-trail:focus-visible {
                outline: 2px solid ${QVL_TOKENS.color.primaryLight};
                outline-offset: 1px;
            }

            #${uniqueId} .qvl-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 8px 14px;
                font-family: inherit;
                font-size: var(--fs-body);
                font-weight: 500;
                line-height: 1;
                color: #FFFFFF;
                background: ${QVL_TOKENS.action.primary};
                border: none;
                border-radius: ${QVL_TOKENS.radius.md};
                cursor: pointer;
                transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            opacity ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .qvl-btn:hover { background: ${QVL_TOKENS.action.primaryHover}; }
            #${uniqueId} .qvl-btn:disabled { opacity: 0.6; cursor: progress; }
            #${uniqueId} .qvl-btn:focus-visible {
                outline: 2px solid ${QVL_TOKENS.color.primaryLight};
                outline-offset: 2px;
            }
            #${uniqueId} .qvl-btn--sm { padding: 6px 11px; font-size: var(--fs-label); }
            #${uniqueId} .qvl-btn--neutral { color: #F1F5F9; background: ${QVL_TOKENS.action.neutral}; }
            #${uniqueId} .qvl-btn--neutral:hover { color: #FFFFFF; background: ${QVL_TOKENS.action.neutralHover}; }
            #${uniqueId} .qvl-btn--danger { background: ${QVL_TOKENS.action.danger}; }
            #${uniqueId} .qvl-btn--danger:hover { background: ${QVL_TOKENS.action.dangerHover}; }

            #${uniqueId} .save-section {
                display: flex;
                align-items: center;
                gap: 14px;
                flex-wrap: wrap;
                row-gap: 14px;
                padding: 14px;
                background: linear-gradient(0deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0));
            }
            #${uniqueId} .save-section__prefs {
                display: inline-flex;
                align-items: center;
                gap: 14px;
                height: 32px;
                padding: 0 14px;
                background: rgba(4, 11, 22, 0.42);
                border: 1px solid ${QVL_TOKENS.color.line};
                border-radius: ${QVL_TOKENS.radius.sm};
            }
            #${uniqueId} .save-section__divider {
                flex: 0 0 auto;
                width: 1px;
                height: 16px;
                background: rgba(96, 165, 250, 0.28);
            }
            #${uniqueId} .save-section__group {
                margin-left: auto;
                display: inline-flex;
                align-items: center;
                gap: 14px;
            }
            #${uniqueId} .save-section__group .qvl-btn {
                height: 32px;
                padding: 0 14px;
                line-height: 32px;
            }
            #${uniqueId} .save-section__check {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 0 2px;
                font-size: var(--fs-body);
                line-height: var(--lh-base);
                color: #FFFFFF;
                font-weight: 600;
                cursor: pointer;
                user-select: none;
            }
            #${uniqueId} .save-section__check input {
                width: 16px;
                height: 16px;
                margin: 0;
                accent-color: ${QVL_TOKENS.action.primary};
                cursor: pointer;
            }
            #${uniqueId} .save-section__modes {
                display: inline-flex;
                align-items: center;
                gap: 14px;
                font-size: var(--fs-body);
                line-height: var(--lh-base);
                color: ${QVL_TOKENS.color.textDim};
            }
            #${uniqueId} .save-section__modes-label {
                color: #FFFFFF;
                font-weight: 600;
            }
            #${uniqueId} .save-section__mode {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                user-select: none;
            }
            #${uniqueId} .save-section__mode input {
                -webkit-appearance: none;
                appearance: none;
                flex: 0 0 auto;
                box-sizing: border-box;
                width: 14px;
                height: 14px;
                min-width: 14px;
                max-width: 14px;
                min-height: 14px;
                max-height: 14px;
                margin: 0;
                border-radius: 50%;
                background-color: rgba(2, 6, 23, 0.5);
                background-clip: padding-box;
                border: 1px solid ${QVL_TOKENS.color.line};
                cursor: pointer;
                transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                            border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
            }
            #${uniqueId} .save-section__mode input:checked {
                border-color: ${QVL_TOKENS.color.primary};
                background-color: ${QVL_TOKENS.color.primary};
                background-clip: padding-box;
            }

            @media (prefers-reduced-motion: reduce) {
                #${uniqueId} * { animation: none !important; transition: none !important; }
            }
        </style>
        <div id="${uniqueId}">
            <header class="ui-header">
                <span class="ui-header__icon">${qvlSvg('sliders', 18)}</span>
                <div class="ui-header__text">
                    <h3 class="ui-title">${$t('settingsTitle')}</h3>
                    <p class="ui-subtitle">${$t('configApiKeys')}</p>
                </div>
                <div class="ui-header__actions">
                    <button id="exit-dialog" class="circle-close" type="button" aria-label="${$t('cancel')}">${qvlSvg('close', 15)}</button>
                </div>
            </header>
            <div id="page-settings" class="page-content">
                <div id="platform-configs" class="platform-grid"></div>
            </div>
            <footer class="save-section">
                <div class="save-section__prefs">
                    <label class="save-section__check" for="toggle-status-bar">
                        <input type="checkbox" id="toggle-status-bar">
                        <span>${$t('statusBarEnableLabel')}</span>
                    </label>
                    <span class="save-section__divider" aria-hidden="true"></span>
                    <div class="save-section__modes" role="radiogroup" aria-label="${$t('folderReadMode')}">
                        <span class="save-section__modes-label">${$t('folderReadMode')}</span>
                        <label class="save-section__mode" for="iuo-folder-mode-recursive">
                            <input type="radio" name="iuo-folder-read-mode" value="recursive" id="iuo-folder-mode-recursive">
                            <span>${$t('recursiveMode')}</span>
                        </label>
                        <label class="save-section__mode" for="iuo-folder-mode-sequential">
                            <input type="radio" name="iuo-folder-read-mode" value="sequential" id="iuo-folder-mode-sequential">
                            <span>${$t('sequentialMode')}</span>
                        </label>
                    </div>
                </div>
                <div class="save-section__group">
                    <button id="restore-default" class="qvl-btn qvl-btn--neutral" type="button">${qvlSvg('restore', 15)}<span>${$t('restoreDefault')}</span></button>
                    <button id="export-config" class="qvl-btn" type="button">${qvlSvg('download', 15)}<span>${$t('exportConfig')}</span></button>
                    <button id="import-config" class="qvl-btn" type="button">${qvlSvg('upload', 15)}<span>${$t('importConfig')}</span></button>
                </div>
            </footer>
        </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        attachPanelTooltip(dialog.querySelector("#exit-dialog"), () => $t('cancel'));
        const modeTips = {
            "iuo-folder-mode-recursive": "recursiveModeDesc",
            "iuo-folder-mode-sequential": "sequentialModeDesc",
        };
        Object.entries(modeTips).forEach(([id, key]) => {
            const label = dialog.querySelector(`label[for="${id}"]`);
            if (label) attachPanelTooltip(label, () => $t(key));
        });

        this.renderServiceConfigs(config);

        let closeDialog = () => {
            overlay.style.animation = `iuoOverlayOut 0.16s ${QVL_TOKENS.motion.easing} forwards`;
            dialog.style.animation = `iuoDialogOut 0.16s ${QVL_TOKENS.motion.easing} forwards`;
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
                if (dialog && dialog.parentNode) {
                    document.body.removeChild(dialog);
                }
                this.isDialogOpen = false;
            }, 160);
        };

        const statusBarCheckbox = dialog.querySelector("#toggle-status-bar");
        if (statusBarCheckbox) {
            statusBarCheckbox.checked = config.show_status_bar !== false;
            statusBarCheckbox.onchange = async () => {
                const next = statusBarCheckbox.checked;
                config.show_status_bar = next;
                this.applyStatusBarToAllNodes(next);
                const ok = await this.saveConfig(config);
                if (ok) {
                    this.config = { ...config };
                } else {
                    config.show_status_bar = !next;
                    statusBarCheckbox.checked = !next;
                    this.applyStatusBarToAllNodes(!next);
                    showIUOToast($t('configSaveFailed'), "error");
                }
            };
        }

        const folderModeRadios = dialog.querySelectorAll('input[name="iuo-folder-read-mode"]');
        const syncFolderModeRadios = async () => {
            let mode = "recursive";
            try {
                const response = await fetch("/zhiai_nodes/image_understanding/batch_config");
                const data = await response.json();
                mode = data?.folder_read_mode === "sequential" ? "sequential" : "recursive";
            } catch (err) {
            }
            folderModeRadios.forEach((radio) => { radio.checked = radio.value === mode; });
        };
        syncFolderModeRadios();
        folderModeRadios.forEach((radio) => {
            radio.onchange = async () => {
                if (!radio.checked) return;
                try {
                    const response = await fetch("/zhiai_nodes/image_understanding/batch_config", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ folder_read_mode: radio.value }),
                    });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    showIUOToast($t('batchConfigSaved'), "success");
                } catch (err) {
                    console.error("保存文件夹读取模式失败:", err);
                    showIUOToast($t('batchConfigFailed'), "error");
                    syncFolderModeRadios();
                }
            };
        });

        dialog.querySelector("#restore-default").onclick = () => {
            this.restoreDefaultConfig(dialog);
        };

        dialog.querySelector("#export-config").onclick = () => {
            this.exportConfig();
        };

        dialog.querySelector("#import-config").onclick = () => {
            this.importConfig(dialog);
        };

        const exitBtn = dialog.querySelector("#exit-dialog");
        if (exitBtn) {
            exitBtn.onclick = () => {
                closeDialog();
            };
        }

        dialog.onclick = (e) => {
            e.stopPropagation();
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        const originalCloseDialog = closeDialog;
        closeDialog = () => {
            document.removeEventListener('keydown', handleKeyDown);
            originalCloseDialog();
        };
    }

    normalizeActiveTarget(value) {
        const key = typeof value === "string" ? value : "";
        return CUSTOM_CONFIG_KEYS.includes(key) ? key : CUSTOM_CONFIG_KEYS[0];
    }

    renderServiceConfigs(config) {
        const container = document.querySelector("#platform-configs");
        if (!container) return;
        container.innerHTML = "";

        const customConfigs = config.custom_configs || {};
        CUSTOM_CONFIG_KEYS.forEach(customKey => {
            const customConfig = customConfigs[customKey] || {};
            const defaultName = $t('customConfig').replace('{num}', iuoConfigNumber(customKey));

            const card = document.createElement("div");
            card.className = "platform-card";

            card.innerHTML = `
                <!-- 两个视图互斥显示：配置视图 / 上游模型视图（点「探测上游模型」切过去） -->
                <div class="card-pane" data-card-pane="config">
                <div class="field">
                    <label class="field-label">${$t('configNameLabel')}</label>
                    <div class="field-control">
                        <input type="text" class="qvl-input"
                               data-custom="${customKey}_name"
                               value="${iuoEscapeAttr(customConfig.name || "")}"
                               placeholder="${iuoEscapeAttr(defaultName)}">
                    </div>
                </div>

                <div class="field">
                    <label class="field-label">${$t('apiAddress')}</label>
                    <div class="field-control">
                        <input type="text" class="qvl-input"
                               data-custom="${customKey}_api_base"
                               value="${customConfig.api_base || ""}"
                               placeholder="${$t('apiAddressPlaceholder')}">
                    </div>
                </div>

                <div class="field">
                    <label class="field-label">${$t('apiKeyLabel')}</label>
                    <div class="field-control">
                        <input type="password" class="qvl-input has-trail"
                               data-custom="${customKey}_api_key"
                               value="${customConfig.api_key || ""}"
                               placeholder="${$t('apiKeyPlaceholderCustom')}">
                        <button type="button" class="field-trail password-toggle-btn"
                                data-custom="${customKey}"
                                aria-label="${$t('showHidePassword')}">${qvlSvg('eye', 15)}</button>
                    </div>
                </div>

                <div class="field">
                    <div class="field-label-row">
                        <label class="field-label">${$t('modelList')}</label>
                        <span class="model-count" data-model-count="${customKey}">0</span>
                    </div>
                    <!-- 手动添加（输入行）与「拉取模型」互不相干：拉取会把卡片切到另一个视图 -->
                    <div class="model-entry">
                        <input type="text" class="qvl-input model-entry-input"
                               data-model-entry="${customKey}"
                               placeholder="${$t('modelInputPlaceholder')}">
                        <button type="button" class="model-add-btn"
                                data-model-add="${customKey}">${$t('modelAddShort')}</button>
                    </div>
                    <div class="model-chips" data-model-chips="${customKey}" role="list"></div>
                    <!-- 工具栏：批量操作靠左，「拉取模型」靠右收尾（卡片最下方右侧） -->
                    <div class="model-toolbar">
                        <button type="button" class="model-toolbar__btn" data-model-dedupe="${customKey}">${$t('modelBulkDedupe')}</button>
                        <button type="button" class="model-toolbar__btn" data-model-sort="${customKey}">${$t('modelBulkSort')}</button>
                        <button type="button" class="model-toolbar__btn" data-model-clear="${customKey}">${$t('modelBulkClear')}</button>
                        <button type="button" class="model-probe-btn" data-model-probe="${customKey}">${$t('modelProbe')}</button>
                    </div>
                </div>
                </div>

                <!-- 上游模型视图：内容由 buildIUOProbePanel 挂进来 -->
                <div class="card-pane" data-card-pane="probe" hidden></div>

                <!-- 快照放在两个视图之外：切视图时始终可被保存 / 脏检查找到 -->
                <input type="hidden" data-custom="${customKey}_models"
                       value="${iuoEscapeAttr(JSON.stringify(iuoEntryModels(customConfig)))}">

            `;

            card.dataset.cardType = "custom";
            card.dataset.cardKey = customKey;

            const modelChips = card.querySelector(`[data-model-chips="${customKey}"]`);
            const modelEntry = card.querySelector(`[data-model-entry="${customKey}"]`);
            const modelCountEl = card.querySelector(`[data-model-count="${customKey}"]`);
            const modelSnapshot = card.querySelector(`input[data-custom="${customKey}_models"]`);
            const configPane = card.querySelector('[data-card-pane="config"]');
            const probePane = card.querySelector('[data-card-pane="probe"]');
            const showCardPane = (which) => {
                configPane.hidden = which !== "config";
                probePane.hidden = which !== "probe";
            };
            const probeBtn = card.querySelector(`[data-model-probe="${customKey}"]`);
            const probePanel = buildIUOProbePanel(customKey);
            probePane.appendChild(probePanel);
            const collectModels = () => {
                const seen = new Set();
                modelChips.querySelectorAll(".model-chip__text").forEach(el => {
                    const value = (el.textContent || "").trim();
                    if (value && !seen.has(value)) seen.add(value);
                });
                return [...seen];
            };
            const syncModelSnapshot = () => {
                const models = collectModels();
                const next = JSON.stringify(models);
                const changed = modelSnapshot.value !== next;
                modelSnapshot.value = next;
                if (changed) {
                    const ev = document.createEvent("Event");
                    ev.initEvent("change", true, false);
                    modelSnapshot.dispatchEvent(ev);
                }
                if (modelCountEl) modelCountEl.textContent = String(models.length);
                let emptyEl = modelChips.querySelector(".model-empty");
                if (!models.length) {
                    if (!emptyEl) {
                        emptyEl = document.createElement("span");
                        emptyEl.className = "model-empty";
                        emptyEl.textContent = $t('modelEmpty');
                        modelChips.appendChild(emptyEl);
                    }
                } else if (emptyEl) {
                    emptyEl.remove();
                }
            };
            const flashEntry = () => {
                modelEntry.classList.remove("is-invalid");
                void modelEntry.offsetWidth;
                modelEntry.classList.add("is-invalid");
                window.setTimeout(() => modelEntry.classList.remove("is-invalid"), 700);
            };
            const commitEntry = () => {
                const value = modelEntry.value.trim();
                if (!value) return false;
                const exists = collectModels().some(item => item === value);
                if (exists) {
                    showIUOToast($t('modelDuplicate'), "warning");
                    flashEntry();
                    return false;
                }
                modelChips.appendChild(buildModelChip(value));
                modelEntry.value = "";
                syncModelSnapshot();
                return true;
            };
            const beginChipEdit = (chip) => {
                if (chip.classList.contains("is-editing")) return;
                const textEl = chip.querySelector(".model-chip__text");
                const origin = textEl.textContent;
                chip.classList.add("is-editing");
                const input = document.createElement("input");
                input.type = "text";
                input.className = "model-chip__input";
                input.value = origin;
                textEl.replaceWith(input);
                input.focus();
                input.select();
                let done = false;
                const finish = (commit) => {
                    if (done) return;
                    done = true;
                    const next = input.value.trim();
                    const others = [...modelChips.querySelectorAll(".model-chip__text")]
                        .filter(el => el !== textEl)
                        .map(el => (el.textContent || "").trim());
                    let value = origin;
                    if (commit) {
                        if (!next) {
                            showIUOToast($t('modelEmptyValue'), "warning");
                        } else if (others.includes(next)) {
                            showIUOToast($t('modelDuplicate'), "warning");
                        } else {
                            value = next;
                        }
                    }
                    const text = document.createElement("span");
                    text.className = "model-chip__text";
                    text.textContent = value;
                    attachPanelTooltip(text, () => value);
                    input.replaceWith(text);
                    chip.classList.remove("is-editing");
                    syncModelSnapshot();
                };
                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") { event.preventDefault(); finish(true); }
                    else if (event.key === "Escape") { event.preventDefault(); finish(false); }
                });
                input.addEventListener("blur", () => finish(true));
                input.addEventListener("pointerdown", (e) => e.stopPropagation());
            };
            const buildModelChip = (modelId) => {
                const chip = document.createElement("span");
                chip.className = "model-chip";
                chip.draggable = true;
                chip.setAttribute("role", "listitem");
                const text = document.createElement("span");
                text.className = "model-chip__text";
                text.textContent = modelId;
                attachPanelTooltip(text, () => modelId);
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "model-chip__remove";
                attachPanelTooltip(remove, () => $t('removeModelRow'));
                remove.setAttribute("aria-label", $t('removeModelRow'));
                remove.innerHTML = qvlSvg('close', 12);
                remove.addEventListener("click", (event) => {
                    event.stopPropagation();
                    chip.remove();
                    syncModelSnapshot();
                });
                chip.addEventListener("dblclick", () => beginChipEdit(chip));
                chip.addEventListener("dragstart", (event) => {
                    chip.classList.add("is-dragging");
                    modelChips.classList.add("is-sorting");
                    try {
                        event.dataTransfer.setData("text/plain", modelId);
                        event.dataTransfer.effectAllowed = "move";
                    } catch (err) {  }
                });
                chip.addEventListener("dragend", () => {
                    chip.classList.remove("is-dragging");
                    modelChips.classList.remove("is-sorting");
                    syncModelSnapshot();
                });
                chip.appendChild(text);
                chip.appendChild(remove);
                return chip;
            };
            const chipAfterPoint = (x, y) => {
                const chips = [...modelChips.querySelectorAll(".model-chip:not(.is-dragging)")];
                for (const chip of chips) {
                    const box = chip.getBoundingClientRect();
                    const sameRow = y >= box.top && y <= box.bottom;
                    if (sameRow && x < box.left + box.width / 2) return chip;
                    if (y < box.top + box.height / 2) return chip;
                }
                return null;
            };
            modelChips.addEventListener("dragover", (event) => {
                const dragging = modelChips.querySelector(".model-chip.is-dragging");
                if (!dragging) return;
                event.preventDefault();
                if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
                const after = chipAfterPoint(event.clientX, event.clientY);
                if (after == null) modelChips.appendChild(dragging);
                else modelChips.insertBefore(dragging, after);
                syncModelSnapshot();
            });
            modelChips.addEventListener("drop", (event) => {
                if (!modelChips.querySelector(".model-chip.is-dragging")) return;
                event.preventDefault();
                syncModelSnapshot();
            });
            modelEntry.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    commitEntry();
                    return;
                }
                if (event.key === "Backspace" && !modelEntry.value) {
                    const chips = modelChips.querySelectorAll(".model-chip");
                    const last = chips[chips.length - 1];
                    if (!last) return;
                    event.preventDefault();
                    modelEntry.value = (last.querySelector(".model-chip__text")?.textContent || "").trim();
                    last.remove();
                    syncModelSnapshot();
                }
            });
            modelEntry.addEventListener("input", () => modelEntry.classList.remove("is-invalid"));
            card.querySelector(`[data-model-add="${customKey}"]`).addEventListener("click", () => {
                commitEntry();
                modelEntry.focus();
            });
            (iuoEntryModels(customConfig)).forEach(modelId => {
                modelChips.appendChild(buildModelChip(modelId));
            });
            syncModelSnapshot();

            const probeCount = probePanel.querySelector(`[data-probe-count="${customKey}"]`);
            const probeList = probePanel.querySelector(`[data-probe-list="${customKey}"]`);
            const probeSearch = probePanel.querySelector(`[data-probe-search="${customKey}"]`);
            const probeAddBtn = probePanel.querySelector(`[data-probe-add="${customKey}"]`);
            const probeSelectAllBtn = probePanel.querySelector(`[data-probe-selectall="${customKey}"]`);
            const probeClearSelBtn = probePanel.querySelector(`[data-probe-clearsel="${customKey}"]`);
            const probeGoBtn = probePanel.querySelector(`[data-probe-go="${customKey}"]`);
            const probeBackBtn = probePanel.querySelector(`[data-probe-back="${customKey}"]`);
            const apiBaseInput = card.querySelector(`input[data-custom="${customKey}_api_base"]`);
            const apiKeyInput = card.querySelector(`input[data-custom="${customKey}_api_key"]`);

            const syncProbeBtnState = () => {
                const ready = !!(apiBaseInput?.value || "").trim() && !!(apiKeyInput?.value || "").trim();
                probeBtn.disabled = !ready;
            };
            syncProbeBtnState();
            apiBaseInput?.addEventListener("input", syncProbeBtnState);
            apiKeyInput?.addEventListener("input", syncProbeBtnState);
            const probeState = {
                models: [], at: 0, url: "", apiBase: "",
                selected: new Set(), loading: false, phase: "idle", message: "",
            };

            const formatProbeTime = (ts) => {
                try {
                    return new Date(ts).toLocaleTimeString(
                        getLocale() === "zh" ? "zh-CN" : "en-US",
                        { hour: "2-digit", minute: "2-digit" },
                    );
                } catch (err) {
                    return "";
                }
            };
            const probeAddedSet = () => new Set(collectModels());
            const probeMissingCount = () => {
                const added = probeAddedSet();
                return probeState.models.filter(id => !added.has(id)).length;
            };
            const probeGroupAddRefs = [];
            const syncProbeGroupAdds = () => {
                const added = probeAddedSet();
                probeGroupAddRefs.forEach(({ btn, ids }) => {
                    btn.disabled = !ids.some(id => !added.has(id) && !probeState.selected.has(id));
                });
            };
            const syncProbeFoot = () => {
                const n = probeState.selected.size;
                probeAddBtn.disabled = n === 0;
                probeSelectAllBtn.disabled = probeState.phase !== "done" || probeState.models.length === 0;
                probeClearSelBtn.disabled = n === 0;
                syncProbeGroupAdds();
            };
            const syncProbeCount = () => {
                const total = probeState.models.length;
                if (!total) {
                    probeCount.textContent = "";
                    return;
                }
                probeCount.textContent = $t('modelProbeCount')
                    .replace('{added}', String(total - probeMissingCount()))
                    .replace('{total}', String(total));
            };
            const probeListEmpty = () => {
                const el = document.createElement("div");
                el.className = "iuo-probe__empty";
                if (probeState.phase === "loading") {
                    el.textContent = $t('modelProbeRunning');
                } else if (probeState.phase === "error") {
                    el.textContent = probeState.message;
                } else if (probeState.phase !== "done") {
                    el.textContent = (apiBaseInput?.value || "").trim()
                        ? $t('modelProbeIdle')
                        : $t('modelProbeNoApiBase');
                } else {
                    el.textContent = probeState.models.length ? $t('modelProbeNoMatch') : $t('modelProbeEmpty');
                }
                return el;
            };
            const probeGroupOf = (id) => {
                const parts = id.split("-");
                return parts.length >= 3 ? parts.slice(0, 2).join("-") : "";
            };
            const probeBuildGroups = (ids) => {
                const buckets = new Map();
                ids.forEach(id => {
                    const key = probeGroupOf(id);
                    if (!buckets.has(key)) buckets.set(key, []);
                    buckets.get(key).push(id);
                });
                const groups = [];
                buckets.forEach((list, key) => {
                    if (key && list.length >= 2) groups.push({ key, ids: list });
                });
                groups.sort((a, b) => b.ids.length - a.ids.length || a.key.localeCompare(b.key));
                const grouped = new Set();
                groups.forEach(g => g.ids.forEach(id => grouped.add(id)));
                const others = ids.filter(id => !grouped.has(id));
                if (others.length) groups.push({ key: "", ids: others });
                return groups;
            };
            const probeCollapsed = new Set();
            let probeGroupsReady = false;
            const probeRowRefs = new Map();
            const setProbeRowChecked = (id, checked) => {
                const ref = probeRowRefs.get(id);
                if (!ref) return;
                ref.box.checked = checked;
            };
            const renderProbeList = (resetScroll = false) => {
                const keyword = probeSearch.value.trim().toLowerCase();
                const added = probeAddedSet();
                const keepScroll = probeList.scrollTop;
                probeRowRefs.clear();
                probeGroupAddRefs.length = 0;
                probeList.innerHTML = "";
                const visible = probeState.phase === "done"
                    ? probeState.models.filter(id => {
                        if (keyword && !id.toLowerCase().includes(keyword)) return false;
                        return true;
                    })
                    : [];
                const buildRow = (id) => {
                    const isAdded = added.has(id);
                    const staged = !isAdded && probeState.selected.has(id);
                    const item = document.createElement("label");
                    item.className = "iuo-probe__item" + (isAdded ? " is-added" : "");
                    const box = document.createElement("input");
                    box.type = "checkbox";
                    box.checked = isAdded || staged;
                    box.disabled = isAdded;
                    box.addEventListener("change", () => {
                        if (box.checked) probeState.selected.add(id);
                        else probeState.selected.delete(id);
                        setProbeRowChecked(id, box.checked && !isAdded);
                                syncProbeFoot();
                    });
                    const text = document.createElement("span");
                    text.textContent = id;
                    attachPanelTooltip(text, () => id);
                    item.appendChild(box);
                    item.appendChild(text);
                    probeRowRefs.set(id, { item, box });
                    return item;
                };
                if (!visible.length) {
                    probeList.appendChild(probeListEmpty());
                } else {
                    const groups = probeBuildGroups(visible);
                    if (!probeGroupsReady) {
                        groups.slice(1).forEach(g => probeCollapsed.add(g.key));
                        probeGroupsReady = true;
                    }
                    groups.forEach(group => {
                        const collapsed = !keyword && probeCollapsed.has(group.key);
                        const wrap = document.createElement("div");
                        wrap.className = "iuo-probe__group";
                        const head = document.createElement("div");
                        head.className = "iuo-probe__group-head";
                        const toggle = document.createElement("button");
                        toggle.type = "button";
                        toggle.className = "iuo-probe__group-toggle";
                        toggle.setAttribute("aria-expanded", String(!collapsed));
                        const tri = document.createElement("span");
                        tri.className = "iuo-probe__group-tri";
                        tri.innerHTML = qvlSvg(collapsed ? "chevronRight" : "chevronDown", 10);
                        const name = document.createElement("span");
                        name.className = "iuo-probe__group-name";
                        name.textContent = group.key || $t('modelProbeGroupOthers');
                        const count = document.createElement("span");
                        count.className = "iuo-probe__group-count";
                        count.textContent = String(group.ids.length);
                        toggle.appendChild(tri);
                        toggle.appendChild(name);
                        toggle.appendChild(count);
                        toggle.addEventListener("click", () => {
                            if (probeCollapsed.has(group.key)) probeCollapsed.delete(group.key);
                            else probeCollapsed.add(group.key);
                            renderProbeList();
                        });
                        const addAll = document.createElement("button");
                        addAll.type = "button";
                        addAll.className = "iuo-probe__group-add";
                        addAll.textContent = $t('modelProbeGroupAdd');
                        addAll.addEventListener("click", () => {
                            group.ids.forEach(id => {
                                if (added.has(id)) return;
                                probeState.selected.add(id);
                                setProbeRowChecked(id, true);
                            });
                            syncProbeFoot();
                        });
                        probeGroupAddRefs.push({ btn: addAll, ids: group.ids });
                        head.appendChild(toggle);
                        head.appendChild(addAll);
                        wrap.appendChild(head);
                        if (!collapsed) {
                            group.ids.forEach(id => wrap.appendChild(buildRow(id)));
                        }
                        probeList.appendChild(wrap);
                    });
                }
                probeList.scrollTop = resetScroll ? 0 : keepScroll;
                syncProbeFoot();
                syncProbeCount();
            };
            const cacheProbeResult = () => {
                IUO_MODEL_PROBE_CACHE.set(customKey, {
                    models: [...probeState.models],
                    at: probeState.at,
                    url: probeState.url,
                    apiBase: (apiBaseInput?.value || "").trim(),
                });
            };
            const runProbe = async () => {
                if (probeState.loading) return;
                const apiBase = (apiBaseInput?.value || "").trim();
                const apiKey = (apiKeyInput?.value || "").trim();
                if (!apiBase) {
                    showIUOToast($t('modelProbeNoApiBase'), "warning");
                    apiBaseInput?.focus();
                    return;
                }
                if (!apiKey) {
                    showIUOToast($t('modelProbeNeedConfig'), "warning");
                    apiKeyInput?.focus();
                    return;
                }
                probeState.loading = true;
                probeState.phase = "loading";
                probeState.message = "";
                probeState.apiBase = apiBase;
                probeGoBtn.classList.add("is-loading");
                probeGoBtn.querySelector("span").textContent = $t('modelProbeRunning');
                showCardPane("probe");
                renderProbeList();
                try {
                    const response = await api.fetchApi("/zhiai_nodes/image_understanding/probe_models", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ api_base: apiBase, api_key: apiKey }),
                    });
                    let data = null;
                    try { data = await response.json(); } catch (err) { data = null; }
                    if (!data || data.status !== "success") {
                        probeState.phase = "error";
                        probeState.message = (data && data.message) || `HTTP ${response.status}`;
                        showIUOToast(`${$t('modelProbeFailed')}：${probeState.message}`, "error");
                        renderProbeList();
                        return;
                    }
                    const models = Array.isArray(data.models) ? data.models : [];
                    probeState.models = models;
                    probeCollapsed.clear();
                    probeGroupsReady = false;
                    probeState.at = Date.now();
                    probeState.url = data.url || "";
                    probeState.phase = "done";
                    probeState.selected.forEach(id => {
                        if (!models.includes(id)) probeState.selected.delete(id);
                    });
                    cacheProbeResult();
                    renderProbeList();
                    if (!models.length) showIUOToast($t('modelProbeEmpty'), "warning");
                } catch (err) {
                    console.error("探测上游模型失败:", err);
                    probeState.phase = "error";
                    probeState.message = String((err && err.message) || err);
                    showIUOToast(`${$t('modelProbeFailed')}：${probeState.message}`, "error");
                    renderProbeList();
                } finally {
                    probeState.loading = false;
                    probeGoBtn.classList.remove("is-loading");
                    probeGoBtn.querySelector("span").textContent =
                        probeState.phase === "done" ? $t('modelProbeRefresh') : $t('modelProbe');
                }
            };

            probeBtn.addEventListener("click", () => {
                showCardPane("probe");
                const currentBase = (apiBaseInput?.value || "").trim();
                const neverProbed = probeState.phase !== "done";
                if (currentBase && (neverProbed || probeState.apiBase !== currentBase)) {
                    runProbe();
                } else {
                    renderProbeList();
                }
            });
            probeGoBtn.addEventListener("click", runProbe);
            probeBackBtn.addEventListener("click", () => showCardPane("config"));
            probeSearch.addEventListener("input", () => renderProbeList(true));
            probeSelectAllBtn.addEventListener("click", () => {
                const added = probeAddedSet();
                probeState.selected.clear();
                probeState.models.forEach(id => {
                    if (!added.has(id)) probeState.selected.add(id);
                });
                probeState.models.forEach(id => {
                    if (!added.has(id)) setProbeRowChecked(id, true);
                });
                syncProbeFoot();
            });
            probeClearSelBtn.addEventListener("click", () => {
                const ids = [...probeState.selected];
                probeState.selected.clear();
                ids.forEach(id => setProbeRowChecked(id, false));
                syncProbeFoot();
            });
            probeAddBtn.addEventListener("click", () => {
                if (!probeState.selected.size) {
                    showIUOToast($t('modelProbeNoneSelected'), "warning");
                    return;
                }
                let added = 0;
                const committed = [];
                probeState.selected.forEach(id => {
                    if (collectModels().includes(id)) return;
                    modelChips.appendChild(buildModelChip(id));
                    committed.push(id);
                    added += 1;
                });
                probeState.selected.clear();
                syncModelSnapshot();
                committed.forEach(id => {
                    const ref = probeRowRefs.get(id);
                    if (!ref) return;
                    ref.box.checked = true;
                    ref.box.disabled = true;
                    ref.item.classList.add("is-added");
                });
                syncProbeFoot();
                syncProbeCount();
                if (added) {
                    showIUOToast($t('modelProbeAddedToast').replace('{n}', String(added)), "success");
                }
            });

            const rawChipTexts = () => [...modelChips.querySelectorAll(".model-chip__text")]
                .map(el => (el.textContent || "").trim())
                .filter(Boolean);
            const replaceAllChips = (list) => {
                modelChips.querySelectorAll(".model-chip").forEach(el => el.remove());
                list.forEach(id => modelChips.appendChild(buildModelChip(id)));
                syncModelSnapshot();
            };
            card.querySelector(`[data-model-dedupe="${customKey}"]`).addEventListener("click", () => {
                const current = rawChipTexts();
                const seen = new Set();
                const unique = [];
                current.forEach(id => {
                    if (seen.has(id)) return;
                    seen.add(id);
                    unique.push(id);
                });
                const removed = current.length - unique.length;
                if (!removed) {
                    showIUOToast($t('modelDedupeNone'), "info");
                    return;
                }
                replaceAllChips(unique);
                showIUOToast($t('modelDedupeDone').replace('{n}', String(removed)), "success");
            });
            card.querySelector(`[data-model-sort="${customKey}"]`).addEventListener("click", () => {
                const current = rawChipTexts();
                if (current.length < 2) return;
                replaceAllChips([...current].sort(
                    (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }),
                ));
                showIUOToast($t('modelSortDone'), "success");
            });
            card.querySelector(`[data-model-clear="${customKey}"]`).addEventListener("click", () => {
                if (!rawChipTexts().length) return;
                showIUOConfirm($t('modelClearConfirm'), () => {
                    replaceAllChips([]);
                    showIUOToast($t('modelClearDone'), "success");
                }, null, null, true);
            });

            attachPanelTooltip(probeBtn, () => (probeBtn.disabled ? $t('modelProbeNeedConfig') : $t('modelProbeTip')));
            attachPanelTooltip(card.querySelector(`[data-model-dedupe="${customKey}"]`), () => $t('modelBulkDedupeTip'));
            attachPanelTooltip(card.querySelector(`[data-model-sort="${customKey}"]`), () => $t('modelBulkSortTip'));
            attachPanelTooltip(card.querySelector(`[data-model-clear="${customKey}"]`), () => $t('modelBulkClearTip'));
            attachPanelTooltip(probeGoBtn, () => {
                if (probeState.phase !== "done") return $t('modelProbeTip');
                const base = $t('modelProbeRefresh');
                return probeState.at
                    ? `${base} · ${$t('modelProbeUpdatedAt').replace('{time}', formatProbeTime(probeState.at))}`
                    : base;
            });

            const cachedProbe = IUO_MODEL_PROBE_CACHE.get(customKey);
            if (cachedProbe && cachedProbe.models.length && cachedProbe.apiBase === (apiBaseInput?.value || "").trim()) {
                probeState.models = [...cachedProbe.models];
                probeState.at = cachedProbe.at;
                probeState.url = cachedProbe.url;
                probeState.apiBase = cachedProbe.apiBase;
                probeState.phase = "done";
                renderProbeList();
                probeGoBtn.querySelector("span").textContent = $t('modelProbeRefresh');
            } else {
                syncProbeFoot();
                renderProbeList();
            }

            container.appendChild(card);
        });

        refreshIUOPlatformSelectors(config);

        container.querySelectorAll('.password-toggle-btn').forEach(btn => {
            attachPanelTooltip(btn, () => $t('showHidePassword'));
            btn.addEventListener('click', () => {
                const customKey = btn.dataset.custom;
                if (!customKey) return;
                const input = container.querySelector(`input[data-custom="${customKey}_api_key"]`);
                if (!input) return;
                const reveal = input.type === 'password';
                input.type = reveal ? 'text' : 'password';
                btn.innerHTML = reveal ? qvlSvg('eyeOff', 15) : qvlSvg('eye', 15);
            });
        });


        const bindCardAutoSave = (card, fields) => {
            const commitSnapshot = () => {
                fields.forEach(f => { if (f.el) card.dataset[f.initialKey] = f.el.value; });
            };

            let timer = null;
            const requestSave = async () => {
                const ok = await this.saveSingleCardConfig(card);
                if (ok) {
                    commitSnapshot();
                } else {
                    showIUOToast($t('saveFailed'), "error");
                }
            };

            const schedule = () => {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => { timer = null; requestSave(); }, 400);
            };

            fields.forEach(f => {
                if (!f.el) return;
                f.el.addEventListener("input", schedule);
                f.el.addEventListener("change", schedule);
            });
        };

        container.querySelectorAll('[data-card-type="custom"]').forEach(card => {
            const key = card.dataset.cardKey;
            const fields = [
                { el: card.querySelector(`input[data-custom="${key}_name"]`), initialKey: "initialName" },
                { el: card.querySelector(`input[data-custom="${key}_api_base"]`), initialKey: "initialApiBase" },
                { el: card.querySelector(`input[data-custom="${key}_models"]`), initialKey: "initialModels" },
                { el: card.querySelector(`input[data-custom="${key}_api_key"]`), initialKey: "initialApiKey" },
            ];
            bindCardAutoSave(card, fields);
        });
    }

    applyStatusBarToNode(node, enabled = true) {
        if (!node) return;

        if (!enabled) {
            this.removeStatusBarFromNode(node);
            return;
        }
        if (node._statusBarHost) return;

        const panel = node._iuoPanel?.panel;
        if (!panel) {
            node._iuoStatusBarPending = true;
            return;
        }

        const card = document.createElement("section");
        card.className = "pk-card";

        const head = document.createElement("div");
        head.className = "pk-card__head pk-card__head--static";

        const icon = document.createElement("span");
        icon.className = "pk-card__icon";
        icon.innerHTML = qvlSvg("terminal", 13);

        const title = document.createElement("span");
        title.className = "pk-card__title";
        title.textContent = $t('statusBarTitle');

        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "pk-mini-btn";

        head.appendChild(icon);
        head.appendChild(title);
        head.appendChild(clear);

        const fields = document.createElement("div");
        fields.className = "pk-fields";

        const body = document.createElement("div");
        body.className = "pk-log__text";
        body.setAttribute("role", "log");
        body.setAttribute("aria-live", "polite");
        body.textContent = $t('statusBarIdle');
        fields.appendChild(body);

        card.appendChild(head);
        card.appendChild(fields);
        panel.appendChild(card);

        node._statusBarHost = card;
        node._statusBarBody = body;
        node._statusBarClear = clear;

        attachPanelTooltip(clear, () => $t('statusBarClear'));
        clear.setAttribute("aria-label", $t('statusBarClear'));
        clear.textContent = $t('statusBarClearLabel');
        clear.addEventListener("pointerdown", (e) => e.stopPropagation());
        clear.addEventListener("click", (e) => {
            e.stopPropagation();
            body.textContent = $t('statusBarCleared');
            body.dataset.empty = "true";
            body.scrollTop = 0;
            node.graph?.setDirtyCanvas?.(true, false);
            iuoResizeToContent(node);
        });

        app.graph.setDirtyCanvas(true, true);
        iuoResizeToContent(node);
    }

    removeStatusBarFromNode(node) {
        if (!node) return;
        node._iuoStatusBarPending = false;
        if (!node || !node._statusBarHost) return;
        node._statusBarHost.remove();
        node._statusBarHost = null;
        node._statusBarBody = null;
        node._statusBarClear = null;
        node._iuoStatusBarPending = false;
        window.requestAnimationFrame(() => {
            if (!node.graph || typeof node.computeSize !== "function") return;
            const computed = node.computeSize();
            if (!Array.isArray(computed)) return;
            const width = Math.max(node.size?.[0] ?? QVL_NODE_MIN_WIDTH, QVL_NODE_MIN_WIDTH);
            node.setSize([width, Math.max(computed[1], QVL_NODE_MIN_HEIGHT)]);
            node.graph?.setDirtyCanvas?.(true, true);
        });
    }

    applyStatusBarToAllNodes(enabled) {
        const nodes = app.graph?._nodes || [];
        nodes.forEach(node => {
            if (node.type !== "ImageUnderstandingOnline") return;
            this.applyStatusBarToNode(node, enabled);
        });
        app.graph?.setDirtyCanvas(true, true);
    }

    async saveSingleCardConfig(cardElement) {
        const type = cardElement?.dataset?.cardType;
        const key = cardElement?.dataset?.cardKey;
        const currentConfig = this.config || (await this.loadConfig());
        const updatedConfig = JSON.parse(JSON.stringify(currentConfig));
        let ok = false;
        try {
            if (type === "custom") {
                const nameInput = cardElement.querySelector(`input[data-custom="${key}_name"]`);
                const apiBase = cardElement.querySelector(`input[data-custom="${key}_api_base"]`);
                const apiKey = cardElement.querySelector(`input[data-custom="${key}_api_key"]`);
                const modelsSnapshot = cardElement.querySelector(`input[data-custom="${key}_models"]`);
                if (!updatedConfig.custom_configs) updatedConfig.custom_configs = {};
                if (!updatedConfig.custom_configs[key]) updatedConfig.custom_configs[key] = {};
                if (nameInput) updatedConfig.custom_configs[key].name = nameInput.value;
                if (apiBase) updatedConfig.custom_configs[key].api_base = apiBase.value;
                if (modelsSnapshot) {
                    let models = [];
                    try {
                        const parsed = JSON.parse(modelsSnapshot.value || "[]");
                        if (Array.isArray(parsed)) {
                            models = parsed.filter(s => typeof s === "string" && s.trim()).map(s => s.trim())
                                .filter((s, i, arr) => arr.indexOf(s) === i);
                        }
                    } catch (err) {  }
                    updatedConfig.custom_configs[key].models = models;
                    updatedConfig.custom_configs[key].model_name = models[0] || "";
                }
                if (apiKey) updatedConfig.custom_configs[key].api_key = apiKey.value;
            }
            ok = await this.saveConfig(updatedConfig);
            if (ok) {
                this.config = updatedConfig;
                refreshIUOPlatformSelectors(updatedConfig);
            }
        } catch (err) {
            console.error("保存自定义配置失败:", err);
            ok = false;
        }
        return ok;
    }

    async restoreDefaultConfig(dialog) {
        showIUOConfirm($t('confirmRestoreDefault'), async () => {
            const defaultConfig = this.getDefaultConfig();
            const ok = await this.saveConfig(defaultConfig);

            this.config = { ...defaultConfig };
            this.renderServiceConfigs(this.config);

            if (ok) {
                showIUOToast($t('restoreDefaultSuccess'), "success");
            } else {
                showIUOToast($t('restoreDefaultFailed'), "error");
            }
        }, null, $t('restoreDefault'), true);
    }

    async exportConfig() {
        try {
            const config = await this.loadConfig();
            const exportData = {
                export_time: new Date().toISOString(),
                config: config
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `image_understanding_config_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showIUOToast($t('exportSuccess'), "success");
        } catch (error) {
            console.error("导出配置失败:", error);
            showIUOToast($t('exportFailed'), "error");
        }
    }

    async importConfig(dialog) {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const importData = JSON.parse(text);
                    
                    if (!importData.config) {
                        throw new Error('无效的配置文件格式');
                    }
                    
                    const importedConfig = importData.config;
                    
                    if (!importedConfig.custom_configs) {
                        throw new Error('配置文件缺少必要字段');
                    }
                    
                    showIUOConfirm($t('confirmImportConfig'), async () => {
                        const currentConfig = await this.loadConfig();
                        const mergedConfig = {
                            ...importedConfig,
                            active_target: this.normalizeActiveTarget(
                                currentConfig.active_target || importedConfig.active_target
                            )
                        };
                        delete mergedConfig.api_keys;
                        delete mergedConfig.active_platform;

                        const mergedCustom = mergedConfig.custom_configs || {};
                        CUSTOM_CONFIG_KEYS.forEach(key => {
                            const entry = mergedCustom[key];
                            if (!entry || typeof entry !== "object") return;
                            if (!Array.isArray(entry.models) || !entry.models.length) {
                                entry.models = typeof entry.model_name === "string" && entry.model_name.trim()
                                    ? [entry.model_name.trim()] : [];
                            }
                        });

                        const ok = await this.saveConfig(mergedConfig);
                        if (ok) {
                            this.config = mergedConfig;

                            this.renderServiceConfigs(this.config);

                            showIUOToast($t('importSuccessMsg'), "success");
                        } else {
                            showIUOToast($t('importFailedMsg'), "error");
                        }
                    }, null, $t('importConfig'));
                    
                } catch (error) {
                    console.error("解析配置文件失败:", error);
                    showIUOToast($t('importError').replace('{error}', error.message), "error");
                }
            };
            input.click();
            
        } catch (error) {
            console.error("导入配置失败:", error);
            showIUOToast("导入配置失败，请重试。", "error");
        }
    }
}

const apiConfigManager = new APIConfigManager();


function getIUOToastHost() {
    let host = document.getElementById("iuo-toast-host");
    if (!host) {
        host = document.createElement("div");
        host.id = "iuo-toast-host";
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

function showIUOToast(message, type = "info") {
    const accent = type === "success"
        ? QVL_TOKENS.color.success
        : type === "error"
            ? QVL_TOKENS.color.error
            : type === "warning"
                ? QVL_TOKENS.color.warn
                : QVL_TOKENS.color.primary;
    const toast = document.createElement("div");
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 100%;
        box-sizing: border-box;
        background: ${QVL_TOKENS.color.glassDeep};
        backdrop-filter: ${QVL_TOKENS.blur.panel};
        -webkit-backdrop-filter: ${QVL_TOKENS.blur.panel};
        color: ${QVL_TOKENS.color.textBright};
        font-family: ${QVL_TOKENS.font};
        padding: 14px 24px;
        border: 1px solid ${accent}66;
        border-radius: ${QVL_TOKENS.radius.lg};
        font-size: ${QVL_TOKENS.type.body};
        font-weight: 500;
        letter-spacing: 0.01em;
        box-shadow: 0 20px 48px rgba(2, 6, 23, 0.55), 0 0 0 1px ${accent}22;
        animation: iuoToastIn 0.3s ${QVL_TOKENS.motion.easing};
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

    getIUOToastHost().appendChild(toast);
    const stayMs = 10000;
    setTimeout(() => {
        toast.style.animation = `iuoToastIn 0.3s ${QVL_TOKENS.motion.easing} reverse`;
        setTimeout(() => {
            toast.remove();
            const host = document.getElementById("iuo-toast-host");
            if (host && !host.childElementCount) host.remove();
        }, 300);
    }, stayMs);
}

injectQVLStyles("overlays", `
@keyframes iuoToastIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes iuoConfirmIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
    #iuo-toast-host * { animation: none !important; }
}
`);

injectQVLStyles("probe-panel", `
.iuo-probe {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    font-size: ${QVL_TOKENS.type.label};
    line-height: 1.5;
    animation: iuoProbeIn 0.16s ${QVL_TOKENS.motion.easing};
}
.iuo-probe * { box-sizing: border-box; }
@keyframes iuoProbeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
    .iuo-probe { animation: none !important; }
}
.iuo-probe__head { display: flex; align-items: center; gap: 6px; }
.iuo-probe__go { margin-left: auto; }
.iuo-probe__go:focus-visible {
    outline: 2px solid ${QVL_TOKENS.color.primaryLight};
    outline-offset: 1px;
}
.iuo-probe__go.is-loading { opacity: 0.72; cursor: progress; }
.iuo-probe__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${QVL_TOKENS.type.label};
    font-weight: 600;
    color: ${QVL_TOKENS.color.textLabel};
}
.iuo-probe__count {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${QVL_TOKENS.type.micro};
    color: ${QVL_TOKENS.color.textFaint};
    font-variant-numeric: tabular-nums;
}
.iuo-probe__tools { display: flex; align-items: center; gap: 8px; }
.iuo-probe__search {
    flex: 1;
    min-width: 0;
    padding: 5px 9px;
    font-family: inherit;
    font-size: ${QVL_TOKENS.type.label};
    line-height: 1.5;
    color: ${QVL_TOKENS.color.text};
    background: rgba(2, 6, 23, 0.55);
    border: 1px solid ${QVL_TOKENS.color.line};
    border-radius: ${QVL_TOKENS.radius.sm};
    outline: none;
    transition: border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
}
.iuo-probe__search::placeholder { color: ${QVL_TOKENS.color.textGhost}; }
.iuo-probe__search:focus { border-color: ${QVL_TOKENS.color.primary}; }
.iuo-probe__list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: 201px;
    overflow-y: auto;
    padding: 4px;
    background: rgba(2, 6, 23, 0.42);
    border: 1px solid ${QVL_TOKENS.color.line};
    border-radius: ${QVL_TOKENS.radius.sm};
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 197, 253, 0.32) transparent;
}
.iuo-probe__item {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 4px 6px;
    border-radius: 4px;
    color: ${QVL_TOKENS.color.text};
    cursor: pointer;
    user-select: none;
}
.iuo-probe__item:hover { background: rgba(59, 130, 246, 0.10); }


.iuo-probe__group {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.iuo-probe__group-head {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    height: 26px;
    padding: 0 6px;
    background: rgba(59, 130, 246, 0.07);
    border-radius: 4px;
}
.iuo-probe__group-toggle {
    flex: 1 1 auto;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0;
    font-family: inherit;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
}
.iuo-probe__group-tri {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    color: ${QVL_TOKENS.color.textLabel};
}
.iuo-probe__group-name {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${QVL_TOKENS.type.label};
    font-weight: 500;
    color: ${QVL_TOKENS.color.text};
}
.iuo-probe__group-count {
    flex: 0 0 auto;
    font-size: ${QVL_TOKENS.type.micro};
    color: ${QVL_TOKENS.color.textFaint};
    font-variant-numeric: tabular-nums;
}
.iuo-probe__group-add {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 8px;
    font-family: inherit;
    font-size: ${QVL_TOKENS.type.micro};
    line-height: normal;
    color: ${QVL_TOKENS.color.primaryLight};
    background: rgba(59, 130, 246, 0.14);
    border: 1px solid rgba(96, 165, 250, 0.32);
    border-radius: 4px;
    cursor: pointer;
    transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                opacity ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
}
.iuo-probe__group-add:hover {
    background: rgba(59, 130, 246, 0.24);
    border-color: ${QVL_TOKENS.color.borderHi};
}
.iuo-probe__group-add:disabled,
.iuo-probe__group-add:disabled:hover {
    color: ${QVL_TOKENS.color.textGhost};
    background: rgba(4, 11, 22, 0.42);
    border-color: ${QVL_TOKENS.color.line};
    opacity: 0.7;
    cursor: default;
}
.iuo-probe__group .iuo-probe__item { padding-left: 18px; }
.iuo-probe__item input {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    flex: 0 0 auto;
    box-sizing: border-box;
    width: 13px;
    height: 13px;
    min-width: 13px;
    max-width: 13px;
    min-height: 13px;
    max-height: 13px;
    margin: 0;
    padding: 0;
    border: 1px solid ${QVL_TOKENS.color.line};
    border-radius: 3px;
    background: rgba(4, 11, 22, 0.66);
    cursor: pointer;
    transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
}
.iuo-probe__item input:hover:not(:checked):not(:disabled) {
    border-color: ${QVL_TOKENS.color.primaryLight};
    background: rgba(59, 130, 246, 0.22);
}
.iuo-probe__item input:checked {
    background: ${QVL_TOKENS.color.primary};
    border-color: ${QVL_TOKENS.color.primary};
}
.iuo-probe__item input:checked::after {
    content: "";
    position: absolute;
    inset: 0;
    background: #FFFFFF;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='5.4 13.2 10 16.3 18.6 7.7' fill='none' stroke='%23fff' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='5.4 13.2 10 16.3 18.6 7.7' fill='none' stroke='%23fff' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
}
.iuo-probe__item.is-added input {
    background: ${QVL_TOKENS.color.success};
    border-color: ${QVL_TOKENS.color.success};
    cursor: default;
}
.iuo-probe__item.is-added input::after { background: #06281C; }
.iuo-probe__item input:disabled:not(:checked) {
    border-color: ${QVL_TOKENS.color.textGhost};
    background: transparent;
    cursor: default;
}
.iuo-probe__item input:focus-visible {
    outline: 2px solid ${QVL_TOKENS.color.primaryGlow};
    outline-offset: 2px;
}
.iuo-probe__item span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.iuo-probe__item.is-added { color: ${QVL_TOKENS.color.textDim}; cursor: default; }
.iuo-probe__item.is-added:hover { background: transparent; }
.iuo-probe__empty {
    padding: 12px 4px;
    color: ${QVL_TOKENS.color.textGhost};
    text-align: center;
}
.iuo-probe__foot { display: flex; align-items: center; gap: 12px; height: 22px; }
.iuo-probe__link,
.iuo-probe__go {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 10px;
    font-family: inherit;
    font-size: ${QVL_TOKENS.type.label};
    line-height: 20px;
    color: ${QVL_TOKENS.color.primaryLight};
    background: rgba(59, 130, 246, 0.14);
    border: 1px solid rgba(96, 165, 250, 0.32);
    border-radius: 4px;
    cursor: pointer;
    transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                opacity ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
}
.iuo-probe__link:hover,
.iuo-probe__go:hover {
    background: rgba(59, 130, 246, 0.24);
    border-color: ${QVL_TOKENS.color.borderHi};
}
.iuo-probe__link:focus-visible,
.iuo-probe__go:focus-visible {
    outline: 2px solid ${QVL_TOKENS.color.primaryLight};
    outline-offset: 1px;
}
.iuo-probe__link:disabled,
.iuo-probe__link:disabled:hover,
.iuo-probe__go:disabled,
.iuo-probe__go:disabled:hover {
    color: ${QVL_TOKENS.color.textGhost};
    background: rgba(4, 11, 22, 0.42);
    border-color: ${QVL_TOKENS.color.line};
    opacity: 0.7;
    cursor: default;
}

.iuo-probe__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
}
.iuo-probe__add {
    flex: 1 1 auto;
    min-width: 0;
    height: 28px;
    padding: 0 12px;
    font-family: inherit;
    font-size: ${QVL_TOKENS.type.label};
    font-weight: 500;
    line-height: 28px;
    color: #FFFFFF;
    background: ${QVL_TOKENS.action.primary};
    border: none;
    border-radius: ${QVL_TOKENS.radius.sm};
    cursor: pointer;
    transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                opacity ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
}
.iuo-probe__add:hover { background: ${QVL_TOKENS.action.primaryHover}; }
.iuo-probe__back {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 14px;
    font-family: inherit;
    font-size: ${QVL_TOKENS.type.label};
    line-height: 28px;
    color: #FFFFFF;
    background: ${QVL_TOKENS.action.neutral};
    border: 1px solid ${QVL_TOKENS.action.neutral};
    border-radius: ${QVL_TOKENS.radius.sm};
    cursor: pointer;
    transition: color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                border-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
}
.iuo-probe__back:hover {
    color: #FFFFFF;
    background: ${QVL_TOKENS.action.neutralHover};
    border-color: ${QVL_TOKENS.action.neutralHover};
}
.iuo-probe__back:focus-visible {
    outline: 2px solid ${QVL_TOKENS.color.primaryLight};
    outline-offset: 1px;
}
.iuo-probe__add:disabled { opacity: 0.5; cursor: default; }
`);

injectQVLStyles("confirm-dialog", `
.iuo-confirm .qvl-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-sizing: border-box;
    min-width: 100px;
    height: 34px;
    padding: 0 20px;
    font-family: ${QVL_TOKENS.font};
    font-size: ${QVL_TOKENS.type.body};
    font-weight: 500;
    line-height: normal;
    color: #FFFFFF;
    background: ${QVL_TOKENS.action.primary};
    border: none;
    border-radius: ${QVL_TOKENS.radius.md};
    cursor: pointer;
    transition: background-color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing},
                color ${QVL_TOKENS.motion.fast} ${QVL_TOKENS.motion.easing};
}
.iuo-confirm .qvl-btn:hover { background: ${QVL_TOKENS.action.primaryHover}; }
.iuo-confirm .qvl-btn:active { transform: translateY(1px); }
.iuo-confirm .qvl-btn:focus-visible {
    outline: 2px solid ${QVL_TOKENS.color.primaryLight};
    outline-offset: 2px;
}
.iuo-confirm .qvl-btn--neutral { color: #F1F5F9; background: ${QVL_TOKENS.action.neutral}; }
.iuo-confirm .qvl-btn--neutral:hover { color: #FFFFFF; background: ${QVL_TOKENS.action.neutralHover}; }
.iuo-confirm .qvl-btn--danger { font-weight: 600; background: ${QVL_TOKENS.action.danger}; }
.iuo-confirm .qvl-btn--danger:hover { background: ${QVL_TOKENS.action.dangerHover}; }
`);

function showIUOConfirm(message, onConfirm, onCancel, confirmText = null, danger = false) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.62);
        backdrop-filter: blur(10px) saturate(1.25);
        -webkit-backdrop-filter: blur(10px) saturate(1.25);
        z-index: 10005;
    `;
    const box = document.createElement("div");
    box.className = "iuo-confirm";
    box.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(440px, 92vw);
        box-sizing: border-box;
        padding: 20px 22px 18px;
        background: ${QVL_TOKENS.color.glassDeep};
        backdrop-filter: ${QVL_TOKENS.blur.panel};
        -webkit-backdrop-filter: ${QVL_TOKENS.blur.panel};
        border: 1px solid ${QVL_TOKENS.color.line};
        border-radius: 12px;
        box-shadow: ${QVL_TOKENS.shadow.panel};
        color: ${QVL_TOKENS.color.text};
        font-family: ${QVL_TOKENS.font};
        font-size: ${QVL_TOKENS.type.body};
        line-height: ${QVL_TOKENS.type.lhBase};
        z-index: 10006;
        animation: iuoConfirmIn 0.22s ${QVL_TOKENS.motion.easing};
    `;
    const title = document.createElement("div");
    title.style.cssText = `margin:0 0 8px;font-size:${QVL_TOKENS.type.title};font-weight:600;line-height:1.4;color:${QVL_TOKENS.color.textBright};`;
    title.textContent = $t('settingsTitle');
    const msg = document.createElement("div");
    msg.style.cssText = `margin:0 0 18px;font-size:${QVL_TOKENS.type.body};line-height:1.6;color:${QVL_TOKENS.color.textLabel};`;
    msg.textContent = message;
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;justify-content:flex-end;gap:10px;";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "qvl-btn qvl-btn--neutral";
    cancelBtn.textContent = $t('cancel');
    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.className = "qvl-btn" + (danger ? " qvl-btn--danger" : "");
    okBtn.textContent = confirmText || $t('apply');

    const close = (result) => {
        overlay.remove();
        box.remove();
        document.removeEventListener("keydown", onKey, true);
        if (result) { if (onConfirm) onConfirm(); }
        else { if (onCancel) onCancel(); }
    };
    const onKey = (e) => {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(false); }
    };
    cancelBtn.onclick = () => close(false);
    okBtn.onclick = () => close(true);
    overlay.onclick = () => close(false);
    box.onclick = (e) => e.stopPropagation();
    document.addEventListener("keydown", onKey, true);

    actions.appendChild(cancelBtn);
    actions.appendChild(okBtn);
    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(actions);
    document.body.appendChild(overlay);
    document.body.appendChild(box);
    okBtn.focus();
}

function iuoPlatformOptions(config) {
    const customConfigs = (config && config.custom_configs) || {};
    return CUSTOM_CONFIG_KEYS.map(key => {
        const entry = customConfigs[key] || {};
        const name = typeof entry.name === "string" ? entry.name.trim() : "";
        return name || key;
    });
}

function iuoDefaultPlatform(config) {
    const options = iuoPlatformOptions(config);
    const activeKey = apiConfigManager.normalizeActiveTarget(config && config.active_target);
    const index = CUSTOM_CONFIG_KEYS.indexOf(activeKey);
    return index >= 0 && index < options.length ? options[index] : options[0];
}

function iuoEscapeAttr(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function iuoEntryModels(entry) {
    if (!entry || typeof entry !== "object") return [];
    const result = [];
    if (Array.isArray(entry.models)) {
        entry.models.forEach(item => {
            if (typeof item === "string" && item.trim() && !result.includes(item.trim())) {
                result.push(item.trim());
            }
        });
    }
    if (!result.length && typeof entry.model_name === "string" && entry.model_name.trim()) {
        result.push(entry.model_name.trim());
    }
    return result;
}

const IUO_MODEL_PROBE_CACHE = new Map();

function buildIUOProbePanel(customKey) {
    const panel = document.createElement("div");
    panel.className = "iuo-probe";
    panel.dataset.probePanel = customKey;
    panel.innerHTML = `
        <div class="iuo-probe__head">
            <span class="iuo-probe__title">${$t('modelProbeResult')}</span>
            <span class="iuo-probe__count" data-probe-count="${customKey}"></span>
        </div>
        <div class="iuo-probe__tools">
            <input type="text" class="iuo-probe__search" data-probe-search="${customKey}"
                   placeholder="${$t('modelProbeSearchPlaceholder')}">
        </div>
        <div class="iuo-probe__list" data-probe-list="${customKey}"></div>
        <div class="iuo-probe__foot">
            <button type="button" class="iuo-probe__link" data-probe-selectall="${customKey}">${$t('modelProbeSelectAll')}</button>
            <button type="button" class="iuo-probe__link" data-probe-clearsel="${customKey}">${$t('modelProbeClearSelection')}</button>
            <button type="button" class="iuo-probe__go" data-probe-go="${customKey}"
                    aria-label="${$t('modelProbeTip')}"><span>${$t('modelProbe')}</span></button>
        </div>
        <div class="iuo-probe__actions">
            <button type="button" class="iuo-probe__add" data-probe-add="${customKey}">${$t('modelProbeAddSelected')}</button>
            <button type="button" class="iuo-probe__back" data-probe-back="${customKey}">${$t('modelProbeBack')}</button>
        </div>
    `;
    return panel;
}

function iuoSelectedPlatformKey(node, config) {
    const widget = iuoFindWidget(node, "platform");
    const current = typeof widget?.value === "string" ? widget.value.trim() : "";
    if (current) {
        const customConfigs = (config && config.custom_configs) || {};
        const direct = CUSTOM_CONFIG_KEYS.find(key => key === current);
        if (direct) return direct;
        const byName = CUSTOM_CONFIG_KEYS.find(key =>
            typeof customConfigs[key]?.name === "string" && customConfigs[key].name.trim() === current);
        if (byName) return byName;
    }
    return apiConfigManager.normalizeActiveTarget(config && config.active_target);
}

function iuoApplyModelOptions(node, config) {
    const widget = iuoFindWidget(node, "model");
    if (!widget) return;
    const key = iuoSelectedPlatformKey(node, config);
    const entry = ((config && config.custom_configs) || {})[key] || {};
    const models = iuoEntryModels(entry);
    widget.options = widget.options || {};
    iuoApplyOptionLabels(node);
    widget.options.values = models.length ? [...models] : [""];
    const previous = typeof widget.value === "string" ? widget.value.trim() : "";
    widget.value = models.includes(previous) ? previous : (models[0] ?? "");
    node._iuoModelOptions = models;
}

function iuoAttachPlatformModelLinkage(node) {
    const widget = iuoFindWidget(node, "platform");
    if (!widget || widget._iuoModelLinked) return;
    widget._iuoModelLinked = true;
    const previous = widget.callback;
    widget.callback = function () {
        const result = previous ? previous.apply(this, arguments) : undefined;
        apiConfigManager.loadConfig().then(config => {
            if (!node.graph) return;
            iuoApplyModelOptions(node, config);
            node._iuoPanel?.sync();
            node.setDirtyCanvas?.(true, true);
        }).catch(() => {});
        return result;
    };
}

function iuoConfigNumber(key) {
    const match = /^custom_(\d+)$/.exec(String(key ?? ""));
    return match ? match[1] : String(key ?? "");
}

function iuoPlaceholderLabel(value) {
    const match = /^custom_(\d+)$/.exec(String(value ?? ""));
    if (!match) return null;
    return $t('customConfig').replace('{num}', match[1]);
}

function iuoModelLabel(value) {
    const text = value == null ? "" : String(value).trim();
    return text ? null : $t('modelNotConfigured');
}

const IUO_PRESET_LABEL_KEYS = {
    "Ignore": "presetIgnore",
    "通用标注": "presetPromptGeneral",
    "专业详细": "presetPromptDetailed",
    "角色特征": "presetPromptCharacter",
    "场景分析": "presetPromptScene",
    "风格识别": "presetPromptStyle",
    "差异比对": "presetPromptDiff"
};

function iuoPresetLabel(value) {
    const key = IUO_PRESET_LABEL_KEYS[String(value ?? "")];
    return key ? $t(key) : null;
}

const QVL_PANEL_MIN_WIDTH = 367;

const IUO_PANEL_LAYOUT = [
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
        id: "inference",
        titleKey: "cardInference",
        icon: "sliders",
        columns: 2,
        bandFlip: true,
        fields: [
            { name: "platform", labelKey: "fieldPlatformModel", kind: "select", wideRow: "target" },
            { name: "model", labelKey: "fieldModel", kind: "select", wideRow: "target", wideRowLabel: false },
            { name: "size_limitation", labelKey: "fieldSizeLimitation", kind: "number" },
            { name: "max_tokens", labelKey: "fieldMaxTokens", kind: "number" },
            { name: "temperature", labelKey: "fieldTemperature", kind: "range" },
            { name: "repetition_penalty", labelKey: "fieldRepetitionPenalty", kind: "range" },
            { name: "top_k", labelKey: "fieldTopK", kind: "range", integer: true },
            { name: "top_p", labelKey: "fieldTopP", kind: "range" },
            { name: "seed", labelKey: "fieldSeed", kind: "number" },
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

injectQVLStyles("platform-model-row", `
.iuo-param .pk-fields__wide-row {
    gap: 2px;
    --iuo-platform-control-w: 146px;
    --iuo-platform-label-w: 134px;
}
.iuo-param .pk-fields__wide-row .pk-field[data-widget="platform"] {
    flex: 0 0 auto;
    width: calc(8px + var(--iuo-platform-label-w) + 8px + var(--iuo-platform-control-w));
    grid-template-columns: var(--iuo-platform-label-w) minmax(0, 1fr);
    padding-right: 0;
}
.iuo-param .pk-fields__wide-row .pk-field[data-widget="model"] {
    flex: 1 1 auto;
    width: auto;
    grid-template-columns: minmax(0, 1fr);
    padding-left: 0;
}
@supports (appearance: base-select) {
    .iuo-param .pk-fields__wide-row .pk-field[data-widget="platform"] .pk-control--select::after {
        display: none;
    }
    .iuo-param .pk-fields__wide-row .pk-field[data-widget="platform"] .pk-select {
        padding: 0 10px;
    }
    .iuo-param .pk-fields__wide-row .pk-field[data-widget="platform"] .pk-select::picker-icon {
        display: block;
        margin: 0;
        width: 8px;
        height: 8px;
        translate: 0 -7px;
        content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpolyline points='1,2.5 4,5.5 7,2.5' fill='none' stroke='%2393C5FD' stroke-width='1.4'/%3E%3C/svg%3E");
    }
    .iuo-param .pk-fields__wide-row .pk-field[data-widget="platform"] .pk-select:open::picker-icon {
        rotate: 180deg;
    }
}
`);

const IUO_PANEL_MANAGED = IUO_PANEL_LAYOUT.flatMap(card => card.fields.map(field => field.name));

const IUO_WIDGET_ONLY_INPUTS = [
    ...IUO_PANEL_LAYOUT.flatMap(card => card.fields.map(field => ({
        name: field.name,
        labelKey: field.labelKey,
    }))),
];
const IUO_WIDGET_ONLY_BY_NAME = new Map(IUO_WIDGET_ONLY_INPUTS.map(entry => [entry.name, entry]));

const IUO_NATIVE_WIDGET_TYPES = {
    use_preset: "toggle",
    preset_prompt: "combo",
    prompt_length: "combo",
    prompt_format: "combo",
    output_language: "combo",
    user_prompt: "customtext",
    system_prompt: "customtext",
    platform: "combo",
    model: "combo",
    size_limitation: "number",
    max_tokens: "number",
    temperature: "number",
    repetition_penalty: "number",
    top_k: "number",
    top_p: "number",
    seed: "number",
    control_after_generate: "combo",
    batch_mode: "toggle",
    batch_folder_path: "text",
    skip_exists: "toggle",
};

function iuoRememberWidgetTypes(node) {
    (node?.widgets ?? []).forEach(widget => {
        if (!widget || widget.type === "converted-widget") return;
        if (!IUO_WIDGET_ONLY_BY_NAME.has(widget.name)) return;
        if (!widget._iuoNativeType) widget._iuoNativeType = widget.type;
    });
}

function iuoDropWidgetOnlyInputs(node) {
    if (!Array.isArray(node?.inputs)) return false;
    if (node._iuoDroppingInputs) return false;
    iuoRememberWidgetTypes(node);
    const victims = node.inputs
        .map((slot, index) => ({ slot, index }))
        .filter(({ slot }) => slot && IUO_WIDGET_ONLY_BY_NAME.has(slot.name))
        .sort((a, b) => b.index - a.index);
    if (!victims.length) return false;
    const wired = victims.filter(({ slot }) => slot.link != null);
    node._iuoDroppingInputs = true;
    try {
        node.graph?.beforeChange?.();
        for (const { index } of victims) {
            if (node.inputs[index]?.link != null) node.disconnectInput?.(index, true);
            node.removeInput?.(index);
        }
        Object.entries(IUO_NATIVE_WIDGET_TYPES).forEach(([name, type]) => {
            const widget = node.widgets?.find(entry => entry.name === name);
            if (widget?.type === "converted-widget") {
                widget.type = widget._iuoNativeType || type;
            }
        });
        node.graph?.afterChange?.(true);
    } finally {
        node._iuoDroppingInputs = false;
    }
    node.setDirtyCanvas?.(true, true);
    if (wired.length) {
        const labels = wired.map(({ slot }) => $t(IUO_WIDGET_ONLY_BY_NAME.get(slot.name).labelKey));
        showIUOToast(
            $t('panelOnlyInputsCut').replace('{fields}', labels.join(getLocale() === 'zh' ? '、' : ', ')),
            "warning"
        );
    }
    return true;
}

function iuoValidateSelectWidget(node, name) {
    const widget = node?.widgets?.find(entry => entry.name === name);
    const values = widget?.options?.values;
    if (!widget || !Array.isArray(values) || values.length === 0) return false;
    if (values.includes(widget.value)) return false;
    widget.value = values[0];
    return true;
}

function iuoValidateOutputLanguage(node) {
    const widget = node?.widgets?.find(entry => entry.name === "output_language");
    if (!widget) return false;
    let changed = false;
    const values = Array.isArray(widget.options?.values) ? widget.options.values : null;
    if (values && (values.length !== IUO_OUTPUT_LANGUAGES.length
        || IUO_OUTPUT_LANGUAGES.some(lang => !values.includes(lang)))) {
        widget.options.values = [...IUO_OUTPUT_LANGUAGES];
        changed = true;
    }
    if (!IUO_OUTPUT_LANGUAGES.includes(widget.value)) {
        widget.value = IUO_OUTPUT_LANGUAGES[0];
        changed = true;
    }
    return changed;
}

function iuoStripLegacyIgnorePreset(node) {
    const widget = node?.widgets?.find(entry => entry.name === "preset_prompt");
    if (!widget) return false;
    let changed = false;
    const values = Array.isArray(widget.options?.values) ? widget.options.values : null;
    if (values && values.includes("Ignore")) {
        widget.options.values = values.filter(value => value !== "Ignore");
        changed = true;
    }
    if (widget.value === "Ignore") {
        widget.value = widget.options?.values?.[0] ?? widget.value;
        changed = true;
    }
    return changed;
}

function iuoValidatePanelSelects(node) {
    const changed = [
        iuoStripLegacyIgnorePreset(node),
        iuoValidateSelectWidget(node, "preset_prompt"),
        iuoValidateSelectWidget(node, "prompt_length"),
        iuoValidateSelectWidget(node, "prompt_format"),
        iuoValidateOutputLanguage(node),
    ].some(Boolean);
    if (changed) node.setDirtyCanvas?.(true, true);
    return changed;
}

function iuoSyncParamPanel(node) {
    iuoValidatePanelSelects(node);
    node?._iuoPanel?.sync();
}

function iuoRefreshPanelLabels(node) {
    const panel = node?._iuoPanel;
    if (panel) {
        panel.cards?.forEach(card => card.setTexts?.());
        panel.controls.forEach(control => control.refreshLabels?.());
        panel.sync?.();
        node?._iuoPromptButtons?.forEach((button, kind) => {
            const key = { template: 'templateTooltip', restore: 'restoreTooltip', clear: 'clearTooltip' }[kind];
            if (!key) return;
            const text = $t(key);
            button.setTooltip(text);
            button.el.setAttribute("aria-label", text);
        });
        const resetButton = node?._iuoResetButton;
        if (resetButton) {
            const resetText = $t("resetInferenceTooltip");
            const resetLabel = $t("resetInferenceLabel");
            resetButton.setTooltip(resetText);
            resetButton.el.setAttribute("aria-label", resetText);
            resetButton.setText(resetLabel);
        }
    }
    const statusHost = node?._statusBarHost;
    if (statusHost) {
        const title = statusHost.querySelector(".pk-card__title");
        if (title) title.textContent = $t('statusBarTitle');
    }
    const clear = node?._statusBarClear;
    if (clear) {
        clear.setAttribute("aria-label", $t('statusBarClear'));
        clear.textContent = $t('statusBarClearLabel');
    }
}

function iuoFindWidget(node, name) {
    return (node?.widgets ?? []).find(entry => entry?.name === name) || null;
}

function iuoResizeToContent(node) {
    if (!node || typeof node.computeSize !== "function") return;
    window.requestAnimationFrame(() => {
        if (!node.graph || node._iuoResizing) return;
        const computed = node.computeSize();
        if (!Array.isArray(computed)) return;
        const width = Math.max(node.size?.[0] ?? QVL_NODE_MIN_WIDTH, QVL_NODE_MIN_WIDTH);
        const currentHeight = node.size?.[1] ?? 0;
        const measured = node._iuoPanel?.panel?.offsetHeight ?? 0;
        const height = measured > 0
            ? Math.max(computed[1], QVL_NODE_MIN_HEIGHT)
            : Math.max(computed[1], QVL_NODE_MIN_HEIGHT, currentHeight);
        if (height === currentHeight) return;
        node._iuoResizing = true;
        try {
            node.setSize([width, height]);
        } finally {
            node._iuoResizing = false;
        }
        node.graph?.setDirtyCanvas?.(true, true);
    });
}


function iuoNormalizeDroppedPath(raw) {
    if (!raw) return "";
    const lines = String(raw).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
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

function iuoExtractDroppedPath(event) {
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
        const path = iuoNormalizeDroppedPath(raw);
        if (path) return path;
    }
    return "";
}

function iuoExtractDroppedName(event) {
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

async function rememberIUOBatchFolder(path) {
    if (!path) return;
    try {
        await fetch("/zhiai_nodes/image_understanding/batch_config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_batch_folder: path }),
        });
    } catch (err) {
    }
}

function iuoAttachFolderPicker(control, inputEl, api) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pk-mini-btn pk-field__folder-btn";
    button.innerHTML = '<span class="pk-mini-btn__glyph">' + qvlSvg("folder", 13) + "</span>"
        + "<span></span>";
    const buttonText = button.querySelector("span:last-child");

    const refreshLabels = () => {
        buttonText.textContent = $t("folderPickBtn");
        button.setAttribute("aria-label", $t("folderPickBtn"));
    };
    refreshLabels();
    attachPanelTooltip(button, () => $t("folderPickTooltip"));
    control.appendChild(button);

    const setDropState = (active) => control.classList.toggle("pk-drop-active", !!active);
    const setLocating = (active) => control.classList.toggle("pk-locating", !!active);

    const commitPath = (path) => {
        api.commit(path);
        rememberIUOBatchFolder(path);
    };

    const locateByName = async (name) => {
        if (!name) {
            showIUOToast($t("folderDropNoPath"), "warning");
            return;
        }
        button.disabled = true;
        setLocating(true);
        try {
            const response = await fetch(
                `/zhiai_nodes/image_understanding/locate_folder?name=${encodeURIComponent(name)}`,
            );
            if (!response.ok) {
                console.warn("[ImageUnderstandingOnline] locate endpoint unavailable:", response.status);
                showIUOToast($t("folderLocateUnavailable"), "error");
                return;
            }
            const data = await response.json().catch(() => ({}));
            const matches = Array.isArray(data?.matches) ? data.matches : [];
            if (matches.length === 0) {
                showIUOToast($t("folderNotFound"), "warning");
                return;
            }
            commitPath(matches[0]);
        } catch (err) {
            console.error("[ImageUnderstandingOnline] locate folder failed:", err);
            showIUOToast($t("folderPickFailed"), "error");
        } finally {
            button.disabled = false;
            setLocating(false);
        }
    };

    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (button.disabled) return;
        button.disabled = true;
        try {
            const response = await fetch("/zhiai_nodes/image_understanding/select_directory");
            const data = await response.json().catch(() => ({}));
            const path = String(data?.path || "").trim();
            if (path) {
                commitPath(path);
            } else if (!data?.cancelled) {
                showIUOToast($t("folderPickFailed"), "error");
            }
        } catch (err) {
            console.error("[ImageUnderstandingOnline] folder picker failed:", err);
            showIUOToast($t("folderPickFailed"), "error");
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
        const path = iuoExtractDroppedPath(event);
        const name = iuoExtractDroppedName(event);
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
        locateByName(name);
    });

    return { button, refreshLabels };
}

function iuoCreateParamPanel(node) {
    if (node._iuoPanel) return node._iuoPanel;
    const panel = createPanel({
        node,
        layout: IUO_PANEL_LAYOUT,
        className: "iuo-param",
        widgetName: "iuo_param_panel",
        minWidth: QVL_PANEL_MIN_WIDTH,
        t: (key) => $t(key),
        icon: (key, size) => qvlSvg(key, size),
        getWidget: (name) => iuoFindWidget(node, name),
        isGroupLocked: () => iuoTextPortLinked(node),
        folderPicker: (control, inputEl, api) => iuoAttachFolderPicker(control, inputEl, api),
    });
    IUO_PANEL_MANAGED.forEach(name => {
        const widget = iuoFindWidget(node, name);
        if (widget) hideNativeWidget(node, widget);
    });
    panel.sync();
    if (!iuoFindWidget(node, "batch_mode")) {
        panel.cards?.get?.("batch")?.setNote?.($t('batchNeedsRestart'));
    }
    node._iuoPanel = panel;
    if (node._iuoStatusBarPending) {
        node._iuoStatusBarPending = false;
        apiConfigManager.applyStatusBarToNode(node, true);
    }
    return panel;
}

function iuoWrapOptionLabel(node, widgetName, mapper) {
    const widget = node.widgets?.find(w => w.name === widgetName);
    const options = widget?.options;
    if (!options || options._iuoLabelWrapped) return;
    const previous = options.getOptionLabel;
    options.getOptionLabel = (value) => {
        const mapped = mapper(value);
        if (mapped !== null) return mapped;
        return typeof previous === "function" ? previous.call(options, value) : value;
    };
    options._iuoLabelWrapped = true;
}

function iuoApplyOptionLabels(node) {
    iuoWrapOptionLabel(node, "platform", iuoPlaceholderLabel);
    iuoWrapOptionLabel(node, "model", iuoModelLabel);
    iuoWrapOptionLabel(node, "preset_prompt", iuoPresetLabel);
}

function iuoApplyPlatformOptions(node, config) {
    const widget = node.widgets?.find(w => w.name === "platform");
    if (!widget) return;
    const options = iuoPlatformOptions(config);
    widget.options = widget.options || {};
    iuoApplyOptionLabels(node);
    widget.options.values = [...options];
    const previous = typeof widget.value === "string" ? widget.value.trim() : "";
    widget.value = options.includes(previous) ? previous : iuoDefaultPlatform(config);
    node._iuoPlatformOptions = options;
}

function setupPlatformSelector(node, config) {
    iuoApplyPlatformOptions(node, config);
    iuoApplyModelOptions(node, config);
    iuoAttachPlatformModelLinkage(node);
    node.setDirtyCanvas?.(true, true);
}

function refreshIUOPlatformSelectors(config) {
    const nodes = app.graph?._nodes || [];
    nodes.forEach(node => {
        if (node.type !== "ImageUnderstandingOnline") return;
        iuoApplyPlatformOptions(node, config);
        iuoApplyModelOptions(node, config);
        node._iuoPanel?.sync();
    });
    app.graph?.setDirtyCanvas(true, true);
}

function iuoApplyImageSlotShape(node) {
    const slot = (node?.inputs ?? []).find(entry => entry?.name === "images");
    if (!slot) return false;
    const shape = globalThis.LiteGraph?.SlotShape?.HollowCircle ?? 7;
    const label = $t('imageSlotLabel');
    let changed = false;
    if (slot.shape !== shape) {
        slot.shape = shape;
        changed = true;
    }
    if (slot.label !== label) {
        slot.label = label;
        changed = true;
    }
    if ("localized_name" in slot && slot.localized_name !== label) {
        slot.localized_name = label;
        changed = true;
    }
    return changed;
}

function iuoSettleImageSlot(node) {
    if (iuoApplyImageSlotShape(node)) {
        node.graph?.setDirtyCanvas?.(true, true);
    }
}

const IUO_TEXT_PORT = { name: "text_prompt", type: "STRING" };

function iuoTextPortLinked(node) {
    return (node?.inputs ?? []).some(slot => slot?.name === IUO_TEXT_PORT.name && slot?.link != null);
}

function iuoApplyTextPortLabel(node) {
    const slot = (node?.inputs ?? []).find(entry => entry?.name === IUO_TEXT_PORT.name);
    if (!slot) return false;
    const shape = globalThis.LiteGraph?.SlotShape?.HollowCircle ?? 7;
    const label = $t('textPortSlotLabel');
    let changed = false;
    if (slot.shape !== shape) {
        slot.shape = shape;
        changed = true;
    }
    if (slot.label !== label) {
        slot.label = label;
        changed = true;
    }
    if ("localized_name" in slot && slot.localized_name !== label) {
        slot.localized_name = label;
        changed = true;
    }
    return changed;
}

function iuoEnsureTextPort(node) {
    if (!Array.isArray(node?.inputs)) return false;
    if (!node.inputs.some(slot => slot?.name === IUO_TEXT_PORT.name)) {
        node.addInput?.(IUO_TEXT_PORT.name, IUO_TEXT_PORT.type, { optional: true });
        node.graph?.afterChange?.(true);
    }
    return iuoApplyTextPortLabel(node);
}

function iuoCardActionRect(el) {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
        width: rect.width, height: rect.height,
    };
}

function iuoAttachPromptCardActions(node) {
    const card = node?._iuoPanel?.cards?.get("prompt");
    const actions = node?._iuoActions;
    if (!card?.actions || !actions) return;
    const holder = card.actions();
    if (holder.dataset.iuoFilled === "true") return;
    holder.dataset.iuoFilled = "true";
    const tipKeys = {
        template: 'templateTooltip',
        restore: 'restoreTooltip',
        clear: 'clearTooltip',
    };
    const anchor = holder.querySelector(".pk-field");
    node._iuoPromptButtons = new Map();
    ["template", "restore", "clear"].forEach(kind => {
        const tipKey = tipKeys[kind];
        const button = createIconButton({
            icon: kind,
            iconSize: 18,
            variant: kind,
            size: "sm",
            render: (key, size) => qvlSvg(key, size),
            label: $t(tipKey),
            tooltip: () => $t(tipKey),
            onClick: (api) => {
                const handled = actions[kind]?.(iuoCardActionRect(api.el));
                if (handled !== false) api.setState("success", 1200);
            },
        });
        button.el.dataset.iuoAction = kind;
        node._iuoPromptButtons.set(kind, button);
        if (anchor) holder.insertBefore(button.el, anchor);
        else holder.appendChild(button.el);
    });
}

const IUO_INFERENCE_RESET_FIELDS = (IUO_PANEL_LAYOUT.find(card => card.id === "inference")?.fields || [])
    .map(field => field.name)
    .filter(name => name !== "platform" && name !== "model" && name !== "control_after_generate");

function iuoRestoreInferenceDefaults(node) {
    const panel = node?._iuoPanel;
    const nodeInput = node?.constructor?.nodeData?.input;
    if (!panel?.controls || !nodeInput) return false;
    const table = new Map([
        ...Object.entries(nodeInput.required || {}),
        ...Object.entries(nodeInput.optional || {}),
    ]);
    let changed = false;
    IUO_INFERENCE_RESET_FIELDS.forEach((name) => {
        const control = panel.controls.get(name);
        const widget = node.widgets?.find(entry => entry.name === name);
        const spec = table.get(name);
        if (!control || !widget || !spec?.[1]) return;
        if (!Object.prototype.hasOwnProperty.call(spec[1], "default")) return;
        const next = spec[1].default;
        if (widget.value === next) return;
        control.commit?.(next);
        changed = true;
    });
    if (changed) panel.sync?.();
    return changed;
}

function iuoAttachInferenceCardActions(node) {
    const card = node?._iuoPanel?.cards?.get("inference");
    if (!card?.actions) return;
    const holder = card.actions();
    if (holder.dataset.iuoResetFilled === "true") return;
    holder.dataset.iuoResetFilled = "true";
    const tipKey = "resetInferenceTooltip";
    const labelKey = "resetInferenceLabel";
    const button = createIconButton({
        icon: "sliders",
        iconSize: 16,
        variant: "restore",
        text: $t(labelKey),
        render: (key, size) => qvlSvg(key, size),
        label: $t(tipKey),
        tooltip: () => $t(tipKey),
        onClick: (api) => {
            const changed = iuoRestoreInferenceDefaults(node);
            node.setDirtyCanvas?.(true, true);
            api.setState(changed ? "success" : "idle", 1200);
            showIUOToast(
                $t(changed ? "resetInferenceDone" : "resetInferenceNone"),
                changed ? "success" : "info"
            );
        },
    });
    button.el.dataset.iuoAction = "resetInference";
    node._iuoResetButton = button;
    holder.appendChild(button.el);
}

function addIUOInputButtons(node) {
    const systemPromptWidget = node.widgets?.find(w => w.name === "system_prompt");
    if (!systemPromptWidget) return;

    const getValue = () => {
        const control = node._iuoPanel?.controls?.get("system_prompt");
        if (control) return control.getValue();
        return systemPromptWidget.value ?? "";
    };

    const setSystemPrompt = (value) => {
        systemPromptWidget.value = value;
        if (systemPromptWidget.callback) systemPromptWidget.callback(value);
        const control = node._iuoPanel?.controls?.get("system_prompt");
        if (control) {
            control.setValue(value);
        } else if (systemPromptWidget.inputEl) {
            systemPromptWidget.inputEl.value = value;
            systemPromptWidget.inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        }
    };

    node._iuoActions = {
        restore: () => {
            if (node._lastClearedContent !== undefined) {
                setSystemPrompt(node._lastClearedContent);
                node._lastClearedContent = undefined;
                showIUOToast($t('restoreContent'), "success");
                return true;
            }
            showIUOToast($t('noContentToRestore'), "warning");
            return false;
        },
        clear: () => {
            const current = String(getValue() ?? "");
            if (current.trim()) {
                node._lastClearedContent = current;
                setSystemPrompt("");
                showIUOToast($t('clearContent'), "success");
                return true;
            }
            showIUOToast($t('noContentToClear'), "warning");
            return false;
        },
        template: (anchorRect) => {
            loadTemplateModule().then((mod) => {
                if (!mod?.toggleTemplatePicker) return;
                mod.toggleTemplatePicker({
                    anchorRect,
                    theme: mod.TEMPLATE_MANAGER_THEME_GLASS,
                    onPick: (template) => {
                        setSystemPrompt(template.content);
                        node.setDirtyCanvas(true, true);
                    },
                    onManage: () => mod.openTemplateManagerDialog({
                        theme: mod.TEMPLATE_MANAGER_THEME_GLASS,
                    }),
                });
            });
            return true;
        },
    };
    node._iuoActionTooltips = {
        restore: 'restoreTooltip',
        clear: 'clearTooltip',
        template: 'templateTooltip',
    };
}

app.registerExtension({
    name: "Comfyui_ImageUnderstandingOnline.APIConfig",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "ImageUnderstandingOnline") {
            return;
        }
        
        switch (nodeData.name) {
            case "ImageUnderstandingOnline":
                const onNodeCreated = nodeType.prototype.onNodeCreated;
                nodeType.prototype.onNodeCreated = function () {
                    const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                    
                    this._iuoHelp = false;
                    this._iuoHelpLocale = getLocale();
                    
                    setTimeout(async () => {
                        const config = await apiConfigManager.loadConfig();
                        setupPlatformSelector(this, config);
                        iuoDropWidgetOnlyInputs(this);
                        iuoValidatePanelSelects(this);
                        iuoCreateParamPanel(this);
                        apiConfigManager.applyStatusBarToNode(this, config.show_status_bar !== false);
                        addIUOInputButtons(this);
                        iuoAttachPromptCardActions(this);
                        iuoAttachInferenceCardActions(this);
                        iuoSettleImageSlot(this);
                        iuoEnsureTextPort(this);
                        const width = this.size?.[0] ?? 0;
                        const height = this.size?.[1] ?? 0;
                        const minHeight = QVL_NODE_MIN_HEIGHT;
                        const needsDefault = width <= 0 || height <= 0;
                        const width2 = needsDefault ? QVL_NODE_DEFAULT_WIDTH : width;
                        const height2 = needsDefault ? QVL_NODE_DEFAULT_HEIGHT : height;
                        if (width2 < QVL_NODE_MIN_WIDTH || height2 < minHeight
                            || width2 !== width || height2 !== height) {
                            this.setSize([
                                Math.max(width2, QVL_NODE_MIN_WIDTH),
                                Math.max(height2, minHeight)
                            ]);
                        }
                        app.graph.setDirtyCanvas(true, true);
                        iuoResizeToContent(this);
                        window.setTimeout(() => { if (this.graph) iuoResizeToContent(this); }, 160);
                        window.setTimeout(() => { if (this.graph) iuoResizeToContent(this); }, 460);
                    }, 100);
                    
                    return r;
                };

                const onConnectionsChange = nodeType.prototype.onConnectionsChange;
                nodeType.prototype.onConnectionsChange = function (type, index, connected, linkInfo) {
                    const r = onConnectionsChange
                        ? onConnectionsChange.apply(this, arguments)
                        : undefined;
                    window.setTimeout(() => {
                        if (!this.graph) return;
                        iuoDropWidgetOnlyInputs(this);
                        iuoEnsureTextPort(this);
                        iuoSyncParamPanel(this);
                        iuoResizeToContent(this);
                    }, 0);
                    return r;
                };

                const onConfigure = nodeType.prototype.onConfigure;
                nodeType.prototype.onConfigure = function () {
                    const result = onConfigure ? onConfigure.apply(this, arguments) : undefined;
                    window.setTimeout(() => {
                        iuoDropWidgetOnlyInputs(this);
                        iuoSettleImageSlot(this);
                        iuoEnsureTextPort(this);
                        iuoSyncParamPanel(this);
                        iuoResizeToContent(this);
                        window.setTimeout(() => { if (this.graph) iuoResizeToContent(this); }, 200);
                    }, 0);
                    return result;
                };

                const onExecuted = nodeType.prototype.onExecuted;
                nodeType.prototype.onExecuted = function (message) {
                    onExecuted?.apply(this, arguments);
                    const body = this._statusBarBody;
                    if (body && message?.status) {
                        const statusText = Array.isArray(message.status)
                            ? message.status.join("\n")
                            : String(message.status);
                        body.textContent = statusText;
                        body.dataset.empty = "false";
                        body.scrollTop = body.scrollHeight;
                        app.graph.setDirtyCanvas(true, false);
                        iuoResizeToContent(this);
                    }
                };

                const iconSize = 24;
                const iconMargin = 4;
                const iconGap = 4;
                const TITLE_ICON_ORDER = ["help", "settings"];
                let helpElement = null;
                let currentHelpLocale = null;

                const onResize = nodeType.prototype.onResize;
                nodeType.prototype.onResize = function (size) {
                    const r = onResize ? onResize.apply(this, arguments) : undefined;
                    if (Array.isArray(size)) {
                        const current = this.size || size;
                        const width = Number.isFinite(size[0]) ? size[0] : current[0];
                        const height = Number.isFinite(size[1]) ? size[1] : current[1];
                        const minHeight = QVL_NODE_MIN_HEIGHT;
                        if (width < QVL_NODE_MIN_WIDTH || height < minHeight) {
                            this.setSize([
                                Math.max(width, QVL_NODE_MIN_WIDTH),
                                Math.max(height, minHeight)
                            ]);
                        }
                    }
                    this._iuoPanel?.sync();
                    return r;
                };
                const computeSize = nodeType.prototype.computeSize;
                nodeType.prototype.computeSize = function () {
                    const size = computeSize
                        ? computeSize.apply(this, arguments)
                        : null;
                    if (!Array.isArray(size)) return size;
                    const width = Number.isFinite(size[0]) ? size[0] : QVL_NODE_MIN_WIDTH;
                    const minHeight = QVL_NODE_MIN_HEIGHT;
                    const height = Number.isFinite(size[1]) ? size[1] : minHeight;
                    return [
                        Math.max(width, QVL_NODE_MIN_WIDTH),
                        Math.max(height, minHeight)
                    ];
                };

                nodeType.prototype._titleIconLeft = function (kind) {
                    const index = TITLE_ICON_ORDER.indexOf(kind);
                    if (index < 0) return this.size[0];
                    const helpX = this.size[0] - iconSize - iconMargin;
                    return helpX - index * (iconSize + iconGap);
                };

                nodeType.prototype._titleIconTop = function () {
                    return -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;
                };

                nodeType.prototype._hitTitleIcon = function (localPos, kind) {
                    if (!localPos) return false;
                    const left = this._titleIconLeft(kind);
                    const top = this._titleIconTop();
                    return localPos[0] > left
                        && localPos[0] < left + iconSize
                        && localPos[1] > top
                        && localPos[1] < top + iconSize;
                };

                nodeType.prototype._hitTitleAction = function (localPos) {
                    return null;
                };

                const drawFg = nodeType.prototype.onDrawForeground;
                nodeType.prototype.onDrawForeground = function (ctx) {
                    const currentLocale = getLocale();
                    if (this._iuoHelpLocale !== currentLocale) {
                        this._iuoHelpLocale = currentLocale;
                        iuoRefreshPanelLabels(this);
                    }
                    
                    const r = drawFg ? drawFg.apply(this, arguments) : undefined;
                    if (this.flags.collapsed) return r;

                    const y = this._titleIconTop();

                    const canvasRect = ctx.canvas.getBoundingClientRect();
                    const scaleX = canvasRect.width / ctx.canvas.width;
                    const scaleY = canvasRect.height / ctx.canvas.height;
                    const toScreen = new DOMMatrix()
                        .scaleSelf(scaleX, scaleY)
                        .multiplySelf(ctx.getTransform());
                    const bcr = app.canvas.canvas.getBoundingClientRect();

                    if (this._iuoHelp && helpElement === null) {
                        currentHelpLocale = currentLocale;
                        helpElement = createIUOHelpPopup(getIUOHelpHTML());
                    }
                    else if (!this._iuoHelp && helpElement !== null) {
                        helpElement.remove();
                        helpElement = null;
                        currentHelpLocale = null;
                    }
                    else if (this._iuoHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                        helpElement.querySelector('div').innerHTML = getIUOHelpHTML();
                        currentHelpLocale = currentLocale;
                    }

                    if (this._iuoHelp && helpElement !== null) {
                        const transform = new DOMMatrix()
                            .scaleSelf(scaleX, scaleY)
                            .multiplySelf(ctx.getTransform())
                            .translateSelf(this.size[0] * scaleX * Math.max(1.0, window.devicePixelRatio), 0)
                            .translateSelf(10, -32);

                        helpElement.style.left = `${transform.e + bcr.x}px`;
                        helpElement.style.top = `${transform.f + bcr.y}px`;
                    }

                    const helpActive = !!(this._iuoHelp || this._iuoHelpHovered);

                    ctx.save();
                    ctx.translate(this._titleIconLeft("help"), y);
                    ctx.scale(iconSize / 32, iconSize / 32);
                    drawNodeHelpButton(ctx, helpActive);
                    
                    ctx.restore();

                    const settingsActive = !!apiConfigManager.isDialogOpen || !!this._iuoSettingsHovered;
                    ctx.save();
                    ctx.translate(this._titleIconLeft("settings"), y);
                    ctx.scale(iconSize / 32, iconSize / 32);
                    drawNodeSettingsButton(ctx, settingsActive);
                    ctx.restore();

                    return r;
                };

                const mouseDown = nodeType.prototype.onMouseDown;
                nodeType.prototype.onMouseDown = function (e, localPos, canvas) {
                    const r = mouseDown ? mouseDown.apply(this, arguments) : undefined;
                    if (this._hitTitleIcon(localPos, "settings")) {
                        hideTitleTip();
                        document.getElementById("iuo-template-selector")?.remove();
                        document.querySelector("style[data-iuo-template-style]")?.remove();
                        apiConfigManager.showConfigDialog();
                        return true;
                    }
                    if (this._hitTitleIcon(localPos, "help")) {
                        hideTitleTip();
                        this._iuoHelp = !this._iuoHelp;
                        return true;
                    }
                    return r;
                };

                const mouseMove = nodeType.prototype.onMouseMove;
                nodeType.prototype.onMouseMove = function (e, localPos, canvas) {
                    const r = mouseMove ? mouseMove.apply(this, arguments) : undefined;
                    const settingsHovered = this._hitTitleIcon(localPos, "settings");
                    const helpHovered = this._hitTitleIcon(localPos, "help");
                    if (settingsHovered !== this._iuoSettingsHovered
                        || helpHovered !== this._iuoHelpHovered) {
                        this._iuoSettingsHovered = settingsHovered;
                        this._iuoHelpHovered = helpHovered;
                        this.setDirtyCanvas(true, true);
                    }
                    const locale = getLocale();
                    if (helpHovered) {
                        titleTipHovered(true, locale === "zh" ? "节点帮助" : "Node help", e);
                    } else if (settingsHovered) {
                        titleTipHovered(true, locale === "zh" ? "API 设置" : "API Settings", e);
                    } else {
                        hideTitleTip();
                    }
                    return r;
                };

                const mouseLeave = nodeType.prototype.onMouseLeave;
                nodeType.prototype.onMouseLeave = function () {
                    const r = mouseLeave ? mouseLeave.apply(this, arguments) : undefined;
                    if (this._iuoHelpHovered || this._iuoSettingsHovered) {
                        this._iuoHelpHovered = false;
                        this._iuoSettingsHovered = false;
                        this.setDirtyCanvas(true, true);
                    }
                    hideTitleTip();
                    return r;
                };

                const onRemoved = nodeType.prototype.onRemoved;
                nodeType.prototype.onRemoved = function () {
                    const r = onRemoved ? onRemoved.apply(this, []) : undefined;
                    if (helpElement) {
                        helpElement.remove();
                        helpElement = null;
                        currentHelpLocale = null;
                    }
                    this._iuoPromptButtons?.forEach(button => button.dispose?.());
                    this._iuoPromptButtons = null;
                    hidePanelTooltip();
                    return r;
                };
                break;
        }
    },
    async setup() {
        const originalComputeVisibleNodes =
            LGraphCanvas.prototype.computeVisibleNodes;
        LGraphCanvas.prototype.computeVisibleNodes = function () {
            const visibleNodesSet = new Set(
                originalComputeVisibleNodes.apply(this, arguments)
            );
            for (const node of this.graph._nodes) {
                if (
                    (node.type === "SetNode" || node.type === "GetNode") &&
                    node.drawConnection
                ) {
                    visibleNodesSet.add(node);
                }
            }
            return Array.from(visibleNodesSet);
        };
    },
});