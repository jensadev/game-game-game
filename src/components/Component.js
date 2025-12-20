/**
 * Component - Base class för alla GameObject components
 * 
 * Component pattern tillåter oss att bygga komplexa behaviors
 * genom att kombinera små, återanvändbara delar.
 * 
 * Composition > Inheritance
 */
export default class Component {
    /**
     * @param {GameObject} owner - Det GameObject som äger denna component
     */
    constructor(owner) {
        this.owner = owner
        this.game = owner.game
        this.enabled = true
    }
    
    /**
     * Update component logic
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Override i subclasses
    }
    
    /**
     * Draw component visuals (effekter, etc)
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        // Override i subclasses
    }
    
    /**
     * Called när component läggs till på tower
     */
    onAdd() {
        // Override i subclasses
    }
    
    /**
     * Called när component tas bort från tower
     */
    onRemove() {
        // Override i subclasses
    }
    
    /**
     * Enable/disable component
     */
    setEnabled(enabled) {
        this.enabled = enabled
    }
}
