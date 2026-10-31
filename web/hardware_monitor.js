import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const EXTENSION_NAME = "ZhiAI.HardwareMonitor";
const SETTING_ID = "ZhiAI.HardwareMonitor.Enabled";
const UNIT_SETTING_ID = "ZhiAI.HardwareMonitor.MemoryPercent";
const ROOT_ID = "zhiai-hardware-monitor";
const ENDPOINT = "/zhiai_nodes/hardware_monitor";
const POLL_INTERVAL = 1000;

const ICONS = {
	cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 3v2M12 3v2M15 3v2M9 19v2M12 19v2M15 19v2M3 9h2M3 12h2M3 15h2M19 9h2M19 12h2M19 15h2"/></svg>',
	gpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8.5" cy="12" r="2.6"/><path d="M13 10h5M13 14h3"/></svg>',
	ram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="7" width="18" height="9" rx="1.5"/><path d="M6 16v2M9 16v2M12 16v2M15 16v2M18 16v2"/></svg>',
	vram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 20.5 8 12 12.5 3.5 8z"/><path d="M3.5 12 12 16.5 20.5 12"/><path d="M3.5 16 12 20.5 20.5 16"/></svg>',
	temp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0z"/><path d="M12 9v6"/></svg>',
};

const TEXT = {
	settingCategory: "Topbar Hardware Monitor",
	settingName: "Show hardware status in the top bar",
	settingUnitName: "Show RAM and VRAM as percentage",
	cpu: "CPU",
	gpu: "GPU",
	ram: "RAM",
	vram: "VRAM",
	temp: "GPU Temp",
};

const METRICS = [
	{ key: "cpu", icon: ICONS.cpu, from: "#2563eb", to: "#38bdf8" },
	{ key: "gpu", icon: ICONS.gpu, from: "#7c3aed", to: "#a78bfa" },
	{ key: "ram", icon: ICONS.ram, from: "#16a34a", to: "#4ade80" },
	{ key: "vram", icon: ICONS.vram, from: "#0ea5e9", to: "#22d3ee" },
	{ key: "temp", icon: ICONS.temp, from: "#dc2626", to: "#fb923c" },
];

const STYLE = `
#${ROOT_ID}{display:grid;grid-template-columns:131px 165px 166px;column-gap:7px;row-gap:4px;padding:4px 0 4px 4px;margin-right:4px;color:#cbd5e1;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:12px;line-height:1;white-space:nowrap;user-select:none;flex:0 0 auto;box-sizing:border-box;}
#${ROOT_ID}.zhiai-hw-hidden{display:none;}
#${ROOT_ID} .zhiai-hw-row{display:contents;}
#${ROOT_ID} .zhiai-hw-item{display:grid;align-items:center;gap:3px;height:12px;min-width:0;color:#94a3b8;}
#${ROOT_ID} .zhiai-hw-item[data-metric="cpu"],
#${ROOT_ID} .zhiai-hw-item[data-metric="gpu"]{grid-template-columns:12px 26px 48px 36px;}
#${ROOT_ID} .zhiai-hw-item[data-metric="ram"],
#${ROOT_ID} .zhiai-hw-item[data-metric="vram"]{grid-template-columns:12px 38px 48px 58px;}
#${ROOT_ID} .zhiai-hw-item[data-metric="temp"]{grid-template-columns:12px 61px 48px 36px;}
#${ROOT_ID}.zhiai-hw-percent{grid-template-columns:131px 143px 166px;}
#${ROOT_ID} .zhiai-hw-icon{display:flex;width:12px;height:12px;flex:0 0 auto;}
#${ROOT_ID} .zhiai-hw-icon svg{display:block;width:12px;height:12px;}
#${ROOT_ID} .zhiai-hw-label{overflow:hidden;font-size:12px;line-height:12px;text-overflow:ellipsis;white-space:nowrap;}
#${ROOT_ID} .zhiai-hw-bar{height:8px;min-width:0;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden;}
#${ROOT_ID} .zhiai-hw-fill{width:0;height:100%;border-radius:inherit;transition:width .35s ease;}
#${ROOT_ID} .zhiai-hw-value{min-width:0;overflow:hidden;color:#e2e8f0;font-size:12px;font-variant-numeric:tabular-nums;line-height:12px;text-align:left;white-space:nowrap;}
#${ROOT_ID} .zhiai-hw-brand{display:block;align-self:center;overflow:hidden;padding-left:3px;font-size:9px;line-height:12px;letter-spacing:.06em;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap;}
#${ROOT_ID} .zhiai-hw-brand b{font-weight:700;background:linear-gradient(90deg,#38bdf8,#a78bfa 55%,#f472b6);-webkit-background-clip:text;background-clip:text;color:transparent;}
#${ROOT_ID} .zhiai-hw-brand i{font-style:normal;font-weight:500;color:#64748b;}
#${ROOT_ID} .zhiai-hw-item[data-metric="cpu"] .zhiai-hw-icon{color:#38bdf8;}
#${ROOT_ID} .zhiai-hw-item[data-metric="gpu"] .zhiai-hw-icon{color:#8b5cf6;}
#${ROOT_ID} .zhiai-hw-item[data-metric="ram"] .zhiai-hw-icon{color:#10b981;}
#${ROOT_ID} .zhiai-hw-item[data-metric="vram"] .zhiai-hw-icon{color:#06b6d4;}
#${ROOT_ID} .zhiai-hw-item[data-metric="temp"] .zhiai-hw-icon{color:#ef4444;}
`;

const ROW_KEYS = [["cpu", "ram"], ["gpu", "vram", "temp"]];

const state = {
	enabled: true,
	memoryPercent: false,
	timer: null,
	inFlight: false,
	root: null,
	parts: {},
	rows: {},
	lastData: null,
};

function t(key) {
	return TEXT[key] ?? key;
}

function formatPercent(value) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) return "--";
	return number >= 10 ? `${Math.round(number)}%` : `${number.toFixed(1)}%`;
}

function formatIntegerPercent(value) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) return "--";
	return `${Math.round(number)}%`;
}

function formatGB(bytes) {
	const number = Number(bytes);
	if (!Number.isFinite(number) || number <= 0) return "0";
	const gb = number / 1073741824;
	return gb >= 10 ? `${Math.round(gb)}` : gb.toFixed(1);
}

function setBar(part, percent) {
	const number = Number(percent);
	const value = Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
	part.fill.style.width = `${value}%`;
}

function setVisible(key, visible) {
	const part = state.parts[key];
	if (part) part.item.style.display = visible ? "" : "none";
}

// 悬停时修改 title 会让原生提示反复消失重弹（每秒闪烁一次），
// 因此悬停期间只暂存新文本，等鼠标移开再写入。
function setTitle(item, text) {
	const cache = item.__zhiaiTitle || (item.__zhiaiTitle = {});
	cache.next = text;
	if (item.__zhiaiHover) return;
	if (cache.shown !== text) {
		item.title = text;
		cache.shown = text;
	}
}

function flushTitle(item) {
	const cache = item.__zhiaiTitle;
	if (!cache || cache.next === undefined || cache.next === cache.shown) return;
	item.title = cache.next;
	cache.shown = cache.next;
}

function createMetric(def) {
	const item = document.createElement("div");
	item.className = "zhiai-hw-item";
	item.dataset.metric = def.key;

	const icon = document.createElement("span");
	icon.className = "zhiai-hw-icon";
	icon.innerHTML = def.icon;

	const label = document.createElement("span");
	label.className = "zhiai-hw-label";

	const bar = document.createElement("div");
	bar.className = "zhiai-hw-bar";
	const fill = document.createElement("div");
	fill.className = "zhiai-hw-fill";
	fill.style.background = `linear-gradient(90deg, ${def.from}, ${def.to})`;
	bar.append(fill);

	const value = document.createElement("span");
	value.className = "zhiai-hw-value";
	value.textContent = "--";

	item.append(icon, label, bar, value);
	item.addEventListener("mouseenter", () => {
		item.__zhiaiHover = true;
	});
	item.addEventListener("mouseleave", () => {
		item.__zhiaiHover = false;
		flushTitle(item);
	});
	return { item, label, fill, value };
}

function build() {
	if (state.root) return;
	const style = document.createElement("style");
	style.id = "zhiai-hardware-monitor-style";
	style.textContent = STYLE;
	document.head.append(style);

	const root = document.createElement("div");
	root.id = ROOT_ID;
	root.className = "zhiai-hw-hidden";

	for (const keys of ROW_KEYS) {
		const row = document.createElement("div");
		row.className = "zhiai-hw-row";
		for (const key of keys) {
			const def = METRICS.find((metric) => metric.key === key);
			const part = createMetric(def);
			part.label.textContent = t(def.key);
			state.parts[def.key] = part;
			row.append(part.item);
		}
		state.rows[keys[0]] = row;
		root.append(row);
	}

	const brand = document.createElement("span");
	brand.className = "zhiai-hw-brand";
	const mark = document.createElement("b");
	mark.textContent = "ZhiAI";
	const name = document.createElement("i");
	name.textContent = "Hardware Monitor";
	brand.append("[ ", mark, " ", name, " ]");
	state.rows.cpu.append(brand);

	state.root = root;
}

function render(data) {
	const cpu = Number(data?.cpu);
	state.parts.cpu.value.textContent = formatIntegerPercent(cpu);
	setTitle(state.parts.cpu.item, String(data?.cpu_name || "").trim() || t("cpu"));
	setBar(state.parts.cpu, cpu);

	const ramTotal = Number(data?.ram_total) || 0;
	const ramUsed = Number(data?.ram_used) || 0;
	const reportedPercent = Number(data?.ram_percent);
	const ramPercent = Number.isFinite(reportedPercent) && reportedPercent >= 0
		? reportedPercent
		: ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0;
	state.parts.ram.value.textContent = state.memoryPercent
		? formatPercent(ramPercent)
		: `${formatGB(ramUsed)}/${formatGB(ramTotal)}G`;
	const ramSpec = String(data?.ram_spec || "").trim();
	setTitle(state.parts.ram.item, ramSpec || (ramTotal > 0 ? `${t("ram")} · ${formatGB(ramTotal)} GB` : t("ram")));
	setBar(state.parts.ram, ramPercent);

	const gpu = Array.isArray(data?.gpus) ? data.gpus[0] : null;
	const hasGpu = !!gpu;
	setVisible("gpu", hasGpu);
	setVisible("vram", hasGpu);
	setVisible("temp", hasGpu);
	const gpuRow = state.rows.gpu;
	if (gpuRow) gpuRow.style.display = hasGpu ? "" : "none";
	if (!hasGpu) return;

	const gpuName = String(gpu.name || "GPU");
	const gpuPercent = Number(gpu.utilization);
	state.parts.gpu.value.textContent = formatIntegerPercent(gpuPercent);
	setTitle(state.parts.gpu.item, gpuName);
	setBar(state.parts.gpu, gpuPercent);

	const vramTotal = Number(gpu.vram_total) || 0;
	const vramUsed = Number(gpu.vram_used) || 0;
	const vramPercent = vramTotal > 0 ? (vramUsed / vramTotal) * 100 : 0;
	state.parts.vram.value.textContent = state.memoryPercent
		? formatPercent(vramPercent)
		: `${formatGB(vramUsed)}/${formatGB(vramTotal)}G`;
	setTitle(state.parts.vram.item, gpuName);
	setBar(state.parts.vram, vramPercent);

	const temperature = Number(gpu.temperature);
	const temperatureText = Number.isFinite(temperature) && temperature >= 0 ? `${Math.round(temperature)}°C` : "--";
	state.parts.temp.value.textContent = temperatureText;
	setTitle(state.parts.temp.item, gpuName);
	setBar(state.parts.temp, temperature);
}

async function refresh() {
	if (!state.enabled || state.inFlight || document.hidden) return;
	state.inFlight = true;
	try {
		const response = await api.fetchApi(ENDPOINT, { cache: "no-store" });
		if (response.ok) {
			state.lastData = await response.json();
			render(state.lastData);
		}
	} catch (error) {
	} finally {
		state.inFlight = false;
	}
}

function start() {
	stop();
	refresh();
	state.timer = setInterval(refresh, POLL_INTERVAL);
}

function stop() {
	if (state.timer) {
		clearInterval(state.timer);
		state.timer = null;
	}
}

function applyEnabled(enabled) {
	state.enabled = enabled !== false;
	if (state.root) state.root.classList.toggle("zhiai-hw-hidden", !state.enabled);
	if (state.enabled) start();
	else stop();
}

function applyMemoryPercent(enabled) {
	state.memoryPercent = enabled === true;
	if (state.root) state.root.classList.toggle("zhiai-hw-percent", state.memoryPercent);
	if (state.lastData) render(state.lastData);
}

function mount() {
	const target = app.menu?.settingsGroup?.element;
	if (state.root?.isConnected) return true;
	if (!target?.parentElement) return false;
	target.before(state.root);
	return true;
}

function mountWithRetry() {
	if (mount()) return;
	let attempts = 0;
	const timer = setInterval(() => {
		if (mount() || ++attempts >= 20) {
			clearInterval(timer);
			if (state.root?.isConnected) applyEnabled(state.enabled);
		}
	}, 200);
}

function registerSetting() {
	const settings = app.ui?.settings;
	if (!settings?.addSetting) return;
	settings.addSetting({
		id: SETTING_ID,
		name: t("settingName"),
		category: ["ZhiAI", t("settingCategory"), "Enabled"],
		type: "boolean",
		defaultValue: true,
		onChange: (value) => applyEnabled(value),
	});
	settings.addSetting({
		id: UNIT_SETTING_ID,
		name: t("settingUnitName"),
		category: ["ZhiAI", t("settingCategory"), "MemoryPercent"],
		type: "boolean",
		defaultValue: false,
		onChange: (value) => applyMemoryPercent(value),
	});
	try {
		settings.addEventListener(`${SETTING_ID}.change`, (event) => applyEnabled(event?.detail?.value));
		settings.addEventListener(`${UNIT_SETTING_ID}.change`, (event) => applyMemoryPercent(event?.detail?.value));
	} catch (error) {
	}
}

app.registerExtension({
	name: EXTENSION_NAME,
	async init() {
		registerSetting();
	},
	async setup() {
		build();
		mountWithRetry();
		const storedUnit = app.ui?.settings?.getSettingValue?.(UNIT_SETTING_ID);
		applyMemoryPercent(!!storedUnit);
		const stored = app.ui?.settings?.getSettingValue?.(SETTING_ID);
		applyEnabled(stored === undefined ? true : !!stored);
	},
});
