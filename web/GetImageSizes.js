import { app } from "../../../scripts/app.js";

function drawRoundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

app.registerExtension({
    name: "Zhi.AI.GetImageSizes",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "GetImageSizes") return;
        const getSlotHeight = () => (globalThis?.LiteGraph?.NODE_SLOT_HEIGHT ?? 23);
        const calcMinHeight = (node) => {
            const slotH = getSlotHeight();
            const slots = Math.max(node?.inputs?.length || 0, node?.outputs?.length || 0, 1);
            const y0 = slots * slotH + 12;
            return y0 + 56 + 8;
        };

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
            const minW = 260;
            const minH = Math.max(120, calcMinHeight(this));
            this.size = this.size || [minW, minH];
            this.size[0] = Math.max(this.size[0], minW);
            this.size[1] = Math.max(this.size[1], minH);
            this.__zhi_img_w = null;
            this.__zhi_img_h = null;
            this.__zhi_text = "未连接图像\nNo image connected";
            return r;
        };

        const onResize = nodeType.prototype.onResize;
        nodeType.prototype.onResize = function (newSize) {
            const size = onResize ? onResize.apply(this, arguments) : newSize;
            const minW = 260;
            const minH = Math.max(120, calcMinHeight(this));
            size[0] = Math.max(size[0], minW);
            size[1] = Math.max(size[1], minH);
            return size;
        };

        const onConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function (type, slot, connected) {
            const r = onConnectionsChange ? onConnectionsChange.apply(this, arguments) : undefined;
            if (type === 1 && slot === 0) {
                this.__zhi_text = connected
                    ? "等待运行以获取尺寸…\nRun to get size…"
                    : "未连接图像\nNo image connected";
                this.setDirtyCanvas(true, true);
            }
            return r;
        };

        const onExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function (message) {
            onExecuted?.apply(this, arguments);
            const pickFirst = (v) => (Array.isArray(v) ? v[0] : v);
            const w = pickFirst(message?.img_width ?? message?.width ?? null);
            const h = pickFirst(message?.img_height ?? message?.height ?? null);
            const t = pickFirst(message?.text ?? null);

            if (typeof w === "number" && typeof h === "number") {
                this.__zhi_img_w = w;
                this.__zhi_img_h = h;
                this.__zhi_text = `宽度: ${w} , 高度: ${h}\nWidth: ${w} , Height: ${h}`;
            } else if (typeof t === "string" && t.length) {
                this.__zhi_text = t;
            } else {
                this.__zhi_text = "未获取到尺寸\nSize unavailable";
            }
            this.setDirtyCanvas(true, true);
        };

        const onDrawForeground = nodeType.prototype.onDrawForeground;
        nodeType.prototype.onDrawForeground = function (ctx) {
            onDrawForeground?.apply(this, arguments);
            const slotH = globalThis?.LiteGraph?.NODE_SLOT_HEIGHT ?? 23;
            const inputsCount = this.inputs ? this.inputs.length : 0;
            const outputsCount = this.outputs ? this.outputs.length : 0;
            const slots = Math.max(inputsCount, outputsCount, 1);
            const y0 = slots * slotH + 12;
            const padX = 12;
            const padY = 8;
            const panelX = padX;
            const panelY = y0;
            const panelW = this.size[0] - padX * 2;
            const panelH = Math.max(56, this.size[1] - panelY - padY);
            ctx.save();

            drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 6);
            ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            ctx.stroke();

            const text = this.__zhi_text || "";
            const lines = String(text).split("\n");
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.font = "14px 'Microsoft YaHei', 'PingFang SC', sans-serif";
            ctx.textBaseline = "top";

            const lineHeight = 18;
            const startX = panelX + 12;
            let startY = panelY + 12;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line != null && String(line).length) {
                    ctx.fillText(String(line), startX, startY);
                }
                startY += lineHeight;
            }
            ctx.restore();
        };
    },
});