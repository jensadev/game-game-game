import EntityState from '../../core/EntityState.js'

/**
 * RunningState - Player moving horizontally on ground
 */
export default class RunningState extends EntityState {
    constructor() {
        super('running')
        this.moveSpeed = 0.3
    }
    
    enter() {
        this.entity.setAnimation('run')
    }
    
    update(deltaTime) {
        const input = this.entity.game.inputHandler
        
        // Check for jump
        if (input.keys.has(' ') && this.entity.isGrounded) {
            return 'jumping'
        }
        
        // Check for falling
        if (!this.entity.isGrounded) {
            return 'falling'
        }
        
        // Handle horizontal movement
        if (input.keys.has('ArrowLeft')) {
            this.entity.velocityX = -this.moveSpeed
            this.entity.directionX = -1
            this.entity.lastDirectionX = -1
        } else if (input.keys.has('ArrowRight')) {
            this.entity.velocityX = this.moveSpeed
            this.entity.directionX = 1
            this.entity.lastDirectionX = 1
        } else {
            // No input, go to idle
            return 'idle'
        }
        
        return null
    }
}
