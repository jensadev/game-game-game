import Entity from '../core/Entity.js'
import Sprite from '../components/Sprite.js'
import Collider from '../components/Collider.js'
import dingSound from '../assets/sounds/ding-402325.mp3'

export default class Coin extends Entity {
    constructor(game, x, y, size = 20, value = 10) {
        super(game, x, y, size, size)
        
        // Add Sprite component (custom draw for circle)
        const sprite = new Sprite(null, size, size)
        sprite.color = 'yellow'
        this.addComponent(sprite)
        
        // Add Collider component
        const collider = new Collider(size, size, 0, 0)
        this.addComponent(collider)
        
        // Coin properties
        this.size = size
        this.value = value
        
        // Bob animation
        this.bobOffset = 0
        this.bobSpeed = 0.006
        this.bobDistance = 5
        
        // Sound
        this.sound = new Audio(dingSound)
        this.sound.volume = 0.3
    }

    update(deltaTime) {
        // Update components
        super.update(deltaTime)
        
        // Animate bob
        this.bobOffset += this.bobSpeed * deltaTime
    }
    
    collect() {
        this.markedForDeletion = true
        // Play sound
        this.sound.currentTime = 0
        this.sound.play().catch(e => console.log('Coin sound play failed:', e))
    }

    draw(ctx, camera = null) {
        // Calculate screen position
        const cameraX = camera ? camera.position.x : 0
        const cameraY = camera ? camera.position.y : 0
        const screenX = this.x - cameraX
        const screenY = this.y - cameraY
        
        // Calculate y-position with bob
        const bobY = Math.sin(this.bobOffset) * this.bobDistance
        
        // Draw coin as circle
        const sprite = this.getComponent('Sprite')
        ctx.fillStyle = sprite?.color || 'yellow'
        ctx.beginPath()
        ctx.arc(screenX + this.size / 2, screenY + this.size / 2 + bobY, this.size / 2, 0, Math.PI * 2)
        ctx.fill()
    }
}
