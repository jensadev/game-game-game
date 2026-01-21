/**
 * Vector2 - Simple 2D vector for position and velocity
 * Keeps x and y together in one object for cleaner code
 */
export default class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    /**
     * Set both x and y values
     */
    set(x, y) {
        this.x = x
        this.y = y
        return this
    }

    /**
     * Add another vector's values to this one
     */
    add(other) {
        this.x += other.x
        this.y += other.y
        return this
    }

    /**
     * Subtract another vector from this one
     */
    subtract(other) {
        this.x -= other.x
        this.y -= other.y
        return this
    }

    /**
     * Multiply both x and y by a number
     */
    multiply(scalar) {
        this.x *= scalar
        this.y *= scalar
        return this
    }

    /**
     * Calculate distance to another vector
     */
    distance(other) {
        const dx = this.x - other.x
        const dy = this.y - other.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    /**
     * Create a copy of this vector
     */
    clone() {
        return new Vector2(this.x, this.y)
    }

    /**
     * Copy values from another vector
     */
    copy(other) {
        this.x = other.x
        this.y = other.y
        return this
    }
}
