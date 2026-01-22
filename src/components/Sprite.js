import Component from '../core/Component.js'

/**
 * Sprite - Renders entity visuals
 * 
 * Can have different size than collision box.
 * Supports sprite sheets and animations.
 */
export default class Sprite extends Component {
    constructor(image = null, spriteWidth = null, spriteHeight = null) {
        super()
        this._imageUrl = null
        this._imageElement = null
        this.imageLoaded = false
        
        // Set initial image if provided
        if (image) {
            this.setImage(image)
        }
        
        this.spriteWidth = spriteWidth   // Visual size (can differ from collider)
        this.spriteHeight = spriteHeight
        
        // Sprite sheet support
        this.frameX = 0
        this.frameY = 0
        this.frameWidth = 32
        this.frameHeight = 32
        
        // Flip sprite
        this.flipX = false
        this.flipY = false
    }
    
    /**
     * Set image from URL string or Image element
     */
    setImage(imageOrUrl) {
        if (!imageOrUrl) {
            this._imageUrl = null
            this._imageElement = null
            this.imageLoaded = false
            return
        }
        
        // If it's already an Image element, use it directly
        if (imageOrUrl instanceof Image || imageOrUrl instanceof HTMLImageElement) {
            this._imageElement = imageOrUrl
            this._imageUrl = imageOrUrl.src
            this.imageLoaded = imageOrUrl.complete
            return
        }
        
        // If it's a URL string, create Image element
        if (typeof imageOrUrl === 'string') {
            // Check if we already have this URL loaded
            if (this._imageUrl === imageOrUrl && this._imageElement) {
                return // Already loaded
            }
            
            this._imageUrl = imageOrUrl
            this._imageElement = new Image()
            this._imageElement.src = imageOrUrl
            this.imageLoaded = false
            
            this._imageElement.onload = () => {
                this.imageLoaded = true
            }
            
            this._imageElement.onerror = () => {
                console.error(`Failed to load sprite image: ${imageOrUrl}`)
                this.imageLoaded = false
            }
        }
    }
    
    /**
     * Get the image element (for drawing)
     */
    get image() {
        return this._imageElement
    }
    
    /**
     * Set image (supports URL strings)
     */
    set image(value) {
        this.setImage(value)
    }
    
    init() {
        // Default sprite size to entity size if not specified
        if (this.spriteWidth === null) this.spriteWidth = this.entity.width
        if (this.spriteHeight === null) this.spriteHeight = this.entity.height
    }
    
    draw(ctx, camera) {
        if (!this.image || !this.imageLoaded) return
        
        const screenPos = camera.worldToScreen(this.entity.x, this.entity.y)
        
        ctx.save()
        
        // Handle flipping
        if (this.flipX || this.flipY) {
            ctx.translate(
                screenPos.x + this.spriteWidth / 2,
                screenPos.y + this.spriteHeight / 2
            )
            ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1)
            ctx.translate(
                -this.spriteWidth / 2,
                -this.spriteHeight / 2
            )
            
            ctx.drawImage(
                this.image,
                this.frameX * this.frameWidth,
                this.frameY * this.frameHeight,
                this.frameWidth,
                this.frameHeight,
                0,
                0,
                this.spriteWidth,
                this.spriteHeight
            )
        } else {
            ctx.drawImage(
                this.image,
                this.frameX * this.frameWidth,
                this.frameY * this.frameHeight,
                this.frameWidth,
                this.frameHeight,
                screenPos.x,
                screenPos.y,
                this.spriteWidth,
                this.spriteHeight
            )
        }
        
        ctx.restore()
    }
    
    /**
     * Set sprite frame for sprite sheet
     * @param {number} frameX - Frame X index
     * @param {number} frameY - Frame Y index
     */
    setFrame(frameX, frameY) {
        this.frameX = frameX
        this.frameY = frameY
    }
}
