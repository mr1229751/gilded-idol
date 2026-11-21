'use strict';
/*
 * guard-patrol.js — how guards move and think.
 *
 * A guard walks his patrol path until something disturbs him:
 *   patrol     — follow the waypoints, pausing a beat at each end.
 *   suspicious — stopped, staring at whatever caught his eye.
 *   searching  — walk to the last-known position, sweep the room, and
 *                (in detection.js) watch his meter drain: the COOLING
 *                moment a careful thief waits for.
 *   returning  — walk back to the nearest patrol waypoint, then resume.
 *
 * Guards are big, readable sprites: scarlet coat, white trim, dark outline.
 */

const GUARD_RADIUS = 17;

function makeGuard(def, index) {
  const [sx, sy] = def.path[0];
  return {
    id: index,
    x: sx,
    y: sy,
    path: def.path,
    speed: def.speed,
    wp: def.path.length > 1 ? 1 : 0,
    facing: def.path.length > 1
      ? Math.atan2(def.path[1][1] - sy, def.path[1][0] - sx)
      : 0,
    state: 'patrol',
    meter: 0,
    lastKnown: null,
    waitT: 0,
    scanT: 0,
    seesPlayer: false,
    wasSeen: false,
  };
}

// Turn a heading toward a target heading at a limited rate.
function turnToward(g, target, rate, dt) {
  let d = (target - g.facing) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  const step = rate * dt;
  if (Math.abs(d) <= step) g.facing = target;
  else g.facing += Math.sign(d) * step;
}

// Move toward a point; returns true on arrival.
function moveToward(g, tx, ty, speed, dt) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 3) return true;
  const step = Math.min(dist, speed * dt);
  g.x += (dx / dist) * step;
  g.y += (dy / dist) * step;
  turnToward(g, Math.atan2(dy, dx), 7, dt);
  return dist - step < 3;
}

function nearestWaypoint(g) {
  let best = 0;
  let bestD = Infinity;
  g.path.forEach(([px, py], i) => {
    const d = Math.hypot(px - g.x, py - g.y);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

// Something (a sprint's noise ripple, a glimpse) draws a guard's attention.
function guardNotice(g, x, y, strength) {
  g.lastKnown = { x, y };
  if (g.state === 'patrol' || g.state === 'returning') {
    g.state = strength >= 0.5 ? 'searching' : 'suspicious';
    g.scanT = 0;
  }
}

function updateGuard(g, dt) {
  if (g.state === 'patrol') {
    const [tx, ty] = g.path[g.wp];
    if (g.waitT > 0) {
      g.waitT -= dt;
      return;
    }
    if (moveToward(g, tx, ty, g.speed, dt)) {
      // Ping-pong along the path, pausing briefly at each waypoint.
      const next = g.wp + (g.dir || 1);
      if (next < 0 || next >= g.path.length) g.dir = -(g.dir || 1);
      g.wp += g.dir || 1;
      g.waitT = 0.7;
    }
  } else if (g.state === 'suspicious') {
    // Stand still and stare at the last-known position.
    if (g.lastKnown) {
      turnToward(g, Math.atan2(g.lastKnown.y - g.y, g.lastKnown.x - g.x), 5, dt);
    }
  } else if (g.state === 'searching') {
    if (g.lastKnown && moveToward(g, g.lastKnown.x, g.lastKnown.y, g.speed * 1.25, dt)) {
      // Arrived: sweep the facing back and forth while the meter drains.
      g.scanT += dt;
      g.facing += Math.sin(g.scanT * 2.4) * 1.9 * dt;
      if (g.scanT > 2.4) {
        g.state = 'returning';
        g.scanT = 0;
      }
    }
  } else if (g.state === 'returning') {
    const i = nearestWaypoint(g);
    const [tx, ty] = g.path[i];
    if (moveToward(g, tx, ty, g.speed * 1.1, dt)) {
      g.wp = i;
      g.dir = 1;
      g.state = 'patrol';
    }
  }
}

GI.patrol = { GUARD_RADIUS, makeGuard, updateGuard, guardNotice, turnToward };
