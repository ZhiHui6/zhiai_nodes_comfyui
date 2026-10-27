from __future__ import annotations

import json
import os
import re
import tempfile
from datetime import datetime, timezone

from aiohttp import web
from server import PromptServer

PACK_DIR = os.path.dirname(os.path.abspath(__file__))
PRESET_PATH = os.path.join(PACK_DIR, "config", "lora_presets.json")
STRENGTH_LIMIT = 10.0
NAME_LIMIT = 80
ROWS_LIMIT = 200
ID_PATTERN = re.compile(r"^p_[0-9]{14}_[0-9a-f]{4}$")


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _new_id():
    return "p_%s_%04x" % (datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S"), os.urandom(2)[0])


def _strength(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 1.0
    if number != number or number in (float("inf"), float("-inf")):
        return 1.0
    return max(-STRENGTH_LIMIT, min(STRENGTH_LIMIT, number))


def _clean_rows(value):
    if not isinstance(value, list):
        raise ValueError("rows must be an array")
    if len(value) > ROWS_LIMIT:
        raise ValueError("rows exceeds the limit of %d" % ROWS_LIMIT)
    rows = []
    for item in value:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        if not name:
            continue
        trigger_words = item.get("trigger_words")
        rows.append({
            "name": name,
            "enabled": bool(item.get("enabled", True)),
            "strength": _strength(item.get("strength", 1.0)),
            "trigger_words": trigger_words.strip() if isinstance(trigger_words, str) else "",
        })
    return rows


def _clean_name(value):
    name = str(value or "").strip()
    if not name:
        raise ValueError("name is required")
    if len(name) > NAME_LIMIT:
        raise ValueError("name is too long")
    return name


def _load_store():
    try:
        with open(PRESET_PATH, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError):
        data = None
    presets = data.get("presets") if isinstance(data, dict) else None
    if not isinstance(presets, list):
        presets = []
    cleaned = []
    for entry in presets:
        if not isinstance(entry, dict):
            continue
        preset_id = str(entry.get("id") or "").strip()
        try:
            name = _clean_name(entry.get("name"))
            rows = _clean_rows(entry.get("rows"))
        except ValueError:
            continue
        cleaned.append({
            "id": preset_id or _new_id(),
            "name": name,
            "created_at": str(entry.get("created_at") or _now()),
            "updated_at": str(entry.get("updated_at") or _now()),
            "rows": rows,
        })
    return {"version": 1, "presets": cleaned}


def _save_store(store):
    directory = os.path.dirname(PRESET_PATH)
    os.makedirs(directory, exist_ok=True)
    body = json.dumps(store, ensure_ascii=False, indent=2)
    handle, temp_path = tempfile.mkstemp(dir=directory, prefix=".lora_presets.", suffix=".tmp")
    try:
        with os.fdopen(handle, "w", encoding="utf-8") as stream:
            stream.write(body)
        os.replace(temp_path, PRESET_PATH)
    except OSError:
        try:
            os.remove(temp_path)
        except OSError:
            pass
        raise


def _find(store, preset_id):
    for entry in store["presets"]:
        if entry["id"] == preset_id:
            return entry
    return None


def _has_name(store, name, skip_id=None):
    for entry in store["presets"]:
        if entry["name"] == name and entry["id"] != skip_id:
            return True
    return False


def _payload(request, data, status=200):
    return web.json_response({"status": "ok", **data}, status=status)


def _error(message, status=400):
    return web.json_response({"status": "error", "message": message}, status=status)


async def _body(request):
    try:
        data = await request.json()
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


@PromptServer.instance.routes.get("/zhiai_nodes/lora_presets")
async def list_presets(request):
    store = _load_store()
    return _payload(request, {"presets": store["presets"]})


@PromptServer.instance.routes.post("/zhiai_nodes/lora_presets")
async def save_preset(request):
    data = await _body(request)
    if data is None:
        return _error("Invalid JSON body")
    try:
        name = _clean_name(data.get("name"))
        rows = _clean_rows(data.get("rows"))
    except ValueError as exc:
        return _error(str(exc))
    store = _load_store()
    preset_id = str(data.get("id") or "").strip()
    if preset_id and not ID_PATTERN.match(preset_id):
        return _error("Unknown preset id", status=404)
    if _has_name(store, name, skip_id=preset_id or None):
        return _error("A preset with this name already exists", status=409)
    if preset_id:
        entry = _find(store, preset_id)
        if entry is None:
            return _error("Preset not found", status=404)
        entry.update({"name": name, "rows": rows, "updated_at": _now()})
    else:
        entry = {
            "id": _new_id(),
            "name": name,
            "created_at": _now(),
            "updated_at": _now(),
            "rows": rows,
        }
        store["presets"].append(entry)
    _save_store(store)
    return _payload(request, {"preset": entry, "presets": store["presets"]})


@PromptServer.instance.routes.post("/zhiai_nodes/lora_presets/rename")
async def rename_preset(request):
    data = await _body(request)
    if data is None:
        return _error("Invalid JSON body")
    preset_id = str(data.get("id") or "").strip()
    if not preset_id:
        return _error("id is required")
    try:
        name = _clean_name(data.get("name"))
    except ValueError as exc:
        return _error(str(exc))
    store = _load_store()
    entry = _find(store, preset_id)
    if entry is None:
        return _error("Preset not found", status=404)
    if entry["name"] != name and _has_name(store, name, skip_id=preset_id):
        return _error("A preset with this name already exists", status=409)
    entry["name"] = name
    entry["updated_at"] = _now()
    _save_store(store)
    return _payload(request, {"preset": entry, "presets": store["presets"]})


@PromptServer.instance.routes.delete("/zhiai_nodes/lora_presets")
async def delete_preset(request):
    preset_id = str(request.rel_url.query.get("id") or "").strip()
    if not preset_id:
        return _error("id is required")
    store = _load_store()
    entry = _find(store, preset_id)
    if entry is None:
        return _error("Preset not found", status=404)
    store["presets"].remove(entry)
    _save_store(store)
    return _payload(request, {"presets": store["presets"]})
