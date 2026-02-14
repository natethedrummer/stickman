# Issue 3: Longer Arena with Map and Camera Controls

## Priority
**High**

## Category
Core Gameplay, UI

## Description
Expand the arena beyond a single screen and implement camera controls to allow players to view different parts of the battlefield.

## Acceptance Criteria
- [ ] Arena extends beyond viewport (e.g., 2-3x screen width)
- [ ] Camera can scroll/pan across the arena
- [ ] Arrow keys or WASD controls camera movement
- [ ] Camera movement is smooth and responsive
- [ ] UI elements remain fixed on screen during scrolling
- [ ] Camera bounds prevent scrolling beyond arena limits
- [ ] Optional: Minimap showing full arena and unit positions
- [ ] Camera centers on action or allows manual control

## Technical Notes
- Implement camera/viewport system in game engine
- Use transform/translate for smooth scrolling
- Keep UI layer separate from game layer
- Consider camera follow modes (follow player base, free camera, auto-follow action)
- Set arena width (e.g., 3072px as in final V2)
- Update collision and rendering to work with camera offset

## Dependencies
- Enables larger battles with multiple unit types
- Required for proper strategic gameplay

## Estimated Effort
Medium-Large (6-8 hours)

## Status
✅ **Implemented in V2** - 3072px scrollable arena with arrow key controls
