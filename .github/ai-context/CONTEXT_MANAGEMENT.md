# Context Management Guidelines

**Purpose:** Guidelines for managing AI assistant context across long-running development sessions.

## When to Start New Context

Start a new chat context when:

- **Token usage exceeds 500K** - Check system warnings for token usage
- **Switching major phases** - E.g., Phase 2 → Phase 3 of a plan
- **Plan significantly diverges** - Implementation differs substantially from plan
- **Context feels "lost"** - Agent forgetting decisions, rehashing solved problems
- **Circular conversations** - Repeating same discussions without progress
- **After major milestones** - Good breakpoint between features

## Before Starting New Context

### Mandatory Checklist

1. **✅ Update progress in plan document** - Mark completed steps with checkmarks
2. **✅ Update architecture document** - Reflect any design changes made
3. **✅ Create handoff summary** - Use template below
4. **✅ Commit and push changes** - Don't lose work!
5. **✅ Copy handoff summary** - Ready to paste in new context

### Files to Review and Update

- [ ] `.github/ai-context/plans/[current-plan].md` - Progress tracking
- [ ] `.github/ai-context/architecture/component-system-design.md` - Design changes
- [ ] `.github/ai-context/COPILOT_INSTRUCTIONS.md` - Any new conventions
- [ ] Plan document's "Implementation Log" - Record session summary
- [ ] Plan document's "Design Decisions" - Document any changes
- [ ] Architecture's "Change History" - Record modifications

## Handoff Summary Template

Copy this template and fill it out before starting a new context:

```markdown
# Context Lost - Resuming Work

**Current Goal:** [e.g., "Migrate Enemy entity to component system"]

**Architecture Decision:** We're migrating to Entity-Component system (NOT GameObject). Key principles:
- Entities use components (Transform, Physics, Sprite, Collider, Animator)
- Collision handling centralized in CollisionManager (not in entities)
- EntityState for player/enemy behavior (animation control, NOT input handling)
- Input handling stays in Player entity (changes state based on input)
- Physics constants (gravity, friction) in game config, accessed via game reference

**Progress So Far:**
- ✅ Phase 1 complete: Vector2, EventBus, ResourceManager, InputHandler, DebugRenderer
- ✅ Player migrated to Entity + Components + StateMachine
- ✅ [Add other completed items]
- ⏸️ Currently: [specific task, e.g., "About to migrate Enemy"]

**What to Preserve:**
- Simplified systems: Vector2, EventBus, ResourceManager, InputHandler, DebugRenderer
- StateMachine + EntityState classes (working)
- Player entity (working with components and states)
- [Add other working components]

**What to Delete/Replace:**
- GameObject.js (being replaced by Entity)
- Old Component classes that duplicate Entity functionality
- [Add other deprecated files]

**Known Issues/Blockers:**
- [List any problems encountered]
- [List any decisions still needed]

**Next Steps:**
[Copy from the plan's "Next Steps" section]
1. [Immediate next task]
2. [Following task]
3. [After that]

**Reference Documents:**
- Architecture: .github/ai-context/architecture/component-system-design.md
- Master Plan: .github/ai-context/plans/002-component-architecture-refactor.md
- Instructions: .github/ai-context/COPILOT_INSTRUCTIONS.md
- Agent Instructions: .github/ai-context/AGENT_INSTRUCTIONS.md

**Important Context:**
[Include specific code snippets, decisions, or gotchas]
- Example: "Collider size must be smaller than sprite size"
- Example: "Don't handle collision in Player, use CollisionManager"

**Last Commit:** [commit hash or description]
**Branch:** [current branch name]
**Token Usage at End:** [approximate tokens used]
```

## Tracking Implementation vs Plan

Each plan document should maintain a **Progress Tracking** section that evolves during implementation.

### Progress Section Template

Add to plan documents:

```markdown
## Progress Tracking

**Started:** YYYY-MM-DD  
**Last Updated:** YYYY-MM-DD  
**Current Phase:** [X of Y]  
**Context Sessions:** [Number of context switches]

### Completed ✅
- ✅ Task 1 (Context #1, YYYY-MM-DD) - Notes if any
- ✅ Task 2 (Context #2, YYYY-MM-DD) - Notes if any

### In Progress ⏸️
- ⏸️ Task 3 (Context #3, started YYYY-MM-DD)
  - Current status: [what's done, what remains]
  - Blockers: [if any]

### Blocked ❌
- ❌ Task 4
  - Reason: Needs Task 3 complete
  - Estimated: [when can start]

### Deferred 💤
- 💤 Task 5
  - Reason: Not critical for current phase
  - Revisit: [when to reconsider]
```

## Design Decisions Log

Track all significant decisions made during implementation:

```markdown
## Design Decisions During Implementation

| Date | Decision | Reasoning | Impact | Status |
|------|----------|-----------|--------|--------|
| 2026-01-21 | Using hybrid Entity system not full ECS | Beginner-friendly, less abstraction | Simpler component implementation | ✅ Working |
| 2026-01-21 | Collision centralized in game, NOT entities | Separation of concerns | Entities don't know about platform collisions | ✅ Planned |
| YYYY-MM-DD | [Next decision] | [Reason] | [Impact] | [Status] |
```

## Deviations Log

Track when implementation differs from original plan:

```markdown
## Deviations from Original Plan

| Step | Original Plan | What Actually Happened | Reason | Approved By |
|------|---------------|------------------------|--------|-------------|
| 2.3 | Planned to do X | Did Y instead | Because Z made more sense | User (date) |
| 3.1 | Feature A first | Feature B first | A blocked on external factor | User (date) |
```

## Context Session Log

Track each context/chat session:

```markdown
## Implementation Sessions

### Session 1: Initial Planning
- **Date:** 2026-01-21
- **Duration:** ~2 hours
- **Token Usage:** ~100K
- **Accomplished:**
  - Created plan document
  - Researched current architecture
  - Designed component system
- **Decisions Made:**
  - Use hybrid Entity system
  - Keep StateMachine pattern
- **Ended Because:** Natural breakpoint after planning phase

### Session 2: Phase 1 Implementation
- **Date:** 2026-01-XX
- **Duration:** ~X hours
- **Token Usage:** ~XXXK
- **Resumed From:** Beginning of Phase 1
- **Accomplished:**
  - Created Vector2 class
  - Implemented EventBus
  - [etc]
- **Decisions Made:**
  - [list]
- **Ended Because:** Token limit reached / Phase complete / etc.

### Session 3: [Next session]
- **Date:** YYYY-MM-DD
- ...
```

## Warning Signs of Context Loss

If you notice these, it's time to review documents or switch context:

### Agent Symptoms
- Suggesting GameObject when should use Entity
- Forgetting previous architectural decisions
- Proposing features not in the plan without explanation
- Reverting to old patterns (collision in entities)
- Not updating documentation
- Circular discussions about already-decided topics
- Implementing features that contradict recent decisions

### User Symptoms
- Repeating same corrections multiple times
- Agent seems unfamiliar with recent code changes
- Need to re-explain architecture principles
- Documentation out of sync with code

### Recovery Steps

1. **Pause implementation** immediately
2. **Review sequence:**
   - Read current plan document completely
   - Read architecture document completely  
   - Read COPILOT_INSTRUCTIONS.md relevant sections
   - Review recent git commits
3. **Verify understanding:**
   - Summarize current architecture to user
   - State what you're about to do
   - Get confirmation before proceeding
4. **Update documents** if they're outdated
5. **Resume** with corrected understanding

## Best Practices

### For Users
- Check documentation updates after each major change
- Request progress summary periodically
- Save context when approaching 500K tokens
- Ask agent to "review the plan" if losing track
- Commit frequently to preserve work

### For AI Assistants
- Read plan document at start of session
- Check plan every 5-10 file changes
- Update plan progress markers immediately after completing tasks
- Document decisions that differ from plan
- Warn user when approaching token limits
- Ask clarifying questions rather than guessing

### For Long-Running Projects
- Create milestone branches for each phase
- Tag commits with plan step numbers (e.g., "Step 2.3: Migrate Enemy")
- Keep one "current plan" document active
- Archive completed plans to separate folder
- Regular documentation review (weekly if active development)

## Tools for Context Management

### Git Commit Messages
Use structured format:
```
[Plan-Step] Brief description

- Detailed change 1
- Detailed change 2

Plan: .github/ai-context/plans/002-component-architecture-refactor.md
Status: Step 2.3 complete ✅
```

### Branch Naming
```
[phase-number]-[descriptive-name]
e.g., 18-foundation
     19-component-system
     20-separation-concerns
```

### Documentation Commits
Commit documentation separately from code:
```
docs: Update plan progress - Phase 2 Step 3 complete

- Marked Enemy migration complete
- Documented decision to use smaller colliders
- Added note about patrol AI edge cases
```

## Emergency Context Recovery

If all else fails and context is completely lost:

1. **Read all documents in order:**
   - COPILOT_INSTRUCTIONS.md
   - Current plan document
   - Architecture document
   - AGENT_INSTRUCTIONS.md

2. **Review recent commits:**
   ```bash
   git log --oneline -20
   git diff HEAD~10..HEAD
   ```

3. **Check current branch and state:**
   ```bash
   git branch
   git status
   ```

4. **Run the project:**
   - See what actually works
   - Test current features
   - Identify what's broken

5. **Create recovery plan:**
   - List what's working
   - List what's broken
   - List what's incomplete
   - Prioritize next steps

6. **Document recovery:**
   - Add section to plan: "Recovery from Context Loss"
   - Note what was learned
   - Update processes to prevent recurrence

---

**Remember:** Good documentation is insurance against context loss. Invest time in maintaining it—your future self (and future contexts) will thank you.
