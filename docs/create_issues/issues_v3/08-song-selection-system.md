# Issue 8: Implement Song Selection System with In-Game Shop

## Priority
**Medium**

## Category
Audio, Progression

## Description
Create a music selection system where players can purchase and choose from multiple background songs using gold earned from gameplay.

## Acceptance Criteria
- [ ] Multiple background music tracks available
- [ ] Shop interface where players can browse songs
- [ ] Songs can be purchased with leftover gold from completed levels
- [ ] Preview/listen to songs before purchasing
- [ ] Music selection menu accessible from main menu or settings
- [ ] Selected music plays during gameplay
- [ ] Purchased songs are saved/persisted
- [ ] Clear indication of which songs are owned vs. locked
- [ ] Song purchase prices are balanced

## Technical Notes
- Extend existing SoundFX.js or create MusicManager
- Store purchased songs in localStorage
- Integrate with shop system (Issue 11)
- Preload all music files or load on demand
- Consider music file sizes for performance
- Respect existing mute toggle functionality

## Dependencies
- Related to Issue 11 (In-Game Shop System)
- Songs could be themed by age (Issue 5)

## Estimated Effort
Medium (5-7 hours)
