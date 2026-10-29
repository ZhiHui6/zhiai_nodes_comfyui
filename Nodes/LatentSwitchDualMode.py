class LatentSwitchDualMode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "inputcount": ("INT", {"default": 2, "min": 2, "max": 12, "step": 1}),
                "mode": (["manual", "auto"], {"default": "auto"}),
                "select_latent": ([str(i) for i in range(1, 1024)], {"default": "1"}),
                "latent1_note": ("STRING", {"multiline": False, "default": ""}),
                "latent2_note": ("STRING", {"multiline": False, "default": ""}),
            },
            "optional": {
                "latent1": ("LATENT", {}),
                "latent2": ("LATENT", {}),
            },
        }

    RETURN_TYPES = ("LATENT",)
    RETURN_NAMES = ("output_latent",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Latent"
    DESCRIPTION = "Switches among a variable number of latent inputs, in manual index mode or auto mode that requires exactly one non-empty input."

    def execute(
        self,
        mode,
        select_latent,
        inputcount,
        latent1=None,
        latent2=None,
        latent1_note="",
        latent2_note="",
        **kwargs,
    ):
        count = int(inputcount) if inputcount is not None else 2
        count = max(1, count)
        latents = []
        for i in range(1, count + 1):
            key = f"latent{i}"
            latents.append(kwargs.get(key, locals().get(key, None)))

        if mode == "manual":
            idx = int(select_latent) - 1
            if idx < 0 or idx >= len(latents):
                idx = 0
            selected = latents[idx]
            if selected is not None:
                return (selected,)
            for lt in latents:
                if lt is not None:
                    return (lt,)
            return (None,)

        valid = [(i + 1, lt) for i, lt in enumerate(latents) if lt is not None]
        if len(valid) == 0:
            return (None,)
        if len(valid) >= 2:
            if len(valid) == 2:
                ports = f"latent{valid[0][0]} and latent{valid[1][0]}"
            elif len(valid) == 3:
                ports = f"latent{valid[0][0]}, latent{valid[1][0]}, latent{valid[2][0]}"
            else:
                ports = ", ".join([f"latent{n}" for n, _ in valid])
            raise ValueError(
                f"Auto mode error: Detected {ports} with simultaneous inputs.\n"
                f"Solutions:\n"
                f"1. Disable other upstream node outputs, keep only one latent input\n"
                f"2. Switch to manual mode and select the latent to output\n"
            )
        return (valid[0][1],)
