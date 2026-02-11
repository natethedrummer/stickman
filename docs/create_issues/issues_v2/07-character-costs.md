# Issue 7: Different Character Costs

## Priority
**High**

## Category
Gameplay, Economy

## Description
Implement varied gold costs for different character types, with more powerful units costing more gold to create strategic trade-offs.

## Acceptance Criteria
- [ ] Each character type has a defined gold cost
- [ ] More powerful/tanky characters cost more gold
- [ ] Weaker/basic characters cost less gold
- [ ] Costs are displayed in UI
- [ ] Players cannot spawn units they can't afford
- [ ] Costs are balanced relative to character effectiveness
- [ ] UI shows current gold and unit costs clearly

## Technical Notes
- Add cost property to each character type
- Update spawn logic to check/deduct gold
- Display costs on character selection buttons
- Disable buttons when insufficient gold
- Balance costs through playtesting:
  - Basic units: 25-50 gold
  - Medium units: 50-75 gold
  - Strong units: 100-150 gold
- Consider cost-effectiveness ratios for balance

## Dependencies
- Requires Issue 2 (Multiple Character Types) to be implemented
- Must be balanced with Issue 6 (Gold Spawn Rate)

## Estimated Effort
Small-Medium (3-4 hours)

## Status
✅ **Implemented in V2** - Unit costs: Archer (25), Warrior (50), Spearman (75), Giant (150)
