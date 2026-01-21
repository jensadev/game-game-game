/**
 * DebugRenderer - Simple debug visualization overlay
 * 
 * Features:
 * - Toggle with F3 key
 * - Show collision boxes for all game objects
 * - Display FPS counter
 * - Show entity count
 * - Display player position and velocity
 */
export default class DebugRenderer {
    constructor() {
        this.enabled = false
        this.fps = 0
        this.frameCount = 0
        this.lastFpsUpdate = 0
        
        // Listen for F3 key to toggle debug mode
        window.addEventListener('keydown', (event) => {
            if (event.key === 'F3') {
                event.preventDefault()
                this.enabled = !this.enabled
                console.log(`Debug mode: ${this.enabled ? 'ON' : 'OFF'}`)
            }
        })
    }
    
    /**
     * Update FPS counter
     * @param {number} timestamp - Current timestamp
     */
    update(timestamp) {
        this.frameCount++
        
        // Update FPS once per second
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount
            this.frameCount = 0
            this.lastFpsUpdate = timestamp
        }
    }
    
    /**
     * Render debug information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} game - Game instance with entities
     */
    render(ctx, game) {
        if (!this.enabled) return
        
        // Draw collision boxes for all entities
        this.drawCollisionBoxes(ctx, game)
        
        // Draw debug info overlay
        this.drawInfoOverlay(ctx, game)
    }
    
    /**
     * Draw collision boxes for all game objects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} game - Game instance
     */
    drawCollisionBoxes(ctx, game) {
        ctx.save()
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        
        // Get camera offset
        const cameraX = game.camera ? game.camera.x : 0
        const cameraY = game.camera ? game.camera.y : 0
        
        // Draw player box
        if (game.player) {
            ctx.strokeRect(
                game.player.x - cameraX,
                game.player.y - cameraY,
                game.player.width,
                game.player.height
            )
            
            // Draw player center point
            ctx.fillStyle = '#ff0000'
            ctx.fillRect(
                game.player.x + game.player.width / 2 - 2 - cameraX,
                game.player.y + game.player.height / 2 - 2 - cameraY,
                4,
                4
            )
        }
        
        // Draw enemy boxes
        if (game.enemies) {
            ctx.strokeStyle = '#ff0000'
            game.enemies.forEach(enemy => {
                ctx.strokeRect(
                    enemy.x - cameraX, 
                    enemy.y - cameraY, 
                    enemy.width, 
                    enemy.height
                )
            })
        }
        
        // Draw platform boxes
        if (game.platforms) {
            ctx.strokeStyle = '#0000ff'
            game.platforms.forEach(platform => {
                ctx.strokeRect(
                    platform.x - cameraX, 
                    platform.y - cameraY, 
                    platform.width, 
                    platform.height
                )
            })
        }
        
        // Draw collectible boxes
        if (game.collectibles) {
            ctx.strokeStyle = '#ffff00'
            game.collectibles.forEach(collectible => {
                ctx.strokeRect(
                    collectible.x - cameraX,
                    collectible.y - cameraY,
                    collectible.width,
                    collectible.height
                )
            })
        }
        
        ctx.restore()
    }
    
    /**
     * Draw text overlay with debug info
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} game - Game instance
     */
    drawInfoOverlay(ctx, game) {
        ctx.save()
        
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(10, 10, 250, 150)
        
        // White text
        ctx.fillStyle = '#ffffff'
        ctx.font = '14px monospace'
        
        let y = 30
        const lineHeight = 20
        
        // FPS
        ctx.fillText(`FPS: ${this.fps}`, 20, y)
        y += lineHeight
        
        // Entity counts
        const enemyCount = game.enemies ? game.enemies.length : 0
        const platformCount = game.platforms ? game.platforms.length : 0
        const collectibleCount = game.collectibles ? game.collectibles.length : 0
        
        ctx.fillText(`Enemies: ${enemyCount}`, 20, y)
        y += lineHeight
        ctx.fillText(`Platforms: ${platformCount}`, 20, y)
        y += lineHeight
        ctx.fillText(`Collectibles: ${collectibleCount}`, 20, y)
        y += lineHeight
        
        // Player info
        if (game.player) {
            const px = Math.round(game.player.x)
            const py = Math.round(game.player.y)
            ctx.fillText(`Player: (${px}, ${py})`, 20, y)
            y += lineHeight
            
            // Player velocity if it exists
            if (game.player.velocityX !== undefined) {
                const vx = Math.round(game.player.velocityX * 10) / 10
                const vy = Math.round(game.player.velocityY * 10) / 10
                ctx.fillText(`Velocity: (${vx}, ${vy})`, 20, y)
            }
        }
        
        ctx.restore()
    }
    
    /**
     * Toggle debug mode on/off
     */
    toggle() {
        this.enabled = !this.enabled
    }
}

/**
 * Example usage:
 * 
 * const debug = new DebugRenderer()
 * 
 * function gameLoop(timestamp) {
 *     // Update
 *     debug.update(timestamp)
 *     game.update()
 *     
 *     // Render
 *     ctx.clearRect(0, 0, canvas.width, canvas.height)
 *     game.render(ctx)
 *     debug.render(ctx, game)  // Draw debug overlay last
 *     
 *     requestAnimationFrame(gameLoop)
 * }
 * 
 * // User can press F3 to toggle debug mode on/off
 */
