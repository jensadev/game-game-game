import EntityState from '../../core/EntityState.js'

/**
 * IdleState - Player standing still on ground
 */
export default class IdleState extends EntityState {
    constructor() {
        super('idle')
    }
    
    enter() {
        this.entity.setAnimation('idle')
        this.entity.velocityX = 0
    }
    
    update(deltaTime) {
        const input = this.entity.game.inputHandler
        
        // Check for jump
        if (input.keys.has(' ') && this.entity.isGrounded) {
            return 'jumping'
        }
        
        // Check for falling (walked off edge)
        if (!this.entity.isGrounded) {
            return 'falling'
        }
        
        // Check for horizontal movement
        if (input.keys.has('ArrowLeft') || input.keys.has('ArrowRight')) {
            return 'running'
        }
        
        // Stay idle
        this.entity.velocityX = 0
        
        return null
    }
}
