# Issue 2: Add More Character Types

## Priority
**High**

## Category
Units, Gameplay

## Description
Expand from a single unit type to multiple character types with different abilities, creating more strategic gameplay options.

## Acceptance Criteria
- [ ] At least 3-4 different character types available
- [ ] Each character type has unique stats (HP, damage, speed)
- [ ] Each character has distinct visual appearance
- [ ] Player can select which character to spawn
- [ ] UI shows available character types
- [ ] Characters are balanced for fair gameplay
- [ ] Each character type fills a different role (tank, damage dealer, ranged, etc.)

## Technical Notes
- Create character type enum or class system
- Define stat templates for each character type
- Update spawn system to accept character type parameter
- Create visual sprites or graphics for each type
- Update UI to show character selection buttons
- Consider rock-paper-scissors style balance

## Dependencies
- Related to Issue 7 (Different Character Costs)
- Affects Issue 4 (Slower Characters)
- Impacts Issue 5 (Cartoony Design)

## Estimated Effort
Large (8-10 hours)

## Status
✅ **Implemented in V2** - 4 unit types: Archer, Warrior, Spearman, Giant
