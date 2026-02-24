# Stickman

A side-scrolling base defense strategy game built with Phaser 3 and Vite.

## Inspiration

This game is inspired by [this video](https://www.youtube.com/watch?v=fi3Txc0_2eQ) and the classic "Age of War" genre of games — where two bases sit on opposite ends of an arena and each side spawns units that march toward the enemy, fighting anything in their path. The goal is to destroy the enemy base before they destroy yours.

We're not trying to make an exact copy of any existing game. Instead, we're building something that captures the same fun — the tug-of-war tension of spawning the right units at the right time — while putting our own spin on it.

## How to play

- You have a base on the left. The enemy has a base on the right.
- Spend gold to spawn units that march toward the enemy base.
- Choose from 5 unit types: Archer, Warrior, Spearman, Giant, and the unlockable Bird — each with different stats and costs.
- Enemy units spawn automatically and march toward your base.
- When opposing units meet, they fight. Warriors and Giants can block incoming damage.
- Destroy the enemy base to win. If your base falls, you lose.
- Gold is earned passively over time and by killing enemy units.
- Open the Abilities Shop to buy passive upgrades (War Drums, Gold Mine) or activate abilities (Rain of Arrows, Heal Base).
- Progress through 4 ages — Stone Age, Middle Ages, Modern Era, and Future — each with unique unit skins, backgrounds, and buildings.
- Choose your difficulty: Easy, Medium, Hard, or Crazy.
- Use arrow keys or on-screen buttons to scroll across the 3072px arena.
- Click the music note in the top-right to mute/unmute. Unlock new tracks in the Song Shop.

### 2 Player Mode

- Two players share one screen with a split-screen view.
- P1 controls the left base (A/D keys to scroll), P2 controls the right base (Arrow keys to scroll).
- Both players get equal starting gold, income, and base HP.
- All ages are unlocked — no progression gating for local play.

## Getting started

```
npm install
npm run dev
```

## Future home

The goal is to eventually host this game on [www.luppes.com](http://www.luppes.com), a website maintained by Teddy's grandpa. It's already home to all kinds of cool stuff — including how to do corn — and this game will fit right in.

## Authors

**Teddy Ford** — game designer and creative director. This is his game and his vision.

**Nathan Ford** — dad and developer, here to help bring Teddy's ideas to life.

This is also the first project Teddy and Nathan ever built using [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code).

## Unit types

| Unit     | Cost | HP  | Damage | Speed | Special |
|----------|------|-----|--------|-------|---------|
| Archer   | 25   | 25  | 15     | 50    | — |
| Warrior  | 50   | 50  | 10     | 50    | Block (50% reduction) |
| Spearman | 75   | 65  | 12     | 60    | — |
| Giant    | 150  | 150 | 20     | 30    | Block (60% reduction) |
| Bird     | 200  | 80  | 25     | 90    | Flying, splash damage on kill |

Base stats are scaled by each age's stat multiplier. Bird is unlocked by beating all 4 ages.

## Version history

- **v1** — Initial game with basic mechanics, single unit type, colored rectangles
- **v2** — 4 unit types with procedural stickman sprites, scrollable arena, enemy AI with gold budget, background music with mute toggle, kill rewards
- **v3** — Major update with 14 new features:
  - 4 ages (Stone Age, Middle Ages, Modern Era, Future) with unique themes, unit skins, backgrounds, and buildings
  - Campaign progression — beat an age to unlock the next
  - 4 difficulty levels (Easy, Medium, Hard, Crazy)
  - Walk, attack, and death animations for all units
  - Procedural sound effects using Web Audio API
  - Procedural parallax backgrounds with 5 depth layers
  - Floating damage numbers
  - Minimap showing unit positions and camera viewport
  - Abilities shop (Rain of Arrows, Heal Base, War Drums, Gold Mine)
  - Passive blocking for Warrior and Giant
  - Random weather conditions (Sunny, Rain, Snow, Fog, Thunderstorm)
  - Unlockable Bird unit for beating all 4 ages
  - Song Shop with 4 unlockable background tracks
  - Local 2-player split-screen mode
  - On-screen controls for mobile, tutorial for new players, GitHub Pages deployment

## Tech stack

- [Phaser 3](https://phaser.io/) — game framework
- [Vite](https://vite.dev/) — dev server and bundler
