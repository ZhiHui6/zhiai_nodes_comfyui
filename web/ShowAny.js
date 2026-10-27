import { app } from "../../../scripts/app.js";
import { drawNodeHelpButton, titleTipHovered, hideTitleTip } from "./node_title_icons.js";

const SA_FONT = "'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', sans-serif";
const SA_TYPE = {
    micro: "11.5px",
    label: "12.5px",
    lhBase: "1.7",
};
const SA_COLOR = {
    text: "#DDE9F5",
    textBright: "#F2FAFF",
    textDim: "#93A9C4",
    textFaint: "#7C93B0",
    primary: "#60A5FA",
    primaryLight: "#93C5FD",
    border: "rgba(96,165,250,0.18)",
    borderHi: "rgba(147,197,253,0.42)",
};


const MARKDOWN_CSS = `
.sa-md { font-family: inherit; font-size: inherit; line-height: 1.7; color: #DDE9F5; }
.sa-md > *:first-child { margin-top: 0; }
.sa-md > *:last-child { margin-bottom: 0; }
.sa-md h1, .sa-md h2, .sa-md h3, .sa-md h4, .sa-md h5, .sa-md h6 {
    margin: 16px 0 8px; color: #60A5FA; font-weight: 600; line-height: 1.35;
}
.sa-md h1 { font-size: 20px; font-weight: 700; }
.sa-md h2 { font-size: 17px; font-weight: 700; }
.sa-md h3 { font-size: 15px; }
.sa-md h4 { font-size: 13.5px; }
.sa-md h5, .sa-md h6 { font-size: 12.5px; }
.sa-md p { margin: 8px 0; }
.sa-md a { color: #60A5FA; text-decoration: none; border-bottom: 1px solid rgba(96,165,250,0.4); }
.sa-md strong { color: #F2FAFF; font-weight: 600; }
.sa-md em { color: #CBD5E1; font-style: italic; }
.sa-md del { color: #93A9C4; }
.sa-md code {
    font-family: Consolas, "Cascadia Mono", Menlo, Consolas, monospace;
    font-size: 11.5px; padding: 1px 5px; border-radius: 4px;
    background: rgba(96,165,250,0.15); color: #93C5FD;
}
.sa-md pre {
    margin: 8px 0; padding: 9px 10px; border-radius: 6px; overflow-x: auto;
    background: rgba(3,9,18,0.62); border: 1px solid rgba(96,165,250,0.2);
}
.sa-md pre code {
    display: block; padding: 0; background: none; color: #DDE9F5;
    font-size: 11.5px; line-height: 1.6; white-space: pre;
}
.sa-md blockquote {
    margin: 8px 0; padding: 2px 0 2px 10px;
    border-left: 3px solid rgba(96,165,250,0.5); color: #B4C7DE;
}
.sa-md ul, .sa-md ol { margin: 8px 0; padding-left: 20px; }
.sa-md ul { list-style: disc; }
.sa-md ol { list-style: decimal; }
.sa-md li { margin: 3px 0; }
.sa-md li > ul, .sa-md li > ol { margin: 3px 0; }
.sa-md li.sa-md-task { list-style: none; margin-left: -16px; }
.sa-md li.sa-md-task > input { margin-right: 6px; vertical-align: -1px; }
.sa-md hr { margin: 12px 0; border: none; border-top: 1px solid rgba(96,165,250,0.3); }
.sa-md img { max-width: 100%; border-radius: 6px; }
.sa-md table { margin: 8px 0; width: 100%; border-collapse: collapse; font-size: 12px; }
.sa-md th, .sa-md td { padding: 5px 8px; border: 1px solid rgba(96,165,250,0.24); }
.sa-md th { background: rgba(96,165,250,0.12); color: #F2FAFF; font-weight: 600; }
`;


const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

function safeUrl(url) {
    const raw = String(url == null ? "" : url).trim();
    if (/^(?:https?:|mailto:|data:image\/|#|\/|\.\/|\.\.\/)/i.test(raw)) return raw;
    return "#";
}

function renderInline(source) {
    const text = source == null ? "" : String(source);
    if (!text) return "";

    let out = "";
    const parts = text.split(/(`+)/);
    let inCode = false;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (/^`+$/.test(part)) {
            inCode = !inCode;
            out += inCode ? "\u0000CODE\u0000" : "\u0000ENDCODE\u0000";
            continue;
        }
        out += inCode ? part : renderInlineText(part);
    }

    out = out.replace(/\u0000CODE\u0000([\s\S]*?)\u0000ENDCODE\u0000/g,
        (m, code) => `<code>${escapeHtml(code)}</code>`);
    out = out.replace(/\u0000ENDCODE\u0000/g, "").replace(/\u0000CODE\u0000/g, "");
    return out;
}

function renderInlineText(raw) {
    let s = escapeHtml(raw);

    s = s.replace(/!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\s*\)/g,
        (m, alt, src, title) =>
            `<img src="${escapeHtml(safeUrl(src))}" alt="${alt}"${title ? ` title="${title}"` : ""}>`);

    s = s.replace(/\[([^\]]+)\]\(\s*([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\s*\)/g,
        (m, label, href, title) =>
            `<a href="${escapeHtml(safeUrl(href))}" target="_blank" rel="noreferrer"${title ? ` title="${title}"` : ""}>${label}</a>`);

    s = s.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g,
        (m, href) => `<a href="${href}" target="_blank" rel="noreferrer">${href}</a>`);

    s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__([^_\n]+)__/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^\w*])\*([^*\n]+)\*(?=[^\w*]|$)/g, "$1<em>$2</em>");
    s = s.replace(/(^|[^\w_])_([^_\n]+)_(?=[^\w_]|$)/g, "$1<em>$2</em>");
    s = s.replace(/~~([^~\n]+)~~/g, "<del>$1</del>");
    return s;
}


const RX_FENCE = /^\s*(`{3,}|~{3,})\s*([A-Za-z0-9#+._-]*)\s*$/;
const RX_HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RX_HR = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const RX_QUOTE = /^\s{0,3}>\s?(.*)$/;
const RX_LIST = /^(\s*)(?:([-*+])|(\d+)[.)])\s+(.*)$/;
const RX_TABLE_SEP = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;
const RX_TASK = /^\[([ xX])\]\s*(.*)$/;

function isBlockStart(line) {
    return RX_FENCE.test(line) || RX_HEADING.test(line) || RX_HR.test(line)
        || RX_QUOTE.test(line) || RX_LIST.test(line);
}

function isTableStart(lines, i) {
    return lines[i].includes("|") && i + 1 < lines.length && RX_TABLE_SEP.test(lines[i + 1])
        && lines[i + 1].includes("-");
}

function splitRow(line) {
    let s = line.trim();
    if (s.startsWith("|")) s = s.slice(1);
    if (s.endsWith("|")) s = s.slice(0, -1);
    return s.split("|").map((cell) => cell.trim());
}

function renderTable(lines, start) {
    const header = splitRow(lines[start]);
    const aligns = splitRow(lines[start + 1]).map((cell) => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        if (left) return "left";
        return "";
    });
    const rows = [];
    let i = start + 2;
    for (; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim() || !line.includes("|")) break;
        rows.push(splitRow(line));
    }
    const cell = (tag, content, index) => {
        const align = aligns[index] ? ` style="text-align:${aligns[index]}"` : "";
        return `<${tag}${align}>${renderInline(content)}</${tag}>`;
    };
    const head = `<tr>${header.map((c, n) => cell("th", c, n)).join("")}</tr>`;
    const body = rows.map((row) => {
        const cells = [];
        for (let n = 0; n < header.length; n++) cells.push(cell("td", row[n] ?? "", n));
        return `<tr>${cells.join("")}</tr>`;
    }).join("");
    return { html: `<table><thead>${head}</thead><tbody>${body}</tbody></table>`, next: i };
}

function renderCodeBlock(lines, start, fence) {
    const marker = fence[1];
    const lang = fence[2] || "";
    const closer = new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`);
    const body = [];
    let i = start + 1;
    for (; i < lines.length; i++) {
        if (closer.test(lines[i])) { i++; break; }
        body.push(lines[i]);
    }
    const cls = lang ? ` class="language-${escapeHtml(lang)}"` : "";
    return { html: `<pre><code${cls}>${escapeHtml(body.join("\n"))}</code></pre>`, next: i };
}

function renderQuote(lines, start) {
    const inner = [];
    let i = start;
    for (; i < lines.length; i++) {
        const m = RX_QUOTE.exec(lines[i]);
        if (!m) break;
        inner.push(m[1]);
    }
    return { html: `<blockquote>${renderBlocks(inner)}</blockquote>`, next: i };
}

function renderList(lines, start) {
    const first = RX_LIST.exec(lines[start]);
    const ordered = !!first[3];
    const items = [];
    let baseIndent = null;
    let current = null;
    let i = start;

    for (; i < lines.length; i++) {
        const line = lines[i];
        const m = RX_LIST.exec(line);
        if (m) {
            const indent = m[1].length;
            if (baseIndent === null) baseIndent = indent;
            if (indent <= baseIndent) {
                if (!!m[3] !== ordered) break;
                current = {
                    lines: [m[4]],
                    contentCol: m[1].length + (m[2] ? 1 : String(m[3]).length + 1),
                };
                items.push(current);
                continue;
            }
        }
        if (!current) break;
        if (!line.trim()) {
            let hasMore = false;
            for (let k = i + 1; k < lines.length; k++) {
                if (!lines[k].trim()) continue;
                const mm = RX_LIST.exec(lines[k]);
                hasMore = !!(mm && mm[1].length >= (baseIndent ?? 0) && !!mm[3] === ordered);
                break;
            }
            if (!hasMore) break;
            current.lines.push("");
            continue;
        }
        const lead = line.length - line.trimStart().length;
        current.lines.push(line.slice(Math.min(lead, current.contentCol)));
    }

    const tag = ordered ? "ol" : "ul";
    const html = items.map((item) => {
        let content = item.lines;
        let task = null;
        const firstLine = content[0] || "";
        const tm = RX_TASK.exec(firstLine.trim());
        if (tm) {
            task = tm[1].toLowerCase() === "x";
            content = [tm[2], ...content.slice(1)];
        }
        let body = renderBlocks(content);
        if ((body.match(/<p>/g) || []).length === 1) {
            body = body.replace(/^([\s\S]*?)<p>([\s\S]*?)<\/p>/, "$1$2");
        }
        const cls = task === null ? "" : ' class="sa-md-task"';
        const box = task === null ? ""
            : `<input type="checkbox" disabled${task ? " checked" : ""}>`;
        return `<li${cls}>${box}${body}</li>`;
    }).join("");

    return { html: `<${tag}>${html}</${tag}>`, next: i };
}

function renderParagraph(lines) {
    return `<p>${renderInline(lines.join("\n")).replace(/\n/g, "<br>")}</p>`;
}

function renderBlocks(lines) {
    let html = "";
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }

        const fence = RX_FENCE.exec(line);
        if (fence) {
            const res = renderCodeBlock(lines, i, fence);
            html += res.html;
            i = res.next;
            continue;
        }
        const heading = RX_HEADING.exec(line);
        if (heading) {
            const level = heading[1].length;
            html += `<h${level}>${renderInline(heading[2])}</h${level}>`;
            i++;
            continue;
        }
        if (RX_HR.test(line)) { html += "<hr>"; i++; continue; }
        if (RX_QUOTE.test(line)) {
            const res = renderQuote(lines, i);
            html += res.html;
            i = res.next;
            continue;
        }
        if (isTableStart(lines, i)) {
            const res = renderTable(lines, i);
            html += res.html;
            i = res.next;
            continue;
        }
        if (RX_LIST.test(line)) {
            const res = renderList(lines, i);
            html += res.html;
            i = res.next;
            continue;
        }

        const para = [line];
        i++;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])
               && !isTableStart(lines, i)) {
            para.push(lines[i]);
            i++;
        }
        html += renderParagraph(para);
    }
    return html;
}

function renderMarkdown(source) {
    const text = source == null ? "" : String(source);
    if (!text.trim()) return "";
    try {
        const normalized = text.replace(/\r\n?/g, "\n");
        return `<div class="sa-md">${renderBlocks(normalized.split("\n"))}</div>`;
    } catch (err) {
        console.warn("ShowAny: markdown render failed", err);
        return `<div class="sa-md"><p>${escapeHtml(text).replace(/\n/g, "<br>")}</p></div>`;
    }
}

const SHOW_ANY_MIN_WIDTH = 347;
const SHOW_ANY_MIN_HEIGHT = 200;

const SHOW_ANY_CSS = `
.sa-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    background: rgba(3, 9, 18, 0.62);
    border: 1px solid ${SA_COLOR.border};
    border-radius: 6px;
    font-family: ${SA_FONT};
    font-size: ${SA_TYPE.micro};
}
.sa-box__body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
    box-sizing: border-box;
    padding: 8px 9px;
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 197, 253, 0.45) transparent;
}
.sa-box__body::-webkit-scrollbar { width: 6px; height: 6px; }
.sa-box__body::-webkit-scrollbar-track { background: transparent; }
.sa-box__body::-webkit-scrollbar-thumb {
    background: rgba(147, 197, 253, 0.45);
    border-radius: 3px;
}
.sa-box__body::-webkit-scrollbar-thumb:hover { background: rgba(147, 197, 253, 0.7); }
.sa-box__foot {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    padding: 4px 8px;
    white-space: nowrap;
    border-top: 1px solid ${SA_COLOR.border};
    background: rgba(96, 165, 250, 0.07);
    color: ${SA_COLOR.textDim};
}
.sa-src {
    margin: 0;
    color: ${SA_COLOR.text};
    font-size: ${SA_TYPE.micro};
    line-height: ${SA_TYPE.lhBase};
    white-space: pre-wrap;
    word-break: break-word;
}
.sa-empty {
    color: ${SA_COLOR.textFaint};
    font-size: ${SA_TYPE.micro};
    line-height: ${SA_TYPE.lhBase};
}
`;

let _saStylesInjected = false;
function injectShowAnyStyles() {
    if (_saStylesInjected) return;
    _saStylesInjected = true;
    const style = document.createElement("style");
    style.id = "showany-styles";
    style.textContent = SHOW_ANY_CSS + MARKDOWN_CSS;
    document.head.appendChild(style);
}

function clampShowAnySize(node) {
    if (!node) return false;
    const width = Math.max(node.size?.[0] || 0, SHOW_ANY_MIN_WIDTH);
    const height = Math.max(node.size?.[1] || 0, SHOW_ANY_MIN_HEIGHT);
    if (node.size && node.size[0] === width && node.size[1] === height) return false;
    if (typeof node.setSize === "function") node.setSize([width, height]);
    else node.size = [width, height];
    return true;
}

function widestInlineWidth(texts, fontCss) {
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;box-sizing:border-box;" + fontCss;
    document.body.appendChild(probe);
    let width = 0;
    for (const text of texts) {
        probe.textContent = text;
        width = Math.max(width, probe.getBoundingClientRect().width);
    }
    probe.remove();
    return Math.ceil(width);
}

const i18n = {
    zh: {
        nodeTitle: "ShowAny 节点",
        description: "用于显示任意类型的数据内容。",
        featuresTitle: "功能",
        feature1: "支持显示字符串、数字、数组等多种数据类型",
        feature2: "提供源码模式和Markdown模式两种预览模式",
        usageTitle: "使用说明",
        standardMode: "源码模式",
        standardModeDesc: "按原始文本显示，不做任何解析",
        markdownMode: "Markdown模式",
        markdownModeDesc: "把文本按Markdown排版渲染成可视化预览",
        inputTitle: "输入",
        inputDesc: "接受任意类型的输入数据",
        outputTitle: "输出",
        outputDesc: "在节点内显示格式化后的内容",
        previewMode: "预览模式：",
        standard: "源码",
        markdown: "Markdown",
        emptyPreview: "暂无内容",
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
        feature2: "Provides two preview modes: Source and Markdown",
        usageTitle: "Usage",
        standardMode: "Source Mode",
        standardModeDesc: "Shows the raw text without any parsing",
        markdownMode: "Markdown Mode",
        markdownModeDesc: "Renders the text as a formatted Markdown preview",
        inputTitle: "Input",
        inputDesc: "Accepts any type of input data",
        outputTitle: "Output",
        outputDesc: "Displays formatted content within the node",
        previewMode: "Preview Mode:",
        standard: "Source",
        markdown: "Markdown",
        emptyPreview: "Nothing to preview",
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
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('usageTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${t('standardMode')}</strong>: <span style="color:#e2e8f0;">${t('standardModeDesc')}</span></li>
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

app.registerExtension({
    name: "ShowAny",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ShowAny") {
            let uniqueCounter = 0;

            function getCopyText(node) {
                const data = node.__showAnyRawData;
                let items = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (data !== null && data !== undefined) {
                    items = [data];
                }
                return items
                    .map((item) => {
                        if (item === null || item === undefined) return "";
                        return String(item);
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

            // 紧凑型图标：复制 / 成功（对勾）/ 失败（叉）
            const SA_COPY_ICON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
            const SA_OK_ICON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5 12.8 9.8 17.6 19 6.4"/></svg>';
            const SA_FAIL_ICON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6.4" y1="6.4" x2="17.6" y2="17.6"/><line x1="17.6" y1="6.4" x2="6.4" y2="17.6"/></svg>';

            function flashCopyButton(button, state) {
                // state: "ok" | "fail" | "empty"
                clearTimeout(button._copyFlashTimer);
                if (state === "ok") {
                    button.innerHTML = SA_OK_ICON;
                    button.title = t("copied");
                    button.style.color = "#34D399";
                    button.style.borderColor = "rgba(52, 211, 153, 0.5)";
                } else if (state === "fail") {
                    button.innerHTML = SA_FAIL_ICON;
                    button.title = t("copyFailed");
                    button.style.color = "#F87171";
                    button.style.borderColor = "rgba(248, 113, 113, 0.5)";
                } else {
                    button.innerHTML = SA_FAIL_ICON;
                    button.title = t("copyEmpty");
                    button.style.color = "#F87171";
                    button.style.borderColor = "rgba(248, 113, 113, 0.5)";
                }
                button._copyFlashTimer = setTimeout(() => {
                    button.innerHTML = SA_COPY_ICON;
                    button.title = t("copy");
                    button.style.color = "#93c5fd";
                    button.style.borderColor = "rgba(96,165,250,0.4)";
                    if (!button.matches(':hover')) {
                        button.style.background = "rgba(96,165,250,0.15)";
                    }
                    button._copyFlashTimer = null;
                }, 1500);
            }

            function createSourceItem(text) {
                const el = document.createElement("div");
                el.className = "sa-src";
                el.textContent = text;
                return el;
            }

            function createMarkdownItem(text) {
                const el = document.createElement("div");
                el.innerHTML = renderMarkdown(text);
                return el;
            }

            function ensurePreviewUI(node) {
                if (node.__showAnyPreview) {
                    return;
                }
                injectShowAnyStyles();

                const host = document.createElement("div");
                host.className = "sa-box";

                const itemsContainer = document.createElement("div");
                itemsContainer.className = "sa-box__body";

                const footer = document.createElement("div");
                footer.className = "sa-box__foot";

                const modeLabel = document.createElement("span");
                modeLabel.textContent = t("previewMode");
                modeLabel.style.cssText = "flex-shrink:0;white-space:nowrap;";

                const modeWrap = document.createElement("div");
                modeWrap.style.cssText = "display:flex;align-items:center;gap:10px;flex-shrink:0;white-space:nowrap;";

                uniqueCounter++;
                const radioName = `showany-mode-${Date.now()}-${uniqueCounter}`;

                const mkRadio = (value, text) => {
                    const label = document.createElement("label");
                    label.style.cssText = "display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;";
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = radioName;
                    input.value = value;
                    input.style.cssText = "accent-color:#60a5fa;margin:0;width:11px;height:11px;";
                    const span = document.createElement("span");
                    span.textContent = text;
                    span.style.cssText = `color:${SA_COLOR.textDim};font-size:${SA_TYPE.micro};`;
                    label.appendChild(input);
                    label.appendChild(span);
                    return { label, input };
                };

                const radioStandard = mkRadio("Standard", t("standard"));
                const radioMarkdown = mkRadio("Markdown", t("markdown"));

                modeWrap.appendChild(radioStandard.label);
                modeWrap.appendChild(radioMarkdown.label);

                const copyButton = document.createElement("button");
                copyButton.type = "button";
                // 紧凑型：仅图标，正方形小按钮，状态通过图标与颜色反馈
                copyButton.innerHTML = SA_COPY_ICON;
                copyButton.title = t("copy");
                copyButton.style.cssText = "margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;background:rgba(96,165,250,0.15);color:#93c5fd;border:1px solid rgba(96,165,250,0.4);border-radius:4px;box-sizing:border-box;cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;transition:background 0.15s ease,color 0.15s ease,border-color 0.15s ease;";
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
                        flashCopyButton(copyButton, "empty");
                        return;
                    }
                    const ok = await copyTextToClipboard(text);
                    flashCopyButton(copyButton, ok ? "ok" : "fail");
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
                    radioMarkdown,
                    modeLabel,
                    copyButton,
                    radioStandardLabel: radioStandard.label.querySelector('span'),
                    radioMarkdownLabel: radioMarkdown.label.querySelector('span')
                };

                if (!node.properties) {
                    node.properties = {};
                }

                const savedMode = node.properties.showAnyMode || node.properties.showtextMode;
                const initialMode = savedMode === "Markdown" ? "Markdown" : "Standard";
                node.properties.showAnyMode = initialMode;
                node.__showAnyPreview.radioStandard.input.checked = initialMode === "Standard";
                node.__showAnyPreview.radioMarkdown.input.checked = initialMode === "Markdown";

                const syncRadioColors = () => {
                    node.__showAnyPreview.radioStandardLabel.style.color = node.__showAnyPreview.radioStandard.input.checked ? SA_COLOR.primaryLight : SA_COLOR.textDim;
                    node.__showAnyPreview.radioMarkdownLabel.style.color = node.__showAnyPreview.radioMarkdown.input.checked ? SA_COLOR.primaryLight : SA_COLOR.textDim;
                };
                syncRadioColors();
                node.__showAnyPreview.radioStandard.input.addEventListener("change", syncRadioColors);
                node.__showAnyPreview.radioMarkdown.input.addEventListener("change", syncRadioColors);

                const onModeChange = () => {
                    let mode = "Standard";
                    if (node.__showAnyPreview.radioMarkdown.input.checked) {
                        mode = "Markdown";
                    }
                    node.properties.showAnyMode = mode;
                    updatePreview(node, node.__showAnyRawData);
                };
                node.__showAnyPreview.radioStandard.input.addEventListener("change", onModeChange);
                node.__showAnyPreview.radioMarkdown.input.addEventListener("change", onModeChange);

                clampShowAnySize(node);
            }

            function updatePreview(node, data) {
                ensurePreviewUI(node);
                node.__showAnyRawData = data;
                const mode = node.properties.showAnyMode || "Standard";
                const isMarkdownMode = mode === "Markdown";
                const itemsContainer = node.__showAnyPreview.itemsContainer;

                itemsContainer.innerHTML = "";

                let items = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (data !== null && data !== undefined) {
                    items = [data];
                }

                const isEmpty = items.length === 0
                    || items.every((item) => String(item ?? "").trim() === "");
                if (isEmpty) {
                    const placeholder = document.createElement("div");
                    placeholder.className = "sa-empty";
                    placeholder.textContent = t("emptyPreview");
                    itemsContainer.appendChild(placeholder);
                } else {
                    items.forEach((item) => {
                        const text = item === null || item === undefined ? "" : String(item);
                        itemsContainer.appendChild(
                            isMarkdownMode ? createMarkdownItem(text) : createSourceItem(text)
                        );
                    });
                }

                app.graph.setDirtyCanvas(true, false);
            }

            function updateUILanguage(node) {
                if (!node.__showAnyPreview) return;
                
                node.__showAnyPreview.modeLabel.textContent = t("previewMode");
                node.__showAnyPreview.radioStandardLabel.textContent = t("standard");
                node.__showAnyPreview.radioMarkdownLabel.textContent = t("markdown");
                const placeholder = node.__showAnyPreview.itemsContainer.querySelector(".sa-empty");
                if (placeholder) placeholder.textContent = t("emptyPreview");
                if (!node.__showAnyPreview.copyButton._copyFlashTimer) {
                    // 紧凑型图标按钮：语言切换时仅更新悬停提示文案
                    node.__showAnyPreview.copyButton.title = t("copy");
                }
            }

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);
                ensurePreviewUI(this);
                this._showAnyHelp = false;
                this._showAnyLocale = getLocale();
                updatePreview(this, [""]);
                return r;
            };

            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function (message) {
                onExecuted?.apply(this, arguments);
                updatePreview(this, message?.text);
            };

            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function () {
                const r = onConfigure?.apply(this, arguments);
                setTimeout(() => {
                    clampShowAnySize(this);
                    this.setDirtyCanvas?.(true, true);
                }, 0);
                return r;
            };

            const onResize = nodeType.prototype.onResize;
            nodeType.prototype.onResize = function (size) {
                const r = onResize?.apply(this, arguments);
                if (size && (size[0] < SHOW_ANY_MIN_WIDTH || size[1] < SHOW_ANY_MIN_HEIGHT)) {
                    clampShowAnySize(this);
                }
                return r;
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
                    hideTitleTip();
                    this._showAnyHelp = !this._showAnyHelp;
                    return true;
                }
                return r;
            };

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
                titleTipHovered(hovered, getLocale() === "zh" ? "节点帮助" : "Node help", e);
                return r;
            };

            const mouseLeave = nodeType.prototype.onMouseLeave;
            nodeType.prototype.onMouseLeave = function () {
                const r = mouseLeave ? mouseLeave.apply(this, arguments) : undefined;
                if (this._showAnyHelpHovered) {
                    this._showAnyHelpHovered = false;
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
                return r;
            };
        }
    }
});
