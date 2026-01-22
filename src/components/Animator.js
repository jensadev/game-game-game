import Component from '../core/Component.js'

/**
 * Animator - Manages sprite animations
 * 
 * Plays animation sequences by updating sprite frames over time.
 * Works with Sprite component.
 */
export default class Animator extends Component {
    constructor() {
        super()
        this.animations = {}
        this.currentAnimation = null
        this.frameIndex = 0
        this.frameTimer = 0
    }
    
    /**
     * Add an animation
     * @param {string} name - Animation name
     * @param {string} resourceKey - Image resource key from ResourceManager
     * @param {number} frameCount - Number of frames in animation
     * @param {number} frameInterval - Milliseconds per frame
     */
    addAnimation(name, resourceKey, frameCount, frameInterval = 100) {
        this.animations[name] = {
            resourceKey,
            frameCount,
            frameInterval,
            loop: true
        }
    }
    
    /**
     * Play an animation
     * @param {string} name - Animation name
     * @param {boolean} restart - Force restart if already playing
     */
    play(name, restart = false) {
        if (!this.animations[name]) {
            console.warn(`Animation "${name}" not found`)
            return
        }
        
        // Don't restart if already playing (unless forced)
        if (this.currentAnimation === name && !restart) {
            return
        }
        
        this.currentAnimation = name
        this.frameIndex = 0
        this.frameTimer = 0
    }
    
    update(deltaTime) {
        if (!this.currentAnimation) return
        
        const anim = this.animations[this.currentAnimation]
        if (!anim) return
        
        // Only animate if more than 1 frame
        if (anim.frameCount <= 1) {
            this.frameIndex = 0
            return
        }
        
        this.frameTimer += deltaTime
        
        // Advance to next frame
        if (this.frameTimer >= anim.frameInterval) {
            this.frameTimer = 0
            this.frameIndex++
            
            // Loop animation
            if (this.frameIndex >= anim.frameCount) {
                if (anim.loop) {
                    this.frameIndex = 0
                } else {
                    this.frameIndex = anim.frameCount - 1
                }
            }
        }
        
        // Update sprite component with current frame
        const sprite = this.entity.getComponent('Sprite')
        if (sprite) {
            sprite.frameX = this.frameIndex
            
            // Update image if animation has specific resource
            if (anim.resourceKey && this.entity.game.resources) {
                const image = this.entity.game.resources.get(anim.resourceKey)
                if (image) {
                    sprite.image = image
                }
            }
        }
    }
    
    /**
     * Get current animation name
     * @returns {string|null} Animation name or null
     */
    getCurrentAnimation() {
        return this.currentAnimation
    }
}
