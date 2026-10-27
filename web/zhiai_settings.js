import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const i18n = {
    zh: {
        title: "📝 ZhiAI API 配置",
        providerSelection: "服务商选择",
        configTitle: "配置",
        apiKey: "API Key:",
        apiKeyPlaceholder: "请输入 API Key",
        baseUrl: "Base URL:",
        apiUrl: "API URL:",
        apiUrlPlaceholder: "https://your-api-endpoint.com/chat/completions",
        model: "模型:",
        customModel: "自定义模型",
        modelName: "模型名称:",
        modelNamePlaceholder: "请输入自定义模型名称",
        saveConfig: "💾 保存配置",
        resetDefault: "🔄 重置为默认",
        testConnection: "🔌 测试连接",
        website: "🌐 官网",
        docs: "📚 文档",
        settingsCategory: "ZhiAI",
        settingsName: "配置 ZhiAI API 设置",
        settingsApiConfig: "API 配置",
        settingsNodePlatform: "节点平台选择",
        openSettingsBtn: "📝 API 设置",
        platformDefault: "默认 (自动选择)",
        platformOpenAI: "OpenAI",
        platformGemini: "Google",
        platformZhipu: "智谱AI",
        platformDeepSeek: "深度求索",
        platformSiliconFlow: "硅基流动",
        platformKimi: "月之暗面",
        platformMiniMax: "稀宇科技",
        platformQwen: "阿里云",
        platformOpenRouter: "OpenRouter",
        platformTencent: "腾讯",
        platformNVIDIA: "英伟达",
        platformCustom: "自定义"
    },
    en: {
        title: "📝 ZhiAI API Configuration",
        providerSelection: "Provider Selection",
        configTitle: "Configuration",
        apiKey: "API Key:",
        apiKeyPlaceholder: "Enter API Key",
        baseUrl: "Base URL:",
        apiUrl: "API URL:",
        apiUrlPlaceholder: "https://your-api-endpoint.com/chat/completions",
        model: "Model:",
        customModel: "Custom Model",
        modelName: "Model Name:",
        modelNamePlaceholder: "Enter custom model name",
        saveConfig: "💾 Save Configuration",
        resetDefault: "🔄 Reset to Default",
        testConnection: "🔌 Test Connection",
        website: "🌐 Website",
        docs: "📚 Documentation",
        settingsCategory: "ZhiAI",
        settingsName: "Configure ZhiAI API Settings",
        settingsApiConfig: "API Configuration",
        settingsNodePlatform: "Node Platform Selection",
        openSettingsBtn: "📝 API Settings",
        platformDefault: "Default (Auto Select)",
        platformOpenAI: "OpenAI",
        platformGemini: "Google",
        platformZhipu: "ZhipuAI",
        platformDeepSeek: "DeepSeek",
        platformSiliconFlow: "SiliconFlow",
        platformKimi: "MoonshotAI",
        platformMiniMax: "MiniMax",
        platformQwen: "Alibaba",
        platformOpenRouter: "OpenRouter",
        platformTencent: "Tencent",
        platformNVIDIA: "NVIDIA",
        platformCustom: "User-defined"
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
            base: "position:relative;width:1000px;max-height:90vh;height:520px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);padding:0;color:#f8fafc;z-index:10002;display:block;opacity:1;visibility:visible;pointer-events:auto;",
            overlay: "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:10001;display:flex;align-items:center;justify-content:center;",
            input: "background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:6px; padding:6px 12px; font-size:14px; transition:all .2s ease; height:32px; flex:1;",
            button: "border:none; border-radius:6px; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s ease;",
            buttonPrimary: "background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:white; box-shadow:0 2px 6px rgba(59, 130, 246, 0.3);",
            buttonSuccess: "background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; box-shadow:0 2px 6px rgba(16, 185, 129, 0.3);",
            buttonDanger: "background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff;",
            select: "background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:6px; padding:6px 12px; font-size:14px; transition:all .2s ease; appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:36px;",
            label: "font-size:13px; font-weight:600; color:#f8fafc; min-width:100px; text-align:right;"
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
                    padding:12px 16px; 
                    background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
                    border-bottom:1px solid #1e293b; 
                    border-radius: 12px 12px 0 0;
                }
                
                #${uniqueId} .ui-title { 
                    font-size:18px; 
                    font-weight:700; 
                    color:#f0f0f0;
                    letter-spacing:0.3px;
                    margin:0;
                }
                
                #${uniqueId} .close-button { 
                    width:28px; 
                    height:28px; 
                    border-radius:6px; 
                    border:1px solid rgba(220, 38, 38, 0.5); 
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                    cursor:pointer; 
                    display:inline-flex; 
                    align-items:center; 
                    justify-content:center; 
                    transition:all .2s ease; 
                }
                
                #${uniqueId} .close-button::before { 
                    content:"×"; 
                    color:#ffffff; 
                    font-size:20px; 
                    line-height:1; 
                }
                
                #${uniqueId} .close-button:hover { 
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    transform: scale(1.05);
                }
                
                #${uniqueId} .ui-content {
                    display:flex; 
                    flex-direction:column; 
                    padding:16px; 
                    overflow-y:auto; 
                    overflow-x:hidden; 
                    flex:1; 
                }
                
                #${uniqueId} .platform-tabs {
                    display:flex; 
                    flex-direction:column; 
                    gap:4px; 
                    margin-bottom:20px; 
                    border-radius:8px; 
                    overflow-x:hidden;
                    overflow-y:hidden;
                    padding:12px 16px;
                    height:auto;
                    background:#1e3a8a;
                    border:1px solid #3b82f6;
                }
                
                #${uniqueId} .platform-tabs-header {
                    font-size:16px; 
                    font-weight:600; 
                    color:#f8fafc; 
                    text-transform:uppercase; 
                    letter-spacing:0.5px; 
                    margin:0;
                    padding:0 4px 8px 4px;
                    border-bottom:1px solid rgba(59, 130, 246, 0.3);
                }
                
                #${uniqueId} .platform-tabs-content {
                    display:flex; 
                    gap:4px; 
                    overflow-x:auto;
                    padding:8px 16px 8px 0;
                    min-height:40px;
                }
                
                #${uniqueId} .platform-tabs-content::-webkit-scrollbar {
                    height:8px;
                }
                
                #${uniqueId} .platform-tabs-content::-webkit-scrollbar-track {
                    background:#1e3a8a;
                    border-radius:4px;
                }
                
                #${uniqueId} .platform-tabs-content::-webkit-scrollbar-thumb {
                    background:#3b82f6;
                    border-radius:4px;
                }
                
                #${uniqueId} .platform-tabs-content::-webkit-scrollbar-thumb:hover {
                    background:#60a5fa;
                }
                
                #${uniqueId} .tab-item {
                    padding:8px 14px; 
                    border-radius:6px; 
                    cursor:pointer; 
                    font-size:14px; 
                    font-weight:500; 
                    transition:all .2s ease; 
                    white-space:nowrap;
                    border:1px solid #3b82f6;
                    background:#1e3a8a;
                    color:#93c5fd;
                    min-width:auto;
                    text-align:left;
                    flex-shrink:0;
                }
                
                #${uniqueId} .tab-item:hover {
                    background:#2563eb;
                }
                
                #${uniqueId} .tab-item.active {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color:white;
                    border-color:#3b82f6;
                }
                
                #${uniqueId} .tab-content {
                    flex:1;
                    overflow-y:auto;
                }
                
                #${uniqueId} .platform-config {
                    display:none;
                }
                
                #${uniqueId} .platform-config.active {
                    display:block;
                }
                
                #${uniqueId} .config-header {
                    display:flex; 
                    align-items:center; 
                    justify-content:space-between; 
                    margin-bottom:12px; 
                    padding-bottom:12px; 
                    border-bottom:1px solid #1e293b;
                }
                
                #${uniqueId} .platform-description {
                    margin-bottom:16px;
                    padding:12px 16px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border-left: 3px solid #3b82f6;
                    border-radius: 6px;
                }
                
                #${uniqueId} .description-content {
                    font-size: 13px;
                    color: #94a3b8;
                    line-height: 1.6;
                }
                
                #${uniqueId} .config-header-left {
                    display:flex; 
                    align-items:center; 
                    gap:12px;
                }
                
                #${uniqueId} .config-title {
                    font-size:16px; 
                    font-weight:600; 
                    color:#f8fafc;
                    margin:0;
                }
                
                #${uniqueId} .api-url-links {
                    display:flex; 
                    gap:12px; 
                    align-items:center;
                }
                
                #${uniqueId} .api-url-link {
                    font-size:13px; 
                    color:#3b82f6; 
                    text-decoration:none; 
                    display:flex; 
                    align-items:center; 
                    gap:4px; 
                    transition:all .2s ease;
                    white-space:nowrap;
                }
                
                #${uniqueId} .api-url-link:hover {
                    color:#60a5fa;
                    text-decoration:underline;
                }
                
                #${uniqueId} .config-form {
                    display:flex; 
                    flex-direction:column; 
                    gap:12px;
                }
                
                #${uniqueId} .form-row {
                    display:flex; 
                    gap:12px; 
                    align-items:flex-start;
                }
                
                #${uniqueId} .form-row label {
                    font-size:13px; 
                    font-weight:600; 
                    color:#f8fafc; 
                    min-width:100px; 
                    text-align:right;
                    display:flex;
                    align-items:center;
                }
                
                #${uniqueId} .form-row input,
                #${uniqueId} .form-row select {
                    flex:1;
                }
                
                #${uniqueId} .custom-model-input {
                    display:none;
                }
                
                #${uniqueId} .custom-model-input.visible {
                    display:block;
                }
                
                #${uniqueId} .form-row-with-custom {
                    display:flex; 
                    gap:12px; 
                    align-items:flex-start;
                }
                
                #${uniqueId} .form-row-with-custom .form-row {
                    flex:1;
                    display:flex; 
                    gap:12px; 
                    align-items:flex-start;
                }
                
                #${uniqueId} .form-row-with-custom .custom-model-input {
                    flex:1;
                    margin-top:0;
                }
                
                #${uniqueId} .test-result {
                    padding:8px 12px; 
                    border-radius:6px; 
                    font-size:13px; 
                    font-weight:500; 
                    margin:8px 0;
                    display:none;
                }
                
                #${uniqueId} .test-result.success {
                    display:block;
                    background:rgba(16, 185, 129, 0.1);
                    border:1px solid rgba(16, 185, 129, 0.3);
                    color:#4ade80;
                }
                
                #${uniqueId} .test-result.error {
                    display:block;
                    background:rgba(220, 38, 38, 0.1);
                    border:1px solid rgba(220, 38, 38, 0.3);
                    color:#f87171;
                }
                
                #${uniqueId} .form-actions {
                    display:flex; 
                    gap:12px; 
                    margin-top:16px; 
                    padding-top:16px; 
                    border-top:1px solid #1e293b;
                }
                
                #${uniqueId} .btn-reset {
                    padding:8px 16px; 
                    border-radius:6px; 
                    font-size:14px; 
                    font-weight:600; 
                    cursor:pointer; 
                    transition:all .2s ease;
                    border:none;
                    display:inline-flex;
                    align-items:center;
                    gap:6px;
                    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                    color:white;
                    box-shadow:0 2px 6px rgba(100, 116, 139, 0.3);
                }
                
                #${uniqueId} .btn-reset:hover {
                    transform:translateY(-1px);
                    box-shadow:0 4px 12px rgba(100, 116, 139, 0.4);
                }
                
                #${uniqueId} .btn-test,
                #${uniqueId} .btn-save {
                    padding:8px 16px; 
                    border-radius:6px; 
                    font-size:14px; 
                    font-weight:600; 
                    cursor:pointer; 
                    transition:all .2s ease;
                    border:none;
                    display:inline-flex;
                    align-items:center;
                    gap:6px;
                }
                
                #${uniqueId} .btn-test {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color:white;
                    box-shadow:0 2px 6px rgba(59, 130, 246, 0.3);
                }
                
                #${uniqueId} .btn-test:hover {
                    transform:translateY(-1px);
                    box-shadow:0 4px 12px rgba(59, 130, 246, 0.4);
                }
                
                #${uniqueId} .btn-save {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color:white;
                    box-shadow:0 2px 6px rgba(16, 185, 129, 0.3);
                }
                
                #${uniqueId} .btn-save:hover {
                    transform:translateY(-1px);
                    box-shadow:0 4px 12px rgba(16, 185, 129, 0.4);
                }
                
                #${uniqueId} .btn-test:disabled,
                #${uniqueId} .btn-save:disabled,
                #${uniqueId} .btn-reset:disabled {
                    opacity:0.6;
                    cursor:not-allowed;
                    transform:none;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar {
                    height:8px;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar-track {
                    background:#1e3a8a;
                    border-radius:4px;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar-thumb {
                    background:#3b82f6;
                    border-radius:4px;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar-thumb:hover {
                    background:#60a5fa;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar {
                    width:8px;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-track {
                    background:#1e3a8a;
                    border-radius:4px;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-thumb {
                    background:#3b82f6;
                    border-radius:4px;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-thumb:hover {
                    background:#60a5fa;
                }
            </style>
        `;
    }
};

const platformDefaults = {
    openai: { base_url: "https://api.openai.com/v1", model: "gpt-4o-mini" },
    gemini: { base_url: "https://generativelanguage.googleapis.com", model: "gemini-1.5-flash" },
    zhipu: { base_url: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4-flash" },
    deepseek: { base_url: "https://api.deepseek.com", model: "deepseek-chat" },
    siliconflow: { base_url: "https://api.siliconflow.cn/v1", model: "Qwen/Qwen2.5-7B-Instruct" },
    kimi: { base_url: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
    minimax: { base_url: "https://api.minimaxi.com/v1", model: "MiniMax-M2.5" },
    qwen: { base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-turbo" },
    volcengine: { base_url: "https://ark.cn-beijing.volces.com/api/v3", model: "doubao-1-5-pro-32k" },
    tencent: { base_url: "https://api.hunyuan.cloud.tencent.com/v1", model: "hunyuan-pro" },
    modelscope: { base_url: "https://api-inference.modelscope.cn/v1", model: "qwen/qwen-max" },
    openrouter: { base_url: "https://openrouter.ai/api/v1", model: "google/gemini-flash-1.5" },
    nvidia: { base_url: "https://integrate.api.nvidia.com/v1", model: "nvidia/llama-3.1-nemotron-70b-instruct" },
    custom: { base_url: "", model: "", api_url: "" }
};

const platformModels = {
    openai: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    gemini: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"],
    zhipu: ["glm-4-flash", "glm-4-flashx", "glm-4-long", "glm-4-plus"],
    deepseek: ["deepseek-chat", "deepseek-coder"],
    siliconflow: ["Qwen/Qwen2.5-7B-Instruct", "Qwen/Qwen2-7B-Instruct", "THUDM/glm-4-9b-chat"],
    kimi: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
    minimax: ["MiniMax-M2.5", "MiniMax-M2.5-highspeed", "MiniMax-M2.1", "MiniMax-M2.1-highspeed", "MiniMax-M2"],
    qwen: ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-long"],
    volcengine: ["doubao-1-5-pro-32k", "doubao-1-5-pro", "doubao-1-5-lite", "doubao-1-5-pro-256k"],
    tencent: ["hunyuan-pro", "hunyuan-standard", "hunyuan-lite", "hunyuan-turbo"],
    modelscope: ["qwen/qwen-max", "qwen/qwen-plus", "qwen/qwen-turbo", "qwen/qwen-long"],
    openrouter: [
        "google/gemini-flash-1.5",
        "google/gemini-2.0-flash-exp:free",
        "google/gemini-2.0-flash-thinking-exp:free",
        "google/learnlm-1.5-pro-experimental:free",
        "google/gemini-flash-1.5-8b",
        "meta-llama/llama-3.2-1b-instruct:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "mistralai/mistral-nemo:free",
        "deepseek/deepseek-chat:free",
        "deepseek/deepseek-r1:free",
        "huggingfaceh4/zephyr-7b-beta:free",
        "microsoft/phi-3-mini-128k-instruct:free",
        "microsoft/phi-3-medium-128k-instruct:free",
        "qwen/qwen-2.5-72b-instruct:free",
        "qwen/qwen-2.5-vl-72b-instruct:free",
        "nvidia/llama-3.1-nemotron-70b-instruct:free",
        "sophosympatheia/rogue-rose-103b-v0.2:free",
        "open-r1/olympiccoder-7b:free",
        "open-r1/olympiccoder-32b:free",
        "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
        "cognitivecomputations/dolphin3.0-mistral-24b:free",
        "moonshotai/moonlight-16b-a3b-instruct:free"
    ],
    nvidia: [
        "nvidia/llama-3.1-nemotron-70b-instruct",
        "nvidia/llama-3.1-nemotron-51b-instruct",
        "nvidia/llama-3.3-nemotron-super-49b-v1",
        "nvidia/llama-3.1-nemotron-ultra-253b-v1",
        "meta/llama-3.1-405b-instruct",
        "meta/llama-3.3-70b-instruct",
        "meta/llama-3.1-70b-instruct",
        "meta/llama-3.1-8b-instruct",
        "mistralai/mistral-large-2-instruct",
        "mistralai/mixtral-8x22b-instruct-v0.1",
        "mistralai/mistral-7b-instruct-v0.3",
        "google/gemma-2-27b-it",
        "google/gemma-2-9b-it",
        "google/codegemma-7b",
        "microsoft/phi-4",
        "microsoft/phi-3.5-mini",
        "microsoft/phi-3-medium",
        "qwen/qwen2.5-72b-instruct",
        "qwen/qwen2.5-7b-instruct",
        "qwen/qwen2.5-coder-32b-instruct",
        "deepseek-ai/deepseek-r1"
    ],
    custom: []
};

function getPlatformUrl(platform) {
    const urls = {
        openai: { website: "https://platform.openai.com", docs: "https://platform.openai.com/docs" },
        gemini: { website: "https://gemini.google.com", docs: "https://ai.google.dev/gemini-api/docs" },
        zhipu: { website: "https://open.bigmodel.cn", docs: "https://open.bigmodel.cn/dev/api" },
        deepseek: { website: "https://deepseek.com", docs: "https://api-docs.deepseek.com" },
        siliconflow: { website: "https://siliconflow.cn", docs: "https://docs.siliconflow.cn" },
        kimi: { website: "https://moonshot.cn", docs: "https://platform.moonshot.cn/docs" },
        minimax: { website: "https://minimax.io", docs: "https://platform.minimax.io/docs" },
        qwen: { website: "https://www.aliyun.com/product/bailian", docs: "https://help.aliyun.com/zh/dashscope" },
        volcengine: { website: "https://volcengine.com", docs: "https://www.volcengine.com/docs" },
        tencent: { website: "https://cloud.tencent.com", docs: "https://cloud.tencent.com/document/product" },
        modelscope: { website: "https://modelscope.cn", docs: "https://modelscope.cn/docs" },
        openrouter: { website: "https://openrouter.ai", docs: "https://openrouter.ai/docs" },
        nvidia: { website: "https://www.nvidia.com/en-us/ai/", docs: "https://docs.nvidia.com/nim/" },
        custom: { website: "", docs: "" }
    };
    return urls[platform] || { website: "", docs: "" };
}

function getPlatformDescription(platform) {
    const descriptions = {
        zh: {
            openai: "OpenAI 是全球领先的 AI 研究公司，提供 GPT 系列大语言模型。GPT-4o 系列模型在理解、生成、推理等方面表现卓越，支持多模态输入。适合需要高质量文本生成的专业场景，API 稳定可靠，文档完善。",
            gemini: "Gemini 是 Google DeepMind 开发的多模态大模型，支持文本、图像、音频、视频等多种输入。Gemini 1.5 Flash 具备 100 万 token 超长上下文，在推理、数学、编程等任务中表现突出，API 免费额度充足。",
            zhipu: "智谱 AI 的 GLM 系列是国内领先的通用大语言模型，采用自主的 GLM 架构。GLM-4-Flash 免费且速度快，GLM-4-Plus 性能强劲。支持长文本（最高 128K），在中文理解和生成方面表现出色，适合国内用户使用。",
            deepseek: "DeepSeek 是深度求索开发的国产大模型，以极高的性价比著称。DeepSeek-V3 性能接近 GPT-4，价格仅为 1/10。在代码生成、数学推理、中文理解方面表现优秀，支持 64K 上下文，是开发者的经济之选。",
            siliconflow: "SiliconFlow 硅基流动提供丰富的开源模型 API 服务，支持 Qwen、GLM、Llama 等国内外优质开源模型。平台稳定，价格透明，适合需要灵活切换模型的用户，新用户享有免费调用额度。",
            kimi: "月之暗面 Kimi 是国内首个支持超长上下文的大模型，最高支持 200 万字（约 20 万 token）上下文窗口。在长篇小说分析、大量文档处理、代码库理解等场景具有独特优势，中文处理能力出色。",
            minimax: "MiniMax 是国内领先的通用大模型，由稀宇科技开发。abab 系列模型在中文理解和生成方面表现优异，支持多轮对话和复杂任务处理。API 响应速度快，价格具有竞争力，适合中文应用场景。",
            qwen: "阿里云通义千问是国内领先的大语言模型系列，包括 qwen-turbo、qwen-plus、qwen-max 等多个版本。新用户开通即享超 7000 万免费 token。模型在中文理解、代码生成、数学推理等方面表现优异，与阿里云生态深度整合。",
            volcengine: "火山引擎是字节跳动旗下的云服务平台，提供豆包（Doubao）系列大模型 API 服务。豆包 1.5 Pro 在中文对话、内容创作、知识问答等场景表现出色，依托字节跳动强大的基础设施，API 稳定快速。",
            tencent: "腾讯云混元大模型是腾讯自研的万亿参数通用大语言模型，在中文场景下表现优异。混元 Pro 版本在内容创作、知识推理、数学计算等方面能力突出，与腾讯云服务深度整合，企业级稳定性保障。",
            modelscope: "魔搭社区 ModelScope 是阿里云旗下的 AI 模型社区，提供丰富的开源模型 API 服务。支持 Qwen、Llama、ChatGLM 等国内外主流模型，方便开发者快速体验和集成各种开源大模型能力。",
            openrouter: "OpenRouter 是一个统一的 AI 模型 API 网关，提供对 200+ 种大模型的访问。支持 OpenAI、Anthropic、Google、Meta 等厂商的模型，包括大量免费模型。一个 API Key 即可调用多种模型，灵活方便。",
            nvidia: "NVIDIA NIM 提供高性能的生成式 AI 模型推理服务，支持 Llama、Mistral、Qwen、DeepSeek 等主流开源模型。基于 NVIDIA GPU 加速，推理速度快、延迟低。新用户注册即可获得 1000 次免费调用额度。",
            custom: "自定义 API 配置支持任意兼容 OpenAI 格式的 API 端点。可配置第三方 API 服务或私有化部署的模型，只需填写 API 地址、密钥和模型名称即可使用，满足个性化需求。"
        },
        en: {
            openai: "OpenAI is a leading AI research company offering the GPT series of large language models. The GPT-4o series excels in understanding, generation, and reasoning, with multimodal input support. Ideal for professional scenarios requiring high-quality text generation, with stable APIs and comprehensive documentation.",
            gemini: "Gemini is a multimodal large model developed by Google DeepMind, supporting text, images, audio, and video inputs. Gemini 1.5 Flash features 1M token ultra-long context, outstanding in reasoning, math, and programming tasks, with generous free API quotas.",
            zhipu: "Zhipu AI's GLM series is a leading domestic general-purpose LLM with proprietary GLM architecture. GLM-4-Flash is free and fast, while GLM-4-Plus offers powerful performance. Supports long text (up to 128K), excellent in Chinese understanding and generation.",
            deepseek: "DeepSeek is a domestic model developed by DeepSeek, known for exceptional cost-performance. DeepSeek-V3 rivals GPT-4 at 1/10 the price. Excellent in code generation, math reasoning, and Chinese understanding, with 64K context support.",
            siliconflow: "SiliconFlow offers rich open-source model API services, supporting Qwen, GLM, Llama and other quality models. Stable platform with transparent pricing, suitable for users needing flexible model switching, with free quotas for new users.",
            kimi: "Moonshot AI's Kimi is the first domestic model supporting ultra-long context, up to 2 million characters (200K tokens). Unique advantages in long novel analysis, bulk document processing, and code repository understanding, with excellent Chinese processing.",
            minimax: "MiniMax is a leading domestic general-purpose model developed by Xiyu Technology. The abab series excels in Chinese understanding and generation, supporting multi-turn dialogue and complex tasks. Fast API response with competitive pricing.",
            qwen: "Alibaba Cloud's Tongyi Qwen is a leading LLM series including qwen-turbo, qwen-plus, qwen-max and more. New users get 70M+ free tokens. Excellent in Chinese understanding, code generation, and math reasoning, deeply integrated with Alibaba Cloud ecosystem.",
            volcengine: "VolcEngine is ByteDance's cloud service platform offering Doubao series LLM APIs. Doubao 1.5 Pro excels in Chinese dialogue, content creation, and Q&A, backed by ByteDance's robust infrastructure for stable, fast APIs.",
            tencent: "Tencent Cloud's Hunyuan is a trillion-parameter general LLM self-developed by Tencent, excelling in Chinese scenarios. Hunyuan Pro features strong content creation, knowledge reasoning, and math capabilities, with enterprise-grade stability.",
            modelscope: "ModelScope is Alibaba Cloud's AI model community offering rich open-source model APIs. Supports Qwen, Llama, ChatGLM and other mainstream models, enabling developers to quickly experience and integrate open-source LLM capabilities.",
            openrouter: "OpenRouter is a unified AI model API gateway providing access to 200+ models. Supports models from OpenAI, Anthropic, Google, Meta and more, including many free models. One API Key accesses multiple models flexibly.",
            nvidia: "NVIDIA NIM provides high-performance generative AI model inference services, supporting Llama, Mistral, Qwen, DeepSeek and other mainstream open-source models. Powered by NVIDIA GPU acceleration for fast inference and low latency. New users get 1000 free API calls upon registration.",
            custom: "Custom API configuration supports any OpenAI-compatible API endpoint. Configure third-party API services or privately deployed models by filling in API address, key, and model name to meet personalized needs."
        }
    };
    const locale = getLocale();
    return descriptions[locale]?.[platform] || descriptions['en']?.[platform] || "";
}

async function openSettings() {
    const [configResult, apiKeysResult] = await Promise.all([
        Utils.apiCall("/zhiai_nodes/zhi_ai_config/config", { method: "GET" }),
        Utils.apiCall("/zhiai_nodes/zhi_ai_config/api_keys", { method: "GET" })
    ]);
    
    let cfg = configResult.ok && configResult.data ? configResult.data : null;
    let apiKeys = apiKeysResult.ok && apiKeysResult.data ? apiKeysResult.data : {};
    
    if (!cfg) {
        cfg = {
            platforms: {
                openai: { name: "OpenAI", enabled: true, config: { base_url: "", model: "" } },
                gemini: { name: "Google", enabled: true, config: { base_url: "", model: "" } },
                zhipu: { name: "ZhipuAI", enabled: true, config: { base_url: "", model: "" } },
                deepseek: { name: "DeepSeek", enabled: true, config: { base_url: "", model: "" } },
                siliconflow: { name: "SiliconFlow", enabled: true, config: { base_url: "", model: "" } },
                kimi: { name: "MoonshotAI", enabled: true, config: { base_url: "", model: "" } },
                minimax: { name: "MiniMax", enabled: true, config: { base_url: "", model: "" } },
                qwen: { name: "Alibaba", enabled: true, config: { base_url: "", model: "" } },
                volcengine: { name: "VolcEngine", enabled: true, config: { base_url: "", model: "" } },
                tencent: { name: "Tencent", enabled: true, config: { base_url: "", model: "" } },
                modelscope: { name: "ModelScope", enabled: true, config: { base_url: "", model: "" } },
                nvidia: { name: "NVIDIA", enabled: true, config: { base_url: "", model: "" } },
                custom: { name: "User-defined", enabled: true, config: { base_url: "", model: "", api_url: "" } }
            }
        };
    }

    const overlay = document.createElement("div");
    overlay.style.cssText = StyleManager.getStyles().overlay;
    
    const dialog = document.createElement("div");
    dialog.style.cssText = StyleManager.getStyles().base;
    
    const uniqueId = `prompt-expander-settings-${Math.random().toString(36).substring(2, 9)}`;
    
    const platforms = [
        { key: "openai", name: "OpenAI" },
        { key: "gemini", name: "Google" },
        { key: "zhipu", name: "ZhipuAI" },
        { key: "deepseek", name: "DeepSeek" },
        { key: "siliconflow", name: "SiliconFlow" },
        { key: "kimi", name: "MoonshotAI" },
        { key: "minimax", name: "MiniMax" },
        { key: "qwen", name: "Alibaba" },
        { key: "volcengine", name: "VolcEngine" },
        { key: "tencent", name: "Tencent" },
        { key: "modelscope", name: "ModelScope" },
        { key: "openrouter", name: "OpenRouter" },
        { key: "nvidia", name: "NVIDIA" },
        { key: "custom", name: "User-defined" }
    ];
    
    dialog.innerHTML = `
        ${StyleManager.getUniqueStyles(uniqueId)}
        <div id="${uniqueId}">
            <div class="ui-header">
                <h3 class="ui-title">${$t('title')}</h3>
                <button class="close-button" type="button"></button>
            </div>
            <div class="ui-content">
                <div class="platform-tabs">
                    <div class="platform-tabs-header">${$t('providerSelection')}</div>
                    <div class="platform-tabs-content">
                        ${platforms.map(p => `<div class="tab-item ${p.key === 'openai' ? 'active' : ''}" data-platform="${p.key}">${p.name}</div>`).join('')}
                    </div>
                </div>
                <div class="tab-content">
                    ${platforms.map(p => `
                        <div class="platform-config ${p.key === 'openai' ? 'active' : ''}" id="config-${p.key}">
                            <div class="config-header">
                                <div class="config-header-left">
                                    <h4 class="config-title">${p.name} ${$t('configTitle')}</h4>
                                    ${p.key !== 'custom' ? `
                                    <div class="api-url-links">
                                        <a href="${getPlatformUrl(p.key).website}" target="_blank" class="api-url-link" title="Official Website">${$t('website')}</a>
                                        <a href="${getPlatformUrl(p.key).docs}" target="_blank" class="api-url-link" title="Documentation">${$t('docs')}</a>
                                    </div>` : ''}
                                </div>
                            </div>
                            <div class="platform-description">
                                <div class="description-content">${getPlatformDescription(p.key)}</div>
                            </div>
                            <div class="config-form">
                                <div class="form-row">
                                    <label>${$t('apiKey')}</label>
                                    <input type="password" id="${p.key}-api-key" value="${apiKeys[p.key] || ''}" placeholder="${$t('apiKeyPlaceholder')}">
                                </div>
                                ${p.key !== 'custom' ? `
                                <div class="form-row">
                                    <label>${$t('baseUrl')}</label>
                                    <input type="text" id="${p.key}-base-url" value="${cfg.platforms[p.key]?.config?.base_url || ''}" placeholder="${platformDefaults[p.key].base_url}">
                                </div>
                                ` : `
                                <div class="form-row">
                                    <label>${$t('apiUrl')}</label>
                                    <input type="text" id="${p.key}-api-url" value="${cfg.platforms[p.key]?.config?.api_url || ''}" placeholder="${$t('apiUrlPlaceholder')}">
                                </div>
                                `}
                                <div class="form-row-with-custom">
                                    <div class="form-row">
                                        <label>${$t('model')}</label>
                                        <select id="${p.key}-model">
                                            ${platformModels[p.key].map(m => `<option value="${m}" ${cfg.platforms[p.key]?.config?.model === m ? 'selected' : ''}>${m}</option>`).join('')}
                                            <option value="__custom__" ${cfg.platforms[p.key]?.config?.model && !platformModels[p.key].includes(cfg.platforms[p.key]?.config?.model) ? 'selected' : ''}>${$t('customModel')}</option>
                                        </select>
                                    </div>
                                    <div class="custom-model-input" id="${p.key}-custom-model-input">
                                        <div class="form-row">
                                            <label>${$t('modelName')}</label>
                                            <input type="text" id="${p.key}-custom-model" value="${cfg.platforms[p.key]?.config?.model && !platformModels[p.key].includes(cfg.platforms[p.key]?.config?.model) ? cfg.platforms[p.key]?.config?.model : ''}" placeholder="${$t('modelNamePlaceholder')}">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button class="btn-save" data-platform="${p.key}">${$t('saveConfig')}</button>
                                <button class="btn-reset" data-platform="${p.key}">${$t('resetDefault')}</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    const close = () => {
        if (overlay.parentNode) document.body.removeChild(overlay);
        if (dialog.parentNode) document.body.removeChild(dialog);
    };

    const showConfirmDialog = (message, onConfirm, onCancel) => {
        const confirmOverlay = document.createElement('div');
        confirmOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 100001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const confirmBox = document.createElement('div');
        confirmBox.style.cssText = `
            background: var(--comfy-menu-bg);
            border-radius: 12px;
            padding: 24px 32px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid var(--border-color);
        `;
        
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin: 0 0 24px 0;
            font-size: 15px;
            line-height: 1.6;
            color: var(--input-text);
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = getLocale() === 'zh' ? '取消' : 'Cancel';
        cancelBtn.style.cssText = `
            padding: 10px 24px;
            border: 1px solid var(--border-color);
            background: transparent;
            color: var(--input-text);
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        `;
        cancelBtn.onmouseover = () => {
            cancelBtn.style.background = 'var(--comfy-input-bg)';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.background = 'transparent';
        };
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = getLocale() === 'zh' ? '确定重置' : 'Confirm Reset';
        confirmBtn.style.cssText = `
            padding: 10px 24px;
            border: none;
            background: #ef4444;
            color: #fff;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        `;
        confirmBtn.onmouseover = () => {
            confirmBtn.style.background = '#dc2626';
        };
        confirmBtn.onmouseout = () => {
            confirmBtn.style.background = '#ef4444';
        };
        
        cancelBtn.onclick = () => {
            document.body.removeChild(confirmOverlay);
            if (onCancel) onCancel();
        };
        
        confirmBtn.onclick = () => {
            document.body.removeChild(confirmOverlay);
            if (onConfirm) onConfirm();
        };
        
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(confirmBtn);
        confirmBox.appendChild(messageEl);
        confirmBox.appendChild(buttonContainer);
        confirmOverlay.appendChild(confirmBox);
        document.body.appendChild(confirmOverlay);
    };

    const showToast = (success, message) => {
        let toast = document.getElementById('zhiai-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'zhiai-toast';
            toast.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 16px 32px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                z-index: 99999;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.background = success ? 'rgba(16, 185, 129, 0.95)' : 'rgba(220, 38, 38, 0.95)';
        toast.style.color = '#fff';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    };

    dialog.querySelector(".close-button").onclick = close;

    const tabs = dialog.querySelectorAll(".tab-item");
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const platform = tab.dataset.platform;
            dialog.querySelectorAll(".platform-config").forEach(config => {
                config.classList.remove('active');
                if (config.id === `config-${platform}`) {
                    config.classList.add('active');
                }
            });
            const modelSelect = dialog.querySelector(`#${platform}-model`);
            const customInput = dialog.querySelector(`#${platform}-custom-model-input`);
            if (modelSelect && customInput) {
                if (modelSelect.value === '__custom__') {
                    customInput.classList.add('visible');
                } else {
                    customInput.classList.remove('visible');
                }
            }
        };
    });

    dialog.querySelectorAll("select[id$='-model']").forEach(select => {
        select.addEventListener('change', function() {
            const platform = this.id.replace('-model', '');
            const customInput = dialog.querySelector(`#${platform}-custom-model-input`);
            if (customInput) {
                if (this.value === '__custom__') {
                    customInput.classList.add('visible');
                } else {
                    customInput.classList.remove('visible');
                }
            }
        });
    });

    const getPlatformConfig = (platform) => {
        const apiKey = dialog.querySelector(`#${platform}-api-key`).value.trim();
        const modelSelect = dialog.querySelector(`#${platform}-model`);
        const modelValue = modelSelect.value;
        
        let model;
        if (modelValue === '__custom__') {
            model = dialog.querySelector(`#${platform}-custom-model`).value.trim();
        } else {
            model = modelValue;
        }
        
        if (platform === 'custom') {
            const apiUrl = dialog.querySelector(`#${platform}-api-url`).value.trim();
            return { api_key: apiKey, model, api_url: apiUrl };
        } else {
            let baseUrl = dialog.querySelector(`#${platform}-base-url`).value.trim();
            if (!baseUrl) baseUrl = platformDefaults[platform].base_url;
            return { api_key: apiKey, base_url: baseUrl, model };
        }
    };



    dialog.querySelectorAll(".btn-save").forEach(btn => {
        btn.onclick = async () => {
            const platform = btn.dataset.platform;
            const config = getPlatformConfig(platform);
            const apiKey = dialog.querySelector(`#${platform}-api-key`).value.trim();
            
            const [latestConfigResult, latestApiKeysResult] = await Promise.all([
                Utils.apiCall("/zhiai_nodes/zhi_ai_config/config", { method: "GET" }),
                Utils.apiCall("/zhiai_nodes/zhi_ai_config/api_keys", { method: "GET" })
            ]);
            
            let latestCfg = latestConfigResult.ok && latestConfigResult.data ? latestConfigResult.data : cfg;
            let latestApiKeys = latestApiKeysResult.ok && latestApiKeysResult.data ? latestApiKeysResult.data : apiKeys;
            
            if (!latestCfg.platforms) {
                latestCfg.platforms = cfg.platforms;
            }
            
            const { api_key, ...configWithoutApiKey } = config;
            latestCfg.platforms[platform].config = configWithoutApiKey;
            
            latestApiKeys[platform] = apiKey;
            
            const [configResult, apiKeysResult] = await Promise.all([
                Utils.apiCall("/zhiai_nodes/zhi_ai_config/config", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(latestCfg)
                }),
                Utils.apiCall("/zhiai_nodes/zhi_ai_config/api_keys", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(latestApiKeys)
                })
            ]);
            
            const locale = getLocale();
            if (configResult.ok && configResult.data && configResult.data.success &&
                apiKeysResult.ok && apiKeysResult.data && apiKeysResult.data.success) {
                const successMessage = locale === 'zh' ? "配置保存成功" : "Configuration saved successfully";
                showToast(true, successMessage);
            } else {
                const errorMessage = configResult.error || apiKeysResult.error || (locale === 'zh' ? "保存失败" : "Save failed");
                showToast(false, errorMessage);
            }
        };
    });

    dialog.querySelectorAll(".btn-reset").forEach(btn => {
        btn.onclick = async () => {
            const locale = getLocale();
            const confirmMessage = locale === 'zh' ? "确定要重置所有平台的配置吗？这将清空所有API密钥并恢复默认设置。" : "Are you sure you want to reset all platform configurations? This will clear all API keys and restore default settings.";
            const successMessage = locale === 'zh' ? "所有平台配置已重置为默认" : "All platform configurations have been reset to default";
            
            showConfirmDialog(confirmMessage, async () => {
                const emptyApiKeys = {};
                platforms.forEach(p => {
                    const platform = p.key;
                    
                    if (platform === 'custom') {
                        dialog.querySelector(`#${platform}-api-url`).value = '';
                        dialog.querySelector(`#${platform}-model`).value = '';
                        dialog.querySelector(`#${platform}-custom-model`).value = '';
                    } else {
                        dialog.querySelector(`#${platform}-base-url`).value = platformDefaults[platform].base_url;
                        dialog.querySelector(`#${platform}-model`).value = platformDefaults[platform].model;
                        const customInput = dialog.querySelector(`#${platform}-custom-model-input`);
                        if (customInput) {
                            customInput.classList.remove('visible');
                        }
                    }
                    dialog.querySelector(`#${platform}-api-key`).value = '';
                    emptyApiKeys[platform] = '';
                });
                
                await Utils.apiCall("/zhiai_nodes/zhi_ai_config/api_keys", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(emptyApiKeys)
                });
                
                showToast(true, successMessage);
            });
        };
    });

    document.body.appendChild(overlay);
    overlay.appendChild(dialog);
    
    dialog.onclick = (e) => {
        e.stopPropagation();
    };
}

const settingsRegistry = {};

async function registerSettings() {
    if (!app.ui.settings) return;

    settingsRegistry.apiSettings = {
        id: "zhiai_nodes.Settings",
        category: [$t('settingsCategory'), $t('settingsApiConfig')],
        name: $t('settingsName'),
        type: (name, setter, value) => {
            const btn = document.createElement("button");
            btn.textContent = $t('openSettingsBtn');
            btn.style.cssText = "background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;";
            btn.onmouseenter = () => btn.style.transform = "scale(1.02)";
            btn.onmouseleave = () => btn.style.transform = "scale(1)";
            btn.onclick = () => openSettings();
            return btn;
        }
    };

    app.ui.settings.addSetting(settingsRegistry.apiSettings);
}

function refreshSettings() {
    if (!app.ui.settings) return;

    const settingsEl = app.ui.settings.element;
    if (!settingsEl) return;

    const originalScrollTop = settingsEl.scrollTop;

    if (settingsRegistry.apiSettings) {
        app.ui.settings.removeSetting("zhiai_nodes.Settings");
    }

    registerSettings();

    requestAnimationFrame(() => {
        settingsEl.scrollTop = originalScrollTop;
    });
}

function watchLanguageChanges() {
    let lastLocale = getLocale();
    
    const observer = new MutationObserver(() => {
        const currentLocale = getLocale();
        if (currentLocale !== lastLocale) {
            lastLocale = currentLocale;
            refreshSettings();
        }
    });

    if (app.ui?.settings?.element) {
        observer.observe(app.ui.settings.element, { childList: true, subtree: true });
    }

    setInterval(() => {
        const currentLocale = getLocale();
        if (currentLocale !== lastLocale) {
            lastLocale = currentLocale;
            refreshSettings();
        }
    }, 500);
}

app.registerExtension({
    name: "zhiai_nodes.Settings",
    async init() {
        await registerSettings();
        watchLanguageChanges();
    }
});

window.openZhiaiApiSettings = openSettings;