import Decoration from './Decoration.js'

/**
 * CloudDecoration - Decorative cloud som rör sig långsamt över spelplanen
 * 
 * Wolken rör sig horisontellt med parallax effect (mindre moln = långsammare = längre bort).
 * Renderas semi-transparent för att inte störa gameplay.
 */
export default class CloudDecoration extends Decoration {
    /**
     * @param {string} image - Sprite path för cloud
     * @param {number} x - Start X position
     * @param {number} y - Y position (height in sky)
     * @param {number} scale - Size scaling (0.5-1.5)
     * @param {number} baseSpeed - Base pixels per second
     */
    constructor(image, x, y, scale = 1.0, baseSpeed = 20) {
        // Default cloud size
        const width = 192 * scale
        const height = 96 * scale
        super(image, x, y, width, height)
        
        this.scale = scale
        
        // Parallax effect - mindre clouds rör sig långsammare (looks further away)
        this.speed = baseSpeed * scale
        
        // Semi-transparent för att inte blockera gameplay
        this.alpha = 0.6 + (scale * 0.2) // 0.6-0.8 range
    }

    /**
     * Update cloud position
     * @param {number} deltaTime - Time since last frame (milliseconds)
     * @param {number} gameWidth - Width of game area for wrapping
     */
    update(deltaTime, gameWidth) {
        // Rörelse (convert deltaTime from ms to seconds)
        this.x += this.speed * (deltaTime / 1000)

        // Wrap around när cloud går utanför höger kant
        if (this.x > gameWidth + this.width) {
            this.x = -this.width
        }
    }

    /**
     * Draw cloud
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Image} loadedImage - Loaded image från SpriteManager
     */
    draw(ctx, loadedImage) {
        if (!loadedImage || !loadedImage.complete) {
            return // Skip om image inte är laddad än
        }

        // Update size från actual image
        this.width = loadedImage.width * this.scale
        this.height = loadedImage.height * this.scale

        // Spara context state
        ctx.save()

        // Semi-transparent rendering
        ctx.globalAlpha = this.alpha

        // Rita cloud
        ctx.drawImage(
            loadedImage,
            this.x,
            this.y,
            this.width,
            this.height
        )

        // Återställ context
        ctx.restore()
    }
}