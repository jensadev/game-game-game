import GameBase from '../core/GameBase.js'
import Player from '../entities/Player.js'
import Projectile from '../entities/Projectile.js'
import Level1 from '../levels/Level1.js'
import Level2 from '../levels/Level2.js'
import MainMenu from '../menus/MainMenu.js'
import SaveGameManager from '../systems/SaveGameManager.js'
import CollisionManager from '../systems/CollisionManager.js'
import ResourceManager from '../systems/ResourceManager.js'
import ObjectPool from '../systems/ObjectPool.js'

/**
 * PlatformerGame - En konkret implementation av GameBase för plattformsspel
 * Innehåller plattformsspel-specifik logik som gravity, platforms, coins
 * Använder Level-system för att hantera olika nivåer
 */
export default class PlatformerGame extends GameBase {
    constructor(canvas, width, height) {
        super(canvas, width, height)
        
        // Plattformsspel behöver en större värld för sidoscrolling
        this.worldWidth = width * 3
        this.worldHeight = height
        this.camera.setWorldBounds(this.worldWidth, this.worldHeight)
        
        // Plattformsspel-specifik fysik
        this.gravity = 0.002 // pixels per millisekund^2
        this.maxGravity = 1.5 // max fall speed
        this.airResistance = 0.001 // horizontal air resistance (configurable)

        // Plattformsspel-specifik state
        this.coinsCollected = 0
        this.totalCoins = 0 // Sätts när vi skapar coins
        
        // Level management
        this.currentLevelIndex = 0
        this.levels = [Level1, Level2] // Array av level-klasser
        this.currentLevel = null
        
        // Plattformsspel-specifika arrays
        this.platforms = []
        this.coins = []
        this.projectiles = []
        
        // Background arrays (sätts av levels)
        this.backgrounds = []
        this.backgroundObjects = []
        
        // Systems
        this.saveManager = new SaveGameManager('platformer-save')
        this.resources = new ResourceManager()
        this.collisionManager = new CollisionManager(this)
        
        // Object pooling for projectiles
        this.projectilePool = new ObjectPool(
            () => new Projectile(this, 0, 0, 1),
            20,  // Initial size
            50   // Max size
        )
        
        // Setup event listeners
        this.setupEventListeners()
        
        // Initiera spelet
        this.init()
        
        // Skapa och visa huvudmenyn
        this.currentMenu = new MainMenu(this)
    }
    
    setupEventListeners() {
        this.eventBus.on('coin:collected', (data) => {
            this.score += data.value
            this.coinsCollected++
        })
        
        this.eventBus.on('player:damaged', (data) => {
            if (data.newHealth <= 0) {
                this.eventBus.emit('game:over', {
                    finalScore: this.score,
                    level: this.currentLevelIndex
                })
            }
        })
        
        this.eventBus.on('level:complete', (data) => {
            this.nextLevel()
        })
        
        this.eventBus.on('game:over', (data) => {
            this.gameState = 'GAME_OVER'
        })
    }
    
    init() {
        // Reset score
        this.score = 0
        this.coinsCollected = 0
        
        // Reset camera position
        this.camera.position.set(0, 0)
        this.camera.targetPosition.set(0, 0)

        // Load current level
        this.loadLevel(this.currentLevelIndex)
    }
    
    loadLevel(levelIndex) {
        // Säkerställ att level index är giltigt
        if (levelIndex < 0 || levelIndex >= this.levels.length) {
            console.error(`Level ${levelIndex} finns inte`)
            return
        }
        
        // Skapa ny level instance
        const LevelClass = this.levels[levelIndex]
        this.currentLevel = new LevelClass(this)
        
        // Hämta level data
        const levelData = this.currentLevel.getData()
        
        // Sätt level data
        this.platforms = levelData.platforms
        this.coins = levelData.coins
        this.enemies = levelData.enemies
        this.totalCoins = this.coins.length
        
        // Sätt background data
        this.backgrounds = levelData.backgrounds
        this.backgroundObjects = levelData.backgroundObjects
        
        // Återställ mynt-räknare för denna level
        this.coinsCollected = 0
        
        // Skapa player på level spawn position
        this.player = new Player(
            this, 
            levelData.playerSpawnX, 
            levelData.playerSpawnY, 
            50, 50, 'green'
        )
        
        // Reset projectiles and pool
        this.projectiles = []
        this.projectilePool.releaseAll()
        
        // Set camera to follow player
        this.camera.position.set(0, 0)
        this.camera.targetPosition.set(0, 0)
        this.camera.setTarget(this.player)
    }
    
    nextLevel() {
        this.currentLevelIndex++
        
        // Kolla om det finns fler levels
        if (this.currentLevelIndex >= this.levels.length) {
            // Inga fler levels - spelet är klart!
            this.gameState = 'WIN'
            return
        }
        
        // Ladda nästa level
        this.loadLevel(this.currentLevelIndex)
        this.gameState = 'PLAYING'
    }
    
    addProjectile(x, y, directionX) {
        // Try to get from pool
        const projectile = this.projectilePool.acquire()
        
        if (projectile) {
            // Initialize with new position and direction
            projectile.init(x, y, directionX)
            this.projectiles.push(projectile)
            console.log(`[Game] Projectile spawned at (${x}, ${y}). Total active: ${this.projectiles.length}`)
        } else {
            console.warn('Projectile pool exhausted - increase maxSize')
        }
    }
    
    restart() {
        this.currentLevelIndex = 0
        this.init()
        this.gameState = 'PLAYING'
        this.currentMenu = null
    }
    
    /**
     * Get serializable game state
     */
    getState() {
        return {
            version: 1,
            timestamp: Date.now(),
            level: this.currentLevelIndex,
            score: this.score,
            coinsCollected: this.coinsCollected,
            player: {
                x: this.player.x,
                y: this.player.y,
                health: this.player.health,
                maxHealth: this.player.maxHealth
            }
        }
    }
    
    /**
     * Restore from saved state
     */
    setState(state) {
        if (state.version !== 1) {
            console.warn('Save file version mismatch')
            return false
        }
        
        // Load level
        this.currentLevelIndex = state.level
        this.loadLevel(this.currentLevelIndex)
        
        // Restore progress
        this.score = state.score
        this.coinsCollected = state.coinsCollected
        
        // Restore player
        this.player.x = state.player.x
        this.player.y = state.player.y
        this.player.health = state.player.health
        this.player.maxHealth = state.player.maxHealth
        
        return true
    }
    
    /**
     * Save to slot (0-2)
     */
    saveGame(slot = 0) {
        if (!this.player) {
            console.warn('Cannot save: game not started')
            return false
        }
        
        const state = this.getState()
        return this.saveManager.save(`slot_${slot}`, state)
    }
    
    /**
     * Load from slot (0-2)
     */
    loadGame(slot = 0) {
        const state = this.saveManager.load(`slot_${slot}`)
        if (!state) {
            console.warn('No save data in slot', slot)
            return false
        }
        
        const success = this.setState(state)
        if (success) {
            this.gameState = 'PLAYING'
            this.currentMenu = null
            console.log('Game loaded from slot', slot)
        }
        return success
    }
    
    /**
     * Get all save slots info (for UI)
     */
    getSaveSlots() {
        return [0, 1, 2].map(slot => {
            const state = this.saveManager.load(`slot_${slot}`)
            if (!state) {
                return { slot, empty: true }
            }
            
            return {
                slot,
                empty: false,
                level: state.level + 1,  // Display as 1-indexed
                score: state.score,
                timestamp: new Date(state.timestamp).toLocaleString()
            }
        })
    }
    
    /**
     * Delete save slot
     */
    deleteSave(slot = 0) {
        this.saveManager.delete(`slot_${slot}`)
    }

    update(deltaTime) {
        // Handle menu updates
        if (this.gameState === 'MENU' && this.currentMenu) {
            this.currentMenu.update(deltaTime)
            this.inputHandler.update() // Clear input after menu processes it
            return
        }
        
        // Handle game-level input
        this.handleGameInput()
        
        // Only update game entities when playing
        if (this.gameState !== 'PLAYING') {
            this.inputHandler.update() // Clear input even when not playing
            return
        }
        
        // Phase 1: Check ground state BEFORE physics applies gravity
        this.collisionManager.updateGroundState()
        
        // Phase 2: Update all entities (physics uses correct isGrounded)
        this.updateEntities(deltaTime)
        
        // Phase 3: Resolve collisions and handle interactions
        this.collisionManager.resolveCollisions()
        
        // Update camera
        this.camera.update(deltaTime)
        
        // Check win/lose conditions
        this.checkGameConditions()
        
        // Clear frame-specific input sets at END of frame
        this.inputHandler.update()
    }
    
    /**
     * Handle game-level input (pause, save, debug, etc)
     */
    handleGameInput() {
        // Pause menu
        if (this.inputHandler.isKeyPressed('Escape') && this.gameState === 'PLAYING') {
            this.gameState = 'MENU'
            this.currentMenu = new MainMenu(this)
        }
        
        // Restart
        if (this.inputHandler.isKeyPressed('r') || this.inputHandler.isKeyPressed('R')) {
            if (this.gameState === 'GAME_OVER' || this.gameState === 'WIN') {
                this.restart()
            }
        }
        
        // Debug: Next level
        if (this.inputHandler.isKeyPressed('n') || this.inputHandler.isKeyPressed('N')) {
            this.currentLevelIndex = (this.currentLevelIndex + 1) % this.levels.length
            this.loadLevel(this.currentLevelIndex)
            this.gameState = 'PLAYING'
        }
        
        // Save game
        if ((this.inputHandler.isKeyPressed('s') || this.inputHandler.isKeyPressed('S')) && this.gameState === 'PLAYING') {
            this.saveGame(0)  // Default slot
        }
    }
    
    /**
     * Update all game entities
     */
    updateEntities(deltaTime) {
        // Backgrounds
        this.backgroundObjects.forEach(obj => obj.update(deltaTime))
        
        // Level entities
        this.platforms.forEach(platform => platform.update(deltaTime))
        this.coins.forEach(coin => coin.update(deltaTime))
        this.enemies.forEach(enemy => enemy.update(deltaTime))
        this.projectiles.forEach(projectile => projectile.update(deltaTime))
        
        // Player
        this.player.update(deltaTime)
        
        // Remove deleted entities
        this.coins = this.coins.filter(coin => !coin.markedForDeletion)
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion)
        
        // Return projectiles to pool before removing
        const projectilesToRemove = []
        this.projectiles.forEach(projectile => {
            if (projectile.markedForDeletion) {
                projectilesToRemove.push(projectile)
                this.projectilePool.release(projectile)
            }
        })
        this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion)
        
        if (projectilesToRemove.length > 0) {
            console.log(`Removed ${projectilesToRemove.length} projectiles. Active: ${this.projectiles.length}, Pool stats:`, this.projectilePool.getStats())
        }
        
        // World bounds for player
        this.player.x = Math.max(0, Math.min(this.player.x, this.worldWidth - this.player.width))
        
        // World bounds for enemies
        this.enemies.forEach(enemy => {
            enemy.handleScreenBounds(this.worldWidth)
        })
    }
    
    /**
     * Check win/lose conditions
     */
    checkGameConditions() {
        // Win - all coins collected
        if (this.coinsCollected === this.totalCoins && this.gameState === 'PLAYING') {
            this.eventBus.emit('level:complete', {
                levelIndex: this.currentLevelIndex,
                coinsCollected: this.coinsCollected,
                totalCoins: this.totalCoins
            })
        }
        
        // Note: Lose condition handled by player:damaged event
    }

    draw(ctx) {
        // Draw backgrounds FIRST (furthest back)
        this.backgrounds.forEach(bg => bg.draw(ctx, this.camera))
        
        // Draw background objects
        this.backgroundObjects.forEach(obj => {
            if (this.camera.isVisible(obj)) {
                obj.draw(ctx, this.camera)
            }
        })
        
        // Draw all platforms with camera offset
        this.platforms.forEach(platform => {
            if (this.camera.isVisible(platform)) {
                platform.draw(ctx, this.camera)
            }
        })
        
        // Draw coins with camera offset
        this.coins.forEach(coin => {
            if (this.camera.isVisible(coin)) {
                coin.draw(ctx, this.camera)
            }
        })
        
        // Draw enemies with camera offset
        this.enemies.forEach(enemy => {
            if (this.camera.isVisible(enemy)) {
                enemy.draw(ctx, this.camera)
            }
        })
        
        // Draw projectiles with camera offset
        this.projectiles.forEach(projectile => {
            if (this.camera.isVisible(projectile)) {
                projectile.draw(ctx, this.camera)
            }
        })
        
        // Draw player with camera offset
        this.player.draw(ctx, this.camera)
        
        // Draw UI last (without camera offset - always visible)
        this.ui.draw(ctx)
        
        // Draw menu on top if active
        if (this.currentMenu) {
            this.currentMenu.draw(ctx)
        }
    }
}