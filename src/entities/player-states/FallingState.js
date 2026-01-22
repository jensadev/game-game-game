import EntityState from '../../core/EntityState.js'

/**
 * FallingState - Player falling downwards
 * ONLY handles animation - Player handles input and physics
 */
export default class FallingState extends EntityState {
    constructor() {
        super('falling')
    }
    
    enter() {
        this.entity.setAnimation('fall')
    }
    
    update(deltaTime) {
        // State just handles animation
        // Player.updateState() will change states based on physics
        return null
    }
}
