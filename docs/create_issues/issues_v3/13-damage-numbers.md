# Issue 13: Display Attack Damage Numbers

## Priority
**Medium**

## Category
UI, Game Feel

## Description
Show floating damage numbers when units take damage to provide clear visual feedback about combat effectiveness and help players understand damage values.

## Acceptance Criteria
- [ ] Damage numbers appear above units when they take damage
- [ ] Numbers are clearly readable
- [ ] Numbers fade out and rise up (or float away) with animation
- [ ] Different colors for different damage types:
  - Normal damage (white or yellow)
  - Critical hits (red or orange) if implemented
  - Special damage (blue or purple) if applicable
- [ ] Numbers don't clutter the screen (appropriate size, duration)
- [ ] Performance is maintained with multiple damage numbers on screen
- [ ] Optional: Toggle to enable/disable damage numbers

## Technical Notes
- Create damage text objects that animate and destroy themselves
- Use Phaser text or bitmap text for performance
- Add to combat/damage calculation code
- Consider object pooling for damage number text objects
- Animation should be smooth but not distracting
- Ensure numbers appear at the correct position relative to unit

## Dependencies
None

## Estimated Effort
Small-Medium (2-4 hours)
