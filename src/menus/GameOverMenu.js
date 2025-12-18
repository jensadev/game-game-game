import Menu from './Menu.js'

export default class GameOverMenu extends Menu {
    constructor(game, score, playTime, onRestart, onMainMenu) {
        super(game)
        this.score = score
        this.playTime = playTime
        this.onRestart = onRestart
        this.onMainMenu = onMainMenu
    }
    
    getTitle() {
        return 'GAME OVER'
    }
    
    getOptions() {
        return [
            {
                text: 'Restart',
                key: 'r',
                action: () => {
                    this.game.inputHandler.keys.clear()
                    this.onRestart()
                }
            },
            {
                text: 'Main Menu',
                key: 'm',
                action: () => {
                    this.game.inputHandler.keys.clear()
                    this.onMainMenu()
                }
            }
        ]
    }
    
    draw(ctx) {
        if (!this.visible) return
        
        ctx.save()
        
        // Rita halvgenomskinlig bakgrund
        ctx.fillStyle = this.backgroundColor
        ctx.fillRect(0, 0, this.game.width, this.game.height)
        
        // Rita title (GAME OVER i rött)
        ctx.fillStyle = '#FF0000'
        ctx.font = 'bold 60px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.title, this.game.width / 2, 100)
        
        // Rita score
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '36px Arial'
        ctx.fillText(`Score: ${this.score}`, this.game.width / 2, 180)
        
        // Rita time
        const minutes = Math.floor(this.playTime / 60)
        const seconds = Math.floor(this.playTime % 60)
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
        ctx.fillText(`Time: ${timeStr}`, this.game.width / 2, 230)
        
        // Rita options
        const startY = 320
        const lineHeight = 60
        
        this.options.forEach((option, index) => {
            const y = startY + index * lineHeight
            const isSelected = index === this.selectedIndex
            
            // Rita option text
            ctx.font = '32px Arial'
            ctx.fillStyle = isSelected ? this.selectedColor : this.optionColor
            
            // Lägg till ">" för vald option
            const prefix = isSelected ? '> ' : '  '
            let displayText = prefix + option.text
            
            // Lägg till key hint om det finns
            if (option.key) {
                ctx.fillText(displayText, this.game.width / 2 - 80, y)
                
                // Rita key hint i grön
                ctx.fillStyle = this.keyColor
                ctx.font = 'bold 24px Arial'
                ctx.fillText(`[${option.key}]`, this.game.width / 2 + 100, y)
            } else {
                ctx.fillText(displayText, this.game.width / 2, y)
            }
        })
        
        // Rita instruktioner längst ner
        ctx.fillStyle = '#888888'
        ctx.font = '18px Arial'
        ctx.fillText('Use Arrow Keys to navigate, Enter to select', this.game.width / 2, this.game.height - 50)
        
        ctx.restore()
    }
}
