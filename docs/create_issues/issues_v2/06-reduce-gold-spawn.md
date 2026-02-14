# Issue 6: Reduce Gold Spawn Rate

## Priority
**Medium**

## Category
Gameplay Balance, Economy

## Description
Decrease the rate at which players earn gold to create more meaningful strategic decisions and prevent unit spam.

## Acceptance Criteria
- [ ] Gold earning rate is reduced from V1
- [ ] Players must think strategically about which units to spawn
- [ ] Cannot spam units continuously
- [ ] Game pacing feels more strategic than chaotic
- [ ] Gold rate is balanced with unit costs
- [ ] Passive gold generation is reasonable
- [ ] Killing enemies provides appropriate gold rewards

## Technical Notes
- Adjust gold generation timer/rate
- Balance passive gold income vs. kill rewards
- Consider exponential vs. linear gold growth
- Test different rates with various unit costs
- May need to adjust starting gold amount
- Store gold earning parameters in config for easy tweaking

## Dependencies
- Must be balanced with Issue 7 (Character Costs)
- Affects overall game economy and pacing

## Estimated Effort
Small (2-3 hours including balancing)

## Status
✅ **Implemented in V2** - Gold economy balanced with passive generation and kill rewards
