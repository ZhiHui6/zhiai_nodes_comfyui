import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const i18n = {
    zh: {
        title: "⚙️ 翻译平台配置管理",
        platformInfo: "平台信息",
        officialWebsite: "官网",
        clearAllConfig: "清除所有配置",
        backupPlatformInfo: "备份平台信息",
        importPlatformInfo: "导入平台信息",
        saveConfig: "保存配置",
        showPassword: "显示密码",
        hidePassword: "隐藏密码",
        inputPlaceholder: "请输入",
        configTitle: "配置",
        googleWarning: "⚠️ 注意：访问谷歌翻译需要特殊网络环境支持，请确保网络可以正常访问 Google 服务。",
        loadConfigFailed: "无法加载配置文件",
        confirmClear: "确定要清除所有配置信息吗？此操作不可恢复！",
        clearSuccess: "✅ 所有配置信息已清除！",
        clearFailed: "❌ 配置清除失败，请重试。",
        noBackupData: "❌ 没有可备份的配置信息。",
        backupSuccess: "✅ 平台信息备份成功！",
        backupFailed: "❌ 备份失败，请重试。",
        confirmImport: "确定要导入配置吗？这将覆盖当前所有平台配置！",
        importSuccess: "✅ 平台信息导入成功！",
        importFailed: "❌ 配置导入失败，请重试。",
        invalidFormat: "❌ 导入的文件格式不正确。",
        importError: "❌ 导入失败，文件格式错误或文件损坏。",
        saveSuccess: "配置保存成功！",
        saveFailed: "配置保存失败，请重试。",
        configButton: "⚙️ 配置管理",
        baidu: "百度翻译",
        aliyun: "阿里云翻译",
        youdao: "有道翻译",
        zhipu: "智谱AI翻译",
        google: "谷歌翻译",
        baiduDesc: "百度翻译API，支持多种语言互译，需要注册百度翻译开放平台获取API密钥。免费额度：标准版5万字符/月，高级版100万字符/月（需个人认证）",
        aliyunDesc: "阿里云翻译API，企业级翻译服务，支持多种语言和领域。免费额度：100万字符/月。",
        youdaoDesc: "有道翻译API，基于神经网络翻译技术，提供高质量翻译。免费额度：赠送50元的体验金。",
        zhipuDesc: "智谱AI翻译API，基于大语言模型技术，提供高质量翻译服务，需要智谱AI开放平台API密钥。免费额度：新用户默认获得每月一定数量的免费额度。",
        googleDesc: "谷歌翻译免费使用，无需API密钥。",
        model: "模型"
    },
    en: {
        title: "⚙️ Translation Platform Configuration",
        platformInfo: "Platform Info",
        officialWebsite: "Website",
        clearAllConfig: "Clear All Config",
        backupPlatformInfo: "Backup Config",
        importPlatformInfo: "Import Config",
        saveConfig: "Save Config",
        showPassword: "Show Password",
        hidePassword: "Hide Password",
        inputPlaceholder: "Enter",
        configTitle: "Configuration",
        googleWarning: "⚠️ Note: Accessing Google Translate requires special network environment. Please ensure your network can access the Google services to access Google Translate.",
        loadConfigFailed: "Failed to load configuration file",
        confirmClear: "Are you sure you want to clear all configuration? This action cannot be undone!",
        clearSuccess: "✅ All configuration cleared!",
        clearFailed: "❌ Failed to clear configuration, please try again.",
        noBackupData: "❌ No configuration data to backup.",
        backupSuccess: "✅ Configuration backup successful!",
        backupFailed: "❌ Backup failed, please try again.",
        confirmImport: "Are you sure you want to import configuration? This will overwrite all current platform settings!",
        importSuccess: "✅ Configuration imported successfully!",
        importFailed: "❌ Failed to import configuration, please try again.",
        invalidFormat: "❌ Invalid file format.",
        importError: "❌ Import failed, file format error or file corrupted.",
        saveSuccess: "Configuration saved successfully!",
        saveFailed: "Failed to save configuration, please try again.",
        configButton: "⚙️ Config Management",
        baidu: "Baidu Translate",
        aliyun: "Aliyun Translate",
        youdao: "Youdao Translate",
        zhipu: "Zhipu AI Translate",
        google: "Google Translate",
        baiduDesc: "Baidu Translate API supports multiple languages. Requires API key from Baidu Translate Open Platform. Free tier: 50K chars/month (Standard), 1M chars/month (Advanced with verification).",
        aliyunDesc: "Aliyun Translation API provides enterprise-level translation service supporting multiple languages and domains. Free tier: 1M chars/month.",
        youdaoDesc: "Youdao Translation API uses neural network technology for high-quality translation. Free tier: 50 CNY trial credit.",
        zhipuDesc: "Zhipu AI Translation API uses large language model technology for high-quality translation. Requires API key from Zhipu AI Open Platform. Free tier available for new users.",
        googleDesc: "Google Translate Free to use, no API key required.",
        model: "Model"
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
            base: "width:750px;height:435px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);padding:0;color:#f8fafc;z-index:10002;display:block;opacity:1;visibility:visible;pointer-events:auto;",
            overlay: "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:10001;display:flex;align-items:center;justify-content:center;",
            input: "background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:6px; padding:6px 12px; font-size:14px; transition:all .2s ease; height:32px; width:66.67%;",
            button: "border:none; border-radius:6px; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s ease;",
            buttonPrimary: "background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:white; box-shadow:0 2px 6px rgba(59, 130, 246, 0.3);",
            buttonSuccess: "background:linear-gradient(135deg, #10b981 0%, #059669 100%); color=white; box-shadow:0 2px 6px rgba(16, 185, 129, 0.3);",
            buttonDanger: "background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff; border:none; border-radius:6px; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(220, 38, 38, 0.3);",
            buttonClear: "background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff; border:none; border-radius:6px; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(220, 38, 38, 0.3);",
            select: "background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:6px; padding:6px 12px; font-size:14px; transition:all .2s ease; appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:36px; height:32px; width:66.67%;",
            checkbox: "width:16px; height:16px; accent-color:#3b82f6;",
            label: "font-size:13px; font-weight:600; color:#f8fafc; margin-bottom:6px;"
        };
    },
    getUniqueStyles(uniqueId) {
        const styles = this.getStyles();
        return `
            <style>
                #${uniqueId} { 
                    font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif; 
                    -webkit-font-smoothing: antialiased; 
                    -moz-osx-font-smoothing: grayscale; 
                }
                
                #${uniqueId} .ui-header { 
                    display:flex; 
                    align-items:center; 
                    justify-content:space-between; 
                    padding:6px 12px; 
                    background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
                    border-bottom:1px solid #1e293b; 
                    border-radius: 12px 12px 0 0;
                    flex-shrink: 0;
                }
                
                #${uniqueId} .ui-title { 
                    font-size:18px; 
                    font-weight:700; 
                    color:#f0f0f0;
                    letter-spacing:0.3px;
                    margin:0;
                }
                
                #${uniqueId} .close-button { 
                    width:26px; 
                    height:26px; 
                    border-radius:6px; 
                    border:1px solid rgba(220, 38, 38, 0.5); 
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                    cursor:pointer; 
                    display:inline-flex; 
                    align-items:center; 
                    justify-content:center; 
                    transition:all .2s ease; 
                    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
                }
                
                #${uniqueId} .close-button::before { 
                    content:"×"; 
                    color:#ffffff; 
                    font-size:18px; 
                    line-height:1; 
                    font-weight: 300;
                }
                
                #${uniqueId} .close-button:hover { 
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border-color:#ef4444; 
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
                }
                
                #${uniqueId} .close-button:active {
                    transform: scale(0.95);
                }
                
                #${uniqueId} .ui-content {
                    display:flex; 
                    flex-direction:column; 
                    height: 395px;
                    min-height: 395px;
                    max-height: 395px;
                    overflow: hidden;
                }
                
                #${uniqueId} .platform-tabs { 
                    display:flex;
                    background: #0f172a;
                    border-bottom: 1px solid #1a2332;
                    padding: 6px 16px;
                    overflow-x: auto;
                    flex-shrink: 0;
                    height: auto;
                    min-height: auto;
                    gap: 4px;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar {
                    height: 4px;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 2px;
                }
                
                #${uniqueId} .tab-item { 
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    color: #94a3b8;
                    border: 1px solid #334155;
                    border-radius: 5px;
                    background: transparent;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                }
                
                #${uniqueId} .tab-item:hover { 
                    color: #e2e8f0;
                    border-color: #ffffff;
                    background: rgba(59, 130, 246, 0.08);
                }
                
                #${uniqueId} .tab-item.active { 
                    color: #3b82f6;
                    border-color: #3b82f6;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%);
                    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 2px rgba(59, 130, 246, 0.1);
                }
                
                #${uniqueId} .tab-content {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: #0f172a;
                    min-height: 0;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar {
                    width: 6px;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 3px;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
                
                #${uniqueId} .platform-config { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 8; 
                    min-height: 294px;
                    height: 100%;
                }
                
                #${uniqueId} .config-header { 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding-bottom: 6px;
                    flex-shrink: 0;
                }
                
                #${uniqueId} .config-title { 
                    font-size: 16px; 
                    font-weight: 700; 
                    color: #f8fafc; 
                    letter-spacing: 0.3px; 
                    margin: 0;
                }
                
                #${uniqueId} .config-form { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 10px; 
                    flex: 1;
                    min-height: 0;
                }
                
                #${uniqueId} .form-group { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 6px; 
                }
                
                #${uniqueId} .form-group-inline { 
                    display: flex; 
                    flex-direction: row; 
                    align-items: center; 
                    gap: 6px; 
                    margin-bottom: 4px;
                }
                
                #${uniqueId} .form-group-inline label { 
                    ${styles.label}
                    margin-bottom: 0;
                    min-width: 120px;
                    text-align: right;
                    flex-shrink: 0;
                }
                
                #${uniqueId} .form-group-inline input { 
                    ${styles.input}
                    flex: 1;
                    margin-bottom: 0;
                    max-width: 450px;
                }
                
                #${uniqueId} .form-group label { 
                    ${styles.label}
                }
                
                #${uniqueId} .form-group input { 
                    ${styles.input}
                }
                
                #${uniqueId} .form-group select { 
                    ${styles.select}
                }
                
                #${uniqueId} .zhipu-custom-instruction {
                    margin-bottom: 6px;
                }
                
                #${uniqueId} .form-row { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 20px; 
                }
                
                #${uniqueId} .form-actions { 
                    display: flex; 
                    gap: 8px; 
                    margin-top: 2px;
                    padding: 6px 0 0 0; 
                    flex-shrink: 0;
                    justify-content: flex-end;
                    align-items: center;
                    min-height: 28px;
                }
                
                #${uniqueId} .btn-clear {
                    margin-right: auto;
                }
                
                #${uniqueId} .btn-save { 
                    ${styles.button} ${styles.buttonSuccess}
                }
                
                #${uniqueId} .platform-info { 
                    padding: 8px; 
                    background: rgba(30, 41, 59, 0.5); 
                    border-radius: 6px; 
                    border-left: 3px solid #3b82f6; 
                    margin-bottom: 12px; 
                    flex-shrink: 0;
                }
                
                #${uniqueId} .platform-info h4 { 
                    margin: 0 0 8px 0; 
                    color: #3b82f6; 
                    font-size: 16px; 
                    font-weight: 700;
                    letter-spacing: 0.2px;
                }
                
                #${uniqueId} .platform-info p { 
                    margin: 4px 0; 
                    color: #cbd5e1; 
                    font-size: 13px; 
                    line-height: 1.5;
                }
                
                #${uniqueId} .platform-info p a {
                    color: #60a5fa;
                    text-decoration: none;
                    transition: color .2s ease;
                    font-weight: 600;
                }
                
                #${uniqueId} .platform-info p a:hover {
                    color: #93c5fd;
                    text-decoration: underline;
                }
                
                #${uniqueId} .loading { 
                    display: inline-block; 
                    width: 16px; 
                    height: 16px; 
                    border: 2px solid #f8fafc; 
                    border-top: 2px solid #3b82f6; 
                    border-radius: 50%; 
                    animation: spin 1s linear infinite; 
                    margin-right: 8px;
                }
                
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                }
                
                @media (max-width: 768px) {
                    #${uniqueId} .form-row {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    
                    #${uniqueId} .ui-header {
                        padding: 20px 24px;
                    }
                    
                    #${uniqueId} .tab-content {
                        padding: 24px;
                    }
                    
                    #${uniqueId} .form-actions {
                        flex-direction: column;
                        gap: 4px;
                        padding: 8px 0 0 0;
                        align-items: flex-end;
                        justify-content: center;
                        min-height: 32px;
                    }
                    
                    #${uniqueId} .btn-save {
                        width: auto;
                        padding: 6px 12px;
                        font-size: 12px;
                    }
                    
                    #${uniqueId} .ui-content {
                        height: 360px;
                        min-height: 360px;
                        max-height: 360px;
                    }
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

async function loadConfig() {
    const result = await Utils.apiCall("/zhiai_nodes/translate/config", { method: "GET" });
    return result.ok && result.data ? result.data : null;
}

async function saveConfig(config) {
    const result = await Utils.apiCall("/zhiai_nodes/translate/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
    });
    return result.ok;
}

async function clearConfig() {
    const result = await Utils.apiCall("/zhiai_nodes/translate/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    return result.ok;
}



function getPlatformFields(platform) {
    const locale = getLocale();
    const modelLabel = locale === 'zh' ? "模型" : "Model";

    const fields = {
        baidu: [
            { name: "app_id", label: "APP ID", type: "text", required: true },
            { name: "api_key", label: "API Key", type: "text", required: true }
        ],
        aliyun: [
            { name: "access_key_id", label: "Access Key ID", type: "text", required: true },
            { name: "access_key_secret", label: "Access Key Secret", type: "text", required: true }
        ],
        youdao: [
            { name: "app_key", label: "App Key", type: "text", required: true },
            { name: "app_secret", label: "App Secret", type: "text", required: true }
        ],
        zhipu: [
            { name: "api_key", label: "API Key", type: "text", required: true },
            { name: "model", label: modelLabel, type: "select", options: ["glm-4-flash", "glm-4.5-flash", "glm-4.6v-flash", "glm-4.7-flash"], default: "glm-4.7-flash" }
        ],
        google: []
    };
    return fields[platform] || [];
}

function getPlatformInfo(platform) {
    const info = {
        baidu: {
            name: $t('baidu'),
            description: $t('baiduDesc'),
            website: "https://api.fanyi.baidu.com/"
        },
        aliyun: {
            name: $t('aliyun'),
            description: $t('aliyunDesc'),
            website: "https://www.aliyun.com/product/ai/alimt"
        },
        youdao: {
            name: $t('youdao'),
            description: $t('youdaoDesc'),
            website: "https://ai.youdao.com/"
        },
        zhipu: {
            name: $t('zhipu'),
            description: $t('zhipuDesc'),
            website: "https://open.bigmodel.cn/"
        },
        google: {
            name: $t('google'),
            description: $t('googleDesc'),
            website: ""
        }
    };
    return info[platform] || {};
}

async function openSettings(node) {
    const config = await loadConfig();
    if (!config) {
        alert($t('loadConfigFailed'));
        return;
    }

    overlay = createOverlay();
    dialog = createDialog();
    const uniqueId = `translate-settings-${Math.random().toString(36).substring(2, 9)}`;
    
    let currentPlatform = config.default_platform || "baidu";
    let currentConfig = { ...config };

    function renderPlatformTabs() {
        const platforms = Object.keys(currentConfig.platforms);
        const platformNames = {
            baidu: $t('baidu'),
            aliyun: $t('aliyun'),
            youdao: $t('youdao'),
            zhipu: $t('zhipu'),
            google: $t('google')
        };
        
        return `
            <div class="platform-tabs">
                ${platforms.map(platform => {
                    const displayName = platformNames[platform] || currentConfig.platforms[platform].name || platform;
                    return `
                        <div class="tab-item ${platform === currentPlatform ? 'active' : ''}" data-platform="${platform}">
                            ${displayName}
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderPlatformConfig() {
        const platformData = currentConfig.platforms[currentPlatform];
        const fields = getPlatformFields(currentPlatform);
        const info = getPlatformInfo(currentPlatform);
        const locale = getLocale();
        const googleTranslate = locale === 'zh' ? "谷歌翻译" : "Google Translate";
        const inputPlaceholder = $t('inputPlaceholder');
        
        let fieldsHtml = "";
        if (fields.length > 0) {
            fieldsHtml = `
                <div class="config-form">
                    ${fields.map(field => {
                        const value = platformData.config[field.name] || field.default || "";
                        const isSensitiveField = field.name.toLowerCase().includes('key') || 
                                               field.name.toLowerCase().includes('secret') ||
                                               field.name.toLowerCase().includes('password') ||
                                               field.name.toLowerCase().includes('app_id') ||
                                               field.name.toLowerCase().includes('appid') ||
                                               field.name.toLowerCase().includes('app_key') ||
                                               field.name.toLowerCase().includes('app_secret') ||
                                               field.name.toLowerCase().includes('access_key');
                        
                        const useInlineLayout = isSensitiveField && (field.type === "text" || field.type === "password");
                        const useInlineSelect = field.type === "select" && (
                    field.name === "region" || 
                    field.name === "model" ||
                    field.name === "platform"
                );
                        
                        if (field.type === "select" && useInlineSelect) {
                            return `
                                <div class="form-group-inline">
                                    <label style="text-align: right; min-width: 120px; flex-shrink: 0;">${field.label}:</label>
                                    <select id="field-${field.name}" class="select-input" data-field="${field.name}" 
                                            style="width: 33.33%; max-width: 225px; background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:4px; padding:8px 12px; font-size:14px; transition:all .2s ease; height:36px;">
                                        ${field.options.map(opt => `<option value="${opt}" ${opt === value ? "selected" : ""}>${opt}</option>`).join("")}
                                    </select>
                                </div>
                            `;
                        } else if (field.type === "textarea") {
                            return `
                                <div class="form-group" id="field-group-${field.name}">
                                    <label>${field.label}${field.required ? " *" : ""}:</label>
                                    <textarea id="field-${field.name}" 
                                              placeholder="${field.placeholder || inputPlaceholder + field.label}" 
                                              rows="8" 
                                              style="width: 100%; resize: none;">${value}</textarea>
                                </div>
                            `;
                        } else if (useInlineLayout) {
                            return `
                                <div class="form-group-inline">
                                    <label style="text-align: right; min-width: 120px; flex-shrink: 0;">${field.label}${field.required ? " *" : ""}:</label>
                                    <div style="position: relative; display: flex; align-items: center; flex: 1; max-width: 450px;">
                                        <input type="password" id="field-${field.name}" value="${value}" placeholder="${inputPlaceholder}${field.label}" 
                                               style="width: 100%; padding-right: 35px; background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:6px; padding:8px 12px; font-size:14px; transition:all .2s ease; height:36px;">
                                        <button type="button" 
                                                class="password-toggle-btn" 
                                                data-field="${field.name}"
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
                                                title="${$t('showPassword')}">
                                            🙈
                                        </button>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="form-group">
                                    <label>${field.label}${field.required ? " *" : ""}:</label>
                                    <input type="${field.type}" id="field-${field.name}" value="${value}" placeholder="${inputPlaceholder}${field.label}">
                                </div>
                            `;
                        }
                    }).join("")}
                </div>
            `;
        }

        return `
            <div class="platform-config">
                <div class="config-header">
                    <h2 class="config-title">${info.name} ${$t('configTitle')}</h2>
                </div>
                
                ${info.description ? `
                    <div class="platform-info">
                        <h4>${$t('platformInfo')}</h4>
                        <p>${info.description}</p>
                        ${info.website ? `<p><strong>${$t('officialWebsite')}:</strong> <a href="${info.website}" target="_blank">${info.website}</a></p>` : ""}
                    </div>
                ` : ""}

                ${currentPlatform === 'google' ? `
                <div id="google-warning" class="platform-warning" style="margin-bottom: 15px; padding: 10px; background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px;">
                    <p style="color: #f59e0b; margin: 0; font-size: 14px;">${$t('googleWarning')}</p>
                </div>
                ` : ''}

                ${fieldsHtml}

                <div class="form-actions" style="margin-top: auto; padding-top: 15px;">
                    <button id="btn-clear" class="btn-clear" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); margin-right: auto;">${$t('clearAllConfig')}</button>
                    <button id="btn-backup" class="btn-backup" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3); margin-right: 8px;">${$t('backupPlatformInfo')}</button>
                    <button id="btn-import" class="btn-import" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3); margin-right: 8px;">${$t('importPlatformInfo')}</button>
                    <button id="btn-save" class="btn-save">${$t('saveConfig')}</button>
                </div>
            </div>
        `;
    }

    function render() {
        dialog.innerHTML = `
            ${StyleManager.getUniqueStyles(uniqueId)}
            <div id="${uniqueId}">
                <div class="ui-header">
                    <h1 class="ui-title">${$t('title')}</h1>
                    <button id="close-button" class="close-button" type="button"></button>
                </div>
                <div class="ui-content">
                    ${renderPlatformTabs()}
                    <div class="tab-content">
                        ${renderPlatformConfig()}
                    </div>
                </div>
            </div>
        `;
    }

    function attachEvents() {
        const locale = getLocale();
        const googleTranslate = locale === 'zh' ? "谷歌翻译" : "Google Translate";
        
        dialog.querySelectorAll(".tab-item").forEach(item => {
            item.addEventListener("click", (e) => {
                const platform = e.currentTarget.dataset.platform;
                if (platform !== currentPlatform) {
                    currentPlatform = platform;
                    render();
                    attachEvents();
                }
            });
        });

        const platformSelect = dialog.querySelector('#field-platform');
        if (platformSelect && currentPlatform === 'google') {
            platformSelect.addEventListener('change', (e) => {
            });
        }


        dialog.querySelector("#close-button").addEventListener("click", closeDialog);

        dialog.querySelectorAll(".password-toggle-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const fieldName = this.dataset.field;
                const input = dialog.querySelector(`#field-${fieldName}`);
                if (input) {
                    if (input.type === "password") {
                        input.type = "text";
                        this.textContent = "👁️";
                        this.title = $t('hidePassword');
                    } else {
                        input.type = "password";
                        this.textContent = "🙈";
                        this.title = $t('showPassword');
                    }
                }
            });
        });

        dialog.querySelector("#btn-save").addEventListener("click", async () => {
            const fields = getPlatformFields(currentPlatform);
            const platformData = currentConfig.platforms[currentPlatform];
            
            fields.forEach(field => {
                const element = dialog.querySelector(`#field-${field.name}`);
                if (element) {
                    platformData.config[field.name] = element.value;
                }
            });

            const success = await saveConfig(currentConfig);
            const platformNames = {
                baidu: $t('baidu'),
                tencent: $t('tencent'),
                aliyun: $t('aliyun'),
                youdao: $t('youdao'),
                zhipu: $t('zhipu'),
                google: $t('google')
            };
            const platformDisplayName = platformNames[currentPlatform] || currentPlatform;
            
            if (success) {
                showPopupNotification(`✅ ${platformDisplayName}${$t('saveSuccess')}`, "success");
            } else {
                showPopupNotification(`❌ ${platformDisplayName}${$t('saveFailed')}`, "error");
            }
        });

        dialog.querySelector("#btn-clear").addEventListener("click", async () => {
            if (!confirm($t('confirmClear'))) {
                return;
            }

            const success = await clearConfig();
            
            if (success) {
                dialog.querySelectorAll("input, select, textarea").forEach(element => {
                    if (element.type === "select-one") {
                        element.selectedIndex = 0;
                    } else {
                        element.value = "";
                    }
                });
                
                const config = await loadConfig();
                if (config) {
                    currentConfig = config;
                }
                
                showPopupNotification($t('clearSuccess'), "success");
            } else {
                showPopupNotification($t('clearFailed'), "error");
            }
        });

        dialog.querySelector("#btn-backup").addEventListener("click", async () => {
            try {
                const config = await loadConfig();
                if (config && config.platforms) {
                    const backupData = JSON.stringify(config, null, 2);
                    const blob = new Blob([backupData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `translate-config-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showPopupNotification($t('backupSuccess'), "success");
                } else {
                    showPopupNotification($t('noBackupData'), "error");
                }
            } catch (error) {
                console.error('备份失败:', error);
                showPopupNotification($t('backupFailed'), "error");
            }
        });

        dialog.querySelector("#btn-import").addEventListener("click", async () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const importedConfig = JSON.parse(text);
                    
                    if (importedConfig && importedConfig.platforms) {
                        const validPlatforms = ['baidu', 'tencent', 'aliyun', 'youdao', 'zhipu', 'google'];
                        let hasValidConfig = false;
                        
                        for (const platform of validPlatforms) {
                            if (importedConfig.platforms[platform] && importedConfig.platforms[platform].config) {
                                hasValidConfig = true;
                                break;
                            }
                        }
                        
                        if (hasValidConfig) {
                            if (confirm($t('confirmImport'))) {
                                const success = await saveConfig(importedConfig);
                                if (success) {
                                    currentConfig = importedConfig;
                                    render();
                                    attachEvents();
                                    showPopupNotification($t('importSuccess'), "success");
                                } else {
                                    showPopupNotification($t('importFailed'), "error");
                                }
                            }
                        } else {
                            showPopupNotification($t('invalidFormat'), "error");
                        }
                    } else {
                        showPopupNotification($t('invalidFormat'), "error");
                    }
                } catch (error) {
                    console.error('导入失败:', error);
                    showPopupNotification($t('importError'), "error");
                }
            };
            input.click();
        });
    }

    function showPopupNotification(message, type) {
        const existingNotification = document.getElementById('translate-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'translate-notification';     
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--comfy-menu-bg);
            border: 2px solid ${type === 'success' ? '#4CAF50' : '#F44336'};
            border-radius: 8px;
            padding: 20px 30px;
            color: var(--input-text);
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.3s ease;
            text-align: center;
        `;
        
        notification.innerHTML = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    function closeDialog() {
        enableMainUIInteraction();
        cleanupModal();
        document.body.removeChild(overlay);
        dialog = null;
        overlay = null;
    }

    render();
    attachEvents();
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    disableMainUIInteraction();
}

app.registerExtension({
    name: "zhiai_nodes.MultiPlatformTranslate",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "MultiPlatformTranslate") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                const configButton = this.addWidget("button", $t('configButton'), null, () => {
                    openSettings(this);
                });
                
                return r;
            };
        }
    }
});

let dialog = null;
let overlay = null;
let keyboardBlockHandler = null;
let uniqueId = 'zhiai-translate-settings-' + Math.random().toString(36).substr(2, 9);

function disableMainUIInteraction() {
    let modalOverlay = document.getElementById('translate-settings-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'translate-settings-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9998;
            pointer-events: all;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            transition: opacity 0.2s ease-in-out;
        `;
        
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        document.body.appendChild(modalOverlay);
    }
    
    modalOverlay.style.opacity = '0';
    modalOverlay.style.display = 'block';
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
    }, 10);
    
    const interactiveElements = document.querySelectorAll(
        'button:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), input:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), select:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), textarea:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), a[href]:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), [onclick]:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), [contenteditable="true"]:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore])'
    );
    
    interactiveElements.forEach(element => {
        if (!dialog || !dialog.contains(element)) {
            element.dataset.originalTabIndex = element.tabIndex;
            element.dataset.originalPointerEvents = element.style.pointerEvents;
            element.dataset.originalUserSelect = element.style.userSelect;
            
            element.tabIndex = -1;
            element.style.pointerEvents = 'none';
            element.style.userSelect = 'none';
            
            if (element.tagName === 'BUTTON' || element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                element.dataset.originalDisabled = element.disabled;
                element.disabled = true;
            }
            
            element.dataset.translateSettingsDisabled = 'true';
        }
    });
    
    if (!keyboardBlockHandler) {
        keyboardBlockHandler = function(e) {
            const target = e.target;
            const isTextInput = target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true'
            );
            
            if (isTextInput && (e.ctrlKey || e.metaKey)) {
                const allowedKeys = ['c', 'v', 'x', 'a', 'z'];
                if (allowedKeys.includes(e.key.toLowerCase())) {
                    return true;
                }
            }
            
            if (e.ctrlKey || e.metaKey) {
                const blockedKeys = ['s', 'o', 'n', 'r', 'y'];
                if (blockedKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
            
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            if (e.key === 'F5') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        document.addEventListener('keydown', keyboardBlockHandler, true);
    }
}

function enableMainUIInteraction() {
    const modalOverlay = document.getElementById('translate-settings-modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.opacity = '0';
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 200);
    }
    
    const interactiveElements = document.querySelectorAll('[data-translate-settings-disabled="true"]');
    
    interactiveElements.forEach(element => {
        if (element.dataset.originalTabIndex !== undefined) {
            element.tabIndex = element.dataset.originalTabIndex;
            delete element.dataset.originalTabIndex;
        }
        
        if (element.dataset.originalPointerEvents !== undefined) {
            element.style.pointerEvents = element.dataset.originalPointerEvents;
            delete element.dataset.originalPointerEvents;
        }
        
        if (element.dataset.originalUserSelect !== undefined) {
            element.style.userSelect = element.dataset.originalUserSelect;
            delete element.dataset.originalUserSelect;
        }
        
        if (element.dataset.originalDisabled !== undefined) {
            element.disabled = element.dataset.originalDisabled === 'true';
            delete element.dataset.originalDisabled;
        }
        
        delete element.dataset.translateSettingsDisabled;
    });
    
    if (keyboardBlockHandler) {
        document.removeEventListener('keydown', keyboardBlockHandler, true);
        keyboardBlockHandler = null;
    }
}

function cleanupModal() {
    const modalOverlay = document.getElementById('translate-settings-modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
    
    const disabledElements = document.querySelectorAll('[data-translate-settings-disabled="true"]');
    disabledElements.forEach(element => {
        if (element.dataset.originalTabIndex !== undefined) {
            element.tabIndex = element.dataset.originalTabIndex;
        }
        if (element.dataset.originalPointerEvents !== undefined) {
            element.style.pointerEvents = element.dataset.originalPointerEvents;
        }
        if (element.dataset.originalUserSelect !== undefined) {
            element.style.userSelect = element.dataset.originalUserSelect;
        }
        if (element.dataset.originalDisabled !== undefined) {
            element.disabled = element.dataset.originalDisabled === 'true';
        }
        
        delete element.dataset.originalTabIndex;
        delete element.dataset.originalPointerEvents;
        delete element.dataset.originalUserSelect;
        delete element.dataset.originalDisabled;
        delete element.dataset.translateSettingsDisabled;
    });
    
    if (keyboardBlockHandler) {
        document.removeEventListener('keydown', keyboardBlockHandler, true);
        keyboardBlockHandler = null;
    }
}

window.addEventListener('beforeunload', cleanupModal);
window.addEventListener('pagehide', cleanupModal);