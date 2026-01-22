import Entity from '../core/Entity.js'
import Physics from '../components/Physics.js'
import Sprite from '../components/Sprite.js'
import Collider from '../components/Collider.js'

export default class Projectile extends Entity {
    constructor(game, x, y, directionX) {
        super(game, x, y, 12, 6)
        
        // Add Physics component (no gravity for projectiles)
        const physics = new Physics(directionX * 0.5, 0)
        physics.useGravity = false
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
    
    update(deltaTime) {
        // Update all components
        super.update(deltaTime)
        
        // Check if projectile has traveled too far
        const distanceTraveled = Math.abs(this.x - this.startX)
        if (distanceTraveled > this.maxDistance) {
            this.markedForDeletion = true
        }
    }
    
    draw(ctx, camera = null) {
        const cameraX = camera ? camera.position.x : 0
        const cameraY = camera ? camera.position.y : 0
        const screenX = this.x - cameraX
        const screenY = this.y - cameraY
        
        // Draw projectile as orange rectangle
        const sprite = this.getComponent('Sprite')
        ctx.fillStyle = sprite?.color || 'orange'
        ctx.fillRect(screenX, screenY, this.width, this.height)
    }
}
