from __future__ import annotations

import json
import math

import comfy.sd
import comfy.utils
import folder_paths


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


def _row_names(value):
    names = []
    for row in _coerce_rows(value):
        if not isinstance(row, dict):
            continue
        names.append(str(row.get("name") or "").strip())
    return names


def _strength(value):
    try:
        strength = float(value)
    except (TypeError, ValueError):
        return 0.0
    return strength if math.isfinite(strength) else 0.0


def _entries(value):
    entries = []
    for row in _coerce_rows(value):
        if not isinstance(row, dict):
            continue
        name = str(row.get("name") or "").strip()
        if not row.get("enabled", True):
            continue
        strength = _strength(row.get("strength", 1.0))
        if strength == 0:
            continue
        entries.append((name, strength))
    return entries


def _trigger_words(value):
    words = []
    for row in _coerce_rows(value):
        if not isinstance(row, dict):
            continue
        if not row.get("enabled", True):
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
    DESCRIPTION = "Applies a reorderable stack of LoRAs to MODEL in row order: toggle a row with its checkbox, drag the handle to reorder, click the row name to swap models. Strength steps by 0.05 with the side arrows or accepts direct input (-10 to 10). The More panel holds trigger words and one-click copy, and lets you save the whole stack as a preset for later. Outputs the enabled rows' trigger words joined by commas."

    def __init__(self):
        self.loaded_lora = None
        self._names = frozenset()

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
            available = set(folder_paths.get_filename_list("loras"))
        except Exception:
            return True
        for name in names:
            if name not in available:
                return f"LoRA Stack Loader: LoRA not found: {name}"
        return True

    def load(self, model, lora_rows="[]"):
        triggers = _trigger_words(lora_rows)
        entries = _entries(lora_rows)
        names = frozenset(name for name, _ in entries)
        if not names:
            self.loaded_lora = None
            self._names = frozenset()
            return (model, triggers)

        stable = names == self._names
        if not stable:
            self.loaded_lora = None

        counts = {}
        for name, _ in entries:
            counts[name] = counts.get(name, 0) + 1
        repeated = {name for name, count in counts.items() if count > 1}
        shared = {}

        for name, strength in entries:
            path = folder_paths.get_full_path_or_raise("loras", name)
            lora = None
            metadata = None
            if stable and self.loaded_lora is not None and self.loaded_lora[0] == path:
                _, lora, metadata = self.loaded_lora
            elif path in shared:
                lora, metadata = shared[path]
                if stable:
                    self.loaded_lora = (path, lora, metadata)
            else:
                lora, metadata = comfy.utils.load_torch_file(path, safe_load=True, return_metadata=True)
                if name in repeated:
                    shared[path] = (lora, metadata)
                if stable:
                    self.loaded_lora = (path, lora, metadata)
            model, _ = comfy.sd.load_lora_for_models(
                model,
                None,
                lora,
                strength,
                strength,
                lora_metadata=metadata,
            )

        self._names = names
        return (model, triggers)
