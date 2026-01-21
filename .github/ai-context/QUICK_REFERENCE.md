# Quick Reference Card

**Emergency cheat sheet for AI assistants - pin this in your mental workspace!**

## 🚦 Traffic Light System

### 🟢 GREEN - Always Do
- Read plan before starting
- Use Entity + Components (NOT GameObject)
- Centralize collision in CollisionManager
- States control animation ONLY
- Update docs after changes
- Commit with plan reference

### 🟡 YELLOW - Proceed with Caution
- Deviating from plan (document why!)
- Adding new component types
- Changing architecture design
- Refactoring working code
- Token usage 50%+ (monitor closely)

### 🔴 RED - STOP! Don't Do This
- Use GameObject class
- Add collision logic to entities
- Handle input in State classes
- Implement without reading docs
- Skip documentation updates
- Silent plan deviations
- Token usage 90%+ (handoff now!)

## 📚 Essential Reading Order

1. `.github/ai-context/README.md` (2 min)
2. `.github/ai-context/plans/002-component-architecture-refactor.md` - Progress section (3 min)
3. `.github/ai-context/AGENT_INSTRUCTIONS.md` - Before You Start (5 min)
4. `.github/ai-context/architecture/component-system-design.md` - Relevant section (5 min)

**Total: ~15 minutes to get oriented**

## 🎯 Component Checklist

Every entity needs:
```
✅ Transform - position, velocity
✅ Sprite - visual representation  
✅ Collider - hitbox (smaller than sprite!)
✅ Physics - gravity, friction (if moves)
✅ Animator - frame animation (if animated)
```

## 🏗️ Architecture Rules

```
Entity
  ├─ Has components (Transform, Sprite, etc.)
  ├─ Handles input (reads InputHandler)
  ├─ Entity-specific logic
  └─ Does NOT check collisions

Components
  ├─ Single responsibility
  ├─ Update themselves
  └─ Access entity via this.entity

States (Optional)
  ├─ Control animations
  ├─ Handle transitions
  └─ Do NOT read input

CollisionManager
  ├─ Detects collisions
  ├─ Resolves collisions
  └─ Emits collision events
```

## 📝 Before Every File Change

```
1. Is this in the current phase? ___
2. Does it match architecture? ___
3. Will I update plan after? ___
```

## 📝 Before Every Commit

```
1. Code runs without errors? ___
2. Architecture compliant? ___
3. Plan marked complete (✅)? ___
4. Commit references plan? ___
5. Pre-commit checklist done? ___
```

## 🔄 Every 5 Files Changed

```
1. Re-read current plan step
2. Verify still on track
3. Update progress markers
4. Check token usage
```

## 📊 Token Monitoring

| Usage | Status | Action |
|-------|--------|--------|
| 0-300K | 🟢 Safe | Work normally |
| 300-500K | 🟡 Monitor | Periodic updates |
| 500-700K | 🟠 Warning | Prepare handoff |
| 700-900K | 🔴 Alert | Start handoff |
| 900K+ | 🛑 STOP | Complete handoff NOW |

## 🆘 When Lost

1. **STOP** implementation
2. **READ** plan document completely
3. **VERIFY** with user
4. **RESUME** with confirmation

## 📋 Common Patterns

### Creating Entity
```javascript
class SomeEntity extends Entity {
    constructor(game, x, y) {
        super(game, x, y)
        this.addComponent('transform', new Transform(x, y))
        this.addComponent('sprite', new Sprite('key', w, h))
        this.addComponent('collider', new Collider(w-4, h-4, 2, 2))
        this.addComponent('physics', new Physics())
    }
}
```

### Adding State
```javascript
class SomeState extends EntityState {
    enter() {
        this.entity.getComponent('animator').play('anim')
    }
    update(deltaTime) {
        // Check conditions, change state
    }
}
```

### NO Collision in Entity!
```javascript
// ❌ WRONG
class Player {
    update() {
        if (this.intersects(platform)) { ... }
    }
}

// ✅ CORRECT
class CollisionManager {
    checkCollisions() {
        if (player.collider.intersects(platform.collider)) {
            this.resolveCollision(player, platform)
        }
    }
}
```

## 🎬 Session End Checklist

```
□ All changes committed
□ Plan updated with ✅
□ Session logged in plan
□ Decisions documented
□ Next steps clear
□ Token usage noted
□ Handoff ready (if switching)
```

## 🚀 Starting New Session

```
1. Copy NEW_CONTEXT_TEMPLATE.md
2. Read docs (15 min)
3. Report understanding
4. Get confirmation
5. Begin work
```

## 💡 Philosophy

```
Clarity > Cleverness
Documentation > Speed
Questions > Assumptions
Beginner-friendly > "Best practices"
```

## 📞 Quick Links

- Plan: `plans/002-component-architecture-refactor.md`
- Architecture: `architecture/component-system-design.md`
- Instructions: `AGENT_INSTRUCTIONS.md`
- Checklist: `PRE_COMMIT_CHECKLIST.md`
- Template: `SESSION_SUMMARY_TEMPLATE.md`

---

**Print this mentally and refer to it constantly!**

**Last Updated:** 2026-01-21
