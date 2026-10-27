import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

const i18n = {
    zh: {
        selectTags: "🏷️ 标签选择",
        templateEditing: "📝 模版编辑",
        customTags: "⚙️ 自定标签"
    },
    en: {
        selectTags: "🏷️ Select Tags",
        templateEditing: "📝 Template Editing",
        customTags: "⚙️ Custom Tags"
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

app.registerExtension({
    name: "zhiai.PhotographPromptManager",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "PhotographPromptGenerator") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                this._previousState = null;
                this._isRandomMode = false;

                const photographFieldsToHide = [
                    'character', 'gender', 'facial_expressions', 'hair_style', 'hair_color',
                    'pose', 'head_movements', 'hand_movements', 'leg_foot_movements', 'orientation',
                    'top', 'bottom', 'boots', 'socks', 'accessories', 'tattoo', 'tattoo_location',
                    'camera', 'lens', 'lighting', 'perspective', 'location',
                    'weather', 'season', 'color_tone', 'mood_atmosphere',
                    'photography_style', 'photography_technique', 'post_processing', 'depth_of_field',
                    'composition', 'texture', 'template'
                ];

                for (const widget of this.widgets) {
                    if (photographFieldsToHide.includes(widget.name)) {
                        widget.hidden = true;
                    }
                }

                const categoryBrowserButton = this.addWidget("button", $t('selectTags'), "category_browser", () => {
                    openCategoryBrowser(this);
                });
                categoryBrowserButton.serialize = false;

                const templateHelperButton = this.addWidget("button", $t('templateEditing'), "template_helper", () => {
                    openTemplateEditorHelper(this);
                });
                templateHelperButton.serialize = false;

                const manageButton = this.addWidget("button", $t('customTags'), "user_option_editing", () => {
                    openPhotographPromptManager(this);
                });
                manageButton.serialize = false;

                const self = this;
                setTimeout(() => {
                    self.setSize(self.computeSize());
                }, 10);
                setTimeout(() => {
                    self.setSize(self.computeSize());
                }, 100);
                setTimeout(() => {
                    self.setSize(self.computeSize());
                }, 300);

                return r;
            };
        }
    }
});

let currentManagerDialog = null;
let categoryData = {};

async function translateText(text, targetLang) {
    try {
        const url = "https://transmart.qq.com/api/imt";

        const clientKey = `browser-chrome-${generateUUID()}`;

        const postData = {
            "header": {
                "fn": "auto_translation",
                "client_key": clientKey
            },
            "type": "plain",
            "model_category": "normal",
            "source": {
                "lang": targetLang === 'en' ? 'zh' : 'en',
                "text_list": [text]
            },
            "target": {
                "lang": targetLang === 'en' ? 'en' : 'zh'
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://transmart.qq.com/zh-CN/index'
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            throw new Error(`Translation request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.auto_translation && result.auto_translation.length > 0) {
            return result.auto_translation[0].trim();
        } else {
            throw new Error('Translation failed: No result returned');
        }
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let currentTemplateHelperDialog = null;
let currentTemplateEditor = null;
let currentTemplateNode = null;
let customTemplates = [];

class TemplateManager {
    static async initialize() {
        try {
            const response = await fetch('../Nodes/PhotographPromptGen/templates/user_templates.txt');
            if (response.ok) {
                const data = await response.json();
                customTemplates = data;
                localStorage.setItem('customTemplates', JSON.stringify(data));
                console.log('Loaded templates from JSON file');
                return data;
            }
        } catch (error) {
            console.log('Could not load from JSON file, checking localStorage');
        }
        
        const stored = localStorage.getItem('customTemplates');
        if (stored) {
            try {
                customTemplates = JSON.parse(stored);
                console.log('Loaded templates from localStorage');
                return customTemplates;
            } catch (error) {
                console.warn('Error parsing localStorage data:', error);
            }
        }
        
        customTemplates = [];
        return [];
    }
    
    static saveTemplates(templates) {
        customTemplates = templates;
        localStorage.setItem('customTemplates', JSON.stringify(templates));
        return true;
    }
    
    static exportTemplates() {
        const dataStr = JSON.stringify(customTemplates, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-templates.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ 模版已导出到JSON文件', 'success');
    }
    
    static importTemplates() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const imported = JSON.parse(e.target.result);
                        if (Array.isArray(imported)) {
                            customTemplates = imported;
                            this.saveTemplates(customTemplates);
                            const presetList = document.querySelector('#preset-list');
                            const customList = document.querySelector('#custom-list');
                            if (presetList) {
                                populatePresetTemplates(presetList);
                            }
                            if (customList) {
                                populateCustomTemplates(customList);
                            }
                            showToast(`✅ 成功导入 ${imported.length} 个模版`, 'success');
                        } else {
                            showToast('❌ JSON文件格式不正确', 'error');
                        }
                    } catch (error) {
                        showToast('❌ JSON文件解析失败', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    static getTemplates() {
        return customTemplates;
    }
    
    static setTemplates(templates) {
        customTemplates = templates;
        this.saveTemplates(templates);
    }
}

function openPhotographPromptManager() {
    if (currentManagerDialog) {
        currentManagerDialog.remove();
    }

    currentManagerDialog = createPhotographPromptManagerDialog();
    document.body.appendChild(currentManagerDialog);

    loadCategoryData();

    currentManagerDialog.style.display = 'block';
}

function createPhotographPromptManagerDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: none;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 108%;
        max-width: 1440px;
        height: 66vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '自定义标签 - Custom Tags';
    title.style.cssText = `
        margin: 0;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-align: center;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
        closeButton.style.transform = 'scale(1.1)';
        closeButton.style.boxShadow = '0 4px 15px rgba(255, 68, 68, 0.5)';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        closeButton.style.transform = 'scale(1)';
        closeButton.style.boxShadow = 'none';
    });
    
    closeButton.addEventListener('click', () => {
        overlay.remove();
        currentManagerDialog = null;
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        display: flex;
        overflow: hidden;
        padding: 20px;
        gap: 20px;
    `;
    
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
        width: 350px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 15px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const sidebarTitle = document.createElement('h3');
    sidebarTitle.textContent = '分类列表 · Categories';
    sidebarTitle.style.cssText = `
        color: #10b981;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 13px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 5px;
        line-height: 1.2;
    `;
    
    const categoryList = document.createElement('div');
    categoryList.id = 'category-list';
    categoryList.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;
    
    sidebar.appendChild(sidebarTitle);
    sidebar.appendChild(categoryList);
    
    const editorArea = document.createElement('div');
    editorArea.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const editorHeader = document.createElement('div');
    editorHeader.style.cssText = `
        padding: 8px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const categoryName = document.createElement('h3');
    categoryName.id = 'current-category-name';
    categoryName.textContent = '请选择一个分类 - Please select a category';
    categoryName.style.cssText = `
        color: #00f2fe;
        margin: 0;
        font-size: 18px;
    `;

    editorHeader.appendChild(categoryName);
    
    const editorContent = document.createElement('div');
    editorContent.style.cssText = `
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    `;
    
    const entryList = document.createElement('div');
    entryList.id = 'entry-list';
    entryList.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
    `;

    editorContent.appendChild(entryList);
    editorArea.appendChild(editorHeader);
    editorArea.appendChild(editorContent);
    content.appendChild(sidebar);
    content.appendChild(editorArea);
    
    const footer = document.createElement('div');
    footer.style.cssText = `
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const statusText = document.createElement('div');
    statusText.id = 'status-text';
    statusText.textContent = '就绪 · Ready';
    statusText.style.cssText = `
        color: #aaa;
        font-size: 14px;
    `;
    
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
        display: flex;
        gap: 10px;
    `;

    const addButton = document.createElement('button');
    addButton.id = 'add-entry-button';
    addButton.textContent = '添加新条目 · Add New Entry';
    addButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(59, 130, 246, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    addButton.addEventListener('mouseenter', () => {
        addButton.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)';
        addButton.style.transform = 'translateY(-1px)';
        addButton.style.boxShadow = '0 3px 10px rgba(16, 185, 129, 0.5)';
    });

    addButton.addEventListener('mouseleave', () => {
        addButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)';
        addButton.style.transform = 'translateY(0)';
        addButton.style.boxShadow = 'none';
    });

    addButton.addEventListener('click', () => {
        showAddEntryForm();
    });

    const exportButton = document.createElement('button');
    exportButton.innerHTML = '导出 · Export';
    exportButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(59, 130, 246, 0.7);
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    exportButton.addEventListener('mouseenter', () => {
        exportButton.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)';
        exportButton.style.transform = 'translateY(-1px)';
        exportButton.style.boxShadow = '0 3px 10px rgba(59, 130, 246, 0.5)';
    });

    exportButton.addEventListener('mouseleave', () => {
        exportButton.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)';
        exportButton.style.transform = 'translateY(0)';
        exportButton.style.boxShadow = 'none';
    });

    exportButton.addEventListener('click', () => {
        exportUserOptions();
    });

    actionButtons.appendChild(exportButton);

    const importButton = document.createElement('button');
    importButton.innerHTML = '导入 · Import';
    importButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(245, 158, 11, 0.7);
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    importButton.addEventListener('mouseenter', () => {
        importButton.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)';
        importButton.style.transform = 'translateY(-1px)';
        importButton.style.boxShadow = '0 3px 10px rgba(245, 158, 11, 0.5)';
    });

    importButton.addEventListener('mouseleave', () => {
        importButton.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)';
        importButton.style.transform = 'translateY(0)';
        importButton.style.boxShadow = 'none';
    });

    importButton.addEventListener('click', () => {
        importUserOptions();
    });

    actionButtons.appendChild(importButton);

    actionButtons.appendChild(addButton);

    footer.appendChild(statusText);
    footer.appendChild(actionButtons);
    
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    
    overlay.addEventListener('keydown', (event) => {
        const target = event.target;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            event.stopImmediatePropagation();
            return;
        }
        
        event.stopImmediatePropagation();
    });
    
    return overlay;
}

function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    handle.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

async function loadCategoryData() {
    try {
        updateStatus('正在加载数据... · Loading data...');
        
        const response = await api.fetchApi('/zhiai/photograph/categories', {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        
        const categories = await response.json();
        console.log('Loaded categories from API:', categories);
        categoryData = {};
        
        const effectiveCategories = categories && categories.length > 0 ? categories :
            ['character', 'gender', 'facial_expressions', 'hair_style', 'hair_color', 'pose', 'head_movements', 'hand_movements', 'leg_foot_movements', 'orientation', 'top', 'bottom', 'boots', 'socks', 'accessories', 'tattoo', 'tattoo_location', 'camera', 'lens', 'lighting', 'perspective', 'location', 'weather', 'season', 'color_tone', 'mood_atmosphere', 'photography_style', 'photography_technique', 'post_processing', 'depth_of_field', 'composition', 'texture'];
        
        for (const category of effectiveCategories) {
            try {
                const dataResponse = await api.fetchApi(`/zhiai/photograph/category/${category}`, {
                    method: 'GET'
                });
                
                if (dataResponse.ok) {
                    const data = await dataResponse.json();

                    const userEntries = (data.user_entries || []).map(entry => {
                        if (typeof entry === 'string') {
                            const match = entry.match(/^(.+?)\s*\((.+)\)$/);
                            if (match) {
                                return {
                                    chinese: match[1].trim(),
                                    english: match[2]
                                };
                            }
                        }
                        return entry;
                    });

                    categoryData[category] = {
                        preset_entries: data.preset_entries || [],
                        user_entries: userEntries
                    };
                } else {
                    categoryData[category] = {
                        preset_entries: [],
                        user_entries: []
                    };
                }
            } catch (error) {
                console.error(`Error loading data for category ${category}:`, error);
                categoryData[category] = {
                    preset_entries: [],
                    user_entries: []
                };
            }
        }
        
        renderCategoryList(effectiveCategories);
        
        updateStatus('数据加载完成 · Data loaded successfully');
    } catch (error) {
        console.error('Error loading category data:', error);
        updateStatus('数据加载失败 · Failed to load data');
        showToast('❌ 数据加载失败，请检查网络连接', 'error');
        
        const defaultCategories = ['character', 'gender', 'facial_expressions', 'hair_style', 'hair_color', 'pose', 'head_movements', 'hand_movements', 'leg_foot_movements', 'orientation', 'top', 'bottom', 'boots', 'socks', 'accessories', 'tattoo', 'tattoo_location', 'camera', 'lens', 'lighting', 'perspective', 'location', 'weather', 'season', 'color_tone', 'mood_atmosphere', 'photography_style', 'photography_technique', 'post_processing', 'depth_of_field', 'composition', 'texture'];
        renderCategoryList(defaultCategories);
        showToast('⚠️ 显示默认分类 · Showing default categories', 'warning');
    }
}

const CATEGORY_NAME_MAP = {
    'character': '人物 · Character',
    'gender': '性别 · Gender',
    'facial_expressions': '面部表情 · Facial Expressions',
    'hair_style': '发型 · Hair Style',
    'hair_color': '发色 · Hair Color',
    'pose': '身躯姿势 · Body Pose',
    'head_movements': '头部动作 · Head Movements',
    'hand_movements': '手部动作 · Hand Movements',
    'leg_foot_movements': '腿脚动作 · Leg/Foot Movements',
    'orientation': '朝向 · Orientation',
    'top': '上衣 · Top',
    'bottom': '下装 · Bottom',
    'boots': '鞋子 · Boots',
    'socks': '袜子 · Socks',
    'accessories': '配饰 · Accessories',
    'tattoo': '纹身 · Tattoo',
    'tattoo_location': '纹身位置 · Tattoo Location',
    'camera': '相机 · Camera',
    'lens': '镜头 · Lens',
    'lighting': '灯光 · Lighting',
    'perspective': '视角 · Perspective',
    'location': '位置 · Location',
    'weather': '天气 · Weather',
    'season': '季节 · Season',
    'color_tone': '色调 · Color Tone',
    'mood_atmosphere': '氛围 · Mood Atmosphere',
    'photography_style': '摄影风格 · Photography Style',
    'photography_technique': '摄影技法 · Photography Technique',
    'post_processing': '后期处理 · Post Processing',
    'depth_of_field': '景深 · Depth of Field',
    'composition': '构图 · Composition',
    'texture': '质感 · Texture',
    'body_pose': '身躯姿势 · Body Pose',
    'bottoms': '下装 · Bottom',
    'tops': '上衣 · Top',
    'top_down': '视角 · Perspective'
};

function getCategoryDisplayName(category) {
    return CATEGORY_NAME_MAP[category] || category;
}

function renderCategoryList(categories) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        const userCount = categoryData[category]?.user_entries?.length || 0;
        const categoryName = document.createElement('span');
        categoryName.textContent = getCategoryDisplayName(category);
        categoryName.style.cssText = `
            flex: 1;
        `;

        const countBadge = document.createElement('span');
        countBadge.textContent = userCount.toString();
        countBadge.style.cssText = `
            padding: 2px 8px;
            border-radius: 10px;
            background: rgba(79, 172, 254, 0.3);
            color: #4facfe;
            font-size: 12px;
            font-weight: bold;
            min-width: 24px;
            text-align: center;
        `;

        categoryItem.appendChild(categoryName);
        categoryItem.appendChild(countBadge);
        categoryItem.dataset.category = category;
        categoryItem.style.cssText = `
            padding: 12px 15px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        categoryItem.addEventListener('mouseenter', () => {
            if (!categoryItem.classList.contains('selected')) {
                categoryItem.style.background = 'rgba(79, 172, 254, 0.2)';
                categoryItem.style.borderColor = 'rgba(79, 172, 254, 0.5)';
            }
        });

        categoryItem.addEventListener('mouseleave', () => {
            if (!categoryItem.classList.contains('selected')) {
                categoryItem.style.background = 'rgba(255, 255, 255, 0.05)';
                categoryItem.style.borderColor = 'transparent';
            }
        });

        categoryItem.addEventListener('click', () => {
            document.querySelectorAll('#category-list > div').forEach(item => {
                item.style.background = 'rgba(255, 255, 255, 0.05)';
                item.style.borderColor = 'transparent';
                item.style.borderLeft = 'none';
                item.style.boxShadow = 'none';
                item.classList.remove('selected');
            });
            categoryItem.style.background = 'linear-gradient(90deg, rgba(79, 172, 254, 0.3) 0%, rgba(79, 172, 254, 0.2) 100%)';
            categoryItem.style.borderColor = 'rgba(79, 172, 254, 0.8)';
            categoryItem.style.borderLeft = '4px solid #4facfe';
            categoryItem.style.boxShadow = '0 2px 8px rgba(79, 172, 254, 0.3)';
            categoryItem.classList.add('selected');

            loadCategoryEntries(category);
        });

        categoryList.appendChild(categoryItem);
    });
}

function loadCategoryEntries(category) {
    const categoryName = document.getElementById('current-category-name');
    categoryName.textContent = getCategoryDisplayName(category);
    categoryName.dataset.category = category;

    const entryList = document.getElementById('entry-list');
    entryList.innerHTML = '';

    const userEntries = categoryData[category]?.user_entries || [];

    if (userEntries.length > 0) {
        const userSection = createSectionHeader('用户自定义 · User-defined', '#10b981', true);
        entryList.appendChild(userSection);

        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 10px;
        `;

        userEntries.forEach((entry, index) => {
            const entryItem = createEntryItem(entry, index, false);
            entryItem.dataset.userIndex = index;
            gridContainer.appendChild(entryItem);
        });

        entryList.appendChild(gridContainer);
    }

    if (userEntries.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = '该分类暂无用户条目 · No user entries in this category';
        emptyMessage.style.cssText = `
            text-align: center;
            color: #aaa;
            padding: 20px;
            font-style: italic;
        `;
        entryList.appendChild(emptyMessage);
    }
}

function createSectionHeader(title, color, isUserSection) {
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 10px 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border-left: 4px solid ${color};
        margin: 10px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    titleElement.style.cssText = `
        margin: 0;
        color: ${color};
        font-size: 14px;
        font-weight: 600;
    `;
    
    header.appendChild(titleElement);
    
    if (isUserSection) {
        const infoText = document.createElement('span');
        infoText.textContent = '✏️ 可编辑 · Editable';
        infoText.style.cssText = `
            font-size: 14px;
            color: #aaa;
        `;
        header.appendChild(infoText);
    } else {
        const infoText = document.createElement('span');
        infoText.textContent = '🔒 预置保护 · Preset Protected';
        infoText.style.cssText = `
            font-size: 14px;
            color: #888;
        `;
        header.appendChild(infoText);
    }
    
    return header;
}

function createEntryItem(entry, index, isPreset) {
    const entryItem = document.createElement('div');
    entryItem.className = 'entry-item';
    entryItem.style.cssText = `
        position: relative;
        padding: 8px;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(16, 185, 129, 0.2);
        transition: all 0.2s ease;
        cursor: pointer;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const displayText = document.createElement('div');
    displayText.className = 'entry-display-text';

    let displayValue = '';
    if (typeof entry === 'object' && entry !== null && entry.chinese !== undefined && entry.english !== undefined) {
        displayValue = `${entry.chinese}(${entry.english})`;
    } else {
        displayValue = entry;
    }

    displayText.textContent = displayValue;
    displayText.style.cssText = `
        color: white;
        font-size: 13px;
        text-align: center;
        line-height: 1.4;
        word-break: break-word;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        padding: 0 4px;
    `;

    const actionButtons = document.createElement('div');
    actionButtons.className = 'entry-action-buttons';
    actionButtons.style.cssText = `
        position: absolute;
        top: 6px;
        right: 6px;
        display: none;
        gap: 4px;
        z-index: 10;
    `;

    const editButton = document.createElement('button');
    editButton.innerHTML = '✏️';
    editButton.title = '编辑条目 · Edit entry';
    editButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid rgba(79, 172, 254, 0.8);
        background: rgba(79, 172, 254, 1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    editButton.addEventListener('mouseenter', () => {
        editButton.style.background = 'rgba(79, 172, 254, 0.8)';
    });

    editButton.addEventListener('mouseleave', () => {
        editButton.style.background = 'rgba(79, 172, 254, 1)';
    });

    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showEditEntryDialog(entry, index);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '🗑️';
    deleteButton.title = '删除条目 · Delete entry';
    deleteButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid rgba(255, 100, 100, 0.8);
        background: rgba(200, 50, 50, 1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.background = 'rgba(200, 50, 50, 0.8)';
    });

    deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.background = 'rgba(200, 50, 50, 1)';
    });

    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const categoryNameElement = document.getElementById('current-category-name');
        const currentCategory = categoryNameElement.dataset.category;
        deleteEntry(currentCategory, index, false);
    });

    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteButton);

    entryItem.addEventListener('mouseenter', () => {
        if (!entryItem.classList.contains('selected')) {
            entryItem.style.background = 'rgba(16, 185, 129, 0.2)';
            entryItem.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        }
    });

    entryItem.addEventListener('mouseleave', () => {
        if (!entryItem.classList.contains('selected')) {
            entryItem.style.background = 'rgba(16, 185, 129, 0.1)';
            entryItem.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        }
    });

    entryItem.addEventListener('click', (e) => {
        if (e.target === editButton || e.target === deleteButton) {
            return;
        }

        const isCurrentlySelected = entryItem.classList.contains('selected');
        const gridContainer = entryItem.parentElement;
        const allEntryItems = gridContainer.querySelectorAll('.entry-item');

        allEntryItems.forEach(item => {
            item.classList.remove('selected');
            item.style.background = 'rgba(16, 185, 129, 0.1)';
            item.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            item.style.boxShadow = 'none';
            const buttons = item.querySelector('.entry-action-buttons');
            if (buttons) {
                buttons.style.display = 'none';
            }
        });

        if (!isCurrentlySelected) {
            entryItem.classList.add('selected');
            entryItem.style.background = 'rgba(16, 185, 129, 0.3)';
            entryItem.style.borderColor = 'rgba(16, 185, 129, 0.8)';
            entryItem.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            actionButtons.style.display = 'flex';
        }
    });

    entryItem.appendChild(displayText);
    entryItem.appendChild(actionButtons);

    return entryItem;
}

function showEditEntryDialog(entry, index) {
    const existingModal = document.getElementById('edit-entry-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'edit-entry-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;

    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 30px;
        width: 90%;
        max-width: 500px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.3s ease;
    `;

    const title = document.createElement('h3');
    title.textContent = '✏️ 编辑条目 · Edit Entry';
    title.style.cssText = `
        color: #4facfe;
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        text-align: center;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;

    let chineseValue = '';
    let englishValue = '';
    if (typeof entry === 'object' && entry !== null && entry.chinese !== undefined && entry.english !== undefined) {
        chineseValue = entry.chinese;
        englishValue = entry.english;
    }

    const chineseLabel = document.createElement('label');
    chineseLabel.textContent = '中文名称 · Chinese Name:';
    chineseLabel.style.cssText = `
        display: block;
        color: white;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
    `;

    const chineseInputContainer = document.createElement('div');
    chineseInputContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
        align-items: center;
    `;

    const chineseInput = document.createElement('input');
    chineseInput.type = 'text';
    chineseInput.value = chineseValue;
    chineseInput.placeholder = '请输入中文名称';
    chineseInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;

    chineseInput.addEventListener('focus', () => {
        chineseInput.style.borderColor = '#4facfe';
        chineseInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });

    chineseInput.addEventListener('blur', () => {
        chineseInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        chineseInput.style.boxShadow = 'none';
    });

    const chineseTranslateBtn = document.createElement('button');
    chineseTranslateBtn.innerHTML = '🌐 自动填充';
    chineseTranslateBtn.title = '自动翻译到英文';
    chineseTranslateBtn.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        white-space: nowrap;
    `;

    chineseTranslateBtn.addEventListener('click', async () => {
        const text = chineseInput.value.trim();
        if (!text) {
            showToast('⚠️ 请先输入中文名称', 'warning');
            return;
        }
        chineseTranslateBtn.disabled = true;
        chineseTranslateBtn.innerHTML = '⏳ 翻译中...';
        try {
            const translated = await translateText(text, 'en');
            englishInput.value = translated;
            showToast('✅ 翻译完成', 'success');
        } catch (error) {
            showToast('❌ 翻译失败，请重试', 'error');
        } finally {
            chineseTranslateBtn.disabled = false;
            chineseTranslateBtn.innerHTML = '🌐 自动填充';
        }
    });

    chineseInputContainer.appendChild(chineseInput);
    chineseInputContainer.appendChild(chineseTranslateBtn);

    const englishLabel = document.createElement('label');
    englishLabel.textContent = '英文名称 · English Name:';
    englishLabel.style.cssText = `
        display: block;
        color: white;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
    `;

    const englishInputContainer = document.createElement('div');
    englishInputContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        align-items: center;
    `;

    const englishInput = document.createElement('input');
    englishInput.type = 'text';
    englishInput.value = englishValue;
    englishInput.placeholder = '请输入英文名称';
    englishInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;

    englishInput.addEventListener('focus', () => {
        englishInput.style.borderColor = '#4facfe';
        englishInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });

    englishInput.addEventListener('blur', () => {
        englishInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        englishInput.style.boxShadow = 'none';
    });

    const englishTranslateBtn = document.createElement('button');
    englishTranslateBtn.innerHTML = '🌐 自动填充';
    englishTranslateBtn.title = '自动翻译到中文';
    englishTranslateBtn.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        white-space: nowrap;
    `;

    englishTranslateBtn.addEventListener('click', async () => {
        const text = englishInput.value.trim();
        if (!text) {
            showToast('⚠️ 请先输入英文名称', 'warning');
            return;
        }
        englishTranslateBtn.disabled = true;
        englishTranslateBtn.innerHTML = '⏳ 翻译中...';
        try {
            const translated = await translateText(text, 'zh');
            chineseInput.value = translated;
            showToast('✅ 翻译完成', 'success');
        } catch (error) {
            showToast('❌ 翻译失败，请重试', 'error');
        } finally {
            englishTranslateBtn.disabled = false;
            englishTranslateBtn.innerHTML = '🌐 自动填充';
        }
    });

    englishInputContainer.appendChild(englishInput);
    englishInputContainer.appendChild(englishTranslateBtn);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 25px;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消 · Cancel';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;

    cancelButton.addEventListener('click', () => {
        modal.remove();
    });

    const saveButton = document.createElement('button');
    saveButton.textContent = '保存 · Save';
    saveButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid rgba(16, 185, 129, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;

    saveButton.addEventListener('click', async () => {
        const newChineseName = chineseInput.value.trim();
        const newEnglishName = englishInput.value.trim();

        if (!newChineseName || !newEnglishName) {
            showToast('⚠️ 请填写中文名称和英文名称', 'warning');
            return;
        }

        const categoryNameElement = document.getElementById('current-category-name');
        const currentCategory = categoryNameElement.dataset.category;

        if (categoryData[currentCategory] && categoryData[currentCategory].user_entries[index]) {
            categoryData[currentCategory].user_entries[index] = {
                chinese: newChineseName,
                english: newEnglishName
            };

            await autoSaveCategory(currentCategory);
            loadCategoryEntries(currentCategory);

            showToast('✅ 条目已更新并自动保存', 'success');
            modal.remove();
        }
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);

    dialogContent.appendChild(title);
    dialogContent.appendChild(chineseLabel);
    dialogContent.appendChild(chineseInputContainer);
    dialogContent.appendChild(englishLabel);
    dialogContent.appendChild(englishInputContainer);
    dialogContent.appendChild(buttonContainer);

    modal.appendChild(dialogContent);
    document.body.appendChild(modal);
    chineseInput.focus();
}

function showAddEntryForm() {
    const categoryNameElement = document.getElementById('current-category-name');
    const categoryName = categoryNameElement?.dataset.category;

    if (!categoryName || categoryNameElement?.textContent === '请选择一个分类 - Please select a category') {
        showToast('⚠️ 请先在左侧选择一个分类 · Please select a category first', 'warning');
        return;
    }

    const editorContent = document.querySelector('#entry-list')?.parentElement;
    if (!editorContent) return;

    const existingForm = document.getElementById('add-entry-form');
    if (existingForm) {
        existingForm.remove();
    }

    const addButton = document.getElementById('add-entry-button');
    if (addButton) {
        addButton.style.display = 'none';
    }

    const modal = document.createElement('div');
    modal.id = 'add-entry-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;

    const formContainer = document.createElement('div');
    formContainer.id = 'add-entry-form';
    formContainer.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 30px;
        width: 90%;
        max-width: 500px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    const title = document.createElement('h3');
    title.textContent = '添加新条目 · Add New Entry';
    title.style.cssText = `
        margin: 0 0 15px 0;
        color: #10b981;
        font-size: 18px;
        text-align: center;
    `;

    const chineseLabel = document.createElement('label');
    chineseLabel.textContent = '中文名称 · Chinese Name:';
    chineseLabel.style.cssText = `
        display: block;
        margin-bottom: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
    `;

    const chineseInputContainer = document.createElement('div');
    chineseInputContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
        align-items: center;
    `;

    const chineseInput = document.createElement('input');
    chineseInput.type = 'text';
    chineseInput.placeholder = '请输入中文名称 · Please enter Chinese name';
    chineseInput.id = 'chinese-name-input';
    chineseInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 16px;
        box-sizing: border-box;
    `;

    const chineseTranslateBtn = document.createElement('button');
    chineseTranslateBtn.innerHTML = '🌐 自动填充';
    chineseTranslateBtn.title = '自动翻译到英文 · Auto-translate to English';
    chineseTranslateBtn.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        display: none;
        white-space: nowrap;
    `;

    chineseTranslateBtn.addEventListener('mouseenter', () => {
        chineseTranslateBtn.style.background = 'rgba(79, 172, 254, 0.3)';
        chineseTranslateBtn.style.transform = 'scale(1.05)';
    });

    chineseTranslateBtn.addEventListener('mouseleave', () => {
        chineseTranslateBtn.style.background = 'rgba(79, 172, 254, 0.15)';
        chineseTranslateBtn.style.transform = 'scale(1)';
    });

    chineseTranslateBtn.addEventListener('click', async () => {
        const text = chineseInput.value.trim();
        if (!text) {
            showToast('⚠️ 请先输入中文名称', 'warning');
            return;
        }

        chineseTranslateBtn.disabled = true;
        chineseTranslateBtn.innerHTML = '⏳ 翻译中...';

        try {
            const translated = await translateText(text, 'en');
            englishInput.value = translated;
            showToast('✅ 翻译完成', 'success');
            updateTranslateButtonsVisibility();
        } catch (error) {
            showToast('❌ 翻译失败，请重试', 'error');
        } finally {
            chineseTranslateBtn.disabled = false;
            chineseTranslateBtn.innerHTML = '🌐 自动填充';
        }
    });

    chineseInputContainer.appendChild(chineseInput);
    chineseInputContainer.appendChild(chineseTranslateBtn);

    const englishLabel = document.createElement('label');
    englishLabel.textContent = '英文名称 · English Name:';
    englishLabel.style.cssText = `
        display: block;
        margin-bottom: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
    `;

    const englishInputContainer = document.createElement('div');
    englishInputContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        align-items: center;
    `;

    const englishInput = document.createElement('input');
    englishInput.type = 'text';
    englishInput.placeholder = '请输入英文名称 · Please enter English name';
    englishInput.id = 'english-name-input';
    englishInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 16px;
        box-sizing: border-box;
    `;

    const englishTranslateBtn = document.createElement('button');
    englishTranslateBtn.innerHTML = '🌐 自动填充';
    englishTranslateBtn.title = '自动翻译到中文 · Auto-translate to Chinese';
    englishTranslateBtn.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        display: none;
        white-space: nowrap;
    `;

    englishTranslateBtn.addEventListener('mouseenter', () => {
        englishTranslateBtn.style.background = 'rgba(79, 172, 254, 0.3)';
        englishTranslateBtn.style.transform = 'scale(1.05)';
    });

    englishTranslateBtn.addEventListener('mouseleave', () => {
        englishTranslateBtn.style.background = 'rgba(79, 172, 254, 0.15)';
        englishTranslateBtn.style.transform = 'scale(1)';
    });

    englishTranslateBtn.addEventListener('click', async () => {
        const text = englishInput.value.trim();
        if (!text) {
            showToast('⚠️ 请先输入英文名称', 'warning');
            return;
        }

        englishTranslateBtn.disabled = true;
        englishTranslateBtn.innerHTML = '⏳ 翻译中...';

        try {
            const translated = await translateText(text, 'zh');
            chineseInput.value = translated;
            showToast('✅ 翻译完成', 'success');
            updateTranslateButtonsVisibility();
        } catch (error) {
            showToast('❌ 翻译失败，请重试', 'error');
        } finally {
            englishTranslateBtn.disabled = false;
            englishTranslateBtn.innerHTML = '🌐 自动填充';
        }
    });

    englishInputContainer.appendChild(englishInput);
    englishInputContainer.appendChild(englishTranslateBtn);

    function updateTranslateButtonsVisibility() {
        const chineseValue = chineseInput.value.trim();
        const englishValue = englishInput.value.trim();

        if (chineseValue && !englishValue) {
            chineseTranslateBtn.style.display = 'block';
        } else {
            chineseTranslateBtn.style.display = 'none';
        }

        if (englishValue && !chineseValue) {
            englishTranslateBtn.style.display = 'block';
        } else {
            englishTranslateBtn.style.display = 'none';
        }
    }

    chineseInput.addEventListener('input', updateTranslateButtonsVisibility);
    englishInput.addEventListener('input', updateTranslateButtonsVisibility);

    updateTranslateButtonsVisibility();

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消 · Cancel';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;

    const submitButton = document.createElement('button');
    submitButton.textContent = '确认添加 · Confirm Add';
    submitButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(59, 130, 246, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    submitButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid rgba(16, 185, 129, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;

    cancelButton.addEventListener('click', () => {
        modal.remove();
        const addButton = document.getElementById('add-entry-button');
        if (addButton) {
            addButton.style.display = '';
        }
    });

    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    submitButton.addEventListener('mouseenter', () => {
        submitButton.style.transform = 'translateY(-2px)';
        submitButton.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.4)';
    });

    submitButton.addEventListener('mouseleave', () => {
        submitButton.style.transform = 'translateY(0)';
        submitButton.style.boxShadow = 'none';
    });

    submitButton.addEventListener('click', () => {
        const chineseName = chineseInput.value.trim();
        const englishName = englishInput.value.trim();

        if (!chineseName || !englishName) {
            showToast('⚠️ 请填写中文名称和英文名称', 'warning');
            return;
        }

        addNewEntry(chineseName, englishName);
        modal.remove();
    });

    chineseInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            englishInput.focus();
        }
    });

    englishInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(submitButton);
    formContainer.appendChild(title);
    formContainer.appendChild(chineseLabel);
    formContainer.appendChild(chineseInputContainer);
    formContainer.appendChild(englishLabel);
    formContainer.appendChild(englishInputContainer);
    formContainer.appendChild(buttonContainer);
    modal.appendChild(formContainer);
    document.body.appendChild(modal);
    chineseInput.focus();
}

async function addNewEntry(chineseName, englishName) {
    if (!chineseName || !englishName) {
        showToast('⚠️ 请输入有效的条目内容', 'warning');
        return;
    }

    const categoryNameElement = document.getElementById('current-category-name');
    const categoryName = categoryNameElement.dataset.category;

    if (!categoryName || categoryNameElement.textContent === '请选择一个分类 · Please select a category') {
        showToast('⚠️ 请先选择一个分类', 'warning');
        return;
    }

    if (!categoryData[categoryName]) {
        categoryData[categoryName] = { preset_entries: [], user_entries: [] };
    }
    if (!categoryData[categoryName].user_entries) {
        categoryData[categoryName].user_entries = [];
    }

    const entryObject = {
        chinese: chineseName,
        english: englishName
    };

    categoryData[categoryName].user_entries.push(entryObject);

    await autoSaveCategory(categoryName);
    loadCategoryEntries(categoryName);
    updateCategoryCount(categoryName);
    showToast('✅ 条目已添加并自动保存', 'success');
}

async function deleteEntry(category, index, isPreset) {
    if (isPreset) {
        showToast('⚠️ 预置选项不能删除 · Preset options cannot be deleted', 'warning');
        return;
    }

    if (!categoryData[category] || !categoryData[category].user_entries || index >= categoryData[category].user_entries.length) {
        return;
    }

    if (confirm(`确定要删除 "${categoryData[category].user_entries[index]}" 吗？\nAre you sure you want to delete "${categoryData[category].user_entries[index]}"?`)) {
        categoryData[category].user_entries.splice(index, 1);

        await autoSaveCategory(category);
        loadCategoryEntries(category);
        updateCategoryCount(category);
        showToast('✅ 条目已删除并自动保存', 'success');
    }
}

function updateCategoryCount(categoryName) {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;

    const categoryItems = categoryList.querySelectorAll('[data-category]');
    for (const item of categoryItems) {
        if (item.dataset.category === categoryName) {
            const countBadge = item.querySelector('span:last-child');
            if (countBadge) {
                const userCount = categoryData[categoryName]?.user_entries?.length || 0;
                countBadge.textContent = userCount.toString();
            }
            break;
        }
    }
}

async function autoSaveCategory(categoryName) {
    if (!categoryName) {
        console.error('No category name provided for auto-save');
        return;
    }

    try {
        updateStatus('自动保存中... · Auto-saving...');

        const userEntries = categoryData[categoryName]?.user_entries || [];
        const formattedEntries = userEntries.map(entry => {
            if (typeof entry === 'object' && entry !== null && entry.chinese && entry.english) {
                return `${entry.chinese} (${entry.english})`;
            }
            return entry;
        });

        const response = await api.fetchApi(`/zhiai/photograph/category/${categoryName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_entries: formattedEntries
            })
        });

        if (response.ok) {
            updateStatus('自动保存成功 · Auto-saved successfully');

            await refreshNodeDefinitions();
        } else {
            throw new Error('Auto-save failed');
        }
    } catch (error) {
        console.error('Auto-save error:', error);
        updateStatus('自动保存失败 · Auto-save failed');
        showToast('❌ 自动保存失败，请重试', 'error');
    }
}

async function refreshNodeDefinitions() {
    try {
        const response = await api.fetchApi('/object_info', { cache: 'no-store' });

        if (response.ok) {
            const nodeDefinitions = await response.json();

            if (app && app.nodeOutputs) {
                app.nodeOutputs = nodeDefinitions;
            }

            if (app && app.graph && app.graph._nodes) {
                for (const node of app.graph._nodes) {
                    if (node.type === 'PhotographPromptGenerator') {
                        const nodeDef = nodeDefinitions['PhotographPromptGenerator'];
                        if (nodeDef && nodeDef.input && nodeDef.input.required) {
                            for (const widget of node.widgets) {
                                const inputDef = nodeDef.input.required[widget.name];
                                if (inputDef && Array.isArray(inputDef[0])) {
                                    widget.options.values = inputDef[0];
                                    if (!inputDef[0].includes(widget.value)) {
                                        widget.value = inputDef[0][0];
                                    }
                                }
                            }

                            node.setDirtyCanvas(true, true);
                        }
                    }
                }
            }

            console.log('Node definitions refreshed successfully');
        }
    } catch (error) {
        console.error('Error refreshing node definitions:', error);
    }
}

function exportUserOptions() {
    const exportData = {};
    for (const category in categoryData) {
        const userEntries = categoryData[category]?.user_entries || [];
        if (userEntries.length > 0) {
            exportData[category] = userEntries;
        }
    }

    if (Object.keys(exportData).length === 0) {
        showToast('⚠️ 没有可导出的用户选项', 'warning');
        return;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const timestamp = new Date().toISOString().slice(0, 10);
    a.download = `photograph-prompt-user-options-${timestamp}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    updateStatus('导出成功 · Exported successfully');
    showToast('✅ 用户选项已导出', 'success');
}

function importUserOptions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                if (typeof importedData !== 'object' || importedData === null) {
                    showToast('❌ JSON文件格式不正确', 'error');
                    return;
                }

                let importCount = 0;
                const errors = [];

                for (const category in importedData) {
                    const entries = importedData[category];

                    if (!entries || !Array.isArray(entries) || entries.length === 0) {
                        continue;
                    }

                    const formattedEntries = entries.map(entry => {
                        if (typeof entry === 'string') {
                            const match = entry.match(/^(.+?)\s*\((.+)\)$/);
                            if (match) {
                                return entry;
                            }
                            return entry;
                        }
                        if (typeof entry === 'object' && entry.chinese && entry.english) {
                            return `${entry.chinese} (${entry.english})`;
                        }
                        return entry;
                    });

                    if (!categoryData[category]) {
                        categoryData[category] = { preset_entries: [], user_entries: [] };
                    }
                    if (!categoryData[category].user_entries) {
                        categoryData[category].user_entries = [];
                    }

                    const existingEntries = categoryData[category].user_entries.map(ent => {
                        if (typeof ent === 'string') return ent;
                        return `${ent.chinese} (${ent.english})`;
                    });

                    const newEntries = formattedEntries.filter(ent => !existingEntries.includes(ent));

                    if (newEntries.length > 0) {
                        categoryData[category].user_entries.push(...newEntries);
                        importCount += newEntries.length;

                        try {
                            const response = await api.fetchApi(`/zhiai/photograph/category/${category}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    user_entries: categoryData[category].user_entries
                                })
                            });

                            if (!response.ok) {
                                errors.push(category);
                            }
                        } catch (err) {
                            console.error(`Failed to save category ${category}:`, err);
                            errors.push(category);
                        }
                    }
                }

                await refreshNodeDefinitions();
                const categoryNameElement = document.getElementById('current-category-name');
                const currentCategory = categoryNameElement?.dataset.category;
                if (currentCategory) {
                    loadCategoryEntries(currentCategory);
                    updateCategoryCount(currentCategory);
                }

                for (const cat in categoryData) {
                    updateCategoryCount(cat);
                }

                if (errors.length > 0) {
                    showToast(`⚠️ 部分分类导入失败: ${errors.join(', ')}`, 'warning');
                } else if (importCount > 0) {
                    showToast(`✅ 成功导入 ${importCount} 个选项`, 'success');
                } else {
                    showToast('ℹ️ 没有新的选项需要导入', 'info');
                }

            } catch (error) {
                console.error('Import error:', error);
                showToast('❌ JSON文件解析失败', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function updateStatus(text) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.textContent = text;
    }
}

function openTemplateEditorHelper(node) {
    if (currentTemplateHelperDialog) {
        currentTemplateHelperDialog.remove();
    }

    currentTemplateNode = node;

    TemplateManager.initialize().then(() => {
        currentTemplateHelperDialog = createTemplateEditorHelperDialog();
        document.body.appendChild(currentTemplateHelperDialog);
        currentTemplateHelperDialog.style.display = 'block';
        syncNodeToTemplate();
    });
}

function createTemplateEditorHelperDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: none;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 108%;
        max-width: 1440px;
        height: 66vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '模版编辑·Template Editor';
    title.style.cssText = `
        margin: 0;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-align: center;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
        closeButton.style.transform = 'scale(1.1)';
        closeButton.style.boxShadow = '0 4px 15px rgba(255, 68, 68, 0.5)';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        closeButton.style.transform = 'scale(1)';
        closeButton.style.boxShadow = 'none';
    });
    
    closeButton.addEventListener('click', () => {
        overlay.remove();
        currentTemplateHelperDialog = null;
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        display: flex;
        overflow: hidden;
        padding: 20px;
        gap: 20px;
    `;
    
    const templatePanelsContainer = document.createElement('div');
    templatePanelsContainer.style.cssText = `
        width: 230px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    `;
    
    const presetPanel = document.createElement('div');
    presetPanel.style.cssText = `
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 10px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    `;
    
    const presetPanelTitle = document.createElement('h3');
    presetPanelTitle.textContent = '模版预设 - Templates Preset';
    presetPanelTitle.style.cssText = `
        color: #10b981;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 13px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 5px;
        line-height: 1.2;
    `;
    
    const presetList = document.createElement('div');
    presetList.id = 'preset-list';
    presetList.style.cssText = `
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        gap: 6px;
    `;
    
    presetPanel.appendChild(presetPanelTitle);
    presetPanel.appendChild(presetList);
    
    const customPanel = document.createElement('div');
    customPanel.style.cssText = `
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 10px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    `;
    
    const customPanelTitle = document.createElement('h3');
    customPanelTitle.textContent = '我的模版 - My Templates';
    customPanelTitle.style.cssText = `
        color: #ff8c00;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 13px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 5px;
        line-height: 1.2;
    `;
    
    const customList = document.createElement('div');
    customList.id = 'custom-list';
    customList.style.cssText = `
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        gap: 6px;
    `;
    
    customPanel.appendChild(customPanelTitle);
    customPanel.appendChild(customList);
    
    templatePanelsContainer.appendChild(presetPanel);
    templatePanelsContainer.appendChild(customPanel);
    
    populatePresetTemplates(presetList);
    populateCustomTemplates(customList);
    
    const editorArea = document.createElement('div');
    editorArea.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        overflow: hidden;
    `;
    
    const editorHeader = document.createElement('div');
    editorHeader.style.cssText = `
        padding: 10px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const editorTitle = document.createElement('h3');
    editorTitle.textContent = '快速插入引用符 - Quick Insert Symbols';
    editorTitle.style.cssText = `
        color: #4facfe;
        margin: 0;
        font-size: 15px;
    `;
    
    const syncToNodeButton = document.createElement('button');
    syncToNodeButton.innerHTML = '应用 · Apply';
    syncToNodeButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(168, 85, 247, 0.7);
        background: linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 60px;
    `;

    syncToNodeButton.addEventListener('mouseenter', () => {
        syncToNodeButton.style.transform = 'translateY(-2px)';
        syncToNodeButton.style.boxShadow = '0 4px 8px rgba(168, 85, 247, 0.3)';
    });

    syncToNodeButton.addEventListener('mouseleave', () => {
        syncToNodeButton.style.transform = 'translateY(0)';
        syncToNodeButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });

    syncToNodeButton.addEventListener('click', () => {
        applyTemplateToNode();
    });
    
    const saveTemplateButton = document.createElement('button');
    saveTemplateButton.innerHTML = '保存模版 · Save Template';
    saveTemplateButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(16, 185, 129, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 50px;
    `;
    
    saveTemplateButton.addEventListener('mouseenter', () => {
        saveTemplateButton.style.transform = 'translateY(-2px)';
        saveTemplateButton.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
    });
    
    saveTemplateButton.addEventListener('mouseleave', () => {
        saveTemplateButton.style.transform = 'translateY(0)';
        saveTemplateButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    saveTemplateButton.addEventListener('click', () => {
        saveCustomTemplate();
    });
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
    `;
    
    const clearButton = document.createElement('button');
    clearButton.innerHTML = '清除 · Clear';
    clearButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(239, 68, 68, 0.7);
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 50px;
        margin-left: 60px;
    `;
    
    clearButton.addEventListener('mouseenter', () => {
        clearButton.style.transform = 'translateY(-2px)';
        clearButton.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
    });
    
    clearButton.addEventListener('mouseleave', () => {
        clearButton.style.transform = 'translateY(0)';
        clearButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    clearButton.addEventListener('click', () => {
        if (currentTemplateEditor) {
            currentTemplateEditor.innerHTML = '';
            showToast('✅ 文本框内容已清除', 'success');
        }
    });
    
    const exportButton = document.createElement('button');
    exportButton.innerHTML = '导出 · Export';
    exportButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(59, 130, 246, 0.7);
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 50px;
    `;
    
    exportButton.addEventListener('mouseenter', () => {
        exportButton.style.transform = 'translateY(-2px)';
        exportButton.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
    });
    
    exportButton.addEventListener('mouseleave', () => {
        exportButton.style.transform = 'translateY(0)';
        exportButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    exportButton.addEventListener('click', () => {
        TemplateManager.exportTemplates();
    });
    
    const importButton = document.createElement('button');
    importButton.innerHTML = '导入 · Import';
    importButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(245, 158, 11, 0.7);
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 50px;
    `;
    
    importButton.addEventListener('mouseenter', () => {
        importButton.style.transform = 'translateY(-2px)';
        importButton.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.3)';
    });
    
    importButton.addEventListener('mouseleave', () => {
        importButton.style.transform = 'translateY(0)';
        importButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    importButton.addEventListener('click', () => {
        TemplateManager.importTemplates();
    });
    
    buttonContainer.appendChild(exportButton);
    buttonContainer.appendChild(importButton);
    buttonContainer.appendChild(saveTemplateButton);
    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(syncToNodeButton);
    
    editorHeader.appendChild(editorTitle);
    editorHeader.appendChild(buttonContainer);
    
    const quickInsertContainer = document.createElement('div');
    quickInsertContainer.style.cssText = `
        padding: 10px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-height: 280px;
        overflow-y: auto;
        overflow-x: hidden;
    `;
    
    const quickInsertContent = document.createElement('div');
    quickInsertContent.id = 'quick-insert-content';
    quickInsertContent.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        width: 100%;
    `;
    
    quickInsertContainer.appendChild(quickInsertContent);
        
    const editorContent = document.createElement('div');
    editorContent.style.cssText = `
        flex: 1;
        padding: 15px;
        display: flex;
        flex-direction: column;
    `;
    
    const editorWrapper = document.createElement('div');
    editorWrapper.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
    `;

    const templateEditor = document.createElement('div');
    templateEditor.id = 'template-editor';
    templateEditor.contentEditable = true;
    templateEditor.dataset.placeholder = '在这里编写您的模版...\nWrite your template here...\n\n使用上方的快速插入按钮来添加引用符。\nUse the quick insert buttons above to add reference symbols.';
    templateEditor.style.cssText = `
        flex: 1;
        width: 100%;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
        outline: none;
        line-height: 1.8;
        overflow-y: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    `;

    const placeholderStyle = document.createElement('style');
    placeholderStyle.textContent = `
        #template-editor:empty:before {
            content: attr(data-placeholder);
            color: rgba(255, 255, 255, 0.4);
            white-space: pre-wrap;
        }

        .reference-tag {
            display: inline-flex;
            align-items: center;
            padding: 2px 5px;
            margin: 0 1px;
            border-radius: 4px;
            border: 1px solid rgba(79, 172, 254, 0.6);
            background: rgba(79, 172, 254, 0.15);
            color: white;
            font-size: 13px;
            font-weight: normal;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            user-select: none;
            vertical-align: baseline;
            white-space: nowrap;
            line-height: 1.4;
        }

        .reference-tag:hover {
            box-shadow: 0 4px 8px rgba(79, 172, 254, 0.3);
            background: rgba(79, 172, 254, 0.25);
            border-color: rgba(79, 172, 254, 0.8);
        }

        .reference-tag:active {
            transform: translateY(0);
        }

        .tag-menu {
            position: absolute;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(79, 172, 254, 0.5);
            border-radius: 8px;
            padding: 8px 0;
            min-width: 160px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            z-index: 10003;
            max-height: 300px;
            overflow-y: auto;
        }

        .tag-menu-item {
            padding: 8px 16px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }

        .tag-menu-item:hover {
            background: rgba(79, 172, 254, 0.2);
        }

        .tag-menu-item.current {
            background: rgba(79, 172, 254, 0.3);
            font-weight: bold;
        }

        .tag-menu-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            margin: 4px 0;
        }

        .tag-menu-delete {
            color: #ef4444;
        }

        .tag-menu-delete:hover {
            background: rgba(239, 68, 68, 0.2);
        }
    `;
    document.head.appendChild(placeholderStyle);

    currentTemplateEditor = templateEditor;

    templateEditor.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');

        if (text.match(/\{[^}]+\}/)) {
            const fragment = parseTemplateToElements(text);
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(fragment);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else {
            insertPlainText(text);
        }
    });

    editorWrapper.appendChild(templateEditor);
    editorContent.appendChild(editorWrapper);
    
    editorArea.appendChild(editorHeader);
    editorArea.appendChild(quickInsertContainer);
    editorArea.appendChild(editorContent);
    
    content.appendChild(templatePanelsContainer);
    content.appendChild(editorArea);
    
    dialog.appendChild(header);
    dialog.appendChild(content);
    
    overlay.appendChild(dialog);
    
    populateQuickInsertPanel(quickInsertContent);
    overlay.addEventListener('keydown', (event) => {
        const target = event.target;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            event.stopImmediatePropagation();
            return;
        }
        
        event.stopImmediatePropagation();
    });
        
    return overlay;
}

async function populatePresetTemplates(container) {
    try {
        const response = await fetch('/zhiai/photograph/template_presets');
        const templatePresets = await response.json();
        
        container.innerHTML = '';
        
        templatePresets.forEach(preset => {
            const button = createTemplateButton(preset.name, preset.template, 'preset');
            container.appendChild(button);
        });
    } catch (error) {
        console.error('Failed to load template presets:', error);
        container.innerHTML = '<div style="color: rgba(255, 255, 255, 0.5); font-size: 14px; text-align: center; padding: 20px;">加载失败 · Failed to load</div>';
    }
}

function populateCustomTemplates(container) {
    container.innerHTML = '';
    
    const currentCustomTemplates = TemplateManager.getTemplates();
    if (currentCustomTemplates.length > 0) {
        currentCustomTemplates.forEach((customTemplate, index) => {
            const button = createTemplateButton(customTemplate.name, customTemplate.template, 'custom', index);
            container.appendChild(button);
        });
    } else {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = '暂无自定义模版\nNo custom templates';
        emptyMessage.style.cssText = `
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
            text-align: center;
            padding: 20px;
            line-height: 1.4;
        `;
        container.appendChild(emptyMessage);
    }
}

function populateTemplatePresets(container) {
    const presetContainer = document.createElement('div');
    const customContainer = document.createElement('div');
    
    populatePresetTemplates(presetContainer);
    populateCustomTemplates(customContainer);
    
    container.innerHTML = '';
    container.appendChild(presetContainer);
    
    if (customContainer.children.length > 0) {
        const separator = document.createElement('div');
        separator.style.cssText = `
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.2);
            margin: 15px 0;
        `;
        container.appendChild(separator);
        container.appendChild(customContainer);
    }
}

function createTemplateButton(name, template, type = 'preset', index = null) {
    const button = document.createElement('button');
    button.textContent = name;
    
    const presetColor = { border: 'rgba(16, 185, 129, 0.5)', bg: 'rgba(16, 185, 129, 0.1)', hover: 'rgba(16, 185, 129, 0.2)', shadow: 'rgba(16, 185, 129, 0.2)' };
    const customColor = { border: 'rgba(255, 140, 0, 0.8)', bg: 'rgba(255, 140, 0, 0.15)', hover: 'rgba(255, 140, 0, 0.25)', shadow: 'rgba(255, 140, 0, 0.3)' };
    
    const colors = type === 'custom' ? customColor : presetColor;
    
    button.style.cssText = `
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid ${colors.border};
        background: ${colors.bg};
        color: white;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        outline: none;
        line-height: 1.2;
        word-wrap: normal;
        white-space: nowrap;
        width: fit-content;
        max-width: 100%;
        position: relative;
    `;
    
    if (type === 'custom' && index !== null) {
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '×';
        deleteButton.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: none;
            background: rgba(239, 68, 68, 0.8);
            color: white;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            transition: all 0.2s ease;
        `;
        
        deleteButton.addEventListener('mouseenter', () => {
            deleteButton.style.background = 'rgba(239, 68, 68, 1)';
            deleteButton.style.transform = 'scale(1.1)';
        });
        
        deleteButton.addEventListener('mouseleave', () => {
            deleteButton.style.background = 'rgba(239, 68, 68, 0.8)';
            deleteButton.style.transform = 'scale(1)';
        });
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCustomTemplate(index);
        });
        
        button.appendChild(deleteButton);
    }
    
    button.addEventListener('mouseenter', () => {
        button.style.background = colors.hover;
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = `0 4px 8px ${colors.shadow}`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = colors.bg;
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
    });
    
    button.addEventListener('click', () => {
        if (type === 'custom') {
            applyTemplatePreset(template);
        } else {
            applyTemplatePreset(template);
        }
    });
    
    return button;
}

function applyTemplatePreset(template) {
    if (!currentTemplateEditor) return;

    currentTemplateEditor.innerHTML = '';

    const parsedContent = parseTemplateToElements(template);
    currentTemplateEditor.appendChild(parsedContent);
    currentTemplateEditor.focus();

    showToast('✅ 模版已应用', 'success');
}

function parseTemplateToElements(text) {
    const fragment = document.createDocumentFragment();

    const regex = /\{[^}]+\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const textNode = document.createTextNode(text.substring(lastIndex, match.index));
            fragment.appendChild(textNode);
        }

        const tag = createReferenceTagElement(match[0]);
        fragment.appendChild(tag);

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        const textNode = document.createTextNode(text.substring(lastIndex));
        fragment.appendChild(textNode);
    }

    return fragment;
}

function getTemplateContent() {
    if (!currentTemplateEditor) return '';

    let content = '';

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.parentElement.classList || !node.parentElement.classList.contains('reference-tag')) {
                content += node.textContent;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList.contains('reference-tag')) {
                content += node.dataset.symbol;
            } else {
                node.childNodes.forEach(child => processNode(child));
            }
        }
    }

    currentTemplateEditor.childNodes.forEach(child => processNode(child));

    return content;
}

function saveCustomTemplate() {
    if (!currentTemplateEditor) return;

    const templateContent = getTemplateContent().trim();
    if (!templateContent) {
        showToast('❌ 请先编写模版内容', 'error');
        return;
    }

    showCustomTemplateDialog(templateContent);
}

function showCustomTemplateDialog(templateContent) {
    const existingModal = document.getElementById('custom-template-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'custom-template-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 36px;
        width: 90%;
        max-width: 600px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        position: relative;
        animation: modalSlideIn 0.3s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    const title = document.createElement('h3');
    title.textContent = '💾 保存自定义模版';
    title.style.cssText = `
        color: #4facfe;
        margin: 0 0 25px 0;
        font-size: 20px;
        font-weight: 600;
        text-align: center;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    
    const chineseLabel = document.createElement('label');
    chineseLabel.textContent = '中文名称';
    chineseLabel.style.cssText = `
        display: block;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
    `;
    
    const chineseInput = document.createElement('input');
    chineseInput.type = 'text';
    chineseInput.placeholder = '请输入中文名称';
    chineseInput.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;
    
    chineseInput.addEventListener('focus', () => {
        chineseInput.style.borderColor = '#4facfe';
        chineseInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });
    
    chineseInput.addEventListener('blur', () => {
        chineseInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        chineseInput.style.boxShadow = 'none';
    });
    
    const englishLabel = document.createElement('label');
    englishLabel.textContent = 'English Name';
    englishLabel.style.cssText = `
        display: block;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
    `;
    
    const englishInput = document.createElement('input');
    englishInput.type = 'text';
    englishInput.placeholder = 'Please enter English name';
    englishInput.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        margin-bottom: 25px;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;
    
    englishInput.addEventListener('focus', () => {
        englishInput.style.borderColor = '#4facfe';
        englishInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });
    
    englishInput.addEventListener('blur', () => {
        englishInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        englishInput.style.boxShadow = 'none';
    });
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: flex-end;
    `;
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消 Cancel';
    cancelButton.style.cssText = `
        padding: 12px 24px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;
    
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存 Save';
    saveButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(16, 185, 129, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        line-height: 1.2;
        min-width: 50px;
    `;
    
    saveButton.addEventListener('mouseenter', () => {
        saveButton.style.transform = 'translateY(-1px)';
        saveButton.style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.3)';
    });
    
    saveButton.addEventListener('mouseleave', () => {
        saveButton.style.transform = 'translateY(0)';
        saveButton.style.boxShadow = 'none';
    });
    
    cancelButton.addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    });
    
    saveButton.addEventListener('click', () => {
        const chineseName = chineseInput.value.trim();
        const englishName = englishInput.value.trim();
        
        if (!chineseName) {
            showToast('❌ 请输入中文名称', 'error');
            chineseInput.focus();
            return;
        }
        
        if (!englishName) {
            showToast('❌ 请输入英文名称', 'error');
            englishInput.focus();
            return;
        }
        
        const existingTemplate = customTemplates.find(t => t.name === `${chineseName} · ${englishName}`);
        if (existingTemplate) {
            showToast('❌ 模版名称已存在', 'error');
            return;
        }
        
        customTemplates.push({
            name: `${chineseName} · ${englishName}`,
            chineseName: chineseName,
            englishName: englishName,
            template: templateContent
        });
        
        TemplateManager.saveTemplates(customTemplates);
        
        const presetList = document.querySelector('#preset-list');
        const customList = document.querySelector('#custom-list');
        if (presetList) {
            populatePresetTemplates(presetList);
        }
        if (customList) {
            populateCustomTemplates(customList);
        }
        
        modal.remove();
        style.remove();
        
        showToast('✅ 模版已保存', 'success');
    });
    
    dialogContent.appendChild(title);
    dialogContent.appendChild(chineseLabel);
    dialogContent.appendChild(chineseInput);
    dialogContent.appendChild(englishLabel);
    dialogContent.appendChild(englishInput);
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);
    dialogContent.appendChild(buttonContainer);
    
    modal.appendChild(dialogContent);
    document.body.appendChild(modal);
    
    chineseInput.focus();
}

function deleteCustomTemplate(index) {
    showDeleteConfirmDialog(index);
}

function showDeleteConfirmDialog(index) {
    const existingModal = document.getElementById('delete-confirm-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'delete-confirm-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 36px;
        width: 90%;
        max-width: 540px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        position: relative;
        animation: modalSlideIn 0.3s ease;
    `;
    
    const icon = document.createElement('div');
    icon.innerHTML = '⚠️';
    icon.style.cssText = `
        font-size: 48px;
        text-align: center;
        margin-bottom: 20px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '确认删除';
    title.style.cssText = `
        color: #ef4444;
        margin: 0 0 15px 0;
        font-size: 20px;
        font-weight: 600;
        text-align: center;
    `;
    
    const message = document.createElement('p');
    message.innerHTML = '确定要删除这个自定义模版吗？<br>Are you sure you want to delete this custom template?';
    message.style.cssText = `
        color: #fff;
        font-size: 14px;
        line-height: 1.5;
        text-align: center;
        margin: 0 0 25px 0;
        opacity: 0.9;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
    `;
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消 Cancel';
    cancelButton.style.cssText = `
        padding: 12px 24px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        min-width: 100px;
    `;
    
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
        cancelButton.style.transform = 'translateY(-2px)';
    });
    
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.1)';
        cancelButton.style.transform = 'translateY(0)';
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '删除 Delete';
    deleteButton.style.cssText = `
        padding: 12px 24px;
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.7);
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        min-width: 100px;
    `;
    
    deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.transform = 'translateY(-2px)';
        deleteButton.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
    });
    
    deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.transform = 'translateY(0)';
        deleteButton.style.boxShadow = 'none';
    });
    
    cancelButton.addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    deleteButton.addEventListener('click', () => {
        customTemplates.splice(index, 1);
        TemplateManager.saveTemplates(customTemplates);     
        const presetList = document.querySelector('#preset-list');
        const customList = document.querySelector('#custom-list');
        if (presetList) {
            populatePresetTemplates(presetList);
        }
        if (customList) {
            populateCustomTemplates(customList);
        }
        
        modal.remove();
        style.remove();
        
        showToast('✅ 自定义模版已删除', 'success');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    });
    
    dialogContent.appendChild(icon);
    dialogContent.appendChild(title);
    dialogContent.appendChild(message); 
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(deleteButton);
    dialogContent.appendChild(buttonContainer);
    modal.appendChild(dialogContent);
    document.body.appendChild(modal);
}

const REFERENCE_SYMBOL_MAP = {
    '{character}': { cn: '人物', en: 'Character' },
    '{gender}': { cn: '性别', en: 'Gender' },
    '{facial_expressions}': { cn: '面部表情', en: 'Facial Expressions' },
    '{hair_style}': { cn: '发型', en: 'Hair Style' },
    '{hair_color}': { cn: '发色', en: 'Hair Color' },
    '{body_pose}': { cn: '身躯姿势', en: 'Body Pose' },
    '{head_movements}': { cn: '头部动作', en: 'Head Movements' },
    '{hand_movements}': { cn: '手部动作', en: 'Hand Movements' },
    '{leg_foot_movements}': { cn: '腿脚动作', en: 'Leg/Foot Movements' },
    '{orientation}': { cn: '朝向', en: 'Orientation' },
    '{top}': { cn: '上衣', en: 'Top' },
    '{bottom}': { cn: '下装', en: 'Bottom' },
    '{boots}': { cn: '鞋子', en: 'Boots' },
    '{socks}': { cn: '袜子', en: 'Socks' },
    '{accessories}': { cn: '配饰', en: 'Accessories' },
    '{tattoo}': { cn: '纹身', en: 'Tattoo' },
    '{tattoo_location}': { cn: '纹身位置', en: 'Tattoo Location' },
    '{camera}': { cn: '相机', en: 'Camera' },
    '{lens}': { cn: '镜头', en: 'Lens' },
    '{lighting}': { cn: '灯光', en: 'Lighting' },
    '{perspective}': { cn: '视角', en: 'Perspective' },
    '{location}': { cn: '位置', en: 'Location' },
    '{weather}': { cn: '天气', en: 'Weather' },
    '{season}': { cn: '季节', en: 'Season' },
    '{color_tone}': { cn: '色调', en: 'Color Tone' },
    '{mood_atmosphere}': { cn: '氛围', en: 'Mood/Atmosphere' },
    '{photography_style}': { cn: '摄影风格', en: 'Photography Style' },
    '{photography_technique}': { cn: '摄影技法', en: 'Photography Technique' },
    '{post_processing}': { cn: '后期处理', en: 'Post Processing' },
    '{depth_of_field}': { cn: '景深', en: 'Depth of Field' },
    '{composition}': { cn: '构图', en: 'Composition' },
    '{texture}': { cn: '质感', en: 'Texture' },
    '{theme}': { cn: '主题', en: 'Theme' }
};

function getBilingualName(symbol) {
    const mapping = REFERENCE_SYMBOL_MAP[symbol];
    if (mapping) {
        return `${mapping.cn} ${symbol}`;
    }
    return symbol;
}

function populateQuickInsertPanel(container) {
    const referenceSymbols = [
        { name: '人物 {character}', symbol: '{character}', description: '人物类型 · Character type' },
        { name: '性别 {gender}', symbol: '{gender}', description: '性别 · Gender' },
        { name: '面部表情 {facial_expressions}', symbol: '{facial_expressions}', description: '面部表情 · Facial Expressions' },
        { name: '发型 {hair_style}', symbol: '{hair_style}', description: '发型 · Hair Style' },
        { name: '发色 {hair_color}', symbol: '{hair_color}', description: '发色 · Hair Color' },
        { name: '身躯姿势 {body_pose}', symbol: '{body_pose}', description: '身躯姿势 · Body Pose' },
        { name: '头部动作 {head_movements}', symbol: '{head_movements}', description: '头部动作 · Head Movements' },
        { name: '手部动作 {hand_movements}', symbol: '{hand_movements}', description: '手部动作 · Hand Movements' },
        { name: '腿脚动作 {leg_foot_movements}', symbol: '{leg_foot_movements}', description: '腿脚动作 · Leg/Foot Movements' },
        { name: '朝向 {orientation}', symbol: '{orientation}', description: '朝向 · Orientation' },
        { name: '上衣 {top}', symbol: '{top}', description: '上衣 · Top' },
        { name: '下装 {bottom}', symbol: '{bottom}', description: '下装 · Bottom' },
        { name: '鞋子 {boots}', symbol: '{boots}', description: '鞋子 · Shoes' },
        { name: '袜子 {socks}', symbol: '{socks}', description: '袜子 · Socks' },
        { name: '配饰 {accessories}', symbol: '{accessories}', description: '配饰 · Accessories' },
        { name: '纹身 {tattoo}', symbol: '{tattoo}', description: '纹身 · Tattoo' },
        { name: '纹身位置 {tattoo_location}', symbol: '{tattoo_location}', description: '纹身位置 · Tattoo Location' },
        { name: '相机 {camera}', symbol: '{camera}', description: '相机 · Camera' },
        { name: '镜头 {lens}', symbol: '{lens}', description: '镜头 · Lens' },
        { name: '灯光 {lighting}', symbol: '{lighting}', description: '灯光 · Lighting' },
        { name: '视角 {perspective}', symbol: '{perspective}', description: '视角 · Perspective' },
        { name: '位置 {location}', symbol: '{location}', description: '位置 · Location' },
        { name: '天气 {weather}', symbol: '{weather}', description: '天气 · Weather' },
        { name: '季节 {season}', symbol: '{season}', description: '季节 · Season' },
        { name: '色调 {color_tone}', symbol: '{color_tone}', description: '色调 · Color Tone' },
        { name: '氛围 {mood_atmosphere}', symbol: '{mood_atmosphere}', description: '氛围 · Mood/Atmosphere' },
        { name: '摄影风格 {photography_style}', symbol: '{photography_style}', description: '摄影风格 · Photography Style' },
        { name: '摄影技法 {photography_technique}', symbol: '{photography_technique}', description: '摄影技法 · Photography Technique' },
        { name: '后期处理 {post_processing}', symbol: '{post_processing}', description: '后期处理 · Post Processing' },
        { name: '景深 {depth_of_field}', symbol: '{depth_of_field}', description: '景深 · Depth of Field' },
        { name: '构图 {composition}', symbol: '{composition}', description: '构图 · Composition' },
        { name: '质感 {texture}', symbol: '{texture}', description: '质感 · Texture' },
        { name: '主题 {theme}', symbol: '{theme}', description: '主题 · Theme' }
    ];
    
    referenceSymbols.forEach(item => {
        const button = document.createElement('button');
        button.title = `${item.symbol} - ${item.description}`;
        button.style.cssText = `
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid rgba(79, 172, 254, 0.5);
            background: rgba(79, 172, 254, 0.1);
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            line-height: 1.2;
            gap: 8px;
            min-width: 80px;
            flex-shrink: 0;
        `;
        
        const namePart = item.name.split(' {')[0];
        const nameContainer = document.createElement('span');
        nameContainer.textContent = namePart;
        nameContainer.style.cssText = `
            color: white;
            font-size: 14px;
        `;
        
        const symbolText = document.createElement('span');
        symbolText.textContent = item.symbol;
        symbolText.style.cssText = `
            font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
            font-size: 14px;
            color: #4facfe;
            font-weight: bold;
        `;
        
        button.appendChild(nameContainer);
        button.appendChild(symbolText);
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(79, 172, 254, 0.2)';
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 8px rgba(79, 172, 254, 0.2)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(79, 172, 254, 0.1)';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });
        
        button.addEventListener('click', () => {
            insertTextAtCursor(item.symbol);
        });
        
        container.appendChild(button);
    });
}

function insertTextAtCursor(text) {
    if (!currentTemplateEditor) return;

    if (text.match(/^\{.+\}$/)) {
        insertReferenceTag(text);
    } else {
        insertPlainText(text);
    }

    currentTemplateEditor.focus();

    showToast(`✅ 已插入: ${text}`, 'success');
}

function insertPlainText(text) {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        currentTemplateEditor.textContent += text;
        return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
}

function insertReferenceTag(symbolText) {
    const selection = window.getSelection();
    let range;

    if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);

        if (!currentTemplateEditor.contains(range.commonAncestorContainer)) {
            range = document.createRange();
            range.selectNodeContents(currentTemplateEditor);
            range.collapse(false);
        }
    } else {
        range = document.createRange();
        range.selectNodeContents(currentTemplateEditor);
        range.collapse(false);
    }

    range.deleteContents();

    const tag = createReferenceTagElement(symbolText);

    range.insertNode(tag);
    range.setStartAfter(tag);
    range.setEndAfter(tag);
    selection.removeAllRanges();
    selection.addRange(range);
}

function createReferenceTagElement(symbolText) {
    const tag = document.createElement('span');
    tag.className = 'reference-tag';
    tag.contentEditable = false;

    tag.textContent = getBilingualName(symbolText);
    tag.dataset.symbol = symbolText;

    tag.addEventListener('click', (e) => {
        e.stopPropagation();
        showReferenceTagMenu(tag);
    });

    return tag;
}

function showReferenceTagMenu(tagElement) {
    const existingMenu = document.querySelector('.tag-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const currentSymbol = tagElement.dataset.symbol;
    const referenceSymbols = [
        { name: '人物', symbol: '{character}' },
        { name: '性别', symbol: '{gender}' },
        { name: '面部表情', symbol: '{facial_expressions}' },
        { name: '发型', symbol: '{hair_style}' },
        { name: '发色', symbol: '{hair_color}' },
        { name: '姿势', symbol: '{body_pose}' },
        { name: '头部动作', symbol: '{head_movements}' },
        { name: '手部动作', symbol: '{hand_movements}' },
        { name: '腿脚动作', symbol: '{leg_foot_movements}' },
        { name: '朝向', symbol: '{orientation}' },
        { name: '上衣', symbol: '{top}' },
        { name: '下装', symbol: '{bottom}' },
        { name: '鞋子', symbol: '{boots}' },
        { name: '袜子', symbol: '{socks}' },
        { name: '配饰', symbol: '{accessories}' },
        { name: '纹身', symbol: '{tattoo}' },
        { name: '纹身位置', symbol: '{tattoo_location}' },
        { name: '相机', symbol: '{camera}' },
        { name: '镜头', symbol: '{lens}' },
        { name: '灯光', symbol: '{lighting}' },
        { name: '视角', symbol: '{perspective}' },
        { name: '位置', symbol: '{location}' },
        { name: '天气', symbol: '{weather}' },
        { name: '季节', symbol: '{season}' },
        { name: '色调', symbol: '{color_tone}' },
        { name: '氛围', symbol: '{mood_atmosphere}' },
        { name: '摄影风格', symbol: '{photography_style}' },
        { name: '摄影技法', symbol: '{photography_technique}' },
        { name: '后期处理', symbol: '{post_processing}' },
        { name: '景深', symbol: '{depth_of_field}' },
        { name: '构图', symbol: '{composition}' },
        { name: '质感', symbol: '{texture}' },
        { name: '主题', symbol: '{theme}' }
    ];

    const menu = document.createElement('div');
    menu.className = 'tag-menu';

    referenceSymbols.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'tag-menu-item';
        if (item.symbol === currentSymbol) {
            menuItem.classList.add('current');
        }
        menuItem.textContent = `${item.name} ${item.symbol}`;

        menuItem.addEventListener('click', () => {
            tagElement.textContent = getBilingualName(item.symbol);
            tagElement.dataset.symbol = item.symbol;
            menu.remove();
            showToast(`✅ 已更改为: ${getBilingualName(item.symbol)}`, 'success');
        });

        menu.appendChild(menuItem);
    });

    const divider = document.createElement('div');
    divider.className = 'tag-menu-divider';
    menu.appendChild(divider);

    const deleteItem = document.createElement('div');
    deleteItem.className = 'tag-menu-item tag-menu-delete';
    deleteItem.textContent = '🗑️ 删除标签';
    deleteItem.addEventListener('click', () => {
        tagElement.remove();
        menu.remove();
        showToast('✅ 标签已删除', 'success');
    });
    menu.appendChild(deleteItem);

    document.body.appendChild(menu);

    const tagRect = tagElement.getBoundingClientRect();
    menu.style.left = tagRect.left + 'px';
    menu.style.top = (tagRect.bottom + 5) + 'px';

    setTimeout(() => {
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
        }
        if (menuRect.bottom > window.innerHeight) {
            menu.style.top = (tagRect.top - menuRect.height - 5) + 'px';
        }
    }, 0);

    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== tagElement) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 0);
}

function copyTemplateContent() {
    if (!currentTemplateEditor) return;

    const content = getTemplateContent();
    if (!content.trim()) {
        showToast('⚠️ 没有内容可复制', 'warning');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
            showToast('✅ 内容已复制到剪贴板', 'success');
        }).catch(() => {
            fallbackCopyText(content);
        });
    } else {
        fallbackCopyText(content);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('✅ 内容已复制到剪贴板', 'success');
    } catch (err) {
        showToast('❌ 复制失败，请手动选择复制', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

function showToast(message, type = 'info') {
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) translateY(100px);
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
        text-align: center;
        ${
            type === 'success' ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%);' :
            type === 'error' ? 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);' :
            type === 'warning' ? 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);' :
            'background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);'
        }
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function applyTemplateToNode() {
    if (!currentTemplateEditor) return;

    const content = getTemplateContent();

    if (!currentTemplateNode) {
        showToast('❌ 无法应用到节点：未找到节点引用', 'error');
        return;
    }

    const templateWidget = currentTemplateNode.widgets.find(widget => widget.name === "template");
    if (!templateWidget) {
        showToast('❌ 无法应用到节点：未找到template控件', 'error');
        return;
    }

    templateWidget.value = content;
    currentTemplateNode.setDirtyCanvas(true);

    if (content.trim()) {
        showToast('✅ 模版内容已应用', 'success');
    } else {
        showToast('✅ 已清空模版内容', 'success');
    }
}

function syncNodeToTemplate() {
    if (!currentTemplateEditor) return;

    if (!currentTemplateNode) {
        console.warn('No node reference found');
        return;
    }

    const templateWidget = currentTemplateNode.widgets.find(widget => widget.name === "template");
    if (!templateWidget) {
        console.warn('Template widget not found in node');
        return;
    }

    const nodeTemplateContent = templateWidget.value || '';

    if (nodeTemplateContent.trim()) {
        currentTemplateEditor.innerHTML = '';

        const parsedContent = parseTemplateToElements(nodeTemplateContent);
        currentTemplateEditor.appendChild(parsedContent);

        console.log('Synced node template to editor');
    }
}

let currentCategoryBrowserDialog = null;
let currentBrowserNode = null;
let browserInitialState = {};
let browserPendingChanges = {};
let randomButtonState = { active: false, savedState: {} };
let ignoreButtonState = { active: false, savedState: {} };

function openCategoryBrowser(node) {
    if (currentCategoryBrowserDialog) {
        currentCategoryBrowserDialog.remove();
    }

    currentBrowserNode = node;

    browserInitialState = {};
    browserPendingChanges = {};
    const categories = Object.keys(BROWSER_CATEGORY_MAP);
    categories.forEach(category => {
        const categoryInfo = BROWSER_CATEGORY_MAP[category];
        const widget = node.widgets.find(w => w.name === categoryInfo.field);
        if (widget) {
            browserInitialState[categoryInfo.field] = widget.value;
            browserPendingChanges[categoryInfo.field] = widget.value;
        }
    });

    currentCategoryBrowserDialog = createCategoryBrowserDialog();
    document.body.appendChild(currentCategoryBrowserDialog);
    currentCategoryBrowserDialog.style.display = 'block';

    loadBrowserCategoryData();
}

function createCategoryBrowserDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: none;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 1400px;
        height: 85vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const title = document.createElement('h2');
    title.textContent = '标签选择·Select Tags';
    title.style.cssText = `
        margin: 0;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-align: center;
    `;

    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
        closeButton.style.transform = 'scale(1.1)';
        closeButton.style.boxShadow = '0 4px 15px rgba(255, 68, 68, 0.5)';
    });

    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        closeButton.style.transform = 'scale(1)';
        closeButton.style.boxShadow = 'none';
    });

    closeButton.addEventListener('click', () => {
        overlay.remove();
        currentCategoryBrowserDialog = null;
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 25px 30px;
    `;

    const fieldsContainer = document.createElement('div');
    fieldsContainer.id = 'browser-fields-container';
    fieldsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    `;

    content.appendChild(fieldsContainer);

    const footer = document.createElement('div');
    footer.style.cssText = `
        padding: 15px 30px;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: center;
        gap: 15px;
    `;

    const randomAllButton = createToggleButton(
        '全部随机 · Random All',
        '恢复随机前 · Restore',
        '#8b5cf6',
        null
    );

    const ignoreAllButton = createToggleButton(
        '全部忽略 · Ignore All',
        '恢复忽略前 · Restore',
        '#3b82f6',
        null
    );

    const shuffleButton = document.createElement('button');
    shuffleButton.textContent = '洗牌抽签 · Shuffle';
    shuffleButton.style.cssText = `
        padding: 10px 24px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #fff;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    `;

    shuffleButton.addEventListener('mouseenter', () => {
        shuffleButton.style.transform = 'translateY(-2px)';
        shuffleButton.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.5)';
        shuffleButton.style.filter = 'brightness(1.1)';
    });

    shuffleButton.addEventListener('mouseleave', () => {
        shuffleButton.style.transform = 'translateY(0)';
        shuffleButton.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
        shuffleButton.style.filter = 'brightness(1)';
    });

    shuffleButton.addEventListener('click', () => {
        shuffleAllFields();
    });

    const applyButton = document.createElement('button');
    applyButton.textContent = '应用 · Apply';
    applyButton.style.cssText = `
        padding: 10px 24px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #fff;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    `;

    applyButton.addEventListener('mouseenter', () => {
        applyButton.style.transform = 'translateY(-2px)';
        applyButton.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.5)';
        applyButton.style.filter = 'brightness(1.1)';
    });

    applyButton.addEventListener('mouseleave', () => {
        applyButton.style.transform = 'translateY(0)';
        applyButton.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
        applyButton.style.filter = 'brightness(1)';
    });

    applyButton.addEventListener('click', () => {
        applyAllBrowserChanges();
    });

    randomAllButton.addEventListener('click', () =>
        toggleAllFields('Random', randomButtonState, ignoreButtonState, randomAllButton, ignoreAllButton)
    );

    ignoreAllButton.addEventListener('click', () =>
        toggleAllFields('Ignore', ignoreButtonState, randomButtonState, ignoreAllButton, randomAllButton)
    );

    footer.appendChild(randomAllButton);
    footer.appendChild(ignoreAllButton);
    footer.appendChild(shuffleButton);
    footer.appendChild(applyButton);

    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);

    overlay.addEventListener('keydown', (event) => {
        const target = event.target;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.tagName === 'SELECT') {
            event.stopImmediatePropagation();
            return;
        }
        event.stopImmediatePropagation();
    });

    return overlay;
}

const BROWSER_CATEGORY_MAP = {
    'character': { cn: '人物/角色', en: 'Character', field: 'character' },
    'gender': { cn: '性别', en: 'Gender', field: 'gender' },
    'facial_expressions': { cn: '面部表情', en: 'Facial Expressions', field: 'facial_expressions' },
    'hair_style': { cn: '发型', en: 'Hair Style', field: 'hair_style' },
    'hair_color': { cn: '发色', en: 'Hair Color', field: 'hair_color' },
    'pose': { cn: '身躯姿势', en: 'Body Pose', field: 'pose' },
    'head_movements': { cn: '头部动作', en: 'Head Movements', field: 'head_movements' },
    'hand_movements': { cn: '手部动作', en: 'Hand Movements', field: 'hand_movements' },
    'leg_foot_movements': { cn: '腿脚动作', en: 'Leg/Foot Movements', field: 'leg_foot_movements' },
    'orientation': { cn: '朝向', en: 'Orientation', field: 'orientation' },
    'top': { cn: '上衣', en: 'Top', field: 'top' },
    'bottom': { cn: '下装', en: 'Bottom', field: 'bottom' },
    'boots': { cn: '鞋子', en: 'Boots', field: 'boots' },
    'socks': { cn: '袜子', en: 'Socks', field: 'socks' },
    'accessories': { cn: '配饰', en: 'Accessories', field: 'accessories' },
    'tattoo': { cn: '纹身', en: 'Tattoo', field: 'tattoo' },
    'tattoo_location': { cn: '纹身位置', en: 'Tattoo Location', field: 'tattoo_location' },
    'camera': { cn: '相机', en: 'Camera', field: 'camera' },
    'lens': { cn: '镜头', en: 'Lens', field: 'lens' },
    'lighting': { cn: '灯光', en: 'Lighting', field: 'lighting' },
    'perspective': { cn: '视角', en: 'Perspective', field: 'perspective' },
    'location': { cn: '位置', en: 'Location', field: 'location' },
    'weather': { cn: '天气', en: 'Weather', field: 'weather' },
    'season': { cn: '季节', en: 'Season', field: 'season' },
    'color_tone': { cn: '色调', en: 'Color Tone', field: 'color_tone' },
    'mood_atmosphere': { cn: '氛围', en: 'Mood/Atmosphere', field: 'mood_atmosphere' },
    'photography_style': { cn: '摄影风格', en: 'Photography Style', field: 'photography_style' },
    'photography_technique': { cn: '摄影技法', en: 'Photography Technique', field: 'photography_technique' },
    'post_processing': { cn: '后期处理', en: 'Post Processing', field: 'post_processing' },
    'depth_of_field': { cn: '景深', en: 'Depth of Field', field: 'depth_of_field' },
    'composition': { cn: '构图', en: 'Composition', field: 'composition' },
    'texture': { cn: '质感', en: 'Texture', field: 'texture' }
};

async function loadBrowserCategoryData() {
    renderBrowserFields();
}

function renderBrowserFields() {
    const fieldsContainer = document.getElementById('browser-fields-container');
    if (!fieldsContainer || !currentBrowserNode) return;

    fieldsContainer.innerHTML = '';

    const categories = Object.keys(BROWSER_CATEGORY_MAP);

    categories.forEach(category => {
        const categoryInfo = BROWSER_CATEGORY_MAP[category];
        const fieldName = categoryInfo.field;

        const widget = currentBrowserNode.widgets.find(w => w.name === fieldName);
        if (!widget || !widget.options || !widget.options.values) return;

        const fieldItem = createBrowserFieldItem(categoryInfo, widget);
        fieldsContainer.appendChild(fieldItem);
    });
}

function createBrowserFieldItem(categoryInfo, widget) {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'browser-field-item';
    fieldWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    const labelContainer = document.createElement('div');
    labelContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
    `;

    const label = document.createElement('label');
    label.textContent = `${categoryInfo.cn} · ${categoryInfo.en}`;
    label.style.cssText = `
        color: #4facfe;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;

    const searchIcon = document.createElement('button');
    searchIcon.innerHTML = '🔍';
    searchIcon.title = '快速搜索 · Quick Search';
    searchIcon.style.cssText = `
        width: 22px;
        height: 22px;
        border-radius: 5px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        flex-shrink: 0;
    `;

    searchIcon.addEventListener('mouseenter', () => {
        searchIcon.style.background = 'rgba(79, 172, 254, 0.3)';
        searchIcon.style.transform = 'scale(1.1)';
    });

    searchIcon.addEventListener('mouseleave', () => {
        searchIcon.style.background = 'rgba(79, 172, 254, 0.15)';
        searchIcon.style.transform = 'scale(1)';
    });

    searchIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        showFieldSearchDialog(categoryInfo, widget, select);
    });

    labelContainer.appendChild(label);
    labelContainer.appendChild(searchIcon);

    const selectWrapper = document.createElement('div');
    selectWrapper.style.cssText = `
        position: relative;
    `;

    const select = document.createElement('select');
    select.className = 'browser-select';
    select.dataset.field = categoryInfo.field;
    select.style.cssText = `
        width: 100%;
        padding: 10px 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: #fff;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e');
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        padding-right: 32px;
    `;

    const currentValue = widget.value || 'Ignore';

    widget.options.values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;

        let displayText = value;
        if (value.includes(' | ')) {
            const parts = value.split(' | ');
            displayText = `${parts[0]} (${parts[1]})`;
        } else if (value === 'Ignore') {
            displayText = '忽略 (Ignore)';
        } else if (value === 'Random') {
            displayText = '随机值 (Random)';
        }

        option.textContent = displayText;
        option.style.cssText = `
            background: #1a1a2e;
            color: #fff;
            padding: 8px;
        `;

        if (value === currentValue) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    select.addEventListener('mouseenter', () => {
        select.style.borderColor = 'rgba(79, 172, 254, 0.6)';
        select.style.background = 'rgba(0, 0, 0, 0.4)';
    });

    select.addEventListener('mouseleave', () => {
        select.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        select.style.background = 'rgba(0, 0, 0, 0.3)';
    });

    select.addEventListener('focus', () => {
        select.style.borderColor = '#4facfe';
        select.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.2)';
    });

    select.addEventListener('blur', () => {
        select.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        select.style.boxShadow = 'none';
    });

    select.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        browserPendingChanges[categoryInfo.field] = selectedValue;
    });

    selectWrapper.appendChild(select);
    fieldWrapper.appendChild(labelContainer);
    fieldWrapper.appendChild(selectWrapper);

    return fieldWrapper;
}

function applyAllBrowserChanges() {
    if (!currentBrowserNode) {
        return;
    }

    const categories = Object.keys(BROWSER_CATEGORY_MAP);
    let changeCount = 0;

    categories.forEach(category => {
        const categoryInfo = BROWSER_CATEGORY_MAP[category];
        const fieldName = categoryInfo.field;

        if (browserPendingChanges[fieldName] !== undefined) {
            const widget = currentBrowserNode.widgets.find(w => w.name === fieldName);
            if (widget && widget.value !== browserPendingChanges[fieldName]) {
                widget.value = browserPendingChanges[fieldName];
                changeCount++;
            }
        }
    });

    if (changeCount > 0) {
        currentBrowserNode.setDirtyCanvas(true);
        showToast(`✅ 成功应用 ${changeCount} 个字段的更改`, 'success');
        console.log(`Applied ${changeCount} changes to node`);
    } else {
        showToast(`ℹ️ 没有需要应用的更改`, 'info');
    }

    if (currentCategoryBrowserDialog) {
        currentCategoryBrowserDialog.remove();
        currentCategoryBrowserDialog = null;
    }
}

function applyBrowserFieldToNode(fieldName, value) {
    if (!currentBrowserNode) {
        return;
    }

    const widget = currentBrowserNode.widgets.find(w => w.name === fieldName);
    if (!widget) {
        return;
    }

    widget.value = value;
    browserPendingChanges[fieldName] = value;
    currentBrowserNode.setDirtyCanvas(true);
}

function createToggleButton(normalText, activeText, color, onClick) {
    const button = document.createElement('button');
    button.textContent = normalText;
    button.style.cssText = `
        padding: 10px 24px;
        background: ${color};
        color: #fff;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;

    button.normalText = normalText;
    button.activeText = activeText;
    button.normalColor = color;
    button.activeColor = '#10b981';

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        button.style.filter = 'brightness(1.1)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        button.style.filter = 'brightness(1)';
    });

    if (onClick) {
        button.addEventListener('click', onClick);
    }

    return button;
}

function shuffleAllFields() {
    if (!currentBrowserNode) return;

    const categories = Object.keys(BROWSER_CATEGORY_MAP);
    let count = 0;

    categories.forEach(category => {
        const categoryInfo = BROWSER_CATEGORY_MAP[category];
        const fieldName = categoryInfo.field;

        const select = document.querySelector(`.browser-select[data-field="${fieldName}"]`);
        if (select && select.options.length > 0) {
            const validOptions = Array.from(select.options)
                .map(opt => opt.value)
                .filter(val => val !== 'Ignore' && val !== 'Random');

            if (validOptions.length > 0) {
                const randomIndex = Math.floor(Math.random() * validOptions.length);
                const randomValue = validOptions[randomIndex];

                select.value = randomValue;
                browserPendingChanges[fieldName] = randomValue;
                count++;
            }
        }
    });

    showToast(`✅ 已随机选择 ${count} 个字段（请点击应用生效）`, 'success');
}

function toggleAllFields(value, currentState, otherState, button, otherButton) {
    if (!currentBrowserNode) return;

    const categories = Object.keys(BROWSER_CATEGORY_MAP);

    if (currentState.active) {
        let count = 0;
        categories.forEach(category => {
            const categoryInfo = BROWSER_CATEGORY_MAP[category];
            const fieldName = categoryInfo.field;

            if (currentState.savedState[fieldName] !== undefined) {
                browserPendingChanges[fieldName] = currentState.savedState[fieldName];
                count++;

                const select = document.querySelector(`.browser-select[data-field="${fieldName}"]`);
                if (select) {
                    select.value = currentState.savedState[fieldName];
                }
            }
        });

        currentState.active = false;
        currentState.savedState = {};
        button.textContent = button.normalText;
        button.style.background = button.normalColor;

        const actionText = value === 'Random' ? '随机' : '忽略';
        showToast(`✅ 已恢复${actionText}前的 ${count} 个字段（请点击应用生效）`, 'success');
    } else {

        if (otherState.active) {
            otherState.active = false;
            otherState.savedState = {};
            if (otherButton) {
                otherButton.textContent = otherButton.normalText;
                otherButton.style.background = otherButton.normalColor;
            }
        }

        currentState.savedState = {};
        let count = 0;

        categories.forEach(category => {
            const categoryInfo = BROWSER_CATEGORY_MAP[category];
            const fieldName = categoryInfo.field;

            if (browserPendingChanges[fieldName] !== undefined) {
                currentState.savedState[fieldName] = browserPendingChanges[fieldName];
                browserPendingChanges[fieldName] = value;
                count++;

                const select = document.querySelector(`.browser-select[data-field="${fieldName}"]`);
                if (select) {
                    select.value = value;
                }
            }
        });

        currentState.active = true;
        button.textContent = button.activeText;
        button.style.background = button.activeColor;

        const actionText = value === 'Random' ? '随机' : '忽略';
        showToast(`✅ 已将 ${count} 个字段设置为${actionText}（请点击应用生效）`, 'success');
    }
}

function showFieldSearchDialog(categoryInfo, widget, selectElement) {
    const existingModal = document.getElementById('field-search-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'field-search-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10003;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;

    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 24px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        gap: 16px;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const title = document.createElement('h3');
    title.textContent = `🔍 ${categoryInfo.cn} · ${categoryInfo.en}`;
    title.style.cssText = `
        color: #4facfe;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
        closeButton.style.transform = 'scale(1.1)';
    });

    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        closeButton.style.transform = 'scale(1)';
    });

    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '输入关键词搜索... · Type to search...';
    searchInput.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;

    searchInput.addEventListener('focus', () => {
        searchInput.style.borderColor = '#4facfe';
        searchInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        searchInput.style.boxShadow = 'none';
    });

    const resultCount = document.createElement('div');
    resultCount.style.cssText = `
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        padding: 0 4px;
    `;

    const resultsContainer = document.createElement('div');
    resultsContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 4px;
        max-height: 50vh;
    `;

    const allOptions = Array.from(widget.options.values).filter(v => !['Ignore', 'Random'].includes(v));

    function renderResults(searchTerm = '') {
        resultsContainer.innerHTML = '';

        const trimmedSearch = searchTerm.trim();
        const filtered = trimmedSearch
            ? allOptions.filter(option => {
                const lowerSearch = trimmedSearch.toLowerCase();
                return option.toLowerCase().includes(lowerSearch);
            })
            : [];

        resultCount.textContent = `找到 ${filtered.length} 个结果 · Found ${filtered.length} results`;

        filtered.forEach(option => {
            const optionButton = document.createElement('button');

            let displayText = option;
            if (option.includes(' | ')) {
                const parts = option.split(' | ');
                displayText = `${parts[0]} (${parts[1]})`;
            }

            optionButton.textContent = displayText;
            optionButton.style.cssText = `
                padding: 10px 12px;
                border-radius: 8px;
                border: 1px solid rgba(79, 172, 254, 0.3);
                background: rgba(79, 172, 254, 0.1);
                color: white;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;

            const isSelected = selectElement.value === option;
            if (isSelected) {
                optionButton.style.background = 'rgba(16, 185, 129, 0.3)';
                optionButton.style.borderColor = 'rgba(16, 185, 129, 0.8)';
                optionButton.style.fontWeight = 'bold';
            }

            optionButton.addEventListener('mouseenter', () => {
                if (!isSelected) {
                    optionButton.style.background = 'rgba(79, 172, 254, 0.25)';
                    optionButton.style.borderColor = 'rgba(79, 172, 254, 0.6)';
                }
                optionButton.style.transform = 'translateY(-2px)';
                optionButton.style.boxShadow = '0 4px 8px rgba(79, 172, 254, 0.3)';
            });

            optionButton.addEventListener('mouseleave', () => {
                if (!isSelected) {
                    optionButton.style.background = 'rgba(79, 172, 254, 0.1)';
                    optionButton.style.borderColor = 'rgba(79, 172, 254, 0.3)';
                }
                optionButton.style.transform = 'translateY(0)';
                optionButton.style.boxShadow = 'none';
            });

            optionButton.addEventListener('click', () => {
                selectElement.value = option;
                browserPendingChanges[categoryInfo.field] = option;

                const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);

                showToast(`✅ 已选择: ${displayText}（请点击应用生效）`, 'success');
                modal.remove();
            });

            resultsContainer.appendChild(optionButton);
        });

        if (filtered.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = '未找到匹配结果 · No results found';
            emptyMessage.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                color: rgba(255, 255, 255, 0.5);
                padding: 40px 20px;
                font-style: italic;
            `;
            resultsContainer.appendChild(emptyMessage);
        }
    }

    searchInput.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });

    renderResults();

    dialogContent.appendChild(header);
    dialogContent.appendChild(searchInput);
    dialogContent.appendChild(resultCount);
    dialogContent.appendChild(resultsContainer);
    modal.appendChild(dialogContent);
    document.body.appendChild(modal);

    searchInput.focus();
}