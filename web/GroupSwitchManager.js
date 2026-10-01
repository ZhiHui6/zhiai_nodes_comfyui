import { app } from "/scripts/app.js";
import { drawNodeHelpButton } from "./node_title_icons.js";

const i18n = {
    zh: {
        title: "组开关管理器",
        colorFilter: "颜色过滤",
        colorFilterTitle: "按颜色过滤组",
        allColors: "所有",
        refresh: "刷新",
        dragSort: "拖拽排序",
        navigateToGroup: "跳转到组",
        linkageConfig: "联动配置：",
        whenGroupOn: "组开启时",
        whenGroupOff: "组关闭时",
        cancel: "取消",
        confirm: "确定",
        enable: "开启",
        disable: "关闭",
        modeLabel: "运行模式",
        modeDisable: "禁用模式",
        modeBypass: "忽略模式",
        colorRed: "红色",
        colorBrown: "棕色",
        colorGreen: "绿色",
        colorBlue: "蓝色",
        colorPaleBlue: "浅蓝色",
        colorCyan: "青色",
        colorPurple: "紫色",
        colorYellow: "黄色",
        colorBlack: "黑色",
        settings: "设置",
        matchMode: "匹配模式",
        matchColors: "匹配颜色",
        matchTitle: "匹配标题",
        matchNone: "无匹配",
        navigateIndicator: "导航指示",
        show: "显示",
        hide: "隐藏",
        toggleRestriction: "切换限制",
        restrictionUnlimited: "无限制",
        restrictionAlwaysOne: "始终一个",
        matchTitlePlaceholder: "输入标题关键词...",
        matchTitleHelp: "使用逗号分隔多个关键词",
        helpTitle: "组开关管理器",
        helpDesc: "用于可视化管理工作流中的组开关状态，并配置组之间的联动规则。",
        helpFeaturesTitle: "功能",
        helpFeature1: "显示工作流中的所有组及其当前状态",
        helpFeature2: "点击开关按钮快速启用/禁用组",
        helpFeature3: "支持按颜色或标题关键词过滤组",
        helpFeature4: "配置组之间的联动规则（当一个组状态改变时，自动触发其他组的状态变化）",
        helpFeature5: "支持拖拽排序组列表",
        helpFeature6: "点击定位按钮快速跳转到组的位置",
        helpUsageTitle: "使用说明",
        helpUsage1: "开关按钮：点击可切换组的启用/禁用状态",
        helpUsage2: "联动按钮：点击配置该组的联动规则",
        helpUsage3: "定位按钮：点击在画布中定位到该组",
        helpUsage4: "设置按钮：配置运行模式、匹配模式等选项",
        helpUsage5: "刷新按钮：手动刷新组列表",
        helpModeTitle: "运行模式",
        helpModeDisable: "禁用模式：关闭的组会被禁用（不参与执行）",
        helpModeBypass: "忽略模式：关闭的组会被忽略（但节点仍会执行）"
    },
    en: {
        title: "Group Switch Manager",
        colorFilter: "Color Filter",
        colorFilterTitle: "Filter groups by color",
        allColors: "All",
        refresh: "Refresh",
        dragSort: "Drag to sort",
        navigateToGroup: "Navigate to group",
        linkageConfig: "Linkage Config: ",
        whenGroupOn: "When Group ON",
        whenGroupOff: "When Group OFF",
        cancel: "Cancel",
        confirm: "Confirm",
        enable: "Enable",
        disable: "Disable",
        modeLabel: "Execution Mode",
        modeDisable: "Disable Mode",
        modeBypass: "Bypass Mode",
        colorRed: "Red",
        colorBrown: "Brown",
        colorGreen: "Green",
        colorBlue: "Blue",
        colorPaleBlue: "Pale Blue",
        colorCyan: "Cyan",
        colorPurple: "Purple",
        colorYellow: "Yellow",
        colorBlack: "Black",
        settings: "Settings",
        matchMode: "Match Mode",
        matchColors: "Match Colors",
        matchTitle: "Match Title",
        matchNone: "No Match",
        navigateIndicator: "Navigate Indicator",
        show: "Show",
        hide: "Hide",
        toggleRestriction: "Toggle Restriction",
        restrictionUnlimited: "Unlimited",
        restrictionAlwaysOne: "Always One",
        matchTitlePlaceholder: "Enter title keywords...",
        matchTitleHelp: "Use commas to separate multiple keywords",
        helpTitle: "Group Switch Manager",
        helpDesc: "Used to visually manage group on/off states in the workflow and configure linkage rules between groups.",
        helpFeaturesTitle: "Features",
        helpFeature1: "Display all groups in the workflow and their current status",
        helpFeature2: "Click toggle button to quickly enable/disable groups",
        helpFeature3: "Support filtering groups by color or title keywords",
        helpFeature4: "Configure linkage rules between groups (when one group's state changes, automatically trigger other groups' state changes)",
        helpFeature5: "Support drag-and-drop sorting of group list",
        helpFeature6: "Click navigate button to quickly jump to group's location",
        helpUsageTitle: "Usage",
        helpUsage1: "Toggle Button: Click to switch group's enable/disable state",
        helpUsage2: "Linkage Button: Click to configure linkage rules for this group",
        helpUsage3: "Navigate Button: Click to locate the group on canvas",
        helpUsage4: "Settings Button: Configure execution mode, match mode, etc.",
        helpUsage5: "Refresh Button: Manually refresh group list",
        helpModeTitle: "Execution Mode",
        helpModeDisable: "Disable Mode: Disabled groups will be disabled (not participating in execution)",
        helpModeBypass: "Bypass Mode: Disabled groups will be bypassed (but nodes will still execute)"
    }
};

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function t(key) {
    const locale = getLocale();
    return i18n[locale][key] || i18n['en'][key] || key;
}

let currentLocale = 'zh';
let localeChangeListeners = [];

function onLocaleChange(callback) {
    localeChangeListeners.push(callback);
}

function initLocaleWatcher() {
    currentLocale = getLocale();
    setInterval(() => {
        const newLocale = getLocale();
        if (newLocale !== currentLocale) {
            currentLocale = newLocale;
            localeChangeListeners.forEach(cb => cb(newLocale));
        }
    }, 1000);
}

function getDescriptionHTML() {
    return `<h3 style="margin:0 0 12px 0;color:#60a5fa;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(96, 165, 250, 0.2);letter-spacing:0.2px;">${t('helpTitle')}</h3>
<p style="margin:0 0 16px 0;color:#e2e8f0;">${t('helpDesc')}</p>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('helpFeaturesTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature4')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature5')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpFeature6')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('helpUsageTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpUsage1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpUsage2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpUsage3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpUsage4')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpUsage5')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('helpModeTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpModeDisable')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('helpModeBypass')}</li>
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

function reduceNodesDepthFirst(nodeOrNodes, reduceFn, reduceTo) {
    const nodes = Array.isArray(nodeOrNodes) ? nodeOrNodes : [nodeOrNodes];
    const stack = nodes.map((node) => ({ node }));

    while (stack.length > 0) {
        const { node } = stack.pop();
        const result = reduceFn(node, reduceTo);
        if (result !== undefined && result !== reduceTo) {
            reduceTo = result;
        }

        if (node.isSubgraphNode?.() && node.subgraph) {
            const children = node.subgraph.nodes;
            for (let i = children.length - 1; i >= 0; i--) {
                stack.push({ node: children[i] });
            }
        }
    }
    return reduceTo;
}

function changeModeOfNodes(nodeOrNodes, mode) {
    reduceNodesDepthFirst(nodeOrNodes, (n) => {
        n.mode = mode;
    });
}

function getGroupNodes(group) {
    return Array.from(group._children).filter((c) => c instanceof LGraphNode);
}

function normalizeGroupColor(color) {
    if (!color) return '';

    let normalized = String(color).replace('#', '').trim().toLowerCase();
    if (normalized.length === 3) {
        normalized = normalized.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
    }
    return `#${normalized}`;
}

class GroupSwitchManagerService {
    constructor() {
        this.msThreshold = 400;
        this.msLastUpdate = 0;
        this.nodes = [];
        this.runScheduledForMs = null;
        this.runScheduleTimeout = null;
        this.runScheduleAnimation = null;
        this.cachedGroups = null;
        this.cachedGroupStates = null;
    }

    addNode(node) {
        this.nodes.push(node);
        this.scheduleRun(8);
    }

    removeNode(node) {
        const index = this.nodes.indexOf(node);
        if (index > -1) {
            this.nodes.splice(index, 1);
        }
        if (!this.nodes?.length) {
            this.clearScheduledRun();
            this.cachedGroups = null;
            this.cachedGroupStates = null;
        }
    }

    run() {
        if (!this.runScheduledForMs) {
            return;
        }
        for (const node of this.nodes) {
            node.refreshWidgets();
        }
        this.clearScheduledRun();
        this.scheduleRun();
    }

    scheduleRun(ms = 500) {
        if (this.runScheduledForMs && ms < this.runScheduledForMs) {
            this.clearScheduledRun();
        }
        if (!this.runScheduledForMs && this.nodes.length) {
            this.runScheduledForMs = ms;
            this.runScheduleTimeout = setTimeout(() => {
                this.runScheduleAnimation = requestAnimationFrame(() => this.run());
            }, ms);
        }
    }

    clearScheduledRun() {
        this.runScheduleTimeout && clearTimeout(this.runScheduleTimeout);
        this.runScheduleAnimation && cancelAnimationFrame(this.runScheduleAnimation);
        this.runScheduleTimeout = null;
        this.runScheduleAnimation = null;
        this.runScheduledForMs = null;
    }

    getGroups() {
        const now = Date.now();
        if (!this.cachedGroups || now - this.msLastUpdate > this.msThreshold) {
            this.cachedGroups = this.computeGroups();
            this.msLastUpdate = now;
        }
        return this.cachedGroups;
    }

    computeGroups() {
        if (!app.graph || !app.graph._groups) return [];
        const groups = [...app.graph._groups].filter(g => g && g.title);
        for (const group of groups) {
            const nodes = getGroupNodes(group);
            group._gmm_hasAnyActiveNode = nodes.some(n => n.mode === 0);
        }
        return groups;
    }

    getGroupStates() {
        if (!this.cachedGroupStates) {
            this.cachedGroupStates = this.computeGroupStates();
            setTimeout(() => {
                this.cachedGroupStates = null;
            }, 50);
        }
        return this.cachedGroupStates;
    }

    computeGroupStates() {
        const states = new Map();
        if (!app.graph || !app.graph._groups) return states;
        
        for (const group of app.graph._groups) {
            if (!group || !group.title) continue;
            const nodes = getGroupNodes(group);
            const hasActiveNode = nodes.some(n => n.mode === 0);
            states.set(group, {
                enabled: hasActiveNode,
                group: group
            });
        }
        return states;
    }
}

const GMM_SERVICE = new GroupSwitchManagerService();

app.registerExtension({
    name: "GroupSwitchManager",

    async init(app) {
        initLocaleWatcher();
    },

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== "GroupSwitchManager") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated?.apply(this, arguments);

            this._gmmInstanceId = `gmm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            this.properties = this.properties || {};
            this.properties.groups = this.properties.groups || [];
            this.properties.selectedColorFilter = this.properties.selectedColorFilter || 'red';
            this.properties.groupOrder = this.properties.groupOrder || [];
            this.properties.groupStatesCache = this.properties.groupStatesCache || {};
            this.properties.switchMode = this.properties.switchMode || 'bypass';
            this.properties.matchMode = this.properties.matchMode || 'none';
            this.properties.titleKeywords = this.properties.titleKeywords || '';
            this.properties.toggleRestriction = this.properties.toggleRestriction || 'unlimited';
            this.properties.showNavigateIndicator = this.properties.showNavigateIndicator !== undefined ? this.properties.showNavigateIndicator : true;
            this.groupReferences = new WeakMap();
            this.groupKeys = new WeakMap();
            this.groupConfigReferences = new WeakMap();
            this._processingStack = new Set();
            this.size = [400, 500];
            this._gmmHelp = false;
            this._gmmHelpElement = null;
            this._gmmHelpLocale = getLocale();
            this.createCustomUI();
            this._gmmEventHandler = (e) => {
                if (e.detail && e.detail.sourceId !== this._gmmInstanceId) {
                    this.updateGroupsList();
                }
            };

            window.addEventListener('group-mute-changed', this._gmmEventHandler);

            return result;
        };

        const onAdded = nodeType.prototype.onAdded;
        nodeType.prototype.onAdded = function (graph) {
            onAdded?.apply(this, arguments);
            GMM_SERVICE.addNode(this);
        };

        const onRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function () {
            GMM_SERVICE.removeNode(this);
            if (this._gmmEventHandler) {
                window.removeEventListener('group-mute-changed', this._gmmEventHandler);
            }
            if (this._localeChangeHandler) {
                const index = localeChangeListeners.indexOf(this._localeChangeHandler);
                if (index > -1) {
                    localeChangeListeners.splice(index, 1);
                }
            }
            if (this._gmmHelpElement) {
                this._gmmHelpElement.remove();
                this._gmmHelpElement = null;
            }
            onRemoved?.apply(this, arguments);
        };

        nodeType.prototype.createCustomUI = function () {
            try {
                const container = document.createElement('div');
                container.className = 'gmm-container';

                this.addStyles();

                container.innerHTML = `
                <div class="gmm-content">
                    <div class="gmm-groups-header">
                        <div class="gmm-header-controls">
                            <span class="gmm-mode-indicator" id="gmm-mode-indicator">${t('modeDisable')}</span>
                            <button class="gmm-settings-button" id="gmm-settings-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                                </svg>
                            </button>
                            <button class="gmm-refresh-button" id="gmm-refresh">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="gmm-groups-list" id="gmm-groups-list"></div>
                </div>
            `;

                this.addDOMWidget("gmm_ui", "div", container);
                this.customUI = container;
                this.bindUIEvents();
                this.updateModeIndicator();
                this.updateGroupsList();

                setTimeout(() => {
                    this.refreshColorFilter();
                }, 50);

                this._localeChangeHandler = (newLocale) => {
                    this.updateUILanguage();
                };
                onLocaleChange(this._localeChangeHandler);

            } catch (error) {
            }
        };

        nodeType.prototype.addStyles = function () {
            if (document.querySelector('#gmm-styles')) return;

            const style = document.createElement('style');
            style.id = 'gmm-styles';
            style.textContent = `
                .gmm-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: #1e1e2e;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 11px;
                    color: #E0E0E0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .gmm-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background: rgba(30, 30, 46, 0.5);
                }

                .gmm-groups-header {
                    padding: 6px 10px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                }

                .gmm-header-controls {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    justify-content: flex-end;
                    flex: 1;
                }

                .gmm-dropdown-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .gmm-dropdown-label {
                    font-size: 10px;
                    color: #B0B0B0;
                    white-space: nowrap;
                    font-weight: 500;
                    width: auto;
                    flex-shrink: 0;
                }

                .gmm-custom-dropdown {
                    position: relative;
                    flex: 1;
                    min-width: 0;
                }

                .gmm-dropdown-trigger {
                    background: linear-gradient(145deg, rgba(50, 50, 70, 0.9) 0%, rgba(40, 40, 60, 0.95) 100%);
                    border: 1px solid rgba(116, 55, 149, 0.5);
                    border-radius: 6px;
                    padding: 5px 8px;
                    color: #F0F0F0;
                    font-size: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 6px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }

                .gmm-dropdown-trigger:hover {
                    background: linear-gradient(145deg, rgba(60, 60, 85, 0.95) 0%, rgba(50, 50, 75, 1) 100%);
                    border-color: rgba(139, 75, 168, 0.7);
                    box-shadow: 0 3px 8px rgba(116, 55, 149, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);
                }

                .gmm-custom-dropdown.open .gmm-dropdown-trigger {
                    border-color: rgba(155, 89, 182, 0.9);
                    background: linear-gradient(145deg, rgba(65, 65, 90, 1) 0%, rgba(55, 55, 80, 1) 100%);
                    box-shadow: 0 0 0 3px rgba(116, 55, 149, 0.2), 0 4px 12px rgba(116, 55, 149, 0.3);
                }

                .gmm-dropdown-text {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                }

                .gmm-dropdown-arrow {
                    flex-shrink: 0;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: rgba(200, 180, 220, 0.8);
                }

                .gmm-custom-dropdown.open .gmm-dropdown-arrow {
                    transform: rotate(180deg);
                    color: rgba(155, 89, 182, 1);
                }

                .gmm-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 4px);
                    left: 0;
                    right: 0;
                    background: linear-gradient(180deg, rgba(45, 45, 65, 0.98) 0%, rgba(35, 35, 55, 0.99) 100%);
                    border: 1px solid rgba(116, 55, 149, 0.4);
                    border-radius: 8px;
                    padding: 4px;
                    z-index: 1000;
                    opacity: 0;
                    transform: translateY(-8px) scale(0.96);
                    transform-origin: top center;
                    pointer-events: none;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(116, 55, 149, 0.2);
                    backdrop-filter: blur(8px);
                    max-height: 200px;
                    overflow-y: auto;
                }

                .gmm-dropdown-menu::-webkit-scrollbar {
                    width: 4px;
                }

                .gmm-dropdown-menu::-webkit-scrollbar-track {
                    background: rgba(30, 30, 45, 0.5);
                    border-radius: 2px;
                }

                .gmm-dropdown-menu::-webkit-scrollbar-thumb {
                    background: rgba(116, 55, 149, 0.5);
                    border-radius: 2px;
                }

                .gmm-dropdown-menu::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 75, 168, 0.7);
                }

                .gmm-custom-dropdown.open .gmm-dropdown-menu {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    pointer-events: auto;
                }

                .gmm-dropdown-item {
                    padding: 8px 12px;
                    color: #D0D0E0;
                    font-size: 13px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    position: relative;
                    font-weight: 400;
                }

                .gmm-dropdown-item:hover {
                    background: rgba(116, 55, 149, 0.25);
                    color: #FFFFFF;
                }

                .gmm-dropdown-item.active {
                    background: linear-gradient(90deg, rgba(116, 55, 149, 0.4) 0%, rgba(139, 75, 168, 0.3) 100%);
                    color: #FFFFFF;
                    font-weight: 500;
                }

                .gmm-dropdown-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 60%;
                    background: linear-gradient(180deg, #9b59b6 0%, #743795 100%);
                    border-radius: 0 2px 2px 0;
                }

                .gmm-dropdown-item:not(:last-child) {
                    margin-bottom: 2px;
                }

                .gmm-dropdown-item.gmm-color-item {
                    position: relative;
                    padding-left: 18px;
                }

                .gmm-dropdown-item.gmm-color-item::before {
                    content: '';
                    position: absolute;
                    left: 6px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--item-color, #888);
                    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
                }

                .gmm-match-filter-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .gmm-color-filter-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                }

                .gmm-groups-title {
                    font-size: 10px;
                    font-weight: 500;
                    color: #B0B0B0;
                }

                .gmm-settings-button {
                    background: rgba(116, 55, 149, 0.2);
                    border: 1px solid rgba(116, 55, 149, 0.3);
                    border-radius: 4px;
                    padding: 0;
                    width: 22px;
                    height: 22px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #B0B0B0;
                    font-size: 11px;
                    flex-shrink: 0;
                    box-sizing: border-box;
                }

                .gmm-settings-button:hover {
                    background: rgba(116, 55, 149, 0.4);
                    border-color: rgba(116, 55, 149, 0.5);
                    color: #E0E0E0;
                }

                .gmm-settings-button svg {
                    width: 12px;
                    height: 12px;
                    stroke: currentColor;
                }

                .gmm-mode-indicator {
                    margin-right: auto;
                    font-size: 12px;
                    color: #8b4ba8;
                    font-weight: 600;
                    padding: 4px 10px;
                    height: 22px;
                    line-height: 14px;
                    background: rgba(116, 55, 149, 0.15);
                    border: 1px solid rgba(116, 55, 149, 0.3);
                    border-radius: 4px;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;
                }

                .gmm-refresh-button {
                    background: rgba(116, 55, 149, 0.2);
                    border: 1px solid rgba(116, 55, 149, 0.3);
                    border-radius: 4px;
                    padding: 0;
                    width: 22px;
                    height: 22px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                }

                .gmm-refresh-button:hover {
                    background: rgba(116, 55, 149, 0.4);
                    border-color: rgba(116, 55, 149, 0.5);
                }

                .gmm-refresh-button svg {
                    width: 10px;
                    height: 10px;
                    stroke: #B0B0B0;
                    stroke-width: 2.5;
                }

                .gmm-groups-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 4px;
                }

                .gmm-groups-list::-webkit-scrollbar {
                    width: 4px;
                }

                .gmm-groups-list::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 2px;
                }

                .gmm-groups-list::-webkit-scrollbar-thumb {
                    background: rgba(116, 55, 149, 0.5);
                    border-radius: 2px;
                }

                .gmm-groups-list::-webkit-scrollbar-thumb:hover {
                    background: rgba(116, 55, 149, 0.7);
                }

                .gmm-group-item {
                    background: linear-gradient(135deg, rgba(42, 42, 62, 0.6) 0%, rgba(58, 58, 78, 0.6) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    padding: 3px 6px;
                    margin-bottom: 2px;
                    transition: all 0.2s ease;
                }

                .gmm-group-item:hover {
                    border-color: rgba(116, 55, 149, 0.5);
                    box-shadow: 0 1px 4px rgba(116, 55, 149, 0.2);
                }

                .gmm-group-header {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .gmm-group-color-indicator {
                    width: 4px;
                    height: 16px;
                    border-radius: 2px;
                    flex-shrink: 0;
                }

                .gmm-group-name {
                    flex: 1;
                    color: #E0E0E0;
                    font-size: 13px;
                    font-weight: 500;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    min-width: 0;
                    transition: color 0.3s ease;
                }

                .gmm-group-name.disabled {
                    color: #666666;
                }

                .gmm-switch {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(116, 55, 149, 0.3) 0%, rgba(139, 75, 168, 0.3) 100%);
                    border: 1px solid rgba(116, 55, 149, 0.5);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    flex-shrink: 0;
                    position: relative;
                    box-sizing: border-box;
                    padding: 0;
                    margin: 0;
                }

                .gmm-switch svg {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 10px;
                    height: 10px;
                    stroke: rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                    display: block;
                    overflow: visible;
                    padding: 0;
                    margin: 0;
                }

                .gmm-switch:hover {
                    box-shadow: 0 0 12px rgba(139, 75, 168, 0.4);
                    transform: scale(1.1);
                }

                .gmm-switch.active {
                    background: linear-gradient(135deg, #743795 0%, #8b4ba8 100%);
                    border-color: #8b4ba8;
                    box-shadow: 0 0 8px rgba(139, 75, 168, 0.6);
                }

                .gmm-switch.active svg {
                    stroke: white;
                }

                .gmm-linkage-button {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: rgba(116, 55, 149, 0.2);
                    border: 1px solid rgba(116, 55, 149, 0.3);
                    transition: all 0.2s ease;
                    cursor: pointer;
                    flex-shrink: 0;
                    position: relative;
                    box-sizing: border-box;
                    padding: 0;
                    margin: 0;
                }

                .gmm-linkage-button svg {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 10px;
                    height: 10px;
                    stroke: #B0B0B0;
                    transition: all 0.2s ease;
                    display: block;
                    overflow: visible;
                    padding: 0;
                    margin: 0;
                }

                .gmm-linkage-button:hover {
                    background: rgba(116, 55, 149, 0.4);
                    border-color: rgba(116, 55, 149, 0.5);
                    transform: scale(1.1);
                }

                .gmm-linkage-button:hover svg {
                    stroke: #E0E0E0;
                }

                .gmm-linkage-button.active {
                    background: linear-gradient(135deg, #743795 0%, #8b4ba8 100%);
                    border-color: #8b4ba8;
                    box-shadow: 0 0 8px rgba(139, 75, 168, 0.6);
                }

                .gmm-linkage-button.active svg {
                    stroke: white;
                }

                .gmm-navigate-button {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    background: rgba(74, 144, 226, 0.2);
                    border: 1px solid rgba(74, 144, 226, 0.3);
                    transition: all 0.2s ease;
                    cursor: pointer;
                    flex-shrink: 0;
                    position: relative;
                    box-sizing: border-box;
                    padding: 0;
                    margin: 0;
                }

                .gmm-navigate-button svg {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 10px;
                    height: 10px;
                    stroke: #4A90E2;
                    transition: all 0.2s ease;
                    display: block;
                    overflow: visible;
                    padding: 0;
                    margin: 0;
                }

                .gmm-navigate-button:hover {
                    background: rgba(74, 144, 226, 0.4);
                    border-color: rgba(74, 144, 226, 0.6);
                    transform: scale(1.1);
                }

                .gmm-navigate-button:hover svg {
                    stroke: #6FA8E8;
                }

                @keyframes gmmFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* 联动配置对话框 */
                .gmm-linkage-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    background: #1e1e2e;
                    border: 1px solid rgba(116, 55, 149, 0.5);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(116, 55, 149, 0.2);
                    padding: 16px;
                    min-width: 280px;
                    max-width: 340px;
                    z-index: 10000;
                    opacity: 0;
                    animation: gmmDialogShow 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                @keyframes gmmDialogShow {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .gmm-linkage-dialog.closing {
                    animation: gmmDialogHide 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                @keyframes gmmDialogHide {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                }

                .gmm-dialog-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .gmm-dialog-header h3 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #E0E0E0;
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    min-width: 0;
                    padding-right: 12px;
                }

                .gmm-dialog-close {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    background: rgba(220, 38, 38, 0.2);
                    border: 1px solid rgba(220, 38, 38, 0.3);
                    color: #E0E0E0;
                    font-size: 16px;
                    line-height: 22px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .gmm-dialog-close:hover {
                    background: rgba(220, 38, 38, 0.4);
                    border-color: rgba(220, 38, 38, 0.5);
                }

                .gmm-linkage-section {
                    margin-bottom: 16px;
                }

                .gmm-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .gmm-section-header span {
                    font-size: 13px;
                    font-weight: 600;
                    color: #B0B0B0;
                }

                .gmm-add-rule {
                    width: 22px;
                    height: 22px;
                    border-radius: 6px;
                    background: linear-gradient(135deg, #743795 0%, #8b4ba8 100%);
                    border: none;
                    color: white;
                    font-size: 16px;
                    line-height: 22px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .gmm-add-rule:hover {
                    background: linear-gradient(135deg, #8b4ba8 0%, #a35dbe 100%);
                }

                .gmm-rules-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .gmm-rule-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 8px;
                    background: rgba(42, 42, 62, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    animation: gmmFadeIn 0.3s ease-out;
                }

                .gmm-rule-item .gmm-custom-dropdown {
                    flex: 1;
                    min-width: 0;
                }

                .gmm-rule-item .gmm-dropdown-trigger {
                    padding: 4px 8px;
                    font-size: 12px;
                    width: 100%;
                    box-sizing: border-box;
                }

                .gmm-rule-item .gmm-rule-action-dropdown {
                    flex: 0 0 auto;
                    width: 80px;
                }

                .gmm-rule-item .gmm-dropdown-menu {
                    max-height: 120px;
                }

                .gmm-delete-rule {
                    width: 22px;
                    height: 22px;
                    border-radius: 6px;
                    background: linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(185, 28, 28, 0.8) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .gmm-delete-rule:hover {
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%);
                }

                .gmm-dialog-footer {
                    display: flex;
                    gap: 10px;
                    margin-top: 16px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .gmm-button {
                    flex: 1;
                    padding: 10px 16px;
                    background: linear-gradient(135deg, rgba(64, 64, 84, 0.8) 0%, rgba(74, 74, 94, 0.8) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #E0E0E0;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .gmm-button:hover {
                    background: linear-gradient(135deg, rgba(84, 84, 104, 0.9) 0%, rgba(94, 94, 114, 0.9) 100%);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .gmm-button-primary {
                    background: linear-gradient(135deg, #743795 0%, #8b4ba8 100%);
                    border: 1px solid rgba(139, 75, 168, 0.5);
                }

                .gmm-button-primary:hover {
                    background: linear-gradient(135deg, #8b4ba8 0%, #a35dbe 100%);
                    box-shadow: 0 4px 12px rgba(116, 55, 149, 0.4);
                }

                .gmm-settings-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    background: #1e1e2e;
                    border: 1px solid rgba(116, 55, 149, 0.5);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(116, 55, 149, 0.2);
                    padding: 16px;
                    min-width: 280px;
                    max-width: 340px;
                    z-index: 10000;
                    opacity: 0;
                    animation: gmmDialogShow 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .gmm-settings-dialog.closing {
                    animation: gmmDialogHide 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .gmm-settings-dialog-content {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .gmm-settings-dialog-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #E0E0E0;
                    margin: 0 0 12px 0;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(116, 55, 149, 0.3);
                }

                .gmm-settings-dialog-item {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 12px;
                }

                .gmm-settings-dialog-label {
                    font-size: 13px;
                    color: #B0B0B0;
                    font-weight: 500;
                    flex: 0 0 auto;
                    width: 120px;
                }

                .gmm-settings-dialog .gmm-custom-dropdown {
                    flex: 1;
                    width: auto;
                }

                .gmm-settings-dialog .gmm-dropdown-trigger {
                    padding: 8px 12px;
                    font-size: 14px;
                    width: 100%;
                }

                .gmm-drag-handle {
                    width: 16px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: grab;
                    flex-shrink: 0;
                    opacity: 0.5;
                    transition: all 0.2s ease;
                    margin-right: 4px;
                    border-radius: 3px;
                    background: transparent;
                }

                .gmm-drag-handle:hover {
                    opacity: 1;
                    background: rgba(116, 55, 149, 0.15);
                }

                .gmm-drag-handle:active {
                    cursor: grabbing;
                    background: rgba(116, 55, 149, 0.25);
                }

                .gmm-drag-handle svg {
                    width: 12px;
                    height: 12px;
                    stroke: #B0B0B0;
                    stroke-width: 2;
                }

                .gmm-drag-handle:hover svg {
                    stroke: #8b4ba8;
                }

                .gmm-group-item {
                    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease;
                }

                .gmm-group-item[draggable="true"] {
                    cursor: grab;
                }

                .gmm-group-item[draggable="true"]:active {
                    cursor: grabbing;
                }

                .gmm-group-item.gmm-dragging {
                    opacity: 0.4;
                    transform: scale(0.98);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    z-index: 100;
                }

                .gmm-group-item.gmm-drag-over {
                    border: 2px solid #8b4ba8;
                    background: linear-gradient(135deg, rgba(116, 55, 149, 0.25) 0%, rgba(139, 75, 168, 0.25) 100%);
                    transform: scale(1.02);
                    box-shadow: 0 4px 16px rgba(116, 55, 149, 0.3);
                }

                .gmm-group-item.gmm-drag-over-top {
                    border-top: 2px solid #8b4ba8;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }

                .gmm-group-item.gmm-drag-over-bottom {
                    border-bottom: 2px solid #8b4ba8;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                }

                .gmm-drag-placeholder {
                    background: rgba(116, 55, 149, 0.1);
                    border: 2px dashed rgba(139, 75, 168, 0.5);
                    border-radius: 6px;
                    margin-bottom: 4px;
                    min-height: 32px;
                    transition: all 0.2s ease;
                }

                .gmm-title-match-input {
                    background: rgba(45, 45, 65, 0.9);
                    border: 1px solid rgba(116, 55, 149, 0.4);
                    border-radius: 4px;
                    padding: 8px 12px;
                    color: #F0F0F0;
                    font-size: 14px;
                    flex: 1;
                    width: 100%;
                    transition: all 0.2s ease;
                }

                .gmm-title-match-input:focus {
                    outline: none;
                    border-color: #8b4ba8;
                    background: rgba(55, 55, 75, 0.95);
                }

                .gmm-title-match-input::placeholder {
                    color: #888;
                    font-size: 9px;
                }

                .gmm-title-match-wrapper {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
            `;
            document.head.appendChild(style);
        };

        nodeType.prototype.updateUILanguage = function () {
            if (!this.customUI) return;

            const titleEl = this.customUI.querySelector('.gmm-groups-title');
            if (titleEl) titleEl.textContent = t('title');

            const settingsBtn = this.customUI.querySelector('#gmm-settings-btn .gmm-settings-text');
            if (settingsBtn) settingsBtn.textContent = t('settings');

            this.updateModeIndicator();
            this.updateGroupsList();
        };

        nodeType.prototype.updateModeIndicator = function () {
            if (!this.customUI) return;
            const indicator = this.customUI.querySelector('#gmm-mode-indicator');
            if (indicator) {
                const mode = this.properties.switchMode || 'ignore';
                indicator.textContent = mode === 'ignore' ? t('modeDisable') : t('modeBypass');
            }
        };

        nodeType.prototype.bindUIEvents = function () {
            const container = this.customUI;

            const settingsBtn = container.querySelector('#gmm-settings-btn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showSettingsDialog();
                });
            }

            const refreshButton = container.querySelector('#gmm-refresh');
            if (refreshButton) {
                refreshButton.addEventListener('click', () => {
                    this.refreshGroupsList();
                });
            }

            const setupCustomDropdown = (dropdownId, propertyName, onChangeCallback) => {
                const dropdown = container.querySelector(`#${dropdownId}`);
                if (!dropdown) return;

                const trigger = dropdown.querySelector('.gmm-dropdown-trigger');
                const items = dropdown.querySelectorAll('.gmm-dropdown-item');
                const textSpan = dropdown.querySelector('.gmm-dropdown-text');

                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = dropdown.classList.contains('open');
                    
                    document.querySelectorAll('.gmm-custom-dropdown.open').forEach(d => {
                        if (d !== dropdown) d.classList.remove('open');
                    });
                    
                    dropdown.classList.toggle('open', !isOpen);
                });

                items.forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const value = item.getAttribute('data-value');
                        const text = item.textContent;

                        items.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');

                        dropdown.setAttribute('data-value', value);
                        if (textSpan) textSpan.textContent = text;

                        dropdown.classList.remove('open');

                        if (propertyName) {
                            this.properties[propertyName] = value;
                        }
                        if (onChangeCallback) {
                            onChangeCallback(value);
                        }
                    });
                });
            };

            document.addEventListener('click', () => {
                document.querySelectorAll('.gmm-custom-dropdown.open').forEach(d => {
                    d.classList.remove('open');
                });
            });

        };

        nodeType.prototype.updateGroupsList = function () {
            const listContainer = this.customUI.querySelector('#gmm-groups-list');
            if (!listContainer) {
                return;
            }

            listContainer.innerHTML = '';

            const allWorkflowGroups = this.getWorkflowGroups();

            const sortedGroups = this.sortGroupsByOrder(allWorkflowGroups);

            let displayGroups = sortedGroups;

            if (this.properties.matchMode === 'none') {
            } else if (this.properties.matchMode === 'title' && this.properties.titleKeywords) {
                const keywords = this.properties.titleKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
                if (keywords.length > 0) {
                    displayGroups = displayGroups.filter(group => {
                        const title = (group.title || '').toLowerCase();
                        return keywords.some(keyword => title.includes(keyword));
                    });
                }
            } else if (this.properties.matchMode === 'colors' && this.properties.selectedColorFilter) {
                let filterColor = this.properties.selectedColorFilter.trim().toLowerCase();

                if (typeof LGraphCanvas !== 'undefined' && LGraphCanvas.node_colors) {
                    if (LGraphCanvas.node_colors[filterColor]) {
                        filterColor = LGraphCanvas.node_colors[filterColor].groupcolor;
                    } else {
                        const underscoreColor = filterColor.replace(/\s+/g, '_');
                        if (LGraphCanvas.node_colors[underscoreColor]) {
                            filterColor = LGraphCanvas.node_colors[underscoreColor].groupcolor;
                        } else {
                            const spacelessColor = filterColor.replace(/\s+/g, '');
                            if (LGraphCanvas.node_colors[spacelessColor]) {
                                filterColor = LGraphCanvas.node_colors[spacelessColor].groupcolor;
                            }
                        }
                    }
                }

                filterColor = filterColor.replace("#", "").toLowerCase();
                if (filterColor.length === 3) {
                    filterColor = filterColor.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
                }
                filterColor = `#${filterColor}`;

                displayGroups = sortedGroups.filter(group => {
                    if (!group.color) return false;
                    let groupColor = group.color.replace("#", "").trim().toLowerCase();
                    if (groupColor.length === 3) {
                        groupColor = groupColor.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
                    }
                    groupColor = `#${groupColor}`;
                    return groupColor === filterColor;
                });
            }

            displayGroups.forEach(group => {
                const groupConfig = this.getGroupConfig(group);
                groupConfig.enabled = this.isGroupEnabled(group);

                if (!this.groupReferences.has(group)) {
                    this.groupReferences.set(group, group.title);
                }

                const groupItem = this.createGroupItem(groupConfig, group);
                listContainer.appendChild(groupItem);
            });

            const beforeCleanupCount = this.properties.groups.length;
            const activeGroupKeys = new Set(allWorkflowGroups.map(group => this.getGroupKey(group)));
            this.properties.groups = this.properties.groups.filter(config =>
                (config.group_key && activeGroupKeys.has(config.group_key)) ||
                (!config.group_key && allWorkflowGroups.some(g => g.title === config.group_name))
            );
            const afterCleanupCount = this.properties.groups.length;
            if (beforeCleanupCount !== afterCleanupCount) {
            }

            (typeof logger !== 'undefined' ? logger : console).info('[GMM-UI] === 组列表更新完成 ===');
        };

        nodeType.prototype.getWorkflowGroups = function () {
            if (!app.graph || !app.graph._groups) return [];
            return app.graph._groups.filter(g => g && g.title);
        };

        nodeType.prototype.getGroupKey = function (group) {
            if (!group) return '';

            const cachedKey = this.groupKeys.get(group);
            if (cachedKey) return cachedKey;

            const color = normalizeGroupColor(group.color);
            const sameFingerprint = this.getWorkflowGroups().filter(candidate =>
                candidate.title === group.title &&
                normalizeGroupColor(candidate.color) === color
            );
            const occurrence = sameFingerprint.indexOf(group);
            const key = JSON.stringify([group.title, color, Math.max(0, occurrence)]);

            this.groupKeys.set(group, key);
            return key;
        };

        nodeType.prototype.getGroupConfig = function (group) {
            if (!group) return null;

            const existingReference = this.groupConfigReferences.get(group);
            if (existingReference && this.properties.groups.includes(existingReference)) {
                existingReference.group_name = group.title;
                existingReference.group_color = normalizeGroupColor(group.color);
                existingReference.linkage = existingReference.linkage || { on_enable: [], on_disable: [] };
                return existingReference;
            }

            const groupKey = this.getGroupKey(group);
            const groupColor = normalizeGroupColor(group.color);
            let groupConfig = this.properties.groups.find(config => config.group_key === groupKey);

            if (!groupConfig) {
                groupConfig = this.properties.groups.find(config =>
                    config.group_name === group.title &&
                    normalizeGroupColor(config.group_color || config.color) === groupColor
                );
            }

            // Migrate legacy configs that only stored the title. Once assigned to the
            // first matching group, the key prevents a second same-title group from
            // reusing that config.
            if (!groupConfig) {
                const legacyConfigs = this.properties.groups.filter(config =>
                    !config.group_key && !config.group_color && config.group_name === group.title
                );
                if (legacyConfigs.length === 1) {
                    groupConfig = legacyConfigs[0];
                }
            }

            if (!groupConfig) {
                groupConfig = {
                    id: Date.now() + Math.random(),
                    group_name: group.title,
                    group_key: groupKey,
                    group_color: groupColor,
                    enabled: this.isGroupEnabled(group),
                    linkage: {
                        on_enable: [],
                        on_disable: []
                    }
                };
                this.properties.groups.push(groupConfig);
            } else {
                groupConfig.group_key = groupKey;
                groupConfig.group_name = group.title;
                groupConfig.group_color = groupColor;
                groupConfig.linkage = groupConfig.linkage || { on_enable: [], on_disable: [] };
            }

            this.groupConfigReferences.set(group, groupConfig);
            return groupConfig;
        };

        nodeType.prototype.resolveGroup = function (groupOrName) {
            if (!app.graph || !app.graph._groups) return null;
            if (groupOrName && typeof groupOrName === 'object') {
                return app.graph._groups.includes(groupOrName) ? groupOrName : null;
            }
            return app.graph._groups.find(group => group && group.title === groupOrName) || null;
        };

        nodeType.prototype.sortGroupsByOrder = function (groups) {
            if (!groups || groups.length === 0) {
                return [];
            }

            if (!this.properties.groupOrder || this.properties.groupOrder.length === 0) {
                const sorted = groups.slice().sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
                return sorted;
            }

            const orderMap = new Map();
            this.properties.groupOrder.forEach((name, index) => {
                orderMap.set(name, index);
            });

            const orderedGroups = [];
            const unorderedGroups = [];

            groups.forEach(group => {
                if (orderMap.has(group.title)) {
                    orderedGroups.push(group);
                } else {
                    unorderedGroups.push(group);
                }
            });

            orderedGroups.sort((a, b) => {
                return orderMap.get(a.title) - orderMap.get(b.title);
            });

            unorderedGroups.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

            const result = [...orderedGroups, ...unorderedGroups];
            return result;
        };

        nodeType.prototype.isGroupEnabled = function (group) {
            if (!group) return false;

            const nodes = this.getNodesInGroup(group);
            if (nodes.length === 0) return false;

            let hasActiveNode = false;
            reduceNodesDepthFirst(nodes, (node) => {
                if (node.mode === 0) { // LiteGraph.ALWAYS = 0
                    hasActiveNode = true;
                }
            });
            return hasActiveNode;
        };

        nodeType.prototype.refreshWidgets = function () {
            if (!this.customUI) return;

            const groups = GMM_SERVICE.getGroups();
            const listContainer = this.customUI.querySelector('#gmm-color-filter-dropdown')?.closest('.gmm-groups-header')?.nextElementSibling || this.customUI.querySelector('#gmm-groups-list');
            if (!listContainer) return;

            let filterColors = [];
            if (this.properties.matchMode === 'none') {
            } else if (this.properties.matchMode === 'title' && this.properties.titleKeywords) {
            } else if (this.properties.matchMode === 'colors' && this.properties.selectedColorFilter) {
                let filterColor = this.properties.selectedColorFilter.trim().toLowerCase();
                if (typeof LGraphCanvas !== 'undefined' && LGraphCanvas.node_colors) {
                    if (LGraphCanvas.node_colors[filterColor]) {
                        filterColor = LGraphCanvas.node_colors[filterColor].groupcolor;
                    } else {
                        const underscoreColor = filterColor.replace(/\s+/g, '_');
                        if (LGraphCanvas.node_colors[underscoreColor]) {
                            filterColor = LGraphCanvas.node_colors[underscoreColor].groupcolor;
                        } else {
                            const spacelessColor = filterColor.replace(/\s+/g, '');
                            if (LGraphCanvas.node_colors[spacelessColor]) {
                                filterColor = LGraphCanvas.node_colors[spacelessColor].groupcolor;
                            }
                        }
                    }
                }
                filterColor = filterColor.replace("#", "").toLowerCase();
                if (filterColor.length === 3) {
                    filterColor = filterColor.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
                }
                filterColors = [`#${filterColor}`];
            }

            const displayGroups = groups.filter(group => {
                if (!group || !group.title) return false;
                if (this.properties.matchMode === 'none') {
                    return true;
                } else if (this.properties.matchMode === 'title' && this.properties.titleKeywords) {
                    const keywords = this.properties.titleKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
                    if (keywords.length > 0) {
                        const title = (group.title || '').toLowerCase();
                        return keywords.some(keyword => title.includes(keyword));
                    }
                    return true;
                } else if (this.properties.matchMode === 'colors' && filterColors.length > 0) {
                    if (!group.color) return false;
                    let groupColor = group.color.replace("#", "").trim().toLowerCase();
                    if (groupColor.length === 3) {
                        groupColor = groupColor.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
                    }
                    groupColor = `#${groupColor}`;
                    return filterColors.includes(groupColor);
                }
                return true;
            });

            const sortedGroups = this.sortGroupsByOrder(displayGroups);

            let index = 0;
            let isDirty = false;

            for (const group of sortedGroups) {
                const currentEnabled = group._gmm_hasAnyActiveNode;
                const groupConfig = this.getGroupConfig(group);
                groupConfig.enabled = currentEnabled;

                if (!this.groupReferences.has(group)) {
                    this.groupReferences.set(group, group.title);
                }

                const cachedName = this.groupReferences.get(group);
                if (cachedName && cachedName !== group.title) {
                    groupConfig.group_name = group.title;
                    const orderIndex = this.properties.groupOrder.indexOf(cachedName);
                    if (orderIndex !== -1) {
                        this.properties.groupOrder[orderIndex] = group.title;
                    }
                    this.updateLinkageReferences(cachedName, group.title);
                    this.groupReferences.set(group, group.title);
                }

                let groupItem = listContainer.children[index];
                const groupKey = this.getGroupKey(group);
                const expectedId = `gmm-group-${encodeURIComponent(groupKey)}`;

                if (!groupItem || groupItem.getAttribute('data-group-key') !== groupKey) {
                    const newItem = this.createGroupItem(groupConfig, group);
                    newItem.setAttribute('data-group-name', group.title);
                    newItem.setAttribute('data-group-key', groupKey);
                    newItem.id = expectedId;

                    if (groupItem) {
                        listContainer.insertBefore(newItem, groupItem);
                    } else {
                        listContainer.appendChild(newItem);
                    }
                    groupItem = newItem;
                    isDirty = true;
                } else {
                    const switchBtn = groupItem.querySelector('.gmm-switch');
                    if (switchBtn) {
                        const isEnabled = switchBtn.classList.contains('active');
                        if (isEnabled !== currentEnabled) {
                            switchBtn.classList.toggle('active', currentEnabled);
                            isDirty = true;
                        }
                    }

                    const nameEl = groupItem.querySelector('.gmm-group-name');
                    if (nameEl) {
                        if (nameEl.textContent !== group.title) {
                            nameEl.textContent = group.title;
                            isDirty = true;
                        }
                        if (nameEl.classList.contains('disabled') !== !currentEnabled) {
                            nameEl.classList.toggle('disabled', !currentEnabled);
                            isDirty = true;
                        }
                    }

                    const colorIndicator = groupItem.querySelector('.gmm-group-color-indicator');
                    if (colorIndicator) {
                        const currentColor = normalizeGroupColor(group?.color || '#888888');
                        const currentBg = colorIndicator.style.backgroundColor;
                        if (!currentBg || currentBg !== currentColor) {
                            colorIndicator.style.backgroundColor = currentColor;
                            isDirty = true;
                        }
                    }
                }

                this.properties.groupStatesCache[groupKey] = currentEnabled;
                index++;
            }

            while (listContainer.children[index]) {
                listContainer.removeChild(listContainer.children[index]);
                isDirty = true;
            }

            const activeGroupKeys = new Set(groups.map(group => this.getGroupKey(group)));
            this.properties.groups = this.properties.groups.filter(config =>
                (config.group_key && activeGroupKeys.has(config.group_key)) ||
                (!config.group_key && groups.some(g => g.title === config.group_name))
            );

            if (isDirty) {
                this.setDirtyCanvas(true, false);
            }
        };

        nodeType.prototype.checkGroupStatesChange = function () {
            if (!app.graph || !app.graph._groups) return;

            let hasStateChange = false;
            let hasRename = false;

            app.graph._groups.forEach(group => {
                if (!group || !group.title) return;

                const cachedName = this.groupReferences.get(group);
                if (cachedName && cachedName !== group.title) {
                    const config = this.getGroupConfig(group);
                    if (config) {
                        config.group_name = group.title;
                    }

                    const orderIndex = this.properties.groupOrder.indexOf(cachedName);
                    if (orderIndex !== -1) {
                        this.properties.groupOrder[orderIndex] = group.title;
                    }

                    const groupKey = this.getGroupKey(group);
                    if (this.properties.groupStatesCache[cachedName] !== undefined &&
                        this.properties.groupStatesCache[groupKey] === undefined) {
                        this.properties.groupStatesCache[groupKey] = this.properties.groupStatesCache[cachedName];
                        delete this.properties.groupStatesCache[cachedName];
                    }

                    this.updateLinkageReferences(cachedName, group.title);
                    this.groupReferences.set(group, group.title);

                    hasRename = true;
                }

                const currentState = this.isGroupEnabled(group);
                const groupKey = this.getGroupKey(group);
                const cachedState = this.properties.groupStatesCache[groupKey] ??
                    this.properties.groupStatesCache[group.title];

                if (cachedState !== undefined && cachedState !== currentState) {
                    hasStateChange = true;
                }

                this.properties.groupStatesCache[groupKey] = currentState;
            });

            if (hasStateChange || hasRename) {
                this.updateGroupsList();
            }
        };

        nodeType.prototype.updateLinkageReferences = function (oldName, newName) {
            if (!oldName || !newName || oldName === newName) return;

            this.properties.groups.forEach(groupConfig => {
                if (!groupConfig.linkage) return;

                if (Array.isArray(groupConfig.linkage.on_enable)) {
                    groupConfig.linkage.on_enable.forEach(rule => {
                        if (rule.target_group === oldName) {
                            rule.target_group = newName;
                        }
                    });
                }

                if (Array.isArray(groupConfig.linkage.on_disable)) {
                    groupConfig.linkage.on_disable.forEach(rule => {
                        if (rule.target_group === oldName) {
                            rule.target_group = newName;
                        }
                    });
                }
            });
        };

        nodeType.prototype.getNodesInGroup = function (group) {
            if (!group || !app.graph) return [];

            if (group.recomputeInsideNodes) {
                group.recomputeInsideNodes();
            }

            return getGroupNodes(group);
        };

        nodeType.prototype.truncateText = function (text, maxLength = 30) {
            if (!text || text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        };

        nodeType.prototype.createGroupItem = function (groupConfig, group) {
            const item = document.createElement('div');
            item.className = 'gmm-group-item';
            item.dataset.groupName = groupConfig.group_name;
            item.dataset.groupKey = this.getGroupKey(group);
            item.draggable = false;

            const displayName = this.truncateText(groupConfig.group_name, 30);
            const fullName = groupConfig.group_name || '';

            const hasLinkage = groupConfig.linkage &&
                (groupConfig.linkage.on_enable?.length > 0 ||
                 groupConfig.linkage.on_disable?.length > 0);

            const groupColor = normalizeGroupColor(group?.color || '#888888');
            const showNavigate = this.properties.showNavigateIndicator !== undefined ? this.properties.showNavigateIndicator : true;

            item.innerHTML = `
                <div class="gmm-group-header">
                    <div class="gmm-drag-handle">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">
                            <circle cx="9" cy="5" r="1.5"></circle>
                            <circle cx="9" cy="12" r="1.5"></circle>
                            <circle cx="9" cy="19" r="1.5"></circle>
                            <circle cx="15" cy="5" r="1.5"></circle>
                            <circle cx="15" cy="12" r="1.5"></circle>
                            <circle cx="15" cy="19" r="1.5"></circle>
                        </svg>
                    </div>
                    <div class="gmm-group-color-indicator" style="background-color: ${groupColor};"></div>
                    <span class="gmm-group-name ${!groupConfig.enabled ? 'disabled' : ''}">${displayName}</span>
                    <div class="gmm-switch ${groupConfig.enabled ? 'active' : ''}">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                            <line x1="12" y1="2" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <div class="gmm-linkage-button ${hasLinkage ? 'active' : ''}">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                    </div>
                    <div class="gmm-navigate-button" style="display: ${showNavigate ? 'flex' : 'none'};">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14m-7-7l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            `;

            const switchBtn = item.querySelector('.gmm-switch');
            switchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleGroup(group, !groupConfig.enabled);
            });

            const linkageBtn = item.querySelector('.gmm-linkage-button');
            linkageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showLinkageDialog(groupConfig);
            });

            const navigateBtn = item.querySelector('.gmm-navigate-button');
            if (navigateBtn) {
                navigateBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.navigateToGroup(group);
                });
            }

            item.addEventListener('dragstart', (e) => this.onDragStart(e, groupConfig.group_name));
            item.addEventListener('dragover', (e) => this.onDragOver(e));
            item.addEventListener('drop', (e) => this.onDrop(e, groupConfig.group_name));
            item.addEventListener('dragend', (e) => this.onDragEnd(e));
            item.addEventListener('dragenter', (e) => this.onDragEnter(e));
            item.addEventListener('dragleave', (e) => this.onDragLeave(e));

            const dragHandle = item.querySelector('.gmm-drag-handle');
            if (dragHandle) {
                dragHandle.addEventListener('mousedown', (e) => {
                    item.setAttribute('draggable', 'true');
                });
                dragHandle.addEventListener('mouseup', (e) => {
                    if (!this._draggedGroup) {
                        item.setAttribute('draggable', 'false');
                    }
                });
            }

            return item;
        };

        nodeType.prototype.onDragStart = function (e, groupName) {
            e.stopPropagation();
            this._draggedGroup = groupName;
            e.target.classList.add('gmm-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', groupName);
            e.dataTransfer.setDragImage(e.target, 0, 0);
            
            setTimeout(() => {
                e.target.style.opacity = '0.4';
            }, 0);
        };

        nodeType.prototype.onDragOver = function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            
            const target = e.currentTarget;
            if (!target || !target.classList.contains('gmm-group-item')) return;
            
            const rect = target.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            const isTopHalf = e.clientY < midY;
            
            target.classList.remove('gmm-drag-over-top', 'gmm-drag-over-bottom');
            target.classList.add(isTopHalf ? 'gmm-drag-over-top' : 'gmm-drag-over-bottom');
        };

        nodeType.prototype.onDragEnter = function (e) {
            e.preventDefault();
            e.stopPropagation();
            const target = e.currentTarget;
            if (target && target.classList.contains('gmm-group-item')) {
                target.classList.add('gmm-drag-over');
            }
        };

        nodeType.prototype.onDragLeave = function (e) {
            e.preventDefault();
            e.stopPropagation();
            const target = e.currentTarget;
            if (target && target.classList.contains('gmm-group-item')) {
                const rect = target.getBoundingClientRect();
                if (e.clientX < rect.left || e.clientX >= rect.right || 
                    e.clientY < rect.top || e.clientY >= rect.bottom) {
                    target.classList.remove('gmm-drag-over', 'gmm-drag-over-top', 'gmm-drag-over-bottom');
                }
            }
        };

        nodeType.prototype.onDrop = function (e, targetGroupName) {
            e.preventDefault();
            e.stopPropagation();

            const target = e.currentTarget;
            const isTopHalf = target.classList.contains('gmm-drag-over-top');
            
            if (target) {
                target.classList.remove('gmm-drag-over', 'gmm-drag-over-top', 'gmm-drag-over-bottom');
            }

            const draggedGroupName = this._draggedGroup;
            if (!draggedGroupName || draggedGroupName === targetGroupName) {
                return;
            }

            this.updateGroupOrder(draggedGroupName, targetGroupName, isTopHalf);
            this.updateGroupsList();
        };

        nodeType.prototype.onDragEnd = function (e) {
            e.stopPropagation();
            e.target.style.opacity = '';
            e.target.classList.remove('gmm-dragging');
            this._draggedGroup = null;

            const items = this.customUI.querySelectorAll('.gmm-group-item');
            items.forEach(item => {
                item.classList.remove('gmm-drag-over', 'gmm-drag-over-top', 'gmm-drag-over-bottom');
                item.setAttribute('draggable', 'false');
            });
        };

        nodeType.prototype.updateGroupOrder = function (draggedGroupName, targetGroupName, isTopHalf = true) {
            const allGroups = this.getWorkflowGroups();
            const sortedGroups = this.sortGroupsByOrder(allGroups);
            const newOrder = sortedGroups.map(g => g.title);
            const draggedIndex = newOrder.indexOf(draggedGroupName);
            const targetIndex = newOrder.indexOf(targetGroupName);

            if (draggedIndex === -1 || targetIndex === -1) {
                return;
            }

            newOrder.splice(draggedIndex, 1);

            let insertIndex;
            if (draggedIndex < targetIndex) {
                insertIndex = isTopHalf ? targetIndex - 1 : targetIndex;
            } else {
                insertIndex = isTopHalf ? targetIndex : targetIndex + 1;
            }
            
            insertIndex = Math.max(0, Math.min(insertIndex, newOrder.length));
            newOrder.splice(insertIndex, 0, draggedGroupName);

            this.properties.groupOrder = newOrder;
        };

        nodeType.prototype.getFilteredGroups = function () {
            const allGroups = this.getWorkflowGroups();
            let filtered = allGroups;

            if (this.properties.matchMode === 'title' && this.properties.titleKeywords) {
                const keywords = this.properties.titleKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
                if (keywords.length > 0) {
                    filtered = filtered.filter(g => {
                        const title = (g.title || '').toLowerCase();
                        return keywords.some(kw => title.includes(kw));
                    });
                }
            } else if (this.properties.matchMode === 'colors' && this.properties.selectedColorFilter) {
                let filterColor = this.properties.selectedColorFilter.trim().toLowerCase();
                if (typeof LGraphCanvas !== 'undefined' && LGraphCanvas.node_colors) {
                    const colorMap = LGraphCanvas.node_colors;
                    if (colorMap[filterColor]) {
                        filterColor = colorMap[filterColor].groupcolor;
                    } else {
                        const underscore = filterColor.replace(/\s+/g, '_');
                        if (colorMap[underscore]) filterColor = colorMap[underscore].groupcolor;
                        else {
                            const spaceless = filterColor.replace(/\s+/g, '');
                            if (colorMap[spaceless]) filterColor = colorMap[spaceless].groupcolor;
                        }
                    }
                }
                const targetHex = normalizeGroupColor(filterColor);

                filtered = filtered.filter(g => {
                    if (!g.color) return false;
                    return normalizeGroupColor(g.color) === targetHex;
                });
            }
            return filtered;
        };

        nodeType.prototype.getFilteredGroupNames = function () {
            return this.getFilteredGroups().map(group => group.title);
        };

        nodeType.prototype.toggleGroup = function (groupOrName, enable, options = {}) {
            if (!this._processingStack) this._processingStack = new Set();

            const group = this.resolveGroup(groupOrName);
            if (!group) return;
            const groupKey = this.getGroupKey(group);
            if (this._processingStack.has(groupKey)) return;

            const nodes = this.getNodesInGroup(group);
            if (nodes.length === 0) return;

            this._processingStack.add(groupKey);

            try {
                const toggleRestriction = this.properties.toggleRestriction || 'unlimited';
                const skipAlwaysOne = options.skipAlwaysOne === true;

                // Always One 逻辑：仅当非跳过模式、且为开启操作时生效
                if (enable && toggleRestriction === 'always_one' && !skipAlwaysOne) {
                    // 关键修复：仅获取当前 Match 模式过滤出的可见组
                    const enabledOthers = this.getFilteredGroups().filter(otherGroup => {
                        if (otherGroup === group) return false;
                        return this.getGroupConfig(otherGroup)?.enabled;
                    });

                    // 关闭其他可见组，传入 skipAlwaysOne: true 防止递归 enforcement，但保留联动执行
                    enabledOthers.forEach(otherGroup => {
                        this.toggleGroup(otherGroup, false, { skipAlwaysOne: true, skipUIUpdate: true });
                    });
                }

                this.toggleGroupInternal(group, enable);

                if (!options.skipUIUpdate) {
                    this.updateGroupsList();
                    app.graph.setDirtyCanvas(true, true);
                    window.dispatchEvent(new CustomEvent('group-mute-changed', {
                        detail: { sourceId: this._gmmInstanceId, groupName: group.title, groupKey, enabled: enable, timestamp: Date.now() }
                    }));
                }
            } finally {
                this._processingStack.delete(groupKey);
            }
        };

        nodeType.prototype.toggleGroupInternal = function (groupOrName, enable) {
            const group = this.resolveGroup(groupOrName);
            if (!group) return;

            const nodes = this.getNodesInGroup(group);
            if (nodes.length === 0) return;

            const switchMode = this.properties.switchMode || 'ignore';
            let mode;
            if (enable) {
                mode = 0;
            } else {
                mode = switchMode === 'ignore' ? 2 : 4;
            }
            changeModeOfNodes(nodes, mode);

            const config = this.getGroupConfig(group);
            if (config) {
                config.enabled = enable;
            }

            this.applyLinkage(group, enable);
        };

        nodeType.prototype.navigateToGroup = function (groupOrName) {
            const group = this.resolveGroup(groupOrName);
            if (!group) {
                return;
            }

            const canvas = app.canvas;

            canvas.centerOnNode(group);

            const zoomCurrent = canvas.ds?.scale || 1;
            const zoomX = canvas.canvas.width / group._size[0] - 0.02;
            const zoomY = canvas.canvas.height / group._size[1] - 0.02;

            canvas.setZoom(Math.min(zoomCurrent, zoomX, zoomY), [
                canvas.canvas.width / 2,
                canvas.canvas.height / 2,
            ]);

            canvas.setDirty(true, true);
        };

        nodeType.prototype.updateNavigateButtons = function () {
            if (!this.customUI) return;
            const showNavigate = this.properties.showNavigateIndicator !== undefined ? this.properties.showNavigateIndicator : true;
            const navigateButtons = this.customUI.querySelectorAll('.gmm-navigate-button');
            navigateButtons.forEach(btn => {
                btn.style.display = showNavigate ? 'flex' : 'none';
            });
        };

        nodeType.prototype.applyLinkage = function (groupOrName, enabled) {
            const group = this.resolveGroup(groupOrName);
            const config = this.getGroupConfig(group);
            if (!config || !config.linkage) return;

            const rules = enabled ? config.linkage.on_enable : config.linkage.on_disable;
            if (!rules || !Array.isArray(rules)) return;

            rules.forEach(rule => {
                const targetEnable = rule.action === "enable";
                // 关键修复：联动触发时跳过 Always One 限制和 UI 刷新，避免级联污染，但完整保留联动链执行
                this.toggleGroup(rule.target_group, targetEnable, { skipAlwaysOne: true, skipUIUpdate: true });
            });
        };

        nodeType.prototype.showSettingsDialog = function () {
            const dialog = document.createElement('div');
            dialog.className = 'gmm-settings-dialog';

            const locale = getLocale();
            const currentMode = this.properties.switchMode || 'ignore';
            const currentRestriction = this.properties.toggleRestriction || 'unlimited';
            const currentMatchMode = this.properties.matchMode || 'none';
            const currentColorFilter = this.properties.selectedColorFilter || '';
            const currentTitleKeywords = this.properties.titleKeywords || '';
            const currentShowNavigateIndicator = this.properties.showNavigateIndicator !== undefined ? this.properties.showNavigateIndicator : true;

            const modeOptions = [
                { value: 'ignore', label: t('modeDisable') },
                { value: 'bypass', label: t('modeBypass') }
            ];

            const restrictionOptions = [
                { value: 'unlimited', label: t('restrictionUnlimited') },
                { value: 'always_one', label: t('restrictionAlwaysOne') }
            ];

            const matchModeOptions = [
                { value: 'none', label: t('matchNone') },
                { value: 'colors', label: t('matchColors') },
                { value: 'title', label: t('matchTitle') }
            ];

            const colorOptions = [
                { value: 'red', label: t('colorRed'), color: '#c44' },
                { value: 'brown', label: t('colorBrown'), color: '#a52a2a' },
                { value: 'green', label: t('colorGreen'), color: '#2e8b57' },
                { value: 'blue', label: t('colorBlue'), color: '#4682b4' },
                { value: 'pale blue', label: t('colorPaleBlue'), color: '#87ceeb' },
                { value: 'cyan', label: t('colorCyan'), color: '#00bcd4' },
                { value: 'purple', label: t('colorPurple'), color: '#9370db' },
                { value: 'yellow', label: t('colorYellow'), color: '#f0e68c' },
                { value: 'black', label: t('colorBlack'), color: '#333333' }
            ];

            const navigateIndicatorOptions = [
                { value: 'true', label: t('show') },
                { value: 'false', label: t('hide') }
            ];

            const createDropdownHTML = (id, options, currentValue) => {
                const currentOption = options.find(o => o.value === currentValue) || options[0];
                return `
                    <div class="gmm-custom-dropdown" id="${id}" data-value="${currentValue}">
                        <div class="gmm-dropdown-trigger">
                            <span class="gmm-dropdown-text">${currentOption.label}</span>
                            <svg class="gmm-dropdown-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                        <div class="gmm-dropdown-menu">
                            ${options.map(o => `<div class="gmm-dropdown-item ${o.value === currentValue ? 'active' : ''} ${o.color ? 'gmm-color-item' : ''}" data-value="${o.value}" ${o.color ? `style="--item-color: ${o.color}"` : ''}>${o.label}</div>`).join('')}
                        </div>
                    </div>
                `;
            };

            dialog.innerHTML = `
                <div class="gmm-dialog-header">
                    <h3>${t('settings')}</h3>
                    <button class="gmm-dialog-close">×</button>
                </div>
                <div class="gmm-settings-dialog-content">
                    <div class="gmm-settings-dialog-item">
                        <span class="gmm-settings-dialog-label">${t('modeLabel')}</span>
                        ${createDropdownHTML('gmm-dialog-mode', modeOptions, currentMode)}
                    </div>
                    <div class="gmm-settings-dialog-item">
                        <span class="gmm-settings-dialog-label">${t('toggleRestriction')}</span>
                        ${createDropdownHTML('gmm-dialog-restriction', restrictionOptions, currentRestriction)}
                    </div>
                    <div class="gmm-settings-dialog-item">
                        <span class="gmm-settings-dialog-label">${t('matchMode')}</span>
                        ${createDropdownHTML('gmm-dialog-match-mode', matchModeOptions, currentMatchMode)}
                    </div>
                    <div class="gmm-settings-dialog-item" id="gmm-dialog-filter-item" style="display: ${currentMatchMode === 'colors' ? 'flex' : 'none'};">
                        <span class="gmm-settings-dialog-label">${t('colorFilter')}</span>
                        ${createDropdownHTML('gmm-dialog-color-filter', colorOptions, currentColorFilter)}
                    </div>
                    <div class="gmm-settings-dialog-item" id="gmm-dialog-title-item" style="display: ${currentMatchMode === 'title' ? 'flex' : 'none'};">
                        <span class="gmm-settings-dialog-label">${t('matchTitle')}</span>
                        <input type="text" class="gmm-title-match-input" id="gmm-dialog-title-keywords" placeholder="${t('matchTitlePlaceholder')}" value="${currentTitleKeywords}">
                    </div>
                    <div class="gmm-settings-dialog-item">
                        <span class="gmm-settings-dialog-label">${t('navigateIndicator')}</span>
                        ${createDropdownHTML('gmm-dialog-navigate-indicator', navigateIndicatorOptions, String(currentShowNavigateIndicator))}
                    </div>
                </div>
                <div class="gmm-dialog-footer">
                    <button class="gmm-button" id="gmm-settings-cancel">${t('cancel')}</button>
                    <button class="gmm-button gmm-button-primary" id="gmm-settings-save">${t('confirm')}</button>
                </div>
            `;

            document.body.appendChild(dialog);

            const setupDropdown = (dropdownId, propertyName, onChange) => {
                const dropdown = dialog.querySelector(`#${dropdownId}`);
                if (!dropdown) return;

                const trigger = dropdown.querySelector('.gmm-dropdown-trigger');
                const items = dropdown.querySelectorAll('.gmm-dropdown-item');
                const textSpan = dropdown.querySelector('.gmm-dropdown-text');

                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = dropdown.classList.contains('open');
                    dialog.querySelectorAll('.gmm-custom-dropdown.open').forEach(d => d.classList.remove('open'));
                    dropdown.classList.toggle('open', !isOpen);
                });

                items.forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const value = item.getAttribute('data-value');
                        items.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        dropdown.setAttribute('data-value', value);
                        if (textSpan) textSpan.textContent = item.textContent;
                        dropdown.classList.remove('open');
                        if (onChange) onChange(value);
                    });
                });
            };

            setupDropdown('gmm-dialog-mode', 'switchMode');
            setupDropdown('gmm-dialog-restriction', 'toggleRestriction');
            setupDropdown('gmm-dialog-color-filter', 'selectedColorFilter');

            const filterItem = dialog.querySelector('#gmm-dialog-filter-item');
            const titleItem = dialog.querySelector('#gmm-dialog-title-item');

            setupDropdown('gmm-dialog-match-mode', 'matchMode', (value) => {
                if (filterItem) filterItem.style.display = value === 'colors' ? 'flex' : 'none';
                if (titleItem) titleItem.style.display = value === 'title' ? 'flex' : 'none';
            });
            setupDropdown('gmm-dialog-navigate-indicator', 'showNavigateIndicator');

            const closeDialog = () => {
                dialog.classList.add('closing');
                setTimeout(() => dialog.remove(), 200);
            };

            dialog.querySelector('.gmm-dialog-close').addEventListener('click', closeDialog);
            dialog.querySelector('#gmm-settings-cancel').addEventListener('click', closeDialog);

            dialog.querySelector('#gmm-settings-save').addEventListener('click', (e) => {
                e.stopPropagation();
                this.properties.switchMode = dialog.querySelector('#gmm-dialog-mode').getAttribute('data-value');
                this.properties.toggleRestriction = dialog.querySelector('#gmm-dialog-restriction').getAttribute('data-value');
                this.properties.matchMode = dialog.querySelector('#gmm-dialog-match-mode').getAttribute('data-value');
                this.properties.selectedColorFilter = dialog.querySelector('#gmm-dialog-color-filter').getAttribute('data-value');
                this.properties.titleKeywords = dialog.querySelector('#gmm-dialog-title-keywords').value;
                this.properties.showNavigateIndicator = dialog.querySelector('#gmm-dialog-navigate-indicator').getAttribute('data-value') === 'true';
                this.updateModeIndicator();
                this.refreshWidgets();
                this.updateNavigateButtons();
                closeDialog();
            });

            setTimeout(() => {
                const closeOnOutsideClick = (e) => {
                    if (!dialog.contains(e.target) && document.body.contains(dialog)) {
                        closeDialog();
                        document.removeEventListener('click', closeOnOutsideClick);
                    }
                };
                document.addEventListener('click', closeOnOutsideClick);
            }, 100);

            document.addEventListener('click', (e) => {
                if (!dialog.contains(e.target)) {
                    dialog.querySelectorAll('.gmm-custom-dropdown.open').forEach(d => d.classList.remove('open'));
                }
            });
        };

        nodeType.prototype.showLinkageDialog = function (groupConfig) {
            const dialog = document.createElement('div');
            dialog.className = 'gmm-linkage-dialog';

            const displayName = this.truncateText(groupConfig.group_name, 25);
            const fullName = groupConfig.group_name || '';

            dialog.innerHTML = `
                <div class="gmm-dialog-header">
                    <h3>${t('linkageConfig')}${displayName}</h3>
                    <button class="gmm-dialog-close">×</button>
                </div>
                <div class="gmm-settings-dialog-content">
                    <div class="gmm-linkage-section">
                        <div class="gmm-section-header">
                            <span>${t('whenGroupOn')}</span>
                            <button class="gmm-add-rule" data-type="on_enable">+</button>
                        </div>
                        <div class="gmm-rules-list" id="gmm-rules-enable"></div>
                    </div>

                    <div class="gmm-linkage-section">
                        <div class="gmm-section-header">
                            <span>${t('whenGroupOff')}</span>
                            <button class="gmm-add-rule" data-type="on_disable">+</button>
                        </div>
                        <div class="gmm-rules-list" id="gmm-rules-disable"></div>
                    </div>
                </div>
                <div class="gmm-dialog-footer">
                    <button class="gmm-button" id="gmm-cancel">${t('cancel')}</button>
                    <button class="gmm-button gmm-button-primary" id="gmm-save">${t('confirm')}</button>
                </div>
            `;

            document.body.appendChild(dialog);

            dialog.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            const tempConfig = JSON.parse(JSON.stringify(groupConfig));

            this.renderRules(dialog, tempConfig, 'on_enable');
            this.renderRules(dialog, tempConfig, 'on_disable');

            dialog.querySelectorAll('.gmm-add-rule').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const type = btn.dataset.type;
                    this.addRule(dialog, tempConfig, type);
                });
            });

            const closeDialog = () => {
                dialog.classList.add('closing');
                setTimeout(() => {
                    dialog.remove();
                }, 200);
            };

            dialog.querySelector('.gmm-dialog-close').addEventListener('click', (e) => {
                e.stopPropagation();
                closeDialog();
            });

            dialog.querySelector('#gmm-cancel').addEventListener('click', (e) => {
                e.stopPropagation();
                closeDialog();
            });

            dialog.querySelector('#gmm-save').addEventListener('click', (e) => {
                e.stopPropagation();
                const originalConfig = this.properties.groups.includes(groupConfig)
                    ? groupConfig
                    : this.properties.groups.find(g => g.group_key === groupConfig.group_key);
                if (originalConfig) {
                    originalConfig.linkage = tempConfig.linkage;
                }
                this.refreshWidgets();
                closeDialog();
            });

            setTimeout(() => {
                const closeOnOutsideClick = (e) => {
                    if (!dialog.contains(e.target) && document.body.contains(dialog)) {
                        closeDialog();
                        document.removeEventListener('click', closeOnOutsideClick);
                    }
                };
                document.addEventListener('click', closeOnOutsideClick);
            }, 100);
        };

        nodeType.prototype.renderRules = function (dialog, config, type) {
            const listId = type === 'on_enable' ? 'gmm-rules-enable' : 'gmm-rules-disable';
            const list = dialog.querySelector(`#${listId}`);
            if (!list) return;

            list.innerHTML = '';

            const rules = config.linkage[type] || [];
            rules.forEach((rule, index) => {
                const ruleItem = this.createRuleItem(dialog, config, type, rule, index);
                list.appendChild(ruleItem);
            });
        };

        nodeType.prototype.truncateText = function (text, maxLength = 30) {
            if (!text || text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        };

        nodeType.prototype.createRuleItem = function (dialog, config, type, rule, index) {
            const item = document.createElement('div');
            item.className = 'gmm-rule-item';
            item.dataset.index = index;

            const availableGroups = this.getWorkflowGroups()
                .filter(g => g.title !== config.group_name)
                .map(g => g.title)
                .sort((a, b) => a.localeCompare(b, 'zh-CN'));

            const groupOptions = availableGroups.map(name => {
                const active = name === rule.target_group ? 'active' : '';
                const displayName = this.truncateText(name, 30);
                return `<div class="gmm-dropdown-item ${active}" data-value="${name}">${displayName}</div>`;
            }).join('');

            const actionOptions = [
                { value: 'enable', label: t('enable'), active: rule.action === 'enable' ? 'active' : '' },
                { value: 'disable', label: t('disable'), active: rule.action === 'disable' ? 'active' : '' }
            ].map(o => `<div class="gmm-dropdown-item ${o.active}" data-value="${o.value}">${o.label}</div>`).join('');

            item.innerHTML = `
                <div class="gmm-custom-dropdown gmm-rule-target-dropdown">
                    <div class="gmm-dropdown-trigger">
                        <span class="gmm-dropdown-text">${this.truncateText(rule.target_group, 30)}</span>
                        <svg class="gmm-dropdown-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="gmm-dropdown-menu">
                        ${groupOptions}
                    </div>
                </div>
                <div class="gmm-custom-dropdown gmm-rule-action-dropdown">
                    <div class="gmm-dropdown-trigger">
                        <span class="gmm-dropdown-text">${rule.action === 'enable' ? t('enable') : t('disable')}</span>
                        <svg class="gmm-dropdown-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="gmm-dropdown-menu">
                        ${actionOptions}
                    </div>
                </div>
                <button class="gmm-delete-rule">×</button>
            `;

            const targetDropdown = item.querySelector('.gmm-rule-target-dropdown');
            targetDropdown.setAttribute('data-value', rule.target_group);

            const actionDropdown = item.querySelector('.gmm-rule-action-dropdown');
            actionDropdown.setAttribute('data-value', rule.action);

            item.querySelectorAll('.gmm-custom-dropdown').forEach(dropdown => {
                const trigger = dropdown.querySelector('.gmm-dropdown-trigger');
                const items = dropdown.querySelectorAll('.gmm-dropdown-item');
                const textSpan = dropdown.querySelector('.gmm-dropdown-text');

                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = dropdown.classList.contains('open');
                    dialog.querySelectorAll('.gmm-custom-dropdown.open').forEach(d => {
                        if (d !== dropdown) d.classList.remove('open');
                    });
                    dropdown.classList.toggle('open', !isOpen);
                });

                items.forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const value = opt.getAttribute('data-value');
                        const text = opt.textContent;

                        items.forEach(i => i.classList.remove('active'));
                        opt.classList.add('active');

                        textSpan.textContent = text;
                        dropdown.setAttribute('data-value', value);
                        dropdown.classList.remove('open');

                        if (dropdown.classList.contains('gmm-rule-target-dropdown')) {
                            rule.target_group = value;
                        } else if (dropdown.classList.contains('gmm-rule-action-dropdown')) {
                            rule.action = value;
                        }
                    });
                });
            });

            item.querySelector('.gmm-delete-rule').addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                config.linkage[type].splice(index, 1);
                this.renderRules(dialog, config, type);
            });

            return item;
        };

        nodeType.prototype.addRule = function (dialog, config, type) {
            const availableGroups = this.getWorkflowGroups()
                .filter(g => g.title !== config.group_name)
                .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

            if (availableGroups.length === 0) {
                return;
            }

            const newRule = {
                target_group: availableGroups[0].title,
                action: "enable"
            };

            config.linkage[type].push(newRule);
            this.renderRules(dialog, config, type);
        };

        nodeType.prototype.refreshGroupsList = function () {
            this.refreshColorFilter();
            this.updateGroupsList();
        };

        nodeType.prototype.getAvailableGroupColors = function () {
            const builtinColors = [
                'red', 'brown', 'green', 'blue', 'pale blue',
                'cyan', 'purple', 'yellow', 'black'
            ];
            return builtinColors;
        };

        nodeType.prototype.refreshColorFilter = function () {
            const colorFilterDropdown = this.customUI.querySelector('#gmm-color-filter-dropdown');
            const colorFilterMenu = this.customUI.querySelector('#gmm-color-filter-menu');
            if (!colorFilterDropdown || !colorFilterMenu) return;

            const currentValue = colorFilterDropdown.getAttribute('data-value') || '';

            const builtinColors = this.getAvailableGroupColors();

            let items = [];

            builtinColors.forEach(colorName => {
                const displayName = this.getColorDisplayName(colorName);
                const isSelected = currentValue === colorName;

                let hexColor = null;
                if (typeof LGraphCanvas !== 'undefined' && LGraphCanvas.node_colors) {
                    const normalizedName = colorName.toLowerCase();
                    if (LGraphCanvas.node_colors[normalizedName]) {
                        hexColor = LGraphCanvas.node_colors[normalizedName].groupcolor;
                    } else {
                        const underscoreColor = normalizedName.replace(/\s+/g, '_');
                        if (LGraphCanvas.node_colors[underscoreColor]) {
                            hexColor = LGraphCanvas.node_colors[underscoreColor].groupcolor;
                        } else {
                            const spacelessColor = normalizedName.replace(/\s+/g, '');
                            if (LGraphCanvas.node_colors[spacelessColor]) {
                                hexColor = LGraphCanvas.node_colors[spacelessColor].groupcolor;
                            }
                        }
                    }
                }

                const activeClass = isSelected ? 'active' : '';
                const colorStyle = hexColor ? `style="--item-color: ${hexColor};"` : '';

                items.push(`<div class="gmm-dropdown-item gmm-color-item ${activeClass}" data-value="${colorName}" ${colorStyle}>${displayName}</div>`);
            });

            const allItems = [
                `<div class="gmm-dropdown-item ${currentValue === '' ? 'active' : ''}" data-value="">${t('allColors')}</div>`,
                ...items
            ].join('');

            colorFilterMenu.innerHTML = allItems;

            const validValues = [...builtinColors];
            if (currentValue && !validValues.includes(currentValue)) {
                colorFilterDropdown.setAttribute('data-value', 'red');
                this.properties.selectedColorFilter = 'red';
                const triggerText = colorFilterDropdown.querySelector('.gmm-dropdown-text');
                if (triggerText) triggerText.textContent = t('colorRed');
            }

            this.bindColorFilterEvents();
        };

        nodeType.prototype.bindColorFilterEvents = function () {
            const colorFilterDropdown = this.customUI.querySelector('#gmm-color-filter-dropdown');
            if (!colorFilterDropdown) return;

            const items = colorFilterDropdown.querySelectorAll('.gmm-dropdown-item');
            const textSpan = colorFilterDropdown.querySelector('.gmm-dropdown-text');

            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const value = item.getAttribute('data-value');
                    const text = item.textContent;

                    items.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    colorFilterDropdown.setAttribute('data-value', value);
                    if (textSpan) textSpan.textContent = text;

                    colorFilterDropdown.classList.remove('open');

                    this.properties.selectedColorFilter = value;
                    this.updateGroupsList();
                });
            });
        };

        nodeType.prototype.getColorDisplayName = function (color) {
            if (!color) return t('colorRed');

            const colorMap = {
                'red': 'colorRed',
                'brown': 'colorBrown',
                'green': 'colorGreen',
                'blue': 'colorBlue',
                'pale blue': 'colorPaleBlue',
                'cyan': 'colorCyan',
                'purple': 'colorPurple',
                'yellow': 'colorYellow',
                'black': 'colorBlack'
            };

            const lowerColor = color.toLowerCase();
            if (colorMap[lowerColor]) {
                return t(colorMap[lowerColor]);
            }

            return color;
        };

        nodeType.prototype.getContrastColor = function (hexColor) {
            if (!hexColor) return '#E0E0E0';

            const color = hexColor.replace('#', '');

            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);

            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            return brightness > 128 ? '#000000' : '#FFFFFF';
        };

        const onSerialize = nodeType.prototype.onSerialize;
        nodeType.prototype.onSerialize = function (info) {
            const data = onSerialize?.apply?.(this, arguments);

            info.groups = this.properties.groups || [];
            info.selectedColorFilter = this.properties.selectedColorFilter || 'red';
            info.groupOrder = this.properties.groupOrder || [];
            info.switchMode = this.properties.switchMode || 'bypass';
            info.showNavigateIndicator = this.properties.showNavigateIndicator !== undefined ? this.properties.showNavigateIndicator : true;

            return data;
        };

        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function (info) {
            onConfigure?.apply?.(this, arguments);

            if (info.groups && Array.isArray(info.groups)) {
                this.properties.groups = info.groups;
            }

            if (info.selectedColorFilter !== undefined && typeof info.selectedColorFilter === 'string') {
                this.properties.selectedColorFilter = info.selectedColorFilter;
            } else {
                this.properties.selectedColorFilter = 'red';
            }

            if (info.groupOrder && Array.isArray(info.groupOrder)) {
                this.properties.groupOrder = info.groupOrder;
            } else {
                this.properties.groupOrder = [];
            }

            if (info.switchMode !== undefined && (info.switchMode === 'ignore' || info.switchMode === 'bypass')) {
                this.properties.switchMode = info.switchMode;
            } else {
                this.properties.switchMode = 'bypass';
            }

            if (info.showNavigateIndicator !== undefined) {
                this.properties.showNavigateIndicator = info.showNavigateIndicator;
            } else {
                this.properties.showNavigateIndicator = true;
            }

            if (this.customUI) {
                setTimeout(() => {
                    this.refreshColorFilter();
                    this.updateGroupsList();
                    this.updateNavigateButtons();

                    const colorFilterDropdown = this.customUI.querySelector('#gmm-color-filter-dropdown');
                    if (colorFilterDropdown) {
                        const colorValue = this.properties.selectedColorFilter || 'red';
                        colorFilterDropdown.setAttribute('data-value', colorValue);
                        const colorItems = colorFilterDropdown.querySelectorAll('.gmm-dropdown-item');
                        colorItems.forEach(item => {
                            item.classList.toggle('active', item.getAttribute('data-value') === colorValue);
                        });
                        const colorText = colorFilterDropdown.querySelector('.gmm-dropdown-text');
                        if (colorText) {
                            const activeItem = colorFilterDropdown.querySelector('.gmm-dropdown-item.active');
                            if (activeItem) colorText.textContent = activeItem.textContent;
                        }
                    }

                    const modeDropdown = this.customUI.querySelector('#gmm-mode-dropdown');
                    if (modeDropdown) {
                        const modeValue = this.properties.switchMode || 'bypass';
                        modeDropdown.setAttribute('data-value', modeValue);
                        const modeItems = modeDropdown.querySelectorAll('.gmm-dropdown-item');
                        modeItems.forEach(item => {
                            item.classList.toggle('active', item.getAttribute('data-value') === modeValue);
                        });
                        const modeText = modeDropdown.querySelector('.gmm-dropdown-text');
                        if (modeText) {
                            const activeItem = modeDropdown.querySelector('.gmm-dropdown-item.active');
                            if (activeItem) modeText.textContent = activeItem.textContent;
                        }
                    }
                }, 100);
            }
        };

        const iconSize = 24;
        const iconMargin = 4;

        const drawFg = nodeType.prototype.onDrawForeground;
        nodeType.prototype.onDrawForeground = function (ctx) {
            const currentLocale = getLocale();
            if (this._gmmHelpLocale !== currentLocale) {
                this._gmmHelpLocale = currentLocale;
                if (this._gmmHelpElement) {
                    this._gmmHelpElement.querySelector('div').innerHTML = getDescriptionHTML();
                }
            }

            const r = drawFg ? drawFg.apply(this, arguments) : undefined;
            if (this.flags.collapsed) return r;

            const x = this.size[0] - iconSize - iconMargin;
            const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;

            if (this._gmmHelp && this._gmmHelpElement === null) {
                this._gmmHelpElement = createHelpPopup(getDescriptionHTML(), () => {
                    this._gmmHelp = false;
                    this._gmmHelpElement = null;
                });
            }
            else if (!this._gmmHelp && this._gmmHelpElement !== null) {
                this._gmmHelpElement.remove();
                this._gmmHelpElement = null;
            }

            if (this._gmmHelp && this._gmmHelpElement !== null) {
                const rect = ctx.canvas.getBoundingClientRect();
                const scaleX = rect.width / ctx.canvas.width;
                const scaleY = rect.height / ctx.canvas.height;

                const transform = new DOMMatrix()
                    .scaleSelf(scaleX, scaleY)
                    .multiplySelf(ctx.getTransform())
                    .translateSelf(this.size[0] * scaleX * Math.max(1.0, window.devicePixelRatio), 0)
                    .translateSelf(10, -32);

                const bcr = app.canvas.canvas.getBoundingClientRect();
                this._gmmHelpElement.style.left = `${transform.e + bcr.x}px`;
                this._gmmHelpElement.style.top = `${transform.f + bcr.y}px`;
            }

            // 展开中或鼠标悬停时高亮
            const helpActive = !!(this._gmmHelp || this._gmmHelpHovered);

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
                this._gmmHelp = !this._gmmHelp;
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
            if (hovered !== this._gmmHelpHovered) {
                this._gmmHelpHovered = hovered;
                this.setDirtyCanvas(true, true);
            }
            return r;
        };

        const mouseLeave = nodeType.prototype.onMouseLeave;
        nodeType.prototype.onMouseLeave = function () {
            const r = mouseLeave ? mouseLeave.apply(this, arguments) : undefined;
            if (this._gmmHelpHovered) {
                this._gmmHelpHovered = false;
                this.setDirtyCanvas(true, true);
            }
            return r;
        };

    }
});
