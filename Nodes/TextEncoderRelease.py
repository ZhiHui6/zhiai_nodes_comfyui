import comfy.model_management as model_management


class TextEncoderRelease:
    CATEGORY = "Zhi.AI/Toolkit"
    DESCRIPTION = "Release the connected text encoder (CLIP) from VRAM before sampling. The CONDITIONING sockets are execution dependencies: they hold the node until encoding is done, so the encoder is unloaded only after the last text was encoded. MODEL is passed through unchanged."

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model": ("MODEL",),
                "clip": ("CLIP",),
                "enabled": ("BOOLEAN", {"default": True, "label_on": "ON", "label_off": "OFF"}),
                "verbose": ("BOOLEAN", {"default": True, "label_on": "ON", "label_off": "OFF"}),
            },
            "optional": {
                "conditioning": ("CONDITIONING",),
                "conditioning_2": ("CONDITIONING",),
                "conditioning_3": ("CONDITIONING",),
            }
        }

    RETURN_TYPES = ("MODEL",)
    RETURN_NAMES = ("model",)
    FUNCTION = "release"

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("nan")

    def release(self, model, clip, conditioning=None, conditioning_2=None, conditioning_3=None,
                enabled=True, verbose=True):
        if not enabled:
            return (model,)

        patcher = getattr(clip, "patcher", None)
        if patcher is None:
            if verbose:
                print("[TextEncoderRelease]所连 CLIP 没有 patcher，跳过释放 / CLIP has no patcher, skipped")
            return (model,)

        if not hasattr(model_management, "unload_model_and_clones"):
            if verbose:
                print("[TextEncoderRelease]当前 ComfyUI 没有 unload_model_and_clones 接口，跳过释放 / API unavailable, skipped")
            return (model,)

        model_management.unload_model_and_clones(patcher)
        model_management.soft_empty_cache()

        if verbose:
            print("[TextEncoderRelease]已卸载所连文本编码器并清空缓存 / text encoder released")
        return (model,)
