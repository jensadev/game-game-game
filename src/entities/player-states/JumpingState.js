import EntityState from '../../core/EntityState.js'

/**
 * JumpingState - Player jumping upwards
 */
export default class JumpingState extends EntityState {
    constructor() {
        super('jumping')
        this.jumpPower = -0.6
        this.moveSpeed = 0.3
    }
    
    enter() {
        this.entity.setAnimation('jump')
        this.entity.velocityY = this.jumpPower
        this.entity.isGrounded = false
    }
    
    update(deltaTime) {
        const input = this.entity.game.inputHandler
        
        // Allow horizontal air control
        if (input.keys.has('ArrowLeft')) {
            this.entity.velocityX = -this.moveSpeed
            this.entity.directionX = -1
            this.entity.lastDirectionX = -1
        } else if (input.keys.has('ArrowRight')) {
            this.entity.velocityX = this.moveSpeed
            this.entity.directionX = 1
            this.entity.lastDirectionX = 1
        } else {
            this.entity.velocityX = 0
        }
        
        // Transition to falling when velocity becomes positive (going down)
        if (this.entity.velocityY >= 0) {
            return 'falling'
        }
        
        return null
    }
}
