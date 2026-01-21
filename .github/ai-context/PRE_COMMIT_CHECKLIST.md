# Pre-Commit Checklist

**Use this before every commit to ensure quality and consistency.**

## Code Quality

- [ ] Code runs without errors in browser (tested locally)
- [ ] No console errors or warnings
- [ ] No `debugger` statements left in code
- [ ] No commented-out code blocks (unless with explanation)
- [ ] All imports resolve correctly
- [ ] File paths use correct relative paths

## Architecture Compliance

- [ ] Using Entity, NOT GameObject
- [ ] Components added to entities (Transform, Sprite, Collider, Physics, Animator)
- [ ] Collider size separate from (and smaller than) sprite size
- [ ] No collision handling logic in Player/Enemy classes
- [ ] No input handling in State classes
- [ ] States control animation only
- [ ] Physics constants accessed via `this.game.gravity` / `this.game.friction`

## Code Conventions

- [ ] Classes use PascalCase (`PlayerEntity`, `Transform`)
- [ ] Files match class names (`PlayerEntity.js`)
- [ ] Variables/methods use camelCase (`moveSpeed`, `handleCollision`)
- [ ] Component keys in quotes (`'transform'`, `'sprite'`)
- [ ] Constants use UPPER_SNAKE_CASE (`MAX_SPEED`, `GRAVITY`)
- [ ] 4-space indentation (not tabs)
- [ ] No semicolons (project convention)

## Documentation

- [ ] Plan document updated with ✅ for completed steps
- [ ] "Context Sessions" log updated if starting/ending session
- [ ] "Design Decisions" table updated if deviated from plan
- [ ] "Deviations" table updated if changed approach
- [ ] Architecture doc updated if design changed
- [ ] Comments added for complex logic
- [ ] JSDoc added for public methods (if applicable)

## Commit Message

- [ ] Follows template format (see `.gitmessage`)
- [ ] References plan step number
- [ ] Brief description (50 chars or less)
- [ ] Detailed explanation in body
- [ ] Lists verification steps

## Testing

- [ ] Manual testing completed:
  - [ ] Feature works as expected
  - [ ] No regressions in existing features
  - [ ] Camera/rendering works correctly
  - [ ] Input handling works
  - [ ] Collision detection works (if applicable)
  - [ ] Animation plays correctly (if applicable)

## Phase-Specific Checks

### Phase 1: Foundation
- [ ] Vector2 operations tested (add, subtract, multiply, etc.)
- [ ] EventBus emit/subscribe works
- [ ] ResourceManager loads assets
- [ ] InputHandler tracks pressed/held/released states
- [ ] DebugRenderer visualizes hitboxes

### Phase 2: Component System
- [ ] Entity has all required components
- [ ] Components update in correct order
- [ ] Component lifecycle (onAttach/onDetach) works
- [ ] State machine transitions correctly
- [ ] States control correct animations

### Phase 3: Separation of Concerns
- [ ] CollisionManager handles all collision
- [ ] Entities don't check for collisions
- [ ] Event system used for decoupling
- [ ] Object pooling works correctly

### Phase 4: Level System
- [ ] Level JSON loads correctly
- [ ] Entity factory creates correct entities
- [ ] Level bounds respected

### Phase 5: Polish
- [ ] Loading screen displays
- [ ] Debug mode toggles correctly
- [ ] Performance is acceptable (60fps target)

## Before Pushing

- [ ] All files saved
- [ ] Commit message is clear and descriptive
- [ ] No sensitive information in code
- [ ] Branch is correct (not accidentally on main)
- [ ] Ready for potential code review

## Quick Reference: Common Issues

**Issue:** "Can't find module"
- Check import path (relative to importing file)
- Verify file exists
- Check file extension included

**Issue:** "Component is undefined"
- Added component to entity?
- Component name matches (case-sensitive)?
- Component class imported?

**Issue:** "Collision not working"
- Check CollisionManager, not entity
- Collider component added?
- Collider bounds correct size?

**Issue:** "Animation not playing"
- Animator component added?
- Animation added to animator?
- Animation name correct?
- State calling animator.play()?

---

**Remember:** It's better to catch issues now than debug them later!

**Last Updated:** 2026-01-21
