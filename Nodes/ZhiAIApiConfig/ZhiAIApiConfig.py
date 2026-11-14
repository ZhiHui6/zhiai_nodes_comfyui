import os
import json
import requests

try:
    from server import PromptServer
    from aiohttp import web
    PROMPT_SERVER_AVAILABLE = True
except ImportError:
    PROMPT_SERVER_AVAILABLE = False
    PromptServer = None
    web = None

PLUGIN_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONFIG_DIR = os.path.join(PLUGIN_ROOT, "config")


class ZhiAIApiConfig:
    def __init__(self):
        self.config_path = os.path.join(CONFIG_DIR, "api_config.json")
        self.keys_path = os.path.join(CONFIG_DIR, "api_keys.json")
        self.config = self.load_config()
        self.api_keys = self.load_api_keys()

    def load_config(self):
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load config file: {e}")
            return self.get_default_config()

    def load_api_keys(self):
        try:
            with open(self.keys_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return self.get_default_api_keys()

    def get_default_api_keys(self):
        platforms = self.config.get("platforms", {})
        api_keys = {}
        for platform_key in platforms:
            api_keys[platform_key] = ""
        return api_keys

    def save_api_keys(self, api_keys):
        try:
            with open(self.keys_path, 'w', encoding='utf-8') as f:
                json.dump(api_keys, f, indent=4, ensure_ascii=False)
            self.api_keys = api_keys
            return True
        except Exception as e:
            print(f"Failed to save API keys: {e}")
            return False

    def get_api_key(self, platform):
        return self.api_keys.get(platform, "")

    def get_default_config(self):
        return {
            "platforms": {},
            "default_platform": "auto"
        }

    def save_config(self, config):
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=4, ensure_ascii=False)
            self.config = config
            return True
        except Exception as e:
            print(f"Failed to save config: {e}")
            return False

    def save_default_platform(self, platform):
        try:
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)
            except Exception:
                pass
            
            self.config["default_platform"] = platform
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=4, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Failed to save default platform: {e}")
            return False

    def test_connection(self, platform, config):
        platform_config = self.config["platforms"].get(platform)
        if not platform_config:
            return {"success": False, "error": f"Platform configuration not found: {platform}"}

        api_key = config.get("api_key", "")
        if not api_key:
            api_key = self.get_api_key(platform)
        if not api_key:
            return {"success": False, "error": "API key cannot be empty"}

        base_url = config.get("base_url", "")
        if not base_url:
            base_url = platform_config["config"]["base_url"]

        model = config.get("model", "")
        if not model:
            model = platform_config["config"]["model"]

        if platform == "claude":
            api_url = f"{base_url}/v1/messages"
        elif platform == "gemini":
            api_url = f"{base_url}/v1beta/models/{model}:generateContent"
        else:
            api_url = f"{base_url}/chat/completions"

        system_prompt = "You are a helpful assistant."
        test_prompt = "Say 'test'"

        if not api_key:
            raise ValueError("API key cannot be empty")
        if not api_url:
            raise ValueError("API URL cannot be empty")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": test_prompt}
            ],
            "max_tokens": 100
        }

        response = requests.post(api_url, headers=headers, json=data, timeout=30)
        result = response.json()

        if response.status_code == 200:
            return {"success": True, "message": "Connection successful"}
        else:
            raise Exception(f"API error: {result.get('error', {}).get('message', 'Unknown error')}")


if PROMPT_SERVER_AVAILABLE and PromptServer:
    zhi_ai_api_config = ZhiAIApiConfig()

    @PromptServer.instance.routes.get("/zhiai_nodes/zhi_ai_config/config")
    async def get_zhi_ai_config(request):
        return web.json_response(zhi_ai_api_config.config)

    @PromptServer.instance.routes.post("/zhiai_nodes/zhi_ai_config/config")
    async def save_zhi_ai_config(request):
        try:
            data = await request.json()
            success = zhi_ai_api_config.save_config(data)
            return web.json_response({"success": success})
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)})

    @PromptServer.instance.routes.get("/zhiai_nodes/zhi_ai_config/api_keys")
    async def get_zhi_ai_api_keys(request):
        return web.json_response(zhi_ai_api_config.api_keys)

    @PromptServer.instance.routes.post("/zhiai_nodes/zhi_ai_config/api_keys")
    async def save_zhi_ai_api_keys(request):
        try:
            data = await request.json()
            success = zhi_ai_api_config.save_api_keys(data)
            return web.json_response({"success": success})
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)})

    @PromptServer.instance.routes.post("/zhiai_nodes/zhi_ai_config/test")
    async def test_zhi_ai_connection(request):
        try:
            data = await request.json()
            platform = data.get("platform")
            config = data.get("config")
            result = await zhi_ai_api_config.test_connection(platform, config)
            return web.json_response(result)
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)})

    @PromptServer.instance.routes.get("/zhiai_nodes/zhi_ai_config/default_platform")
    async def get_zhi_ai_default_platform(request):
        default_platform = zhi_ai_api_config.config.get("default_platform", "auto")
        return web.json_response({"default_platform": default_platform})

    @PromptServer.instance.routes.post("/zhiai_nodes/zhi_ai_config/default_platform")
    async def set_zhi_ai_default_platform(request):
        try:
            data = await request.json()
            platform = data.get("platform", "auto")
            success = zhi_ai_api_config.save_default_platform(platform)
            return web.json_response({"success": success})
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)})
