import Component from '../core/Component.js'
import Vector2 from '../core/Vector2.js'

/**
 * Physics - Handles velocity, gravity, and friction
 * 
 * Applies physics simulation to entity movement.
 * Works with Transform component to update position.
 */
export default class Physics extends Component {
    constructor(velocityX = 0, velocityY = 0) {
        super()
        this.velocity = new Vector2(velocityX, velocityY)
        this.acceleration = new Vector2(0, 0)
        
        // Physics properties
        this.friction = 0.00015  // air resistance
        this.useGravity = true
        this.useAirResistance = true  // Can be disabled for projectiles
        this.isGrounded = false  // Set by CollisionManager
        this.gravityScale = 1.0  // Multiplier for gravity
    }
    
    update(deltaTime) {
        if (!this.entity) return
        
        // Apply gravity from game settings (but not when grounded)
        if (this.useGravity && !this.isGrounded && this.entity.game) {
            this.velocity.y += this.entity.game.gravity * this.gravityScale * deltaTime
        }
        
        // Apply air resistance to horizontal velocity only
        if (this.useAirResistance && this.entity.game && this.entity.game.airResistance) {
            const resistance = this.entity.game.airResistance * deltaTime
            if (Math.abs(this.velocity.x) > resistance) {
                this.velocity.x -= Math.sign(this.velocity.x) * resistance
            } else {
                this.velocity.x = 0
            }
        }
        
        // Apply acceleration
        this.velocity.x += this.acceleration.x * deltaTime
        this.velocity.y += this.acceleration.y * deltaTime
        
        // Update position
        this.entity.x += this.velocity.x * deltaTime
        this.entity.y += this.velocity.y * deltaTime
        
        // Reset acceleration for next frame
        this.acceleration.set(0, 0)
    }
    
    /**
     * Add force to physics body
     * @param {number} fx - Force X
     * @param {number} fy - Force Y
     */
    addForce(fx, fy) {
        this.acceleration.add(fx, fy)
    }
    
    /**
     * Set velocity directly
     * @param {number} vx - Velocity X
     * @param {number} vy - Velocity Y
     */
    setVelocity(vx, vy) {
        this.velocity.set(vx, vy)
    }
}
