import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { applyNode, getLocale } from "./zhiai_i18n.js";
import { attachMiddleDragPan, watchNodeModeVisual } from "./panel_kit.js";
import { drawNodeSettingsButton, titleTipHovered, hideTitleTip } from "./node_title_icons.js";

const NODE_CLASS = "LoraStackLoader";const ROWS_WIDGET = "lora_rows";
const PANEL_WIDGET = "zhiai_lora_stack_panel";
const UI_PROPERTY = "zhiai_lora_stack_ui";
const UI_STATE_VERSION = 2;
const DRAFT_PREFIX = "zhiai_lora_stack/draft/";
const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;
const DRAFT_DELAY = 180;
const HANDOFF_KEY = "zhiai_lora_stack/handoff";
const HANDOFF_TTL = 1500;
const HANDOFF_MAX_ID_GAP = 5;
const MIN_WIDTH = 320;
const INIT_WIDTH = 520;
const INIT_HEIGHT = 240;
const STRENGTH_STEP = 0.05;
const STRENGTH_MIN_DEFAULT = -10;
const STRENGTH_MAX_DEFAULT = 10;
const MIN_PANEL_HEIGHT = 200;
const DRAG_THRESHOLD = 3;
const TIP_DELAY = 1000;
const MODEL_CACHE_MS = 60000;
const REFRESH_MS = 250;
const PICKER_MIN_WIDTH = 320;
const PICKER_TARGET_WIDTH = 760;
const PICKER_BASE_WIDTH = 760;
const PICKER_BASE_FONT = 14;
const PICKER_MIN_FONT = 13;
const PICKER_MAX_FONT = 17;
const PICKER_EDGE = 8;
const PICKER_BODY_HEIGHT = 360;
const PICKER_BODY_MIN_HEIGHT = 360;
const PICKER_BODY_MARGIN = 140;
const TITLE_ICON_SIZE = 24;
const TITLE_ICON_MARGIN = 4;
const TITLE_ICON_GAP = 4;

const i18n = {
    zh: {
        toggleAll: "切换全部",
        stateAll: "全部启用",
        statePartial: "{count} 项未启用",
        stateNone: "全部关闭",
        stateEmpty: "暂无条目",
        drag: "拖动排序",
        enable: "启用",
        more: "更多设置",
        replace: "更换模型",
        remove: "删除",
        copy: "复制触发词",
        triggerWords: "触发词",
        triggerPlaceholder: "填写该 LoRA 的触发词",
        addLora: "添加 LoRA",
        emptyTitle: "尚未添加 LoRA",
        emptyHint: "点击上方「添加 LoRA」开始",
        search: "搜索 LoRA",
        close: "关闭",
        noPreview: "无预览图",
        noTriggers: "未设置",
        triggerTipLabel: "触发词：",
        pickerEmpty: "未找到 LoRA",
        pickerAllFolders: "全部",
        pickerRootFolder: "根目录",
        pickerHint: "悬停预览，点击选择；↑↓ 切换，Enter 确认",
        loadFailed: "LoRA 列表加载失败",
        preset: "我的配方",
        presetTitle: "LoRA 配方",
        presetNamePlaceholder: "配方名称…",
        presetSave: "保存当前",
        presetLoad: "加载",
        presetAppend: "追加",
        presetRename: "改名",
        presetDelete: "删除",
        presetEmpty: "暂无配方，先在下方保存一个吧",
        presetCount: "{count} 项",
        presetSaved: "已保存配方「{name}」",
        presetLoaded: "已加载配方「{name}」",
        presetAppended: "已追加配方「{name}」",
        presetDeleted: "已删除配方「{name}」",
        presetRenamed: "已重命名",
        presetConfirmLoad: "将替换当前 {count} 条目，确定继续？",
        presetConfirmDelete: "删除配方「{name}」？",
        presetNameRequired: "请输入配方名称",
        presetDuplicate: "已存在同名配方",
        presetSaveEmpty: "当前没有可保存的条目",
        presetError: "配方操作失败",
        presetFooterRecipes: "共 {count} 个配方",
        presetFooterRows: "当前 {count} 项",
        presetFooterHint: "悬停配方可预览其内容",
        settings: "设置",
        settingsPreview: "预览缩略图",
        settingsPreviewDesc: "关闭后，添加 LoRA 面板右侧的预览区域将被隐藏。",
        settingsStrengthRange: "权重范围",
        settingsStrengthRangeDesc: "设置强度可输入与步进的最小值和最大值，超出范围的数值会自动收拢到边界。",
        settingsStrengthReset: "恢复默认",
        settingsMultiSelect: "批量添加 LoRA",
        settingsMultiSelectDesc: "开启后，添加 LoRA 面板中可同时勾选多个模型并一键批量载入。",
        pickerBatchHint: "悬停预览，点击勾选多个模型；↑↓ 移动，空格勾选，Enter 批量添加",
        pickerBatchAdd: "批量添加",
        pickerBatchCount: "已选 {count} 项",
        pickerBatchDuplicate: "所选 LoRA 均已在列表中",
    },
    en: {
        toggleAll: "Toggle all",
        stateAll: "All enabled",
        statePartial: "{count} disabled",
        stateNone: "All disabled",
        stateEmpty: "No entries",
        drag: "Drag to reorder",
        enable: "Enable",
        more: "More settings",
        replace: "Replace model",
        remove: "Delete",
        copy: "Copy trigger words",
        triggerWords: "Trigger words",
        triggerPlaceholder: "Optional, saved with workflow",
        addLora: "Add LoRA",
        emptyTitle: "No LoRA added",
        emptyHint: "Click Add LoRA above to start",
        search: "Search LoRA",
        close: "Close",
        noPreview: "No preview",
        noTriggers: "not set",
        triggerTipLabel: "Triggers: ",
        pickerEmpty: "No LoRA found",
        pickerAllFolders: "All",
        pickerRootFolder: "Root",
        pickerHint: "Hover to preview, click to choose; ↑↓ to move, Enter to confirm",
        loadFailed: "Failed to load the LoRA list",
        preset: "My Recipes",
        presetTitle: "LoRA Recipes",
        presetNamePlaceholder: "Recipe name…",
        presetSave: "Save current",
        presetLoad: "Load",
        presetAppend: "Append",
        presetRename: "Rename",
        presetDelete: "Delete",
        presetEmpty: "No recipes yet — save one below",
        presetCount: "{count} entries",
        presetSaved: "Recipe \"{name}\" saved",
        presetLoaded: "Recipe \"{name}\" loaded",
        presetAppended: "Recipe \"{name}\" appended",
        presetDeleted: "Recipe \"{name}\" deleted",
        presetRenamed: "Renamed",
        presetConfirmLoad: "This will replace the current {count} entries. Continue?",
        presetConfirmDelete: "Delete recipe \"{name}\"?",
        presetNameRequired: "Please enter a recipe name",
        presetDuplicate: "A recipe with this name already exists",
        presetSaveEmpty: "No entries to save",
        presetError: "Recipe operation failed",
        presetFooterRecipes: "{count} recipes",
        presetFooterRows: "{count} current",
        presetFooterHint: "Hover a recipe to preview its contents",
        settings: "Settings",
        settingsPreview: "Preview thumbnail",
        settingsPreviewDesc: "When off, the preview pane in the Add LoRA panel is hidden.",
        settingsStrengthRange: "Weight range",
        settingsStrengthRangeDesc: "Set the minimum and maximum for strength input and stepping; values outside the range are clamped to the bounds.",
        settingsStrengthReset: "Reset",
        settingsMultiSelect: "Batch add LoRAs",
        settingsMultiSelectDesc: "When on, you can check multiple models in the Add LoRA panel and load them all at once.",
        pickerBatchHint: "Hover to preview, click to check multiple models; ↑↓ to move, Space to check, Enter to add all",
        pickerBatchAdd: "Add selected",
        pickerBatchCount: "{count} selected",
        pickerBatchDuplicate: "All selected LoRAs are already in the list",
    },
};

const STYLE_TEXT = `
.zll-root,
.zll-root *,
.zll-tip,
.zll-picker,
.zll-picker * { box-sizing: border-box; }
.zll-root {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    padding: 6px;
    font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 12px;
    line-height: 1.4;
    color: #DDE9F5;
}
.zll-panel {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    min-height: 0;
    padding: 6px;
    background: rgba(40, 44, 52, 0.6);
    border: none;
    border-radius: 6px;
}
.zll-root input,
.zll-root button,
.zll-root select,
.zll-root textarea,
.zll-picker input,
.zll-picker button,
.zll-picker select,
.zll-picker textarea { font-family: inherit; }
.zll-head {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    flex: 0 0 auto;
    align-items: center;
    gap: 8px;
    height: 24px;
    min-height: 24px;
    padding: 0 2px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.3);
}
.zll-head > .zll-toggle { justify-self: start; }
.zll-head > .zll-state { justify-self: center; align-self: end; margin-bottom: 5px; }
.zll-head > .zll-presetbtn { justify-self: end; }
.zll-toggle {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    color: rgba(226, 232, 240, 0.8);
    font-size: 13px;
    font-weight: 500;
    cursor: default;
    user-select: none;
}
.zll-check {
    position: relative;
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    margin: 0;
    padding: 0;
    appearance: none;
    -webkit-appearance: none;
    background: rgba(5, 11, 22, 0.6);
    border: 1px solid rgba(147, 197, 253, 0.34);
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 120ms ease, border-color 120ms ease;
}
.zll-check:hover:not(:disabled):not(:checked):not(:indeterminate) {
    background: rgba(59, 130, 246, 0.14);
    border-color: rgba(147, 197, 253, 0.88);
}
.zll-check:checked,
.zll-check:indeterminate {
    background: #4A8FD2;
    border-color: #4A8FD2;
}
.zll-check:checked:hover:not(:disabled),
.zll-check:indeterminate:hover:not(:disabled) {
    background: #6BA5E2;
    border-color: transparent;
}
.zll-check:checked::after {
    content: "";
    position: absolute;
    inset: 0;
    background: #FFFFFF;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='5.4 13.2 10 16.3 18.6 7.7' fill='none' stroke='%23fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='5.4 13.2 10 16.3 18.6 7.7' fill='none' stroke='%23fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
}
.zll-check:indeterminate::after {
    content: "";
    position: absolute;
    inset: 0;
    background: #FFFFFF;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cline x1='6.6' y1='12' x2='17.4' y2='12' stroke='%23fff' stroke-width='2.2' stroke-linecap='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cline x1='6.6' y1='12' x2='17.4' y2='12' stroke='%23fff' stroke-width='2.2' stroke-linecap='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
}
.zll-check:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
.zll-check--row {
    width: 18px;
    height: 18px;
    border-radius: 4px;
}
.zll-state {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 5px;
    height: 16px;
    padding: 0 7px 1px;
    border: 1px solid rgba(96, 165, 250, 0.35);
    border-radius: 8px;
    background: rgba(59, 130, 246, 0.1);
    font-size: 9px;
    white-space: nowrap;
    user-select: none;
}
.zll-state__dot {
    flex: 0 0 auto;
    display: block;
    width: 9px;
    height: 9px;
    color: #3B82F6;
}
.zll-state__num {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: #EAF2FB;
    line-height: 1;
}
.zll-state__word {
    color: #A8C4E2;
    line-height: 1;
}
.zll-state[data-state="partial"] {
    border-color: rgba(251, 191, 36, 0.45);
    background: rgba(251, 191, 36, 0.1);
}
.zll-state[data-state="partial"] .zll-state__dot {
    color: #FBBF24;
}
.zll-state[data-state="partial"] .zll-state__num { color: #FDE68A; }
.zll-state[data-state="partial"] .zll-state__word { color: #E8C97A; }
.zll-state[data-state="none"],
.zll-state[data-state="empty"] {
    border-color: rgba(120, 132, 150, 0.35);
    background: rgba(120, 132, 150, 0.1);
}
.zll-state[data-state="none"] .zll-state__dot,
.zll-state[data-state="empty"] .zll-state__dot {
    color: #6B7280;
}
.zll-state[data-state="none"] .zll-state__dot circle:first-child,
.zll-state[data-state="empty"] .zll-state__dot circle:first-child {
    opacity: 0;
}
.zll-state[data-state="none"] .zll-state__num,
.zll-state[data-state="empty"] .zll-state__num { color: #8A92A0; }
.zll-state[data-state="none"] .zll-state__word,
.zll-state[data-state="empty"] .zll-state__word { color: #7E8797; }
.zll-listwrap {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
}
.zll-list {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
    max-height: none;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0 10px 0 0;
    scrollbar-width: none;
}
.zll-list::-webkit-scrollbar { width: 0; height: 0; }
.zll-scroll {
    position: absolute;
    top: 1px;
    right: 1px;
    bottom: 1px;
    width: 6px;
    border-radius: 3px;
    background: rgba(147, 197, 253, 0.14);
}
.zll-scroll__thumb {
    position: absolute;
    top: 0;
    left: 1px;
    width: 4px;
    border-radius: 2px;
    background: rgba(147, 197, 253, 0.55);
    cursor: grab;
    opacity: 0;
    transition: opacity 140ms ease;
}
.zll-scroll[data-visible="true"] .zll-scroll__thumb { opacity: 1; }
.zll-scroll__thumb:hover { background: rgba(147, 197, 253, 0.8); }
.zll-scroll__thumb:active {
    cursor: grabbing;
    background: rgba(147, 197, 253, 0.9);
}
.zll-item { position: relative; border-radius: 6px; }
.zll-item--dragging { opacity: 0.55; }
.zll-item--drop-before::before,
.zll-item--drop-after::after {
    content: "";
    position: absolute;
    left: 2px;
    right: 2px;
    height: 2px;
    border-radius: 1px;
    background: #3B82F6;
    box-shadow: 0 0 6px rgba(59, 130, 246, 0.8);
    pointer-events: none;
    z-index: 2;
}
.zll-item--drop-before::before { top: -3px; }
.zll-item--drop-after::after { bottom: -3px; }
.zll-row {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 5px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: #333949;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition: background-color 120ms ease, border-color 120ms ease;
}
.zll-row:hover { background: #344258; }
.zll-item[data-enabled="false"] .zll-row { background: #2F3440; }
.zll-item[data-enabled="false"] .zll-name { color: #7E8899; }
.zll-item[data-enabled="false"] .zll-handle,
.zll-item[data-enabled="false"] .zll-delete { color: #586373; }
.zll-item[data-enabled="false"]:not([data-expanded="true"]) .zll-more:not(:hover) { color: #586373; }
.zll-item[data-enabled="false"] .zll-marker { opacity: 0.32; }
.zll-item[data-enabled="false"] .zll-strength input { color: rgba(226, 232, 240, 0.6); }
.zll-item[data-enabled="false"] .zll-sub { opacity: 0.62; }
.zll-item[data-expanded="true"] .zll-row,
.zll-item[data-focus="true"] .zll-row {
    background: #375271;
    border-color: rgba(96, 165, 250, 0.6);
}
.zll-handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 14px;
    height: 24px;
    color: #5E7591;
    cursor: grab;
    touch-action: none;
}
.zll-handle:hover { color: #93C5FD; }
.zll-handle:active { cursor: grabbing; }
.zll-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #7C93B0;
    font: inherit;
    line-height: 0;
    cursor: pointer;
    transition: color 120ms ease, border-color 120ms ease;
}
.zll-icon:hover { color: #DDE9F5; }
.zll-icon:disabled { opacity: 0.4; cursor: default; }
.zll-more {
    border: 1px solid rgba(147, 197, 253, 0.34);
    background: rgba(96, 165, 250, 0.1);
    transition: border-color 120ms ease, background-color 120ms ease, color 120ms ease;
}
.zll-more:hover,
.zll-item[data-expanded="true"] .zll-more {
    border-color: rgba(147, 197, 253, 0.88);
    background: rgba(59, 130, 246, 0.22);
    color: #FFFFFF;
}
.zll-more svg { transition: transform 140ms ease, fill 120ms ease; }
.zll-more:active svg,
.zll-item[data-expanded="true"] .zll-more svg { transform: rotate(-90deg); }
.zll-marker {
    flex: 0 0 auto;
    width: 5px;
    height: 12px;
    border-radius: 999px;
    background: #4A8FD2;
    opacity: 0;
    transition: opacity 120ms ease;
}
.zll-marker[data-on="true"] { opacity: 1; }
.zll-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #D2D6DF;
    font-size: 12px;
    font-weight: 500;
    user-select: none;
    -webkit-user-select: none;
}
.zll-strength {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 4px;
    height: 24px;
}
.zll-step {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #93A9C4;
    line-height: 0;
    cursor: pointer;
    user-select: none;
    transition: color 120ms ease;
}
.zll-step svg {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    width: 13px;
    height: 13px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition: stroke-width 120ms ease;
}
.zll-step:hover {
    color: #FFFFFF;
}
.zll-step:hover svg {
    stroke-width: 3;
}
.zll-strength input {
    width: 42px;
    min-width: 42px;
    height: 18px;
    padding: 0;
    border: 1px solid rgba(5, 11, 22, 0.9);
    border-radius: 4px;
    background: rgba(3, 8, 16, 0.72);
    color: #EAF2FB;
    font-size: 12.5px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: center;
    outline: none;
    transition: border-color 120ms ease, box-shadow 120ms ease;
    -moz-appearance: textfield;
    appearance: textfield;
}
.zll-strength input:focus {
    border-color: #4A8FD2;
    box-shadow: 0 0 4px rgba(74, 143, 210, 0.35);
}
.zll-strength input::-webkit-outer-spin-button,
.zll-strength input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.zll-item[data-enabled="false"] .zll-strength { opacity: 0.55; }
.zll-delete { border: 1px solid transparent; }
.zll-delete:hover { color: #F87171; }
.zll-sub {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0 0;
    padding: 4px 6px;
    border: 1px solid rgba(96, 165, 250, 0.1);
    border-radius: 5px;
    background: rgba(30, 38, 52, 0.55);
    transition: border-color 120ms ease, background-color 120ms ease;
}
.zll-item[data-expanded="true"] .zll-sub,
.zll-sub:focus-within {
    background: #375271;
    border-color: rgba(96, 165, 250, 0.6);
}
.zll-sub__bar {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 1 auto;
    min-width: 0;
    padding: 0;
    border: none;
    background: none;
}
.zll-replace {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    margin-left: auto;
    gap: 4px;
    height: 18px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: #4A8FD2;
    color: #FFFFFF;
    font: inherit;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}
.zll-replace span {
    display: block;
    line-height: 18px;
}
.zll-replace:hover {
    color: #FFFFFF;
    background: #6BA5E2;
}
.zll-replace svg {
    display: block;
    flex: 0 0 auto;
    align-self: center;
}
.zll-sub[hidden] { display: none; }
.zll-sub__label {
    flex: 0 0 auto;
    color: #D9E6F8;
    font-size: 12px;
    font-weight: 700;
}
.zll-trigger {
    flex: 0 1 220px;
    min-width: 96px;
    width: 220px;
    max-width: 220px;
    height: 20px;
    padding: 0 6px;
    border: 1px solid rgba(5, 11, 22, 0.9);
    border-radius: 4px;
    background: rgba(3, 8, 16, 0.72);
    color: #EAF2FB;
    font: inherit;
    font-size: 11px;
    outline: none;
    transition: border-color 120ms ease, box-shadow 120ms ease;
}
.zll-trigger:focus {
    border-color: #4A8FD2;
    box-shadow: 0 0 4px rgba(74, 143, 210, 0.35);
}
.zll-trigger::placeholder { color: #46597A; }
.zll-copy {
    border: 1px solid #4A8FD2;
    background: #4A8FD2;
    color: #FFFFFF;
}
.zll-copy:hover {
    border-color: #6BA5E2;
    background: #6BA5E2;
    color: #FFFFFF;
}
.zll-copy--ok { color: #34D399; }
.zll-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 18px 8px;
}
.zll-empty__title {
    color: #93A9C4;
    font-size: 12px;
    font-weight: 500;
}
.zll-empty__hint {
    color: #5E7591;
    font-size: 11px;
}
.zll-foot {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 8px;
    padding: 0;
    background: none;
    border: none;
}
.zll-add {
    display: inline-flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: #4A8FD2;
    color: #FFFFFF;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 120ms ease;
}
.zll-add__plus {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.22);
}
.zll-add__plus svg {
    display: block;
}
.zll-add:hover {
    background: #6BA5E2;
    color: #FFFFFF;
}
.zll-presetbtn {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 2px;
    border: none;
    background: none;
    color: #93C5FD;
    font: inherit;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: color 120ms ease;
}
.zll-presetbtn__chev {
    color: inherit;
    opacity: 0.75;
    font-size: 12px;
    line-height: 1;
}
.zll-presetbtn:hover { color: #BFDBFE; }
.zll-presetbtn:hover .zll-presetbtn__chev { opacity: 1; }
.zll-presetbtn svg { color: #93C5FD; }
.zll-presetbtn:hover svg { color: #BFDBFE; }
.zll-tip {
    position: fixed;
    z-index: 10090;
    max-width: 260px;
    padding: 5px 8px;
    border: 1px solid rgba(147, 197, 253, 0.35);
    border-radius: 6px;
    background: rgba(8, 14, 26, 0.94);
    box-shadow: 0 8px 24px rgba(2, 6, 23, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: #F2FAFF;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    line-height: 1.5;
    pointer-events: none;
    opacity: 0;
    transform: translateY(2px);
    transition: opacity 120ms ease, transform 120ms ease;
}
.zll-tip--visible {
    opacity: 1;
    transform: translateY(0);
}
.zll-tip--list {
    max-width: 340px;
    padding: 9px 12px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
}
.zll-tip__rows {
    display: flex;
    flex-direction: column;
    gap: 3px;
    white-space: normal;
}
.zll-tip__name {
    padding-left: 13px;
    text-indent: -13px;
    word-break: break-word;
}
.zll-tip__name::before {
    content: "";
    display: inline-block;
    width: 5px;
    height: 5px;
    margin-right: 8px;
    border-radius: 50%;
    background: #60A5FA;
    vertical-align: middle;
}
.zll-row-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 10px;
    width: 200px;
    max-width: 200px;
    font-size: 13px;
}
.zll-row-tip__name {
    width: 100%;
    font-size: 15px;
    font-weight: 600;
    color: #EAF2FB;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.zll-row-tip__img {
    display: block;
    width: 100%;
    aspect-ratio: 3 / 4;
    height: auto;
    max-height: none;
    object-fit: contain;
    border-radius: 4px;
    background: rgba(4, 10, 20, 0.65);
}
.zll-row-tip__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    aspect-ratio: 3 / 4;
    border: 1px dashed rgba(147, 197, 253, 0.35);
    border-radius: 4px;
    background: rgba(4, 10, 20, 0.65);
    color: #5E7591;
    font-size: 12px;
}
.zll-row-tip__text {
    width: 100%;
    text-align: center;
    font-size: 13px;
    line-height: 1.5;
    color: #F2FAFF;
    white-space: normal;
    word-break: break-word;
}
.zll-tip--rich {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 220px;
    max-width: 220px;
    padding: 6px;
}
.zll-tip__image {
    display: block;
    width: 100%;
    max-height: 160px;
    object-fit: cover;
    border-radius: 4px;
    background: rgba(148, 163, 184, 0.12);
}
.zll-tip__image[hidden] { display: none; }
.zll-tip__words {
    max-height: 84px;
    overflow: hidden;
    color: #F2FAFF;
    font-size: 12px;
    line-height: 1.5;
    word-break: break-word;
    white-space: pre-wrap;
}
.zll-tip__words[hidden] { display: none; }
.zll-tip__label {
    display: block;
    margin-bottom: 2px;
    color: rgba(226, 232, 240, 0.6);
    font-size: 11px;
}
.zll-picker-overlay {
    position: fixed;
    inset: 0;
    z-index: 10050;
    background: rgba(3, 8, 16, 0.28);
}
.zll-picker {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: var(--zll-picker-w, 460px);
    max-width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
    overflow: hidden;
    visibility: hidden;
    background: linear-gradient(180deg, rgba(18, 26, 40, 0.98), rgba(8, 13, 24, 0.98));
    border: 1px solid rgba(96, 165, 250, 0.24);
    border-radius: 10px;
    box-shadow: 0 24px 70px rgba(2, 6, 23, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    color: #DDE9F5;
    font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: var(--zll-picker-fs, 12.5px);
    line-height: 1.4;
}
.zll-picker__head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    background: linear-gradient(180deg, rgba(30, 48, 78, 0.72), rgba(22, 36, 60, 0.5));
    box-shadow: inset 0 1px 0 rgba(147, 197, 253, 0.12);
}
.zll-picker__search {
    flex: 0 0 auto;
    /* 右缘与预览列左侧的竖向分割线对齐，宽度固定不随状态变化 */
    width: var(--zll-picker-search-w, calc(var(--zll-picker-w, 760px) - clamp(168px, 26%, 240px) - 25px));
    min-width: 0;
    height: 1.8em;
    padding: 0 0.6em;
    border: 1px solid rgba(96, 165, 250, 0.2);
    border-radius: 4px;
    background: rgba(4, 10, 20, 0.65);
    color: #DDE9F5;
    font: inherit;
    font-size: calc(var(--zll-picker-fs, 12.5px) - 1px);
    outline: none;
}
.zll-picker__search:focus { border-color: #3B82F6; }
.zll-picker__search::placeholder { color: #5E7591; }
.zll-picker__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    /* 左缘与下方列表的路径标识对齐：列表内边距 4px + 行内边距 0.48em */
    padding: 10px 2px 8px calc(4px + 0.48em);
    border-bottom: 1px solid rgba(96, 165, 250, 0.14);
}
.zll-picker__chip {
    display: inline-flex;
    align-items: center;
    max-width: 180px;
    height: 24px;
    padding: 0 12px;
    border: 1px solid rgba(96, 165, 250, 0.25);
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.08);
    color: #8FA9C9;
    font: inherit;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
}
.zll-picker__chip:hover {
    border-color: rgba(96, 165, 250, 0.45);
    color: #C7D9EF;
}
.zll-picker__chip[data-active="true"] {
    border-color: rgba(96, 165, 250, 0.65);
    background: rgba(59, 130, 246, 0.28);
    color: #FFFFFF;
}
.zll-picker__close {
    width: calc(0.94em + 2px);
    height: calc(0.94em + 2px);
    margin-left: auto;
    font-size: 1.28em;
    border-radius: 4px;
    background: #3D4557;
    color: #E6ECF5;
}
.zll-picker__close svg {
    display: block;
    width: 11px;
    height: 11px;
    margin: 0;
}
.zll-picker__close:hover {
    background: #E05252;
    color: #FFFFFF;
}
.zll-picker__body {
    display: flex;
    min-height: 0;
    height: var(--zll-picker-body-h, 320px);
}
.zll-pick__list {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 4px;
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 197, 253, 0.35) transparent;
}
.zll-pick__list::-webkit-scrollbar { width: 6px; }
.zll-pick__list::-webkit-scrollbar-thumb {
    background: rgba(147, 197, 253, 0.35);
    border-radius: 3px;
}
.zll-pick__empty {
    padding: 20px 8px;
    color: #5E7591;
    font-size: 0.96em;
    text-align: center;
}
.zll-pick__row {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 2.2em;
    padding: 0.32em 0.48em;
    border-radius: 6px;
    cursor: pointer;
}
.zll-pick__row:hover { background: rgba(59, 130, 246, 0.12); }
.zll-pick__row[data-selected="true"] {
    background: rgba(59, 130, 246, 0.22);
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.45);
}
.zll-pick__check {
    position: relative;
    flex: 0 0 auto;
    width: 14px;
    height: 14px;
    border: 1px solid rgba(147, 197, 253, 0.42);
    border-radius: 4px;
    background: rgba(15, 23, 42, 0.9);
    transition: background-color 120ms ease, border-color 120ms ease;
}
.zll-pick__row:hover .zll-pick__check {
    border-color: rgba(147, 197, 253, 0.72);
}
.zll-pick__check[data-on="true"] {
    border-color: #3B82F6;
    background: #2563EB;
}
.zll-pick__check[data-on="true"]::after {
    content: "";
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid #FFFFFF;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}
.zll-pick__meta {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
}
.zll-pick__name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #DDE9F5;
    font-size: 0.96em;
}
.zll-pick__folder {
    flex: 0 0 auto;
    max-width: 45%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #5E7591;
    font-size: 0.84em;
}
.zll-picker__preview {
    display: flex;
    flex: 0 0 clamp(168px, 26%, 240px);
    flex-direction: column;
    justify-content: flex-start;
    gap: 6px;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    padding: 8px;
    border-left: 1px solid rgba(96, 165, 250, 0.14);
}
.zll-picker__frame {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    height: 280px;
    width: 100%;
    overflow: hidden;
    border: 1px solid rgba(96, 165, 250, 0.16);
    border-radius: 6px;
    background: rgba(4, 10, 20, 0.7);
}
.zll-picker__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.zll-picker__image[hidden] { display: none; }
.zll-picker__empty {
    color: #5E7591;
    font-size: 0.88em;
}
.zll-picker__empty[hidden] { display: none; }
.zll-picker__namelabel {
    flex: 0 0 auto;
    height: 5.6em;
    overflow: hidden;
    overflow-wrap: anywhere;
    text-align: center;
    color: #A9BDD6;
    font-size: 0.84em;
    line-height: 1.4;
    user-select: text;
}
.zll-picker__hint {
    padding: 6px 8px;
    border-top: 1px solid rgba(96, 165, 250, 0.16);
    background: rgba(30, 48, 78, 0.55);
    color: #7C93B0;
    font-size: 0.84em;
}
.zll-picker__batch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 8px;
    border-top: 1px solid rgba(96, 165, 250, 0.16);
    background: rgba(24, 39, 64, 0.7);
}
.zll-picker__batch-count {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #A9BDD6;
    font-size: 0.84em;
}
.zll-picker__batch-btn {
    flex: 0 0 auto;
    height: 24px;
    padding: 0 10px;
    border: 1px solid rgba(96, 165, 250, 0.5);
    border-radius: 6px;
    background: rgba(37, 99, 235, 0.85);
    color: #FFFFFF;
    font: inherit;
    font-size: 0.84em;
    cursor: pointer;
    transition: background-color 120ms ease, border-color 120ms ease, opacity 120ms ease;
}
.zll-picker__batch-btn:hover:not(:disabled) {
    background: #2563EB;
    border-color: #60A5FA;
}
.zll-picker__batch-btn:disabled {
    opacity: 0.45;
    cursor: default;
}
.zll-preset-overlay {
    position: fixed;
    inset: 0;
    z-index: 10060;
}
.zll-preset {
    position: fixed;
    z-index: 10061;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 480px;
    max-width: calc(100vw - 16px);
    max-height: min(620px, calc(100vh - 32px));
    padding: 16px;
    border: 1px solid rgba(96, 165, 250, 0.22);
    border-radius: 10px;
    background: rgba(24, 29, 38, 0.98);
    box-shadow: 0 12px 32px rgba(2, 6, 23, 0.55);
    color: #DDE9F5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
}
.zll-preset__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.zll-preset__title {
    color: #DDE9F5;
    font-size: 16px;
    font-weight: 600;
}
.zll-preset__close {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 400;
    line-height: 1;
    border: none;
    background: #3D4557;
    color: #C9D3E0;
    transition: background-color 120ms ease, color 120ms ease;
}
.zll-preset__close:hover {
    background: #C75454;
    color: #FFFFFF;
}
.zll-preset__save {
    display: flex;
    align-items: center;
    gap: 0;
}
.zll-preset__name {
    flex: 1 1 auto;
    min-width: 0;
    height: 26px;
    padding: 0 8px;
    border: 1px solid rgba(96, 165, 250, 0.2);
    border-radius: 5px 0 0 5px;
    background: rgba(5, 11, 22, 0.55);
    color: #DDE9F5;
    font: inherit;
    font-size: 12px;
    outline: none;
}
.zll-preset__name:focus { border-color: #3B82F6; }
.zll-preset__name::placeholder { color: #5E7591; }
.zll-preset__savebtn {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 26px;
    margin-left: -1px;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: 0 5px 5px 0;
    background: #4A8FD2;
    color: #FFFFFF;
    font: inherit;
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
    transition: background-color 120ms ease;
}
.zll-preset__savebtn:hover { background: #6BA5E2; }
.zll-preset__savebtn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
.zll-preset__list {
    flex: 1 1 auto;
    min-height: 0;
    max-height: 364px;
    overflow-y: scroll;
    overflow-x: hidden;
    overscroll-behavior: contain;
}
.zll-preset__list::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
.zll-preset__list::-webkit-scrollbar-track {
    border: 2px solid transparent;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.45);
    background-clip: padding-box;
}
.zll-preset__list::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background: rgba(120, 170, 235, 0.38);
    background-clip: padding-box;
}
.zll-preset__list::-webkit-scrollbar-thumb:hover {
    background: rgba(147, 197, 253, 0.78);
    background-clip: padding-box;
}
.zll-preset__list::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
}
.zll-preset__list::-webkit-scrollbar-corner {
    background: transparent;
}
.zll-preset__item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    height: 38px;
    padding: 0 8px;
    border: 1px solid rgba(96, 165, 250, 0.18);
    border-radius: 5px;
    background: rgba(66, 153, 225, 0.16);
}
.zll-preset__item + .zll-preset__item { margin-top: 6px; }
.zll-preset__meta {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    height: 26px;
    padding: 0 8px;
    border: 1px solid rgba(96, 165, 250, 0.1);
    border-radius: 4px;
    background: rgba(30, 38, 52, 0.55);
}
.zll-preset__label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #D2D6DF;
    font-weight: 600;
}
.zll-preset__count {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    height: 16px;
    padding: 0 7px;
    border: 1px solid rgba(96, 165, 250, 0.35);
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.1);
    color: #9FC1E4;
    font-size: 11px;
    white-space: nowrap;
}
.zll-preset__ops {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 4px;
}
.zll-preset__op {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 5px;
    background: #3D4557;
    color: #D5DCE6;
    font: inherit;
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
}
.zll-preset__op:not(.zll-preset__op--danger) {
    background: #4A8FD2;
    color: #FFFFFF;
}
.zll-preset__op:not(.zll-preset__op--danger):hover {
    color: #FFFFFF;
    background: #6BA5E2;
    border-color: transparent;
}
.zll-preset__op--danger {
    background: #FF0000;
    color: #FFFFFF;
}
.zll-preset__op--danger:hover {
    color: #FFFFFF;
    background: #FF3333;
    border-color: transparent;
}
.zll-preset__rename {
    flex: 1 1 auto;
    min-width: 0;
    height: 24px;
    padding: 0 8px;
    border: 1px solid rgba(96, 165, 250, 0.2);
    border-radius: 6px;
    background: rgba(5, 11, 22, 0.55);
    color: #DDE9F5;
    font: inherit;
    font-size: 13px;
    outline: none;
}
.zll-preset__rename:focus { border-color: #3B82F6; }
.zll-preset__empty {
    padding: 28px 10px;
    color: #5E7591;
    font-size: 13px;
    text-align: center;
}
.zll-preset__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 30px;
    padding-top: 10px;
    border-top: 1px solid rgba(96, 165, 250, 0.14);
    font-size: 14px;
    line-height: 1.4;
}
.zll-preset__stats {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: #7C93B0;
    white-space: nowrap;
}
.zll-preset__stat {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}
.zll-preset__stat + .zll-preset__stat::before {
    content: "";
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(147, 197, 253, 0.5);
}
.zll-preset__toast {
    display: inline-flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    min-width: 0;
    color: #7C93B0;
}
.zll-preset__toast::before {
    content: "*";
    flex: 0 0 auto;
    color: #93C5FD;
    font-size: 17px;
    font-weight: 600;
    line-height: 1;
    transform: translateY(2px);
    transition: color 160ms ease;
}
.zll-preset__toast-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.zll-preset__toast[data-tone="ok"] { color: #7EDCB4; }
.zll-preset__toast[data-tone="ok"]::before { color: #34D399; }
.zll-preset__toast[data-tone="error"] { color: #F0A0A0; }
.zll-preset__toast[data-tone="error"]::before { color: #F87171; }
.zll-preset__toast.is-flash { animation: zll-preset-flash 180ms ease-out; }
@keyframes zll-preset-flash {
    from {
        opacity: 0;
        transform: translateY(3px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}
.zll-settings-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 10062;
    display: flex;
    flex-direction: column;
    width: 340px;
    max-width: calc(100vw - 24px);
    padding: 14px;
    border: 1px solid #34577F;
    border-radius: 12px;
    background: rgba(23, 36, 58, 0.94);
    box-shadow: 0 34px 90px rgba(2, 6, 23, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    color: #DDE9F5;
    font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 14px;
    line-height: 1.55;
    box-sizing: border-box;
    transform: translate(-50%, -50%);
    animation: zll-settings-in 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.zll-settings-dialog.closing {
    animation: zll-settings-out 140ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.zll-settings-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10061;
    background: rgba(2, 6, 23, 0.55);
    backdrop-filter: blur(6px) saturate(1.15);
    -webkit-backdrop-filter: blur(6px) saturate(1.15);
    animation: zll-settings-backdrop-in 180ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.zll-settings-backdrop.closing {
    animation: zll-settings-backdrop-out 140ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.zll-settings__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #34577F;
}
.zll-settings__title {
    margin: 0;
    padding-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #F2FAFF;
    font-size: 14.5px;
    font-weight: 600;
}
.zll-settings__close {
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 6px;
    background: #DC2626;
    color: #FFFFFF;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    transition: background-color 140ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 140ms cubic-bezier(0.22, 1, 0.36, 1);
}
.zll-settings__close:hover {
    background: #EF4444;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
.zll-settings__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: default;
}
.zll-settings__label {
    color: #C6D8EC;
    font-size: 13.5px;
    font-weight: 700;
}
.zll-settings__desc {
    margin: 8px 0 0;
    color: #98AECC;
    font-size: 13px;
    line-height: 1.7;
}
.zll-settings__section {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid rgba(64, 104, 154, 0.7);
}
.zll-settings__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}
.zll-settings__reset {
    flex: 0 0 auto;
    padding: 2px 10px;
    border: 1px solid rgba(96, 165, 250, 0.28);
    border-radius: 999px;
    background: transparent;
    color: #A6BAD5;
    font: inherit;
    font-size: 12.5px;
    line-height: 1.6;
    cursor: pointer;
    transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}
.zll-settings__reset:hover {
    border-color: #3B82F6;
    background: rgba(59, 130, 246, 0.16);
    color: #60A5FA;
}
.zll-settings__range {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
}
.zll-settings__stepper {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 2px;
    height: 30px;
    padding: 0 4px;
    border: 1px solid rgba(112, 152, 202, 0.32);
    border-radius: 999px;
    background: #181E2C;
    box-sizing: border-box;
    transition: border-color 140ms ease, box-shadow 140ms ease;
}
.zll-settings__stepper:hover {
    border-color: rgba(147, 197, 253, 0.5);
}
.zll-settings__stepper:focus-within {
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.24);
}
.zll-settings__step {
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: #93A9C4;
    font-family: inherit;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
}
.zll-settings__step:hover {
    background: rgba(59, 130, 246, 0.22);
    color: #60A5FA;
}
.zll-settings__step:active {
    background: rgba(59, 130, 246, 0.38);
    color: #93C5FD;
}
.zll-settings__num {
    flex: 1 1 0;
    min-width: 0;
    height: 24px;
    padding: 0 2px;
    border: none;
    background: transparent;
    color: #E8F2FB;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: center;
    outline: none;
    box-sizing: border-box;
    -moz-appearance: textfield;
    appearance: textfield;
}
.zll-settings__num::-webkit-outer-spin-button,
.zll-settings__num::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.zll-settings__sep {
    flex: 0 0 auto;
    color: #93A9C4;
    font-size: 13px;
}
.zll-settings__switch {
    position: relative;
    flex: 0 0 auto;
    width: 38px;
    height: 20px;
    margin: 0;
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid rgba(96, 165, 250, 0.28);
    border-radius: 999px;
    background: rgba(30, 41, 59, 0.8);
    cursor: pointer;
    transition: background-color 160ms ease, border-color 160ms ease;
}
.zll-settings__switch::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #93A9C4;
    transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1), background-color 160ms ease;
}
.zll-settings__switch:checked {
    background: rgba(37, 99, 235, 0.85);
    border-color: #3B82F6;
}
.zll-settings__switch:checked::after {
    transform: translateX(18px);
    background: #FFFFFF;
}
@keyframes zll-settings-in {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes zll-settings-out {
    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    to { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
}
@keyframes zll-settings-backdrop-in {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes zll-settings-backdrop-out {
    from { opacity: 1; }
    to { opacity: 0; }
}
`;

const HANDLE_ICON = '<svg viewBox="0 0 10 18" width="10" height="18" fill="currentColor" aria-hidden="true"><circle cx="2.5" cy="4" r="1.2"/><circle cx="7.5" cy="4" r="1.2"/><circle cx="2.5" cy="9" r="1.2"/><circle cx="7.5" cy="9" r="1.2"/><circle cx="2.5" cy="14" r="1.2"/><circle cx="7.5" cy="14" r="1.2"/></svg>';
const STEP_DOWN_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const STEP_UP_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
const MORE_ICON = '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true"><path d="M12 19 4.5 6h15z"/></svg>';
const PRESET_ICON = '<svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 6.4C8.4 5.2 6.4 4.5 4 4.5v8.9c2.4 0 4.4.7 6 1.9Z"/><path d="M10 6.4c1.6-1.2 3.6-1.9 6-1.9v8.9c-2.4 0-4.4.7-6 1.9"/></svg>';
const SWAP_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/></svg>';
const DELETE_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 6.8h15"/><path d="M9.6 6.8V5.1a1.1 1.1 0 0 1 1.1-1.1h2.6a1.1 1.1 0 0 1 1.1 1.1v1.7"/><path d="M6.6 6.8l.78 12.06a1.55 1.55 0 0 0 1.55 1.44h6.14a1.55 1.55 0 0 0 1.55-1.44L17.4 6.8"/><path d="M6.75 11.1H17.25" stroke-linecap="butt"/><path d="M7.02 15.1H16.98" stroke-linecap="butt"/></svg>';
const COPY_ICON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
const PRESET_LOAD_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>';
const PRESET_APPEND_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
const PRESET_RENAME_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
const PRESET_SAVE_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>';

let uidSeq = 0;
let tipEl = null;
let rowTipState = null;
let tipTimer = null;
let modelsCache = { time: 0, items: null };
const previewFailures = new Set();
let pickerState = null;
const draftFlushNodes = new Set();

function flushDrafts() {
    draftFlushNodes.forEach((node) => writeDraftNow(node));
    draftFlushNodes.clear();
}

if (typeof window !== "undefined" && !window.__zllDraftFlushBound) {
    window.__zllDraftFlushBound = true;
    window.addEventListener("pagehide", flushDrafts);
    window.addEventListener("beforeunload", flushDrafts);
}

function $t(key) {
    const locale = getLocale();
    return i18n[locale]?.[key] ?? i18n.en[key] ?? key;
}

function installStyles() {
    if (document.getElementById("zhiai-lora-stack-style")) return;
    const style = document.createElement("style");
    style.id = "zhiai-lora-stack-style";
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}

function findWidget(node, name) {
    return (node?.widgets || []).find((widget) => widget?.name === name) || null;
}

function makeRow(data) {
    const row = {
        name: "",
        enabled: true,
        strength: 1,
        trigger_words: "",
        expanded: false,
        uid: ++uidSeq,
    };
    if (data) Object.assign(row, data);
    return row;
}

function finiteStrength(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function round2(value) {
    return Math.round(value * 100) / 100;
}

function strengthText(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "0.0";
    const text = number.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
    if (!text.includes(".")) return `${text}.0`;
    return text;
}

function parseExecutionRows(value) {
    try {
        const data = typeof value === "string" ? JSON.parse(value) : value;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.__value__)) return data.__value__;
        return [];
    } catch (_) {
        return [];
    }
}

function executionRows(node) {
    return (node._zllRows || [])
        .filter((row) => String(row.name || "").trim())
        .map((row) => ({
            name: String(row.name || ""),
            enabled: row.enabled !== false,
            strength: finiteStrength(row.strength, 0),
            trigger_words: String(row.trigger_words || ""),
        }));
}

function rowPayload(node) {
    return (node._zllRows || [])
        .filter((row) => String(row.name || "").trim())
        .map((row) => ({
        name: String(row.name || ""),
        enabled: row.enabled !== false,
        strength: finiteStrength(row.strength, 0),
        trigger_words: String(row.trigger_words || ""),
        expanded: row.expanded === true,
    }));
}

function uiState(node) {
    const bounds = strengthBounds(node);
    return {
        version: UI_STATE_VERSION,
        instanceId: instanceIdFor(node),
        rows: rowPayload(node),
        showPreview: node._zllShowPreview !== false,
        strengthMin: bounds.min,
        strengthMax: bounds.max,
        multiSelect: node._zllMultiSelect === true,
    };
}

function instanceIdFor(node) {
    if (node._zllInstanceId) return node._zllInstanceId;
    const stored = node.properties?.[UI_PROPERTY];
    const fromProps = typeof stored?.instanceId === "string" ? stored.instanceId : "";
    const id = fromProps || `zll_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    node._zllInstanceId = id;
    return id;
}

function draftScope() {
    try {
        const key = window.app?.extensionManager?.workflow?.activeWorkflow?.key;
        if (typeof key === "string" && key) return key;
    } catch (_) {}
    return "unsaved";
}

function draftKey(node) {
    return `${DRAFT_PREFIX}${draftScope()}/${instanceIdFor(node)}`;
}

function writeDraftNow(node) {
    if (node._zllDraftTimer) {
        clearTimeout(node._zllDraftTimer);
        node._zllDraftTimer = null;
    }
    draftFlushNodes.delete(node);
    try {
        const key = draftKey(node);
        const rows = rowPayload(node);
        const rowsJson = JSON.stringify(rows);
        let cleanAt = 0;
        const prevRaw = window.localStorage.getItem(key);
        if (prevRaw) {
            const prev = JSON.parse(prevRaw);
            if (prev && prev.rowsJson === rowsJson && Number.isFinite(prev.cleanAt)) {
                cleanAt = Number(prev.cleanAt);
            }
        }
        window.localStorage.setItem(key, JSON.stringify({ at: Date.now(), cleanAt, rowsJson, rows }));
    } catch (_) {}
}

function scheduleDraft(node) {
    draftFlushNodes.add(node);
    if (node._zllDraftTimer) return;
    node._zllDraftTimer = setTimeout(() => writeDraftNow(node), DRAFT_DELAY);
}

function markDraftClean(node) {
    try {
        const key = draftKey(node);
        const raw = window.localStorage.getItem(key);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data) return;
        data.cleanAt = Number(data.at) || Date.now();
        window.localStorage.setItem(key, JSON.stringify(data));
    } catch (_) {}
}

function readDraft(node) {
    try {
        const raw = window.localStorage.getItem(draftKey(node));
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.rows)) return null;
        const at = Number(data.at) || 0;
        const cleanAt = Number(data.cleanAt) || 0;
        if (!at) return null;
        if (Date.now() - at > DRAFT_TTL) return null;
        if (at <= cleanAt) return null;
        return data.rows;
    } catch (_) {
        return null;
    }
}

function posOf(node) {
    const p = node?.pos;
    if (!p) return null;
    const x = Number(p[0] ?? p.x);
    const y = Number(p[1] ?? p.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return [Math.round(x), Math.round(y)];
}

function writeHandoff(node) {
    try {
        const rows = rowPayload(node);
        if (!rows.length) return;
        window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({
            at: Date.now(),
            scope: draftScope(),
            nodeId: String(node.id ?? ""),
            instanceId: instanceIdFor(node),
            pos: posOf(node),
            nodes: window.app?.graph?._nodes?.length ?? null,
            rows,
        }));
    } catch (_) {}
}

function takeHandoff(node) {
    try {
        const raw = window.sessionStorage.getItem(HANDOFF_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.rows) || !data.rows.length) return null;
        if (data.scope !== draftScope()) return null;
        if (Date.now() - (Number(data.at) || 0) > HANDOFF_TTL) return null;
        const pos = posOf(node);
        if (Array.isArray(data.pos) && Array.isArray(pos)) {
            if (Math.abs(pos[0] - data.pos[0]) > 2 || Math.abs(pos[1] - data.pos[1]) > 2) return null;
        }
        const prevId = Number(data.nodeId);
        const nextId = Number(node.id);
        if (Number.isFinite(prevId) && Number.isFinite(nextId)) {
            const gap = nextId - prevId;
            if (gap < 1 || gap > HANDOFF_MAX_ID_GAP) return null;
        }
        const nowNodes = window.app?.graph?._nodes?.length;
        const prevNodes = Number(data.nodes);
        if (Number.isFinite(prevNodes) && Number.isFinite(nowNodes) && Math.abs(nowNodes - prevNodes) > 1) return null;
        window.sessionStorage.removeItem(HANDOFF_KEY);
        return data;
    } catch (_) {
        return null;
    }
}

function storedRows(node) {
    const ui = node.properties?.[UI_PROPERTY];
    if (!ui || typeof ui !== "object") return { rows: null, legacy: null };
    if (Array.isArray(ui.rows)) return { rows: ui.rows, legacy: null };
    const triggers = Array.isArray(ui.trigger_words) ? ui.trigger_words : [];
    const expanded = Array.isArray(ui.expanded) ? ui.expanded : [];
    if (!triggers.length && !expanded.length) return { rows: null, legacy: null };
    return { rows: null, legacy: { triggers, expanded } };
}

function signature(node) {
    const widget = findWidget(node, ROWS_WIDGET);
    return `${String(widget?.value ?? "")}|${JSON.stringify(node.properties?.[UI_PROPERTY] ?? null)}`;
}

function syncSignature(node) {
    node._zllSignature = signature(node);
}

// The strength field only commits on change/blur. If the user types a value and
// queues immediately (keyboard shortcut, toolbar button, API), the input can
// still be focused and the old row.strength would be serialized. Flush the
// focused strength input before the prompt is built.
function commitPendingStrength(node) {
    const active = document.activeElement;
    if (!active || !Array.isArray(node._zllRows)) return;
    const row = node._zllRows.find((item) => item._strengthInput === active);
    if (!row) return;
    const next = Number(active.value);
    if (!Number.isFinite(next)) return;
    row.strength = round2(clampStrength(node, next));
}

function writeExecutionRows(node, change = true) {
    const widget = findWidget(node, ROWS_WIDGET);
    if (!widget) return;
    commitPendingStrength(node);
    const json = JSON.stringify(executionRows(node));
    widget.serializeValue = () => {
        commitPendingStrength(node);
        return JSON.stringify(executionRows(node));
    };
    if (String(widget.value ?? "") !== json) {
        widget.value = json;
        if (widget._state) widget._state.value = json;
        if (change) node.graph?.change?.();
    }
    writeUiState(node, false);
    syncSignature(node);
}

function writeUiState(node, dirty = true) {
    node.properties = node.properties || {};
    const next = uiState(node);
    if (JSON.stringify(node.properties[UI_PROPERTY] ?? null) !== JSON.stringify(next)) {
        node.properties[UI_PROPERTY] = next;
    }
    if (dirty) node.graph?.setDirtyCanvas?.(true, true);
    syncSignature(node);
    scheduleDraft(node);
}

function loadRows(node) {
    const ui = node.properties?.[UI_PROPERTY];
    node._zllShowPreview = ui?.showPreview !== false;
    node._zllStrengthMin = typeof ui?.strengthMin === "number" && Number.isFinite(ui.strengthMin)
        ? ui.strengthMin
        : STRENGTH_MIN_DEFAULT;
    node._zllStrengthMax = typeof ui?.strengthMax === "number" && Number.isFinite(ui.strengthMax)
        ? ui.strengthMax
        : STRENGTH_MAX_DEFAULT;
    node._zllMultiSelect = ui?.multiSelect === true;
    const stored = storedRows(node);
    const widgetRows = parseExecutionRows(findWidget(node, ROWS_WIDGET)?.value);
    let snapshot = readDraft(node);
    if (!Array.isArray(snapshot) && !(Array.isArray(stored.rows) && stored.rows.length) && !widgetRows.length) {
        const handoff = takeHandoff(node);
        if (handoff) {
            node._zllInstanceId = handoff.instanceId || instanceIdFor(node);
            snapshot = readDraft(node);
            if (!Array.isArray(snapshot)) snapshot = handoff.rows;
        }
    }
    let source;
    if (Array.isArray(snapshot)) {
        source = snapshot;
    } else if (Array.isArray(stored.rows) && stored.rows.length) {
        source = stored.rows;
    } else if (widgetRows.length) {
        source = widgetRows.map((raw, index) => ({
            name: typeof raw?.name === "string" ? raw.name : "",
            enabled: raw?.enabled !== false,
            strength: raw?.strength,
            trigger_words: stored.legacy
                ? (stored.legacy.triggers?.[index] ?? "")
                : (typeof raw?.trigger_words === "string" ? raw.trigger_words : ""),
            expanded: stored.legacy
                ? stored.legacy.expanded?.[index] === true
                : raw?.expanded === true,
        }));
    } else {
        source = [];
    }
    const loadedRows = source
        .filter((raw) => String(raw?.name || "").trim())
        .map((raw) => makeRow({
        name: typeof raw?.name === "string" ? raw.name : "",
        enabled: raw?.enabled !== false,
        strength: finiteStrength(raw?.strength, 1),
        trigger_words: typeof raw?.trigger_words === "string" ? raw.trigger_words : "",
        expanded: raw?.expanded === true,
    }));
    // Older workflows/presets could contain the same LoRA more than once.
    // Keep the last occurrence so the panel matches execution (one row per
    // LoRA), matching the Python loader's dedupe.
    node._zllRows = [];
    loadedRows.forEach((row) => {
        const existing = node._zllRows.find((item) => item.name === row.name);
        if (existing) node._zllRows[node._zllRows.indexOf(existing)] = row;
        else node._zllRows.push(row);
    });
    if (Array.isArray(snapshot)) {
        writeExecutionRows(node, false);
        writeUiState(node, false);
    }
    syncSignature(node);
}

function stopPointer(event) {
    event.stopPropagation();
}

function stopKeys(event) {
    event.stopPropagation();
}

function hideRowsWidget(widget) {
    if (!widget) return;
    widget.options = widget.options || {};
    widget.options.hidden = true;
    widget.options.collapsed = true;
    widget.options.serialize = true;
    widget.type = "converted-widget";
    widget.hidden = true;
    widget.serialize = true;
    widget.computeSize = () => [0, -4];
    widget.draw = () => {};
}

function hideTip() {
    if (tipTimer) {
        clearTimeout(tipTimer);
        tipTimer = null;
    }
    cancelRowTip();
    if (tipEl) {
        tipEl.remove();
        tipEl = null;
    }
}

function cancelRowTip() {
    if (rowTipState?.timer) clearTimeout(rowTipState.timer);
    rowTipState = null;
}

async function resolvePreviewUrl(row, items) {
    try {
        const response = await api.fetchApi(`/api/lm/loras/preview-url?name=${encodeURIComponent(row.name)}`);
        if (response.ok) {
            const data = await response.json();
            const url = data?.preview_url || "";
            if (data?.success && url && !url.includes("no-preview")) return url;
        }
    } catch (error) { /* Lora Manager 未安装时忽略 */ }
    const fallback = previewUrl(items.find((it) => it.name === row.name) || null);
    return previewFailures.has(fallback) ? "" : fallback;
}

const PREVIEW_VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)([?#]|$)/i;

function buildPreviewEmpty(className) {
    const empty = document.createElement("div");
    empty.className = className;
    empty.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.9-3.9a2 2 0 0 0-2.8 0L6 19"/></svg><span>' + $t("noPreview") + "</span>";
    return empty;
}

function buildPreviewMedia(url, className, onError) {
    const isVideo = PREVIEW_VIDEO_EXT.test(url);
    const media = document.createElement(isVideo ? "video" : "img");
    media.className = className;
    if (isVideo) {
        media.muted = true;
        media.loop = true;
        media.autoplay = true;
        media.playsInline = true;
        media.setAttribute("muted", "");
        media.setAttribute("playsinline", "");
    }
    if (typeof onError === "function") media.addEventListener("error", () => onError(media));
    media.src = url;
    return media;
}

function showRowTip() {
    const state = rowTipState;
    if (!state) return;
    fetchModels().then(async (items) => {
        if (rowTipState !== state) return;
        const { row, anchor } = state;
        const url = await resolvePreviewUrl(row, items);
        const triggers = String(row.trigger_words || "").trim();
        hideTip();
        const el = document.createElement("div");
        el.className = "zll-tip zll-row-tip";
        const nameEl = document.createElement("div");
        nameEl.className = "zll-row-tip__name";
        nameEl.textContent = loraLabel(row.name) || row.name;
        el.appendChild(nameEl);
        el.appendChild(url
            ? buildPreviewMedia(url, "zll-row-tip__img", (media) => media.replaceWith(buildPreviewEmpty("zll-row-tip__empty")))
            : buildPreviewEmpty("zll-row-tip__empty"));
        const text = document.createElement("div");
        text.className = "zll-row-tip__text";
        text.textContent = triggers ? `${$t("triggerTipLabel")}${triggers}` : `${$t("triggerTipLabel")}${$t("noTriggers")}`;
        el.appendChild(text);
        document.body.appendChild(el);
        const rect = anchor.getBoundingClientRect();
        const tipRect = el.getBoundingClientRect();
        let left = Math.max(6, Math.min(rect.left + rect.width / 2 - tipRect.width / 2, window.innerWidth - tipRect.width - 6));
        let top = rect.top - tipRect.height - 8;
        if (top < 6) top = rect.bottom + 8;
        top = Math.max(6, Math.min(top, window.innerHeight - tipRect.height - 6));
        el.style.left = `${Math.round(left)}px`;
        el.style.top = `${Math.round(top)}px`;
        requestAnimationFrame(() => el.classList.add("zll-tip--visible"));
        tipEl = el;
    }).catch((error) => console.warn("[zhiai_nodes] row tip failed:", error));
}

function queueRowTip(node, row, anchor) {
    cancelRowTip();
    rowTipState = { row, anchor, timer: setTimeout(showRowTip, TIP_DELAY) };
}

function showTip(anchor, text, extraClass) {
    hideTip();
    if (!anchor || !text) return;
    const el = document.createElement("div");
    el.className = extraClass ? `zll-tip ${extraClass}` : "zll-tip";
    if (Array.isArray(text)) {
        const rows = document.createElement("div");
        rows.className = "zll-tip__rows";
        text.forEach((line) => {
            const item = document.createElement("div");
            item.className = "zll-tip__name";
            item.textContent = line;
            rows.appendChild(item);
        });
        el.appendChild(rows);
    } else {
        el.textContent = text;
    }
    document.body.appendChild(el);
    const rect = anchor.getBoundingClientRect();
    const tipRect = el.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    let top = rect.top - tipRect.height - 8;
    if (left < 6) left = 6;
    if (left + tipRect.width > window.innerWidth - 6) left = window.innerWidth - tipRect.width - 6;
    if (top < 6) top = rect.bottom + 8;
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
    requestAnimationFrame(() => el.classList.add("zll-tip--visible"));
    tipEl = el;
}

function installTipDelegation() {
    document.addEventListener("mouseover", (event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-zll-tip]") : null;
        if (!target) return;
        if (tipTimer) clearTimeout(tipTimer);
        tipTimer = setTimeout(() => {
            tipTimer = null;
            showTip(target, $t(target.dataset.zllTip));
        }, TIP_DELAY);
    });
    document.addEventListener("mouseout", (event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-zll-tip]") : null;
        if (target) hideTip();
    });
    document.addEventListener("pointerdown", hideTip, true);
    document.addEventListener("scroll", hideTip, true);
}

function makeIconButton(className, tip, icon, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `zll-icon ${className}`;
    button.innerHTML = icon;
    button.dataset.zllTip = tip;
    if (label) button.setAttribute("aria-label", label);
    button.addEventListener("pointerdown", stopPointer);
    button.addEventListener("keydown", stopKeys);
    return button;
}

function resizeNode(node) {
    if (!node || node._zllResizing) return;
    requestAnimationFrame(() => {
        if (!node.graph || node._zllResizing) return;
        const width = Math.max(MIN_WIDTH, Math.round(node.size?.[0] || MIN_WIDTH));
        if (Math.round(node.size?.[0] || 0) !== width) {
            node._zllResizing = true;
            try {
                node.setSize([width, node.size?.[1]]);
            } finally {
                node._zllResizing = false;
            }
        }
        node.graph.setDirtyCanvas?.(true, true);
    });
}

function syncHeader(node) {
    const els = node._zllEls;
    if (!els) return;
    const rows = node._zllRows || [];
    const enabled = rows.filter((row) => row.enabled !== false).length;
    const total = rows.length;
    els.headCheck.disabled = total === 0;
    els.headCheck.checked = total > 0 && enabled === total;
    els.headCheck.indeterminate = total > 0 && enabled > 0 && enabled < total;
}

function renderCount(node) {
    const els = node._zllEls;
    if (!els?.state) return;
    const rows = node._zllRows || [];
    const total = rows.length;
    const enabled = rows.filter((row) => row.enabled !== false).length;
    let state = "none";
    let word = $t("stateNone");
    if (!total) {
        state = "empty";
        word = $t("stateEmpty");
    } else if (enabled === total) {
        state = "all";
        word = $t("stateAll");
    } else if (enabled > 0) {
        state = "partial";
        word = $t("statePartial").replace("{count}", String(total - enabled));
    }
    els.state.dataset.state = state;
    els.stateNum.textContent = `${enabled}/${total}`;
    els.stateWord.textContent = word;
}

function refreshTexts(node) {
    const els = node._zllEls;
    if (!els) return;
    els.toggleText.textContent = $t("toggleAll");
    els.addLabel.textContent = $t("addLora");
    els.presetLabel.textContent = $t("preset");
    renderCount(node);
}

function updateTriggerMarker(row) {
    if (!row._marker) return;
    row._marker.dataset.on = String(row.trigger_words || "").trim() ? "true" : "false";
}

function updateStrengthInput(row) {
    if (!row._strengthInput) return;
    if (document.activeElement === row._strengthInput) return;
    row._strengthInput.value = strengthText(row.strength);
}

function collapseExpandedExcept(node, keepRow) {
    let changed = false;
    (node._zllRows || []).forEach((other) => {
        if (other === keepRow || other.expanded !== true) return;
        other.expanded = false;
        if (other._item) other._item.dataset.expanded = "false";
        if (other._sub) other._sub.hidden = true;
        changed = true;
    });
    return changed;
}

function toggleExpanded(node, row) {
    row.expanded = !row.expanded;
    if (row.expanded) {
        collapseExpandedExcept(node, row);
    }
    if (row._item) row._item.dataset.expanded = row.expanded ? "true" : "false";
    if (row._sub) row._sub.hidden = !row.expanded;
    writeUiState(node);
    resizeNode(node);
}

function toggleRow(node, row) {
    row.enabled = !row.enabled;
    if (row._item) row._item.dataset.enabled = row.enabled ? "true" : "false";
    writeExecutionRows(node);
    syncHeader(node);
    renderCount(node);
    resizeNode(node);
}

function toggleAll(node) {
    const rows = node._zllRows || [];
    if (!rows.length) return;
    const allEnabled = rows.every((row) => row.enabled !== false);
    rows.forEach((row) => {
        row.enabled = !allEnabled;
    });
    writeExecutionRows(node);
    renderRows(node);
}

function setStrength(node, row, value) {
    const next = clampStrength(node, finiteStrength(value, row.strength));
    row.strength = next;
    updateStrengthInput(row);
    writeExecutionRows(node);
    resizeNode(node);
}

function stepStrength(node, row, direction) {
    setStrength(node, row, round2(finiteStrength(row.strength, 0) + direction * STRENGTH_STEP));
}

function commitTypedStrength(node, row, input) {
    const next = Number(input.value);
    if (!Number.isFinite(next)) {
        input.value = strengthText(row.strength);
        return;
    }
    row.strength = round2(clampStrength(node, next));
    input.value = strengthText(row.strength);
    writeExecutionRows(node);
    resizeNode(node);
}

function selectedRow(node) {
    const rows = node._zllRows || [];
    return rows.find((row) => String(row.uid) === String(node._zllSelectedUid)) || null;
}

function attachDrag(node, row, handle) {
    handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const item = row._item;
        const list = node._zllEls?.list;
        if (!item || !list) return;
        const startY = event.clientY;
        let active = false;
        let dropIndex = -1;
        let lastY = startY;
        let scrollTimer = null;
        const items = () => Array.from(list.querySelectorAll(".zll-item"));
        const clearMarks = () => {
            items().forEach((el) => {
                el.classList.remove("zll-item--drop-before", "zll-item--drop-after");
            });
        };
        const updateDrop = (clientY) => {
            const all = items();
            clearMarks();
            dropIndex = all.length;
            for (let index = 0; index < all.length; index += 1) {
                const box = all[index].getBoundingClientRect();
                if (clientY < box.top + box.height / 2) {
                    dropIndex = index;
                    break;
                }
            }
            if (dropIndex < all.length) all[dropIndex].classList.add("zll-item--drop-before");
            else if (all.length) all[all.length - 1].classList.add("zll-item--drop-after");
        };
        const scrollStep = () => {
            if (!active) return;
            const rect = list.getBoundingClientRect();
            const before = list.scrollTop;
            if (lastY < rect.top + 24) list.scrollTop -= 10;
            else if (lastY > rect.bottom - 24) list.scrollTop += 10;
            if (list.scrollTop !== before) updateDrop(lastY);
        };
        const onMove = (move) => {
            lastY = move.clientY;
            if (!active && Math.abs(lastY - startY) < DRAG_THRESHOLD) return;
            if (!active) {
                active = true;
                node._zllDragging = true;
                item.classList.add("zll-item--dragging");
                scrollTimer = window.setInterval(scrollStep, 40);
            }
            scrollStep();
            updateDrop(lastY);
        };
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            if (scrollTimer) {
                clearInterval(scrollTimer);
                scrollTimer = null;
            }
            clearMarks();
            item.classList.remove("zll-item--dragging");
            node._zllDragging = false;
            if (!active || !Array.isArray(node._zllRows)) return;
            const from = node._zllRows.indexOf(row);
            if (from < 0) return;
            let to = dropIndex > from ? dropIndex - 1 : dropIndex;
            if (to < 0) to = 0;
            if (to > node._zllRows.length - 1) to = node._zllRows.length - 1;
            if (to === from) return;
            node._zllRows.splice(from, 1);
            node._zllRows.splice(to, 0, row);
            writeUiState(node);
            writeExecutionRows(node);
            renderRows(node);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    });
}

function copyTriggerWords(row, button) {
    const text = String(row.trigger_words || "");
    if (!text) return;
    try {
        navigator.clipboard?.writeText(text).then(() => {
            button.classList.add("zll-copy--ok");
            window.setTimeout(() => button.classList.remove("zll-copy--ok"), 900);
        }).catch((error) => {
            console.error("[zhiai_nodes] Failed to copy trigger words:", error);
        });
    } catch (error) {
        console.error("[zhiai_nodes] Failed to copy trigger words:", error);
    }
}

function renderSub(node, row) {
    const sub = document.createElement("div");
    sub.className = "zll-sub";
    sub.hidden = !row.expanded;
    sub.addEventListener("focusin", () => {
        if (row._item) row._item.dataset.focus = "true";
    });
    sub.addEventListener("focusout", (event) => {
        if (row._item && !sub.contains(event.relatedTarget)) row._item.dataset.focus = "false";
    });
    row._sub = sub;

    const bar = document.createElement("div");
    bar.className = "zll-sub__bar";

    const label = document.createElement("span");
    label.className = "zll-sub__label";
    label.textContent = $t("triggerWords");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "zll-trigger";
    input.value = row.trigger_words || "";
    input.placeholder = $t("triggerPlaceholder");
    input.addEventListener("input", () => {
        row.trigger_words = input.value;
        updateTriggerMarker(row);
        writeUiState(node);
        writeExecutionRows(node, false);
    });
    input.addEventListener("keydown", stopKeys);
    input.addEventListener("pointerdown", stopPointer);

    const copy = makeIconButton("zll-copy", "copy", COPY_ICON, $t("copy"));
    copy.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        copyTriggerWords(row, copy);
    });

    const replace = document.createElement("button");
    replace.type = "button";
    replace.className = "zll-replace";
    replace.innerHTML = `${SWAP_ICON}<span>${$t("replace")}</span>`;
    replace.addEventListener("pointerdown", stopPointer);
    replace.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openPicker(node, row, replace);
    });

    bar.appendChild(label);
    bar.appendChild(input);
    bar.appendChild(copy);

    sub.appendChild(bar);
    sub.appendChild(replace);
    return sub;
}

function toggleRowSelection(node, row) {
    node._zllSelectedUid = String(node._zllSelectedUid) === String(row.uid) ? null : row.uid;
    const list = node._zllEls?.list;
    if (!list) return;
    list.querySelectorAll(".zll-item").forEach((el) => {
        el.dataset.selected = node._zllSelectedUid != null && el.dataset.uid === String(node._zllSelectedUid) ? "true" : "false";
    });
}

function renderRow(node, row) {
    const item = document.createElement("div");
    item.className = "zll-item";
    item.dataset.uid = String(row.uid ?? "");
    item.dataset.enabled = row.enabled === false ? "false" : "true";
    item.dataset.expanded = row.expanded ? "true" : "false";
    item.dataset.selected = node._zllSelectedUid != null && String(node._zllSelectedUid) === String(row.uid) ? "true" : "false";
    row._item = item;

    const main = document.createElement("div");
    main.className = "zll-row";
    main.addEventListener("click", (event) => {
        if (event.target.closest("button, input, textarea, select, .zll-handle, .zll-strength")) return;
        toggleRowSelection(node, row);
    });
    main.addEventListener("pointerenter", () => queueRowTip(node, row, main));
    main.addEventListener("pointerleave", () => hideTip());

    const handle = document.createElement("span");
    handle.className = "zll-handle";
    handle.innerHTML = HANDLE_ICON;
    handle.dataset.zllTip = "drag";
    handle.setAttribute("aria-label", $t("drag"));
    attachDrag(node, row, handle);

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "zll-check zll-check--row";
    check.checked = row.enabled !== false;
    check.setAttribute("aria-label", $t("enable"));
    check.addEventListener("change", () => toggleRow(node, row));
    check.addEventListener("pointerdown", stopPointer);
    check.addEventListener("keydown", stopKeys);

    const more = makeIconButton("zll-more", "more", MORE_ICON, $t("more"));

    more.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleExpanded(node, row);
    });
    row._more = more;

    const marker = document.createElement("span");
    marker.className = "zll-marker";
    marker.dataset.on = String(row.trigger_words || "").trim() ? "true" : "false";
    row._marker = marker;

    const name = document.createElement("span");
    name.className = "zll-name";
    name.textContent = loraLabel(row.name);
    name.addEventListener("pointerdown", stopPointer);

    const strength = document.createElement("div");
    strength.className = "zll-strength";
    strength.addEventListener("focusin", () => {
        if (item.dataset.focus !== "true") {
            if (collapseExpandedExcept(node, row)) {
                writeUiState(node);
                resizeNode(node);
            }
        }
        item.dataset.focus = "true";
    });
    strength.addEventListener("focusout", (event) => {
        if (!strength.contains(event.relatedTarget)) item.dataset.focus = "false";
    });

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "zll-step";
    previous.innerHTML = STEP_DOWN_ICON;
    previous.setAttribute("aria-label", "-");
    previous.addEventListener("pointerdown", stopPointer);
    previous.addEventListener("keydown", stopKeys);
    previous.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        stepStrength(node, row, -1);
    });

    const input = document.createElement("input");
    input.type = "number";
    input.step = String(STRENGTH_STEP);
    const bounds = strengthBounds(node);
    input.min = strengthText(bounds.min);
    input.max = strengthText(bounds.max);
    input.value = strengthText(row.strength);
    input.addEventListener("input", () => {
        const next = Number(input.value);
        if (!Number.isFinite(next)) return;
        row.strength = round2(clampStrength(node, next));
    });
    input.addEventListener("change", () => commitTypedStrength(node, row, input));
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") input.blur();
        stopKeys(event);
    });
    input.addEventListener("pointerdown", stopPointer);
    input.addEventListener("click", stopPointer);
    row._strengthInput = input;

    const next = document.createElement("button");
    next.type = "button";
    next.className = "zll-step";
    next.innerHTML = STEP_UP_ICON;
    next.setAttribute("aria-label", "+");
    next.addEventListener("pointerdown", stopPointer);
    next.addEventListener("keydown", stopKeys);
    next.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        stepStrength(node, row, 1);
    });

    strength.appendChild(previous);
    strength.appendChild(input);
    strength.appendChild(next);

    const remove = makeIconButton("zll-delete", "remove", DELETE_ICON, $t("remove"));
    remove.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const index = node._zllRows.indexOf(row);
        if (index < 0) return;
        node._zllRows.splice(index, 1);
        writeUiState(node);
        writeExecutionRows(node);
        renderRows(node);
    });

    main.appendChild(handle);
    main.appendChild(check);
    main.appendChild(more);
    main.appendChild(marker);
    main.appendChild(name);
    main.appendChild(strength);
    main.appendChild(remove);

    item.appendChild(main);
    item.appendChild(renderSub(node, row));
    return item;
}

function renderRows(node) {
    const els = node._zllEls;
    if (!els) return;
    const list = els.list;
    const scrollTop = list.scrollTop;
    list.textContent = "";
    const rows = node._zllRows || [];
    if (!rows.length) {
        const empty = document.createElement("div");
        empty.className = "zll-empty";
        const title = document.createElement("div");
        title.className = "zll-empty__title";
        title.textContent = $t("emptyTitle");
        const hint = document.createElement("div");
        hint.className = "zll-empty__hint";
        hint.textContent = $t("emptyHint");
        empty.appendChild(title);
        empty.appendChild(hint);
        list.appendChild(empty);
    } else {
        rows.forEach((row) => list.appendChild(renderRow(node, row)));
    }
    list.scrollTop = scrollTop;
    syncHeader(node);
    renderCount(node);
    if (node._zllScrollUid != null) {
        const target = rows.find((row) => row.uid === node._zllScrollUid);
        node._zllScrollUid = null;
        if (target?._item) requestAnimationFrame(() => target._item.scrollIntoView({ block: "nearest" }));
    }
    resizeNode(node);
    requestAnimationFrame(() => syncScrollbar(node));
}

function addRow(node) {
    // 新规则：只有真正选中 LoRA 后才创建条目，取消选择不产生空行
    openPicker(node, null, node._zllEls?.addBtn);
}

function buildRoot(node) {
    const root = document.createElement("div");
    root.className = "zll-root";

    const head = document.createElement("div");
    head.className = "zll-head";

    const toggle = document.createElement("div");
    toggle.className = "zll-toggle";
    const headCheck = document.createElement("input");
    headCheck.type = "checkbox";
    headCheck.className = "zll-check";
    headCheck.addEventListener("change", () => toggleAll(node));
    headCheck.addEventListener("pointerdown", stopPointer);
    headCheck.addEventListener("keydown", stopKeys);
    const toggleText = document.createElement("span");
    toggleText.textContent = $t("toggleAll");
    toggle.appendChild(headCheck);
    toggle.appendChild(toggleText);

    const state = document.createElement("div");
    state.className = "zll-state";
    state.dataset.state = "empty";
    const stateDot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    stateDot.setAttribute("class", "zll-state__dot");
    stateDot.setAttribute("viewBox", "0 0 10 10");
    stateDot.setAttribute("aria-hidden", "true");
    stateDot.innerHTML = '<circle cx="5" cy="5" r="5" fill="currentColor" opacity="0.18"/><circle cx="5" cy="5" r="2.7" fill="currentColor"/>';
    const stateNum = document.createElement("span");
    stateNum.className = "zll-state__num";
    stateNum.textContent = "0/0";
    const stateWord = document.createElement("span");
    stateWord.className = "zll-state__word";
    stateWord.textContent = $t("stateEmpty");
    state.appendChild(stateDot);
    state.appendChild(stateNum);
    state.appendChild(stateWord);

    const presetBtn = document.createElement("button");
    presetBtn.type = "button";
    presetBtn.className = "zll-presetbtn";
    presetBtn.innerHTML = PRESET_ICON;
    const presetLabel = document.createElement("span");
    presetLabel.className = "zll-presetbtn__label";
    presetLabel.textContent = $t("preset");
    presetBtn.appendChild(presetLabel);
    const presetChev = document.createElement("span");
    presetChev.className = "zll-presetbtn__chev";
    presetChev.textContent = "›";
    presetBtn.appendChild(presetChev);
    presetBtn.addEventListener("pointerdown", stopPointer);
    presetBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openPresetPanel(node, presetBtn);
    });

    head.appendChild(toggle);
    head.appendChild(state);
    head.appendChild(presetBtn);

    const listWrap = document.createElement("div");
    listWrap.className = "zll-listwrap";
    const list = document.createElement("div");
    list.className = "zll-list";
    const scroll = document.createElement("div");
    scroll.className = "zll-scroll";
    const scrollThumb = document.createElement("div");
    scrollThumb.className = "zll-scroll__thumb";
    scroll.appendChild(scrollThumb);
    listWrap.appendChild(list);
    listWrap.appendChild(scroll);
    list.addEventListener("scroll", () => syncScrollbar(node), { passive: true });
    attachScrollbarDrag(node, scrollThumb);
    attachScrollbarSync(node, list, listWrap);

    const foot = document.createElement("div");
    foot.className = "zll-foot";
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "zll-add";
    const addPlus = document.createElement("span");
    addPlus.className = "zll-add__plus";
    // 用 SVG 绘制加号，保证在圆形按钮内绝对居中（文本"+"受字体基线影响会偏移）
    addPlus.innerHTML =
        '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" ' +
        'stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
        '<path d="M7 3.5v7M3.5 7h7"/></svg>';
    const addLabel = document.createElement("span");
    addLabel.className = "zll-add__label";
    addLabel.textContent = $t("addLora");
    addBtn.appendChild(addPlus);
    addBtn.appendChild(addLabel);
    addBtn.addEventListener("pointerdown", stopPointer);
    addBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        addRow(node);
    });
    foot.appendChild(addBtn);

    const panel = document.createElement("div");
    panel.className = "zll-panel";
    panel.appendChild(head);
    panel.appendChild(listWrap);

    root.appendChild(foot);
    root.appendChild(panel);

    // ==== 标准特效接入（见 docs/node-panel-effects-spec.md）====
    watchNodeModeVisual(node, root);   // A: bypass/mute 时面板半透明
    attachMiddleDragPan(root);         // B: 中键拖拽平移画布
    // ==========================================

    node._zllEls = {
        root,
        headCheck,
        toggleText,
        state,
        stateNum,
        stateWord,
        list,
        listWrap,
        scroll,
        scrollThumb,
        addBtn,
        addLabel,
        presetBtn,
        presetLabel,
    };
    return root;
}

function attachScrollbarSync(node, list, listWrap) {
    if (typeof ResizeObserver === "function") {
        const ro = new ResizeObserver(() => syncScrollbar(node));
        ro.observe(list);
        ro.observe(listWrap);
    }
    if (typeof MutationObserver === "function") {
        const mo = new MutationObserver(() => syncScrollbar(node));
        mo.observe(list, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "hidden", "data-expanded"],
        });
    }
}

function syncScrollbar(node) {
    const els = node?._zllEls;
    if (!els?.scroll) return;
    const { list, scroll, scrollThumb } = els;
    const trackHeight = scroll.clientHeight;
    const maxScroll = list.scrollHeight - list.clientHeight;
    if (trackHeight <= 0 || maxScroll <= 1) {
        scroll.dataset.visible = "false";
        return;
    }
    scroll.dataset.visible = "true";
    const thumbHeight = Math.max(24, Math.round(trackHeight * (list.clientHeight / list.scrollHeight)));
    const travel = Math.max(0, trackHeight - thumbHeight);
    const offset = Math.round(travel * (list.scrollTop / maxScroll));
    scrollThumb.style.height = `${thumbHeight}px`;
    scrollThumb.style.transform = `translateY(${offset}px)`;
}

function attachScrollbarDrag(node, thumb) {
    thumb.addEventListener("pointerdown", (event) => {
        const els = node._zllEls;
        if (!els) return;
        event.preventDefault();
        event.stopPropagation();
        thumb.setPointerCapture(event.pointerId);
        const startY = event.clientY;
        const startTop = els.list.scrollTop;
        const trackHeight = els.scroll.clientHeight;
        const travel = Math.max(1, trackHeight - thumb.offsetHeight);
        const ratio = (els.list.scrollHeight - els.list.clientHeight) / travel;
        const onMove = (moveEvent) => {
            els.list.scrollTop = startTop + (moveEvent.clientY - startY) * ratio;
        };
        const onUp = () => {
            thumb.removeEventListener("pointermove", onMove);
            thumb.removeEventListener("pointerup", onUp);
            thumb.removeEventListener("pointercancel", onUp);
        };
        thumb.addEventListener("pointermove", onMove);
        thumb.addEventListener("pointerup", onUp);
        thumb.addEventListener("pointercancel", onUp);
    });
}

function hookDraw(node) {
    if (node._zllDrawHooked) return;
    node._zllDrawHooked = true;
    const previous = node.onDrawForeground;
    node.onDrawForeground = function (ctx) {
        const result = previous ? previous.apply(this, arguments) : undefined;
        const state = node._zllDraw;
        if (state) {
            const now = Date.now();
            if (now - state.last >= REFRESH_MS) {
                state.last = now;
                const root = node._zllRoot;
                const active = document.activeElement;
                const editing = !!root && !!active && root.contains(active)
                    && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
                if (root && !editing && !node._zllDragging) {
                    if (signature(node) !== node._zllSignature) {
                        closePickerFor(node);
                        loadRows(node);
                        renderRows(node);
                    }
                    const locale = getLocale();
                    if (locale !== state.locale) {
                        state.locale = locale;
                        refreshTexts(node);
                        renderRows(node);
                        applyNode(node);
                    }
                }
            }
        }
        if (ctx && !node.flags?.collapsed) {
            if (node._zllSettingsOpen && !document.querySelector(".zll-settings-dialog")) {
                node._zllSettingsOpen = false;
            }
            ctx.save();
            ctx.translate(settingsIconLeft(node), titleIconTop());
            ctx.scale(TITLE_ICON_SIZE / 32, TITLE_ICON_SIZE / 32);
            drawNodeSettingsButton(ctx, !!(node._zllSettingsOpen || node._zllSettingsHovered));
            ctx.restore();
        }
        return result;
    };
}

function installUi(node) {
    if (node._zllRoot || typeof node.addDOMWidget !== "function") return;
    const rowsWidget = findWidget(node, ROWS_WIDGET);
    if (!rowsWidget) return;
    hideRowsWidget(rowsWidget);
    loadRows(node);
    const root = buildRoot(node);
    node._zllRoot = root;
    const widget = node.addDOMWidget(PANEL_WIDGET, "div", root, {
        serialize: false,
        hideOnZoom: false,
    });
    widget.serialize = false;
    root.style.setProperty("--comfy-widget-min-height", `${MIN_PANEL_HEIGHT}px`);
    widget.beforeQueued = () => writeExecutionRows(node, false);
    node._zllWidget = widget;
    rowsWidget.serializeValue = () => JSON.stringify(executionRows(node));
    node._zllDraw = { last: 0, locale: getLocale() };
    hookDraw(node);
    renderRows(node);
    requestAnimationFrame(() => resizeNode(node));
}

function serializeText(value) {
    return String(value ?? "");
}

function loraLabel(raw) {
    const full = String(raw ?? "");
    if (!full) return "";
    const slash = Math.max(full.lastIndexOf("/"), full.lastIndexOf("\\"));
    const base = slash >= 0 ? full.slice(slash + 1) : full;
    return base.replace(/\.(safetensors|sft|ckpt|pt|pth|bin|onnx)$/i, "");
}

function normalizeModel(raw) {
    if (typeof raw === "string") return { name: raw, pathIndex: null, modified: null };
    if (!raw || typeof raw !== "object") return { name: "", pathIndex: null, modified: null };
    const name = typeof raw.name === "string" ? raw.name : "";
    const index = raw.pathIndex == null || raw.pathIndex === "" ? NaN : Number(raw.pathIndex);
    return {
        name,
        pathIndex: Number.isFinite(index) ? index : null,
        modified: raw.modified ?? null,
    };
}

async function fetchModels() {
    if (modelsCache.items && Date.now() - modelsCache.time < MODEL_CACHE_MS) {
        return modelsCache.items;
    }
    let items = null;
    try {
        const response = await api.fetchApi("/experiment/models/loras");
        if (response.ok) {
            const data = await response.json();
            const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
            items = list.map(normalizeModel).filter((item) => item.name);
        }
    } catch (error) {
        console.warn("[zhiai_nodes] LoRA list request failed:", error);
    }
    if (!items) {
        try {
            const response = await api.fetchApi("/models/loras");
            if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data) ? data : [];
                items = list.map((name) => ({ name: serializeText(name), pathIndex: null, modified: null }));
            }
        } catch (error) {
            console.warn("[zhiai_nodes] LoRA fallback list request failed:", error);
        }
    }
    modelsCache = { time: Date.now(), items: items || [] };
    return modelsCache.items;
}

function previewUrl(item) {
    if (!item || item.pathIndex == null || !item.name) return "";
    const encoded = String(item.name).split(/[\\/]/).map((part) => encodeURIComponent(part)).join("/");
    const version = item.modified == null ? "" : `?v=${encodeURIComponent(item.modified)}`;
    return api.apiURL(`/experiment/models/preview/loras/${encodeURIComponent(item.pathIndex)}/${encoded}${version}`);
}

function updatePickerPreview() {
    if (!pickerState?.els) return;
    const els = pickerState.els;
    // 设置中关闭预览后不创建预览元素，直接跳过
    if (!els.frame || !els.nameLabel) return;
    const item = pickerState.selected;
    let baseName = "";
    if (item) {
        const slash = Math.max(item.name.lastIndexOf("/"), item.name.lastIndexOf("\\"));
        baseName = item.name.slice(slash + 1).replace(/\.[^./\\]+$/, "");
    }
    els.nameLabel.textContent = baseName;
    const previous = els.frame.querySelector(".zll-picker__image");
    if (previous) previous.remove();
    const url = previewUrl(item);
    if (!url || previewFailures.has(url)) {
        els.empty.hidden = false;
        return;
    }
    els.empty.hidden = true;
    els.frame.appendChild(buildPreviewMedia(url, "zll-picker__image", (media) => {
        previewFailures.add(url);
        media.remove();
        els.empty.hidden = false;
    }));
}

function selectPickerItem(item, scroll) {
    if (!pickerState) return;
    pickerState.selected = item;
    pickerState.els.list.querySelectorAll(".zll-pick__row").forEach((rowEl) => {
        rowEl.dataset.selected = rowEl.dataset.name === item?.name ? "true" : "false";
    });
    updatePickerPreview();
    if (scroll && item) {
        pickerState.els.list.querySelector(`.zll-pick__row[data-name="${CSS.escape(item.name)}"]`)?.scrollIntoView({ block: "nearest" });
    }
}

function pickerFolderOf(name) {
    const text = String(name ?? "");
    const slash = Math.max(text.lastIndexOf("/"), text.lastIndexOf("\\"));
    return slash >= 0 ? text.slice(0, slash) : "";
}

function renderPickerFilters() {
    if (!pickerState?.els?.filters) return;
    const els = pickerState.els;
    const folders = new Set();
    for (const item of pickerState.items) folders.add(pickerFolderOf(item.name));
    const sorted = [...folders].sort((a, b) => a.localeCompare(b));
    els.filters.textContent = "";
    const makeChip = (value, label) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "zll-picker__chip";
        chip.textContent = label;
        chip.dataset.active = pickerState.folder === value ? "true" : "false";
        chip.addEventListener("pointerdown", stopPointer);
        chip.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!pickerState) return;
            pickerState.folder = value;
            pickerState.selected = null;
            renderPickerFilters();
            renderPickerItems();
        });
        els.filters.appendChild(chip);
    };
    makeChip("all", $t("pickerAllFolders"));
    for (const folder of sorted) {
        makeChip(folder, folder || $t("pickerRootFolder"));
    }
}

function renderPickerItems() {
    if (!pickerState?.els) return;
    const els = pickerState.els;
    const query = els.search.value.trim().toLowerCase();
    const folder = pickerState.folder || "all";
    const items = pickerState.items.filter((item) => {
        if (query && !item.name.toLowerCase().includes(query)) return false;
        if (folder !== "all" && pickerFolderOf(item.name) !== folder) return false;
        return true;
    });
    pickerState.visibleItems = items;
    els.list.textContent = "";
    if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "zll-pick__empty";
        empty.textContent = query ? $t("pickerEmpty") : (pickerState.failed ? $t("loadFailed") : $t("pickerEmpty"));
        els.list.appendChild(empty);
        pickerState.selected = null;
        updatePickerPreview();
        return;
    }
    const multi = pickerState.multi === true;
    items.forEach((item) => {
        const rowEl = document.createElement("div");
        rowEl.className = "zll-pick__row";
        rowEl.dataset.name = item.name;
        rowEl.dataset.selected = pickerState.selected?.name === item.name ? "true" : "false";
        rowEl.addEventListener("pointerdown", (event) => {
            event.stopPropagation();
            selectPickerItem(item, false);
        });
        rowEl.addEventListener("mouseenter", () => selectPickerItem(item, false));
        rowEl.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (multi) {
                selectPickerItem(item, false);
                togglePickerCheck(item);
            } else {
                applyPickerSelection();
            }
        });

        if (multi) {
            const checkEl = document.createElement("span");
            checkEl.className = "zll-pick__check";
            checkEl.dataset.on = pickerState.checked.has(item.name) ? "true" : "false";
            rowEl.dataset.checked = checkEl.dataset.on;
            rowEl.appendChild(checkEl);
        }

        const meta = document.createElement("div");
        meta.className = "zll-pick__meta";
        const slash = Math.max(item.name.lastIndexOf("/"), item.name.lastIndexOf("\\"));
        const folderText = slash >= 0 ? item.name.slice(0, slash + 1) : "";
        const baseText = slash >= 0 ? item.name.slice(slash + 1) : item.name;
        const nameEl = document.createElement("span");
        nameEl.className = "zll-pick__name";
        nameEl.textContent = baseText;
        const folderEl = document.createElement("span");
        folderEl.className = "zll-pick__folder";
        folderEl.textContent = folderText;
        if (folderText) meta.appendChild(folderEl);
        meta.appendChild(nameEl);

        rowEl.appendChild(meta);
        els.list.appendChild(rowEl);
    });
    const visibleSelection = items.find((item) => item.name === pickerState.selected?.name);
    if (!visibleSelection) pickerState.selected = items[0];
    els.list.querySelectorAll(".zll-pick__row").forEach((rowEl) => {
        rowEl.dataset.selected = rowEl.dataset.name === pickerState.selected?.name ? "true" : "false";
    });
    updatePickerPreview();
}

function movePickerSelection(delta) {
    if (!pickerState) return;
    const items = pickerState.visibleItems || [];
    if (!items.length) return;
    let index = items.findIndex((item) => item.name === pickerState.selected?.name);
    if (index < 0) index = 0;
    const next = items[Math.max(0, Math.min(items.length - 1, index + delta))];
    selectPickerItem(next, true);
}

function applyPickerSelection() {
    if (!pickerState) return;
    const { node, row, selected } = pickerState;
    if (!selected) return;
    if (!Array.isArray(node._zllRows)) {
        closePicker();
        return;
    }
    if (row) {
        // 更换模式：写回已有条目
        const index = node._zllRows.indexOf(row);
        if (index < 0) {
            closePicker();
            return;
        }
        if (row.name !== selected.name) {
            const duplicate = node._zllRows.find((item) => item !== row && item.name === selected.name);
            if (duplicate) {
                node._zllRows.splice(node._zllRows.indexOf(duplicate), 1);
            }
            row.name = selected.name;
            row.trigger_words = "";
        }
        node._zllScrollUid = row.uid;
    } else {
        // 新增模式：选中后才创建条目；同一 LoRA 只保留一行，避免重复叠加
        const existing = node._zllRows.find((item) => String(item.name) === String(selected.name));
        if (existing) {
            node._zllScrollUid = existing.uid;
        } else {
            const newRow = makeRow({ name: selected.name, enabled: true, strength: round2(clampStrength(node, 1)), trigger_words: "", expanded: false });
            node._zllRows.push(newRow);
            node._zllScrollUid = newRow.uid;
        }
    }
    writeUiState(node);
    writeExecutionRows(node);
    closePicker();
    renderRows(node);
}

function updatePickerBatchBar() {
    const els = pickerState?.els;
    if (!els?.batchCount || !els.batchBtn) return;
    const count = pickerState.checked?.size || 0;
    els.batchCount.textContent = $t("pickerBatchCount").replace("{count}", String(count));
    els.batchBtn.disabled = count === 0;
}

function togglePickerCheck(item) {
    if (!pickerState?.multi || !item) return;
    const checked = pickerState.checked;
    if (checked.has(item.name)) checked.delete(item.name);
    else checked.add(item.name);
    pickerState.els?.list.querySelectorAll(".zll-pick__row").forEach((rowEl) => {
        const on = checked.has(rowEl.dataset.name) ? "true" : "false";
        rowEl.dataset.checked = on;
        const checkEl = rowEl.querySelector(".zll-pick__check");
        if (checkEl) checkEl.dataset.on = on;
    });
    updatePickerBatchBar();
}

function applyPickerBatch() {
    if (!pickerState) return;
    const state = pickerState;
    const { node, checked } = state;
    if (!checked || !checked.size) return;
    if (!Array.isArray(node._zllRows)) {
        closePicker();
        return;
    }
    const known = new Set(state.items.map((item) => item.name));
    // 按列表显示顺序载入，勾选但已不存在的模型计为失败并跳过
    const names = state.items.filter((item) => checked.has(item.name)).map((item) => item.name);
    let added = 0;
    let skipped = [...checked].filter((name) => !known.has(name)).length;
    let firstUid = null;
    names.forEach((name) => {
        const existing = node._zllRows.find((item) => String(item.name) === String(name));
        if (existing) {
            // 重复加载：保留原条目，不新增
            firstUid = firstUid ?? existing.uid;
            skipped += 1;
            return;
        }
        try {
            const newRow = makeRow({ name, enabled: true, strength: round2(clampStrength(node, 1)), trigger_words: "", expanded: false });
            node._zllRows.push(newRow);
            firstUid = firstUid ?? newRow.uid;
            added += 1;
        } catch (_) {
            skipped += 1;
        }
    });
    if (!added) {
        // 全部已在列表中（或加载失败）时保持面板打开并提示
        if (state.els?.batchCount) state.els.batchCount.textContent = $t("pickerBatchDuplicate");
        return;
    }
    node._zllScrollUid = firstUid;
    writeUiState(node);
    writeExecutionRows(node);
    closePicker();
    renderRows(node);
    resizeNode(node);
    if (skipped) console.info(`LoRA batch add: ${added} added, ${skipped} skipped`);
}

function pickerLayout() {
    const node = pickerState?.node;
    const root = node?._zllRoot;
    const rootRect = root?.getBoundingClientRect ? root.getBoundingClientRect() : null;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const availWidth = Math.max(PICKER_MIN_WIDTH, viewWidth - PICKER_EDGE * 2);
    // 固定尺寸：宽度与列表高度均为常量，不再随节点宽度或视口变化；仅窄视口下收缩到可用宽度
    const width = Math.min(PICKER_TARGET_WIDTH, availWidth);
    let left = rootRect ? Math.round(rootRect.left) : PICKER_EDGE;
    left = Math.min(Math.max(left, PICKER_EDGE), Math.max(PICKER_EDGE, viewWidth - width - PICKER_EDGE));
    const maxBodyHeight = Math.max(PICKER_BODY_MIN_HEIGHT, viewHeight - PICKER_BODY_MARGIN);
    const bodyHeight = Math.round(Math.min(PICKER_BODY_HEIGHT, maxBodyHeight));
    const rawFont = PICKER_BASE_FONT * (width / PICKER_BASE_WIDTH);
    const fontSize = Math.round(Math.min(PICKER_MAX_FONT, Math.max(PICKER_MIN_FONT, rawFont)) * 10) / 10;
    return { width, left, bodyHeight, fontSize };
}

function positionPicker(anchor) {
    if (!pickerState) return;
    const panel = pickerState.panel;
    const layout = pickerLayout();
    panel.style.setProperty("--zll-picker-w", `${layout.width}px`);
    panel.style.setProperty("--zll-picker-body-h", `${layout.bodyHeight}px`);
    panel.style.setProperty("--zll-picker-fs", `${layout.fontSize}px`);
    // 搜索框宽度固定：右缘对齐预览列（.zll-picker__preview）左侧的竖向分割线
    const panelWidth = panel.clientWidth || layout.width;
    const previewWidth = Math.min(240, Math.max(168, panelWidth * 0.26));
    panel.style.setProperty("--zll-picker-search-w", `${Math.max(120, Math.round(panelWidth - previewWidth - 25))}px`);
    const rect = anchor?.getBoundingClientRect?.() || { left: 8, top: 8, bottom: 8, right: 8, width: 0, height: 0 };
    const width = panel.offsetWidth || layout.width;
    const height = panel.offsetHeight || 420;
    let left = layout.left;
    let top = rect.bottom + 6;
    if (left + width > window.innerWidth - PICKER_EDGE) left = window.innerWidth - width - PICKER_EDGE;
    if (left < PICKER_EDGE) left = PICKER_EDGE;
    if (top + height > window.innerHeight - PICKER_EDGE) {
        const above = rect.top - height - 6;
        top = above >= PICKER_EDGE ? above : Math.max(PICKER_EDGE, window.innerHeight - height - PICKER_EDGE);
    }
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
    panel.style.visibility = "visible";
}

function buildPicker(node, row, overlay, panel) {
    const showPreview = pickerPreviewEnabled(node);
    panel.dataset.preview = showPreview ? "on" : "off";
    const head = document.createElement("div");
    head.className = "zll-picker__head";
    const search = document.createElement("input");
    search.type = "text";
    search.className = "zll-picker__search";
    search.placeholder = $t("search");
    search.addEventListener("pointerdown", stopPointer);
    search.addEventListener("input", () => {
        if (!pickerState) return;
        pickerState.selected = null;
        renderPickerItems();
    });
    const close = makeIconButton("zll-picker__close", "close", CLOSE_ICON, $t("close"));
    close.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closePicker();
    });
    head.appendChild(search);
    head.appendChild(close);

    const filters = document.createElement("div");
    filters.className = "zll-picker__filters";

    const body = document.createElement("div");
    body.className = "zll-picker__body";
    const list = document.createElement("div");
    list.className = "zll-pick__list";
    list.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });
    let preview = null;
    let frame = null;
    let empty = null;
    let nameLabel = null;
    if (showPreview) {
        preview = document.createElement("div");
        preview.className = "zll-picker__preview";
        frame = document.createElement("div");
        frame.className = "zll-picker__frame";
        empty = document.createElement("div");
        empty.className = "zll-picker__empty";
        empty.textContent = $t("noPreview");
        frame.appendChild(empty);
        nameLabel = document.createElement("div");
        nameLabel.className = "zll-picker__namelabel";
        preview.appendChild(frame);
        preview.appendChild(nameLabel);
    }
    body.appendChild(list);
    if (preview) body.appendChild(preview);

    const multi = pickerState?.multi === true;
    let batch = null;
    let batchCount = null;
    let batchBtn = null;
    if (multi) {
        batch = document.createElement("div");
        batch.className = "zll-picker__batch";
        batchCount = document.createElement("span");
        batchCount.className = "zll-picker__batch-count";
        batchBtn = document.createElement("button");
        batchBtn.type = "button";
        batchBtn.className = "zll-picker__batch-btn";
        batchBtn.textContent = $t("pickerBatchAdd");
        batchBtn.disabled = true;
        batchBtn.addEventListener("pointerdown", stopPointer);
        batchBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            applyPickerBatch();
        });
        batch.appendChild(batchCount);
        batch.appendChild(batchBtn);
    }

    const hint = document.createElement("div");
    hint.className = "zll-picker__hint";
    hint.textContent = $t(multi ? "pickerBatchHint" : "pickerHint");

    panel.appendChild(head);
    panel.appendChild(filters);
    panel.appendChild(body);
    if (batch) panel.appendChild(batch);
    panel.appendChild(hint);

    pickerState.els = { search, filters, list, frame, empty, nameLabel, batch, batchCount, batchBtn };
    renderPickerFilters();
    updatePickerBatchBar();

    panel.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
            event.preventDefault();
            closePicker();
            return;
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            movePickerSelection(event.key === "ArrowDown" ? 1 : -1);
            return;
        }
        if (multi && event.key === " " && event.target !== search) {
            event.preventDefault();
            togglePickerCheck(pickerState?.selected);
            return;
        }
        if (event.key === "Enter") {
            event.preventDefault();
            if (multi) applyPickerBatch();
            else applyPickerSelection();
        }
    });

    requestAnimationFrame(() => search.focus());
}

function closePicker() {
    if (!pickerState) return;
    const state = pickerState;
    pickerState = null;
    if (state.resizeHandler) window.removeEventListener("resize", state.resizeHandler);
    if (state.escHandler) document.removeEventListener("keydown", state.escHandler, true);
    state.overlay.remove();
}

function closePickerFor(node) {
    if (pickerState && pickerState.node === node) closePicker();
}

function openPicker(node, row, anchor) {
    closePicker();
    if (!Array.isArray(node._zllRows)) return;
    // row 为 null 表示"新增"模式：选中后才创建条目；row 存在表示"更换"模式
    if (row && !node._zllRows.includes(row)) return;
    const overlay = document.createElement("div");
    overlay.className = "zll-picker-overlay";
    const panel = document.createElement("div");
    panel.className = "zll-picker";
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    // 批量模式仅用于新增；更换模型时始终单选
    const multi = !row && node._zllMultiSelect === true;
    if (multi) panel.dataset.multi = "true";
    pickerState = {
        node,
        row,
        anchor,
        overlay,
        panel,
        multi,
        checked: new Set(),
        items: [],
        visibleItems: [],
        folder: "all",
        selected: null,
        els: null,
        failed: false,
        resizeHandler: null,
        escHandler: null,
    };
    buildPicker(node, row, overlay, panel);
    positionPicker(anchor);
    // 仅允许 ESC 键和关闭按钮关闭；点击遮罩空白、滚轮、窗口缩放均不再关闭
    const onEsc = (event) => {
        if (!pickerState || pickerState.overlay !== overlay) return;
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            closePicker();
        }
    };
    pickerState.escHandler = onEsc;
    document.addEventListener("keydown", onEsc, true);
    fetchModels().then((items) => {
        if (!pickerState || pickerState.overlay !== overlay) return;
        pickerState.items = items;
        renderPickerFilters();
        const initial = row ? (items.find((item) => item.name === row.name) || null) : null;
        pickerState.selected = initial;
        renderPickerItems();
        if (initial && pickerState.visibleItems.some((item) => item.name === initial.name)) {
            selectPickerItem(initial, true);
        }
        positionPicker(anchor);
    }).catch(() => {
        if (!pickerState || pickerState.overlay !== overlay) return;
        pickerState.failed = true;
        pickerState.items = [];
        renderPickerItems();
    });
}

let presetState = null;
let presetHoverTimer = null;

async function fetchPresets() {
    const response = await api.fetchApi("/zhiai_nodes/lora_presets");
    if (!response.ok) throw new Error("list failed");
    const data = await response.json();
    return Array.isArray(data?.presets) ? data.presets : [];
}

async function postPreset(path, body) {
    const response = await api.fetchApi(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.status === "error") {
        const error = new Error(data?.message || "request failed");
        error.code = response.status;
        throw error;
    }
    return data;
}

async function removePreset(id) {
    const response = await api.fetchApi(`/zhiai_nodes/lora_presets?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.status === "error") throw new Error(data?.message || "request failed");
    return Array.isArray(data?.presets) ? data.presets : [];
}

function presetSnapshot(node) {
    return (node._zllRows || [])
        .filter((row) => String(row.name || "").trim())
        .map((row) => ({
            name: String(row.name || ""),
            enabled: row.enabled !== false,
            strength: finiteStrength(row.strength, 1),
            trigger_words: String(row.trigger_words || ""),
        }));
}

function applyPresetRows(node, rows, mode) {
    const next = [];
    (rows || [])
        .filter((raw) => String(raw?.name || "").trim())
        .forEach((raw) => {
            const entry = makeRow({
                name: typeof raw?.name === "string" ? raw.name : "",
                enabled: raw?.enabled !== false,
                strength: round2(clampStrength(node, finiteStrength(raw?.strength, 1))),
                trigger_words: typeof raw?.trigger_words === "string" ? raw.trigger_words : "",
                expanded: false,
            });
            const existing = next.find((item) => item.name === entry.name);
            if (existing) next[next.indexOf(existing)] = entry;
            else next.push(entry);
        });
    if (mode === "append") {
        const current = node._zllRows || [];
        node._zllRows = [
            ...current,
            ...next.filter((entry) => !current.some((item) => item.name === entry.name)),
        ];
    } else {
        node._zllRows = next;
    }
    renderRows(node);
    writeUiState(node);
    writeExecutionRows(node);
    resizeNode(node);
}

function presetToast(tone, text) {
    const els = presetState?.els;
    if (!els?.toast) return;
    els.toast.dataset.tone = tone;
    els.toastText.textContent = text;
    els.toast.classList.remove("is-flash");
    if (!text) return;
    void els.toast.offsetWidth;
    els.toast.classList.add("is-flash");
}

function updatePresetStats() {
    const state = presetState;
    if (!state) return;
    const rows = presetSnapshot(state.node).length;
    state.els.statRecipes.textContent = $t("presetFooterRecipes").replace("{count}", String(state.presets.length));
    state.els.statRows.textContent = $t("presetFooterRows").replace("{count}", String(rows));
    state.els.saveBtn.disabled = rows === 0;
}

function renderPresetList() {
    const state = presetState;
    if (!state) return;
    updatePresetStats();
    const list = state.els.list;
    list.textContent = "";
    if (!state.presets.length) {
        const empty = document.createElement("div");
        empty.className = "zll-preset__empty";
        empty.textContent = $t("presetEmpty");
        list.appendChild(empty);
        return;
    }
    state.presets.forEach((preset) => {
        const item = document.createElement("div");
        item.className = "zll-preset__item";

        const meta = document.createElement("div");
        meta.className = "zll-preset__meta";
        const label = document.createElement("span");
        label.className = "zll-preset__label";
        label.textContent = preset.name;
        const count = document.createElement("span");
        count.className = "zll-preset__count";
        count.textContent = $t("presetCount").replace("{count}", String((preset.rows || []).length));
        meta.appendChild(count);
        meta.appendChild(label);

        const ops = document.createElement("div");
        ops.className = "zll-preset__ops";
        const makeOp = (key, icon, tone) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = tone ? `zll-preset__op ${tone}` : "zll-preset__op";
            button.innerHTML = icon;
            button.dataset.zllTip = key;
            button.setAttribute("aria-label", $t(key));
            button.addEventListener("pointerdown", stopPointer);
            return button;
        };
        const loadBtn = makeOp("presetLoad", PRESET_LOAD_ICON);
        const appendBtn = makeOp("presetAppend", PRESET_APPEND_ICON);
        const renameBtn = makeOp("presetRename", PRESET_RENAME_ICON);
        const deleteBtn = makeOp("presetDelete", DELETE_ICON, "zll-preset__op--danger");
        ops.appendChild(loadBtn);
        ops.appendChild(appendBtn);
        ops.appendChild(renameBtn);
        ops.appendChild(deleteBtn);

        item.appendChild(meta);
        item.appendChild(ops);
        list.appendChild(item);

        meta.addEventListener("mouseenter", () => {
            if (presetHoverTimer) clearTimeout(presetHoverTimer);
            presetHoverTimer = setTimeout(() => {
                presetHoverTimer = null;
                const names = (preset.rows || []).map((row) => loraLabel(row.name)).filter(Boolean);
                if (!names.length) return;
                showTip(meta, names, "zll-tip--list");
                if (tipEl) {
                    const tipRect = tipEl.getBoundingClientRect();
                    const metaRect = meta.getBoundingClientRect();
                    const panelRect = (presetState.panel || meta).getBoundingClientRect();
                    const GAP = 12;
                    let left = panelRect.left - tipRect.width - GAP;
                    if (left < 6) left = panelRect.right + GAP;
                    if (left + tipRect.width > window.innerWidth - 6) left = Math.max(6, window.innerWidth - tipRect.width - 6);
                    let top = metaRect.top + metaRect.height / 2 - tipRect.height / 2;
                    top = Math.min(Math.max(top, 6), window.innerHeight - tipRect.height - 6);
                    tipEl.style.left = `${Math.round(left)}px`;
                    tipEl.style.top = `${Math.round(top)}px`;
                }
            }, TIP_DELAY);
        });
        meta.addEventListener("mouseleave", () => {
            if (presetHoverTimer) clearTimeout(presetHoverTimer);
            presetHoverTimer = null;
            hideTip();
        });

        loadBtn.addEventListener("click", () => {
            const current = (state.node._zllRows || []).length;
            if (current > 0 && !window.confirm($t("presetConfirmLoad").replace("{count}", String(current)))) return;
            applyPresetRows(state.node, preset.rows, "replace");
            updatePresetStats();
            presetToast("ok", $t("presetLoaded").replace("{name}", preset.name));
        });
        appendBtn.addEventListener("click", () => {
            applyPresetRows(state.node, preset.rows, "append");
            updatePresetStats();
            presetToast("ok", $t("presetAppended").replace("{name}", preset.name));
        });
        renameBtn.addEventListener("click", () => {
            meta.style.display = "none";
            ops.style.display = "none";
            const input = document.createElement("input");
            input.className = "zll-preset__rename";
            input.value = preset.name;
            const commit = async () => {
                const name = input.value.trim();
                input.remove();
                meta.style.display = "";
                ops.style.display = "";
                if (!name || name === preset.name) return;
                try {
                    const data = await postPreset("/zhiai_nodes/lora_presets/rename", { id: preset.id, name });
                    state.presets = data.presets || [];
                    renderPresetList();
                    presetToast("ok", $t("presetRenamed"));
                } catch (error) {
                    presetToast("error", error?.code === 409 ? $t("presetDuplicate") : $t("presetError"));
                }
            };
            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter") commit();
                if (event.key === "Escape") { input.value = preset.name; commit(); }
                event.stopPropagation();
            });
            input.addEventListener("blur", commit);
            item.appendChild(input);
            input.focus();
            input.select();
        });
        deleteBtn.addEventListener("click", async () => {
            if (!window.confirm($t("presetConfirmDelete").replace("{name}", preset.name))) return;
            try {
                state.presets = await removePreset(preset.id);
                renderPresetList();
                presetToast("ok", $t("presetDeleted").replace("{name}", preset.name));
            } catch (error) {
                presetToast("error", $t("presetError"));
            }
        });
    });
}

function positionPresetPanel(anchor) {
    if (!presetState) return;
    const panel = presetState.panel;
    const rect = anchor?.getBoundingClientRect?.() || { right: 8, top: 8, bottom: 8 };
    const width = panel.offsetWidth || 300;
    const height = panel.offsetHeight || 240;
    let left = rect.right - width;
    let top = rect.bottom + 8;
    if (top + height > window.innerHeight - 8) {
        const above = rect.top - height - 8;
        top = above >= 8 ? above : Math.max(8, window.innerHeight - height - 8);
    }
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    if (left < 8) left = 8;
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
}

function closePresetPanel() {
    if (!presetState) return;
    const state = presetState;
    presetState = null;
    if (presetHoverTimer) clearTimeout(presetHoverTimer);
    presetHoverTimer = null;
    hideTip();
    if (state.keyHandler) window.removeEventListener("keydown", state.keyHandler, true);
    if (state.resizeHandler) window.removeEventListener("resize", state.resizeHandler);
    state.overlay.remove();
}

function openPresetPanel(node, anchor) {
    closePresetPanel();
    closePickerFor(node);
    const overlay = document.createElement("div");
    overlay.className = "zll-preset-overlay";
    const panel = document.createElement("div");
    panel.className = "zll-preset";
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const head = document.createElement("div");
    head.className = "zll-preset__head";
    const title = document.createElement("span");
    title.className = "zll-preset__title";
    title.textContent = $t("presetTitle");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "zll-icon zll-preset__close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", closePresetPanel);
    head.appendChild(title);
    head.appendChild(closeBtn);

    const save = document.createElement("div");
    save.className = "zll-preset__save";
    const nameInput = document.createElement("input");
    nameInput.className = "zll-preset__name";
    nameInput.placeholder = $t("presetNamePlaceholder");
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "zll-preset__savebtn";
    saveBtn.innerHTML = `${PRESET_SAVE_ICON}<span>${$t("presetSave")}</span>`;
    save.appendChild(nameInput);
    save.appendChild(saveBtn);

    const list = document.createElement("div");
    list.className = "zll-preset__list";
    const foot = document.createElement("div");
    foot.className = "zll-preset__foot";
    const stats = document.createElement("div");
    stats.className = "zll-preset__stats";
    const statRecipes = document.createElement("span");
    statRecipes.className = "zll-preset__stat";
    const statRows = document.createElement("span");
    statRows.className = "zll-preset__stat";
    stats.appendChild(statRecipes);
    stats.appendChild(statRows);
    const toast = document.createElement("div");
    toast.className = "zll-preset__toast";
    toast.dataset.tone = "idle";
    const toastText = document.createElement("span");
    toastText.className = "zll-preset__toast-text";
    toast.appendChild(toastText);
    foot.appendChild(stats);
    foot.appendChild(toast);

    panel.appendChild(head);
    panel.appendChild(save);
    panel.appendChild(list);
    panel.appendChild(foot);

    presetState = {
        node,
        overlay,
        panel,
        presets: [],
        els: { list, toast, toastText, nameInput, saveBtn, statRecipes, statRows },
        keyHandler: (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                closePresetPanel();
            }
        },
        resizeHandler: () => positionPresetPanel(anchor),
    };
    window.addEventListener("keydown", presetState.keyHandler, true);
    window.addEventListener("resize", presetState.resizeHandler);
    overlay.addEventListener("pointerdown", (event) => {
        if (event.target === overlay) closePresetPanel();
    });

    updatePresetStats();
    presetToast("idle", $t("presetFooterHint"));
    const saveCurrent = async () => {
        const name = nameInput.value.trim();
        if (!name) {
            presetToast("error", $t("presetNameRequired"));
            return;
        }
        const rows = presetSnapshot(node);
        if (!rows.length) {
            presetToast("error", $t("presetSaveEmpty"));
            return;
        }
        try {
            const data = await postPreset("/zhiai_nodes/lora_presets", { name, rows });
            presetState.presets = data.presets || [];
            nameInput.value = "";
            renderPresetList();
            presetToast("ok", $t("presetSaved").replace("{name}", name));
        } catch (error) {
            presetToast("error", error?.code === 409 ? $t("presetDuplicate") : $t("presetError"));
        }
    };
    saveBtn.addEventListener("click", saveCurrent);
    nameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") saveCurrent();
        event.stopPropagation();
    });

    positionPresetPanel(anchor);
    fetchPresets().then((presets) => {
        if (!presetState || presetState.overlay !== overlay) return;
        presetState.presets = presets;
        renderPresetList();
        positionPresetPanel(anchor);
    }).catch(() => {
        if (!presetState || presetState.overlay !== overlay) return;
        renderPresetList();
        presetToast("error", $t("presetError"));
    });
}

function pickerPreviewEnabled(node) {
    return node._zllShowPreview !== false;
}

function strengthBounds(node) {
    let min = node._zllStrengthMin;
    let max = node._zllStrengthMax;
    if (typeof min !== "number" || !Number.isFinite(min)) min = STRENGTH_MIN_DEFAULT;
    if (typeof max !== "number" || !Number.isFinite(max)) max = STRENGTH_MAX_DEFAULT;
    if (min > max) [min, max] = [max, min];
    return { min, max };
}

function clampStrength(node, value) {
    const { min, max } = strengthBounds(node);
    return Math.max(min, Math.min(max, value));
}

function refreshStrengthBounds(node) {
    const { min, max } = strengthBounds(node);
    let changed = false;
    (node._zllRows || []).forEach((row) => {
        if (row._strengthInput) {
            row._strengthInput.min = strengthText(min);
            row._strengthInput.max = strengthText(max);
        }
        const next = round2(clampStrength(node, finiteStrength(row.strength, 0)));
        if (next !== row.strength) {
            row.strength = next;
            changed = true;
        }
        updateStrengthInput(row);
    });
    writeExecutionRows(node);
    writeUiState(node);
    if (changed) resizeNode(node);
}

function settingsIconLeft(node) {
    // 帮助"?"图标位于节点右侧，本图标紧邻其左侧
    const helpX = node.size[0] - TITLE_ICON_SIZE - TITLE_ICON_MARGIN;
    return helpX - TITLE_ICON_SIZE - TITLE_ICON_GAP;
}

function titleIconTop() {
    return -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - TITLE_ICON_SIZE) / 2;
}

function hitSettingsIcon(node, localPos) {
    if (!localPos || node.flags?.collapsed) return false;
    const left = settingsIconLeft(node);
    const top = titleIconTop();
    return localPos[0] > left && localPos[0] < left + TITLE_ICON_SIZE
        && localPos[1] > top && localPos[1] < top + TITLE_ICON_SIZE;
}

function showSettingsDialog(node) {
    if (document.querySelector(".zll-settings-dialog:not(.closing)")) return;
    node._zllSettingsOpen = true;
    node.setDirtyCanvas?.(true, true);

    const bounds = strengthBounds(node);
    const dialog = document.createElement("div");
    dialog.className = "zll-settings-dialog";
    dialog.innerHTML =
        '<div class="zll-settings__head">' +
            `<h3 class="zll-settings__title">${$t("settings")}</h3>` +
            `<button type="button" class="zll-settings__close" title="${$t("close")}">×</button>` +
        '</div>' +
        '<div class="zll-settings__body">' +
            '<div class="zll-settings__row">' +
                `<span class="zll-settings__label">${$t("settingsPreview")}</span>` +
                `<input type="checkbox" class="zll-settings__switch" ${pickerPreviewEnabled(node) ? "checked" : ""}>` +
            '</div>' +
            `<p class="zll-settings__desc">${$t("settingsPreviewDesc")}</p>` +
            '<div class="zll-settings__section">' +
                '<div class="zll-settings__row">' +
                    `<span class="zll-settings__label">${$t("settingsMultiSelect")}</span>` +
                    `<input type="checkbox" class="zll-settings__switch" data-role="multi-select" ${node._zllMultiSelect === true ? "checked" : ""}>` +
                '</div>' +
                `<p class="zll-settings__desc">${$t("settingsMultiSelectDesc")}</p>` +
            '</div>' +
            '<div class="zll-settings__section">' +
                '<div class="zll-settings__section-head">' +
                    `<span class="zll-settings__label">${$t("settingsStrengthRange")}</span>` +
                    `<button type="button" class="zll-settings__reset">${$t("settingsStrengthReset")}</button>` +
                '</div>' +
                '<div class="zll-settings__range">' +
                    '<div class="zll-settings__stepper">' +
                        '<button type="button" class="zll-settings__step" data-target="strength-min" data-dir="-1" aria-label="−">−</button>' +
                        `<input type="number" class="zll-settings__num" data-role="strength-min" step="${STRENGTH_STEP}" value="${strengthText(bounds.min)}">` +
                        '<button type="button" class="zll-settings__step" data-target="strength-min" data-dir="1" aria-label="+">+</button>' +
                    '</div>' +
                    '<span class="zll-settings__sep">~</span>' +
                    '<div class="zll-settings__stepper">' +
                        '<button type="button" class="zll-settings__step" data-target="strength-max" data-dir="-1" aria-label="−">−</button>' +
                        `<input type="number" class="zll-settings__num" data-role="strength-max" step="${STRENGTH_STEP}" value="${strengthText(bounds.max)}">` +
                        '<button type="button" class="zll-settings__step" data-target="strength-max" data-dir="1" aria-label="+">+</button>' +
                    '</div>' +
                '</div>' +
                `<p class="zll-settings__desc">${$t("settingsStrengthRangeDesc")}</p>` +
            '</div>' +
        '</div>';
    document.body.appendChild(dialog);

    const backdrop = document.createElement("div");
    backdrop.className = "zll-settings-backdrop";
    document.body.insertBefore(backdrop, dialog);

    let commitRange = null;
    const closeDialog = () => {
        if (dialog.classList.contains("closing")) return;
        // 关闭前提交尚未触发的输入，避免 ESC 直接退出丢失范围设置
        commitRange?.();
        dialog.classList.add("closing");
        backdrop.classList.add("closing");
        node._zllSettingsOpen = false;
        node.setDirtyCanvas?.(true, true);
        document.removeEventListener("keydown", onKeyDown, true);
        window.setTimeout(() => {
            dialog.remove();
            backdrop.remove();
        }, 200);
    };

    // 仅允许通过 ESC 或关闭按钮关闭弹窗，不响应外部点击
    const onKeyDown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            closeDialog();
        }
    };
    document.addEventListener("keydown", onKeyDown, true);

    dialog.querySelector(".zll-settings__close").addEventListener("click", closeDialog);
    dialog.querySelector(".zll-settings__switch").addEventListener("change", (event) => {
        node._zllShowPreview = event.target.checked;
        writeUiState(node);
    });
    dialog.querySelector('[data-role="multi-select"]').addEventListener("change", (event) => {
        node._zllMultiSelect = event.target.checked;
        writeUiState(node);
    });

    const minInput = dialog.querySelector('[data-role="strength-min"]');
    const maxInput = dialog.querySelector('[data-role="strength-max"]');
    commitRange = () => {
        let min = Number(minInput.value);
        let max = Number(maxInput.value);
        if (!Number.isFinite(min)) min = STRENGTH_MIN_DEFAULT;
        if (!Number.isFinite(max)) max = STRENGTH_MAX_DEFAULT;
        if (min > max) [min, max] = [max, min];
        node._zllStrengthMin = min;
        node._zllStrengthMax = max;
        minInput.value = strengthText(min);
        maxInput.value = strengthText(max);
        refreshStrengthBounds(node);
    };
    [minInput, maxInput].forEach((input) => {
        input.addEventListener("change", commitRange);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                input.blur();
            }
            event.stopPropagation();
        });
    });
    dialog.querySelectorAll(".zll-settings__step").forEach((button) => {
        button.addEventListener("click", () => {
            const input = button.dataset.target === "strength-min" ? minInput : maxInput;
            const current = Number(input.value);
            const base = Number.isFinite(current) ? current : 0;
            input.value = strengthText(round2(base + Number(button.dataset.dir) * STRENGTH_STEP));
            commitRange();
        });
    });
    dialog.querySelector(".zll-settings__reset").addEventListener("click", () => {
        minInput.value = strengthText(STRENGTH_MIN_DEFAULT);
        maxInput.value = strengthText(STRENGTH_MAX_DEFAULT);
        commitRange();
    });
}

app.registerExtension({
    name: "zhiai_nodes.LoraStackLoader",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData?.name !== NODE_CLASS) return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated?.apply(this, arguments);
            this.setSize([INIT_WIDTH, INIT_HEIGHT]);
            window.setTimeout(() => {
                if (this.graph) installUi(this);
            }, 0);
            return result;
        };

        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            const result = onConfigure?.apply(this, arguments);
            window.setTimeout(() => {
                if (!this.graph) return;
                closePickerFor(this);
                this._zllRows = null;
                this._zllInstanceId = null;
                if (!this._zllRoot) {
                    installUi(this);
                } else {
                    loadRows(this);
                    renderRows(this);
                }
                resizeNode(this);
            }, 0);
            return result;
        };

        const onResize = nodeType.prototype.onResize;
        nodeType.prototype.onResize = function (size) {
            const result = onResize?.apply(this, arguments);
            if (!size || typeof size[0] !== "number" || typeof size[1] !== "number" || this._zllResizing) return result;
            const width = Math.max(MIN_WIDTH, size[0]);
            if (width !== size[0]) {
                this._zllResizing = true;
                try {
                    this.setSize([width, Math.round(size[1])]);
                } finally {
                    this._zllResizing = false;
                }
            }
            return result;
        };

        const onSerialize = nodeType.prototype.onSerialize;
        nodeType.prototype.onSerialize = function (data) {
            let result;
            try {
                result = onSerialize?.apply(this, arguments);
            } catch (_) {
                result = undefined;
            }
            if (this._zllRows) {
                writeExecutionRows(this, false);
                writeUiState(this, false);
                writeDraftNow(this);
                markDraftClean(this);
                if (data && data.properties) {
                    data.properties[UI_PROPERTY] = this.properties?.[UI_PROPERTY] ?? null;
                }
            }
            return result;
        };

        const onRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function () {
            onRemoved?.apply(this, arguments);
            writeHandoff(this);
            closePickerFor(this);
            this._zllRoot = null;
            this._zllEls = null;
            this._zllRows = null;
            this._zllWidget = null;
            this._zllDrawHooked = false;
        };

        // 标题栏「设置」图标（帮助"?"图标左侧）
        const onMouseDown = nodeType.prototype.onMouseDown;
        nodeType.prototype.onMouseDown = function (e, localPos) {
            if (hitSettingsIcon(this, localPos)) {
                hideTitleTip();
                showSettingsDialog(this);
                return true;
            }
            return onMouseDown ? onMouseDown.apply(this, arguments) : undefined;
        };

        const onMouseMove = nodeType.prototype.onMouseMove;
        nodeType.prototype.onMouseMove = function (e, localPos) {
            const result = onMouseMove ? onMouseMove.apply(this, arguments) : undefined;
            const hovered = hitSettingsIcon(this, localPos);
            if (hovered !== this._zllSettingsHovered) {
                this._zllSettingsHovered = hovered;
                this.setDirtyCanvas?.(true, true);
            }
            titleTipHovered(hovered, $t("settings"), e);
            return result;
        };

        const onMouseLeave = nodeType.prototype.onMouseLeave;
        nodeType.prototype.onMouseLeave = function () {
            const result = onMouseLeave ? onMouseLeave.apply(this, arguments) : undefined;
            if (this._zllSettingsHovered) {
                this._zllSettingsHovered = false;
                this.setDirtyCanvas?.(true, true);
            }
            hideTitleTip();
            return result;
        };
    },
});

installStyles();
installTipDelegation();
