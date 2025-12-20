import Component from './Component.js'
import Vector2 from '../Vector2.js'

/**
 * PoisonComponent - Damage over time (DoT) effect
 * 
 * Poison Tower applicerar gift på enemies som tar damage over time.
 * Kan kombineras med ShootingComponent!
 */
export default class PoisonComponent extends Component {
    constructor(tower, config = {}) {
        super(tower)
        this.tower = this.owner  // Alias for tower-specific behavior
        
        this.poisonDuration = config.poisonDuration || 5000   // 5 sekunder
        this.poisonDamage = config.poisonDamage || 10         // Per tick
        this.tickRate = config.tickRate || 500                // 500ms mellan ticks
        this.range = config.range || 200
        
        // State
        this.poisonedEnemies = new Set()
    }
    
    update(deltaTime) {
        if (!this.enabled) return
        
        // Uppdatera poison effects på enemies
        this.poisonedEnemies.forEach(enemy => {
            if (enemy.markedForDeletion) {
                this.poisonedEnemies.delete(enemy)
                return
            }
            
            this.updatePoisonEffect(enemy, deltaTime)
        })
    }
    
    /**
     * Applicera poison på en enemy (kallas när projectile träffar)
     */
    applyPoison(enemy) {
        if (!enemy.poisonEffects) {
            enemy.poisonEffects = []
        }
        
        const effect = {
            component: this,
            damage: this.poisonDamage,
            tickRate: this.tickRate,
            tickTimer: 0,
            endTime: Date.now() + this.poisonDuration,
            tower: this.tower
        }
        
        enemy.poisonEffects.push(effect)
        this.poisonedEnemies.add(enemy)
        
        // Emit event
        this.game.events.emit('poisonApplied', {
            tower: this.tower,
            enemy,
            damage: this.poisonDamage,
            duration: this.poisonDuration
        })
    }
    
    /**
     * Uppdatera poison effect på en enemy
     */
    updatePoisonEffect(enemy, deltaTime) {
        if (!enemy.poisonEffects || enemy.poisonEffects.length === 0) {
            this.poisonedEnemies.delete(enemy)
            return
        }
        
        const now = Date.now()
        
        // Uppdatera varje poison effect
        for (let i = enemy.poisonEffects.length - 1; i >= 0; i--) {
            const effect = enemy.poisonEffects[i]
            
            // Kolla om expired
            if (effect.endTime <= now) {
                enemy.poisonEffects.splice(i, 1)
                continue
            }
            
            // Tick damage
            effect.tickTimer += deltaTime
            if (effect.tickTimer >= effect.tickRate) {
                effect.tickTimer = 0
                
                // Applicera damage
                if (enemy.takeDamage) {
                    const killed = enemy.takeDamage(effect.damage)
                    
                    if (killed) {
                        this.game.gold += enemy.goldValue || 25
                        this.game.score += enemy.scoreValue || 10
                        
                        if (this.tower.registerKill) {
                            this.tower.registerKill()
                        }
                        
                        this.game.events.emit('enemyKilled', {
                            enemy,
                            tower: this.tower,
                            position: enemy.position.clone(),
                            poisonKill: true
                        })
                        
                        this.poisonedEnemies.delete(enemy)
                        return
                    }
                    
                    if (this.tower.registerDamage) {
                        this.tower.registerDamage(effect.damage)
                    }
                }
                
                // Emit tick event
                this.game.events.emit('poisonTick', {
                    tower: effect.tower,
                    enemy,
                    damage: effect.damage
                })
            }
        }
        
        // Rensa om inga effects kvar
        if (enemy.poisonEffects.length === 0) {
            this.poisonedEnemies.delete(enemy)
        }
    }
    
    /**
     * Draw poison effects
     */
    draw(ctx, camera) {
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        
        // Rita poison cloud på poisoned enemies
        this.poisonedEnemies.forEach(enemy => {
            if (enemy.markedForDeletion) return
            
            // Poison cloud
            ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'
            ctx.beginPath()
            ctx.arc(
                enemy.position.x - offsetX,
                enemy.position.y - offsetY,
                enemy.width,
                0,
                Math.PI * 2
            )
            ctx.fill()
            
            // Poison symbol
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
            ctx.font = '16px Arial'
            ctx.fillText(
                '☠',
                enemy.position.x - offsetX - 8,
                enemy.position.y - offsetY - 25
            )
        })
        
        // Debug: Show poison range
        if (this.game.inputHandler.debugMode) {
            const center = this.tower.position.add(
                new Vector2(this.tower.width / 2, this.tower.height / 2)
            )
            
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.arc(
                center.x - offsetX,
                center.y - offsetY,
                this.range,
                0,
                Math.PI * 2
            )
            ctx.stroke()
            ctx.setLineDash([])
        }
    }
}
