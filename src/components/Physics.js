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
        this.gravity = 0.001  // pixels per millisecond^2
        this.friction = 0.00015  // air resistance
        this.useGravity = true
    }
    
    update(deltaTime) {
        if (!this.entity) return
        
        // Apply gravity
        if (this.useGravity) {
            this.velocity.y += this.gravity * deltaTime
        }
        
        // Apply friction to vertical velocity
        if (this.velocity.y > 0) {
            this.velocity.y -= this.friction * deltaTime
            if (this.velocity.y < 0) this.velocity.y = 0
        }
        
        // Apply acceleration
        this.velocity.add(this.acceleration.x * deltaTime, this.acceleration.y * deltaTime)
        
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
