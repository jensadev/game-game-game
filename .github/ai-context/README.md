# AI Context Documentation

This folder contains comprehensive documentation for AI assistants working on this game engine.

## Document Overview

### 📋 For All AI Assistants

**Start here:**

1. **[COPILOT_INSTRUCTIONS.md](COPILOT_INSTRUCTIONS.md)** - Main project overview
   - Project philosophy and goals
   - Architecture patterns
   - Coding conventions
   - Tutorial progression
   - Common patterns and issues

2. **[AGENT_INSTRUCTIONS.md](AGENT_INSTRUCTIONS.md)** - Implementation protocols
   - Core architectural principles
   - Red flags to avoid
   - Step-by-step implementation guide
   - Code quality standards
   - Token monitoring protocol
   - Common mistakes

3. **[CONTEXT_MANAGEMENT.md](CONTEXT_MANAGEMENT.md)** - Context switching guidelines
   - When to start new context
   - Handoff summary template
   - Progress tracking methods
   - Warning signs of context loss
   - Recovery procedures

### 🛠️ Practical Tools

4. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** ⭐ **Pin this!**
   - Emergency cheat sheet
   - Traffic light system
   - Component checklist
   - Token monitoring
   - Common patterns

5. **[PRE_COMMIT_CHECKLIST.md](PRE_COMMIT_CHECKLIST.md)** - Before every commit
   - Code quality checks
   - Architecture compliance
   - Documentation updates
   - Testing verification

6. **[SESSION_SUMMARY_TEMPLATE.md](SESSION_SUMMARY_TEMPLATE.md)** - End of session
   - Standardized summary format
   - Progress tracking
   - Decision documentation
   - Handoff preparation

7. **[NEW_CONTEXT_TEMPLATE.md](NEW_CONTEXT_TEMPLATE.md)** - Starting new context
   - Ready-to-copy handoff template
   - Current status summary
   - Next steps outlined

8. **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - Visual reference
   - System architecture overview
   - Entity-Component relationships
   - Data flow diagrams
   - Component dependencies

### 📜 Git Integration

9. **[.gitmessage](../../.gitmessage)** - Commit message template
   - Structured commit format
   - References plan steps
   - Verification checklist

### 📁 Architecture Documentation

**[architecture/](architecture/)** - System design documents

- **[component-system-design.md](architecture/component-system-design.md)**
  - Entity-Component architecture
  - Component specifications
  - Usage examples
  - Migration strategy

### 📝 Plans Documentation

**[plans/](plans/)** - Project plans and roadmaps

- **[001-restructure-for-clarity.md](plans/001-restructure-for-clarity.md)** ✅ Complete
  - Folder restructuring plan
  - Completed 2026-01-21

- **[002-component-architecture-refactor.md](plans/002-component-architecture-refactor.md)** ⏸️ In Progress
  - Master refactoring plan
  - 5 phases with detailed steps
  - Progress tracking
  - Design decisions log

## Quick Start for New Context

**If starting fresh or resuming work:**

1. **⭐ Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)** (2 min)
   - Emergency cheat sheet with all essentials
   
2. **Read in this order:**
   - [CONTEXT_MANAGEMENT.md](CONTEXT_MANAGEMENT.md) - Context switching section (5 min)
   - [plans/002-component-architecture-refactor.md](plans/002-component-architecture-refactor.md) - Check "Progress Tracking" (3 min)
   - [AGENT_INSTRUCTIONS.md](AGENT_INSTRUCTIONS.md) - Implementation rules (10 min)

3. **Check current status:**
   - Review "Progress Tracking" in plan document
   - Read last "Context Session" entry
   - Review "Design Decisions" table
   - Check "Deviations" table

4. **Verify understanding:**
   - Summarize current state to user
   - Confirm next steps
   - Get approval before proceeding

**Total orientation time: ~20 minutes**

## Document Maintenance

### When Making Code Changes

**Update these documents:**

- [ ] Mark steps complete (✅) in plan document
- [ ] Add "Context Session" entry when starting/ending work
- [ ] Document decisions in "Design Decisions" table
- [ ] Note deviations in "Deviations" table
- [ ] Update architecture doc if design changes
- [ ] Commit with descriptive message

### When Switching Context

**Before ending session:**

1. Update all progress markers
2. Add context session summary
3. Create handoff summary (use template in CONTEXT_MANAGEMENT.md)
4. Commit all changes
5. Push to repository

## File Structure

```
.github/ai-context/
├── README.md (this file - START HERE!)
│
├── Core Documentation
│   ├── COPILOT_INSTRUCTIONS.md (project overview)
│   ├── AGENT_INSTRUCTIONS.md (implementation rules)
│   └── CONTEXT_MANAGEMENT.md (context switching)
│
├── Practical Tools
│   ├── QUICK_REFERENCE.md ⭐ (emergency cheat sheet)
│   ├── PRE_COMMIT_CHECKLIST.md (before every commit)
│   ├── SESSION_SUMMARY_TEMPLATE.md (end of session)
│   ├── NEW_CONTEXT_TEMPLATE.md (starting new context)
│   └── ARCHITECTURE_DIAGRAM.md (visual reference)
│
├── architecture/
│   └── component-system-design.md (Entity-Component design)
│
└── plans/
    ├── 001-restructure-for-clarity.md (completed ✅)
    └── 002-component-architecture-refactor.md (active ⏸️)

Root:
├── .gitmessage (commit template - auto-loaded by git)
```

## Current Project Status

**Active Plan:** Component Architecture Refactor (Plan 002)  
**Current Phase:** Planning & Documentation  
**Current Branch:** 33.5-top-down-gfx  
**Last Updated:** 2026-01-21

**Key Decisions:**
- Migrating from GameObject to Entity-Component system
- Collision centralized in CollisionManager
- EntityState for animation control (not input)
- Physics constants stay in game
- States should be small and clean

**What's Working:**
- Documentation structure ✅
- Architecture planning ✅

**Next Steps:**
- Begin Phase 1: Foundation systems
- Implement Vector2, EventBus, ResourceManager
- Refactor InputHandler, create DebugRenderer

## Architecture Quick Reference

### Current System (Being Replaced)
- GameObject base class
- Inheritance-based entities
- Collision in Player/Enemy classes ❌
- Duplicated physics code ❌

### Target System (Migrating To)
- Entity base class
- Component-based architecture
- Centralized CollisionManager ✅
- Shared physics in Physics component ✅
- StateMachine for player/enemy ✅
- EntityState for animation control ✅

### Core Principles
1. **Entity + Components** - Not GameObject
2. **Centralized Collision** - Not in entities
3. **State for Animation** - Not for input
4. **Input in Entity** - Entity reads input, changes state
5. **Separation of Concerns** - Each component has one job

## Getting Help

**If confused:**
- Read AGENT_INSTRUCTIONS.md "Red Flags" section
- Review architecture examples in component-system-design.md
- Check CONTEXT_MANAGEMENT.md "Recovery Steps"
- Ask user for clarification

**If stuck:**
- Explain the blocker clearly
- List what you've tried
- Suggest alternatives
- Ask for guidance

**If context seems lost:**
- Stop immediately
- Re-read plan document
- Re-read architecture document
- Summarize understanding
- Get confirmation before continuing

---

**Remember:** This is an educational project. Clarity over cleverness. Document everything. Follow the plan.
