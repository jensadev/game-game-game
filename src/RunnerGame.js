import GameBase from "./GameBase.js"
import Player from "./Player.js"
import Platform from "./Platform.js"
import ObstacleSpawner from "./ObstacleSpawner.js"
import Background from "./Background.js"
import MainMenu from "./menus/MainMenu.js"
import GameOverMenu from "./menus/GameOverMenu.js"

import bgImage from "./assets/Pixel Adventure 1/Background/Blue.png"
import terrainImage from "./assets/Pixel Adventure 1/Terrain/Terrain (16x16).png"

export default class RunnerGame extends GameBase {
    constructor(width, height) {
        super(width, height)
        
        // Runner-specifika egenskaper
        this.gravity = 0.0015
        this.friction = 0.00005
        
        // Distance tracking (score)
        this.distance = 0
        this.distanceMultiplier = 0.1 // Pixels per frame
        this.playTime = 0 // Time in seconds
        
        // Game objects
        this.platforms = []
        this.obstacles = []
        this.obstacleSpawner = null
        
        // Backgrounds
        this.backgrounds = []
        
        // Kamera - fixerad på (0, 0) för runner (ingen scrolling)
        this.camera.position.set(0, 0)
        this.camera.target.set(0, 0)
        
        this.init()
    }
    
    init() {
        this.gameState = 'MENU'
        this.distance = 0
        this.score = 0
        this.playTime = 0
        
        // Skapa main menu
        this.currentMenu = new MainMenu(this, () => this.restart())
        
        // Skapa bakgrund (auto-scrolling)
        this.backgrounds = [
            new Background(this, bgImage, {
                autoScrollX: -0.05,
                tileX: true,
                tileY: true
            })
        ]
        
        // Skapa mark (tiled terrain) - 3 rows
        const groundY = this.height - 48
        this.platforms = [
            new Platform(this, 0, this.height - 48, this.width * 3, 16, '#654321', {
                src: terrainImage,
                sourceX: 112,
                sourceY: 0,
                width: 16,
                height: 16
            }),
            new Platform(this, 0, this.height - 32, this.width * 3, 16, '#654321', {
                src: terrainImage,
                sourceX: 112,
                sourceY: 16,
                width: 16,
                height: 16
            }),
            new Platform(this, 0, this.height - 16, this.width * 3, 16, '#654321', {
                src: terrainImage,
                sourceX: 112,
                sourceY: 32,
                width: 16,
                height: 16
            })
        ]
        
        // Skapa spelaren
        this.player = new Player(this, 100, this.height - 50, 50, 50, 'green')
        
        // Skapa obstacle spawner
        this.obstacleSpawner = new ObstacleSpawner(this)
        this.obstacles = []
    }
    
    restart() {
        this.gameState = 'PLAYING'
        this.currentMenu = null
        this.distance = 0
        this.score = 0
        this.playTime = 0
        
        // Återställ spelaren
        const groundY = this.height - 60
        this.player = new Player(this, 100, groundY - 50, 50, 50, 'green')
        
        // Återställ obstacles
        this.obstacles = []
        this.obstacleSpawner.reset()
    }
    
    update(deltaTime) {
        // Kolla meny-state
        if ((this.gameState === 'MENU' || this.gameState === 'GAME_OVER') && this.currentMenu) {
            this.currentMenu.update(deltaTime)
            return
        }
        
        if (this.gameState !== 'PLAYING') return
        
        // Uppdatera tid
        this.playTime += deltaTime / 1000
        
        // Uppdatera distance (score)
        this.distance += this.distanceMultiplier * deltaTime
        this.score = Math.floor(this.distance)
        
        // Uppdatera bakgrunder
        this.backgrounds.forEach(bg => bg.update(deltaTime))
        
        // Uppdatera spelaren
        this.player.update(deltaTime)
        
        // Kolla kollision med mark
        this.platforms.forEach(platform => {
            if (this.player.intersects(platform)) {
                this.player.handlePlatformCollision(platform)
            }
        })
        
        // Spawna och uppdatera obstacles
        this.obstacleSpawner.update(deltaTime)
        this.obstacles.forEach(obstacle => obstacle.update(deltaTime))
        
        // Kolla kollision med obstacles
        for (const obstacle of this.obstacles) {
            if (this.player.intersects(obstacle)) {
                this.gameOver()
                break
            }
        }
        
        // Ta bort markerade obstacles
        this.obstacles = this.obstacles.filter(o => !o.markedForDeletion)
    }
    
    draw(ctx) {
        // Rensa canvas
        ctx.fillStyle = '#87CEEB' // Ljusblå himmel
        ctx.fillRect(0, 0, this.width, this.height)
        
        // Rita bakgrunder med fixerad kamera
        this.backgrounds.forEach(bg => bg.draw(ctx, this.camera))
        
        // Rita mark
        this.platforms.forEach(platform => platform.draw(ctx, this.camera))
        
        // Rita obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(ctx, this.camera))
        
        // Rita spelaren
        this.player.draw(ctx, this.camera)
        
        // Rita UI
        this.ui.draw(ctx)
        
        // Rita meny
        if (this.currentMenu) {
            this.currentMenu.draw(ctx)
        }
    }
    
    gameOver() {
        this.gameState = 'GAME_OVER'
        
        // Skapa Game Over menu
        this.currentMenu = new GameOverMenu(
            this,
            this.score,
            this.playTime,
            () => this.restart(),
            () => this.returnToMainMenu()
        )
    }
    
    returnToMainMenu() {
        this.init()
    }
}
