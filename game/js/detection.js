'use strict';
/*
 * detection.js — the suspicion meter: how fast guards spot the thief, and
 * how the thief recovers.
 *
 * A guard fills his meter while he has line of sight inside his cone.
 * The fill rate is a product of honest stealth modifiers:
 *   - closer fills faster;
 *   - standing in a lantern's amber pool fills 1.7x faster (light is danger);
 *   - crouching fills 0.45x (a smaller silhouette);
 *   - standing in a blue-black shadow pool fills 0.5x (shadow is safety).
 * Break line of sight and the meter DECAYS — detection with recovery.
 * At 25% the guard stops and stares; if he loses the thief above 50% he
 * walks to the last-known position and searches while it drains. At 100%
 * the thief is caught.
 */

function guardSeesPlayer(g, player, cover) {
  const dx = player.x - g.x;
  const dy = player.y - g.y;
  const dist = Math.hypot(dx, dy);
  if (dist > GI.GUARD_RANGE) return false;
  const ang = Math.atan2(dy, dx);
  if (GI.geometry.angleDiff(ang, g.facing) > GI.GUARD_HALF_ANGLE) return false;
  return GI.geometry.lineOfSight(g.x, g.y, player.x, player.y, cover);
}

// Returns 'caught' when any guard's meter tops out, else null.
function updateDetection(state, dt) {
  const { player, guards, cover, gallery } = state;
  let anyoneSees = false;

  for (const g of guards) {
    const sees = guardSeesPlayer(g, player, cover);
    g.seesPlayer = sees;

    if (sees) {
      anyoneSees = true;
      const dist = Math.hypot(player.x - g.x, player.y - g.y);
      let rate = 0.62 * (1.15 - 0.55 * (dist / GI.GUARD_RANGE));
      if (GI.lighting.isLit(player.x, player.y, gallery)) rate *= 1.7;
      if (player.crouched) rate *= 0.45;
      if (GI.lighting.isShadow(player.x, player.y, gallery)) rate *= 0.5;
      g.meter = Math.min(1, g.meter + rate * dt);
      g.lastKnown = { x: player.x, y: player.y };
      g.wasSeen = true;

      if (g.meter >= 1) return 'caught';
      if (g.state === 'patrol' || g.state === 'returning') {
        g.state = 'suspicious';
      } else if (g.state === 'searching') {
        g.state = 'suspicious';
        g.scanT = 0;
      }
    } else {
      // Unseen: the meter drains. This decay is the recovery mechanic.
      const wasHigh = g.meter >= 0.5;
      g.meter = Math.max(0, g.meter - 0.26 * dt);
      if (g.wasSeen && g.state === 'suspicious') {
        if (wasHigh) {
          g.state = 'searching';
          g.scanT = 0;
        } else if (g.meter < 0.12) {
          g.state = 'returning';
          g.wasSeen = false;
        }
      } else if (g.state === 'searching' && g.meter < 0.1) {
        g.wasSeen = false;
      }
    }
  }

  state.playerSeen = anyoneSees;
  return null;
}

GI.detection = { guardSeesPlayer, updateDetection };
