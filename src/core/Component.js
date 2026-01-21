3/**
 * Component - Base class for all entity components
 * 
 * Components add capabilities to entities.
 * Override init(), update(), draw(), and destroy() as needed.
 */
export default class Component {
    constructor() {
        this.entity = null  // Set by Entity when added
        this.enabled = true
    }
    
    /**
     * Called when component is added to entity
     * Use this to initialize component state
     */
    init() {
        // Override in subclass
    }
    
    /**
     * Update component logic
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Override in subclass
    }
    
    /**
     * Draw component visuals
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera for offset
     */
    draw(ctx, camera = null) {
        // Override in subclass
    }
    
    /**
     * Cleanup when component is removed
     */
    destroy() {
        // Override in subclass
    }
}
