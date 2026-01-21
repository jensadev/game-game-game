# Instructions for Autonomous AI Agents

**Audience:** AI assistants (GitHub Copilot, subagents, etc.) working on this codebase  
**Purpose:** Prevent context loss, ensure plan adherence, maintain documentation

## Core Principles (READ FIRST)

You are working on an **educational game engine** with specific architectural decisions already made. This is not a greenfield project—design choices have been thoughtfully selected for pedagogical reasons.

### Architecture Decisions (Non-Negotiable)

1. **Entity-Component Architecture**: Use `Entity` + Components, NOT `GameObject`
2. **Centralized Collision**: `CollisionManager` handles collision detection and response, NOT entities
3. **EntityState Pattern**: States control animation and behavior, NOT input handling
4. **Input in Entity**: Input handling stays in Player/Enemy entities, states react to entity changes
5. **Beginner-Friendly**: Prioritize clarity over performance, verbosity over cleverness
6. **Separation of Concerns**: Entities don't know about platforms, collision manager coordinates

### What's Already Decided

These decisions are **final** (barring user override):

- ❌ No full ECS (Entity-Component-System)—too complex for beginners
- ❌ No GameObject class—migrating to Entity
- ❌ No collision logic in Player/Enemy classes
- ❌ No input handling in State classes
- ❌ No external frameworks or dependencies
- ✅ Simple component pattern (hybrid approach)
- ✅ State machine for player and enemy behaviors
- ✅ Centralized systems (InputHandler, Camera, CollisionManager)
- ✅ Vector2 for all position/velocity calculations
- ✅ Event system for decoupling

## Before You Start ANY Work

### Mandatory Reading (No Exceptions)

Read these files **in this order** before writing a single line of code:

1. **`.github/ai-context/plans/002-component-architecture-refactor.md`**
   - Understand the master plan and phases
   - Identify current phase and step
   - Note what's complete vs in-progress

2. **`.github/ai-context/architecture/component-system-design.md`**
   - Study the component architecture design
   - Review code examples
   - Understand component responsibilities

3. **`.github/ai-context/COPILOT_INSTRUCTIONS.md`** (relevant sections)
   - Read "Architecture Overview"
   - Read "Working with This Codebase"
   - Understand coding conventions

4. **`.github/ai-context/CONTEXT_MANAGEMENT.md`**
   - Understand documentation requirements
   - Know when to update what

### State Your Understanding

Before implementing, respond to the user with:

```
I've reviewed the documentation. Here's my understanding:

**Current Task:** [What I'm about to do]
**Current Phase:** [Which phase of the plan]
**Architecture Approach:** [Brief summary—Entity/Component, centralized collision, etc.]

**Files I'll Modify:**
- file1.js - [what change]
- file2.js - [what change]

**Files I'll Create:**
- file3.js - [purpose]

**Tests/Verification:**
- [How to verify it works]

**Plan Updates:**
- Will mark Step X.Y complete
- Will document decision about Z

Does this match your expectations?
```

Get confirmation before proceeding.

## During Implementation

### Check Plan Every 3-5 File Changes

After every few file modifications, ask yourself:

1. **Am I following the documented approach?**
   - Using Entity, not GameObject?
   - Components added to entities?
   - No collision logic in entities?

2. **Have I deviated from the plan?**
   - If yes, why?
   - Is it justified?
   - Did I document it?

3. **Should I update documentation?**
   - Progress checkmarks in plan?
   - New decision to document?
   - Architecture change to note?

### Documentation Discipline

**After completing each plan step:**

1. ✅ Mark step complete in plan document
2. ✅ Update "Implementation Log" section
3. ✅ Add to "Design Decisions" if deviated
4. ✅ Commit changes with descriptive message

**When making a decision that differs from plan:**

1. ⚠️ **STOP** and explain to user
2. ⚠️ Get explicit approval
3. ⚠️ Document in plan's "Decisions Made" section
4. ⚠️ Update architecture doc if design changes

**Before finishing your turn:**

1. 📝 Summarize what was accomplished
2. 📝 Note any blockers or issues
3. 📝 State next steps clearly
4. 📝 Confirm docs are updated

### Red Flags (Stop and Reconsider)

**IMMEDIATELY STOP** if you find yourself:

- ❌ Adding collision logic to Player or Enemy classes
- ❌ Using GameObject instead of Entity
- ❌ Creating components not in the design document
- ❌ Skipping component addition (Transform, Physics, etc.)
- ❌ Handling keyboard input in State classes
- ❌ Duplicating physics code across entities
- ❌ Adding external dependencies without discussion
- ❌ Making sprite size equal to collision box (should be separate!)
- ❌ Implementing features not in the current plan phase

When you encounter a red flag:
1. Stop implementation
2. Review relevant documentation section
3. Explain the issue to user
4. Get guidance before proceeding

## Architecture Patterns to Follow

### Entity Structure

```javascript
class SomeEntity extends Entity {
    constructor(game, x, y) {
        super(game, x, y)
        
        // Add components (ALWAYS in this order for consistency)
        this.addComponent('transform', new Transform(x, y))
        this.addComponent('sprite', new Sprite('key', width, height))
        this.addComponent('animator', new Animator())
        this.addComponent('collider', new Collider(width, height, offsetX, offsetY))
        this.addComponent('physics', new Physics())
        
        // Entity-specific state (not in components)
        this.entitySpecificProperty = value
    }
    
    update(deltaTime) {
        super.update(deltaTime) // Updates all components
        
        // Then entity-specific logic
        this.handleEntityBehavior(deltaTime)
    }
}
```

### Component Responsibilities

- **Transform**: Position, velocity, scale, rotation
- **Sprite**: Rendering single images
- **Animator**: Frame-based animation from sprite sheets
- **Collider**: Collision detection (separate from sprite size!)
- **Physics**: Gravity, friction, forces

### State Machine Pattern

```javascript
// EntityState controls animation, NOT input
class SomeState extends EntityState {
    enter() {
        // Set animation for this state
        const animator = this.entity.getComponent('animator')
        animator.play('stateName')
    }
    
    update(deltaTime) {
        // Check conditions for state transitions
        // Do NOT read input here!
        const physics = this.entity.getComponent('physics')
        
        if (someCondition) {
            this.stateMachine.setState('otherState')
        }
    }
}

// Entity handles input, changes state based on it
class Player extends Entity {
    handleInput(deltaTime) {
        const input = this.game.inputHandler
        const transform = this.getComponent('transform')
        
        if (input.isKeyHeld('ArrowLeft')) {
            transform.velocity.x = -this.moveSpeed
            // State reacts to velocity changes
        }
    }
}
```

### Collision Handling

```javascript
// ❌ WRONG - Don't do this
class Player extends Entity {
    update(deltaTime) {
        // Check collision with platforms
        for (const platform of this.game.platforms) {
            if (this.intersects(platform)) {
                // Handle collision
            }
        }
    }
}

// ✅ CORRECT - Do this
class CollisionManager {
    checkCollisions(game) {
        // Centralized collision detection
        for (const entity of game.entities) {
            if (entity.hasComponent('collider')) {
                // Check and respond
            }
        }
    }
}
```

## Code Quality Standards

### Naming Conventions
- **Classes**: PascalCase (`PlayerEntity`, `Transform`)
- **Files**: Match class name (`PlayerEntity.js`)
- **Variables/Methods**: camelCase (`moveSpeed`, `handleCollision`)
- **Components**: Component name in quotes (`'transform'`, `'sprite'`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SPEED`, `GRAVITY`)

### Code Structure
```javascript
class Example {
    // 1. Constructor
    constructor() { }
    
    // 2. Lifecycle methods (in order they're called)
    update(deltaTime) { }
    draw(ctx, camera) { }
    
    // 3. Public methods (alphabetically)
    methodA() { }
    methodB() { }
    
    // 4. Private/helper methods (underscore prefix)
    _helperMethod() { }
}
```

### Documentation
- Add JSDoc comments to classes and public methods
- Explain WHY not just WHAT
- Note any gotchas or edge cases
- Reference plan steps in commits

## Success Criteria

Each implementation step should result in:

✅ **Functional Code**
- Code runs without errors
- Features work as expected
- No console warnings

✅ **Architectural Compliance**
- Follows Entity-Component pattern
- Uses centralized collision
- States don't handle input
- Components properly added

✅ **Documentation Updated**
- Plan checkmarks marked
- Decisions documented
- Architecture updated if changed
- Commit message references plan

✅ **Code Quality**
- Follows naming conventions
- Proper code structure
- Comments where needed
- No code duplication

✅ **User Verification**
- Summarized changes
- Listed next steps
- Identified any blockers
- Ready for user feedback

## Common Mistakes to Avoid

### Mistake 1: Forgetting to Read Documentation
**Symptom:** Implementing features not in plan, using wrong patterns  
**Fix:** Always read docs before starting

### Mistake 2: Silent Deviation from Plan
**Symptom:** Code doesn't match plan, no explanation given  
**Fix:** Document all deviations with reasoning

### Mistake 3: Skipping Component Addition
**Symptom:** Entity missing Transform, Physics, or other components  
**Fix:** Always add all necessary components

### Mistake 4: Collision in Entities
**Symptom:** Player/Enemy checking for platform collisions  
**Fix:** Move collision to CollisionManager

### Mistake 5: Input in States
**Symptom:** State classes reading InputHandler  
**Fix:** States react to entity properties, entity reads input

### Mistake 6: Same Size Collider and Sprite
**Symptom:** Collider size matches sprite size exactly  
**Fix:** Collider should be smaller for better gameplay feel

### Mistake 7: Not Updating Documentation
**Symptom:** Plan shows incomplete, no decisions documented  
**Fix:** Update docs immediately after each step

### Mistake 8: Using GameObject
**Symptom:** New entities extend GameObject  
**Fix:** All entities should extend Entity

## Token Budget Awareness

### Monitoring Protocol

**Check token usage regularly** - System warnings show usage in this format:
```
<system_warning>Token usage: 50000/1000000; 950000 remaining</system_warning>
```

**Every 10-15 responses, report to user:**
```
Token Status:
- Current usage: ~XXK tokens
- Budget: 1M total
- Percentage used: XX%
- Estimated remaining: ~XX responses at current rate
- Recommendation: [Continue / Start preparing handoff / Switch context now]
```

### Usage Thresholds

- **0-300K tokens** (0-30%): Safe to continue, work normally
- **300K-500K tokens** (30-50%): Monitor closely, give periodic updates
- **500K-700K tokens** (50-70%): ⚠️ Prepare for context switch soon
- **700K-900K tokens** (70-90%): ⚠️ Start handoff process, update all docs
- **900K+ tokens** (90%+): 🛑 Stop implementation, complete handoff immediately

### When Approaching Limit (500K+)

1. **Notify user immediately:**
   ```
   ⚠️ Token Budget Alert
   - Usage: ~XXXK / 1M (XX%)
   - Recommendation: Prepare for context switch
   - Current task: [what you're doing]
   - Suggested completion: [finish current step / switch now]
   ```

2. **Help prepare handoff:**
   - Update all documentation
   - Complete current step if close to done
   - Create handoff summary (see CONTEXT_MANAGEMENT.md)
   - Commit all changes

3. **Ensure clean break:**
   - All progress marked in plan
   - All decisions documented
   - Architecture doc updated
   - Next steps clearly stated

### Token-Efficient Practices

**DO:**
- Read files with specific line ranges
- Use targeted searches
- Batch related tasks
- Write clear, complete code first time

**DON'T:**
- Read entire large files repeatedly
- Make many small file reads when one larger read would work
- Repeat searches with similar queries
- Make multiple attempts at same code (plan first)

### Emergency Protocol

**If token limit reached unexpectedly:**

1. **STOP all implementation immediately**
2. **Save current state:**
   - Update plan with last completed item
   - Mark current item as "In Progress - Context limit reached"
   - Note exact point where work stopped
3. **Create minimal handoff:**
   ```
   Context Limit Reached
   
   Last completed: [task]
   Currently at: [exact point]
   Next step: [what to do next]
   Files modified: [list]
   Files created: [list]
   
   Important context:
   - [key detail 1]
   - [key detail 2]
   
   Resume by: [specific instruction]
   ```
4. **Commit everything**
5. **Provide handoff summary to user**

## Questions to Ask

If uncertain, ask user:

- "Should I deviate from the plan because...?"
- "The plan says X, but Y seems better because... proceed?"
- "I notice [architectural issue]. Should I fix it now or defer?"
- "Approaching token limit. Time to switch context?"
- "This step is complete. Proceed to next step or verify first?"

## Emergency Protocols

### If You've Lost Context

1. **Admit it immediately**: "I need to review the documentation"
2. **Read docs in order** (see "Mandatory Reading" above)
3. **Summarize understanding** back to user
4. **Get confirmation** before proceeding

### If Plan Seems Wrong

1. **Don't silently ignore it**
2. **Explain the issue**: "The plan says X, but current code is Y"
3. **Suggest resolution**: "Should we update plan or revert code?"
4. **Document outcome**

### If Stuck/Blocked

1. **Explain the blocker clearly**
2. **List what you've tried**
3. **Suggest alternatives**
4. **Ask for guidance**

## Remember

- **This is an educational project** - clarity over performance
- **Decisions are already made** - follow them unless user changes course
- **Documentation is critical** - future you will need it
- **When in doubt, ask** - don't guess

---

**Key Takeaway:** Your job is to implement the already-designed system correctly, document your work thoroughly, and maintain plan adherence. You're not redesigning the architecture—you're executing a carefully planned refactoring.
