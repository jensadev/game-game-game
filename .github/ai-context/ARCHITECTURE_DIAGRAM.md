# Architecture Diagram

Visual representation of the Entity-Component system architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Game Engine                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  GameBase  │  │   Main.js  │  │  PlatformerGame      │  │
│  │ (Abstract) │←─┤ Game Loop  │←─┤  (Concrete Game)     │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Manages
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Systems (Composition)                │
│  ┌──────────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │ InputHandler │  │   Camera  │  │  CollisionManager   │  │
│  │   (System)   │  │ (System)  │  │      (System)       │  │
│  └──────────────┘  └───────────┘  └─────────────────────┘  │
│  ┌──────────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │   EventBus   │  │ Resources │  │   DebugRenderer     │  │
│  │   (System)   │  │  Manager  │  │      (System)       │  │
│  └──────────────┘  └───────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Creates/Manages
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Entities                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Player  │  │  Enemy   │  │   Coin   │  │ Platform │   │
│  │ (Entity) │  │ (Entity) │  │ (Entity) │  │ (Entity) │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
└───────┼─────────────┼──────────────┼─────────────┼──────────┘
        │             │              │             │
        │ Has         │ Has          │ Has         │ Has
        ▼             ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                        Components                            │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Transform │  │  Sprite  │  │ Collider │  │ Physics  │  │
│  │ Position  │  │ Render   │  │ Hitbox   │  │ Gravity  │  │
│  │ Velocity  │  │ Image    │  │ AABB     │  │ Friction │  │
│  │  Scale    │  │  Flip    │  │  Layer   │  │ Forces   │  │
│  └───────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌───────────┐  ┌──────────────────────────────────────┐  │
│  │ Animator  │  │       EntityState (Optional)         │  │
│  │ Frames    │  │   ┌──────┐  ┌─────┐  ┌──────────┐   │  │
│  │ Timing    │  │   │ Idle │  │ Run │  │ Jumping  │   │  │
│  │ Loop      │  │   └──────┘  └─────┘  └──────────┘   │  │
│  └───────────┘  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Entity-Component Relationship

```
┌─────────────────────────────────────────────┐
│                  Entity                      │
│  ┌────────────────────────────────────┐     │
│  │  Core Properties                    │     │
│  │  - game (reference)                 │     │
│  │  - components (Map)                 │     │
│  │  - markedForDeletion (bool)         │     │
│  └────────────────────────────────────┘     │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │  Component Management               │     │
│  │  - addComponent(name, component)    │     │
│  │  - getComponent(name)               │     │
│  │  - hasComponent(name)               │     │
│  │  - removeComponent(name)            │     │
│  └────────────────────────────────────┘     │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │  Lifecycle                          │     │
│  │  - update(deltaTime)                │     │
│  │  - draw(ctx, camera)                │     │
│  └────────────────────────────────────┘     │
└──────────────────┬───────────────────────────┘
                   │
                   │ Contains
                   ▼
┌──────────────────────────────────────────────┐
│              Components Map                   │
│                                              │
│  'transform'  → Transform Component          │
│  'sprite'     → Sprite Component             │
│  'collider'   → Collider Component           │
│  'physics'    → Physics Component            │
│  'animator'   → Animator Component           │
│                                              │
│  Each component has:                         │
│  - entity (reference back)                   │
│  - enabled (bool)                            │
│  - update(deltaTime)                         │
│  - draw(ctx, camera)                         │
│  - onAttach() / onDetach()                   │
└──────────────────────────────────────────────┘
```

## Player Entity Example

```
┌────────────────────────────────────────────────────┐
│              Player (extends Entity)               │
├────────────────────────────────────────────────────┤
│ Components:                                        │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ Transform                                 │    │
│  │ - position: Vector2(100, 200)            │    │
│  │ - velocity: Vector2(0, 0)                │    │
│  │ - scale: Vector2(1, 1)                   │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ Sprite                                    │    │
│  │ - resourceKey: 'player_idle'             │    │
│  │ - width: 32, height: 32                  │    │
│  │ - flipX: false                           │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ Collider (SMALLER than sprite!)          │    │
│  │ - width: 28, height: 45                  │    │
│  │ - offset: Vector2(2, 3)                  │    │
│  │ - layer: 'player'                        │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ Physics                                   │    │
│  │ - useGravity: true                       │    │
│  │ - isGrounded: false                      │    │
│  │ - friction: 0.00015                      │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ Animator                                  │    │
│  │ - animations: Map {                      │    │
│  │     'idle' → {frameCount: 11, ...}       │    │
│  │     'run' → {frameCount: 12, ...}        │    │
│  │     'jump' → {frameCount: 1, ...}        │    │
│  │   }                                       │    │
│  │ - currentAnimation: 'idle'               │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
├────────────────────────────────────────────────────┤
│ Player-Specific Properties:                       │
│ - moveSpeed: 0.3                                  │
│ - jumpPower: -0.6                                 │
│ - health: 3                                       │
│ - invulnerable: false                             │
│ - stateMachine: StateMachine                      │
├────────────────────────────────────────────────────┤
│ Player-Specific Methods:                          │
│ - handleInput(deltaTime)     ← Reads InputHandler │
│ - jump()                                          │
│ - shoot()                                         │
│ - takeDamage(amount)                              │
│ - updateAnimation()          ← Changes animator   │
└────────────────────────────────────────────────────┘
```

## State Machine Integration

```
┌─────────────────────────────────────────────┐
│            Player Entity                     │
│  Has: StateMachine                          │
└──────────────────┬──────────────────────────┘
                   │
                   │ Manages
                   ▼
┌─────────────────────────────────────────────┐
│          StateMachine                       │
│  - currentState: EntityState                │
│  - states: Map<string, EntityState>         │
│  - setState(name)                           │
│  - update(deltaTime)                        │
└──────────────────┬──────────────────────────┘
                   │
                   │ Contains
                   ▼
┌─────────────────────────────────────────────┐
│      EntityState (Base Class)               │
│  - entity (reference)                       │
│  - stateMachine (reference)                 │
│  - enter() / exit() / update()              │
└──────────────────┬──────────────────────────┘
                   │
                   │ Concrete States
                   ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│IdleState │  │RunState  │  │JumpState │  │FallState │
│          │  │          │  │          │  │          │
│Controls: │  │Controls: │  │Controls: │  │Controls: │
│'idle'    │  │'run'     │  │'jump'    │  │'fall'    │
│animation │  │animation │  │animation │  │animation │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

## Collision System Flow

```
┌─────────────────────────────────────────────────┐
│         Game Loop (PlatformerGame)              │
│  1. Update entities                             │
│  2. Update systems                              │
│  3. Check collisions ← CollisionManager         │
│  4. Render                                      │
└──────────────────┬──────────────────────────────┘
                   │
                   │ Step 3: Collision
                   ▼
┌─────────────────────────────────────────────────┐
│         CollisionManager.checkCollisions()      │
│                                                 │
│  For each entity with 'collider' component:     │
│    ┌─────────────────────────────────────┐     │
│    │ 1. Get Collider component           │     │
│    │ 2. Check against other entities     │     │
│    │ 3. If intersects:                   │     │
│    │    - Calculate collision data       │     │
│    │    - Resolve collision              │     │
│    │    - Emit collision event           │     │
│    └─────────────────────────────────────┘     │
│                                                 │
│  Entities DON'T check collisions themselves!    │
└─────────────────────────────────────────────────┘
```

## Data Flow

```
Input → Player.handleInput() → Transform.velocity changes
                                        ↓
                            StateMachine reacts to velocity
                                        ↓
                            State.update() changes animation
                                        ↓
                            Animator.play('animation_name')
                                        ↓
                            Animator.update() advances frames
                                        ↓
                            Animator.draw() renders sprite
```

## Component Dependencies

```
Entity (Required)
  └─ Transform (Always required)
       └─ Sprite (For visual entities)
            └─ Animator (For animated sprites)
       └─ Collider (For collidable entities)
            └─ Physics (Usually paired with Collider)

StateMachine (Optional)
  └─ EntityState subclasses
       └─ Access Animator via entity.getComponent('animator')
```

## Key Principles Visualized

### ❌ Old Way (GameObject)
```
Player ──┬── Physics code (duplicated)
         ├── Collision code (duplicated)
         ├── Animation code (duplicated)
         └── Rendering code (duplicated)

Enemy  ──┬── Physics code (duplicated) ← Same as Player!
         ├── Collision code (duplicated) ← Same as Player!
         ├── Animation code (different)
         └── Rendering code (duplicated)
```

### ✅ New Way (Entity-Component)
```
Player ──┬── Transform (shared component)
         ├── Physics (shared component)
         ├── Collider (shared component)
         ├── Animator (shared component)
         └── Sprite (shared component)

Enemy  ──┬── Transform (shared component) ← Same code!
         ├── Physics (shared component) ← Same code!
         ├── Collider (shared component) ← Same code!
         ├── Animator (shared component) ← Same code!
         └── Sprite (shared component) ← Same code!

Only Player/Enemy-specific logic differs!
```

## Memory Layout (Conceptual)

```
Game
  ├─ systems: {
  │    inputHandler: InputHandler
  │    camera: Camera
  │    collisionManager: CollisionManager
  │    eventBus: EventBus
  │    resources: ResourceManager
  │  }
  │
  └─ entities: [
       Player {
         components: Map {
           'transform' → Transform {},
           'sprite' → Sprite {},
           'collider' → Collider {},
           'physics' → Physics {},
           'animator' → Animator {}
         }
       },
       Enemy {
         components: Map {
           'transform' → Transform {},
           'sprite' → Sprite {},
           'collider' → Collider {},
           'physics' → Physics {},
           'animator' → Animator {}
         }
       },
       Platform {
         components: Map {
           'transform' → Transform {},
           'sprite' → Sprite {},
           'collider' → Collider {}
           // No physics component - static object
         }
       }
     ]
```

---

**Last Updated:** 2026-01-21
