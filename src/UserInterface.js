export default class UserInterface {
    constructor(game) {
        this.game = game
        this.fontSize = 24
        this.fontFamily = 'Arial'
        this.textColor = '#FFFFFF'
        this.shadowColor = '#000000'
    }

    draw(ctx) {
        // Only draw HUD when playing
        if (this.game.gameState === 'PLAYING') {
            this.drawHUD(ctx)
        }
    }
    
    drawHUD(ctx) {
        ctx.save()
        
        // Konfigurera text
        ctx.font = `${this.fontSize}px ${this.fontFamily}`
        ctx.fillStyle = this.textColor
        ctx.shadowColor = this.shadowColor
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        ctx.shadowBlur = 3
        
        // Rita score
        ctx.fillText(`Score: ${this.game.score}`, 20, 40)
        
        // Rita time
        const minutes = Math.floor(this.game.playTime / 60)
        const seconds = Math.floor(this.game.playTime % 60)
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
        ctx.fillText(`Time: ${timeStr}`, 20, 70)
        
        ctx.restore()
    }
}
