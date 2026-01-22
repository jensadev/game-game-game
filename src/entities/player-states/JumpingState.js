import EntityState from '../../core/EntityState.js'

/**
 * JumpingState - Player jumping upwards
 * ONLY handles animation - Player handles input and physics
 */
export default class JumpingState extends EntityState {
    constructor() {
        super('jumping')
    }
    
    enter() {
        this.entity.setAnimation('jump')
    }
    
    update(deltaTime) {
        // State just handles animation
        // Player.updateState() will change states based on physics
        return null
    }
}
