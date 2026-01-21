import EntityState from '../../core/EntityState.js'

/**
 * FallingState - Player falling downwards
 */
export default class FallingState extends EntityState {
    constructor() {
        super('falling')
        this.moveSpeed = 0.3
    }
    
    enter() {
        this.entity.setAnimation('fall')
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
        
        // Transition to idle or running when grounded
        if (this.entity.isGrounded) {
            if (this.entity.velocityX !== 0) {
                return 'running'
            } else {
                return 'idle'
            }
        }
        
        return null
    }
}
