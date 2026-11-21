'use strict';
/*
 * main.js — game state, the loop, and the staged screenshot scenes.
 *
 * Flow: title panel → sneak the gallery → steal 3 gems → slip out of the
 * glowing exit → next gallery. Caught with a full meter costs a heart;
 * three lost hearts end the night. Sprinting is fast but loud: its noise
 * ripples send guards to investigate, while a broken line of sight lets
 * every meter drain back down — patience is a mechanic, not a slogan.
 *
 * The ?shot=1..4 URLs stage four frozen scenes inside real galleries for
 * the entry screenshots — the game's own render, nothing faked.
 */

const GildedIdol = (() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');

  const state = {
    mode: 'title', // title | play | caught | win | over | shot
    galleryIndex: 0,
    gallery: null,
    cover: [],
    guards: [],
    player: null,
    gems: [],
    gemsCollected: 0,
    hearts: 3,
    ripples: [],
    playerSeen: false,
    overlay: null,
    caughtT: 0,
    t: 0,
  };

  function freshPlayer(x, y) {
    return {
      x, y, r: 16,
      crouched: false, sprinting: false,
      trail: [], trailT: 0, rippleT: 0, t: 0,
    };
  }

  function loadGallery(index) {
    const def = GI.galleries[index];
    state.galleryIndex = index;
    state.gallery = def;
    state.cover = [...def.props, ...def.wallsIn];
    state.guards = def.guards.map((g, i) => GI.patrol.makeGuard(g, i));
    state.player = freshPlayer(def.playerStart.x, def.playerStart.y);
    state.gems = def.gems.map(() => false);
    state.gemsCollected = 0;
    state.ripples = [];
    state.playerSeen = false;
    state.overlay = null;
  }

  function resetAttempt() {
    const hearts = state.hearts;
    loadGallery(state.galleryIndex);
    state.hearts = hearts;
  }

  function titleOverlay() {
    return {
      title: 'GILDED IDOL',
      lines: [
        'Five galleries. One idol. A small fortune in gems.',
        'WASD / arrows — move · SHIFT — sprint (loud!) · C — crouch',
        'Stay out of the cones, hide in shadow, let suspicion cool.',
      ],
      prompt: 'ENTER — begin the heist',
    };
  }

  state.onEnter = () => {
    if (state.mode === 'title') {
      state.mode = 'play';
      state.overlay = null;
    } else if (state.mode === 'win' || state.mode === 'over') {
      state.hearts = 3;
      loadGallery(0);
      state.mode = 'play';
    }
  };

  function onCaught() {
    state.hearts -= 1;
    if (state.hearts <= 0) {
      state.mode = 'over';
      state.overlay = {
        title: 'THE NIGHT ENDS',
        lines: ['The guards march the thief out past the gift shop.', 'The Idol keeps its gems — this time.'],
        prompt: 'ENTER — try again',
      };
    } else {
      state.mode = 'caught';
      state.caughtT = 1.1;
      state.overlay = {
        title: 'CAUGHT!',
        lines: ['A meter filled. A whistle blew. The gallery resets…'],
        prompt: '',
      };
    }
  }

  function update(dt) {
    state.player.t += dt;
    if (state.mode === 'caught') {
      state.caughtT -= dt;
      if (state.caughtT <= 0) {
        state.overlay = null;
        state.mode = 'play';
        resetAttempt();
      }
      return;
    }
    if (state.mode !== 'play') return;

    GI.input.updatePlayer(state, dt);
    for (const g of state.guards) GI.patrol.updateGuard(g, dt);

    // Noise ripples expand; a guard the ring washes over comes to look.
    for (const r of state.ripples) {
      r.r += 150 * dt;
      r.alpha = 0.75 * Math.max(0, 1 - r.r / 100);
      for (const g of state.guards) {
        const d = Math.hypot(g.x - r.x, g.y - r.y);
        if ((g.state === 'patrol' || g.state === 'returning') && Math.abs(d - r.r) < 16) {
          GI.patrol.guardNotice(g, r.x, r.y, 0.6);
        }
      }
    }
    state.ripples = state.ripples.filter((r) => r.r < 100);

    if (GI.detection.updateDetection(state, dt) === 'caught') {
      onCaught();
      return;
    }

    // Gem pickups.
    state.gallery.gems.forEach((gem, i) => {
      if (!state.gems[i] && Math.hypot(state.player.x - gem.x, state.player.y - gem.y) < 30) {
        state.gems[i] = true;
        state.gemsCollected += 1;
      }
    });

    // The exit only opens once every gem is pocketed.
    const e = state.gallery.exit;
    const p = state.player;
    if (state.gemsCollected >= 3 &&
        p.x + p.r > e.x - 4 && p.x - p.r < e.x + e.w + 4 &&
        p.y + p.r > e.y - 4 && p.y - p.r < e.y + e.h + 4) {
      if (state.galleryIndex >= GI.galleries.length - 1) {
        state.mode = 'win';
        state.overlay = {
          title: 'THE IDOL IS YOURS',
          lines: ['Five galleries emptied, not a single alarm raised', 'that the museum will admit to. A clean night’s work.'],
          prompt: 'ENTER — steal it all again',
        };
      } else {
        const hearts = state.hearts;
        loadGallery(state.galleryIndex + 1);
        state.hearts = hearts;
      }
    }
  }

  // --- staged screenshot scenes ---------------------------------------------

  function place(g, x, y, facing, opts = {}) {
    g.x = x;
    g.y = y;
    g.facing = facing;
    if (opts.state) g.state = opts.state;
    if (opts.meter != null) g.meter = opts.meter;
    if (opts.lastKnown) g.lastKnown = opts.lastKnown;
    g.seesPlayer = !!opts.seesPlayer;
    g.waitT = 0;
  }

  function applyShot(n) {
    if (n === 1) {
      // COVER — Hall of Statues, mid-action: a guard's meter climbs as the
      // thief crosses his cone; two more cones sweep the statue hall.
      loadGallery(2);
      const s = state;
      s.player.x = 520; s.player.y = 455;
      place(s.guards[0], 375, 330, 0.711, {
        state: 'suspicious', meter: 0.40, seesPlayer: true,
        lastKnown: { x: 520, y: 455 },
      });
      place(s.guards[1], 820, 600, 2.6);
      place(s.guards[2], 560, 520, -Math.PI / 2);
      s.playerSeen = true;
    } else if (n === 2) {
      // The Long Gallery: crouched in a vitrine's blind spot, inches from a
      // staring guard whose meter is draining; sprint ripples fade nearby.
      loadGallery(1);
      const s = state;
      s.player.x = 532; s.player.y = 192;
      s.player.crouched = true;
      place(s.guards[0], 580, 290, -2.02, {
        state: 'suspicious', meter: 0.25, lastKnown: { x: 556, y: 240 },
      });
      place(s.guards[1], 950, 560, Math.PI);
      place(s.guards[2], 660, 470, Math.PI / 2);
      s.ripples = [
        { x: 470, y: 330, r: 24, alpha: 0.7 },
        { x: 470, y: 330, r: 50, alpha: 0.45 },
      ];
      s.gems = [false, false, true];
      s.gemsCollected = 1;
    } else if (n === 3) {
      // RECOVERY — Vault Antechamber: the guard searches the last-known
      // spot, meter at 55% and COOLING, while the thief slips past the
      // edge of his cone. Two more guards patrol the background.
      loadGallery(3);
      const s = state;
      s.player.x = 698; s.player.y = 334;
      place(s.guards[0], 880, 300, 2.2, {
        state: 'searching', meter: 0.55, lastKnown: { x: 803, y: 405 },
      });
      place(s.guards[1], 400, 480, 0);
      place(s.guards[2], 180, 430, Math.PI / 2);
      s.gems = [true, false, false];
      s.gemsCollected = 1;
    } else if (n === 4) {
      // FINALE — Idol Sanctum: every gem pocketed, the exit glowing, the
      // thief standing in its light while four cones sweep an empty room.
      loadGallery(4);
      const s = state;
      s.player.x = 640; s.player.y = 118;
      place(s.guards[0], 500, 260, Math.PI / 2);
      place(s.guards[1], 780, 620, -Math.PI / 2);
      place(s.guards[2], 350, 432, 0);
      place(s.guards[3], 1060, 430, Math.PI);
      s.gems = [true, true, true];
      s.gemsCollected = 3;
    }
    state.mode = 'shot';
    state.overlay = null;
  }

  function boot() {
    const shot = Number(new URLSearchParams(window.location.search).get('shot'));
    if (shot >= 1 && shot <= 4) {
      applyShot(shot);
    } else {
      loadGallery(0);
      state.mode = 'title';
      state.overlay = titleOverlay();
    }
    GI.input.attach(state);
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      state.t += dt;
      if (state.mode !== 'shot') update(dt);
      else state.player.t += dt;
      GI.render.render(ctx, state);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  return { boot };
})();
