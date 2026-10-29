import { registerSwitchDualMode } from "./SwitchDualModeCommon.js";

// 图像切换器（ImageSwitchDualMode）前端配置：具体行为全部在 SwitchDualModeCommon.js
registerSwitchDualMode({
    nodeClass: "ImageSwitchDualMode",
    portPrefix: "image",
    portType: "IMAGE",
    noteSuffix: "_note",
    selectWidget: "select_image",
    propKey: "zh_imageswitch",
    storageKey: "zh_imageswitch_notes",
    overlayId: "zhiai-imageswitch-note-overlay",
    labelZh: "图像",
    dialogTitleZh: "图像切换器设置",
    dialogTitleEn: "Image Switcher Settings",
    hintZh: "备注会显示在对应图像端口的名称后面，并随工作流保存。",
    hintEn: "Notes are shown after the corresponding image port name and saved with the workflow.",
});
