import { app } from "../../../scripts/app.js";
import { drawNodeHelpButton } from "./node_title_icons.js";

const i18n = {
    zh: {
        swapSize: "🔃 尺寸互换",
        nodeTitle: "图像纵横比节点",
        description: "用于设置图像的纵横比和尺寸，支持多种模型的预设尺寸，可快速选择常用比例或自定义尺寸。",
        featuresTitle: "功能",
        feature1: "支持多种模型的预设尺寸（Qwen、Flux、Wan、SDXL等）",
        feature2: "提供常用纵横比快速选择",
        feature3: "支持自定义尺寸和宽高锁定",
        feature4: "支持批量大小设置",
        feature5: "输出潜空间张量",
        usageTitle: "使用说明",
        presetMode: "预设模式",
        presetModeDesc: "选择模型预设，自动提供该模型支持的尺寸选项",
        customMode: "自定义模式",
        customModeDesc: "手动输入宽度和高度，可选择锁定纵横比",
        batchSize: "批量大小",
        batchSizeDesc: "设置生成的潜空间批量大小",
        outputTitle: "输出",
        outputWidth: "宽度：输出图像宽度",
        outputHeight: "高度：输出图像高度",
        outputLatent: "潜空间：生成的潜空间张量"
    },
    en: {
        swapSize: "🔃 Swap Size",
        nodeTitle: "Image Aspect Ratio Node",
        description: "Used to set image aspect ratio and dimensions, supporting preset dimensions for multiple models, with quick selection of common ratios or custom sizes.",
        featuresTitle: "Features",
        feature1: "Supports preset dimensions for multiple models (Qwen, Flux, Wan, SDXL, etc.)",
        feature2: "Provides quick selection of common aspect ratios",
        feature3: "Supports custom dimensions and aspect ratio locking",
        feature4: "Supports batch size setting",
        feature5: "Outputs latent space tensor",
        usageTitle: "Usage",
        presetMode: "Preset Mode",
        presetModeDesc: "Select model preset to automatically provide size options supported by that model",
        customMode: "Custom Mode",
        customModeDesc: "Manually input width and height, with option to lock aspect ratio",
        batchSize: "Batch Size",
        batchSizeDesc: "Set batch size for generated latent space",
        outputTitle: "Output",
        outputWidth: "Width: Output image width",
        outputHeight: "Height: Output image height",
        outputLatent: "Latent: Generated latent space tensor"
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

function getDescriptionHTML() {
    return `<h3 style="margin:0 0 12px 0;color:#60a5fa;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(96, 165, 250, 0.2);letter-spacing:0.2px;">${$t('nodeTitle')}</h3>
<p style="margin:0 0 16px 0;color:#e2e8f0;">${$t('description')}</p>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('featuresTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature4')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature5')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('usageTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${$t('presetMode')}</strong>: <span style="color:#e2e8f0;">${$t('presetModeDesc')}</span></li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${$t('customMode')}</strong>: <span style="color:#e2e8f0;">${$t('customModeDesc')}</span></li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${$t('batchSize')}</strong>: <span style="color:#e2e8f0;">${$t('batchSizeDesc')}</span></li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('outputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('outputWidth')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('outputHeight')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('outputLatent')}</li>
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

let aspectRatioPresetsCache = null;

app.registerExtension({
    name: "ImageAspectRatio",

    async setup() {
        try {
            const res = await fetch("/zhihui_nodes/aspect_ratio/presets");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            aspectRatioPresetsCache = await res.json();
        } catch (e) {
            console.warn("[ImageAspectRatio] 预设数据加载失败，使用空数据回退：", e);
            aspectRatioPresetsCache = {};
        }
    },

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ImageAspectRatio") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                this.initialized = true;
                this._imageAspectRatioHelp = false;
                this._imageAspectRatioLocale = getLocale();
                this._lastModeWasCustom = null;
                this._controlsRepositioned = false;
                
                this.lastCustomSize = { width: 1328, height: 1328 };
                this.lastPresetSize = null;

                for (const w of this.widgets || []) {
                    if (w.name === "custom_width" || w.name === "custom_height" || w.name === "aspect_lock") {
                        w.hidden = true;
                    }
                }

                const PRESETS_DATA = aspectRatioPresetsCache || {};

                const ALL_CATEGORIES = [...new Set(
                    Object.values(PRESETS_DATA).flatMap(categories => Object.keys(categories))
                )].sort();

                const setComboOptions = (widget, values) => {
                    if (!widget) return;
                    if (Array.isArray(widget.options)) {
                        widget.options = values;
                    } else if (widget.options && Array.isArray(widget.options.values)) {
                        widget.options.values = values;
                    } else {
                        widget.options = values;
                    }
                };

                const getCategoriesByMode = (mode) => {
                    const data = PRESETS_DATA[mode];
                    if (!data) return [];
                    return Object.keys(data).sort();
                };

                const getSizesByCategory = (mode, category) => {
                    const data = PRESETS_DATA[mode];
                    if (!data || !data[category]) return [];
                    return data[category];
                };

                const applyCategoryOptionsByMode = (mode, categoryWidget) => {
                    const categories = getCategoriesByMode(mode);
                    setComboOptions(categoryWidget, categories);
                    if (categories.length > 0 && !categories.includes(categoryWidget.value)) {
                        categoryWidget.value = categories[0];
                    }
                    return categories;
                };

                const applySizeOptionsByCategory = (mode, category, sizeWidget) => {
                    const sizes = getSizesByCategory(mode, category);
                    setComboOptions(sizeWidget, sizes);
                    if (sizes.length > 0 && !sizes.includes(sizeWidget.value)) {
                        sizeWidget.value = sizes[0];
                    }
                    return sizes;
                };

                this.swapAll = function() {
                    const modeWidget = this.widgets.find(w => w.name === "preset_mode");
                    const categoryWidget = this.widgets.find(w => w.name === "aspect_category");
                    const sizeWidget = this.widgets.find(w => w.name === "aspect_size");
                    const widthWidget = this.widgets.find(w => w.name === "custom_width");
                    const heightWidget = this.widgets.find(w => w.name === "custom_height");
                    
                    if (!modeWidget) return;
                    
                    const isCustom = modeWidget.value === "Custom Size";
                    
                    if (isCustom) {
                        if (widthWidget && heightWidget) {
                            const currentWidth = parseInt(widthWidget.value) || 1328;
                            const currentHeight = parseInt(heightWidget.value) || 1328;
                            
                            widthWidget.value = currentHeight;
                            heightWidget.value = currentWidth;
                            
                            this.lastCustomSize = {
                                width: currentHeight,
                                height: currentWidth
                            };
                            
                            if (this.aspectRatio && this.aspectRatio > 0) {
                                this.aspectRatio = currentHeight / currentWidth;
                                this.lastWidth = currentHeight;
                                this.lastHeight = currentWidth;
                            }
                        }
                    } else {
                        if (categoryWidget && sizeWidget) {
                            const currentCategory = categoryWidget.value;
                            const currentSizeValue = sizeWidget.value;
                            const swappedCategory = this.getSwappedRatio(currentCategory);
                            
                            if (swappedCategory && swappedCategory !== currentCategory) {
                                const categories = getCategoriesByMode(modeWidget.value);
                                if (categories.includes(swappedCategory)) {
                                    categoryWidget.value = swappedCategory;
                                    
                                    const sizeMatch = currentSizeValue.match(/(\d+)\s*[x×]\s*(\d+)/i);
                                    let swappedSizeValue = null;
                                    
                                    if (sizeMatch) {
                                        const width = parseInt(sizeMatch[1]);
                                        const height = parseInt(sizeMatch[2]);
                                        const swappedSizeStr = `${height}x${width}`;
                                        
                                        const newSizes = getSizesByCategory(modeWidget.value, swappedCategory);
                                        swappedSizeValue = newSizes.find(s => {
                                            const m = s.match(/(\d+)\s*[x×]\s*(\d+)/i);
                                            return m && parseInt(m[1]) === height && parseInt(m[2]) === width;
                                        });
                                    }
                                    
                                    applySizeOptionsByCategory(modeWidget.value, swappedCategory, sizeWidget);
                                    
                                    if (swappedSizeValue) {
                                        sizeWidget.value = swappedSizeValue;
                                    }
                                }
                            }
                        }
                    }
                    
                    this.callback();
                    app.graph.setDirtyCanvas(true, true);
                };

                this.getSwappedRatio = function(ratio) {
                    const swapMap = {
                        "16:9": "9:16",
                        "9:16": "16:9",
                        "16:10": "10:16",
                        "10:16": "16:10",
                        "4:3": "3:4",
                        "3:4": "4:3",
                        "3:2": "2:3",
                        "2:3": "3:2",
                        "21:9": "9:21",
                        "9:21": "21:9",
                        "9:8": "8:9",
                        "8:9": "9:8",
                        "9:7": "7:9",
                        "7:9": "9:7",
                        "7:4": "4:7",
                        "4:7": "7:4",
                        "12:5": "5:12",
                        "5:12": "12:5",
                        "2.35:1": "1:2.35",
                        "1:2.35": "2.35:1",
                        "4:5": "5:4",
                        "5:4": "4:5",
                    };
                    return swapMap[ratio] || ratio;
                };

                this.repositionCustomControls = function(isCustom) {
                    if (this._lastModeWasCustom === isCustom && this._controlsRepositioned) {
                        return;
                    }
                    
                    this._lastModeWasCustom = isCustom;
                    this._controlsRepositioned = true;
                    
                    const widgets = this.widgets || [];
                    const modeIdx = widgets.findIndex(w => w && w.name === "preset_mode");
                    const categoryIdx = widgets.findIndex(w => w && w.name === "aspect_category");
                    const sizeIdx = widgets.findIndex(w => w && w.name === "aspect_size");
                    const widthIdx = widgets.findIndex(w => w && w.name === "custom_width");
                    const heightIdx = widgets.findIndex(w => w && w.name === "custom_height");
                    const lockIdx = widgets.findIndex(w => w && w.name === "aspect_lock");
                    const swapIdx = widgets.findIndex(w => w && w.name === $t('swapSize'));
                    
                    if (modeIdx < 0 || categoryIdx < 0 || sizeIdx < 0 || widthIdx < 0 || heightIdx < 0 || lockIdx < 0) return;
                    
                    const categoryWidget = widgets[categoryIdx];
                    const sizeWidget = widgets[sizeIdx];
                    const widthWidget = widgets[widthIdx];
                    const heightWidget = widgets[heightIdx];
                    const lockWidget = widgets[lockIdx];
                    let swapWidget = swapIdx >= 0 ? widgets[swapIdx] : null;
                    
                    if (!isCustom) {
                        this.lastCustomSize = {
                            width: parseInt(widthWidget.value) || 1328,
                            height: parseInt(heightWidget.value) || 1328
                        };
                    }
                    
                    const indicesToRemove = [categoryIdx, sizeIdx, widthIdx, heightIdx, lockIdx, swapIdx].filter(idx => idx >= 0).sort((a, b) => b - a);
                    for (const idx of indicesToRemove) {
                        widgets.splice(idx, 1);
                    }
                    
                    if (isCustom) {
                        widgets.splice(modeIdx + 1, 0, widthWidget, heightWidget, lockWidget);
                        
                        if (!swapWidget) {
                            swapWidget = this.addWidget("button", $t('swapSize'), null, () => {
                                this.swapAll();
                            });
                            const curIdx = widgets.indexOf(swapWidget);
                            if (curIdx >= 0) widgets.splice(curIdx, 1);
                        }

                        widgets.push(swapWidget);
                        
                        categoryWidget.hidden = true;
                        sizeWidget.hidden = true;
                        widthWidget.hidden = false;
                        heightWidget.hidden = false;
                        lockWidget.hidden = false;
                        if (swapWidget) {
                            swapWidget.hidden = false;
                        }
                        widthWidget.value = this.lastCustomSize.width;
                        heightWidget.value = this.lastCustomSize.height;
                        widgets.push(categoryWidget, sizeWidget);
                    } else {
                        widgets.splice(modeIdx + 1, 0, categoryWidget, sizeWidget);
                        
                        if (!swapWidget) {
                            swapWidget = this.addWidget("button", $t('swapSize'), null, () => {
                                this.swapAll();
                            });
                            const curIdx = widgets.indexOf(swapWidget);
                            if (curIdx >= 0) widgets.splice(curIdx, 1);
                        }
                        
                        widgets.splice(modeIdx + 3, 0, swapWidget);
                        
                        categoryWidget.hidden = false;
                        sizeWidget.hidden = false;
                        widthWidget.hidden = true;
                        heightWidget.hidden = true;
                        lockWidget.hidden = true;
                        widgets.push(widthWidget, heightWidget, lockWidget);
                        if (swapWidget) {
                            swapWidget.hidden = false;
                        }
                    }
                    
                    app.graph.setDirtyCanvas(true, true);
                };

                const originalCallback = this.callback;
                this.callback = function() {
                    if (originalCallback) {
                        originalCallback.apply(this, arguments);
                    }
                    
                    const categoryWidget = this.widgets.find(w => w.name === "aspect_category");
                    const sizeWidget = this.widgets.find(w => w.name === "aspect_size");
                    const widthWidget = this.widgets.find(w => w.name === "custom_width");
                    const heightWidget = this.widgets.find(w => w.name === "custom_height");
                    const lockWidget = this.widgets.find(w => w.name === "aspect_lock");
                    const modeWidget = this.widgets.find(w => w.name === "preset_mode");
                    
                    if (!categoryWidget || !sizeWidget || !widthWidget || !heightWidget || !lockWidget || !modeWidget) {
                        return;
                    }

                    const isCustom = modeWidget.value === "Custom Size";
                    
                    this.repositionCustomControls(isCustom);
                    
                    if (!isCustom) {
                        lockWidget.value = false;
                        this.aspectRatio = null;
                        return;
                    }
                    
                    if (widthWidget.value === '' || widthWidget.value === null || widthWidget.value === undefined) {
                        widthWidget.value = 1328;
                    }
                    if (heightWidget.value === '' || heightWidget.value === null || heightWidget.value === undefined) {
                        heightWidget.value = 1328;
                    }
                    
                    this.lastWidth = parseInt(widthWidget.value) || 1328;
                    this.lastHeight = parseInt(heightWidget.value) || 1328;
                };
                
                setTimeout(() => {
                    const widthWidget = this.widgets.find(w => w.name === "custom_width");
                    const heightWidget = this.widgets.find(w => w.name === "custom_height");
                    const categoryWidget = this.widgets.find(w => w.name === "aspect_category");
                    const sizeWidget = this.widgets.find(w => w.name === "aspect_size");
                    const lockWidget = this.widgets.find(w => w.name === "aspect_lock");
                    const modeWidget = this.widgets.find(w => w.name === "preset_mode");
                    const batchWidget = this.widgets.find(w => w.name === "batch_size");
                    
                    if (widthWidget && heightWidget && categoryWidget && sizeWidget && lockWidget && modeWidget) {
                        if (widthWidget.value === '' || widthWidget.value === null || widthWidget.value === undefined) {
                            widthWidget.value = 1328;
                        }
                        if (heightWidget.value === '' || heightWidget.value === null || heightWidget.value === undefined) {
                            heightWidget.value = 1328;
                        }
                        if (batchWidget && (batchWidget.value === '' || batchWidget.value === null || batchWidget.value === undefined || batchWidget.value === 1328)) {
                            batchWidget.value = 1;
                        }
                        
                        this.lastWidth = parseInt(widthWidget.value) || 1328;
                        this.lastHeight = parseInt(heightWidget.value) || 1328;
                        this.aspectRatio = this.lastHeight > 0 ? this.lastWidth / this.lastHeight : 1;
                        this.isUpdating = false;
                        
                        const originalCategoryCallback = categoryWidget.callback;
                        const originalSizeCallback = sizeWidget.callback;
                        const originalLockCallback = lockWidget.callback;
                        const originalModeCallback = modeWidget.callback;
                        
                        categoryWidget.callback = () => {
                            if (originalCategoryCallback) originalCategoryCallback.apply(categoryWidget, arguments);
                            applySizeOptionsByCategory(modeWidget.value, categoryWidget.value, sizeWidget);
                            this.callback();
                        };
                        
                        sizeWidget.callback = () => {
                            if (originalSizeCallback) originalSizeCallback.apply(sizeWidget, arguments);
                            this.callback();
                        };
                        
                        lockWidget.callback = () => {
                            if (originalLockCallback) originalLockCallback.apply(lockWidget, arguments);
                            if (lockWidget.value) {
                                const currentWidth = parseInt(widthWidget.value) || 1328;
                                const currentHeight = parseInt(heightWidget.value) || 1328;
                                if (currentHeight > 0) {
                                    this.aspectRatio = currentWidth / currentHeight;
                                    this.lastWidth = currentWidth;
                                    this.lastHeight = currentHeight;
                                } else {
                                    this.aspectRatio = 1;
                                    this.lastWidth = 1328;
                                    this.lastHeight = 1328;
                                }
                            }
                            this.lastCustomSize = {
                                width: parseInt(widthWidget.value) || 1328,
                                height: parseInt(heightWidget.value) || 1328
                            };
                            this.callback();
                        };

                        modeWidget.callback = () => {
                            if (originalModeCallback) originalModeCallback.apply(modeWidget, arguments);
                            
                            const isCustom = modeWidget.value === "Custom Size";
                            
                            if (this._lastModeWasCustom !== isCustom) {
                                this._controlsRepositioned = false;
                            }
                            
                            if (!isCustom) {
                                applyCategoryOptionsByMode(modeWidget.value, categoryWidget);
                                applySizeOptionsByCategory(modeWidget.value, categoryWidget.value, sizeWidget);
                            }
                            
                            this.repositionCustomControls(isCustom);
                            
                            this.callback();
                        };
                        
                        this.aspectRatioTimer = setInterval(() => {
                            if (lockWidget.value && modeWidget.value === "Custom Size") {
                                const currentWidth = parseInt(widthWidget.value) || 0;
                                const currentHeight = parseInt(heightWidget.value) || 0;
                                
                                if (!this.aspectRatio && currentWidth > 0 && currentHeight > 0) {
                                    this.aspectRatio = currentWidth / currentHeight;
                                    this.lastWidth = currentWidth;
                                    this.lastHeight = currentHeight;
                                }
                                
                                if (this.aspectRatio && (currentWidth !== this.lastWidth || currentHeight !== this.lastHeight)) {
                                    if (!this.isUpdating) {
                                        this.isUpdating = true;
                                        
                                        if (currentWidth !== this.lastWidth && currentWidth > 0) {
                                            const newHeight = Math.round(currentWidth / this.aspectRatio);
                                            if (!isNaN(newHeight) && newHeight > 0) {
                                                heightWidget.value = newHeight;
                                                this.lastHeight = newHeight;
                                            }
                                            this.lastWidth = currentWidth;
                                        } else if (currentHeight !== this.lastHeight && currentHeight > 0) {
                                            const newWidth = Math.round(currentHeight * this.aspectRatio);
                                            if (!isNaN(newWidth) && newWidth > 0) {
                                                widthWidget.value = newWidth;
                                                this.lastWidth = newWidth;
                                            }
                                            this.lastHeight = currentHeight;
                                        }
                                        
                                        this.lastCustomSize = {
                                            width: parseInt(widthWidget.value) || 1328,
                                            height: parseInt(heightWidget.value) || 1328
                                        };
                                        
                                        this.isUpdating = false;
                                    }
                                }
                            }
                        }, 100);
                        
                        applyCategoryOptionsByMode(modeWidget.value, categoryWidget);
                        applySizeOptionsByCategory(modeWidget.value, categoryWidget.value, sizeWidget);
                        
                        const isCustom = modeWidget.value === "Custom Size";
                        this.repositionCustomControls(isCustom);
                        
                        this.callback();
                    }
                }, 100);
                
                return r;
            };

            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function() {
                this._controlsRepositioned = false;
                this._lastModeWasCustom = null;
                
                const modeWidget = this.widgets?.find(w => w.name === "preset_mode");
                const isCustom = modeWidget?.value === "Custom Size";
                
                for (const w of this.widgets || []) {
                    if (isCustom) {
                        if (w.name === "aspect_category" || w.name === "aspect_size") {
                            w.hidden = true;
                        }
                    } else {
                        if (w.name === "custom_width" || w.name === "custom_height" || w.name === "aspect_lock") {
                            w.hidden = true;
                        }
                    }
                }
                
                if (onConfigure) {
                    onConfigure.apply(this, arguments);
                }
            };

            const iconSize = 24;
            const iconMargin = 4;
            let helpElement = null;
            let currentHelpLocale = null;

            const drawFg = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const currentLocale = getLocale();
                if (this._imageAspectRatioLocale !== currentLocale) {
                    this._imageAspectRatioLocale = currentLocale;
                }
                
                const r = drawFg ? drawFg.apply(this, arguments) : undefined;
                if (this.flags.collapsed) return r;

                const x = this.size[0] - iconSize - iconMargin;
                const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;

                if (this._imageAspectRatioHelp && helpElement === null) {
                    currentHelpLocale = currentLocale;
                    helpElement = createHelpPopup(getDescriptionHTML(), () => {
                        this._imageAspectRatioHelp = false;
                        helpElement = null;
                    });
                }
                else if (!this._imageAspectRatioHelp && helpElement !== null) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                else if (this._imageAspectRatioHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                    helpElement.querySelector('div').innerHTML = getDescriptionHTML();
                    currentHelpLocale = currentLocale;
                }

                if (this._imageAspectRatioHelp && helpElement !== null) {
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
                const helpActive = !!(this._imageAspectRatioHelp || this._imageAspectRatioHelpHovered);

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
                    this._imageAspectRatioHelp = !this._imageAspectRatioHelp;
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
                if (hovered !== this._imageAspectRatioHelpHovered) {
                    this._imageAspectRatioHelpHovered = hovered;
                    this.setDirtyCanvas(true, true);
                }
                return r;
            };

            const mouseLeave = nodeType.prototype.onMouseLeave;
            nodeType.prototype.onMouseLeave = function () {
                const r = mouseLeave ? mouseLeave.apply(this, arguments) : undefined;
                if (this._imageAspectRatioHelpHovered) {
                    this._imageAspectRatioHelpHovered = false;
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
    },
});