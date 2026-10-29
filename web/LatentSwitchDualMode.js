import { registerSwitchDualMode } from "./SwitchDualModeCommon.js";

// 潜在空间切换器（LatentSwitchDualMode）前端配置：具体行为全部在 SwitchDualModeCommon.js
registerSwitchDualMode({
    nodeClass: "LatentSwitchDualMode",
    portPrefix: "latent",
    portType: "LATENT",
    noteSuffix: "_note",
    selectWidget: "select_latent",
    propKey: "zh_latentswitch",
    storageKey: "zh_latentswitch_notes",
    overlayId: "zhiai-latentswitch-note-overlay",
    labelZh: "潜空间",
    dialogTitleZh: "潜在空间切换器设置",
    dialogTitleEn: "Latent Switcher Settings",
    hintZh: "备注会显示在对应潜在空间端口的名称后面，并随工作流保存。",
    hintEn: "Notes are shown after the corresponding latent port name and saved with the workflow.",
});
