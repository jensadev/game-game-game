import GameBase from "../GameBase.js"
import TwinstickPlayer from "./TwinstickPlayer.js"

export default class TwinstickGame extends GameBase {
    constructor(canvas) {
        super(canvas)

        // Justera world size för top-down spel
        this.worldWidth = canvas.width * 1.5
        this.worldHeight = canvas.height * 1.5
        this.camera.setWorldBounds(this.worldWidth, this.worldHeight)

        // Specifika egenskaper för TwinstickGame
        this.player = null
        this.npcs = []
        this.items = []

        this.init()
    }

    init() {
        // Initiera spelobjekt som spelare, NPCs, items etc
        this.player = new TwinstickPlayer(this, this.width / 2, this.height / 2, 32, 32, 'purple')
        // Återställ camera
        this.camera.x = 0
        this.camera.y = 0
        this.camera.targetX = 0
        this.camera.targetY = 0
    }

    restart() {
        // Återställ spelet till initial state
    }

    update(deltaTime) {
        // Uppdatera spel-logik varje frame
        this.player.update(deltaTime)

        this.camera.follow(this.player)
        this.camera.update(deltaTime)
    }

    draw(ctx) {
        // Rita debug-grid om debug-läge är på
        if (this.inputHandler.debugMode) {
            this.drawDebugGrid(ctx)
        }
        
        // Rita spelvärlden och objekt
        this.player.draw(ctx, this.camera)
    }
    
    // Rita ett 32x32 grid i världen
    drawDebugGrid(ctx) {
        const gridSize = 32
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 1
        
        // Beräkna vilka grid-linjer som är synliga på skärmen
        const startX = Math.floor(this.camera.x / gridSize) * gridSize
        const startY = Math.floor(this.camera.y / gridSize) * gridSize
        const endX = this.camera.x + this.width
        const endY = this.camera.y + this.height
        
        // Rita vertikala linjer
        for (let x = startX; x <= endX; x += gridSize) {
            const screenX = x - this.camera.x
            ctx.beginPath()
            ctx.moveTo(screenX, 0)
            ctx.lineTo(screenX, this.height)
            ctx.stroke()
        }
        
        // Rita horisontella linjer
        for (let y = startY; y <= endY; y += gridSize) {
            const screenY = y - this.camera.y
            ctx.beginPath()
            ctx.moveTo(0, screenY)
            ctx.lineTo(this.width, screenY)
            ctx.stroke()
        }
    }
}