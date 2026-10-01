import { app } from "../../../scripts/app.js";
import { drawNodeHelpButton } from "./node_title_icons.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";
import { api } from "../../../scripts/api.js";

const i18n = {
    zh: {
        continueRun: "▶️ 继续运行",
        helpTitle: "文本编辑器（继续运行）",
        helpDescription: "暂停工作流并自动获取输入文本。你可以直接编辑文本区域，点击继续运行后将修改后的文本传递给下游节点。",
        helpUsage: "使用说明",
        helpStep1: "连接文本输入并运行工作流。",
        helpStep2: "节点暂停后，输入文本会自动显示在编辑区。",
        helpStep3: "修改文本后点击“继续运行”恢复工作流。",
        helpNote: "节点暂停期间工作流会等待操作；可以随时取消执行。",
        helpClose: "关闭帮助"
    },
    en: {
        continueRun: "▶️ Continue",
        helpTitle: "Text Editor (Continue Execution)",
        helpDescription: "Pauses the workflow and automatically fetches the incoming text. Edit the text area directly, then continue to pass the updated text downstream.",
        helpUsage: "Usage",
        helpStep1: "Connect a text input and run the workflow.",
        helpStep2: "When the node pauses, the incoming text appears automatically in the editor.",
        helpStep3: "Edit the text and click Continue to resume the workflow.",
        helpNote: "The workflow waits for interaction while paused; execution can be cancelled at any time.",
        helpClose: "Close help"
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

function getHelpHTML() {
    return `<div style="font-size:17px;font-weight:600;color:#dbeafe;margin-bottom:10px;">${$t('helpTitle')}</div>
<p style="margin:0 0 14px;color:#e2e8f0;line-height:1.6;">${$t('helpDescription')}</p>
<div style="font-size:13px;font-weight:600;color:#93c5fd;margin-bottom:6px;">${$t('helpUsage')}</div>
<ol style="margin:0 0 14px;padding-left:20px;color:#e2e8f0;line-height:1.7;">
<li>${$t('helpStep1')}</li>
<li>${$t('helpStep2')}</li>
<li>${$t('helpStep3')}</li>
</ol>
<p style="margin:0;color:#a5b4fc;line-height:1.6;">${$t('helpNote')}</p>`;
}

function createHelpPopup(node, onClose) {
    const popup = document.createElement('div');
    popup.style.cssText = `position:fixed;z-index:10000;width:min(360px,calc(100vw - 24px));max-height:min(420px,calc(100vh - 24px));overflow:auto;padding:16px 18px;background:#172033;color:#e2e8f0;border:1px solid rgba(147,197,253,.45);border-radius:8px;box-shadow:0 12px 32px rgba(0,0,0,.45);font:13px/1.5 system-ui,sans-serif;`;

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.title = $t('helpClose');
    close.setAttribute('aria-label', $t('helpClose'));
    close.style.cssText = 'position:absolute;top:6px;right:8px;width:24px;height:24px;border:0;background:transparent;color:#bfdbfe;font-size:20px;line-height:20px;cursor:pointer;';
    close.addEventListener('click', (event) => {
        event.stopPropagation();
        onClose();
    });

    const content = document.createElement('div');
    content.innerHTML = getHelpHTML();
    popup.append(close, content);
    document.body.appendChild(popup);
    node.__textEditorHelpContent = content;
    return popup;
}

const postContinue = (nodeId, editedText) => {
    return fetch("/text_editor_continue/continue/" + nodeId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edited_text: editedText })
    });
};

const fetchState = async (nodeId) => {
    try {
        const res = await fetch(`/text_editor_continue/state/${nodeId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (_) {
        return null;
    }
};

app.registerExtension({
    name: "TextEditorWithContinue",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "TextEditorWithContinue") {
            function populateDisplayText(text) {
                if (this.displayWidgets) {
                    for (let i = 0; i < this.displayWidgets.length; i++) {
                        const widget = this.displayWidgets[i];
                        if (this.widgets) {
                            const index = this.widgets.indexOf(widget);
                            if (index > -1) {
                                this.widgets.splice(index, 1);
                            }
                        }
                        if (widget.inputEl && widget.inputEl.parentNode) {
                            widget.inputEl.parentNode.removeChild(widget.inputEl);
                        }
                        widget.onRemove?.();
                    }
                    this.displayWidgets = [];
                }

                this.editableWidget = null;

                if (!this.displayWidgets) {
                    this.displayWidgets = [];
                }

                const v = [];
                for (const value of (Array.isArray(text) ? text : [text])) {
                    if (Array.isArray(value)) {
                        v.push(...value);
                    } else if (value !== undefined && value !== null) {
                        v.push(value);
                    }
                }
                if (!v.length) v.push("");

                for (const [index, value] of v.entries()) {
                    const w = ComfyWidgets["STRING"](this, "display_text_" + index, ["STRING", { multiline: true }], app).widget;
                    const isEditor = index === 0;
                    w.serialize = false;
                    w.inputEl.readOnly = !isEditor;
                    w.inputEl.style.opacity = 1.0;
                    w.inputEl.style.backgroundColor = isEditor ? "#17251a" : "#000000";
                    w.inputEl.style.color = "#FFFFFF";
                    w.inputEl.style.border = isEditor ? "2px solid #4CAF50" : "1px solid #333";
                    w.inputEl.style.borderRadius = isEditor ? "4px" : "0";
                    w.value = value;
                    if (isEditor) {
                        this.editableWidget = w;
                        this.lastDisplayText = value;
                    }
                    this.displayWidgets.push(w);
                }

                if (this.continueButton && this.widgets) {
                    const continueIndex = this.widgets.indexOf(this.continueButton);
                    if (continueIndex > -1) {
                        this.widgets.splice(continueIndex, 1);
                        this.widgets.push(this.continueButton);
                    }
                }

                requestAnimationFrame(() => {
                    const sz = this.computeSize();
                    if (sz[0] < this.size[0]) {
                        sz[0] = this.size[0];
                    }
                    if (sz[1] < this.size[1]) {
                        sz[1] = this.size[1];
                    }
                    this.onResize?.(sz);
                    app.graph.setDirtyCanvas(true, false);
                });
            }

            function setupEditableWidget() {
                if (!this.editableWidget && this.displayWidgets?.length) {
                    this.editableWidget = this.displayWidgets[0];
                }
                if (this.editableWidget?.inputEl) {
                    this.editableWidget.inputEl.placeholder = "节点暂停时会自动同步文本，可直接编辑后继续运行...\nText syncs automatically when the node pauses. Edit it, then continue...";
                    this.editableWidget.inputEl.readOnly = false;
                    this.editableWidget.inputEl.style.border = "2px solid #4CAF50";
                    this.editableWidget.inputEl.style.borderRadius = "4px";
                }
            }

            function addControlButtons() {
                if (this.continueButton) {
                    const index = this.widgets.indexOf(this.continueButton);
                    if (index > -1) {
                        this.widgets.splice(index, 1);
                    }
                    if (this.continueButton.inputEl?.parentNode) {
                        this.continueButton.inputEl.parentNode.removeChild(this.continueButton.inputEl);
                    }
                    this.continueButton.onRemove?.();
                }

                this.continueButton = this.addWidget("button", $t('continueRun'), "CONTINUE", () => {
                    const editedText = this.editableWidget ? this.editableWidget.value : "";
                    postContinue(this.id, editedText);
                });
                this.continueButton.serialize = false;
            }

            function removeLegacyHelpOutputs() {
                if (!Array.isArray(this.outputs)) return;

                for (let index = this.outputs.length - 1; index >= 0; index--) {
                    const output = this.outputs[index];
                    const name = String(output?.name ?? output?.label ?? "");
                    if (name !== "help_info" && name !== "帮助信息") continue;

                    if (typeof this.removeOutput === "function") {
                        this.removeOutput(index);
                    } else {
                        this.outputs.splice(index, 1);
                    }
                }
            }

            async function syncPausedText() {
                // The backend enters the paused state immediately before the execution event arrives.
                for (let attempt = 0; attempt < 20; attempt++) {
                    const data = await fetchState(this.id);
                    if (data?.status === "paused" && data.edited_text !== undefined) {
                        const text = data.edited_text ?? "";
                        populateDisplayText.call(this, [text]);
                        setupEditableWidget.call(this);
                        app.graph.setDirtyCanvas(true, false);
                        return;
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // 与其它节点（含 LM Studio 节点）保持一致：图标 24px、边距 4px，
            // 使「?」符号的字号与 LM 节点标题栏按钮完全相同
            const helpIconSize = 24;
            const helpIconMargin = 4;
            const getTitleHeight = () => globalThis.LiteGraph?.NODE_TITLE_HEIGHT ?? 30;

            function closeHelp(node) {
                node.__textEditorHelpVisible = false;
                node.__textEditorHelpElement?.remove();
                node.__textEditorHelpElement = null;
                node.__textEditorHelpContent = null;
                node.setDirtyCanvas?.(true, true);
            }

            function toggleHelp(node) {
                if (node.__textEditorHelpVisible) {
                    closeHelp(node);
                    return;
                }

                node.__textEditorHelpVisible = true;
                node.__textEditorHelpLocale = getLocale();
                node.__textEditorHelpElement = createHelpPopup(node, () => closeHelp(node));
                node.setDirtyCanvas?.(true, true);
            }

            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function (message) {
                onExecuted?.apply(this, arguments);
                if (message.text) {
                    populateDisplayText.call(this, message.text);
                }
                setupEditableWidget.call(this);
                addControlButtons.call(this);
            };

            const VALUES = Symbol();
            const configure = nodeType.prototype.configure;
            nodeType.prototype.configure = function () {
                this[VALUES] = arguments[0]?.widgets_values;
                return configure?.apply(this, arguments);
            };

            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function () {
                onConfigure?.apply(this, arguments);
                removeLegacyHelpOutputs.call(this);
                const widgets_values = this[VALUES];
                if (widgets_values?.length) {
                    requestAnimationFrame(() => {
                        const savedText = widgets_values[widgets_values.length - 1];
                        if (savedText !== undefined && savedText !== null) {
                            populateDisplayText.call(this, [savedText]);
                        }
                        setupEditableWidget.call(this);
                        addControlButtons.call(this);
                    });
                }
            };

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            const onRemoved = nodeType.prototype.onRemoved;
            nodeType.prototype.onNodeCreated = function () {
                onNodeCreated?.apply(this, arguments);
                removeLegacyHelpOutputs.call(this);
                setupEditableWidget.call(this);
                addControlButtons.call(this);
                this.__textEditorHelpVisible = false;
                this.__textEditorHelpElement = null;
                this.__textEditorHelpContent = null;
                this.__textEditorHelpLocale = getLocale();
                if (this._textEditorExecutionListener) {
                    api.removeEventListener("executing", this._textEditorExecutionListener);
                }
                this._textEditorExecutionListener = (event) => {
                    const nodeId = event?.detail ?? event;
                    if (String(nodeId) === String(this.id)) {
                        syncPausedText.call(this);
                    }
                };
                api.addEventListener("executing", this._textEditorExecutionListener);
            };

            const onDrawForeground = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const result = onDrawForeground?.apply(this, arguments);
                if (this.flags?.collapsed) {
                    if (this.__textEditorHelpVisible) closeHelp(this);
                    return result;
                }

                const locale = getLocale();
                if (this.__textEditorHelpLocale !== locale) {
                    this.__textEditorHelpLocale = locale;
                    if (this.__textEditorHelpContent) {
                        this.__textEditorHelpContent.innerHTML = getHelpHTML();
                    }
                }

                const iconX = this.size[0] - helpIconSize - helpIconMargin;
                const iconY = -getTitleHeight() + (getTitleHeight() - helpIconSize) / 2;

                if (this.__textEditorHelpVisible && this.__textEditorHelpElement) {
                    const canvasRect = ctx.canvas.getBoundingClientRect();
                    const scaleX = canvasRect.width / ctx.canvas.width;
                    const scaleY = canvasRect.height / ctx.canvas.height;
                    const transform = new DOMMatrix()
                        .scaleSelf(scaleX, scaleY)
                        .multiplySelf(ctx.getTransform())
                        .translateSelf(this.size[0] * scaleX * Math.max(1, window.devicePixelRatio), 0)
                        .translateSelf(10, -32);
                    const appCanvasRect = app.canvas.canvas.getBoundingClientRect();
                    this.__textEditorHelpElement.style.left = `${transform.e + appCanvasRect.x}px`;
                    this.__textEditorHelpElement.style.top = `${transform.f + appCanvasRect.y}px`;
                }

                // 展开中或鼠标悬停时高亮
                const helpActive = !!(this.__textEditorHelpVisible || this.__textEditorHelpHovered);

                ctx.save();
                ctx.translate(iconX, iconY);
                ctx.scale(helpIconSize / 32, helpIconSize / 32);
                drawNodeHelpButton(ctx, helpActive);
                ctx.restore();
                return result;
            };

            const onMouseDown = nodeType.prototype.onMouseDown;
            nodeType.prototype.onMouseDown = function (event, localPos, canvas) {
                const iconX = this.size[0] - helpIconSize - helpIconMargin;
                const titleHeight = getTitleHeight();
                const iconY = -titleHeight + (titleHeight - helpIconSize) / 2;
                if (
                    localPos?.[0] >= iconX &&
                    localPos?.[0] <= iconX + helpIconSize &&
                    localPos?.[1] >= iconY &&
                    localPos?.[1] <= iconY + helpIconSize
                ) {
                    toggleHelp(this);
                    return true;
                }
                return onMouseDown?.apply(this, arguments);
            };

            // 帮助按钮悬停高亮
            const onMouseMove = nodeType.prototype.onMouseMove;
            nodeType.prototype.onMouseMove = function (event, localPos, canvas) {
                const result = onMouseMove?.apply(this, arguments);
                const iconX = this.size[0] - helpIconSize - helpIconMargin;
                const titleHeight = getTitleHeight();
                const iconY = -titleHeight + (titleHeight - helpIconSize) / 2;
                const hovered = !!localPos
                    && localPos[0] >= iconX && localPos[0] <= iconX + helpIconSize
                    && localPos[1] >= iconY && localPos[1] <= iconY + helpIconSize;
                if (hovered !== this.__textEditorHelpHovered) {
                    this.__textEditorHelpHovered = hovered;
                    this.setDirtyCanvas(true, true);
                }
                return result;
            };

            const onMouseLeave = nodeType.prototype.onMouseLeave;
            nodeType.prototype.onMouseLeave = function () {
                const result = onMouseLeave?.apply(this, arguments);
                if (this.__textEditorHelpHovered) {
                    this.__textEditorHelpHovered = false;
                    this.setDirtyCanvas(true, true);
                }
                return result;
            };

            nodeType.prototype.onRemoved = function () {
                if (this._textEditorExecutionListener) {
                    api.removeEventListener("executing", this._textEditorExecutionListener);
                    this._textEditorExecutionListener = null;
                }
                closeHelp(this);
                return onRemoved?.apply(this, arguments);
            };
        }
    },
    setup() {
    },
});
