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
        this.image = image
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
    
    init() {
        // Default sprite size to entity size if not specified
        if (this.spriteWidth === null) this.spriteWidth = this.entity.width
        if (this.spriteHeight === null) this.spriteHeight = this.entity.height
    }
    
    draw(ctx, camera = null) {
        if (!this.image) return
        
        const cameraX = camera ? camera.x : 0
        const cameraY = camera ? camera.y : 0
        
        const drawX = this.entity.x - cameraX
        const drawY = this.entity.y - cameraY
        
        ctx.save()
        
        // Handle flipping
        if (this.flipX || this.flipY) {
            ctx.translate(
                drawX + this.spriteWidth / 2,
                drawY + this.spriteHeight / 2
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
                drawX,
                drawY,
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
