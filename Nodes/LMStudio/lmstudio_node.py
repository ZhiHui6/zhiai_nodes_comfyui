import base64
import json
import urllib.request
import urllib.error
import os
import threading
import time
from io import BytesIO
import numpy as np
from PIL import Image
import requests  # pyright: ignore[reportMissingModuleSource]  # requests 为 ComfyUI 运行时依赖

CONFIG_DIR = os.path.dirname(__file__)
CONFIG_FILE = os.path.join(CONFIG_DIR, "lmstudio_config.json")
PROMPT_PRESETS_FILE = os.path.join(CONFIG_DIR, "lmstudio_prompt_presets.json")
# 提示词预设仅一套，键名为 default
PROMPT_PRESETS_KEY = "default"
NO_MODELS_FOUND = "(no models found)"

# 推理日志文案：运行时同时生成中英两版，由前端按界面语言选择
LOG_TEXT = {
    "zh": {
        "model": "🤖 模型: {value}",
        "batchMode": "📦 批处理模式: 启用",
        "imageCount": "🖼️ 图片数量: {value}",
        "processed": "✅ 成功处理: {value}",
        "failed": "❌ 失败数量: {value}",
        "duration": "⏱️ 耗时: {value:.2f}秒",
        "statusDone": "✨ 状态: 推理完成",
        "statusFailed": "⚠️ 状态: 推理失败",
        "error": "❗ 错误信息: {value}",
    },
    "en": {
        "model": "🤖 Model: {value}",
        "batchMode": "📦 Batch mode: enabled",
        "imageCount": "🖼️ Images: {value}",
        "processed": "✅ Processed: {value}",
        "failed": "❌ Failed: {value}",
        "duration": "⏱️ Duration: {value:.2f}s",
        "statusDone": "✨ Status: completed",
        "statusFailed": "⚠️ Status: failed",
        "error": "❗ Error: {value}",
    },
}

# 日志中会出现的固定错误提示（中英两版）
LOG_ERROR_TEXT = {
    "subfolderNotFound": {"zh": "未找到子文件夹", "en": "No subfolders found"},
    "imageNotFound": {"zh": "未找到图片文件", "en": "No image files found"},
    "noImagesInBatch": {"zh": "批处理模式下未提供图片", "en": "No images provided in batch mode"},
}

def _load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _save_config(config):
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False

def _get_timeout(key, default):
    config = _load_config()
    return config.get("timeouts", {}).get(key, default)

def _get_folder_read_mode():
    config = _load_config()
    return config.get("folder_read_mode", "recursive")

def _save_batch_progress(progress_data):
    config = _load_config()
    config["batch_progress"] = progress_data
    _save_config(config)

def _get_batch_progress():
    config = _load_config()
    return config.get("batch_progress", {
        "current_folder": "",
        "processed_folders": [],
        "total_folders": 0,
        "current_folder_index": 0
    })

def _load_prompt_presets():
    """加载提示词预设（仅一套，键名 default）。"""
    if not os.path.exists(PROMPT_PRESETS_FILE):
        return {}
    try:
        with open(PROMPT_PRESETS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}

LMSTUDIO_PROMPT_PRESETS = _load_prompt_presets()

def _get_prompt_presets(config):
    """取当前生效的预设集合；键名缺失时回退到 default（兼容旧的 new 写法）。"""
    version = config.get("prompt_version", PROMPT_PRESETS_KEY)
    presets = LMSTUDIO_PROMPT_PRESETS.get(version)
    if isinstance(presets, dict) and presets:
        return presets
    return LMSTUDIO_PROMPT_PRESETS.get(PROMPT_PRESETS_KEY, {})

def _normalise_base(endpoint: str) -> str:
    base = endpoint.rstrip("/")
    if base.endswith("/v1"):
        base = base[:-3]
    return base

def _check_server_connection(endpoint: str) -> tuple[bool, str | None]:
    """检查LM Studio服务器连接状态，返回 (是否成功, 错误信息)"""
    base = _normalise_base(endpoint)
    timeout = _get_timeout("fetch_models", 5)
    
    try:
        req = urllib.request.Request(
            f"{base}/v1/models", headers={"Accept": "application/json"}, method="GET"
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                return True, None
    except urllib.error.URLError as e:
        error_msg = str(e.reason) if hasattr(e, 'reason') else str(e)
        if "Connection refused" in error_msg or "拒绝连接" in error_msg:
            return False, f"无法连接到LM Studio服务器 ({endpoint})。请检查：\n1. LM Studio是否已启动\n2. Local Server是否已开启\n3. 端口号是否正确"
        elif "timed out" in error_msg.lower() or "超时" in error_msg:
            return False, f"连接LM Studio服务器超时 ({endpoint})。请检查服务器是否响应"
        else:
            return False, f"连接服务器失败: {error_msg}"
    except Exception as e:
        return False, f"连接服务器时发生错误: {str(e)}"
    
    try:
        req = urllib.request.Request(
            f"{base}/api/v1/models", headers={"Accept": "application/json"}, method="GET"
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                return True, None
    except Exception as e:
        pass
    
    return False, f"无法连接到LM Studio服务器 ({endpoint})。请确认服务器已启动并启用了API服务"

def _check_model_available(endpoint: str, model: str) -> tuple[bool, str | None]:
    """检查指定模型是否可用，返回 (是否成功, 错误信息)"""
    if not model or model == NO_MODELS_FOUND or model == "未找到模型":
        return False, "未选择有效的模型。请先在节点设置中刷新模型列表并选择一个模型"

    models = _maybe_refresh(endpoint, blocking=True)

    if not is_discovery_ok():
        return True, None

    if model not in models:
        available_models = ", ".join(models[:5]) if models else "无"
        return False, f"模型 '{model}' 不在可用模型列表中。\n当前可用模型: {available_models}{'...' if len(models) > 5 else ''}"

    return True, None

def _fetch_models_with_status(endpoint: str) -> tuple[list[str], bool]:
    base = _normalise_base(endpoint)
    timeout = _get_timeout("fetch_models", 5)

    try:
        req = urllib.request.Request(
            f"{base}/v1/models", headers={"Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
            if "data" in data:
                ids = [m.get("id", "") for m in data.get("data", []) if m.get("id")]
                if ids:
                    return ids, True
    except urllib.error.URLError as e:
        print(f"[LMStudio] OpenAI endpoint /v1/models connection failed: {e.reason}")
    except Exception as e:
        print(f"[LMStudio] OpenAI endpoint /v1/models error: {e}")

    try:
        req = urllib.request.Request(
            f"{base}/api/v1/models", headers={"Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
            if "models" in data:
                keys = [
                    m.get("key", "") for m in data.get("models", []) if m.get("key")
                ]
                if keys:
                    return keys, True
    except urllib.error.URLError as e:
        print(f"[LMStudio] Native API /api/v1/models connection failed: {e.reason}")
    except Exception as e:
        print(f"[LMStudio] Native API /api/v1/models error: {e}")

    print(f"[LMStudio] Could not fetch models from {base}. Make sure LM Studio server is running.")
    return [NO_MODELS_FOUND], False


_cached_endpoint: str = ""
_cached_models: list[str] = [NO_MODELS_FOUND]
_last_refresh_time: float = 0.0
_last_refresh_ok: bool = False
_refresh_interval: float = 5.0
_failure_backoff: float = 30.0
_refresh_lock = threading.Lock()
_refresh_thread = None


def is_discovery_ok() -> bool:
    """上次模型发现是否成功"""
    return _last_refresh_ok


def refresh_models_now(endpoint: str) -> list[str]:
    """同步查询 LM Studio 并更新模型缓存（阻塞）。不要在事件循环线程中调用。"""
    global _cached_endpoint, _cached_models, _last_refresh_time, _last_refresh_ok
    models, ok = _fetch_models_with_status(endpoint)
    with _refresh_lock:
        _cached_endpoint = endpoint
        _cached_models = list(models)
        _last_refresh_ok = ok
        _last_refresh_time = time.time()
    return list(models)


def _refresh_models_in_background(endpoint: str) -> None:
    global _refresh_thread
    with _refresh_lock:
        if _refresh_thread is not None and _refresh_thread.is_alive():
            return
        _refresh_thread = threading.Thread(
            target=refresh_models_now,
            args=(endpoint,),
            name="lmstudio-model-refresh",
            daemon=True,
        )
    _refresh_thread.start()


def _maybe_refresh(endpoint: str, force: bool = False, blocking: bool = False) -> list[str]:
    """返回缓存的模型列表；需要刷新时在后台线程（或 blocking=True 时当前线程）执行

    发现成功后按 _refresh_interval 刷新，发现失败后按 _failure_backoff 退避，
    因此失败的发现不会在每次调用时都重试。
    """
    global _cached_endpoint, _last_refresh_time
    with _refresh_lock:
        endpoint_changed = endpoint != _cached_endpoint
        if endpoint_changed:
            _cached_endpoint = endpoint
        now = time.time()
        interval = _refresh_interval if _last_refresh_ok else _failure_backoff
        due = (
            force
            or endpoint_changed
            or _last_refresh_time == 0.0
            or (now - _last_refresh_time) > interval
        )
        if due:
            _last_refresh_time = now
        models = list(_cached_models)

    if due:
        if blocking:
            models = refresh_models_now(endpoint)
        else:
            _refresh_models_in_background(endpoint)
    return models

def _image_inputs(cls):
    inputs = {
        "image": (
            "IMAGE",
            {
                "tooltip": "Optional image (B,H,W,C float32). Requires a vision-capable model. "
                           "One socket is enough: a spare one appears after each image you connect.",
            },
        )
    }
    for index in range(2, cls.MAX_LINKED_IMAGES + 1):
        inputs[f"image_{index}"] = (
            "IMAGE",
            {"tooltip": f"Image {index} of the multi-image prompt (up to {cls.MAX_LINKED_IMAGES})."},
        )
    return inputs

class LMStudioNode:
    CATEGORY = "Zhi.AI/LM Studio"
    FUNCTION = "run"
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("result",)
    OUTPUT_NODE = True
    MAX_LINKED_IMAGES = 12
    DESCRIPTION = "Connect to local LM Studio server for image analysis and text generation. Supports multiple preset templates, output language control, and auto model discovery. Requires LM Studio software running with a vision-capable model loaded."

    @classmethod
    def _collect_images(cls, image, extra_slots):
        images = [] if image is None else [image]
        for index in range(2, cls.MAX_LINKED_IMAGES + 1):
            slot = extra_slots.get(f"image_{index}")
            if slot is not None:
                images.append(slot)
        return images

    @classmethod
    def INPUT_TYPES(cls):
        config = _load_config()
        endpoint = config.get("endpoint", "http://localhost:1234")
        models = list(_maybe_refresh(endpoint))
        presets = _get_prompt_presets(config)
        # 下拉只列出预设文件里的实际预设，不再提供「不使用预设」选项
        # （旧工作流若仍保存着 "Ignore"，run() 中的 Ignore 分支保持原语义）
        preset_keys = [key for key in presets.keys() if key != "Ignore"] or ["Ignore"]
        return {
            "required": {
                "use_preset": (
                    "BOOLEAN",
                    {
                        "default": True,
                        "tooltip": "Use the preset prompt group. Enabled: Preset Prompt / Length / Format / Output Language apply and the User & System Prompt fields are ignored. Disabled: the preset group is ignored and the User & System Prompt fields are used.",
                    },
                ),
                "preset_prompt": (
                    preset_keys,
                    {
                        "default": preset_keys[0],
                        "tooltip": "Select preset prompt template including tag generation, detailed description, creative analysis and more",
                    },
                ),
                "output_language": (
                    ["Chinese", "English", "Chinese&English"],
                    {
                        "default": "Chinese",
                        "tooltip": "Set output language: Chinese, English, or bilingual",
                    },
                ),
                "user_prompt": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": True,
                        "tooltip": "User message sent to the model. Any wired text_input is appended here.",
                    },
                ),
                "system_prompt": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": True,
                    },
                ),
                "prompt_length": (
                    ["Standard", "Short", "Medium", "Long"],
                    {
                        "default": "Standard",
                        "tooltip": "Output length preset. Standard keeps the preset's own length; Short/Medium/Long append a length constraint to the prompt (shown as 标准/短/中/长 in the panel).",
                    },
                ),
                "prompt_format": (
                    ["Structured JSON", "Tag", "Natural"],
                    {
                        "default": "Natural",
                        "tooltip": "Output format preset. Natural appends nothing (model default), Tag outputs comma-separated tags, Structured JSON outputs a JSON object (shown as 结构化Json/Tag标签/自然语言 in the panel).",
                    },
                ),
                "endpoint": (
                    "STRING",
                    {
                        "default": "http://localhost:1234",
                        "multiline": False,
                        "tooltip": "LM Studio server base URL. The model list is refreshed in the background.",
                    },
                ),
                "model": (
                    models,
                    {
                        "default": models[0],
                        "tooltip": "Available models, refreshed in the background. Click Refresh Models on the node to update immediately.",
                    },
                ),
                "size_limitation": (
                    "INT",
                    {
                        "default": 1024,
                        "min": 0,
                        "max": 2500,
                        "step": 1,
                        "tooltip": "Image size limitation (long edge), 0 means no limit",
                    },
                ),
                "max_tokens": (
                    "INT",
                    {
                        "default": 4096,
                        "min": 1,
                        "max": 32769,
                        "step": 1,
                        "tooltip": "Maximum tokens to generate. 4096 recommended for detailed image descriptions",
                    },
                ),
                "temperature": (
                    "FLOAT",
                    {
                        "default": 0.4,
                        "min": 0.0,
                        "max": 2.0,
                        "step": 0.1,
                        "tooltip": "Sampling temperature. 0.4 balances accuracy and natural expression for vision tasks",
                    },
                ),
                "top_p": (
                    "FLOAT",
                    {
                        "default": 0.9,
                        "min": 0.0,
                        "max": 1.0,
                        "step": 0.1,
                        "tooltip": "Nucleus sampling. 0.9 is optimal for filtering low-quality tokens while preserving diversity",
                    },
                ),
                "top_k": (
                    "INT",
                    {
                        "default": 40,
                        "min": 0,
                        "max": 1000,
                        "step": 1,
                        "tooltip": "Top-k sampling. 40 is the classic value for optimal quality-diversity balance",
                    },
                ),
                "repetition_penalty": (
                    "FLOAT",
                    {
                        "default": 1.1,
                        "min": 0.1,
                        "max": 2.0,
                        "step": 0.1,
                        "tooltip": "Repetition penalty. 1.1 effectively reduces redundancy without over-penalizing",
                    },
                ),
                "presence_penalty": (
                    "FLOAT",
                    {
                        "default": 0.0,
                        "min": -2.0,
                        "max": 2.0,
                        "step": 0.1,
                        "tooltip": "Presence penalty. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics",
                    },
                ),
                "seed": (
                    "INT",
                    {
                        "default": 0,
                        "min": 0,
                        "max": 0xFFFFFFFFFFFFFFFF,
                        "tooltip": "Random seed for reproducible outputs. 0 means random seed",
                    },
                ),
                "remove_think_tags": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "When enabled, removes the </think> tag and all content before it from the output text, keeping only the clean description.",
                    },
                ),
                "unload_model": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Unload model after inference to free VRAM",
                    },
                ),
                "batch_mode": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Enable batch processing mode",
                    },
                ),
                "batch_folder_path": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": False,
                        "tooltip": "Folder path for batch processing images",
                    },
                ),
                "skip_exists": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Skip images that already have a txt file with the same name",
                    },
                ),
            },
            "optional": _image_inputs(cls),
        }

    @classmethod
    def IS_CHANGED(cls, endpoint: str, **kwargs):
        _maybe_refresh(endpoint)
        return str(time.time())

    @staticmethod
    def _apply_output_language(prompt: str, output_language: str) -> str:
        if output_language == "Chinese":
            return prompt + " Please respond in Chinese."
        elif output_language == "English":
            return prompt + " Please respond in English."
        elif output_language == "Chinese&English":
            return (
                prompt
                + " Please respond in both Chinese and English, first describe in Chinese, then describe in English."
            )
        return prompt

    @staticmethod
    def _apply_prompt_length(prompt: str, prompt_length: str) -> str:
        """篇幅约束：Standard 不追加（沿用预设自身长度），Short/Medium/Long 在末尾追加长度要求。"""
        if not isinstance(prompt, str) or not prompt.strip():
            return prompt
        guidance = {
            "Short": " Keep the answer to one or two sentences without expanding.",
            "Medium": " Answer in a single concise paragraph of moderate length.",
            "Long": " Provide a thorough multi-paragraph answer covering as much visible detail as possible.",
        }.get(prompt_length or "", "")
        return prompt + guidance if guidance else prompt

    @staticmethod
    def _apply_prompt_format(prompt: str, prompt_format: str) -> str:
        """格式约束：Natural 不追加（模型默认即自然语言），Tag/Structured JSON 在末尾追加输出格式要求。"""
        if not isinstance(prompt, str) or not prompt.strip():
            return prompt
        guidance = {
            "Tag": " Output only comma-separated tags, without sentences or explanations.",
            "Structured JSON": " Output only a valid JSON object, without any explanation or code fence.",
        }.get(prompt_format or "", "")
        return prompt + guidance if guidance else prompt

    @staticmethod
    def _remove_think_content(text: str) -> str:
        if not isinstance(text, str):
            return text
        think_end_pos = text.find("</think>")
        if think_end_pos != -1:
            return text[think_end_pos + len("</think>") :].strip()
        return text

    @staticmethod
    def _tensor_to_base64(image_tensor, size_limitation=None) -> str:
        img_np = (image_tensor[0].cpu().numpy() * 255).clip(0, 255).astype(np.uint8)
        pil_img = Image.fromarray(img_np, mode="RGB")

        if size_limitation is not None and size_limitation > 0:
            target = min(size_limitation, 2500)
            w, h = pil_img.size
            long_edge = max(w, h)
            if long_edge > target:
                scale = target / float(long_edge)
                new_w = max(1, int(round(w * scale)))
                new_h = max(1, int(round(h * scale)))
                pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        buf = BytesIO()
        pil_img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    @staticmethod
    def _load_image_from_path(image_path):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"图片文件未找到: {image_path}")

        valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        file_ext = os.path.splitext(image_path.lower())[1]
        if file_ext not in valid_extensions:
            raise ValueError(f"不支持的图片格式: {file_ext}")

        image = Image.open(image_path)
        if image.mode != "RGB":
            image = image.convert("RGB")

        image_array = np.array(image).astype(np.float32) / 255.0
        return image_array

    @staticmethod
    def _resize_image_array(image_array, size_limitation):
        if size_limitation is None or size_limitation <= 0:
            return image_array

        h, w = image_array.shape[:2]
        long_edge = max(w, h)
        if long_edge <= size_limitation:
            return image_array

        scale = size_limitation / float(long_edge)
        new_w = max(1, int(round(w * scale)))
        new_h = max(1, int(round(h * scale)))

        pil_img = Image.fromarray((image_array * 255).astype(np.uint8))
        pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        return np.array(pil_img).astype(np.float32) / 255.0

    @staticmethod
    def _traverse_folder_for_images(folder_path, recursive=True):
        if not folder_path or not folder_path.strip():
            return []

        folder_path = folder_path.strip()
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"文件夹未找到: {folder_path}")
        if not os.path.isdir(folder_path):
            raise ValueError(f"路径不是文件夹: {folder_path}")

        valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        image_files = []

        if recursive:
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    file_ext = os.path.splitext(file.lower())[1]
                    if file_ext in valid_extensions:
                        full_path = os.path.join(root, file)
                        if os.access(full_path, os.R_OK):
                            image_files.append(full_path)
        else:
            for file in os.listdir(folder_path):
                file_path = os.path.join(folder_path, file)
                if os.path.isfile(file_path):
                    file_ext = os.path.splitext(file.lower())[1]
                    if file_ext in valid_extensions:
                        if os.access(file_path, os.R_OK):
                            image_files.append(file_path)

        image_files.sort(key=lambda x: os.path.basename(x).lower())
        return image_files

    @staticmethod
    def _get_subfolders_sorted(folder_path):
        if not folder_path or not folder_path.strip():
            return []
        
        folder_path = folder_path.strip()
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"文件夹未找到: {folder_path}")
        if not os.path.isdir(folder_path):
            raise ValueError(f"路径不是文件夹: {folder_path}")

        subfolders = []
        try:
            for item in os.listdir(folder_path):
                item_path = os.path.join(folder_path, item)
                if os.path.isdir(item_path) and os.access(item_path, os.R_OK):
                    subfolders.append(item_path)
        except PermissionError:
            raise PermissionError(f"无权限访问文件夹: {folder_path}")
        
        subfolders.sort(key=lambda x: os.path.basename(x).lower())
        return subfolders

    @staticmethod
    def _get_images_in_single_folder(folder_path):
        if not folder_path or not folder_path.strip():
            return []

        folder_path = folder_path.strip()
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"文件夹未找到: {folder_path}")
        if not os.path.isdir(folder_path):
            raise ValueError(f"路径不是文件夹: {folder_path}")

        valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        image_files = []

        try:
            for file in os.listdir(folder_path):
                file_path = os.path.join(folder_path, file)
                if os.path.isfile(file_path):
                    file_ext = os.path.splitext(file.lower())[1]
                    if file_ext in valid_extensions:
                        if os.access(file_path, os.R_OK):
                            image_files.append(file_path)
        except PermissionError:
            raise PermissionError(f"无权限访问文件夹: {folder_path}")

        image_files.sort(key=lambda x: os.path.basename(x).lower())
        return image_files

    @staticmethod
    def _save_description(image_file, description):
        txt_file = os.path.splitext(image_file)[0] + ".txt"
        with open(txt_file, "w", encoding="utf-8") as f:
            f.write(description)

    def _call_api(
        self,
        endpoint,
        model,
        messages,
        max_tokens,
        temperature,
        top_p,
        top_k,
        repetition_penalty,
        presence_penalty,
        seed=None,
    ):
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False,
            "top_p": top_p,
            "top_k": top_k,
            "repetition_penalty": repetition_penalty,
            "presence_penalty": presence_penalty,
        }
        if model.strip() and not model.startswith("("):
            payload["model"] = model.strip()
        if seed is not None and seed > 0:
            payload["seed"] = seed

        url = _normalise_base(endpoint) + "/v1/chat/completions"
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )

        timeout = _get_timeout("api_call", 450)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                result = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"LM Studio HTTP {e.code}: {error_body}") from e
        except urllib.error.URLError as e:
            raise RuntimeError(
                f"Could not connect to LM Studio at {url}. "
                "Make sure the server is running.\nDetail: {e.reason}"
            ) from e

        try:
            return result["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            raise RuntimeError(f"Unexpected response format: {result}") from e

    def _unload_model(self, endpoint: str) -> str:
        base_url = _normalise_base(endpoint)
        timeout_list = _get_timeout("unload_model_list", 10)
        timeout_unload = _get_timeout("unload_model", 30)
        try:
            response = requests.get(
                f"{base_url}/api/v1/models",
                headers={"Content-Type": "application/json"},
                timeout=timeout_list,
            )
            response.raise_for_status()
            models_data = response.json()

            all_models = models_data.get("models", models_data.get("data", []))

            loaded_instances = []
            for model in all_models:
                for instance in model.get("loaded_instances", []):
                    instance_id = instance.get("id")
                    if instance_id:
                        loaded_instances.append(instance_id)

            if not loaded_instances:
                return "No models currently loaded"

            unloaded = []
            failed = []

            for instance_id in loaded_instances:
                unload_response = requests.post(
                    f"{base_url}/api/v1/models/unload",
                    headers={"Content-Type": "application/json"},
                    json={"instance_id": instance_id},
                    timeout=timeout_unload,
                )

                if unload_response.status_code == 200:
                    unloaded.append(instance_id)
                else:
                    failed.append(instance_id)

            parts = []
            if unloaded:
                parts.append(f"Unloaded: {', '.join(unloaded)}")
            if failed:
                parts.append(f"Failed: {', '.join(failed)}")
            return " | ".join(parts) if parts else "Nothing was unloaded"

        except requests.exceptions.ConnectionError:
            return f"Connection error: Could not reach LM Studio at {endpoint}"
        except requests.exceptions.Timeout:
            return "Request timed out"
        except Exception as e:
            return f"Error: {str(e)}"

    def _generate_log_info(
        self,
        model: str,
        endpoint: str,
        preset_prompt: str,
        output_language: str,
        max_tokens: int,
        temperature: float,
        top_p: float,
        top_k: int,
        repetition_penalty: float,
        presence_penalty: float,
        seed: int,
        size_limitation: int,
        batch_mode: bool,
        image_count: int = 0,
        success: bool = True,
        error_msg: str = "",
        processed_count: int = 0,
        error_count: int = 0,
        duration: float = 0.0,
    ):
        config = _load_config()
        show_log = config.get("show_log_panel", True)
        if not show_log:
            return ""

        # 一次生成中英两版，前端按界面语言显示（切换语言时也能即时重渲染）
        log_texts = {}
        for lang in ("zh", "en"):
            labels = LOG_TEXT[lang]
            log_lines = [labels["model"].format(value=model)]

            if batch_mode:
                log_lines.append(labels["batchMode"])
                if image_count > 0:
                    log_lines.append(labels["imageCount"].format(value=image_count))
                if processed_count > 0 or error_count > 0:
                    log_lines.append(labels["processed"].format(value=processed_count))
                    log_lines.append(labels["failed"].format(value=error_count))
            elif image_count > 0:
                log_lines.append(labels["imageCount"].format(value=image_count))

            if duration > 0:
                log_lines.append(labels["duration"].format(value=duration))

            if success:
                log_lines.append(labels["statusDone"])
            else:
                log_lines.append(labels["statusFailed"])
                if error_msg:
                    # error_msg 允许为 {"zh": ..., "en": ...}；普通字符串则两版一致
                    if isinstance(error_msg, dict):
                        error_value = error_msg.get(lang) or error_msg.get("zh") or error_msg.get("en") or ""
                    else:
                        error_value = str(error_msg)
                    if error_value:
                        log_lines.append(labels["error"].format(value=error_value))

            log_texts[lang] = "\n".join(log_lines)

        return log_texts

    def _prepare_return(
        self,
        result: str,
        endpoint: str,
        unload_model: bool,
        remove_think_tags: bool = False,
        log_info=None,
    ):
        if remove_think_tags:
            result = self._remove_think_content(result)
        result = result.strip() if isinstance(result, str) else result
        if unload_model:
            self._unload_model(endpoint)

        # log_info: {"zh": ..., "en": ...}（同时下发两版）；非字典时两版使用同一文本
        if isinstance(log_info, dict):
            texts = {lang: str(log_info.get(lang, "") or "") for lang in ("zh", "en")}
        else:
            text = str(log_info or "")
            texts = {"zh": text, "en": text}

        return {
            "ui": {
                "log_info": [texts["zh"]],
                "log_info_i18n": [texts],
            },
            "result": (result,),
        }

    def run(
        self,
        preset_prompt: str,
        use_preset: bool,
        output_language: str,
        prompt_length: str,
        prompt_format: str,
        user_prompt: str,
        system_prompt: str,
        endpoint: str,
        model: str,
        size_limitation: int,
        max_tokens: int,
        temperature: float,
        top_p: float,
        top_k: int,
        repetition_penalty: float,
        presence_penalty: float,
        seed: int,
        unload_model: bool,
        batch_mode: bool,
        batch_folder_path: str,
        skip_exists: bool = False,
        remove_think_tags: bool = False,
        image=None,
        **image_slots,
    ):

        server_ok, server_error = _check_server_connection(endpoint)
        if not server_ok:
            raise Exception(f"[LM Studio] {server_error}")
        
        model_ok, model_error = _check_model_available(endpoint, model)
        if not model_ok:
            raise Exception(f"[LM Studio] {model_error}")
        
        _maybe_refresh(endpoint)
        start_time = time.time()
        
        folder_read_mode = _get_folder_read_mode()

        if seed == 0:
            import random
            seed = random.randint(1, 0xFFFFFFFFFFFFFFFF)

        config = _load_config()
        presets = _get_prompt_presets(config)
        preset_text = presets.get(preset_prompt, "")

        # 「使用预设」开关：关闭时整组预设（预设提示词 / 篇幅 / 格式 / 输出语言）都不参与请求，
        # 改用用户提示词与系统提示词；旧工作流用 preset_prompt == "Ignore" 表达同一含义，保持兼容
        preset_active = bool(use_preset) and preset_prompt != "Ignore"

        if preset_active:
            full_user_text = user_prompt.strip() if user_prompt.strip() else preset_text
            # 预设组的附加指令仅在启用预设时生效（与面板的禁用状态一致）
            full_user_text = self._apply_output_language(full_user_text, output_language)
            full_user_text = self._apply_prompt_length(full_user_text, prompt_length)
            full_user_text = self._apply_prompt_format(full_user_text, prompt_format)
        else:
            full_user_text = user_prompt.strip() if user_prompt.strip() else ""

        effective_system_prompt = "" if preset_active else system_prompt

        if not batch_mode:
            all_images = self._collect_images(image, image_slots)
            image_count = len(all_images)

            if image_count == 0:
                messages = []
                if effective_system_prompt.strip():
                    messages.append(
                        {"role": "system", "content": effective_system_prompt}
                    )
                messages.append({"role": "user", "content": full_user_text})

                try:
                    result = self._call_api(
                        endpoint,
                        model,
                        messages,
                        max_tokens,
                        temperature,
                        top_p,
                        top_k,
                        repetition_penalty,
                        presence_penalty,
                        seed,
                    )
                    duration = time.time() - start_time
                    log_info = self._generate_log_info(
                        model=model,
                        endpoint=endpoint,
                        preset_prompt=preset_prompt,
                        output_language=output_language,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        repetition_penalty=repetition_penalty,
                        presence_penalty=presence_penalty,
                        seed=seed,
                        size_limitation=size_limitation,
                        batch_mode=batch_mode,
                        image_count=image_count,
                        success=True,
                        duration=duration,
                    )
                    return self._prepare_return(
                        result, endpoint, unload_model, remove_think_tags, log_info
                    )
                except Exception as e:
                    duration = time.time() - start_time
                    log_info = self._generate_log_info(
                        model=model,
                        endpoint=endpoint,
                        preset_prompt=preset_prompt,
                        output_language=output_language,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        repetition_penalty=repetition_penalty,
                        presence_penalty=presence_penalty,
                        seed=seed,
                        size_limitation=size_limitation,
                        batch_mode=batch_mode,
                        image_count=image_count,
                        success=False,
                        error_msg=str(e),
                        duration=duration,
                    )
                    return self._prepare_return(
                        "", endpoint, unload_model, remove_think_tags, log_info
                    )

            user_content = []
            
            for img in all_images:
                if len(img.shape) == 4 and img.shape[0] > 0:
                    image_tensor = img[0:1]
                else:
                    image_tensor = img
                
                b64 = self._tensor_to_base64(
                    image_tensor, size_limitation if size_limitation > 0 else None
                )
                user_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{b64}"},
                })
            
            user_content.append({"type": "text", "text": full_user_text})

            messages = []
            if effective_system_prompt.strip():
                messages.append({"role": "system", "content": effective_system_prompt})
            messages.append({"role": "user", "content": user_content})

            try:
                result = self._call_api(
                    endpoint,
                    model,
                    messages,
                    max_tokens,
                    temperature,
                    top_p,
                    top_k,
                    repetition_penalty,
                    presence_penalty,
                    seed,
                )
                duration = time.time() - start_time
                log_info = self._generate_log_info(
                    model=model,
                    endpoint=endpoint,
                    preset_prompt=preset_prompt,
                    output_language=output_language,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    repetition_penalty=repetition_penalty,
                    presence_penalty=presence_penalty,
                    seed=seed,
                    size_limitation=size_limitation,
                    batch_mode=batch_mode,
                    image_count=image_count,
                    success=True,
                    duration=duration,
                )
                return self._prepare_return(
                    result, endpoint, unload_model, remove_think_tags, log_info
                )
            except Exception as e:
                duration = time.time() - start_time
                log_info = self._generate_log_info(
                    model=model,
                    endpoint=endpoint,
                    preset_prompt=preset_prompt,
                    output_language=output_language,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    repetition_penalty=repetition_penalty,
                    presence_penalty=presence_penalty,
                    seed=seed,
                    size_limitation=size_limitation,
                    batch_mode=batch_mode,
                    image_count=image_count,
                    success=False,
                    error_msg=str(e),
                    duration=duration,
                )
                return self._prepare_return(
                    "", endpoint, unload_model, remove_think_tags, log_info
                )

        else:
            results = []

            if batch_folder_path and batch_folder_path.strip():
                try:
                    if folder_read_mode == "sequential":
                        subfolders = self._get_subfolders_sorted(batch_folder_path.strip())
                        
                        if not subfolders:
                            log_info = self._generate_log_info(
                                model=model,
                                endpoint=endpoint,
                                preset_prompt=preset_prompt,
                                output_language=output_language,
                                max_tokens=max_tokens,
                                temperature=temperature,
                                top_p=top_p,
                                top_k=top_k,
                                repetition_penalty=repetition_penalty,
                                presence_penalty=presence_penalty,
                                seed=seed,
                                size_limitation=size_limitation,
                                batch_mode=batch_mode,
                                image_count=0,
                                success=False,
                                error_msg=LOG_ERROR_TEXT["subfolderNotFound"],
                            )
                            return self._prepare_return(
                                "", endpoint, unload_model, remove_think_tags, log_info
                            )

                        total_folders = len(subfolders)
                        total_processed = 0
                        total_errors = 0
                        all_error_details = []
                        folder_results = []

                        batch_progress = _get_batch_progress()
                        start_folder_index = 0
                        processed_folders = set(batch_progress.get("processed_folders", []))

                        for i, subfolder in enumerate(subfolders):
                            if subfolder in processed_folders:
                                continue
                            start_folder_index = i
                            break

                        for folder_idx in range(start_folder_index, total_folders):
                            subfolder = subfolders[folder_idx]
                            folder_name = os.path.basename(subfolder)

                            _save_batch_progress({
                                "current_folder": subfolder,
                                "processed_folders": list(processed_folders),
                                "total_folders": total_folders,
                                "current_folder_index": folder_idx
                            })

                            image_paths = self._get_images_in_single_folder(subfolder)
                            
                            if not image_paths:
                                processed_folders.add(subfolder)
                                continue

                            folder_processed = 0
                            folder_errors = 0
                            folder_error_details = []

                            for image_path in image_paths:
                                try:
                                    if skip_exists:
                                        txt_file = os.path.splitext(image_path)[0] + ".txt"
                                        if os.path.exists(txt_file):
                                            continue

                                    image_array = self._load_image_from_path(image_path)
                                    if size_limitation > 0:
                                        image_array = self._resize_image_array(
                                            image_array, size_limitation
                                        )

                                    pil_img = Image.fromarray(
                                        (image_array * 255).astype(np.uint8)
                                    )
                                    buf = BytesIO()
                                    pil_img.save(buf, format="PNG")
                                    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                                    user_content = [
                                        {
                                            "type": "image_url",
                                            "image_url": {
                                                "url": f"data:image/png;base64,{b64}"
                                            },
                                        },
                                        {"type": "text", "text": full_user_text},
                                    ]

                                    messages = []
                                    if effective_system_prompt.strip():
                                        messages.append(
                                            {
                                                "role": "system",
                                                "content": effective_system_prompt,
                                            }
                                        )
                                    messages.append({"role": "user", "content": user_content})

                                    result = self._call_api(
                                        endpoint,
                                        model,
                                        messages,
                                        max_tokens,
                                        temperature,
                                        top_p,
                                        top_k,
                                        repetition_penalty,
                                        presence_penalty,
                                        seed,
                                    )
                                    self._save_description(image_path, result)
                                    folder_processed += 1
                                    total_processed += 1

                                except Exception as e:
                                    folder_errors += 1
                                    total_errors += 1
                                    error_msg = str(e)
                                    folder_error_details.append(
                                        f"[{os.path.basename(image_path)}] {error_msg}"
                                    )
                                    all_error_details.append(
                                        f"[{folder_name}/{os.path.basename(image_path)}] {error_msg}"
                                    )

                            processed_folders.add(subfolder)
                            folder_results.append(
                                f"📁 {folder_name}: {folder_processed} 成功, {folder_errors} 失败"
                            )

                        _save_batch_progress({
                            "current_folder": "",
                            "processed_folders": [],
                            "total_folders": 0,
                            "current_folder_index": 0
                        })

                        duration = time.time() - start_time
                        log_message = f"顺序轮次模式处理完成!\n总文件夹数: {total_folders}\n总处理图片: {total_processed}\n总失败: {total_errors}\n\n各文件夹详情:\n" + "\n".join(folder_results)
                        if all_error_details:
                            log_message += "\n\n失败详情:\n" + "\n".join(all_error_details[:20])
                            if len(all_error_details) > 20:
                                log_message += f"\n... 还有 {len(all_error_details) - 20} 个错误"
                        
                        log_info = self._generate_log_info(
                            model=model,
                            endpoint=endpoint,
                            preset_prompt=preset_prompt,
                            output_language=output_language,
                            max_tokens=max_tokens,
                            temperature=temperature,
                            top_p=top_p,
                            top_k=top_k,
                            repetition_penalty=repetition_penalty,
                            presence_penalty=presence_penalty,
                            seed=seed,
                            size_limitation=size_limitation,
                            batch_mode=batch_mode,
                            image_count=total_processed,
                            success=True,
                            processed_count=total_processed,
                            error_count=total_errors,
                            duration=duration,
                        )
                        return self._prepare_return(
                            log_message, endpoint, unload_model, remove_think_tags, log_info
                        )

                    else:
                        image_paths = self._traverse_folder_for_images(
                            batch_folder_path.strip()
                        )
                        if not image_paths:
                            log_info = self._generate_log_info(
                                model=model,
                                endpoint=endpoint,
                                preset_prompt=preset_prompt,
                                output_language=output_language,
                                max_tokens=max_tokens,
                                temperature=temperature,
                                top_p=top_p,
                                top_k=top_k,
                                repetition_penalty=repetition_penalty,
                                presence_penalty=presence_penalty,
                                seed=seed,
                                size_limitation=size_limitation,
                                batch_mode=batch_mode,
                                image_count=0,
                                success=False,
                                error_msg=LOG_ERROR_TEXT["imageNotFound"],
                            )
                            return self._prepare_return(
                                "", endpoint, unload_model, remove_think_tags, log_info
                            )

                        total_images = len(image_paths)
                        processed_count = 0
                        error_count = 0
                        error_details = []

                        for i, image_path in enumerate(image_paths):
                            try:
                                if skip_exists:
                                    txt_file = os.path.splitext(image_path)[0] + ".txt"
                                    if os.path.exists(txt_file):
                                        continue

                                image_array = self._load_image_from_path(image_path)
                                if size_limitation > 0:
                                    image_array = self._resize_image_array(
                                        image_array, size_limitation
                                    )

                                pil_img = Image.fromarray(
                                    (image_array * 255).astype(np.uint8)
                                )
                                buf = BytesIO()
                                pil_img.save(buf, format="PNG")
                                b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                                user_content = [
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:image/png;base64,{b64}"
                                        },
                                    },
                                    {"type": "text", "text": full_user_text},
                                ]

                                messages = []
                                if effective_system_prompt.strip():
                                    messages.append(
                                        {
                                            "role": "system",
                                            "content": effective_system_prompt,
                                        }
                                    )
                                messages.append({"role": "user", "content": user_content})

                                result = self._call_api(
                                    endpoint,
                                    model,
                                    messages,
                                    max_tokens,
                                    temperature,
                                    top_p,
                                    top_k,
                                    repetition_penalty,
                                    presence_penalty,
                                    seed,
                                )
                                self._save_description(image_path, result)
                                processed_count += 1

                            except Exception as e:
                                error_count += 1
                                error_msg = str(e)
                                error_details.append(
                                    f"[{os.path.basename(image_path)}] {error_msg}"
                                )

                        duration = time.time() - start_time
                        log_message = f"递归遍历模式处理完成!\n总图片数: {total_images}\n成功: {processed_count}\n失败: {error_count}"
                        if error_details:
                            log_message += "\n\n失败详情:\n" + "\n".join(error_details)
                        log_info = self._generate_log_info(
                            model=model,
                            endpoint=endpoint,
                            preset_prompt=preset_prompt,
                            output_language=output_language,
                            max_tokens=max_tokens,
                            temperature=temperature,
                            top_p=top_p,
                            top_k=top_k,
                            repetition_penalty=repetition_penalty,
                            presence_penalty=presence_penalty,
                            seed=seed,
                            size_limitation=size_limitation,
                            batch_mode=batch_mode,
                            image_count=total_images,
                            success=True,
                            processed_count=processed_count,
                            error_count=error_count,
                            duration=duration,
                        )
                        return self._prepare_return(
                            log_message, endpoint, unload_model, remove_think_tags, log_info
                        )

                except Exception as e:
                    duration = time.time() - start_time
                    log_info = self._generate_log_info(
                        model=model,
                        endpoint=endpoint,
                        preset_prompt=preset_prompt,
                        output_language=output_language,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        repetition_penalty=repetition_penalty,
                        presence_penalty=presence_penalty,
                        seed=seed,
                        size_limitation=size_limitation,
                        batch_mode=batch_mode,
                        success=False,
                        error_msg=str(e),
                        duration=duration,
                    )
                    return self._prepare_return(
                        f"Batch processing failed: {str(e)}",
                        endpoint,
                        unload_model,
                        remove_think_tags,
                        log_info,
                    )

            else:
                if image is None:
                    log_info = self._generate_log_info(
                        model=model,
                        endpoint=endpoint,
                        preset_prompt=preset_prompt,
                        output_language=output_language,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        repetition_penalty=repetition_penalty,
                        presence_penalty=presence_penalty,
                        seed=seed,
                        size_limitation=size_limitation,
                        batch_mode=batch_mode,
                        success=False,
                        error_msg=LOG_ERROR_TEXT["noImagesInBatch"],
                    )
                    return self._prepare_return(
                        "", endpoint, unload_model, remove_think_tags, log_info
                    )

                total_images = image.shape[0] if len(image.shape) == 4 else 1
                processed_count = 0
                error_count = 0
                error_details = []

                for i in range(total_images):
                    try:
                        if len(image.shape) == 4:
                            image_tensor = image[i : i + 1]
                        else:
                            image_tensor = image

                        b64 = self._tensor_to_base64(
                            image_tensor,
                            size_limitation if size_limitation > 0 else None,
                        )
                        user_content = [
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/png;base64,{b64}"},
                            },
                            {"type": "text", "text": full_user_text},
                        ]

                        messages = []
                        if effective_system_prompt.strip():
                            messages.append(
                                {"role": "system", "content": effective_system_prompt}
                            )
                        messages.append({"role": "user", "content": user_content})

                        result = self._call_api(
                            endpoint,
                            model,
                            messages,
                            max_tokens,
                            temperature,
                            top_p,
                            top_k,
                            repetition_penalty,
                            presence_penalty,
                            seed,
                        )
                        results.append(f"Image {i + 1}/{total_images}:\n{result}")
                        processed_count += 1

                    except Exception as e:
                        error_count += 1
                        error_msg = str(e)
                        error_details.append(f"[Image {i + 1}] {error_msg}")

                duration = time.time() - start_time
                combined_result = "\n\n" + "=" * 50 + "\n\n".join(results)
                summary = f"Batch processing completed!\nTotal: {total_images} images\nSuccess: {processed_count}\nFailed: {error_count}"
                if error_details:
                    summary += "\n\nFailure details:\n" + "\n".join(error_details)
                combined_result = summary + "\n\n" + "=" * 50 + "\n" + combined_result
                log_info = self._generate_log_info(
                    model=model,
                    endpoint=endpoint,
                    preset_prompt=preset_prompt,
                    output_language=output_language,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    repetition_penalty=repetition_penalty,
                    presence_penalty=presence_penalty,
                    seed=seed,
                    size_limitation=size_limitation,
                    batch_mode=batch_mode,
                    image_count=total_images,
                    success=True,
                    processed_count=processed_count,
                    error_count=error_count,
                    duration=duration,
                )
                return self._prepare_return(
                    combined_result, endpoint, unload_model, remove_think_tags, log_info
                )