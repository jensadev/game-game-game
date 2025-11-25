import GameObject from './GameObject.js'

export default class Platform extends GameObject {
    constructor(game, x, y, width, height, color = '#8B4513') {
        super(game, x, y, width, height)
        this.color = color
    }

    update(deltaTime) {
        // Plattformar är statiska, gör inget
    }

    draw(ctx) {
        // Rita plattformen
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        
        // Rita en enkel kant/skugga för att ge djup
        ctx.strokeStyle = '#654321'
        ctx.lineWidth = 2
        ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
}
