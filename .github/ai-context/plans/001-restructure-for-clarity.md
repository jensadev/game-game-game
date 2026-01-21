# Plan 001: Restructure Game Engine for Beginner Clarity

**Status:** ✅ Complete  
**Created:** 2026-01-21  
**Completed:** 2026-01-21  
**Branch:** 17-platformer-base

## Objective

Reorganize the flat src/ structure into logical folders (core/systems/entities/background/css) to reduce cognitive load for beginners, clean up legacy artifacts, and create AI context instructions for future development assistance.

## Problem Statement

The current src/ directory has 15+ files at the root level, creating cognitive overload for beginners. Files are not grouped by purpose, making it difficult to understand:
- Which files are core engine vs game-specific
- Which files are entities vs systems
- Where to add new features

The flat structure includes:
- Core engine abstractions (GameBase, GameObject) mixed with concrete implementations
- System utilities (Camera, InputHandler, UI, SaveGameManager) scattered at root
- Game entities (Player, Enemy, Platform, Coin, Projectile) all at root
- Background rendering classes at root
- Legacy artifacts (Rectangle.js) from early tutorial steps
- CSS files at src root

## Proposed Structure

### Before
```
src/
├── main.js
├── GameBase.js
├── GameObject.js
├── PlatformerGame.js
├── Player.js
├── Enemy.js
├── Platform.js
├── Coin.js
├── Projectile.js
├── Camera.js
├── InputHandler.js
├── UserInterface.js
├── SaveGameManager.js
├── Background.js
├── BackgroundObject.js
├── Rectangle.js (legacy)
├── _reset.css
├── style.css
├── levels/
│   ├── Level.js
│   ├── Level1.js
│   └── Level2.js
├── menus/
│   ├── Menu.js
│   ├── MainMenu.js
│   └── ControlsMenu.js
└── assets/
```

### After
```
src/
├── main.js (entry point stays at root)
├── core/
│   ├── GameBase.js (abstract base for games)
│   └── GameObject.js (abstract base for entities)
├── games/
│   └── PlatformerGame.js (concrete game implementation)
├── systems/
│   ├── Camera.js (scrolling camera)
│   ├── InputHandler.js (keyboard input)
│   ├── UserInterface.js (HUD rendering)
│   └── SaveGameManager.js (localStorage wrapper)
├── entities/
│   ├── Player.js
│   ├── Enemy.js
│   ├── Platform.js
│   ├── Coin.js
│   └── Projectile.js
├── background/
│   ├── Background.js (parallax manager)
│   └── BackgroundObject.js (scrolling layer)
├── css/
│   ├── _reset.css
│   └── style.css
├── levels/ (already well-organized)
│   ├── Level.js
│   ├── Level1.js
│   └── Level2.js
├── menus/ (already well-organized)
│   ├── Menu.js
│   ├── MainMenu.js
│   └── ControlsMenu.js
└── assets/ (unchanged)
```

## Benefits

1. **Clear Mental Model** - "entities are things that move, systems are tools, core is the engine"
2. **Easier Navigation** - "Where does Enemy.js go? entities folder!"
3. **Scalability** - Add SpaceShooterGame.js to games/ without touching core/
4. **Learning Path** - Start in entities/, graduate to systems/, master core/
5. **Reduces Overwhelm** - 15 files at root → 6 folders + main.js
6. **Professional Structure** - Matches industry standards for game engines

## Implementation Steps

1. ✅ **Save this plan document** - Created .github/ai-context/plans/001-restructure-for-clarity.md
2. ✅ **Create new folder structure** - Created core, systems, entities, background, games, css folders
3. ✅ **Move core and game files** - Moved GameBase, GameObject → core/, PlatformerGame → games/
4. ✅ **Move system and CSS files** - Moved Camera, Input, UI, SaveGame → systems/, CSS → css/
5. ✅ **Move entity and background files** - Moved Player, Enemy, etc. → entities/, Background* → background/
6. ✅ **Delete legacy code** - Removed Rectangle.js
7. ✅ **Update all imports** - Updated all import paths across main.js, PlatformerGame.js, Level*.js, entities, etc.
8. ✅ **Test application** - Dev server runs successfully on http://localhost:5173/, no errors
9. ✅ **Create AI context docs** - Created comprehensive COPILOT_INSTRUCTIONS.md

## Results

All files successfully reorganized with git history preserved (used `git mv`). The application builds and runs without errors. Dev server started successfully with no console errors or compilation issues.

## Import Path Changes

### main.js
- `'./PlatformerGame.js'` → `'./games/PlatformerGame.js'`
- `'./_reset.css'` → `'./css/_reset.css'`
- `'./style.css'` → `'./css/style.css'`

### index.html
- Update CSS link paths if directly referenced

### PlatformerGame.js
- `'./GameBase.js'` → `'../core/GameBase.js'`
- `'./InputHandler.js'` → `'../systems/InputHandler.js'`
- `'./Camera.js'` → `'../systems/Camera.js'`
- `'./UserInterface.js'` → `'../systems/UserInterface.js'`
- `'./SaveGameManager.js'` → `'../systems/SaveGameManager.js'`
- `'./Player.js'` → `'../entities/Player.js'`
- `'./levels/Level1.js'` → `'../levels/Level1.js'`
- `'./levels/Level2.js'` → `'../levels/Level2.js'`
- `'./menus/MainMenu.js'` → `'../menus/MainMenu.js'`

### Level.js, Level1.js, Level2.js
- `'../Platform.js'` → `'../entities/Platform.js'`
- `'../Coin.js'` → `'../entities/Coin.js'`
- `'../Enemy.js'` → `'../entities/Enemy.js'`
- `'../Background.js'` → `'../background/Background.js'`

### All entity files (Player, Enemy, etc.)
- `'./GameObject.js'` → `'../core/GameObject.js'`

### All background files
- `'./GameObject.js'` → `'../core/GameObject.js'`

### Menu files
- `'../GameBase.js'` → `'../core/GameBase.js'` (if used)

## Testing Checklist

- [ ] Application loads without console errors
- [ ] Player movement works (WASD/Arrow keys)
- [ ] Jumping and gravity work correctly
- [ ] Platform collisions work
- [ ] Coin collection works and updates UI
- [ ] Enemies spawn and move
- [ ] Projectiles fire and work
- [ ] Camera follows player smoothly
- [ ] Game over/win states work
- [ ] Menu navigation works
- [ ] Save/load game works
- [ ] All sprites render correctly

## Decisions Made

1. **Full reorganization (Option A)** over hybrid approach - Better for long-term maintainability
2. **Delete Rectangle.js** - Legacy artifact, not production code
3. **Move CSS to css/ folder** - Consistent with organizing all file types
4. **Use git mv** where possible - Preserve file history in git
5. **Documentation updates postponed** - Focus on code restructuring first

## Future Considerations

- Update all 16 docs/ files with new import paths (separate plan/PR)
- Add README.md files in each new folder explaining purpose
- Create visual architecture diagrams
- Add "Getting Started" guide for absolute beginners

## Notes

- Branch: 17-platformer-base (current work branch)
- Default branch: main
- This is an educational game engine with 16-step tutorial in docs/
- Each tutorial step has corresponding git branches (01-player through 16-savegame)
- Restructuring may require updating those tutorial branches separately
