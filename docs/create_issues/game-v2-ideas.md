# Game V2 Ideas - Parsed from Handwritten Notes

This document contains the parsed feature ideas for Game V2, extracted from the handwritten notes.

## Audio (Issue 1)

### Issue 1: Add Background Music
**Priority:** High  
**Category:** Audio

Add background music to enhance the gameplay experience:
- Background music that loops during gameplay
- Music toggle/mute button
- Appropriate music volume that doesn't overpower sound effects
- Music that matches the game's theme and pace

---

## Units & Characters (Issues 2, 4, 5, 7)

### Issue 2: Add More Character Types
**Priority:** High  
**Category:** Units, Gameplay

Expand beyond the single unit type to multiple character options:
- Design multiple character types with different abilities
- Each character should have distinct visual appearance
- Different stats (HP, damage, speed) per character type
- Create variety in gameplay through character selection

---

### Issue 4: Slower Character Movement
**Priority:** Medium  
**Category:** Gameplay Balance

Adjust character movement speed for better gameplay:
- Reduce unit movement speed from current implementation
- Allows players more time to make strategic decisions
- Makes combat more visible and easier to follow
- Balance speed so gameplay doesn't feel sluggish

---

### Issue 5: More Cartoony Character Design
**Priority:** Medium  
**Category:** Visuals, Art Style

Update character designs to be more cartoony/stylized:
- Move away from simple colored rectangles
- Add personality to characters
- Consider exaggerated proportions or features
- Maintain visual clarity for gameplay

---

### Issue 7: Different Character Costs
**Priority:** High  
**Category:** Gameplay, Economy

Implement varied gold costs for different character types:
- More powerful characters cost more gold
- Weaker/basic characters cost less gold
- Creates strategic decisions about unit composition
- Balance cost vs. effectiveness for each character type

---

## Arena & Camera (Issue 3)

### Issue 3: Longer Arena with Map and Camera Controls
**Priority:** High  
**Category:** Core Gameplay, UI

Expand the arena and add camera functionality:
- Extend arena beyond single screen width
- Implement scrollable camera system
- Allow player to pan camera left/right (arrow keys or mouse)
- Possibly add minimap to show full arena
- Camera should follow action or be player-controlled
- Ensure UI elements remain visible during scrolling

---

## Economy & Balance (Issue 6)

### Issue 6: Reduce Gold Spawn Rate
**Priority:** Medium  
**Category:** Gameplay Balance, Economy

Adjust gold economy for better game pacing:
- Reduce the rate at which gold is earned
- Makes player decisions more meaningful
- Prevents spam-spawning units
- Forces strategic thinking about which units to spawn
- Balance with character costs (Issue 7)

---

## Summary

**Total Ideas:** 7  
**High Priority:** 4 (Music, More Characters, Longer Arena, Character Costs)  
**Medium Priority:** 3 (Slower Characters, Cartoony Design, Gold Reduction)

## Implementation Notes

- These features represent the evolution from V1 (basic game) to V2
- High priority items are essential for V2 core experience
- Medium priority items enhance polish and balance
- All features were successfully implemented in V2 as noted in README

## Feature Relationships

```
Multiple Characters (2)
├── Character Costs (7) - requires different characters
├── Slower Speed (4) - affects all characters
└── Cartoony Design (5) - visual update for characters

Gold Economy
├── Spawn Less (6) - affects earning rate
└── Character Costs (7) - affects spending

Arena Expansion (3)
└── Enables larger battles with multiple character types
```

## V2 Status

According to the README, V2 has been completed with:
- ✅ 4 unit types with procedural stickman sprites
- ✅ Scrollable arena (3072px)
- ✅ Enemy AI with gold budget
- ✅ Background music with mute toggle
- ✅ Kill rewards (gold system)

These implemented features align closely with the ideas documented here.
