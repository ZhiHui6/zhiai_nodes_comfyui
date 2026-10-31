from __future__ import annotations

import nodes as comfy_nodes
from comfy_execution.graph import ExecutionBlocker
from comfy_execution.graph_utils import is_link
from server import PromptServer

NODE_TYPE = "ImagePreviewCompare"


def select_preview_targets(request):
    """被下游引用的预览节点是依赖，不是独立的执行根。

    预览节点接入懒求值分支（如「是否判断」的真时/假时）时，未被选中的分支
    不会去求值上游；若此时节点仍作为 OUTPUT_NODE 执行，就会在分支未命中时
    也刷新预览。这里把它从执行目标中剔除，只在被下游真正拉取时才执行。
    """
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
    # 极端情况下剔除后会一个输出节点都不剩，保留原请求避免 prompt_no_outputs。
    if not remaining:
        return request
    request["partial_execution_targets"] = remaining
    return request


if PromptServer.instance is not None:
    PromptServer.instance.add_on_prompt_handler(select_preview_targets)


class ImagePreviewCompare:
    """A/B 对比预览：并排显示两路图像，A 分支可自动输出。"""

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
        # 与 NO8D-A/B 一致：自动输出开关只控制 A 分支，B 分支始终直通。
        output_a = image_a if auto_output and image_a is not None else ExecutionBlocker(None)
        output_b = image_b if image_b is not None else ExecutionBlocker(None)
        return {"ui": result, "result": (output_a, output_b)}


NODE_CLASS_MAPPINGS = {"ImagePreviewCompare": ImagePreviewCompare}
NODE_DISPLAY_NAME_MAPPINGS = {"ImagePreviewCompare": "Image Preview / Compare"}
