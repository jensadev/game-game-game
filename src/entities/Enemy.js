import Entity from '../core/Entity.js'
import Physics from '../components/Physics.js'
import Sprite from '../components/Sprite.js'
import Collider from '../components/Collider.js'

export default class Enemy extends Entity {
    constructor(game, x, y, width, height, patrolDistance = null) {
        super(game, x, y, width, height)
        
        // Add Physics component
        const physics = new Physics(0, 0)
        physics.useGravity = true
        physics.gravityScale = 1
        this.addComponent(physics)
        
        // Add Sprite component (simple colored rectangle for now)
        const sprite = new Sprite(null, width, height)
        sprite.color = 'red'
        this.addComponent(sprite)
        
        // Add Collider component
        const collider = new Collider(width, height, 0, 0)
        this.addComponent(collider)
        
        // Patrol AI properties
        this.startX = x
        this.patrolDistance = patrolDistance
        this.endX = patrolDistance !== null ? x + patrolDistance : null
        this.speed = 0.1
        this.direction = 1 // 1 = right, -1 = left
        
        // Combat properties
        this.damage = 1
        this.points = 50 // Score when defeated
    }

    update(deltaTime) {
        // Update all components first
        super.update(deltaTime)
        
        // Enemy AI logic
        this.updateAI(deltaTime)
    }
    
    /**
     * Enemy AI - patrol behavior
     */
    updateAI(deltaTime) {
        const physics = this.getComponent('Physics')
        if (!physics) return
        
        // Only patrol when grounded
        if (physics.isGrounded) {
            physics.velocity.x = this.speed * this.direction
            
            // If we have patrol distance, turn at endpoints
            if (this.patrolDistance !== null) {
                if (this.x >= this.endX) {
                    this.direction = -1
                    this.x = this.endX
                } else if (this.x <= this.startX) {
                    this.direction = 1
                    this.x = this.startX
                }
            }
        } else {
            physics.velocity.x = 0
        }
    }
    
    /**
     * Handle collision with another enemy (bounce off)
     */
    handleEnemyCollision(otherEnemy) {
        this.direction *= -1
    }
    
    /**
     * Handle world bounds (for enemies without patrol distance)
     */
    handleScreenBounds(gameWidth) {
        if (this.patrolDistance === null) {
            if (this.x <= 0) {
                this.x = 0
                this.direction = 1
            } else if (this.x + this.width >= gameWidth) {
                this.x = gameWidth - this.width
                this.direction = -1
            }
        }
    }
    
    draw(ctx, camera = null) {
        const cameraX = camera ? camera.position.x : 0
        const cameraY = camera ? camera.position.y : 0
        const screenX = this.x - cameraX
        const screenY = this.y - cameraY
        
        // Draw enemy as red rectangle
        const sprite = this.getComponent('Sprite')
        ctx.fillStyle = sprite?.color || 'red'
        ctx.fillRect(screenX, screenY, this.width, this.height)
    }
}
