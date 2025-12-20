import Decoration from './Decoration.js'

/**
 * TreeDecoration - Animated tree decoration
 * 
 * Trees har 8 frames animation (idle sway i vinden)
 */
export default class TreeDecoration extends Decoration {
    /**
     * @param {string} image - Image URL från assets
     * @param {number} x - World X position
     * @param {number} y - World Y position
     * @param {number} width - Tree width (default 64 to match grid)
     * @param {number} height - Tree height (default 64)
     */
    constructor(image, x, y, width = 64, height = 64) {
        super(image, x, y, width, height)
        
        // Animation (8 frames)
        this.frames = 8
        this.currentFrame = Math.floor(Math.random() * this.frames) // Random start frame
        this.frameTimer = 0
        this.frameInterval = 150 + Math.random() * 100 // 150-250ms per frame (slow sway)
    }
    
    /**
     * Update animation
     * @param {number} deltaTime - Time since last frame (milliseconds)
     */
    update(deltaTime) {
        this.frameTimer += deltaTime
        
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer -= this.frameInterval
            this.currentFrame = (this.currentFrame + 1) % this.frames
        }
    }
    
    /**
     * Draw tree sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Image} loadedImage - Loaded image från SpriteManager
     * @param {Camera} camera - Camera för offset
     */
    draw(ctx, loadedImage, camera) {
        if (!loadedImage || !loadedImage.complete) return
        
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        
        // Image är 1536x256 (8 frames @ 192x256 each)
        const frameWidth = loadedImage.width / this.frames
        const frameHeight = loadedImage.height
        
        ctx.drawImage(
            loadedImage,
            this.currentFrame * frameWidth,  // Source X
            0,                               // Source Y
            frameWidth,                      // Source Width
            frameHeight,                     // Source Height
            this.x - offsetX,                // Dest X
            this.y - offsetY,                // Dest Y
            this.width,                      // Dest Width
            this.height                      // Dest Height
        )
    }
}
