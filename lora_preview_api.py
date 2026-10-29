from __future__ import annotations

import os

from aiohttp import web
from server import PromptServer

# 浏览器可直接渲染的预览文件扩展名
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".avif"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v", ".ogv"}
MIME_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".avif": "image/avif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".m4v": "video/mp4",
    ".ogv": "video/ogg",
}


def _is_within(base: str, target: str) -> bool:
    try:
        base_real = os.path.realpath(base)
        target_real = os.path.realpath(target)
        return os.path.commonpath([base_real, target_real]) == base_real
    except (OSError, ValueError):
        return False


def _resolve_lora(name: str, index):
    """把 LoRA 名称解析成 models/loras 下的绝对路径。"""
    import folder_paths  # 延迟导入，避免在非 ComfyUI 环境下失败

    folders = folder_paths.get_folder_paths("loras")
    if not folders:
        return None
    try:
        idx = int(index)
    except (TypeError, ValueError):
        idx = 0
    if idx < 0 or idx >= len(folders):
        return None
    folder = folders[idx]
    if not os.path.isdir(folder):
        return None
    full = os.path.normpath(os.path.join(folder, name))
    if not _is_within(folder, full) or not os.path.isfile(full):
        return None
    return folder, full


def _find_preview(full_path: str):
    """查找与模型同名的预览文件（支持 .preview 后缀与视频预览）。

    这里用目录遍历而不是 glob，因为文件名里可能带 [] 等 glob 通配符，
    直接 glob 会匹配失败。
    """
    directory = os.path.dirname(full_path)
    stem = os.path.splitext(os.path.basename(full_path))[0]
    try:
        entries = os.listdir(directory)
    except OSError:
        return None

    exact = []
    suffixed = []
    for entry in entries:
        ext = os.path.splitext(entry)[1].lower()
        if ext not in MIME_TYPES:
            continue
        entry_stem = os.path.splitext(entry)[0]
        if entry_stem == stem:
            exact.append(entry)
        elif entry_stem == stem + ".preview":
            suffixed.append(entry)

    candidates = exact or suffixed
    if not candidates:
        return None
    candidates.sort(key=lambda item: (0 if os.path.splitext(item)[1].lower() in IMAGE_EXTS else 1, item.lower()))
    return os.path.join(directory, candidates[0])


@PromptServer.instance.routes.get("/zhiai_nodes/lora_preview")
async def get_lora_preview(request):
    name = str(request.rel_url.query.get("name") or "").strip()
    if not name:
        return web.Response(status=400)

    resolved = _resolve_lora(name, request.rel_url.query.get("index"))
    if resolved is None:
        return web.Response(status=404)
    folder, full_path = resolved

    preview = _find_preview(full_path)
    if preview is None or not os.path.isfile(preview) or not _is_within(folder, preview):
        return web.Response(status=404)

    ext = os.path.splitext(preview)[1].lower()
    return web.FileResponse(preview, headers={
        "Content-Type": MIME_TYPES[ext],
        "Cache-Control": "private, max-age=600",
    })
