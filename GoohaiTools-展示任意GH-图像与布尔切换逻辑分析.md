# GoohaiTools ·「展示任意 GH」图像链路与布尔切换逻辑分析

> 分析对象：`E:\ComfyUINeo\custom_nodes\Goohaitools-comfyui-master`
>
> 核心文件：[展示任意 GH.py](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py)、[goohai_display_any.js](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js)
>
> 关联布尔节点：布尔开关、批处理开关、万能是否存在、路由阻断、任意切换

---

## 0. 结论速览

「展示任意 GH」（`GoohaiDisplayAny`）本身**没有输出切换**，它只有一条 `Any` 透传线路。用户看到的“布尔判断”分布在四个位置：

| 层级 | 判断内容 | 作用 |
| --- | --- | --- |
| 执行调度 | 是否有下游连接 | 决定节点是“依赖”还是“主动展示” |
| 类型判定 | 声明类型 / 运行时形态 | 决定走图像、遮罩、音频、视频还是文本分支 |
| 前端渲染 | `hasMedia` / `isText` / `BOOLEAN` | 决定显示图还是文本、以及布尔着色 |
| 相邻节点 | 空值、阻断、优先级 | 真正的“布尔切换输出”逻辑 |

---

## 1. 执行层的布尔判定：它会不会执行

[select_display_targets()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py#L31-L53) 通过 `PromptServer.instance.add_on_prompt_handler` 挂在每次提交前，直接改写请求里的 `partial_execution_targets`。

```python
displays = {node_id for node_id, node in prompt.items() if node.get("class_type") == NODE_TYPE}
referenced = {value[0] for node in prompt.values() for value in node.get("inputs", {}).values() if is_link(value)}
passive = displays & referenced
request["partial_execution_targets"] = [n for n in targets if str(n) not in passive]
```

三个布尔判断：

1. **`displays` 是否为空**：本 prompt 没有该节点 → 原样返回。
2. **`passive = displays & referenced`**：该节点输出被任意下游 `is_link(value)` 引用 → 视为“被动展示”。
3. **`getattr(cls, "OUTPUT_NODE", False) is True`**：用 `is True` **严格比较**，非 bool 的真值（如 `1`）不算执行根。

结论：

- 有下游连接 → 从执行目标中剔除（它只是依赖，不自成执行根）；
- 无下游连接 → 作为 `OUTPUT_NODE = True` 主动执行，保证“没接下游也能看到图”。

这是整套布尔判断的**核心设计目的**：让预览节点既能在有下游时按需执行，又能在孤立时主动出图。

注意：`passive` 的判定只看"输出是否被引用"，**不看下游是否会真的求值**。如果下游是 lazy 开关（如 Easy-Use 的 `easy ifElse`），未选中的分支不会求值，此时展示节点既不是执行根、也无人拉取 → 完全不执行。详见 §10。

---

## 2. 类型判定：声明优先，运行时兜底

[input_type()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py#L85-L104) 的判断顺序：

1. `declared not in ("ANY", "*")` → 直接返回声明类型，**不再看数据**。
2. 否则按数据形态推断：
   - `Input.Video` → `VIDEO`
   - `Mapping` 且含 `waveform` + `sample_rate` → `AUDIO`
   - `Mapping` 且含 `samples` → `LATENT`
   - `torch.Tensor` 且 `ndim == 4` 且末维 ∈ (1, 3, 4) → `IMAGE`
   - `ndim ∈ (2, 3)` → `MASK`
3. 最后按 Python 类型：`bool → BOOLEAN`、`int → INT`、`float → FLOAT`、`str → STRING`。
4. 全不匹配 → `ANY`。

**顺序关键点**：Python 中 `bool` 是 `int` 的子类，若先判 `int`，布尔值会被吞成整数。此处先判 `bool` 是正确的。

[display()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py#L183-L210) 还会反查上游节点真实输出类型覆盖 `gh_input_type`：

```python
if source[1] < len(output_types) and str(output_types[source[1]]) not in ("*", "ANY", "COMFY_MATCHTYPE_V3"):
    gh_input_type = output_types[source[1]]
```

避免前端声明 `ANY` 时图像被当成文本来描述。

**边界情况**：

- `[B, H, W]` 一定判为 `MASK`，因此灰度图批次会被显示成遮罩；
- 4 维但末维不是 1/3/4（例如 5 通道）会落到 `ANY`，只出文本不出图。

---

## 3. 图像预览管线：后端 → 临时文件 → 前端 URL

[preview_images()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py#L114-L134)：

| 步骤 | 逻辑 |
| --- | --- |
| 形状归一 | MASK：`[H,W]` 补成 `[1,H,W]`，要求 3 维；IMAGE：单图 `[H,W,C]` 补成 `[1,H,W,C]`，要求 4 维且末维 1/3/4 |
| 数值转换 | `255. * image` → `np.clip(0,255)` → `astype(uint8)` |
| 通道处理 | `C == 1` 时去掉通道，PIL 生成灰度 `L` 模式 |
| 落盘 | [temp_file()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py#L107-L111) 用 `uuid4().hex` 命名写入 ComfyUI temp 目录，`compress_level=1`（低压缩=快写，预览场景） |
| 返回 | `{filename, subfolder: "", type: "temp"}` 列表，前端拼 `/view?...&type=temp` |

**异常隔离**（[L204-209](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py#L204-L209)）：

- 普通异常只写 `logging.warning` 并附到文本，**不影响数据流**；
- `InterruptProcessingException` 必须重抛，否则用户中断会被吞掉；
- 无论如何 `result` 都返回原始 `Any`：预览失败不阻断下游。

**性能提示**：`describe()` 对 Tensor 只输出 `shape/dtype/device`，不解码像素；真正解码只在命中 `IMAGE/MASK` 时才发生。

---

## 4. 前端渲染：布尔常量驱动的分支

[renderPreview()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L489-L620) 用一组布尔量切换样式与可见性：

| 布尔量 | 计算方式 | 效果 |
| --- | --- | --- |
| `hasMedia` | `["images","audio","video"].some(k => payload[k]?.some(r => r?.filename))` | 加 `gh-has-media`，`state.text.hidden = true`（图文互斥） |
| `isText` | `!hasMedia && ["STRING","TEXT"].includes(payload.type)` | 决定“复制”工具栏显隐 |
| 批量 | `batchTexts.length > 1` | 加 `gh-has-batch`，隐藏工具栏，逐段渲染 |
| 单图 | `figures.length === 1` | `selectGalleryItem(state, 0)` |
| 网格 | `galleryIndex === null && figures.length > 1` | 缩略图网格模式 |

多 payload 合并见 [onExecuted](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L861-L879)：各 payload 类型全同才保留类型，否则降为 `ANY`；`texts` 单独保留供批量渲染。

---

## 5. BOOLEAN 专项：渲染与颜色判断

### 5.1 类型归一

[previewTypeOf()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L97-L104)：`BOOL` → `BOOLEAN`，并优先读取 `node.properties.gh_display_preview.type`，再退化到输入插槽类型。

### 5.2 文本归一化

[L509-L531](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L509-L531)：

```js
if (payload?.type === "BOOLEAN") {
    batchTexts = batchTexts.map(value => {
        const text = String(value).trim();
        if (text === "是" || /^true$/i.test(text)) return "True";
        if (text === "否" || /^false$/i.test(text)) return "False";
        return value;
    });
}
```

双向兼容翻译插件把 `True/False` 改成 `是/否` 的情况。

### 5.3 Shadow DOM 规避翻译

[setPreviewText()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L483-L487)：

```js
if (isBoolean) element.attachShadow({ mode: "open" }).textContent = value;
else element.textContent = value;
```

翻译扩展扫描 light-DOM 文本，因此布尔值写入 shadow root，让插件扫不到，避免被二次翻译。

### 5.4 颜色与字号

[applyTextStyle()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L110-L132)：

- BOOLEAN 固定 30px；
- 逐子元素按 [BOOLEAN_TEXT_COLORS](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L92-L95)：`TRUE #78BF5F`（绿）、`FALSE #A8A8A8`（灰）；
- 用户在“展示文本设置”里改过字体后，`gh_text_style_customized = true` 则不再覆盖。

`booleanTextColor()` 从 `shadowRoot.textContent` 读取，因此与 5.3 的 shadow 写入配套。

---

## 6. 图库布局的判断逻辑

[selectGalleryItem()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L464-L481)：

- `grid` 为真：所有 figure 平铺成网格，视频 `controls = false` 且暂停；
- `grid` 为假：只显示选中项，视频启用 controls；
- 序号按钮 `galleryNext` 显示 `n/N`，`galleryClose` 返回网格。

[layoutGallery()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L363-L402) 的列数穷举：

```js
for (let candidate = 1; candidate <= count; candidate++) {
    const scale = Math.min(cellWidth / imageWidth, cellHeight / imageHeight, 1);
    const unused = candidate * rows - count;
    if (scale > bestScale || (scale === bestScale && unused < bestUnused)) { ... }
}
```

- 目标是**整批可见**；
- 缩放上限为 1（不放大）；
- 同分时选空位最少的列数。

[layoutDimensions()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L404-L440)：单图按 `min(availW/iw, availH/ih, 1)` 居中；有尺寸标注时预留 14px。

[revealImagePreview()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L442-L462)：所有图 `_ghPreviewReady` 且 `decode()` 完成后，经两次 `requestAnimationFrame` 再取消 `visibility: hidden`，避免中间布局闪烁。

**失败兜底**（[L594-611](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L594-L611)）：图片 `error` 时从 `figures` 摘除，并修正 `galleryIndex`（删除项在选中项之前则索引 -1，恰好等于则退到最后一个），保证网格与序号不错位。

---

## 7. 端口类型同步

[syncPorts()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L622-L658)：

1. 读上游 link 的 `outputs[origin_slot].type`；
2. `*` / `COMFY_MATCHTYPE_V3` 时退化判断：插槽名匹配 `^(文本|字符串|text|string)$` → `STRING`，否则沿用历史预览类型；
3. 同步 input/output 的 `type` 与中文 `label`（[LABELS 映射](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L7-L11)）；
4. 写回隐藏 widget `gh_input_type`；
5. 沿下游 `GoohaiDisplayAny` 链递归，`visited` 集合防环。

同时在 [beforeRegisterNodeDef](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/goohai_display_any.js#L826-L860) 中：

- `gh_input_type` 设为 `socketless` + 隐藏 widget，且 `addInput` 拦截该名称，防止变成第二个可连接 STRING 输入；
- `onConfigure` 里清理历史遗留的同名输入。

---

## 8. 真正的“布尔切换输出”：相邻节点

| 节点 | 判定逻辑 | 输出 |
| --- | --- | --- |
| [布尔孤海](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B8%83%E5%B0%94%E5%BC%80%E5%85%B3.py#L17-L18) | 无判断，`return (开关,)` | BOOLEAN 原样透传 |
| [孤海批处理开关](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E6%89%B9%E5%A4%84%E7%90%86%E5%BC%80%E5%85%B3.py#L29-L30) | 无判断 | `(BOOL, BOOL, FLOAT, FLOAT)`，`display:["关","开"]` 仅文案 |
| [万能是否存在](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L33-L34) | 空值检测 | `(Any, BOOLEAN)` |
| [路由阻断](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L182-L192) | `是否阻断` + 模式 | 透传 / `None` / `ExecutionBlocker` |
| [任意切换 GH](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%BB%BB%E6%84%8F%E5%88%87%E6%8D%A2%20GH.py#L36-L62) | 空值 + 类型一致性 | 第一个非空输入 |

### 8.1 布尔孤海：切换全在 UI

后端零逻辑。前端 [BOOLEAN.js](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/web/js/BOOLEAN.js#L67-L203) 用 DOM 开关替换原生 checkbox：

- `setBoolValue()`：`!!value` 归一化 → 写 widget → **仅在值变化时**触发 `callback` / `onWidgetChanged` / `graph.incrementVersion`；
- `redraw("dom")` 跳过画布重绘，避免 DOM 已更新还重绘；
- DOM widget 的 `getValue/setValue` 走字符串，`serialize = false`；
- 双击标签进入改名，写入 `node.properties.guhai_label`；
- 按 `nodeData.name / display_name / comfyClass / type` 多路匹配 `布尔孤海`，兼容 Multi-Generation 前端命名差异。

### 8.2 万能是否存在：空值 → 布尔的四层返回

[check()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L115-L145)：

| 条件 | 返回 |
| --- | --- |
| 非空 | `(原值, True)` |
| 空 MASK 且原值非 None | `(清理后的原尺寸遮罩, False)` |
| None 且类型 ANY | `(None, False)` |
| 其余空值 | `(类型占位值, False)` |

空值判定 [_is_empty](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L57-L69) 的例外规则：

- **`0` 和 `False` 视为有效内容**（L69 显式注释）——布尔 `False` 不会误判为空，这是最易写错处；
- MASK / LATENT 用“全零张量即空”：`torch.any(value != 0)`；
- 先经 [_clean_mask_tensor](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L50-L54) 把 ≤0.02 的残差清零，避免 RGBA 拆分出的 1/255 噪声被当作有内容；
- `str == ""`、空 list/tuple/dict/set 为空；
- NaN 张量中 `NaN != 0` 为 True，因此 NaN **不算黑**。

[_runtime_type](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L94-L113) 同样**先 `bool` 后 `int`**（避免被 int 子类吞掉）；[_placeholder](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L72-L91) 按类型构造：`IMAGE → zeros(1,64,64,3)`、`MASK → zeros(1,64,64)`、`LATENT → zeros(1,4,1,1)`、`BOOLEAN → False`，MODEL/CLIP/VAE 无法构造则 `None`。

另外 `check()` 兼容前端把插槽改名为中文（图像/遮罩/布尔…），并用 [映射表](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L123-L129) 还原声明类型。

### 8.3 路由阻断：三态输出切换

[route()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%B8%87%E8%83%BD%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%EF%BC%88GH%EF%BC%89.py#L183-L192)：

```python
if not 是否阻断:
    return (any,)
if 阻断模式 == "仅输出空值":
    return (None,)
if isinstance(ExecutionBlocker, type):
    return (ExecutionBlocker(None),)
return (None,)
```

| `是否阻断` | 模式 | 结果 |
| --- | --- | --- |
| False | — | 原样透传 |
| True | 仅输出空值 | `(None,)`，下游照常执行、自行处理空值 |
| True | 中断后续分支 | `ExecutionBlocker(None)`，等价 Ctrl+M 静默断开 |

`isinstance(ExecutionBlocker, type)` 是因为 import 失败时它被兜底成 `()` 元组，直接调用会崩溃。

配合「万能是否存在」的布尔输出，形成典型布尔驱动线路：**有无内容 → BOOLEAN → 阻断/透传**。

### 8.4 任意切换 GH：优先级与一致性

[_empty](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%BB%BB%E6%84%8F%E5%88%87%E6%8D%A2%20GH.py#L28-L35)：`None` / `ExecutionBlocker` / 空串 / 空容器 / 空张量 / 空 latent 为空；`False`、`0` 非空。

[switch()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%BB%BB%E6%84%8F%E5%88%87%E6%8D%A2%20GH.py#L36-L62)：

- 用 `re.search(r"(\d+)$", key)` 从输入名尾数还原稳定索引（前端把插槽改成「图像_1」也不会打乱优先级）；
- `setdefault` 保证同一索引只取第一次；
- 多个非空值类型不一致（`types` 集合长度 > 1）→ `RuntimeError`；
- 全部为空 → `RuntimeError`；
- 否则返回第一个非空值。

注意：类型比较用 `type(v).__name__`，因此 `True`（`bool`）与 `1`（`int`）会被判为不同类型，比 ComfyUI 原生更严格。

---

## 9. 贯穿全包的“布尔覆盖”

三个文件都定义了 [AnyType](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E4%BB%BB%E6%84%8F%E5%88%87%E6%8D%A2%20GH.py#L9-L13)：

```python
class AnyType(str):
    def __ne__(self, value): return False
    def __eq__(self, value): return True
    def __str__(self): return "*"
```

ComfyUI 依赖“类型不相等”判断输入是否匹配，`__ne__ → False` 使 `ANY` 与任何类型**永不相斥**。配合 `VALIDATE_INPUTS` 恒返回 `True`，形成“永不校验失败”的任意插槽。

副作用：类型错误被推迟到运行时（如「任意切换」的 `RuntimeError`），而不是提交时就报错。

---

## 10. 案例复盘：「是否判断」为真时，展示任意 GH 不执行

### 10.1 图中的连接关系

```
加载图像#3 → 颜色校正#5 → 展示任意GH#9（图像输出）
                                   │
                                   └──→ 是否判断#1 的「假时」(on_false)

颜色校正#2（真图分支）──────────────→ 是否判断#1 的「真时」(on_true)
是否判断#1（是否为真 = true/false）──→ 预览图像（右侧）
```

同一张图左侧的 `展示任意 GH` 面板停在上次的「等待执行…」，右上角 `预览图像` 仍有画面——这正是本案例的现象。

### 10.2 三层原因（缺一不可）

**第一层：`easy ifElse` 的两个输入是 lazy 的。**

[logic.py](file:///E:/ComfyUINeo/custom_nodes/ComfyUI-Easy-Use/py/nodes/logic.py#L938-L961)：

```python
io.AnyType.Input("on_true", lazy=True),
io.AnyType.Input("on_false", lazy=True),

@classmethod
def check_lazy_status(cls, boolean=True, on_true=None, on_false=None):
    if boolean and on_true is None:      return ["on_true"]
    if not boolean and on_false is None: return ["on_false"]

def execute(cls, **kwargs):
    return io.NodeOutput(kwargs["on_true"] if kwargs["boolean"] else kwargs["on_false"])
```

- `boolean = true` → 只请求 `on_true`，`on_false` 保持 `None`，**该分支的上游根本不被求值**；
- `boolean = false` → 只请求 `on_false`。

所以为真时，#9 → #5 → #3 **整条链都不会执行**，`展示任意 GH` 自然停在「等待执行…」。

**第二层：展示节点被判定为"被动展示"，不会成为执行根。**

#9 的输出作为 link 源出现在 #1 的 `假时` 输入中 → 被 [select_display_targets()](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py#L31-L53) 的 `referenced` 命中 → `passive` → 从 `partial_execution_targets` 中移除。因此它不会因为 `OUTPUT_NODE = True` 而主动执行。

**第三层：两者叠加。**

| 是否判断 | 假时分支是否被求值 | 展示节点是否执行根 | 结果 |
| --- | --- | --- | --- |
| true | 否（lazy 跳过） | 否（passive） | **不执行、不展示** |
| false | 是（作为依赖被拉取） | 否 | **执行并展示一次** |

即：展示节点的"能不能显示"实际由两个布尔决定——**① 它是不是执行根（有没有下游）**，**② 它是否被求值（下游是否需要它的输出）**。图中两条都不满足（为真时），所以不显示。

### 10.3 推论与验证方式

- 把 #9 的输出断开 → 它变成执行根，**无论真假都会展示**；
- 把「假时」改接到「真时」→ 现象反转（为真时展示、为假时不展示）；
- 在 #9 之后再接一个**非 lazy** 的普通节点 → #9 会被当作依赖拉取，真假都会执行；
- 右上角 `预览图像` 在真时仍有画面，是因为真时输出的是 `on_true`（颜色校正#2 的图），与 #9 无关——可据此确认"不是展示节点坏了，而是它压根没跑"。

### 10.4 结论

原文档只解释了第二层（"有下游就按需执行"），**没有覆盖第一层的 lazy 求值**，因此不足以解释这一现象；现已补充本节。这不是 GoohaiTools 的 bug，而是 lazy 开关与"被动展示"策略组合后的正常行为。

---

## 11. 需要注意的坑

1. `[B,H,W]` 张量恒为 MASK，灰度图批次会显示成遮罩。
2. `OUTPUT_NODE ... is True` 用严格比较，`OUTPUT_NODE = 1` 的节点不会被纳入执行根。
3. `preview_images` 对 NaN 未做 `nan_to_num`，`astype(uint8)` 结果依平台而定（音频路径 [L151](file:///E:/ComfyUINeo/custom_nodes/Goohaitools-comfyui-master/nodes/%E5%B1%95%E7%A4%BA%E4%BB%BB%E6%84%8F%20GH.py#L151) 反而处理了）。
4. 布尔渲染依赖 shadow DOM 规避翻译插件；若宿主的 shadow 文本不参与布局，会表现为空白。
5. 图库缩放上限为 1，小图不会放大，只保证整批塞得下。
6. `任意切换` 的类型比较用 `type().__name__`，`True` 与 `1` 被判为不同类型，可能比原生更严格地抛错。
7. `describe()` 深度上限 3、单项最多 8 条，复杂嵌套对象只输出摘要，长文本字符串截断到 500 字符。
