import EntityState from '../../core/EntityState.js'

/**
 * RunningState - Player moving horizontally on ground
 * ONLY handles animation - Player handles input and physics
 */
export default class RunningState extends EntityState {
    constructor() {
        super('running')
    }
    
    enter() {
        this.entity.setAnimation('run')
    }
    
    update(deltaTime) {
        // State just handles animation
        // Player.updateState() will change states based on physics
        return null
    }
}
