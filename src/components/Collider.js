import Component from '../core/Component.js'

/**
 * Collider - Defines collision box for entity
 * 
 * Can have different size than sprite for more accurate collisions.
 * Defaults to entity width/height if not specified.
 */
export default class Collider extends Component {
    constructor(width = null, height = null, offsetX = 0, offsetY = 0) {
        super()
        this.width = width
        this.height = height
        this.offsetX = offsetX  // Offset from entity position
        this.offsetY = offsetY
    }
    
    init() {
        // Default to entity size if not specified
        if (this.width === null) this.width = this.entity.width
        if (this.height === null) this.height = this.entity.height
    }
    
    /**
     * Get collision bounds in world space
     * @returns {Object} Bounds {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.entity.x + this.offsetX,
            y: this.entity.y + this.offsetY,
            width: this.width,
            height: this.height
        }
    }
    
    /**
     * Check collision with another entity
     * @param {Entity} other - Other entity
     * @returns {boolean} True if colliding
     */
    intersects(other) {
        const thisBounds = this.getBounds()
        const otherCollider = other.getComponent('Collider')
        
        // If other has Collider component, use it
        if (otherCollider) {
            const otherBounds = otherCollider.getBounds()
            return thisBounds.x < otherBounds.x + otherBounds.width &&
                   thisBounds.x + thisBounds.width > otherBounds.x &&
                   thisBounds.y < otherBounds.y + otherBounds.height &&
                   thisBounds.y + thisBounds.height > otherBounds.y
        }
        
        // Otherwise use entity bounds directly
        return thisBounds.x < other.x + other.width &&
               thisBounds.x + thisBounds.width > other.x &&
               thisBounds.y < other.y + other.height &&
               thisBounds.y + thisBounds.height > other.y
    }
}
