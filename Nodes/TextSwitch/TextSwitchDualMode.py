class TextSwitchDualMode:
    
    def __init__(self):
        self.text_cache = {"text1": "", "text2": ""}

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "inputcount": ("INT", {"default": 2, "min": 2, "max": 12, "step": 1}),
                "mode": (["manual", "auto"], {"default": "manual"}),
                "select_text": ([str(i) for i in range(2, 1024)], {"default": "2"}),
                "text1_comment": ("STRING", {"multiline": False, "default": ""}),
                "text2_comment": ("STRING", {"multiline": False, "default": ""}),
            },
            "optional": {
                "text1": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "text2": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("output_text",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Text"
    DESCRIPTION = "Switches among a variable number of text inputs, in manual index mode or auto mode that requires exactly one non-empty input."

    def execute(self, inputcount, mode, select_text, text1_comment="", text2_comment="",
                text1=None, text2=None, **kwargs):
        
        provided = {
            "text1": text1,
            "text2": text2,
        }

        texts = []
        max_supported = int(inputcount) if inputcount is not None else 2
        max_supported = max(1, max_supported)
        for i in range(1, max_supported + 1):
            key = f"text{i}"
            val = kwargs.get(key, provided.get(key, ""))
            texts.append(val if val is not None else "")
        
        self.text_cache["text1"] = texts[0] if len(texts) > 0 else ""
        self.text_cache["text2"] = texts[1] if len(texts) > 1 else ""
        
        if mode == "manual":
            idx = int(select_text) - 1
            if idx < 0 or idx >= len(texts):
                idx = 0
            
            selected_text = texts[idx]
            if selected_text is not None and selected_text.strip() != "":
                return (selected_text,)
            else:
                for text in texts:
                    if text is not None and text.strip() != "":
                        return (text,)
                return ("",)
        
        else:
            valid_inputs = []
            for i, text in enumerate(texts):
                if text is not None and text.strip() != "":
                    valid_inputs.append((i+1, text))
            
            connected_count = len(valid_inputs)
            
            if connected_count == 0:
                return ("",)
            elif connected_count >= 2:
                if connected_count == 2:
                    ports = f"text{valid_inputs[0][0]} and text{valid_inputs[1][0]}"
                elif connected_count == 3:
                    ports = f"text{valid_inputs[0][0]}, text{valid_inputs[1][0]}, text{valid_inputs[2][0]}"
                else:
                    ports = ", ".join([f"text{n}" for n, _ in valid_inputs])
                
                raise ValueError(
                    f"Auto mode error: Detected {ports} with simultaneous inputs.\n"
                    f"Solutions:\n"
                    f"1. Disable other upstream node outputs, keep only one text input\n"
                    f"2. Switch to manual mode and select the text to output\n"
                )
            
            return (valid_inputs[0][1],)