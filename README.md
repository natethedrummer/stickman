# Stickman

A side-scrolling base defense strategy game built with Phaser 3 and Vite.

## Inspiration

This game is inspired by [this video](https://www.youtube.com/watch?v=fi3Txc0_2eQ) and the classic "Age of War" genre of games — where two bases sit on opposite ends of an arena and each side spawns units that march toward the enemy, fighting anything in their path. The goal is to destroy the enemy base before they destroy yours.

We're not trying to make an exact copy of any existing game. Instead, we're building something that captures the same fun — the tug-of-war tension of spawning the right units at the right time — while putting our own spin on it.

## How to play

- You have a base on the left. The enemy has a base on the right.
- Spend gold to spawn units that march toward the enemy base.
- Choose from 4 unit types: Archer, Warrior, Spearman, and Giant — each with different stats and costs.
- Enemy units spawn automatically and march toward your base.
- When opposing units meet, they fight.
- Destroy the enemy base to win. If your base falls, you lose.
- Gold is earned passively over time and by killing enemy units.
- Use arrow keys to scroll across the 3072px arena.
- Click the music note in the top-right to mute/unmute background music.

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

| Unit     | Cost | HP  | Damage | Speed |
|----------|------|-----|--------|-------|
| Archer   | 25   | 25  | 15     | 50    |
| Warrior  | 50   | 50  | 10     | 50    |
| Spearman | 75   | 65  | 12     | 60    |
| Giant    | 150  | 150 | 20     | 30    |

## Version history

- **v1** — Initial game with basic mechanics, single unit type, colored rectangles
- **v2** — 4 unit types with procedural stickman sprites, scrollable arena, enemy AI with gold budget, background music with mute toggle, kill rewards
- **v3** (planned) — [14 new features planned](docs/IMPLEMENTATION_GUIDE.md) including age progression, animations, sound effects, difficulty levels, and more. See [Game V3 Ideas](docs/create_issues/game-v3-ideas.md) for details.

## Tech stack

- [Phaser 3](https://phaser.io/) — game framework
- [Vite](https://vite.dev/) — dev server and bundler
