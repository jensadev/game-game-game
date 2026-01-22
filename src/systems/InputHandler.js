/**
 * InputHandler - Keyboard and mouse input tracking
 * 
 * Tracks three states for each input:
 * - pressed: Input activated this frame (one-time actions)
 * - held: Input is currently down (continuous actions)
 * - released: Input released this frame (release actions)
 */
export default class InputHandler {
    constructor(game) {
        this.game = game
        
        // Keyboard state
        this.keysPressed = new Set()   // New presses this frame
        this.keysHeld = new Set()      // Currently held
        this.keysReleased = new Set()  // Released this frame
        
        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,  // Position in world space
            worldY: 0,
            buttonsPressed: new Set(),
            buttonsHeld: new Set(),
            buttonsReleased: new Set()
        }
        
        this._setupEventListeners()
    }
    
    _setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (!this.keysHeld.has(e.key)) {
                this.keysPressed.add(e.key)
                this.keysHeld.add(e.key)
            }
        })
        
        window.addEventListener('keyup', (e) => {
            this.keysHeld.delete(e.key)
            this.keysReleased.add(e.key)
        })
        
        // Mouse position
        window.addEventListener('mousemove', (e) => {
            const rect = this.game.canvas.getBoundingClientRect()
            this.mouse.x = e.clientX - rect.left
            this.mouse.y = e.clientY - rect.top
            
            // Convert to world space
            if (this.game.camera) {
                this.mouse.worldX = this.mouse.x + this.game.camera.position.x
                this.mouse.worldY = this.mouse.y + this.game.camera.position.y
            }
        })
        
        // Mouse buttons
        window.addEventListener('mousedown', (e) => {
            if (!this.mouse.buttonsHeld.has(e.button)) {
                this.mouse.buttonsPressed.add(e.button)
                this.mouse.buttonsHeld.add(e.button)
            }
        })
        
        window.addEventListener('mouseup', (e) => {
            this.mouse.buttonsHeld.delete(e.button)
            this.mouse.buttonsReleased.add(e.button)
        })
    }
    
    /**
     * Call at start of each frame to clear frame-specific sets
     */
    update() {
        this.keysPressed.clear()
        this.keysReleased.clear()
        this.mouse.buttonsPressed.clear()
        this.mouse.buttonsReleased.clear()
    }
    
    // Keyboard methods
    isKeyPressed(key) {
        return this.keysPressed.has(key)
    }
    
    isKeyHeld(key) {
        return this.keysHeld.has(key)
    }
    
    isKeyReleased(key) {
        return this.keysReleased.has(key)
    }
    
    // Mouse methods
    isMousePressed(button = 0) {
        return this.mouse.buttonsPressed.has(button)
    }
    
    isMouseHeld(button = 0) {
        return this.mouse.buttonsHeld.has(button)
    }
    
    isMouseReleased(button = 0) {
        return this.mouse.buttonsReleased.has(button)
    }
}