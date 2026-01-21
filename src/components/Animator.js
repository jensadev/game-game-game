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
     * @param {Array} frames - Array of {x, y} frame coordinates
     * @param {number} frameInterval - Milliseconds per frame
     */
    addAnimation(name, frames, frameInterval = 100) {
        this.animations[name] = {
            frames,
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
        
        this.frameTimer += deltaTime
        
        // Advance to next frame
        if (this.frameTimer >= anim.frameInterval) {
            this.frameTimer = 0
            this.frameIndex++
            
            // Loop animation
            if (this.frameIndex >= anim.frames.length) {
                if (anim.loop) {
                    this.frameIndex = 0
                } else {
                    this.frameIndex = anim.frames.length - 1
                }
            }
        }
        
        // Update sprite frame
        const sprite = this.entity.getComponent('Sprite')
        if (sprite && anim.frames[this.frameIndex]) {
            const frame = anim.frames[this.frameIndex]
            sprite.setFrame(frame.x, frame.y)
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
