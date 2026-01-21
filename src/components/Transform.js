import Component from '../core/Component.js'
import Vector2 from '../core/Vector2.js'

/**
 * Transform - Handles entity position and movement
 * 
 * Manages the entity's position in world space.
 * Can be used for simple movement without physics.
 */
export default class Transform extends Component {
    constructor(x = 0, y = 0) {
        super()
        this.position = new Vector2(x, y)
    }
    
    init() {
        // Sync with entity position
        this.position.set(this.entity.x, this.entity.y)
    }
    
    update(deltaTime) {
        // Sync entity position with transform
        this.entity.position.copy(this.position)
    }
    
    /**
     * Move by offset
     * @param {number} dx - X offset
     * @param {number} dy - Y offset
     */
    move(dx, dy) {
        this.position.x += dx
        this.position.y += dy
    }
    
    /**
     * Set position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        this.position.set(x, y)
    }
}
