import { app } from "/scripts/app.js";
import { drawNodeHelpButton } from "./node_title_icons.js";
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

const i18n = {
    zh: {
        nodeSettings: "⚙️ 设置",
        settings: "设置",
        settingsTitle: "Qwen3-VL API设置",
        configApiKeys: "配置各个平台的API密钥。配置后，节点将自动使用这些密钥，无需每次手动输入。",
        advancedParams: "高级设置",
        enableAdvancedParams: "高级参数",
        advancedParamsDesc: "勾选后显示Top K采样、重复惩罚、最小P采样、Top P采样参数",
        showStatusBar: "显示状态栏",
        showStatusBarDesc: "勾选后在节点底部显示运行状态信息",
        platformConfigs: "平台服务配置",
        restoreDefault: "恢复默认",
        exportConfig: "导出配置",
        importConfig: "导入配置",
        apply: "应用",
        cancel: "取消",
        confirm: "确定",
        save: "保存",
        platform: "平台",
        apiKey: "API密钥",
        apiKeyDesc: "请输入平台的API密钥",
        customModel: "自定义模型",
        customModelDesc: "自定义模型名称（可选）",
        customBaseUrl: "自定义Base URL",
        customBaseUrlDesc: "自定义API请求地址（可选）",
        addPlatform: "添加平台",
        delete: "删除",
        addCustomPlatform: "添加自定义平台",
        editPlatform: "编辑平台",
        confirmDelete: "确定要删除这个平台配置吗？",
        deleteFailed: "删除失败",
        saveFailed: "保存失败",
        saveSuccess: "保存成功",
        invalidJson: "无效的JSON格式",
        importSuccess: "导入成功",
        importFailed: "导入失败",
        activate: "激活",
        modelSelection: "模型选择:",
        apiKeyLabel: "API密钥:",
        apiKeyPlaceholder: "输入{platform}的API密钥",
        website: "官网",
        documentation: "文档",
        savePlatformConfig: "保存该平台配置",
        cancelPlatformConfig: "取消",
        customConfig: "自定义配置{num}",
        configName: "配置名称:",
        configNamePlaceholder: "配置名称",
        apiAddress: "API地址:",
        apiAddressPlaceholder: "https://api.example.com/v1/chat/completions",
        modelName: "模型名称:",
        modelNamePlaceholder: "custom-model-name",
        apiKeyPlaceholderCustom: "your-api-key-here",
        showHidePassword: "显示/隐藏密码",
        saveFailedAdvanced: "高级参数状态保存失败，请重试。",
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
        confirmRestoreDefault: "确定要恢复默认配置吗？这将清空所有当前设置。",
        restoreDefaultSuccess: "已恢复默认配置并已自动保存！",
        restoreDefaultFailed: "已恢复默认配置，但保存失败，请稍后重试或手动保存。",
        exportSuccess: "配置导出成功！",
        exportFailed: "导出配置失败，请重试。",
        confirmImportConfig: "确定要导入配置文件吗？这将覆盖当前的所有设置。",
        importError: "导入失败：{error}",
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
        navSettings: "节点设置",
        navTemplates: "模板管理",
        templateManagement: "快捷系统提示词模板管理",
        createTemplate: "新建模板",
        importFromLM: "从LM模板调用",
        editTemplate: "编辑系统提示词模板",
        templateName: "模板名称",
        templateContent: "模板内容",
        templateNamePlaceholder: "请输入模板名称",
        templateContentPlaceholder: "请输入系统提示词内容",
        templateCreated: "模板创建成功",
        templateUpdated: "模板更新成功",
        templateDeleted: "模板删除成功",
        templateCreateFailed: "模板创建失败",
        templateUpdateFailed: "模板更新失败",
        templateDeleteFailed: "模板删除失败",
        templateNameRequired: "模板名称不能为空",
        sortByName: "按名称排序",
        sortByTime: "按时间排序",
        edit: "编辑",
        confirmDelete: "确定要删除此模板吗？",
        helpTitle: "Qwen3-VL 在线版节点",
        helpDescription: "通过API调用Qwen3-VL多模态大模型，支持图像理解和对话。",
        helpFeatures: "功能特性",
        helpFeature1: "支持多种平台：硅基流动、魔搭社区、阿里云等",
        helpFeature2: "支持自定义API配置",
        helpFeature3: "支持系统提示词模板管理",
        helpFeature4: "支持图像输入和多轮对话",
        helpUsage: "使用说明",
        helpUsage1: "在节点设置中配置API密钥",
        helpUsage2: "选择要使用的平台",
        helpUsage3: "输入提示词和图像进行对话",
        helpInput: "输入",
        helpInputDesc: "支持文本提示词和图像输入",
        helpOutput: "输出",
        helpOutputDesc: "返回模型生成的文本回复"
    },
    en: {
        nodeSettings: "⚙️ Settings",
        settings: "Settings",
        settingsTitle: "Qwen3-VL API Settings",
        configApiKeys: "Configure API keys for each platform. After configuration, nodes will automatically use these keys without manual input each time.",
        advancedParams: "Advanced Settings",
        enableAdvancedParams: "Advanced Parameters",
        advancedParamsDesc: "Check to display Top K sampling, repetition penalty, min P sampling, Top P sampling parameters",
        showStatusBar: "Show Status Bar",
        showStatusBarDesc: "Check to display running status information at the bottom of the node",
        platformConfigs: "Platform Service Configuration",
        restoreDefault: "Restore Default",
        exportConfig: "Export Config",
        importConfig: "Import Config",
        apply: "Apply",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        platform: "Platform",
        apiKey: "API Key",
        apiKeyDesc: "Please enter the platform's API key",
        customModel: "Custom Model",
        customModelDesc: "Custom model name (optional)",
        customBaseUrl: "Custom Base URL",
        customBaseUrlDesc: "Custom API request address (optional)",
        addPlatform: "Add Platform",
        delete: "Delete",
        addCustomPlatform: "Add Custom Platform",
        editPlatform: "Edit Platform",
        confirmDelete: "Are you sure you want to delete this platform configuration?",
        deleteFailed: "Delete failed",
        saveFailed: "Save failed",
        saveSuccess: "Save successful",
        invalidJson: "Invalid JSON format",
        importSuccess: "Import successful",
        importFailed: "Import failed",
        activate: "Activate",
        modelSelection: "Model Selection:",
        apiKeyLabel: "API Key:",
        apiKeyPlaceholder: "Enter {platform} API key",
        website: "Website",
        documentation: "Documentation",
        savePlatformConfig: "Save Platform Config",
        cancelPlatformConfig: "Cancel",
        customConfig: "Custom Config {num}",
        configName: "Config Name:",
        configNamePlaceholder: "Config name",
        apiAddress: "API Address:",
        apiAddressPlaceholder: "https://api.example.com/v1/chat/completions",
        modelName: "Model Name:",
        modelNamePlaceholder: "custom-model-name",
        apiKeyPlaceholderCustom: "your-api-key-here",
        showHidePassword: "Show/Hide Password",
        saveFailedAdvanced: "Failed to save advanced parameter status, please try again.",
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
        navSettings: "Node Settings",
        navTemplates: "Template Manager",
        templateManagement: "Quick System Prompt Template Management",
        createTemplate: "Create Template",
        importFromLM: "Import from LM Presets",
        editTemplate: "Edit System Prompt Template",
        templateName: "Template Name",
        templateContent: "Template Content",
        templateNamePlaceholder: "Enter template name",
        templateContentPlaceholder: "Enter system prompt content",
        templateCreated: "Template created successfully",
        templateUpdated: "Template updated successfully",
        templateDeleted: "Template deleted successfully",
        templateCreateFailed: "Failed to create template",
        templateUpdateFailed: "Failed to update template",
        templateDeleteFailed: "Failed to delete template",
        templateNameRequired: "Template name is required",
        sortByName: "Sort by Name",
        sortByTime: "Sort by Time",
        edit: "Edit",
        confirmDelete: "Are you sure you want to delete this template?",
        helpTitle: "Qwen3-VL Online Node",
        helpDescription: "Call Qwen3-VL multimodal model via API, supporting image understanding and conversation.",
        helpFeatures: "Features",
        helpFeature1: "Support multiple platforms: SiliconFlow, ModelScope, Aliyun, etc.",
        helpFeature2: "Support custom API configuration",
        helpFeature3: "Support system prompt template management",
        helpFeature4: "Support image input and multi-turn conversation",
        helpUsage: "Usage",
        helpUsage1: "Configure API key in node settings",
        helpUsage2: "Select the platform to use",
        helpUsage3: "Enter prompt and image for conversation",
        helpInput: "Input",
        helpInputDesc: "Support text prompt and image input",
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

function getQwen3VLHelpHTML() {
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

function createQwen3VLHelpPopup(description) {
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
        this.configPath = "custom_nodes/zhihui_nodes_comfyui/Nodes/Qwen3VL/api_config.json";
        this.config = null;
        this.isDialogOpen = false;     
        this.platformModels = {
            "ModelScope": [
                "Qwen3.5-27B",
                "Qwen3.5-35B-A3B",
                "Qwen3.5-122B-A10B",
                "Qwen3.5-397B-A17B",
                "Qwen3-VL-8B-Instruct",
                "Qwen3-VL-8B-Thinking",
                "Qwen3-VL-235B-A22B-Instruct",
            ],

            "SiliconFlow": [
                "Qwen3-VL-8B-Instruct",
                "Qwen3-VL-8B-Thinking",
                "Qwen3-VL-32B-Thinking",
                "Qwen3-VL-32B-Instruct",
                "Qwen3-VL-30B-A3B-Thinking",
                "Qwen3-VL-30B-A3B-Instruct"
            ],
            
            "Aliyun": [
                "qwen3.6-plus",
                "qwen3.6-27b",
                "qwen3.6-35b-a3b",
                "qwen3.5-plus",
                "qwen3.5-flash",
                "qwen3.5-27b",
                "qwen3.5-35b-a3b",
                "qwen3.5-122b-a10b",
                "qwen3.5-397b-a17b",
                "qwen3-vl-plus",
                "qwen3-vl-flash",
                "qwen3-vl-235b-a22b-thinking",
                "qwen3-vl-235b-a22b-instruct",
                "qwen3-vl-32b-thinking",
                "qwen3-vl-32b-instruct",
                "qwen3-vl-30b-a3b-thinking",
                "qwen3-vl-30b-a3b-instruct",
                "qwen3-vl-8b-thinking",
                "qwen3-vl-8b-instruct"
            ]
        };
    }

    async loadConfig() {
        const defaultConfig = this.getDefaultConfig();
        
        try {
            const response = await api.fetchApi(`/zhihui_nodes/communication_config`, {
                method: "GET"
            });
            if (response.ok) {
                const fileConfig = await response.json();
                this.config = { ...defaultConfig };
                if (fileConfig.api_keys) {
                    Object.keys(defaultConfig.api_keys).forEach(platform => {
                        if (fileConfig.api_keys[platform]) {
                            if (fileConfig.api_keys[platform].api_key) {
                                this.config.api_keys[platform].api_key = fileConfig.api_keys[platform].api_key;
                            }
                            if (fileConfig.api_keys[platform].selected_model) {
                                this.config.api_keys[platform].selected_model = fileConfig.api_keys[platform].selected_model;
                            }
                        }
                    });
                }
                if (fileConfig.active_target) {
                    this.config.active_target = fileConfig.active_target;
                } else if (fileConfig.active_platform) {
                    this.config.active_target = fileConfig.active_platform;
                } else if (fileConfig.active_custom) {
                    this.config.active_target = fileConfig.active_custom;
                }
                if (fileConfig.custom_configs) {
                    this.config.custom_configs = { ...this.config.custom_configs, ...fileConfig.custom_configs };
                }
                if (fileConfig.advanced_params_enabled !== undefined) {
                    this.config.advanced_params_enabled = fileConfig.advanced_params_enabled;
                }
                if (fileConfig.show_status_bar !== undefined) {
                    this.config.show_status_bar = fileConfig.show_status_bar;
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
            const response = await api.fetchApi(`/zhihui_nodes/communication_config`, {
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
            api_keys: {
                SiliconFlow: {
                    api_key: "",
                    website: "https://siliconflow.cn",
                    docs: "https://docs.siliconflow.cn/cn/userguide/quickstart#4-1-%E5%88%9B%E5%BB%BAapi-key",
                    active: false
                },
                ModelScope: {
                    api_key: "",
                    website: "https://modelscope.cn",
                    docs: "https://modelscope.cn/docs/model-service/API-Inference/intro",
                    active: false
                },
                "Aliyun": {
                    api_key: "",
                    website: "https://www.aliyun.com/",
                    docs: "https://bailian.console.aliyun.com/?spm=5176.29619931.J_SEsSjsNv72yRuRFS2VknO.2.74cd405fVDTiYg&tab=api#/api",
                    api_base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
                    active: false
                }
            },
            custom_configs: {
                custom_1: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    api_key: "",
                    active: false
                },
                custom_2: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    api_key: "",
                    active: false
                },
                custom_3: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    api_key: "",
                    active: false
                }
            },
            active_target: "SiliconFlow",
            advanced_params_enabled: false,
            show_status_bar: false
        };
    }

    async showConfigDialog(buttonElement = null) {
        if (this.isDialogOpen) {
            return;
        }
        
        this.isDialogOpen = true;
        
        const config = await this.loadConfig();
        
        const animStyle = document.createElement("style");
        animStyle.id = "qwen3vl-dialog-anim";
        animStyle.textContent = `
            @keyframes qwen3vlDialogIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes qwen3vlDialogOut {
                from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
            }
            @keyframes qwen3vlOverlayIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes qwen3vlOverlayOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(animStyle);
        
        const overlay = document.createElement("div");
        overlay.className = "comfy-modal-overlay";
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
            z-index: 9999;
            display: block;
            opacity: 0;
            animation: qwen3vlOverlayIn 0.2s ease forwards;
        `;

        const dialog = document.createElement("div");
        dialog.className = "comfy-modal";
        dialog.style.cssText = `
            position: fixed;
            width: 800px;
            background: var(--comfy-menu-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            max-height: 90vh;
            color: var(--input-text);
            display: flex;
            flex-direction: column;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            animation: qwen3vlDialogIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        `;

        dialog.innerHTML = `
            <h2 id="dialog-title" style="
                margin-top: 0; 
                color: var(--input-text);
                user-select: none;
                padding: 8px 15px;
                margin: -20px -20px 15px -20px;
                background: var(--comfy-input-bg);
                border-bottom: 1px solid var(--border-color);
                border-radius: 8px 8px 0 0;
                text-align: center;
                font-size: 16px;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            ">${$t('settingsTitle')}
                <button id="exit-dialog" style="
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    border: none;
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                    width: 22px;
                    height: 22px;
                    line-height: 22px;
                    transition: all 0.2s ease;
                    border-radius: 6px;
                " onmouseover="this.style.background='linear-gradient(135deg, #f87171, #ef4444)'; this.style.boxShadow='0 2px 8px rgba(239,68,68,0.4)';" 
                  onmouseout="this.style.background='linear-gradient(135deg, #ef4444, #dc2626)'; this.style.boxShadow='none';" title="${$t('cancel')}">&times;</button>
            </h2>
            <div style="display:flex;gap:4px;margin-bottom:15px;padding:4px;background:var(--comfy-input-bg);border-radius:8px;border:1px solid var(--border-color);">
                <button class="qwen3vl-nav-tab" data-page="settings" style="flex:1;padding:8px 16px;background:linear-gradient(135deg,#667eea,#5b67c8);border:none;border-radius:6px;color:white;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;gap:6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    ${$t('navSettings')}
                </button>
                <button class="qwen3vl-nav-tab" data-page="templates" style="flex:1;padding:8px 16px;background:transparent;border:none;border-radius:6px;color:var(--descrip-text);font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;gap:6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    ${$t('navTemplates')}
                </button>
            </div>
            <div id="page-settings" class="qwen3vl-page-content" style="display:block;overflow-y:auto;overflow-x:hidden;">
                <div id="api-config-content">
                    <div style="margin-bottom: 15px;">
                        <p style="color: var(--descrip-text); font-size: 13px; margin: 0;">
                            ${$t('configApiKeys')}
                        </p>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="flex: 1;">
                            <h3 style="
                                margin: 0 0 10px 0; 
                                color: var(--input-text); 
                                font-size: 14px; 
                                font-weight: bold;
                                border-bottom: 1px solid var(--border-color);
                                padding-bottom: 5px;
                            ">${$t('advancedParams')}</h3>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px; background: var(--comfy-input-bg); border: 1px solid var(--border-color); border-radius: 6px;">
                                <input type="checkbox" id="advanced-params-checkbox" style="margin: 0; accent-color: #22c55e; width: 18px; height: 18px;">
                                <span style="color: var(--input-text); font-size: 14px; font-weight: bold;">${$t('enableAdvancedParams')}</span>
                                <span style="color: var(--descrip-text); font-size: 12px; margin-left: auto;">${$t('advancedParamsDesc')}</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px; margin-top: 8px; background: var(--comfy-input-bg); border: 1px solid var(--border-color); border-radius: 6px;">
                                <input type="checkbox" id="show-status-bar-checkbox" style="margin: 0; accent-color: #22c55e; width: 18px; height: 18px;">
                                <span style="color: var(--input-text); font-size: 14px; font-weight: bold;">${$t('showStatusBar')}</span>
                                <span style="color: var(--descrip-text); font-size: 12px; margin-left: auto;">${$t('showStatusBarDesc')}</span>
                            </label>
                        </div>
                        
                        <div style="flex: 1;">
                            <h3 style="
                                margin: 0 0 10px 0; 
                                color: var(--input-text); 
                                font-size: 14px; 
                                font-weight: bold;
                                border-bottom: 1px solid var(--border-color);
                                padding-bottom: 5px;
                            ">${$t('platformConfigs')}</h3>
                            <div id="platform-configs"></div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px; display: flex; gap: 15px; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <button id="restore-default" style="
                                background: #d97706;
                                border: 1px solid #d97706;
                                color: white;
                                padding: 8px 16px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 13px;
                                font-weight: bold;
                                transition: all 0.2s ease;
                                box-shadow: 0 2px 4px rgba(217, 119, 6, 0.2);
                            " onmouseover="this.style.background='#b45309'; this.style.borderColor='#b45309'; this.style.boxShadow='0 2px 12px rgba(217, 119, 6, 0.6)'; this.style.transform='translateY(-1px)';" 
                              onmouseout="this.style.background='#d97706'; this.style.borderColor='#d97706'; this.style.boxShadow='0 2px 4px rgba(217, 119, 6, 0.2)'; this.style.transform='translateY(0)';">${$t('restoreDefault')}</button>
                        </div>
                        
                        <div style="display: flex; gap: 8px; padding: 4px 8px; background: var(--comfy-panel-bg, #2a2a2a); border-radius: 6px; border: 1px solid var(--border-color, #404040); margin-left: auto;">
                            <button id="export-config" style="
                                background: #3b82f6;
                                border: 1px solid #3b82f6;
                                color: white;
                                padding: 6px 14px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 13px;
                                transition: all 0.2s ease;
                                font-weight: 500;
                            " onmouseover="this.style.background='#2563eb'; this.style.borderColor='#2563eb'; this.style.boxShadow='0 4px 16px rgba(59, 130, 246, 0.6)'; this.style.transform='translateY(-2px)';" 
                              onmouseout="this.style.background='#3b82f6'; this.style.borderColor='#3b82f6'; this.style.boxShadow='none'; this.style.transform='translateY(0)';">${$t('exportConfig')}</button>
                            <button id="import-config" style="
                                background: #3b82f6;
                                border: 1px solid #3b82f6;
                                color: white;
                                padding: 6px 14px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 13px;
                                transition: all 0.2s ease;
                                font-weight: 500;
                            " onmouseover="this.style.background='#2563eb'; this.style.borderColor='#2563eb'; this.style.boxShadow='0 4px 16px rgba(59, 130, 246, 0.6)'; this.style.transform='translateY(-2px)';" 
                              onmouseout="this.style.background='#3b82f6'; this.style.borderColor='#3b82f6'; this.style.boxShadow='none'; this.style.transform='translateY(0)';">${$t('importConfig')}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="page-templates" class="qwen3vl-page-content" style="display:none;overflow-y:auto;overflow-x:hidden;">
                <div style="margin-bottom:15px;">
                    <h3 style="margin:0 0 10px 0;color:var(--input-text);font-size:14px;font-weight:bold;border-bottom:1px solid var(--border-color);padding-bottom:5px;display:flex;align-items:center;gap:6px;">
                        <span>📋</span>
                        <span>${$t('templateManagement')}</span>
                    </h3>
                    <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;">
                        <input type="text" id="qwen3vl-template-search" placeholder="${$t('searchTemplates')}" style="flex:1;padding:6px 10px;background:var(--comfy-input-bg);border:1px solid var(--border-color);border-radius:6px;color:var(--input-text);font-size:12px;">
                        <select id="qwen3vl-template-sort" style="padding:6px 10px;background:var(--comfy-input-bg);border:1px solid var(--border-color);border-radius:6px;color:var(--input-text);font-size:12px;">
                            <option value="name">${$t('sortByName')}</option>
                            <option value="time">${$t('sortByTime')}</option>
                        </select>
                        <button id="qwen3vl-template-create" style="padding:6px 14px;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.2s ease;white-space:nowrap;">${$t('createTemplate')}</button>
                        <button id="qwen3vl-template-import-lm" style="padding:6px 14px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.2s ease;white-space:nowrap;">${$t('importFromLM')}</button>
                    </div>
                    <div id="qwen3vl-template-list" style="overflow-y:auto;border:1px solid var(--border-color);border-radius:6px;background:var(--comfy-input-bg);">
                        <div style="padding:20px;text-align:center;color:var(--descrip-text);font-size:12px;">${$t('checking')}</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        const navTabs = dialog.querySelectorAll(".qwen3vl-nav-tab");
        const settingsPage = dialog.querySelector("#page-settings");
        const templatesPage = dialog.querySelector("#page-templates");
        
        const syncPageHeight = () => {
            settingsPage.style.display = "block";
            templatesPage.style.display = "block";
            const h1 = settingsPage.scrollHeight;
            const h2 = templatesPage.scrollHeight;
            const maxH = Math.max(h1, h2);
            settingsPage.style.minHeight = maxH + "px";
            templatesPage.style.minHeight = maxH + "px";
            templatesPage.style.display = "none";
        };
        
        const switchPage = (pageName) => {
            navTabs.forEach(tab => {
                if (tab.dataset.page === pageName) {
                    tab.style.background = "linear-gradient(135deg,#667eea,#5b67c8)";
                    tab.style.color = "white";
                    tab.classList.add("active");
                } else {
                    tab.style.background = "transparent";
                    tab.style.color = "var(--descrip-text)";
                    tab.classList.remove("active");
                }
            });
            if (pageName === "settings") {
                settingsPage.style.display = "block";
                templatesPage.style.display = "none";
            } else {
                settingsPage.style.display = "none";
                templatesPage.style.display = "block";
            }
        };
        navTabs.forEach(tab => { tab.onclick = () => switchPage(tab.dataset.page); });
        
        let qwen3vlTemplates = [];
        const templateSearchInput = dialog.querySelector("#qwen3vl-template-search");
        const templateSortSelect = dialog.querySelector("#qwen3vl-template-sort");
        const templateListEl = dialog.querySelector("#qwen3vl-template-list");
        const templateCreateBtn = dialog.querySelector("#qwen3vl-template-create");
        let qwen3vlTemplateCategory = CATEGORY_ALL;

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
                qwen3vlTemplateCategory = key;
                renderTemplateList();
            },
            onRenamed: async () => {
                showQwen3VLToast($t('categoryRenamed'), "success");
                await loadTemplates();
            },
            onRequestRemove: async (name) => {
                if (!confirm($t('confirmDeleteCategory').replace("{name}", name))) return;
                const result = await requestCategoryRemove(name);
                if (result.ok) {
                    showQwen3VLToast($t('categoryDeleted'), "success");
                    await loadTemplates();
                } else {
                    showQwen3VLToast($t('categoryDeleteFailed'), "error");
                }
            },
            onError: () => {
                showQwen3VLToast($t('categoryRenameFailed'), "error");
            },
        });
        applyCategoryTheme(templatesPage, COMFY_CATEGORY_THEME);
        categoryFilter.element.style.marginBottom = "10px";
        templateListEl.parentNode.insertBefore(categoryFilter.element, templateListEl);
        
        const loadTemplates = async () => {
            try {
                const response = await fetch("/zhihui_nodes/qwen3vl/templates");
                if (response.ok) {
                    const data = await response.json();
                    qwen3vlTemplates = data.templates || [];
                    categoryFilter.sync(qwen3vlTemplates);
                    renderTemplateList();
                }
            } catch (e) {
                qwen3vlTemplates = [];
                categoryFilter.sync(qwen3vlTemplates);
                renderTemplateList();
            }
            setTimeout(() => { syncPageHeight(); }, 50);
        };
        
        const formatTime = (timestamp) => {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        
        const renderTemplateList = () => {
            let filtered = qwen3vlTemplates.filter(t => matchesCategory(t, qwen3vlTemplateCategory));
            const searchTerm = templateSearchInput.value.toLowerCase().trim();
            if (searchTerm) {
                filtered = filtered.filter(t => t.name.toLowerCase().includes(searchTerm) || t.content.toLowerCase().includes(searchTerm));
            }
            const sortBy = templateSortSelect.value;
            if (sortBy === "name") {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            } else {
                filtered.sort((a, b) => b.updated_at - a.updated_at);
            }
            if (filtered.length === 0) {
                templateListEl.innerHTML = `<div style="padding:20px;text-align:center;color:var(--descrip-text);font-size:12px;">${$t('noTemplates')}</div>`;
                return;
            }
            templateListEl.innerHTML = filtered.map(template => `
                <div data-id="${template.id}" style="display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid var(--border-color);transition:background 0.15s ease;">
                    <span style="flex:1;font-size:13px;font-weight:500;color:var(--input-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(template.name)}">${escapeHtml(template.name)}</span>
                    ${categoryBadgeHtml(template.category, qwen3vlTemplateCategory)}
                    <span style="font-size:11px;color:var(--descrip-text);margin:0 12px;white-space:nowrap;">${formatTime(template.updated_at)}</span>
                    <div style="display:flex;gap:6px;">
                        <button class="qwen3vl-template-edit-btn" data-id="${template.id}" style="padding:4px 10px;background:transparent;border:1px solid var(--border-color);border-radius:4px;color:var(--input-text);cursor:pointer;font-size:11px;transition:all 0.2s ease;">${$t('edit')}</button>
                        <button class="qwen3vl-template-delete-btn" data-id="${template.id}" style="padding:4px 10px;background:transparent;border:1px solid #ef4444;border-radius:4px;color:#ef4444;cursor:pointer;font-size:11px;transition:all 0.2s ease;">${$t('delete')}</button>
                    </div>
                </div>
            `).join("");
            templateListEl.querySelectorAll("[data-id]").forEach(item => {
                item.onmouseover = () => { item.style.background = "rgba(102,126,234,0.1)"; };
                item.onmouseout = () => { item.style.background = "transparent"; };
            });
            templateListEl.querySelectorAll(".qwen3vl-template-edit-btn").forEach(btn => {
                btn.onmouseover = () => { btn.style.background = "rgba(102,126,234,0.2)"; };
                btn.onmouseout = () => { btn.style.background = "transparent"; };
                btn.onclick = () => showTemplateEditor(btn.dataset.id);
            });
            templateListEl.querySelectorAll(".qwen3vl-template-delete-btn").forEach(btn => {
                btn.onmouseover = () => { btn.style.background = "rgba(239,68,68,0.2)"; };
                btn.onmouseout = () => { btn.style.background = "transparent"; };
                btn.onclick = () => deleteTemplate(btn.dataset.id);
            });
        };
        
        const showTemplateEditor = (templateId = null, prefill = null) => {
            const found = templateId ? qwen3vlTemplates.find(t => t.id === templateId) : null;
            // prefill：从 LM 预设带入的预填内容（无 id），保存时走「新建」
            const template = found || prefill || null;
            const isEdit = !!found;
            
            const editorOverlay = document.createElement("div");
            editorOverlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10005;display:flex;align-items:center;justify-content:center;";
            
            const editorDialog = document.createElement("div");
            editorDialog.style.cssText = "width:600px;max-width:90vw;height:85vh;max-height:800px;background:var(--comfy-menu-bg);border:1px solid var(--border-color);border-radius:12px;padding:24px;color:var(--input-text);box-shadow:0 20px 60px rgba(0,0,0,0.5);display:flex;flex-direction:column;";
            
            editorDialog.innerHTML = `
                <h3 style="margin:0 0 20px 0;font-size:18px;font-weight:600;">${isEdit ? $t('editTemplate') : $t('createTemplate')}</h3>
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:8px;font-size:13px;color:var(--descrip-text);">${$t('templateName')}</label>
                    <input type="text" id="qwen3vl-template-name-input" value="${template ? escapeHtml(template.name) : ''}" placeholder="${$t('templateNamePlaceholder')}" style="width:100%;padding:10px 12px;background:var(--comfy-input-bg);border:1px solid var(--border-color);border-radius:6px;color:var(--input-text);font-size:14px;box-sizing:border-box;">
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:8px;font-size:13px;color:var(--descrip-text);" for="qwen3vl-template-category-select">${$t('templateCategory')}</label>
                    <div id="qwen3vl-template-category-slot"></div>
                </div>
                <div style="margin-bottom:20px;flex:1;display:flex;flex-direction:column;">
                    <label style="display:block;margin-bottom:8px;font-size:13px;color:var(--descrip-text);">${$t('templateContent')}</label>
                    <textarea id="qwen3vl-template-content-input" placeholder="${$t('templateContentPlaceholder')}" style="width:100%;flex:1;min-height:300px;padding:10px 12px;background:var(--comfy-input-bg);border:1px solid var(--border-color);border-radius:6px;color:var(--input-text);font-size:13px;resize:none;box-sizing:border-box;font-family:inherit;">${template ? template.content : ''}</textarea>
                </div>
                <div style="display:flex;gap:12px;justify-content:flex-end;">
                    <button id="qwen3vl-template-cancel-btn" style="padding:10px 24px;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.2s ease;">${$t('cancel')}</button>
                    <button id="qwen3vl-template-save-btn" style="padding:10px 24px;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.2s ease;">${$t('save')}</button>
                </div>
            `;
            
            const closeEditor = () => { editorOverlay.remove(); };

            const categoryPicker = buildCategoryPicker({
                categories: deriveCategories(qwen3vlTemplates),
                value: template ? template.category : "",
                noneLabel: $t('categoryNone'),
            });
            categoryPicker.select.id = "qwen3vl-template-category-select";
            applyCategoryTheme(editorDialog, {
                ...COMFY_CATEGORY_THEME,
                "tc-field-font": "14px",
                "tc-field-padding": "10px 12px",
            });
            categoryPicker.select.style.lineHeight = "inherit";
            editorDialog.querySelector("#qwen3vl-template-category-slot").appendChild(categoryPicker.element);
            editorDialog.querySelector("#qwen3vl-template-cancel-btn").onclick = closeEditor;
            editorDialog.querySelector("#qwen3vl-template-save-btn").onclick = async () => {
                const name = editorDialog.querySelector("#qwen3vl-template-name-input").value.trim();
                const content = editorDialog.querySelector("#qwen3vl-template-content-input").value.trim();
                if (!name) { showQwen3VLToast($t('templateNameRequired'), "error"); return; }
                try {
                    let response;
                    if (isEdit) {
                        response = await fetch(`/zhihui_nodes/qwen3vl/templates/${templateId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, content, category: categoryPicker.value() }) });
                    } else {
                        response = await fetch("/zhihui_nodes/qwen3vl/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, content, category: categoryPicker.value() }) });
                    }
                    const result = await response.json();
                    if (result.status === "success") {
                        showQwen3VLToast(isEdit ? $t('templateUpdated') : $t('templateCreated'), "success");
                        closeEditor();
                        await loadTemplates();
                    } else {
                        showQwen3VLToast(isEdit ? $t('templateUpdateFailed') : $t('templateCreateFailed'), "error");
                    }
                } catch (e) {
                    showQwen3VLToast(isEdit ? $t('templateUpdateFailed') : $t('templateCreateFailed'), "error");
                }
            };
            
            editorOverlay.appendChild(editorDialog);
            document.body.appendChild(editorOverlay);
            editorDialog.querySelector("#qwen3vl-template-name-input").focus();
        };
        
        const deleteTemplate = async (templateId) => {
            if (!confirm($t('confirmDelete'))) return;
            try {
                const response = await fetch(`/zhihui_nodes/qwen3vl/templates/${templateId}`, { method: "DELETE" });
                const result = await response.json();
                if (result.status === "success") {
                    showQwen3VLToast($t('templateDeleted'), "success");
                    await loadTemplates();
                } else {
                    showQwen3VLToast($t('templateDeleteFailed'), "error");
                }
            } catch (e) {
                showQwen3VLToast($t('templateDeleteFailed'), "error");
            }
        };
        
        templateSearchInput.addEventListener("input", renderTemplateList);
        templateSortSelect.addEventListener("change", renderTemplateList);
        templateCreateBtn.onclick = () => showTemplateEditor();

        // 「从LM模板调用」：列出 LM Studio 节点的提示词预设，点选后预填进模板编辑器（保存即入库）
        const templateImportLMBtn = dialog.querySelector("#qwen3vl-template-import-lm");
        templateImportLMBtn.onclick = () => {
            const pickerOverlay = document.createElement("div");
            pickerOverlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10006;display:flex;align-items:center;justify-content:center;";

            const pickerDialog = document.createElement("div");
            pickerDialog.style.cssText = "width:460px;max-width:90vw;max-height:70vh;background:var(--comfy-menu-bg);border:1px solid var(--border-color);border-radius:10px;padding:16px;color:var(--input-text);display:flex;flex-direction:column;gap:10px;box-shadow:0 20px 60px rgba(0,0,0,0.5);";

            const pickerTitle = document.createElement("h4");
            pickerTitle.style.cssText = "margin:0;font-size:15px;font-weight:600;";
            pickerTitle.textContent = $t('importFromLM');

            const pickerList = document.createElement("div");
            pickerList.style.cssText = "flex:1;overflow-y:auto;border:1px solid var(--border-color);border-radius:6px;background:var(--comfy-input-bg);min-height:120px;";
            pickerList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--descrip-text);font-size:12px;">${$t('checking')}</div>`;

            pickerOverlay.onclick = (e) => { if (e.target === pickerOverlay) pickerOverlay.remove(); };

            pickerDialog.appendChild(pickerTitle);
            pickerDialog.appendChild(pickerList);
            pickerOverlay.appendChild(pickerDialog);
            document.body.appendChild(pickerOverlay);

            fetch("/zhihui_nodes/lm_prompt_presets").then(r => r.json()).then(data => {
                const presets = data.presets || [];
                if (!presets.length) {
                    pickerList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--descrip-text);font-size:12px;">${$t('noTemplates')}</div>`;
                    return;
                }
                pickerList.innerHTML = presets.map((p, i) => `
                    <div data-idx="${i}" style="padding:10px 12px;border-bottom:1px solid var(--border-color);cursor:pointer;transition:background 0.15s ease;">
                        <div style="font-size:13px;font-weight:500;color:var(--input-text);">${p.name}</div>
                        <div style="font-size:11px;color:var(--descrip-text);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${String(p.content).substring(0, 80)}${String(p.content).length > 80 ? '...' : ''}</div>
                    </div>
                `).join("");
                pickerList.querySelectorAll("[data-idx]").forEach(item => {
                    item.onmouseover = () => { item.style.background = "rgba(102,126,234,0.15)"; };
                    item.onmouseout = () => { item.style.background = "transparent"; };
                    item.onclick = () => {
                        const preset = presets[Number(item.dataset.idx)];
                        pickerOverlay.remove();
                        // 不带 id：走「新建」流程，把 LM 预设保存为一条共用模板
                        showTemplateEditor(null, { name: preset.name, content: preset.content });
                    };
                });
            }).catch(() => {
                pickerList.innerHTML = `<div style="padding:20px;text-align:center;color:#ef4444;font-size:12px;">${$t('templateCreateFailed')}</div>`;
            });
        };

        loadTemplates();
        
        this.renderPlatformConfigs(config);
        this.attachActiveTargetHandlers(dialog);
        
        setTimeout(() => { syncPageHeight(); }, 50);

        const advancedParamsCheckbox = dialog.querySelector("#advanced-params-checkbox");
        if (advancedParamsCheckbox) {
            advancedParamsCheckbox.checked = config.advanced_params_enabled || false;
            advancedParamsCheckbox.onchange = async () => {
                const previousValue = config.advanced_params_enabled || false;
                const currentValue = advancedParamsCheckbox.checked;
                config.advanced_params_enabled = currentValue;
                this.updateAdvancedParamsVisibility(currentValue);
                const ok = await this.saveConfig(config);
                if (ok) {
                    this.config = { ...config };
                } else {
                    config.advanced_params_enabled = previousValue;
                    advancedParamsCheckbox.checked = previousValue;
                    this.updateAdvancedParamsVisibility(previousValue);
                    alert($t('saveFailedAdvanced'));
                }
            };
            this.updateAdvancedParamsVisibility(advancedParamsCheckbox.checked);
        }

        const showStatusBarCheckbox = dialog.querySelector("#show-status-bar-checkbox");
        if (showStatusBarCheckbox) {
            showStatusBarCheckbox.checked = config.show_status_bar || false;
            showStatusBarCheckbox.onchange = async () => {
                const previousValue = config.show_status_bar || false;
                const currentValue = showStatusBarCheckbox.checked;
                config.show_status_bar = currentValue;
                this.updateStatusBarVisibility(currentValue);
                const ok = await this.saveConfig(config);
                if (ok) {
                    this.config = { ...config };
                } else {
                    config.show_status_bar = previousValue;
                    showStatusBarCheckbox.checked = previousValue;
                    this.updateStatusBarVisibility(previousValue);
                    alert($t('saveFailedAdvanced'));
                }
            };
            this.updateStatusBarVisibility(showStatusBarCheckbox.checked);
        }

        const closeDialog = () => {
            overlay.style.animation = "qwen3vlOverlayOut 0.15s ease forwards";
            dialog.style.animation = "qwen3vlDialogOut 0.15s ease forwards";
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
                if (dialog && dialog.parentNode) {
                    document.body.removeChild(dialog);
                }
                const animStyleEl = document.getElementById("qwen3vl-dialog-anim");
                if (animStyleEl) animStyleEl.remove();
                this.isDialogOpen = false;
            }, 150);
        };

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

    renderPlatformConfigs(config) {
        const container = document.querySelector("#platform-configs");
        container.innerHTML = "";

        const gridContainer = document.createElement("div");
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            width: 100%;
        `;

        const activeTarget = config.active_target || "SiliconFlow";

        Object.entries(config.api_keys || {}).forEach(([platform, platformConfig]) => {
            const isActive = activeTarget === platform;
            
            const platformDiv = document.createElement("div");
            const condensedPlatforms = ["SiliconFlow", "ModelScope", "Aliyun"];
            const isCondensed = condensedPlatforms.includes(platform);
            platformDiv.style.cssText = `
                padding: 10px;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: var(--comfy-input-bg);
                ${isCondensed ? '' : 'height: 320px;\nmin-height: 320px;'}
                display: flex;
                flex-direction: column;
            `;

            const supportedModels = this.platformModels[platform] || [];
            const configuredModel = platformConfig.selected_model || "";
            const selectedModel = supportedModels.includes(configuredModel) ? configuredModel : (supportedModels.length > 0 ? supportedModels[0] : "");          
            const modelOptions = supportedModels.map(model => 
                `<option value="${model}" ${model === selectedModel ? 'selected' : ''}>${model}</option>`
            ).join('');

            platformDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <h3 style="margin: 0; color: var(--input-text); font-size: 14px;">${platform}</h3>
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                        <input type="radio" 
                               name="active_target" 
                               value="${platform}"
                               ${isActive ? 'checked' : ''}
                               style="margin: 0; accent-color: #22c55e;">
                        <span style="font-size: 12px; color: ${isActive ? '#22c55e' : 'var(--input-text)'}; font-weight: ${isActive ? 'bold' : 'normal'};">${$t('activate')}</span>
                    </label>
                </div>
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">${$t('modelSelection')}</label>
                    <select data-platform-model="${platform}" 
                            style="
                                width: 100%;
                                padding: 6px;
                                border: 1px solid var(--border-color);
                                border-radius: 4px;
                                background: var(--comfy-input-bg);
                                color: var(--input-text);
                                font-size: 12px;
                            ">
                        ${modelOptions}
                    </select>
                </div>
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">${$t('apiKeyLabel')}</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input type="password" 
                               data-platform="${platform}" 
                               value="${platformConfig.api_key || ""}"
                               placeholder="${$t('apiKeyPlaceholder').replace('{platform}', platform)}"
                               style="
                                   width: 100%;
                                   padding: 6px 35px 6px 6px;
                                   border: 1px solid var(--border-color);
                                   border-radius: 4px;
                                   background: var(--comfy-input-bg);
                                   color: var(--input-text);
                                   box-sizing: border-box;
                                   font-size: 12px;
                               ">
                        <button type="button" 
                                class="password-toggle-btn" 
                                data-platform="${platform}"
                                style="
                                    position: absolute;
                                    right: 8px;
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 2px;
                                    color: var(--input-text);
                                    font-size: 14px;
                                    opacity: 0.7;
                                    transition: opacity 0.2s;
                                "
                                onmouseover="this.style.opacity='1'"
                                onmouseout="this.style.opacity='0.7'"
                                title="${$t('showHidePassword')}">
                            🙈
                        </button>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; font-size: 11px; justify-content: center; margin-top: auto;">
                    <a href="${platformConfig.website || "#"}" target="_blank" 
                       style="color: var(--comfy-link-text); text-decoration: none;">
                       ${$t('website')}
                    </a>
                    <a href="${platformConfig.docs || "#"}" target="_blank" 
                       style="color: var(--comfy-link-text); text-decoration: none;">
                       ${$t('documentation')}
                    </a>
                </div>
                <div class="per-card-save" style="visibility: hidden; margin-top: auto; text-align: right; display: flex; gap: 8px; justify-content: flex-end; min-height: 32px; height: 32px; align-items: center;">
                    <button type="button" class="save-card-btn" data-card="${platform}" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#4488ff'; this.style.borderColor='#4488ff'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">${$t('savePlatformConfig')}</button>
                    <button type="button" class="cancel-card-btn" data-card="${platform}" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#ff4444'; this.style.borderColor='#ff4444'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">${$t('cancelPlatformConfig')}</button>
                </div>
            `;

            platformDiv.dataset.cardType = "platform";
            platformDiv.dataset.cardKey = platform;
            platformDiv.dataset.initialModel = selectedModel;
            platformDiv.dataset.initialApiKey = platformConfig.api_key || "";

            gridContainer.appendChild(platformDiv);
        });

        const customConfigs = config.custom_configs || {};
        ['custom_1', 'custom_2', 'custom_3'].forEach(customKey => {
            const customConfig = customConfigs[customKey] || {};
            const isActive = activeTarget === customKey;

            const customDiv = document.createElement("div");
            customDiv.style.cssText = `
                padding: 10px;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: var(--comfy-input-bg);
                height: 320px;
                min-height: 320px;
                display: flex;
                flex-direction: column;
            `;

            customDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <h3 style="margin: 0; color: var(--input-text); font-size: 14px;">${customConfig.name || $t('customConfig').replace('{num}', customKey.slice(-1))}</h3>
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                        <input type="radio" 
                               name="active_target" 
                               value="${customKey}"
                               ${isActive ? 'checked' : ''}
                               style="margin: 0; accent-color: #22c55e;">
                        <span style="font-size: 12px; color: ${isActive ? '#22c55e' : 'var(--input-text)'}; font-weight: ${isActive ? 'bold' : 'normal'};">${$t('activate')}</span>
                    </label>
                </div>
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">${$t('configName')}</label>
                    <input type="text" 
                           data-custom="${customKey}_name" 
                           value="${customConfig.name || $t('customConfig').replace('{num}', customKey.slice(-1))}"
                           placeholder="${$t('configNamePlaceholder')}"
                           style="
                               width: 100%;
                               padding: 6px;
                               border: 1px solid var(--border-color);
                               border-radius: 4px;
                               background: var(--comfy-input-bg);
                               color: var(--input-text);
                               box-sizing: border-box;
                               font-size: 12px;
                           ">
                </div>
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">${$t('apiAddress')}</label>
                    <input type="text" 
                           data-custom="${customKey}_api_base" 
                           value="${customConfig.api_base || ""}"
                           placeholder="${$t('apiAddressPlaceholder')}"
                           style="
                               width: 100%;
                               padding: 6px;
                               border: 1px solid var(--border-color);
                               border-radius: 4px;
                               background: var(--comfy-input-bg);
                               color: var(--input-text);
                               box-sizing: border-box;
                               font-size: 12px;
                           ">
                </div>
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">${$t('modelName')}</label>
                    <input type="text" 
                           data-custom="${customKey}_model_name" 
                           value="${customConfig.model_name || ""}"
                           placeholder="${$t('modelNamePlaceholder')}"
                           style="
                               width: 100%;
                               padding: 6px;
                               border: 1px solid var(--border-color);
                               border-radius: 4px;
                               background: var(--comfy-input-bg);
                               color: var(--input-text);
                               box-sizing: border-box;
                               font-size: 12px;
                           ">
                </div>
                
                <div style="margin-bottom: 8px; position: relative;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">${$t('apiKeyLabel')}</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input type="password" 
                               data-custom="${customKey}_api_key" 
                               value="${customConfig.api_key || ""}"
                               placeholder="${$t('apiKeyPlaceholderCustom')}"
                               style="
                                   width: 100%;
                                   padding: 6px 35px 6px 6px;
                                   border: 1px solid var(--border-color);
                                   border-radius: 4px;
                                   background: var(--comfy-input-bg);
                                   color: var(--input-text);
                                   box-sizing: border-box;
                                   font-size: 12px;
                               ">
                        <button type="button" 
                                class="password-toggle-btn" 
                                data-custom="${customKey}"
                                style="
                                    position: absolute;
                                    right: 8px;
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 2px;
                                    color: var(--input-text);
                                    font-size: 14px;
                                    opacity: 0.7;
                                    transition: opacity 0.2s;
                                "
                                onmouseover="this.style.opacity='1'"
                                onmouseout="this.style.opacity='0.7'"
                                title="${$t('showHidePassword')}">
                            🙈
                        </button>
                    </div>
                </div>
                <div class="per-card-save" style="visibility: hidden; margin-top: auto; text-align: right; display: flex; gap: 8px; justify-content: flex-end; min-height: 32px; height: 32px; align-items: center;">
                    <button type="button" class="save-card-btn" data-card="${customKey}" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#4488ff'; this.style.borderColor='#4488ff'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">${$t('savePlatformConfig')}</button>
                    <button type="button" class="cancel-card-btn" data-card="${customKey}" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#ff4444'; this.style.borderColor='#ff4444'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">${$t('cancelPlatformConfig')}</button>
                </div>
            `;

            customDiv.dataset.cardType = "custom";
            customDiv.dataset.cardKey = customKey;
            customDiv.dataset.initialName = customConfig.name || $t('customConfig').replace('{num}', customKey.slice(-1));
            customDiv.dataset.initialApiBase = customConfig.api_base || "";
            customDiv.dataset.initialModelName = customConfig.model_name || "";
            customDiv.dataset.initialApiKey = customConfig.api_key || "";

            gridContainer.appendChild(customDiv);
        });

        container.appendChild(gridContainer);
        container.querySelectorAll('.password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                const customKey = btn.dataset.custom;
                let input = null;
                if (platform) {
                    input = container.querySelector(`input[data-platform="${platform}"]`);
                } else if (customKey) {
                    input = container.querySelector(`input[data-custom="${customKey}_api_key"]`);
                }
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '👁️';
                } else {
                    input.type = 'password';
                    btn.textContent = '🙈';
                }
            });
        });

        container.querySelectorAll('input[name="active_target"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="active_target"]').forEach(r => {
                    const span = r.nextElementSibling;
                    if (span) {
                        span.style.color = 'var(--input-text)';
                        span.style.fontWeight = 'normal';
                    }
                });
                
                if (radio.checked) {
                    const span = radio.nextElementSibling;
                    if (span) {
                        span.style.color = '#22c55e';
                        span.style.fontWeight = 'bold';
                    }
                }
            });
        });

        container.querySelectorAll('[data-card-type="platform"]').forEach(card => {
            const key = card.dataset.cardKey;
            const selectEl = card.querySelector(`select[data-platform-model="${key}"]`);
            const keyInput = card.querySelector(`input[data-platform="${key}"]`);
            const saveContainer = card.querySelector('.per-card-save');
            const btn = card.querySelector('.save-card-btn');
            const cancelBtn = card.querySelector('.cancel-card-btn');

            const toggleVisibility = () => {
                const isDirty = (
                    (selectEl && selectEl.value !== card.dataset.initialModel) ||
                    (keyInput && keyInput.value !== card.dataset.initialApiKey)
                );
                saveContainer.style.visibility = isDirty ? 'visible' : 'hidden';
            };

            if (selectEl) selectEl.addEventListener('change', toggleVisibility);
            if (keyInput) keyInput.addEventListener('input', toggleVisibility);

            if (btn) btn.addEventListener('click', async () => {
                btn.disabled = true;
                const originalText = btn.textContent;
                btn.textContent = '保存中...';
                const ok = await this.saveSingleCardConfig(card);
                btn.disabled = false;
                btn.textContent = originalText;
                if (ok) {
                    saveContainer.style.visibility = 'hidden';
                    if (selectEl) card.dataset.initialModel = selectEl.value;
                    if (keyInput) card.dataset.initialApiKey = keyInput.value;
                } else {
                    alert($t('saveFailed'));
                }
            });

            if (cancelBtn) cancelBtn.addEventListener('click', () => {
                if (selectEl && card.dataset.initialModel !== undefined) {
                    selectEl.value = card.dataset.initialModel;
                }
                if (keyInput && card.dataset.initialApiKey !== undefined) {
                    keyInput.value = card.dataset.initialApiKey;
                }
                saveContainer.style.visibility = 'hidden';
            });
        });

        container.querySelectorAll('[data-card-type="custom"]').forEach(card => {
            const key = card.dataset.cardKey;
            const nameInput = card.querySelector(`input[data-custom="${key}_name"]`);
            const apiBase = card.querySelector(`input[data-custom="${key}_api_base"]`);
            const modelName = card.querySelector(`input[data-custom="${key}_model_name"]`);
            const apiKey = card.querySelector(`input[data-custom="${key}_api_key"]`);
            const saveContainer = card.querySelector('.per-card-save');
            const btn = card.querySelector('.save-card-btn');
            const cancelBtn = card.querySelector('.cancel-card-btn');

            const toggleVisibility = () => {
                const isDirty = (
                    (nameInput && nameInput.value !== card.dataset.initialName) ||
                    (apiBase && apiBase.value !== card.dataset.initialApiBase) ||
                    (modelName && modelName.value !== card.dataset.initialModelName) ||
                    (apiKey && apiKey.value !== card.dataset.initialApiKey)
                );
                saveContainer.style.visibility = isDirty ? 'visible' : 'hidden';
            };

            [nameInput, apiBase, modelName, apiKey].forEach(el => el && el.addEventListener('input', toggleVisibility));

            if (btn) btn.addEventListener('click', async () => {
                btn.disabled = true;
                const originalText = btn.textContent;
                btn.textContent = '保存中...';
                const ok = await this.saveSingleCardConfig(card);
                btn.disabled = false;
                btn.textContent = originalText;
                if (ok) {
                    saveContainer.style.visibility = 'hidden';
                    if (nameInput) card.dataset.initialName = nameInput.value;
                    if (apiBase) card.dataset.initialApiBase = apiBase.value;
                    if (modelName) card.dataset.initialModelName = modelName.value;
                    if (apiKey) card.dataset.initialApiKey = apiKey.value;
                } else {
                    alert($t('saveFailed'));
                }
            });

            if (cancelBtn) cancelBtn.addEventListener('click', () => {
                if (nameInput && card.dataset.initialName !== undefined) {
                    nameInput.value = card.dataset.initialName;
                }
                if (apiBase && card.dataset.initialApiBase !== undefined) {
                    apiBase.value = card.dataset.initialApiBase;
                }
                if (modelName && card.dataset.initialModelName !== undefined) {
                    modelName.value = card.dataset.initialModelName;
                }
                if (apiKey && card.dataset.initialApiKey !== undefined) {
                    apiKey.value = card.dataset.initialApiKey;
                }
                saveContainer.style.visibility = 'hidden';
            });
        });

        gridContainer.addEventListener('focusin', (e) => {
            const interactiveEl = e.target.closest('input, select, button');
            if (!interactiveEl) return;
            const card = interactiveEl.closest('[data-card-type]');
            if (!card) return;
            gridContainer.querySelectorAll('[data-card-type]').forEach(c => {
                c.style.borderColor = 'var(--border-color)';
                c.style.boxShadow = 'none';
            });
            card.style.borderColor = '#4488ff';
            card.style.boxShadow = '0 0 0 2px rgba(68,136,255,0.2)';
        });
        gridContainer.addEventListener('mousedown', (e) => {
            const interactiveEl = e.target.closest('input, select, button');
            if (!interactiveEl) return;
            const card = interactiveEl.closest('[data-card-type]');
            if (!card) return;
            gridContainer.querySelectorAll('[data-card-type]').forEach(c => {
                c.style.borderColor = 'var(--border-color)';
                c.style.boxShadow = 'none';
            });
            card.style.borderColor = '#4488ff';
            card.style.boxShadow = '0 0 0 2px rgba(68,136,255,0.2)';
        });
    }

    renderCustomConfigs(config) {
        const container = document.querySelector("#custom-configs");
        container.innerHTML = "";

        const customConfigs = config.custom_configs || {};
        const activeTarget = config.active_target || "custom_1";

        const gridContainer = document.createElement("div");
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            width: 100%;
        `;

        ['custom_1', 'custom_2', 'custom_3'].forEach(customKey => {
            const customConfig = customConfigs[customKey] || {};
            const isActive = activeTarget === customKey;

            const customDiv = document.createElement("div");
            customDiv.style.cssText = `
                padding: 10px;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: var(--comfy-input-bg);
                min-height: 200px;
                display: flex;
                flex-direction: column;
            `;

            customDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <h3 style="margin: 0; color: var(--input-text); font-size: 14px;">${customConfig.name || `自定义配置${customKey.slice(-1)}`}</h3>
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                        <input type="radio" 
                               name="active_target" 
                               value="${customKey}"
                               ${isActive ? 'checked' : ''}
                               style="margin: 0; accent-color: #22c55e;">
                        <span style="font-size: 12px; color: ${isActive ? '#22c55e' : 'var(--input-text)'}; font-weight: ${isActive ? 'bold' : 'normal'};">激活</span>
                    </label>
                </div>
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">配置名称:</label>
                    <input type="text" 
                           data-custom="${customKey}_name" 
                           value="${customConfig.name || `自定义配置${customKey.slice(-1)}`}"
                           placeholder="配置名称"
                           style="
                               width: 100%;
                               padding: 6px;
                               border: 1px solid var(--border-color);
                               border-radius: 4px;
                               background: var(--comfy-input-bg);
                               color: var(--input-text);
                               box-sizing: border-box;
                               font-size: 12px;
                           ">
                </div>
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">API地址:</label>
                    <input type="text" 
                           data-custom="${customKey}_api_base" 
                           value="${customConfig.api_base || ""}"
                           placeholder="https://api.example.com/v1/chat/completions"
                           style="
                               width: 100%;
                               padding: 6px;
                               border: 1px solid var(--border-color);
                               border-radius: 4px;
                               background: var(--comfy-input-bg);
                               color: var(--input-text);
                               box-sizing: border-box;
                               font-size: 12px;
                           ">
                </div>
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">模型名称:</label>
                    <input type="text" 
                           data-custom="${customKey}_model_name" 
                           value="${customConfig.model_name || ""}"
                           placeholder="custom-model-name"
                           style="
                               width: 100%;
                               padding: 6px;
                               border: 1px solid var(--border-color);
                               border-radius: 4px;
                               background: var(--comfy-input-bg);
                               color: var(--input-text);
                               box-sizing: border-box;
                               font-size: 12px;
                           ">
                </div>
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">API密钥:</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input type="password" 
                               data-custom="${customKey}_api_key" 
                               value="${customConfig.api_key || ""}"
                               placeholder="your-api-key-here"
                               style="
                                   width: 100%;
                                   padding: 6px 35px 6px 6px;
                                   border: 1px solid var(--border-color);
                                   border-radius: 4px;
                                   background: var(--comfy-input-bg);
                                   color: var(--input-text);
                                   box-sizing: border-box;
                                   font-size: 12px;
                               ">
                        <button type="button" 
                                class="custom-password-toggle-btn"
                                data-custom="${customKey}"
                                style="
                                    position: absolute;
                                    right: 8px;
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 2px;
                                    color: var(--input-text);
                                    font-size: 14px;
                                    opacity: 0.7;
                                    transition: opacity 0.2s;
                                "
                                onmouseover="this.style.opacity='1'"
                                onmouseout="this.style.opacity='0.7'"
                                title="显示/隐藏密码">
                            🙈
                        </button>
                    </div>
                </div>
            `;

            gridContainer.appendChild(customDiv);
        });

        container.appendChild(gridContainer);

        container.querySelectorAll('.custom-password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const customKey = btn.dataset.custom;
                const input = container.querySelector(`input[data-custom="${customKey}_api_key"]`);
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '👁️';
                } else {
                    input.type = 'password';
                    btn.textContent = '🙈';
                }
            });
        });

        container.querySelectorAll('input[name="active_target"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="active_target"]').forEach(r => {
                    const span = r.nextElementSibling;
                    if (span) {
                        span.style.color = 'var(--input-text)';
                        span.style.fontWeight = 'normal';
                    }
                });
                
                if (radio.checked) {
                    const span = radio.nextElementSibling;
                    if (span) {
                        span.style.color = '#22c55e';
                        span.style.fontWeight = 'bold';
                    }
                }
            });
        });
    }

    attachActiveTargetHandlers(root) {
        const rootEl = root || document;
        const self = this;
        const radios = rootEl.querySelectorAll('input[name="active_target"]');
        const updateAll = () => {
            const allRadios = rootEl.querySelectorAll('input[name="active_target"]');
            allRadios.forEach(r => {
                const span = r.nextElementSibling;
                if (span) {
                    span.style.color = r.checked ? '#22c55e' : 'var(--input-text)';
                    span.style.fontWeight = r.checked ? 'bold' : 'normal';
                }
            });
        };
        radios.forEach(radio => {
            radio.addEventListener('change', async () => {
                updateAll();
                const newTarget = radio.value;
                if (newTarget && self.config) {
                    const newConfig = { ...self.config, active_target: newTarget };
                    const ok = await self.saveConfig(newConfig);
                    if (ok) {
                        self.config.active_target = newTarget;
                        console.log(`active_target 已更新为 ${newTarget}`);
                    } else {
                        console.warn('激活更新失败，请稍后重试。');
                    }
                }
            });
        });
        updateAll();
    }

    applyAdvancedParamsToNode(node, show) {
        if (!node || !node.widgets) {
            return;
        }
        const advancedParamNames = ['top_k', 'repetition_penalty', 'min_p', 'top_p'];
        advancedParamNames.forEach(paramName => {
            const widget = node.widgets.find(w => w.name === paramName);
            if (widget) {
                widget.hidden = !show;
                widget.disabled = !show;
                if (widget.options && typeof widget.options === "object") {
                    widget.options.hidden = !show;
                }
                if (widget.inputEl) {
                    widget.inputEl.disabled = !show;
                }
            }
        });
        if (typeof node.computeSize === "function") {
            const currentSize = node.size;
            const computedSize = node.computeSize();
            if (currentSize && currentSize.length > 0) {
                 node.size = [currentSize[0], computedSize[1]];
            } else {
                 node.size = computedSize;
            }
        }
    }

    updateAdvancedParamsVisibility(show) {
        const nodes = app.graph._nodes;
        nodes.forEach(node => {
            if (node.type === 'Qwen3VLAPI') {
                this.applyAdvancedParamsToNode(node, show);
            }
        });
        app.graph.setDirtyCanvas(true, true);
    }

    applyStatusBarToNode(node, show) {
        if (!node) return;
        if (show && !node._statusBarWidget) {
            const host = document.createElement("div");
            host.style.cssText = "width:100%;min-height:40px;max-height:120px;overflow-y:auto;background:var(--comfy-input-bg,#1f2430);border:1px solid var(--border-color,#404040);border-radius:6px;padding:6px 8px;font-size:11px;line-height:1.5;color:var(--input-text,#e5e7eb);box-sizing:border-box;white-space:pre-wrap;word-break:break-all;";
            host.textContent = "";
            const domWidget = node.addDOMWidget("status_bar", "div", host, {});
            domWidget.serialize = false;
            node._statusBarWidget = domWidget;
            node._statusBarHost = host;
            if (typeof node.computeSize === "function") {
                const currentSize = node.size;
                const computedSize = node.computeSize();
                if (currentSize && currentSize.length > 0) {
                    node.size = [currentSize[0], computedSize[1]];
                } else {
                    node.size = computedSize;
                }
            }
            app.graph.setDirtyCanvas(true, true);
        } else if (!show && node._statusBarWidget) {
            const idx = node.widgets.indexOf(node._statusBarWidget);
            if (idx !== -1) {
                node.widgets.splice(idx, 1);
            }
            if (node._statusBarWidget.element && node._statusBarWidget.element.parentNode) {
                node._statusBarWidget.element.parentNode.removeChild(node._statusBarWidget.element);
            }
            node._statusBarWidget = null;
            node._statusBarHost = null;
            if (typeof node.computeSize === "function") {
                const currentSize = node.size;
                const computedSize = node.computeSize();
                if (currentSize && currentSize.length > 0) {
                    node.size = [currentSize[0], computedSize[1]];
                } else {
                    node.size = computedSize;
                }
            }
            app.graph.setDirtyCanvas(true, true);
        }
    }

    updateStatusBarVisibility(show) {
        const nodes = app.graph._nodes;
        nodes.forEach(node => {
            if (node.type === 'Qwen3VLAPI') {
                this.applyStatusBarToNode(node, show);
            }
        });
        app.graph.setDirtyCanvas(true, true);
    }

    async saveSingleCardConfig(cardElement) {
        const type = cardElement?.dataset?.cardType;
        const key = cardElement?.dataset?.cardKey;
        const currentConfig = this.config || (await this.loadConfig());
        const updatedConfig = JSON.parse(JSON.stringify(currentConfig));
        let ok = false;
        try {
            if (type === "platform") {
                const selectEl = cardElement.querySelector(`select[data-platform-model="${key}"]`);
                const apiInput = cardElement.querySelector(`input[data-platform="${key}"]`);
                if (!updatedConfig.api_keys[key]) updatedConfig.api_keys[key] = {};
                if (selectEl) updatedConfig.api_keys[key].selected_model = selectEl.value;
                if (apiInput) updatedConfig.api_keys[key].api_key = apiInput.value;
            } else if (type === "custom") {
                const nameInput = cardElement.querySelector(`input[data-custom="${key}_name"]`);
                const apiBase = cardElement.querySelector(`input[data-custom="${key}_api_base"]`);
                const modelName = cardElement.querySelector(`input[data-custom="${key}_model_name"]`);
                const apiKey = cardElement.querySelector(`input[data-custom="${key}_api_key"]`);
                if (!updatedConfig.custom_configs) updatedConfig.custom_configs = {};
                if (!updatedConfig.custom_configs[key]) updatedConfig.custom_configs[key] = {};
                if (nameInput) updatedConfig.custom_configs[key].name = nameInput.value;
                if (apiBase) updatedConfig.custom_configs[key].api_base = apiBase.value;
                if (modelName) updatedConfig.custom_configs[key].model_name = modelName.value;
                if (apiKey) updatedConfig.custom_configs[key].api_key = apiKey.value;
            }
            ok = await this.saveConfig(updatedConfig);
            if (ok) {
                this.config = updatedConfig;
            }
        } catch (err) {
            console.error("保存单平台配置失败:", err);
            ok = false;
        }
        return ok;
    }

    async saveConfigFromDialog(dialog, onSuccess = null) {
        const platformInputs = dialog.querySelectorAll("input[data-platform]");
        const platformModelSelects = dialog.querySelectorAll("select[data-platform-model]");
        const customInputs = dialog.querySelectorAll("input[data-custom]");
        const newConfig = { ...this.config };

        platformInputs.forEach(input => {
            const platform = input.dataset.platform;
            if (newConfig.api_keys[platform]) {
                newConfig.api_keys[platform].api_key = input.value;
            }
        });

        platformModelSelects.forEach(select => {
            const platform = select.dataset.platformModel;
            if (newConfig.api_keys[platform]) {
                newConfig.api_keys[platform].selected_model = select.value;
            }
        });

        if (!newConfig.custom_configs) {
            newConfig.custom_configs = {};
        }

        customInputs.forEach(input => {
            const field = input.dataset.custom;
            const parts = field.split('_');
            if (parts.length >= 3 && parts[0] === 'custom') {
                const customKey = `${parts[0]}_${parts[1]}`;
                const fieldName = parts.slice(2).join('_');
                
                if (['custom_1', 'custom_2', 'custom_3'].includes(customKey)) {
                    if (!newConfig.custom_configs[customKey]) {
                        newConfig.custom_configs[customKey] = {};
                    }
                    newConfig.custom_configs[customKey][fieldName] = input.value;
                }
            }
        });

        const activeTargetRadio = dialog.querySelector('input[name="active_target"]:checked');
        if (activeTargetRadio) {
            newConfig.active_target = activeTargetRadio.value;
        }

        const success = await this.saveConfig(newConfig);
        if (success) {
            this.config = newConfig;
            alert($t('configSaved'));
            if (onSuccess) {
                onSuccess();
            }
        } else {
            alert($t('configSaveFailed'));
        }
    }

    async restoreDefaultConfig(dialog) {
        if (!confirm($t('confirmRestoreDefault'))) {
            return;
        }

        const defaultConfig = this.getDefaultConfig();
        const ok = await this.saveConfig(defaultConfig);
        
        this.config = { ...defaultConfig };
        this.renderPlatformConfigs(this.config);
        
        const customContainerExists = !!document.querySelector('#custom-configs');
        if (customContainerExists) {
            this.renderCustomConfigs(this.config);
        }
        this.attachActiveTargetHandlers(dialog);
        
        const advancedParamsCheckbox = dialog.querySelector("#advanced-params-checkbox");
        if (advancedParamsCheckbox) {
            advancedParamsCheckbox.checked = this.config.advanced_params_enabled || false;
            this.updateAdvancedParamsVisibility(this.config.advanced_params_enabled || false);
        }

        if (ok) {
            alert($t('restoreDefaultSuccess'));
        } else {
            alert($t('restoreDefaultFailed'));
        }
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
            link.download = `qwen3vl_config_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert($t('exportSuccess'));
        } catch (error) {
            console.error("导出配置失败:", error);
            alert($t('exportFailed'));
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
                    
                    // 验证导入数据的格式
                    if (!importData.config) {
                        throw new Error('无效的配置文件格式');
                    }
                    
                    const importedConfig = importData.config;
                    
                    // 验证必要的字段
                    if (!importedConfig.api_keys || !importedConfig.custom_configs) {
                        throw new Error('配置文件缺少必要字段');
                    }
                    
                    // 显示导入确认对话框
                    if (!confirm($t('confirmImportConfig'))) {
                        return;
                    }
                    
                    // 合并配置，保留当前的活动目标设置
                    const currentConfig = await this.loadConfig();
                    const mergedConfig = {
                        ...importedConfig,
                        active_target: currentConfig.active_target || importedConfig.active_target || "SiliconFlow"
                    };
                    
                    // 保存导入的配置
                    const ok = await this.saveConfig(mergedConfig);
                    if (ok) {
                        this.config = mergedConfig;
                        
                        // 重新渲染界面
                        this.renderPlatformConfigs(this.config);
                        
                        const customContainerExists = !!document.querySelector('#custom-configs');
                        if (customContainerExists) {
                            this.renderCustomConfigs(this.config);
                        }
                        this.attachActiveTargetHandlers(dialog);
                        
                        const advancedParamsCheckbox = dialog.querySelector("#advanced-params-checkbox");
                        if (advancedParamsCheckbox) {
                            advancedParamsCheckbox.checked = this.config.advanced_params_enabled || false;
                            this.updateAdvancedParamsVisibility(this.config.advanced_params_enabled || false);
                        }
                        
                        alert($t('importSuccessMsg'));
                    } else {
                        alert($t('importFailedMsg'));
                    }
                    
                } catch (error) {
                    console.error("解析配置文件失败:", error);
                    alert($t('importError').replace('{error}', error.message));
                }
            };
            input.click();
            
        } catch (error) {
            console.error("导入配置失败:", error);
            alert("导入配置失败，请重试。");
        }
    }
}

const apiConfigManager = new APIConfigManager();

let qwen3vlTemplateTooltipEl = null;
let qwen3vlClearTooltipEl = null;

function showQwen3VLTemplateTooltip(btnEl) {
    hideQwen3VLTemplateTooltip();
    qwen3vlTemplateTooltipEl = document.createElement("div");
    qwen3vlTemplateTooltipEl.style.cssText = "position:fixed;background:rgba(30,41,59,0.95);color:#e2e8f0;padding:6px 10px;border-radius:4px;font-size:11px;z-index:10004;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;white-space:nowrap;border:1px solid rgba(255,255,255,0.1);";
    qwen3vlTemplateTooltipEl.textContent = $t('templateTooltip');
    document.body.appendChild(qwen3vlTemplateTooltipEl);
    const btnRect = btnEl.getBoundingClientRect();
    const tooltipRect = qwen3vlTemplateTooltipEl.getBoundingClientRect();
    let left = btnRect.left + (btnRect.width / 2) - (tooltipRect.width / 2);
    let top = btnRect.bottom + 6;
    if (left < 5) left = 5;
    if (left + tooltipRect.width > window.innerWidth - 5) left = window.innerWidth - tooltipRect.width - 5;
    if (top + tooltipRect.height > window.innerHeight - 5) top = btnRect.top - tooltipRect.height - 6;
    qwen3vlTemplateTooltipEl.style.left = left + "px";
    qwen3vlTemplateTooltipEl.style.top = top + "px";
}

function hideQwen3VLTemplateTooltip() {
    if (qwen3vlTemplateTooltipEl) { qwen3vlTemplateTooltipEl.remove(); qwen3vlTemplateTooltipEl = null; }
}

function showQwen3VLClearTooltip(btnEl, key) {
    hideQwen3VLClearTooltip();
    qwen3vlClearTooltipEl = document.createElement("div");
    qwen3vlClearTooltipEl.style.cssText = "position:fixed;background:rgba(30,41,59,0.95);color:#e2e8f0;padding:6px 10px;border-radius:4px;font-size:11px;z-index:10004;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;white-space:nowrap;border:1px solid rgba(255,255,255,0.1);";
    qwen3vlClearTooltipEl.textContent = $t(key);
    document.body.appendChild(qwen3vlClearTooltipEl);
    const btnRect = btnEl.getBoundingClientRect();
    const tooltipRect = qwen3vlClearTooltipEl.getBoundingClientRect();
    let left = btnRect.left + (btnRect.width / 2) - (tooltipRect.width / 2);
    let top = btnRect.bottom + 6;
    if (left < 5) left = 5;
    if (left + tooltipRect.width > window.innerWidth - 5) left = window.innerWidth - tooltipRect.width - 5;
    if (top + tooltipRect.height > window.innerHeight - 5) top = btnRect.top - tooltipRect.height - 6;
    qwen3vlClearTooltipEl.style.left = left + "px";
    qwen3vlClearTooltipEl.style.top = top + "px";
}

function hideQwen3VLClearTooltip() {
    if (qwen3vlClearTooltipEl) { qwen3vlClearTooltipEl.remove(); qwen3vlClearTooltipEl = null; }
}

function showQwen3VLToast(message, type = "info") {
    const toast = document.createElement("div");
    const bgColor = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#667eea";
    toast.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:${bgColor};color:white;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:500;z-index:10003;box-shadow:0 8px 24px rgba(0,0,0,0.4);text-align:center;min-width:240px;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 1500);
}

async function showQwen3VLTemplateSelector(node, btnRect) {
    const existingOverlay = document.getElementById("qwen3vl-template-selector");
    if (existingOverlay) {
        existingOverlay.remove();
        const existingStyle = document.querySelector("style[data-qwen3vl-template-style]");
        if (existingStyle) existingStyle.remove();
    }
    
    const overlay = document.createElement("div");
    overlay.id = "qwen3vl-template-selector";
    overlay.style.cssText = "position:fixed;z-index:10001;animation:qwen3vlDropdownIn 0.2s cubic-bezier(0.16,1,0.3,1);transform-origin:top center;";
    
    const style = document.createElement("style");
    style.setAttribute("data-qwen3vl-template-style", "");
    style.textContent = `@keyframes qwen3vlDropdownIn{from{transform:translateY(-8px) scale(0.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}@keyframes qwen3vlDropdownOut{from{transform:translateY(0) scale(1);opacity:1}to{transform:translateY(-8px) scale(0.95);opacity:0}}`;
    document.head.appendChild(style);

    const dialog = document.createElement("div");
    dialog.style.cssText = "width:320px;max-width:90vw;max-height:350px;background:#1f2937;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:12px;color:#e8e8e8;box-shadow:0 8px 32px rgba(0,0,0,0.4);display:flex;flex-direction:column;";
    
    const header = document.createElement("div");
    header.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;";
    
    const title = document.createElement("h3");
    title.style.cssText = "margin:0;font-size:15px;font-weight:600;background:linear-gradient(90deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;";
    title.textContent = $t('selectTemplate');
    
    const closeBtn = document.createElement("button");
    closeBtn.style.cssText = "width:20px;height:20px;border-radius:50%;border:1px solid rgba(255,255,255,0.25);background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;transition:all 0.2s ease;";
    closeBtn.innerHTML = "×";
    closeBtn.onmouseover = () => { closeBtn.style.background = "#b91c1c"; closeBtn.style.borderColor = "#ef4444"; closeBtn.style.color = "#fff"; };
    closeBtn.onmouseout = () => { closeBtn.style.background = "transparent"; closeBtn.style.borderColor = "rgba(255,255,255,0.25)"; closeBtn.style.color = "#9ca3af"; };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = $t('searchTemplates');
    searchInput.style.cssText = "width:100%;padding:6px 10px;background:#111827;border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#e8e8e8;font-size:12px;margin-bottom:8px;box-sizing:border-box;";
    
    const listContainer = document.createElement("div");
    listContainer.style.cssText = "flex:1;overflow-y:auto;border:1px solid rgba(255,255,255,0.1);border-radius:6px;min-height:60px;max-height:380px;scrollbar-width:thin;scrollbar-color:rgba(102,126,234,0.5) rgba(255,255,255,0.05);";
    
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
    applyCategoryTheme(dialog, COMFY_CATEGORY_THEME);

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
        const existingOverlay2 = document.getElementById("qwen3vl-template-selector");
        if (existingOverlay2) { existingOverlay2.remove(); }
        apiConfigManager.showConfigDialog(null);
        setTimeout(() => {
            const templatesTab = document.querySelector('.qwen3vl-nav-tab[data-page="templates"]');
            if (templatesTab) templatesTab.click();
        }, 100);
    };
    dialog.appendChild(manageBtn);
    
    overlay.appendChild(dialog);
    
    const close = () => {
        overlay.style.animation = "qwen3vlDropdownOut 0.15s ease forwards";
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); style.remove(); }, 150);
    };
    
    closeBtn.onclick = close;
    
    const handleClickOutside = (e) => {
        if (!overlay.contains(e.target)) { close(); document.removeEventListener("mousedown", handleClickOutside); }
    };
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
        showQwen3VLClearTooltip(restoreBtn, 'restoreTooltip');
    };
    restoreBtn.onmouseleave = () => {
        restoreBtn.style.background = "rgba(34, 197, 94, 0.35)";
        restoreBtn.style.color = "rgba(34, 197, 94, 0.9)";
        restoreBtn.style.transform = "scale(1)";
        hideQwen3VLClearTooltip();
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
        showQwen3VLClearTooltip(clearBtn, 'clearTooltip');
    };
    clearBtn.onmouseleave = () => {
        clearBtn.style.background = "rgba(239, 68, 68, 0.35)";
        clearBtn.style.color = "rgba(239, 68, 68, 0.9)";
        clearBtn.style.transform = "scale(1)";
        hideQwen3VLClearTooltip();
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
        showQwen3VLTemplateTooltip(templateBtn);
    };
    templateBtn.onmouseleave = () => {
        templateBtn.style.background = "rgba(102, 126, 234, 0.35)";
        templateBtn.style.color = "rgba(102, 126, 234, 0.9)";
        templateBtn.style.transform = "scale(1)";
        hideQwen3VLTemplateTooltip();
    };
    templateBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = templateBtn.getBoundingClientRect();
        showQwen3VLTemplateSelector(node, rect);
    };
    
    btnContainer.appendChild(templateBtn);
    
    parentEl.appendChild(btnContainer);
    
    node._templateBtn = templateBtn;
    node._clearBtn = clearBtn;
    node._restoreBtn = restoreBtn;
}

app.registerExtension({
    name: "Comfyui_Qwen3VL.APIConfig",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (!nodeData?.category?.startsWith("Zhi.AI/Qwen3VL") && 
            !nodeData?.category?.startsWith("Comfyui_Qwen3VL")) {
            return;
        }
        
        switch (nodeData.name) {
            case "Qwen3VLAPI":
                const onNodeCreated = nodeType.prototype.onNodeCreated;
                nodeType.prototype.onNodeCreated = function () {
                    const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                    
                    this._qwen3vlHelp = false;
                    this._qwen3vlHelpLocale = getLocale();
                    
                    const configButton = this.addWidget("button", $t('nodeSettings'), null, () => {
                        const existingOverlay = document.getElementById("qwen3vl-template-selector");
                        if (existingOverlay) {
                            existingOverlay.remove();
                            const existingStyle = document.querySelector("style[data-qwen3vl-template-style]");
                            if (existingStyle) existingStyle.remove();
                        }
                        const buttonElement = document.querySelector('.comfy-widget-value[value="Settings·设置"]');
                        apiConfigManager.showConfigDialog(buttonElement);
                    });
                    
                    setTimeout(async () => {
                        const config = await apiConfigManager.loadConfig();
                        const advancedParamsEnabled = config.advanced_params_enabled || false;
                        apiConfigManager.applyAdvancedParamsToNode(this, advancedParamsEnabled);
                        const showStatusBar = config.show_status_bar || false;
                        apiConfigManager.applyStatusBarToNode(this, showStatusBar);
                        addQwen3VLInputButtons(this);
                        app.graph.setDirtyCanvas(true, true);
                    }, 100);
                    
                    return r;
                };

                const onExecuted = nodeType.prototype.onExecuted;
                nodeType.prototype.onExecuted = function (message) {
                    onExecuted?.apply(this, arguments);
                    if (this._statusBarHost && message?.status) {
                        const statusText = Array.isArray(message.status) 
                            ? message.status.join("\n") 
                            : String(message.status);
                        this._statusBarHost.textContent = statusText;
                        this._statusBarHost.scrollTop = this._statusBarHost.scrollHeight;
                        app.graph.setDirtyCanvas(true, false);
                    }
                };

                const iconSize = 24;
                const iconMargin = 4;
                let helpElement = null;
                let currentHelpLocale = null;

                const drawFg = nodeType.prototype.onDrawForeground;
                nodeType.prototype.onDrawForeground = function (ctx) {
                    const currentLocale = getLocale();
                    if (this._qwen3vlHelpLocale !== currentLocale) {
                        this._qwen3vlHelpLocale = currentLocale;
                    }
                    
                    const r = drawFg ? drawFg.apply(this, arguments) : undefined;
                    if (this.flags.collapsed) return r;

                    const x = this.size[0] - iconSize - iconMargin;
                    const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;

                    if (this._qwen3vlHelp && helpElement === null) {
                        currentHelpLocale = currentLocale;
                        helpElement = createQwen3VLHelpPopup(getQwen3VLHelpHTML());
                    }
                    else if (!this._qwen3vlHelp && helpElement !== null) {
                        helpElement.remove();
                        helpElement = null;
                        currentHelpLocale = null;
                    }
                    else if (this._qwen3vlHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                        helpElement.querySelector('div').innerHTML = getQwen3VLHelpHTML();
                        currentHelpLocale = currentLocale;
                    }

                    if (this._qwen3vlHelp && helpElement !== null) {
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

                    // 展开中或鼠标悬停时高亮
                    const helpActive = !!(this._qwen3vlHelp || this._qwen3vlHelpHovered);

                    ctx.save();
                    ctx.translate(x, y);
                    ctx.scale(iconSize / 32, iconSize / 32);
                    drawNodeHelpButton(ctx, helpActive);
                    
                    ctx.restore();
                    return r;
                };

                const mouseDown = nodeType.prototype.onMouseDown;
                nodeType.prototype.onMouseDown = function (e, localPos, canvas) {
                    const r = mouseDown ? mouseDown.apply(this, arguments) : undefined;
                    const iconX = this.size[0] - iconSize - iconMargin;
                    const iconY = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;
                    if (
                        localPos[0] > iconX &&
                        localPos[0] < iconX + iconSize &&
                        localPos[1] > iconY &&
                        localPos[1] < iconY + iconSize
                    ) {
                        this._qwen3vlHelp = !this._qwen3vlHelp;
                        return true;
                    }
                    return r;
                };

                // 帮助按钮悬停高亮
                const mouseMove = nodeType.prototype.onMouseMove;
                nodeType.prototype.onMouseMove = function (e, localPos, canvas) {
                    const r = mouseMove ? mouseMove.apply(this, arguments) : undefined;
                    const iconX = this.size[0] - iconSize - iconMargin;
                    const iconY = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;
                    const hovered = !!localPos
                        && localPos[0] > iconX && localPos[0] < iconX + iconSize
                        && localPos[1] > iconY && localPos[1] < iconY + iconSize;
                    if (hovered !== this._qwen3vlHelpHovered) {
                        this._qwen3vlHelpHovered = hovered;
                        this.setDirtyCanvas(true, true);
                    }
                    return r;
                };

                const mouseLeave = nodeType.prototype.onMouseLeave;
                nodeType.prototype.onMouseLeave = function () {
                    const r = mouseLeave ? mouseLeave.apply(this, arguments) : undefined;
                    if (this._qwen3vlHelpHovered) {
                        this._qwen3vlHelpHovered = false;
                        this.setDirtyCanvas(true, true);
                    }
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
                    return r;
                };
                break;
                
            case "MultiplePathsInput":
                nodeType.prototype.onNodeCreated = function () {
                    this._type = "PATH";
                    this.inputs_offset = nodeData.name.includes("selective") ? 1 : 0;
                    
                    this.updateInputs = function(target_number_of_inputs) {
                        if (!this.inputs) {
                            this.inputs = [];
                        }
                        
                        const currentPathInputs = this.inputs.filter(input => input.name.startsWith("path_")).length;
                        
                        if (target_number_of_inputs === currentPathInputs) return;

                        if (target_number_of_inputs < currentPathInputs) {
                            for (let i = this.inputs.length - 1; i >= 0; i--) {
                                const input = this.inputs[i];
                                if (input.name.startsWith("path_")) {
                                    const pathNum = parseInt(input.name.split("_")[1]);
                                    if (pathNum > target_number_of_inputs) {
                                        this.removeInput(i);
                                    }
                                }
                            }
                        } else {
                            for (let i = currentPathInputs + 1; i <= target_number_of_inputs; i++) {
                                this.addInput(`path_${i}`, this._type);
                            }
                        }
                    };
                    
                    const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
                    if (inputcountWidget) {
                        const self = this;
                        const handleInputChange = () => {
                            const n = parseInt(inputcountWidget.value) || 1;
                            self.updateInputs(n);
                        };
                        const originalCallback = inputcountWidget.callback;
                        inputcountWidget.callback = function(value) {
                            if (originalCallback) originalCallback.call(this, value);
                            handleInputChange();
                        };
                        const originalMouseUp = inputcountWidget.mouseUp;
                        inputcountWidget.mouseUp = function(e, pos, node) {
                            const result = originalMouseUp ? originalMouseUp.call(this, e, pos, node) : undefined;
                            handleInputChange();
                            return result;
                        };
                        const originalOnKeyDown = inputcountWidget.onKeyDown;
                        inputcountWidget.onKeyDown = function(e) {
                            const result = originalOnKeyDown ? originalOnKeyDown.call(this, e) : undefined;
                            if (e.keyCode === 13) {
                                handleInputChange();
                            }
                            return result;
                        };
                        const v = parseInt(inputcountWidget.value) || 1;
                        this.updateInputs(v);
                    }
                };
                break;
                
            case "VideoLoader":
                const onVideoNodeCreated = nodeType.prototype.onNodeCreated;
                nodeType.prototype.onNodeCreated = function () {
                    const r = onVideoNodeCreated ? onVideoNodeCreated.apply(this, arguments) : undefined;
                    
                    const videoWidget = this.widgets?.find(w => w.name === "file" && w.type === "combo");
                    if (videoWidget) {
                        const originalCallback = videoWidget.callback;
                        videoWidget.callback = function(value) {
                            if (originalCallback) {
                                originalCallback.call(this, value);
                            }
                            
                            setTimeout(() => {
                                const videoElements = document.querySelectorAll('video');
                                videoElements.forEach(video => {
                                    if (video.src && video.src.includes(value)) {
                                        video.style.objectFit = 'contain';
                                        video.style.maxWidth = '100%';
                                        video.style.maxHeight = '100%';
                                        video.style.width = 'auto';
                                        video.style.height = 'auto';
                                    }
                                });
                            }, 100);
                        };
                    }
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