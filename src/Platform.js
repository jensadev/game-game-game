import GameObject from './GameObject.js'

export default class Platform extends GameObject {
    constructor(game, x, y, width, height, color = '#8B4513') {
        super(game, x, y, width, height)
        this.color = color
    }

    update(deltaTime) {
        // Plattformar är statiska, gör inget
    }

    draw(ctx, camera = null) {
        // Om vi har en sprite, använd den
        if (this.sprite) {
            super.draw(ctx, camera)
            return
        }
        
        // Fallback: rita plattformen som en rektangel
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
        
        // Rita en enkel kant/skugga för att ge djup
        ctx.strokeStyle = '#654321'
        ctx.lineWidth = 2
        ctx.strokeRect(screenX, screenY, this.width, this.height)
    }
}
