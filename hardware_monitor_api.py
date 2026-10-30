from __future__ import annotations

import os
import platform
import sys
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
# 超过该时长没有任何接口请求即暂停采样，空闲时零开销
IDLE_TIMEOUT = 60.0

_nvml_state = None
_last_request = 0.0
_lock = threading.Lock()
_snapshot = {
    "cpu": 0.0,
    "cpu_name": "",
    "ram_spec": "",
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


def _sample_once(prev):
    """采样一次写入快照，返回新的 cpu_times 基准；prev 为 None 表示刚从空闲恢复。"""
    if prev is None:
        # 恢复时没有可用的时间窗口，用 0.1 秒短窗口重建基准
        cpu = psutil.cpu_percent(interval=0.1)
        prev = psutil.cpu_times()
    else:
        cur = psutil.cpu_times()
        cpu = _cpu_percent(prev, cur)
        prev = cur

    # Windows 下优先采用任务管理器口径，失败时保留上面的 psutil 结果
    perf = _perf_sample()
    if perf and perf.get("cpu") is not None:
        cpu = perf["cpu"]

    memory = psutil.virtual_memory()
    gpus = _gpu_stats()
    if perf and gpus:
        # 使用率对齐任务管理器；显存仍取 NVML（含驱动与 CUDA 上下文，更接近真实可用余量）
        if perf.get("gpu_util") is not None:
            gpus[0]["utilization"] = perf["gpu_util"]

    data = {
        "cpu": float(cpu if cpu is not None else _snapshot["cpu"]),
        "ram_used": int(memory.used),
        "ram_total": int(memory.total),
        "ram_percent": float(memory.percent),
        "gpus": gpus,
        "sampled_at": time.time(),
    }
    with _lock:
        _snapshot.update(data)
    return prev


def _is_active():
    return _last_request > 0 and (time.time() - _last_request) < IDLE_TIMEOUT


def _sample_loop():
    prev = psutil.cpu_times()
    while True:
        time.sleep(SAMPLE_INTERVAL)
        if not _is_active():
            # 空闲：不采样，丢弃基准，恢复时重建
            prev = None
            continue
        try:
            prev = _sample_once(prev)
        except Exception as exc:
            LOGGER.debug("Hardware sampling failed: %s", exc)


def _snapshot_copy():
    with _lock:
        data = dict(_snapshot)
    data["gpus"] = [dict(gpu) for gpu in data["gpus"]]
    return data


_pdh_state = None

# 任务管理器口径：CPU 用 "% Processor Utility"，GPU 使用率取最忙的引擎，
# 显存取 WDDM "Dedicated Usage"。与 psutil / NVML 的统计方式不同，数值会有差异。
_PDH_FMT_DOUBLE = 0x00000200
_PDH_MORE_DATA = 0x800007D2
_PDH_VALID_STATUS = (0x0, 0x1)


class _PdhCounters:
    """Windows 性能计数器读取（ctypes 直接调 pdh.dll，不启子进程）。"""

    def __init__(self):
        import ctypes
        from ctypes import wintypes

        class _Union(ctypes.Union):
            _fields_ = [
                ("longValue", wintypes.LONG),
                ("doubleValue", ctypes.c_double),
                ("largeValue", ctypes.c_longlong),
            ]

        class _Value(ctypes.Structure):
            _anonymous_ = ("u",)
            _fields_ = [("CStatus", wintypes.DWORD), ("u", _Union)]

        class _Item(ctypes.Structure):
            _fields_ = [("szName", wintypes.LPWSTR), ("FmtValue", _Value)]

        dll = ctypes.WinDLL("pdh")
        dll.PdhOpenQueryW.argtypes = [wintypes.LPCWSTR, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]
        dll.PdhOpenQueryW.restype = wintypes.DWORD
        dll.PdhAddEnglishCounterW.argtypes = [
            ctypes.c_void_p, wintypes.LPCWSTR, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p),
        ]
        dll.PdhAddEnglishCounterW.restype = wintypes.DWORD
        dll.PdhCollectQueryData.argtypes = [ctypes.c_void_p]
        dll.PdhCollectQueryData.restype = wintypes.DWORD
        dll.PdhGetFormattedCounterValue.argtypes = [
            ctypes.c_void_p, wintypes.DWORD, ctypes.POINTER(wintypes.DWORD), ctypes.POINTER(_Value),
        ]
        dll.PdhGetFormattedCounterValue.restype = wintypes.DWORD
        dll.PdhGetFormattedCounterArrayW.argtypes = [
            ctypes.c_void_p, wintypes.DWORD, ctypes.POINTER(wintypes.DWORD),
            ctypes.POINTER(wintypes.DWORD), ctypes.POINTER(_Item),
        ]
        dll.PdhGetFormattedCounterArrayW.restype = wintypes.DWORD

        self._ctypes = ctypes
        self._wintypes = wintypes
        self._dll = dll
        self._Value = _Value
        self._Item = _Item

        self._query = ctypes.c_void_p()
        if dll.PdhOpenQueryW(None, None, ctypes.byref(self._query)) != 0:
            raise RuntimeError("PdhOpenQueryW failed")
        self._last_collect = 0.0
        self._cpu = self._add(r"\Processor Information(_Total)\% Processor Utility")
        self._engine = self._add(r"\GPU Engine(*)\Utilization Percentage")
        self._vram = self._add(r"\GPU Adapter Memory(*)\Dedicated Usage")
        if not (self._cpu or self._engine or self._vram):
            raise RuntimeError("no performance counters available")

    def _add(self, path):
        counter = self._ctypes.c_void_p()
        status = self._dll.PdhAddEnglishCounterW(self._query, path, None, self._ctypes.byref(counter))
        if status != 0:
            LOGGER.debug("PDH counter unavailable (%s): %s", path, hex(status))
            return None
        return counter

    def _scalar(self, counter):
        value = self._Value()
        kind = self._wintypes.DWORD()
        status = self._dll.PdhGetFormattedCounterValue(
            counter, _PDH_FMT_DOUBLE, self._ctypes.byref(kind), self._ctypes.byref(value),
        )
        if status == 0 and value.CStatus in _PDH_VALID_STATUS:
            return float(value.doubleValue)
        return None

    def _array(self, counter):
        size = self._wintypes.DWORD(0)
        count = self._wintypes.DWORD(0)
        status = self._dll.PdhGetFormattedCounterArrayW(
            counter, _PDH_FMT_DOUBLE, self._ctypes.byref(size), self._ctypes.byref(count), None,
        )
        if status != _PDH_MORE_DATA or count.value == 0:
            return None
        # PDH 把结构体数组和实例名字符串放在同一块缓冲区，szName 指向缓冲区内部，
        # 因此必须按返回的字节数分配，不能只按结构体大小分配，否则会越界。
        buffer = (self._ctypes.c_char * size.value)()
        items = self._ctypes.cast(buffer, self._ctypes.POINTER(self._Item))
        status = self._dll.PdhGetFormattedCounterArrayW(
            counter, _PDH_FMT_DOUBLE, self._ctypes.byref(size), self._ctypes.byref(count), items,
        )
        if status != 0:
            return None
        return [
            (items[index].szName or "", float(items[index].FmtValue.doubleValue))
            for index in range(count.value)
            if items[index].FmtValue.CStatus in _PDH_VALID_STATUS
        ]

    @staticmethod
    def _luid(name):
        parts = name.split("_")
        if len(parts) < 3 or parts[0] != "luid":
            return ""
        return "_".join(parts[:3])

    def sample(self):
        now = time.time()
        gap = now - self._last_collect
        self._last_collect = now
        if self._dll.PdhCollectQueryData(self._query) != 0:
            return None
        if gap > 2.0 * SAMPLE_INTERVAL:
            # 首次采集或刚从空闲恢复：先用 0.1 秒短窗口补一次，避免长窗口算出错误速率
            time.sleep(0.1)
            if self._dll.PdhCollectQueryData(self._query) != 0:
                return None
        result = {}
        if self._cpu:
            cpu = self._scalar(self._cpu)
            if cpu is not None:
                result["cpu"] = min(100.0, max(0.0, cpu))

        adapters = self._array(self._vram) if self._vram else None
        luid = ""
        if adapters:
            # 显存占用最大的适配器视为独立显卡（任务管理器的 GPU 0）
            best = None
            for name, value in adapters:
                adapter = self._luid(name)
                if adapter and (best is None or value > best[1]):
                    best = (adapter, value)
            if best:
                luid, used = best
                result["vram_used"] = int(used)

        engines = self._array(self._engine) if self._engine else None
        if engines:
            values = [value for name, value in engines if not luid or luid in name]
            if values:
                result["gpu_util"] = min(100.0, max(0.0, max(values)))
        return result or None


def _perf_sample():
    global _pdh_state
    if _pdh_state is None:
        if os.name != "nt":
            _pdh_state = False
        else:
            try:
                _pdh_state = _PdhCounters()
            except Exception as exc:
                LOGGER.info("Windows performance counters unavailable: %s", exc)
                _pdh_state = False
    if not _pdh_state:
        return None
    try:
        return _pdh_state.sample()
    except Exception as exc:
        LOGGER.debug("Performance counter sampling failed: %s", exc)
        return None


def _cpu_model():
    """CPU 型号名：Windows 读注册表，Linux 读 /proc/cpuinfo，macOS 用 sysctl。"""
    try:
        if sys.platform.startswith("win"):
            import winreg
            path = r"HARDWARE\DESCRIPTION\System\CentralProcessor\0"
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, path) as key:
                return str(winreg.QueryValueEx(key, "ProcessorNameString")[0]).strip()
        if sys.platform == "darwin":
            import subprocess
            out = subprocess.run(
                ["sysctl", "-n", "machdep.cpu.brand_string"],
                capture_output=True,
                text=True,
                timeout=2,
            )
            return out.stdout.strip()
        with open("/proc/cpuinfo", encoding="utf-8", errors="ignore") as fh:
            for line in fh:
                if line.lower().startswith("model name"):
                    return line.split(":", 1)[1].strip()
    except Exception as exc:
        LOGGER.debug("CPU model detection failed: %s", exc)
    return platform.processor() or ""


def _ram_specs():
    """内存规格（总容量、类型、频率、条数）：Windows 通过 CIM 查询一次后缓存。"""
    if not sys.platform.startswith("win"):
        return ""
    try:
        import json
        import subprocess

        script = (
            "Get-CimInstance Win32_PhysicalMemory | "
            "Select-Object Manufacturer,Capacity,ConfiguredClockSpeed,Speed,SMBIOSMemoryType | "
            "ConvertTo-Json -Compress"
        )
        proc = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", script],
            capture_output=True,
            text=True,
            timeout=6,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if proc.returncode != 0 or not proc.stdout.strip():
            return ""
        modules = json.loads(proc.stdout)
        if isinstance(modules, dict):
            modules = [modules]
        kinds = {
            20: "DDR", 21: "DDR2", 24: "DDR3", 26: "DDR4", 27: "LPDDR",
            28: "LPDDR2", 29: "LPDDR3", 30: "LPDDR4", 34: "DDR5", 35: "LPDDR5",
        }
        capacities = [int(m.get("Capacity") or 0) for m in modules]
        capacities = [value for value in capacities if value > 0]
        if not capacities:
            return ""
        total_gb = sum(capacities) // 1073741824
        speed = max(
            (
                int(m.get("ConfiguredClockSpeed") or 0) or int(m.get("Speed") or 0)
                for m in modules
            ),
            default=0,
        )
        kind = next(
            (kinds[int(m.get("SMBIOSMemoryType") or 0)] for m in modules
             if int(m.get("SMBIOSMemoryType") or 0) in kinds),
            "",
        )
        parts = []
        makers = []
        for module in modules:
            maker = str(module.get("Manufacturer") or "").strip()
            if maker.lower() in ("unknown", "none"):
                maker = ""
            if maker and maker not in makers:
                makers.append(maker)
        if makers:
            parts.append(" / ".join(makers))
        if kind and speed:
            parts.append(f"{kind}-{speed}")
        elif speed:
            parts.append(f"{speed} MT/s")
        module_gb = capacities[0] // 1073741824
        if len(capacities) > 1 and len(set(capacities)) == 1:
            parts.append(f"{len(capacities)} × {module_gb} GB")
        elif len(capacities) == 1:
            parts.append(f"{module_gb} GB")
        return " · ".join(parts)
    except Exception as exc:
        LOGGER.debug("RAM spec detection failed: %s", exc)
        return ""


def _prime():
    """先填充静态硬件信息、内存与 GPU，避免页面首次打开时出现空行或 0/0G。"""
    try:
        memory = psutil.virtual_memory()
        _perf_sample()  # 建立性能计数器速率基准
        with _lock:
            _snapshot.update({
                "cpu_name": _cpu_model(),
                "ram_spec": _ram_specs(),
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
    global _last_request
    _last_request = time.time()
    return web.json_response(_snapshot_copy(), headers={"Cache-Control": "no-store"})
