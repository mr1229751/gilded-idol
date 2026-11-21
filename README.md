# Gilded Idol

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/mr1229751/gilded-idol/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/mr1229751/gilded-idol/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

A top-down stealth game about robbing a museum at night. Slip through five
galleries — the Gallery of Dawn, the Long Gallery, the Hall of Statues, the
Vault Antechamber and the Idol Sanctum — pocket the three gems in each, and
walk out of the glowing exit before anyone's suspicion meter fills.

## How to play

Open `game/index.html` in a desktop browser (no server, no network — the
game is plain static files), or serve the folder with any static file
server. Press ENTER to begin.

- **WASD / arrow keys** — move
- **SHIFT (hold)** — sprint. Fast, but every stride throws a noise ripple
  that guards walk toward. Sprinting past a patrol is a confession.
- **C** — crouch. Slow and quiet: guards' meters fill at less than half
  rate while you are crouched.

## The rules of the dark

- **Vision cones are real.** Every guard's cone is ray-cast against the
  furniture, so a vitrine, statue or wall genuinely hides you. Break line
  of sight and the chase is over — if you can stay broken.
- **Detection has recovery.** Each guard carries a suspicion meter. It
  fills while he sees you, faster in lantern light, slower in shadow and
  while crouched — and it *drains* the moment he loses you. At 25% he stops
  and stares; above 50% he searches your last-known position while the
  meter cools. At 100% you are caught and lose a heart.
- **Light is a language.** Amber lantern pools are danger (1.7x detection),
  blue-black shadow pools are safety (half detection), and the warm wood
  floor between them is neutral ground. Plan routes through the dark.
- **Patrols are learnable.** Dashed lines trace every guard's route. Watch
  a full loop, find the gap, and take it.

## Deliverable

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to the output directory and writes `dossier.json` with the
vendored make.fun library in `vendor/makefun-game.ts`:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The game source is split into single-job files under `game/js/`:
`galleries.js` (the five layouts), `vision-cones.js` (ray-cast sight),
`guard-patrol.js` (guard movement and states), `detection.js` (the
suspicion meter), `lighting.js` (the three light zones), `museum-render.js`
(drawing), `hud.js` (the top bar) and `input.js` (controls).

<sub>Entered on [make.fun](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
