import { app } from "/scripts/app.js";
import { drawNodeHelpButton } from "./node_title_icons.js";
import { api } from "/scripts/api.js";
import { i18n } from "./TagSelector/i18n/index.js";
import { tagI18n } from "./TagSelector/i18n/tags.js";
import { categoryTranslations } from "./TagSelector/i18n/categories.js";
import { getState, setState, resetState } from "./TagSelector/core/state.js";

const CONFIG = {
    ICON_SIZE: 24,
    ICON_MARGIN: 4,
    MAX_TAG_DISPLAY_LENGTH: 20,
    TOAST_DURATION: 3000,
    MAX_CACHE_SIZE: 100,
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 50,
    MAX_WEIGHT: 2.0,
    MIN_WEIGHT: 0.1,
    WEIGHT_STEP: 0.1
};

const COLORS = {
    primary: '#3b82f6',
    primaryHover: '#60a5fa',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    background: 'rgba(15,23,42,0.98)',
    backgroundLight: 'rgba(30,41,59,0.98)',
    border: 'rgba(59,130,246,0.4)'
};

const GRADIENTS = {
    primary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
    primaryHover: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    danger: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)'
};

const TagSelectorState = {
    currentNode: null,
    tagsData: null,
    dialog: null,
    selectedTags: new Map(),
    previousSelectedTags: new Map(),
    
    reset() {
        this.currentNode = null;
        this.selectedTags.clear();
        this.previousSelectedTags.clear();
    },
    
    setSelectedTags(tags) {
        this.selectedTags = tags;
    },
    
    getSelectedTags() {
        return this.selectedTags;
    }
};

class EventManager {
    constructor() {
        this.listeners = new Map();
        this.idCounter = 0;
    }
    
    add(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        const id = ++this.idCounter;
        this.listeners.set(id, { element, event, handler, options });
        return id;
    }
    
    remove(id) {
        const listener = this.listeners.get(id);
        if (listener) {
            listener.element.removeEventListener(listener.event, listener.handler);
            this.listeners.delete(id);
        }
    }
    
    clearAll() {
        this.listeners.forEach((_, id) => this.remove(id));
    }
    
    get size() {
        return this.listeners.size;
    }
}

class LRUCache {
    constructor(maxSize = CONFIG.MAX_CACHE_SIZE) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    
    get(key) {
        if (!this.cache.has(key)) return undefined;
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
    
    has(key) {
        return this.cache.has(key);
    }
    
    delete(key) {
        return this.cache.delete(key);
    }
    
    clear() {
        this.cache.clear();
    }
    
    get size() {
        return this.cache.size;
    }
}

const eventManager = new EventManager();
const tagsCache = new LRUCache(CONFIG.MAX_CACHE_SIZE);

const DOM = {
    el(tag, styles = '', text = '') {
        const e = document.createElement(tag);
        if (styles) e.style.cssText = styles;
        if (text) e.textContent = text;
        return e;
    },
    div(styles, text) { return this.el('div', styles, text); },
    span(styles, text) { return this.el('span', styles, text); },
    btn(styles, text, onClick) {
        const b = this.el('button', styles, text);
        if (onClick) b.onclick = onClick;
        return b;
    },
    input(styles, placeholder, type = 'text') {
        const i = this.el('input', styles);
        i.type = type;
        if (placeholder) i.placeholder = placeholder;
        return i;
    }
};

function createCustomDropdown(options = [], config = {}) {
    const {
        placeholder = '',
        selectedValue = '',
        marginBottom = '0px',
        width = '100%'
    } = config;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position: relative; width: ${width}; margin-bottom: ${marginBottom};`;

    const trigger = document.createElement('div');
    trigger.style.cssText = `width: 100%; padding: 10px 36px 10px 12px; border: 1px solid rgba(148,163,184,0.25); border-radius: 8px; background: linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%); color: #e2e8f0; font-size: 14px; cursor: pointer; user-select: none; transition: all 0.2s ease; box-sizing: border-box; min-height: 40px; display: flex; align-items: center;`;

    const arrow = document.createElement('span');
    arrow.style.cssText = `position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 10px; transition: transform 0.2s ease; pointer-events: none;`;
    arrow.innerHTML = '▼';

    const panel = document.createElement('div');
    panel.style.cssText = `position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(148,163,184,0.2); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 10000; max-height: 200px; overflow-y: auto; display: none; padding: 4px;`;
    panel.style.scrollbarWidth = 'thin';
    panel.style.scrollbarColor = 'rgba(96,165,250,0.25) transparent';

    let currentValue = selectedValue;
    let isOpen = false;

    function renderOptions() {
        panel.innerHTML = '';
        const allOptions = placeholder ? [{ value: '', label: placeholder }, ...options] : [...options];
        allOptions.forEach(opt => {
            const item = document.createElement('div');
            item.style.cssText = `padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.15s ease; color: ${opt.value === currentValue ? '#60a5fa' : '#cbd5e1'}; background: ${opt.value === currentValue ? 'rgba(96,165,250,0.1)' : 'transparent'}; font-weight: ${opt.value === currentValue ? '600' : '400'};`;
            if (opt.value === currentValue) {
                item.style.borderLeft = '2px solid #60a5fa';
                item.style.paddingLeft = '10px';
            }
            item.textContent = opt.label;
            item.addEventListener('mouseenter', () => {
                if (opt.value !== currentValue) {
                    item.style.background = 'rgba(148,163,184,0.1)';
                    item.style.color = '#f1f5f9';
                }
            });
            item.addEventListener('mouseleave', () => {
                if (opt.value !== currentValue) {
                    item.style.background = 'transparent';
                    item.style.color = '#cbd5e1';
                }
            });
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                currentValue = opt.value;
                trigger.textContent = opt.label || placeholder;
                trigger.appendChild(arrow);
                closePanel();
                renderOptions();
            });
            panel.appendChild(item);
        });
    }

    function openPanel() {
        if (isOpen) return;
        isOpen = true;
        panel.style.display = 'block';
        arrow.style.transform = 'translateY(-50%) rotate(180deg)';
        trigger.style.borderColor = '#60a5fa';
        trigger.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.15)';
        renderOptions();
    }

    function closePanel() {
        if (!isOpen) return;
        isOpen = false;
        panel.style.display = 'none';
        arrow.style.transform = 'translateY(-50%)';
        trigger.style.borderColor = 'rgba(148,163,184,0.25)';
        trigger.style.boxShadow = 'none';
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    });

    trigger.addEventListener('mouseenter', () => {
        if (!isOpen) {
            trigger.style.borderColor = 'rgba(148,163,184,0.4)';
        }
    });
    trigger.addEventListener('mouseleave', () => {
        if (!isOpen) {
            trigger.style.borderColor = 'rgba(148,163,184,0.25)';
        }
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            closePanel();
        }
    });

    renderOptions();

    const initialOpt = options.find(o => o.value === selectedValue);
    trigger.textContent = initialOpt ? initialOpt.label : (placeholder || '');
    trigger.appendChild(arrow);

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);

    wrapper.value = currentValue;
    Object.defineProperty(wrapper, 'value', {
        get() { return currentValue; },
        set(v) {
            currentValue = v;
            const opt = options.find(o => o.value === v);
            trigger.textContent = opt ? opt.label : (placeholder || '');
            trigger.appendChild(arrow);
            renderOptions();
        }
    });

    wrapper.updateOptions = function(newOptions, newSelectedValue) {
        options.length = 0;
        newOptions.forEach(o => options.push(o));
        if (newSelectedValue !== undefined) {
            currentValue = newSelectedValue;
        }
        const opt = options.find(o => o.value === currentValue);
        trigger.textContent = opt ? opt.label : (placeholder || '');
        trigger.appendChild(arrow);
        renderOptions();
    };

    return wrapper;
}

const S = (strings, ...values) => {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
        result += values[i] + strings[i + 1];
    }
    return result.replace(/\s+/g, ' ').trim();
};


function $tag(chineseName, value) {
    const locale = getLocale();
    if (locale === 'en' && tagI18n.en[chineseName]) {
        return tagI18n.en[chineseName];
    }
    return chineseName;
}

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function $t(key) {
    const locale = getLocale();
    return i18n[locale][key] || i18n['en'][key] || key;
}

function getDescriptionHTML() {
    return `<h3 style="margin:0 0 12px 0;color:#60a5fa;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(96,165,250,0.2);letter-spacing:0.2px;">${$t('nodeTitle')}</h3>
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
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('usage1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('usage2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('usage3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('usage4')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('paramsTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramTagEdit')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramAutoRandom')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramExpandMode')}</li>
<li style="margin:4px 0;padding-left:12px;list-style:none;position:relative;color:#94a3b8;">${$t('paramExpandMode1')}</li>
<li style="margin:4px 0;padding-left:12px;list-style:none;position:relative;color:#94a3b8;">${$t('paramExpandMode2')}</li>
<li style="margin:4px 0;padding-left:12px;list-style:none;position:relative;color:#94a3b8;">${$t('paramExpandMode3')}</li>
<li style="margin:4px 0;padding-left:12px;list-style:none;position:relative;color:#94a3b8;">${$t('paramExpandMode4')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramOutputLang')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramPlatform')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramMaxTokens')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#fbbf24;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">⚠️ ${$t('expandPrereqTitle')}</h4>
<div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:8px;padding:12px;margin:8px 0;">
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#fcd34d;">${$t('expandPrereq1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#fcd34d;">${$t('expandPrereq2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#fcd34d;">${$t('expandPrereq3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#fcd34d;">${$t('expandPrereq4')}</li>
</ul>
<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(251,191,36,0.15);display:flex;align-items:center;justify-content:space-between;">
<span style="color:#94a3b8;font-size:12px;">${$t('clickToConfig')}</span>
<button id="zhihui-open-settings-btn" style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#fff;border:none;border-radius:6px;padding:5px 10px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s ease;box-shadow:0 2px 6px rgba(245,158,11,0.25);display:inline-flex;align-items:center;gap:4px;">⚙️ ${$t('openSettingsBtn')}</button>
</div>
</div>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('randomTitle')}</h4>
<p style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;">${$t('randomDesc')}</p>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('random1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('random2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('random3')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('inputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('inputDesc')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('outputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('outputDesc')}</li>
</ul>`;
}

function createHelpPopup(description, onClose) {
    const docElement = DOM.div(`background: linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); position: absolute; color: #e2e8f0; font: 13px 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 20px 24px 24px 24px; border-radius: 16px; border: 1px solid rgba(99,179,237,0.3); z-index: 1000; overflow: hidden; max-width: 560px; max-height: 600px; min-width: 400px; box-shadow: 0 0 40px rgba(59,130,246,0.15), 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);`);

    docElement.innerHTML = `<div style="overflow-y:auto;max-height:540px;padding-right:8px;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.25) transparent;">${description}</div>`;

    document.body.appendChild(docElement);

    const bindSettingsBtn = () => {
        const settingsBtn = docElement.querySelector('#zhihui-open-settings-btn');
        if (settingsBtn) {
            const newBtn = settingsBtn.cloneNode(true);
            settingsBtn.parentNode.replaceChild(newBtn, settingsBtn);
            
            newBtn.addEventListener('click', () => {
                if (typeof window.openZhihuiApiSettings === 'function') {
                    if (docElement.parentNode) {
                        docElement.remove();
                    }
                    if (onClose) onClose();
                    window.openZhihuiApiSettings();
                }
            });
            newBtn.addEventListener('mouseenter', () => {
                newBtn.style.transform = 'scale(1.05)';
                newBtn.style.boxShadow = '0 4px 16px rgba(245,158,11,0.4)';
            });
            newBtn.addEventListener('mouseleave', () => {
                newBtn.style.transform = 'scale(1)';
                newBtn.style.boxShadow = '0 2px 8px rgba(245,158,11,0.3)';
            });
        }
    };

    bindSettingsBtn();
    docElement._bindSettingsBtn = bindSettingsBtn;

    return docElement;
}

const commonStyles = {
    button: {
        base: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
        },
        primary: {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
            borderColor: 'rgba(59,130,246,0.7)',
            color: '#ffffff'
        },
        primaryHover: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
            boxShadow: '0 2px 4px rgba(59,130,246,0.2), 0 1px 2px rgba(0,0,0,0.1)',
            borderColor: 'rgba(59,130,246,0.5)',
            transform: 'none'
        },
        danger: {
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            borderColor: 'rgba(220,38,38,0.8)',
            color: '#ffffff'
        },
        dangerHover: {
            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
            borderColor: 'rgba(248,113,113,0.8)',
            transform: 'none'
        }
    },
    tooltip: {
        base: {
            position: 'absolute',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: '#fff',
            borderRadius: '6px',
            border: '1px solid #3b82f6',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
            transition: 'opacity 0.2s ease'
        }
    },
    input: {
        base: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(59,130,246,0.4)',
            background: 'rgba(15,23,42,0.3)',
            color: '#e2e8f0',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            outline: 'none'
        },
        focus: {
            borderColor: '#38bdf8',
            boxShadow: '0 0 0 2px rgba(56,189,248,0.2), inset 0 1px 2px rgba(0,0,0,0.2)',
            background: 'rgba(15,23,42,0.4)'
        }
    },
    tag: {
        base: {
            display: 'inline-block',
            padding: '6px 12px',
            background: '#444',
            color: '#ccc',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            position: 'relative'
        },
        selected: {
            backgroundColor: '#22c55e',
            color: '#fff'
        },
        hover: {
            backgroundColor: 'rgb(49, 84, 136)',
            color: '#fff'
        }
    }
}

const TOAST_TYPE_STYLES = {
    success: { background: GRADIENTS.success, borderColor: COLORS.success },
    error: { background: GRADIENTS.danger, borderColor: COLORS.danger },
    warning: { background: GRADIENTS.warning, borderColor: COLORS.warning },
    info: { background: GRADIENTS.info, borderColor: COLORS.primary }
};

const TOAST_BASE_STYLE = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; font-size: 14px; font-weight: 500; max-width: 400px; word-wrap: break-word; animation: slideInCenter 0.3s ease; pointer-events: none;';

function showToast(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    
    const style = TOAST_TYPE_STYLES[type] || TOAST_TYPE_STYLES.info;
    toast.style.cssText = `${TOAST_BASE_STYLE} background: ${style.background}; border: 1px solid ${style.borderColor};`;

    if (!document.getElementById('toast-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'toast-animations';
        styleSheet.textContent = `
            @keyframes slideInCenter {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes slideOutCenter {
                from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutCenter 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, duration);

    return toast;
}

window.updateCategoryRedDots = updateCategoryRedDots;
window.updateSelectedTagsOverview = updateSelectedTagsOverview;

function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}

function setupButtonHoverEffect(element, normalStyles, hoverStyles) {
    applyStyles(element, normalStyles);
    
    element.addEventListener('mouseenter', () => {
        applyStyles(element, hoverStyles);
    });
    
    element.addEventListener('mouseleave', () => {
        applyStyles(element, normalStyles);
    });
}

app.registerExtension({
    name: "zhihui.TagSelector",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "TagSelector") {
            const iconSize = 24;
            const iconMargin = 4;
            let helpElement = null;
            let currentHelpLocale = null;

            const onDrawForeground = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const r = onDrawForeground ? onDrawForeground.apply(this, arguments) : undefined;
                if (this.flags.collapsed) return r;

                const currentLocale = getLocale();

                if (this._tagSelectorHelp && helpElement === null) {
                    currentHelpLocale = currentLocale;
                    helpElement = createHelpPopup(getDescriptionHTML(), () => {
                        this._tagSelectorHelp = false;
                        helpElement = null;
                    });
                }
                else if (!this._tagSelectorHelp && helpElement !== null) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                else if (this._tagSelectorHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                    helpElement.querySelector('div').innerHTML = getDescriptionHTML();
                    if (helpElement._bindSettingsBtn) {
                        helpElement._bindSettingsBtn();
                    }
                    currentHelpLocale = currentLocale;
                }

                if (this._tagSelectorHelp && helpElement !== null) {
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

                const x = this.size[0] - iconSize - iconMargin;
                const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;
                // 展开中或鼠标悬停时高亮
                const helpActive = !!(this._tagSelectorHelp || this._tagSelectorHelpHovered);

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
                    this._tagSelectorHelp = !this._tagSelectorHelp;
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
                if (hovered !== this._tagSelectorHelpHovered) {
                    this._tagSelectorHelpHovered = hovered;
                    this.setDirtyCanvas(true, true);
                }
                return r;
            };

            const mouseLeave = nodeType.prototype.onMouseLeave;
            nodeType.prototype.onMouseLeave = function () {
                const r = mouseLeave ? mouseLeave.apply(this, arguments) : undefined;
                if (this._tagSelectorHelpHovered) {
                    this._tagSelectorHelpHovered = false;
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
    nodeCreated(node) {
        if (node.comfyClass === "TagSelector") {
            const button = node.addWidget("button", $t('openTagSelector'), "open_selector", () => {
                openTagSelector(node);
            });
            button.serialize = false;
            
            const applyWidgetVisibility = (widget, show) => {
                if (!widget) return;
                widget.hidden = !show;
                widget.disabled = !show;
                if (widget.options && typeof widget.options === "object") {
                    widget.options.hidden = !show;
                }
                if (widget.inputEl) {
                    widget.inputEl.disabled = !show;
                    widget.inputEl.style.display = show ? '' : 'none';
                }
            };
            
            const updateExpandWidgets = () => {
                const expandModeWidget = node.widgets?.find(w => w.name === "expand_mode");
                const outputLangWidget = node.widgets?.find(w => w.name === "output_language");
                const platformWidget = node.widgets?.find(w => w.name === "platform");
                const maxTokensWidget = node.widgets?.find(w => w.name === "max_tokens");
                
                const isDisabled = !expandModeWidget || expandModeWidget.value === "Disabled";
                
                applyWidgetVisibility(outputLangWidget, !isDisabled);
                applyWidgetVisibility(platformWidget, !isDisabled);
                applyWidgetVisibility(maxTokensWidget, !isDisabled);
            };
            
            const expandModeWidget = node.widgets?.find(w => w.name === "expand_mode");
            if (expandModeWidget) {
                const originalCallback = expandModeWidget.callback;
                expandModeWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(node, value);
                    updateExpandWidgets();
                };
            }
            
            setTimeout(updateExpandWidgets, 100);
            
            setTimeout(() => {
                const tagEditWidget = node.widgets?.find(w => w.name === "tag_edit");
                if (!tagEditWidget || !tagEditWidget.inputEl) return;
                
                const inputEl = tagEditWidget.inputEl;
                const parentEl = inputEl.parentElement;
                if (!parentEl) return;
                
                if (parentEl.querySelector('.tag-selector-toolbar')) return;
                
                parentEl.style.position = "relative";
                
                const toolbar = document.createElement('div');
                toolbar.className = 'tag-selector-toolbar';
                toolbar.style.cssText = `position: absolute; bottom: 100%; left: 0; display: flex; align-items: center; gap: 4px; padding: 0; margin-bottom: 2px; background: none; border: none; border-radius: 0; z-index: 5;`;
                
                const insertBtn = document.createElement("button");
                insertBtn.type = "button";
                insertBtn.className = "tag-selector-insert-btn";
                insertBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:flex;margin:auto;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;
                insertBtn.style.cssText = `display: none; width: 20px; height: 20px; padding: 0; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.25); border-radius: 5px; cursor: pointer; transition: all 0.2s ease; color: #60a5fa;`;
                insertBtn.dataset.enabled = String(loadNodeSettings().showInsertBtn !== false);
                
                insertBtn.onmouseenter = () => {
                    insertBtn.style.background = "rgba(59,130,246,0.3)";
                    insertBtn.style.borderColor = "rgba(59,130,246,0.5)";
                    showInsertTagTooltip(insertBtn);
                };
                insertBtn.onmouseleave = () => {
                    insertBtn.style.background = "rgba(59,130,246,0.15)";
                    insertBtn.style.borderColor = "rgba(59,130,246,0.25)";
                    hideInsertTagTooltip();
                };
                insertBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showCustomTagInsertSelector(insertBtn, tagEditWidget, node);
                };
                
                toolbar.appendChild(insertBtn);
                
                const inspirationBtn = document.createElement("button");
                inspirationBtn.type = "button";
                inspirationBtn.className = "tag-selector-inspiration-btn";
                inspirationBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:flex;margin:auto;"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>`;
                inspirationBtn.style.cssText = `display: none; width: 20px; height: 20px; padding: 0; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.25); border-radius: 5px; cursor: pointer; transition: all 0.2s ease; color: #a78bfa;`;
                inspirationBtn.dataset.enabled = String(loadNodeSettings().showInspirationBtn !== false);
                
                inspirationBtn.onmouseenter = () => {
                    inspirationBtn.style.background = "rgba(139,92,246,0.3)";
                    inspirationBtn.style.borderColor = "rgba(139,92,246,0.5)";
                    showInspirationTooltip(inspirationBtn);
                };
                inspirationBtn.onmouseleave = () => {
                    inspirationBtn.style.background = "rgba(139,92,246,0.15)";
                    inspirationBtn.style.borderColor = "rgba(139,92,246,0.25)";
                    hideInspirationTooltip();
                };
                inspirationBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showInspirationSelector(inspirationBtn, tagEditWidget);
                };
                
                toolbar.appendChild(inspirationBtn);
                
                const clearBtn = document.createElement("button");
                clearBtn.type = "button";
                clearBtn.className = "tag-selector-clear-btn";
                clearBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:flex;margin:auto;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                clearBtn.style.cssText = `display: none; width: 20px; height: 20px; padding: 0; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2); border-radius: 5px; cursor: pointer; transition: all 0.2s ease; color: #f87171;`;
                clearBtn.dataset.enabled = String(loadNodeSettings().showClearBtn !== false);
                
                node._lastClearedTagEdit = undefined;
                
                clearBtn.onmouseenter = () => {
                    if (node._lastClearedTagEdit !== undefined) {
                        clearBtn.style.background = "rgba(34,197,94,0.25)";
                        clearBtn.style.borderColor = "rgba(34,197,94,0.4)";
                        clearBtn.style.color = "#4ade80";
                    } else {
                        clearBtn.style.background = "rgba(239,68,68,0.25)";
                        clearBtn.style.borderColor = "rgba(239,68,68,0.4)";
                        clearBtn.style.color = "#f87171";
                    }
                    showClearInputTooltip(clearBtn, node._lastClearedTagEdit !== undefined ? 'restoreInputBtnTooltip' : 'clearInputBtnTooltip');
                };
                clearBtn.onmouseleave = () => {
                    if (node._lastClearedTagEdit !== undefined) {
                        clearBtn.style.background = "rgba(34,197,94,0.12)";
                        clearBtn.style.borderColor = "rgba(34,197,94,0.2)";
                        clearBtn.style.color = "#4ade80";
                    } else {
                        clearBtn.style.background = "rgba(239,68,68,0.12)";
                        clearBtn.style.borderColor = "rgba(239,68,68,0.2)";
                        clearBtn.style.color = "#f87171";
                    }
                    hideClearInputTooltip();
                };
                clearBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (node._lastClearedTagEdit !== undefined) {
                        inputEl.value = node._lastClearedTagEdit;
                        tagEditWidget.value = node._lastClearedTagEdit;
                        node._lastClearedTagEdit = undefined;
                        clearBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:flex;margin:auto;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                        clearBtn.style.background = "rgba(239,68,68,0.12)";
                        clearBtn.style.borderColor = "rgba(239,68,68,0.2)";
                        clearBtn.style.color = "#f87171";
                        showToast($t('inputRestored'), 'success');
                    } else {
                        node._lastClearedTagEdit = inputEl.value;
                        inputEl.value = "";
                        tagEditWidget.value = "";
                        clearBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:flex;margin:auto;"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;
                        clearBtn.style.background = "rgba(34,197,94,0.12)";
                        clearBtn.style.borderColor = "rgba(34,197,94,0.2)";
                        clearBtn.style.color = "#4ade80";
                        showToast($t('inputCleared'), 'success');
                    }
                    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                };
                
                toolbar.appendChild(clearBtn);
                
                parentEl.appendChild(toolbar);
                
                function updateToolbarVisibility() {
                    const hasEnabled = insertBtn.dataset.enabled === 'true' || inspirationBtn.dataset.enabled === 'true' || clearBtn.dataset.enabled === 'true';
                    toolbar.style.display = hasEnabled ? 'flex' : 'none';
                    insertBtn.style.display = insertBtn.dataset.enabled === 'true' ? 'flex' : 'none';
                    inspirationBtn.style.display = inspirationBtn.dataset.enabled === 'true' ? 'flex' : 'none';
                    clearBtn.style.display = clearBtn.dataset.enabled === 'true' ? 'flex' : 'none';
                }
                updateToolbarVisibility();
            }, 100);
        }
    }
});

let tagSelectorDialog = null;
let currentNode = null;
let tagsData = null;
let customTagCategories = [];
let currentPreviewImage = null;
let currentPreviewImageName = null;

const DEBUG = false;
const log = DEBUG ? console.log : () => {};
const warn = DEBUG ? console.warn : () => {};
const errorLog = DEBUG ? console.error : () => {};

const PerformanceUtils = {
    throttle(fn, limit = 100) {
        let inThrottle = false;
        let lastArgs = null;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                    if (lastArgs) {
                        fn.apply(this, lastArgs);
                        lastArgs = null;
                    }
                }, limit);
            } else {
                lastArgs = args;
            }
        };
    },

    debounce(fn, wait = 100) {
        let timeoutId = null;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), wait);
        };
    },

    requestAnimationFrameThrottle(fn) {
        let rafId = null;
        let lastArgs = null;
        return function(...args) {
            lastArgs = args;
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    fn.apply(this, lastArgs);
                    rafId = null;
                    lastArgs = null;
                });
            }
        };
    },

    createFragment() {
        return document.createDocumentFragment();
    },

    batchAppend(parent, children) {
        const fragment = this.createFragment();
        children.forEach(child => fragment.appendChild(child));
        parent.appendChild(fragment);
    },

    memoize(fn, resolver) {
        const cache = new Map();
        const memoized = function(...args) {
            const key = resolver ? resolver(...args) : JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
        memoized.cache = cache;
        return memoized;
    },

    weakMemoize(fn) {
        const cache = new WeakMap();
        return function(key, ...args) {
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.call(this, key, ...args);
            cache.set(key, result);
            return result;
        };
    },

    createObjectPool(factory, reset, initialSize = 10) {
        const pool = [];
        for (let i = 0; i < initialSize; i++) {
            pool.push(factory());
        }
        return {
            acquire() {
                return pool.length > 0 ? pool.pop() : factory();
            },
            release(obj) {
                reset(obj);
                if (pool.length < initialSize * 2) {
                    pool.push(obj);
                }
            },
            getPoolSize() {
                return pool.length;
            }
        };
    }
};

const domCache = new Map();
const searchCache = new Map();
const MAX_CACHE_SIZE = 100;

function getCachedElement(selector, parent = document) {
    const cacheKey = `${parent === document ? 'doc' : parent.id || 'parent'}_${selector}`;
    if (domCache.has(cacheKey)) {
        const el = domCache.get(cacheKey);
        if (el && el.parentNode) {
            return el;
        }
        domCache.delete(cacheKey);
    }
    const el = parent.querySelector(selector);
    if (el) {
        if (domCache.size > MAX_CACHE_SIZE) {
            const firstKey = domCache.keys().next().value;
            domCache.delete(firstKey);
        }
        domCache.set(cacheKey, el);
    }
    return el;
}

function clearDomCache() {
    domCache.clear();
}

function clearSearchCache() {
    searchCache.clear();
}

const STYLES = {
    section: 'background: rgba(15,23,42,0.5); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px;',
    sectionBlue: 'background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.3); border-radius: 8px; padding: 16px;',
    titleH3: 'color: #60a5fa; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;',
    titleH4: 'color: ${color}; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid ${color}30;',
    input: 'width: 60px; padding: 4px 6px; border: 1px solid rgba(59,130,246,0.4); border-radius: 4px; background: rgba(15,23,42,0.3); color: #e2e8f0; font-size: 12px;',
    label: 'color: #94a3b8; font-size: 12px;',
    textLight: 'color: #e2e8f0; font-size: 14px;'
};

function createSection(styleKey = 'section', className = '') {
    const section = document.createElement('div');
    if (className) section.classList.add(className);
    section.style.cssText = STYLES[styleKey] || STYLES.section;
    return section;
}

function createTitle(text, level = 'h3') {
    const title = document.createElement(level);
    title.textContent = text;
    title.style.cssText = level === 'h3' ? STYLES.titleH3 : STYLES.titleH4;
    return title;
}

function $tc(categoryName) {
    const locale = getLocale();
    return categoryTranslations[locale][categoryName] || categoryName;
}

function $tcReverse(englishCategoryName) {
    const locale = getLocale();
    if (locale !== 'en') return englishCategoryName;
    
    const enTranslations = categoryTranslations.en;
    for (const [chineseName, englishName] of Object.entries(enTranslations)) {
        if (englishName === englishCategoryName) {
            return chineseName;
        }
    }
    return englishCategoryName;
}

// 共用的 adultCategories 配置 - 非成人预设使用（全部禁用）
const DISABLED_ADULT_CATEGORIES = {
    '涩影湿.性暗示': { enabled: false, weight: 1, count: 1 },
    '涩影湿.性行为.性行为类型': { enabled: false, weight: 1, count: 1 },
    '涩影湿.性行为.身体部位': { enabled: false, weight: 1, count: 1 },
    '涩影湿.性行为.道具与玩具': { enabled: false, weight: 1, count: 1 },
    '涩影湿.性行为.束缚与调教': { enabled: false, weight: 1, count: 1 },
    '涩影湿.性行为.特殊癖好与情境': { enabled: false, weight: 1, count: 1 },
    '涩影湿.性行为.视觉风格与特定元素': { enabled: false, weight: 1, count: 1 },
    '涩影湿.性行为.欲望表情': { enabled: false, weight: 1, count: 1 }
};

// 成人预设使用的 adultCategories 配置（部分启用）
const ENABLED_ADULT_CATEGORIES = {
    '涩影湿.性暗示': { enabled: true, weight: 2, count: 1 },
    '涩影湿.性行为.性行为类型': { enabled: true, weight: 3, count: 2 },
    '涩影湿.性行为.身体部位': { enabled: true, weight: 2, count: 1 },
    '涩影湿.性行为.道具与玩具': { enabled: true, weight: 1, count: 1 },
    '涩影湿.性行为.束缚与调教': { enabled: true, weight: 1, count: 1 },
    '涩影湿.性行为.特殊癖好与情境': { enabled: true, weight: 1, count: 1 },
    '涩影湿.性行为.视觉风格与特定元素': { enabled: true, weight: 1, count: 1 },
    '涩影湿.性行为.欲望表情': { enabled: true, weight: 2, count: 1 }
};

const PRESET_KEY_MAP = {
    '默认预设': 'defaultPreset',
    '人物肖像': 'portrait',
    '全身人物': 'fullBody',
    '风景场景': 'landscape',
    '艺术创作': 'artCreation',
    '太空科幻': 'spaceSciFi',
    '中国风': 'chineseStyle',
    '科幻赛博': 'cyberpunk',
    '二次元动漫': 'anime',
    '游戏角色': 'gameCharacter',
    '玄幻修仙': 'fantasy',
    '艺术写真': 'artPhoto',
    '电影海报': 'moviePoster',
    '电商产品': 'ecommerce',
    '萌宠': 'cutePets',
    '成人色情': 'adult'
};

let extractorSettings = {
    seed: -1,
    excluded: '',
    customPrompt: ''
};

let randomSettings = {
    categories: {
        '常规标签.画质': { enabled: true, weight: 2, count: 1 },
        '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
        '常规标签.构图': { enabled: true, weight: 2, count: 1 },
        '常规标签.光影': { enabled: true, weight: 2, count: 1 },
        '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
        '艺术题材.艺术流派': { enabled: true, weight: 1, count: 1 },
        '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
        '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
        '艺术题材.装饰图案': { enabled: true, weight: 1, count: 1 },
        '艺术题材.色彩与质感': { enabled: true, weight: 1, count: 1 },
        '人物类.角色.动漫角色': { enabled: true, weight: 2, count: 1 },
        '人物类.角色.游戏角色': { enabled: true, weight: 1, count: 1 },
        '人物类.角色.二次元虚拟偶像': { enabled: true, weight: 1, count: 1 },
        '人物类.角色.3D动画角色': { enabled: true, weight: 1, count: 1 },
        '人物类.外貌与特征': { enabled: true, weight: 2, count: 2 },
        '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.嘴巴': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
        '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
        '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰': { enabled: true, weight: 2, count: 2 },
        '人物类.服饰.常服': { enabled: true, weight: 2, count: 1 },
        '人物类.服饰.泳装': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.内衣': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.睡衣': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.制服COS': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.传统服饰': { enabled: true, weight: 1, count: 1 },
        '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
        '动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
        '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
        '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
        '动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
        '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
        '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
        '道具.翅膀': { enabled: true, weight: 1, count: 1 },
        '道具.尾巴': { enabled: true, weight: 1, count: 1 },
        '道具.耳朵': { enabled: true, weight: 1, count: 1 },
        '道具.角': { enabled: true, weight: 1, count: 1 },
        '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
        '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
        '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
        '场景类.反射效果': { enabled: true, weight: 1, count: 1 },
        '场景类.室外': { enabled: true, weight: 2, count: 1 },
        '场景类.城市': { enabled: true, weight: 1, count: 1 },
        '场景类.建筑': { enabled: true, weight: 2, count: 1 },
        '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
        '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
        '场景类.人造景观': { enabled: true, weight: 1, count: 1 },
        '动物生物.动物': { enabled: false, weight: 1, count: 1 },
        '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
        '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
    },
    adultCategories: { ...DISABLED_ADULT_CATEGORIES },
    excludedCategories: ['自定义', '灵感套装'],
    includeNSFW: false,
    limitTotalTags: true,
    totalTagsRange: { min: 12, max: 20 }
};

const BASE_CATEGORIES = {
    '常规标签.画质': { enabled: true, weight: 1, count: 1 },
    '常规标签.摄影': { enabled: true, weight: 1, count: 1 },
    '常规标签.构图': { enabled: true, weight: 1, count: 1 },
    '常规标签.光影': { enabled: true, weight: 1, count: 1 },
    '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
    '艺术题材.艺术流派': { enabled: true, weight: 1, count: 1 },
    '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
    '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
    '艺术题材.装饰图案': { enabled: true, weight: 1, count: 1 },
    '艺术题材.色彩与质感': { enabled: true, weight: 1, count: 1 },
    '人物类.角色.动漫角色': { enabled: true, weight: 1, count: 1 },
    '人物类.角色.游戏角色': { enabled: true, weight: 1, count: 1 },
    '人物类.角色.二次元虚拟偶像': { enabled: true, weight: 1, count: 1 },
    '人物类.角色.3D动画角色': { enabled: true, weight: 1, count: 1 },
    '人物类.外貌与特征': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.嘴巴': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.头发': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.眼睛': { enabled: true, weight: 1, count: 1 },
    '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.常服': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.泳装': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.内衣': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.睡衣': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.制服COS': { enabled: true, weight: 1, count: 1 },
    '人物类.服饰.传统服饰': { enabled: true, weight: 1, count: 1 },
    '动作/表情.姿态动作': { enabled: true, weight: 1, count: 1 },
    '动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
    '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
    '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
    '动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
    '动作/表情.表情': { enabled: true, weight: 1, count: 1 },
    '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
    '道具.翅膀': { enabled: true, weight: 1, count: 1 },
    '道具.尾巴': { enabled: true, weight: 1, count: 1 },
    '道具.耳朵': { enabled: true, weight: 1, count: 1 },
    '道具.角': { enabled: true, weight: 1, count: 1 },
    '场景类.光线环境': { enabled: true, weight: 1, count: 1 },
    '场景类.情感与氛围': { enabled: true, weight: 1, count: 1 },
    '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
    '场景类.反射效果': { enabled: true, weight: 1, count: 1 },
    '场景类.室外': { enabled: true, weight: 1, count: 1 },
    '场景类.城市': { enabled: true, weight: 1, count: 1 },
    '场景类.建筑': { enabled: true, weight: 1, count: 1 },
    '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
    '场景类.自然景观': { enabled: true, weight: 1, count: 1 },
    '场景类.人造景观': { enabled: true, weight: 1, count: 1 },
    '动物生物.动物': { enabled: true, weight: 1, count: 1 },
    '动物生物.幻想生物': { enabled: true, weight: 1, count: 1 },
    '动物生物.行为动态': { enabled: true, weight: 1, count: 1 }
};

function makeCategories(overrides) {
    const categories = {};
    for (const [key, defaults] of Object.entries(BASE_CATEGORIES)) {
        categories[key] = { ...defaults, ...(overrides[key] || {}) };
    }
    return categories;
}

function resetRandomSettings() {
    randomSettings = {
        categories: makeCategories({
            '常规标签.画质': { weight: 2 },
            '常规标签.摄影': { weight: 2 },
            '常规标签.构图': { weight: 2 },
            '常规标签.光影': { weight: 2 },
            '人物类.角色.动漫角色': { weight: 2 },
            '人物类.外貌与特征': { weight: 2, count: 2 },
            '人物类.人设.头发': { weight: 2 },
            '人物类.人设.眼睛': { weight: 2 },
            '人物类.服饰': { weight: 2, count: 2 },
            '人物类.服饰.常服': { weight: 2 },
            '动作/表情.姿态动作': { weight: 2 },
            '动作/表情.表情': { weight: 2 },
            '场景类.光线环境': { weight: 2 },
            '场景类.情感与氛围': { weight: 2 },
            '场景类.室外': { weight: 2 },
            '场景类.建筑': { weight: 2 },
            '场景类.自然景观': { weight: 2 },
            '动物生物.动物': { enabled: false },
            '动物生物.幻想生物': { enabled: false },
            '动物生物.行为动态': { enabled: false }
        }),
        adultCategories: { ...ENABLED_ADULT_CATEGORIES },
        excludedCategories: ['自定义', '灵感套装'],
        includeNSFW: false,
        limitTotalTags: true,
        totalTagsRange: { min: 12, max: 20 }
    };
}

const randomPresets = {
    '默认预设': {
        descriptionKey: 'descDefault',
        icon: '🔄',
        color: '#22c55e',
        settings: {
            categories: makeCategories({}),
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 15, max: 25 }
        }
    },
    '人物肖像': {
        descriptionKey: 'descPortrait',
        icon: '👤',
        color: '#1e40af',
        settings: {
            categories: makeCategories({
                '常规标签.画质': { weight: 5, count: 2 },
                '常规标签.摄影': { weight: 3 },
                '常规标签.构图': { weight: 3 },
                '常规标签.光影': { weight: 4 },
                '艺术题材.艺术家风格': { weight: 2 },
                '艺术题材.艺术流派': { enabled: false },
                '艺术题材.技法形式': { weight: 2 },
                '艺术题材.媒介与效果': { weight: 2 },
                '艺术题材.装饰图案': { enabled: false },
                '艺术题材.色彩与质感': { weight: 3 },
                '人物类.角色.动漫角色': { enabled: false },
                '人物类.角色.游戏角色': { enabled: false },
                '人物类.角色.二次元虚拟偶像': { enabled: false },
                '人物类.角色.3D动画角色': { enabled: false },
                '人物类.外貌与特征': { weight: 4, count: 3 },
                '人物类.人设.性别/年龄': { weight: 3 },
                '人物类.人设.胸部': { weight: 2 },
                '人物类.人设.脸型': { weight: 3 },
                '人物类.人设.鼻子': { weight: 2 },
                '人物类.人设.嘴巴': { weight: 3 },
                '人物类.人设.皮肤': { weight: 3 },
                '人物类.人设.体型': { weight: 2 },
                '人物类.人设.眉毛': { weight: 3 },
                '人物类.人设.头发': { weight: 4, count: 2 },
                '人物类.人设.眼睛': { weight: 4, count: 2 },
                '人物类.人设.瞳孔': { weight: 3 },
                '人物类.服饰': { weight: 2 },
                '人物类.服饰.常服': { weight: 2 },
                '人物类.服饰.泳装': { enabled: false },
                '人物类.服饰.运动装': { enabled: false },
                '人物类.服饰.内衣': { enabled: false },
                '人物类.服饰.配饰': { weight: 2 },
                '人物类.服饰.鞋类': { enabled: false },
                '人物类.服饰.睡衣': { enabled: false },
                '人物类.服饰.帽子': { weight: 2 },
                '人物类.服饰.制服COS': { enabled: false },
                '人物类.服饰.传统服饰': { weight: 2 },
                '动作/表情.姿态动作': { weight: 2 },
                '动作/表情.多人互动': { enabled: false },
                '动作/表情.手部': { weight: 2 },
                '动作/表情.腿部': { enabled: false },
                '动作/表情.眼神': { weight: 4 },
                '动作/表情.表情': { weight: 4 },
                '动作/表情.嘴型': { weight: 3 },
                '道具.翅膀': { enabled: false },
                '道具.尾巴': { enabled: false },
                '道具.耳朵': { enabled: false },
                '道具.角': { enabled: false },
                '场景类.光线环境': { weight: 4 },
                '场景类.情感与氛围': { weight: 3 },
                '场景类.背景环境': { weight: 2 },
                '场景类.反射效果': { weight: 2 },
                '场景类.室外': { enabled: false },
                '场景类.城市': { enabled: false },
                '场景类.建筑': { enabled: false },
                '场景类.室内装饰': { weight: 2 },
                '场景类.自然景观': { enabled: false },
                '场景类.人造景观': { enabled: false },
                '动物生物.动物': { enabled: false },
                '动物生物.幻想生物': { enabled: false },
                '动物生物.行为动态': { enabled: false }
            }),
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 12, max: 18 }
        }
    },
    '全身人物': {
        descriptionKey: 'descFullBody',
        icon: '🧍',
        color: '#92400e',
        settings: {
            categories: makeCategories({
                '常规标签.画质': { weight: 4, count: 2 },
                '常规标签.摄影': { weight: 3 },
                '常规标签.构图': { weight: 4 },
                '常规标签.光影': { weight: 3 },
                '艺术题材.艺术家风格': { weight: 2 },
                '艺术题材.艺术流派': { enabled: false },
                '艺术题材.技法形式': { weight: 2 },
                '艺术题材.媒介与效果': { weight: 2 },
                '艺术题材.装饰图案': { enabled: false },
                '艺术题材.色彩与质感': { weight: 3 },
                '人物类.角色.动漫角色': { enabled: false },
                '人物类.角色.游戏角色': { enabled: false },
                '人物类.角色.二次元虚拟偶像': { enabled: false },
                '人物类.角色.3D动画角色': { enabled: false },
                '人物类.外貌与特征': { weight: 3, count: 2 },
                '人物类.人设.职业': { weight: 2 },
                '人物类.人设.性别/年龄': { weight: 3 },
                '人物类.人设.胸部': { weight: 2 },
                '人物类.人设.脸型': { weight: 2 },
                '人物类.人设.鼻子': { weight: 2 },
                '人物类.人设.嘴巴': { weight: 2 },
                '人物类.人设.皮肤': { weight: 2 },
                '人物类.人设.体型': { weight: 3 },
                '人物类.人设.眉毛': { weight: 2 },
                '人物类.人设.头发': { weight: 3 },
                '人物类.人设.眼睛': { weight: 3 },
                '人物类.人设.瞳孔': { weight: 2 },
                '人物类.服饰': { weight: 4, count: 2 },
                '人物类.服饰.常服': { weight: 3 },
                '人物类.服饰.泳装': { weight: 2 },
                '人物类.服饰.运动装': { weight: 2 },
                '人物类.服饰.内衣': { enabled: false },
                '人物类.服饰.配饰': { weight: 3 },
                '人物类.服饰.鞋类': { weight: 2 },
                '人物类.服饰.睡衣': { enabled: false },
                '人物类.服饰.帽子': { weight: 2 },
                '人物类.服饰.制服COS': { weight: 2 },
                '人物类.服饰.传统服饰': { weight: 2 },
                '动作/表情.姿态动作': { weight: 4 },
                '动作/表情.多人互动': { enabled: false },
                '动作/表情.手部': { weight: 3 },
                '动作/表情.腿部': { weight: 3 },
                '动作/表情.眼神': { weight: 2 },
                '动作/表情.表情': { weight: 3 },
                '动作/表情.嘴型': { weight: 2 },
                '道具.翅膀': { weight: 2 },
                '道具.尾巴': { weight: 2 },
                '道具.耳朵': { weight: 2 },
                '道具.角': { weight: 2 },
                '场景类.光线环境': { weight: 3 },
                '场景类.情感与氛围': { weight: 3 },
                '场景类.背景环境': { weight: 3 },
                '场景类.反射效果': { weight: 2 },
                '场景类.室外': { weight: 2 },
                '场景类.城市': { weight: 2 },
                '场景类.建筑': { weight: 2 },
                '场景类.室内装饰': { weight: 2 },
                '场景类.自然景观': { weight: 2 },
                '场景类.人造景观': { weight: 2 },
                '动物生物.动物': { enabled: false },
                '动物生物.幻想生物': { enabled: false },
                '动物生物.行为动态': { enabled: false }
            }),
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 16, max: 24 }
        }
    },
    '风景场景': {
        descriptionKey: 'descLandscape',
        icon: '🏞️',
        color: '#047857',
        settings: {
            categories: makeCategories({
                '常规标签.画质': { weight: 5, count: 2 },
                '常规标签.摄影': { weight: 3 },
                '常规标签.构图': { weight: 4 },
                '常规标签.光影': { weight: 4 },
                '艺术题材.艺术家风格': { weight: 2 },
                '艺术题材.艺术流派': { weight: 2 },
                '艺术题材.技法形式': { weight: 2 },
                '艺术题材.媒介与效果': { weight: 2 },
                '艺术题材.装饰图案': { enabled: false },
                '艺术题材.色彩与质感': { weight: 4 },
                '人物类.角色.动漫角色': { enabled: false },
                '人物类.角色.游戏角色': { enabled: false },
                '人物类.角色.二次元虚拟偶像': { enabled: false },
                '人物类.角色.3D动画角色': { enabled: false },
                '人物类.外貌与特征': { enabled: false },
                '人物类.人设.职业': { enabled: false },
                '人物类.人设.性别/年龄': { enabled: false },
                '人物类.人设.胸部': { enabled: false },
                '人物类.人设.脸型': { enabled: false },
                '人物类.人设.鼻子': { enabled: false },
                '人物类.人设.嘴巴': { enabled: false },
                '人物类.人设.皮肤': { enabled: false },
                '人物类.人设.体型': { enabled: false },
                '人物类.人设.眉毛': { enabled: false },
                '人物类.人设.头发': { enabled: false },
                '人物类.人设.眼睛': { enabled: false },
                '人物类.人设.瞳孔': { enabled: false },
                '人物类.服饰': { enabled: false },
                '人物类.服饰.常服': { enabled: false },
                '人物类.服饰.泳装': { enabled: false },
                '人物类.服饰.运动装': { enabled: false },
                '人物类.服饰.内衣': { enabled: false },
                '人物类.服饰.配饰': { enabled: false },
                '人物类.服饰.鞋类': { enabled: false },
                '人物类.服饰.睡衣': { enabled: false },
                '人物类.服饰.帽子': { enabled: false },
                '人物类.服饰.制服COS': { enabled: false },
                '人物类.服饰.传统服饰': { enabled: false },
                '动作/表情.姿态动作': { enabled: false },
                '动作/表情.多人互动': { enabled: false },
                '动作/表情.手部': { enabled: false },
                '动作/表情.腿部': { enabled: false },
                '动作/表情.眼神': { enabled: false },
                '动作/表情.表情': { enabled: false },
                '动作/表情.嘴型': { enabled: false },
                '道具.翅膀': { enabled: false },
                '道具.尾巴': { enabled: false },
                '道具.耳朵': { enabled: false },
                '道具.角': { enabled: false },
                '场景类.光线环境': { weight: 4 },
                '场景类.情感与氛围': { weight: 4 },
                '场景类.背景环境': { weight: 4 },
                '场景类.反射效果': { weight: 3 },
                '场景类.室外': { weight: 4 },
                '场景类.城市': { weight: 3 },
                '场景类.建筑': { weight: 4 },
                '场景类.室内装饰': { weight: 3 },
                '场景类.自然景观': { weight: 4, count: 2 },
                '场景类.人造景观': { weight: 3 },
                '动物生物.动物': { weight: 2 },
                '动物生物.幻想生物': { weight: 2 },
                '动物生物.行为动态': { weight: 2 }
            }),
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 14, max: 22 }
        }
    },
    '艺术创作': {
        descriptionKey: 'descArtCreation',
        icon: '🎨',
        color: '#f59e0b',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 4, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 4, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 3, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 3, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 4, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 2, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: true, weight: 2, count: 1 },
                '道具.尾巴': { enabled: true, weight: 2, count: 1 },
                '道具.耳朵': { enabled: true, weight: 2, count: 1 },
                '道具.角': { enabled: true, weight: 2, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: true, weight: 2, count: 1 },
                '场景类.建筑': { enabled: true, weight: 2, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: true, weight: 2, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 2, count: 1 },
                '动物生物.行为动态': { enabled: true, weight: 2, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 14, max: 22 }
        }
    },
    '太空科幻': {
        descriptionKey: 'descSpaceSciFi',
        icon: '🚀',
        color: '#0ea5e9',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 3, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 4, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 3, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 4, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 2, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 14, max: 22 }
        }
    },
    '中国风': {
        descriptionKey: 'descChineseStyle',
        icon: '🏮',
        color: '#dc2626',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 3, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 3, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 3, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 2 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 4, count: 2 },
                '动作/表情.姿态动作': { enabled: true, weight: 3, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 3, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 3, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 3, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 3, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 16, max: 24 }
        }
    },
    '科幻赛博': {
        descriptionKey: 'descCyberpunk',
        icon: '🤖',
        color: '#a855f7',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰': { enabled: true, weight: 3, count: 2 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 1, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: true, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: true, weight: 3, count: 1 },
                '场景类.建筑': { enabled: true, weight: 2, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 12, max: 20 }
        }
    },
    '二次元动漫': {
        descriptionKey: 'descAnime',
        icon: '🎭',
        color: '#0d9488',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 2, count: 1 },
                '人物类.角色.动漫角色': { enabled: true, weight: 3, count: 2 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.3D动画角色': { enabled: true, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 2, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 2 },
                '人物类.服饰.常服': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: true, weight: 1, count: 1 },
                '道具.尾巴': { enabled: true, weight: 1, count: 1 },
                '道具.耳朵': { enabled: true, weight: 1, count: 1 },
                '道具.角': { enabled: true, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
                '场景类.反射效果': { enabled: false, weight: 1, count: 1 },
                '场景类.室外': { enabled: true, weight: 1, count: 1 },
                '场景类.城市': { enabled: true, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 1, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 12, max: 20 }
        }
    },
    '游戏角色': {
        descriptionKey: 'descGameCharacter',
        icon: '🎮',
        color: '#6366f1',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: true, weight: 3, count: 2 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: true, weight: 2, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 3, count: 2 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 3, count: 1 },
                '动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
                '道具.翅膀': { enabled: true, weight: 1, count: 1 },
                '道具.尾巴': { enabled: true, weight: 1, count: 1 },
                '道具.耳朵': { enabled: true, weight: 1, count: 1 },
                '道具.角': { enabled: true, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: true, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 14, max: 22 }
        }
    },
    '玄幻修仙': {
        descriptionKey: 'descFantasy',
        icon: '🗡️',
        color: '#e11d48',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 3, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 3, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 3, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 2 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 4, count: 2 },
                '动作/表情.姿态动作': { enabled: true, weight: 4, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 3, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 3, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: true, weight: 2, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 4, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 3, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 3, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 3, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 3, count: 1 },
                '动物生物.行为动态': { enabled: true, weight: 2, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 16, max: 26 }
        }
    },
    '艺术写真': {
        descriptionKey: 'descArtPhoto',
        icon: '📸',
        color: '#1d4ed8',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 4, count: 1 },
                '常规标签.构图': { enabled: true, weight: 4, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 4, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 2 },
                '人物类.服饰.常服': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.泳装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 2, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 4, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 3, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 3, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 4, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 3, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 3, count: 1 },
                '场景类.室外': { enabled: true, weight: 3, count: 1 },
                '场景类.城市': { enabled: true, weight: 2, count: 1 },
                '场景类.建筑': { enabled: true, weight: 2, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 16, max: 24 }
        }
    },
    '电影海报': {
        descriptionKey: 'descMoviePoster',
        icon: '🎬',
        color: '#64748b',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 4, count: 1 },
                '常规标签.构图': { enabled: true, weight: 4, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 2, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 3, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 3, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 4, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 3, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 4, count: 1 },
                '动作/表情.多人互动': { enabled: true, weight: 3, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 3, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 4, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 4, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 3, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 4, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 3, count: 1 },
                '场景类.室外': { enabled: true, weight: 4, count: 1 },
                '场景类.城市': { enabled: true, weight: 3, count: 1 },
                '场景类.建筑': { enabled: true, weight: 3, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 3, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 3, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 18, max: 28 }
        }
    },
    '电商产品': {
        descriptionKey: 'descEcommerce',
        icon: '🛒',
        color: '#ca8a04',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术家风格': { enabled: false, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: false, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 2, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.职业': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.皮肤': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眼睛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.瞳孔': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 1, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: false, weight: 1, count: 1 },
                '动作/表情.表情': { enabled: false, weight: 1, count: 1 },
                '动作/表情.嘴型': { enabled: false, weight: 1, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
                '场景类.情感与氛围': { enabled: false, weight: 1, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: false, weight: 1, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: false, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: false, weight: 1, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 10, max: 18 }
        }
    },
    '萌宠': {
        descriptionKey: 'descCutePets',
        icon: '🐾',
        color: '#be185d',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术家风格': { enabled: false, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: false, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 2, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.职业': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.皮肤': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眼睛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.瞳孔': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.鞋类': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: false, weight: 1, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
                '动作/表情.嘴型': { enabled: false, weight: 1, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: true, weight: 2, count: 1 },
                '道具.耳朵': { enabled: true, weight: 2, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 1, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: false, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
                '场景类.人造景观': { enabled: false, weight: 1, count: 1 },
                '动物生物.动物': { enabled: true, weight: 3, count: 2 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: true, weight: 2, count: 1 }
            },
            adultCategories: { ...DISABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 12, max: 20 }
        }
    },
    '成人色情': {
        descriptionKey: 'descAdult',
        icon: '🔞',
        color: '#7c3aed',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 1, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.帽子': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 3, count: 1 },
                '动作/表情.多人互动': { enabled: true, weight: 2, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
                '场景类.反射效果': { enabled: false, weight: 1, count: 1 },
                '场景类.室外': { enabled: false, weight: 1, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: false, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: false, weight: 1, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: { ...ENABLED_ADULT_CATEGORIES },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: true,
            totalTagsRange: { min: 15, max: 25 }
        }
    }
};



async function openTagSelector(node) {
    currentNode = node;

    if (!tagsData) {
        await loadTagsData();
        await loadCustomTagCategories();
    }

    if (!tagSelectorDialog) {
        createTagSelectorDialog();
    }

    if (tagsData && Object.keys(tagsData).length > 0) {
        initializeCategoryList();
    }

    loadExistingTags();

    tagSelectorDialog.style.display = 'block';
    tagSelectorDialog.classList.remove('zs-overlay-exit');
    tagSelectorDialog.classList.add('zs-overlay-enter');
    
    if (tagSelectorDialog.dialogElement) {
        tagSelectorDialog.dialogElement.classList.remove('zs-dialog-exit');
        tagSelectorDialog.dialogElement.classList.add('zs-dialog-enter');
    }

    if (tagSelectorDialog.keydownHandler) {

        document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        document.addEventListener('keydown', tagSelectorDialog.keydownHandler);
    }

    updateSelectedTags();
}

async function loadTagsData() {
    try {
        const response = await fetch('/zhihui/tags');
        if (response.ok) {
            const rawData = await response.json();
            tagsData = convertTagsFormat(rawData);
            window.tagsData = tagsData; 
        } else {
            console.warn('Failed to load tags from server, using default data');
            tagsData = getDefaultTagsData();
            window.tagsData = tagsData; 
        }
    } catch (error) {
        console.error('Error loading tags:', error);
        tagsData = getDefaultTagsData();
        window.tagsData = tagsData;
    }
}

async function loadCustomTagCategories() {
    try {
        const response = await fetch('/zhihui/user_tag_categories');
        if (response.ok) {
            customTagCategories = await response.json();
        } else {
            customTagCategories = [];
        }
    } catch (error) {
        console.error('Error loading custom tag categories:', error);
        customTagCategories = [];
    }
}

async function saveCustomTagCategories(categories) {
    try {
        const response = await fetch('/zhihui/user_tag_categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categories })
        });
        if (response.ok) {
            customTagCategories = categories;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving custom tag categories:', error);
        return false;
    }
}

function convertTagsFormat(rawData) {
    const convertNode = (node, isCustomCategory = false) => {
        if (node && typeof node === 'object') {
            
            if (isCustomCategory && node.hasOwnProperty('我的标签')) {
                const customTags = node['我的标签'];
                const result = {};
                for (const [tagName, tagData] of Object.entries(customTags)) {
                    
                    result[tagName] = {
                        display: tagName,
                        value: typeof tagData === 'string' ? tagData : (tagData.content || tagName)
                    };
                    if (typeof tagData === 'object' && tagData.category) {
                        result[tagName].category = tagData.category;
                    }
                }
                return { '我的标签': Object.values(result) };
            }
            
            const values = Object.values(node);
            const allString = values.every(v => typeof v === 'string');
            if (allString) {
                if (isCustomCategory) {
                    
                    return Object.entries(node).map(([tagName, tagData]) => {
                        const tagObj = {
                            display: tagName,
                            value: typeof tagData === 'string' ? tagData : (tagData.content || tagName)
                        };
                        if (typeof tagData === 'object' && tagData.category) {
                            tagObj.category = tagData.category;
                        }
                        return tagObj;
                    });
                }
                return Object.entries(node).map(([chineseName, englishValue]) => ({ display: chineseName, value: englishValue }));
            }
            const result = {};
            for (const [k, v] of Object.entries(node)) {
                result[k] = convertNode(v, isCustomCategory);
            }
            return result;
        }
        return node;
    };
    const converted = {};
    for (const [mainCategory, subCategories] of Object.entries(rawData)) {
        const isCustom = mainCategory === '自定义';
        converted[mainCategory] = convertNode(subCategories, isCustom);
    }
    return converted;
}

function hasDeepNesting(obj) {
    for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
            return true;
        }
    }
    return false;
}

function getDefaultTagsData() {
    return {};
}

async function loadRandomSettings() {
    try {
        const response = await fetch('/zhihui/random_settings');
        if (response.ok) {
            const data = await response.json();
            if (data) {
                randomSettings = { ...randomSettings, ...data };
                log('Random settings loaded:', randomSettings);
            }
        }
    } catch (error) {
        warn('Failed to load random settings:', error);
    }
}

async function loadExtractorSettings() {
    try {
        const response = await fetch('/zhihui/extractor_settings');
        if (response.ok) {
            const data = await response.json();
            if (data) {
                extractorSettings = { ...extractorSettings, ...data };
            }
        }
    } catch (error) {}
}

async function saveExtractorSettings() {
    try {
        await fetch('/zhihui/extractor_settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: true, ...extractorSettings })
        });
    } catch (error) {}
}

async function saveRandomSettings() {
    try {
        await fetch('/zhihui/random_settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(randomSettings)
        });
        log('Random settings saved');
    } catch (error) {
        errorLog('Failed to save random settings:', error);
    }
}

function selectWeightedTags(tags, count) {
    if (!tags || tags.length === 0) return [];
    const totalWeight = tags.reduce((sum, tag) => sum + (tag.weight || 1), 0);
    const selected = [];
    const availableTags = [...tags];
    
    for (let i = 0; i < count && availableTags.length > 0; i++) {
        let random = Math.random() * totalWeight;
        let cumulative = 0;
        let selectedIndex = -1;
        
        for (let j = 0; j < availableTags.length; j++) {
            cumulative += availableTags[j].weight || 1;
            if (random <= cumulative) {
                selectedIndex = j;
                break;
            }
        }
        
        if (selectedIndex === -1) selectedIndex = availableTags.length - 1;
        
        selected.push(availableTags[selectedIndex]);
        availableTags.splice(selectedIndex, 1);
    }
    
    return selected;
}

function generateRandomCombination() {
    if (!window.tagsData) {
        alert('标签数据未加载，请稍后再试');
        return;
    }

    const generatedTags = [];
    const usedTags = new Set();

    const enabledCategories = Object.keys(randomSettings.categories).filter(
        categoryPath => randomSettings.categories[categoryPath].enabled
    );

    if (randomSettings.includeNSFW && randomSettings.adultCategories) {
        const enabledAdultCategories = Object.keys(randomSettings.adultCategories).filter(
            categoryPath => randomSettings.adultCategories[categoryPath].enabled
        );
        enabledCategories.push(...enabledAdultCategories);
    }

    if (enabledCategories.length === 0) {
        alert('请至少启用一个分类');
        return;
    }

    enabledCategories.forEach(categoryPath => {
        const setting = randomSettings.categories[categoryPath] || randomSettings.adultCategories[categoryPath];
        const shouldInclude = Math.random() < (setting.weight / 10);

        if (shouldInclude) {
            const tags = getTagsFromCategoryPath(categoryPath);
            if (tags.length > 0) {
                const randomTags = getRandomTagsFromArray(tags, setting.count);
                randomTags.forEach(tag => {
                    const tagKey = tag.value || tag.display;
                    if (!usedTags.has(tagKey)) {
                        usedTags.add(tagKey);
                        generatedTags.push(tag);
                    }
                });
            }
        }
    });

    if (randomSettings.limitTotalTags !== false) {
        const targetCount = Math.floor(
            Math.random() * (randomSettings.totalTagsRange.max - randomSettings.totalTagsRange.min + 1)
        ) + randomSettings.totalTagsRange.min;

        if (generatedTags.length < targetCount) {
            const allAvailableTags = getAllAvailableTags();
            const remainingTags = allAvailableTags.filter(tag => {
                const tagKey = tag.value || tag.display;
                return !usedTags.has(tagKey);
            });
            
            const additionalCount = Math.min(targetCount - generatedTags.length, remainingTags.length);
            const additionalTags = getRandomTagsFromArray(remainingTags, additionalCount);
            
            additionalTags.forEach(tag => {
                const tagKey = tag.value || tag.display;
                usedTags.add(tagKey);
                generatedTags.push(tag);
            });
        }
    }

    if (generatedTags.length > 0) {
        if (window.selectedTags) {
            window.selectedTags.clear();
        }
        
        generatedTags.forEach(tag => {
            const tagValue = tag.value || tag.display;
            if (window.selectedTags) {
                window.selectedTags.set(tagValue, 1.0);
            }
        });
        
        if (window.updateSelectedTags) {
            window.updateSelectedTags();
        }
        if (window.updateSelectedTagsOverview) {
            window.updateSelectedTagsOverview();
        }
        if (window.updateCategoryRedDots) {
            window.updateCategoryRedDots();
        }
    }
}

function getTagsFromCategoryPath(categoryPath) {
    if (!window.tagsData) return [];
    
    if (tagsCache.has(categoryPath)) {
        return tagsCache.get(categoryPath);
    }
    
    const pathParts = categoryPath.split('.');
    let current = window.tagsData;
    
    for (const part of pathParts) {
        if (current && current[part]) {
            current = current[part];
        } else {
            return [];
        }
    }
    
    const tags = extractAllTagsFromObject(current);
    tagsCache.set(categoryPath, tags);
    return tags;
}

const clearTagsCache = () => tagsCache.clear();

function extractAllTagsFromObject(obj) {
    const tags = [];
    
    function extract(current, parentPath = '') {
        if (typeof current === 'object' && current !== null) {
            if (Array.isArray(current)) {
                current.forEach(tag => {
                    if (typeof tag === 'object' && tag.display && tag.value) {
                        tags.push(tag);
                    } else if (typeof tag === 'string') {
                        tags.push({ display: tag, value: tag });
                    }
                });
            } else {
                Object.entries(current).forEach(([key, value]) => {
                    const currentPath = parentPath ? `${parentPath}.${key}` : key;
                    
                    if (typeof value === 'string') {
                        tags.push({
                            display: key,
                            value: value,
                            category: parentPath || '未分类'
                        });
                    } else if (typeof value === 'object') {
                        extract(value, currentPath);
                    }
                });
            }
        }
    }
    
    extract(obj);
    return tags;
}

function getAllAvailableTags() {
    if (!window.tagsData) return [];
    
    const allTags = [];
    const excludedCategories = randomSettings.excludedCategories;
    
    function extractFromCategory(obj, categoryPath = '') {
        Object.entries(obj).forEach(([key, value]) => {
            const currentPath = categoryPath ? `${categoryPath}.${key}` : key;
            
            let isExcluded = excludedCategories.some(excluded => 
                currentPath.includes(excluded) || key.includes(excluded)
            );
            
            if (!randomSettings.includeNSFW && (currentPath.includes('NSFW') || key.includes('NSFW'))) {
                isExcluded = true;
            }
            
            if (!isExcluded) {
                if (typeof value === 'string') {
                    allTags.push({
                        display: key,
                        value: value,
                        category: categoryPath || '未分类'
                    });
                } else if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(tag => {
                            if (typeof tag === 'object' && tag.display && tag.value) {
                                allTags.push(tag);
                            }
                        });
                    } else {
                        extractFromCategory(value, currentPath);
                    }
                }
            }
        });
    }
    
    extractFromCategory(window.tagsData);
    return allTags;
}

function getRandomTagsFromArray(tags, count) {
    if (tags.length === 0 || count <= 0) return [];
    
    const shuffled = [...tags];
    const n = shuffled.length;
    const resultCount = Math.min(count, n);
    
    for (let i = n - 1; i > n - 1 - resultCount; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(n - resultCount);
}

function findTagsByCategory(categoryName) {
    const results = [];
    
    if (!tagsData) return results;
    
    const searchInObject = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (key === categoryName || currentPath === categoryName) {
                if (Array.isArray(value)) {
                    results.push(...value);
                }
            }
            
            if (typeof value === 'object' && value !== null) {
                searchInObject(value, currentPath);
            }
        }
    };
    
    searchInObject(tagsData);
    return results;
}

function createTagSelectorDialog() {
    (function injectDialogAnimationStyle(){
        const styleId = 'zs-dialog-animation-style';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                @keyframes zsDialogFadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes zsDialogSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes zsDialogFadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
                @keyframes zsDialogSlideOut {
                    from {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                }
                .zs-overlay-enter {
                    animation: zsDialogFadeIn 0.25s ease-out forwards;
                }
                .zs-overlay-exit {
                    animation: zsDialogFadeOut 0.2s ease-in forwards;
                }
                .zs-dialog-enter {
                    animation: zsDialogSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .zs-dialog-exit {
                    animation: zsDialogSlideOut 0.2s ease-in forwards;
                }
            `;
            document.head.appendChild(styleEl);
        }
    })();

    const overlay = DOM.div(`position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: none; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);`);

    const dialog = document.createElement('div');
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const dialogHeight = Math.min(screenHeight * 0.95, 1000);
    const dialogWidth = dialogHeight * (16 / 9);
    const finalWidth = Math.min(dialogWidth, screenWidth * 0.95);
    const finalHeight = finalWidth * (9 / 16);
    const left = (screenWidth - finalWidth) / 2;
    const top = (screenHeight - finalHeight) / 2;

    dialog.style.cssText = `position: fixed; top: ${top}px; left: ${left}px; width: ${finalWidth}px; height: ${finalHeight}px; min-width: 800px; min-height: 600px; background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%); border: 2px solid rgb(19, 101, 201); border-radius: 16px; box-shadow: none; z-index: 10001; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: hidden; backdrop-filter: blur(20px);`;

    const header = DOM.div(`background:rgb(34, 77, 141); padding: 6px 4px; display: flex; align-items: center; justify-content: space-between; border-radius: 16px 16px 0 0; user-select: none; gap: 16px;`);

    const title = DOM.el('span', `color: #f1f5f9; font-size: 18px; font-weight: 600; letter-spacing: -0.025em; display: flex; align-items: center; gap: 8px; margin-left: 15px;`);
    title.innerHTML = $t('tagSelectorTitle');

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';

    applyStyles(closeBtn, {
        ...commonStyles.button.base,
        ...commonStyles.button.danger,
        padding: '0',
        width: '22px',
        height: '22px',
        fontSize: '18px',
        fontWeight: '700',
        lineHeight: '22px',
        verticalAlign: 'middle',
        position: 'relative',
        top: '0',
        margin: '4px 8px 4px 0'
    });
    
    const closeBtnNormalStyle = {
        ...commonStyles.button.danger
    };
    
    const closeBtnHoverStyle = {
        ...commonStyles.button.dangerHover
    };
    
    setupButtonHoverEffect(closeBtn, closeBtnNormalStyle, closeBtnHoverStyle);
    
    const closeDialog = () => {
        overlay.classList.remove('zs-overlay-enter');
        dialog.classList.remove('zs-dialog-enter');
        overlay.classList.add('zs-overlay-exit');
        dialog.classList.add('zs-dialog-exit');
        
        const handleAnimationEnd = () => {
            overlay.style.display = 'none';
            overlay.classList.remove('zs-overlay-exit');
            dialog.classList.remove('zs-dialog-exit');
            overlay.removeEventListener('animationend', handleAnimationEnd);
            dialog.removeEventListener('animationend', handleAnimationEnd);
        };
        
        overlay.addEventListener('animationend', handleAnimationEnd);
        dialog.addEventListener('animationend', handleAnimationEnd);

        if (tagSelectorDialog && tagSelectorDialog.keydownHandler) {
            document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        }

        if (tagSelectorDialog && tagSelectorDialog.tagContent && tagSelectorDialog.tagContent._delegatedEvents) {
            const events = tagSelectorDialog.tagContent._delegatedEvents;
            tagSelectorDialog.tagContent.removeEventListener('mouseover', events.mouseover);
            tagSelectorDialog.tagContent.removeEventListener('mouseout', events.mouseout);
            tagSelectorDialog.tagContent.removeEventListener('click', events.click);
            tagSelectorDialog.tagContent._delegatedEvents = null;
        }

        if (currentTooltip && currentTooltip.parentNode) {
            currentTooltip.parentNode.removeChild(currentTooltip);
            currentTooltip = null;
        }

        if (previewPopup && previewPopup.style.display === 'block') {
            previewPopup.style.display = 'none';

            enableMainUIInteraction();
        }

        const settingsPanel = document.getElementById('settings-dropdown-panel');
        if (settingsPanel) {
            settingsPanel.remove();
        }
    };
    
    closeBtn.onclick = closeDialog;

    const searchBoxContainer = DOM.div(`display: flex; align-items: center; justify-content: center; flex: 1;`);

    const closeButtonContainer = DOM.div(`display: flex; align-items: center;`);

    const searchContainer = DOM.div(`display: flex; align-items: center; gap: 5px; background: rgba(15,23,42,0.3); border: none; padding: 1px 12px; border-radius: 9999px; box-shadow: none; width: 220px; min-width: 220px; max-width: 220px; transition: all 0.3s ease;`);
    
    const iconWrapper = DOM.div(`width: 20px; height: 22px; display: flex; align-items: center; justify-content: center; pointer-events: none;`);
    iconWrapper.innerHTML = `
        <svg width="20" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="searchGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#60A5FA"/>
                    <stop offset="1" stop-color="#06B6D4"/>
                </linearGradient>
            </defs>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20 15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="url(#searchGrad)"/>
        </svg>
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.setAttribute('data-role', 'tag-search');
    searchInput.placeholder = $t('searchPlaceholder');
    searchInput.style.cssText = `flex: 1; background: transparent; border: none; outline: none; color:rgb(255, 255, 255); font-size: 13px; width: 100%; min-width: 65px; font-weight: 500; height: 22px;`;

    (function injectTagSearchPlaceholderStyle(){
        const styleId = 'zs-tag-search-placeholder-style';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                [data-role="tag-search"]::placeholder {
                    color: #94a3b8 !important;
                    opacity: 1;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                    transition: all 0.2s ease;
                }
                [data-role="tag-search"].hide-placeholder::placeholder {
                    opacity: 0;
                }
            `;
            document.head.appendChild(styleEl);
        }
    })();
    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.textContent = $t('clearSearch');
    clearSearchBtn.title = $t('clearSearchTitle');

    applyStyles(clearSearchBtn, {
        ...commonStyles.button.base,
        ...commonStyles.button.danger,
        background: 'rgba(239,68,68,0.15)',
        borderColor: 'rgba(239,68,68,0.35)',
        color: '#fecaca',
        width: 'auto',
        height: '20px',
        borderRadius: '4px',
        padding: '0 8px',
        display: 'none',
        lineHeight: '1',
        fontWeight: '500',
        fontSize: '11px',
        whiteSpace: 'nowrap'
    });

    const clearSearchBtnNormalStyle = {
        background: 'rgba(239,68,68,0.15)',
        borderColor: 'rgba(239,68,68,0.35)',
        color: '#fecaca',
        transform: 'translateY(0)'
    };
    
    const clearSearchBtnHoverStyle = {
        background: 'rgba(239,68,68,0.25)',
        borderColor: 'rgba(239,68,68,0.5)',
        color: '#ffb4b4',
        transform: 'translateY(-1px)'
    };
    
    setupButtonHoverEffect(clearSearchBtn, clearSearchBtnNormalStyle, clearSearchBtnHoverStyle);

    searchContainer.addEventListener('click', () => searchInput.focus());
    const baseBoxShadow = 'none';
    const baseBorder = '1px solid rgba(59,130,246,0.4)';
    searchInput.addEventListener('focus', () => {
        searchContainer.style.border = '1px solid #38bdf8';
        searchContainer.style.boxShadow = '0 0 0 2px rgba(56,189,248,0.2), inset 0 1px 2px rgba(0,0,0,0.2)';
        searchContainer.style.background = 'rgba(15,23,42,0.4)';
        searchInput.classList.add('hide-placeholder');
    });
    searchInput.addEventListener('blur', () => {
        searchContainer.style.border = baseBorder;
        searchContainer.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 2px rgba(59,130,246,0.1)';
        searchContainer.style.background = 'rgba(15,23,42,0.3)';
        searchInput.classList.remove('hide-placeholder');
    });

    [searchContainer, searchInput, clearSearchBtn].forEach(el => {
        el.addEventListener('mousedown', e => e.stopPropagation());
        el.addEventListener('click', e => e.stopPropagation());
    });
    clearSearchBtn.onclick = (e) => {
        e.stopPropagation();
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        handleSearch('');
        searchInput.focus();
    };
    searchInput.addEventListener('input', debounce(() => {
        const q = searchInput.value.trim();
        clearSearchBtn.style.display = q ? 'inline-flex' : 'none';
        handleSearch(q);
    }, 200));
    searchContainer.appendChild(iconWrapper);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearSearchBtn);

    searchBoxContainer.appendChild(searchContainer);
    closeButtonContainer.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(searchBoxContainer);
    header.appendChild(closeButtonContainer);


    const selectedOverview = DOM.div(`background:linear-gradient(135deg,#475569 0%,#334155 100%); display: flex; flex-direction: column; justify-content: center; transition: all 0.3s ease; min-height: 60px;`);

    const overviewTitle = DOM.div(`padding: 8px 16px; font-weight: 600; color: #e2e8f0; display: flex; justify-content: flex-start; align-items: center; gap: 12px;`);

    const overviewTitleText = DOM.el('span', `text-align: left; line-height: 1.2; margin-left: 5px;`);
    overviewTitleText.innerHTML = $t('selectedTags');


    const hintText = document.createElement('span');
    hintText.style.cssText = `color:rgb(0, 225, 255); font-size: 14px; font-weight: 400; font-style: normal;`;
    hintText.textContent = $t('noTagsSelected');

    const selectedCount = document.createElement('span');
    selectedCount.style.cssText = `background: #4a9eff; color: #fff; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 4px rgba(74,158,255,0.3); display: none;`;
    selectedCount.textContent = '0';

    overviewTitle.appendChild(overviewTitleText);
    overviewTitle.appendChild(hintText);
    overviewTitle.appendChild(selectedCount);

    const selectedTagsList = DOM.div(`display: flex; flex-wrap: wrap; gap: 6px; padding: 0 20px 16px 20px; overflow-y: auto; max-height: 340px; display: none; scrollbar-width: thin; scrollbar-color: rgba(96,165,250,0.25) transparent;`);
    
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.textContent = `
        *::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        *::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb {
            background: rgba(96,165,250,0.25);
            border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
            background: rgba(96,165,250,0.45);
        }
    `;
    document.head.appendChild(scrollbarStyle);

    selectedOverview.appendChild(overviewTitle);
    selectedOverview.appendChild(selectedTagsList);


    const content = DOM.div(`flex: 1; display: flex; overflow: hidden;`);

    const categoryList = DOM.div(`width: 120px; min-width: 120px; max-width: 120px; background: linear-gradient(135deg, #2d3748 0%, #1e293b 100%); overflow-y: auto; backdrop-filter: blur(10px); margin-right: 2px;`);

    const rightPanel = DOM.div(`flex: 1; display: flex; flex-direction: column;`);

    const subCategoryTabs = DOM.div(`background:linear-gradient(135deg,#334155 0%,#1e293b 100%); display: flex; flex-wrap: wrap; overflow: visible; min-height: 45px; backdrop-filter: blur(10px); border: none;`);

    const subSubCategoryTabs = DOM.div(`background:linear-gradient(135deg,#475569 0%,#334155 100%); display: none; flex-wrap: wrap; overflow: visible; min-height: 40px; backdrop-filter: blur(10px); margin-top: 2px; border: none;`);

    const subSubSubCategoryTabs = DOM.div(`background: linear-gradient(135deg, #64748b 0%, #475569 100%); display: none; flex-wrap: wrap; overflow: visible; min-height: 35px; backdrop-filter: blur(10px); margin-top: 2px; border: none;`);

    const tagContent = DOM.div(`flex: 1; padding: 10px 10px; overflow-y: auto; background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%); backdrop-filter: blur(10px);`);

    const footer = DOM.div(`background:linear-gradient(135deg,#334155 0%,#1e293b 100%); padding: 0 16px; display: flex; justify-content: flex-start; align-items: center; backdrop-filter: blur(10px); border-radius: 0 0 16px 16px; column-gap: 8px; min-height: 60px; height: 60px; flex-shrink: 0; position: relative;`);

    const customTagsSection = document.createElement('div');
    customTagsSection.className = 'custom-tags-section';
    customTagsSection.style.cssText = `border: none; padding: 0; background: none; display: none; flex-direction: column; min-width: 280px; width: auto; flex-shrink: 1; flex: none; justify-content: center; align-items: center; height: 100%;`;

    const singleLineContainer = DOM.div(`display: flex; gap: 3px; align-items: center; background: rgba(37,99,235,0.3); border-radius: 8px; box-shadow: 0 4px 15px rgba(37,99,235,0.2), 0 2px 6px rgba(0,0,0,0.15); padding: 4px 8px; position: relative; overflow: hidden; border: 1px solid rgba(59,130,246,0.3); backdrop-filter: blur(8px);`);

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .tag-input::placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
        }
        .tag-input:-ms-input-placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
        }
        .tag-input::-ms-input-placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
        }
        .tag-input.hide-placeholder::placeholder {
            opacity: 0 !important;
        }
        .tag-input.hide-placeholder:-ms-input-placeholder {
            opacity: 0 !important;
        }
        .tag-input.hide-placeholder::-ms-input-placeholder {
            opacity: 0 !important;
        }
    `;

    document.head.appendChild(styleElement);
    const customTagsTitle = DOM.div(`color: #38bdf8; font-size: 15px; font-weight: 700; text-align: left; letter-spacing: 0.3px; white-space: normal; word-break: break-word; overflow-wrap: anywhere; flex-shrink: 0; padding-right: 2px; margin-right: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);`);

    customTagsTitle.textContent = $t('customTagsTitle');
    const verticalSeparator = DOM.div(`width: 1px; height: 25px; background: linear-gradient(to bottom, transparent, rgb(62, 178, 255), transparent); margin: 0 8px; flex-shrink: 0;`);

    const inputForm = DOM.div(`display: flex; align-items: center; flex-wrap: nowrap; flex: 1; justify-content: flex-start; gap: 30px;`);

    const nameInputContainer = DOM.div(`display: flex; align-items: center; gap: 2px; flex: none; min-width: auto; margin: 0; padding: 0;`);

    const nameLabel = document.createElement('label');
    nameLabel.style.cssText = `color: #ffffff; font-size: 14px; font-weight: 600; white-space: nowrap; min-width: 0; width: fit-content; margin: 0; padding: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.4);`;
    nameLabel.textContent = $t('tagName');
    const nameInput = document.createElement('input');
    nameInput.className = 'tag-input';
    nameInput.type = 'text';
    nameInput.placeholder = $t('tagNamePlaceholder');
    nameInput.maxLength = 18;
    nameInput.style.cssText = `background: rgba(15,23,42,0.3); border: 1px solid rgba(59,130,246,0.4); border-radius: 6px; padding: 6px 8px; color: white; font-size: 13px; caret-color: white; outline: none; transition: all 0.3s ease; width: 120px; min-width: 120px; height: 24px; function countChineseAndEnglish(text) { let chineseCount = 0; let englishCount = 0; for (let char of text) { if (/[\u4e00-\u9fa5]/.test(char)) { chineseCount++; } else if (/[a-zA-Z]/.test(char)) { englishCount++; } } return { chinese: chineseCount, english: englishCount }; } function validateCharacterLength(text) { const counts = countChineseAndEnglish(text); if (counts.chinese > 0 && counts.english === 0) { return counts.chinese <= 9; } if (counts.english > 0 && counts.chinese === 0) { return counts.english <= 18; } const mixedCount = counts.chinese + (counts.english * 0.5); return mixedCount <= 9; } nameInput.addEventListener('input', () => { const value = nameInput.value; if (!validateCharacterLength(value)) { let truncatedValue = value; while (truncatedValue.length > 0 && !validateCharacterLength(truncatedValue)) { truncatedValue = truncatedValue.substring(0, truncatedValue.length - 1); } nameInput.value = truncatedValue; } }); margin: 0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 2px rgba(59,130,246,0.1);`;
    nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = '#38bdf8';
        nameInput.style.boxShadow = '0 0 0 2px rgba(56,189,248,0.2), inset 0 1px 2px rgba(0,0,0,0.2)';
        nameInput.style.background = 'rgba(15,23,42,0.4)';
        nameInput.classList.add('hide-placeholder');
    });
    nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = 'rgba(59,130,246,0.4)';
        nameInput.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 2px rgba(59,130,246,0.1)';
        nameInput.style.background = 'rgba(15,23,42,0.3)';
        nameInput.classList.remove('hide-placeholder');
    });
    nameInputContainer.appendChild(nameLabel);
    nameInputContainer.appendChild(nameInput);

    const contentInputContainer = DOM.div(`display: flex; align-items: center; gap: 2px; flex: none; min-width: auto; margin: 0; padding: 0;`);

    const contentLabel = document.createElement('label');
    contentLabel.style.cssText = `color: #ffffff; font-size: 14px; font-weight: 600; white-space: nowrap; min-width: 0; width: fit-content; margin: 0; padding: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.4);`;
    contentLabel.textContent = $t('tagContent');
    const contentInput = document.createElement('input');
    contentInput.className = 'tag-input';
    contentInput.type = 'text';
    contentInput.placeholder = $t('tagContentPlaceholder');
    contentInput.readOnly = true;
    contentInput.style.cssText = `background: rgba(15,23,42,0.3); border: 1px solid rgba(59,130,246,0.4); border-radius: 6px; padding: 6px 8px; color: white; font-size: 13px; caret-color: transparent; outline: none; transition: all 0.3s ease; width: 140px; min-width: 140px; height: 24px; margin: 0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 2px rgba(59,130,246,0.1); cursor: pointer;`;

    let previewPopup = null;
    let previewTextarea = null;

    function createPreviewPopup() {
        if (previewPopup) return;

        previewPopup = document.createElement('div');
        previewPopup.style.cssText = `position: fixed; background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 20px 20px 4px 20px; z-index: 10002; display: none; box-shadow: 0 20px 40px rgba(0,0,0,0.6); backdrop-filter: blur(20px);`;

        const titleBar = document.createElement('div');
        titleBar.style.cssText = `display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;`;

        const title = document.createElement('span');
        title.textContent = $t('enterTagContent');
        title.style.cssText = `color: #f1f5f9; font-size: 16px; font-weight: 600;`;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border: 1px solid #dc2626; color: #ffffff; font-size: 16px; font-weight: 700; cursor: pointer; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s ease;`;

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            closeButton.style.boxShadow = '0 2px 8px rgba(239,68,68,0.4)';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            closeButton.style.boxShadow = 'none';
        });

        closeButton.onclick = () => {
            previewPopup.style.display = 'none';

            enableMainUIInteraction();
        };

        titleBar.appendChild(title);
        titleBar.appendChild(closeButton);

        previewTextarea = document.createElement('textarea');
        previewTextarea.style.cssText = `width: 100%; height: 350px; background: rgba(15,23,42,0.4); border: 1px solid rgba(59,130,246,0.4); border-radius: 8px; padding: 12px; color: white; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; resize: none; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);`;

        previewTextarea.addEventListener('input', () => {
            contentInput.value = previewTextarea.value;
        });

        const charCount = document.createElement('div');
        charCount.style.cssText = `text-align: right; color: #94a3b8; font-size: 12px; margin-top: 8px; margin-bottom: 0px;`;

        previewTextarea.addEventListener('input', () => {
            const length = previewTextarea.value.length;
            charCount.textContent = `字符数: ${length}`;
            if (length > 100) {
                charCount.style.color = '#fbbf24';
            } else if (length > 200) {
                charCount.style.color = '#ef4444';
            } else {
                charCount.style.color = '#94a3b8';
            }
        });

        previewPopup.appendChild(titleBar);
        previewPopup.appendChild(previewTextarea);
        previewPopup.appendChild(charCount);
        document.body.appendChild(previewPopup);
    }

    function showPreviewPopup() {
        createPreviewPopup();

        previewTextarea.value = contentInput.value;

        const length = previewTextarea.value.length;
        const charCount = previewPopup.querySelector('div:last-child');
        charCount.textContent = `字符数: ${length}`;

        const inputRect = contentInput.getBoundingClientRect();
        const dialogRect = tagSelectorDialog.getBoundingClientRect();
        const categoryList = document.querySelector('.category-list');
        const categoryListWidth = categoryList ? categoryList.getBoundingClientRect().width : 140;
        const contentAreaLeft = dialogRect.left + categoryListWidth + 20;
        const contentAreaTop = dialogRect.top + 120;
        const contentAreaWidth = dialogRect.width - categoryListWidth - 40;
        const contentAreaHeight = dialogRect.height - 200;
        const popupWidth = Math.min(contentAreaWidth * 0.8, 600);
        const popupHeight = Math.min(contentAreaHeight * 0.75, 450);
        const left = contentAreaLeft + (contentAreaWidth - popupWidth) / 2;
        const top = contentAreaTop + (contentAreaHeight - popupHeight) / 2;

        previewPopup.style.left = left + 'px';
        previewPopup.style.top = top + 'px';
        previewPopup.style.width = popupWidth + 'px';
        previewPopup.style.height = popupHeight + 'px';
        previewPopup.style.display = 'block';

        disableMainUIInteraction();
        
        setTimeout(() => {
            previewTextarea.focus();
            previewTextarea.setSelectionRange(previewTextarea.value.length, previewTextarea.value.length);
        }, 100);
    }

    function checkContentLength() {
        if (previewPopup && previewPopup.style.display === 'block') {
            return;
        }
        
        const content = contentInput.value;
        const inputWidth = contentInput.offsetWidth;
        const textWidth = getTextWidth(content, contentInput);

        if (textWidth > inputWidth * 0.9 || content.length > 15) {
            showPreviewPopup();
        }
    }

    function getTextWidth(text, element) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const computedStyle = window.getComputedStyle(element);
        context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        return context.measureText(text).width;
    }

    contentInput.addEventListener('click', () => {
        showPreviewPopup();
    });

    contentInput.addEventListener('focus', () => {
        contentInput.style.borderColor = '#38bdf8';
        contentInput.style.boxShadow = '0 0 0 2px rgba(56,189,248,0.2), inset 0 1px 2px rgba(0,0,0,0.2)';
        contentInput.style.background = 'rgba(15,23,42,0.4)';
        contentInput.classList.add('hide-placeholder');
    });

    contentInput.addEventListener('blur', () => {
        contentInput.style.borderColor = 'rgba(59,130,246,0.4)';
        contentInput.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 2px rgba(59,130,246,0.1)';
        contentInput.style.background = 'rgba(15,23,42,0.3)';
        contentInput.classList.remove('hide-placeholder');
    });

    contentInput.addEventListener('dblclick', () => {
        showPreviewPopup();
    });

    contentInputContainer.appendChild(contentLabel);
    contentInputContainer.appendChild(contentInput);

    const previewContainer = DOM.div(`display: flex; align-items: center; gap: 8px; margin: 0; flex: none; min-width: auto;`);

    const previewLabel = document.createElement('label');
    previewLabel.textContent = $t('previewImage');
    previewLabel.style.cssText = `color: #ffffff; font-size: 14px; font-weight: 600; white-space: nowrap; margin: 0; padding: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.4); min-width: 50px;`;

    const previewInput = document.createElement('input');
    previewInput.type = 'file';
    previewInput.accept = 'image/*';
    previewInput.style.cssText = `display: none;`;

    const fileNameDisplay = document.createElement('span');
    fileNameDisplay.textContent = $t('noImageLoaded');
    fileNameDisplay.style.cssText = `background: rgba(15,23,42,0.3); border: 1px solid rgba(59,130,246,0.4); border-radius: 6px; padding: 6px 8px; color: #94a3b8; font-size: 12px; width: 123px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; display: inline-block; vertical-align: middle; height: 24px; line-height: 12px; cursor: pointer; position: relative; left: -15px;`;

    const thumbnailWindow = DOM.div(`width: 35px; height: 35px; background: rgba(15,23,42,0.5); border: 1px solid rgba(59,130,246,0.4); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-left: -18px; flex-shrink: 0;`);

    const thumbnailImg = document.createElement('img');
    thumbnailImg.style.cssText = `max-width: 100%; max-height: 100%; object-fit: cover; border-radius: 4px; display: none;`;

    const thumbnailPlaceholder = DOM.div(`width: 100%; height: 100%; background: #6b7280; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 16px; font-weight: bold;`);
    thumbnailPlaceholder.innerHTML = '✕';

    thumbnailWindow.appendChild(thumbnailImg);
    thumbnailWindow.appendChild(thumbnailPlaceholder);

   const actionButton = DOM.btn(`background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%); border: 1px solid rgba(59,130,246,0.7); color: #ffffff; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease; height: 26px; margin-left: 0px; white-space: nowrap; text-shadow: 0 1px 1px rgba(0,0,0,0.3);`, $t('load'));
    function updateActionButton() {
        if (currentPreviewImage) {            actionButton.textContent = $t('clear');
            actionButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            actionButton.style.borderColor = 'rgba(220,38,38,0.8)';
        } else {            actionButton.textContent = $t('load');
            actionButton.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)';
            actionButton.style.borderColor = 'rgba(59,130,246,0.7)';
        }
    }

    actionButton.addEventListener('mouseenter', () => {
        if (currentPreviewImage) {            actionButton.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
            actionButton.style.boxShadow = '0 2px 8px rgba(239,68,68,0.4)';
            actionButton.style.borderColor = 'rgba(248,113,113,0.8)';
        } else {
            actionButton.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)';
            actionButton.style.boxShadow = '0 2px 4px rgba(59,130,246,0.2), 0 1px 2px rgba(0,0,0,0.1)';
            actionButton.style.borderColor = 'rgba(59,130,246,0.5)';
        }
    });

    actionButton.addEventListener('mouseleave', () => {
        if (currentPreviewImage) {
            actionButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            actionButton.style.borderColor = 'rgba(220,38,38,0.8)';
            actionButton.style.boxShadow = 'none';
        } else {
            actionButton.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)';
            actionButton.style.borderColor = 'rgba(59,130,246,0.7)';
            actionButton.style.boxShadow = 'none';
        }
    });

    actionButton.addEventListener('click', () => {
        if (currentPreviewImage) {
            currentPreviewImage = null;
            currentPreviewImageName = null;   
            previewInput.value = '';         
            fileNameDisplay.textContent = $t('noImageLoaded');
            fileNameDisplay.style.color = '#94a3b8';         
            thumbnailImg.style.display = 'none';
            thumbnailPlaceholder.style.display = 'flex';
            updateActionButton();
        } else {
            previewInput.click();
        }
    });

    previewInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentPreviewImage = event.target.result;
                currentPreviewImageName = file.name;
                fileNameDisplay.textContent = file.name;
                fileNameDisplay.style.color = '#e2e8f0';
                thumbnailImg.src = currentPreviewImage;
                thumbnailImg.style.display = 'block';
                thumbnailPlaceholder.style.display = 'none';
                updateActionButton();
            };
            reader.readAsDataURL(file);
        }
    });

    const previewSeparator = DOM.div(`width: 1px; height: 25px; background: linear-gradient(to bottom, transparent, rgb(62, 178, 255), transparent); margin: 0 6px; flex-shrink: 0;`);

    previewContainer.appendChild(previewLabel);
    previewContainer.appendChild(fileNameDisplay);
    previewContainer.appendChild(thumbnailWindow);
    previewContainer.appendChild(actionButton);
    previewContainer.appendChild(previewSeparator);
    previewContainer.appendChild(previewInput);

    const addButton = DOM.btn(`background: linear-gradient(135deg, #059669 0%, #047857 100%); border: 1px solid rgba(16,185,129,0.7); color: #ffffff; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease; height: 26px; width: 70px; min-width: 70px; white-space: nowrap; text-shadow: 0 1px 1px rgba(0,0,0,0.3); text-align: center; margin-left: -28px; flex-shrink: 0;`, $t('saveTag'));
    addButton.addEventListener('mouseenter', () => {
        addButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        addButton.style.boxShadow = '0 2px 4px rgba(16,185,129,0.2), 0 1px 2px rgba(0,0,0,0.1)';
        addButton.style.borderColor = 'rgba(16,185,129,0.5)';
        addButton.style.transform = 'none';
    });
    addButton.addEventListener('mouseleave', () => {
        addButton.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        addButton.style.borderColor = 'rgba(16,185,129,0.7)';
        addButton.style.transform = 'none';
    });

    addButton.onclick = async () => {
        const name = nameInput.value.trim();
        const content = contentInput.value.trim();

        if (!name || !content) {
            showToast($t('pleaseFillComplete'), 'warning');
            return;
        }

        try {
            const requestData = { name, content };
            
            if (currentPreviewImage) {
                requestData.preview_image = currentPreviewImage;
            }

            const response = await fetch('/zhihui/user_tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                nameInput.value = '';
                contentInput.value = '';

                currentPreviewImage = null;
                currentPreviewImageName = null;
                previewInput.value = '';
                
                if (thumbnailImg) {
                    thumbnailImg.style.display = 'none';
                }
                if (thumbnailPlaceholder) {
                    thumbnailPlaceholder.style.display = 'flex';
                }
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = $t('noImageLoaded');
                    fileNameDisplay.style.color = '#94a3b8';
                }
                
                updateActionButton();
                
                await loadTagsData();
                
                const activeCategory = tagSelectorDialog.activeCategory;
                
                initializeCategoryList();
                
                if (activeCategory === '自定义') {

                    const categoryItems = tagSelectorDialog.categoryList.querySelectorAll('div');
                    for (let item of categoryItems) {
                        if (item.textContent === '自定义') {
                            item.click();
                            break;
                        }
                    }
                }

                showToast($t('tagAddedSuccess'), 'success');
            } else {
                showToast(result.error || $t('addFailed'), 'error');
            }
        } catch (error) {
            console.error('Error adding custom tag:', error);
            showToast($t('addFailed'), 'error');
        }
    };

    inputForm.appendChild(nameInputContainer);
    inputForm.appendChild(contentInputContainer);
    inputForm.appendChild(previewContainer);
    inputForm.appendChild(addButton);
    singleLineContainer.appendChild(customTagsTitle);
    singleLineContainer.appendChild(verticalSeparator);
    singleLineContainer.appendChild(inputForm);
    customTagsSection.appendChild(singleLineContainer);

    const rightButtonsSection = DOM.div(`display: flex; align-items: center; gap: 12px; margin-left: 20px; margin-right: 8px; flex-shrink: 0;`);

    const clearButtonContainer = DOM.div(`display: flex; align-items: center; position: absolute; left: 50%; /* 水平居中 */ top: 50%; transform: translate(-50%, -50%); /* 水平垂直居中 */ margin-left: 0; z-index: 10; gap: 12px;`);

    const quickRandomBtn = document.createElement('button');
    quickRandomBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('quickRandom')}</span>`;
    quickRandomBtn.style.cssText = `background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border: 1px solid rgba(139,92,246,0.7); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 90px; white-space: nowrap; font-size: 14px;`;
    quickRandomBtn.addEventListener('mouseenter', () => {
        quickRandomBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
        quickRandomBtn.style.boxShadow = '0 4px 8px rgba(139,92,246,0.4)';
        quickRandomBtn.style.transform = 'none';
    });
    quickRandomBtn.addEventListener('mouseleave', () => {
        quickRandomBtn.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
        quickRandomBtn.style.boxShadow = 'none';
        quickRandomBtn.style.transform = 'none';
    });
    quickRandomBtn.onclick = () => {
        if (window.generateRandomCombination) {
            window.generateRandomCombination();
        }
    };

    const restoreBtn = document.createElement('button');
    restoreBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('restoreSelection')}</span>`;
    restoreBtn.style.cssText = `background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border: 1px solid rgba(14,165,233,0.7); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 90px; white-space: nowrap; font-size: 14px;`;
    restoreBtn.addEventListener('mouseenter', () => {
        restoreBtn.style.background = 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)';
        restoreBtn.style.boxShadow = '0 4px 8px rgba(14,165,233,0.4)';
        restoreBtn.style.transform = 'none';
    });
    restoreBtn.addEventListener('mouseleave', () => {
        restoreBtn.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
        restoreBtn.style.boxShadow = 'none';
        restoreBtn.style.transform = 'none';
    });
    restoreBtn.onclick = () => {
        restoreSelectedTags();
    };

    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('clearSelection')}</span>`;
    clearBtn.style.cssText = `background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border: 1px solid rgba(220,38,38,0.8); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 70px; white-space: nowrap; font-size: 14px;`;
    clearBtn.addEventListener('mouseenter', () => {
        clearBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
        clearBtn.style.color = '#ffffff';
        clearBtn.style.borderColor = 'rgba(248,113,113,0.8)';
        clearBtn.style.transform = 'none';
    });
    clearBtn.addEventListener('mouseleave', () => {
        clearBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        clearBtn.style.color = '#ffffff';
        clearBtn.style.borderColor = 'rgba(220,38,38,0.8)';
        clearBtn.style.transform = 'none';
    });
    clearBtn.onclick = () => {
        if (tagSelectorDialog.activeCategory === '随机标签') {
            if (!window.selectedTags || window.selectedTags.size === 0) {
                return;
            }
        }
        clearSelectedTags();
    };

    const characterFetchBtn = document.createElement('button');
    characterFetchBtn.id = 'character-fetch-btn';
    characterFetchBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('characterFetchBtn')}</span>`;
    characterFetchBtn.style.cssText = `background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border: 1px solid rgba(139,92,246,0.7); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 90px; white-space: nowrap; font-size: 14px; display: none;`;
    characterFetchBtn.addEventListener('mouseenter', () => {
        characterFetchBtn.style.background = 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)';
        characterFetchBtn.style.boxShadow = '0 4px 8px rgba(139,92,246,0.4)';
        characterFetchBtn.style.transform = 'none';
    });
    characterFetchBtn.addEventListener('mouseleave', () => {
        characterFetchBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
        characterFetchBtn.style.boxShadow = 'none';
        characterFetchBtn.style.transform = 'none';
    });

    const characterAddBtn = document.createElement('button');
    characterAddBtn.id = 'character-add-btn';
    characterAddBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('characterAddToTags')}</span>`;
    characterAddBtn.style.cssText = `background: linear-gradient(135deg, #059669 0%, #047857 100%); border: 1px solid rgba(16,185,129,0.7); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 90px; white-space: nowrap; font-size: 14px; display: none;`;
    characterAddBtn.addEventListener('mouseenter', () => {
        characterAddBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        characterAddBtn.style.boxShadow = '0 4px 8px rgba(16,185,129,0.4)';
        characterAddBtn.style.transform = 'none';
    });
    characterAddBtn.addEventListener('mouseleave', () => {
        characterAddBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        characterAddBtn.style.boxShadow = 'none';
        characterAddBtn.style.transform = 'none';
    });

    clearButtonContainer.appendChild(quickRandomBtn);
    clearButtonContainer.appendChild(restoreBtn);
    clearButtonContainer.appendChild(clearBtn);
    clearButtonContainer.appendChild(characterFetchBtn);
    clearButtonContainer.appendChild(characterAddBtn);
    footer.appendChild(rightButtonsSection);
    footer.appendChild(clearButtonContainer);
    rightPanel.appendChild(subCategoryTabs);
    rightPanel.appendChild(subSubCategoryTabs);
    rightPanel.appendChild(subSubSubCategoryTabs);
    rightPanel.appendChild(tagContent);
    content.appendChild(categoryList);
    content.appendChild(rightPanel);
    dialog.appendChild(header);
    dialog.appendChild(selectedOverview);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);

    tagSelectorDialog = overlay;
    tagSelectorDialog.dialogElement = dialog;
    tagSelectorDialog.closeDialog = closeDialog;
    tagSelectorDialog.clearButtonContainer = clearButtonContainer;
    tagSelectorDialog.clearBtn = clearBtn;
    tagSelectorDialog.quickRandomBtn = quickRandomBtn;
    tagSelectorDialog.restoreBtn = restoreBtn;
    tagSelectorDialog.characterFetchBtn = characterFetchBtn;
    tagSelectorDialog.characterAddBtn = characterAddBtn;
    tagSelectorDialog.categoryList = categoryList;
    tagSelectorDialog.rightPanel = rightPanel;
    tagSelectorDialog.subCategoryTabs = subCategoryTabs;
    tagSelectorDialog.subSubCategoryTabs = subSubCategoryTabs;
    tagSelectorDialog.subSubSubCategoryTabs = subSubSubCategoryTabs;
    tagSelectorDialog.tagContent = tagContent;
    tagSelectorDialog.selectedOverview = selectedOverview;
    tagSelectorDialog.selectedCount = selectedCount;
    tagSelectorDialog.selectedTagsList = selectedTagsList;
    tagSelectorDialog.hintText = hintText;
    tagSelectorDialog.searchInput = searchInput;
    tagSelectorDialog.searchContainer = searchContainer;
    tagSelectorDialog.titleElement = title;
    tagSelectorDialog.activeCategory = null;
    tagSelectorDialog.activeSubCategory = null;
    tagSelectorDialog.activeSubSubCategory = null;
    tagSelectorDialog.activeSubSubSubCategory = null;
    tagSelectorDialog.overviewTitleText = overviewTitleText;

    initializeCategoryList();

    let lastFetchedPrompt = '';

    characterFetchBtn.addEventListener('click', async () => {
        const seedInput = document.getElementById('character-seed-input');
        const excludedInput = document.getElementById('character-excluded-input');
        const customInput = document.getElementById('character-custom-input');

        const seed = parseInt(seedInput?.value) || -1;
        const excluded = excludedInput?.value?.trim() || '';
        const customPrompt = customInput?.value?.trim() || '';

        extractorSettings.seed = seed;
        extractorSettings.excluded = excluded;
        extractorSettings.customPrompt = customPrompt;
        saveExtractorSettings();

        characterFetchBtn.disabled = true;
        characterFetchBtn.style.opacity = '0.7';
        if (tagSelectorDialog.characterMessageArea) {
            tagSelectorDialog.characterMessageArea.innerHTML = `<span style="animation: spin 1s linear infinite;">⏳</span> ${$t('characterFetching')}`;
            tagSelectorDialog.characterMessageArea.style.cssText = `
                margin-top: auto;
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                background: rgba(59, 130, 246, 0.15);
                border: 1px solid rgba(59, 130, 246, 0.4);
                color: #60a5fa;
            `;
        }

        try {
            const response = await fetch('/zhihui/cosplay-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seed, excluded, custom_prompt: customPrompt })
            });

            const result = await response.json();

            if (result.success) {
                tagSelectorDialog.lastFetchedPrompt = result.prompt;
                
                const historyItem = {
                    prompt: result.prompt,
                    timestamp: new Date().toLocaleTimeString()
                };
                tagSelectorDialog.characterHistory.unshift(historyItem);
                if (tagSelectorDialog.characterHistory.length > 10) {
                    tagSelectorDialog.characterHistory.pop();
                }
                localStorage.setItem('zhihui_character_history', JSON.stringify(tagSelectorDialog.characterHistory));

                updateCharacterHistoryList();
                
                if (tagSelectorDialog.characterResultText) {
                    tagSelectorDialog.characterResultText.textContent = result.prompt;
                    tagSelectorDialog.characterResultText.style.display = 'block';
                }
                if (tagSelectorDialog.characterEmptyState) tagSelectorDialog.characterEmptyState.style.display = 'none';
                characterAddBtn.style.display = 'block';
                
                if (tagSelectorDialog.characterMessageArea) {
                    tagSelectorDialog.characterMessageArea.innerHTML = '<span>✓</span> ' + $t('characterFetchSuccess');
                    tagSelectorDialog.characterMessageArea.style.cssText = `
                        margin-top: auto;
                        padding: 10px 14px;
                        border-radius: 8px;
                        font-size: 13px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.3s ease;
                        background: rgba(34, 197, 94, 0.15);
                        border: 1px solid rgba(34, 197, 94, 0.4);
                        color: #22c55e;
                    `;
                    setTimeout(() => {
                        if (tagSelectorDialog.characterMessageArea) {
                            tagSelectorDialog.characterMessageArea.style.display = 'none';
                        }
                    }, 3000);
                }
            } else {
                if (tagSelectorDialog.characterMessageArea) {
                    tagSelectorDialog.characterMessageArea.innerHTML = '<span>✗</span> ' + $t('characterFetchFailed') + (result.error || 'Unknown error');
                    tagSelectorDialog.characterMessageArea.style.cssText = `
                        margin-top: auto;
                        padding: 10px 14px;
                        border-radius: 8px;
                        font-size: 13px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.3s ease;
                        background: rgba(239, 68, 68, 0.15);
                        border: 1px solid rgba(239, 68, 68, 0.4);
                        color: #ef4444;
                    `;
                }
            }
        } catch (error) {
            if (tagSelectorDialog.characterMessageArea) {
                tagSelectorDialog.characterMessageArea.innerHTML = '<span>✗</span> ' + $t('characterFetchFailed') + error.message;
                tagSelectorDialog.characterMessageArea.style.cssText = `
                    margin-top: auto;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    color: #ef4444;
                `;
            }
        } finally {
            characterFetchBtn.disabled = false;
            characterFetchBtn.style.opacity = '1';
        }
    });

    characterAddBtn.addEventListener('click', () => {
        if (tagSelectorDialog.lastFetchedPrompt && currentNode) {
            const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
            if (tagEditWidget) {
                tagEditWidget.value = tagSelectorDialog.lastFetchedPrompt;
                if (tagEditWidget.callback) {
                    tagEditWidget.callback(tagEditWidget.value);
                }
            }
            if (tagSelectorDialog.closeDialog) {
                tagSelectorDialog.closeDialog();
            }
        }
    });

    document.body.appendChild(overlay);

    const handleKeyDown = (e) => {
        if (tagSelectorDialog && tagSelectorDialog.activeCategory === '随机标签') {
            return;
        }

        if (e.key === 'Escape') {

            if (previewPopup && previewPopup.style.display === 'block') {
                previewPopup.style.display = 'none';

                enableMainUIInteraction();
                return;
            }
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    tagSelectorDialog.keydownHandler = handleKeyDown;

    const handleResize = debounce(() => {
        if (tagSelectorDialog && tagSelectorDialog.style.display === 'block') {
            const dialog = tagSelectorDialog.querySelector('div');
            if (dialog) {

                let x = parseInt(dialog.style.left) || 0;
                let y = parseInt(dialog.style.top) || 0;

                const screenPadding = 100;

                if (x + dialog.offsetWidth > window.innerWidth + screenPadding) {
                    dialog.style.left = (window.innerWidth - dialog.offsetWidth + screenPadding) + 'px';
                }

                if (y + dialog.offsetHeight > window.innerHeight + screenPadding) {
                    dialog.style.top = (window.innerHeight - dialog.offsetHeight + screenPadding) + 'px';
                }
            }
        }
    }, 100);

    window.addEventListener('resize', handleResize);
    
    let currentDialogLocale = null;
    const checkLocaleChange = () => {
        if (tagSelectorDialog && tagSelectorDialog.style.display === 'block') {
            const newLocale = getLocale();
            if (currentDialogLocale !== newLocale) {
                currentDialogLocale = newLocale;
                refreshAllTagDisplays();
                if (tagSelectorDialog.categoryList) {
                    const categoryItems = tagSelectorDialog.categoryList.querySelectorAll('div[data-original-name]');
                    categoryItems.forEach(item => {
                        const originalName = item.dataset.originalName;
                        if (originalName) {
                            item.textContent = $tc(originalName);
                        }
                    });
                }
            }
        }
    };
    
    const localeCheckInterval = setInterval(checkLocaleChange, 500);
    tagSelectorDialog.localeCheckInterval = localeCheckInterval;
    
    overlay.onclick = (e) => {
    };
}

let adultContentEnabled = false;
let adultContentUnlocked = false;
let adultUnlockTimestamp = 0;
let adultFailedAttempts = 0;
let adultLockoutUntil = 0;

const ADULT_SESSION_TIMEOUT = 4 * 60 * 60 * 1000;
const ADULT_MAX_FAILED_ATTEMPTS = 5;
const ADULT_LOCKOUT_DURATION = 30000;
const ADULT_STORAGE_SALT = 'zhihui_adult_v2_salt_2024';

window.adultContentEnabled = adultContentEnabled;
window.adultContentUnlocked = adultContentUnlocked;

function updateWindowAdultStatus() {
    window.adultContentEnabled = adultContentEnabled;
    window.adultContentUnlocked = adultContentUnlocked;
}

function _adultStorageHash(data) {
    let hash = 5381;
    const str = data + ADULT_STORAGE_SALT;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString(36);
}

function loadAdultContentSettings() {
    try {
        const raw = localStorage.getItem('zhihui_adult_settings');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const expectedHash = _adultStorageHash(
            String(parsed.enabled) + String(parsed.unlocked) + String(parsed.timestamp || 0)
        );
        if (parsed._sig !== expectedHash) {
            localStorage.removeItem('zhihui_adult_settings');
            return;
        }
        adultContentEnabled = parsed.enabled || false;
        adultContentUnlocked = parsed.unlocked || false;
        adultUnlockTimestamp = parsed.timestamp || 0;

        if (adultContentEnabled && adultUnlockTimestamp > 0) {
            const elapsed = Date.now() - adultUnlockTimestamp;
            if (elapsed > ADULT_SESSION_TIMEOUT) {
                adultContentEnabled = false;
                adultContentUnlocked = false;
                adultUnlockTimestamp = 0;
                saveAdultContentSettings();
            }
        }
        updateWindowAdultStatus();
    } catch (e) {
        localStorage.removeItem('zhihui_adult_settings');
    }
}

function saveAdultContentSettings() {
    try {
        const data = {
            enabled: adultContentEnabled,
            unlocked: adultContentUnlocked,
            timestamp: adultUnlockTimestamp
        };
        data._sig = _adultStorageHash(
            String(data.enabled) + String(data.unlocked) + String(data.timestamp)
        );
        localStorage.setItem('zhihui_adult_settings', JSON.stringify(data));
    } catch (e) {}
}

function _generateVerificationCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function showAdultUnlockDialog(onUnlock) {
    if (adultLockoutUntil > Date.now()) {
        const remaining = Math.ceil((adultLockoutUntil - Date.now()) / 1000);
        showToast(`验证已锁定，请 ${remaining} 秒后再试`, 'error');
        return;
    }

    const verificationCode = _generateVerificationCode();
    const locale = getLocale();
    const isZh = locale === 'zh';

    const overlay = DOM.div(`position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 20000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);`);

    const dialog = DOM.div(`background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%); border: 2px solid #ef4444; border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);`);

    const title = document.createElement('h2');
    title.textContent = $t('adultContentWarning');
    title.style.cssText = `color: #ef4444; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; text-align: center;`;

    const warning = document.createElement('div');
    warning.innerHTML = `
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="color: #fca5a5; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                <strong>${$t('adultWarningTitle')}</strong>
            </p>
            <p style="color: #fca5a5; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                ${$t('adultWarningDesc')}
            </p>
            <ul style="color: #fca5a5; font-size: 13px; line-height: 1.6; margin: 8px 0; padding-left: 20px;">
                <li>${$t('adultWarningMinor')}</li>
                <li>${$t('adultWarningUncomfortable')}</li>
                <li>${$t('adultWarningPublic')}</li>
            </ul>
        </div>
        
        <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="color: #93c5fd; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                <strong>${$t('adultNoticeTitle')}</strong>
            </p>
            <ul style="color: #93c5fd; font-size: 13px; line-height: 1.6; margin: 8px 0; padding-left: 20px;">
                <li>${$t('adultNotice1')}</li>
                <li>${$t('adultNotice2')}</li>
                <li>${$t('adultNotice3')}</li>
                <li>${$t('adultNotice4')}</li>
            </ul>
        </div>

        <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="color: #86efac; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                <strong>${$t('adultUnlockFeaturesTitle')}</strong>
            </p>
            <ul style="color: #86efac; font-size: 13px; line-height: 1.6; margin: 8px 0; padding-left: 20px;">
                <li>${$t('adultUnlockFeature1')}</li>
                <li>${$t('adultUnlockFeature2')}</li>
                <li>${$t('adultUnlockFeature3')}</li>
            </ul>
        </div>
    `;

    const checkboxContainer = DOM.div(`display: flex; align-items: flex-start; gap: 8px; margin-bottom: 16px;`);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'adult-consent-checkbox';
    checkbox.style.cssText = `width: 18px; height: 18px; margin-top: 2px; cursor: pointer; accent-color: #ef4444;`;

    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = 'adult-consent-checkbox';
    checkboxLabel.textContent = $t('adultContentAgreement');
    checkboxLabel.style.cssText = `color: #e2e8f0; font-size: 13px; line-height: 1.5; cursor: pointer;`;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkboxLabel);

    const inputContainer = DOM.div(`margin-bottom: 20px;`);

    const inputLabel = document.createElement('div');
    inputLabel.innerHTML = `
        <span style="color: #fca5a5; font-size: 13px; font-weight: 500;">${$t('enterVerification')}</span>
        <span style="color: #ef4444; font-size: 18px; font-weight: 700; background: rgba(239,68,68,0.15); padding: 2px 8px; border-radius: 4px; letter-spacing: 3px; font-family: monospace;">${verificationCode}</span>
    `;
    inputLabel.style.cssText = `margin-bottom: 8px; display: flex; align-items: center; gap: 8px;`;

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = isZh ? '请输入上方验证码' : 'Enter the code above';
    textInput.autocomplete = 'off';
    textInput.spellcheck = false;
    textInput.style.cssText = `width: 100%; padding: 10px 12px; border: 1px solid rgba(239,68,68,0.4); border-radius: 6px; background: rgba(15,23,42,0.8); color: #e2e8f0; font-size: 14px; box-sizing: border-box; transition: all 0.2s; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;`;
    textInput.onfocus = () => {
        textInput.style.borderColor = '#ef4444';
        textInput.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.2)';
    };
    textInput.onblur = () => {
        textInput.style.borderColor = 'rgba(239,68,68,0.4)';
        textInput.style.boxShadow = 'none';
    };
    textInput.onpaste = (e) => {
        e.preventDefault();
        return false;
    };
    textInput.oncopy = (e) => {
        e.preventDefault();
        return false;
    };
    textInput.oncut = (e) => {
        e.preventDefault();
        return false;
    };
    textInput.oncontextmenu = (e) => {
        e.preventDefault();
        return false;
    };

    inputContainer.appendChild(inputLabel);
    inputContainer.appendChild(textInput);

    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `color: #ef4444; font-size: 12px; margin-top: 4px; min-height: 18px; display: none;`;

    const buttonContainer = DOM.div(`display: flex; gap: 12px; justify-content: center;`);

    const cancelBtn = DOM.btn(`padding: 10px 24px; border: 1px solid rgba(148,163,184,0.4); border-radius: 8px; background: transparent; color: #94a3b8; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;`, $t('cancel'));
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.background = 'rgba(148,163,184,0.1)';
        cancelBtn.style.color = '#e2e8f0';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = '#94a3b8';
    };
    cancelBtn.onclick = () => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        document.body.removeChild(overlay);
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = $t('confirmOpen') + ' (12)';
    confirmBtn.disabled = true;
    confirmBtn.style.cssText = `padding: 10px 24px; border: none; border-radius: 8px; background: #475569; color: #fff; font-size: 14px; font-weight: 500; cursor: not-allowed; transition: all 0.2s; opacity: 0.5;`;

    let countdown = 12;
    let countdownInterval = null;
    let countdownFinished = false;

    function startCountdown() {
        countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                confirmBtn.textContent = `${$t('confirmOpen')} (${countdown})`;
            } else {
                clearInterval(countdownInterval);
                countdownFinished = true;
                confirmBtn.textContent = $t('confirmOpen');
                updateConfirmButton();
            }
        }, 1000);
    }

    startCountdown();

    function updateConfirmButton() {
        const isChecked = checkbox.checked;
        const isTextValid = textInput.value.trim().toUpperCase() === verificationCode;
        const canConfirm = isChecked && isTextValid && countdownFinished;

        confirmBtn.disabled = !canConfirm;
        confirmBtn.style.background = canConfirm ? '#ef4444' : '#475569';
        confirmBtn.style.cursor = canConfirm ? 'pointer' : 'not-allowed';
        confirmBtn.style.opacity = canConfirm ? '1' : '0.5';
    }

    checkbox.onchange = updateConfirmButton;
    textInput.oninput = function() {
        textInput.value = textInput.value.toUpperCase();
        errorMsg.style.display = 'none';
        updateConfirmButton();
    };

    confirmBtn.onmouseenter = () => {
        if (!confirmBtn.disabled) {
            confirmBtn.style.background = '#dc2626';
            confirmBtn.style.transform = 'scale(1.02)';
        }
    };
    confirmBtn.onmouseleave = () => {
        if (!confirmBtn.disabled) {
            confirmBtn.style.background = '#ef4444';
            confirmBtn.style.transform = 'scale(1)';
        }
    };
    confirmBtn.onclick = () => {
        if (!confirmBtn.disabled) {
            if (textInput.value.trim().toUpperCase() !== verificationCode) {
                adultFailedAttempts++;
                errorMsg.textContent = isZh
                    ? `验证码错误，剩余尝试次数: ${ADULT_MAX_FAILED_ATTEMPTS - adultFailedAttempts}`
                    : `Invalid code, attempts remaining: ${ADULT_MAX_FAILED_ATTEMPTS - adultFailedAttempts}`;
                errorMsg.style.display = 'block';
                textInput.value = '';
                textInput.style.borderColor = '#ef4444';
                updateConfirmButton();

                if (adultFailedAttempts >= ADULT_MAX_FAILED_ATTEMPTS) {
                    adultLockoutUntil = Date.now() + ADULT_LOCKOUT_DURATION;
                    adultFailedAttempts = 0;
                    document.body.removeChild(overlay);
                    showToast(isZh ? '验证失败次数过多，已锁定30秒' : 'Too many failed attempts, locked for 30s', 'error');
                }
                return;
            }

            adultFailedAttempts = 0;
            adultContentUnlocked = true;
            adultContentEnabled = true;
            adultUnlockTimestamp = Date.now();
            updateWindowAdultStatus();
            saveAdultContentSettings();
            document.body.removeChild(overlay);
            if (onUnlock) onUnlock();
        }
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(warning);
    dialog.appendChild(checkboxContainer);
    dialog.appendChild(inputContainer);
    dialog.appendChild(errorMsg);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function showConfirmDialog(titleText, messageText, onConfirm, confirmText = '确定', cancelText = '取消') {
    const overlay = DOM.div(`position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 20000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);`);

    const dialog = DOM.div(`background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%); border: 2px solid #3b82f6; border-radius: 16px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);`);

    const title = document.createElement('h2');
    title.textContent = titleText;
    title.style.cssText = `color: #3b82f6; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;`;

    const message = document.createElement('div');
    message.textContent = messageText;
    message.style.cssText = `color: #e2e8f0; font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: center;`;

    const buttonContainer = DOM.div(`display: flex; gap: 12px; justify-content: center;`);

    const cancelBtn = DOM.btn(`padding: 10px 24px; border: 1px solid rgba(148,163,184,0.4); border-radius: 8px; background: transparent; color: #94a3b8; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;`, cancelText);
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.background = 'rgba(148,163,184,0.1)';
        cancelBtn.style.color = '#e2e8f0';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = '#94a3b8';
    };
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
    };

    const confirmBtn = DOM.btn(`padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;`, confirmText);
    confirmBtn.onmouseenter = () => {
        confirmBtn.style.background = '#2563eb';
        confirmBtn.style.transform = 'scale(1.02)';
    };
    confirmBtn.onmouseleave = () => {
        confirmBtn.style.background = '#3b82f6';
        confirmBtn.style.transform = 'scale(1)';
    };
    confirmBtn.onclick = () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function showAdultCloseConfirmDialog(onConfirm) {
    const overlay = DOM.div(`position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 20000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);`);

    const dialog = DOM.div(`background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%); border: 2px solid #3b82f6; border-radius: 16px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);`);

    const title = document.createElement('h2');
    title.textContent = $t('confirmCloseAdultTitle');
    title.style.cssText = `color: #3b82f6; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;`;

    const message = document.createElement('div');
    message.textContent = $t('confirmCloseAdultMessage');
    message.style.cssText = `color: #e2e8f0; font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: center;`;

    const buttonContainer = DOM.div(`display: flex; gap: 12px; justify-content: center;`);

    const cancelBtn = DOM.btn(`padding: 10px 24px; border: 1px solid rgba(148,163,184,0.4); border-radius: 8px; background: transparent; color: #94a3b8; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;`, $t('confirmCloseAdultCancel'));
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.background = 'rgba(148,163,184,0.1)';
        cancelBtn.style.color = '#e2e8f0';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = '#94a3b8';
    };
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
    };

    const confirmBtn = DOM.btn(`padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;`, $t('confirmCloseAdultConfirm'));
    confirmBtn.onmouseenter = () => {
        confirmBtn.style.background = '#2563eb';
        confirmBtn.style.transform = 'scale(1.02)';
    };
    confirmBtn.onmouseleave = () => {
        confirmBtn.style.background = '#3b82f6';
        confirmBtn.style.transform = 'scale(1)';
    };
    confirmBtn.onclick = () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function loadNodeSettings() {
    try {
        const saved = localStorage.getItem('zhihui_tag_selector_node_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            return {
                showInsertBtn: settings.showInsertBtn !== false && settings.showInputBtns !== false,
                showClearBtn: settings.showClearBtn !== false && settings.showInputBtns !== false,
                showInspirationBtn: settings.showInspirationBtn !== false
            };
        }
    } catch (e) {}
    return { showInsertBtn: true, showClearBtn: true, showInspirationBtn: true };
}

function saveNodeSettings(settings) {
    try {
        localStorage.setItem('zhihui_tag_selector_node_settings', JSON.stringify(settings));
    } catch (e) {}
}

function createSettingsToggle(initialEnabled, onChange) {
    const toggle = DOM.div(`display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 4px 10px; border-radius: 5px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0;`);
    let enabled = initialEnabled;

    const updateStyle = () => {
        toggle.style.background = enabled ? 'rgba(59,130,246,0.85)' : 'rgba(100,116,139,0.3)';
        toggle.style.border = `1px solid ${enabled ? 'rgba(59,130,246,0.9)' : 'rgba(100,116,139,0.5)'}`;
        toggleText.textContent = enabled ? $t('adultContentEnabled') : $t('adultContentDisabled');
        toggleText.style.color = enabled ? '#ffffff' : '#94a3b8';
    };

    const toggleText = document.createElement('span');
    toggleText.style.cssText = `font-size: 11px; font-weight: 500; transition: all 0.3s ease; white-space: nowrap;`;
    toggle.appendChild(toggleText);
    updateStyle();

    toggle.onclick = () => {
        enabled = !enabled;
        updateStyle();
        onChange(enabled);
    };

    toggle.onmouseenter = () => {
        toggle.style.transform = 'scale(1.05)';
        toggle.style.background = enabled ? 'rgba(37,99,235,0.95)' : 'rgba(100,116,139,0.45)';
    };
    toggle.onmouseleave = () => {
        toggle.style.transform = 'scale(1)';
        toggle.style.background = enabled ? 'rgba(59,130,246,0.85)' : 'rgba(100,116,139,0.3)';
    };

    return toggle;
}

function applyInputBtnVisibility() {
    const settings = loadNodeSettings();
    document.querySelectorAll('.tag-selector-toolbar').forEach(toolbar => {
        const insertBtn = toolbar.querySelector('.tag-selector-insert-btn');
        const inspirationBtn = toolbar.querySelector('.tag-selector-inspiration-btn');
        const clearBtn = toolbar.querySelector('.tag-selector-clear-btn');
        if (insertBtn) insertBtn.dataset.enabled = String(settings.showInsertBtn !== false);
        if (inspirationBtn) inspirationBtn.dataset.enabled = String(settings.showInspirationBtn !== false);
        if (clearBtn) clearBtn.dataset.enabled = String(settings.showClearBtn !== false);
        const hasEnabled = (insertBtn && insertBtn.dataset.enabled === 'true') || (inspirationBtn && inspirationBtn.dataset.enabled === 'true') || (clearBtn && clearBtn.dataset.enabled === 'true');
        toolbar.style.display = hasEnabled ? 'flex' : 'none';
        if (insertBtn) insertBtn.style.display = insertBtn.dataset.enabled === 'true' ? 'flex' : 'none';
        if (inspirationBtn) inspirationBtn.style.display = inspirationBtn.dataset.enabled === 'true' ? 'flex' : 'none';
        if (clearBtn) clearBtn.style.display = clearBtn.dataset.enabled === 'true' ? 'flex' : 'none';
    });
}

let insertTagTooltipEl = null;

function showInsertTagTooltip(btnEl) {
    hideInsertTagTooltip();
    insertTagTooltipEl = document.createElement("div");
    insertTagTooltipEl.style.cssText = `position: fixed; background: rgba(30,41,59,0.95); color: #e2e8f0; padding: 6px 10px; border-radius: 4px; font-size: 13px; z-index: 10004; box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none; white-space: nowrap; border: 1px solid rgba(255,255,255,0.1);`;
    insertTagTooltipEl.textContent = $t('insertTagBtnTooltip');
    document.body.appendChild(insertTagTooltipEl);
    const btnRect = btnEl.getBoundingClientRect();
    const tooltipRect = insertTagTooltipEl.getBoundingClientRect();
    let left = btnRect.left + (btnRect.width / 2) - (tooltipRect.width / 2);
    let top = btnRect.top - tooltipRect.height - 6;
    if (left < 5) left = 5;
    if (left + tooltipRect.width > window.innerWidth - 5) left = window.innerWidth - tooltipRect.width - 5;
    if (top < 5) top = btnRect.bottom + 6;
    insertTagTooltipEl.style.left = left + "px";
    insertTagTooltipEl.style.top = top + "px";
}

function hideInsertTagTooltip() {
    if (insertTagTooltipEl) {
        insertTagTooltipEl.remove();
        insertTagTooltipEl = null;
    }
}

let clearInputTooltipEl = null;

function showClearInputTooltip(btnEl, key) {
    hideClearInputTooltip();
    clearInputTooltipEl = document.createElement("div");
    clearInputTooltipEl.style.cssText = `position: fixed; background: rgba(30,41,59,0.95); color: #e2e8f0; padding: 6px 10px; border-radius: 4px; font-size: 13px; z-index: 10004; box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none; white-space: nowrap; border: 1px solid rgba(255,255,255,0.1);`;
    clearInputTooltipEl.textContent = $t(key);
    document.body.appendChild(clearInputTooltipEl);
    const btnRect = btnEl.getBoundingClientRect();
    const tooltipRect = clearInputTooltipEl.getBoundingClientRect();
    let left = btnRect.left + (btnRect.width / 2) - (tooltipRect.width / 2);
    let top = btnRect.top - tooltipRect.height - 6;
    if (left < 5) left = 5;
    if (left + tooltipRect.width > window.innerWidth - 5) left = window.innerWidth - tooltipRect.width - 5;
    if (top < 5) top = btnRect.bottom + 6;
    clearInputTooltipEl.style.left = left + "px";
    clearInputTooltipEl.style.top = top + "px";
}

function hideClearInputTooltip() {
    if (clearInputTooltipEl) {
        clearInputTooltipEl.remove();
        clearInputTooltipEl = null;
    }
}

let inspirationTooltipEl = null;

function showInspirationTooltip(btnEl) {
    hideInspirationTooltip();
    inspirationTooltipEl = document.createElement("div");
    inspirationTooltipEl.style.cssText = `position: fixed; background: rgba(30,41,59,0.95); color: #e2e8f0; padding: 6px 10px; border-radius: 4px; font-size: 13px; z-index: 10004; box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none; white-space: nowrap; border: 1px solid rgba(255,255,255,0.1);`;
    inspirationTooltipEl.textContent = $t('inspirationBtnTooltip');
    document.body.appendChild(inspirationTooltipEl);
    const btnRect = btnEl.getBoundingClientRect();
    const tooltipRect = inspirationTooltipEl.getBoundingClientRect();
    let left = btnRect.left + (btnRect.width / 2) - (tooltipRect.width / 2);
    let top = btnRect.top - tooltipRect.height - 6;
    if (left < 5) left = 5;
    if (left + tooltipRect.width > window.innerWidth - 5) left = window.innerWidth - tooltipRect.width - 5;
    if (top < 5) top = btnRect.bottom + 6;
    inspirationTooltipEl.style.left = left + "px";
    inspirationTooltipEl.style.top = top + "px";
}

function hideInspirationTooltip() {
    if (inspirationTooltipEl) {
        inspirationTooltipEl.remove();
        inspirationTooltipEl = null;
    }
}

async function showInspirationSelector(anchorEl, tagEditWidget) {
    const existing = document.getElementById('inspiration-selector-panel');
    if (existing) {
        existing.remove();
        return;
    }

    if (!tagsData) {
        await loadTagsData();
    }

    if (!tagsData) {
        showToast($t('dataLoadFailed') || '数据加载失败', 'error');
        return;
    }

    const inspirationCategories = tagsData['灵感套装'] || {};
    let categoryNames = Object.keys(inspirationCategories);
    
    if (!adultContentEnabled) {
        categoryNames = categoryNames.filter(cat => cat !== '成人题材');
    }
    
    const inspirationSets = [];
    categoryNames.forEach(cat => {
        const subCategoryData = inspirationCategories[cat];
        if (subCategoryData) {
            Object.values(subCategoryData).forEach(tag => {
                inspirationSets.push({
                    name: tag.display || tag.name || tag.value,
                    value: tag.value,
                    category: cat
                });
            });
        }
    });

    const panel = document.createElement('div');
    panel.id = 'inspiration-selector-panel';
    panel.style.cssText = `position: fixed; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(59,130,246,0.4); border-radius: 8px; padding: 8px; width: 360px; height: 360px; color: #e2e8f0; box-shadow: 0 12px 40px rgba(0,0,0,0.5); z-index: 10001; display: flex; flex-direction: column; overflow: hidden; gap: 6px;`;

    const rect = anchorEl.getBoundingClientRect();
    panel.style.top = (rect.bottom + 4) + 'px';
    panel.style.left = rect.left + 'px';

    const titleBar = DOM.div(`display: flex; align-items: center; justify-content: space-between; padding: 0px 4px 0px 10px; font-size: 12px; font-weight: 700; color: #38bdf8; border-radius: 6px; flex-shrink: 0; letter-spacing: 0.5px; line-height: 1.1;`);
    const titleText = DOM.span(`text-align: center; flex: 1;`);
    titleText.textContent = $t('insertInspirationSet');
    titleBar.appendChild(titleText);
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    closeBtn.style.cssText = `background: none; border: none; color: #64748b; cursor: pointer; padding: 2px; border-radius: 3px; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;`;
    closeBtn.onmouseenter = () => { closeBtn.style.color = '#e2e8f0'; closeBtn.style.background = 'rgba(239,68,68,0.2)'; };
    closeBtn.onmouseleave = () => { closeBtn.style.color = '#64748b'; closeBtn.style.background = 'none'; };
    closeBtn.onclick = () => { panel.remove(); };
    titleBar.appendChild(closeBtn);
    panel.appendChild(titleBar);

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = $t('searchTags');
    searchInput.style.cssText = `width: 100%; background: rgba(30,41,59,0.8); border: 1px solid rgba(59,130,246,0.3); border-radius: 6px; padding: 6px 10px; color: #e2e8f0; font-size: 12px; outline: none; transition: border-color 0.2s; flex-shrink: 0;`;
    searchInput.onfocus = () => { searchInput.style.borderColor = 'rgba(59,130,246,0.6)'; };
    searchInput.onblur = () => { searchInput.style.borderColor = 'rgba(59,130,246,0.3)'; };
    panel.appendChild(searchInput);

    const mainContent = DOM.div(`display: flex; flex: 1; min-height: 0; gap: 6px;`);

    const catSidebar = DOM.div(`width: 90px; flex-shrink: 0; background: rgba(15,23,42,0.5); border-radius: 6px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; padding: 4px;`);

    const listContainer = DOM.div(`flex: 1; overflow-y: auto; min-height: 0;`);

    mainContent.appendChild(catSidebar);
    mainContent.appendChild(listContainer);
    panel.appendChild(mainContent);

    let selectedCatValue = '';

    const renderSidebar = () => {
        catSidebar.innerHTML = '';

        const allItem = DOM.div(`padding: 7px 8px; font-size: 11px; color: ${selectedCatValue === '' ? '#93c5fd' : '#94a3b8'}; cursor: pointer; border-radius: 4px; transition: all 0.15s ease; background: ${selectedCatValue === '' ? 'rgba(59,130,246,0.2)' : 'transparent'}; font-weight: ${selectedCatValue === '' ? '600' : '400'}; border-left: 2px solid ${selectedCatValue === '' ? '#3b82f6' : 'transparent'};`);
        allItem.textContent = $t('allCategories');
        allItem.onmouseenter = () => { if (selectedCatValue !== '') { allItem.style.background = 'rgba(59,130,246,0.1)'; allItem.style.color = '#93c5fd'; } };
        allItem.onmouseleave = () => { if (selectedCatValue !== '') { allItem.style.background = 'transparent'; allItem.style.color = '#94a3b8'; } };
        allItem.onclick = () => { selectedCatValue = ''; renderSidebar(); renderList(); };
        catSidebar.appendChild(allItem);

        categoryNames.forEach(cat => {
            const item = DOM.div(`padding: 7px 8px; font-size: 11px; color: ${selectedCatValue === cat ? '#93c5fd' : '#94a3b8'}; cursor: pointer; border-radius: 4px; transition: all 0.15s ease; background: ${selectedCatValue === cat ? 'rgba(59,130,246,0.2)' : 'transparent'}; font-weight: ${selectedCatValue === cat ? '600' : '400'}; border-left: 2px solid ${selectedCatValue === cat ? '#3b82f6' : 'transparent'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`);
            item.textContent = cat;
            item.title = cat;
            item.onmouseenter = () => { if (selectedCatValue !== cat) { item.style.background = 'rgba(59,130,246,0.1)'; item.style.color = '#93c5fd'; } };
            item.onmouseleave = () => { if (selectedCatValue !== cat) { item.style.background = 'transparent'; item.style.color = '#94a3b8'; } };
            item.onclick = () => { selectedCatValue = cat; renderSidebar(); renderList(); };
            catSidebar.appendChild(item);
        });
    };

    const renderList = () => {
        listContainer.innerHTML = '';
        const keyword = searchInput.value.trim().toLowerCase();

        let filteredSets = inspirationSets;
        if (selectedCatValue && selectedCatValue !== '') {
            filteredSets = inspirationSets.filter(set => set.category === selectedCatValue);
        }

        filteredSets = filteredSets.filter(set => {
            if (!keyword) return true;
            return set.name.toLowerCase().includes(keyword) || set.value.toLowerCase().includes(keyword);
        });

        if (filteredSets.length === 0) {
            const emptyMsg = DOM.div(`text-align: center; color: #64748b; padding: 16px 8px; font-size: 12px;`);
            emptyMsg.textContent = $t('noInspirationFound');
            listContainer.appendChild(emptyMsg);
            return;
        }

        filteredSets.forEach((set, index) => {
            if (index > 0) {
                const divider = DOM.div(`height: 1px; background: rgba(59,130,246,0.15); margin: 4px 0;`);
                listContainer.appendChild(divider);
            }

            const item = DOM.div(`padding: 6px 10px; font-size: 12px; color: #e2e8f0; cursor: pointer; border-radius: 4px; transition: all 0.2s ease; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px;`);

            let catTag = null;
            if (selectedCatValue === '' && set.category) {
                catTag = DOM.div(`background: rgba(59,130,246,0.25); color: #60a5fa; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 500; white-space: nowrap; flex-shrink: 0; transition: all 0.2s ease;`);
                catTag.textContent = set.category;
                item.appendChild(catTag);
            }

            const displayText = DOM.span(`overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 0.2s ease;`);
            displayText.textContent = set.name;
            item.appendChild(displayText);

            item.title = set.value;

            item.onmouseenter = () => {
                item.style.background = 'rgba(59,130,246,0.15)';
                displayText.style.color = '#93c5fd';
                if (catTag) {
                    catTag.style.background = 'rgba(59,130,246,0.35)';
                    catTag.style.color = '#93c5fd';
                }
            };
            item.onmouseleave = () => {
                item.style.background = 'transparent';
                displayText.style.color = '#e2e8f0';
                if (catTag) {
                    catTag.style.background = 'rgba(59,130,246,0.25)';
                    catTag.style.color = '#60a5fa';
                }
            };
            item.onclick = () => {
                const inputEl = tagEditWidget.inputEl;
                if (inputEl.value) {
                    inputEl.value = set.value + ", " + inputEl.value;
                } else {
                    inputEl.value = set.value;
                }
                tagEditWidget.value = inputEl.value;
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                panel.remove();
                showToast($t('inspirationInserted'), 'success', 1500);
            };

            listContainer.appendChild(item);
        });
    };

    searchInput.addEventListener('input', renderList);

    renderSidebar();
    renderList();

    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;';
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    const origRemove = panel.remove.bind(panel);
    panel.remove = () => {
        origRemove();
        if (backdrop.parentNode) backdrop.remove();
    };
    backdrop.onclick = () => panel.remove();

    setTimeout(() => { searchInput.focus(); }, 50);
}

async function showCustomTagInsertSelector(anchorEl, tagEditWidget, node) {
    const existing = document.getElementById('custom-tag-insert-panel');
    if (existing) {
        existing.remove();
        return;
    }

    if (!tagsData) {
        await loadTagsData();
    }

    const panel = document.createElement('div');
    panel.id = 'custom-tag-insert-panel';
    panel.style.cssText = `position: fixed; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(59,130,246,0.4); border-radius: 8px; padding: 8px; width: 360px; height: 360px; color: #e2e8f0; box-shadow: 0 12px 40px rgba(0,0,0,0.5); z-index: 10001; display: flex; flex-direction: column; overflow: hidden; gap: 6px;`;

    const rect = anchorEl.getBoundingClientRect();
    panel.style.top = (rect.bottom + 4) + 'px';
    panel.style.left = rect.left + 'px';

    const titleBar = DOM.div(`display: flex; align-items: center; justify-content: space-between; padding: 0px 4px 0px 10px; font-size: 12px; font-weight: 700; color: #38bdf8; border-radius: 6px; flex-shrink: 0; letter-spacing: 0.5px; line-height: 1.1;`);
    const titleText = DOM.span(`text-align: center; flex: 1;`);
    titleText.textContent = $t('insertCustomTag');
    titleBar.appendChild(titleText);
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    closeBtn.style.cssText = `background: none; border: none; color: #64748b; cursor: pointer; padding: 2px; border-radius: 3px; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;`;
    closeBtn.onmouseenter = () => { closeBtn.style.color = '#e2e8f0'; closeBtn.style.background = 'rgba(239,68,68,0.2)'; };
    closeBtn.onmouseleave = () => { closeBtn.style.color = '#64748b'; closeBtn.style.background = 'none'; };
    closeBtn.onclick = () => { panel.remove(); };
    titleBar.appendChild(closeBtn);
    panel.appendChild(titleBar);

    const customTags = tagsData?.['自定义']?.['我的标签'] || [];

    const grouped = {};
    grouped[''] = [];
    customTags.forEach(tag => {
        const cat = tag.category || '';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(tag);
    });

    const sortedCats = Object.keys(grouped).sort((a, b) => {
        if (a === '') return 1;
        if (b === '') return -1;
        return a.localeCompare(b);
    });

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = $t('searchTags');
    searchInput.style.cssText = `width: 100%; background: rgba(30,41,59,0.8); border: 1px solid rgba(59,130,246,0.3); border-radius: 6px; padding: 6px 10px; color: #e2e8f0; font-size: 12px; outline: none; transition: border-color 0.2s; flex-shrink: 0;`;
    searchInput.onfocus = () => { searchInput.style.borderColor = 'rgba(59,130,246,0.6)'; };
    searchInput.onblur = () => { searchInput.style.borderColor = 'rgba(59,130,246,0.3)'; };
    panel.appendChild(searchInput);

    const mainContent = DOM.div(`display: flex; flex: 1; min-height: 0; gap: 6px;`);

    const catSidebar = DOM.div(`width: 90px; flex-shrink: 0; background: rgba(15,23,42,0.5); border-radius: 6px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; padding: 4px;`);

    const listContainer = DOM.div(`flex: 1; overflow-y: auto; min-height: 0;`);

    mainContent.appendChild(catSidebar);
    mainContent.appendChild(listContainer);
    panel.appendChild(mainContent);

    let selectedCatValue = '';

    const renderSidebar = () => {
        catSidebar.innerHTML = '';

        const allItem = DOM.div(`padding: 7px 8px; font-size: 11px; color: ${selectedCatValue === '' ? '#93c5fd' : '#94a3b8'}; cursor: pointer; border-radius: 4px; transition: all 0.15s ease; background: ${selectedCatValue === '' ? 'rgba(59,130,246,0.2)' : 'transparent'}; font-weight: ${selectedCatValue === '' ? '600' : '400'}; border-left: 2px solid ${selectedCatValue === '' ? '#3b82f6' : 'transparent'};`);
        allItem.textContent = $t('allCategories');
        allItem.onmouseenter = () => { if (selectedCatValue !== '') { allItem.style.background = 'rgba(59,130,246,0.1)'; allItem.style.color = '#93c5fd'; } };
        allItem.onmouseleave = () => { if (selectedCatValue !== '') { allItem.style.background = 'transparent'; allItem.style.color = '#94a3b8'; } };
        allItem.onclick = () => { selectedCatValue = ''; renderSidebar(); renderList(); };
        catSidebar.appendChild(allItem);

        const uncItem = DOM.div(`padding: 7px 8px; font-size: 11px; color: ${selectedCatValue === '__uncategorized__' ? '#93c5fd' : '#94a3b8'}; cursor: pointer; border-radius: 4px; transition: all 0.15s ease; background: ${selectedCatValue === '__uncategorized__' ? 'rgba(59,130,246,0.2)' : 'transparent'}; font-weight: ${selectedCatValue === '__uncategorized__' ? '600' : '400'}; border-left: 2px solid ${selectedCatValue === '__uncategorized__' ? '#3b82f6' : 'transparent'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`);
        uncItem.textContent = $t('uncategorized');
        uncItem.title = $t('uncategorized');
        uncItem.onmouseenter = () => { if (selectedCatValue !== '__uncategorized__') { uncItem.style.background = 'rgba(59,130,246,0.1)'; uncItem.style.color = '#93c5fd'; } };
        uncItem.onmouseleave = () => { if (selectedCatValue !== '__uncategorized__') { uncItem.style.background = 'transparent'; uncItem.style.color = '#94a3b8'; } };
        uncItem.onclick = () => { selectedCatValue = '__uncategorized__'; renderSidebar(); renderList(); };
        catSidebar.appendChild(uncItem);

        sortedCats.forEach(cat => {
            if (!cat) return;
            const item = DOM.div(`padding: 7px 8px; font-size: 11px; color: ${selectedCatValue === cat ? '#93c5fd' : '#94a3b8'}; cursor: pointer; border-radius: 4px; transition: all 0.15s ease; background: ${selectedCatValue === cat ? 'rgba(59,130,246,0.2)' : 'transparent'}; font-weight: ${selectedCatValue === cat ? '600' : '400'}; border-left: 2px solid ${selectedCatValue === cat ? '#3b82f6' : 'transparent'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`);
            item.textContent = cat;
            item.title = cat;
            item.onmouseenter = () => { if (selectedCatValue !== cat) { item.style.background = 'rgba(59,130,246,0.1)'; item.style.color = '#93c5fd'; } };
            item.onmouseleave = () => { if (selectedCatValue !== cat) { item.style.background = 'transparent'; item.style.color = '#94a3b8'; } };
            item.onclick = () => { selectedCatValue = cat; renderSidebar(); renderList(); };
            catSidebar.appendChild(item);
        });
    };

    const renderList = () => {
        listContainer.innerHTML = '';
        const keyword = searchInput.value.trim().toLowerCase();

        let filteredCats = sortedCats;
        if (selectedCatValue === '__uncategorized__') {
            filteredCats = [''];
        } else if (selectedCatValue) {
            filteredCats = sortedCats.filter(c => c === selectedCatValue);
        }

        let hasResults = false;
        const allTags = [];

        filteredCats.forEach(cat => {
            const tags = grouped[cat].filter(tag => {
                if (!keyword) return true;
                return tag.display.toLowerCase().includes(keyword) || tag.value.toLowerCase().includes(keyword);
            });

            if (tags.length === 0) return;
            hasResults = true;

            tags.forEach(tag => {
                allTags.push(tag);
            });
        });

        allTags.forEach((tag, index) => {
                const item = DOM.div(`padding: 6px 10px; font-size: 12px; color: #e2e8f0; cursor: pointer; border-radius: 4px; transition: all 0.2s ease; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px;`);
                
                if (index > 0) {
                    const divider = DOM.div(`height: 1px; background: rgba(59,130,246,0.15); margin: 4px 0;`);
                    listContainer.appendChild(divider);
                }
                
                let catTag = null;
                if (selectedCatValue === '' && tag.category) {
                    catTag = DOM.div(`background: rgba(59,130,246,0.25); color: #60a5fa; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 500; white-space: nowrap; flex-shrink: 0; transition: all 0.2s ease;`);
                    catTag.textContent = tag.category;
                    item.appendChild(catTag);
                }
                
                const displayText = DOM.span(`overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 0.2s ease;`);
                displayText.textContent = tag.display;
                item.appendChild(displayText);
                
                item.title = tag.value;

                item.onmouseenter = () => {
                    item.style.background = 'rgba(59,130,246,0.15)';
                    displayText.style.color = '#93c5fd';
                    if (catTag) {
                        catTag.style.background = 'rgba(59,130,246,0.35)';
                        catTag.style.color = '#93c5fd';
                    }
                };
                item.onmouseleave = () => {
                    item.style.background = 'transparent';
                    displayText.style.color = '#e2e8f0';
                    if (catTag) {
                        catTag.style.background = 'rgba(59,130,246,0.25)';
                        catTag.style.color = '#60a5fa';
                    }
                };
                item.onclick = () => {
                    const inputEl = tagEditWidget.inputEl;
                    inputEl.value = tag.value;
                    tagEditWidget.value = inputEl.value;
                    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                    panel.remove();
                    showToast($t('tagInserted'), 'info', 1500);
                };

                listContainer.appendChild(item);
            });

        if (!hasResults) {
            const emptyMsg = DOM.div(`text-align: center; color: #64748b; padding: 16px 8px; font-size: 12px;`);
            emptyMsg.textContent = customTags.length === 0 ? $t('noCustomTagsToInsert') : $t('noTagsFound');
            listContainer.appendChild(emptyMsg);
        }
    };

    searchInput.addEventListener('input', renderList);

    renderSidebar();
    renderList();

    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;';
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    const origRemove = panel.remove.bind(panel);
    panel.remove = () => {
        origRemove();
        if (backdrop.parentNode) backdrop.remove();
    };
    backdrop.onclick = () => panel.remove();

    setTimeout(() => { searchInput.focus(); }, 50);
}

function showSettingsDropdown(anchorEl) {
    const existing = document.getElementById('settings-dropdown-panel');
    if (existing) {
        existing.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'settings-dropdown-panel';
    panel.style.cssText = `position: fixed; background: linear-gradient(135deg, #475569 0%, #334155 100%); border: 1px solid rgba(148,163,184,0.3); border-radius: 10px; padding: 14px; width: 320px; color: #e2e8f0; box-shadow: 0 12px 40px rgba(0,0,0,0.5); z-index: 10001; display: flex; flex-direction: column; overflow: hidden; gap: 8px;`;

    const rect = anchorEl.getBoundingClientRect();
    panel.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
    panel.style.left = rect.left + 'px';

    const header = DOM.div(`font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 4px; text-align: center;`);
    header.textContent = $t('nodeSettings');
    panel.appendChild(header);

    const nodeSettings = loadNodeSettings();

    const insertBtnRow = DOM.div(`display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(30,41,59,0.5); border: 1px solid rgba(148,163,184,0.15); border-radius: 8px; transition: all 0.2s ease;`);
    const insertBtnLeft = DOM.div(`display: flex; flex-direction: column; gap: 1px;`);
    const insertBtnLabel = DOM.span(`font-size: 13px; font-weight: 500; color: #e2e8f0;`);
    insertBtnLabel.textContent = $t('showInsertBtn');
    insertBtnLeft.appendChild(insertBtnLabel);
    const insertBtnDesc = DOM.span(`font-size: 11px; color: #64748b;`);
    insertBtnDesc.textContent = $t('showInsertBtnDesc');
    insertBtnLeft.appendChild(insertBtnDesc);
    insertBtnRow.appendChild(insertBtnLeft);
    const insertBtnToggle = createSettingsToggle(nodeSettings.showInsertBtn !== false, (enabled) => {
        nodeSettings.showInsertBtn = enabled;
        saveNodeSettings(nodeSettings);
        applyInputBtnVisibility();
    });
    insertBtnRow.appendChild(insertBtnToggle);
    panel.appendChild(insertBtnRow);

    const inspirationBtnRow = DOM.div(`display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(30,41,59,0.5); border: 1px solid rgba(148,163,184,0.15); border-radius: 8px; transition: all 0.2s ease;`);
    const inspirationBtnLeft = DOM.div(`display: flex; flex-direction: column; gap: 1px;`);
    const inspirationBtnLabel = DOM.span(`font-size: 13px; font-weight: 500; color: #e2e8f0;`);
    inspirationBtnLabel.textContent = $t('showInspirationBtn');
    inspirationBtnLeft.appendChild(inspirationBtnLabel);
    const inspirationBtnDesc = DOM.span(`font-size: 11px; color: #64748b;`);
    inspirationBtnDesc.textContent = $t('showInspirationBtnDesc');
    inspirationBtnLeft.appendChild(inspirationBtnDesc);
    inspirationBtnRow.appendChild(inspirationBtnLeft);
    const inspirationBtnToggle = createSettingsToggle(nodeSettings.showInspirationBtn !== false, (enabled) => {
        nodeSettings.showInspirationBtn = enabled;
        saveNodeSettings(nodeSettings);
        applyInputBtnVisibility();
    });
    inspirationBtnRow.appendChild(inspirationBtnToggle);
    panel.appendChild(inspirationBtnRow);

    const clearBtnRow = DOM.div(`display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(30,41,59,0.5); border: 1px solid rgba(148,163,184,0.15); border-radius: 8px; transition: all 0.2s ease;`);
    const clearBtnLeft = DOM.div(`display: flex; flex-direction: column; gap: 1px;`);
    const clearBtnLabel = DOM.span(`font-size: 13px; font-weight: 500; color: #e2e8f0;`);
    clearBtnLabel.textContent = $t('showClearBtn');
    clearBtnLeft.appendChild(clearBtnLabel);
    const clearBtnDesc = DOM.span(`font-size: 11px; color: #64748b;`);
    clearBtnDesc.textContent = $t('showClearBtnDesc');
    clearBtnLeft.appendChild(clearBtnDesc);
    clearBtnRow.appendChild(clearBtnLeft);
    const clearBtnToggle = createSettingsToggle(nodeSettings.showClearBtn !== false, (enabled) => {
        nodeSettings.showClearBtn = enabled;
        saveNodeSettings(nodeSettings);
        applyInputBtnVisibility();
    });
    clearBtnRow.appendChild(clearBtnToggle);
    panel.appendChild(clearBtnRow);

    const adultRow = DOM.div(`display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: ${adultContentEnabled ? 'rgba(127,29,29,0.3)' : 'rgba(30,41,59,0.5)'}; border: 1px solid ${adultContentEnabled ? 'rgba(239,68,68,0.4)' : 'rgba(148,163,184,0.15)'}; border-radius: 8px; transition: all 0.2s ease;`);

    const adultLeft = DOM.div(`display: flex; flex-direction: column; gap: 2px;`);

    const adultLabel = DOM.span(`font-size: 13px; font-weight: 500; color: ${adultContentEnabled ? '#fca5a5' : '#e2e8f0'};`);
    adultLabel.textContent = $t('adultContentSetting');
    adultLeft.appendChild(adultLabel);

    const adultDesc = DOM.span(`font-size: 11px; color: #64748b;`);
    adultDesc.textContent = $t('adultContentDesc');
    adultLeft.appendChild(adultDesc);

    adultRow.appendChild(adultLeft);

    const adultToggle = DOM.div(`display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 4px 10px; border-radius: 5px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: ${adultContentEnabled ? 'rgba(239,68,68,0.85)' : 'rgba(59,130,246,0.2)'}; border: 1px solid ${adultContentEnabled ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.6)'}; flex-shrink: 0;`);

    const adultToggleText = document.createElement('span');
    adultToggleText.textContent = adultContentEnabled ? $t('adultContentEnabled') : $t('adultContentDisabled');
    adultToggleText.style.cssText = `color: ${adultContentEnabled ? '#ffffff' : '#60a5fa'}; font-size: 11px; font-weight: 500; transition: all 0.3s ease; white-space: nowrap;`;
    adultToggle.appendChild(adultToggleText);
    adultRow.appendChild(adultToggle);

    adultToggle.onclick = () => {
        if (!adultContentEnabled) {
            panel.remove();
            showAdultUnlockDialog(() => {
                initializeCategoryList();
            });
        } else {
            panel.remove();
            showAdultCloseConfirmDialog(() => {
                adultContentEnabled = false;
                adultContentUnlocked = false;
                adultUnlockTimestamp = 0;
                updateWindowAdultStatus();
                saveAdultContentSettings();
                initializeCategoryList();
            });
        }
    };

    adultToggle.onmouseenter = () => {
        adultToggle.style.transform = 'scale(1.02)';
        adultToggle.style.background = adultContentEnabled ? 'rgba(220,38,38,0.95)' : 'rgba(59,130,246,0.35)';
    };
    adultToggle.onmouseleave = () => {
        adultToggle.style.transform = 'scale(1)';
        adultToggle.style.background = adultContentEnabled ? 'rgba(239,68,68,0.85)' : 'rgba(59,130,246,0.2)';
    };

    panel.appendChild(adultRow);

    document.body.appendChild(panel);
}

function createAdultToggleButton() {
    const wrapper = DOM.div(`margin-top: auto; padding: 8px 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; position: relative; border-top: 1px solid rgba(148,163,184,0.2); background: ${adultContentEnabled ? 'linear-gradient(180deg, rgba(127,29,29,0.4) 0%, rgba(69,10,10,0.6) 100%)' : 'linear-gradient(135deg, #2d3748 0%, #1e293b 100%)'}; border: 1px solid ${adultContentEnabled ? 'rgba(239,68,68,0.8)' : 'rgba(100,116,139,0.4)'}; border-radius: 8px; margin: 8px 4px; transition: all 0.3s ease; box-shadow: ${adultContentEnabled ? '0 0 12px rgba(239,68,68,0.35), inset 0 0 16px rgba(239,68,68,0.12)' : '0 2px 8px rgba(0,0,0,0.2)'};`);

    const titleSection = DOM.div(`display: flex; align-items: center; justify-content: center; gap: 2px; padding-bottom: 4px; width: 100%;`);

    const titleIcon = document.createElement('span');
    titleIcon.textContent = '🔞';
    titleIcon.style.cssText = `font-size: 13px; filter: ${adultContentEnabled ? 'grayscale(0%)' : 'grayscale(100%)'}; opacity: ${adultContentEnabled ? '1' : '0.4'}; transition: all 0.3s ease;`;

    const title = document.createElement('span');
    title.textContent = $t('adultContent');
    title.style.cssText = `color: ${adultContentEnabled ? 'rgba(252,165,165,0.9)' : 'rgba(148,163,184,0.7)'}; font-size: 11px; font-weight: 500; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0;`;

    titleSection.appendChild(titleIcon);
    titleSection.appendChild(title);

    const button = DOM.div(`display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 3px 6px; border-radius: 4px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: ${adultContentEnabled ? 'rgba(239,68,68,0.85)' : 'rgba(59,130,246,0.2)'}; border: 1px solid ${adultContentEnabled ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.6)'}; width: fit-content;`);

    const buttonText = document.createElement('span');
    buttonText.textContent = adultContentEnabled ? $t('unlock') : $t('lock');
    buttonText.style.cssText = `color: ${adultContentEnabled ? '#ffffff' : '#60a5fa'}; font-size: 12px; font-weight: 500; transition: all 0.3s ease;`;

    button.appendChild(buttonText);
    wrapper.appendChild(titleSection);
    wrapper.appendChild(button);

    button.onclick = () => {
        if (!adultContentEnabled) {
            showAdultUnlockDialog(() => {
                updateAdultToggleUI(titleIcon, title, button, buttonText, wrapper);
                initializeCategoryList();
            });
        } else {
            showAdultCloseConfirmDialog(() => {
                adultContentEnabled = false;
                adultContentUnlocked = false;
                adultUnlockTimestamp = 0;
                updateWindowAdultStatus();
                saveAdultContentSettings();
                updateAdultToggleUI(titleIcon, title, button, buttonText, wrapper);
                initializeCategoryList();
            });
        }
    };

    button.onmouseenter = () => {
        button.style.transform = 'scale(1.02)';
        button.style.background = adultContentEnabled
            ? 'rgba(220,38,38,0.95)'
            : 'rgba(59,130,246,0.35)';
    };

    button.onmouseleave = () => {
        button.style.transform = 'scale(1)';
        button.style.background = adultContentEnabled
            ? 'rgba(239,68,68,0.85)'
            : 'rgba(59,130,246,0.2)';
    };

    return wrapper;
}

function updateAdultToggleUI(titleIcon, title, button, buttonText, wrapper) {
    titleIcon.style.filter = adultContentEnabled ? 'grayscale(0%)' : 'grayscale(100%)';
    titleIcon.style.opacity = adultContentEnabled ? '1' : '0.4';
    title.style.color = adultContentEnabled ? 'rgba(252,165,165,0.9)' : 'rgba(148,163,184,0.7)';

    buttonText.textContent = adultContentEnabled ? $t('unlock') : $t('lock');
    buttonText.style.color = adultContentEnabled ? '#ffffff' : '#60a5fa';

    button.style.background = adultContentEnabled
        ? 'rgba(239,68,68,0.85)'
        : 'rgba(59,130,246,0.2)';
    button.style.borderColor = adultContentEnabled ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.6)';

    if (wrapper) {
        wrapper.style.background = adultContentEnabled 
            ? 'linear-gradient(180deg, rgba(127,29,29,0.4) 0%, rgba(69,10,10,0.6) 100%)'
            : 'linear-gradient(135deg, #2d3748 0%, #1e293b 100%)';
        wrapper.style.borderColor = adultContentEnabled ? 'rgba(239,68,68,0.8)' : 'rgba(100,116,139,0.4)';
        wrapper.style.boxShadow = adultContentEnabled ? '0 0 12px rgba(239,68,68,0.35), inset 0 0 16px rgba(239,68,68,0.12)' : '0 2px 8px rgba(0,0,0,0.2)';
    }
}

let characterExtractorPanel = null;

async function showCharacterExtractor() {
    await loadExtractorSettings();

    const subCategoryTabs = tagSelectorDialog.subCategoryTabs;
    subCategoryTabs.innerHTML = '';
    subCategoryTabs.style.display = 'none';

    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubCategoryTabs.innerHTML = '';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }

    if (tagSelectorDialog.clearButtonContainer) {
        tagSelectorDialog.clearButtonContainer.style.display = 'flex';
    }
    if (tagSelectorDialog.restoreBtn) {
        tagSelectorDialog.restoreBtn.style.display = 'none';
    }
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.quickRandomBtn) {
        tagSelectorDialog.quickRandomBtn.style.display = 'none';
    }
    if (tagSelectorDialog.clearBtn) {
        tagSelectorDialog.clearBtn.style.display = 'none';
    }
    if (tagSelectorDialog.characterFetchBtn) {
        tagSelectorDialog.characterFetchBtn.style.display = 'block';
    }
    if (tagSelectorDialog.characterAddBtn) {
        tagSelectorDialog.characterAddBtn.style.display = 'none';
    }

    tagSelectorDialog.selectedOverview.classList.add('character-extractor-mode');
    tagSelectorDialog.selectedOverview.dataset.originalDisplay = tagSelectorDialog.selectedOverview.style.display;
    tagSelectorDialog.selectedOverview.dataset.originalOpacity = tagSelectorDialog.selectedOverview.style.opacity || '1';
    tagSelectorDialog.selectedOverview.dataset.originalMinHeight = tagSelectorDialog.selectedOverview.style.minHeight || '';
    
    tagSelectorDialog.selectedOverview.style.position = 'relative';
    tagSelectorDialog.selectedOverview.style.minHeight = '60px';
    tagSelectorDialog.selectedOverview.style.maxHeight = '60px';

    if (tagSelectorDialog.selectedTagsList) {
        tagSelectorDialog.selectedTagsList.style.display = 'none';
    }
    if (tagSelectorDialog.hintText) {
        tagSelectorDialog.hintText.style.display = 'none';
    }
    if (tagSelectorDialog.selectedCount) {
        tagSelectorDialog.selectedCount.style.display = 'none';
    }

    if (!tagSelectorDialog.characterExtractorHint) {
        const hintOverlay = document.createElement('div');
        hintOverlay.className = 'character-extractor-hint-overlay';
        hintOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            background: linear-gradient(135deg, #475569 0%, #334155 100%);
            border-radius: 0;
            z-index: 10;
            padding: 8px 16px;
            gap: 12px;
        `;

        const overviewTitleText = DOM.el('span', `text-align: left; line-height: 1.2; margin-left: 5px; font-weight: 600; color: #e2e8f0;`);
        overviewTitleText.innerHTML = $t('selectedTags');

        const hintText = document.createElement('span');
        hintText.style.cssText = `color: rgb(0, 225, 255); font-size: 14px; font-weight: 400; font-style: normal;`;
        hintText.textContent = $t('characterExtractorHint');

        hintOverlay.appendChild(overviewTitleText);
        hintOverlay.appendChild(hintText);

        tagSelectorDialog.selectedOverview.style.position = 'relative';
        tagSelectorDialog.selectedOverview.appendChild(hintOverlay);
        tagSelectorDialog.characterExtractorHint = hintOverlay;
    } else {
        tagSelectorDialog.characterExtractorHint.style.display = 'flex';
    }

    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    tagContent.style.padding = '0';
    tagContent.style.display = '';
    tagContent.style.flexDirection = '';
    tagContent.style.overflow = '';

    characterExtractorPanel = document.createElement('div');
    characterExtractorPanel.className = 'character-extractor-panel';
    characterExtractorPanel.style.cssText = `
        display: flex;
        flex-direction: column;
        height: 100%;
        background: rgba(15,23,42,0.5);
        border-radius: 0;
        border: none;
        overflow: hidden;
        box-sizing: border-box;
    `;

    const headerSection = document.createElement('div');
    headerSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(59,130,246,0.3);
        background: rgba(37,99,235,0.1);
    `;

    const icon = document.createElement('div');
    icon.innerHTML = '🎭';
    icon.style.cssText = 'font-size: 32px;';

    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = 'flex: 1;';

    const title = document.createElement('div');
    title.style.cssText = 'color: #60a5fa; font-size: 18px; font-weight: 600;';
    title.textContent = $t('characterExtractor');

    const desc = document.createElement('div');
    desc.style.cssText = 'color: #94a3b8; font-size: 12px; margin-top: 4px;';
    desc.textContent = $t('characterExtractorDesc');

    titleContainer.appendChild(title);
    titleContainer.appendChild(desc);

    const creditSection = document.createElement('div');
    creditSection.style.cssText = `
        margin-left: auto;
        padding: 10px 14px;
        background: rgba(59,130,246,0.08);
        border: 1px solid rgba(59,130,246,0.2);
        border-radius: 8px;
        font-size: 13px;
        color: #94a3b8;
        text-align: center;
        line-height: 1.5;
        white-space: nowrap;
    `;
    creditSection.innerHTML = `
        <div>${$t('inspirationSource')}</div>
        <a href="https://github.com/ComfyuiGY/CosplayPromptNode" target="_blank" style="color: #60a5fa; text-decoration: none; font-weight: 500; transition: color 0.2s ease;" onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='#60a5fa'">CosplayPromptNode</a>
        <div style="font-size: 12px;">${$t('thanksToAuthor')}</div>
    `;

    headerSection.appendChild(icon);
    headerSection.appendChild(titleContainer);
    headerSection.appendChild(creditSection);
    characterExtractorPanel.appendChild(headerSection);

    const mainContent = document.createElement('div');
    mainContent.style.cssText = `
        display: flex;
        flex: 1;
        overflow: hidden;
    `;

    const leftPanel = document.createElement('div');
    leftPanel.style.cssText = `
        width: 45%;
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-right: 1px solid rgba(59,130,246,0.2);
        gap: 16px;
        overflow-y: auto;
    `;

    const settingsTitle = document.createElement('div');
    settingsTitle.style.cssText = 'color: #e2e8f0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
    settingsTitle.innerHTML = `<span>⚙️</span> ${$t('extractorSettings')}`;
    leftPanel.appendChild(settingsTitle);

    const form = document.createElement('div');
    form.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

    const createInputRow = (labelKey, inputId, placeholderKey, inputType = 'text', defaultValue = '', tipKey = '') => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
        
        const label = document.createElement('label');
        label.textContent = $t(labelKey);
        label.style.cssText = 'color: #e2e8f0; font-size: 13px; font-weight: 500;';
        row.appendChild(label);
        
        let tipText = null;
        if (tipKey) {
            tipText = document.createElement('div');
            tipText.textContent = $t(tipKey);
            tipText.style.cssText = 'color: #60a5fa; font-size: 12px; line-height: 1.4; font-weight: 500;';
            row.appendChild(tipText);
        }
        
        const input = document.createElement('input');
        input.type = inputType;
        input.id = inputId;
        input.value = defaultValue;
        input.placeholder = $t(placeholderKey);
        input.style.cssText = `
            width: 100%;
            background: rgba(15,23,42,0.3);
            border: 1px solid rgba(59,130,246,0.4);
            border-radius: 8px;
            padding: 10px 14px;
            color: white;
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
            box-sizing: border-box;
            margin-top: 2px;
        `;
        input.addEventListener('focus', () => {
            input.style.borderColor = '#3b82f6';
            input.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.2)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = 'rgba(59,130,246,0.4)';
            input.style.boxShadow = 'none';
            if (inputId === 'character-seed-input') {
                extractorSettings.seed = parseInt(input.value) || -1;
            } else if (inputId === 'character-excluded-input') {
                extractorSettings.excluded = input.value.trim();
            } else if (inputId === 'character-custom-input') {
                extractorSettings.customPrompt = input.value.trim();
            }
            saveExtractorSettings();
        });
        
        row.appendChild(input);
        
        row._label = label;
        row._input = input;
        row._tipText = tipText;
        row._labelKey = labelKey;
        row._placeholderKey = placeholderKey;
        row._tipKey = tipKey;
        
        return row;
    };

    const seedRow = createInputRow('characterSeed', 'character-seed-input', 'characterSeedPlaceholder', 'number', String(extractorSettings.seed), 'characterSeedTip');
    const excludedRow = createInputRow('characterExcluded', 'character-excluded-input', 'characterExcludedPlaceholder', 'text', extractorSettings.excluded, 'characterExcludedTip');
    const customPromptRow = createInputRow('characterCustomPrompt', 'character-custom-input', 'characterCustomPromptPlaceholder', 'text', extractorSettings.customPrompt, 'characterCustomPromptTip');
    
    tagSelectorDialog.characterExtractorSeedRow = seedRow;
    tagSelectorDialog.characterExtractorExcludedRow = excludedRow;
    tagSelectorDialog.characterExtractorCustomRow = customPromptRow;

    form.appendChild(seedRow);
    form.appendChild(excludedRow);
    form.appendChild(customPromptRow);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = $t('resetDefaults') || '恢复默认';
    resetBtn.style.cssText = `
        margin-left: auto;
        padding: 8px 16px;
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 6px;
        color: #60a5fa;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    resetBtn.onmouseenter = () => {
        resetBtn.style.background = 'rgba(59, 130, 246, 0.35)';
        resetBtn.style.borderColor = 'rgba(59, 130, 246, 0.6)';
    };
    resetBtn.onmouseleave = () => {
        resetBtn.style.background = 'rgba(59, 130, 246, 0.2)';
        resetBtn.style.borderColor = 'rgba(59, 130, 246, 0.4)';
    };
    resetBtn.onclick = () => {
        extractorSettings.seed = -1;
        extractorSettings.excluded = '';
        extractorSettings.customPrompt = '';
        saveExtractorSettings();
        const seedInput = document.getElementById('character-seed-input');
        const excludedInput = document.getElementById('character-excluded-input');
        const customInput = document.getElementById('character-custom-input');
        if (seedInput) seedInput.value = '-1';
        if (excludedInput) excludedInput.value = '';
        if (customInput) customInput.value = '';
    };
    const resetBtnContainer = document.createElement('div');
    resetBtnContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
    `;
    resetBtnContainer.appendChild(resetBtn);
    form.appendChild(resetBtnContainer);

    leftPanel.appendChild(form);

    const messageArea = document.createElement('div');
    messageArea.id = 'character-message-area';
    messageArea.style.cssText = `
        margin-top: auto;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        display: none;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
    `;
    leftPanel.appendChild(messageArea);
    tagSelectorDialog.characterMessageArea = messageArea;

    const rightPanel = document.createElement('div');
    rightPanel.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 12px;
        overflow-y: auto;
    `;

    const previewTitle = document.createElement('div');
    previewTitle.style.cssText = 'color: #e2e8f0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
    previewTitle.innerHTML = `<span>📄</span> ${$t('characterResult')}`;
    rightPanel.appendChild(previewTitle);

    const resultContainer = document.createElement('div');
    resultContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
        overflow: hidden;
    `;

    const historySection = document.createElement('div');
    historySection.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 246px;
        flex-shrink: 0;
        padding: 12px;
        background: rgba(15,23,42,0.3);
        border: 1px solid rgba(59,130,246,0.3);
        border-radius: 10px;
    `;

    const historyHeader = document.createElement('div');
    historyHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

    const historyTitle = document.createElement('div');
    historyTitle.style.cssText = 'color: #94a3b8; font-size: 12px; font-weight: 500;';
    historyTitle.textContent = $t('historyTitle');

    const clearAllBtn = document.createElement('button');
    clearAllBtn.textContent = $t('clearAllHistory');
    clearAllBtn.style.cssText = `
        background: #991b1b;
        border: 1px solid #991b1b;
        border-radius: 4px;
        color: #ffffff;
        font-size: 11px;
        font-weight: 500;
        padding: 4px 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        margin-left: auto;
        margin-right: 28px;
    `;
    clearAllBtn.onmouseenter = () => {
        clearAllBtn.style.background = '#b91c1c';
        clearAllBtn.style.borderColor = '#b91c1c';
        clearAllBtn.style.transform = 'scale(1.02)';
    };
    clearAllBtn.onmouseleave = () => {
        clearAllBtn.style.background = '#991b1b';
        clearAllBtn.style.borderColor = '#991b1b';
        clearAllBtn.style.transform = 'scale(1)';
    };
    clearAllBtn.onclick = () => {
        if (tagSelectorDialog.characterHistory && tagSelectorDialog.characterHistory.length > 0) {
            showConfirmDialog($t('confirmClearHistoryTitle'), $t('confirmClearHistoryMessage'), () => {
                tagSelectorDialog.characterHistory = [];
                localStorage.removeItem('zhihui_character_history');
                updateCharacterHistoryList();
            });
        }
    };

    historyHeader.appendChild(historyTitle);
    historyHeader.appendChild(clearAllBtn);
    historySection.appendChild(historyHeader);

    const historyList = document.createElement('div');
    historyList.id = 'history-list';
    historyList.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow-y: auto;
        padding-right: 4px;
        flex: 1;
    `;
    historySection.appendChild(historyList);

    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        padding: 14px;
        background: rgba(15,23,42,0.3);
        border: 1px solid rgba(59,130,246,0.3);
        border-radius: 10px;
        overflow-y: auto;
    `;

    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #64748b;
        font-size: 14px;
        gap: 12px;
    `;
    emptyState.innerHTML = `
        <div style="font-size: 48px; opacity: 0.3;">📋</div>
        <div>${$t('characterEmptyState')}</div>
    `;

    const resultText = document.createElement('div');
    resultText.id = 'result-text';
    resultText.style.cssText = `
        color: #e2e8f0;
        font-size: 14px;
        line-height: 1.6;
        word-break: break-all;
        white-space: pre-wrap;
        display: none;
    `;

    resultArea.appendChild(emptyState);
    resultArea.appendChild(resultText);
    resultContainer.appendChild(historySection);
    resultContainer.appendChild(resultArea);
    rightPanel.appendChild(resultContainer);

    mainContent.appendChild(leftPanel);
    mainContent.appendChild(rightPanel);
    characterExtractorPanel.appendChild(mainContent);

    tagSelectorDialog.characterResultArea = resultArea;
    tagSelectorDialog.characterResultText = resultText;
    tagSelectorDialog.characterEmptyState = emptyState;
    tagSelectorDialog.characterResultContainer = resultContainer;
    tagSelectorDialog.characterHistoryList = historyList;
    tagSelectorDialog.characterExtractorTitle = title;
    tagSelectorDialog.characterExtractorDesc = desc;
    tagSelectorDialog.characterExtractorSettingsTitle = settingsTitle;
    tagSelectorDialog.characterExtractorPreviewTitle = previewTitle;
    tagSelectorDialog.characterExtractorHistoryTitle = historyTitle;
    tagSelectorDialog.characterExtractorClearAllBtn = clearAllBtn;
    tagSelectorDialog.characterExtractorResetBtn = resetBtn;
    
    if (!tagSelectorDialog.characterHistory) {
        const savedHistory = localStorage.getItem('zhihui_character_history');
        if (savedHistory) {
            try {
                tagSelectorDialog.characterHistory = JSON.parse(savedHistory);
            } catch (e) {
                tagSelectorDialog.characterHistory = [];
            }
        } else {
            tagSelectorDialog.characterHistory = [];
        }
    }

    tagContent.appendChild(characterExtractorPanel);

    setTimeout(() => {
        updateCharacterHistoryList();
    }, 0);
}

function updateCharacterHistoryList() {
    if (!tagSelectorDialog.characterHistoryList) return;
    
    const historyList = tagSelectorDialog.characterHistoryList;
    historyList.innerHTML = '';
    
    if (!tagSelectorDialog.characterHistory || tagSelectorDialog.characterHistory.length === 0) {
        historyList.style.display = 'none';
        return;
    }
    
    historyList.style.display = 'flex';
    
    tagSelectorDialog.characterHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.style.cssText = `
            padding: 8px 12px;
            background: rgba(59,130,246,0.1);
            border: 1px solid rgba(59,130,246,0.2);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        const timeLabel = document.createElement('span');
        timeLabel.style.cssText = 'color: #60a5fa; font-size: 11px; font-weight: 500; min-width: 50px;';
        timeLabel.textContent = item.timestamp;

        const promptPreview = document.createElement('span');
        promptPreview.style.cssText = 'color: #94a3b8; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;';
        promptPreview.textContent = item.prompt.substring(0, 50) + (item.prompt.length > 50 ? '...' : '');

        const saveBtnContainer = document.createElement('div');
        saveBtnContainer.style.cssText = 'position: relative; display: inline-block;';

        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '💾';
        saveBtn.style.cssText = `
            background: rgba(34,197,94,0.2);
            border: 1px solid rgba(34,197,94,0.4);
            border-radius: 6px;
            color: #22c55e;
            font-size: 12px;
            width: 24px;
            height: 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        `;

        const tooltip = document.createElement('div');
        tooltip.textContent = $t('saveToCustom');
        tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: #e2e8f0;
            font-size: 12px;
            font-weight: 500;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid rgba(59,130,246,0.4);
            box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 99999;
            visibility: hidden;
        `;

        const tooltipArrow = document.createElement('div');
        tooltipArrow.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid rgba(59,130,246,0.4);
        `;
        tooltip.appendChild(tooltipArrow);

        document.body.appendChild(tooltip);

        const updateTooltipPosition = () => {
            const rect = saveBtn.getBoundingClientRect();
            const tooltipHeight = tooltip.offsetHeight;
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - tooltipHeight - 8}px`;
            tooltip.style.transform = 'translateX(-50%)';
        };

        saveBtnContainer.appendChild(saveBtn);

        let tooltipTimeout = null;

        saveBtn.onmouseenter = () => {
            saveBtn.style.background = 'rgba(34,197,94,0.4)';
            saveBtn.style.borderColor = 'rgba(34,197,94,0.6)';
            tooltipTimeout = setTimeout(() => {
                updateTooltipPosition();
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            }, 800);
        };
        saveBtn.onmouseleave = () => {
            saveBtn.style.background = 'rgba(34,197,94,0.2)';
            saveBtn.style.borderColor = 'rgba(34,197,94,0.4)';
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.style.opacity === '0') {
                    tooltip.style.visibility = 'hidden';
                }
            }, 200);
        };
        saveBtn.onclick = (e) => {
            e.stopPropagation();
            showSaveToCustomDialog(item.prompt);
        };

        const deleteBtnContainer = document.createElement('div');
        deleteBtnContainer.style.cssText = 'position: relative; display: inline-block;';

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.cssText = `
            background: rgba(239,68,68,0.2);
            border: 1px solid rgba(239,68,68,0.4);
            border-radius: 6px;
            color: #ef4444;
            font-size: 13px;
            width: 24px;
            height: 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        `;

        const deleteTooltip = document.createElement('div');
        deleteTooltip.textContent = $t('delete');
        deleteTooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: #e2e8f0;
            font-size: 12px;
            font-weight: 500;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid rgba(59,130,246,0.4);
            box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 99999;
            visibility: hidden;
        `;

        const deleteTooltipArrow = document.createElement('div');
        deleteTooltipArrow.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid rgba(59,130,246,0.4);
        `;
        deleteTooltip.appendChild(deleteTooltipArrow);
        document.body.appendChild(deleteTooltip);

        const updateDeleteTooltipPosition = () => {
            const rect = deleteBtn.getBoundingClientRect();
            const tooltipHeight = deleteTooltip.offsetHeight;
            deleteTooltip.style.left = `${rect.left + rect.width / 2}px`;
            deleteTooltip.style.top = `${rect.top - tooltipHeight - 8}px`;
            deleteTooltip.style.transform = 'translateX(-50%)';
        };

        deleteBtnContainer.appendChild(deleteBtn);

        let deleteTooltipTimeout = null;

        deleteBtn.onmouseenter = () => {
            deleteBtn.style.background = 'rgba(239,68,68,0.4)';
            deleteBtn.style.borderColor = 'rgba(239,68,68,0.6)';
            deleteTooltipTimeout = setTimeout(() => {
                updateDeleteTooltipPosition();
                deleteTooltip.style.visibility = 'visible';
                deleteTooltip.style.opacity = '1';
            }, 800);
        };
        deleteBtn.onmouseleave = () => {
            deleteBtn.style.background = 'rgba(239,68,68,0.2)';
            deleteBtn.style.borderColor = 'rgba(239,68,68,0.4)';
            if (deleteTooltipTimeout) {
                clearTimeout(deleteTooltipTimeout);
                deleteTooltipTimeout = null;
            }
            deleteTooltip.style.opacity = '0';
            setTimeout(() => {
                if (deleteTooltip.style.opacity === '0') {
                    deleteTooltip.style.visibility = 'hidden';
                }
            }, 200);
        };
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (deleteTooltipTimeout) {
                clearTimeout(deleteTooltipTimeout);
                deleteTooltipTimeout = null;
            }
            deleteTooltip.style.opacity = '0';
            deleteTooltip.style.visibility = 'hidden';
            tagSelectorDialog.characterHistory.splice(index, 1);
            localStorage.setItem('zhihui_character_history', JSON.stringify(tagSelectorDialog.characterHistory));
            updateCharacterHistoryList();
        };

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display: flex; gap: 4px; flex-shrink: 0;';
        btnContainer.appendChild(saveBtnContainer);
        btnContainer.appendChild(deleteBtnContainer);

        historyItem.appendChild(timeLabel);
        historyItem.appendChild(promptPreview);
        historyItem.appendChild(btnContainer);

        historyItem.onmouseenter = () => {
            historyItem.style.background = 'rgba(59,130,246,0.2)';
            historyItem.style.borderColor = 'rgba(59,130,246,0.4)';
        };

        historyItem.onmouseleave = () => {
            if (tagSelectorDialog.lastFetchedPrompt === item.prompt) {
                historyItem.style.borderColor = '#3b82f6';
                historyItem.style.background = 'rgba(59,130,246,0.25)';
            } else {
                historyItem.style.background = 'rgba(59,130,246,0.1)';
                historyItem.style.borderColor = 'rgba(59,130,246,0.2)';
            }
        };

        historyItem.onclick = () => {
            tagSelectorDialog.lastFetchedPrompt = item.prompt;
            if (tagSelectorDialog.characterResultText) {
                tagSelectorDialog.characterResultText.textContent = item.prompt;
                tagSelectorDialog.characterResultText.style.display = 'block';
            }
            if (tagSelectorDialog.characterEmptyState) {
                tagSelectorDialog.characterEmptyState.style.display = 'none';
            }

            historyList.querySelectorAll('div').forEach(el => {
                el.style.borderColor = 'rgba(59,130,246,0.2)';
                el.style.background = 'rgba(59,130,246,0.1)';
            });
            historyItem.style.borderColor = '#3b82f6';
            historyItem.style.background = 'rgba(59,130,246,0.25)';
        };

        if (tagSelectorDialog.lastFetchedPrompt === item.prompt) {
            historyItem.style.borderColor = '#3b82f6';
            historyItem.style.background = 'rgba(59,130,246,0.25)';
        }

        historyList.appendChild(historyItem);
    });
}

function restoreSelectedTagsOverview() {
    if (tagSelectorDialog.selectedOverview && tagSelectorDialog.selectedOverview.classList.contains('character-extractor-mode')) {
        tagSelectorDialog.selectedOverview.classList.remove('character-extractor-mode');
        tagSelectorDialog.selectedOverview.style.opacity = tagSelectorDialog.selectedOverview.dataset.originalOpacity || '1';
        tagSelectorDialog.selectedOverview.style.maxHeight = '';
        tagSelectorDialog.selectedOverview.style.minHeight = tagSelectorDialog.selectedOverview.dataset.originalMinHeight || '60px';
        
        if (tagSelectorDialog.characterExtractorHint) {
            tagSelectorDialog.characterExtractorHint.style.display = 'none';
        }
        if (tagSelectorDialog.characterFetchBtn) {
            tagSelectorDialog.characterFetchBtn.style.display = 'none';
        }
        if (tagSelectorDialog.characterAddBtn) {
            tagSelectorDialog.characterAddBtn.style.display = 'none';
        }
        if (tagSelectorDialog.clearBtn) {
            tagSelectorDialog.clearBtn.style.display = 'block';
        }
        if (tagSelectorDialog.tagContent) {
            tagSelectorDialog.tagContent.style.padding = '10px 10px';
        }
        if (tagSelectorDialog.subCategoryTabs) {
            tagSelectorDialog.subCategoryTabs.style.display = 'flex';
        }

        if (tagSelectorDialog.hintText) {
            if (selectedTags.size > 0) {
                tagSelectorDialog.hintText.style.display = 'none';
                if (tagSelectorDialog.selectedCount) {
                    tagSelectorDialog.selectedCount.style.display = 'inline-block';
                }
                if (tagSelectorDialog.selectedTagsList) {
                    tagSelectorDialog.selectedTagsList.style.display = 'flex';
                }
            } else {
                tagSelectorDialog.hintText.style.display = 'inline-block';
            }
        }
    }
}

function initializeCategoryList() {
    loadAdultContentSettings();
    
    const categoryList = tagSelectorDialog.categoryList;
    categoryList.innerHTML = '';
    
    const categoriesContainer = DOM.div(`display: flex; flex-direction: column; height: 100%;`);

    const scrollContainer = DOM.div(`flex: 1; overflow-y: auto;`);
    tagSelectorDialog.categoryScrollContainer = scrollContainer;
    
    let allCategories = [...Object.keys(tagsData), '随机标签', '角色提取器'];
    
    if (!adultContentEnabled) {
        allCategories = allCategories.filter(cat => cat !== '涩影湿' && cat !== '角色提取器');
    }
    
    const customOrder = ['常规标签', '艺术题材', '人物类', '动物生物', '场景类', '涩影湿', '随机标签', '灵感套装', '自定义', '角色提取器'];
    allCategories.sort((a, b) => {
        const aIndex = customOrder.indexOf(a);
        const bIndex = customOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    allCategories.forEach((category, index) => {
        const categoryItem = document.createElement('div');
        categoryItem.style.cssText = `padding: 12px 16px; color: #ccc; cursor: pointer; border-bottom: 1px solid rgb(112, 130, 155); transition: all 0.2s; text-align: center; background: transparent; display: flex; align-items: center; justify-content: center;`;
        categoryItem.textContent = $tc(category);
        categoryItem.dataset.originalName = category;
        categoryItem.onmouseenter = () => {
            if (!categoryItem.classList.contains('active')) {
                categoryItem.style.backgroundColor = 'rgb(49, 84, 136)';
                categoryItem.style.color = '#fff';
            }
        };
        categoryItem.onmouseleave = () => {
            if (!categoryItem.classList.contains('active')) {
                categoryItem.style.backgroundColor = 'transparent'; 
                categoryItem.style.boxShadow = 'none';
                categoryItem.style.color = '#ccc';
            }
        };

        categoryItem.onclick = () => {
            scrollContainer.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderRight = 'none';
            });

            categoryItem.classList.add('active');
            categoryItem.style.backgroundColor = '#1d4ed8';
            categoryItem.style.color = '#fff';

            tagSelectorDialog.activeCategory = category;
            tagSelectorDialog.activeSubCategory = null;
            tagSelectorDialog.activeSubSubCategory = null;
            tagSelectorDialog.activeSubSubSubCategory = null;

            saveViewState();

            if (category === '随机标签') {
                restoreSelectedTagsOverview();
                if (window.openRandomGeneratorDialog) {
                    window.openRandomGeneratorDialog(tagSelectorDialog);
                }
            } else if (category === '角色提取器') {
                showCharacterExtractor();
            } else {
                showSubCategories(category);
            }
        };

        scrollContainer.appendChild(categoryItem);
    });

    categoriesContainer.appendChild(scrollContainer);

    const settingsBtn = DOM.div(`margin-top: auto; height: 36px; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; background: linear-gradient(135deg, #475569 0%, #334155 100%); border: 1px solid rgba(148,163,184,0.3); border-radius: 8px; margin: 8px auto; padding: 0 10px; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.2);`);

    const settingsBtnIcon = document.createElement('span');
    settingsBtnIcon.textContent = '⚙️';
    settingsBtnIcon.style.cssText = `font-size: 16px;`;
    settingsBtn.appendChild(settingsBtnIcon);

    const settingsBtnText = document.createElement('span');
    settingsBtnText.textContent = $t('settings');
    settingsBtnText.style.cssText = `color: #cbd5e1; font-size: 12px; font-weight: 500;`;
    settingsBtn.appendChild(settingsBtnText);

    settingsBtn.onmouseenter = () => {
        settingsBtn.style.background = 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
        settingsBtn.style.borderColor = 'rgba(148,163,184,0.5)';
    };
    settingsBtn.onmouseleave = () => {
        settingsBtn.style.background = 'linear-gradient(135deg, #475569 0%, #334155 100%)';
        settingsBtn.style.borderColor = 'rgba(148,163,184,0.3)';
    };
    settingsBtn.onclick = () => {
        const existing = document.getElementById('settings-dropdown-panel');
        if (existing) {
            existing.remove();
        } else {
            showSettingsDropdown(settingsBtn);
        }
    };

    categoriesContainer.appendChild(settingsBtn);

    categoryList.appendChild(categoriesContainer);

    updateCategoryRedDots();

    restoreViewState();
}

function restoreViewState() {
    const scrollContainer = tagSelectorDialog.categoryScrollContainer;
    if (!scrollContainer) return;

    const savedState = loadViewState();
    if (!savedState || !savedState.activeCategory) {
        const firstCategory = scrollContainer.querySelector('div[data-original-name]');
        if (firstCategory) {
            setTimeout(() => firstCategory.click(), 0);
        }
        return;
    }

    const categoryItems = scrollContainer.querySelectorAll('div[data-original-name]');
    let targetCategoryItem = null;
    categoryItems.forEach(item => {
        if (item.dataset.originalName === savedState.activeCategory) {
            targetCategoryItem = item;
        }
    });

    if (!targetCategoryItem) {
        const firstCategory = categoryItems[0];
        if (firstCategory) {
            setTimeout(() => firstCategory.click(), 0);
        }
        return;
    }

    tagSelectorDialog.activeCategory = savedState.activeCategory;
    tagSelectorDialog.activeSubCategory = savedState.activeSubCategory;
    tagSelectorDialog.activeSubSubCategory = savedState.activeSubSubCategory;
    tagSelectorDialog.activeSubSubSubCategory = savedState.activeSubSubSubCategory;

    categoryItems.forEach(item => {
        item.classList.remove('active');
        item.style.backgroundColor = 'transparent';
        item.style.color = '#ccc';
        item.style.borderTop = 'none';
        item.style.borderLeft = 'none';
        item.style.borderRight = 'none';
    });

    targetCategoryItem.classList.add('active');
    targetCategoryItem.style.backgroundColor = '#1d4ed8';
    targetCategoryItem.style.color = '#fff';

    const category = savedState.activeCategory;
    if (category === '随机标签') {
        restoreSelectedTagsOverview();
        if (window.openRandomGeneratorDialog) {
            window.openRandomGeneratorDialog(tagSelectorDialog);
        }
    } else if (category === '角色提取器') {
        showCharacterExtractor();
    } else {
        restoreSubCategories(category, savedState);
    }
}

function restoreSubCategories(category, savedState) {
    restoreSelectedTagsOverview();

    const subCategoryTabs = tagSelectorDialog.subCategoryTabs;
    subCategoryTabs.innerHTML = '';

    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubCategoryTabs.innerHTML = '';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }

    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }

    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }

    if (tagSelectorDialog.quickRandomBtn) {
        tagSelectorDialog.quickRandomBtn.style.display = 'none';
    }

    const subCategories = tagsData[category];
    let subCategoryKeys = Object.keys(subCategories);
    if (category === '自定义' && !subCategoryKeys.includes('标签管理')) {
        subCategoryKeys = [...subCategoryKeys, '标签管理'];
    }
    if (category === '灵感套装' && !adultContentEnabled) {
        subCategoryKeys = subCategoryKeys.filter(cat => cat !== '成人题材');
    }

    let targetSubCategoryTab = null;

    subCategoryKeys.forEach((subCategory, index) => {
























































































































































































































































































































































































































































































































































































































        const tab = document.createElement('div');
        tab.style.cssText = `padding: 10px 16px; color: #ccc; cursor: pointer; border-right: 1px solid rgb(112, 130, 155); white-space: normal; word-break: break-word; overflow-wrap: anywhere; transition: background-color 0.2s; min-width: 80px; text-align: center; display: flex; align-items: center; justify-content: center;`;
        tab.textContent = $tc(subCategory);

        tab.onmouseenter = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'rgb(49, 84, 136)';
                tab.style.color = '#fff';
            }
        };
        tab.onmouseleave = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'transparent';
                tab.style.boxShadow = 'none';
                tab.style.color = '#ccc';
            }
        };

        tab.onclick = () => {
            subCategoryTabs.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderBottom = 'none';
                item.style.borderRight = '1px solid rgb(112, 130, 155)';
            });

            tab.classList.add('active');
            tab.style.backgroundColor = '#3b82f6';
            tab.style.color = '#fff';

            tagSelectorDialog.activeSubCategory = subCategory;
            tagSelectorDialog.activeSubSubCategory = null;
            tagSelectorDialog.activeSubSubSubCategory = null;

            saveViewState();

            if (category === '自定义' && subCategory === '标签管理') {
                showCustomTagManagement();
            } else {
                const subCategoryData = tagsData[category][subCategory];

                if (category === '自定义') {
                    showTags(category, subCategory);
                } else if (Array.isArray(subCategoryData)) {
                    showTags(category, subCategory);
                } else {
                    showSubSubCategories(category, subCategory);
                }
            }
        };

        subCategoryTabs.appendChild(tab);

        if (savedState.activeSubCategory && subCategory === savedState.activeSubCategory) {
            targetSubCategoryTab = tab;
        }
    });

    if (targetSubCategoryTab) {
        targetSubCategoryTab.click();
    } else if (subCategoryKeys.length > 0) {
        const firstTab = subCategoryTabs.querySelector('div');
        if (firstTab) {
            firstTab.click();
        }
    }

    updateCategoryRedDots();
}

function showSubCategories(category) {
    restoreSelectedTagsOverview();
    
    const subCategoryTabs = tagSelectorDialog.subCategoryTabs;
    subCategoryTabs.innerHTML = '';

    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubCategoryTabs.innerHTML = '';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }
    
    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }
    
    if (tagSelectorDialog.quickRandomBtn) {
        tagSelectorDialog.quickRandomBtn.style.display = 'none';
    }
    const subCategories = tagsData[category];
    
    let subCategoryKeys = Object.keys(subCategories);
    if (category === '自定义' && !subCategoryKeys.includes('标签管理')) {
        subCategoryKeys = [...subCategoryKeys, '标签管理'];
    }
    if (category === '灵感套装' && !adultContentEnabled) {
        subCategoryKeys = subCategoryKeys.filter(cat => cat !== '成人题材');
    }
    
    subCategoryKeys.forEach((subCategory, index) => {
        const tab = document.createElement('div');
        tab.style.cssText = `padding: 10px 16px; color: #ccc; cursor: pointer; border-right: 1px solid rgb(112, 130, 155); white-space: normal; word-break: break-word; overflow-wrap: anywhere; transition: background-color 0.2s; min-width: 80px; text-align: center;`;
        tab.textContent = $tc(subCategory);

        tab.onmouseenter = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'rgb(49, 84, 136)';
                tab.style.color = '#fff';
            }
        };
        tab.onmouseleave = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'transparent';
                tab.style.boxShadow = 'none';
                tab.style.color = '#ccc';
            }
        };

        tab.onclick = () => {

            subCategoryTabs.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderBottom = 'none';
                item.style.borderRight = '1px solid rgb(112, 130, 155)';
            });

            tab.classList.add('active');
            tab.style.backgroundColor = '#3b82f6';
            tab.style.color = '#fff';

            tagSelectorDialog.activeSubCategory = subCategory;
            tagSelectorDialog.activeSubSubCategory = null;
            tagSelectorDialog.activeSubSubSubCategory = null;

            saveViewState();

            if (category === '自定义' && subCategory === '标签管理') {
                showCustomTagManagement();
            } else {
                const subCategoryData = tagsData[category][subCategory];

                if (category === '自定义') {
                    showTags(category, subCategory);
                } else if (Array.isArray(subCategoryData)) {
                    showTags(category, subCategory);
                } else {
                    showSubSubCategories(category, subCategory);
                }
            }
        };

        subCategoryTabs.appendChild(tab);

        if (index === 0) {
            tab.click();
        }
    });
    
    updateCategoryRedDots();
}

function showSubSubCategories(category, subCategory) {
    if (tagSelectorDialog.selectedTagsList && tagSelectorDialog.hintText && tagSelectorDialog.selectedCount) {
        tagSelectorDialog.hintText.textContent = $t('noTagsSelected');
        if (selectedTags.size > 0) {
            tagSelectorDialog.hintText.style.display = 'none';
            tagSelectorDialog.selectedCount.style.display = 'inline-block';
            tagSelectorDialog.selectedTagsList.style.display = 'flex';
        } else {
            tagSelectorDialog.hintText.style.display = 'inline-block';
            tagSelectorDialog.selectedCount.style.display = 'none';
            tagSelectorDialog.selectedTagsList.style.display = 'none';
        }
    }

    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    subSubCategoryTabs.innerHTML = '';
    subSubCategoryTabs.style.display = 'flex';

    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }

    const subSubCategories = tagsData[category][subCategory];
    Object.keys(subSubCategories).forEach((subSubCategory, index) => {
        const tab = document.createElement('div');
        tab.style.cssText = `padding: 8px 12px; color: #ccc; cursor: pointer; border-right: 1px solid rgb(112, 130, 155); white-space: normal; word-break: break-word; overflow-wrap: anywhere; transition: background-color 0.2s; min-width: 60px; text-align: center; font-size: 13px; display: flex; align-items: center; justify-content: center;`;
        tab.textContent = $tc(subSubCategory);

        tab.onmouseenter = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'rgb(49, 84, 136)';
                tab.style.color = '#fff';
            }
        };
        tab.onmouseleave = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'transparent';
                tab.style.boxShadow = 'none';
                tab.style.color = '#ccc';
            }
        };

        tab.onclick = () => {

            subSubCategoryTabs.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderBottom = 'none';
            });

            tab.classList.add('active');
            tab.style.backgroundColor = '#3b82f6';
            tab.style.color = '#fff';

            tagSelectorDialog.activeSubSubCategory = subSubCategory;
            tagSelectorDialog.activeSubSubSubCategory = null;

            saveViewState();

            const subSubCategoryData = tagsData[category][subCategory][subSubCategory];
            if (Array.isArray(subSubCategoryData)) {

                if (tagSelectorDialog.subSubSubCategoryTabs) {
                    tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
                    tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
                }
                showTagsFromSubSub(category, subCategory, subSubCategory);
            } else {

                showSubSubSubCategories(category, subCategory, subSubCategory);
            }
        };

        subSubCategoryTabs.appendChild(tab);

        if (index === 0) {
            tab.click();
        }
    });
    
    updateCategoryRedDots();
}

function showSubSubSubCategories(category, subCategory, subSubCategory) {
    const el = tagSelectorDialog.subSubSubCategoryTabs;
    if (!el) return;

    el.innerHTML = '';
    el.style.display = 'flex';

    const map = tagsData?.[category]?.[subCategory]?.[subSubCategory];
    if (!map) {
        el.style.display = 'none';
        return;
    }

    if (Array.isArray(map)) {
        el.style.display = 'none';
        showTagsFromSubSub(category, subCategory, subSubCategory);
        return;
    }

    Object.keys(map).forEach((name, index) => {
        const tab = document.createElement('div');
        tab.style.cssText = `padding: 6px 10px; color: #ccc; cursor: pointer; border-right: 1px solid rgb(112, 130, 155); white-space: normal; word-break: break-word; overflow-wrap: anywhere; transition: background-color 0.2s; min-width: 50px; text-align: center; font-size: 12px; display: flex; align-items: center; justify-content: center;`;
        tab.textContent = $tc(name);

        tab.onmouseenter = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'rgb(49, 84, 136)';
                tab.style.color = '#fff';
            }
        };
        tab.onmouseleave = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'transparent';
                tab.style.boxShadow = 'none';
                tab.style.color = '#ccc';
            }
        };

        tab.onclick = () => {
            el.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderBottom = 'none';
            });
            tab.classList.add('active');
            tab.style.backgroundColor = '#3b82f6';
            tab.style.color = '#fff';

            tagSelectorDialog.activeSubSubSubCategory = name;

            saveViewState();

            showTagsFromSubSubSub(category, subCategory, subSubCategory, name);
        };

        el.appendChild(tab);
        if (index === 0) tab.click();
    });
    
    updateCategoryRedDots();
}

function createTagContainer() {
    const tagContainer = document.createElement('div');

    applyStyles(tagContainer, {
        display: 'inline-block',
        position: 'relative',
        margin: '4px',
        maxWidth: '320px'
    });
    return tagContainer;
}

function createTagElement(display, value, isSelected) {
    const tagElement = document.createElement('span');

    applyStyles(tagElement, {
        ...commonStyles.tag.base,
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '14px',
        position: 'relative',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '200px'
    });

    const translatedDisplay = $tag(display, value);
    const displayText = translatedDisplay.length > 20 ? translatedDisplay.substring(0, 20) + '...' : translatedDisplay;
    tagElement.textContent = displayText;
    tagElement.dataset.value = value;
    tagElement.dataset.originalDisplay = display;

    if (isSelected) {
        tagElement.style.backgroundColor = '#22c55e';
        tagElement.style.color = '#fff';
    }

    return tagElement;
}

function createTooltip(text) {
    const tooltip = document.createElement('div');

    applyStyles(tooltip, {
        ...commonStyles.tooltip.base,
        padding: '8px 12px',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        zIndex: '10000',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateY(-100%) translateY(-8px)',
        maxWidth: '300px',
        wordWrap: 'break-word',
        lineHeight: '1.4'
    });
    tooltip.textContent = text;
    return tooltip;
}

function refreshAllTagDisplays() {
    if (!tagSelectorDialog || !tagSelectorDialog.tagContent) return;
    
    if (tagSelectorDialog.titleElement) {
        tagSelectorDialog.titleElement.innerHTML = $t('tagSelectorTitle');
    }
    
    if (tagSelectorDialog.searchInput) {
        tagSelectorDialog.searchInput.placeholder = $t('searchPlaceholder');
    }
    
    if (tagSelectorDialog.quickRandomBtn) {
        tagSelectorDialog.quickRandomBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('quickRandom')}</span>`;
    }
    
    if (tagSelectorDialog.restoreBtn) {
        tagSelectorDialog.restoreBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('restoreSelection')}</span>`;
    }
    
    if (tagSelectorDialog.clearBtn) {
        tagSelectorDialog.clearBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('clearSelection')}</span>`;
    }
    
    if (tagSelectorDialog.characterFetchBtn) {
        tagSelectorDialog.characterFetchBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('characterFetchBtn')}</span>`;
    }

    if (tagSelectorDialog.overviewTitleText) {
        tagSelectorDialog.overviewTitleText.innerHTML = $t('selectedTags');
    }

    if (tagSelectorDialog.hintText) {
        tagSelectorDialog.hintText.textContent = $t('noTagsSelected');
    }
    
    if (tagSelectorDialog.characterExtractorHint) {
        const spans = tagSelectorDialog.characterExtractorHint.querySelectorAll('span');
        if (spans.length >= 2) {
            spans[0].innerHTML = $t('selectedTags');
            spans[1].textContent = $t('characterExtractorHint');
        }
    }
    
    if (tagSelectorDialog.characterExtractorTitle) {
        tagSelectorDialog.characterExtractorTitle.textContent = $t('characterExtractor');
    }
    if (tagSelectorDialog.characterExtractorDesc) {
        tagSelectorDialog.characterExtractorDesc.textContent = $t('characterExtractorDesc');
    }
    if (tagSelectorDialog.characterExtractorSettingsTitle) {
        tagSelectorDialog.characterExtractorSettingsTitle.innerHTML = `<span>⚙️</span> ${$t('extractorSettings')}`;
    }
    if (tagSelectorDialog.characterExtractorPreviewTitle) {
        tagSelectorDialog.characterExtractorPreviewTitle.innerHTML = `<span>📄</span> ${$t('characterResult')}`;
    }
    if (tagSelectorDialog.characterExtractorHistoryTitle) {
        tagSelectorDialog.characterExtractorHistoryTitle.textContent = $t('historyTitle');
    }
    if (tagSelectorDialog.characterExtractorClearAllBtn) {
        tagSelectorDialog.characterExtractorClearAllBtn.textContent = $t('clearAllHistory');
    }
    if (tagSelectorDialog.characterExtractorResetBtn) {
        tagSelectorDialog.characterExtractorResetBtn.textContent = $t('resetDefaults');
    }
    if (tagSelectorDialog.characterEmptyState) {
        const emptyStateDiv = tagSelectorDialog.characterEmptyState.querySelector('div:last-child');
        if (emptyStateDiv) emptyStateDiv.textContent = $t('characterEmptyState');
    }
    
    const inputRows = [
        tagSelectorDialog.characterExtractorSeedRow,
        tagSelectorDialog.characterExtractorExcludedRow,
        tagSelectorDialog.characterExtractorCustomRow
    ];
    inputRows.forEach(row => {
        if (row && row._label) row._label.textContent = $t(row._labelKey);
        if (row && row._input) row._input.placeholder = $t(row._placeholderKey);
        if (row && row._tipText && row._tipKey) row._tipText.textContent = $t(row._tipKey);
    });
    
    const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span[data-original-display]');
    tagElements.forEach(tagElement => {
        const originalDisplay = tagElement.dataset.originalDisplay;
        const value = tagElement.dataset.value;
        if (originalDisplay && value) {
            const translatedDisplay = $tag(originalDisplay, value);
            const displayText = translatedDisplay.length > CONFIG.MAX_TAG_DISPLAY_LENGTH ? translatedDisplay.substring(0, CONFIG.MAX_TAG_DISPLAY_LENGTH) + '...' : translatedDisplay;
            tagElement.textContent = displayText;
        }
    });

    if (tagSelectorDialog.selectedTagsList) {
        const selectedTagElements = tagSelectorDialog.selectedTagsList.querySelectorAll('span[data-original-display]');
        selectedTagElements.forEach(tagElement => {
            const originalDisplay = tagElement.dataset.originalDisplay;
            const value = tagElement.dataset.value;
            if (originalDisplay && value) {
                const translatedDisplay = $tag(originalDisplay, value);
                const displayText = translatedDisplay.length > CONFIG.MAX_TAG_DISPLAY_LENGTH ? translatedDisplay.substring(0, CONFIG.MAX_TAG_DISPLAY_LENGTH) + '...' : translatedDisplay;
                tagElement.textContent = displayText;
            }
        });
    }
}

function createCustomTagTooltip(tagValue, tagName, tagObj) {
    const tooltip = document.createElement('div');
    
    applyStyles(tooltip, {
        ...commonStyles.tooltip.base,
        padding: '12px',
        fontSize: '12px',
        zIndex: '10000',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateY(-100%) translateY(-8px)',
        minWidth: '320px',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px'
    });
    
    const mainContainer = DOM.div(`width: 100%; display: flex; flex-direction: row; gap: 12px; align-items: flex-start;`);
    
    const contentDiv = DOM.div(`flex: 1; text-align: left; word-wrap: break-word; line-height: 1.4; color: #e2e8f0; background: transparent; padding: 0px; border-radius: 0px; border: none; font-size: 12px; max-height: 200px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 10; -webkit-box-orient: vertical;`);

    contentDiv.textContent = tagValue;
    const previewContainer = DOM.div(`flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 8px;`);
    
    const previewDiv = DOM.div(`border-radius: 0px; overflow: hidden; flex-shrink: 0; border: none; box-shadow: none; display: flex; align-items: center; justify-content: center; min-width: 140px; min-height: 140px; background: transparent; position: relative; transition: all 0.3s ease;`);
    
    const previewImg = document.createElement('img');
    previewImg.style.cssText = `object-fit: contain; background-color: transparent; display: block; max-width: 220px; max-height: 160px; width: auto; height: auto; border-radius: 8px; transition: all 0.3s ease; opacity: 0;`;

    const timestamp = tagObj && tagObj.imageTimestamp ? `?t=${tagObj.imageTimestamp}` : '';
    const imageUrl = `/zhihui/user_tags/preview/${encodeURIComponent(tagName)}${timestamp}`;
    previewImg.src = imageUrl;
    previewImg.alt = `${$t('previewAlt')}: ${tagName}`;
    const loadingDiv = DOM.div(`position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #94a3b8; font-size: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; z-index: 2;`);
    loadingDiv.innerHTML = `
        <div style="width: 16px; height: 16px; border: 2px solid #3b82f6; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        ${$t('loading')}
    `;
    
    if (!document.getElementById('tooltip-spin-animation')) {
        const style = document.createElement('style');
        style.id = 'tooltip-spin-animation';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    previewImg.onload = () => {
        loadingDiv.style.display = 'none';
        previewImg.style.opacity = '1';
        previewImg.style.transform = 'scale(1)';
    };
    
    previewImg.onerror = () => {
        loadingDiv.innerHTML = `
            <div style="font-size: 24px;">📷</div>
            <div>${$t('noPreviewImage')}</div>
        `;
        
        previewImg.style.display = 'none';
    };
    
    previewDiv.addEventListener('mouseenter', () => {
        previewDiv.style.transform = 'scale(1.02)';
        previewDiv.style.boxShadow = '0 8px 25px rgba(59,130,246,0.4)';
    });
    
    previewDiv.addEventListener('mouseleave', () => {
        previewDiv.style.transform = 'scale(1)';
        previewDiv.style.boxShadow = '0 6px 20px rgba(59,130,246,0.3)';
    });
    
    previewDiv.appendChild(loadingDiv);
    previewDiv.appendChild(previewImg);
    previewContainer.appendChild(previewDiv);
    mainContainer.appendChild(previewContainer);
    mainContainer.appendChild(contentDiv);
    tooltip.appendChild(mainContainer);
  
    return tooltip;
}

function showTags(category, subCategory) {
    if (tagSelectorDialog.selectedTagsList && tagSelectorDialog.hintText && tagSelectorDialog.selectedCount) {
        tagSelectorDialog.hintText.textContent = $t('noTagsSelected');
        
        if (selectedTags.size > 0) {
            tagSelectorDialog.hintText.style.display = 'none';
            tagSelectorDialog.selectedCount.style.display = 'inline-block';
            tagSelectorDialog.selectedTagsList.style.display = 'flex';
        } else {
            tagSelectorDialog.hintText.style.display = 'inline-block';
            tagSelectorDialog.selectedCount.style.display = 'none';
            tagSelectorDialog.selectedTagsList.style.display = 'none';
        }
    }

    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    subSubCategoryTabs.style.display = 'none';

    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }

    if (tagSelectorDialog.subCategoryTabs) {
        tagSelectorDialog.subCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'none';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
    }
    
    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category) || (category === '自定义' && subCategory === '我的标签')) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category) || (category === '自定义' && subCategory === '我的标签')) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }

    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    tagContent.style.display = '';
    tagContent.style.flexDirection = '';
    tagContent.style.overflow = '';

    const tags = tagsData[category][subCategory];
    const isCustomCategory = category === '自定义';

    let actualTags = tags;
    if (isCustomCategory && tags && tags['我的标签']) {
        actualTags = tags['我的标签'];
    }

    if (isCustomCategory && (!actualTags || actualTags.length === 0)) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = `text-align: center; color: #94a3b8; font-size: 16px; margin-top: 50px; padding: 20px;`;
        emptyMessage.textContent = $t('noCustomTags');
        tagContent.appendChild(emptyMessage);
        return;
    }

    let tagEntries;
    if (Array.isArray(actualTags)) {
        tagEntries = actualTags.map(tagObj => [tagObj.display, tagObj.value, tagObj]);
    } else {
        tagEntries = Object.entries(actualTags);
    }

    if (isCustomCategory && Array.isArray(actualTags) && actualTags.length > 0) {
        const grouped = {};
        const uncategorized = [];

        actualTags.forEach(tagObj => {
            if (tagObj.category) {
                if (!grouped[tagObj.category]) {
                    grouped[tagObj.category] = [];
                }
                grouped[tagObj.category].push(tagObj);
            } else {
                uncategorized.push(tagObj);
            }
        });

        const allCategories = [...customTagCategories].filter(cat => grouped[cat]);
        Object.keys(grouped).forEach(cat => {
            if (!allCategories.includes(cat)) {
                allCategories.push(cat);
            }
        });

        const hasMultipleGroups = allCategories.length > 0 || uncategorized.length > 0 || customTagCategories.length > 0;

        {
            const navBar = DOM.div(`display: flex; gap: 6px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; padding-bottom: 6px; border-bottom: 1px solid rgba(59,130,246,0.15);`);

            let activeCat = '__all__';
            const catTabs = [];

            const createDivider = () => {
                return DOM.div(`width: 1px; height: 16px; background: rgba(59,130,246,0.25); flex-shrink: 0;`);
            };

            const createCatTab = (value, label, isActive, isSystem) => {
                const inactiveColor = '#ffffff';
                const inactiveHoverColor = '#93c5fd';
                const baseStyle = `padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 400; transition: all 0.2s ease; white-space: nowrap; background: ${isActive ? 'rgba(59,130,246,0.15)' : 'transparent'}; color: ${isActive ? '#93c5fd' : inactiveColor}; border-bottom: 2px solid ${isActive ? '#3b82f6' : 'transparent'};`;
                const tab = DOM.div(baseStyle);
                tab.textContent = label;
                tab.dataset.isSystem = isSystem;
                tab.onmouseenter = () => { if (!isActive) { tab.style.color = inactiveHoverColor; } };
                tab.onmouseleave = () => { if (!isActive) { tab.style.color = inactiveColor; } };
                tab.onclick = () => {
                    activeCat = value;
                    catTabs.forEach(t => {
                        const tv = t.dataset.value;
                        const ta = tv === activeCat;
                        t.style.background = ta ? 'rgba(59,130,246,0.15)' : 'transparent';
                        t.style.color = ta ? '#93c5fd' : '#ffffff';
                        t.style.borderBottom = ta ? '2px solid #3b82f6' : '2px solid transparent';
                    });
                    renderTagsByCat();
                };
                tab.dataset.value = value;
                return tab;
            };

            const allTab = createCatTab('__all__', $t('allCategories'), true, true);
            navBar.appendChild(allTab);
            catTabs.push(allTab);

            navBar.appendChild(createDivider());
            const uncTab = createCatTab('__uncategorized__', $t('uncategorized'), false, true);
            navBar.appendChild(uncTab);
            catTabs.push(uncTab);

            allCategories.forEach(cat => {
                navBar.appendChild(createDivider());
                const tab = createCatTab(cat, cat, false, false);
                navBar.appendChild(tab);
                catTabs.push(tab);
            });

            tagContent.appendChild(navBar);

            const tagsArea = DOM.div(`display: flex; flex-wrap: wrap; gap: 6px;`);
            tagContent.appendChild(tagsArea);

            const renderTagsByCat = () => {
                tagsArea.innerHTML = '';
                let tagsToRender = [];

                if (activeCat === '__all__') {
                    tagsToRender = actualTags;
                } else if (activeCat === '__uncategorized__') {
                    tagsToRender = uncategorized;
                } else {
                    tagsToRender = grouped[activeCat] || [];
                }

                const fragment = document.createDocumentFragment();
                tagsToRender.forEach(tagObj => {
                    const tagContainer = createTagContainer();
                    const isSelected = isTagSelected(tagObj.value);
                    const tagElement = createTagElement(tagObj.display, tagObj.value, isSelected);
                    tagElement.dataset.display = tagObj.display;
                    tagElement.dataset.value = tagObj.value;
                    tagElement.dataset.isCustom = true;
                    tagElement.dataset.tagObj = JSON.stringify(tagObj);
                    tagContainer.appendChild(tagElement);
                    fragment.appendChild(tagContainer);
                });
                tagsArea.appendChild(fragment);
            };

            renderTagsByCat();
            setupTagContentEventDelegation(tagContent, isCustomCategory);
            return;
        }

        allCategories.forEach(cat => {
            const groupHeader = document.createElement('div');
            groupHeader.style.cssText = `width: 100%; padding: 8px 12px; margin: 10px 0 4px 0; background: linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(124,58,237,0.15) 100%); border-left: 3px solid #8b5cf6; border-radius: 0 4px 4px 0; color: #a78bfa; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;`;
            groupHeader.textContent = cat;
            tagContent.appendChild(groupHeader);

            const groupFragment = document.createDocumentFragment();
            grouped[cat].forEach(tagObj => {
                const tagContainer = createTagContainer();
                const isSelected = isTagSelected(tagObj.value);
                const tagElement = createTagElement(tagObj.display, tagObj.value, isSelected);
                tagElement.dataset.display = tagObj.display;
                tagElement.dataset.value = tagObj.value;
                tagElement.dataset.isCustom = true;
                tagElement.dataset.tagObj = JSON.stringify(tagObj);
                tagContainer.appendChild(tagElement);
                groupFragment.appendChild(tagContainer);
            });
            tagContent.appendChild(groupFragment);
        });

        if (uncategorized.length > 0) {
            if (allCategories.length > 0) {
                const uncategorizedHeader = document.createElement('div');
                uncategorizedHeader.style.cssText = `width: 100%; padding: 8px 12px; margin: 10px 0 4px 0; background: linear-gradient(135deg, rgba(100,116,139,0.2) 0%, rgba(71,85,105,0.15) 100%); border-left: 3px solid #64748b; border-radius: 0 4px 4px 0; color: #94a3b8; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;`;
                uncategorizedHeader.textContent = $t('uncategorized');
                tagContent.appendChild(uncategorizedHeader);
            }

            const uncFragment = document.createDocumentFragment();
            uncategorized.forEach(tagObj => {
                const tagContainer = createTagContainer();
                const isSelected = isTagSelected(tagObj.value);
                const tagElement = createTagElement(tagObj.display, tagObj.value, isSelected);
                tagElement.dataset.display = tagObj.display;
                tagElement.dataset.value = tagObj.value;
                tagElement.dataset.isCustom = true;
                tagElement.dataset.tagObj = JSON.stringify(tagObj);
                tagContainer.appendChild(tagElement);
                uncFragment.appendChild(tagContainer);
            });
            tagContent.appendChild(uncFragment);
        }

        setupTagContentEventDelegation(tagContent, isCustomCategory);
        return;
    }

    const fragment = document.createDocumentFragment();
    const tagElements = [];

    tagEntries.forEach(([display, value, tagObj]) => {
        const tagContainer = createTagContainer();
        const isSelected = isTagSelected(value);
        const tagElement = createTagElement(display, value, isSelected);

        tagElement.dataset.display = display;
        tagElement.dataset.value = value;
        tagElement.dataset.isCustom = isCustomCategory;
        if (tagObj) {
            tagElement.dataset.tagObj = JSON.stringify(tagObj);
        }

        tagContainer.appendChild(tagElement);
        tagElements.push(tagContainer);
        fragment.appendChild(tagContainer);
    });

    tagContent.appendChild(fragment);

    setupTagContentEventDelegation(tagContent, isCustomCategory);
}

let currentTooltip = null;

function setupTagContentEventDelegation(tagContent, isCustomCategory) {
    if (tagContent._delegatedEvents) {
        tagContent.removeEventListener('mouseover', tagContent._delegatedEvents.mouseover);
        tagContent.removeEventListener('mouseout', tagContent._delegatedEvents.mouseout);
        tagContent.removeEventListener('click', tagContent._delegatedEvents.click);
    }

    const handleMouseOver = PerformanceUtils.throttle((e) => {
        const tagElement = e.target.closest('span[data-value]');
        if (!tagElement) return;

        const value = tagElement.dataset.value;
        const isSelected = isTagSelected(value);

        if (!isSelected) {
            tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
            tagElement.style.color = '#fff';
        }

        if (currentTooltip && currentTooltip.parentNode) {
            currentTooltip.parentNode.removeChild(currentTooltip);
        }

        const display = tagElement.dataset.display;
        const tagObjStr = tagElement.dataset.tagObj;
        const tagObj = tagObjStr ? JSON.parse(tagObjStr) : null;

        if (isCustomCategory) {
            currentTooltip = createCustomTagTooltip(value, display, tagObj);
        } else {
            currentTooltip = createTooltip(value);
        }

        document.body.appendChild(currentTooltip);
        const rect = tagElement.getBoundingClientRect();
        currentTooltip.style.left = rect.left + (rect.width / 2) - (currentTooltip.offsetWidth / 2) + 'px';
        currentTooltip.style.top = rect.top + 'px';
        requestAnimationFrame(() => {
            if (currentTooltip) currentTooltip.style.opacity = '1';
        });
    }, 50);

    const handleMouseOut = (e) => {
        const tagElement = e.target.closest('span[data-value]');
        if (!tagElement) return;

        const value = tagElement.dataset.value;
        const isSelected = isTagSelected(value);

        if (!isSelected) {
            tagElement.style.backgroundColor = '#444';
            tagElement.style.color = '#ccc';
            tagElement.style.boxShadow = 'none';
        } else {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
        }

        if (currentTooltip) {
            const tooltipToHide = currentTooltip;
            tooltipToHide.style.opacity = '0';
            setTimeout(() => {
                if (tooltipToHide && tooltipToHide.parentNode) {
                    tooltipToHide.parentNode.removeChild(tooltipToHide);
                }
                if (currentTooltip === tooltipToHide) {
                    currentTooltip = null;
                }
            }, 200);
        }
    };

    const handleClick = (e) => {
        const tagElement = e.target.closest('span[data-value]');
        if (!tagElement) return;

        const value = tagElement.dataset.value;
        toggleTag(value, tagElement);
    };

    tagContent.addEventListener('mouseover', handleMouseOver);
    tagContent.addEventListener('mouseout', handleMouseOut);
    tagContent.addEventListener('click', handleClick);

    tagContent._delegatedEvents = {
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
        click: handleClick
    };
}

async function showCustomTagManagement() {
    if (!tagsData || !tagsData['自定义']) {
        await loadTagsData();
    }
    await loadCustomTagCategories();
    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    tagContent.style.display = '';
    tagContent.style.flexDirection = '';
    tagContent.style.overflow = '';

    const customTags = tagsData['自定义']?.['我的标签'] || [];

    if (tagSelectorDialog.subCategoryTabs) {
        tagSelectorDialog.subCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'none';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
    }

    if (tagSelectorDialog.clearButtonContainer) {
        tagSelectorDialog.clearButtonContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }

    if (tagSelectorDialog.quickRandomBtn) {
        tagSelectorDialog.quickRandomBtn.style.display = 'none';
    }

    if (tagSelectorDialog.restoreBtn) {
        tagSelectorDialog.restoreBtn.style.display = 'none';
    }
    
    if (tagSelectorDialog.selectedTagsList) {
        tagSelectorDialog.selectedTagsList.style.display = 'none';
    }
    if (tagSelectorDialog.hintText) {
        tagSelectorDialog.hintText.textContent = $t('managementModeHint');
        tagSelectorDialog.hintText.style.display = 'inline-block';
    }
    if (tagSelectorDialog.selectedCount) {
        tagSelectorDialog.selectedCount.style.display = 'none';
    }
    
    if (!tagSelectorDialog.managementButtonsContainer) {
        const managementButtonsContainer = document.createElement('div');
        managementButtonsContainer.style.cssText = `display: flex; align-items: center; gap: 12px; position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 10;`;
        
        const addBtn = document.createElement('button');
        addBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('addTag')}</span>`;
        addBtn.style.cssText = `background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border: 1px solid rgba(34,197,94,0.8); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 70px; white-space: nowrap; font-size: 14px;`;
        addBtn.addEventListener('mouseenter', () => {
            addBtn.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
            addBtn.style.color = '#ffffff';
            addBtn.style.borderColor = 'rgba(74,222,128,0.8)';
            addBtn.style.transform = 'none';
        });
        addBtn.addEventListener('mouseleave', () => {
            addBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
            addBtn.style.color = '#ffffff';
            addBtn.style.borderColor = 'rgba(34,197,94,0.8)';
            addBtn.style.transform = 'none';
        });
        addBtn.onclick = () => {
            createTagManagementForm();
        };
        managementButtonsContainer.appendChild(addBtn);
        
        const deleteAllBtn = document.createElement('button');
        deleteAllBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('deleteAll')}</span>`;
        deleteAllBtn.style.cssText = `background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: 1px solid rgba(239,68,68,0.8); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 70px; white-space: nowrap; font-size: 14px;`;
        deleteAllBtn.addEventListener('mouseenter', () => {
            deleteAllBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
            deleteAllBtn.style.color = '#ffffff';
            deleteAllBtn.style.borderColor = 'rgba(248,113,113,0.8)';
            deleteAllBtn.style.transform = 'none';
        });
        deleteAllBtn.addEventListener('mouseleave', () => {
            deleteAllBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            deleteAllBtn.style.color = '#ffffff';
            deleteAllBtn.style.borderColor = 'rgba(239,68,68,0.8)';
            deleteAllBtn.style.transform = 'none';
        });

        tagSelectorDialog.updateDeleteAllBtnState = (filterValue) => {
            if (filterValue === '__all__') {
                deleteAllBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('deleteAll')}</span>`;
            } else {
                deleteAllBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('deleteCategoryTags')}</span>`;
            }
        };
        
        deleteAllBtn.onclick = () => {
            const customTags = tagsData['自定义']?.['我的标签'] || [];
            const currentFilter = tagSelectorDialog.currentManagementFilter || '__all__';
            let filteredTags = customTags;
            if (currentFilter === '__uncategorized__') {
                filteredTags = customTags.filter(tag => !tag.category);
            } else if (currentFilter !== '__all__') {
                filteredTags = customTags.filter(tag => tag.category === currentFilter);
            }

            if (filteredTags.length === 0) {
                showToast(currentFilter === '__all__' ? $t('noTagsToDelete') : $t('noCategoryTagsToDelete'), 'info');
                return;
            }
            
            const warningDialog = document.createElement('div');
            warningDialog.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;`;
            
            const warningCard = document.createElement('div');
            warningCard.style.cssText = `background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border: 2px solid #ef4444; border-radius: 8px; padding: 20px; max-width: 500px; color: #ffffff; text-align: center;`;
            
            const warningTitle = document.createElement('div');
            warningTitle.style.cssText = `color: #ef4444; font-size: 20px; font-weight: bold; margin-bottom: 15px;`;
            warningTitle.textContent = $t('highRiskWarning');
            
            const warningMessage = document.createElement('div');
            warningMessage.style.cssText = `color: #f9fafb; font-size: 16px; margin-bottom: 20px; line-height: 1.5;`;
            const warningText = currentFilter === '__all__'
                ? $t('deleteAllWarningCount').replace('{count}', filteredTags.length)
                : $t('deleteCategoryWarningCount').replace('{category}', currentFilter === '__uncategorized__' ? $t('uncategorized') : currentFilter).replace('{count}', filteredTags.length);
            warningMessage.innerHTML = `
                <p>${warningText}</p>
                <p style="color: #fbbf24; font-weight: bold;">${$t('thisActionCannotBeUndone')}</p>
                <p style="color: #e5e7eb; font-size: 14px; margin-top: 10px;">${$t('pleaseEnterConfirmDelete').replace('{text}', `<strong style="color: #ef4444;">${$t('confirmDeleteText')}</strong>`)}</p>
            `;
            
            const confirmInput = document.createElement('input');
            confirmInput.type = 'text';
            confirmInput.placeholder = $t('enterConfirmDelete');
            confirmInput.style.cssText = `width: 80%; padding: 10px; border: 2px solid #ef4444; border-radius: 4px; background: #374151; color: #ffffff; font-size: 14px; margin-bottom: 20px; text-align: center;`;
            
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `display: flex; gap: 15px; justify-content: center;`;
            
            const cancelButton = document.createElement('button');
            cancelButton.textContent = $t('cancel');
            cancelButton.style.cssText = `background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); border: 1px solid rgba(107,114,128,0.8); color: #ffffff; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease;`;
            cancelButton.onclick = () => {
                document.body.removeChild(warningDialog);
            };
            
            const confirmButton = document.createElement('button');
            confirmButton.textContent = $t('confirmDelete');
            confirmButton.style.cssText = `background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: 1px solid rgba(239,68,68,0.8); color: #ffffff; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; opacity: 0.5; cursor: not-allowed;`;
            
            const updateConfirmButtonState = () => {
                if (confirmInput.value === $t('confirmDeleteText')) {
                    confirmButton.style.opacity = '1';
                    confirmButton.style.cursor = 'pointer';
                    confirmButton.style.pointerEvents = 'auto';
                } else {
                    confirmButton.style.opacity = '0.5';
                    confirmButton.style.cursor = 'not-allowed';
                    confirmButton.style.pointerEvents = 'none';
                }
            };
            
            confirmInput.addEventListener('input', updateConfirmButtonState);
            confirmInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && confirmInput.value === $t('confirmDeleteText')) {
                    confirmDelete();
                }
            });
            
            const confirmDelete = async () => {
                try {
                    if (currentFilter === '__all__') {
                        const response = await fetch('/zhihui/user_tags/all', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const result = await response.json();
                        if (response.ok) {
                            if (tagsData['自定义'] && tagsData['自定义']['我的标签']) {
                                const allTags = tagsData['自定义']['我的标签'];
                                allTags.forEach(tag => {
                                    if (tag && tag.value) {
                                        selectedTags.delete(tag.value);
                                    }
                                });
                                tagsData['自定义']['我的标签'] = [];
                            }
                            localStorage.setItem('tagSelector_user_tags', JSON.stringify(tagsData));
                            if (window.updateSelectedTagsOverview) window.updateSelectedTagsOverview();
                            if (window.updateCategoryRedDots) window.updateCategoryRedDots();
                            document.body.removeChild(warningDialog);
                            showCustomTagManagement();
                            showToast(result.message || $t('allTagsDeletedSuccess'), 'success');
                        } else {
                            showToast(result.error || $t('deleteFailed'), 'error');
                        }
                    } else {
                        const deletePromises = filteredTags.map(tag =>
                            fetch('/zhihui/user_tags', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: tag.display })
                            })
                        );
                        const results = await Promise.all(deletePromises);
                        const allOk = results.every(r => r.ok);
                        if (allOk) {
                            filteredTags.forEach(tag => {
                                if (tag && tag.value) {
                                    selectedTags.delete(tag.value);
                                }
                                const idx = customTags.indexOf(tag);
                                if (idx !== -1) {
                                    customTags.splice(idx, 1);
                                }
                            });
                            localStorage.setItem('tagSelector_user_tags', JSON.stringify(tagsData));
                            if (window.updateSelectedTagsOverview) window.updateSelectedTagsOverview();
                            if (window.updateCategoryRedDots) window.updateCategoryRedDots();
                            document.body.removeChild(warningDialog);
                            showCustomTagManagement();
                            const catLabel = currentFilter === '__uncategorized__' ? $t('uncategorized') : currentFilter;
                            showToast($t('categoryTagsDeletedSuccess').replace('{category}', catLabel).replace('{count}', filteredTags.length), 'success');
                        } else {
                            showToast($t('deleteFailed'), 'error');
                        }
                    }
                } catch (error) {
                    console.error('Error deleting tags:', error);
                    showToast($t('deleteFailed'), 'error');
                }
            };
            
            confirmButton.onclick = confirmDelete;
            cancelButton.addEventListener('mouseenter', () => {
                cancelButton.style.background = 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
            });
            cancelButton.addEventListener('mouseleave', () => {
                cancelButton.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
            });
            
            confirmButton.addEventListener('mouseenter', () => {
                if (confirmInput.value === $t('confirmDeleteText')) {
                    confirmButton.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
                }
            });
            confirmButton.addEventListener('mouseleave', () => {
                if (confirmInput.value === $t('confirmDeleteText')) {
                    confirmButton.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                }
            });
            
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(confirmButton);
            warningCard.appendChild(warningTitle);
            warningCard.appendChild(warningMessage);
            warningCard.appendChild(confirmInput);
            warningCard.appendChild(buttonContainer);
            warningDialog.appendChild(warningCard);
            document.body.appendChild(warningDialog);
            confirmInput.focus();
        };
        
        managementButtonsContainer.appendChild(deleteAllBtn);
        const backupBtn = document.createElement('button');
        backupBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('backupUserTags')}</span>`;
        backupBtn.style.cssText = `background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: 1px solid rgba(59,130,246,0.8); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 100px; white-space: nowrap; font-size: 14px;`;
        backupBtn.addEventListener('mouseenter', () => {
            backupBtn.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
            backupBtn.style.color = '#ffffff';
            backupBtn.style.borderColor = 'rgba(96,165,250,0.8)';
            backupBtn.style.transform = 'none';
        });
        backupBtn.addEventListener('mouseleave', () => {
            backupBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            backupBtn.style.color = '#ffffff';
            backupBtn.style.borderColor = 'rgba(59,130,246,0.8)';
            backupBtn.style.transform = 'none';
        });
        backupBtn.onclick = async () => {
            try {
                const response = await fetch('/zhihui/user_tags/backup', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `user_tags_backup_${new Date().toISOString().slice(0, 10)}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    showToast($t('backupSuccess'), 'success');
                } else {
                    const result = await response.json();
                    showToast(result.error || $t('backupFailed'), 'error');
                }
            } catch (error) {
                console.error('Error backing up user tags:', error);
                showToast($t('backupFailed'), 'error');
            }
        };
        managementButtonsContainer.appendChild(backupBtn);
        const restoreTagsBtn = document.createElement('button');
        restoreTagsBtn.innerHTML = `<span style="font-size: 14px; font-weight: 600; display: block;">${$t('restoreUserTags')}</span>`;
        restoreTagsBtn.style.cssText = `background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: 1px solid rgba(245,158,11,0.8); color: #ffffff; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; height: 35px; width: auto; min-width: 100px; white-space: nowrap; font-size: 14px;`;
        restoreTagsBtn.addEventListener('mouseenter', () => {
            restoreTagsBtn.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
            restoreTagsBtn.style.color = '#ffffff';
            restoreTagsBtn.style.borderColor = 'rgba(251,191,36,0.8)';
            restoreTagsBtn.style.transform = 'none';
        });
        restoreTagsBtn.addEventListener('mouseleave', () => {
            restoreTagsBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            restoreTagsBtn.style.color = '#ffffff';
            restoreTagsBtn.style.borderColor = 'rgba(245,158,11,0.8)';
            restoreTagsBtn.style.transform = 'none';
        });
        restoreTagsBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.zip';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('backup_file', file);
                try {
                    const response = await fetch('/zhihui/user_tags/restore', {
                        method: 'POST',
                        body: formData
                    });
                    if (response.ok) {
                        const result = await response.json();
                        showToast($t('restoreSuccess'), 'success');
                        await loadTagsData();
                        await loadCustomTagCategories();
                        showCustomTagManagement();
                    } else {
                        const result = await response.json();
                        showToast(result.error || $t('restoreFailed'), 'error');
                    }
                } catch (error) {
                    console.error('Error restoring user tags:', error);
                    showToast($t('restoreFailed'), 'error');
                }
            };
            input.click();
        };
        managementButtonsContainer.appendChild(restoreTagsBtn);
        
        const footer = tagSelectorDialog.lastElementChild;
        if (footer) {
            footer.appendChild(managementButtonsContainer);
            tagSelectorDialog.managementButtonsContainer = managementButtonsContainer;
        }
    } else {
        tagSelectorDialog.managementButtonsContainer.style.display = 'flex';
    }
    
    const filterBar = DOM.div(`display: flex; gap: 6px; margin-bottom: 12px; align-items: center; flex-wrap: wrap;`);
    tagContent.appendChild(filterBar);

    let currentFilterValue = '__all__';
    let categoryTabs = [];

    function updateFilterTabs() {
        filterBar.innerHTML = '';
        categoryTabs = [];

        const createDivider = () => {
            return DOM.div(`width: 1px; height: 16px; background: rgba(59,130,246,0.25); flex-shrink: 0;`);
        };

        const createTab = (value, label, isActive, isSystem) => {
            const inactiveColor = '#ffffff';
            const inactiveHoverColor = '#93c5fd';
            const baseStyle = `padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 400; transition: all 0.2s ease; white-space: nowrap; background: ${isActive ? 'rgba(59,130,246,0.15)' : 'transparent'}; color: ${isActive ? '#93c5fd' : inactiveColor}; border-bottom: 2px solid ${isActive ? '#3b82f6' : 'transparent'};`;
            const tab = DOM.div(baseStyle);
            tab.textContent = label;
            tab.onmouseenter = () => {
                if (!isActive) {
                    tab.style.color = inactiveHoverColor;
                }
            };
            tab.onmouseleave = () => {
                if (!isActive) {
                    tab.style.color = inactiveColor;
                }
            };
            tab.onclick = () => {
                currentFilterValue = value;
                tagSelectorDialog.currentManagementFilter = value;
                if (tagSelectorDialog.updateDeleteAllBtnState) {
                    tagSelectorDialog.updateDeleteAllBtnState(value);
                }
                updateFilterTabs();
                renderFilteredTags();
            };
            return tab;
        };

        const manageCatBtn = DOM.btn(`background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border: 1px solid rgba(139,92,246,0.7); color: #ffffff; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s ease; white-space: nowrap; flex-shrink: 0;`, $t('manageCategories'));
        manageCatBtn.addEventListener('mouseenter', () => {
            manageCatBtn.style.background = 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)';
        });
        manageCatBtn.addEventListener('mouseleave', () => {
            manageCatBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
        });
        manageCatBtn.onclick = (e) => {
            e.stopPropagation();
            showCategoryDropdown(manageCatBtn, null, updateFilterTabs);
        };

        filterBar.appendChild(manageCatBtn);

        const allTab = createTab('__all__', $t('allCategories'), currentFilterValue === '__all__', true);
        filterBar.appendChild(allTab);
        categoryTabs.push(allTab);

        filterBar.appendChild(createDivider());
        const uncategorizedTab = createTab('__uncategorized__', $t('uncategorized'), currentFilterValue === '__uncategorized__', true);
        filterBar.appendChild(uncategorizedTab);
        categoryTabs.push(uncategorizedTab);

        const allCategories = [...customTagCategories];
        customTags.forEach(tag => {
            if (tag.category && !allCategories.includes(tag.category)) {
                allCategories.push(tag.category);
            }
        });

        allCategories.forEach(cat => {
            filterBar.appendChild(createDivider());
            const tab = createTab(cat, cat, currentFilterValue === cat, false);
            filterBar.appendChild(tab);
            categoryTabs.push(tab);
        });
    }

    updateFilterTabs();
    tagSelectorDialog.currentManagementFilter = currentFilterValue;
    if (tagSelectorDialog.updateDeleteAllBtnState) {
        tagSelectorDialog.updateDeleteAllBtnState(currentFilterValue);
    }

    const tagList = DOM.div(`display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px;`);
    tagContent.appendChild(tagList);

    if (!tagSelectorDialog.selectedTagForManagement) {
        tagSelectorDialog.selectedTagForManagement = null;
    }
    
    function renderFilteredTags() {
        tagList.innerHTML = '';
        const filterValue = currentFilterValue;
        
        let filteredTags = customTags;
        if (filterValue === '__uncategorized__') {
            filteredTags = customTags.filter(tag => !tag.category);
        } else if (filterValue !== '__all__') {
            filteredTags = customTags.filter(tag => tag.category === filterValue);
        }
        
        if (filteredTags.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.cssText = `grid-column: 1 / -1; text-align: center; color: #94a3b8; font-size: 16px; padding: 40px;`;
            emptyMessage.textContent = $t('noCustomTagsClick');
            tagList.appendChild(emptyMessage);
            return;
        }
        
        filteredTags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.style.cssText = `background: linear-gradient(135deg, #2d3748 0%, #1e293b 100%); border: 2px solid #475569; border-radius: 6px; padding: 10px; display: flex; gap: 10px; position: relative; min-height: 100px; cursor: pointer; transition: all 0.3s ease;`;
            
            const tagImage = document.createElement('div');
            tagImage.style.cssText = `flex-shrink: 0; width: 80px; height: 80px; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg, #1e293b, #334155); position: relative;`;
            
            const img = document.createElement('img');
            const timestamp = tag.imageTimestamp ? `?t=${tag.imageTimestamp}` : '';
            const imageUrl = `/zhihui/user_tags/preview/${encodeURIComponent(tag.display)}${timestamp}`;
            img.src = imageUrl;
            img.alt = `${$t('previewAlt')}: ${tag.display}`;
            img.style.cssText = `object-fit: cover; width: 100%; height: 100%; display: block;`;
            
            img.onerror = () => {
                tagImage.innerHTML = '';
                const noImageText = document.createElement('div');
                noImageText.textContent = $t('noImage');
                noImageText.style.cssText = `color: #94a3b8; font-size: 11px; text-align: center; padding: 5px;`;
                tagImage.appendChild(noImageText);
            };
            
            tagImage.appendChild(img);
            tagItem.appendChild(tagImage);
            
            const textContent = document.createElement('div');
            textContent.style.cssText = `flex: 1; display: flex; flex-direction: column; gap: 6px;`;
            
            const tagName = document.createElement('div');
            tagName.style.cssText = `font-weight: 600; color: #38bdf8; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: calc(100% - 30px); min-width: 0;`;
            
            const displayText = tag.display.length > 13 ? tag.display.substring(0, 13) + '...' : tag.display;
            tagName.textContent = displayText;
            textContent.appendChild(tagName);
            
            if (tag.category) {
                const categoryBadge = document.createElement('span');
                categoryBadge.style.cssText = `display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; margin-left: 6px; vertical-align: middle; letter-spacing: 0.3px;`;
                categoryBadge.textContent = tag.category;
                tagName.appendChild(categoryBadge);
            }
            
            const tagContentPreview = document.createElement('div');
            tagContentPreview.style.cssText = `color: #e2e8f0; font-size: 12px; max-height: 65px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; flex: 1; overflow-wrap: break-word; word-break: break-all;`;
            tagContentPreview.textContent = tag.value;
            textContent.appendChild(tagContentPreview);
            tagItem.appendChild(textContent);
            
            const actionButtons = document.createElement('div');
            actionButtons.style.cssText = `position: absolute; top: 6px; right: 6px; display: none; gap: 4px;`;
            
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✏️';
            editBtn.style.cssText = `background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: 1px solid rgba(59,130,246,0.8); color: white; padding: 2px 4px; border-radius: 3px; cursor: pointer; font-size: 10px; transition: all 0.2s ease; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;`;
            
            const editTooltip = document.createElement('div');
            editTooltip.textContent = $t('edit');
            editTooltip.style.cssText = `position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 1000; pointer-events: none; margin-bottom: 5px;`;
            
            editBtn.addEventListener('mouseenter', () => {
                editBtn.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
                editBtn.style.transform = 'scale(1.02)';
                editTooltip.style.opacity = '1';
                editTooltip.style.visibility = 'visible';
            });
            editBtn.addEventListener('mouseleave', () => {
                editBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                editBtn.style.transform = 'scale(1)';
                editTooltip.style.opacity = '0';
                editTooltip.style.visibility = 'hidden';
            });
            editBtn.onclick = (e) => {
                e.stopPropagation();
                editTooltip.style.opacity = '0';
                editTooltip.style.visibility = 'hidden';
                createTagManagementForm(tag);
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.style.cssText = `background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: 1px solid rgba(239,68,68,0.8); color: white; padding: 2px 4px; border-radius: 3px; cursor: pointer; font-size: 10px; transition: all 0.2s ease; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;`;
            
            const deleteTooltip = document.createElement('div');
            deleteTooltip.textContent = $t('delete');
            deleteTooltip.style.cssText = `position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 1000; pointer-events: none; margin-bottom: 5px;`;
            
            deleteBtn.addEventListener('mouseenter', () => {
                deleteBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
                deleteBtn.style.transform = 'scale(1.02)';
                deleteTooltip.style.opacity = '1';
                deleteTooltip.style.visibility = 'visible';
            });
            deleteBtn.addEventListener('mouseleave', () => {
                deleteBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                deleteBtn.style.transform = 'scale(1)';
                deleteTooltip.style.opacity = '0';
                deleteTooltip.style.visibility = 'hidden';
            });
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                deleteTooltip.style.opacity = '0';
                deleteTooltip.style.visibility = 'hidden';
                showConfirmDialog($t('confirmDeleteTag').replace('{name}', tag.display), '', async () => {
                    try {
                        const response = await fetch('/zhihui/user_tags', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ name: tag.display })
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            const customTagsData = tagsData['自定义']['我的标签'];
                            const tagIndex = customTagsData.findIndex(t => t.id === tag.id);
                            if (tagIndex !== -1) {
                                const deletedTag = customTagsData[tagIndex];
                                customTagsData.splice(tagIndex, 1);
                                localStorage.setItem('tagSelector_user_tags', JSON.stringify(tagsData));
                                if (deletedTag && deletedTag.value) {
                                    selectedTags.delete(deletedTag.value);
                                }
                                if (window.updateSelectedTagsOverview) {
                                    window.updateSelectedTagsOverview();
                                }
                                if (window.updateCategoryRedDots) {
                                    window.updateCategoryRedDots();
                                }
                                showCustomTagManagement();
                                showToast($t('tagDeletedSuccess'), 'success');
                            }
                        } else {
                            showToast(result.error || $t('deleteFailed'), 'error');
                        }
                    } catch (error) {
                        console.error('Error deleting tag:', error);
                        showToast($t('deleteFailed'), 'error');
                    }
                });
            };
            
            editBtn.appendChild(editTooltip);
            actionButtons.appendChild(editBtn);
            deleteBtn.appendChild(deleteTooltip);
            actionButtons.appendChild(deleteBtn);
            tagItem.appendChild(actionButtons);
            tagItem.onclick = () => {
                const isCurrentlySelected = tagItem.classList.contains('selected-tag-item');
                tagList.querySelectorAll('.selected-tag-item').forEach(item => {
                    item.classList.remove('selected-tag-item');
                    item.style.borderColor = '#475569';
                    const buttons = item.querySelector('[style*="position: absolute"]');
                    if (buttons && buttons.style.display !== 'none') {
                        buttons.style.display = 'none';
                    }
                });
                
                if (!isCurrentlySelected) {
                    tagItem.classList.add('selected-tag-item');
                    tagItem.style.borderColor = '#38bdf8';
                    actionButtons.style.display = 'flex';
                    tagSelectorDialog.selectedTagForManagement = tag;
                } else {
                    tagSelectorDialog.selectedTagForManagement = null;
                    tagItem.style.borderColor = '#475569';
                    actionButtons.style.display = 'none';
                }
            };
            
            tagItem.addEventListener('mouseenter', () => {
                if (!tagItem.classList.contains('selected-tag-item')) {
                    tagItem.style.borderColor = '#94a3b8';
                }
            });
            
            tagItem.addEventListener('mouseleave', () => {
                if (!tagItem.classList.contains('selected-tag-item')) {
                    tagItem.style.borderColor = '#475569';
                }
            });
            
            tagList.appendChild(tagItem);
        });
    }

    renderFilteredTags();
}

function showCategoryDialog(existingCategory, onSave) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 10000; backdrop-filter: blur(2px);`;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(59,130,246,0.4); border-radius: 10px; padding: 20px; min-width: 300px; max-width: 380px; color: #e2e8f0; box-shadow: 0 12px 40px rgba(0,0,0,0.4);`;
    
    const title = document.createElement('div');
    title.style.cssText = `font-size: 15px; font-weight: 700; color: #38bdf8; margin-bottom: 16px; text-shadow: 0 1px 2px rgba(56,189,248,0.3);`;
    title.textContent = existingCategory ? $t('editCategory') : $t('addCategory');
    dialog.appendChild(title);
    
    const inputLabel = document.createElement('label');
    inputLabel.style.cssText = `display: block; color: #94a3b8; font-weight: 600; margin-bottom: 6px; font-size: 12px;`;
    inputLabel.textContent = $t('categoryName');
    dialog.appendChild(inputLabel);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = $t('categoryNamePlaceholder');
    input.value = existingCategory || '';
    input.maxLength = 20;
    input.style.cssText = `width: 100%; padding: 8px 12px; border: 1px solid rgba(59,130,246,0.4); border-radius: 6px; background: rgba(15,23,42,0.5); color: #e2e8f0; font-size: 13px; margin-bottom: 16px; box-sizing: border-box; outline: none; transition: all 0.2s;`;
    input.addEventListener('focus', () => {
        input.style.borderColor = '#38bdf8';
        input.style.boxShadow = '0 0 0 2px rgba(56,189,248,0.15)';
    });
    input.addEventListener('blur', () => {
        input.style.borderColor = 'rgba(59,130,246,0.4)';
        input.style.boxShadow = 'none';
    });
    dialog.appendChild(input);
    
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `display: flex; gap: 8px; justify-content: flex-end;`;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕';
    cancelBtn.style.cssText = `background: rgba(100,116,139,0.2); border: 1px solid rgba(100,116,139,0.4); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
    cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = 'rgba(100,116,139,0.35)';
        cancelBtn.style.color = '#e2e8f0';
    });
    cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = 'rgba(100,116,139,0.2)';
        cancelBtn.style.color = '#94a3b8';
    });
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
    };
    btnContainer.appendChild(cancelBtn);
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✓';
    confirmBtn.style.cssText = `background: linear-gradient(135deg, #059669 0%, #047857 100%); border: 1px solid rgba(16,185,129,0.6); color: #ffffff; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
    confirmBtn.addEventListener('mouseenter', () => {
        confirmBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
        confirmBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    });
    confirmBtn.onclick = () => {
        const value = input.value.trim();
        if (!value) {
            showToast($t('categoryRequired'), 'warning');
            return;
        }
        if (value !== existingCategory && customTagCategories.includes(value)) {
            showToast($t('categoryExists'), 'warning');
            return;
        }
        if (existingCategory && value !== existingCategory) {
            const idx = customTagCategories.indexOf(existingCategory);
            if (idx !== -1) {
                customTagCategories[idx] = value;
            }
            const customTags = tagsData['自定义']?.['我的标签'] || [];
            const updatePromises = [];
            customTags.forEach(tag => {
                if (tag.category === existingCategory) {
                    tag.category = value;
                    updatePromises.push(
                        fetch('/zhihui/user_tags', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: tag.display,
                                content: tag.value,
                                original_name: tag.display,
                                category: value
                            })
                        })
                    );
                }
            });
            saveCustomTagCategories(customTagCategories);
            Promise.all(updatePromises).catch(err => {
                console.error('Error updating tag categories:', err);
            });
        } else if (!existingCategory) {
            customTagCategories.push(value);
            saveCustomTagCategories(customTagCategories);
        }
        document.body.removeChild(overlay);
        if (onSave) onSave(value);
    };
    btnContainer.appendChild(confirmBtn);
    dialog.appendChild(btnContainer);
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmBtn.click();
        }
    });
    
    overlay.appendChild(dialog);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
    document.body.appendChild(overlay);
    input.focus();
}

function showCategoryDropdown(anchorEl, filterSelect, updateFilterOptions) {
    const existing = document.getElementById('category-dropdown-panel');
    if (existing) {
        existing.remove();
        return;
    }
    
    const panel = document.createElement('div');
    panel.id = 'category-dropdown-panel';
    panel.style.cssText = `position: fixed; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(59,130,246,0.4); border-radius: 10px; padding: 14px; width: 280px; max-height: 360px; color: #e2e8f0; box-shadow: 0 12px 40px rgba(0,0,0,0.5); z-index: 10001; display: flex; flex-direction: column; overflow: hidden;`;
    
    const rect = anchorEl.getBoundingClientRect();
    panel.style.top = (rect.bottom + 6) + 'px';
    panel.style.left = rect.left + 'px';
    
    const addRow = DOM.div(`display: flex; gap: 6px; margin-bottom: 10px; flex-shrink: 0;`);
    
    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.placeholder = $t('categoryNamePlaceholder');
    addInput.maxLength = 20;
    addInput.style.cssText = `flex: 1; padding: 6px 10px; border: 1px solid rgba(59,130,246,0.4); border-radius: 5px; background: rgba(15,23,42,0.5); color: #e2e8f0; font-size: 12px; outline: none; transition: all 0.2s; min-width: 0;`;
    addInput.addEventListener('focus', () => {
        addInput.style.borderColor = '#38bdf8';
        addInput.style.boxShadow = '0 0 0 2px rgba(56,189,248,0.15)';
    });
    addInput.addEventListener('blur', () => {
        addInput.style.borderColor = 'rgba(59,130,246,0.4)';
        addInput.style.boxShadow = 'none';
    });
    addRow.appendChild(addInput);
    
    const addBtn = DOM.btn(`background: linear-gradient(135deg, #059669 0%, #047857 100%); border: 1px solid rgba(16,185,129,0.6); color: #ffffff; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`, '+');
    addBtn.addEventListener('mouseenter', () => {
        addBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    });
    addBtn.addEventListener('mouseleave', () => {
        addBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    });
    addBtn.onclick = () => {
        const value = addInput.value.trim();
        if (!value) {
            showToast($t('categoryRequired'), 'warning');
            return;
        }
        if (customTagCategories.includes(value)) {
            showToast($t('categoryExists'), 'warning');
            return;
        }
        customTagCategories.push(value);
        saveCustomTagCategories(customTagCategories);
        addInput.value = '';
        renderCategoryList();
        if (updateFilterOptions) updateFilterOptions();
        showToast($t('categoryAddedSuccess'), 'success');
    };
    addRow.appendChild(addBtn);

    const deleteAllBtn = DOM.btn(`background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: 1px solid rgba(239,68,68,0.6); color: #ffffff; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`, '×');
    deleteAllBtn.addEventListener('mouseenter', () => {
        deleteAllBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
    });
    deleteAllBtn.addEventListener('mouseleave', () => {
        deleteAllBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    });
    deleteAllBtn.onclick = () => {
        if (customTagCategories.length === 0) {
            showToast($t('noCategoriesToDelete'), 'info');
            return;
        }
        showConfirmDialog($t('deleteAllCategoriesConfirm'), '', async () => {
            try {
                const response = await fetch('/zhihui/user_tag_categories/all', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    customTagCategories = [];
                    await loadTagsData();
                    const customTags = tagsData?.['自定义']?.['我的标签'];
                    if (Array.isArray(customTags)) {
                        const updatePromises = customTags.map(tag => {
                            if (tag.category) {
                                tag.category = '';
                                return fetch('/zhihui/user_tags', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        name: tag.display,
                                        content: tag.value,
                                        original_name: tag.display,
                                        category: ''
                                    })
                                });
                            }
                            return Promise.resolve();
                        });
                        await Promise.all(updatePromises);
                    }
                    renderCategoryList();
                    if (updateFilterOptions) updateFilterOptions();
                    showToast($t('allCategoriesDeletedSuccess'), 'success');
                } else {
                    showToast($t('deleteFailed'), 'error');
                }
            } catch (error) {
                console.error('Error deleting all categories:', error);
                showToast($t('deleteFailed'), 'error');
            }
        });
    };
    addRow.appendChild(deleteAllBtn);

    panel.appendChild(addRow);
    
    addInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });
    
    const listContainer = DOM.div(`overflow-y: auto; flex: 1; min-height: 0;`);
    panel.appendChild(listContainer);
    
    function renderCategoryList() {
        listContainer.innerHTML = '';
        if (customTagCategories.length === 0) {
            const emptyMsg = DOM.div(`text-align: center; color: #64748b; padding: 16px 10px; font-size: 12px; border: 1px dashed rgba(100,116,139,0.3); border-radius: 6px;`);
            emptyMsg.textContent = $t('uncategorized');
            listContainer.appendChild(emptyMsg);
            return;
        }
        customTagCategories.forEach((cat) => {
            const row = DOM.div(`display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: rgba(30,41,59,0.5); border: 1px solid rgba(59,130,246,0.12); border-radius: 6px; margin-bottom: 4px; transition: all 0.15s ease;`);
            row.addEventListener('mouseenter', () => {
                row.style.borderColor = 'rgba(59,130,246,0.35)';
                row.style.background = 'rgba(30,41,59,0.85)';
            });
            row.addEventListener('mouseleave', () => {
                row.style.borderColor = 'rgba(59,130,246,0.12)';
                row.style.background = 'rgba(30,41,59,0.5)';
            });
            
            const leftPart = DOM.div(`display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;`);

            const catName = DOM.span(`color: #e2e8f0; font-size: 12px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`);
            catName.textContent = cat;
            leftPart.appendChild(catName);
            row.appendChild(leftPart);
            
            const btnGroup = DOM.div(`display: flex; gap: 4px; flex-shrink: 0;`);
            
            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️';
            editBtn.style.cssText = `background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); color: #93c5fd; width: 24px; height: 24px; border-radius: 5px; cursor: pointer; font-size: 10px; transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
            editBtn.addEventListener('mouseenter', () => {
                editBtn.style.background = 'rgba(59,130,246,0.25)';
                editBtn.style.borderColor = 'rgba(59,130,246,0.45)';
            });
            editBtn.addEventListener('mouseleave', () => {
                editBtn.style.background = 'rgba(59,130,246,0.12)';
                editBtn.style.borderColor = 'rgba(59,130,246,0.25)';
            });
            editBtn.onclick = (e) => {
                e.stopPropagation();
                showCategoryDialog(cat, (newName) => {
                    renderCategoryList();
                    if (updateFilterOptions) updateFilterOptions();
                    showToast($t('categoryUpdatedSuccess'), 'success');
                });
            };
            btnGroup.appendChild(editBtn);
            
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.style.cssText = `background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; width: 24px; height: 24px; border-radius: 5px; cursor: pointer; font-size: 10px; transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
            delBtn.addEventListener('mouseenter', () => {
                delBtn.style.background = 'rgba(239,68,68,0.2)';
                delBtn.style.borderColor = 'rgba(239,68,68,0.45)';
            });
            delBtn.addEventListener('mouseleave', () => {
                delBtn.style.background = 'rgba(239,68,68,0.08)';
                delBtn.style.borderColor = 'rgba(239,68,68,0.2)';
            });
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                showConfirmDialog($t('categoryDeleteConfirm').replace('{name}', cat), '', async () => {
                    try {
                        const response = await fetch('/zhihui/user_tag_categories', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: cat })
                        });
                        if (response.ok) {
                            customTagCategories = customTagCategories.filter(c => c !== cat);
                            await loadTagsData();
                            renderCategoryList();
                            if (updateFilterOptions) updateFilterOptions();
                            showToast($t('categoryDeletedSuccess'), 'success');
                            showCategoryDropdown(anchorEl, filterSelect, updateFilterOptions);
                        } else {
                            showToast($t('categoryDeleteFailed'), 'error');
                        }
                    } catch (error) {
                        showToast($t('categoryDeleteFailed'), 'error');
                    }
                });
            };
            btnGroup.appendChild(delBtn);
            row.appendChild(btnGroup);
            listContainer.appendChild(row);
        });
    }
    renderCategoryList();
    
    document.body.appendChild(panel);
    addInput.focus();
    
    const closeOnOutside = (e) => {
        if (!panel.contains(e.target) && e.target !== anchorEl) {
            panel.remove();
            document.removeEventListener('mousedown', closeOnOutside, true);
        }
    };
    setTimeout(() => {
        document.addEventListener('mousedown', closeOnOutside, true);
    }, 0);
}

function createTagManagementForm(tagToEdit = null) {
    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    tagContent.style.display = 'flex';
    tagContent.style.flexDirection = 'column';
    tagContent.style.overflow = 'hidden';
    
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    
    const title = DOM.div(`color: #38f2f8ff; font-size: 18px; font-weight: 600; margin-bottom: 20px; text-align: center; flex-shrink: 0;`);
    title.textContent = tagToEdit ? $t('editCustomTag') : $t('addCustomTag');
    tagContent.appendChild(title);
    
    const formContainer = DOM.div(`background: linear-gradient(135deg, #2d3748 0%, #1e293b 100%); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 12px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden;`);
    tagContent.appendChild(formContainer);
    
    const mainContentContainer = DOM.div(`display: flex; gap: 10px; margin-bottom: 12px; align-items: stretch; flex: 1; min-height: 0; overflow: hidden;`);
    formContainer.appendChild(mainContentContainer);
    
    const leftPreviewContainer = DOM.div(`flex-shrink: 0; width: 400px; text-align: center; display: flex; flex-direction: column;`);
    mainContentContainer.appendChild(leftPreviewContainer);
    
    const previewLabel = document.createElement('label');
    previewLabel.style.cssText = `display: block; color: #3b82f6; font-weight: 600; margin-bottom: 8px; font-size: 14px; text-shadow: 0 1px 2px rgba(59,130,246,0.3); flex-shrink: 0;`;
    previewLabel.textContent = $t('previewImage');
    leftPreviewContainer.appendChild(previewLabel);
    
    const previewContainer = DOM.div(`width: 380px; max-width: 100%; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(59,130,246,0.3); border-radius: 6px; background: rgba(15,23,42,0.5); margin-bottom: 10px; margin-left: auto; margin-right: auto; position: relative; overflow: hidden;`);
    
    const noImageHint = DOM.div(`display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; opacity: 0.7; gap: 10px;`);
    
    const imageIcon = DOM.div(`font-size: 48px;`);
    imageIcon.textContent = '📷';
    
    const hintText = DOM.div(`font-size: 16px; font-weight: 500;`);
    hintText.textContent = $t('noImage');
    
    noImageHint.appendChild(imageIcon);
    noImageHint.appendChild(hintText);
    previewContainer.appendChild(noImageHint);
    
    const previewImg = document.createElement('img');
    previewImg.style.cssText = `max-width: 100%; max-height: 100%; object-fit: contain; display: none;`;
    
    if (tagToEdit) {
        const timestamp = tagToEdit.imageTimestamp ? `?t=${tagToEdit.imageTimestamp}` : '';
        previewImg.src = `/zhihui/user_tags/preview/${encodeURIComponent(tagToEdit.display)}${timestamp}`;
        previewImg.onload = function() {
            this.style.display = 'block';
            noImageHint.style.display = 'none';
            previewButton.textContent = $t('changeImage');
            deleteButton.style.display = 'block';
            currentPreviewImage = this.src;
            
            console.log(`编辑模式图片尺寸调整: ${this.naturalWidth}x${this.naturalHeight}`);
        };
        previewImg.onerror = () => {
            previewImg.style.display = 'none';
            noImageHint.style.display = 'flex';
            previewButton.textContent = $t('uploadImage');
            deleteButton.style.display = 'none';
        };
    } else {
        previewImg.style.display = 'none';
        noImageHint.style.display = 'flex';
    }
    
    previewContainer.appendChild(previewImg);
    leftPreviewContainer.appendChild(previewContainer);
    
    const previewInput = document.createElement('input');
    previewInput.type = 'file';
    previewInput.accept = 'image/*';
    previewInput.style.cssText = `display: none;`;
    leftPreviewContainer.appendChild(previewInput);
    
    const buttonContainer = DOM.div(`display: flex; gap: 10px; justify-content: center; margin-top: 10px; flex-wrap: wrap; flex-shrink: 0;`);
    leftPreviewContainer.appendChild(buttonContainer);
    
    const previewButton = DOM.btn(`background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border: 1px solid rgba(59,130,246,0.7); color: #ffffff; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease; white-space: nowrap;`, $t('uploadImage'));
    previewButton.addEventListener('mouseenter', () => {
        previewButton.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        previewButton.style.boxShadow = '0 2px 4px rgba(59,130,246,0.2), 0 1px 2px rgba(0,0,0,0.1)';
    });
    previewButton.addEventListener('mouseleave', () => {
        previewButton.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
        previewButton.style.boxShadow = 'none';
    });
    previewButton.onclick = () => {
        previewInput.click();
    };
    buttonContainer.appendChild(previewButton);
    
    const deleteButton = DOM.btn(`background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border: 1px solid rgba(220,38,38,0.7); color: #ffffff; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease; white-space: nowrap; display: none;`, $t('deleteImage'));
    deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        deleteButton.style.boxShadow = '0 2px 4px rgba(220,38,38,0.2), 0 1px 2px rgba(0,0,0,0.1)';
    });
    deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        deleteButton.style.boxShadow = 'none';
    });
    deleteButton.onclick = () => {
        currentPreviewImage = null;
        imageDeleted = true;
        previewImg.src = '';
        previewImg.style.display = 'none';
        noImageHint.style.display = 'flex';
        previewButton.textContent = $t('uploadImage');
        deleteButton.style.display = 'none';
        previewInput.value = '';
        console.log('图片已删除');
    };
    buttonContainer.appendChild(deleteButton);
    
    const rightFormContainer = DOM.div(`flex: 1; min-width: 0; display: flex; flex-direction: column;`);
    mainContentContainer.appendChild(rightFormContainer);
    
    const nameContainer = DOM.div(`margin-bottom: 12px; flex-shrink: 0;`);
    rightFormContainer.appendChild(nameContainer);
    
    const nameLabel = document.createElement('label');
    nameLabel.style.cssText = `display: block; color: #cbd5e1; font-weight: 500; margin-bottom: 8px; font-size: 13px;`;
    nameLabel.textContent = $t('tagNameLabel');
    nameContainer.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = $t('tagNamePlaceholder');
    nameInput.value = tagToEdit?.display || '';
    nameInput.maxLength = 18;
    nameInput.style.cssText = `width: 100%; padding: 10px; border: 1px solid rgba(148,163,184,0.25); border-radius: 6px; background: rgba(15,23,42,0.8); color: #e2e8f0; font-size: 14px; outline: none; transition: all 0.2s;`;
    nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = '#60a5fa';
        nameInput.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.15)';
    });
    nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = 'rgba(148,163,184,0.25)';
        nameInput.style.boxShadow = 'none';
    });
    
    function countChineseAndEnglishEdit(text) {
        let chineseCount = 0;
        let englishCount = 0;
        
        for (let char of text) {
            if (/[\u4e00-\u9fa5]/.test(char)) {
                chineseCount++;
            } else if (/[a-zA-Z]/.test(char)) {
                englishCount++;
            }
        }
        
        return { chinese: chineseCount, english: englishCount };
    }
    
    function validateCharacterLengthEdit(text) {
        const counts = countChineseAndEnglishEdit(text);
        
        if (counts.chinese > 0 && counts.english === 0) {
            return counts.chinese <= 9;
        }
        
        if (counts.english > 0 && counts.chinese === 0) {
            return counts.english <= 18;
        }
        
        const mixedCount = counts.chinese + (counts.english * 0.5);
        return mixedCount <= 9;
    }
    
    nameInput.addEventListener('input', () => {
        const value = nameInput.value;
        
        if (!validateCharacterLengthEdit(value)) {
            let truncatedValue = value;
            while (truncatedValue.length > 0 && !validateCharacterLengthEdit(truncatedValue)) {
                truncatedValue = truncatedValue.substring(0, truncatedValue.length - 1);
            }
            nameInput.value = truncatedValue;
        }
    });
    nameContainer.appendChild(nameInput);
    
    const categoryContainer = DOM.div(`margin-bottom: 12px; flex-shrink: 0;`);
    rightFormContainer.appendChild(categoryContainer);
    
    const categoryLabel = document.createElement('label');
    categoryLabel.style.cssText = `display: block; color: #cbd5e1; font-weight: 500; margin-bottom: 8px; font-size: 13px;`;
    categoryLabel.textContent = $t('tagCategory');
    categoryContainer.appendChild(categoryLabel);
    
    const categorySelect = createCustomDropdown(
        customTagCategories.map(cat => ({ value: cat, label: cat })),
        { placeholder: $t('uncategorized'), selectedValue: tagToEdit?.category || '' }
    );
    
    function updateCategoryOptions() {
        categorySelect.updateOptions(
            customTagCategories.map(cat => ({ value: cat, label: cat })),
            categorySelect.value
        );
    }
    
    categoryContainer.appendChild(categorySelect);
    
    const contentContainer = DOM.div(`margin-bottom: 8px; display: flex; flex-direction: column; flex: 1; min-height: 0;`);
    rightFormContainer.appendChild(contentContainer);
    
    const contentLabel = document.createElement('label');
    contentLabel.style.cssText = `display: block; color: #cbd5e1; font-weight: 500; margin-bottom: 8px; font-size: 13px;`;
    contentLabel.textContent = $t('tagContentLabel');
    contentContainer.appendChild(contentLabel);
    
    const contentTextarea = document.createElement('textarea');
    contentTextarea.placeholder = $t('enterTagContent');
    contentTextarea.value = tagToEdit?.value || '';
    contentTextarea.style.cssText = `width: 100%; padding: 10px; border: 1px solid rgba(148,163,184,0.25); border-radius: 6px; background: rgba(15,23,42,0.8); color: #e2e8f0; font-size: 14px; resize: none; flex: 1; min-height: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; outline: none; transition: all 0.2s;`;
    contentTextarea.addEventListener('focus', () => {
        contentTextarea.style.borderColor = '#60a5fa';
        contentTextarea.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.15)';
    });
    contentTextarea.addEventListener('blur', () => {
        contentTextarea.style.borderColor = 'rgba(148,163,184,0.25)';
        contentTextarea.style.boxShadow = 'none';
    });
    contentContainer.appendChild(contentTextarea);
    
    let history = [contentTextarea.value];
    let historyIndex = 0;
    let isUpdatingHistory = false;
    
    contentTextarea.addEventListener('input', () => {
        if (isUpdatingHistory) return;
        
        history = history.slice(0, historyIndex + 1);
        history.push(contentTextarea.value);
        
        if (history.length > 100) {
            history.shift();
        } else {
            historyIndex++;
        }
    });
    
    const charStatsContainer = DOM.div(`padding: 8px 12px; background: rgba(15,23,42,0.4); border: 1px solid rgba(59,130,246,0.2); border-radius: 4px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; flex: 1; min-width: 250px; align-self: center;`);
    
    const statsLeft = DOM.div(`display: flex; gap: 15px; flex-wrap: wrap;`);
    
    const charCountSpan = document.createElement('span');
    charCountSpan.innerHTML = `${$t('charCount')}: <span style="color: white;">0</span>`;
    charCountSpan.style.cssText = `font-weight: 500; color: #3b82f6; text-shadow: 0 1px 2px rgba(59,130,246,0.3);`;
    
    const lineCountSpan = document.createElement('span');
    lineCountSpan.innerHTML = `${$t('lineCount')}: <span style="color: white;">1</span>`;
    lineCountSpan.style.cssText = `font-weight: 500; color: #10b981; text-shadow: 0 1px 2px rgba(16,185,129,0.3);`;
    
    const punctuationCountSpan = document.createElement('span');
    punctuationCountSpan.innerHTML = `${$t('punctuationCount')}: <span style="color: white;">0</span>`;
    punctuationCountSpan.style.cssText = `font-weight: 500; color: #8b5cf6; text-shadow: 0 1px 2px rgba(139,92,246,0.3);`;
    
    statsLeft.appendChild(charCountSpan);
    statsLeft.appendChild(lineCountSpan);
    statsLeft.appendChild(punctuationCountSpan);
    
    const statsRight = DOM.div(`font-style: italic; opacity: 0.8;`);
    statsRight.textContent = $t('realTimeStats');
    
    charStatsContainer.appendChild(statsLeft);
    charStatsContainer.appendChild(statsRight);
    
    const toolsAndStatsContainer = DOM.div(`display: flex; gap: 12px; align-items: center; margin-top: 12px; justify-content: flex-start; flex-wrap: wrap; flex-shrink: 0;`);
    
    const saveButtonsContainer = DOM.div(`display: flex; gap: 12px; align-items: center; flex-shrink: 0; margin-right: auto; height: fit-content; align-self: center;`);
    
    function updateCharStats() {
        const text = contentTextarea.value;
        const charCount = text.length;
        const lineCount = text.split('\n').length;
        const punctuationRegex = /[，。！？；：""''（）【】《》〈〉「」『』—…·、.,;:!?()[\]{}"'\-]/g;
        const punctuationCount = (text.match(punctuationRegex) || []).length;
        
        charCountSpan.innerHTML = `${$t('charCount')}: <span style="color: white;">${charCount}</span>`;
        lineCountSpan.innerHTML = `${$t('lineCount')}: <span style="color: white;">${lineCount}</span>`;
        punctuationCountSpan.innerHTML = `${$t('punctuationCount')}: <span style="color: white;">${punctuationCount}</span>`;
        
        if (charCount > 1000) {
            charCountSpan.style.color = '#f59e0b';
        } else if (charCount > 2000) {
            charCountSpan.style.color = '#ef4444';
        } else {
            charCountSpan.style.color = '#94a3b8';
        }
    }
    
    contentTextarea.addEventListener('input', updateCharStats);
    
    updateCharStats();
    
    const saveButton = DOM.btn(`background: linear-gradient(135deg, #059669 0%, #047857 100%); border: 1px solid rgba(16,185,129,0.7); color: #ffffff; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; min-width: 80px; white-space: nowrap; align-self: center;`, $t('save'));
    saveButton.addEventListener('mouseenter', () => {
        saveButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        saveButton.style.boxShadow = '0 2px 4px rgba(16,185,129,0.2), 0 1px 2px rgba(0,0,0,0.1)';
    });
    saveButton.addEventListener('mouseleave', () => {
        saveButton.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        saveButton.style.boxShadow = 'none';
    });
    
    const backButton = DOM.btn(`background: linear-gradient(135deg, #64748b 0%, #475569 100%); border: 1px solid rgba(100,116,139,0.7); color: #ffffff; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s ease; line-height: 1.2; min-width: 80px; white-space: nowrap; align-self: center;`, $t('back'));
    backButton.addEventListener('mouseenter', () => {
        backButton.style.background = 'linear-gradient(135deg, #718096 0%, #64748b 100%)';
        backButton.style.boxShadow = '0 2px 4px rgba(100,116,139,0.2), 0 1px 2px rgba(0,0,0,0.1)';
    });
    backButton.addEventListener('mouseleave', () => {
        backButton.style.background = 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
        backButton.style.boxShadow = 'none';
    });
    
    const editToolsFrame = DOM.div(`display: flex; align-items: center; gap: 6px; padding: 8px; background: linear-gradient(135deg, #374151 0%, #4b5563 100%); border: 2px solid rgba(59,130,246,0.4); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1); position: relative; margin-left: 0; margin-right: auto; flex-shrink: 0; align-self: center; height: fit-content;`);
    
    const frameTitle = document.createElement('div');
    frameTitle.textContent = $t('editTools');
    frameTitle.style.cssText = `position: absolute; top: -14px; left: 7px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.2); text-shadow: 0 1px 2px rgba(0,0,0,0.3); letter-spacing: 0.5px;`;
    editToolsFrame.appendChild(frameTitle);
    const editToolsContainer = DOM.div(`display: flex; gap: 4px; flex-wrap: wrap;`);
    
    const clearButton = document.createElement('button');
    clearButton.textContent = $t('clearAll');
    clearButton.title = $t('clearAllTitle');
    clearButton.style.cssText = `background: linear-gradient(135deg, #ff5252 0%, #ff1744 100%); border: 1px solid rgba(255,82,82,0.7); color: #ffffff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease; min-width: 40px;`;
    
    const selectAllButton = document.createElement('button');
    selectAllButton.textContent = $t('selectAll');
    selectAllButton.title = $t('selectAllTitle');
    selectAllButton.style.cssText = `background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%); border: 1px solid rgba(66,165,245,0.7); color: #ffffff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease; min-width: 40px;`;
    
    const copyButton = document.createElement('button');
    copyButton.textContent = $t('copy');
    copyButton.title = $t('copyAllTitle');
    copyButton.style.cssText = `background: linear-gradient(135deg, #00bcd4 0%, #00acc1 100%); border: 1px solid rgba(0,188,212,0.7); color: #ffffff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease; min-width: 40px;`;
    
    const pasteButton = document.createElement('button');
    pasteButton.textContent = $t('paste');
    pasteButton.title = $t('pasteTitle');
    pasteButton.style.cssText = `background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); border: 1px solid rgba(76,175,80,0.7); color: #ffffff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease; min-width: 40px;`;
    
    const cutButton = document.createElement('button');
    cutButton.textContent = $t('cut');
    cutButton.title = $t('cutTitle');
    cutButton.style.cssText = `background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); border: 1px solid rgba(156,39,176,0.7); color: #ffffff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease; min-width: 40px;`;
    
    const undoButton = document.createElement('button');
    undoButton.textContent = $t('undo');
    undoButton.title = $t('undoTitle');
    undoButton.style.cssText = `background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border: 1px solid rgba(255,152,0,0.7); color: #ffffff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease; min-width: 40px;`;
    
    const redoButton = document.createElement('button');
    redoButton.textContent = $t('redo');
    redoButton.title = $t('redoTitle');
    redoButton.style.cssText = `background: linear-gradient(135deg, #ff6f00 0%, #e65100 100%); border: 1px solid rgba(255,111,0,0.7); color: #ffffff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease; min-width: 40px;`;
    
    undoButton.onclick = () => {
        if (historyIndex > 0) {
            isUpdatingHistory = true;
            historyIndex--;
            contentTextarea.value = history[historyIndex];
            updateCharStats();
            isUpdatingHistory = false;
        }
    };
    
    redoButton.onclick = () => {
        if (historyIndex < history.length - 1) {
            isUpdatingHistory = true;
            historyIndex++;
            contentTextarea.value = history[historyIndex];
            updateCharStats();
            isUpdatingHistory = false;
        }
    };
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.target === contentTextarea) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoButton.click();
            } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redoButton.click();
            }
        }
    });
    
    const formatButton = document.createElement('button');
    formatButton.textContent = $t('format');
    formatButton.title = $t('formatTitle');
    formatButton.style.cssText = `background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%); border: 1px solid rgba(255,193,7,0.7); color: #ffffff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease; min-width: 40px;`;
    
    [clearButton, selectAllButton, copyButton, cutButton, pasteButton, undoButton, redoButton, formatButton].forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });
    });
    
    clearButton.onclick = () => {
        contentTextarea.value = '';
        contentTextarea.dispatchEvent(new Event('input'));
        updateCharStats();
        showToast($t('contentCleared'), 'info');
    };
    
    selectAllButton.onclick = () => {
        contentTextarea.select();
    };
    
    copyButton.onclick = async () => {
        try {
            await navigator.clipboard.writeText(contentTextarea.value);
            copyButton.textContent = $t('copied');
            setTimeout(() => {
                copyButton.textContent = $t('copy');
            }, 1000);
        } catch (err) {
            showToast($t('copyFailed'), 'warning');
        }
    };
    
    cutButton.onclick = async () => {
        try {
            const selectedText = contentTextarea.value.substring(
                contentTextarea.selectionStart, 
                contentTextarea.selectionEnd
            );
            
            if (!selectedText) {
                showToast($t('pleaseSelectToCut'), 'info');
                return;
            }
            
            await navigator.clipboard.writeText(selectedText);
            const startPos = contentTextarea.selectionStart;
            const endPos = contentTextarea.selectionEnd;
            const textBefore = contentTextarea.value.substring(0, startPos);
            const textAfter = contentTextarea.value.substring(endPos);
            contentTextarea.value = textBefore + textAfter;
            cutButton.textContent = $t('cutDone');
            setTimeout(() => {
                cutButton.textContent = $t('cut');
            }, 1000);
            
            updateCharStats();
        } catch (err) {
            showToast($t('cutFailed'), 'warning');
        }
    };
    
    pasteButton.onclick = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const startPos = contentTextarea.selectionStart;
            const endPos = contentTextarea.selectionEnd;
            const textBefore = contentTextarea.value.substring(0, startPos);
            const textAfter = contentTextarea.value.substring(endPos);
            contentTextarea.value = textBefore + text + textAfter;
            updateCharStats();
        } catch (err) {
            showToast($t('pasteFailed'), 'warning');
        }
    };
    
    formatButton.onclick = () => {
        const text = contentTextarea.value;
        if (!text.trim()) {
            showToast($t('noContentToFormat'), 'info');
            return;
        }
        
        const formattedText = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n')
            .replace(/\n{3,}/g, '\n\n');
        
        contentTextarea.value = formattedText;
        updateCharStats();
    };
    
    editToolsContainer.appendChild(clearButton);
    editToolsContainer.appendChild(selectAllButton);
    editToolsContainer.appendChild(copyButton);
    editToolsContainer.appendChild(cutButton);
    editToolsContainer.appendChild(pasteButton);
    editToolsContainer.appendChild(undoButton);
    editToolsContainer.appendChild(redoButton);
    editToolsContainer.appendChild(formatButton);
    editToolsFrame.appendChild(editToolsContainer);
    saveButtonsContainer.appendChild(saveButton);
    saveButtonsContainer.appendChild(backButton); 
    toolsAndStatsContainer.appendChild(saveButtonsContainer);
    toolsAndStatsContainer.appendChild(editToolsFrame);
    toolsAndStatsContainer.appendChild(charStatsContainer);
    contentContainer.appendChild(toolsAndStatsContainer);
    
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }
    
    let currentPreviewImage = null;
    let imageDeleted = false;
    
    function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');              
                    ctx.drawImage(img, 0, 0, width, height);              
                    canvas.toBlob((blob) => {
                        const compressedReader = new FileReader();
                        compressedReader.onload = () => {
                            resolve(compressedReader.result);
                        };
                        compressedReader.readAsDataURL(blob);
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    previewInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                if (file.size > 100 * 1024) {
                    currentPreviewImage = await compressImage(file);
                } else {
                    currentPreviewImage = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            resolve(event.target.result);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                }
                
                previewImg.src = currentPreviewImage;
                previewImg.style.display = 'block';
                crossIcon.style.display = 'none';
                
                previewButton.textContent = $t('changeImage');
                deleteButton.style.display = 'block';
                imageDeleted = false;
                
                const tempImg = new Image();
                tempImg.onload = function() {
                    const containerWidth = 380;
                    const containerHeight = 500;
                    const aspectRatio = this.width / this.height;
                    
                    let displayWidth, displayHeight;
                    
                    if (aspectRatio > containerWidth / containerHeight) {
                        displayWidth = containerWidth;
                        displayHeight = containerWidth / aspectRatio;
                    } else {
                        displayHeight = containerHeight;
                        displayWidth = containerHeight * aspectRatio;
                    }
                    
                    previewImg.style.width = displayWidth + 'px';
                    previewImg.style.height = displayHeight + 'px';
                    
                    console.log(`图片尺寸调整: ${this.width}x${this.height} → ${Math.round(displayWidth)}x${Math.round(displayHeight)} (比例: ${aspectRatio.toFixed(2)}) - 拉满框架`);
                };
                tempImg.src = currentPreviewImage;
                
                const originalSize = (file.size / 1024).toFixed(1);
                const compressedSize = Math.floor((currentPreviewImage.length * 0.75) / 1024);
                console.log(`图片压缩: ${originalSize}KB → ${compressedSize}KB`);
                
            } catch (error) {
                console.error('图片压缩失败:', error);
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentPreviewImage = event.target.result;
                    previewImg.src = currentPreviewImage;
                    previewImg.style.display = 'block';
                    
                    const tempImg = new Image();
                    tempImg.onload = function() {
                        const containerWidth = 380;
                        const containerHeight = 500;
                        const aspectRatio = this.width / this.height;
                        
                        let displayWidth, displayHeight;
                        
                        if (aspectRatio > containerWidth / containerHeight) {
                            displayWidth = containerWidth;
                            displayHeight = containerWidth / aspectRatio;
                        } else {
                            displayHeight = containerHeight;
                            displayWidth = containerHeight * aspectRatio;
                        }
                        
                        previewImg.style.width = displayWidth + 'px';
                        previewImg.style.height = displayHeight + 'px';
                        
                        previewButton.textContent = $t('changeImage');
                        deleteButton.style.display = 'block';
                    };
                    tempImg.src = currentPreviewImage;
                };
                reader.readAsDataURL(file);
            }
        }
    });
    
    saveButton.onclick = async () => {
        const name = nameInput.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!name || !content) {
            showToast($t('pleaseFillComplete'), 'warning');
            return;
        }
        
        try {
            const requestData = { name, content };
            
            const selectedCategory = categorySelect.value;
            requestData.category = selectedCategory || "";
            
            if (currentPreviewImage) {
                requestData.preview_image = currentPreviewImage;
            } else if (tagToEdit && imageDeleted) {
                requestData.delete_image = true;
            }
            
            if (tagToEdit) {
                requestData.original_name = tagToEdit.display;
            }
            
            const response = await fetch('/zhihui/user_tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            if (response.ok) {
                await loadTagsData();
                
                const customTags = tagsData['自定义']?.['我的标签'] || [];
                customTags.forEach(tag => {
                    if (tag.display === name) {
                        tag.imageTimestamp = Date.now();
                    }
                });
                
                showCustomTagManagement();
                showToast(tagToEdit ? $t('tagUpdatedSuccess') : $t('tagAddedSuccess'), 'success');
            } else {
                showToast(result.error || $t('operationFailed'), 'error');
            }
        } catch (error) {
            console.error('Error saving custom tag:', error);
            showToast($t('operationFailed'), 'error');
        }
    };
    
    backButton.onclick = () => {
        showCustomTagManagement();
    };
}

function showTagsFromSubSub(category, subCategory, subSubCategory) {
    const tagContent = tagSelectorDialog.tagContent;
    
    if (tagContent._delegatedEvents) {
        tagContent.removeEventListener('mouseover', tagContent._delegatedEvents.mouseover);
        tagContent.removeEventListener('mouseout', tagContent._delegatedEvents.mouseout);
        tagContent.removeEventListener('click', tagContent._delegatedEvents.click);
        tagContent._delegatedEvents = null;
    }
    
    tagContent.innerHTML = '';
    tagContent.style.display = '';
    tagContent.style.flexDirection = '';
    tagContent.style.overflow = '';
    
    if (tagSelectorDialog.subCategoryTabs) {
        tagSelectorDialog.subCategoryTabs.style.display = 'flex';
        tagSelectorDialog.subCategoryTabs.style.minHeight = '45px';
        tagSelectorDialog.subCategoryTabs.style.overflow = 'visible';
    }
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'flex';
        tagSelectorDialog.subSubCategoryTabs.style.minHeight = '40px';
        tagSelectorDialog.subSubCategoryTabs.style.overflow = 'visible';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.style.minHeight = '35px';
        tagSelectorDialog.subSubSubCategoryTabs.style.overflow = 'visible';
    }
    
    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }
    const tags = tagsData[category][subCategory][subSubCategory];
    tags.forEach(tagObj => {
        const tagElement = document.createElement('span');
        tagElement.style.cssText = `display: inline-block; padding: 6px 12px; margin: 4px; background: #444; color: '#ccc'; border-radius: 16px; cursor: pointer; transition: all 0.2s; font-size: 14px; position: relative; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;

        const translatedDisplay = $tag(tagObj.display, tagObj.value);
        const displayText = translatedDisplay.length > 13 ? translatedDisplay.substring(0, 13) + '...' : translatedDisplay;
        tagElement.textContent = displayText;
        tagElement.dataset.value = tagObj.value;
        tagElement.dataset.originalDisplay = tagObj.display;

        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
        }

        const createCustomTooltip = () => {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `position: absolute; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: pre-wrap; z-index: 10000; border: 1px solid #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.3); pointer-events: none; opacity: 0; transition: opacity 0.2s ease; transform: translateY(-100%) translateY(-8px); max-width: 300px; word-wrap: break-word;`;
            tooltip.textContent = tagObj.value;
            return tooltip;
        };

        let tooltip = null;

        tagElement.onmouseenter = (e) => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
                tagElement.style.color = '#fff';
            }
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            setTimeout(() => { if (tooltip) tooltip.style.opacity = '1'; }, 10);
        };

        tagElement.onmouseleave = () => {
            const currentlySelected = isTagSelected(tagObj.value);
            if (!currentlySelected) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.color = '#ccc';
            } else {
                tagElement.style.backgroundColor = '#22c55e';
                tagElement.style.color = '#fff';
            }
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                    tooltip = null;
                }, 200);
            }
        };

        tagElement.onclick = () => {
            toggleTag(tagObj.value, tagElement);
        };

        tagContent.appendChild(tagElement);
    });
}

function showTagsFromSubSubSub(category, subCategory, subSubCategory, subSubSubCategory) {
    const tagContent = tagSelectorDialog.tagContent;
    
    if (tagContent._delegatedEvents) {
        tagContent.removeEventListener('mouseover', tagContent._delegatedEvents.mouseover);
        tagContent.removeEventListener('mouseout', tagContent._delegatedEvents.mouseout);
        tagContent.removeEventListener('click', tagContent._delegatedEvents.click);
        tagContent._delegatedEvents = null;
    }
    
    tagContent.innerHTML = '';
    tagContent.style.display = '';
    tagContent.style.flexDirection = '';
    tagContent.style.overflow = '';
    
    if (tagSelectorDialog.subCategoryTabs) {
        tagSelectorDialog.subCategoryTabs.style.display = 'flex';
        tagSelectorDialog.subCategoryTabs.style.minHeight = '45px';
        tagSelectorDialog.subCategoryTabs.style.overflow = 'visible';
    }
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'flex';
        tagSelectorDialog.subSubCategoryTabs.style.minHeight = '40px';
        tagSelectorDialog.subSubCategoryTabs.style.overflow = 'visible';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'flex';
        tagSelectorDialog.subSubSubCategoryTabs.style.minHeight = '35px';
        tagSelectorDialog.subSubSubCategoryTabs.style.overflow = 'visible';
    }
    
    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }

    const tags = tagsData[category][subCategory][subSubCategory][subSubSubCategory];
    tags.forEach(tagObj => {
        const tagElement = document.createElement('span');
        tagElement.style.cssText = `display: inline-block; padding: 6px 12px; margin: 4px; background: #444; color: '#ccc'; border-radius: 16px; cursor: pointer; transition: all 0.2s; font-size: 14px; position: relative;`;

        const translatedDisplay = $tag(tagObj.display, tagObj.value);
        const displayText = translatedDisplay.length > 13 ? translatedDisplay.substring(0, 13) + '...' : translatedDisplay;
        tagElement.textContent = displayText;
        tagElement.dataset.value = tagObj.value;
        tagElement.dataset.originalDisplay = tagObj.display;

        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
        }

        let tooltip = null;
        const createCustomTooltip = () => {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `position: absolute; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: pre-wrap; z-index: 10000; border: 1px solid #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.3); pointer-events: none; opacity: 0; transition: opacity 0.2s ease; transform: translateY(-100%) translateY(-8px); max-width: 300px; word-wrap: break-word;`;
            tooltip.textContent = tagObj.value;
            return tooltip;
        };

        tagElement.onmouseenter = (e) => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
                tagElement.style.color = '#fff';
            }
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            setTimeout(() => { if (tooltip) tooltip.style.opacity = '1'; }, 10);
        };

        tagElement.onmouseleave = () => {
            const currentlySelected = isTagSelected(tagObj.value);
            if (!currentlySelected) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.color = '#ccc';
            } else {
                tagElement.style.backgroundColor = '#22c55e';
                tagElement.style.color = '#fff';
            }
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                    tooltip = null;
                }, 200);
            }
        };

        tagElement.onclick = () => {
            toggleTag(tagObj.value, tagElement);
        };

        tagContent.appendChild(tagElement);
    });
}

let selectedTags = new Map();
let previousSelectedTags = new Map();

window.selectedTags = selectedTags;
window.previousSelectedTags = previousSelectedTags;
window.tagsData = null;
window.updateSelectedTags = null;
window.updateSelectedTagsOverview = null;
window.updateCategoryRedDots = null;

function categoryHasSelectedTags(category, subCategory = null, subSubCategory = null, subSubSubCategory = null) {
    if (!tagsData || !tagsData[category]) return false;
    
    const checkTagsInObject = (obj) => {
        if (Array.isArray(obj)) {
            return obj.some(tag => {
                const tagValue = typeof tag === 'object' ? tag.value : tag;
                return selectedTags.has(tagValue);
            });
        }
        
        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    if (selectedTags.has(value)) {
                        return true;
                    }
                } else if (typeof value === 'object') {
                    if (checkTagsInObject(value)) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        if (typeof obj === 'string') {
            return selectedTags.has(obj);
        }
        
        return false;
    };
    
    let targetData = tagsData[category];
    
    if (subCategory && targetData[subCategory]) {
        targetData = targetData[subCategory];
        
        if (subSubCategory && targetData[subSubCategory]) {
            targetData = targetData[subSubCategory];
            
            if (subSubSubCategory && targetData[subSubSubCategory]) {
                targetData = targetData[subSubSubCategory];
            }
        }
    }
    
    return checkTagsInObject(targetData);
}

function createRedDotIndicator() {
    const redDot = document.createElement('div');
    redDot.className = 'red-dot-indicator';
    redDot.style.cssText = `position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 4px rgba(34,197,94,0.6); z-index: 10; display: none;`;
    return redDot;
}

function clearAllRedDots() {
    if (!tagSelectorDialog) return;
    
    const allRedDots = tagSelectorDialog.querySelectorAll('.red-dot-indicator');
    allRedDots.forEach(dot => dot.remove());
}

function updateCategoryRedDots() {
    if (!tagSelectorDialog || !tagsData) return;

    clearAllRedDots();

    const categoryList = tagSelectorDialog.categoryList;
    if (categoryList) {
        const categoryItems = categoryList.querySelectorAll('div');
        categoryItems.forEach((item) => {
            const displayCategory = item.textContent;
            const category = $tcReverse(displayCategory);
            if (category && tagsData[category]) {
                if (categoryHasSelectedTags(category)) {
                    const redDot = createRedDotIndicator();
                    item.style.position = 'relative';
                    item.appendChild(redDot);
                    redDot.style.display = 'block';
                }
            }
        });
    }

    const subCategoryTabs = tagSelectorDialog.subCategoryTabs;
    if (subCategoryTabs && tagSelectorDialog.activeCategory) {
        const subCategoryItems = subCategoryTabs.querySelectorAll('div');
        subCategoryItems.forEach(item => {
            const displaySubCategory = item.textContent;
            const subCategory = $tcReverse(displaySubCategory);
            if (subCategory === '标签管理' && tagSelectorDialog.activeSubCategory !== '标签管理') {
                return;
            }

            if (categoryHasSelectedTags(tagSelectorDialog.activeCategory, subCategory)) {
                const redDot = createRedDotIndicator();
                item.style.position = 'relative';
                item.appendChild(redDot);
                redDot.style.display = 'block';
            }
        });
    }

    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    if (subSubCategoryTabs && tagSelectorDialog.activeCategory && tagSelectorDialog.activeSubCategory) {
        const subSubCategoryItems = subSubCategoryTabs.querySelectorAll('div');
        subSubCategoryItems.forEach(item => {
            const displaySubSubCategory = item.textContent;
            const subSubCategory = $tcReverse(displaySubSubCategory);
            if (categoryHasSelectedTags(tagSelectorDialog.activeCategory, tagSelectorDialog.activeSubCategory, subSubCategory)) {
                const redDot = createRedDotIndicator();
                item.style.position = 'relative';
                item.appendChild(redDot);
                redDot.style.display = 'block';
            }
        });
    }

    const subSubSubCategoryTabs = tagSelectorDialog.subSubSubCategoryTabs;
    if (subSubSubCategoryTabs && tagSelectorDialog.activeCategory && tagSelectorDialog.activeSubCategory && tagSelectorDialog.activeSubSubCategory) {
        const subSubSubCategoryItems = subSubSubCategoryTabs.querySelectorAll('div');
        subSubSubCategoryItems.forEach(item => {
            const displaySubSubSubCategory = item.textContent;
            const subSubSubCategory = $tcReverse(displaySubSubSubCategory);
            if (categoryHasSelectedTags(tagSelectorDialog.activeCategory, tagSelectorDialog.activeSubCategory, tagSelectorDialog.activeSubSubCategory, subSubSubCategory)) {
                const redDot = createRedDotIndicator();
                item.style.position = 'relative';
                item.appendChild(redDot);
                redDot.style.display = 'block';
            }
        });
    }
}

function toggleTag(tag, element) {
    const isInspirationSuite = tagSelectorDialog && tagSelectorDialog.activeCategory === '灵感套装';
    
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        element.style.backgroundColor = '#444';
        element.style.color = '#ccc';
    } else {
        if (isInspirationSuite) {
            selectedTags.clear();
            if (tagSelectorDialog && tagSelectorDialog.tagContent) {
                tagSelectorDialog.tagContent.querySelectorAll('span[data-value]').forEach(el => {
                    el.style.backgroundColor = '#444';
                    el.style.color = '#ccc';
                });
            }
        }
        selectedTags.set(tag, 1.0);
        element.style.backgroundColor = '#22c55e';
        element.style.color = '#fff';
    }

    updateSelectedTags();
    updateCategoryRedDots();
}

function isTagSelected(tag) {
    return selectedTags.has(tag);
}

function updateSelectedTags() {
    if (currentNode) {
        const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
        if (tagEditWidget) {
            const tagsArray = Array.from(selectedTags.entries()).map(([tag, weight]) => {
                if (weight !== 1.0) {
                    return `(${tag}:${weight.toFixed(1)})`;
                }
                return tag;
            });
            const displayValue = tagsArray.join(', ');
            const storageValue = tagsArray.join('|||');          
            tagEditWidget.value = displayValue;
            tagEditWidget._internalValue = storageValue;
            if (tagEditWidget.callback) {
                tagEditWidget.callback(tagEditWidget.value);
            }
        }
    }
    updateSelectedTagsOverview();
}

window.updateSelectedTags = updateSelectedTags;

const SELECTED_TAG_STYLES = {
    container: 'display: flex; flex-direction: column; align-items: center; margin: 0 4px; background: transparent; position: relative;',
    tagElement: 'background: linear-gradient(135deg, #4a9eff 0%, #1e88e5 100%); color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 14px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; max-width: 200px; min-width: 90px; justify-content: space-between; margin: 0 0 2px 0; box-shadow: 0 2px 4px rgba(74,158,255,0.4), 0 1px 2px rgba(74,158,255,0.2); border: 1px solid rgba(30,136,229,0.8); transition: all 0.3s ease;',
    tagText: 'flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;',
    weightDisplay: 'font-size: 10px; background: rgba(255,255,255,0.2); padding: 1px 4px; border-radius: 3px; min-width: 10px; text-align: center; cursor: pointer; user-select: none;',
    removeBtn: 'font-size: 8px; font-family: "SimHei", "黑体", sans-serif; font-weight: bold; cursor: pointer; opacity: 0.8; background-color: #3b7ddd; color: white; border-radius: 50%; width: 14px; height: 14px; min-width: 14px; min-height: 14px; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s; line-height: 1; text-align: center; padding: 0; margin: 0; transform: translate(0, 0); flex-shrink: 0; box-sizing: border-box;',
    weightControl: 'display: none; position: absolute; top: 0; left: 0; right: 26px; height: 100%; align-items: center; justify-content: center; background: rgba(74,158,255,0.95); border-radius: 6px; z-index: 10; opacity: 0; transition: opacity 0.2s ease;',
    weightEditor: 'display: flex; align-items: center; background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); border: 1px solid #4a9eff; border-radius: 4px; overflow: hidden; height: 15px; box-shadow: 0 2px 8px rgba(74,158,255,0.4);',
    weightBtn: 'font-size: 11px; font-weight: bold; cursor: pointer; color: #fff; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s;',
    weightValueDisplay: 'font-size: 11px; font-weight: 700; color: #fff; min-width: 26px; text-align: center; cursor: pointer; user-select: none; height: 100%; display: flex; align-items: center; justify-content: center; text-shadow: 0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1);',
    chineseName: 'font-size: 10px; color: #22c55e; text-align: center; white-space: normal; word-break: break-word; overflow-wrap: anywhere; border: 1px solid #22c55e; width: 100%; max-height: 64px; overflow-y: auto; box-sizing: border-box; border-radius: 4px; padding: 0px 4px;'
};

function findChineseNameForTag(tag, data) {
    if (!data) return tag;
    
    const findInNode = (node) => {
        if (Array.isArray(node)) {
            for (const t of node) {
                if (t.value === tag && t.display) return t.display;
            }
        } else if (node && typeof node === 'object') {
            for (const [, value] of Object.entries(node)) {
                const result = findInNode(value);
                if (result) return result;
            }
        }
        return null;
    };
    
    for (const [, subCategories] of Object.entries(data)) {
        const result = findInNode(subCategories);
        if (result) return result;
    }
    return tag;
}

function createWeightEditor(tag, updateWeightDisplay, updateWeightValueDisplay) {
    const weightEditor = DOM.div(SELECTED_TAG_STYLES.weightEditor);
    
    const decreaseBtn = DOM.span(SELECTED_TAG_STYLES.weightBtn + ' background: #ff6b6b; border-right: 1px solid rgba(255,255,255,0.3);', '−');
    const weightValueDisplay = DOM.span(SELECTED_TAG_STYLES.weightValueDisplay);
    const increaseBtn = DOM.span(SELECTED_TAG_STYLES.weightBtn + ' background: #51cf66; border-left: 1px solid rgba(255,255,255,0.3);', '+');
    
    const updateWeightValue = (w) => {
        weightValueDisplay.textContent = w.toFixed(1);
    };
    
    decreaseBtn.onmouseenter = () => {
        decreaseBtn.style.background = '#ff5252';
        decreaseBtn.style.transform = 'scale(1.1)';
    };
    decreaseBtn.onmouseleave = () => {
        decreaseBtn.style.background = '#ff6b6b';
        decreaseBtn.style.transform = 'scale(1)';
    };
    
    increaseBtn.onmouseenter = () => {
        increaseBtn.style.background = '#40c057';
        increaseBtn.style.transform = 'scale(1.1)';
    };
    increaseBtn.onmouseleave = () => {
        increaseBtn.style.background = '#51cf66';
        increaseBtn.style.transform = 'scale(1)';
    };
    
    const adjustWeight = (delta) => {
        const currentWeight = selectedTags.get(tag) || 1.0;
        const newWeight = Math.max(CONFIG.MIN_WEIGHT, Math.min(CONFIG.MAX_WEIGHT, Math.round((currentWeight + delta) * 10) / 10));
        selectedTags.set(tag, newWeight);
        updateWeightDisplay(newWeight);
        updateWeightValue(newWeight);
        updateSelectedTags();
    };
    
    decreaseBtn.onclick = (e) => {
        e.stopPropagation();
        adjustWeight(-CONFIG.WEIGHT_STEP);
    };
    
    increaseBtn.onclick = (e) => {
        e.stopPropagation();
        adjustWeight(CONFIG.WEIGHT_STEP);
    };
    
    weightValueDisplay.onclick = (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = selectedTags.get(tag) || 1.0;
        input.style.cssText = 'width: 26px; font-size: 11px; padding: 0; border: none; background: transparent; color: #4a9eff; text-align: center; outline: none; font-weight: 500;';
        weightValueDisplay.replaceWith(input);
        input.focus();
        input.select();
        
        const applyValue = () => {
            let newWeight = parseFloat(input.value);
            if (!isNaN(newWeight)) {
                newWeight = Math.max(CONFIG.MIN_WEIGHT, Math.min(CONFIG.MAX_WEIGHT, Math.round(newWeight * 10) / 10));
                selectedTags.set(tag, newWeight);
                updateWeightDisplay(newWeight);
                updateWeightValue(newWeight);
                updateSelectedTags();
            }
            input.replaceWith(weightValueDisplay);
        };
        
        input.onblur = applyValue;
        input.onkeydown = (ev) => {
            if (ev.key === 'Enter') applyValue();
            else if (ev.key === 'Escape') input.replaceWith(weightValueDisplay);
        };
    };
    
    weightEditor.appendChild(decreaseBtn);
    weightEditor.appendChild(weightValueDisplay);
    weightEditor.appendChild(increaseBtn);
    
    return { weightEditor, weightValueDisplay, updateWeightValue };
}

function createSelectedTagElement(tag, weight) {
    const tagContainer = DOM.div(SELECTED_TAG_STYLES.container);
    const tagElement = DOM.span(SELECTED_TAG_STYLES.tagElement);
    const tagText = DOM.span(SELECTED_TAG_STYLES.tagText, tag);
    tagText.title = tag;
    
    const weightDisplay = DOM.span(SELECTED_TAG_STYLES.weightDisplay);
    const updateWeightDisplay = (w) => {
        if (w === 1.0) {
            weightDisplay.style.display = 'none';
        } else {
            weightDisplay.style.display = 'inline-flex';
            weightDisplay.textContent = w.toFixed(1);
        }
    };
    updateWeightDisplay(weight);
    
    weightDisplay.ondblclick = (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = selectedTags.get(tag) || 1.0;
        input.style.cssText = 'width: 40px; font-size: 10px; padding: 1px 2px; border: 1px solid #4a9eff; border-radius: 3px; background: #1e293b; color: #fff; text-align: center; outline: none;';
        weightDisplay.replaceWith(input);
        input.focus();
        input.select();
        
        const applyValue = () => {
            let newWeight = parseFloat(input.value);
            if (!isNaN(newWeight)) {
                newWeight = Math.max(CONFIG.MIN_WEIGHT, Math.min(CONFIG.MAX_WEIGHT, Math.round(newWeight * 10) / 10));
                selectedTags.set(tag, newWeight);
                updateWeightDisplay(newWeight);
                updateSelectedTags();
            }
            input.replaceWith(weightDisplay);
        };
        
        input.onblur = applyValue;
        input.onkeydown = (ev) => {
            if (ev.key === 'Enter') applyValue();
            else if (ev.key === 'Escape') input.replaceWith(weightDisplay);
        };
    };
    
    const removeBtn = DOM.span(SELECTED_TAG_STYLES.removeBtn, '×');
    removeBtn.onmouseenter = () => { removeBtn.style.backgroundColor = '#ff4444'; };
    removeBtn.onmouseleave = () => { removeBtn.style.backgroundColor = '#3b7ddd'; };
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeSelectedTag(tag);
    };
    
    tagElement.appendChild(tagText);
    tagElement.appendChild(weightDisplay);
    tagElement.appendChild(removeBtn);
    
    const weightControl = DOM.div(SELECTED_TAG_STYLES.weightControl);
    const { weightEditor, weightValueDisplay, updateWeightValue } = createWeightEditor(tag, updateWeightDisplay, null);
    weightControl.appendChild(weightEditor);
    
    tagElement.style.position = 'relative';
    tagElement.appendChild(weightControl);
    
    tagElement.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        weightControl.style.display = 'flex';
        requestAnimationFrame(() => { weightControl.style.opacity = '1'; });
    });
    
    tagElement.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        weightControl.style.opacity = '0';
        setTimeout(() => { weightControl.style.display = 'none'; }, 200);
    });
    
    const chineseNameElement = DOM.span(SELECTED_TAG_STYLES.chineseName);
    chineseNameElement.textContent = findChineseNameForTag(tag, tagsData);
    
    tagContainer.appendChild(tagElement);
    tagContainer.appendChild(chineseNameElement);
    
    updateWeightValue(weight);
    
    return tagContainer;
}

function updateSelectedTagsOverview() {
    if (!tagSelectorDialog) return;

    const { selectedCount, selectedTagsList, hintText } = tagSelectorDialog;
    
    selectedCount.textContent = selectedTags.size;
    selectedTagsList.innerHTML = '';

    if (selectedTags.size > 0) {
        hintText.style.display = 'none';
        selectedCount.style.display = 'inline-block';
        selectedTagsList.style.display = 'flex';
        
        const fragment = document.createDocumentFragment();
        selectedTags.forEach((weight, tag) => {
            fragment.appendChild(createSelectedTagElement(tag, weight));
        });
        selectedTagsList.appendChild(fragment);
    } else {
        hintText.style.display = 'inline-block';
        selectedCount.style.display = 'none';
        selectedTagsList.style.display = 'none';
    }
}

function removeSelectedTag(tag) {
    selectedTags.delete(tag);

    const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span');
    tagElements.forEach(element => {
        if (element.textContent === tag) {
            element.style.backgroundColor = '#444';
            element.style.color = '#ccc';
        }
    });

    updateSelectedTags();
    updateSelectedTagsOverview();
    updateCategoryRedDots();
}

function loadExistingTags() {
    selectedTags.clear();
    if (currentNode) {
        const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
        if (tagEditWidget && (tagEditWidget.value || tagEditWidget._internalValue)) {
            const parseTagWithWeight = (tagStr) => {
                const weightMatch = tagStr.match(/^\((.+):([\d.]+)\)$/);
                if (weightMatch) {
                    return { tag: weightMatch[1].trim(), weight: parseFloat(weightMatch[2]) };
                }
                return { tag: tagStr.trim(), weight: 1.0 };
            };
            
            if (tagEditWidget._internalValue) {
                const currentTags = tagEditWidget._internalValue.split('|||').filter(t => t.trim());
                currentTags.forEach(tagStr => {
                    const { tag, weight } = parseTagWithWeight(tagStr);
                    selectedTags.set(tag, weight);
                });
            } else if (tagEditWidget.value) {
                try {
                    const tagsArray = JSON.parse(tagEditWidget.value);
                    if (Array.isArray(tagsArray)) {
                        tagsArray.forEach(tagStr => {
                            if (tagStr && typeof tagStr === 'string') {
                                const { tag, weight } = parseTagWithWeight(tagStr);
                                selectedTags.set(tag, weight);
                            }
                        });
                    } else {
                        throw new Error('Not an array');
                    }
                } catch (e) {
                    const currentTags = tagEditWidget.value.split(',').map(t => t.trim()).filter(t => t);
                    currentTags.forEach(tagStr => {
                        const { tag, weight } = parseTagWithWeight(tagStr);
                        selectedTags.set(tag, weight);
                    });
                }
            }
        }
    }
    updateSelectedTagsOverview();
    updateCategoryRedDots();
}

function clearSelectedTags() {
    if (previousSelectedTags.size === 0) {
        selectedTags.forEach((weight, tag) => previousSelectedTags.set(tag, weight));
    }

    selectedTags.clear();

    if (tagSelectorDialog && tagSelectorDialog.tagContent) {
        const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span[data-value]');
        tagElements.forEach(element => {
            element.style.backgroundColor = '#444';
            element.style.color = '#ccc';
        });
    }

    updateSelectedTags();
    updateSelectedTagsOverview();
    updateCategoryRedDots();
}

function restoreSelectedTags() {
    if (previousSelectedTags.size === 0) {
        return;
    }

    selectedTags.clear();
    previousSelectedTags.forEach((weight, tag) => selectedTags.set(tag, weight));

    if (tagSelectorDialog && tagSelectorDialog.tagContent) {
        const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span[data-value]');
        tagElements.forEach(element => {
            const tagValue = element.getAttribute('data-value');
            if (tagValue && selectedTags.has(tagValue)) {
                element.style.backgroundColor = '#22c55e';
                element.style.color = '#fff';
            } else {
                element.style.backgroundColor = '#444';
                element.style.color = '#ccc';
            }
        });
    }

    updateSelectedTags();
    updateSelectedTagsOverview();
    updateCategoryRedDots();
    
    previousSelectedTags.clear();
}

function applySelectedTags() {
    updateSelectedTags();

    if (tagSelectorDialog && tagSelectorDialog.closeDialog) {
        tagSelectorDialog.closeDialog();
    }
}

const debounce = PerformanceUtils.debounce;

function handleSearch(query) {
    if (!tagSelectorDialog) return;
    const q = (query || '').trim();
    if (!q) {

        restoreActiveView();
        return;
    }
    const results = searchTags(q);
    showSearchResults(results, q);
}

function saveViewState() {
    const state = {
        activeCategory: tagSelectorDialog.activeCategory,
        activeSubCategory: tagSelectorDialog.activeSubCategory,
        activeSubSubCategory: tagSelectorDialog.activeSubSubCategory,
        activeSubSubSubCategory: tagSelectorDialog.activeSubSubSubCategory
    };
    localStorage.setItem('zhihui_tag_selector_state', JSON.stringify(state));
}

function loadViewState() {
    try {
        const saved = localStorage.getItem('zhihui_tag_selector_state');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading view state:', e);
    }
    return null;
}

function restoreActiveView() {
    const a = tagSelectorDialog;
    if (a.activeCategory && a.activeSubCategory && a.activeSubSubCategory && a.activeSubSubSubCategory) {
        showTagsFromSubSubSub(a.activeCategory, a.activeSubCategory, a.activeSubSubCategory, a.activeSubSubSubCategory);
    } else if (a.activeCategory && a.activeSubCategory && a.activeSubSubCategory) {
        showTagsFromSubSub(a.activeCategory, a.activeSubCategory, a.activeSubSubCategory);
    } else if (a.activeCategory && a.activeSubCategory) {
        showTags(a.activeCategory, a.activeSubCategory);
    } else if (a.activeCategory) {
        showSubCategories(a.activeCategory);
    } else {
        initializeCategoryList();
    }
}

function searchTags(query) {
    const q = query.toLowerCase();
    
    if (searchCache.has(q)) {
        return searchCache.get(q);
    }
    
    const results = [];
    const qLen = q.length;
    
    const walk = (node, pathArr) => {
        if (Array.isArray(node)) {
            for (let i = 0; i < node.length; i++) {
                const t = node[i];
                const c = (t.display || '').toLowerCase();
                if (c.includes(q) || (qLen <= 5 && fuzzyMatch(c, q))) {
                    results.push({ ...t, path: [...pathArr] });
                }
            }
        } else if (node && typeof node === 'object') {
            const entries = Object.entries(node);
            for (let i = 0; i < entries.length; i++) {
                const [k, v] = entries[i];
                walk(v, [...pathArr, k]);
            }
        }
    };
    
    const entries = Object.entries(tagsData || {});
    for (let i = 0; i < entries.length; i++) {
        const [k, v] = entries[i];
        walk(v, [k]);
    }
    
    if (searchCache.size > MAX_CACHE_SIZE) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
    }
    searchCache.set(q, results);
    
    return results;
}

const fuzzyMatch = PerformanceUtils.memoize((str, query) => {
    if (!query) return true;
    if (!str) return false;
    
    const strLower = str.toLowerCase();
    const queryLower = query.toLowerCase();
    
    let queryIndex = 0;
    const strLen = strLower.length;
    const queryLen = queryLower.length;
    
    for (let i = 0; i < strLen && queryIndex < queryLen; i++) {
        if (strLower[i] === queryLower[queryIndex]) {
            queryIndex++;
        }
    }
    
    return queryIndex === queryLen;
});

function showSearchResults(results, q) {
    const container = tagSelectorDialog.tagContent;
    container.innerHTML = '';

    const infoBar = DOM.div(`margin: 6px 4px 12px 4px; padding: 8px 12px; border-radius: 8px; background: rgba(59,130,246,0.12); color: #93c5fd; border: 1px solid rgba(59,130,246,0.35); font-size: 12px;`);
    infoBar.textContent = `搜索 “${q}” ，共 ${results.length} 个结果`;
    container.appendChild(infoBar);

    results.forEach(tagObj => {
        const tagElement = document.createElement('span');
        tagElement.style.cssText = `display: inline-block; padding: 6px 12px; margin: 4px; background: #444; color: #ccc; border-radius: 16px; cursor: pointer; transition: all 0.2s; font-size: 14px; position: relative; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;

        const translatedDisplay = $tag(tagObj.display, tagObj.value);
        const displayText = translatedDisplay.length > 13 ? translatedDisplay.substring(0, 13) + '...' : translatedDisplay;
        tagElement.textContent = displayText;
        tagElement.dataset.value = tagObj.value;
        tagElement.dataset.originalDisplay = tagObj.display;
        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
        }
        let tooltip = null;
        const createCustomTooltip = () => {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `position: absolute; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: pre-wrap; z-index: 10000; border: 1px solid #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.3); pointer-events: none; opacity: 0; transition: opacity 0.2s ease; transform: translateY(-100%) translateY(-8px); max-width: 320px; word-wrap: break-word; line-height: 1.4;`;
            const pathStr = (tagObj.path || []).join(' > ');
            tooltip.textContent = `${tagObj.value}${pathStr ? `\n路径: ${pathStr}` : ''}`;
            return tooltip;
        };
        tagElement.onmouseenter = () => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
                tagElement.style.color = '#fff';
            }
            if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            setTimeout(() => { if (tooltip) tooltip.style.opacity = '1'; }, 10);
        };
        tagElement.onmouseleave = () => {
            const currentlySelected = isTagSelected(tagObj.value);
            if (!currentlySelected) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.color = '#ccc';
            } else {
                tagElement.style.backgroundColor = '#22c55e';
                tagElement.style.color = '#fff';
            }
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => { if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip); tooltip = null; }, 200);
            }
        };
        tagElement.onclick = () => toggleTag(tagObj.value, tagElement);
        container.appendChild(tagElement);
    });
}

function disableMainUIInteraction() {
    const existingOverlay = document.getElementById('ui-disable-overlay');
    if (existingOverlay) {
    }

    const overlay = document.createElement('div');
    overlay.id = 'ui-disable-overlay';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); z-index: 10001; pointer-events: auto;`;

    document.body.appendChild(overlay);

    if (previewPopup) {
        previewPopup.style.zIndex = '10002';
    }
    
    if (contentInput) {
        contentInput.disabled = true;
        contentInput.style.opacity = '0.5';
        contentInput.style.cursor = 'not-allowed';
    }
}

function enableMainUIInteraction() {

    const overlay = document.getElementById('ui-disable-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    if (contentInput) {
        contentInput.disabled = false;
        contentInput.style.opacity = '1';
        contentInput.style.cursor = 'text';
    }
}

let currentTagSelectorDialog = null;

async function openRandomGeneratorDialog(tagSelectorDlg) {
    await loadRandomSettings();
    
    currentTagSelectorDialog = tagSelectorDlg;
    
    if (tagSelectorDlg.subCategoryTabs) {
        tagSelectorDlg.subCategoryTabs.style.display = 'none';
    }
    if (tagSelectorDlg.subSubCategoryTabs) {
        tagSelectorDlg.subSubCategoryTabs.style.display = 'none';
    }
    if (tagSelectorDlg.subSubSubCategoryTabs) {
        tagSelectorDlg.subSubSubCategoryTabs.style.display = 'none';
    }
    
    if (tagSelectorDlg.clearButtonContainer) {
        tagSelectorDlg.clearButtonContainer.style.display = 'flex';
    }
    if (tagSelectorDlg.quickRandomBtn) {
        tagSelectorDlg.quickRandomBtn.style.display = 'block';
    }
    if (tagSelectorDlg.restoreBtn) {
        tagSelectorDlg.restoreBtn.style.display = 'block';
    }
    if (tagSelectorDlg.clearBtn) {
        tagSelectorDlg.clearBtn.style.display = 'block';
    }
    
    const tagContent = tagSelectorDlg.tagContent;
    if (!tagContent) return;
    
    if (tagSelectorDlg.rightPanel) {
        tagSelectorDlg.rightPanel.style.overflow = 'hidden';
    }
    
    tagContent.innerHTML = '';
    tagContent.style.display = '';
    tagContent.style.flexDirection = '';
    tagContent.style.overflowY = 'auto';
    tagContent.style.overflowX = 'hidden';
    
    const content = createRandomGeneratorContent();
    tagContent.appendChild(content);
}

function createRandomGeneratorContent() {
    const content = document.createElement('div');
    content.className = 'random-generator-content';
    content.style.cssText = `padding: 16px; display: flex; flex-direction: column; gap: 16px;`;

    const rulesSection = createRulesSection();
    rulesSection.classList.add('rules-section');

    const presetsSection = createPresetsSection();
    presetsSection.classList.add('presets-section');
    
    const categoriesSection = createCategoriesSection();
    categoriesSection.classList.add('categories-section');
    
    const globalSection = createGlobalSection();
    globalSection.classList.add('global-section');

    const topRow = DOM.div(`display: flex; gap: 16px;`);
    rulesSection.style.flex = '1';
    globalSection.style.flex = '1';
    topRow.appendChild(rulesSection);
    topRow.appendChild(globalSection);

    content.appendChild(topRow);
    content.appendChild(presetsSection);
    content.appendChild(categoriesSection);

    return content;
}

function createRulesSection() {
    const section = createSection('sectionBlue', 'rules-section');
    const title = createTitle($t('rulesTitle'));

    const description = document.createElement('div');
    description.classList.add('rules-content');
    description.innerHTML = $t('rulesDescription');

    section.appendChild(title);
    section.appendChild(description);
    return section;
}

let currentSelectedPreset = '默认预设';

function createPresetsSection() {
    const section = createSection();
    const title = createTitle($t('randomPresetsTitle'));
    section.appendChild(title);

    const presetsContainer = DOM.div(`display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; align-items: start;`);

    Object.entries(randomPresets).forEach(([presetName, preset]) => {
        if (presetName === '成人色情' && !window.adultContentUnlocked) {
            return;
        }

        const presetCard = document.createElement('div');
        presetCard.className = 'preset-card preset-btn';
        presetCard.dataset.presetName = presetName;
        const isSelected = currentSelectedPreset === presetName;
        
        presetCard.style.cssText = `background: linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%); border: 2px solid ${isSelected ? preset.color : preset.color + '40'}; border-radius: 8px; padding: 8px 10px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; min-width: 0; height: 110px; display: flex; flex-direction: column; cursor: pointer; ${isSelected ?`box-shadow: 0 0 16px ${preset.color}50, inset 0 0 20px ${preset.color}15;` : ''}
        `;

        const header = document.createElement('div');
        header.style.cssText = `display: flex; align-items: center; gap: 6px; margin-bottom: 4px;`;

        const icon = document.createElement('span');
        icon.style.cssText = `font-size: 20px;`;
        icon.textContent = preset.icon;

        const name = document.createElement('span');
        name.style.cssText = `color: #f1f5f9; font-size: 14px; font-weight: 600;`;
        name.textContent = $t(PRESET_KEY_MAP[presetName] || presetName);

        header.appendChild(icon);
        header.appendChild(name);

        const description = document.createElement('div');
        description.style.cssText = `color: #94a3b8; font-size: 11px; line-height: 1.3; flex: 1; overflow: visible;`;
        description.textContent = $t(preset.descriptionKey);

        presetCard.appendChild(header);
        presetCard.appendChild(description);

        presetCard.addEventListener('mouseenter', () => {
            if (currentSelectedPreset !== presetName) {
                presetCard.style.borderColor = preset.color;
                presetCard.style.boxShadow = `0 4px 12px ${preset.color}30`;
                presetCard.style.transform = 'translateY(-2px)';
            }
        });

        presetCard.addEventListener('mouseleave', () => {
            if (currentSelectedPreset !== presetName) {
                presetCard.style.borderColor = `${preset.color}40`;
                presetCard.style.boxShadow = 'none';
                presetCard.style.transform = 'translateY(0)';
            }
        });

        presetCard.onclick = () => {
            currentSelectedPreset = presetName;
            
            const allCards = presetsContainer.querySelectorAll('.preset-card');
            allCards.forEach(card => {
                const cardPresetName = card.dataset.presetName;
                const cardPreset = randomPresets[cardPresetName];
                const isCardSelected = currentSelectedPreset === cardPresetName;
                
                card.style.border = `2px solid ${isCardSelected ? cardPreset.color : cardPreset.color + '40'}`;
                card.style.boxShadow = isCardSelected ? `0 0 16px ${cardPreset.color}50, inset 0 0 20px ${cardPreset.color}15` : 'none';
                card.style.transform = isCardSelected ? 'translateY(-2px)' : 'translateY(0)';
            });
            
            applyPreset(presetName);
            if (window.showToast) {
                window.showToast(`${$t('presetApplied')}: ${$t(PRESET_KEY_MAP[presetName] || presetName)}`, 'success');
            }
        };

        presetsContainer.appendChild(presetCard);
    });

    section.appendChild(presetsContainer);
    return section;
}

function applyPreset(presetName) {
    const preset = randomPresets[presetName];
    if (!preset) return;
    
    randomSettings = JSON.parse(JSON.stringify(preset.settings));
    
    if (!randomSettings.adultCategories || Object.keys(randomSettings.adultCategories).length === 0) {
        randomSettings.adultCategories = { ...ENABLED_ADULT_CATEGORIES };
    }
    
    if (randomSettings.limitTotalTags === undefined) {
        randomSettings.limitTotalTags = true;
    }
    
    saveRandomSettings();
    
    if (!currentTagSelectorDialog) return;
    
    const tagContent = currentTagSelectorDialog.tagContent;
    if (!tagContent) return;
    
    const existingContent = tagContent.querySelector('.random-generator-content');
    if (existingContent) {
        const categoriesSection = existingContent.querySelector('.categories-section');
        if (categoriesSection) {
            const newCategoriesSection = createCategoriesSection();
            newCategoriesSection.classList.add('categories-section');
            categoriesSection.parentNode.replaceChild(newCategoriesSection, categoriesSection);
        }
        
        const globalSection = existingContent.querySelector('.global-section');
        if (globalSection) {
            const newGlobalSection = createGlobalSection();
            newGlobalSection.classList.add('global-section');
            newGlobalSection.style.flex = '1';
            globalSection.parentNode.replaceChild(newGlobalSection, globalSection);
        }
    }
}

function createCategoriesSection() {
    const section = createSection();
    const title = createTitle($t('categoriesTitle'));
    section.appendChild(title);

    const formulaGroups = {
        '常规标签': {
            title: $t('generalTags'),
            color: '#f59e0b',
            categories: []
        },
        '艺术题材': {
            title: $t('artThemes'),
            color: '#ef4444',
            categories: []
        },
        '人物类': {
            title: $t('character'),
            color: '#8b5cf6',
            categories: []
        },
        '动作/表情': {
            title: $t('actions'),
            color: '#06b6d4',
            categories: []
        },
        '道具': {
            title: $t('props'),
            color: '#10b981',
            categories: []
        },
        '场景类': {
            title: $t('scenes'),
            color: '#f97316',
            categories: []
        },
        '动物生物': {
            title: $t('animals'),
            color: '#84cc16',
            categories: []
        }
    };

    Object.keys(randomSettings.categories).forEach(categoryPath => {
        const formulaElement = categoryPath.split('.')[0];
        if (formulaGroups[formulaElement]) {
            formulaGroups[formulaElement].categories.push(categoryPath);
        }
    });

    Object.keys(formulaGroups).forEach(groupKey => {
        const group = formulaGroups[groupKey];
        if (group.categories.length > 0) {
            const groupSection = createFormulaGroupSection(group, groupKey);
            section.appendChild(groupSection);
            
            if (groupKey === '动物生物' && window.adultContentUnlocked) {
                const adultSettingsContainer = document.createElement('div');
                adultSettingsContainer.id = 'adult-settings-container-categories';
                adultSettingsContainer.style.cssText = `margin-top: 16px; padding: 16px; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); border-radius: 8px; display: block;`;

                const adultCategoriesContainer = document.createElement('div');
                adultCategoriesContainer.style.cssText = `margin-top: 0;`;

                const categoryGroups = {
                    '涩影湿': {
                        subGroups: {
                            '性暗示': { categories: [] },
                            '性行为': { categories: [] }
                        }
                    }
                };

                Object.keys(randomSettings.adultCategories).forEach(categoryPath => {
                    const setting = randomSettings.adultCategories[categoryPath];
                    const parts = categoryPath.split('.');
                    const mainGroup = parts[0];
                    const subGroup = parts[1];
                    const itemName = parts.slice(2).join('.');

                    if (categoryGroups[mainGroup] && categoryGroups[mainGroup].subGroups[subGroup]) {
                        categoryGroups[mainGroup].subGroups[subGroup].categories.push({
                            path: categoryPath,
                            setting: setting,
                            displayName: itemName || subGroup
                        });
                    }
                });

                const mainGroup = categoryGroups['涩影湿'];
                const xinganShiCategories = mainGroup.subGroups['性暗示'].categories;
                const xingxingweiCategories = mainGroup.subGroups['性行为'].categories;

                if (xinganShiCategories.length > 0 || xingxingweiCategories.length > 0) {
                    const subGroupTitle = document.createElement('div');
                    subGroupTitle.classList.add('nsfw-group-title');
                    subGroupTitle.textContent = $t('nsfw');
                    subGroupTitle.style.cssText = `color: #f87171; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-shadow: 0 0 8px #f8717140; border-bottom: 1px solid #f8717140; padding-bottom: 4px;`;
                    adultCategoriesContainer.appendChild(subGroupTitle);

                    const groupGrid = document.createElement('div');
                    groupGrid.style.cssText = `display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, auto); gap: 8px; margin-bottom: 12px;`;

                    xinganShiCategories.forEach(({ path, setting }) => {
                        const categoryItem = createCategorySettingItem(path, setting, '#f87171');
                        groupGrid.appendChild(categoryItem);
                    });

                    xingxingweiCategories.forEach(({ path, setting }) => {
                        const categoryItem = createCategorySettingItem(path, setting, '#f87171');
                        groupGrid.appendChild(categoryItem);
                    });

                    adultCategoriesContainer.appendChild(groupGrid);
                }

                adultSettingsContainer.appendChild(adultCategoriesContainer);
                section.appendChild(adultSettingsContainer);
            }
        }
    });

    return section;
}

function createFormulaGroupSection(group, groupKey) {
    const groupSection = DOM.div(`background: rgba(30,41,59,0.3); border: 1px solid ${group.color}40; border-radius: 8px; padding: 12px; margin-bottom: 12px;`);

    const groupTitle = document.createElement('h4');
    groupTitle.classList.add('formula-group-title');
    groupTitle.dataset.groupKey = groupKey;
    groupTitle.textContent = group.title;
    groupTitle.style.cssText = `color: ${group.color}; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid ${group.color}30;`;

    const grid = DOM.div(`display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 8px;`);

    group.categories.forEach(categoryPath => {
        const setting = randomSettings.categories[categoryPath];
        const item = createCategorySettingItem(categoryPath, setting, group.color);
        grid.appendChild(item);
    });

    groupSection.appendChild(groupTitle);
    groupSection.appendChild(grid);
    return groupSection;
}

function createCategorySettingItem(categoryPath, setting, themeColor = '#60a5fa') {
    const item = DOM.div(`background: rgba(30,41,59,0.5); border: 1px solid rgba(71,85,105,0.5); border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 12px;`);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = setting.enabled;
    checkbox.style.cssText = `width: 16px; height: 16px; cursor: pointer;`;
    checkbox.onchange = () => {
        randomSettings.categories[categoryPath].enabled = checkbox.checked;
        saveRandomSettings();
    };

    const name = document.createElement('div');
    name.classList.add('category-label');
    name.dataset.categoryPath = categoryPath;
    const displayName = categoryPath.split('.').pop();
    name.textContent = $tc(displayName);
    name.style.cssText = `color: ${themeColor}; font-size: 13px; font-weight: 500; flex: 1; min-width: 0;`;

    const weightLabel = document.createElement('span');
    weightLabel.classList.add('weight-label');
    weightLabel.textContent = $t('weight') + ':';
    weightLabel.style.cssText = STYLES.label;

    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.min = '0';
    weightInput.max = '10';
    weightInput.step = '0.1';
    weightInput.value = setting.weight;
    weightInput.style.cssText = STYLES.input;
    weightInput.onchange = () => {
        randomSettings.categories[categoryPath].weight = parseFloat(weightInput.value) || 0;
        saveRandomSettings();
    };

    const countLabel = document.createElement('span');
    countLabel.classList.add('count-label');
    countLabel.textContent = $t('count') + ':';
    countLabel.style.cssText = STYLES.label;

    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.min = '0';
    countInput.max = '10';
    countInput.value = setting.count;
    countInput.style.cssText = STYLES.input;
    countInput.onchange = () => {
        randomSettings.categories[categoryPath].count = parseInt(countInput.value) || 0;
        saveRandomSettings();
    };

    item.appendChild(checkbox);
    item.appendChild(name);
    item.appendChild(weightLabel);
    item.appendChild(weightInput);
    item.appendChild(countLabel);
    item.appendChild(countInput);

    return item;
}

function createGlobalSection() {
    const section = createSection('section', 'global-section');
    const title = createTitle($t('randomPresetsTitle'));

    const toggleContainer = document.createElement('div');
    toggleContainer.classList.add('limit-toggle');
    toggleContainer.style.cssText = `display: flex; align-items: center; gap: 12px; margin-bottom: 12px;`;

    const toggleLabel = document.createElement('span');
    toggleLabel.classList.add('limit-label');
    toggleLabel.textContent = randomSettings.limitTotalTags !== false ? $t('limitTotalEnabled') : $t('limitTotalDisabled');
    toggleLabel.style.cssText = `color: ${randomSettings.limitTotalTags !== false ? '#22c55e' : '#94a3b8'}; font-size: 12px; font-weight: 500; flex: 1;`;

    const toggleSwitch = document.createElement('label');
    toggleSwitch.style.cssText = `position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;`;

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = randomSettings.limitTotalTags !== false;
    toggleInput.style.cssText = `opacity: 0; width: 0; height: 0;`;

    const toggleSlider = document.createElement('span');
    toggleSlider.style.cssText = `position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${randomSettings.limitTotalTags !== false ? '#3b82f6' : '#475569'}; transition: 0.3s; border-radius: 24px;`;

    const toggleDot = document.createElement('span');
    toggleDot.style.cssText = `position: absolute; content: ""; height: 18px; width: 18px; left: ${randomSettings.limitTotalTags !== false ? '23px' : '3px'}; bottom: 3px; background-color: white; transition: 0.3s; border-radius: 50%;`;

    toggleSlider.appendChild(toggleDot);
    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);

    const toggleDesc = document.createElement('span');
    toggleDesc.textContent = randomSettings.limitTotalTags !== false ? $t('enabled') : 'Disabled';
    toggleDesc.style.cssText = `color: ${randomSettings.limitTotalTags !== false ? '#22c55e' : '#94a3b8'}; font-size: 12px; font-weight: 500;`;

    const rangeContainer = DOM.div(`display: flex; align-items: center; gap: 12px; margin-bottom: 12px;`);

    const rangeLabel = document.createElement('span');
    rangeLabel.classList.add('total-tags-label');
    rangeLabel.textContent = $t('totalTags') + ':';
    rangeLabel.style.cssText = STYLES.textLight;

    const minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.min = '1';
    minInput.max = '50';
    minInput.value = randomSettings.totalTagsRange?.min || 15;
    minInput.disabled = randomSettings.limitTotalTags === false;
    minInput.style.cssText = STYLES.input + ` opacity: ${randomSettings.limitTotalTags !== false ? '1' : '0.5'};`;
    minInput.onchange = () => {
        if (!randomSettings.totalTagsRange) randomSettings.totalTagsRange = { min: 15, max: 25 };
        randomSettings.totalTagsRange.min = parseInt(minInput.value) || 1;
        saveRandomSettings();
    };

    const separator = document.createElement('span');
    separator.textContent = '-';
    separator.style.cssText = STYLES.label.replace('12px', '14px');

    const maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.min = '1';
    maxInput.max = '50';
    maxInput.value = randomSettings.totalTagsRange?.max || 25;
    maxInput.disabled = randomSettings.limitTotalTags === false;
    maxInput.style.cssText = STYLES.input + ` opacity: ${randomSettings.limitTotalTags !== false ? '1' : '0.5'};`;
    maxInput.onchange = () => {
        if (!randomSettings.totalTagsRange) randomSettings.totalTagsRange = { min: 15, max: 25 };
        randomSettings.totalTagsRange.max = parseInt(maxInput.value) || 1;
        saveRandomSettings();
    };

    toggleInput.onchange = () => {
        randomSettings.limitTotalTags = toggleInput.checked;
        toggleSlider.style.backgroundColor = toggleInput.checked ? '#3b82f6' : '#475569';
        toggleDot.style.left = toggleInput.checked ? '23px' : '3px';
        toggleDesc.textContent = toggleInput.checked ? $t('enabled') : 'Disabled';
        toggleDesc.style.color = toggleInput.checked ? '#22c55e' : '#94a3b8';
        toggleLabel.textContent = toggleInput.checked ? $t('limitTotalEnabled') : $t('limitTotalDisabled');
        toggleLabel.style.color = toggleInput.checked ? '#22c55e' : '#94a3b8';
        
        minInput.disabled = !toggleInput.checked;
        maxInput.disabled = !toggleInput.checked;
        minInput.style.opacity = toggleInput.checked ? '1' : '0.5';
        maxInput.style.opacity = toggleInput.checked ? '1' : '0.5';
        
        saveRandomSettings();
    };

    toggleContainer.appendChild(toggleLabel);
    toggleContainer.appendChild(toggleSwitch);
    toggleContainer.appendChild(toggleDesc);

    rangeContainer.appendChild(rangeLabel);
    rangeContainer.appendChild(minInput);
    rangeContainer.appendChild(separator);
    rangeContainer.appendChild(maxInput);

    const descContainer = DOM.div(`margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(59,130,246,0.2);`);

    const descText = document.createElement('p');
    descText.innerHTML = `
        <span style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            <strong style="color: #fcd34d;">${$t('limitTotalEnabled').split('：')[0]}:</strong> ${$t('limitTotalEnabled').split('：')[1]}<br>
            <strong style="color: #94a3b8;">${$t('limitTotalDisabled').split('：')[0]}:</strong> ${$t('limitTotalDisabled').split('：')[1]}
        </span>
    `;
    descText.style.margin = '0';

    descContainer.appendChild(descText);

    section.appendChild(title);
    section.appendChild(toggleContainer);
    section.appendChild(rangeContainer);
    section.appendChild(descContainer);
    return section;
}

window.openRandomGeneratorDialog = openRandomGeneratorDialog;
window.generateRandomCombination = generateRandomCombination;

function showSaveToCustomDialog(prompt) {
    const overlay = DOM.div(`position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;`);
    const dialog = DOM.div(`background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(59,130,246,0.4); border-radius: 12px; padding: 24px; width: 400px; max-width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);`);

    const title = DOM.div(`color: #60a5fa; font-size: 18px; font-weight: 600; margin-bottom: 16px;`);
    title.textContent = $t('saveToCustomTitle');

    const nameLabel = DOM.div(`color: #cbd5e1; font-size: 13px; font-weight: 500; margin-bottom: 8px;`);
    nameLabel.textContent = $t('tagNameLabel');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = $t('tagNameInputPlaceholder');
    nameInput.style.cssText = `width: 100%; padding: 10px 12px; border: 1px solid rgba(148,163,184,0.25); border-radius: 6px; background: rgba(15,23,42,0.8); color: #e2e8f0; font-size: 14px; box-sizing: border-box; margin-bottom: 16px; outline: none; transition: all 0.2s;`;
    nameInput.onfocus = () => {
        nameInput.style.borderColor = '#60a5fa';
        nameInput.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.15)';
    };
    nameInput.onblur = () => {
        nameInput.style.borderColor = 'rgba(148,163,184,0.25)';
        nameInput.style.boxShadow = 'none';
    };

    const contentLabel = DOM.div(`color: #cbd5e1; font-size: 13px; font-weight: 500; margin-bottom: 8px;`);
    contentLabel.textContent = $t('tagContentLabel');

    const contentTextarea = document.createElement('textarea');
    contentTextarea.value = prompt;
    contentTextarea.style.cssText = `width: 100%; height: 120px; padding: 10px 12px; border: 1px solid rgba(148,163,184,0.25); border-radius: 6px; background: rgba(15,23,42,0.8); color: #e2e8f0; font-size: 14px; box-sizing: border-box; resize: vertical; outline: none; transition: all 0.2s;`;
    contentTextarea.onfocus = () => {
        contentTextarea.style.borderColor = '#60a5fa';
        contentTextarea.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.15)';
    };
    contentTextarea.onblur = () => {
        contentTextarea.style.borderColor = 'rgba(148,163,184,0.25)';
        contentTextarea.style.boxShadow = 'none';
    };

    const buttonContainer = DOM.div(`display: flex; gap: 12px; justify-content: center; margin-top: 20px;`);

    const cancelBtn = DOM.btn(`padding: 10px 24px; border: 1px solid rgba(148,163,184,0.4); border-radius: 8px; background: transparent; color: #94a3b8; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;`, '取消');
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.background = 'rgba(148,163,184,0.1)';
        cancelBtn.style.color = '#e2e8f0';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = '#94a3b8';
    };
    cancelBtn.onclick = () => {
        overlay.remove();
    };

    const saveBtn = DOM.btn(`padding: 10px 24px; border: none; border-radius: 8px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;`, $t('save'));
    saveBtn.onmouseenter = () => {
        saveBtn.style.boxShadow = '0 4px 12px rgba(34,197,94,0.4)';
        saveBtn.style.transform = 'translateY(-1px)';
    };
    saveBtn.onmouseleave = () => {
        saveBtn.style.boxShadow = 'none';
        saveBtn.style.transform = 'none';
    };
    saveBtn.onclick = async () => {
        const name = nameInput.value.trim();
        const content = contentTextarea.value.trim();

        if (!name) {
            showToast('请输入标签名称', 'warning');
            return;
        }
        if (!content) {
            showToast('标签内容不能为空', 'warning');
            return;
        }

        try {
            const response = await fetch('/zhihui/user_tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, content, category: categorySelect2.value || undefined })
            });

            const result = await response.json();
            if (response.ok) {
                await loadTagsData();
                showToast($t('saveSuccess'), 'success');
                overlay.remove();
            } else {
                showToast(result.error || $t('saveFailed'), 'error');
            }
        } catch (error) {
            console.error('Error saving to custom:', error);
            showToast($t('saveFailed'), 'error');
        }
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);

    dialog.appendChild(title);
    dialog.appendChild(nameLabel);
    dialog.appendChild(nameInput);
    
    const categoryLabel2 = DOM.div(`color: #cbd5e1; font-size: 13px; font-weight: 500; margin-bottom: 8px;`);
    categoryLabel2.textContent = $t('tagCategory');
    
    const categorySelect2 = createCustomDropdown(
        customTagCategories.map(cat => ({ value: cat, label: cat })),
        { placeholder: $t('uncategorized'), marginBottom: '16px' }
    );
    
    dialog.appendChild(categoryLabel2);
    dialog.appendChild(categorySelect2);
    dialog.appendChild(contentLabel);
    dialog.appendChild(contentTextarea);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    nameInput.focus();
}