# TODO - Game Engine Improvements

## Code Quality

### Magic Numbers - Use Constants
**Priority:** Medium  
**Step:** Various (refactor existing code)

Replace magic numbers with named constants for better readability and maintainability.

**Example:**
```javascript
// ❌ Current
this.gravity = 0.001
this.shootCooldown = 300
this.invulnerableDuration = 1000

// ✅ Better
// Gravity in pixels/ms² - tuned for 60fps feel
const GRAVITY = 0.001

// Cooldowns in milliseconds
const SHOOT_COOLDOWN = 300 // ~3 shots per second
const INVULNERABLE_DURATION = 1000 // 1 second grace period

this.gravity = GRAVITY
this.shootCooldown = SHOOT_COOLDOWN
this.invulnerableDuration = INVULNERABLE_DURATION
```

**Files to update:**
- `src/PlatformerGame.js` (gravity, friction)
- `src/Player.js` (speeds, cooldowns, jump power)
- `src/Enemy.js` (patrol speeds, damage)
- `src/spaceshooter/` (all speed/timing values)

---

## Game States - Constants/Enum Pattern

**Priority:** High  
**Step:** 06-gamestates (refactor)

Replace string-based game states with constants for type safety and autocomplete.

**Implementation:**
```javascript
// GameStates.js
export const GAME_STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    WIN: 'WIN'
}

// Usage in GameBase.js
import { GAME_STATES } from './GameStates.js'

this.gameState = GAME_STATES.MENU
if (this.gameState === GAME_STATES.PLAYING) { ... }
```

**Benefits:**
- Autocomplete/IntelliSense support
- Catches typos at development time
- Centralized state definitions
- Easier to add new states

**Alternative (TypeScript-like):**
```javascript
// More restrictive - prevents invalid states
export const GAME_STATES = Object.freeze({
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    WIN: 'WIN'
})
```

---

## Input State Improvements

**Priority:** Medium  
**Step:** 01-player (enhance InputHandler)

Add better key state tracking to distinguish between "just pressed", "held", and "just released".

**Current Issue:**
- Menus use `lastKeys` hack to detect new presses
- No way to detect "key just pressed this frame"
- Can't distinguish tap vs hold

**Proposed Solution:**
```javascript
// InputHandler.js
export default class InputHandler {
    constructor(game) {
        this.game = game
        this.keys = new Set()           // Currently pressed
        this.justPressed = new Set()    // Pressed this frame
        this.justReleased = new Set()   // Released this frame
        
        window.addEventListener('keydown', (event) => {
            if (!this.keys.has(event.key)) {
                this.justPressed.add(event.key)
            }
            this.keys.add(event.key)
            event.preventDefault() // Prevent browser shortcuts
        })
        
        window.addEventListener('keyup', (event) => {
            this.keys.delete(event.key)
            this.justReleased.add(event.key)
        })
    }
    
    // Call at end of each frame
    clearFrameStates() {
        this.justPressed.clear()
        this.justReleased.clear()
    }
    
    // Helper methods
    isKeyDown(key) {
        return this.keys.has(key)
    }
    
    isKeyJustPressed(key) {
        return this.justPressed.has(key)
    }
    
    isKeyJustReleased(key) {
        return this.justReleased.has(key)
    }
}
```

**Usage in Menu:**
```javascript
// ✅ Clean menu navigation
if (this.game.inputHandler.isKeyJustPressed('ArrowDown')) {
    this.selectedIndex = (this.selectedIndex + 1) % this.options.length
}

// No more lastKeys tracking needed!
```

**Files to update:**
- `src/InputHandler.js` - Add new state tracking
- `src/menus/Menu.js` - Remove lastKeys hack
- `src/GameBase.js` or game update - Call `clearFrameStates()` each frame

---

## Camera Improvements

**Priority:** Low  
**Step:** 07-camera (enhancement)

Make camera behavior more explicit and configurable.

**Current Issue:**
- Camera follow logic has implicit assumptions
- Hard to understand different behaviors for different game types

**Proposed Enhancement:**
```javascript
// Camera.js
export default class Camera {
    constructor(x, y, width, height) {
        // ... existing code ...
        this.followMode = 'horizontal' // 'horizontal', 'vertical', 'both', 'fixed'
        this.smoothing = 0.1
    }
    
    setFollowMode(mode) {
        this.followMode = mode
    }
    
    followTarget(target, deltaTime) {
        switch(this.followMode) {
            case 'horizontal':
                // Platformer - only follow X
                this.targetX = target.x - this.width / 2
                break
                
            case 'vertical':
                // Vertical shooter - only follow Y
                this.targetY = target.y - this.height / 2
                break
                
            case 'both':
                // Follow both axes
                this.targetX = target.x - this.width / 2
                this.targetY = target.y - this.height / 2
                break
                
            case 'fixed':
                // Don't move (space shooter)
                break
        }
        
        // Apply smoothing...
    }
}
```

**Usage:**
```javascript
// PlatformerGame
this.camera.setFollowMode('horizontal')

// SpaceShooterGame
this.camera.setFollowMode('fixed')
```

**Benefits:**
- Explicit configuration over implicit behavior
- Easier to understand and modify
- Could add new modes easily (e.g., 'lookahead', 'zone-based')

---

## JSON-Based Level Format

**Priority:** Low (Advanced Feature)  
**Step:** 10-levels (alternative approach)

Create a data-driven level format for easier level creation.

**Current Approach:**
- Levels are JavaScript classes
- All entities created in code
- Flexible but requires programming knowledge

**Proposed Alternative:**
```json
// levels/level1.json
{
    "name": "Level 1",
    "playerSpawn": { "x": 50, "y": 50 },
    "platforms": [
        { "x": 0, "y": 740, "width": 800, "height": 60, "color": "#654321" },
        { "x": 150, "y": 640, "width": 150, "height": 20, "color": "#8B4513" }
    ],
    "enemies": [
        { "type": "patrol", "x": 300, "y": 680, "patrolDistance": 150 },
        { "type": "stationary", "x": 500, "y": 680 }
    ],
    "coins": [
        { "x": 200, "y": 620 },
        { "x": 250, "y": 620 }
    ]
}
```

**Level Loader:**
```javascript
// LevelLoader.js
export default class LevelLoader {
    static async loadFromJSON(game, jsonPath) {
        const response = await fetch(jsonPath)
        const data = await response.json()
        
        const platforms = data.platforms.map(p => 
            new Platform(game, p.x, p.y, p.width, p.height, p.color)
        )
        
        const enemies = data.enemies.map(e => 
            e.type === 'patrol' 
                ? new Enemy(game, e.x, e.y, 50, 50, e.patrolDistance)
                : new Enemy(game, e.x, e.y, 50, 50, null)
        )
        
        const coins = data.coins.map(c => new Coin(game, c.x, c.y))
        
        return {
            platforms,
            enemies,
            coins,
            playerSpawn: data.playerSpawn
        }
    }
}
```

**Pros:**
- Non-programmers can create levels
- Could build a visual level editor
- Easier to version control level data
- Separates data from logic

**Cons:**
- Less flexible (no procedural generation)
- Requires level loader complexity
- May not fit all use cases
- Loses educational value of coding levels

**Recommendation:**
- Keep current approach for main tutorial
- Offer JSON format as "Extra Credit" or advanced topic
- Could be a separate branch (10b-json-levels)
- Great project for students: "Build a level editor"

---

## Notes

- Items marked **High priority** should be done soon
- Items marked **Medium priority** are good improvements but not urgent
- Items marked **Low priority** are nice-to-haves or advanced features
- Consider doing these as separate branches/commits for educational clarity
