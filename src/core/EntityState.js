/**
 * EntityState - Base class for state machine states
 * 
 * Each state represents a behavior pattern (idle, running, jumping, etc.)
 * Override enter(), update(), and exit() to define state behavior.
 */
export default class EntityState {
    constructor(name) {
        this.name = name
        this.entity = null  // Set by StateMachine
    }
    
    /**
     * Called when entering this state
     * Use this to set initial state (animations, velocities, etc.)
     */
    enter() {
        // Override in subclass
    }
    
    /**
     * Called every frame while in this state
     * @param {number} deltaTime - Time since last frame
     * @returns {string|null} Name of state to transition to, or null to stay
     */
    update(deltaTime) {
        // Override in subclass
        return null
    }
    
    /**
     * Called when exiting this state
     * Use this for cleanup
     */
    exit() {
        // Override in subclass
    }
}
