# Plan 002: Component Architecture Refactor - Master Plan

**Status:** In Progress  
**Created:** 2026-01-21  
**Branch Strategy:** 5 separate branches, merge sequentially  
**Current Branch:** 33.5-top-down-gfx

## Progress Tracking

**Started:** 2026-01-21  
**Last Updated:** 2026-01-21  
**Current Phase:** Planning & Documentation  
**Context Sessions:** 1

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

### Completed ✅
- ✅ Initial architecture research (Session 1, 2026-01-21)
- ✅ Documentation structure created (Session 1, 2026-01-21)

### In Progress ⏸️
- ⏸️ Phase 1: Foundation systems (Not yet started)

### Blocked ❌
- None currently

### Deferred 💤
- None currently

## Design Decisions During Implementation

| Date | Decision | Reasoning | Impact | Status |
|------|----------|-----------|--------|--------|
| 2026-01-21 | Using hybrid Entity system not full ECS | Beginner-friendly, less abstraction | Simpler component implementation | ✅ Decided |
| 2026-01-21 | Collision centralized in CollisionManager, NOT entities | Separation of concerns, entities shouldn't know about platforms | Major refactor of collision code | ✅ Decided |
| 2026-01-21 | EntityState controls animation, NOT input | States react to entity changes, input stays in entity | Clear separation of responsibilities | ✅ Decided |
| 2026-01-21 | Keep states small and clean | Avoid bloat, maintain simplicity | States focused on animation/behavior only | ✅ Decided |
| 2026-01-21 | Physics constants (gravity, friction) stay in game | Centralized config, accessed via game reference | Entities access via this.game.gravity | ✅ Decided |
| 2026-01-21 | Move away from GameObject entirely | Complete architectural shift to Entity-Component | GameObject.js will be deleted, all entities migrate to Entity | ✅ Decided |

## Deviations from Original Plan

| Step | Original Plan | What Actually Happened | Reason | Approved By |
|------|---------------|------------------------|--------|-------------|
| N/A | N/A | N/A | N/A | N/A |

**Note:** Update this table during implementation if changes occur.

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
