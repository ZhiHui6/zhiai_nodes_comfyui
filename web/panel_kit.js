export const PANEL_TOKENS = {
    color: {
        base: "#070D1A",
        glass: "rgba(9, 17, 32, 0.74)",
        glassDeep: "rgba(5, 11, 22, 0.88)",
        glassSoft: "rgba(59, 130, 246, 0.08)",
        glassHover: "rgba(59, 130, 246, 0.16)",
        border: "rgba(96, 165, 250, 0.18)",
        borderHi: "rgba(147, 197, 253, 0.42)",
        line: "#2C5080",
        text: "#DDE9F5",
        textBright: "#F2FAFF",
        textDim: "#93A9C4",
        textLabel: "#B4C7DE",
        textFaint: "#7C93B0",
        textGhost: "#4E617E",
        primary: "#3B82F6",
        primaryDeep: "#2563EB",
        primaryLight: "#93C5FD",
        primaryGlow: "rgba(59, 130, 246, 0.35)",
        accent: "#8B5CF6",
        success: "#34D399",
        error: "#F87171",
        warn: "#FBBF24",
        info: "#60A5FA",
    },
    radius: { sm: "6px", md: "8px", lg: "10px", pill: "999px" },
    controlHeight: "24px",
    action: {
        primary: "#2563EB",
        primaryHover: "#3B82F6",
        danger: "#DC2626",
        dangerHover: "#EF4444",
        success: "#059669",
        successHover: "#10B981",
        neutral: "#475569",
        neutralHover: "#64748B",
        quiet: "#334155",
    },
    type: {
        display: "19px",
        title: "15px",
        body: "13.5px",
        label: "12.5px",
        micro: "11.5px",
        lhTight: "1.5",
        lhBase: "1.7",
    },
    blur: { panel: "blur(18px) saturate(1.5)", control: "blur(10px) saturate(1.3)" },
    shadow: {
        control: "0 4px 14px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        toolbar: "0 10px 26px rgba(2, 6, 23, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.07)",
        panel: "0 34px 90px rgba(2, 6, 23, 0.66), inset 0 1px 0 rgba(255, 255, 255, 0.09)",
        inset: "inset 0 2px 6px rgba(2, 6, 23, 0.40)",
    },
    motion: { fast: "140ms", base: "220ms", slow: "320ms", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    font: "'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
};

export const PANEL_TITLE_CHIP_BG = "linear-gradient(180deg, rgba(96, 165, 250, 0.30), rgba(59, 130, 246, 0.20))";
export const PANEL_TITLE_CHIP_INK = "#DBEAFE";

const PK_LINK_TIP_KEY = "linkedByInput";

const _pkStyleChunks = new Set();

export function injectPanelStyles(chunkId, css) {
    if (_pkStyleChunks.has(chunkId)) return;
    _pkStyleChunks.add(chunkId);
    let styleEl = document.getElementById("panel-kit-styles");
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "panel-kit-styles";
        document.head.appendChild(styleEl);
    }
    styleEl.appendChild(document.createTextNode("\n" + css));
}

const PANEL_CSS = `
.pk-panel-host,
.pk-panel-host *,
.pk-panel,
.pk-panel * { box-sizing: border-box; }
.pk-panel-host {
    width: 100%;
    padding: 0 0 2px;
    background: none;
    border: none;
}
.pk-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    min-width: 0;
    background: none;
    border-radius: ${PANEL_TOKENS.radius.lg};
    font-family: ${PANEL_TOKENS.font};
    font-size: ${PANEL_TOKENS.type.body};
    line-height: ${PANEL_TOKENS.type.lhTight};
    color: ${PANEL_TOKENS.color.text};
}

.pk-card {
    position: relative;
    border-radius: ${PANEL_TOKENS.radius.lg};
    background:
        linear-gradient(180deg, rgba(59, 130, 246, 0.26), rgba(59, 130, 246, 0.08) 38px, transparent 38px),
        linear-gradient(180deg, #0e1a2e, #070e1b);
}
.pk-card::after {
    content: "";
    position: absolute;
    inset: -0.5px;
    border: 1px solid #2C5080;
    border-radius: calc(${PANEL_TOKENS.radius.lg} + 0.5px);
    pointer-events: none;
    z-index: 3;
}
.pk-card__head {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
    height: 38px;
    padding: 7px 10px;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
}
.pk-card__head:focus-visible {
    outline: 2px solid ${PANEL_TOKENS.color.primaryLight};
    outline-offset: -2px;
}
.pk-card__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    border-radius: ${PANEL_TOKENS.radius.sm};
    color: ${PANEL_TOKENS.color.primaryLight};
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(37, 99, 235, 0.10));
    border: 1px solid rgba(59, 130, 246, 0.30);
    line-height: 0;
}
.pk-card__title {
    flex: 0 0 auto;
    font-size: ${PANEL_TOKENS.type.body};
    font-weight: 600;
    letter-spacing: 0.01em;
    color: ${PANEL_TOKENS.color.textBright};
    white-space: nowrap;
}
.pk-card__actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
}
.pk-card__actions > .pk-field {
    margin-left: 14px;
}
.pk-card__body { display: block; }
.pk-fields {
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 9px 11px 12px;
}

.pk-fields__row {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: 6px;
    align-items: center;
    min-width: 0;
}
.pk-fields__row .pk-field {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 0;
    min-width: 0;
    height: 22px;
    box-sizing: border-box;
    border: 1px solid ${PANEL_TOKENS.color.border};
    border-radius: ${PANEL_TOKENS.radius.sm};
    overflow: hidden;
    transition: border-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-fields__row .pk-field__label {
    flex: 0 0 auto;
    justify-content: center;
    min-width: 0;
    line-height: 1;
    padding: 0 4px;
    border: none;
    font-size: ${PANEL_TOKENS.type.micro};
    background: rgba(78, 148, 248, 0.25);
    color: ${PANEL_TITLE_CHIP_INK};
    font-weight: 600;
}
.pk-fields__row .pk-control {
    flex: 1 1 0;
    min-width: 0;
}
.pk-fields__row .pk-select {
    height: 22px;
    line-height: 1;
    padding: 0 22px 0 4px;
    border: none;
    border-radius: 0;
    font-size: ${PANEL_TOKENS.type.micro};
}
.pk-fields__row .pk-field:hover { border-color: ${PANEL_TOKENS.color.borderHi}; }
.pk-fields__row .pk-field:has(.pk-select:open),
.pk-fields__row .pk-field:has(.pk-open) { border-color: ${PANEL_TOKENS.color.primary}; }
.pk-fields__row .pk-field[data-locked="true"] .pk-field__label { opacity: 0.45; }

.pk-fields--tiles {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: 0;
    padding: 3px;
}
.pk-fields--tiles .pk-field {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 0;
    height: 26px;
    padding: 0 5px;
}
.pk-fields--tiles .pk-field + .pk-field { border-left: 1px solid ${PANEL_TOKENS.color.border}; }
.pk-fields--tiles .pk-field__label {
    flex: 0 0 auto;
    font-size: ${PANEL_TOKENS.type.micro};
}
.pk-fields--tiles .pk-control {
    flex: 0 1 auto;
    justify-content: center;
    gap: 0;
}
.pk-fields--tiles .pk-number {
    flex: 0 1 auto;
    width: calc(5ch + 16px);
    min-width: 40px;
    height: 20px;
}

.pk-fields--wide { padding: 0 3px; }
.pk-fields--wide .pk-field {
    padding: 4px 8px;
    height: calc(${PANEL_TOKENS.controlHeight} + 8px);
}
.pk-fields--wide .pk-icon-btn { flex: 0 0 auto; }
.pk-fields__wide-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    min-width: 0;
}
.pk-fields__wide-row .pk-field {
    flex: 1 1 auto;
    min-width: 0;
    grid-template-columns: minmax(74px, 34%) minmax(0, 1fr);
}
.pk-fields__wide-row .pk-field--label-hidden {
    grid-template-columns: minmax(0, 1fr);
    flex: 0 1 auto;
}

.pk-fields--grid {
    display: grid;
    grid-template-columns: repeat(var(--pk-grid-cols, 2), minmax(0, 1fr));
    grid-auto-rows: calc(${PANEL_TOKENS.controlHeight} + 8px);
    gap: 0;
    padding: 0;
    align-items: stretch;
}
.pk-fields--grid .pk-field {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 4px 11px;
    border-radius: 0;
}
.pk-fields--grid .pk-field__note {
    flex: 0 0 100%;
    margin-bottom: 0;
}
.pk-fields--grid[data-cols="2"] .pk-field:nth-child(4n+3),
.pk-fields--grid[data-cols="2"] .pk-field:nth-child(4n+4),
.pk-fields--grid[data-cols="3"] .pk-field:nth-child(6n+4),
.pk-fields--grid[data-cols="3"] .pk-field:nth-child(6n+5),
.pk-fields--grid[data-cols="3"] .pk-field:nth-child(6n+6) {
    background: rgba(59, 130, 246, 0.08);
}
.pk-fields--grid[data-band-flip="true"][data-cols="2"] .pk-field:nth-child(4n+3),
.pk-fields--grid[data-band-flip="true"][data-cols="2"] .pk-field:nth-child(4n+4),
.pk-fields--grid[data-band-flip="true"][data-cols="3"] .pk-field:nth-child(6n+4),
.pk-fields--grid[data-band-flip="true"][data-cols="3"] .pk-field:nth-child(6n+5),
.pk-fields--grid[data-band-flip="true"][data-cols="3"] .pk-field:nth-child(6n+6) {
    background: none;
}
.pk-fields--grid[data-band-flip="true"][data-cols="2"] .pk-field:nth-child(4n+1),
.pk-fields--grid[data-band-flip="true"][data-cols="2"] .pk-field:nth-child(4n+2),
.pk-fields--grid[data-band-flip="true"][data-cols="3"] .pk-field:nth-child(6n+1),
.pk-fields--grid[data-band-flip="true"][data-cols="3"] .pk-field:nth-child(6n+2),
.pk-fields--grid[data-band-flip="true"][data-cols="3"] .pk-field:nth-child(6n+3) {
    background: rgba(59, 130, 246, 0.08);
}
.pk-fields--grid[data-cols="2"] .pk-field:not(.pk-field--span):nth-child(2n) {
    border-left: 1px solid ${PANEL_TOKENS.color.border};
}
.pk-fields--grid[data-cols="2"] .pk-field:not(.pk-field--span):nth-child(2n+1) {
    padding-right: 20px;
}
.pk-fields--grid[data-cols="2"] .pk-field:not(.pk-field--span):nth-child(2n) {
    padding-left: 20px;
}
.pk-fields--grid[data-cols="3"] .pk-field:not(.pk-field--span):nth-child(3n+2),
.pk-fields--grid[data-cols="3"] .pk-field:not(.pk-field--span):nth-child(3n+3) {
    border-left: 1px solid ${PANEL_TOKENS.color.border};
}
.pk-fields--grid .pk-field--span { grid-column: 1 / -1; }
.pk-fields--grid .pk-field__label {
    flex: 0 0 auto;
    max-width: 42%;
}
.pk-fields--grid .pk-control {
    flex: 1 1 0;
    min-width: 0;
}
.pk-fields--grid .pk-number {
    flex: 0 0 auto;
    width: calc(5ch + 18px);
    min-width: 0;
    height: 20px;
}
.pk-fields--grid .pk-field[data-widget="seed"] .pk-number {
    width: calc(10ch + 18px);
}
.pk-fields--grid .pk-field[data-widget="control_after_generate"] .pk-select {
    height: 22px;
    line-height: 20px;
    font-size: ${PANEL_TOKENS.type.micro};
}
.pk-control--folder .pk-input {
    height: 20px;
}
.pk-control--folder .pk-input::placeholder {
    font-size: 12px;
}
.pk-fields--grid .pk-field--range { justify-content: flex-start; }
.pk-fields--grid .pk-control--split {
    flex: 1 1 0;
    justify-content: flex-end;
    gap: 8px;
}
.pk-fields--grid .pk-control--split .pk-range-wrap {
    flex: 0 1 96px;
    min-width: 56px;
}
.pk-fields--grid .pk-control--end { justify-content: flex-end; }

.pk-field {
    display: grid;
    grid-template-columns: minmax(74px, 34%) minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    min-width: 0;
}
.pk-field--block {
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
    gap: 6px;
}
.pk-field[data-disabled="true"] { opacity: 0.58; }
.pk-field__flag {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    color: ${PANEL_TOKENS.color.success};
}
.pk-field[data-locked="true"] .pk-field__flag { color: ${PANEL_TOKENS.color.textFaint}; }
.pk-field--side-title .pk-field__label .pk-field__flag {
    color: inherit;
    writing-mode: horizontal-tb;
}
.pk-field[data-locked="true"] .pk-control {
    opacity: 0.45;
    cursor: not-allowed;
}
.pk-card[data-dim-locked="true"] .pk-field[data-locked="true"] .pk-field__label {
    opacity: 0.45;
}
.pk-field__label {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    font-size: ${PANEL_TOKENS.type.label};
    font-weight: 500;
    letter-spacing: 0.01em;
    color: ${PANEL_TOKENS.color.textLabel};
}
.pk-field__label-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.pk-field__link {
    flex: 0 0 auto;
    display: inline-flex;
    color: ${PANEL_TOKENS.color.info};
    line-height: 0;
}
.pk-field__note {
    grid-column: 1 / -1;
    font-size: ${PANEL_TOKENS.type.micro};
    color: ${PANEL_TOKENS.color.textFaint};
    margin-bottom: -3px;
}
.pk-control {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

.pk-field--side-title .pk-field__frame {
    display: flex;
    align-items: stretch;
    min-width: 0;
    grid-column: 1 / -1;
    background: rgba(4, 11, 22, 0.66);
    border: 1px solid ${PANEL_TOKENS.color.border};
    border-radius: ${PANEL_TOKENS.radius.sm};
    overflow: hidden;
    transition: border-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-field--side-title .pk-field__frame:focus-within {
    border-color: ${PANEL_TOKENS.color.primary};
}
.pk-field--side-title[data-locked="true"] .pk-field__label {
    color: #FFC2B5;
    background: linear-gradient(180deg, rgba(255, 138, 117, 0.30), rgba(255, 138, 117, 0.20));
}
.pk-field--side-title[data-locked="true"] .pk-field__frame { border-color: #9C5C5A; }
.pk-field--side-title .pk-field__label {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 5px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: ${PANEL_TOKENS.type.micro};
    font-weight: 500;
    letter-spacing: 0.14em;
    white-space: nowrap;
    color: ${PANEL_TITLE_CHIP_INK};
    background: ${PANEL_TITLE_CHIP_BG};
    cursor: default;
    user-select: none;
}
.pk-field--side-title .pk-field__label[data-inert="true"] { pointer-events: none; }
.pk-field--side-title .pk-field__link { writing-mode: horizontal-tb; }
.pk-field--side-title .pk-control { flex: 1 1 auto; min-width: 0; }
.pk-field--side-title .pk-textarea {
    flex: 1 1 auto;
    min-width: 0;
    line-height: 1.3;
    height: calc(3px + 6 * 15.6px);
    align-self: center;
    padding: 1px 3px 2px;
    background: transparent;
    border: none;
    border-radius: 0;
    resize: none;
    overscroll-behavior: contain;
}

.pk-control--select { justify-content: flex-end; }
.pk-control--select::after {
    content: "";
    position: absolute;
    right: 12px;
    top: 50%;
    width: 8px;
    height: 8px;
    aspect-ratio: 1 / 1;
    margin-top: -4px;
    box-sizing: border-box;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpolyline points='1,2.5 4,5.5 7,2.5' fill='none' stroke='%2393C5FD' stroke-width='1.4'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    pointer-events: none;
}
.pk-control--select:has(.pk-select:open)::after,
.pk-control--select.pk-open::after {
    transform: rotate(180deg);
}
.pk-control--select:has(.pk-select:open) .pk-select,
.pk-control--select.pk-open .pk-select {
    border-color: ${PANEL_TOKENS.color.primary};
    box-shadow: none;
}
.pk-select {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: ${PANEL_TOKENS.controlHeight};
    line-height: calc(${PANEL_TOKENS.controlHeight} - 2px);
    align-content: center;
    padding: 0 33px 0 10px;
    font-family: inherit;
    font-size: ${PANEL_TOKENS.type.body};
    text-align: center;
    color: ${PANEL_TOKENS.color.text};
    background: rgba(4, 11, 22, 0.66);
    border: 1px solid ${PANEL_TOKENS.color.border};
    border-radius: ${PANEL_TOKENS.radius.sm};
    outline: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.pk-select:hover:not([disabled]) {
    border-color: ${PANEL_TOKENS.color.borderHi};
    background: rgba(8, 18, 34, 0.80);
}
.pk-select:focus-visible {
    border-color: ${PANEL_TOKENS.color.primary};
    box-shadow: 0 0 0 2px ${PANEL_TOKENS.color.primaryGlow};
}
.pk-select option {
    background: ${PANEL_TOKENS.color.base};
    color: ${PANEL_TOKENS.color.text};
    font-size: 16px;
}

.pk-check {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: ${PANEL_TOKENS.controlHeight};
    font-size: ${PANEL_TOKENS.type.label};
    color: ${PANEL_TOKENS.color.textDim};
    line-height: 1;
    white-space: nowrap;
    user-select: none;
}
.pk-check__box {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    flex: 0 0 auto;
    font-size: inherit;
    width: 1em;
    height: 1em;
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
    margin: 0;
    padding: 0;
    aspect-ratio: 1;
    border: 1px solid ${PANEL_TOKENS.color.primaryLight};
    border-radius: 0;
    background: rgba(4, 11, 22, 0.66);
    cursor: pointer;
    transition: background-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing},
                border-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-check__box:hover:not(:checked):not(:disabled) {
    background: rgba(59, 130, 246, 0.22);
}
.pk-check__box:checked {
    background: ${PANEL_TOKENS.color.primary};
    border-color: ${PANEL_TOKENS.color.primary};
}
.pk-check__box:checked::after {
    content: "";
    position: absolute;
    inset: 0;
    background: #FFFFFF;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='5.4 13.2 10 16.3 18.6 7.7' fill='none' stroke='%23fff' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='5.4 13.2 10 16.3 18.6 7.7' fill='none' stroke='%23fff' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
}
.pk-check__box:focus-visible {
    outline: 2px solid ${PANEL_TOKENS.color.primaryGlow};
    outline-offset: 2px;
}
.pk-check__label {
    font-weight: 600;
    color: inherit;
}
.pk-card__head .pk-field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    grid-template-columns: none;
}
.pk-card__head .pk-check {
    gap: 4px;
    height: auto;
    padding: 3px 8px;
    background: rgba(4, 11, 22, 0.55);
    border: 1px solid ${PANEL_TOKENS.color.border};
    border-radius: ${PANEL_TOKENS.radius.sm};
    font-size: ${PANEL_TOKENS.type.micro};
}
.pk-card__head .pk-check__label {
    font-weight: 500;
}

.pk-input,
.pk-textarea {
    width: 100%;
    min-width: 0;
    font-family: inherit;
    font-size: ${PANEL_TOKENS.type.label};
    color: ${PANEL_TOKENS.color.text};
    background: rgba(4, 11, 22, 0.66);
    border: 1px solid ${PANEL_TOKENS.color.border};
    border-radius: ${PANEL_TOKENS.radius.sm};
    outline: none;
    transition: border-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing},
                box-shadow ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-input { height: ${PANEL_TOKENS.controlHeight}; padding: 0 9px; }
.pk-textarea {
    min-height: 74px;
    max-height: 220px;
    padding: 8px 9px;
    font-size: 12px;
    line-height: ${PANEL_TOKENS.type.lhBase};
    resize: vertical;
}
.pk-input::placeholder,
.pk-textarea::placeholder { color: ${PANEL_TOKENS.color.textGhost}; }
.pk-input:hover:not([disabled]),
.pk-textarea:hover:not([disabled]) { border-color: ${PANEL_TOKENS.color.borderHi}; }
.pk-input:focus-visible,
.pk-textarea:focus-visible {
    border-color: ${PANEL_TOKENS.color.primary};
    box-shadow: none;
}
.pk-input:disabled,
.pk-textarea:disabled,
.pk-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.pk-control--folder { gap: 7px; }
.pk-field:has(.pk-control--folder) {
    grid-template-columns: minmax(74px, auto) minmax(0, 1fr);
}
.pk-control--folder .pk-input { flex: 1 1 auto; width: auto; min-width: 0; }
.pk-control--folder .pk-field__folder-btn {
    flex: 0 0 auto;
    height: 20px;
    padding: 0 6px;
    font-size: ${PANEL_TOKENS.type.micro};
    font-weight: 400;
    color: #F8FAFC;
    background: ${PANEL_TOKENS.color.primary};
    border: 1px solid transparent;
    border-radius: ${PANEL_TOKENS.radius.sm};
    box-shadow: none;
}
.pk-control--folder .pk-field__folder-btn:hover {
    color: #FFFFFF;
    background: #4F8FF7;
    border-color: transparent;
    box-shadow: none;
}
.pk-control--folder .pk-field__folder-btn:active {
    box-shadow: none;
}
.pk-control--folder .pk-field__folder-btn[disabled] {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
}
.pk-mini-btn__glyph { display: inline-flex; line-height: 0; }
.pk-control--folder.pk-drop-active .pk-input {
    border-color: ${PANEL_TOKENS.color.primary};
    background: rgba(59, 130, 246, 0.14);
}
.pk-control--folder.pk-locating .pk-input {
    border-color: ${PANEL_TOKENS.color.primary};
    background: rgba(59, 130, 246, 0.10);
}

.pk-number {
    flex: 0 0 auto;
    width: 56px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    padding: 0 8px;
}
.pk-number--combo { flex: 0 0 56px; }
.pk-number::-webkit-outer-spin-button,
.pk-number::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.pk-number[type="number"] { -moz-appearance: textfield; appearance: textfield; }
.pk-range-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
}
.pk-range {
    --pk-range-fill: 50%;
    width: 100%;
    min-width: 0;
    height: 20px;
    margin: 0;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
}
.pk-range::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: ${PANEL_TOKENS.radius.pill};
    background: linear-gradient(90deg,
        ${PANEL_TOKENS.color.primary} 0%,
        ${PANEL_TOKENS.color.primary} var(--pk-range-fill),
        rgba(148, 163, 184, 0.40) var(--pk-range-fill),
        rgba(148, 163, 184, 0.40) 100%);
}
.pk-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 0;
    height: 0;
    margin: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    opacity: 0;
}
.pk-range:focus-visible {
    outline: 2px solid ${PANEL_TOKENS.color.primaryLight};
    outline-offset: 3px;
    border-radius: ${PANEL_TOKENS.radius.pill};
}
.pk-range::-moz-range-track {
    height: 4px;
    border-radius: ${PANEL_TOKENS.radius.pill};
    background: rgba(148, 163, 184, 0.40);
}
.pk-range::-moz-range-progress {
    height: 4px;
    border-radius: ${PANEL_TOKENS.radius.pill};
    background: ${PANEL_TOKENS.color.primary};
}
.pk-range::-moz-range-thumb {
    width: 0;
    height: 0;
    border: none;
    background: transparent;
    opacity: 0;
}
.pk-range__thumb {
    position: absolute;
    top: 50%;
    left: 0;
    box-sizing: border-box;
    width: 8px;
    height: 14px;
    margin-top: -7px;
    border-radius: 3px;
    background: #EFF6FF;
    border: 1px solid ${PANEL_TOKENS.color.primary};
    box-shadow: 0 2px 6px rgba(2, 6, 23, 0.60);
    pointer-events: none;
}

.pk-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
    padding: 1px;
    background: transparent;
    border: 0;
    border-radius: 999px;
    color: inherit;
    font: inherit;
    cursor: pointer;
}
.pk-switch__track {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 2px 0 0;
    flex: 0 0 auto;
    box-sizing: border-box;
    width: 42px;
    height: 16px;
    min-width: 42px;
    max-width: 42px;
    min-height: 16px;
    max-height: 16px;
    border: 1px solid #2C5080;
    border-radius: 999px;
    background: #2B2E33;
    transition: background-color ${PANEL_TOKENS.motion.base} ${PANEL_TOKENS.motion.easing};
}
.pk-switch__track::before {
    content: "Off";
    flex: 1 1 auto;
    min-width: 0;
    text-align: center;
    text-transform: uppercase;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.01em;
    line-height: 1;
    color: #FFFFFF;
    transition: color ${PANEL_TOKENS.motion.base} ${PANEL_TOKENS.motion.easing};
}
.pk-switch__lamp {
    flex: 0 0 auto;
    width: 16px;
    height: 10px;
    min-width: 16px;
    max-width: 16px;
    min-height: 10px;
    max-height: 10px;
    margin: 0;
    border: 0;
    border-radius: 5px;
    background: #4A5058;
    transition: background-color ${PANEL_TOKENS.motion.base} ${PANEL_TOKENS.motion.easing},
                box-shadow ${PANEL_TOKENS.motion.base} ${PANEL_TOKENS.motion.easing};
}
.pk-switch[aria-checked="true"] .pk-switch__track::before {
    content: "On";
    color: ${PANEL_TOKENS.color.primary};
}
.pk-switch[aria-checked="true"] .pk-switch__lamp {
    background: ${PANEL_TOKENS.color.primary};
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.85);
    animation: pk-switch-ignite 300ms ${PANEL_TOKENS.motion.easing};
}
@keyframes pk-switch-ignite {
    0% { background: ${PANEL_TOKENS.color.primaryDeep}; box-shadow: 0 0 2px rgba(59, 130, 246, 0.40); }
    45% { background: ${PANEL_TOKENS.color.primaryLight}; box-shadow: 0 0 8px rgba(96, 165, 250, 0.95); }
    100% { background: ${PANEL_TOKENS.color.primary}; box-shadow: 0 0 4px rgba(59, 130, 246, 0.85); }
}
.pk-switch:active .pk-switch__track { background: #1C1F23; }
.pk-switch:focus-visible {
    outline: 2px solid ${PANEL_TOKENS.color.primaryLight};
    outline-offset: 2px;
}

.pk-mini-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex: 0 0 auto;
    margin-left: auto;
    height: 22px;
    padding: 0 9px;
    font-family: inherit;
    font-size: ${PANEL_TOKENS.type.micro};
    color: ${PANEL_TOKENS.color.textDim};
    background: transparent;
    border: 1px solid ${PANEL_TOKENS.color.border};
    border-radius: ${PANEL_TOKENS.radius.pill};
    cursor: pointer;
    transition: color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing},
                background-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing},
                border-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-mini-btn:hover {
    color: ${PANEL_TOKENS.color.textBright};
    background: ${PANEL_TOKENS.color.glassHover};
    border-color: ${PANEL_TOKENS.color.borderHi};
}
.pk-mini-btn:focus-visible {
    outline: 2px solid ${PANEL_TOKENS.color.primaryLight};
    outline-offset: 1px;
}

.pk-icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 0;
    background: transparent;
    color: ${PANEL_TOKENS.color.textDim};
    border: none;
    border-radius: ${PANEL_TOKENS.radius.sm};
    cursor: pointer;
    transition: color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing},
                background-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing},
                box-shadow ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-icon-btn--md,
.pk-icon-btn--sm { width: ${PANEL_TOKENS.controlHeight}; height: ${PANEL_TOKENS.controlHeight}; }
.pk-icon-btn--text {
    width: auto;
    height: 22px;
    padding: 0 9px;
    gap: 5px;
    border: 1px solid ${PANEL_TOKENS.color.border};
    border-radius: ${PANEL_TOKENS.radius.pill};
    font-size: ${PANEL_TOKENS.type.micro};
    font-family: inherit;
}
.pk-icon-btn--text:hover {
    background: ${PANEL_TOKENS.color.glassHover};
    border-color: ${PANEL_TOKENS.color.borderHi};
}
.pk-icon-btn--text.pk-icon-btn--success {
    border-color: rgba(52, 211, 153, 0.45);
    box-shadow: 0 4px 12px rgba(52, 211, 153, 0.18);
}
.pk-icon-btn--text.pk-icon-btn--error {
    border-color: rgba(248, 113, 113, 0.45);
    box-shadow: 0 4px 12px rgba(248, 113, 113, 0.18);
}
.pk-icon-btn--text.pk-icon-btn--loading {
    border-color: rgba(59, 130, 246, 0.35);
}
.pk-icon-btn__glyph { display: inline-flex; align-items: center; justify-content: center; line-height: 0; }
.pk-icon-btn__text { display: inline-block; line-height: 1; white-space: nowrap; }
.pk-icon-btn:hover {
    color: ${PANEL_TOKENS.color.textBright};
    background: ${PANEL_TOKENS.color.glassHover};
    box-shadow: ${PANEL_TOKENS.shadow.control};
}
.pk-icon-btn--restore:hover { color: ${PANEL_TOKENS.color.success}; }
.pk-icon-btn--clear:hover { color: ${PANEL_TOKENS.color.error}; }
.pk-icon-btn--template:hover { color: ${PANEL_TOKENS.color.primaryLight}; }
.pk-icon-btn--danger {
    color: #FFFFFF;
    background: ${PANEL_TOKENS.action.danger};
}
.pk-icon-btn--danger:hover {
    color: #FFFFFF;
    background: ${PANEL_TOKENS.action.dangerHover};
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}
.pk-icon-btn:focus-visible {
    outline: 2px solid ${PANEL_TOKENS.color.primaryLight};
    outline-offset: 2px;
}
.pk-icon-btn[disabled] { opacity: 0.55; cursor: not-allowed; }
.pk-icon-btn--loading {
    color: ${PANEL_TOKENS.color.primaryLight};
    background: rgba(59, 130, 246, 0.16);
}
.pk-icon-btn--loading .pk-icon-btn__glyph { animation: pk-spin 900ms linear infinite; }
.pk-icon-btn--success {
    color: ${PANEL_TOKENS.color.success};
    background: rgba(52, 211, 153, 0.16);
    box-shadow: 0 6px 18px rgba(52, 211, 153, 0.22);
}
.pk-icon-btn--error {
    color: ${PANEL_TOKENS.color.error};
    background: rgba(248, 113, 113, 0.16);
    box-shadow: 0 6px 18px rgba(248, 113, 113, 0.22);
}
@keyframes pk-spin { to { transform: rotate(360deg); } }

.pk-textarea::-webkit-scrollbar { display: none; width: 0; height: 0; }
.pk-textarea { scrollbar-width: none; }

.pk-scroll {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 12px;
    align-self: center;
    user-select: none;
}
.pk-scroll[hidden] { display: none; }
.pk-scroll__bar {
    position: relative;
    flex: 1 1 auto;
    width: 8px;
    border-radius: ${PANEL_TOKENS.radius.pill};
    background: rgba(148, 163, 184, 0.12);
}
.pk-scroll__thumb {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    min-height: 20px;
    border-radius: ${PANEL_TOKENS.radius.pill};
    background-color: rgba(147, 197, 253, 0.45);
    cursor: pointer;
    touch-action: none;
    transition: background-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-scroll__thumb:hover,
.pk-scroll__thumb[data-dragging="true"] { background-color: rgba(147, 197, 253, 0.7); }
.pk-scroll__btn {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    padding: 0;
    border: none;
    border-radius: 3px;
    background: transparent;
    color: ${PANEL_TOKENS.color.textDim};
    cursor: pointer;
    transition: color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing},
                background-color ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-scroll__btn:hover { color: ${PANEL_TOKENS.color.textBright}; background: ${PANEL_TOKENS.color.glassHover}; }
.pk-scroll__btn > svg { flex: 0 0 auto; margin: auto; }
.pk-control:has(.pk-scroll) { gap: 0; }

.pk-log__text {
    min-height: 38px;
    max-height: 120px;
    overflow: auto;
    padding: 8px 9px;
    background: rgba(3, 9, 18, 0.62);
    border: 1px solid ${PANEL_TOKENS.color.border};
    border-radius: ${PANEL_TOKENS.radius.sm};
    font-size: ${PANEL_TOKENS.type.micro};
    line-height: ${PANEL_TOKENS.type.lhBase};
    color: ${PANEL_TOKENS.color.text};
    white-space: pre-wrap;
    word-break: break-word;
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 197, 253, 0.45) transparent;
}
.pk-log__text::-webkit-scrollbar { width: 4px; }
.pk-log__text::-webkit-scrollbar-track { background: transparent; }
.pk-log__text::-webkit-scrollbar-thumb {
    background: rgba(147, 197, 253, 0.5);
    border-radius: 2px;
}
.pk-log__text[data-empty="true"] { color: ${PANEL_TOKENS.color.textFaint}; }

@media (prefers-reduced-motion: reduce) {
    .pk-card,
    .pk-mini-btn,
    .pk-switch__track,
    .pk-switch__track::before,
    .pk-switch__lamp { transition: none; animation: none; }
}
`;

injectPanelStyles("panel", PANEL_CSS);

injectPanelStyles("panel-extra", `
.pk-fields--tiles .pk-control--select { flex: 1 1 auto; min-width: 0; }
.pk-fields--tiles .pk-select {
    height: 20px;
    line-height: 1;
    padding: 0 20px 0 6px;
    font-size: ${PANEL_TOKENS.type.micro};
    text-align: center;
}
.pk-fields--tiles .pk-control--select::after { right: 6px; }
.pk-control--end { justify-content: flex-end; }
.pk-control--split { gap: 8px; }
.pk-card__head--static { cursor: default; }
.pk-field[hidden],
.pk-field__link[hidden],
.pk-card__note[hidden] { display: none; }
.pk-card__note {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    height: 20px;
    line-height: 18px;
    padding: 0 8px;
    font-size: ${PANEL_TOKENS.type.micro};
    color: ${PANEL_TOKENS.color.warn};
    background: rgba(251, 191, 36, 0.13);
    border: 1px solid rgba(251, 191, 36, 0.42);
    border-radius: ${PANEL_TOKENS.radius.sm};
}
.pk-card[data-group-locked="true"] .pk-card__body { pointer-events: none; }
.pk-card[data-group-locked="true"] .pk-card__actions .pk-icon-btn,
.pk-card[data-group-locked="true"] .pk-card__actions .pk-mini-btn,
.pk-card[data-group-locked="true"] .pk-card__actions .pk-check {
    pointer-events: none;
    opacity: 0.5;
}
`);

injectPanelStyles("popover-theme", `
@supports (appearance: base-select) {
    .pk-select {
        appearance: base-select;
        -webkit-appearance: base-select;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .pk-select::picker-icon { display: none; }
    .pk-select selectedcontent {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
    }
    .pk-select::picker(select) {
        appearance: base-select;
        position-area: block-end;
        position-try-fallbacks: flip-inline;
        margin-top: 4px;
        padding: 4px;
        background: linear-gradient(180deg, rgba(12, 22, 40, 0.98), rgba(6, 12, 24, 0.98));
        border: 1px solid rgba(96, 165, 250, 0.24);
        border-radius: ${PANEL_TOKENS.radius.md};
        box-shadow: 0 18px 40px rgba(2, 6, 23, 0.62), 0 0 0 1px rgba(59, 130, 246, 0.08);
        color: ${PANEL_TOKENS.color.text};
        max-height: 320px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(59, 130, 246, 0.45) transparent;
    }
    .pk-select option {
        position: relative;
        padding: 6px 8px;
        border-radius: ${PANEL_TOKENS.radius.sm};
        background: transparent;
        color: ${PANEL_TOKENS.color.text};
        font-size: 16px;
        text-align: center;
        justify-content: center;
    }
    .pk-select option::checkmark {
        position: absolute;
        left: 8px;
        top: 50%;
        translate: 0 -50%;
        color: ${PANEL_TOKENS.color.primaryLight};
    }
    .pk-select option:hover,
    .pk-select option:focus {
        background: rgba(59, 130, 246, 0.16);
        color: ${PANEL_TOKENS.color.textBright};
    }
    .pk-select option:checked {
        background: none;
        color: ${PANEL_TOKENS.color.textBright};
        font-weight: 500;
    }
    .pk-fields__row .pk-field:nth-child(1) { anchor-name: --pk-row-f1; }
    .pk-fields__row .pk-field:nth-child(2) { anchor-name: --pk-row-f2; }
    .pk-fields__row .pk-field:nth-child(3) { anchor-name: --pk-row-f3; }
    .pk-fields__row .pk-field:nth-child(4) { anchor-name: --pk-row-f4; }
    .pk-fields__row .pk-select::picker(select) { box-sizing: border-box; }
    .pk-fields__row .pk-field:nth-child(1) .pk-select::picker(select) {
        position-area: none;
        top: anchor(--pk-row-f1 bottom);
        left: anchor(--pk-row-f1 left);
        width: anchor-size(--pk-row-f1 width);
    }
    .pk-fields__row .pk-field:nth-child(2) .pk-select::picker(select) {
        position-area: none;
        top: anchor(--pk-row-f2 bottom);
        left: anchor(--pk-row-f2 left);
        width: anchor-size(--pk-row-f2 width);
    }
    .pk-fields__row .pk-field:nth-child(3) .pk-select::picker(select) {
        position-area: none;
        top: anchor(--pk-row-f3 bottom);
        left: anchor(--pk-row-f3 left);
        width: anchor-size(--pk-row-f3 width);
    }
    .pk-fields__row .pk-field:nth-child(4) .pk-select::picker(select) {
        position-area: none;
        top: anchor(--pk-row-f4 bottom);
        left: anchor(--pk-row-f4 left);
        width: anchor-size(--pk-row-f4 width);
    }
}
`);


injectPanelStyles("tooltip", `
.pk-tooltip {
    position: fixed;
    z-index: 10060;
    box-sizing: border-box;
    width: max-content;
    max-width: 320px;
    padding: 6px 10px;
    border-radius: ${PANEL_TOKENS.radius.sm};
    background: ${PANEL_TOKENS.color.glassDeep};
    border: 1px solid ${PANEL_TOKENS.color.borderHi};
    box-shadow: ${PANEL_TOKENS.shadow.control};
    backdrop-filter: ${PANEL_TOKENS.blur.control};
    -webkit-backdrop-filter: ${PANEL_TOKENS.blur.control};
    color: ${PANEL_TOKENS.color.textBright};
    font-family: ${PANEL_TOKENS.font};
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0.01em;
    overflow-wrap: anywhere;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-3px);
    transition: opacity ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing},
                transform ${PANEL_TOKENS.motion.fast} ${PANEL_TOKENS.motion.easing};
}
.pk-tooltip--visible { opacity: 1; transform: translateY(0); }
.pk-tooltip[data-placement="top"] { transform: translateY(3px); }
.pk-tooltip[data-placement="top"].pk-tooltip--visible { transform: translateY(0); }
`);

let _pkTooltipEl = null;
let _pkTooltipTimer = null;
let _pkTooltipShownAt = 0;

const PK_TOOLTIP_DELAY = 420;
const PK_TOOLTIP_DELAY_WARM = 90;
const PK_TOOLTIP_WARM_WINDOW = 700;

function cancelPanelTooltipTimer() {
    if (_pkTooltipTimer) {
        clearTimeout(_pkTooltipTimer);
        _pkTooltipTimer = null;
    }
}

export function showPanelTooltip(anchorEl, text) {
    cancelPanelTooltipTimer();
    hidePanelTooltip();
    if (!anchorEl || !text) return;
    _pkTooltipEl = document.createElement("div");
    _pkTooltipEl.className = "pk-tooltip";
    _pkTooltipEl.textContent = text;
    document.body.appendChild(_pkTooltipEl);
    _pkTooltipShownAt = Date.now();

    const anchorRect = anchorEl.getBoundingClientRect();
    const tipRect = _pkTooltipEl.getBoundingClientRect();
    let left = anchorRect.left + (anchorRect.width / 2) - (tipRect.width / 2);
    let top = anchorRect.top - tipRect.height - 8;
    let placement = "top";

    if (left < 6) left = 6;
    if (left + tipRect.width > window.innerWidth - 6) left = window.innerWidth - tipRect.width - 6;
    if (top < 6) {
        top = anchorRect.bottom + 8;
        placement = "bottom";
    }

    _pkTooltipEl.style.left = left + "px";
    _pkTooltipEl.style.top = top + "px";
    _pkTooltipEl.dataset.placement = placement;
    requestAnimationFrame(() => _pkTooltipEl && _pkTooltipEl.classList.add("pk-tooltip--visible"));
}

export function hidePanelTooltip() {
    cancelPanelTooltipTimer();
    if (_pkTooltipEl) {
        _pkTooltipEl.remove();
        _pkTooltipEl = null;
    }
}

export function attachPanelTooltip(el, text) {
    const resolveText = () => (typeof text === "function" ? text() : text);
    const schedule = () => {
        cancelPanelTooltipTimer();
        const warm = Date.now() - _pkTooltipShownAt < PK_TOOLTIP_WARM_WINDOW;
        _pkTooltipTimer = window.setTimeout(() => {
            _pkTooltipTimer = null;
            showPanelTooltip(el, resolveText());
        }, warm ? PK_TOOLTIP_DELAY_WARM : PK_TOOLTIP_DELAY);
    };
    el.addEventListener("mouseenter", schedule);
    el.addEventListener("focus", schedule);
    el.addEventListener("mouseleave", hidePanelTooltip);
    el.addEventListener("blur", hidePanelTooltip);
    el.addEventListener("click", hidePanelTooltip);
}


export function createIconButton(options) {
    const opts = options || {};
    const render = typeof opts.render === "function" ? opts.render : () => "";
    const hasText = !!opts.text;
    const btn = document.createElement("button");
    btn.type = "button";
    const sizeClass = hasText ? "pk-icon-btn--text" : "pk-icon-btn--" + (opts.size || "md");
    btn.className = "pk-icon-btn pk-icon-btn--" + (opts.variant || "default") + " " + sizeClass;
    btn.innerHTML = '<span class="pk-icon-btn__glyph">' + render(opts.icon, opts.iconSize) + "</span>"
        + (hasText ? '<span class="pk-icon-btn__text">' + opts.text + "</span>" : "");
    const label = opts.label || "";
    if (label) {
        btn.setAttribute("aria-label", label);
        btn.title = "";
    }

    let revertTimer = null;

    const clearRevert = () => {
        if (revertTimer) {
            clearTimeout(revertTimer);
            revertTimer = null;
        }
    };

    const setState = (state, revertAfter) => {
        clearRevert();
        btn.classList.remove("pk-icon-btn--loading", "pk-icon-btn--success", "pk-icon-btn--error");
        if (state && state !== "idle") btn.classList.add("pk-icon-btn--" + state);
        const busy = state === "loading";
        btn.setAttribute("aria-busy", busy ? "true" : "false");
        btn.disabled = busy || !!opts.disabled;
        if (revertAfter) {
            revertTimer = setTimeout(() => setState("idle"), revertAfter);
        }
    };

    const setDisabled = (value) => {
        opts.disabled = !!value;
        btn.disabled = !!value;
    };

    const api = {
        el: btn,
        setState,
        setDisabled,
        setTooltip: (text) => { opts.tooltip = text; },
        setText: (text) => {
            const span = btn.querySelector(".pk-icon-btn__text");
            if (span) span.textContent = text;
        },
        dispose: () => {
            clearRevert();
            hidePanelTooltip();
            btn.remove();
        },
    };

    btn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (btn.disabled) return;
        if (opts.onClick) {
            try {
                await opts.onClick(api);
            } catch (err) {
                console.error("[panel-kit] toolbar action failed:", err);
                setState("error", 1400);
            }
        }
    });
    btn.addEventListener("pointerdown", (event) => event.stopPropagation());
    if (opts.tooltip) {
        attachPanelTooltip(btn, () => (typeof opts.tooltip === "function" ? opts.tooltip() : opts.tooltip));
    }

    return api;
}

const _pkLastHeights = new WeakMap();
const _pkOptionControls = new WeakSet();

let _pkFieldSeq = 0;

function nextFieldId(name) {
    _pkFieldSeq += 1;
    return `pk-${name}-${_pkFieldSeq.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function createThrottled(fn, wait) {
    let timer = null;
    let args = null;
    return function throttled() {
        args = arguments;
        if (timer) return;
        timer = setTimeout(() => {
            timer = null;
            fn.apply(null, args);
        }, wait);
    };
}

function canvasScale() {
    const scale = globalThis.app?.canvas?.ds?.scale;
    return typeof scale === "number" && scale > 0 ? scale : 1;
}

export function measureElementHeight(el, fallback) {
    if (!el) return fallback ?? 28;
    const base = fallback ?? 28;
    const layout = el.offsetHeight || el.clientHeight || 0;
    if (layout > 0) {
        _pkLastHeights.set(el, layout);
        return Math.max(base, Math.round(layout));
    }
    const cached = _pkLastHeights.get(el);
    if (cached > 0) return Math.max(base, Math.round(cached));
    const rect = typeof el.getBoundingClientRect === "function" ? el.getBoundingClientRect() : null;
    const screenHeight = rect && rect.height ? rect.height / canvasScale() : 0;
    return Math.max(base, Math.round(screenHeight));
}

export function hideNativeWidget(node, widget) {
    if (!widget) return;
    widget.hidden = true;
    if (widget.options && typeof widget.options === "object") widget.options.hidden = true;
    widget.computeSize = () => [0, -4];
    const el = widget.element || widget.inputEl;
    if (!el || !el.style) return;
    el.disabled = true;
    if (typeof el.setAttribute === "function") el.setAttribute("tabindex", "-1");
    if (el.style.display !== "none") el.style.display = "none";
    el.style.pointerEvents = "none";
}

function widgetLinked(node, widget) {
    if (!widget) return false;
    if (widget.type === "converted-widget") return true;
    const inputs = node?.inputs ?? [];
    return inputs.some((input) => input.name === widget.name && input.link != null);
}

function toNumber(raw, spec, widget) {
    const parsed = typeof raw === "number" ? raw : parseFloat(raw);
    if (!Number.isFinite(parsed)) return 0;
    const min = typeof spec.min === "number" ? spec.min : widget?.options?.min;
    const max = typeof spec.max === "number" ? spec.max : widget?.options?.max;
    let value = spec.integer ? Math.round(parsed) : parsed;
    if (typeof min === "number") value = Math.max(min, value);
    if (typeof max === "number") value = Math.min(max, value);
    return value;
}

function findScrollable(event) {
    let el = event.target instanceof Element ? event.target : null;
    while (el && el !== document.body) {
        if (el.matches(".pk-textarea")) return el;
        const overflowY = getComputedStyle(el).overflowY;
        const scrollable = (overflowY === "auto" || overflowY === "scroll")
            && el.scrollHeight > el.clientHeight + 1;
        if (scrollable) {
            const atTop = event.deltaY < 0 && el.scrollTop <= 0;
            const atEnd = event.deltaY > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            if (!atTop && !atEnd) return el;
        }
        el = el.parentElement;
    }
    return null;
}

export function attachWheelForwarding(el) {
    const onWheel = (event) => {
        const canvasEl = globalThis.app?.canvas?.canvas;
        if (!canvasEl) return;
        const zoomGesture = event.ctrlKey || event.metaKey;
        if (!zoomGesture && findScrollable(event)) return;
        event.preventDefault();
        event.stopPropagation();
        canvasEl.dispatchEvent(new WheelEvent("wheel", {
            clientX: event.clientX,
            clientY: event.clientY,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaMode: event.deltaMode,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            cancelable: true,
        }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
}

export function attachMiddleDragPan(el) {
    if (!el) return () => {};

    const onPointerDown = (event) => {
        if (event.button !== 1 || event.pointerType === "touch") return;
        const field = event.target?.closest?.('input, textarea, [contenteditable="true"]');
        const nonText = ["range", "checkbox", "radio", "button", "submit", "reset", "image"];
        if (field && (field.tagName === "TEXTAREA" || field.isContentEditable
            || (field.tagName === "INPUT" && !nonText.includes(String(field.type || "text"))))) return;
        const canvas = globalThis.app?.canvas;
        const ds = canvas?.ds;
        if (!canvas || !ds || canvas.read_only || canvas.allow_dragcanvas === false) return;
        event.preventDefault();
        event.stopPropagation();

        let lastX = event.clientX;
        let lastY = event.clientY;
        canvas.dragging_canvas = true;

        const onMove = (moveEvent) => {
            ds.offset[0] += (moveEvent.clientX - lastX) / ds.scale;
            ds.offset[1] += (moveEvent.clientY - lastY) / ds.scale;
            lastX = moveEvent.clientX;
            lastY = moveEvent.clientY;
            if (typeof canvas._dirty === "function") canvas._dirty();
            else canvas.setDirty?.(true, true);
        };
        const onUp = () => {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            document.removeEventListener("pointercancel", onUp);
            canvas.dragging_canvas = false;
        };
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onUp);
    };

    el.addEventListener("pointerdown", onPointerDown, true);
    return () => el.removeEventListener("pointerdown", onPointerDown, true);
}

function openNodeContextMenu(node, event) {
    const canvas = globalThis.app?.canvas || node?.graph?.canvas;
    if (!canvas || !node) return;

    const clientX = event.clientX;
    const clientY = event.clientY;
    try {
        if (typeof canvas.adjustMouseEvent === "function") canvas.adjustMouseEvent(event);
        const rect = canvas.canvas?.getBoundingClientRect?.();
        if (rect) {
            const canvasX = clientX - rect.left;
            const canvasY = clientY - rect.top;
            let graphPos = null;
            if (typeof canvas.convertCanvasToOffset === "function") {
                graphPos = canvas.convertCanvasToOffset([canvasX, canvasY]);
            } else {
                const ds = canvas.ds || {};
                const scale = ds.scale || 1;
                const offset = ds.offset || [0, 0];
                graphPos = [canvasX / scale - offset[0], canvasY / scale - offset[1]];
            }
            if (graphPos) {
                event.graphX = graphPos[0];
                event.graphY = graphPos[1];
                canvas.graph_mouse = [graphPos[0], graphPos[1]];
            }
            canvas.canvas_mouse = [canvasX, canvasY];
        }
    } catch (err) {
        console.warn("[panel-kit] context menu coordinate sync failed:", err);
    }

    if (typeof canvas.processContextMenu === "function") {
        canvas.processContextMenu(node, event);
        return;
    }

    const canvasEl = canvas.canvas;
    if (!canvasEl) return;
    canvasEl.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 2,
        buttons: 2,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
    }));
}

function attachNodeContextMenu(el, node) {
    const onContextMenu = (event) => {
        event.preventDefault();
        event.stopPropagation();
        openNodeContextMenu(node, event);
    };
    el.addEventListener("contextmenu", onContextMenu);
    return () => el.removeEventListener("contextmenu", onContextMenu);
}

function attachScrollbar(host, textarea) {
    const bar = document.createElement("div");
    bar.className = "pk-scroll";
    bar.setAttribute("aria-hidden", "true");

    const caret = (up) => '<svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" '
        + 'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        + '<polyline points="' + (up ? "1 5 5 1 9 5" : "1 1 5 5 9 1") + '"/></svg>';
    const makeButton = (up) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.tabIndex = -1;
        btn.className = "pk-scroll__btn";
        btn.innerHTML = caret(up);
        btn.onmousedown = (e) => e.preventDefault();
        btn.onclick = () => {
            const line = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
            textarea.scrollBy({ top: up ? -line : line });
        };
        return btn;
    };

    const track = document.createElement("div");
    track.className = "pk-scroll__bar";
    const thumb = document.createElement("div");
    thumb.className = "pk-scroll__thumb";
    track.appendChild(thumb);
    bar.append(makeButton(true), track, makeButton(false));
    host.appendChild(bar);

    const sync = () => {
        bar.style.height = textarea.offsetHeight + "px";
        const overflow = textarea.scrollHeight - textarea.clientHeight;
        if (overflow <= 0) {
            bar.hidden = true;
            return;
        }
        bar.hidden = false;
        const lane = track.clientHeight;
        const size = Math.max(20, Math.round((lane * textarea.clientHeight) / textarea.scrollHeight));
        thumb.style.height = size + "px";
        thumb.style.transform = "translateY(" + Math.round(((lane - size) * textarea.scrollTop) / overflow) + "px)";
    };

    const onBarWheel = (event) => {
        event.preventDefault();
        event.stopPropagation();
        textarea.scrollTop += event.deltaY;
    };

    textarea.addEventListener("scroll", sync, { passive: true });
    textarea.addEventListener("input", sync);
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(sync) : null;
    observer?.observe(textarea);
    bar.addEventListener("wheel", onBarWheel, { passive: false });

    thumb.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        const overflow = textarea.scrollHeight - textarea.clientHeight;
        const travel = track.clientHeight - thumb.offsetHeight;
        if (overflow <= 0 || travel <= 0) return;
        const startY = event.clientY;
        const startScroll = textarea.scrollTop;
        thumb.dataset.dragging = "true";
        thumb.setPointerCapture(event.pointerId);
        thumb.onpointermove = (move) => {
            textarea.scrollTop = startScroll + ((move.clientY - startY) / travel) * overflow;
        };
        thumb.onpointerup = () => {
            delete thumb.dataset.dragging;
            thumb.onpointermove = null;
            thumb.onpointerup = null;
        };
    });

    track.addEventListener("pointerdown", (event) => {
        if (event.target !== track) return;
        const rect = track.getBoundingClientRect();
        const travel = track.clientHeight - thumb.offsetHeight;
        if (travel <= 0) return;
        const ratio = (event.clientY - rect.top - thumb.offsetHeight / 2) / travel;
        textarea.scrollTop = ratio * (textarea.scrollHeight - textarea.clientHeight);
        sync();
    });

    requestAnimationFrame(sync);

    return {
        sync,
        destroy: () => {
            observer?.disconnect();
            textarea.removeEventListener("scroll", sync);
            textarea.removeEventListener("input", sync);
            bar.removeEventListener("wheel", onBarWheel);
            bar.remove();
        },
    };
}

function createControl(spec, ctx) {
    let widget = ctx.getWidget(spec.name);
    const liveWidget = () => {
        if (!widget) widget = ctx.getWidget(spec.name);
        return widget;
    };
    const field = document.createElement("div");
    field.className = "pk-field"
        + (spec.block ? " pk-field--block" : "")
        + (spec.kind === "range" ? " pk-field--range" : "")
        + (spec.span ? " pk-field--span" : "")
        + (spec.wideRow && spec.wideRowLabel === false ? " pk-field--label-hidden" : "");
    field.dataset.widget = spec.name;

    const inputId = nextFieldId(spec.name);
    const label = document.createElement("label");
    label.className = "pk-field__label";
    label.htmlFor = inputId;
    const labelText = document.createElement("span");
    labelText.className = "pk-field__label-text";

    let availableMark = null;
    if (spec.available) {
        availableMark = document.createElement("span");
        availableMark.className = "pk-field__flag";
        availableMark.setAttribute("aria-hidden", "true");
        availableMark.innerHTML = ctx.icon("checkCircle", 12);
        label.appendChild(availableMark);
    }

    label.appendChild(labelText);

    const linkMark = document.createElement("span");
    linkMark.className = "pk-field__link";
    linkMark.innerHTML = ctx.icon("link", 12);
    linkMark.hidden = true;
    if (ctx.tip) {
        linkMark.addEventListener("pointerenter", () => {
            ctx.tip.show(linkMark, ctx.t(PK_LINK_TIP_KEY));
        });
        linkMark.addEventListener("pointerleave", () => ctx.tip.hide());
    }
    label.appendChild(linkMark);

    const control = document.createElement("div");
    control.className = "pk-control"
        + (spec.kind === "select" ? " pk-control--select" : "")
        + (spec.kind === "switch" || spec.kind === "number" ? " pk-control--end" : "")
        + (spec.kind === "range" ? " pk-control--split" : "")
        + (spec.folderPicker ? " pk-control--folder" : "");

    field.appendChild(label);
    field.appendChild(control);
    if (spec.header || (spec.wideRow && spec.wideRowLabel === false)) label.remove();

    let disabled = false;
    let locked = false;
    let interactive = [];
    let extraDestroy = null;

    const push = (value, deferDirty) => {
        const target = liveWidget();
        if (disabled || locked || !target) return;
        target.value = value;
        if (typeof target.callback === "function") {
            try {
                target.callback(value);
            } catch (err) {
                console.error("[panel-kit] widget callback failed:", err);
            }
        }
        if (deferDirty) ctx.throttledDirty();
        else ctx.node?.setDirtyCanvas?.(true, true);
        ctx.onChange?.(spec.name, value);
    };

    const applyDisabled = () => {
        field.dataset.disabled = disabled ? "true" : "false";
        field.dataset.locked = locked ? "true" : "false";
        linkMark.hidden = !disabled;
        if (availableMark) {
            availableMark.innerHTML = ctx.icon(locked ? "ban" : "checkCircle", 12);
        }
        interactive.forEach((el) => { el.disabled = disabled || locked; });
    };

    const applyNote = (text) => {
        let note = field.querySelector(".pk-field__note");
        if (!text) {
            note?.remove();
            return;
        }
        if (!note) {
            note = document.createElement("span");
            note.className = "pk-field__note";
            field.prepend(note);
        }
        note.textContent = text;
    };

    const api = {
        el: field,
        name: spec.name,
        applyNote,
        commit: (value) => {
            api.setValue(value);
            push(api.getValue());
        },
        setValue: () => {},
        getValue: () => null,
        setDisabled: (flag) => {
            disabled = !!flag;
            applyDisabled();
        },
        setLocked: (flag) => {
            locked = !!flag;
            applyDisabled();
        },
        setOptions: () => {},
        refreshLabels: () => {
            labelText.textContent = ctx.t(spec.labelKey);
        },
        destroy: () => {
            if (extraDestroy) extraDestroy();
            ctx.unregister(api);
            field.remove();
        },
    };

    if (spec.kind === "select") {
        const select = document.createElement("select");
        select.className = "pk-select";
        select.id = inputId;
        select.addEventListener("change", () => push(select.value));
        select.addEventListener("pointerdown", (event) => event.stopPropagation());
        control.appendChild(select);
        interactive = [select];
        _pkOptionControls.add(api);
        ctx.attachSelectOpenState(select, control);

        const optionText = (value) => {
            const raw = value == null ? "" : String(value);
            const mapped = spec.widgetLabelKeys ? spec.widgetLabelKeys[raw] : null;
            if (mapped) return ctx.t(mapped);
            const getter = liveWidget()?.options?.getOptionLabel;
            if (typeof getter === "function") {
                try {
                    const out = getter(raw);
                    if (out != null && out !== "") return String(out);
                } catch (err) {
                    return raw;
                }
            }
            return raw;
        };

        const fill = (values, current) => {
            const list = Array.isArray(values) ? values : [];
            select.textContent = "";
            list.forEach((value) => {
                const option = document.createElement("option");
                option.value = String(value);
                option.textContent = optionText(value);
                select.appendChild(option);
            });
            api.setValue(current);
        };

        api.setValue = (value) => {
            const text = value == null ? "" : String(value);
            if (!Array.from(select.options).some((option) => option.value === text)) {
                const option = document.createElement("option");
                option.value = text;
                option.textContent = text || "—";
                select.appendChild(option);
            }
            select.value = text;
        };

        api.getValue = () => select.value;

        api.setOptions = (values, current) => {
            const list = Array.isArray(values) ? values : [];
            if (widget && widget.options && typeof widget.options === "object") widget.options.values = list;
            fill(list, current == null ? api.getValue() : current);
        };

        api.refreshLabels = () => {
            labelText.textContent = ctx.t(spec.labelKey);
            Array.from(select.options).forEach((option) => { option.textContent = optionText(option.value); });
        };

        if (Array.isArray(widget?.options?.values)) fill(widget.options.values, widget.value);
        else api.setValue(widget ? widget.value : "");
    } else if (spec.kind === "checkbox") {
        const box = document.createElement("input");
        box.type = "checkbox";
        box.className = "pk-check__box";
        box.id = inputId;
        const checkLabel = document.createElement("span");
        checkLabel.className = "pk-check__label";
        box.addEventListener("change", () => {
            api.setValue(box.checked);
            push(box.checked);
        });
        box.addEventListener("pointerdown", (event) => event.stopPropagation());
        control.classList.add("pk-check");
        control.appendChild(box);
        control.appendChild(checkLabel);
        interactive = [box];

        api.setValue = (value) => {
            box.checked = value === true || value === "true" || value === 1 || value === "1";
        };

        api.getValue = () => box.checked;

        api.refreshLabels = () => {
            labelText.textContent = ctx.t(spec.labelKey);
            checkLabel.textContent = ctx.t(spec.labelKey);
            box.setAttribute("aria-label", ctx.t(spec.labelKey));
        };

        api.setValue(widget ? widget.value : false);
    } else if (spec.kind === "switch") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pk-switch";
        button.id = inputId;
        button.setAttribute("role", "switch");
        button.setAttribute("aria-checked", "false");
        button.setAttribute("aria-label", ctx.t(spec.labelKey));
        button.innerHTML = '<span class="pk-switch__track"><span class="pk-switch__lamp"></span></span>';

        const setOn = (on) => button.setAttribute("aria-checked", on ? "true" : "false");
        const getOn = () => button.getAttribute("aria-checked") === "true";

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const next = !getOn();
            setOn(next);
            push(next);
        });
        button.addEventListener("pointerdown", (event) => event.stopPropagation());
        control.appendChild(button);
        interactive = [button];

        api.setValue = (value) => {
            setOn(value === true || value === "true" || value === 1 || value === "1");
        };

        api.getValue = getOn;

        api.refreshLabels = () => {
            labelText.textContent = ctx.t(spec.labelKey);
            button.setAttribute("aria-label", ctx.t(spec.labelKey));
        };

        api.setValue(widget ? widget.value : false);
    } else if (spec.kind === "range") {
        const min = typeof spec.min === "number" ? spec.min : widget?.options?.min;
        const max = typeof spec.max === "number" ? spec.max : widget?.options?.max;
        const step = spec.step ?? widget?.options?.step ?? (spec.integer ? 1 : 0.1);

        const numberInput = document.createElement("input");
        numberInput.type = "number";
        numberInput.className = "pk-input pk-number pk-number--combo";
        if (typeof min === "number") numberInput.min = min;
        if (typeof max === "number") numberInput.max = max;
        numberInput.step = step;

        const stepDecimals = (() => {
            const text = String(step ?? "");
            return text.includes(".") ? Math.min(6, text.split(".")[1].length) : 0;
        })();
        const quantize = (value) => (spec.integer ? Math.round(value) : Number(value.toFixed(stepDecimals)));

        const range = document.createElement("input");
        range.type = "range";
        range.className = "pk-range";
        range.id = inputId;
        if (typeof min === "number") range.min = min;
        if (typeof max === "number") range.max = max;
        range.step = "any";

        const rangeWrap = document.createElement("span");
        rangeWrap.className = "pk-range-wrap";
        const thumb = document.createElement("i");
        thumb.className = "pk-range__thumb";
        const THUMB_OUTER_W = 8;

        const syncRange = () => {
            const lo = Number(range.min);
            const hi = Number(range.max);
            const value = Number(range.value);
            const frac = hi > lo ? Math.max(0, Math.min(1, (value - lo) / (hi - lo))) : 0;
            range.style.setProperty("--pk-range-fill", `${frac * 100}%`);

            const trackW = range.clientWidth;
            if (!trackW) return;
            const half = THUMB_OUTER_W / 2;
            const rect = range.getBoundingClientRect();
            const scale = range.offsetWidth ? rect.width / range.offsetWidth : 1;
            const unit = (window.devicePixelRatio || 1) * (scale || 1);
            const center = Math.max(half, Math.min(trackW - half, frac * trackW));
            const left = unit > 0 ? Math.round((center - half) * unit) / unit : center - half;
            thumb.style.left = `${left}px`;
        };

        const applyNumber = (raw) => {
            const value = toNumber(raw, spec, widget);
            if (numberInput.value !== String(value)) numberInput.value = String(value);
            range.value = String(value);
            syncRange();
            return value;
        };

        range.addEventListener("input", () => push(applyNumber(quantize(Number(range.value)))));
        range.addEventListener("pointerdown", (event) => {
            event.stopPropagation();
            syncRange();
        });
        numberInput.addEventListener("change", () => push(applyNumber(numberInput.value)));
        numberInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") numberInput.blur();
        });
        numberInput.addEventListener("pointerdown", (event) => event.stopPropagation());

        rangeWrap.appendChild(range);
        rangeWrap.appendChild(thumb);
        control.appendChild(rangeWrap);
        control.appendChild(numberInput);
        interactive = [range, numberInput];

        const rangeResize = typeof ResizeObserver === "function" ? new ResizeObserver(syncRange) : null;
        rangeResize?.observe(rangeWrap);
        extraDestroy = () => rangeResize?.disconnect();

        api.setValue = (value) => {
            const next = value == null || value === "" ? 0 : toNumber(value, spec, widget);
            applyNumber(next);
        };

        api.getValue = () => Number(range.value);

        api.setValue(widget ? widget.value : 0);
        requestAnimationFrame(syncRange);
    } else if (spec.kind === "number") {
        const min = typeof spec.min === "number" ? spec.min : widget?.options?.min;
        const max = typeof spec.max === "number" ? spec.max : widget?.options?.max;

        const numberInput = document.createElement("input");
        numberInput.type = "number";
        numberInput.className = "pk-input pk-number";
        numberInput.id = inputId;
        if (typeof min === "number") numberInput.min = min;
        if (typeof max === "number") numberInput.max = max;
        numberInput.step = spec.step ?? widget?.options?.step ?? (spec.integer ? 1 : 0.1);
        numberInput.addEventListener("change", () => {
            const value = toNumber(numberInput.value, spec, widget);
            numberInput.value = String(value);
            push(value);
        });
        numberInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") numberInput.blur();
        });
        numberInput.addEventListener("pointerdown", (event) => event.stopPropagation());
        control.appendChild(numberInput);
        interactive = [numberInput];

        api.setValue = (value) => {
            const next = value == null || value === "" ? 0 : toNumber(value, spec, widget);
            numberInput.value = String(next);
        };

        api.getValue = () => Number(numberInput.value);

        api.setValue(widget ? widget.value : 0);
    } else {
        const isMultiline = spec.kind === "textarea";
        const textEl = document.createElement(isMultiline ? "textarea" : "input");
        if (!isMultiline) textEl.type = "text";
        textEl.className = isMultiline ? "pk-textarea" : "pk-input";
        textEl.id = inputId;
        textEl.addEventListener("input", () => push(textEl.value, true));
        textEl.addEventListener("change", () => push(textEl.value));
        textEl.addEventListener("pointerdown", (event) => event.stopPropagation());
        control.appendChild(textEl);
        const scroller = isMultiline ? attachScrollbar(control, textEl) : null;
        if (scroller) extraDestroy = () => scroller.destroy();
        interactive = [textEl];

        api.setValue = (value) => {
            const text = value == null ? "" : String(value);
            if (textEl.value !== text) textEl.value = text;
            scroller?.sync();
        };

        api.getValue = () => textEl.value;

        if (spec.folderPicker && !isMultiline && ctx.attachFolderPicker) {
            const picker = ctx.attachFolderPicker(control, textEl, api);
            api.refreshFolderPicker = picker?.refreshLabels;
            if (picker?.button) interactive = [textEl, picker.button];
        }

        api.refreshLabels = () => {
            labelText.textContent = ctx.t(spec.labelKey);
            textEl.setAttribute("placeholder", spec.placeholderKey ? ctx.t(spec.placeholderKey) : "");
            api.refreshFolderPicker?.();
        };

        api.setValue(widget ? widget.value : "");

        if (isMultiline) {
            const frame = document.createElement("div");
            frame.className = "pk-field__frame";
            field.classList.add("pk-field--side-title");
            field.insertBefore(frame, label);
            frame.appendChild(label);
            frame.appendChild(control);
            label.removeAttribute("for");
            label.dataset.inert = "true";
        }
    }

    applyDisabled();
    api.refreshLabels();
    return api;
}

export function watchNodeModeVisual(node, host) {
    if (!node || !host) return;

    const existing = node._pkModeVisual;
    if (existing) {
        existing.host = host;
        existing.paint();
        return;
    }

    const state = {
        host,
        mode: node.mode,
        alpha: null,
        paint: () => {
            const el = state.host;
            if (!el || !el.style) return;
            const alpha = globalThis.app?.canvas?.getNodeModeAlpha?.(node);
            el.style.opacity = typeof alpha === "number" && alpha < 1 ? String(alpha) : "";
        },
    };
    node._pkModeVisual = state;

    const previousDraw = node.onDrawForeground;
    node.onDrawForeground = function () {
        const alpha = globalThis.app?.canvas?.getNodeModeAlpha?.(node);
        if (state.mode !== node.mode || state.alpha !== alpha) {
            state.mode = node.mode;
            state.alpha = alpha;
            state.paint();
        }
        return previousDraw ? previousDraw.apply(this, arguments) : undefined;
    };

    state.paint();
}

export function createPanel(options) {
    const opts = options || {};
    const node = opts.node;
    const layout = Array.isArray(opts.layout) ? opts.layout : [];
    const minWidth = typeof opts.minWidth === "number" ? opts.minWidth : 367;
    const t = typeof opts.t === "function" ? opts.t : (key) => String(key ?? "");
    const iconFn = typeof opts.icon === "function" ? opts.icon : () => "";
    const getWidget = typeof opts.getWidget === "function"
        ? opts.getWidget
        : (name) => (node?.widgets ?? []).find((widget) => widget.name === name) || null;
    const onChange = typeof opts.onChange === "function" ? opts.onChange : null;
    const tip = opts.tooltip && typeof opts.tooltip.show === "function"
        ? opts.tooltip
        : { show: showPanelTooltip, hide: hidePanelTooltip };
    const attachFolderPicker = typeof opts.folderPicker === "function" ? opts.folderPicker : null;

    const host = document.createElement("div");
    host.className = "pk-panel-host" + (opts.className ? " " + opts.className : "");

    const panel = document.createElement("div");
    panel.className = "pk-panel";
    panel.setAttribute("role", "group");
    host.appendChild(panel);
    watchNodeModeVisual(node, host);

    const controls = new Map();
    const controlSpecs = new Map();
    const controlCards = new Map();
    const openSelects = new Set();
    const isGroupLocked = typeof opts.isGroupLocked === "function" ? opts.isGroupLocked : () => false;

    const onDocumentMouseDown = (event) => {
        const target = event.target;
        openSelects.forEach((entry) => {
            if (!entry.select.isConnected) {
                openSelects.delete(entry);
                return;
            }
            if (entry.select === target || entry.select.contains(target)) return;
            entry.setOpen(false);
        });
    };
    document.addEventListener("mousedown", onDocumentMouseDown);

    const attachSelectOpenState = (select, target) => {
        if (!select || !target) return;
        const setOpen = (open) => target.classList.toggle("pk-open", !!open);
        const entry = { select, setOpen };
        setOpen(false);
        openSelects.add(entry);

        select.addEventListener("mousedown", () => {
            setOpen(!target.classList.contains("pk-open"));
        });
        select.addEventListener("change", () => setOpen(false));
        select.addEventListener("blur", () => setOpen(false));
        select.addEventListener("click", (event) => {
            if (event.target !== select) setOpen(false);
        });
        select.addEventListener("keydown", (event) => {
            if (event.key === "Escape" || event.key === "Tab") {
                setOpen(false);
                return;
            }
            if (event.key === "Enter" || event.key === " " || event.key.startsWith("Arrow")) {
                setOpen(true);
            }
        });
    };

    const ctx = {
        node,
        t,
        icon: iconFn,
        onChange: (name, value) => {
            applyDependencies();
            onChange?.(name, value);
        },
        getWidget,
        tip,
        attachFolderPicker,
        throttledDirty: createThrottled(() => node?.setDirtyCanvas?.(true, true), 140),
        attachSelectOpenState,
        unregister: (control) => {
            if (controls.get(control.name) === control) controls.delete(control.name);
        },
    };

    const cards = new Map();

    layout.forEach((cardSpec) => {
        const card = document.createElement("section");
        card.className = "pk-card";
        if (cardSpec.dimLockedLabels) card.dataset.dimLocked = "true";

        const head = document.createElement("div");
        head.className = "pk-card__head pk-card__head--static";
        head.innerHTML = '<span class="pk-card__icon">' + iconFn(cardSpec.icon, 13) + "</span>"
            + '<span class="pk-card__title"></span>';
        const titleEl = head.querySelector(".pk-card__title");
        titleEl.textContent = t(cardSpec.titleKey);

        let lockNote = null;
        if (cardSpec.lockNoteKey) {
            lockNote = document.createElement("span");
            lockNote.className = "pk-card__note";
            lockNote.textContent = t(cardSpec.lockNoteKey);
            lockNote.hidden = true;
            head.appendChild(lockNote);
        }
        let customNote = null;

        const body = document.createElement("div");
        body.className = "pk-card__body";

        const gridMode = Number(cardSpec.columns) > 1;
        const tileMode = cardSpec.tiles === true;

        let wideFields = null;
        if (gridMode) {
            wideFields = document.createElement("div");
            wideFields.className = "pk-fields pk-fields--wide";
            body.appendChild(wideFields);
        }

        const fields = document.createElement("div");
        fields.className = "pk-fields"
            + (gridMode ? " pk-fields--grid" : "")
            + (tileMode ? " pk-fields--tiles" : "");
        if (gridMode) {
            fields.dataset.cols = String(cardSpec.columns);
            fields.style.setProperty("--pk-grid-cols", String(cardSpec.columns));
            if (cardSpec.bandFlip) fields.dataset.bandFlip = "true";
        }
        body.appendChild(fields);

        card.appendChild(head);
        card.appendChild(body);
        panel.appendChild(card);

        const cardRef = {
            id: cardSpec.id,
            spec: cardSpec,
            el: card,
            head,
            body,
            titleEl,
            fields,
            actions() {
                let holder = head.querySelector(".pk-card__actions");
                if (!holder) {
                    holder = document.createElement("div");
                    holder.className = "pk-card__actions";
                    head.appendChild(holder);
                }
                return holder;
            },
            setGroupLocked(flag) {
                const locked = Boolean(flag);
                card.dataset.groupLocked = locked ? "true" : "false";
                if (lockNote) lockNote.hidden = !locked;
            },
            setNote(text) {
                if (!text) {
                    if (customNote) customNote.hidden = true;
                    return;
                }
                if (!customNote) {
                    customNote = document.createElement("span");
                    customNote.className = "pk-card__note";
                    customNote.hidden = true;
                    head.appendChild(customNote);
                }
                customNote.textContent = String(text);
                customNote.hidden = false;
            },
            setTexts() {
                titleEl.textContent = t(cardSpec.titleKey);
                if (lockNote && cardSpec.lockNoteKey) lockNote.textContent = t(cardSpec.lockNoteKey);
            },
        };
        cards.set(cardSpec.id, cardRef);

        let inlineRow = null;

        const wideRows = new Map();

        (Array.isArray(cardSpec.fields) ? cardSpec.fields : []).forEach((fieldSpec) => {
            const control = createControl(fieldSpec, ctx);
            controls.set(fieldSpec.name, control);
            controlSpecs.set(fieldSpec.name, fieldSpec);
            controlCards.set(fieldSpec.name, cardRef);

            if (fieldSpec.header) {
                cardRef.actions().appendChild(control.el);
                return;
            }

            if (fieldSpec.wideRow) {
                let row = wideRows.get(fieldSpec.wideRow);
                if (!row) {
                    if (!wideFields) {
                        wideFields = document.createElement("div");
                        wideFields.className = "pk-fields pk-fields--wide";
                        body.appendChild(wideFields);
                    }
                    row = document.createElement("div");
                    row.className = "pk-fields__wide-row";
                    wideFields.appendChild(row);
                    wideRows.set(fieldSpec.wideRow, row);
                }
                row.appendChild(control.el);
                return;
            }

            let target = fields;
            if (fieldSpec.wide) {
                if (!wideFields) {
                    wideFields = document.createElement("div");
                    wideFields.className = "pk-fields pk-fields--wide";
                    body.appendChild(wideFields);
                }
                target = wideFields;
            }
            if (fieldSpec.inline && !gridMode) {
                if (!inlineRow) {
                    inlineRow = document.createElement("div");
                    inlineRow.className = "pk-fields__row";
                    fields.appendChild(inlineRow);
                }
                target = inlineRow;
            } else {
                inlineRow = null;
            }
            target.appendChild(control.el);
        });
    });

    const applyDependencies = () => {
        const groupLocked = isGroupLocked();
        cards.forEach((cardRef) => {
            const locked = Boolean(cardRef.spec?.promptGroup) && groupLocked;
            cardRef.setGroupLocked?.(locked);
        });
        controls.forEach((control, name) => {
            const spec = controlSpecs.get(name);
            const cardRef = controlCards.get(name);
            let locked = Boolean(cardRef?.spec?.promptGroup) && groupLocked;
            if (spec?.disabledWhen?.widget) {
                const gate = getWidget(spec.disabledWhen.widget);
                const gateOn = gate ? gate.value === true : false;
                locked = locked || gateOn === Boolean(spec.disabledWhen.value);
            }
            control.setLocked?.(locked);
        });
    };

    const detachWheel = attachWheelForwarding(host);
    const detachMiddlePan = attachMiddleDragPan(host);
    const detachContextMenu = attachNodeContextMenu(host, node);

    const domWidget = node.addDOMWidget(opts.widgetName, "div", host, {});
    domWidget.serialize = false;
    domWidget.computeSize = (width) => {
        const nodeWidth = Math.max(minWidth, width || Math.round(node?.size?.[0] || minWidth));
        if (panel.clientWidth < nodeWidth - 32) {
            const cached = _pkLastHeights.get(panel);
            return [nodeWidth, (cached > 0 ? Math.max(28, Math.round(cached)) : 28) + 2];
        }
        return [nodeWidth, measureElementHeight(panel, 28) + 2];
    };
    applyDependencies();

    const api = {
        host,
        panel,
        cards,
        controls,

        sync() {
            const active = document.activeElement;
            controls.forEach((control, name) => {
                const widget = getWidget(name);
                if (!widget) {
                    control.setDisabled(true);
                    return;
                }
                const editing = active && control.el.contains(active)
                    && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
                if (!editing) {
                    if (_pkOptionControls.has(control) && Array.isArray(widget.options?.values)) {
                        control.setOptions(widget.options.values, widget.value);
                    } else {
                        control.setValue(widget.value);
                    }
                }
                const linked = widgetLinked(node, widget);
                control.setDisabled(linked);
                control.applyNote?.(linked ? t(PK_LINK_TIP_KEY) : "");
            });
            applyDependencies();
        },
        resize() {
            window.requestAnimationFrame(() => {
                try {
                    const width = Math.max(minWidth, Math.round(node?.size?.[0] || minWidth));
                    let height = 0;
                    if (typeof node?.computeSize === "function") {
                        const computed = node.computeSize();
                        if (computed && Number.isFinite(computed[1])) height = computed[1];
                    }
                    if (!height) height = measureElementHeight(panel, 28) + 2 + 30;
                    node?.setSize?.([width, Math.max(120, Math.round(height))]);
                    node?.setDirtyCanvas?.(true, true);
                } catch (err) {
                    console.error("[panel-kit] panel resize failed:", err);
                }
            });
        },

        destroy() {
            document.removeEventListener("mousedown", onDocumentMouseDown);
            openSelects.clear();
            detachWheel();
            detachMiddlePan();
            detachContextMenu();
            controls.forEach((control) => control.destroy?.());
            controls.clear();
            cards.clear();
            host.remove();
        },
    };

    return api;
}
