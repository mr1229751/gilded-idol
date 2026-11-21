'use strict';
/*
 * input.js — keyboard control of the thief.
 *
 *   WASD / arrow keys   move
 *   SHIFT (hold)        sprint — fast, but every stride throws a noise
 *                       ripple that guards walk toward
 *   C                   crouch — slow and quiet, half the silhouette
 *   ENTER               start / restart
 *
 * Movement is circle-vs-rectangle: the thief slides along vitrines and
 * walls instead of sticking to them. Sprinting also leaves the ripple
 * objects that museum-render draws and guard-patrol investigates.
 */

const keys = new Set();
let crouchLatch = false;

function attach(state) {
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === 'KeyC' && !e.repeat) {
      state.player.crouched = !state.player.crouched;
      crouchLatch = true;
    }
    keys.add(e.code);
    if (e.code === 'Enter' && state.onEnter) state.onEnter();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
}

// Push a circle out of every cover rect it overlaps; returns corrected x,y.
function resolveCollision(x, y, r, cover) {
  const F = GI.FIELD;
  x = Math.max(F.x + r, Math.min(F.x + F.w - r, x));
  y = Math.max(F.y + r, Math.min(F.y + F.h - r, y));
  for (const rect of cover) {
    const cx = Math.max(rect.x, Math.min(rect.x + rect.w, x));
    const cy = Math.max(rect.y, Math.min(rect.y + rect.h, y));
    const dx = x - cx;
    const dy = y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 >= r * r) continue;
    if (d2 > 0.0001) {
      const d = Math.sqrt(d2);
      x = cx + (dx / d) * r;
      y = cy + (dy / d) * r;
    } else {
      // Centre inside the rect: push out along the smallest exit.
      const left = x - rect.x;
      const right = rect.x + rect.w - x;
      const top = y - rect.y;
      const bottom = rect.y + rect.h - y;
      const min = Math.min(left, right, top, bottom);
      if (min === left) x = rect.x - r;
      else if (min === right) x = rect.x + rect.w + r;
      else if (min === top) y = rect.y - r;
      else y = rect.y + rect.h + r;
    }
  }
  return { x, y };
}

function updatePlayer(state, dt) {
  const p = state.player;
  let dx = 0;
  let dy = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
  if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;

  const sprinting = (keys.has('ShiftLeft') || keys.has('ShiftRight')) && !p.crouched;
  p.sprinting = sprinting && (dx !== 0 || dy !== 0);
  const speed = p.crouched ? 80 : sprinting ? 248 : 152;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    const nx = p.x + (dx / len) * speed * dt;
    const ny = p.y + (dy / len) * speed * dt;
    const solved = resolveCollision(nx, ny, p.r, state.cover);
    p.x = solved.x;
    p.y = solved.y;

    // Footstep trail: faint dots that fade behind the thief.
    p.trailT += dt;
    if (p.trailT > 0.13) {
      p.trailT = 0;
      p.trail.push({ x: p.x, y: p.y + 8, alpha: 0.5 });
    }
    // Sprint noise: a ripple every quarter second.
    if (p.sprinting) {
      p.rippleT += dt;
      if (p.rippleT > 0.26) {
        p.rippleT = 0;
        state.ripples.push({ x: p.x, y: p.y, r: 8, alpha: 0.75 });
      }
    }
  }
  for (const f of p.trail) f.alpha -= dt * 0.9;
  p.trail = p.trail.filter((f) => f.alpha > 0.03);
}

GI.input = { attach, updatePlayer, resolveCollision };
