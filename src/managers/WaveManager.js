import Enemy from '../Enemy.js'

/**
 * WaveManager - Manages wave spawning and progression
 * 
 * Responsibilities:
 * - Wave lifecycle (start, spawn, complete)
 * - Enemy spawning timing
 * - Wave progression and difficulty scaling
 * - Track enemies per wave
 */
export default class WaveManager {
    constructor(game, enemyPath) {
        this.game = game
        this.enemyPath = enemyPath
        
        // Wave state
        this.currentWave = 0
        this.waveInProgress = false
        this.enemiesSpawned = 0
        this.enemiesToSpawn = 0
        
        // Spawn timing
        this.spawnTimer = 0
        this.spawnInterval = 1000  // 1 second between spawns
        
        // Enemy tracking
        this.enemies = []
        
        // Listen to enemy events
        this.setupEventListeners()
    }
    
    setupEventListeners() {
        // Track when enemies die or reach end
        this.game.events.on('enemyKilled', (data) => {
            this.removeEnemy(data.enemy)
        })
        
        this.game.events.on('enemyReachedEnd', (data) => {
            this.removeEnemy(data.enemy)
        })
    }
    
    /**
     * Start a new wave
     */
    startWave() {
        if (this.waveInProgress) {
            return
        }
        
        this.currentWave++
        this.waveInProgress = true
        this.enemiesSpawned = 0
        
        // Scale enemies with wave (5 + 3 per wave)
        this.enemiesToSpawn = 5 + (this.currentWave - 1) * 3
        
        console.log(`Wave ${this.currentWave} starting! Enemies: ${this.enemiesToSpawn}`)
        
        this.game.events.emit('waveStart', {
            wave: this.currentWave,
            enemies: this.enemiesToSpawn
        })
    }
    
    /**
     * Spawn a single enemy
     */
    spawnEnemy() {
        // Enemy config scales with wave
        const config = {
            health: 100 + (this.currentWave - 1) * 20,
            speed: 0.08 + (this.currentWave - 1) * 0.01,
            gold: 25 + (this.currentWave - 1) * 5,
            score: 10 + (this.currentWave - 1) * 2,
            color: this.getEnemyColor(this.currentWave)
        }
        
        const enemy = new Enemy(this.game, this.enemyPath, config)
        this.enemies.push(enemy)
        this.enemiesSpawned++
        
        this.game.events.emit('enemySpawned', {
            enemy,
            wave: this.currentWave,
            count: this.enemiesSpawned,
            total: this.enemiesToSpawn
        })
    }
    
    /**
     * Get enemy color based on wave
     */
    getEnemyColor(wave) {
        const colors = ['red', 'orange', 'purple', 'darkred', 'crimson']
        return colors[(wave - 1) % colors.length]
    }
    
    /**
     * Remove enemy from tracking
     */
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy)
        if (index !== -1) {
            this.enemies.splice(index, 1)
        }
    }
    
    /**
     * Check if wave is complete
     */
    checkWaveComplete() {
        if (!this.waveInProgress) {
            return false
        }
        
        // All spawned and all dead/reached end?
        if (this.enemiesSpawned >= this.enemiesToSpawn && this.enemies.length === 0) {
            this.waveInProgress = false
            console.log(`Wave ${this.currentWave} complete!`)
            
            // Bonus gold for completing wave
            const bonus = 50 + this.currentWave * 10
            
            this.game.events.emit('waveComplete', {
                wave: this.currentWave,
                bonus
            })
            
            return true
        }
        
        return false
    }
    
    /**
     * Update wave spawning
     */
    update(deltaTime) {
        // Spawn enemies if wave in progress
        if (this.waveInProgress && this.enemiesSpawned < this.enemiesToSpawn) {
            this.spawnTimer += deltaTime
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnEnemy()
                this.spawnTimer = 0
            }
        }
        
        // Update all enemies
        this.enemies.forEach(enemy => {
            if (enemy.update) {
                enemy.update(deltaTime)
            }
        })
        
        // Clean up dead enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].markedForDeletion) {
                this.enemies.splice(i, 1)
            }
        }
        
        // Check if wave complete
        this.checkWaveComplete()
    }
    
    /**
     * Draw all enemies
     */
    draw(ctx, camera) {
        this.enemies.forEach(enemy => {
            if (enemy.draw) {
                enemy.draw(ctx, camera)
            }
        })
    }
    
    /**
     * Get all enemies (for targeting by towers)
     */
    getEnemies() {
        return this.enemies
    }
    
    /**
     * Reset wave manager
     */
    reset() {
        this.currentWave = 0
        this.waveInProgress = false
        this.enemiesSpawned = 0
        this.enemiesToSpawn = 0
        this.spawnTimer = 0
        this.enemies = []
    }
}
