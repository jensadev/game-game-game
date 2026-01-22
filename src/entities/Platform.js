import Entity from '../core/Entity.js'
import Sprite from '../components/Sprite.js'
import Collider from '../components/Collider.js'

export default class Platform extends Entity {
    constructor(game, x, y, width, height, color = '#8B4513') {
        super(game, x, y, width, height)
        
        // Add Sprite component
        const sprite = new Sprite(null, width, height)
        sprite.color = color
        this.addComponent(sprite)
        
        // Add Collider component (platforms are solid)
        const collider = new Collider(width, height, 0, 0)
        this.addComponent(collider)
        
        // Store color for custom draw
        this.color = color
    }

    update(deltaTime) {
        // Platforms are static, only update components
        super.update(deltaTime)
    }

    draw(ctx, camera) {
        // Calculate screen position
        const screenPos = camera.worldToScreen(this.x, this.y)
        
        // Draw platform
        ctx.fillStyle = this.color
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height)
        
        // Draw border for depth
        ctx.strokeStyle = '#654321'
        ctx.lineWidth = 2
        ctx.strokeRect(screenPos.x, screenPos.y, this.width, this.height)
    }
}
