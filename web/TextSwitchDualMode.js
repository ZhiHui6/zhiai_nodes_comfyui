import { registerSwitchDualMode } from "./SwitchDualModeCommon.js";

// 文本切换器（TextSwitchDualMode）前端配置：具体行为全部在 SwitchDualModeCommon.js
// 备注组件沿用后端既有命名 text${i}_comment（注意不是 _note），以保持旧工作流兼容
registerSwitchDualMode({
    nodeClass: "TextSwitchDualMode",
    portPrefix: "text",
    portType: "STRING",
    noteSuffix: "_comment",
    selectWidget: "select_text",
    propKey: "zh_textswitch",
    storageKey: "zh_textswitch_comments",
    overlayId: "zhiai-textswitch-note-overlay",
    labelZh: "文本",
    dialogTitleZh: "文本切换器设置",
    dialogTitleEn: "Text Switcher Settings",
    hintZh: "备注会显示在对应文本端口的名称后面，并随工作流保存。",
    hintEn: "Notes are shown after the corresponding text port name and saved with the workflow.",
});
