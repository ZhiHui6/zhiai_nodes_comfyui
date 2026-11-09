import os
import json
import requests
import hashlib
import time
import random
import hmac
import base64
import uuid
from datetime import datetime

class MultiPlatformTranslate:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "enable_translate": ("BOOLEAN", {"default": True}),
                "platform": (["free", "baidu", "aliyun", "youdao", "zhipu", "google"], {"default": "baidu"}),
                "source_language": (["auto", "zh", "en"], {"default": "auto"}),
                "target_language": (["zh", "en"], {"default": "en"}),
                "your_text": ("STRING", {"default": "", "multiline": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("translation_result",)
    FUNCTION = "translate"
    CATEGORY = "Zhi.AI/Text"
    DESCRIPTION = "Translates text with a key-free free service (Youdao demo / Bing Edge / Alibaba web) or Baidu, Aliyun, Youdao, Zhipu AI and Google, with API settings managed from the Configuration Management dialog."

    def __init__(self):
        self.config_path = os.path.join(os.path.dirname(__file__), "MultiPlatformTranslateConfig.json")
        self.config = self.load_config()

    def load_config(self):
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load config file: {e}")
            return self.get_default_config()

    def get_default_config(self):
        return {
            "platforms": {
                "baidu": {"name": "百度翻译", "config": {"app_id": "", "api_key": ""}},
                "aliyun": {"name": "阿里云翻译", "config": {"access_key_id": "", "access_key_secret": ""}},
                "youdao": {"name": "有道翻译", "config": {"app_key": "", "app_secret": ""}},
                "zhipu": {"name": "智谱AI翻译", "config": {"api_key": "", "model": "glm-4-flash"}},
                "google": {"name": "谷歌翻译", "config": {}}
            }
        }

    def save_config(self, config):
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=4)
            self.config = config
            return True
        except Exception as e:
            print(f"Failed to save config file: {e}")
            return False

    def translate(self, enable_translate, platform, source_language, target_language, your_text):
        if not enable_translate or not your_text.strip():
            return (your_text,)

        platform_config = self.config["platforms"].get(platform)
        if not platform_config and platform != "free":
            return (your_text,)

        try:
            if platform == "free":
                result = self.translate_free(source_language, target_language, your_text)
            elif platform == "baidu":
                result = self.translate_baidu(platform_config["config"], source_language, target_language, your_text)
            elif platform == "aliyun":
                result = self.translate_aliyun(platform_config["config"], source_language, target_language, your_text)
            elif platform == "youdao":
                result = self.translate_youdao(platform_config["config"], source_language, target_language, your_text)
            elif platform == "zhipu":
                result = self.translate_zhipu(platform_config["config"], source_language, target_language, your_text)
            elif platform == "google":
                result = self.translate_google(platform_config["config"], source_language, target_language, your_text)
            else:
                result = your_text

            return (result,)
        except Exception as e:
            print(f"Translation error with {platform}: {e}")
            return (your_text,)

    FREE_YOUDAO_LANGS = {"auto": "Auto", "zh": "zh-CHS", "en": "en"}
    FREE_BING_LANGS = {"auto": None, "zh": "zh-Hans", "en": "en"}
    FREE_ALIBABA_LANGS = {"auto": "auto", "zh": "zh", "en": "en"}

    def translate_free(self, source_language, target_language, text):
        query = text.strip()
        if len(query) <= 1000:
            try:
                return self.translate_free_youdao(query, source_language, target_language)
            except Exception:
                pass
        try:
            return self.translate_free_bing(query, source_language, target_language)
        except Exception:
            pass
        return self.translate_free_alibaba(query, source_language, target_language)

    def translate_free_youdao(self, text, source_language, target_language):
        data = {
            "q": text,
            "from": self.FREE_YOUDAO_LANGS[source_language],
            "to": self.FREE_YOUDAO_LANGS[target_language],
        }
        response = requests.post("https://aidemo.youdao.com/trans", data=data, timeout=15)
        response.raise_for_status()
        result = response.json()
        if result.get("errorCode") != "0":
            raise Exception(f"Youdao free translate error: {result.get('errorCode')}")
        return "\n".join(result["translation"])

    def translate_free_bing(self, text, source_language, target_language):
        params = {"to": self.FREE_BING_LANGS[target_language]}
        source = self.FREE_BING_LANGS[source_language]
        if source:
            params["from"] = source
        response = requests.post(
            "https://edge.microsoft.com/translate/translatetext",
            params=params,
            json=[text],
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.json()[0]["translations"][0]["text"]

    def translate_free_alibaba(self, text, source_language, target_language):
        if len(text) > 5000:
            raise ValueError("Free translation supports up to 5000 characters per request")
        csrf_url = "https://translate.alibaba.com/api/translate/csrftoken"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
        }
        session = requests.Session()
        session.get(csrf_url, headers=headers, timeout=15)
        token = session.get(csrf_url, headers=headers, timeout=15).json()
        headers.update({
            "Origin": "https://translate.alibaba.com",
            "Referer": "https://translate.alibaba.com/",
            token["headerName"]: token["token"],
        })
        files = {
            "query": (None, text),
            "srcLang": (None, self.FREE_ALIBABA_LANGS[source_language]),
            "tgtLang": (None, self.FREE_ALIBABA_LANGS[target_language]),
            "_csrf": (None, token["token"]),
            "domain": (None, "general"),
        }
        response = session.post(
            "https://translate.alibaba.com/api/translate/text",
            files=files,
            headers=headers,
            timeout=15,
        )
        response.raise_for_status()
        return response.json()["data"]["translateText"]

    def translate_baidu(self, config, source_language, target_language, text):
        app_id = config.get("app_id", "")
        api_key = config.get("api_key", "")
        
        if not app_id or not api_key:
            raise ValueError("Baidu Translate API credentials not configured")

        url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        salt = str(random.randint(1000000000, 9999999999))
        sign = hashlib.md5((app_id + text + salt + api_key).encode()).hexdigest()
        
        params = {
            "q": text,
            "from": source_language,
            "to": target_language,
            "appid": app_id,
            "salt": salt,
            "sign": sign
        }

        response = requests.get(url, params=params)
        result = response.json()
        
        if "trans_result" in result:
            return result["trans_result"][0]["dst"]
        else:
            raise Exception(f"Baidu Translate error: {result.get('error_msg', 'Unknown error')}")



    def translate_aliyun(self, config, source_language, target_language, text):
        access_key_id = config.get("access_key_id", "")
        access_key_secret = config.get("access_key_secret", "")
        
        if not access_key_id or not access_key_secret:
            raise ValueError("Aliyun Translate API credentials not configured")

        url = "https://mt.cn-hangzhou.aliyuncs.com/api/translate/web/general"
        
        params = {
            "FormatType": "text",
            "SourceLanguage": source_language if source_language != "auto" else "auto",
            "TargetLanguage": target_language,
            "SourceText": text,
            "Scene": "general"
        }

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_key_id}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        try:
            response = requests.post(url, headers=headers, data=json.dumps(params))
            result = response.json()
            
            if response.status_code == 200 and 'Data' in result:
                return result['Data']['Translated']
            else:

                return self.translate_google({}, source_language, target_language, text)
        except:
            return self.translate_google({}, source_language, target_language, text)

    def truncate(self, q):
        if len(q) <= 20:
            return q
        else:
            return q[0:10] + str(len(q)) + q[-10:]

    def translate_youdao(self, config, source_language, target_language, text):
        app_key = config.get("app_key", "")
        app_secret = config.get("app_secret", "")
        
        if not app_key or not app_secret:
            raise ValueError("Youdao Translate API credentials not configured")

        url = "https://openapi.youdao.com/api"
        
        salt = str(random.randint(1000000000, 9999999999))
        curtime = str(int(time.time()))
        input_str = self.truncate(text)
        sign_str = app_key + input_str + salt + curtime + app_secret
        sign = hashlib.sha256(sign_str.encode()).hexdigest()
        
        params = {
            'q': text,
            'from': source_language if source_language != "auto" else "auto",
            'to': target_language,
            'appKey': app_key,
            'salt': salt,
            'sign': sign,
            'signType': 'v3',
            'curtime': curtime
        }

        response = requests.post(url, data=params)
        result = response.json()
        
        if result.get('errorCode') == '0':
            return result['translation'][0]
        else:
            raise Exception(f"Youdao Translate error: {result.get('errorCode', 'Unknown error')}")

    def translate_google(self, config, source_language, target_language, text):
        if not text.strip():
            return text
        return self._translate_with_google(source_language, target_language, text)
    
    def _translate_with_google(self, source_language, target_language, text):
        lang_map = {
            "auto": "auto",
            "zh": "zh-CN", 
            "en": "en",
            "ja": "ja",
            "ko": "ko",
            "fr": "fr",
            "de": "de",
            "es": "es",
            "ru": "ru",
            "ar": "ar"
        }
        
        source_lang = lang_map.get(source_language, "auto")
        target_lang = lang_map.get(target_language, "en")
        
        url = "https://translate.googleapis.com/translate_a/single"
        
        params = {
            "client": "gtx",
            "sl": source_lang,
            "tl": target_lang,
            "dt": "t",
            "q": text
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if result and isinstance(result, list) and len(result) > 0:
                    translated_parts = []
                    for part in result[0]:
                        if part and isinstance(part, list) and len(part) > 0:
                            translated_parts.append(part[0])
                    return "".join(translated_parts)
            
            error_msg = f"Google translation failed with status code {response.status_code}"
            print(error_msg)
            return text
        except Exception as e:
            print(f"Google translation error: {e}")
            return text

    def translate_zhipu(self, config, source_language, target_language, text):
        api_key = config.get("api_key", "")
        model = config.get("model", "glm-4-flash")
        
        if not api_key:
            raise ValueError("Zhipu AI API key not configured")

        url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        
        if source_language == "auto":
            prompt = f"请将以下文本翻译成{target_language}，只需要返回翻译结果，不要添加任何解释或说明：\n\n{text}"
        else:
            source_lang_name = self.get_language_name(source_language)
            target_lang_name = self.get_language_name(target_language)
            prompt = f"请将以下{source_lang_name}文本翻译成{target_lang_name}，只需要返回翻译结果，不要添加任何解释或说明：\n\n{text}"
        
        post_data = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "max_tokens": 2048
        }

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.post(url, headers=headers, data=json.dumps(post_data))
        result = response.json()
        
        if response.status_code == 200 and 'choices' in result and len(result['choices']) > 0:
            return result['choices'][0]['message']['content'].strip()
        else:
            error_msg = result.get('error', {}).get('message', 'Unknown error') if 'error' in result else 'Unknown error'
            raise Exception(f"Zhipu AI translation error: {error_msg}")

    def get_language_name(self, lang_code):
        lang_names = {
            "zh": "中文",
            "en": "英语", 
            "ja": "日语",
            "ko": "韩语",
            "fr": "法语",
            "de": "德语",
            "es": "西班牙语",
            "ru": "俄语",
            "ar": "阿拉伯语",
            "pt": "葡萄牙语",
            "it": "意大利语",
            "th": "泰语",
            "vi": "越南语",
            "id": "印尼语"
        }
        return lang_names.get(lang_code, lang_code)



    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("NaN")