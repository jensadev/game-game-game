import EntityState from '../../core/EntityState.js'

/**
 * IdleState - Player standing still on ground
 * ONLY handles animation - Player handles input and physics
 */
export default class IdleState extends EntityState {
    constructor() {
        super('idle')
    }
    
    enter() {
        this.entity.setAnimation('idle')
    }
    
    update(deltaTime) {
        // State just handles animation
        // Player.updateState() will change states based on physics
        return null
    }
}
