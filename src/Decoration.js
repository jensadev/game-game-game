/**
 * Decoration - Base class for decorative elements
 * 
 * Decorations are non-interactive visual elements that enhance the game's appearance.
 * They can be animated, move, or be static.
 */
export default class Decoration {
    /**
     * @param {string} image - Image URL from assets
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     */
    constructor(image, x, y, width, height) {
        this.image = image
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
    
    /**
     * Update decoration - override in subclasses
     * @param {number} deltaTime - Time since last frame (ms)
     * @param {...any} args - Additional arguments specific to decoration type
     */
    update(deltaTime, ...args) {
        // Override in subclasses
    }
    
    /**
     * Draw decoration - override in subclasses
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Image} loadedImage - Loaded image from SpriteManager
     * @param {Camera} [camera=null] - Optional camera for offset
     */
    draw(ctx, loadedImage, camera = null) {
        if (!loadedImage || !loadedImage.complete) return
        
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        
        ctx.drawImage(
            loadedImage,
            this.x - offsetX,
            this.y - offsetY,
            this.width,
            this.height
        )
    }
}
