'use strict';
/*
 * galleries.js — the museum itself: shared stage constants and the five
 * gallery layouts as data.
 *
 * Every prop is a solid rectangle: it blocks the thief's movement, blocks
 * guard line of sight, and clips vision cones. Lanterns are slim stands —
 * they pour light but do not block sight. Shadow zones are deep blue-black
 * pools where a crouched thief is hard to see; lantern pools are warm
 * amber and dangerous. Coordinates are canvas pixels on a 1280x800 stage;
 * the top 64 px are the HUD.
 */

const GI = {
  W: 1280,
  H: 800,
  HUD: 64,
  FIELD: { x: 24, y: 88, w: 1232, h: 688 },
  GUARD_RANGE: 215,
  GUARD_HALF_ANGLE: 0.58, // ~33 degrees
  LIGHT_RADIUS: 98,
};

const PROP = (type, x, y, w, h) => ({ type, x, y, w, h });

const GALLERIES = [
  {
    name: 'Gallery of Dawn',
    playerStart: { x: 90, y: 720 },
    exit: { x: 1232, y: 396, w: 24, h: 72 },
    props: [
      PROP('vitrine', 150, 180, 64, 44), PROP('vitrine', 150, 560, 64, 44),
      PROP('vitrine', 1066, 180, 64, 44), PROP('vitrine', 1066, 560, 64, 44),
      PROP('statue', 420, 150, 40, 40), PROP('statue', 820, 150, 40, 40),
      PROP('pedestal', 420, 690, 32, 32), PROP('pedestal', 820, 690, 32, 32),
      PROP('planter', 600, 180, 52, 34), PROP('planter', 600, 600, 52, 34),
      PROP('planter', 90, 400, 52, 34),
      PROP('bench', 560, 420, 76, 26), PROP('bench', 760, 250, 76, 26),
      PROP('rope', 300, 430, 96, 16), PROP('rope', 870, 430, 96, 16),
    ],
    wallsIn: [
      { x: 636, y: 300, w: 14, h: 140 },
      { x: 200, y: 520, w: 140, h: 14 },
    ],
    lanterns: [{ x: 640, y: 200 }, { x: 240, y: 640 }, { x: 1040, y: 640 }],
    shadows: [
      { x: 60, y: 600, w: 180, h: 140 },
      { x: 1040, y: 110, w: 180, h: 130 },
      { x: 560, y: 660, w: 160, h: 90 },
    ],
    carpets: [
      { x: 440, y: 380, w: 400, h: 90 },
      { x: 100, y: 380, w: 180, h: 60 },
    ],
    gems: [{ x: 340, y: 240 }, { x: 940, y: 240 }, { x: 640, y: 560 }],
    guards: [
      { path: [[300, 300], [1000, 300], [1000, 470], [300, 470]], speed: 62 },
      { path: [[1100, 665], [180, 665]], speed: 55 },
    ],
  },
  {
    name: 'The Long Gallery',
    playerStart: { x: 80, y: 430 },
    exit: { x: 1232, y: 404, w: 24, h: 72 },
    props: [
      PROP('vitrine', 140, 210, 64, 44), PROP('vitrine', 320, 210, 64, 44),
      PROP('vitrine', 500, 210, 64, 44), PROP('vitrine', 140, 600, 64, 44),
      PROP('vitrine', 320, 600, 64, 44), PROP('vitrine', 500, 600, 64, 44),
      PROP('statue', 700, 180, 40, 40), PROP('statue', 700, 620, 40, 40),
      PROP('planter', 1080, 200, 52, 34), PROP('planter', 1080, 580, 52, 34),
      PROP('bench', 520, 470, 76, 26), PROP('bench', 880, 420, 76, 26),
      PROP('rope', 180, 430, 96, 16), PROP('rope', 980, 340, 96, 16),
      PROP('pedestal', 1150, 420, 32, 32), PROP('pedestal', 90, 620, 32, 32),
    ],
    wallsIn: [
      { x: 400, y: 88, w: 14, h: 180 },
      { x: 860, y: 508, w: 14, h: 180 },
      { x: 620, y: 330, w: 14, h: 150 },
    ],
    lanterns: [{ x: 250, y: 430 }, { x: 640, y: 180 }, { x: 1030, y: 430 }],
    shadows: [
      { x: 60, y: 110, w: 200, h: 120 },
      { x: 1020, y: 640, w: 200, h: 110 },
      { x: 520, y: 640, w: 240, h: 110 },
    ],
    carpets: [{ x: 120, y: 380, w: 1040, h: 54 }],
    gems: [{ x: 1150, y: 150 }, { x: 120, y: 700 }, { x: 640, y: 500 }],
    guards: [
      { path: [[200, 300], [1080, 300]], speed: 70 },
      { path: [[1080, 560], [200, 560]], speed: 66 },
      { path: [[660, 150], [660, 690]], speed: 48 },
    ],
  },
  {
    name: 'Hall of Statues',
    playerStart: { x: 640, y: 730 },
    exit: { x: 596, y: 80, w: 88, h: 36 },
    props: [
      PROP('statue', 280, 190, 40, 40), PROP('statue', 600, 190, 40, 40),
      PROP('statue', 920, 190, 40, 40), PROP('statue', 280, 600, 40, 40),
      PROP('statue', 600, 600, 40, 40), PROP('statue', 920, 600, 40, 40),
      PROP('vitrine', 120, 420, 64, 44), PROP('vitrine', 1096, 420, 64, 44),
      PROP('pedestal', 460, 500, 32, 32), PROP('pedestal', 790, 500, 32, 32),
      PROP('planter', 120, 150, 52, 34), PROP('planter', 1108, 150, 52, 34),
      PROP('planter', 120, 640, 52, 34), PROP('planter', 1108, 640, 52, 34),
      PROP('rope', 400, 330, 96, 16), PROP('rope', 784, 330, 96, 16),
      PROP('bench', 700, 716, 76, 26), PROP('bench', 684, 130, 76, 26),
    ],
    wallsIn: [
      { x: 630, y: 240, w: 16, h: 110 },
      { x: 630, y: 470, w: 16, h: 110 },
    ],
    lanterns: [{ x: 640, y: 432 }, { x: 200, y: 250 }, { x: 1080, y: 620 }],
    shadows: [
      { x: 60, y: 110, w: 170, h: 120 },
      { x: 1050, y: 110, w: 170, h: 120 },
      { x: 60, y: 640, w: 170, h: 110 },
      { x: 1050, y: 640, w: 170, h: 110 },
    ],
    carpets: [{ x: 240, y: 396, w: 800, h: 72 }],
    gems: [{ x: 660, y: 175 }, { x: 215, y: 432 }, { x: 1065, y: 432 }],
    guards: [
      { path: [[240, 300], [1040, 300], [1040, 420], [240, 420]], speed: 64 },
      { path: [[1040, 560], [240, 560], [240, 690], [1040, 690]], speed: 60 },
      { path: [[560, 150], [560, 710]], speed: 46 },
    ],
  },
  {
    name: 'Vault Antechamber',
    playerStart: { x: 90, y: 140 },
    exit: { x: 1232, y: 404, w: 24, h: 72 },
    props: [
      PROP('crate', 120, 170, 36, 36), PROP('crate', 120, 240, 36, 36),
      PROP('crate', 1108, 170, 36, 36), PROP('crate', 1108, 560, 36, 36),
      PROP('vitrine', 420, 150, 64, 44), PROP('vitrine', 796, 150, 64, 44),
      PROP('vitrine', 420, 600, 64, 44), PROP('vitrine', 796, 600, 64, 44),
      PROP('planter', 620, 140, 52, 34), PROP('planter', 620, 660, 52, 34),
      PROP('bench', 210, 430, 76, 26), PROP('bench', 1024, 430, 76, 26),
      PROP('rope', 520, 430, 96, 16), PROP('rope', 664, 430, 96, 16),
      PROP('statue', 120, 420, 40, 40), PROP('statue', 1090, 420, 40, 40),
    ],
    wallsIn: [
      { x: 300, y: 250, w: 220, h: 14 },
      { x: 760, y: 250, w: 220, h: 14 },
      { x: 300, y: 520, w: 220, h: 14 },
      { x: 760, y: 520, w: 220, h: 14 },
      { x: 620, y: 360, w: 14, h: 110 },
    ],
    lanterns: [{ x: 400, y: 385 }, { x: 880, y: 385 }, { x: 640, y: 640 }],
    shadows: [
      { x: 60, y: 640, w: 190, h: 120 },
      { x: 1030, y: 110, w: 190, h: 120 },
      { x: 520, y: 110, w: 240, h: 100 },
    ],
    carpets: [
      { x: 120, y: 385, w: 300, h: 60 },
      { x: 860, y: 385, w: 300, h: 60 },
    ],
    gems: [{ x: 640, y: 200 }, { x: 200, y: 690 }, { x: 1080, y: 690 }],
    guards: [
      { path: [[220, 330], [1060, 330]], speed: 72 },
      { path: [[1060, 480], [220, 480]], speed: 68 },
      { path: [[180, 620], [180, 300]], speed: 58 },
    ],
  },
  {
    name: 'Idol Sanctum',
    playerStart: { x: 640, y: 730 },
    exit: { x: 596, y: 80, w: 88, h: 36 },
    props: [
      PROP('idol', 608, 368, 64, 64),
      PROP('statue', 240, 200, 40, 40), PROP('statue', 1000, 200, 40, 40),
      PROP('statue', 240, 600, 40, 40), PROP('statue', 1000, 600, 40, 40),
      PROP('vitrine', 440, 170, 64, 44), PROP('vitrine', 776, 170, 64, 44),
      PROP('vitrine', 440, 650, 64, 44), PROP('vitrine', 776, 650, 64, 44),
      PROP('pedestal', 150, 420, 32, 32), PROP('pedestal', 1098, 420, 32, 32),
      PROP('planter', 548, 150, 52, 34), PROP('planter', 680, 150, 52, 34),
      PROP('bench', 420, 470, 76, 26), PROP('bench', 784, 470, 76, 26),
      PROP('rope', 300, 330, 96, 16), PROP('rope', 884, 330, 96, 16),
      PROP('rope', 300, 540, 96, 16), PROP('rope', 884, 540, 96, 16),
    ],
    wallsIn: [
      { x: 180, y: 300, w: 14, h: 180 },
      { x: 1086, y: 300, w: 14, h: 180 },
    ],
    lanterns: [{ x: 640, y: 300 }, { x: 640, y: 560 }, { x: 300, y: 432 }, { x: 980, y: 432 }],
    shadows: [
      { x: 60, y: 110, w: 170, h: 110 },
      { x: 1050, y: 110, w: 170, h: 110 },
      { x: 60, y: 650, w: 170, h: 110 },
      { x: 1050, y: 650, w: 170, h: 110 },
    ],
    carpets: [
      { x: 560, y: 340, w: 160, h: 120 },
      { x: 604, y: 120, w: 72, h: 220 },
    ],
    gems: [{ x: 200, y: 150 }, { x: 1080, y: 150 }, { x: 640, y: 690 }],
    guards: [
      { path: [[300, 260], [980, 260]], speed: 66 },
      { path: [[980, 620], [300, 620]], speed: 62 },
      { path: [[220, 432], [480, 432]], speed: 54 },
      { path: [[1060, 540], [1060, 340]], speed: 50 },
    ],
  },
];

GI.galleries = GALLERIES;
