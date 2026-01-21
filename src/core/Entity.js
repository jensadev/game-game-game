import Vector2 from './Vector2.js'

/**
 * Entity - Component-based game object
 * 
 * Unlike GameObject which uses inheritance, Entity uses composition.
 * Add components to give entities different capabilities.
 * 
 * Example:
 *   const player = new Entity(game, 100, 100, 32, 32)
 *   player.addComponent(new Transform(100, 100))
 *   player.addComponent(new Physics(0, 0))
 *   player.addComponent(new Sprite(image))
 */
export default class Entity {
    constructor(game, x = 0, y = 0, width = 0, height = 0) {
        this.game = game
        this.position = new Vector2(x, y)
        this.width = width
        this.height = height
        this.markedForDeletion = false
        
        // Component storage
        this.components = new Map()
        
        // Backwards compatibility getters/setters for x/y
        // Components can use this.entity.x or this.entity.position.x
    }
    
    // Getters and setters for backwards compatibility
    get x() { return this.position.x }
    set x(value) { this.position.x = value }
    
    get y() { return this.position.y }
    set y(value) { this.position.y = value }
    
    /**
     * Add a component to this entity
     * @param {Component} component - Component instance
     */
    addComponent(component) {
        const componentName = component.constructor.name
        this.components.set(componentName, component)
        component.entity = this
        component.init()
    }
    
    /**
     * Get a component by its class name
     * @param {string} componentName - Name of the component class
     * @returns {Component|null} Component instance or null
     */
    getComponent(componentName) {
        return this.components.get(componentName) || null
    }
    
    /**
     * Check if entity has a specific component
     * @param {string} componentName - Name of the component class
     * @returns {boolean} True if component exists
     */
    hasComponent(componentName) {
        return this.components.has(componentName)
    }
    
    /**
     * Remove a component
     * @param {string} componentName - Name of the component class
     */
    removeComponent(componentName) {
        const component = this.components.get(componentName)
        if (component) {
            component.destroy()
            this.components.delete(componentName)
        }
    }
    
    /**
     * Update all components
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        for (const component of this.components.values()) {
            if (component.enabled) {
                component.update(deltaTime)
            }
        }
    }
    
    /**
     * Draw all components
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera for offset
     */
    draw(ctx, camera = null) {
        for (const component of this.components.values()) {
            if (component.enabled) {
                component.draw(ctx, camera)
            }
        }
    }
    
    /**
     * Collision detection (AABB)
     * @param {Entity|GameObject} other - Other entity
     * @returns {boolean} True if colliding
     */
    intersects(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y
    }
    
    /**
     * Get collision data with direction
     * @param {Entity|GameObject} other - Other entity
     * @returns {Object|null} Collision data or null
     */
    getCollisionData(other) {
        if (!this.intersects(other)) return null
        
        const overlapLeft = (this.x + this.width) - other.x
        const overlapRight = (other.x + other.width) - this.x
        const overlapTop = (this.y + this.height) - other.y
        const overlapBottom = (other.y + other.height) - this.y
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)
        
        if (minOverlap === overlapTop) return { direction: 'top' }
        if (minOverlap === overlapBottom) return { direction: 'bottom' }
        if (minOverlap === overlapLeft) return { direction: 'left' }
        if (minOverlap === overlapRight) return { direction: 'right' }
        
        return null
    }
}
