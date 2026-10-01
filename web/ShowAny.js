import { app } from "../../../scripts/app.js";
import { drawNodeHelpButton } from "./node_title_icons.js";

let marked = null;
let markedLoading = false;

async function loadMarked() {
    if (marked) return true;
    if (markedLoading) return false;
    markedLoading = true;
    
    try {
        if (window.marked) {
            marked = window.marked;
            return true;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        
        if (window.marked) {
            marked = window.marked;
            return true;
        }
        return false;
    } catch (e) {
        console.warn("ShowAny: Could not load marked library", e);
        return false;
    }
}

function createStyledRenderer() {
    const renderer = new marked.Renderer();
    
    renderer.heading = function(data) {
        const { tokens, depth } = data;
        const text = this.parser.parseInline(tokens);
        const sizes = { 1: '24px', 2: '20px', 3: '16px', 4: '14px', 5: '13px', 6: '12px' };
        const margins = { 1: '20px 0 12px 0', 2: '16px 0 10px 0', 3: '14px 0 8px 0', 4: '12px 0 6px 0', 5: '10px 0 4px 0', 6: '8px 0 4px 0' };
        return `<h${depth} style="color:#60a5fa;font-size:${sizes[depth] || '12px'};font-weight:${depth <= 2 ? '700' : '600'};margin:${margins[depth] || '8px 0 4px 0'};line-height:1.3;">${text}</h${depth}>`;
    };
    
    renderer.paragraph = function(data) {
        const { tokens } = data;
        return `<p style="margin:8px 0;line-height:1.7;color:#e2e8f0;">${this.parser.parseInline(tokens)}</p>`;
    };
    
    renderer.list = function(data) {
        const { ordered, items, start } = data;
        const tag = ordered ? 'ol' : 'ul';
        const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
        let body = '';
        for (const item of items) {
            body += renderer.listitem(item);
        }
        return `<${tag}${startAttr} style="margin:8px 0;padding-left:20px;list-style:${ordered ? 'decimal' : 'disc'};color:#e2e8f0;">${body}</${tag}>`;
    };
    
    renderer.listitem = function(data) {
        const { tokens, task, checked } = data;
        let item = '';
        if (task) {
            item += `<input type="checkbox" ${checked ? 'checked' : ''} disabled style="margin-right:4px;">`;
        }
        item += renderer.parser.parse(tokens, true);
        return `<li style="margin:4px 0;line-height:1.6;color:#e2e8f0;">${item}</li>`;
    };
    
    renderer.code = function(data) {
        const { text, lang } = data;
        const langClass = lang ? ` class="language-${lang}"` : '';
        return `<pre style="background:rgba(15,23,42,0.8);color:#e2e8f0;padding:12px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:11px;line-height:1.5;margin:8px 0;border:1px solid rgba(96,165,250,0.2);"><code${langClass}>${text}</code></pre>`;
    };
    
    renderer.codespan = function(data) {
        const { text } = data;
        return `<code style="background:rgba(96,165,250,0.15);color:#60a5fa;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:11px;">${text}</code>`;
    };
    
    renderer.strong = function(data) {
        const { tokens } = data;
        return `<strong style="color:#f1f5f9;font-weight:600;">${this.parser.parseInline(tokens)}</strong>`;
    };
    
    renderer.em = function(data) {
        const { tokens } = data;
        return `<em style="color:#cbd5e1;">${this.parser.parseInline(tokens)}</em>`;
    };
    
    renderer.link = function(data) {
        const { href, title, tokens } = data;
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${title}"` : '';
        return `<a href="${href}"${titleAttr} target="_blank" style="color:#60a5fa;text-decoration:none;border-bottom:1px solid rgba(96,165,250,0.4);">${text}</a>`;
    };
    
    renderer.blockquote = function(data) {
        const { tokens } = data;
        const body = this.parser.parse(tokens);
        return `<blockquote style="margin:8px 0;padding:8px 16px;border-left:4px solid #60a5fa;background:rgba(96,165,250,0.1);color:#e2e8f0;">${body}</blockquote>`;
    };
    
    renderer.hr = function() {
        return `<hr style="border:none;border-top:1px solid rgba(96,165,250,0.3);margin:16px 0;">`;
    };
    
    renderer.br = function() {
        return '<br>';
    };
    
    renderer.del = function(data) {
        const { tokens } = data;
        return `<del style="color:#94a3b8;text-decoration:line-through;">${this.parser.parseInline(tokens)}</del>`;
    };
    
    renderer.table = function(data) {
        const { header, rows } = data;
        let head = '<thead><tr>';
        for (const cell of header) {
            head += renderer.tablecell(cell);
        }
        head += '</tr></thead>';
        let body = '<tbody>';
        for (const row of rows) {
            body += '<tr>';
            for (const cell of row) {
                body += renderer.tablecell(cell);
            }
            body += '</tr>';
        }
        body += '</tbody>';
        return `<table style="width:100%;border-collapse:collapse;margin:8px 0;color:#e2e8f0;">${head}${body}</table>`;
    };
    
    renderer.tablecell = function(data) {
        const { tokens, header, align } = data;
        const content = this.parser.parseInline(tokens);
        const tag = header ? 'th' : 'td';
        const alignStyle = align ? `text-align:${align};` : '';
        return `<${tag} style="border:1px solid rgba(96,165,250,0.3);padding:8px;${alignStyle}">${content}</${tag}>`;
    };
    
    return renderer;
}

function parseMarkdownSync(text) {
    if (!marked || !text || typeof text !== 'string') return '';
    
    try {
        const renderer = createStyledRenderer();
        return marked.parse(text, { 
            renderer, 
            gfm: true,
            breaks: true
        });
    } catch (e) {
        console.warn('ShowAny: Markdown parse error', e);
        return escapeHtml(text);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

const i18n = {
    zh: {
        nodeTitle: "ShowAny 节点",
        description: "用于显示任意类型的数据内容。",
        featuresTitle: "功能",
        feature1: "支持显示字符串、数字、数组等多种数据类型",
        feature2: "提供标准模式、排错模式和Markdown模式三种预览模式",
        feature3: "自动处理编码问题",
        usageTitle: "使用说明",
        standardMode: "标准模式",
        standardModeDesc: "直接显示原始内容",
        debugMode: "排错模式",
        debugModeDesc: "自动修复编码问题，适合处理乱码",
        markdownMode: "Markdown模式",
        markdownModeDesc: "解析并渲染Markdown格式的文本",
        inputTitle: "输入",
        inputDesc: "接受任意类型的输入数据",
        outputTitle: "输出",
        outputDesc: "在节点内显示格式化后的内容",
        previewMode: "预览模式：",
        standard: "标准",
        debug: "排错",
        markdown: "Markdown",
        copy: "复制",
        copied: "已复制",
        copyFailed: "复制失败",
        copyEmpty: "暂无内容"
    },
    en: {
        nodeTitle: "ShowAny Node",
        description: "Used to display any type of data content.",
        featuresTitle: "Features",
        feature1: "Supports displaying various data types such as strings, numbers, arrays, etc.",
        feature2: "Provides three preview modes: Standard, Debug and Markdown",
        feature3: "Automatically handles encoding issues",
        usageTitle: "Usage",
        standardMode: "Standard Mode",
        standardModeDesc: "Displays raw content directly",
        debugMode: "Debug Mode",
        debugModeDesc: "Automatically fixes encoding issues, suitable for handling garbled text",
        markdownMode: "Markdown Mode",
        markdownModeDesc: "Parses and renders Markdown formatted text",
        inputTitle: "Input",
        inputDesc: "Accepts any type of input data",
        outputTitle: "Output",
        outputDesc: "Displays formatted content within the node",
        previewMode: "Preview Mode:",
        standard: "Standard",
        debug: "Debug",
        markdown: "Markdown",
        copy: "Copy",
        copied: "Copied",
        copyFailed: "Copy failed",
        copyEmpty: "Nothing to copy"
    }
};

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function t(key) {
    const locale = getLocale();
    return i18n[locale]?.[key] || i18n['en']?.[key] || key;
}

function getDescriptionHTML() {
    return `<h3 style="margin:0 0 12px 0;color:#60a5fa;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(96, 165, 250, 0.2);letter-spacing:0.2px;">${t('nodeTitle')}</h3>
<p style="margin:0 0 16px 0;color:#e2e8f0;">${t('description')}</p>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('featuresTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('feature1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('feature2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('feature3')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('usageTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${t('standardMode')}</strong>: <span style="color:#e2e8f0;">${t('standardModeDesc')}</span></li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${t('debugMode')}</strong>: <span style="color:#e2e8f0;">${t('debugModeDesc')}</span></li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${t('markdownMode')}</strong>: <span style="color:#e2e8f0;">${t('markdownModeDesc')}</span></li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('inputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('inputDesc')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('outputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('outputDesc')}</li>
</ul>`;
}

function createHelpPopup(description, onClose) {
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

app.registerExtension({
    name: "ShowAny",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ShowAny") {
            let uniqueCounter = 0;

            function fixEncoding(str, isDebugMode = false) {
                if (!isDebugMode || typeof str !== 'string') {
                    return str;
                }
                try {
                    if (/[\u0080-\u00FF]/.test(str) && !/[\u4E00-\u9FFF]/.test(str)) {
                        const bytes = new Uint8Array(str.length);
                        for (let i = 0; i < str.length; i++) {
                            bytes[i] = str.charCodeAt(i) & 0xFF;
                        }
                        const decoder = new TextDecoder('utf-8');
                        return decoder.decode(bytes);
                    }
                } catch (e) {}
                return str;
            }

            function getCopyText(node) {
                const data = node.__showAnyRawData;
                const mode = node.properties.showAnyMode || "Standard";
                const isDebugMode = mode === "Debug";
                let items = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (data !== null && data !== undefined) {
                    items = [data];
                }
                return items
                    .map((item) => {
                        if (item === null || item === undefined) return "";
                        return fixEncoding(String(item), isDebugMode);
                    })
                    .join("\n");
            }

            async function copyTextToClipboard(text) {
                if (navigator.clipboard && window.isSecureContext) {
                    try {
                        await navigator.clipboard.writeText(text);
                        return true;
                    } catch (e) {}
                }
                try {
                    const ta = document.createElement("textarea");
                    ta.value = text;
                    ta.style.cssText = "position:fixed;opacity:0;";
                    document.body.appendChild(ta);
                    ta.select();
                    const ok = document.execCommand("copy");
                    document.body.removeChild(ta);
                    return ok;
                } catch (e) {
                    return false;
                }
            }

            function flashCopyButton(button, labelText, text) {
                const label = button._label || button;
                label.textContent = labelText;
                button.style.borderColor = "#60a5fa";
                button.style.color = "#60a5fa";
                clearTimeout(button._copyFlashTimer);
                button._copyFlashTimer = setTimeout(() => {
                    label.textContent = text;
                    button.style.color = "#93c5fd";
                    button.style.borderColor = "rgba(96,165,250,0.4)";
                    if (!button.matches(':hover')) {
                        button.style.background = "rgba(96,165,250,0.15)";
                    }
                    button._copyFlashTimer = null;
                }, 1500);
            }

            function createItemContainer(text, isDebugMode) {
                const container = document.createElement("div");
                container.style.cssText = "display:flex;flex-direction:column;gap:4px;width:100%;box-sizing:border-box;";

                const textarea = document.createElement("textarea");
                textarea.readOnly = true;
                textarea.style.cssText = "width:100%;resize:none;background:#1f2430;color:#e5e7eb;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px;font-size:12px;line-height:1.5;box-sizing:border-box;";
                textarea.value = fixEncoding(text, isDebugMode);

                container.appendChild(textarea);
                return { container, textarea };
            }

            function createMarkdownContainer(text) {
                const container = document.createElement("div");
                container.style.cssText = "display:flex;flex-direction:column;gap:4px;width:100%;box-sizing:border-box;";

                const contentDiv = document.createElement("div");
                contentDiv.style.cssText = "width:100%;background:#1f2430;color:#e5e7eb;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px;font-size:12px;line-height:1.6;box-sizing:border-box;overflow:auto;";
                
                if (marked) {
                    contentDiv.innerHTML = parseMarkdownSync(text);
                } else {
                    loadMarked().then(() => {
                        contentDiv.innerHTML = parseMarkdownSync(text);
                    });
                    contentDiv.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
                }

                container.appendChild(contentDiv);
                return { container, contentDiv };
            }

            function ensurePreviewUI(node) {
                if (node.__showAnyPreview) {
                    return;
                }

                const host = document.createElement("div");
                host.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%;height:100%;box-sizing:border-box;";

                const itemsContainer = document.createElement("div");
                itemsContainer.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%;overflow-y:auto;flex:1;";

                const footer = document.createElement("div");
                footer.style.cssText = "display:flex;align-items:center;gap:8px;width:100%;font-size:12px;color:#cbd5e1;flex-shrink:0;box-sizing:border-box;";

                const modeLabel = document.createElement("span");
                modeLabel.textContent = t("previewMode");
                modeLabel.style.cssText = "margin-right:4px;";

                const modeWrap = document.createElement("div");
                modeWrap.style.cssText = "display:flex;align-items:center;gap:10px;";

                uniqueCounter++;
                const radioName = `showany-mode-${Date.now()}-${uniqueCounter}`;

                const mkRadio = (value, text) => {
                    const label = document.createElement("label");
                    label.style.cssText = "display:flex;align-items:center;gap:4px;cursor:pointer;";
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = radioName;
                    input.value = value;
                    input.style.cssText = "accent-color:#60a5fa;margin:0;";
                    const span = document.createElement("span");
                    span.textContent = text;
                    span.style.cssText = "color:#e5e7eb;";
                    label.appendChild(input);
                    label.appendChild(span);
                    return { label, input };
                };

                const radioStandard = mkRadio("Standard", t("standard"));
                const radioDebug = mkRadio("Debug", t("debug"));
                const radioMarkdown = mkRadio("Markdown", t("markdown"));

                modeWrap.appendChild(radioStandard.label);
                modeWrap.appendChild(radioDebug.label);
                modeWrap.appendChild(radioMarkdown.label);

                const copyButton = document.createElement("button");
                copyButton.type = "button";
                const copyLabel = document.createElement("span");
                copyLabel.textContent = t("copy");
                copyLabel.style.cssText = "display:block;line-height:1;";
                copyButton.appendChild(copyLabel);
                copyButton._label = copyLabel;
                copyButton.style.cssText = "margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;height:20px;min-width:0;background:rgba(96,165,250,0.15);color:#93c5fd;border:1px solid rgba(96,165,250,0.4);border-radius:4px;padding:0 6px;font-size:11px;text-align:center;box-sizing:border-box;cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;transition:background 0.15s ease,color 0.15s ease,border-color 0.15s ease;";
                copyButton.addEventListener("mouseenter", () => {
                    if (copyButton._copyFlashTimer) return;
                    copyButton.style.background = "rgba(96,165,250,0.3)";
                });
                copyButton.addEventListener("mouseleave", () => {
                    if (copyButton._copyFlashTimer) return;
                    copyButton.style.background = "rgba(96,165,250,0.15)";
                });
                copyButton.addEventListener("click", async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const text = getCopyText(node);
                    if (!text) {
                        flashCopyButton(copyButton, t("copyEmpty"), t("copy"));
                        return;
                    }
                    const ok = await copyTextToClipboard(text);
                    flashCopyButton(copyButton, ok ? t("copied") : t("copyFailed"), t("copy"));
                });

                footer.appendChild(modeLabel);
                footer.appendChild(modeWrap);
                footer.appendChild(copyButton);

                host.appendChild(itemsContainer);
                host.appendChild(footer);

                const domWidget = node.addDOMWidget("showany_preview", "div", host, {});
                domWidget.serialize = false;

                node.__showAnyPreview = {
                    host,
                    itemsContainer,
                    radioStandard,
                    radioDebug,
                    radioMarkdown,
                    modeLabel,
                    radioStandardLabel: radioStandard.label.querySelector('span'),
                    radioDebugLabel: radioDebug.label.querySelector('span'),
                    radioMarkdownLabel: radioMarkdown.label.querySelector('span')
                };

                if (!node.properties) {
                    node.properties = {};
                }

                const savedMode = node.properties.showAnyMode || node.properties.showtextMode;
                const initialMode = savedMode === "Debug" ? "Debug" : savedMode === "Markdown" ? "Markdown" : "Standard";
                node.properties.showAnyMode = initialMode;
                node.__showAnyPreview.radioStandard.input.checked = initialMode === "Standard";
                node.__showAnyPreview.radioDebug.input.checked = initialMode === "Debug";
                node.__showAnyPreview.radioMarkdown.input.checked = initialMode === "Markdown";

                const syncRadioColors = () => {
                    node.__showAnyPreview.radioStandardLabel.style.color = node.__showAnyPreview.radioStandard.input.checked ? "#93c5fd" : "#e5e7eb";
                    node.__showAnyPreview.radioDebugLabel.style.color = node.__showAnyPreview.radioDebug.input.checked ? "#93c5fd" : "#e5e7eb";
                    node.__showAnyPreview.radioMarkdownLabel.style.color = node.__showAnyPreview.radioMarkdown.input.checked ? "#93c5fd" : "#e5e7eb";
                };
                syncRadioColors();
                node.__showAnyPreview.radioStandard.input.addEventListener("change", syncRadioColors);
                node.__showAnyPreview.radioDebug.input.addEventListener("change", syncRadioColors);
                node.__showAnyPreview.radioMarkdown.input.addEventListener("change", syncRadioColors);

                const onModeChange = () => {
                    let mode = "Standard";
                    if (node.__showAnyPreview.radioDebug.input.checked) {
                        mode = "Debug";
                    } else if (node.__showAnyPreview.radioMarkdown.input.checked) {
                        mode = "Markdown";
                    }
                    node.properties.showAnyMode = mode;
                    updatePreview(node, node.__showAnyRawData);
                };
                node.__showAnyPreview.radioStandard.input.addEventListener("change", onModeChange);
                node.__showAnyPreview.radioDebug.input.addEventListener("change", onModeChange);
                node.__showAnyPreview.radioMarkdown.input.addEventListener("change", onModeChange);

                if (!node.size || node.size.length < 2) {
                    node.size = [520, 300];
                } else {
                    node.size = [Math.max(node.size[0], 520), Math.max(node.size[1], 300)];
                }
            }

            function updatePreview(node, data) {
                ensurePreviewUI(node);
                node.__showAnyRawData = data;
                const mode = node.properties.showAnyMode || "Standard";
                const isDebugMode = mode === "Debug";
                const isMarkdownMode = mode === "Markdown";
                const itemsContainer = node.__showAnyPreview.itemsContainer;

                itemsContainer.innerHTML = "";

                let items = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (data !== null && data !== undefined) {
                    items = [data];
                }

                const isSingleItem = items.length === 1;

                itemsContainer.style.overflowY = "auto";
                itemsContainer.style.flex = "1";

                items.forEach((item, index) => {
                    let text = "";
                    if (item === null || item === undefined) {
                        text = "";
                    } else {
                        text = String(item);
                    }
                    
                    if (isMarkdownMode) {
                        const { container, contentDiv } = createMarkdownContainer(text);
                        itemsContainer.appendChild(container);
                        if (isSingleItem) {
                            container.style.height = "100%";
                            container.style.flex = "1";
                            container.style.minHeight = "0";
                            contentDiv.style.height = "100%";
                        } else {
                            contentDiv.style.maxHeight = "200px";
                        }
                    } else {
                        const { container, textarea } = createItemContainer(text, isDebugMode);
                        itemsContainer.appendChild(container);
                        if (isSingleItem) {
                            container.style.height = "100%";
                            container.style.flex = "1";
                            container.style.minHeight = "0";
                            textarea.style.height = "100%";
                            textarea.style.overflow = "auto";
                        } else {
                            textarea.style.height = "80px";
                            textarea.style.overflow = "auto";
                        }
                    }
                });

                app.graph.setDirtyCanvas(true, false);
            }

            function updateUILanguage(node) {
                if (!node.__showAnyPreview) return;
                
                node.__showAnyPreview.modeLabel.textContent = t("previewMode");
                node.__showAnyPreview.radioStandardLabel.textContent = t("standard");
                node.__showAnyPreview.radioDebugLabel.textContent = t("debug");
                node.__showAnyPreview.radioMarkdownLabel.textContent = t("markdown");
                if (!node.__showAnyPreview.copyButton._copyFlashTimer) {
                    (node.__showAnyPreview.copyButton._label || node.__showAnyPreview.copyButton).textContent = t("copy");
                }
            }

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);
                ensurePreviewUI(this);
                this._showAnyHelp = false;
                this._showAnyLocale = getLocale();
                updatePreview(this, [""]);
                loadMarked();
                return r;
            };

            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function (message) {
                onExecuted?.apply(this, arguments);
                updatePreview(this, message?.text);
            };

            const onDrawForeground = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const currentLocale = getLocale();
                if (this._showAnyLocale !== currentLocale) {
                    this._showAnyLocale = currentLocale;
                    updateUILanguage(this);
                }
                
                const r = onDrawForeground ? onDrawForeground.apply(this, arguments) : undefined;
                return r;
            };

            const iconSize = 24;
            const iconMargin = 4;
            let helpElement = null;
            let currentHelpLocale = null;

            const drawFg = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const currentLocale = getLocale();
                if (this._showAnyLocale !== currentLocale) {
                    this._showAnyLocale = currentLocale;
                    updateUILanguage(this);
                }
                
                const r = drawFg ? drawFg.apply(this, arguments) : undefined;
                if (this.flags.collapsed) return r;

                const x = this.size[0] - iconSize - iconMargin;
                const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;

                if (this._showAnyHelp && helpElement === null) {
                    currentHelpLocale = currentLocale;
                    helpElement = createHelpPopup(getDescriptionHTML(), () => {
                        this._showAnyHelp = false;
                        helpElement = null;
                    });
                }
                else if (!this._showAnyHelp && helpElement !== null) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                else if (this._showAnyHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                    helpElement.querySelector('div').innerHTML = getDescriptionHTML();
                    currentHelpLocale = currentLocale;
                }

                if (this._showAnyHelp && helpElement !== null) {
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
                const helpActive = !!(this._showAnyHelp || this._showAnyHelpHovered);

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
                    this._showAnyHelp = !this._showAnyHelp;
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
                if (hovered !== this._showAnyHelpHovered) {
                    this._showAnyHelpHovered = hovered;
                    this.setDirtyCanvas(true, true);
                }
                return r;
            };

            const mouseLeave = nodeType.prototype.onMouseLeave;
            nodeType.prototype.onMouseLeave = function () {
                const r = mouseLeave ? mouseLeave.apply(this, arguments) : undefined;
                if (this._showAnyHelpHovered) {
                    this._showAnyHelpHovered = false;
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
        }
    }
});
