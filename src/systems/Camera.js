import Vector2 from '../core/Vector2.js'

export default class Camera {
    constructor(x = 0, y = 0, width = 800, height = 600) {
        this.position = new Vector2(x, y)
        this.targetPosition = new Vector2(x, y)
        this.width = width
        this.height = height
        
        // World bounds
        this.worldWidth = width
        this.worldHeight = height
        
        // Following
        this.followTarget = null  // Entity reference
        this.smoothing = 0.1      // 0-1, higher = faster
        this.mode = 'follow'      // 'follow' or 'fixed'
    }
    
    setWorldBounds(width, height) {
        this.worldWidth = width
        this.worldHeight = height
    }
    
    /**
     * Set entity to follow
     * Call once, camera will track entity automatically
     */
    setTarget(entity) {
        this.followTarget = entity
        this.mode = 'follow'
    }
    
    /**
     * Stop following, camera stays at current position
     */
    setFixed() {
        this.followTarget = null
        this.mode = 'fixed'
    }
    
    /**
     * Move camera to specific position (for cutscenes, etc)
     * Note: Cinematic mode with waypoint paths is a future feature
     */
    moveTo(x, y) {
        this.targetPosition.set(x, y)
        this.mode = 'fixed'
    }
    
    update(deltaTime) {
        // Calculate target position based on mode
        if (this.mode === 'follow' && this.followTarget) {
            this._updateFollowTarget()
        }
        
        // Smooth lerp to target
        this.position.lerp(this.targetPosition, this.smoothing)
        
        // Clamp to world bounds
        this.position.x = Math.max(0, Math.min(this.position.x, this.worldWidth - this.width))
        this.position.y = Math.max(0, Math.min(this.position.y, this.worldHeight - this.height))
        
        // Round to avoid sub-pixel rendering
        this.position.x = Math.round(this.position.x)
        this.position.y = Math.round(this.position.y)
    }
    
    /**
     * Internal: Calculate target position from follow entity
     */
    _updateFollowTarget() {
        const target = this.followTarget
        const targetCenterX = target.x + target.width / 2
        const targetCenterY = target.y + target.height / 2
        
        // Center camera on target
        this.targetPosition.x = targetCenterX - this.width / 2
        this.targetPosition.y = targetCenterY - this.height / 2
    }
    
    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.position.x,
            y: worldY - this.position.y
        }
    }
    
    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.position.x,
            y: screenY + this.position.y
        }
    }
    
    // Check if an object is visible on screen
    isVisible(object) {
        return !(object.x + object.width < this.position.x ||
                object.x > this.position.x + this.width ||
                object.y + object.height < this.position.y ||
                object.y > this.position.y + this.height)
    }
}
