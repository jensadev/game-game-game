/**
 * Component - Base class för alla tower components
 * 
 * Component pattern tillåter oss att bygga komplexa behaviors
 * genom att kombinera små, återanvändbara delar.
 * 
 * Composition > Inheritance
 */
export default class Component {
    /**
     * @param {Tower} tower - Det torn som äger denna component
     */
    constructor(tower) {
        this.tower = tower
        this.game = tower.game
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
