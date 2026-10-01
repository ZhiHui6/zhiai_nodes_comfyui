export const NODE_TITLE_GLYPH = { idle: "#A1C4FA", active: "#D6E4FF" };

const BOX = 2;
const SIDE = 28;
const RADIUS = 8;
const STROKE = 2;
const STROKE_IDLE = "#76A4F6";
const STROKE_ACTIVE = "#A1C4FA";
const FILL_IDLE_TOP = "#3A486A";
const FILL_IDLE_BOTTOM = "#35405D";
const FILL_ACTIVE_TOP = "#455880";
const FILL_ACTIVE_BOTTOM = "#3E4C72";
const GLYPH_FONT = "bold 24px system-ui";
const GLYPH_X = 16;
const GLYPH_Y = 19;

export function drawNodeTitleChip(ctx, active) {
    const grad = ctx.createLinearGradient(BOX, BOX, BOX + SIDE, BOX + SIDE);
    grad.addColorStop(0, active ? FILL_ACTIVE_TOP : FILL_IDLE_TOP);
    grad.addColorStop(1, active ? FILL_ACTIVE_BOTTOM : FILL_IDLE_BOTTOM);
    ctx.beginPath();
    ctx.roundRect(BOX, BOX, SIDE, SIDE, RADIUS);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = active ? STROKE_ACTIVE : STROKE_IDLE;
    ctx.lineWidth = STROKE;
    ctx.stroke();
}

export function drawNodeHelpButton(ctx, active) {
    drawNodeTitleChip(ctx, active);
    ctx.font = GLYPH_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = active ? NODE_TITLE_GLYPH.active : NODE_TITLE_GLYPH.idle;
    ctx.fillText("?", GLYPH_X, GLYPH_Y);
}
