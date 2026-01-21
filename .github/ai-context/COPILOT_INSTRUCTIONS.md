# AI Context Instructions for Game Engine

This document provides comprehensive context for AI assistants (GitHub Copilot, etc.) working on this educational game engine codebase.

## Project Overview

**game-game-game** is an educational, beginner-focused platformer game engine built with vanilla JavaScript and HTML5 Canvas. The primary goal is to teach object-oriented programming concepts, game development patterns, and JavaScript best practices through a progressive, step-by-step tutorial system.

### Key Characteristics
- **Educational First**: Designed for students learning programming and game development
- **Progressive Complexity**: 16-step tutorial building from basic movement to complete game
- **Vanilla JavaScript**: No external frameworks, pure ES6+ modules
- **OOP-focused**: Demonstrates inheritance, abstraction, composition, and design patterns
- **Production Quality**: Real game feel with sprites, animation, audio, save system

## Architecture Overview

### Design Philosophy

The engine follows a **clear separation of concerns** with abstract base classes providing structure and concrete implementations providing behavior. This architectural approach teaches students:

1. **Why abstraction matters** - GameBase/GameObject provide reusable foundations
2. **How inheritance works** - Concrete classes extend and specialize base behavior  
3. **When to use composition** - Systems (Camera, InputHandler) are composed into games
4. **Pattern recognition** - Common game dev patterns (object pooling, state machines)

### Core Architectural Patterns

#### 1. Abstract Base Class Pattern
```javascript
// Abstract base defines contract
class GameBase {
    // Template method - calls abstract methods
    init() { /* orchestration */ }
    
    // Abstract methods - must implement
    createGameObjects() { throw new Error('Must implement') }
}

// Concrete class provides implementation
class PlatformerGame extends GameBase {
    createGameObjects() { /* specific logic */ }
}
```

**Purpose**: Allows multiple game types (platformer, space shooter, etc.) to share common infrastructure while implementing game-specific logic.

#### 2. GameObject System
All visual game entities extend `GameObject` base class:
- Provides: position, size, sprite animation, markedForDeletion
- Requires: update(deltaTime), draw(ctx, camera)
- Benefits: Consistent interface, shared animation system, safe removal

#### 3. Separation of Concerns (Critical Refactoring - Step 5)
**Before Step 5**: Game class handled ALL collision response
```javascript
// Anti-pattern - Game knows too much
game.update() {
    if (collision(player, platform)) {
        player.y = platform.y - player.height // Game modifies player
    }
}
```

**After Step 5**: Each entity owns its response
```javascript
// Good pattern - Entity encapsulation
game.update() {
    const collision = detectCollision(player, platform)
    if (collision) {
        player.handlePlatformCollision(platform, collision) // Player decides
    }
}
```

**Why This Matters**: Students learn that **detection** (game responsibility) and **response** (entity responsibility) should be separated. This is a fundamental lesson in good OOP design.

#### 4. markedForDeletion Pattern
Safe object removal during iteration:
```javascript
// Mark phase
if (coin.collected) {
    coin.markedForDeletion = true
}

// Filter phase (after iteration complete)
this.coins = this.coins.filter(coin => !coin.markedForDeletion)
```

**Why**: Prevents index-shifting bugs when removing during iteration. Industry-standard pattern.

#### 5. Level System (Data-Driven Design)
```javascript
// Abstract Level class
class Level {
    init() {
        this.createPlatforms()  // Abstract
        this.createCoins()      // Abstract
        this.createEnemies()    // Abstract
    }
}

// Concrete level with data
class Level1 extends Level {
    createPlatforms() {
        return [
            new Platform(this.game, 0, 400, 200, 20),
            // ... level layout data
        ]
    }
}
```

**Benefits**: 
- Separates game logic from level data
- Easy to add new levels
- Could load from JSON in future

#### 6. State Machine Pattern
Game states: `MENU`, `PLAYING`, `GAME_OVER`, `WIN`
```javascript
update(deltaTime) {
    if (this.state === this.states.PLAYING) {
        // Update game objects
    }
}
```

Menu system also uses state pattern for screen transitions.

## Folder Structure

```
src/
├── main.js                      # Entry point, game loop setup
│
├── core/                        # Core engine abstractions
│   ├── GameBase.js             # Abstract base for all games
│   └── GameObject.js           # Abstract base for all entities
│
├── games/                       # Concrete game implementations
│   └── PlatformerGame.js       # Current platformer game
│
├── systems/                     # Reusable systems (composition)
│   ├── Camera.js               # Smooth following camera
│   ├── InputHandler.js         # Keyboard input management
│   ├── UserInterface.js        # HUD and game over/win screens
│   └── SaveGameManager.js      # localStorage wrapper
│
├── entities/                    # Game objects (inheritance from GameObject)
│   ├── Player.js               # Player character with controls
│   ├── Enemy.js                # Patrolling enemies with AI
│   ├── Platform.js             # Static platforms
│   ├── Coin.js                 # Collectible items
│   └── Projectile.js           # Player projectiles
│
├── background/                  # Visual background elements
│   ├── Background.js           # Parallax scrolling manager
│   └── BackgroundObject.js     # Individual scrolling layers
│
├── levels/                      # Level data and layouts
│   ├── Level.js                # Abstract level base
│   ├── Level1.js               # First level layout
│   └── Level2.js               # Second level layout
│
├── menus/                       # Menu system
│   ├── Menu.js                 # Abstract menu base
│   ├── MainMenu.js             # Main game menu
│   └── ControlsMenu.js         # Controls screen
│
├── css/                         # Stylesheets
│   ├── _reset.css              # CSS reset
│   └── style.css               # Main styles
│
└── assets/                      # Images, sounds, sprites
    ├── Pixel Adventure 1/      # Sprite sheets
    ├── sounds/                 # Audio files
    └── clouds/                 # Background images
```

### Folder Purpose Guide

- **core/**: Engine fundamentals - only modify if changing engine behavior
- **systems/**: Standalone utilities - can be reused in any game type
- **entities/**: Things that exist in the game world - inherits from GameObject
- **games/**: Complete game implementations - orchestrates all pieces
- **levels/**: Level layouts and data - data-driven design
- **background/**: Visual elements - parallax and decorative objects

## Teaching Progression (16 Steps)

The codebase is designed to support a 16-step tutorial (documented in `docs/`):

### Phase 1: Fundamentals (Steps 1-4)
1. **Player Movement** - deltaTime, input handling, velocity
2. **Collision Detection** - AABB algorithm, collision response
3. **Physics** - Gravity, jumping, platform collisions
4. **Collectibles** - Game state, object removal, UI updates

### Phase 2: Game Mechanics (Steps 5-8)
5. **Enemies** - AI, patrolling, damage system, **separation of concerns refactoring**
6. **Game States** - State machine, menu integration
7. **Camera** - Smooth following, world bounds, screen space vs world space
8. **Projectiles** - Shooting, cooldowns, projectile physics

### Phase 3: Architecture (Steps 9-14, 16)
9. **GameBase** - Abstract classes, template method pattern, **engine refactoring**
10. **Levels** - Data-driven design, level system, reusability
11. **Sprites** - Animation system, sprite sheets, frame timing
12. **Backgrounds** - Parallax scrolling, tiling backgrounds
13. **Menus** - Menu system, navigation, state integration
14. **Audio** - Web Audio API, sound effects, audio management
16. **Save Game** - localStorage, game persistence

**Note**: Step 15 is currently missing (gap in tutorial sequence).

### Critical Learning Moments

**Step 5 (Enemies)**: First major refactoring - teaches why separation of concerns matters
**Step 9 (GameBase)**: Second major refactoring - teaches abstraction and code reuse

These refactoring steps are INTENTIONAL - students learn that good code often requires restructuring as complexity grows.

## Coding Conventions

### Naming Conventions
- **Classes**: PascalCase (`PlatformerGame`, `GameObject`)
- **Files**: Match class name (`PlatformerGame.js`)
- **Variables/Methods**: camelCase (`playerSpeed`, `handleCollision`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SPEED`, `GRAVITY`)
- **Private-ish**: Prefix with underscore if truly internal (`_calculateDamage`)

### Code Style
- **Imports**: ES6 modules, relative paths
- **Comments**: Swedish for tutorial, English for code documentation acceptable
- **Class structure**: Constructor → properties → methods → helper methods
- **Method order**: Lifecycle (update, draw) → public → private

### Swedish Language Notes
- Documentation in `docs/` is in Swedish (target audience)
- Code comments mix Swedish/English
- Test questions: "testfrågor"
- Assignments: "uppgifter"
- Variable names generally English (industry standard)

## Common Patterns in Codebase

### 1. Options Object Pattern
```javascript
constructor(game, x, y, options = {}) {
    this.width = options.width || 64
    this.height = options.height || 64
    this.speed = options.speed || 0.5
}
```
**Why**: Flexible construction without parameter explosion.

### 2. Game Reference Pattern
```javascript
class Entity {
    constructor(game, ...) {
        this.game = game  // Every entity holds game reference
    }
    
    update(deltaTime) {
        // Can access game.gravity, game.camera, etc.
        this.velocityY += this.game.gravity * deltaTime
    }
}
```
**Why**: Entities can access game systems and settings without tight coupling.

### 3. DeltaTime Pattern
```javascript
update(deltaTime) {
    // Movement independent of framerate
    this.x += this.velocityX * deltaTime
}
```
**Why**: Consistent behavior regardless of FPS. Critical for smooth gameplay.

### 4. Camera Transform Pattern
```javascript
draw(ctx, camera) {
    const screenX = this.x - camera.x  // World to screen space
    const screenY = this.y - camera.y
    ctx.fillRect(screenX, screenY, this.width, this.height)
}
```
**Why**: Separates world coordinates from screen coordinates for scrolling.

### 5. Sprite Animation Pattern
```javascript
this.sprites = {
    idle: { image: idleImg, frameCount: 11, frameTime: 100 },
    run: { image: runImg, frameCount: 12, frameTime: 80 }
}
this.currentSprite = 'idle'
this.frameIndex = 0
this.frameTimer = 0
```
GameObject base class handles frame advancement automatically.

## Key Design Decisions

### Why Vanilla JavaScript?
- **Educational clarity**: No framework magic to confuse beginners
- **Transferable skills**: Concepts apply to any framework/language
- **Low barrier to entry**: Just browser, no build tools (Vite optional)

### Why Abstract Classes?
- **Teaches OOP fundamentals**: Abstraction, inheritance, polymorphism
- **Enforces structure**: Students can't skip important methods
- **Real-world pattern**: Common in game engines (Unity, Unreal)

### Why No External Libraries?
- **Complete understanding**: Students see how everything works
- **Lightweight**: Easy to host, share, modify
- **Self-contained**: No dependency hell

### Why HTML5 Canvas?
- **Direct pixel control**: Learn graphics fundamentals
- **Immediate visual feedback**: See results instantly
- **Game-appropriate**: Right tool for 2D games

## Working with This Codebase

### Adding New Features

**New Entity (e.g., PowerUp)**:
1. Create `src/entities/PowerUp.js`
2. Extend GameObject
3. Implement `update(deltaTime)` and `draw(ctx, camera)`
4. Add to level's `createPowerUps()` method
5. Handle collision in `PlatformerGame.handleCollisions()`

**New Game Type (e.g., SpaceShooter)**:
1. Create `src/games/SpaceShooterGame.js`
2. Extend GameBase
3. Implement abstract methods: `init()`, `createGameObjects()`, etc.
4. Update `main.js` to instantiate new game
5. Create corresponding levels in `src/levels/`

**New System (e.g., ParticleSystem)**:
1. Create `src/systems/ParticleSystem.js`
2. Standalone class, no inheritance needed
3. Add to GameBase constructor: `this.particles = new ParticleSystem()`
4. Update in GameBase: `this.particles.update(deltaTime)`
5. Draw in GameBase: `this.particles.draw(ctx)`

### Refactoring Guidelines

**When refactoring**, maintain the teaching progression:
- Keep early concepts simple
- Document WHY changes are made (pedagogical value)
- Consider impact on tutorial docs
- Preserve the "aha!" moments (like Step 5 and Step 9)

**Don't optimize away learning opportunities**:
- Sometimes "better" code is harder to understand
- Verbose can be better than clever for teaching
- Comments explaining trade-offs are valuable

### Testing Strategy

**Manual testing checklist**:
- [ ] Game loads without console errors
- [ ] Player movement (WASD/Arrows)
- [ ] Jumping and gravity work
- [ ] Platform collisions work
- [ ] Coins collectible, UI updates
- [ ] Enemies patrol and damage player
- [ ] Projectiles fire and hit enemies
- [ ] Camera follows player smoothly
- [ ] Game over/win states trigger
- [ ] Menu navigation works
- [ ] Save/load persists correctly
- [ ] Sprites animate correctly

## Common Issues and Solutions

### Issue: Imports Not Found After Restructure
**Solution**: Remember relative paths change based on file location
- From `src/main.js`: `'./games/PlatformerGame.js'`
- From `src/games/PlatformerGame.js`: `'../core/GameBase.js'`
- From `src/entities/Player.js`: `'../core/GameObject.js'`

### Issue: Sprites Not Loading
**Solution**: Asset imports are relative to the importing file
- From `src/entities/Player.js`: `'../assets/...'`
- Vite handles asset bundling automatically

### Issue: GameObject Methods Not Available
**Solution**: Ensure proper inheritance chain
```javascript
class Enemy extends GameObject {  // Must extend
    constructor(game, x, y) {
        super(game, x, y, width, height)  // Must call super
    }
}
```

### Issue: DeltaTime Too Large on First Frame
**Solution**: Already handled in main.js
```javascript
if (lastTime === 0) lastTime = timeStamp
const cappedDeltaTime = Math.min(deltaTime, 100)
```

### Issue: Collision Detection Misses Fast Objects
**Solution**: Implement swept collision or cap velocities
```javascript
// Cap maximum velocity
this.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, this.velocityX))
```

## Future Improvements

### Short-term
- [ ] Complete missing Step 15 documentation
- [ ] Finish docs/07-camera.md (currently incomplete)
- [ ] Add README.md in each src/ subfolder explaining purpose
- [ ] Create visual architecture diagrams
- [ ] Add JSDoc comments to all classes

### Medium-term
- [ ] Touch/mobile input support
- [ ] Gamepad support
- [ ] Loading screen for assets
- [ ] Error boundary for failed asset loads
- [ ] Multiple save slots
- [ ] Level editor tool

### Long-term
- [ ] Additional game types (SpaceShooterGame, TopDownGame)
- [ ] Particle system
- [ ] Tile-based level system
- [ ] JSON level loading
- [ ] Physics engine integration option
- [ ] WebGL renderer option

## Contributing Guidelines

When contributing:

1. **Maintain educational focus** - Will beginners understand this?
2. **Document WHY, not just WHAT** - Explain design decisions
3. **Keep it vanilla** - No external dependencies without strong justification
4. **Test manually** - Run through the full game to verify
5. **Update docs if needed** - Keep tutorial in sync with code
6. **Consider tutorial impact** - Changes affect 16-step progression
7. **Preserve patterns** - markedForDeletion, options objects, etc.
8. **Comment in context** - Swedish for tutorials, English for code

## Resources and References

### Game Development Patterns
- **Game Programming Patterns** by Robert Nystrom (free online)
- **Entity Component System** (not used here, but good to know)
- **Update/Draw Loop** (implemented in main.js)

### Canvas API
- MDN: Canvas API documentation
- HTML5 Canvas tutorials
- RequestAnimationFrame timing

### JavaScript Best Practices
- ES6 Modules and imports
- Class syntax and inheritance
- Async/Await for asset loading (future improvement)

## Project History

This engine evolved through teaching game development to beginners. Key architectural decisions (GameBase abstraction, GameObject system, separation of concerns) emerged from observing student struggles and confusion.

**Original structure**: Flat file structure, single game file
**First refactor** (Step 5): Separated collision response into entities
**Second refactor** (Step 9): Extracted GameBase for reusability
**Third refactor** (Current): Organized into logical folders for clarity

Each refactor was driven by pedagogical needs - showing students how real code evolves as requirements grow.

## Contact and Support

This is an educational project. When working with this codebase:
- Prioritize learning outcomes over "best practices"
- Value clarity over cleverness
- Remember the target audience: beginners
- Keep it fun - games should be enjoyable to build!

---

**Last Updated**: January 2026  
**Current Version**: Restructured (folder organization phase)  
**Tutorial Status**: Steps 1-14, 16 complete (Step 15 missing)
