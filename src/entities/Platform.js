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

    draw(ctx, camera = null) {
        // Calculate screen position
        const cameraX = camera ? camera.position.x : 0
        const cameraY = camera ? camera.position.y : 0
        const screenX = this.x - cameraX
        const screenY = this.y - cameraY
        
        // Draw platform
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
        
        // Draw border for depth
        ctx.strokeStyle = '#654321'
        ctx.lineWidth = 2
        ctx.strokeRect(screenX, screenY, this.width, this.height)
    }
}
