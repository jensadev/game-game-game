import SpriteManager from '../SpriteManager.js'
import Component from './Component.js'

/**
 * SpriteComponent - Component för att rendera sprites på GameObjects
 * 
 * Hanterar sprite loading, animation, och rendering.
 * Kan användas för towers, enemies, eller vilken GameObject som helst.
 */
export default class SpriteComponent extends Component {
    /**
     * @param {GameObject} owner - GameObject instance som äger denna component
     * @param {Object} config - Configuration object
     * @param {Object} config.sprites - Dictionary av animations: { idle: { image, frames, frameInterval } }
     * @param {string} config.defaultAnimation - Vilket animation som ska spelas default
     * @param {number} config.offsetY - Y offset för sprite rendering (default: 0)
     * @param {number} config.scale - Scale multiplier (default: 1.0)
     */
    constructor(owner, config = {}) {
        super(owner)

        // Configuration
        this.sprites = config.sprites || {}
        this.defaultAnimation = config.defaultAnimation || 'idle'
        this.offsetY = config.offsetY || 0
        this.scale = config.scale || 1.0  // Scale multiplier for rendering

        // Animation state
        this.animations = {}
        this.currentAnimation = null
        this.frameIndex = 0
        this.frameTimer = 0

        // Ladda alla sprites via SpriteManager
        this.loadSprites()

        // Sätt default animation
        this.setAnimation(this.defaultAnimation)

        // Randomize start time för naturlig visual variety
        if (this.animations[this.currentAnimation]) {
            const frameInterval = this.animations[this.currentAnimation].frameInterval
            this.frameTimer = Math.random() * frameInterval
        }
    }

    /**
     * Ladda alla sprites från config via SpriteManager
     */
    loadSprites() {
        Object.keys(this.sprites).forEach(animationName => {
            const spriteConfig = this.sprites[animationName]
            const image = SpriteManager.getImage(spriteConfig.image)

            this.animations[animationName] = {
                image: image,
                frames: spriteConfig.frames || 1,
                frameInterval: spriteConfig.frameInterval || 100,
                spriteSheet: spriteConfig.spriteSheet || null  // Optional sprite sheet config
            }
        })
    }

    /**
     * Sätt current animation
     * @param {string} name - Animation name
     */
    setAnimation(name) {
        if (name === this.currentAnimation) return
        if (!this.animations[name]) {
            console.warn(`Animation "${name}" not found`)
            return
        }

        this.currentAnimation = name
        this.frameIndex = 0
        this.frameTimer = 0
    }

    /**
     * Update animation frames
     * @param {number} deltaTime - Time since last frame (ms)
     */
    update(deltaTime) {
        if (!this.enabled || !this.currentAnimation) return

        const animation = this.animations[this.currentAnimation]
        if (!animation || animation.frames <= 1) return

        // Update frame timer
        this.frameTimer += deltaTime

        // Progress to next frame om timer har gått över interval
        if (this.frameTimer >= animation.frameInterval) {
            this.frameTimer -= animation.frameInterval
            this.frameIndex = (this.frameIndex + 1) % animation.frames
        }
    }

    /**
     * Draw sprite med rotation support
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera för world -> screen transformation
     */
    draw(ctx, camera) {
        if (!this.enabled || !this.currentAnimation) return

        const animation = this.animations[this.currentAnimation]
        if (!animation) return

        const image = animation.image

        // Fallback till primitive shapes om image inte är laddad
        if (!image || !image.complete || image.naturalWidth === 0) {
            return
        }

        // Beräkna frame dimensions
        const spriteSheet = animation.spriteSheet
        let frameWidth, frameHeight, srcX, srcY
        
        if (spriteSheet) {
            // Multi-row sprite sheet
            frameWidth = spriteSheet.frameWidth
            frameHeight = spriteSheet.frameHeight
            srcX = this.frameIndex * frameWidth
            srcY = spriteSheet.row * frameHeight
        } else {
            // Single row sprite sheet
            frameWidth = image.width / animation.frames
            frameHeight = image.height
            srcX = this.frameIndex * frameWidth
            srcY = 0
        }

        // World to screen coordinates (via camera)
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        const screenX = this.owner.position.x - offsetX
        const screenY = this.owner.position.y - offsetY + this.offsetY

        // Rita sprite (centered på owner position)
        // Sprite kan vara större än hitbox, centrera den
        const renderWidth = frameWidth * this.scale
        const renderHeight = frameHeight * this.scale
        const spriteX = screenX + this.owner.width / 2 - renderWidth / 2
        const spriteY = screenY + this.owner.height / 2 - renderHeight / 2
        
        ctx.drawImage(
            image,
            srcX, srcY,                       // Source X, Y
            frameWidth,                       // Source Width
            frameHeight,                      // Source Height
            spriteX,                          // Dest X
            spriteY,                          // Dest Y
            renderWidth,                      // Dest Width (scaled)
            renderHeight                      // Dest Height (scaled)
        )
    }

    /**
     * Fallback rendering med primitive shapes (medan sprite laddas)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     */
    drawFallback(ctx, camera) {
        // Använd tower's existing primitive rendering
        // (Detta kommer ritas av Tower.draw() själv om sprite inte finns)
    }
}