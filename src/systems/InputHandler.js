/**
 * InputHandler - Simple keyboard input tracking
 * 
 * Uses a Set to track currently pressed keys.
 * Set automatically prevents duplicates, and we check before adding
 * to avoid repeated keydown events when holding a key.
 */
export default class InputHandler {
    constructor(game) {
        this.game = game
        this.keys = new Set()
        
        window.addEventListener('keydown', (event) => {
            // Only add key if not already in the Set
            // This prevents repeated keydown events when holding a key
            if (!this.keys.has(event.key)) {
                this.keys.add(event.key)
            }
        })
        
        window.addEventListener('keyup', (event) => {
            this.keys.delete(event.key)
        })
    }
}

/**
 * Example usage:
 * 
 * const input = new InputHandler(game)
 * 
 * function update() {
 *     // Check if a key is currently pressed
 *     if (input.keys.has('ArrowRight')) {
 *         player.moveRight()
 *     }
 *     
 *     if (input.keys.has(' ')) {
 *         player.jump()
 *     }
 * }
 */