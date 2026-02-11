# Issue 2: Add Unit and Combat Animations

## Priority
**High**

## Category
Visuals

## Description
Add animations to units to make the game more visually appealing and dynamic. Currently units are static stickman sprites.

## Acceptance Criteria
- [ ] Walking/marching animation for units
- [ ] Attack animations (melee and ranged)
- [ ] Death/destruction animations
- [ ] Idle animations when units are waiting/not moving
- [ ] Projectile animations for archers (arrow flight)
- [ ] Base damage/destruction visual effects
- [ ] Animations are smooth and don't impact performance
- [ ] Each unit type has unique animations appropriate to their class

## Technical Notes
- Use Phaser's animation system
- Consider using sprite sheets for frame-based animations
- May need to update the procedural stickman sprite generation or replace with pre-made sprites
- Ensure animations sync with game logic (attacks happen when animation plays)

## Dependencies
None

## Estimated Effort
Large (8-12 hours)
