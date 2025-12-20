/**
 * GameStateManager - Manages game states and transitions
 * 
 * Responsibilities:
 * - Track current game state (LOADING, MENU, PLAYING, PAUSED, QUIZ, GAME_OVER)
 * - Handle state transitions
 * - Emit events on state changes
 * - Route update/draw calls based on state
 */
export default class GameStateManager {
    constructor(game) {
        this.game = game
        
        // Game states
        this.states = {
            LOADING: 'LOADING',
            MENU: 'MENU',
            PLAYING: 'PLAYING',
            PAUSED: 'PAUSED',
            QUIZ: 'QUIZ',
            GAME_OVER: 'GAME_OVER'
        }
        
        // Current state
        this.currentState = this.states.LOADING
        this.previousState = null
    }
    
    /**
     * Get current state
     */
    getState() {
        return this.currentState
    }
    
    /**
     * Check if in specific state
     */
    is(state) {
        return this.currentState === this.states[state]
    }
    
    /**
     * Change to new state
     */
    setState(newState) {
        if (!this.states[newState]) {
            console.warn(`Invalid state: ${newState}`)
            return
        }
        
        const oldState = this.currentState
        this.previousState = oldState
        this.currentState = this.states[newState]
        
        console.log(`State: ${oldState} → ${this.currentState}`)
        
        // Emit state change event
        this.game.events.emit('stateChanged', {
            from: oldState,
            to: this.currentState
        })
        
        // Handle state-specific logic
        this.onStateEnter(this.currentState, oldState)
    }
    
    /**
     * Called when entering a new state
     */
    onStateEnter(newState, oldState) {
        switch (newState) {
            case this.states.LOADING:
                // Assets loading
                break
                
            case this.states.MENU:
                // Show main menu (future implementation)
                break
                
            case this.states.PLAYING:
                // Resume gameplay
                if (oldState === this.states.LOADING) {
                    // Start first wave after loading
                    setTimeout(() => {
                        if (this.game.waveManager) {
                            this.game.waveManager.startWave()
                        }
                    }, 2000)
                }
                break
                
            case this.states.PAUSED:
                // Pause gameplay (future implementation)
                break
                
            case this.states.QUIZ:
                // Quiz overlay shown via DOM
                break
                
            case this.states.GAME_OVER:
                // Show game over screen (future implementation)
                break
        }
    }
    
    /**
     * Return to previous state
     */
    returnToPrevious() {
        if (this.previousState) {
            this.setState(this.previousState)
        }
    }
    
    /**
     * Check if game should update
     */
    shouldUpdate() {
        // Don't update during loading or game over
        return this.currentState === this.states.PLAYING
    }
    
    /**
     * Check if quiz is active
     */
    isQuizActive() {
        return this.currentState === this.states.QUIZ
    }
    
    /**
     * Check if game is playing
     */
    isPlaying() {
        return this.currentState === this.states.PLAYING
    }
    
    /**
     * Check if game is loading
     */
    isLoading() {
        return this.currentState === this.states.LOADING
    }
}
