# Issue 4: Slower Character Movement

## Priority
**Medium**

## Category
Gameplay Balance

## Description
Reduce character movement speed to improve gameplay pacing and give players more time to make strategic decisions.

## Acceptance Criteria
- [ ] Unit movement speed reduced from current V1 implementation
- [ ] Movement still feels responsive, not sluggish
- [ ] Combat is easier to follow and observe
- [ ] Players have more time to react and spawn counters
- [ ] Speed is balanced across all character types
- [ ] Test with players to find optimal speed

## Technical Notes
- Adjust speed constants/properties for units
- May need to adjust animation speed to match movement
- Consider different speeds for different unit types
- Balance with arena size (larger arena may need faster movement)
- Test impact on overall game pace and fun factor

## Dependencies
- Applies to all character types (Issue 2)
- May need adjustment after arena expansion (Issue 3)

## Estimated Effort
Small (1-2 hours)

## Status
✅ **Implemented in V2** - Unit speeds balanced (30-60 range)
