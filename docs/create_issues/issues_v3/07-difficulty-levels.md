# Issue 7: Add Difficulty Level Options

## Priority
**High**

## Category
Gameplay, Settings

## Description
Implement selectable difficulty levels to accommodate different player skill levels and provide replay value.

## Difficulty Levels

### Easy
- Lower enemy HP (e.g., 75% of normal)
- Lower enemy damage (e.g., 75% of normal)
- More starting gold (e.g., 150 instead of 100)
- Slower enemy spawn rate
- Player earns more gold per kill

### Medium (Default)
- Current balanced gameplay
- Standard values

### Hard
- Higher enemy HP (e.g., 125% of normal)
- Higher enemy damage (e.g., 125% of normal)
- Less starting gold (e.g., 75 instead of 100)
- Faster enemy spawn rate
- Player earns less gold per kill

## Acceptance Criteria
- [ ] Difficulty selection in menu or settings screen
- [ ] Difficulty affects enemy stats appropriately
- [ ] Difficulty affects gold economy
- [ ] Difficulty affects spawn rates
- [ ] Difficulty setting is saved/persisted
- [ ] Visual indicator of current difficulty
- [ ] Balance testing for each difficulty level

## Technical Notes
- Add difficulty setting to game configuration
- Create multipliers for stats based on difficulty
- Store difficulty selection in localStorage or game state
- May want to display difficulty in UI during gameplay
- Consider adding achievements or rewards for harder difficulties

## Dependencies
None

## Estimated Effort
Small (2-4 hours)
