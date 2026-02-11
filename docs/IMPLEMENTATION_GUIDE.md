# Game Implementation Guide

This guide documents the implementation journey from V2 (completed) to V3 (planned), providing historical context and future roadmap for the Stickman game.

## Overview

- **V2 Features**: 7 (✅ All implemented)
- **V3 Features**: 14 (Planned)
- **V2 Documentation**: `docs/game-v2-ideas.md` and `docs/issues_v2/`
- **V3 Documentation**: `docs/game-v3-ideas.md` and `docs/issues/`

---

# Part 1: V2 Implementation (Completed)

This section documents how V2 features were implemented, serving as historical reference and lessons learned.

## V2 Quick Reference

- **Total Features**: 7
- **Documentation Location**: `docs/issues_v2/`
- **Overview Document**: `docs/game-v2-ideas.md`
- **Status**: ✅ All features implemented

## V2 Implementation Order (As Executed)

The V2 features were implemented in the following order, which proved effective:

### Phase 1: Core Mechanics (High Priority)
Foundation features that enabled the game to function:

1. **[Issue 3: Longer Arena with Camera](create_issues/issues_v2/03-longer-arena-camera.md)** ✅ Implemented
   - Extended arena to 3072px
   - Added arrow key camera controls
   - Essential foundation for larger battles
   - **Lesson**: Implementing this first allowed proper testing of all subsequent features

2. **[Issue 2: Multiple Character Types](create_issues/issues_v2/02-more-characters.md)** ✅ Implemented
   - Created 4 unit types: Archer, Warrior, Spearman, Giant
   - Different stats (HP, damage, speed) per type
   - **Lesson**: This created the strategic depth needed for engaging gameplay

3. **[Issue 7: Different Character Costs](create_issues/issues_v2/07-character-costs.md)** ✅ Implemented
   - Archer (25g), Warrior (50g), Spearman (75g), Giant (150g)
   - **Lesson**: Must be implemented alongside multiple characters for balance

### Phase 2: Economy & Balance (Medium Priority)
Fine-tuning the gameplay experience:

4. **[Issue 6: Reduce Gold Spawn Rate](create_issues/issues_v2/06-reduce-gold-spawn.md)** ✅ Implemented
   - Balanced passive gold generation with kill rewards
   - **Lesson**: Critical for preventing unit spam and forcing strategic decisions

5. **[Issue 4: Slower Characters](create_issues/issues_v2/04-slower-characters.md)** ✅ Implemented
   - Balanced unit speeds (30-60 range)
   - **Lesson**: Slower movement improved visibility of combat and strategic thinking time

### Phase 3: Polish & Enhancement (Medium Priority)
Visual and audio improvements:

6. **[Issue 5: Cartoony Design](create_issues/issues_v2/05-cartoony-design.md)** ✅ Implemented
   - Procedural stickman sprites with cartoony style
   - **Lesson**: Visual identity greatly improved player engagement

7. **[Issue 1: Background Music](create_issues/issues_v2/01-background-music.md)** ✅ Implemented
   - Background music with mute toggle
   - **Lesson**: Audio adds significant atmosphere; implement mute control from the start

## V2 Total Effort

- **Phase 1**: ~20-24 hours (core mechanics)
- **Phase 2**: ~5-7 hours (balance)
- **Phase 3**: ~11-14 hours (polish)
- **Total**: ~36-45 hours

## V2 Key Dependencies (Resolved)

```
Multiple Characters (2) ← Implemented First
├── Character Costs (7) ✅ Implemented together
├── Slower Speed (4) ✅ Applied to all characters
└── Cartoony Design (5) ✅ Visual update for all characters

Gold Economy
├── Reduce Spawn Rate (6) ✅ Balanced together
└── Character Costs (7) ✅ Complementary features

Arena Expansion (3) ✅ Foundation for everything else
└── Enabled larger battles with multiple unit types
```

## V2 Lessons Learned

1. **Foundation First**: Arena/camera system enabled proper testing of all other features
2. **Coupled Features**: Character types and costs should be implemented together
3. **Balance Early**: Gold economy needed tuning throughout development
4. **Polish Matters**: Visual and audio improvements significantly increased engagement
5. **Player Feedback**: Testing after each phase caught balance issues early

---

# Part 2: V3 Implementation (Planned)

This section outlines the roadmap for implementing V3 features, building on V2's foundation.

## V3 Quick Reference

- **Total Features**: 14
- **Documentation Location**: `docs/issues/`
- **Overview Document**: `docs/game-v3-ideas.md`
- **Status**: Planned (not yet started)

## V3 Implementation Order (Recommended)

### Phase 1: Core Enhancements (High Priority)
Start with these foundational improvements that significantly impact gameplay:

1. **[Issue 7: Difficulty Levels](create_issues/issues_v3/07-difficulty-levels.md)** (2-4 hours)
   - Quickest win with immediate impact
   - Provides replayability and accessibility
   - No dependencies

2. **[Issue 1: Sound Effects](create_issues/issues_v3/01-sound-effects.md)** (3-5 hours)
   - Greatly enhances game feel
   - Independent from other features
   - Leverages existing SoundFX.js

3. **[Issue 2: Animations](create_issues/issues_v3/02-animations.md)** (8-12 hours)
   - Major visual improvement
   - Foundation for future visual enhancements
   - Consider before implementing age progression

4. **[Issue 5: Age Progression](create_issues/issues_v3/05-age-progression.md)** (16-24 hours)
   - Largest feature, affects many others
   - Core theme for V3
   - Implement after animations are working

### Phase 2: Visual Polish (Medium Priority)
Enhance visuals and aesthetics:

5. **[Issue 3: Background Graphics](create_issues/issues_v3/03-background-graphics.md)** (4-6 hours)
   - Should align with age themes from Issue 5
   
6. **[Issue 6: Age-Specific Buildings](create_issues/issues_v3/06-age-specific-buildings.md)** (5-7 hours)
   - Requires Issue 5 to be complete

7. **[Issue 13: Damage Numbers](create_issues/issues_v3/13-damage-numbers.md)** (2-4 hours)
   - Quick improvement to game feel
   - Good break between larger features

### Phase 3: Progression Systems (Medium Priority)
Build out meta-game and progression:

8. **[Issue 11: Shop System](create_issues/issues_v3/11-shop-system.md)** (6-8 hours)
   - Foundation for persistent progression
   - Required for Issue 8

9. **[Issue 8: Song Selection](create_issues/issues_v3/08-song-selection-system.md)** (5-7 hours)
   - Integrates with shop system

### Phase 4: Polish & Extras (Low Priority)
Nice-to-have features for completeness:

10. **[Issue 10: Weather Conditions](create_issues/issues_v3/10-weather-conditions.md)** (4-6 hours)
11. **[Issue 12: Blocking Mechanic](create_issues/issues_v3/12-blocking-mechanic.md)** (4-5 hours)
12. **[Issue 14: Bird Characters](create_issues/issues_v3/14-bird-characters.md)** (5-7 hours)
13. **[Issue 9: Better Game Title](create_issues/issues_v3/09-better-game-title.md)** (1-2 hours)

### Phase 5: Experimental
Features requiring further clarification:

14. **[Issue 4: Marble Simulator](create_issues/issues_v3/04-marble-simulator.md)** (Unknown)
    - Needs design clarification before implementation

## V3 Total Estimated Effort

- **Phase 1**: 29-45 hours
- **Phase 2**: 11-17 hours  
- **Phase 3**: 11-15 hours
- **Phase 4**: 14-20 hours
- **Total Core Features**: ~65-97 hours

**Note**: V2 took ~36-45 hours total. V3 is estimated at nearly double that effort, reflecting its increased scope and complexity.

## V3 Key Dependencies

```
Issue 5 (Age Progression) ← Critical Path
├── Issue 6 (Age-Specific Buildings) - depends on 5
├── Issue 3 (Backgrounds) - enhanced by 5
└── Issue 8 (Song Selection) - could integrate with 5

Issue 11 (Shop System) ← Unlock System
└── Issue 8 (Song Selection) - uses shop

Issue 2 (Animations) ← Visual Foundation
├── Issue 12 (Blocking) - enhanced by animations
└── Issue 5 (Age Progression) - benefits from having animations first
```

**Lesson from V2**: Just as V2's arena expansion (Issue 3) was foundational, V3's Age Progression (Issue 5) will be the cornerstone that many other features build upon. Plan accordingly.

## V3 Testing Strategy

After each phase:
1. **Playtest** the new features
2. **Balance** gameplay if needed
3. **Bug fix** any issues before moving forward
4. **Get feedback** from players

**V2 Experience**: Testing after each phase caught critical balance issues with gold economy and unit costs. Continue this practice for V3.

## V3 Questions Needing Clarification

Before implementing these features, clarify:

1. **Issue 4 (Marble Simulator)**: What is the intended concept?
2. **Issue 14 (Bird Characters)**: Exact unlock condition? Specific abilities?
3. **Issue 9 (Game Title)**: Final decision on new name?

**Recommendation**: Based on V2 experience, resolve these questions before starting implementation to avoid mid-development pivots.

## Notes for Developers

### General Best Practices
- **Start Small**: Complete and test one feature before starting the next
- **Commit Often**: Make small, incremental commits
- **Balance First**: Ensure each feature is balanced before adding complexity
- **Player Feedback**: Get feedback early on high-impact features
- **Assets**: Many features require art/audio assets - plan asset creation accordingly

### V2 → V3 Considerations
- **Build on Stability**: V2 established a solid foundation - don't break what works
- **Incremental Complexity**: V3 adds significant complexity; test thoroughly at each step
- **Asset Pipeline**: V3 requires more assets than V2 (4 ages, animations, etc.)
- **Performance**: Monitor performance as visual complexity increases (weather, animations, etc.)
- **Backward Compatibility**: Consider how V3 features affect existing V2 systems

## Success Metrics

### V2 Baseline (Current)
Establish these baseline metrics from V2 before V3 development:
- Average play session length
- Unit type usage distribution
- Win/loss ratio balance
- Player retention rate

### V3 Target Metrics
Track these metrics after V3 release:
- **Player engagement time** (should increase with progression systems)
- **Difficulty selection distribution** (validate difficulty balance)
- **Shop purchase rate** (if implemented)
- **Age progression rate** (how quickly players advance through ages)
- **Player feedback** on animations and visual improvements

**Goal**: V3 should increase engagement time by 30-50% through progression systems while maintaining balanced gameplay.

---

# Comparison: V2 vs V3

## Scope Comparison

| Aspect | V2 (Completed) | V3 (Planned) |
|--------|----------------|--------------|
| **Focus** | Core mechanics | Progression & depth |
| **Features** | 7 | 14 |
| **Effort** | ~36-45 hours | ~65-97 hours |
| **Unit Types** | 4 distinct types | Same 4, but across 4 ages = 16 variants |
| **Arena** | 3072px scrollable | Same, enhanced with backgrounds |
| **Economy** | Simple gold system | Complex shop & unlocks |
| **Visuals** | Procedural sprites | Animations + weather + age themes |
| **Audio** | 1 background track + mute | Multiple songs via shop |

## Evolution Path

```
V1 (Prototype)
└── Single unit type, basic mechanics, colored rectangles

V2 (Playable Game) ✅
└── 4 unit types, scrollable arena, gold economy, music, stickman sprites

V3 (Full-Featured Game) 🎯
└── Age progression, animations, shop system, advanced visuals, depth
```

## Strategic Priorities

**V2 achieved**: Solid gameplay foundation  
**V3 aims for**: Replayability and progression depth

---

**Ready to start V3?** Begin with [Issue 7: Difficulty Levels](create_issues/issues_v3/07-difficulty-levels.md) for a quick win that builds on V2's foundation!
