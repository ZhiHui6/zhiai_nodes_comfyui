import os
import re
from aiohttp import web
from server import PromptServer

LOCALE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "locale")
LANGUAGE_PATTERN = re.compile(r"^[a-z]{2}$")
LOCALE_FILES = frozenset({"nodes", "values"})


@PromptServer.instance.routes.get("/zhihui_nodes/locale/{language}/{name}")
async def get_locale_file(request):
    language = request.match_info.get("language", "")
    name = request.match_info.get("name", "")
    if not LANGUAGE_PATTERN.match(language) or name not in LOCALE_FILES:
        return web.json_response({"status": "error", "message": "Unknown locale file"}, status=404)
    path = os.path.normpath(os.path.join(LOCALE_DIR, language, f"{name}.json"))
    if not os.path.isfile(path):
        return web.json_response({"status": "error", "message": "Locale file not found"}, status=404)
    return web.FileResponse(path)
