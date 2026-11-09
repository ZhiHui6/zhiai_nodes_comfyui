from __future__ import annotations

import math
import os
import re
from collections.abc import Iterable, Mapping

import numpy as np
import torch
from comfy.utils import common_upscale
from PIL import Image, ImageDraw, ImageFont
from comfy_api.v0_0_2 import io

ZHIAI_ACCENT_COLOR = "#3B82F6"

_LAYOUT_ALIASES = {
    "horizontal": "horizontal",
    "Horizontal": "horizontal",
    "横向": "horizontal",
    "vertical": "vertical",
    "Vertical": "vertical",
    "纵向": "vertical",
    "grid": "grid",
    "Grid": "grid",
    "网格": "grid",
}
_CROP_ALIASES = {
    "none": "none",
    "standard": "standard",
    "不裁切": "none",
    "Standard crop": "standard",
    "标准裁切": "standard",
    "left": "left",
    "Left crop": "left",
    "居左裁切": "left",
    "center": "center",
    "Center crop": "center",
    "居中裁切": "center",
    "right": "right",
    "Right crop": "right",
    "居右裁切": "right",
}
_TITLE_POSITION_ALIASES = {
    "top": "top",
    "Outside top": "top",
    "顶部": "top",
    "图外顶部": "top",
    "outside_top": "top",
    "middle": "middle",
    "Middle": "middle",
    "中间": "middle",
    "中部": "middle",
    "bottom": "bottom",
    "Outside bottom": "bottom",
    "底部": "bottom",
    "图外底部": "bottom",
    "outside_bottom": "bottom",
    "inner_top": "inner_top",
    "Inside top": "inner_top",
    "图内顶部": "inner_top",
    "inside_top": "inner_top",
    "inner_bottom": "inner_bottom",
    "Inside bottom": "inner_bottom",
    "图内底部": "inner_bottom",
    "inside_bottom": "inner_bottom",
}
_TEXT_ALIGN_ALIASES = {
    "left": "left",
    "Left": "left",
    "居左": "left",
    "center": "center",
    "Center": "center",
    "居中": "center",
    "right": "right",
    "Right": "right",
    "居右": "right",
}
_OUTPUT_SIZE_ALIASES = {
    "original": 0,
    "Original size": 0,
    "原始尺寸": 0,
    "1K": 1024,
    "2K": 2048,
    "4K": 4096,
}


def _parse_color(value: str) -> tuple[int, int, int]:
    text = str(value).strip().lstrip("#")
    if len(text) == 3:
        text = "".join(channel * 2 for channel in text)
    if len(text) != 6:
        raise ValueError(f"颜色必须使用 #RRGGBB 格式，当前值：{value!r}")
    try:
        return tuple(int(text[index : index + 2], 16) for index in (0, 2, 4))
    except ValueError as error:
        raise ValueError(f"颜色必须使用 #RRGGBB 格式，当前值：{value!r}") from error


def _darken(color: tuple[int, int, int], amount: float = 0.2) -> tuple[int, int, int]:
    factor = 1.0 - amount
    return tuple(round(channel * factor) for channel in color)


def _percentage(value: int | str) -> int:
    return int(str(value).strip().removesuffix("%"))


def _resize_long_edge(images: torch.Tensor, output_size: str) -> torch.Tensor:
    target = _OUTPUT_SIZE_ALIASES.get(output_size)
    if target is None:
        raise ValueError(f"不支持的图像尺寸：{output_size}")
    if target == 0:
        return images
    if not isinstance(images, torch.Tensor) or images.ndim != 4:
        raise ValueError("图片输入必须是形状为 [B,H,W,C] 的 IMAGE 张量")
    height, width = images.shape[1:3]
    scale = target / max(height, width)
    target_width = max(1, round(width * scale))
    target_height = max(1, round(height * scale))
    return common_upscale(
        images.movedim(-1, 1),
        target_width,
        target_height,
        "lanczos",
        "disabled",
    ).movedim(1, -1)


def _tensor_images(inputs: Iterable[torch.Tensor]) -> list[Image.Image]:
    images: list[Image.Image] = []
    for batch in inputs:
        if not isinstance(batch, torch.Tensor) or batch.ndim != 4:
            raise ValueError("图片输入必须是形状为 [B,H,W,C] 的 IMAGE 张量")
        for item in batch:
            array = item.detach().to(device="cpu", dtype=torch.float32).numpy()
            array = np.clip(array[..., :3] * 255.0, 0, 255).astype(np.uint8)
            images.append(Image.fromarray(array, mode="RGB"))
    if not images:
        raise ValueError("至少需要输入一张图片")
    return images


def _fit_inside(image: Image.Image, width: int, height: int) -> Image.Image:
    scale = min(width / image.width, height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def _cover(image: Image.Image, width: int, height: int) -> Image.Image:
    scale = max(width / image.width, height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(size, Image.Resampling.LANCZOS)
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


def _horizontal_crop(image: Image.Image, width: int, align: str) -> Image.Image:
    if align == "left":
        left = 0
    elif align == "right":
        left = image.width - width
    else:
        left = (image.width - width) // 2
    return image.crop((left, 0, left + width, image.height))


def _vertical_crop(image: Image.Image, height: int, align: str) -> Image.Image:
    if align == "left":
        top = 0
    elif align == "right":
        top = image.height - height
    else:
        top = (image.height - height) // 2
    return image.crop((0, top, image.width, top + height))


def _strip_sizes(total: int, count: int) -> list[int]:
    size, extra = divmod(total, count)
    sizes = [size] * count
    sizes[-1] += extra
    return sizes


def _strip_align(crop: str, index: int, count: int) -> str:
    if crop != "standard":
        return crop
    if count > 1 and index == 0:
        return "left"
    if count > 1 and index == count - 1:
        return "right"
    return "center"


def _resize_to_height(image: Image.Image, height: int) -> Image.Image:
    width = max(1, round(image.width * height / image.height))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def _resize_to_width(image: Image.Image, width: int) -> Image.Image:
    height = max(1, round(image.height * width / image.width))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def _font_candidates() -> list[str]:
    return [
        os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts", "msyh.ttc"),
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]


def _load_font(size: int) -> ImageFont.ImageFont:
    for candidate in _font_candidates():
        if candidate and os.path.isfile(candidate):
            try:
                return ImageFont.truetype(candidate, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def _add_title(
    image: Image.Image,
    title: str,
    *,
    bar_color: tuple[int, int, int],
    bar_opacity: int,
    bar_position: str,
    bar_height: int,
    font: ImageFont.ImageFont,
    text_color: tuple[int, int, int],
    text_align: str,
    text_padding: int,
) -> Image.Image:
    height = max(1, bar_height)
    if bar_position in {"middle", "inner_top", "inner_bottom"}:
        height = min(height, image.height)
    bar = Image.new("RGBA", (image.width, height), (*bar_color, bar_opacity))
    draw = ImageDraw.Draw(bar)
    if title:
        bbox = draw.textbbox((0, 0), title, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        if text_align == "left":
            x = text_padding
        elif text_align == "right":
            x = image.width - text_padding - text_width
        else:
            x = (image.width - text_width) // 2
        text_y = (height - text_height) // 2 - bbox[1]
        draw.text((x, text_y), title, font=font, fill=(*text_color, 255))

    if bar_position in {"middle", "inner_top", "inner_bottom"}:
        if bar_position == "inner_top":
            y = 0
        elif bar_position == "inner_bottom":
            y = image.height - height
        else:
            y = (image.height - height) // 2
        result = image.convert("RGBA")
        result.alpha_composite(bar, (0, y))
    else:
        result = Image.new("RGBA", (image.width, image.height + height), (0, 0, 0, 255))
        if bar_position == "top":
            result.alpha_composite(bar, (0, 0))
            result.alpha_composite(image.convert("RGBA"), (0, height))
        else:
            result.alpha_composite(image.convert("RGBA"), (0, 0))
            result.alpha_composite(bar, (0, image.height))
    return result.convert("RGB")


def _order_key(name: str) -> tuple[int, str]:
    match = re.search(r"(\d+)$", str(name))
    return (int(match.group(1)) if match else -1, str(name))


_TITLE_BINDING_PATTERN = re.compile(r"^\s*(\d+)\s*[:：=]\s*(.*)$")


def _parse_titles(raw: str, port_count: int) -> list[str]:
    explicit: dict[int, str] = {}
    fallback: list[str] = []
    for line in str(raw).splitlines():
        match = _TITLE_BINDING_PATTERN.match(line)
        if match:
            explicit[int(match.group(1)) - 1] = match.group(2).strip()
        elif line.strip():
            fallback.append(line.strip())
    titles = [""] * port_count
    for index, text in explicit.items():
        if 0 <= index < port_count:
            titles[index] = text
    fallback_index = 0
    for index in range(port_count):
        if titles[index] == "" and fallback_index < len(fallback):
            titles[index] = fallback[fallback_index]
            fallback_index += 1
    return titles


def _collect_frames(
    inputs: Mapping[str, torch.Tensor],
    output_size: str,
) -> tuple[list[Image.Image], list[int], torch.Tensor]:
    if not isinstance(inputs, Mapping) or not inputs:
        raise ValueError("至少需要输入一张图片")
    ordered = [inputs[name] for name in sorted(inputs, key=_order_key)]
    resized = [_resize_long_edge(batch, output_size) for batch in ordered]
    frames = _tensor_images(resized)
    frame_port: list[int] = []
    for port_index, batch in enumerate(ordered):
        frame_port.extend([port_index] * batch.shape[0])
    return frames, frame_port, resized[0]


def _compose_grid(
    images: list[Image.Image],
    *,
    layout: str,
    crop_mode: str,
    columns: int,
    spacing: int,
    background_color: str,
) -> Image.Image:
    mode = _LAYOUT_ALIASES.get(layout, layout)
    crop = _CROP_ALIASES.get(crop_mode, crop_mode)
    if mode not in {"horizontal", "vertical", "grid"}:
        raise ValueError(f"不支持的拼接方式：{layout}")
    if crop not in {"none", "standard", "left", "center", "right"}:
        raise ValueError(f"不支持的裁切方式：{crop_mode}")

    base_width, base_height = images[0].size
    if crop != "none":
        count = len(images)
        covered = [_cover(image, base_width, base_height) for image in images]
        background = _parse_color(background_color)
        column_count = (
            min(max(1, columns or math.ceil(math.sqrt(count))), count)
            if mode == "grid"
            else 0
        )
        if mode == "vertical" or column_count == 1:
            heights = _strip_sizes(base_height, count)
            canvas = Image.new(
                "RGB",
                (base_width + spacing * 2, base_height + spacing * (count + 1)),
                background,
            )
            top = spacing
            for index, image in enumerate(covered):
                piece = _vertical_crop(
                    image, heights[index], _strip_align(crop, index, count)
                )
                canvas.paste(piece, (spacing, top))
                top += heights[index] + spacing
        elif mode == "grid":
            rows = math.ceil(count / column_count)
            canvas = Image.new(
                "RGB",
                (
                    base_width + spacing * (column_count + 1),
                    base_height * rows + spacing * (rows + 1),
                ),
                background,
            )
            for row in range(rows):
                group = covered[row * column_count : (row + 1) * column_count]
                widths = _strip_sizes(base_width, len(group))
                left = spacing
                top = spacing + row * (base_height + spacing)
                for index, image in enumerate(group):
                    piece = _horizontal_crop(
                        image, widths[index], _strip_align(crop, index, len(group))
                    )
                    canvas.paste(piece, (left, top))
                    left += widths[index] + spacing
        else:
            widths = _strip_sizes(base_width, count)
            canvas = Image.new(
                "RGB",
                (base_width + spacing * (count + 1), base_height + spacing * 2),
                background,
            )
            left = spacing
            for index, image in enumerate(covered):
                piece = _horizontal_crop(
                    image, widths[index], _strip_align(crop, index, count)
                )
                canvas.paste(piece, (left, spacing))
                left += widths[index] + spacing
        return canvas
    if mode == "horizontal":
        prepared = [_resize_to_height(image, base_height) for image in images]
        cells = [(image.width, base_height) for image in prepared]
        grid_columns = len(images)
    elif mode == "vertical":
        prepared = [_resize_to_width(image, base_width) for image in images]
        cells = [(base_width, image.height) for image in prepared]
        grid_columns = 1
    else:
        prepared = [_fit_inside(image, base_width, base_height) for image in images]
        cells = [(base_width, base_height)] * len(images)
        grid_columns = columns or math.ceil(math.sqrt(len(images)))
        grid_columns = min(max(1, grid_columns), len(images))

    rows = math.ceil(len(images) / grid_columns)
    if mode == "horizontal":
        canvas_width = sum(width for width, _ in cells) + spacing * (len(images) + 1)
        canvas_height = base_height + spacing * 2
    elif mode == "vertical":
        canvas_width = base_width + spacing * 2
        canvas_height = sum(height for _, height in cells) + spacing * (len(images) + 1)
    else:
        canvas_width = base_width * grid_columns + spacing * (grid_columns + 1)
        canvas_height = base_height * rows + spacing * (rows + 1)

    background = _parse_color(background_color)
    canvas = Image.new("RGB", (canvas_width, canvas_height), background)
    fill = _darken(background)
    for index, image in enumerate(prepared):
        row, column = divmod(index, grid_columns)
        if mode == "horizontal":
            x = spacing + sum(cells[item][0] + spacing for item in range(index))
            y = spacing
        elif mode == "vertical":
            x = spacing
            y = spacing + sum(cells[item][1] + spacing for item in range(index))
        else:
            cell_x = spacing + column * (base_width + spacing)
            cell_y = spacing + row * (base_height + spacing)
            canvas.paste(fill, (cell_x, cell_y, cell_x + base_width, cell_y + base_height))
            x = cell_x + (base_width - image.width) // 2
            y = cell_y + (base_height - image.height) // 2
        canvas.paste(image, (x, y))

    return canvas


def combine(
    images: Mapping[str, torch.Tensor],
    *,
    titles: str,
    title_bar_color: str,
    title_bar_opacity: int | str,
    title_position: str,
    title_bar_height: int | str,
    font_size: int,
    text_padding: int,
    text_color: str,
    text_align: str,
    output_size: str,
    layout: str,
    crop_mode: str,
    columns: int,
    spacing: int,
    background_color: str,
) -> torch.Tensor:
    frames, frame_port, reference = _collect_frames(images, output_size)

    port_titles = _parse_titles(titles, max(frame_port) + 1)
    labels = [port_titles[port] for port in frame_port]
    if any(labels):
        position = _TITLE_POSITION_ALIASES.get(title_position)
        if position is None:
            raise ValueError(f"不支持的标题位置：{title_position}")
        alignment = _TEXT_ALIGN_ALIASES.get(text_align)
        if alignment is None:
            raise ValueError(f"不支持的文字对齐：{text_align}")
        font = _load_font(font_size)
        bar_color = _parse_color(title_bar_color)
        foreground = _parse_color(text_color)
        opacity_percent = _percentage(title_bar_opacity)
        height_percent = _percentage(title_bar_height)
        bar_opacity = round(255 * opacity_percent / 100)
        frames = [
            (
                _add_title(
                    image,
                    labels[index],
                    bar_color=bar_color,
                    bar_opacity=bar_opacity,
                    bar_position=position,
                    bar_height=max(1, round(image.height * height_percent / 100)),
                    font=font,
                    text_color=foreground,
                    text_align=alignment,
                    text_padding=text_padding,
                )
                if labels[index]
                else image
            )
            for index, image in enumerate(frames)
        ]

    canvas = _compose_grid(
        frames,
        layout=layout,
        crop_mode=crop_mode,
        columns=columns,
        spacing=spacing,
        background_color=background_color,
    )
    output = np.asarray(canvas, dtype=np.float32) / 255.0
    return torch.from_numpy(output).unsqueeze(0).to(
        device=reference.device, dtype=reference.dtype
    )


class ImageGridTitle(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        template = io.Autogrow.TemplatePrefix(
            io.Image.Input("image"), prefix="image", min=1, max=50
        )
        return io.Schema(
            node_id="ImageGridTitle",
            display_name="Image Grid & Title",
            category="Zhi.AI/Image",
            description=(
                "Add per-image title bars, then combine the frames horizontally, "
                "vertically, or in a grid."
            ),
            inputs=[
                io.Autogrow.Input("images", template=template),
                io.String.Input("titles", default="image-01", multiline=True),
                io.Color.Input(
                    "title_bar_color", default=ZHIAI_ACCENT_COLOR, socketless=True
                ),
                io.Int.Input(
                    "title_bar_opacity",
                    default=60,
                    min=0,
                    max=100,
                    step=1,
                    extra_dict={"suffix": "%"},
                ),
                io.Combo.Input(
                    "title_position",
                    options=[
                        "outside_top",
                        "inside_top",
                        "middle",
                        "inside_bottom",
                        "outside_bottom",
                    ],
                    default="inside_bottom",
                ),
                io.Int.Input(
                    "title_bar_height",
                    default=10,
                    min=1,
                    max=100,
                    step=1,
                    extra_dict={"suffix": "%"},
                ),
                io.Int.Input("font_size", default=36, min=1, max=512, step=1),
                io.Int.Input("text_padding", default=4, min=0, max=1024, step=1),
                io.Color.Input("text_color", default="#FFFFFF", socketless=True),
                io.Combo.Input(
                    "text_align",
                    options=["left", "center", "right"],
                    default="center",
                ),
                io.Combo.Input(
                    "output_size",
                    options=["original", "1K", "2K", "4K"],
                    default="original",
                ),
                io.Combo.Input(
                    "layout",
                    options=["horizontal", "vertical", "grid"],
                    default="horizontal",
                ),
                io.Combo.Input(
                    "crop_mode",
                    options=["none", "standard", "left", "center", "right"],
                    default="none",
                ),
                io.Int.Input("columns", default=0, min=0, max=50, step=1),
                io.Int.Input("spacing", default=4, min=0, max=1024, step=1),
                io.Color.Input("background_color", default=ZHIAI_ACCENT_COLOR),
            ],
            outputs=[io.Image.Output(display_name="image")],
        )

    @classmethod
    def execute(cls, images: Mapping[str, torch.Tensor], **kwargs) -> io.NodeOutput:
        return io.NodeOutput(combine(images, **kwargs))