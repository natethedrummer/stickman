# Issue 11: Implement In-Game Shop System

## Priority
**Medium**

## Category
UI, Progression

## Description
Create a shop interface where players can spend gold earned from completing levels to purchase various items, upgrades, and unlockables.

## Shop Items
- New background music tracks (Issue 8)
- Unit upgrades (increased stats)
- Special abilities or power-ups
- Cosmetic items (different unit skins, base decorations)
- Permanent gold multipliers
- Special/rare units

## Acceptance Criteria
- [ ] Shop UI accessible from main menu or between levels
- [ ] Display available items with prices and descriptions
- [ ] Show player's current gold balance
- [ ] Items can be purchased if player has enough gold
- [ ] Purchased items are saved/persisted
- [ ] Visual feedback when purchasing items
- [ ] Clear indication of owned vs. locked items
- [ ] Shop inventory is organized by category

## Technical Notes
- Create ShopScene or shop UI overlay
- Store purchased items in localStorage
- Deduct gold from player balance on purchase
- Track persistent gold across game sessions
- May need economy balancing to ensure gold earning rate supports shop prices
- Consider adding "leftover gold" system mentioned in notes

## Dependencies
- Related to Issue 8 (Song purchases)
- Related to Issue 14 (Special character unlocks)

## Estimated Effort
Medium-Large (6-8 hours)
