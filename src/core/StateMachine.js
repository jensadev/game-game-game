/**
 * StateMachine - Manages state transitions for entities
 * 
 * Handles switching between different entity states and
 * calling their lifecycle methods.
 */
export default class StateMachine {
    constructor(entity) {
        this.entity = entity
        this.states = {}
        this.currentState = null
    }
    
    /**
     * Add a state to the state machine
     * @param {string} name - State name
     * @param {EntityState} state - State instance
     */
    addState(name, state) {
        state.entity = this.entity
        this.states[name] = state
    }
    
    /**
     * Set the initial state
     * @param {string} stateName - Name of state to start in
     */
    setState(stateName) {
        if (!this.states[stateName]) {
            console.warn(`State "${stateName}" not found`)
            return
        }
        
        // Exit current state if exists
        if (this.currentState) {
            this.currentState.exit()
        }
        
        // Enter new state
        this.currentState = this.states[stateName]
        this.currentState.enter()
    }
    
    /**
     * Update current state
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.currentState) return
        
        // Let state update and potentially return a new state to transition to
        const newState = this.currentState.update(deltaTime)
        
        if (newState && newState !== this.currentState.name) {
            this.setState(newState)
        }
    }
    
    /**
     * Get current state name
     * @returns {string|null} Current state name or null
     */
    getCurrentStateName() {
        return this.currentState ? this.currentState.name : null
    }
}
