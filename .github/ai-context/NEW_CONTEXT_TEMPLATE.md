# 🚀 Quick Start - New Context Template

**Copy this entire section when starting a new context/chat session.**

---

# Context Handoff - Game Engine Refactoring

## 📍 Current Status

**Project:** Educational 2D Game Engine  
**Active Plan:** Component Architecture Refactor (Plan 002)  
**Current Branch:** `33.5-top-down-gfx`  
**Last Updated:** 2026-01-21  
**Current Phase:** Planning & Documentation Complete

## 🎯 Architecture Goal

Migrating from GameObject inheritance to Entity-Component system.

**Core Principles:**
- ✅ Use Entity + Components (NOT GameObject)
- ✅ Centralized collision in CollisionManager (NOT in entities)
- ✅ EntityState controls animation (NOT input handling)
- ✅ Input handling in Player entity (changes state based on input)
- ✅ Physics constants in game (accessed via this.game.gravity)
- ✅ Keep states small and clean

## 📊 Progress So Far

### ✅ Completed
- [x] Initial architecture research
- [x] Created comprehensive documentation structure:
  - CONTEXT_MANAGEMENT.md
  - AGENT_INSTRUCTIONS.md
  - Updated COPILOT_INSTRUCTIONS.md
  - Updated component-system-design.md
  - Updated 002-component-architecture-refactor.md
  - Created README.md for ai-context folder

### ⏸️ Currently Working On
- Phase 1: Foundation Systems (not yet started)
  - Vector2 class
  - EventBus
  - ResourceManager
  - InputHandler refactor
  - DebugRenderer

### 🚫 What NOT to Do
- ❌ Don't use GameObject (being replaced)
- ❌ Don't add collision logic to Player/Enemy
- ❌ Don't handle input in State classes
- ❌ Don't make Collider same size as Sprite
- ❌ Don't skip adding components to entities
- ❌ Don't implement features not in current phase

## 📚 Required Reading

**Before starting work, read these files:**

1. `.github/ai-context/README.md` - Overview and quick start
2. `.github/ai-context/plans/002-component-architecture-refactor.md` - Master plan
3. `.github/ai-context/architecture/component-system-design.md` - Component design
4. `.github/ai-context/AGENT_INSTRUCTIONS.md` - Implementation rules

## 🎬 Next Steps

1. **Verify Understanding**
   - Read the required documents above
   - Review current branch state
   - Check what files already exist

2. **Begin Phase 1** (if approved)
   - Create Vector2 class
   - Create EventBus
   - Create ResourceManager
   - Refactor InputHandler
   - Create DebugRenderer

3. **Documentation**
   - Update plan with ✅ as tasks complete
   - Document any decisions made
   - Update "Context Sessions" with progress

## 🔍 Important Context

**Current Codebase State:**
- Has GameObject.js (being replaced)
- Has unused Component classes (Transform, Physics, Sprite, Collider, Animator)
- Has Entity.js (created but not used yet)
- Has StateMachine + EntityState (created, Player uses them)
- Has player states (IdleState, RunningState, JumpingState, FallingState)
- Physics code duplicated in Player.js and Enemy.js
- Collision handling duplicated in entities

**Key Insight:**
The component system was designed but never implemented. We're picking up from where that work was paused and actually migrating entities to use it.

## 📋 Verification Checklist

Before you start implementing:

- [ ] Read all required documentation
- [ ] Understand Entity-Component architecture
- [ ] Know what components do what
- [ ] Understand collision centralization plan
- [ ] Know state machine pattern (animation, not input)
- [ ] Verified current branch status
- [ ] Checked existing files

## 🆘 If You Get Lost

1. Stop implementation immediately
2. Re-read `.github/ai-context/AGENT_INSTRUCTIONS.md`
3. Review plan document "Progress Tracking" section
4. Summarize understanding back to user
5. Get confirmation before continuing

---

## Template for Reporting Understanding

**Copy this and fill it out before starting:**

```
I've reviewed the documentation. Here's my understanding:

**Current Goal:** [e.g., Implement Phase 1 Foundation Systems]

**Architecture Approach:**
- Using Entity + Components (not GameObject)
- Collision centralized in CollisionManager
- EntityState controls animation only
- Input stays in entity classes
- Physics constants via game reference

**Files I'll Create:**
1. src/core/Vector2.js - 2D vector math
2. src/core/EventBus.js - Event system for decoupling
3. [etc...]

**Files I'll Modify:**
1. src/systems/InputHandler.js - Fix pressed/held/released states
2. [etc...]

**How I'll Verify:**
- Run game in browser
- Check for console errors
- Test each system independently
- Update documentation

**Documentation Updates:**
- Mark steps complete in plan (✅)
- Add "Context Session" entry
- Document any decisions
- Commit with clear message

Ready to proceed?
```

---

## 💡 Remember

- Read plan every 5 file changes
- Update docs immediately after completing tasks
- Ask questions rather than guessing
- Document deviations from plan
- Commit frequently

**This is an educational project - clarity over cleverness!**

---

**Last Context Session:** Session 1 (2026-01-21)  
**Token Usage:** ~50K  
**Next Session Starts:** Phase 1 Implementation

---

## 📎 Quick Links

- Plan: `.github/ai-context/plans/002-component-architecture-refactor.md`
- Architecture: `.github/ai-context/architecture/component-system-design.md`
- Instructions: `.github/ai-context/AGENT_INSTRUCTIONS.md`
- Context Guide: `.github/ai-context/CONTEXT_MANAGEMENT.md`
