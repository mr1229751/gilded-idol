'use strict';
/*
 * museum-render.js — draws the whole scene, back to front:
 *   wood floor and red carpets, hatched shadow pools, lantern light,
 *   marble walls, the furniture (each prop type with its own look),
 *   gems and the exit door, vision cones clipped by cover, patrol paths,
 *   noise ripples, the guards with their suspicion meters, and finally
 *   the thief — big, bright-ringed, impossible to miss.
 *
 * The screenshots ARE the game's shop window, so every element is drawn
 * at a size and contrast that survives being shrunk into a contact sheet.
 */

const WOOD_DARK = '#4a3220';
const WOOD_LIGHT = '#5a3d27';

// --- floor, walls, carpets, shadows ---------------------------------------

function drawFloor(ctx, gallery) {
  const F = GI.FIELD;
  // Warm dark wood: alternating plank bands with seam lines.
  for (let y = F.y, row = 0; y < F.y + F.h; y += 34, row++) {
    ctx.fillStyle = row % 2 ? WOOD_DARK : WOOD_LIGHT;
    ctx.fillRect(F.x, y, F.w, Math.min(34, F.y + F.h - y));
  }
  ctx.strokeStyle = 'rgba(30, 18, 8, 0.5)';
  ctx.lineWidth = 1;
  for (let y = F.y + 34; y < F.y + F.h; y += 34) {
    ctx.beginPath(); ctx.moveTo(F.x, y); ctx.lineTo(F.x + F.w, y); ctx.stroke();
  }
  for (let x = F.x + 92; x < F.x + F.w; x += 184) {
    ctx.beginPath(); ctx.moveTo(x, F.y); ctx.lineTo(x, F.y + F.h); ctx.stroke();
  }
  // Red carpet runners.
  for (const c of gallery.carpets) {
    ctx.fillStyle = '#7e2430';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
  }
  // Shadow pools: deep blue-black with a diagonal moonlight hatch.
  for (const s of gallery.shadows) {
    ctx.fillStyle = '#0a1224';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(s.x, s.y, s.w, s.h);
    ctx.clip();
    ctx.strokeStyle = 'rgba(120, 165, 235, 0.16)';
    ctx.lineWidth = 5;
    for (let d = -s.h; d < s.w; d += 22) {
      ctx.beginPath();
      ctx.moveTo(s.x + d, s.y + s.h);
      ctx.lineTo(s.x + d + s.h, s.y);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(110, 155, 225, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  }
}

function drawWalls(ctx, gallery) {
  const F = GI.FIELD;
  ctx.fillStyle = '#232733';
  ctx.fillRect(0, GI.HUD, GI.W, F.y - GI.HUD);
  ctx.fillRect(0, F.y + F.h, GI.W, GI.H - (F.y + F.h));
  ctx.fillRect(0, F.y, F.x, F.h);
  ctx.fillRect(F.x + F.w, F.y, GI.W - (F.x + F.w), F.h);
  ctx.strokeStyle = '#c8b280';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(F.x, F.y, F.w, F.h);
  // Interior wall blocks: pale marble with a dark cap.
  for (const w of gallery.wallsIn) {
    ctx.fillStyle = '#8d94a6';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#565e70';
    ctx.fillRect(w.x, w.y, w.w, Math.min(5, w.h));
    ctx.strokeStyle = 'rgba(10,10,16,0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
}

// --- props -----------------------------------------------------------------

function drawProp(ctx, p) {
  const { x, y, w, h } = p;
  ctx.save();
  if (p.type === 'vitrine') {
    // Glass display case: dark base, blue glass, a golden treasure inside.
    ctx.fillStyle = '#3a2415';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(165, 205, 240, 0.5)';
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 9, y + h - 8);
    ctx.lineTo(x + w - 16, y + 7);
    ctx.stroke();
    ctx.strokeStyle = '#120b06';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, w, h);
  } else if (p.type === 'statue') {
    ctx.fillStyle = '#6d7280';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#d7dce6';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 12, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 10, y + h - 5);
    ctx.lineTo(x + w / 2, y + 17);
    ctx.lineTo(x + w / 2 + 10, y + h - 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#14161c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  } else if (p.type === 'pedestal') {
    ctx.fillStyle = '#7a6a4f';
    ctx.fillRect(x, y, w, h);
    const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, 2, x + w / 2, y + h / 2, 11);
    grad.addColorStop(0, '#fff3b0');
    grad.addColorStop(1, '#e08a00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#191008';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  } else if (p.type === 'planter') {
    ctx.fillStyle = '#5c4326';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#2e7d3a';
    for (const [ox, oy] of [[12, 10], [26, 16], [40, 9], [19, 24], [34, 25]]) {
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#43a047';
    for (const [ox, oy] of [[18, 13], [32, 20], [44, 16]]) {
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#170f06';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  } else if (p.type === 'bench') {
    ctx.fillStyle = '#6e4a2a';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3c2712';
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + (h / 3) * i);
      ctx.lineTo(x + w, y + (h / 3) * i);
      ctx.stroke();
    }
    ctx.strokeStyle = '#170f06';
    ctx.strokeRect(x, y, w, h);
  } else if (p.type === 'rope') {
    // Queue barrier: brass posts and a sagging scarlet rope.
    ctx.strokeStyle = '#a31621';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 5);
    ctx.quadraticCurveTo(x + w / 2, y + h + 4, x + w - 5, y + 5);
    ctx.stroke();
    ctx.fillStyle = '#d9a441';
    for (const px of [x + 5, x + w - 5]) {
      ctx.beginPath();
      ctx.arc(px, y + 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(px - 2, y + 6, 4, h - 4);
    }
  } else if (p.type === 'crate') {
    ctx.fillStyle = '#7d5a30';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#45300f';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 3);
    ctx.lineTo(x + w - 3, y + h - 3);
    ctx.moveTo(x + w - 3, y + 3);
    ctx.lineTo(x + 3, y + h - 3);
    ctx.stroke();
  } else if (p.type === 'idol') {
    // The Gilded Idol on its dais: the prize of the whole museum.
    ctx.fillStyle = '#5e1f26';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    const grad = ctx.createRadialGradient(x + w / 2, y + h / 2 - 4, 3, x + w / 2, y + h / 2 - 4, 22);
    grad.addColorStop(0, '#fff0a0');
    grad.addColorStop(1, '#c77f00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 - 8, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + w / 2 - 12, y + h / 2 + 1, 24, 16);
    ctx.fillStyle = '#123a6e';
    for (const sx of [-6, 6]) {
      ctx.beginPath();
      ctx.arc(x + w / 2 + sx, y + h / 2 - 10, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// --- gems, exit, paths, ripples -------------------------------------------

function drawGem(ctx, gx, gy, taken, t) {
  if (taken) return;
  const bob = Math.sin(t * 2.2 + gx) * 2;
  ctx.save();
  ctx.translate(gx, gy + bob);
  ctx.fillStyle = '#ffe14d';
  ctx.strokeStyle = '#7a5200';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(10, 0);
  ctx.lineTo(0, 13);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(5, -2);
  ctx.lineTo(-5, -2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawExit(ctx, gallery, open, t) {
  const e = gallery.exit;
  const pulse = open ? 0.75 + Math.sin(t * 3) * 0.25 : 0.25;
  ctx.fillStyle = open ? `rgba(255, 205, 74, ${pulse})` : '#3d3a30';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = open ? '#fff0b0' : '#191919';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = open ? '#5a3a00' : '#8a8578';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = e.w >= e.h ? 'EXIT' : 'E\nX\nI\nT';
  if (e.w >= e.h) ctx.fillText(label, e.x + e.w / 2, e.y + e.h / 2);
  else ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2);
}

function drawPatrolPaths(ctx, guards) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 235, 190, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 7]);
  for (const g of guards) {
    if (g.path.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(g.path[0][0], g.path[0][1]);
    for (let i = 1; i < g.path.length; i++) ctx.lineTo(g.path[i][0], g.path[i][1]);
    if (g.path.length > 2) ctx.closePath();
    ctx.stroke();
    for (const [px, py] of g.path) {
      ctx.fillStyle = 'rgba(255, 235, 190, 0.55)';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawRipples(ctx, ripples) {
  for (const r of ripples) {
    ctx.strokeStyle = `rgba(190, 240, 255, ${r.alpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// --- cones, guards, thief ---------------------------------------------------

function drawCone(ctx, g, cover, searching) {
  const poly = GI.geometry.conePolygon(g.x, g.y, g.facing, GI.GUARD_HALF_ANGLE, GI.GUARD_RANGE, cover, GI.FIELD);
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
  if (g.seesPlayer || g.meter > 0.55) ctx.fillStyle = 'rgba(255, 84, 60, 0.34)';
  else if (searching) ctx.fillStyle = 'rgba(255, 205, 66, 0.30)';
  else ctx.fillStyle = 'rgba(255, 214, 110, 0.26)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 230, 160, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawMeter(ctx, g) {
  if (g.meter <= 0.02) return;
  const w = 48;
  const h = 8;
  const x = g.x - w / 2;
  const y = g.y - 42;
  ctx.fillStyle = 'rgba(5, 5, 10, 0.8)';
  ctx.fillRect(x - 1.5, y - 1.5, w + 3, h + 3);
  const frac = g.meter;
  ctx.fillStyle = frac < 0.4 ? '#ffd23e' : frac < 0.7 ? '#ff9f1c' : '#ff3b30';
  ctx.fillRect(x, y, w * frac, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  // State glyph: ! when he is onto the thief, ? while searching.
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'center';
  if (g.state === 'suspicious' || g.seesPlayer) {
    ctx.fillStyle = '#ff5147';
    ctx.fillText('!', g.x, y - 8);
  } else if (g.state === 'searching') {
    ctx.fillStyle = '#ffd23e';
    ctx.fillText('?', g.x, y - 8);
  }
  // The recovery tell: while a searching guard's meter drains, label it —
  // on a dark backing plate so it survives the cone glow behind it.
  if (g.state === 'searching' && !g.seesPlayer) {
    ctx.fillStyle = 'rgba(5, 8, 14, 0.78)';
    ctx.fillRect(g.x - 37, y + h + 3, 74, 30);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#9be7ff';
    ctx.fillText('▼ COOLING', g.x, y + h + 14);
    const lit = Math.ceil(frac * 5);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < lit ? '#9be7ff' : 'rgba(155, 231, 255, 0.25)';
      ctx.fillRect(g.x - 20 + i * 9, y + h + 21, 6, 4);
    }
  }
}

function drawGuard(ctx, g) {
  ctx.save();
  ctx.translate(g.x, g.y);
  // Direction tick.
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(Math.cos(g.facing) * 10, Math.sin(g.facing) * 10);
  ctx.lineTo(Math.cos(g.facing) * 19, Math.sin(g.facing) * 19);
  ctx.stroke();
  // Body: scarlet coat, dark outline, white trim, brass cap.
  ctx.fillStyle = '#c1272d';
  ctx.strokeStyle = '#0d0d12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, GI.patrol.GUARD_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, GI.patrol.GUARD_RADIUS - 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawMeter(ctx, g);
}

function drawPlayer(ctx, player) {
  // Footstep trail first (under the sprite).
  for (const f of player.trail) {
    ctx.fillStyle = `rgba(200, 240, 255, ${f.alpha})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(player.x, player.y);
  // Glowing ring: the thief must be findable in under a second.
  const pulse = 3 + Math.sin(player.t * 4) * 1.2;
  ctx.strokeStyle = 'rgba(64, 224, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, player.r + pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#eafcff';
  ctx.strokeStyle = '#062a38';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, player.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Hood and mask band.
  ctx.fillStyle = '#0e7ea6';
  ctx.beginPath();
  ctx.arc(0, -3, player.r - 6, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#12303c';
  ctx.fillRect(-player.r + 4, -2, player.r * 2 - 8, 5);
  if (player.crouched) {
    ctx.strokeStyle = '#eafcff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 1, player.r - 3, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

// Last-known-position marker: an X in a dashed ring where a guard is headed.
function drawLastKnown(ctx, guards) {
  for (const g of guards) {
    if (g.state !== 'searching' || !g.lastKnown) continue;
    const { x, y } = g.lastKnown;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 210, 63, 0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6);
    ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6);
    ctx.stroke();
    ctx.restore();
  }
}

// --- the whole frame --------------------------------------------------------

function render(ctx, state) {
  const { gallery, guards, player, cover, t } = state;
  ctx.clearRect(0, 0, GI.W, GI.H);
  ctx.fillStyle = '#07090f';
  ctx.fillRect(0, 0, GI.W, GI.H);

  drawFloor(ctx, gallery);
  GI.lighting.drawLightPools(ctx, gallery);
  drawWalls(ctx, gallery);
  drawExit(ctx, gallery, state.gemsCollected >= 3, t);
  for (const p of gallery.props) drawProp(ctx, p);
  gallery.gems.forEach((gem, i) => drawGem(ctx, gem.x, gem.y, state.gems[i], t));
  GI.lighting.drawLanterns(ctx, gallery);
  drawPatrolPaths(ctx, guards);
  for (const g of guards) drawCone(ctx, g, cover, g.state === 'searching');
  drawLastKnown(ctx, guards);
  drawRipples(ctx, state.ripples);
  for (const g of guards) drawGuard(ctx, g);
  if (state.mode === 'play' || state.mode === 'shot') drawPlayer(ctx, player);
  GI.hud.draw(ctx, state);
  if (state.overlay) GI.hud.drawOverlay(ctx, state);
}

GI.render = { render };
