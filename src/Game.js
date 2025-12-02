import Player from './Player.js'
import InputHandler from './InputHandler.js'
import Platform from './Platform.js'
import Coin from './Coin.js'
import Enemy from './Enemy.js'
import UserInterface from './UserInterface.js'
import Camera from './Camera.js'

export default class Game {
    constructor(width, height) {
        this.width = width
        this.height = height
        
        // World size (större än skärmen)
        this.worldWidth = width * 3 // 3x bredare
        this.worldHeight = height

        // Fysik
        this.gravity = 0.001 // pixels per millisekund^2
        this.friction = 0.00015 // luftmotstånd för att bromsa fallhastighet

        // Game state
        this.gameState = 'PLAYING' // PLAYING, GAME_OVER, WIN
        this.score = 0
        this.coinsCollected = 0
        this.totalCoins = 0 // Sätts när vi skapar coins

        this.inputHandler = new InputHandler(this)
        this.ui = new UserInterface(this)
        
        // Camera
        this.camera = new Camera(0, 0, width, height)
        this.camera.setWorldBounds(this.worldWidth, this.worldHeight)
        
        // Initiera spelet
        this.init()
    }
    
    init() {
        // Återställ game state
        this.gameState = 'PLAYING'
        this.score = 0
        this.coinsCollected = 0
        
        // Återställ camera
        this.camera.x = 0
        this.camera.y = 0
        this.camera.targetX = 0
        this.camera.targetY = 0

        this.player = new Player(this, 50, 50, 50, 50, 'green')

        // Skapa plattformar för nivån (utspridda över hela worldWidth)
        this.platforms = [
            // Marken (hela nivån)
            new Platform(this, 0, this.height - 40, this.worldWidth, 40, '#654321'),
            
            // Plattformar (utspridda över nivån)
            new Platform(this, 150, this.height - 140, 150, 20, '#8B4513'),
            new Platform(this, 400, this.height - 200, 120, 20, '#8B4513'),
            new Platform(this, 100, this.height - 280, 100, 20, '#8B4513'),
            new Platform(this, 550, this.height - 160, 100, 20, '#8B4513'),
            new Platform(this, 350, this.height - 320, 140, 20, '#8B4513'),
            // Nya plattformar längre bort
            new Platform(this, 900, this.height - 180, 140, 20, '#8B4513'),
            new Platform(this, 1100, this.height - 240, 120, 20, '#8B4513'),
            new Platform(this, 1300, this.height - 160, 100, 20, '#8B4513'),
            new Platform(this, 1500, this.height - 280, 150, 20, '#8B4513'),
            new Platform(this, 1750, this.height - 200, 120, 20, '#8B4513'),
            new Platform(this, 1950, this.height - 320, 140, 20, '#8B4513'),
            new Platform(this, 2150, this.height - 180, 100, 20, '#8B4513'),
        ]

        // Skapa mynt i nivån (utspridda över hela worldWidth)
        this.coins = [
            new Coin(this, 200, this.height - 180),
            new Coin(this, 240, this.height - 180),
            new Coin(this, 450, this.height - 240),
            new Coin(this, 150, this.height - 320),
            new Coin(this, 190, this.height - 320),
            new Coin(this, 600, this.height - 200),
            new Coin(this, 380, this.height - 360),
            new Coin(this, 420, this.height - 360),
            // Nya mynt längre bort
            new Coin(this, 950, this.height - 220),
            new Coin(this, 1150, this.height - 280),
            new Coin(this, 1350, this.height - 200),
            new Coin(this, 1550, this.height - 320),
            new Coin(this, 1800, this.height - 240),
            new Coin(this, 2000, this.height - 360),
            new Coin(this, 2200, this.height - 220),
        ]
        this.totalCoins = this.coins.length

        // Skapa fiender i nivån (utspridda över hela worldWidth)
        this.enemies = [
            new Enemy(this, 200, this.height - 220, 40, 40, 80),
            new Enemy(this, 450, this.height - 240, 40, 40),
            new Enemy(this, 360, this.height - 440, 40, 40, 50),
            // Nya fiender längre bort
            new Enemy(this, 1000, this.height - 220, 40, 40, 100),
            new Enemy(this, 1400, this.height - 200, 40, 40),
            new Enemy(this, 1800, this.height - 240, 40, 40, 150),
        ]

        // Skapa andra objekt i spelet (valfritt)
        this.gameObjects = []
    }
    
    restart() {
        this.init()
    }

    update(deltaTime) {
        // Kolla restart input
        if (this.inputHandler.keys.has('r') || this.inputHandler.keys.has('R')) {
            if (this.gameState === 'GAME_OVER' || this.gameState === 'WIN') {
                this.restart()
                return
            }
        }
        
        // Uppdatera bara om spelet är i PLAYING state
        if (this.gameState !== 'PLAYING') return
        
        // Uppdatera alla spelobjekt
        this.gameObjects.forEach(obj => obj.update(deltaTime))
        
        // Uppdatera plattformar (även om de är statiska)
        this.platforms.forEach(platform => platform.update(deltaTime))
        
        // Uppdatera mynt
        this.coins.forEach(coin => coin.update(deltaTime))
        
        // Uppdatera fiender
        this.enemies.forEach(enemy => enemy.update(deltaTime))
        
        // Uppdatera spelaren
        this.player.update(deltaTime)

        // Antag att spelaren inte står på marken, tills vi hittar en kollision
        this.player.isGrounded = false

        // Kontrollera kollisioner med plattformar
        this.platforms.forEach(platform => {
            this.player.handlePlatformCollision(platform)
        })

        // Kontrollera kollisioner för fiender med plattformar
        this.enemies.forEach(enemy => {
            enemy.isGrounded = false
            
            this.platforms.forEach(platform => {
                enemy.handlePlatformCollision(platform)
            })
            
            // Vänd vid world bounds istället för screen bounds
            enemy.handleScreenBounds(this.worldWidth)
        })
        
        // Kontrollera kollisioner mellan fiender
        this.enemies.forEach((enemy, index) => {
            this.enemies.slice(index + 1).forEach(otherEnemy => {
                enemy.handleEnemyCollision(otherEnemy)
                otherEnemy.handleEnemyCollision(enemy)
            })
        })

        // Kontrollera kollision med mynt
        this.coins.forEach(coin => {
            if (this.player.intersects(coin) && !coin.markedForDeletion) {
                // Plocka upp myntet
                this.score += coin.value
                this.coinsCollected++
                coin.markedForDeletion = true
            }
        })
        
        // Kontrollera kollision med fiender
        this.enemies.forEach(enemy => {
            if (this.player.intersects(enemy) && !enemy.markedForDeletion) {
                // Spelaren tar skada
                this.player.takeDamage(enemy.damage)
            }
        })
        
        // Ta bort alla objekt markerade för borttagning
        this.coins = this.coins.filter(coin => !coin.markedForDeletion)
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion)

        // Förhindra att spelaren går utöver world bounds
        if (this.player.x < 0) {
            this.player.x = 0
        }
        if (this.player.x + this.player.width > this.worldWidth) {
            this.player.x = this.worldWidth - this.player.width
        }
        
        // Uppdatera kameran för att följa spelaren
        this.camera.follow(this.player)
        this.camera.update(deltaTime)
        
        // Kolla win condition - alla mynt samlade
        if (this.coinsCollected === this.totalCoins && this.gameState === 'PLAYING') {
            this.gameState = 'WIN'
        }
        
        // Kolla lose condition - spelaren är död
        if (this.player.health <= 0 && this.gameState === 'PLAYING') {
            this.gameState = 'GAME_OVER'
        }
    }

    draw(ctx) {
        // Rita alla plattformar med camera offset
        this.platforms.forEach(platform => {
            if (this.camera.isVisible(platform)) {
                platform.draw(ctx, this.camera)
            }
        })
        
        // Rita mynt med camera offset
        this.coins.forEach(coin => {
            if (this.camera.isVisible(coin)) {
                coin.draw(ctx, this.camera)
            }
        })
        
        // Rita fiender med camera offset
        this.enemies.forEach(enemy => {
            if (this.camera.isVisible(enemy)) {
                enemy.draw(ctx, this.camera)
            }
        })
        
        // Rita andra spelobjekt med camera offset
        this.gameObjects.forEach(obj => {
            if (this.camera.isVisible(obj)) {
                obj.draw(ctx, this.camera)
            }
        })
        
        // Rita spelaren med camera offset
        this.player.draw(ctx, this.camera)
        
        // Rita UI sist (utan camera offset - alltid synligt)
        this.ui.draw(ctx)
    }
}