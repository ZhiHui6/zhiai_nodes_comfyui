class PromptCombiner:
    CATEGORY = "Zhi.AI/Text"
    OUTPUT_NODE = True

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "enable_prompt1": ("BOOLEAN", {"default": True, "tooltip": "Enable/disable prompt 1. Disabled prompts are skipped in the combined output."}),
                "prompt1": ("STRING", {"default": "", "multiline": True}),
                "enable_prompt2": ("BOOLEAN", {"default": True, "tooltip": "Enable/disable prompt 2. Disabled prompts are skipped in the combined output."}),
                "prompt2": ("STRING", {"default": "", "multiline": True}),
            },
            "optional": {
                "trigger_words": ("STRING", {"forceInput": True, "tooltip": "Optional trigger words (e.g. from the LoRA Stack Loader's trigger_words output). When connected, they are placed at the front of the combined prompt."}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "execute"
    DESCRIPTION = "Combines two prompts with a built-in English comma, optionally prepending trigger words (e.g. from the LoRA Stack Loader). Comments are edited via the node-top button and shown as hover tips on the inputs."

    @staticmethod
    def _clean_segment(text: str) -> str:
        # 去除首尾空白及边缘多余逗号，避免输出 ",,"
        return (text or "").strip().strip(",").strip()

    def execute(
        self,
        prompt1: str = "",
        prompt2: str = "",
        enable_prompt1: bool = True,
        enable_prompt2: bool = True,
        trigger_words: str = "",
    ) -> tuple:
        segments = []

        trigger = self._clean_segment(trigger_words)
        if trigger:
            segments.append(trigger)

        if enable_prompt1:
            seg1 = self._clean_segment(prompt1)
            if seg1:
                segments.append(seg1)

        if enable_prompt2:
            seg2 = self._clean_segment(prompt2)
            if seg2:
                segments.append(seg2)

        return (",".join(segments),)
