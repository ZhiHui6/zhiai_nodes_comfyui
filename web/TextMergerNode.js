import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.TextMergerNode",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "TextMergerNode") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            this._type = "STRING";
            this._syncingInputs = false;

            this.updateInputs = function (target_number_of_inputs) {
                if (this._syncingInputs) return;
                this._syncingInputs = true;
                try {
                    target_number_of_inputs = parseInt(target_number_of_inputs);
                    if (!Number.isFinite(target_number_of_inputs) || target_number_of_inputs < 1) return;

                    if (!this.inputs) this.inputs = [];

                    const currentTextInputs = this.inputs.filter(input => input.name.startsWith("text_")).length;
                    if (target_number_of_inputs === currentTextInputs) return;

                    let changed = false;

                    if (target_number_of_inputs < currentTextInputs) {
                        // 移除多余的 text_N 输入端口
                        for (let i = this.inputs.length - 1; i >= 0; i--) {
                            const input = this.inputs[i];
                            if (input.name && input.name.startsWith("text_")) {
                                const textNum = parseInt(input.name.split("_")[1]);
                                if (textNum > target_number_of_inputs) {
                                    this.removeInput(i);
                                    changed = true;
                                }
                            }
                        }
                    } else {
                        // 补充缺失的 text_N 输入端口
                        for (let i = 1; i <= target_number_of_inputs; i++) {
                            const inputName = `text_${i}`;
                            if (!this.inputs.find(inp => inp.name === inputName)) {
                                this.addInput(inputName, this._type);
                                changed = true;
                            }
                        }
                    }

                    if (changed) {
                        // 让节点尺寸跟随端口数量变化
                        const minSize = this.computeSize(this.size);
                        if (this.size[1] < minSize[1]) {
                            this.setSize([this.size[0], minSize[1]]);
                        }
                        app.graph.setDirtyCanvas(true, true);
                    }
                } finally {
                    this._syncingInputs = false;
                }
            };

            // 每帧检测 inputcount 与端口数量是否一致，不一致则自动同步
            //（兼容各版本前端：数值控件 callback 触发时机不一致也不影响）
            const onDrawBackground = this.onDrawBackground;
            this.onDrawBackground = function () {
                const r = onDrawBackground ? onDrawBackground.apply(this, arguments) : undefined;
                const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
                if (inputcountWidget) {
                    const target = parseInt(inputcountWidget.value);
                    const current = this.inputs ? this.inputs.filter(inp => inp.name.startsWith("text_")).length : 0;
                    if (Number.isFinite(target) && target !== current) {
                        this.updateInputs(target);
                    }
                }
                return r;
            };

            // 数值变化时立即同步（大多数前端版本会触发）
            const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
            if (inputcountWidget) {
                const originalCallback = inputcountWidget.callback;
                inputcountWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    this.updateInputs(value);
                };
                this.updateInputs(inputcountWidget.value);
            }

            return r;
        };

        // 加载已保存的工作流时，根据保存的 inputcount 自动同步端口数量
        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            const r = onConfigure ? onConfigure.apply(this, arguments) : undefined;
            const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
            if (inputcountWidget) {
                this.updateInputs(inputcountWidget.value);
            }
            return r;
        };
    }
});
