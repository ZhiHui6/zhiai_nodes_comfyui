from __future__ import annotations

import nodes as comfy_nodes
from comfy_execution.graph import ExecutionBlocker
from comfy_execution.graph_utils import is_link
from server import PromptServer

NODE_TYPE = "ImagePreviewCompare"

def select_preview_targets(request):
 
    prompt = request.get("prompt", {})
    previews = {node_id for node_id, node in prompt.items() if node.get("class_type") == NODE_TYPE}
    if not previews:
        return request
    referenced = {
        value[0]
        for node in prompt.values()
        for value in node.get("inputs", {}).values()
        if is_link(value)
    }
    passive = previews & referenced
    if not passive:
        return request
    targets = request.get("partial_execution_targets")
    if targets is None:
        targets = [
            node_id for node_id, node in prompt.items()
            if getattr(comfy_nodes.NODE_CLASS_MAPPINGS.get(node.get("class_type")), "OUTPUT_NODE", False) is True
        ]
    remaining = [node_id for node_id in targets if str(node_id) not in passive]
    if not remaining:
        return request
    request["partial_execution_targets"] = remaining
    return request

if PromptServer.instance is not None:
    PromptServer.instance.add_on_prompt_handler(select_preview_targets)

class ImagePreviewCompare:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "optional": {
                "auto_output": (
                    "BOOLEAN",
                    {"default": True, "label_on": "on", "label_off": "off"},
                ),
                "image_a": ("IMAGE",),
                "image_b": ("IMAGE",),
            },
            "hidden": {
                "prompt": "PROMPT",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    RETURN_TYPES = ("IMAGE", "IMAGE")
    RETURN_NAMES = ("image_a", "image_b")
    FUNCTION = "preview"
    OUTPUT_NODE = True
    CATEGORY = "Zhi.AI/Image"

    @staticmethod
    def _save_preview(saver, image, prefix):
        try:
            saved = saver.save_images(image, filename_prefix=prefix)
            return saved.get("ui", {}).get("images", [])
        except Exception:
            return []

    def preview(
        self,
        auto_output=True,
        image_a=None,
        image_b=None,
        prompt=None,
        extra_pnginfo=None,
    ):
        saver = comfy_nodes.PreviewImage()
        result = {
            "a_images": self._save_preview(saver, image_a, "zhiai_ImagePreviewCompare_A")
            if image_a is not None
            else [],
            "b_images": self._save_preview(saver, image_b, "zhiai_ImagePreviewCompare_B")
            if image_b is not None
            else [],
        }
        output_a = image_a if auto_output and image_a is not None else ExecutionBlocker(None)
        output_b = image_b if image_b is not None else ExecutionBlocker(None)
        return {"ui": result, "result": (output_a, output_b)}