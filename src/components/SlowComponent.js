import Component from './Component.js'
import Vector2 from '../Vector2.js'

/**
 * SlowComponent - Saktar ner enemies inom range
 * 
 * Ice Tower använder denna component för att applicera
 * slow effect på enemies. Kan kombineras med ShootingComponent!
 */
export default class SlowComponent extends Component {
    constructor(tower, config = {}) {
        super(tower)
        this.tower = this.owner  // Alias for tower-specific behavior
        
        this.range = config.range || 150
        this.slowAmount = config.slowAmount || 0.5  // 50% slower
        this.duration = config.duration || 3000     // 3 sekunder
        this.tickRate = config.tickRate || 500      // Kollar varje 500ms
        
        // State
        this.tickTimer = 0
        this.affectedEnemies = new Set()  // Track vilka som är slowade
    }
    
    update(deltaTime) {
        if (!this.enabled) return
        
        this.tickTimer += deltaTime
        
        if (this.tickTimer >= this.tickRate) {
            this.applySlowEffect()
            this.tickTimer = 0
        }
    }
    
    /**
     * Applicera slow effect på alla enemies inom range
     */
    applySlowEffect() {
        const center = this.tower.position.add(
            new Vector2(this.tower.width / 2, this.tower.height / 2)
        )
        
        // Get enemies from waveManager instead of game.enemies
        const enemies = this.game.waveManager ? this.game.waveManager.getEnemies() : []
        
        enemies.forEach(enemy => {
            if (enemy.health <= 0 || enemy.markedForDeletion) return
            
            const distance = center.distanceTo(enemy.position)
            
            if (distance <= this.range) {
                this.slowEnemy(enemy)
            }
        })
    }
    
    /**
     * Slow en specifik enemy
     */
    slowEnemy(enemy) {
        // Kolla om enemy redan är slowed
        if (!enemy.slowEffects) {
            enemy.slowEffects = []
        }
        
        // Lägg till slow effect
        const effect = {
            component: this,
            amount: this.slowAmount,
            endTime: Date.now() + this.duration,
            tower: this.tower
        }
        
        enemy.slowEffects.push(effect)
        this.affectedEnemies.add(enemy)
        
        // Uppdatera enemy speed modifier
        this.updateEnemySpeed(enemy)
        
        // Emit event
        this.game.events.emit('slowApplied', {
            tower: this.tower,
            enemy,
            amount: this.slowAmount,
            duration: this.duration
        })
    }
    
    /**
     * Beräkna total slow effect på enemy
     */
    updateEnemySpeed(enemy) {
        // Ta bort expired effects
        const now = Date.now()
        enemy.slowEffects = enemy.slowEffects.filter(effect => effect.endTime > now)
        
        // Hitta starkaste slow (lägsta multiplier)
        if (enemy.slowEffects.length > 0) {
            const strongestSlow = Math.min(
                ...enemy.slowEffects.map(effect => effect.amount)
            )
            enemy.speedMultiplier = strongestSlow
        } else {
            enemy.speedMultiplier = 1.0
            this.affectedEnemies.delete(enemy)
        }
    }
    
    /**
     * Draw slow effect area
     */
    draw(ctx, camera) {
        if (!this.game.inputHandler.debugMode) return
        
        const center = this.tower.position.add(
            new Vector2(this.tower.width / 2, this.tower.height / 2)
        )
        
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        
        // Slow range circle (blå)
        ctx.strokeStyle = 'rgba(100, 149, 237, 0.5)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(
            center.x - offsetX,
            center.y - offsetY,
            this.range,
            0,
            Math.PI * 2
        )
        ctx.stroke()
        
        // Snowflake effect på affected enemies
        this.affectedEnemies.forEach(enemy => {
            if (enemy.markedForDeletion) return
            
            ctx.fillStyle = 'rgba(173, 216, 230, 0.5)'
            ctx.font = '16px Arial'
            ctx.fillText(
                '❄',
                enemy.position.x - offsetX - 8,
                enemy.position.y - offsetY - 20
            )
        })
    }
}
