from __future__ import annotations

import threading
import time
import logging

import psutil
from aiohttp import web
from server import PromptServer

LOGGER = logging.getLogger("zhiai_nodes.hardware_monitor")

try:
    import pynvml
except ImportError:
    pynvml = None

# 采样周期参考 Crystools：后台线程每秒采样一次，前端只读取缓存结果
SAMPLE_INTERVAL = 1.0

_nvml_state = None
_lock = threading.Lock()
_snapshot = {
    "cpu": 0.0,
    "ram_used": 0,
    "ram_total": 0,
    "ram_percent": 0.0,
    "gpus": [],
    "sampled_at": 0.0,
}


def _nvml_ready():
    global _nvml_state
    if _nvml_state is not None:
        return _nvml_state
    if pynvml is None:
        _nvml_state = False
        return False
    try:
        pynvml.nvmlInit()
        _nvml_state = True
    except Exception as exc:
        LOGGER.info("NVML unavailable, GPU metrics disabled: %s", exc)
        _nvml_state = False
    return _nvml_state


def _gpu_stats():
    if not _nvml_ready():
        return []
    try:
        count = pynvml.nvmlDeviceGetCount()
    except Exception as exc:
        LOGGER.debug("NVML device count failed: %s", exc)
        return []
    result = []
    for index in range(count):
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(index)
            name = pynvml.nvmlDeviceGetName(handle)
            if isinstance(name, bytes):
                name = name.decode("utf-8", "ignore")
            memory = pynvml.nvmlDeviceGetMemoryInfo(handle)
            result.append({
                "index": index,
                "name": str(name or ""),
                "utilization": float(pynvml.nvmlDeviceGetUtilizationRates(handle).gpu),
                "temperature": float(pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)),
                "vram_used": int(memory.used),
                "vram_total": int(memory.total),
            })
        except Exception as exc:
            LOGGER.debug("GPU %s metrics failed: %s", index, exc)
    return result


def _cpu_percent(prev, cur):
    """按两次 cpu_times 差值计算使用率，窗口就是实际采样间隔（默认 1 秒）。"""
    total = sum(cur) - sum(prev)
    if total <= 0:
        return None
    idle = cur.idle - prev.idle
    if hasattr(cur, "iowait"):
        idle += cur.iowait - prev.iowait
    return max(0.0, min(100.0, 100.0 * (total - idle) / total))


def _sample_loop():
    prev = psutil.cpu_times()
    while True:
        time.sleep(SAMPLE_INTERVAL)
        try:
            cur = psutil.cpu_times()
            cpu = _cpu_percent(prev, cur)
            prev = cur
            memory = psutil.virtual_memory()
            data = {
                "cpu": float(cpu if cpu is not None else _snapshot["cpu"]),
                "ram_used": int(memory.used),
                "ram_total": int(memory.total),
                "ram_percent": float(memory.percent),
                "gpus": _gpu_stats(),
                "sampled_at": time.time(),
            }
            with _lock:
                _snapshot.update(data)
        except Exception as exc:
            LOGGER.debug("Hardware sampling failed: %s", exc)


def _snapshot_copy():
    with _lock:
        data = dict(_snapshot)
    data["gpus"] = [dict(gpu) for gpu in data["gpus"]]
    return data


def _prime():
    """先填充内存与 GPU，避免页面首次打开时出现空行或 0/0G。"""
    try:
        memory = psutil.virtual_memory()
        with _lock:
            _snapshot.update({
                "ram_used": int(memory.used),
                "ram_total": int(memory.total),
                "ram_percent": float(memory.percent),
                "gpus": _gpu_stats(),
                "sampled_at": time.time(),
            })
    except Exception as exc:
        LOGGER.debug("Hardware priming failed: %s", exc)


_thread = threading.Thread(target=_sample_loop, name="zhiai-hardware-sampler", daemon=True)
_thread.start()
_prime()


@PromptServer.instance.routes.get("/zhiai_nodes/hardware_monitor")
async def hardware_monitor(request):
    return web.json_response(_snapshot_copy(), headers={"Cache-Control": "no-store"})
