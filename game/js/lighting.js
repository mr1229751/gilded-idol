'use strict';
/*
 * lighting.js — the museum's three zones of light, the game's core language:
 *
 *   LANTERN POOLS  warm amber discs around a visible lantern prop.
 *                  Beautiful and dangerous: detection fills 1.7x here.
 *   SHADOW POOLS   deep blue-black rectangles with a moonlight hatch.
 *                  Safety: detection fills at half rate here.
 *   WOOD FLOOR     warm dark planks everywhere else — neutral ground.
 *
 * The zones must read instantly from a screenshot, so the palette keeps
 * them far apart: amber vs blue-black vs brown.
 */

function isLit(x, y, gallery) {
  for (const l of gallery.lanterns) {
    if (Math.hypot(x - l.x, y - l.y) < GI.LIGHT_RADIUS) return true;
  }
  return false;
}

function isShadow(x, y, gallery) {
  return GI.geometry.pointInRects(x, y, gallery.shadows);
}

// Warm radial glow for each lantern, drawn over the floor but under the
// furniture. Additive-feeling: two stacked radial gradients.
function drawLightPools(ctx, gallery) {
  for (const l of gallery.lanterns) {
    const grad = ctx.createRadialGradient(l.x, l.y, 6, l.x, l.y, GI.LIGHT_RADIUS);
    grad.addColorStop(0, 'rgba(255, 196, 92, 0.50)');
    grad.addColorStop(0.55, 'rgba(255, 166, 66, 0.26)');
    grad.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(l.x, l.y, GI.LIGHT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

// The lantern prop itself: a slim brass stand with a bright flame core,
// drawn after the furniture so it is never hidden by its own glow.
function drawLanterns(ctx, gallery) {
  for (const l of gallery.lanterns) {
    ctx.fillStyle = '#2a1c10';
    ctx.fillRect(l.x - 2.5, l.y - 4, 5, 16);
    ctx.fillStyle = '#c9962e';
    ctx.beginPath();
    ctx.arc(l.x, l.y - 8, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.arc(l.x, l.y - 8, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(l.x, l.y - 8, 6.5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

GI.lighting = { isLit, isShadow, drawLightPools, drawLanterns };
