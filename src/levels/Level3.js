import Level from './Level.js'
import Platform from '../Platform.js'
import Coin from '../Coin.js'
import Enemy from '../Enemy.js'
import Background from '../Background.js'
import BackgroundObject from '../BackgroundObject.js'
// Import your chosen background image (use greenBg, purpleBg, etc.)
import greenBg from '../assets/Pixel Adventure 1/Background/Green.png'
import bigClouds from '../assets/clouds/Big Clouds.png'
import cloud1 from '../assets/clouds/Small Cloud 1.png'
import cloud2 from '../assets/clouds/Small Cloud 2.png'
import cloud3 from '../assets/clouds/Small Cloud 3.png'

/**
 * Level 3 - Третий уровень (or your description)
 * Describe difficulty progression here
 */
export default class Level3 extends Level {
    constructor(game) {
        super(game)
        
        // Set player spawn position for this level
        this.playerSpawnX = 50
        this.playerSpawnY = 50
        
        // Initialize level
        this.init()
    }

    createBackgrounds() {
        this.backgrounds = [
            // Far background
            new Background(this.game, greenBg, {
                tiled: true,
                tileWidth: 64,
                tileHeight: 64,
                scrollSpeed: 0.3
            }),
            // Mid background
            new Background(this.game, bigClouds, {
                tiled: true,
                tileWidth: 448,
                tileHeight: 101,
                tileY: false,
                scrollSpeed: 0.6,
                yPosition: this.game.height - 141,
                height: 101
            })
        ]
    }

    createBackgroundObjects() {
        const height = this.game.height

        this.backgroundObjects = [
            new BackgroundObject(this.game, 200, height - 300, cloud1, {
                speed: 0.02,
                scrollSpeed: 0.4
            }),
            new BackgroundObject(this.game, 600, height - 250, cloud2, {
                speed: 0.015,
                scrollSpeed: 0.4
            }),
            new BackgroundObject(this.game, 1000, height - 280, cloud3, {
                speed: 0.025,
                scrollSpeed: 0.4
            }),
            new BackgroundObject(this.game, 1400, height - 320, cloud1, {
                speed: 0.02,
                scrollSpeed: 0.4
            }),
            new BackgroundObject(this.game, 1800, height - 260, cloud2, {
                speed: 0.015,
                scrollSpeed: 0.4        
            }),
            new BackgroundObject(this.game, 2200, height - 300, cloud3, {
                speed: 0.025,
                scrollSpeed: 0.4
            }),
            new BackgroundObject(this.game, 1400, height - 320, cloud1, {
                speed: 0.02,
                scrollSpeed: 0.4
            }),
            new BackgroundObject(this.game, 1800, height - 260, cloud2, {
                speed: 0.015,
                scrollSpeed: 0.4        
            }),
            new BackgroundObject(this.game, 2200, height - 300, cloud3, {
                speed: 0.025,
                scrollSpeed: 0.4
            }),

            // Add more clouds as needed
        ]
    }

    createPlatforms() {
        const height = this.game.height
        const worldWidth = this.game.worldWidth

        this.platforms = [
            // Ground (entire level)
            new Platform(this.game, 0, height - 40, worldWidth, 40, '#654321'),
            
            // Add your platforms here
            new Platform(this.game, 150, height - 140, 150, 20, '#8B4513'),
            new Platform(this.game, 400, height - 200, 120, 20, '#8B4513'),
            new Platform(this.game, 600, height - 160, 180, 20, '#8B4513'),
            new Platform(this.game, 850, height - 220, 130, 20, '#8B4513'),
            new Platform(this.game, 1100, height - 180, 160, 20, '#8B4513'),
            new Platform(this.game, 1400, height - 240, 140, 20, '#8B4513'),
            new Platform(this.game, 1700, height - 200, 200, 20, '#8B4513'),
            new Platform(this.game, 2000, height - 150, 150, 20, '#8B4513'),    
            new Platform(this.game, 2300, height - 210, 120, 20, '#8B4513'),
            new Platform(this.game, 2500, height - 170, 140, 20, '#8B4513'),    
            new Platform(this.game, 2800, height - 220, 160, 20, '#8B4513'),

            // ... more platforms
        ]
    }

    createCoins() {
        const height = this.game.height

        this.coins = [
            new Coin(this.game, 200, height - 180),
            new Coin(this.game, 240, height - 180),
            new Coin(this.game, 450, height - 240),
            new Coin(this.game, 650, height - 200),
            new Coin(this.game, 900, height - 260),
            new Coin(this.game, 1150, height - 220),
            new Coin(this.game, 1450, height - 280),
            new Coin(this.game, 1750, height - 240),
            new Coin(this.game, 2050, height - 190),
            new Coin(this.game, 2350, height - 250),
            new Coin(this.game, 2550, height - 210),
            new Coin(this.game, 2850, height - 260),
            // ... more coins
        ]
    }

    createEnemies() {
        const height = this.game.height

        this.enemies = [
            new Enemy(this.game, 200, height - 220, 40, 40, 80),
            new Enemy(this.game, 450, height - 240, 40, 40),
            // ... more enemies
        ]
    }
}