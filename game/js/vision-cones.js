'use strict';
/*
 * vision-cones.js — ray casting and line-of-sight geometry.
 *
 * Guards do not see through the museum's furniture. Every vision cone is
 * built by casting a fan of rays from the guard's eyes; each ray stops at
 * the first cover rectangle (vitrine, statue, wall block...) or at the
 * gallery wall. The same segment test decides whether a guard has a clear
 * line of sight to the thief.
 */

// Distance from point (ox,oy) along unit direction (dx,dy) to the nearest
// side of rect r, or Infinity when the ray misses. Slab method.
function rayRect(ox, oy, dx, dy, r) {
  let tmin = 0;
  let tmax = Infinity;
  if (Math.abs(dx) < 1e-9) {
    if (ox < r.x || ox > r.x + r.w) return Infinity;
  } else {
    let t1 = (r.x - ox) / dx;
    let t2 = (r.x + r.w - ox) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmax < tmin) return Infinity;
  }
  if (Math.abs(dy) < 1e-9) {
    if (oy < r.y || oy > r.y + r.h) return Infinity;
  } else {
    let t1 = (r.y - oy) / dy;
    let t2 = (r.y + r.h - oy) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmax < tmin) return Infinity;
  }
  return tmin;
}

// Cast one ray; returns the distance it travelled before hitting cover or
// the field boundary, capped at maxDist.
function castRay(ox, oy, angle, maxDist, cover, field) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  // Field boundary acts as four walls.
  const walls = [
    { x: field.x - 40, y: field.y - 40, w: 40, h: field.h + 80 },
    { x: field.x + field.w, y: field.y - 40, w: 40, h: field.h + 80 },
    { x: field.x - 40, y: field.y - 40, w: field.w + 80, h: 40 },
    { x: field.x - 40, y: field.y + field.h, w: field.w + 80, h: 40 },
  ];
  for (const r of walls) {
    const t = rayRect(ox, oy, dx, dy, r);
    if (t < best) best = t;
  }
  for (const r of cover) {
    const t = rayRect(ox, oy, dx, dy, r);
    if (t > 0.001 && t < best) best = t;
  }
  return best;
}

// Polygon of a guard's vision cone: origin plus one vertex per ray.
function conePolygon(gx, gy, facing, halfAngle, range, cover, field) {
  const pts = [{ x: gx, y: gy }];
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const a = facing - halfAngle + (2 * halfAngle * i) / steps;
    const d = castRay(gx, gy, a, range, cover, field);
    pts.push({ x: gx + Math.cos(a) * d, y: gy + Math.sin(a) * d });
  }
  return pts;
}

// Segment vs rect: does the open segment (x1,y1)-(x2,y2) cross rect r?
// Liang–Barsky clipping: the segment is blocked when a positive-length
// portion of it lies inside the rect before reaching the target point.
function segmentBlocked(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-9) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  // Blocked only if the segment spends real distance inside the rect and
  // enters it before arriving (a target hugging the far edge still counts).
  return t1 - t0 > 0.002 && t0 < 0.999;
}

// True when nothing solid stands between two points.
function lineOfSight(x1, y1, x2, y2, cover) {
  for (const r of cover) {
    if (segmentBlocked(x1, y1, x2, y2, r)) return false;
  }
  return true;
}

// Smallest absolute difference between two headings, in [0, PI].
function angleDiff(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

// Is a point inside any of a list of rects? (shadow zones, carpets...)
function pointInRects(x, y, rects) {
  for (const r of rects) {
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true;
  }
  return false;
}

GI.geometry = { rayRect, castRay, conePolygon, segmentBlocked, lineOfSight, angleDiff, pointInRects };
