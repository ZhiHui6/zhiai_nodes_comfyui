from __future__ import annotations

import json
import logging
import math

import comfy.sd
import comfy.utils
import folder_paths

logger = logging.getLogger(__name__)


def _coerce_rows(value):
    if isinstance(value, dict):
        value = value.get("__value__", value)
    if isinstance(value, list):
        return value
    text = str(value or "").strip()
    if not text:
        return []
    try:
        rows = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError("LoRA Stack Loader: lora_rows is not valid JSON.") from exc
    if isinstance(rows, dict):
        rows = rows.get("__value__", rows)
    if not isinstance(rows, list):
        raise ValueError("LoRA Stack Loader: lora_rows must be a JSON array.")
    return rows


def _is_enabled(row):
    value = row.get("enabled", True)
    if isinstance(value, str):
        return value.strip().lower() not in ("", "0", "false", "no", "off")
    return bool(value)


def _row_names(value):
    """Names that will actually be applied.

    Disabled rows and rows with a zero strength are skipped, so a stale row
    never blocks queueing or gets counted as an active LoRA.
    """
    return [name for name, _ in _entries(value)]


def _strength(value):
    try:
        strength = float(value)
    except (TypeError, ValueError):
        return 0.0
    return strength if math.isfinite(strength) else 0.0


def _entries(value):
    entries = []
    seen = {}
    for row in _coerce_rows(value):
        if not isinstance(row, dict):
            continue
        name = str(row.get("name") or "").strip()
        if not name or not _is_enabled(row):
            continue
        strength = _strength(row.get("strength", 1.0))
        if strength == 0:
            continue
        if name in seen:
            previous = entries[seen[name]]
            logger.warning(
                "LoRA Stack Loader: duplicate row %r (strength %s -> %s); "
                "keeping the last occurrence so the LoRA is applied once.",
                name,
                previous[1],
                strength,
            )
            entries[seen[name]] = (name, strength)
            continue
        seen[name] = len(entries)
        entries.append((name, strength))
    return entries


def _trigger_words(value):
    words = []
    for row in _coerce_rows(value):
        if not isinstance(row, dict):
            continue
        if not _is_enabled(row):
            continue
        if _strength(row.get("strength", 1.0)) == 0:
            continue
        text = str(row.get("trigger_words") or "").strip()
        if text:
            words.append(text)
    return ", ".join(words)


class LoraStackLoader:
    CATEGORY = "Zhi.AI/Loaders"
    FUNCTION = "load"
    RETURN_TYPES = ("MODEL", "STRING")
    RETURN_NAMES = ("model", "trigger_words")
    DESCRIPTION = "Applies a reorderable stack of LoRAs to MODEL in row order: toggle a row with its checkbox, drag the handle to reorder, click a row to select it, and swap models from the row's More panel. Strength steps by 0.05 with the side arrows or accepts direct input (-50 to 50 by default, adjustable in the node's Settings). When batch add is enabled in Settings, the Add LoRA panel can check several models and load them at once, skipping entries already in the list. The More panel holds trigger words and one-click copy, and lets you save the whole stack as a preset for later. Outputs the enabled rows' trigger words joined by commas."

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model": ("MODEL",),
                "lora_rows": ("STRING", {"default": "[]"}),
            },
        }

    @classmethod
    def VALIDATE_INPUTS(cls, lora_rows="[]", **_kwargs):
        try:
            names = _row_names(lora_rows)
        except ValueError as exc:
            return str(exc)
        try:
            available = {
                name.replace("\\", "/")
                for name in folder_paths.get_filename_list("loras")
            }
        except Exception:
            return True
        for name in names:
            if name.replace("\\", "/") not in available:
                return f"LoRA Stack Loader: LoRA not found: {name}"
        return True

    def load(self, model, lora_rows="[]"):
        triggers = _trigger_words(lora_rows)
        entries = _entries(lora_rows)
        if not entries:
            return (model, triggers)

        # Load fresh every execution instead of caching the state dict on the
        # node instance. A cached dict can outlive the file on disk (updated or
        # replaced LoRA) and silently keep applying stale weights, which shows
        # up as persistent style/texture contamination. Only rows in this run
        # share a state dict, so duplicate rows are still read once.
        shared = {}

        for name, strength in entries:
            path = folder_paths.get_full_path_or_raise("loras", name)
            lora = shared.get(path)
            if lora is None:
                lora = comfy.utils.load_torch_file(path, safe_load=True)
                shared[path] = lora
            logger.info(
                "LoRA Stack Loader: applying %s (strength %.3f) from %s",
                name,
                strength,
                path,
            )
            model, _ = comfy.sd.load_lora_for_models(model, None, lora, strength, 0)

        return (model, triggers)
