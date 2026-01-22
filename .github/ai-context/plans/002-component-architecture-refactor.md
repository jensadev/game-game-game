# Plan 002: Component Architecture Refactor - Master Plan

**Status:** ✅ Complete - Phase 3 Object Pooling Implemented  
**Created:** 2026-01-21  
**Branch Strategy:** Working in single branch (17-platformer-base)  
**Current Branch:** 17-platformer-base

## Progress Tracking

**Started:** 2026-01-21  
**Completed:** 2026-01-22  
**Current Phase:** Phase 3 Complete - Object pooling implemented, collision bugs fixed  
**Context Sessions:** 4

### Session Status Summary
- ✅ **Session 1:** Planning & Documentation Setup (40K tokens)
- ✅ **Session 2:** Player Migration Complete (74K tokens)
- ✅ **Session 3:** System Refactoring + Entity Migrations Complete (97K tokens)
- ✅ **Session 4:** Phase 3 Object Pooling + Collision Bug Fixes (40K tokens)

### Context Sessions

#### Session 1: Planning & Documentation Setup
- **Date:** 2026-01-21
- **Duration:** Initial planning
- **Token Usage:** ~40K
- **Branch:** 33.5-top-down-gfx
- **Accomplished:**
  - Researched current codebase architecture
  - Identified GameObject vs Entity hybrid state
  - Created comprehensive refactoring plan
  - Created CONTEXT_MANAGEMENT.md
  - Created AGENT_INSTRUCTIONS.md
  - Updated COPILOT_INSTRUCTIONS.md with context protocols
  - Updated component-system-design.md with tracking
- **Decisions Made:**
  - Keep Entity-Component system (NOT GameObject)
  - Centralize collision in CollisionManager
  - EntityState for animation control (NOT input)
  - States should be small and clean
  - Physics constants stay in game
- **Next Session:** Begin Phase 1 implementation
- **Ended Because:** Documentation setup complete, ready for implementation

#### Session 2: Phase 1 Verification & Player Migration
- **Date:** 2026-01-21
- **Duration:** Full migration implementation  
- **Token Usage:** ~74K
- **Branch:** 33.5-top-down-gfx
- **Accomplished:**
  - Verified all Phase 1 foundation systems exist and are complete
  - Discovered Phase 2 components already implemented
  - Found StateMachine and EntityState already working
  - **COMPLETED full Player migration to Entity + Components**
  - Created CollisionManager system for centralized collision handling
  - Updated Animator component to work with frame-based animations
  - Updated Physics component to use game.gravity and Vector2
  - Migrated all 4 player states (Idle, Running, Jumping, Falling) to use components
  - Updated PlatformerGame to use CollisionManager and ResourceManager
  - Removed collision logic from Player entity
- **Key Findings:**
  - ✅ Vector2.js - Complete and functional
  - ✅ EventBus.js - Complete and functional
  - ✅ ResourceManager.js - Complete (Vite-based, excellent!)
  - ✅ DebugRenderer.js - Complete with F3 toggle
  - ✅ InputHandler.js - Basic but functional (Set-based)
  - ✅ All Component classes exist (Transform, Physics, Sprite, Collider, Animator)
  - ✅ Entity.js with full component management
  - ✅ StateMachine + Player states already implemented
- **Decisions Made:**
  - Keep InputHandler simple (no pressed/held/released needed yet)
  - Phase 1 considered complete
  - Complete clean migration with all components properly implemented
  - Collision fully centralized in CollisionManager
  - Animator uses ResourceManager for sprite images
  - Physics component uses game.gravity instead of hardcoded values
- **Next Session:** Test game, fix any issues, continue with Enemy migration
- **Ended Because:** Player migration complete, awaiting testing

#### Session 3: System Refactoring & All Entity Migrations ✅ COMPLETE
- **Date:** 2026-01-21
- **Duration:** Major refactoring and migrations
- **Token Usage:** ~97K
- **Branch:** 33.5-top-down-gfx
- **Accomplished:**
  - **SYSTEM REFACTORING (8 tasks complete):**
    - ✅ Vector2.lerp() methods (static + instance) for smooth camera
    - ✅ Camera refactored to use Vector2 (position/targetPosition), setTarget() API
    - ✅ InputHandler upgraded with pressed/held/released states + mouse support
    - ✅ EventBus integrated with 5 core events (coin:collected, player:damaged, enemy:killed, level:complete, game:over)
    - ✅ CollisionManager expanded to handle ALL collision types centrally
    - ✅ SaveGameManager rewritten for 3-slot system (getState/setState pattern)
    - ✅ PlatformerGame.update() cleaned up (150 lines → 40 lines)
    - ✅ API updates throughout codebase (camera.position, isKeyPressed/Held)
  - **ENTITY MIGRATIONS (4 entities complete):**
    - ✅ Enemy → Entity + Physics + Sprite + Collider (patrol AI preserved)
    - ✅ Projectile → Entity + Physics + Sprite + Collider (no gravity)
    - ✅ Coin → Entity + Sprite + Collider (bob animation preserved)
    - ✅ Platform → Entity + Sprite + Collider (static, border rendering preserved)
  - **BUGS FIXED (7 total):**
    - ✅ EventBus undefined - Added to GameBase
    - ✅ Canvas undefined - Added canvas parameter to GameBase
    - ✅ Menu.js using old InputHandler API - Updated to isKeyPressed()
    - ✅ SaveGameManager API mismatch - Rewrote for slot-based saves
    - ✅ Input cleared too early - Moved inputHandler.update() to end of frame
    - ✅ Enemies invisible - Added custom draw() methods to Enemy and Projectile
    - ✅ Player bouncing/oscillating - Fixed collision velocity check (>= 0)
- **Key Achievements:**
  - Zero GameObject references in entity code
  - Clean Entity-Component architecture throughout
  - All collision logic centralized in CollisionManager
  - Event-driven communication for game state changes
  - 3-slot save system with version tracking
  - Smooth camera following with lerp
  - Frame-aware input system (pressed/held/released)
  - Game fully functional and tested
- **Decisions Made:**
  - InputHandler NEEDED upgrade after all (pressed/held/released critical for proper input)
  - InputHandler.update() must be called at END of frame, not start
  - Entities with color-only sprites need custom draw() methods
  - Collision velocity check must use >= 0, not > 0 to prevent oscillation
  - Physics OR Transform, never both (Physics wins for moving entities)
  - States control animation ONLY, not input or collision
- **Testing Results:**
  - ✅ Player movement, jump, shoot working
  - ✅ Camera follows player smoothly
  - ✅ Enemies render and patrol correctly
  - ✅ Coins collect with sound and events
  - ✅ Collisions working perfectly
  - ✅ Menu navigation working
  - ✅ No compilation errors
  - ✅ No runtime errors
- **Next Phase:** Phase 3 - Object pooling (when needed), Phase 4 - JSON level system
- **Ended Because:** All planned work complete, documentation update needed

#### Session 4: Phase 3 Object Pooling + Collision Bug Fixes ✅ COMPLETE
- **Date:** 2026-01-22
- **Duration:** Bug fixes and object pooling implementation
- **Token Usage:** ~40K
- **Branch:** 17-platformer-base
- **Accomplished:**
  - **OBJECT POOLING (Phase 3 complete):**
    - ✅ Created ObjectPool system (generic, reusable)
    - ✅ Added reset() and init() methods to Projectile
    - ✅ Integrated pool into PlatformerGame (20 initial, 50 max)
    - ✅ Projectiles recycled instead of constantly created/destroyed
  - **COLLISION BUG FIXES (2 major bugs):**
    - ✅ Projectiles freezing - Disabled projectile-platform collisions (fly through)
    - ✅ Enemies stuck on each other - Disabled enemy-enemy collisions (pass through)
  - **SYSTEM IMPROVEMENTS:**
    - ✅ Pool stats tracking (available/inUse/total)
    - ✅ Graceful pool exhaustion handling
    - ✅ Pool reset on level load (releaseAll)
- **Key Decisions:**
  - ~~Projectiles pass through platforms (allows shooting across gaps)~~ **REVERTED**: Projectiles stop at platforms
  - Enemies don't collide with each other (prevents stuck AI)
  - Pool size: 20 initial, 50 max (configurable)
  - Generic ObjectPool can be reused for other entities
  - Projectiles destroyed on: enemy hit, platform hit, or max distance (800px)
- **Testing Results:**
  - ✅ Projectiles fly full distance without freezing
  - ✅ Enemies patrol without colliding
  - ✅ Pool recycling working (no GC pressure)
  - ✅ Level transitions reset pool correctly
- **Next Phase:** Phase 4 - JSON level system (deferred), Phase 5 - Polish features
- **Ended Because:** Object pooling complete, bugs fixed, ready for next features

### Completed ✅
- ✅ Initial architecture research (Session 1, 2026-01-21)
- ✅ Documentation structure created (Session 1, 2026-01-21)
- ✅ Phase 1: Foundation Systems (Session 2, 2026-01-21)
  - ✅ Vector2 class (already existed, enhanced with lerp)
  - ✅ EventBus (already existed, integrated with 5 core events)
  - ✅ ResourceManager (already existed)
  - ✅ InputHandler (upgraded with pressed/held/released + mouse support)
  - ✅ DebugRenderer (already existed)
- ✅ Phase 2: All Entity Migrations (Session 2-3, 2026-01-21) **COMPLETE**
  - ✅ Player migrated to Entity + Components (Session 2)
  - ✅ CollisionManager created and integrated (Session 2)
  - ✅ Enemy migrated to Entity + Components (Session 3)
  - ✅ Projectile migrated to Entity + Components (Session 3)
  - ✅ Coin migrated to Entity + Components (Session 3)
  - ✅ Platform migrated to Entity + Components (Session 3)
- ✅ System Refactoring Complete (Session 3, 2026-01-21)
  - ✅ Camera refactored with Vector2 and setTarget() API
  - ✅ SaveGameManager rewritten for 3-slot system
  - ✅ PlatformerGame.update() cleaned up (150 → 40 lines)
  - ✅ All bugs fixed (7 total)
- ✅ Phase 3: Object Pooling (Session 4, 2026-01-22) **COMPLETE**
  - ✅ ObjectPool system created (generic, reusable)
  - ✅ Projectile pooling implemented (20 initial, 50 max)
  - ✅ Collision bugs fixed (projectiles + enemies)

### In Progress ⏸️
- None currently - Phase 3 complete!

### Blocked ❌
- None currently

### Deferred 💤
- Phase 4: JSON-based level system (future enhancement)
- Phase 5: Polish features (loading screen, advanced debug)

## Design Decisions During Implementation

| Date | Decision | Reasoning | Impact | Status |
|------|----------|-----------|--------|--------|
| 2026-01-21 | Using hybrid Entity system not full ECS | Beginner-friendly, less abstraction | Simpler component implementation | ✅ Decided |
| 2026-01-21 | Collision centralized in CollisionManager, NOT entities | Separation of concerns, entities shouldn't know about platforms | Major refactor of collision code | ✅ Decided |
| 2026-01-21 | EntityState controls animation, NOT input | States react to entity changes, input stays in entity | Clear separation of responsibilities | ✅ Decided |
| 2026-01-21 | Keep states small and clean | Avoid bloat, maintain simplicity | States focused on animation/behavior only | ✅ Decided |
| 2026-01-21 | Physics constants (gravity, friction) stay in game | Centralized config, accessed via game reference | Entities access via this.game.gravity | ✅ Decided |
| 2026-01-21 | Move away from GameObject entirely | Complete architectural shift to Entity-Component | GameObject.js will be deleted, all entities migrate to Entity | ✅ Decided |
| 2026-01-21 | InputHandler.update() at END of frame | Pressed/Released sets must persist until all entities process input | Moved from start to end of update loop | ✅ Decided |
| 2026-01-21 | Physics OR Transform, never both | Position tracking conflict between two systems | Physics wins for moving entities, removed Transform | ✅ Decided |
| 2026-01-21 | Camera uses Vector2 for position | Smooth lerp interpolation needs vector math | position and targetPosition as Vector2 | ✅ Decided |
| 2026-01-21 | EventBus for game state changes | Loose coupling between systems | 5 core events: coin, damage, enemy, level, game | ✅ Decided |
| 2026-01-21 | 3-slot save system with getState/setState | User-friendly multiple saves | SaveGameManager slot-based API | ✅ Decided |
| 2026-01-21 | Collision velocity check >= 0 not > 0 | Prevents oscillation when standing still | Fixed player bouncing bug | ✅ Decided |
| 2026-01-22 | ~~Projectiles pass through platforms~~ | ~~Allows shooting across gaps and over obstacles~~ | ~~Disabled projectile-platform collisions~~ | ❌ Reverted |
| 2026-01-22 | Projectiles stop at platforms | More realistic physics, prevents spam | Projectiles destroyed on platform hit | ✅ Decided |
| 2026-01-22 | Enemies don't collide with each other | Prevents AI from getting stuck on patrol | Disabled enemy-enemy collisions | ✅ Decided |
| 2026-01-22 | Object pooling for projectiles | Reduce GC pressure from constant create/destroy | Reuse projectile instances via pool | ✅ Decided |
| 2026-01-22 | Pool size 20 initial, 50 max | Balance memory vs pool exhaustion | Enough for most gameplay without waste | ✅ Decided |
| 2026-01-22 | Projectiles exempt from air resistance | Air resistance was stopping projectiles at 313px | Added useAirResistance flag to Physics | ✅ Decided |

## Deviations from Original Plan

| Step | Original Plan | What Actually Happened | Reason | Approved By |
|------|---------------|------------------------|--------|-------------|
| 2026-01-21 | Skip Phase 1 implementation | Phase 1 systems already exist | Systems were implemented previously, just not documented in plan | Session 2 verification |
| 2026-01-21 | Player had duplicate code | Old GameObject code not fully removed in first pass | Incomplete text replacement left loadSprite calls | Session 2 fix |
| 2026-01-21 | Changed to single branch strategy | Originally planned 5 separate branches, worked in single branch instead | More efficient for incremental changes, easier to test | Session 3 decision |
| 2026-01-21 | InputHandler DID need upgrade | Session 2 decided to keep simple, Session 3 found pressed/held/released critical | Jump/shoot needed pressed, movement needed held | Session 3 revision |
| 2026-01-21 | Enemy/Projectile need custom draw() | Sprite component only renders images, not colors | Entities with color property need override | Session 3 discovery |
| 2026-01-22 | Implement Phase 3 now instead of deferring | Projectile freeze bug needed fix, pooling was good time | Combined bug fix with performance improvement | Session 4 decision |

## Critical Issues Found

| Issue | Description | Impact | Status | Resolution |
|-------|-------------|--------|--------|------------|
| Player loadSprite() error | Duplicate code from GameObject remained after migration | Game crash on player creation | ✅ Fixed | Removed duplicate loadSprite calls and old animation code (Session 2) |
| EventBus undefined | PlatformerGame.setupEventListeners() couldn't access eventBus | Game crash on initialization | ✅ Fixed | Added EventBus to GameBase constructor (Session 3) |
| Canvas undefined | InputHandler couldn't get canvas for mouse position | Game crash on mouse input | ✅ Fixed | Added canvas parameter to GameBase (Session 3) |
| Menu using old API | Menu.js still using inputHandler.keys.has() | Navigation not working | ✅ Fixed | Updated to isKeyPressed() throughout (Session 3) |
| SaveGameManager API mismatch | Calling save(key, data) but old API was save(data) | Save/load broken | ✅ Fixed | Rewrote for slot-based system (Session 3) |
| Input cleared too early | inputHandler.update() at start of frame cleared before entities read | Jump/shoot not working | ✅ Fixed | Moved update() to end of frame (Session 3) |
| Enemies invisible | Enemy and Projectile had no draw() method | Entities rendered but not visible | ✅ Fixed | Added custom draw() methods for color rendering (Session 3
| Projectiles freezing | Projectiles marked for deletion on platform collision | Projectiles fly short distance then stop | ✅ Fixed | Re-enabled platform collision (projectiles should stop at walls) (Session 4) |
| Projectile visual freeze | Projectiles appear frozen at 800px until enemy hit | reset() called on release cleared velocity while still drawing | ✅ Fixed | Move reset() to acquire() instead of release() (Session 4) |
| Projectiles not removed | Projectiles marked for deletion remain visible at max distance | No early return in update/draw when markedForDeletion | ✅ Fixed | Added early returns in update() and draw() methods (Session 4) |
| Projectiles stop at 313px | Air resistance was slowing projectiles to zero velocity | Physics component applied air resistance to all entities | ✅ Fixed | Added useAirResistance flag, disabled for projectiles (Session 4) |
| Enemies stuck on each other | Enemy-enemy collisions cause AI to stop patrolling | Enemies clump together and freeze | ✅ Fixed | Disabled enemy-enemy collisions (Session 4) |) |
| Player bouncing | Collision velocity check > 0 didn't catch velocity = 0 | Player oscillating on platforms | ✅ Fixed | Changed to >= 0 in collision checks (Session 3) |

## Phase 2 Refactoring Tasks

### ✅ ALL TASKS COMPLETE (Session 3, 2026-01-21)

All entity migrations finished. Architecture is now fully Entity-Component based with zero GameObject references in entity code.

### Migration Completed
1. ✅ Player (Session 2) - Entity + Physics + Sprite + Animator + Collider
2. ✅ Enemy (Session 3) - Entity + Physics + Sprite + Collider (patrol AI preserved)
3. ✅ Projectile (Session 3) - Entity + Physics + Sprite + Collider (no gravity)
4. ✅ Coin (Session 3) - Entity + Sprite + Collider (bob animation preserved)
5. ✅ Platform (Session 3) - Entity + Sprite + Collider (static, border rendering preserved)

### System Enhancements Completed
- ✅ Vector2.lerp() for smooth camera
- ✅ Camera Vector2 refactor + setTarget() API
- ✅ InputHandler pressed/held/released + mouse support
- ✅ EventBus integration (5 core events)
- ✅ CollisionManager handles ALL collision types
- ✅ SaveGameManager 3-slot system
- ✅ PlatformerGame.update() cleanup (150 → 40 lines)

**Note:** GameObject.js can now be deleted if desired - no longer used by any entities.

## Overview

Major architectural refactoring to move the engine toward a component-based architecture while maintaining beginner-friendliness. This is a **clean break** from previous tutorial documentation - we're building v2.0 of the engine.

### Goals
1. Component-like pattern (hybrid approach, not full ECS)
2. Centralized asset loading with preloading
3. Separation of concerns (entities manage their own behaviors)
4. Vector2 for position/velocity
5. Event system for decoupling
6. JSON-based level design
7. Debug mode with hitbox visualization
8. Object pooling for projectiles

### Non-Goals
- Full ECS (Entity-Component-System) - too complex for beginners
- Complex physics (forces, mass) - keep simple gravity/velocity
- Backward compatibility - clean break
- Updating old tutorial docs - focus on new architecture

## Phased Approach

### Branch Strategy
```
17-platformer-base (current)
    ↓
17.1-foundation (Phase 1)
    ↓
17.2-component-system (Phase 2)
    ↓
17.3-separation-concerns (Phase 3)
    ↓
17.4-level-system (Phase 4)
    ↓
17.5-polish (Phase 5)
```

## Phase 1: Foundation (2-3 days)

**Branch:** 17.1-foundation  
**Goal:** Add foundational systems without breaking existing code

### Deliverables
- Vector2 class for position/velocity math
- EventBus for decoupled communication
- ResourceManager for centralized asset loading
- Fixed InputHandler (pressed/held/released states)
- DebugRenderer for development tools

### Files Created
- `src/core/Vector2.js`
- `src/core/EventBus.js`
- `src/systems/ResourceManager.js`
- `src/systems/DebugRenderer.js`

### Files Modified
- `src/systems/InputHandler.js`

**Migration:** Non-breaking - new systems available but optional

---

## Phase 2: Component System (4-5 days)

**Branch:** 17.2-component-system  
**Goal:** Hybrid component architecture + state machines

### Deliverables
- Entity class (replaces GameObject)
- Component base class
- Core components: Transform, Sprite, Animator, Collider, Physics
- **State machine system for player (idle, running, jumping, falling)**
- Player migrated to component system
- Hitbox separate from sprite size

### Files Created
- `src/core/Entity.js`
- `src/core/Component.js`
- `src/core/State.js` (base state class)
- `src/core/StateMachine.js` (state manager)
- `src/components/Transform.js`
- `src/components/Sprite.js`
- `src/components/Animator.js`
- `src/components/Collider.js`
- `src/components/Physics.js`
- `src/entities/player-states/IdleState.js`
- `src/entities/player-states/RunningState.js`
- `src/entities/player-states/JumpingState.js`
- `src/entities/player-states/FallingState.js`

### Files Modified
- `src/entities/Player.js` (refactored to use components + state machine)

**Migration:** GameObject → Entity, migrate entities incrementally

**State Machine Benefits:**
- Clean separation of player behaviors
- Easy to add new states (climbing, dashing, etc.)
- Animations tied to states
- Easier to debug player behavior

---

## Phase 3: Separation of Concerns (3-4 days)

**Branch:** 17.3-separation-concerns  
**Goal:** Decouple behaviors, add pooling

### Deliverables
- Object pooling system
- Shooting moved to entities (via events)
- CollisionSystem separates detection/response
- Event-driven game actions

### Files Created
- `src/systems/ObjectPool.js`
- `src/systems/CollisionSystem.js`

### Files Modified
- `src/entities/Player.js` (shooting via events)
- `src/games/PlatformerGame.js` (use event system)

---

## Phase 4: Level System (3-4 days)

**Branch:** 17.4-level-system  
**Goal:** JSON-based level design

### Deliverables
- Level JSON format (tile-based)
- LevelLoader with entity factory system
- Level1 and Level2 converted to JSON

### Files Created
- `src/systems/LevelLoader.js`
- `src/levels/data/level1.json`
- `src/levels/data/level2.json`

### Files Modified
- `src/levels/Level.js` (uses LevelLoader)

---

## Phase 5: Polish (2-3 days)

**Branch:** 17.5-polish  
**Goal:** UX improvements and performance

### Deliverables
- Loading screen with progress bar
- Enhanced debug mode
- Sprite scaling support
- Performance optimizations

### Files Created
- `src/systems/LoadingScreen.js`
- `assets/manifest.json`

### Files Modified
- `src/main.js` (add loading screen)
- `src/systems/DebugRenderer.js` (enhanced features)

---

## Timeline

| Phase | Days | Cumulative |
|-------|------|------------|
| Phase 1 | 2-3 | 3 days |
| Phase 2 | 4-5 | 8 days |
| Phase 3 | 3-4 | 12 days |
| Phase 4 | 3-4 | 16 days |
| Phase 5 | 2-3 | 19 days |

**Total:** ~3-4 weeks

---

## Current Status - DEPRECATED

**Note:** See "Progress Tracking" section at top of document for current status.

This section kept for reference:

**Phase 1:** In Progress  
**Started:** 2026-01-21

### Completed
- [ ] Vector2 class
- [ ] EventBus
- [ ] ResourceManager
- [ ] InputHandler fix
- [ ] DebugRenderer

### In Progress
- [x] Plan documentation
- [ ] Architecture design docs

---

## Implementation Checklist Template

Use this for tracking each phase in detail:

### Phase X: [Phase Name]

**Status:** Not Started / In Progress / Complete  
**Branch:** [branch-name]  
**Started:** YYYY-MM-DD  
**Completed:** YYYY-MM-DD

**Detailed Progress:**

- [ ] X.1 Subtask one
  - Files: [list]
  - Status: Not started
  - Notes: 
- [ ] X.2 Subtask two
  - Files: [list]
  - Status: Not started
  - Notes:

**Testing Completed:**
- [ ] Feature works in browser
- [ ] No console errors
- [ ] Follows architecture guidelines
- [ ] Documentation updated

**Verification:**
- Commit: [hash]
- Merged to: [branch]
- Reviewed by: [user]

---

## Quick Reference: Architecture Rules

**For quick consultation during implementation:**

### DO ✅
- Extend Entity, not GameObject
- Add Transform, Sprite, Collider, Physics components
- Make Collider smaller than Sprite
- Handle collision in CollisionManager
- Handle input in Entity classes
- Use EntityState for animation control
- Use Vector2 for position/velocity
- Access physics constants via this.game.gravity
- Update documentation after changes
- Mark progress in plan with ✅

### DON'T ❌
- Use GameObject (migrating away)
- Add collision logic to Player/Enemy
- Handle input in State classes
- Make Collider same size as Sprite
- Skip adding components
- Forget to update documentation
- Deviate from plan without documenting
- Implement features not in current phase

### Component Checklist
Every entity should have (minimum):
- ✅ Transform component (position, velocity)
- ✅ Sprite component (rendering)
- ✅ Collider component (collision box)
- ✅ Physics component (gravity, friction)
- ✅ Animator component (if animated)

### State Machine Checklist
States should:
- ✅ Control which animation plays
- ✅ Handle state transitions
- ✅ Be small and focused
- ❌ NOT read input directly
- ❌ NOT know about collision
- ❌ NOT contain game logic

---

## Troubleshooting Guide

**Problem:** Agent forgetting architecture decisions  
**Solution:** Read AGENT_INSTRUCTIONS.md before starting work

**Problem:** Context feeling "lost"  
**Solution:** Review CONTEXT_MANAGEMENT.md recovery steps

**Problem:** Code not matching design  
**Solution:** Compare with examples in component-system-design.md

**Problem:** Plan and code diverging  
**Solution:** Stop, document deviation, get approval, update plan

**Problem:** Approaching token limit  
**Solution:** See CONTEXT_MANAGEMENT.md for handoff process

---

## Notes for Future Sessions

**When resuming work:**
1. Check "Progress Tracking" section at top
2. Read last "Context Session" entry
3. Review "Design Decisions" table
4. Check "Deviations" table for changes
5. Read current phase details
6. Verify understanding with user
7. Begin implementation

**When ending a session:**
1. Update "Progress Tracking" with ✅
2. Add new "Context Session" entry
3. Document any decisions made
4. Note any deviations from plan
5. Commit all changes
6. Create handoff summary if switching contexts

---

**Last Updated:** 2026-01-21  
**Documentation Version:** 2.0  
**Status:** Planning phase complete, ready for Phase 1 implementation
