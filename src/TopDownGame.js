import GameBase from "./GameBase.js"

export default class TopDownGame extends GameBase {
    constructor(canvas) {
        super(canvas)
        
        // Justera world size för top-down spel
        this.worldWidth = canvas.width * 1.5
        this.worldHeight = canvas.height * 1.5
        this.camera.setWorldBounds(this.worldWidth, this.worldHeight)
        
        // Specifika egenskaper för TopDownGame
        this.player = null
        this.npcs = []
        this.items = []
        
        this.init()
    }

    init() {
        // Initiera spelobjekt som spelare, NPCs, items etc
    }

    restart() {
        // Återställ spelet till initial state
    }

    update(deltaTime) {
        // Uppdatera spel-logik varje frame
    }
    
    draw(ctx) {
        // Rita spelvärlden och objekt
    }
}