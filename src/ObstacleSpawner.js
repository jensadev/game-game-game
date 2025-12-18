import Obstacle from './Obstacle.js'

export default class ObstacleSpawner {
    constructor(game) {
        this.game = game
        this.spawnTimer = 0
        this.minSpawnInterval = 1200 // millisekunder
        this.maxSpawnInterval = 2500
        this.nextSpawnTime = this.getRandomSpawnTime()
        
        // Svårighetsökning
        this.difficultyTimer = 0
        this.difficultyInterval = 10000 // Öka svårighet var 10:e sekund
    }
    
    getRandomSpawnTime() {
        return Math.random() * (this.maxSpawnInterval - this.minSpawnInterval) + this.minSpawnInterval
    }
    
    update(deltaTime) {
        this.spawnTimer += deltaTime
        this.difficultyTimer += deltaTime
        
        // Öka svårighet över tid
        if (this.difficultyTimer >= this.difficultyInterval) {
            this.difficultyTimer = 0
            // Gör det svårare genom att minska spawn-intervallet
            this.minSpawnInterval = Math.max(800, this.minSpawnInterval - 100)
            this.maxSpawnInterval = Math.max(1500, this.maxSpawnInterval - 150)
        }
        
        // Spawna nytt hinder
        if (this.spawnTimer >= this.nextSpawnTime) {
            this.spawn()
            this.spawnTimer = 0
            this.nextSpawnTime = this.getRandomSpawnTime()
        }
    }
    
    spawn() {
        const types = ['rock', 'saw']
        const type = types[Math.floor(Math.random() * types.length)]
        
        let x = this.game.width
        let y = this.game.height - 48 // Ground level (48px tall platform)
        let width = 42
        let height = 42
        
        if (type === 'rock') {
            // Rock Head is 42x42
            width = 42
            height = 42
            y = y - height // Place on top of ground
        } else if (type === 'saw') {
            // Saw is 38x38
            width = 38
            height = 38
            y = y - height // Place on top of ground
        }
        
        const obstacle = new Obstacle(this.game, x, y, width, height, type)
        this.game.obstacles.push(obstacle)
        
        // Emit obstacle spawned event
        this.game.events.emit('obstacleSpawned', {
            type: type,
            position: { x, y },
            size: { width, height }
        })
    }
    
    reset() {
        this.spawnTimer = 0
        this.difficultyTimer = 0
        this.minSpawnInterval = 1200
        this.maxSpawnInterval = 2500
        this.nextSpawnTime = this.getRandomSpawnTime()
    }
}
