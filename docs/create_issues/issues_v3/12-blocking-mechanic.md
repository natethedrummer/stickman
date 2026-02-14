# Issue 12: Implement Blocking with Certain Characters

## Priority
**Low**

## Category
Gameplay, Units

## Description
Add a blocking mechanic for specific unit types, allowing them to reduce incoming damage by blocking attacks.

## Blocking Units
- **Spearman** - Medium block effectiveness (e.g., 30% damage reduction)
- **Giant** - High block effectiveness (e.g., 50% damage reduction)
- Potentially other defensive unit types

## Acceptance Criteria
- [ ] Designated units can block attacks
- [ ] Blocking reduces damage based on unit type (30-50% range across different units)
- [ ] Visual indicator when unit is blocking (shield effect, animation)
- [ ] Block mechanic has cooldown or stamina system to prevent constant blocking
- [ ] AI enemies also use blocking when appropriate
- [ ] Balance testing to ensure blocking isn't overpowered
- [ ] Clear feedback to player when blocks occur

## Technical Notes
- Add block state to unit behavior
- Modify damage calculation to account for blocking
- Consider when AI should trigger blocks (e.g., when taking damage, randomly)
- May need block animation (ties into Issue 2)
- Add block cooldown timer to prevent spam
- Consider if blocking affects unit movement/attacks

## Dependencies
- Works well with Issue 2 (Animations for blocking)
- May affect Issue 5 (Age-specific block mechanics)

## Estimated Effort
Medium (4-5 hours)
