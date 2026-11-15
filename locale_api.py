import hashlib
import json
import os
import re
from aiohttp import web
from server import PromptServer

PACK_DIR = os.path.dirname(os.path.abspath(__file__))
LOCALE_DIR = os.path.join(PACK_DIR, "locales")
LANGUAGE_PATTERN = re.compile(r"^[a-z]{2}$")
LOCALE_FILES = frozenset({"nodes", "values"})


def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return None
    return data if isinstance(data, dict) else None


def input_labels(entry):
    """官方词条 inputs.<端口名>.name 提取为 {端口名: 显示文本}"""
    labels = {}
    for name, slot in (entry.get("inputs") or {}).items():
        text = slot.get("name") if isinstance(slot, dict) else slot
        if isinstance(name, str) and isinstance(text, str) and text:
            labels[name] = text
    return labels


def build_node_dict(language):
    """运行时词典 = 官方词条 + 本插件片段。

    标题/简介/输入标签取自 locales/<lang>/nodeDefs.json（节点库与画布共用同一份文案，
    不再各存一份）；输出端口名与下拉选项值官方 schema 无对应字段，留在
    locales/<lang>/zhiai_extra.json。zhiai_ 前缀用于避开 ComfyUI 核心的保留文件名。
    """
    official = load_json(os.path.join(LOCALE_DIR, language, "nodeDefs.json"))
    extra = load_json(os.path.join(LOCALE_DIR, language, "zhiai_extra.json"))
    if official is None and extra is None:
        return None

    nodes = {}
    for class_name, entry in (official or {}).items():
        if not isinstance(entry, dict):
            continue
        record = {}
        title = entry.get("display_name")
        if isinstance(title, str) and title:
            record["title"] = title
        description = entry.get("description")
        if isinstance(description, str) and description:
            record["description"] = description
        labels = input_labels(entry)
        if labels:
            record["inputs"] = labels
        if record:
            nodes[class_name] = record

    for class_name, entry in (extra or {}).items():
        if not isinstance(entry, dict):
            continue
        record = nodes.setdefault(class_name, {})
        for key in ("outputs", "options", "placeholders"):
            value = entry.get(key)
            if isinstance(value, dict) and value:
                record[key] = value
    return nodes


@PromptServer.instance.routes.get("/zhiai_nodes/locale/{language}/{name}")
async def get_locale_file(request):
    language = request.match_info.get("language", "")
    name = request.match_info.get("name", "")
    if name.endswith(".json"):
        name = name[:-5]
    if not LANGUAGE_PATTERN.match(language) or name not in LOCALE_FILES:
        return web.json_response({"status": "error", "message": "Unknown locale file"}, status=404)

    if name == "values":
        path = os.path.normpath(os.path.join(LOCALE_DIR, language, "zhiai_values.json"))
        if not os.path.isfile(path):
            return web.json_response({"status": "error", "message": "Locale file not found"}, status=404)
        return web.FileResponse(path)

    nodes = build_node_dict(language)
    if nodes is None:
        return web.json_response({"status": "error", "message": "Locale file not found"}, status=404)

    body = json.dumps(nodes, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    etag = '"%s"' % hashlib.md5(body).hexdigest()
    if request.headers.get("If-None-Match") == etag:
        return web.Response(status=304, headers={"ETag": etag})
    return web.Response(
        body=body,
        content_type="application/json",
        charset="utf-8",
        headers={"ETag": etag, "Cache-Control": "no-cache"},
    )
