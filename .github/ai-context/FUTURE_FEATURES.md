# Future Features & Enhancements

**Status:** Planning/Reference Document  
**Last Updated:** 2026-01-21  
**Purpose:** Track features discussed but not yet implemented

---

## Phase 3: Object Pooling

**Priority:** Medium (implement when performance becomes an issue)  
**Estimated Effort:** 2-3 days  
**Status:** ⏸️ Deferred

### Description
Reduce garbage collection pressure by reusing projectile objects instead of creating/destroying them.

### Why
- Projectiles created/destroyed frequently
- Garbage collection can cause frame drops
- Object pooling is standard for bullets/projectiles

### Implementation Plan

**Files to Create:**
- `src/systems/ObjectPool.js` - Generic pool system

**Changes Required:**
- Modify `Projectile.js` to support reset() method
- Update `Player.js` to get projectiles from pool
- Update `PlatformerGame.js` to return projectiles to pool
- Modify `CollisionManager.js` to return instead of destroy

### Code Structure
```javascript
// src/systems/ObjectPool.js
class ObjectPool {
  constructor(createFunc, resetFunc, initialSize = 10) {
    this.pool = []
    this.active = new Set()
    this.createFunc = createFunc
    this.resetFunc = resetFunc
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFunc())
    }
  }
  
  get() {
    let obj = this.pool.pop()
    if (!obj) {
      obj = this.createFunc()
    }
    this.active.add(obj)
    return obj
  }
  
  release(obj) {
    if (this.active.has(obj)) {
      this.active.delete(obj)
      this.resetFunc(obj)
      this.pool.push(obj)
    }
  }
  
  clear() {
    this.pool = []
    this.active.clear()
  }
}
```

### Usage Example
```javascript
// In PlatformerGame.js
this.projectilePool = new ObjectPool(
  () => new Projectile(this, 0, 0, 0),  // Create
  (p) => p.reset(0, 0, 0)                // Reset
)

// When shooting
const projectile = this.projectilePool.get()
projectile.reset(player.x, player.y, direction)

// When collision detected
this.projectilePool.release(projectile)
```

### Testing Checklist
- [ ] Pool grows dynamically when needed
- [ ] Objects properly reset when released
- [ ] No memory leaks
- [ ] Performance improvement measurable

---

## Phase 4: JSON Level System

**Priority:** Medium (implement when level design becomes complex)  
**Estimated Effort:** 3-4 days  
**Status:** ⏸️ Deferred

### Description
Replace code-based levels with JSON definitions and entity factory system.

### Why
- Easier for designers to create levels
- Support for level editors
- Faster iteration
- Data-driven design

### Implementation Plan

**Files to Create:**
- `src/systems/LevelLoader.js` - Parse JSON and spawn entities
- `src/levels/data/level1.json` - Level 1 definition
- `src/levels/data/level2.json` - Level 2 definition
- `src/entities/EntityFactory.js` - Create entities from JSON data

**Changes Required:**
- Modify `Level.js` to use LevelLoader
- Update level classes to use JSON data
- Add entity type registry

### JSON Level Format
```json
{
  "version": 1,
  "width": 3200,
  "height": 600,
  "background": "Blue",
  "music": "level1.mp3",
  "entities": [
    {
      "type": "Platform",
      "x": 0,
      "y": 550,
      "width": 800,
      "height": 50,
      "properties": {
        "color": "#8B4513"
      }
    },
    {
      "type": "Enemy",
      "x": 400,
      "y": 500,
      "properties": {
        "patrolDistance": 200,
        "speed": 50
      }
    },
    {
      "type": "Coin",
      "x": 500,
      "y": 400,
      "properties": {
        "value": 10
      }
    }
  ],
  "checkpoints": [
    { "x": 800, "y": 550 },
    { "x": 1600, "y": 550 }
  ],
  "spawnPoint": { "x": 100, "y": 100 },
  "exitPoint": { "x": 3000, "y": 550 }
}
```

### LevelLoader Structure
```javascript
class LevelLoader {
  constructor(game, entityFactory) {
    this.game = game
    this.factory = entityFactory
  }
  
  async load(jsonPath) {
    const data = await fetch(jsonPath).then(r => r.json())
    
    return {
      width: data.width,
      height: data.height,
      background: data.background,
      entities: data.entities.map(e => this.factory.create(e)),
      spawnPoint: data.spawnPoint,
      exitPoint: data.exitPoint
    }
  }
}
```

### EntityFactory Structure
```javascript
class EntityFactory {
  constructor(game) {
    this.game = game
    this.registry = new Map()
    
    // Register entity types
    this.register('Platform', Platform)
    this.register('Enemy', Enemy)
    this.register('Coin', Coin)
  }
  
  register(type, entityClass) {
    this.registry.set(type, entityClass)
  }
  
  create(data) {
    const EntityClass = this.registry.get(data.type)
    if (!EntityClass) {
      throw new Error(`Unknown entity type: ${data.type}`)
    }
    
    return new EntityClass(
      this.game,
      data.x,
      data.y,
      data.width || 50,
      data.height || 50,
      data.properties
    )
  }
}
```

### Testing Checklist
- [ ] JSON loads correctly
- [ ] All entity types spawn
- [ ] Properties apply correctly
- [ ] Backwards compatible with code-based levels
- [ ] Level editor integration possible

---

## Phase 5: Polish & Performance

**Priority:** Low (nice-to-have improvements)  
**Estimated Effort:** 2-3 days  
**Status:** ⏸️ Deferred

### 5.1 Loading Screen

**Description:** Show progress bar while loading assets

**Files to Create:**
- `src/systems/LoadingScreen.js`
- `assets/manifest.json` (asset list)

**Implementation:**
```javascript
class LoadingScreen {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.progress = 0
  }
  
  show() {
    this.visible = true
    this.draw()
  }
  
  hide() {
    this.visible = false
  }
  
  setProgress(loaded, total) {
    this.progress = loaded / total
    if (this.visible) this.draw()
  }
  
  draw() {
    const ctx = this.ctx
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Progress bar
    const barWidth = 400
    const barHeight = 30
    const x = (this.canvas.width - barWidth) / 2
    const y = this.canvas.height / 2
    
    ctx.strokeStyle = '#fff'
    ctx.strokeRect(x, y, barWidth, barHeight)
    
    ctx.fillStyle = '#4CAF50'
    ctx.fillRect(x, y, barWidth * this.progress, barHeight)
    
    // Text
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Loading...', this.canvas.width / 2, y - 20)
    ctx.fillText(`${Math.floor(this.progress * 100)}%`, this.canvas.width / 2, y + barHeight + 30)
  }
}
```

### 5.2 Enhanced Debug Mode

**Description:** Add performance graphs and entity inspector

**Enhancements to DebugRenderer:**
- FPS graph (last 60 frames)
- Memory usage graph
- Entity count display
- Component list for selected entity
- Collision shape visualization

**Keys:**
- `F3` - Toggle debug overlay (existing)
- `F4` - Toggle performance graphs
- Click entity - Inspect components

### 5.3 Sprite Scaling

**Description:** Support sprite scaling (2x, 0.5x, etc.)

**Changes:**
- Add `scale` property to Sprite component
- Update draw() methods to apply scaling
- Support flipX/flipY with scaling

### 5.4 Performance Optimizations

**Targets:**
- Spatial partitioning for collision detection
- Cull entities outside camera view
- Batch similar draw calls
- Optimize particle systems

---

## Advanced Features (Discussed)

### Cinematic Camera Mode

**Priority:** Low  
**Status:** Planned (comment in Camera.js)

**Description:**
Camera follows predefined waypoints for cutscenes

**Implementation:**
```javascript
// In Camera.js (already has comment about future mode)
setCinematicPath(waypoints, duration) {
  this.mode = 'cinematic'
  this.waypoints = waypoints
  this.waypointIndex = 0
  this.cinematicDuration = duration
}

// In update()
if (this.mode === 'cinematic') {
  this._updateCinematicPath(deltaTime)
}
```

**Use Cases:**
- Level intro sequences
- Boss battle reveals
- Story cutscenes
- Zoom out to show level

### Gamepad Support

**Priority:** Low  
**Status:** Deferred until requested  
**Estimated Effort:** ~100 lines

**Description:**
Controller input for movement and actions

**Implementation:**
```javascript
// Add to InputHandler.js
class GamepadManager {
  constructor() {
    this.gamepads = {}
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepads[e.gamepad.index] = e.gamepad
    })
  }
  
  update() {
    const gp = navigator.getGamepads()[0]
    if (!gp) return null
    
    return {
      leftStick: { x: gp.axes[0], y: gp.axes[1] },
      rightStick: { x: gp.axes[2], y: gp.axes[3] },
      buttons: {
        jump: gp.buttons[0].pressed,      // A/X
        shoot: gp.buttons[1].pressed,     // B/Circle
        menu: gp.buttons[9].pressed       // Start
      }
    }
  }
}
```

**API:**
```javascript
const gamepad = inputHandler.getGamepad()
if (gamepad) {
  if (Math.abs(gamepad.leftStick.x) > 0.2) {
    physics.velocity.x = gamepad.leftStick.x * this.speed
  }
  if (gamepad.buttons.jump) {
    this.jump()
  }
}
```

### Multiple Save Slot UI

**Priority:** Low  
**Status:** SaveGameManager ready, needs UI

**Description:**
Menu system for managing 3 save slots

**Changes:**
- Add SaveSlotMenu.js
- Show slot info (level, time, score)
- Delete button per slot
- "New Game" vs "Continue"

**Already Implemented:**
SaveGameManager already supports unlimited slots with `save('slot_N', data)`

Just needs UI to expose it to players.

### Touch/Mobile Controls

**Priority:** Low  
**Status:** Not planned yet

**Description:**
On-screen buttons for mobile play

**Implementation:**
- Virtual D-pad for movement
- Jump button (right side)
- Shoot button (right side)
- Detect touch events
- Draw button overlays

### Particle System

**Priority:** Low  
**Status:** Not planned yet

**Description:**
Visual effects for actions

**Effects:**
- Coin sparkle on collection
- Explosion on enemy death
- Dust clouds when landing
- Trail behind projectiles

**Implementation:**
```javascript
class ParticleSystem extends Entity {
  constructor(game, x, y, config) {
    super(game, x, y, 0, 0)
    this.particles = []
    this.config = config
  }
  
  emit(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: random(-100, 100),
        vy: random(-200, -50),
        life: 1.0,
        color: this.config.color
      })
    }
  }
  
  update(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * deltaTime
      p.y += p.vy * deltaTime
      p.vy += 500 * deltaTime  // Gravity
      p.life -= deltaTime
      return p.life > 0
    })
  }
}
```

---

## Feature Request Template

When proposing new features, include:

### Feature Name

**Priority:** High / Medium / Low  
**Estimated Effort:** X days  
**Status:** Proposed / Planned / In Progress / Complete

**Description:**
What is it?

**Why:**
Why do we need it?

**Implementation Plan:**
- Files to create
- Files to modify
- Key code snippets

**Testing Checklist:**
- [ ] Item 1
- [ ] Item 2

**Dependencies:**
What needs to be done first?

**Risks:**
What could go wrong?

---

## Notes

All future features are **documented and tracked** here. Nothing is forgotten!

When ready to implement a feature:
1. Move it from "Deferred" to "In Progress"
2. Create detailed plan in separate doc if complex
3. Update this document when complete
4. Add to session summary

**Last Review:** 2026-01-21 (Session 3)
