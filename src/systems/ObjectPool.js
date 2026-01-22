/**
 * ObjectPool - Reusable object pooling for performance
 * 
 * Avoids constant creation/destruction of objects (especially projectiles).
 * Objects are recycled instead of being garbage collected.
 * 
 * Usage:
 *   const pool = new ObjectPool(() => new Projectile(game, 0, 0, 1), 50)
 *   const projectile = pool.acquire()
 *   // ... use projectile ...
 *   pool.release(projectile)
 */
export default class ObjectPool {
    /**
     * @param {Function} factory - Function that creates new objects
     * @param {number} initialSize - Initial pool size
     * @param {number} maxSize - Maximum pool size (0 = unlimited)
     */
    constructor(factory, initialSize = 10, maxSize = 100) {
        this.factory = factory
        this.maxSize = maxSize
        this.available = []
        this.inUse = new Set()
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.available.push(this.factory())
        }
    }
    
    /**
     * Get an object from the pool
     * @returns {Object} Pooled object
     */
    acquire() {
        let obj
        
        // Try to reuse from available pool
        if (this.available.length > 0) {
            obj = this.available.pop()
            console.log(`[Pool] Reusing object from available pool. Available: ${this.available.length}, InUse: ${this.inUse.size}`)
            // Reset when acquiring (not when releasing) to avoid visual glitches
            if (obj.reset) {
                obj.reset()
            }
        } else {
            // Create new if pool is empty (and under max size)
            if (this.maxSize === 0 || this.inUse.size < this.maxSize) {
                obj = this.factory()
                console.log(`[Pool] Created new object. Available: ${this.available.length}, InUse: ${this.inUse.size}`)
            } else {
                // Pool exhausted - return null or oldest object
                console.warn('ObjectPool exhausted!')
                return null
            }
        }
        
        this.inUse.add(obj)
        console.log(`[Pool] Object acquired. Available: ${this.available.length}, InUse: ${this.inUse.size}`)
        return obj
    }
    
    /**
     * Return an object to the pool
     * @param {Object} obj - Object to release
     */
    release(obj) {
        console.log(`[Pool] Attempting to release object. InUse has it: ${this.inUse.has(obj)}`)
        
        if (!this.inUse.has(obj)) {
            console.warn('[Pool] Trying to release object not in pool!')
            return
        }
        
        this.inUse.delete(obj)
        
        // Don't reset here - let acquire() handle reset when reusing
        // This prevents visual glitches when object is still being drawn
        
        // Only keep in pool if under max size
        if (this.maxSize === 0 || this.available.length < this.maxSize) {
            this.available.push(obj)
        }
        
        console.log(`[Pool] Object released. Available: ${this.available.length}, InUse: ${this.inUse.size}`)
    }
    
    /**
     * Release all in-use objects (useful for level reset)
     */
    releaseAll() {
        this.inUse.forEach(obj => {
            if (obj.reset) {
                obj.reset()
            }
            this.available.push(obj)
        })
        this.inUse.clear()
    }
    
    /**
     * Clear the entire pool
     */
    clear() {
        this.available = []
        this.inUse.clear()
    }
    
    /**
     * Get pool statistics
     */
    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            total: this.available.length + this.inUse.size,
            maxSize: this.maxSize
        }
    }
}
