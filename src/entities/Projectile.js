import Entity from '../core/Entity.js'
import Physics from '../components/Physics.js'
import Sprite from '../components/Sprite.js'
import Collider from '../components/Collider.js'

export default class Projectile extends Entity {
    constructor(game, x, y, directionX) {
        super(game, x, y, 12, 6)
        
        // Add Physics component (no gravity for projectiles)
        const physics = new Physics(directionX * 0.8, 0)
        physics.useGravity = false
        physics.useAirResistance = false  // No air resistance - projectiles fly straight
        this.addComponent(physics)
        
        // Add Sprite component
        const sprite = new Sprite(null, 12, 6)
        sprite.color = 'orange'
        this.addComponent(sprite)
        
        // Add Collider component
        const collider = new Collider(12, 6, 0, 0)
        this.addComponent(collider)
        
        // Projectile properties
        this.directionX = directionX // -1 for left, 1 for right
        this.startX = x
        this.maxDistance = 800 // Max distance before deletion
    }
    
    /**
     * Reset projectile for object pooling
     */
    reset() {
        this.markedForDeletion = false
        this.x = 0
        this.y = 0
        this.startX = 0
        
        const physics = this.getComponent('Physics')
        if (physics) {
            physics.velocity.x = 0
            physics.velocity.y = 0
        }
    }
    
    /**
     * Initialize/reinitialize projectile (called when spawning from pool)
     */
    init(x, y, directionX) {
        this.x = x
        this.y = y
        this.startX = x
        this.directionX = directionX
        this.markedForDeletion = false
        
        const physics = this.getComponent('Physics')
        if (physics) {
            // Higher velocity for better projectile speed (0.8 pixels/ms = ~480 pixels/sec)
            physics.velocity.x = directionX * 0.8
            physics.velocity.y = 0
        }
    }
    
    update(deltaTime) {
        // Skip update if marked for deletion
        if (this.markedForDeletion) {
            return
        }
        
        // Update all components
        super.update(deltaTime)
        
        // Check if projectile has traveled too far
        const distanceTraveled = Math.abs(this.x - this.startX)
        if (distanceTraveled > this.maxDistance) {
            this.markedForDeletion = true
        }
    }
    
    draw(ctx, camera) {
        // Don't draw if marked for deletion
        if (this.markedForDeletion) {
            return
        }
        
        const screenPos = camera.worldToScreen(this.x, this.y)
        
        // Draw projectile as orange rectangle
        const sprite = this.getComponent('Sprite')
        ctx.fillStyle = sprite?.color || 'orange'
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height)
    }
}
