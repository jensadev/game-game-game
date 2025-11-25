import Player from './Player.js'
import InputHandler from './InputHandler.js'
import Rectangle from './Rectangle.js'
import Platform from './Platform.js'

export default class Game {
    constructor(width, height) {
        this.width = width
        this.height = height

        // Fysik
        this.gravity = 0.001 // pixels per millisekund^2
        this.friction = 0.00015 // luftmotstånd för att bromsa fallhastighet

        this.inputHandler = new InputHandler(this)

        this.player = new Player(this, 50, 50, 50, 50, 'green')

        // Skapa plattformar för nivån
        this.platforms = [
            // Marken
            new Platform(this, 0, this.height - 40, this.width, 40, '#654321'),
            
            // Plattformar
            new Platform(this, 150, this.height - 140, 150, 20, '#8B4513'),
            new Platform(this, 400, this.height - 200, 120, 20, '#8B4513'),
            new Platform(this, 100, this.height - 280, 100, 20, '#8B4513'),
            new Platform(this, 550, this.height - 160, 100, 20, '#8B4513'),
            new Platform(this, 350, this.height - 320, 140, 20, '#8B4513'),
        ]

        // Skapa andra objekt i spelet (valfritt)
        this.gameObjects = []
    }

    update(deltaTime) {
        // Uppdatera alla spelobjekt
        this.gameObjects.forEach(obj => obj.update(deltaTime))
        
        // Uppdatera plattformar (även om de är statiska)
        this.platforms.forEach(platform => platform.update(deltaTime))
        
        // Uppdatera spelaren
        this.player.update(deltaTime)

        // Antag att spelaren inte står på marken, tills vi hittar en kollision
        this.player.isGrounded = false

        // Kontrollera kollisioner med plattformar
        this.platforms.forEach(platform => {
            const collision = this.player.getCollisionData(platform)
            
            if (collision) {
                if (collision.direction === 'top' && this.player.velocityY > 0) {
                    // Kollision från ovan - spelaren landar på plattformen
                    this.player.y = platform.y - this.player.height
                    this.player.velocityY = 0
                    this.player.isGrounded = true
                } else if (collision.direction === 'bottom' && this.player.velocityY < 0) {
                    // Kollision från nedan - spelaren träffar huvudet
                    this.player.y = platform.y + platform.height
                    this.player.velocityY = 0
                } else if (collision.direction === 'left' && this.player.velocityX > 0) {
                    // Kollision från vänster
                    this.player.x = platform.x - this.player.width
                } else if (collision.direction === 'right' && this.player.velocityX < 0) {
                    // Kollision från höger
                    this.player.x = platform.x + platform.width
                }
            }
        })

        // Förhindra att spelaren går utanför skärmen horisontellt
        if (this.player.x < 0) {
            this.player.x = 0
        }
        if (this.player.x + this.player.width > this.width) {
            this.player.x = this.width - this.player.width
        }
    }

    draw(ctx) {
        // Rita alla plattformar
        this.platforms.forEach(platform => platform.draw(ctx))
        
        // Rita andra spelobjekt
        this.gameObjects.forEach(obj => obj.draw(ctx))
        
        // Rita spelaren
        this.player.draw(ctx)
    }
}