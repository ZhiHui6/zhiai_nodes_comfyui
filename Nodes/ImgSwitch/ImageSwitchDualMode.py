class ImageSwitchDualMode:
    
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "inputcount": ("INT", {"default": 2, "min": 2, "max": 12, "step": 1}),
                "mode": (["manual", "auto"], {"default": "auto"}),
                "select_image": ([str(i) for i in range(1, 1024)], {"default": "1"}),
                "image1_note": ("STRING", {"multiline": False, "default": ""}),
                "image2_note": ("STRING", {"multiline": False, "default": ""}),
            },
            "optional": {
                "image1": ("IMAGE", {}),
                "image2": ("IMAGE", {}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("output_image",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Image"
    DESCRIPTION = "Switches among a variable number of image inputs, in manual index mode or auto mode that requires exactly one non-empty input."

    def execute(self, mode, select_image, inputcount, image1=None, image2=None, image1_note="", image2_note="", **kwargs):

        count = int(inputcount) if inputcount is not None else 2
        count = max(1, count)
        images = []
        for i in range(1, count + 1):
            key = f"image{i}"
            images.append(kwargs.get(key, locals().get(key, None)))

        if mode == "manual":
            idx = int(select_image) - 1
            if idx < 0 or idx >= len(images):
                idx = 0
            selected = images[idx]
            if selected is not None:
                return (selected,)
            for img in images:
                if img is not None:
                    return (img,)
            return (None,)

        valid = [(i + 1, img) for i, img in enumerate(images) if img is not None]
        if len(valid) == 0:
            return (None,)
        if len(valid) >= 2:
            if len(valid) == 2:
                ports = f"image{valid[0][0]} and image{valid[1][0]}"
            elif len(valid) == 3:
                ports = f"image{valid[0][0]}, image{valid[1][0]}, image{valid[2][0]}"
            else:
                ports = ", ".join([f"image{n}" for n, _ in valid])
            raise ValueError(
                f"Auto mode error: Detected {ports} with simultaneous inputs.\n"
                f"Solutions:\n"
                f"1. Disable other upstream node outputs, keep only one image input\n"
                f"2. Switch to manual mode and select the image to output\n"
            )
        return (valid[0][1],)
