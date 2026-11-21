'use strict';
/*
 * hud.js — the top bar and the overlay panels.
 *
 * The bar carries everything a judge (or player) needs at a glance:
 * the game's name as a MODEST gold banner (never a full-screen title),
 * the gallery name and "GALLERY n/5", three gem diamonds, the hearts,
 * and the HIDDEN / SEEN eye. A CROUCHED pill appears while crouching.
 */

function drawDiamond(ctx, x, y, filled) {
  ctx.beginPath();
  ctx.moveTo(x, y - 9);
  ctx.lineTo(x + 7, y);
  ctx.lineTo(x, y + 9);
  ctx.lineTo(x - 7, y);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = '#ffd34d';
    ctx.fill();
  }
  ctx.strokeStyle = '#ffd34d';
  ctx.lineWidth = 1.8;
  ctx.stroke();
}

function drawHeart(ctx, x, y, alive) {
  ctx.fillStyle = alive ? '#ff4d5e' : 'rgba(255,77,94,0.22)';
  ctx.beginPath();
  ctx.moveTo(x, y + 7);
  ctx.bezierCurveTo(x - 11, y - 3, x - 6, y - 11, x, y - 4);
  ctx.bezierCurveTo(x + 6, y - 11, x + 11, y - 3, x, y + 7);
  ctx.fill();
}

function drawEye(ctx, x, y, seen) {
  ctx.save();
  ctx.strokeStyle = seen ? '#ff5147' : '#57e6c9';
  ctx.fillStyle = seen ? '#ff5147' : '#57e6c9';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(x, y, 13, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw(ctx, state) {
  const { gallery, player } = state;
  // Bar background: near-black with a gold hairline.
  ctx.fillStyle = '#0b0e16';
  ctx.fillRect(0, 0, GI.W, GI.HUD);
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(0, GI.HUD - 2, GI.W, 2);

  ctx.textBaseline = 'middle';
  // Game banner — modest, top-left, HUD only.
  ctx.textAlign = 'left';
  ctx.font = 'bold 21px Georgia, serif';
  ctx.fillStyle = '#f2c14e';
  ctx.fillText('◆ GILDED IDOL', 22, GI.HUD / 2);

  // Gallery tracker.
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#e8e2d2';
  ctx.fillText(`${gallery.name} · GALLERY ${state.galleryIndex + 1}/5`, 268, GI.HUD / 2);

  // Gems: three diamonds plus a count.
  const gx = 700;
  for (let i = 0; i < 3; i++) drawDiamond(ctx, gx + i * 26, GI.HUD / 2, state.gems[i]);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#ffd34d';
  ctx.fillText(`${state.gemsCollected}/3`, gx + 84, GI.HUD / 2);

  // Hearts.
  for (let i = 0; i < 3; i++) drawHeart(ctx, 1010 + i * 30, GI.HUD / 2, i < state.hearts);

  // Crouch pill.
  if (player.crouched) {
    ctx.fillStyle = 'rgba(87, 230, 201, 0.16)';
    ctx.fillRect(1118, GI.HUD / 2 - 12, 92, 24);
    ctx.strokeStyle = '#57e6c9';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1118, GI.HUD / 2 - 12, 92, 24);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#57e6c9';
    ctx.textAlign = 'center';
    ctx.fillText('CROUCHED', 1164, GI.HUD / 2 + 1);
  }

  // The eye: HIDDEN or SEEN, top-right corner.
  const seen = state.playerSeen;
  drawEye(ctx, 1206, GI.HUD / 2 - 8, seen);
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = seen ? '#ff5147' : '#57e6c9';
  ctx.fillText(seen ? 'SEEN' : 'HIDDEN', 1206, GI.HUD / 2 + 13);
}

// Compact centred panel for title / caught / win / game over.
function drawOverlay(ctx, state) {
  const o = state.overlay;
  ctx.fillStyle = 'rgba(4, 6, 12, 0.72)';
  ctx.fillRect(0, GI.HUD, GI.W, GI.H - GI.HUD);
  const w = 560;
  const h = 210;
  const x = (GI.W - w) / 2;
  const y = (GI.H - h) / 2;
  ctx.fillStyle = '#10141f';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2c14e';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(o.title, GI.W / 2, y + 52);
  ctx.fillStyle = '#e8e2d2';
  ctx.font = '16px Georgia, serif';
  o.lines.forEach((line, i) => ctx.fillText(line, GI.W / 2, y + 96 + i * 26));
  ctx.fillStyle = '#57e6c9';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(o.prompt, GI.W / 2, y + h - 28);
}

GI.hud = { draw, drawOverlay };
