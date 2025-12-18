import Component from './Component.js'
import Vector2 from '../Vector2.js'

/**
 * SplashComponent - Area damage när projectile träffar
 * 
 * Modifierar ShootingComponent så att när projectile träffar,
 * skadar den alla enemies inom en radius (splash damage).
 */
export default class SplashComponent extends Component {
    constructor(tower, config = {}) {
        super(tower)
        
        this.splashRadius = config.splashRadius || 80
        this.splashDamagePercent = config.splashDamagePercent || 0.5  // 50% av main damage
        this.splashColor = config.splashColor || 'rgba(255, 165, 0, 0.5)'
        
        // Visual effects för explosions
        this.explosions = []
    }
    
    update(deltaTime) {
        if (!this.enabled) return
        
        // Uppdatera explosion animations
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i]
            explosion.lifetime += deltaTime
            
            if (explosion.lifetime > explosion.maxLifetime) {
                this.explosions.splice(i, 1)
            }
        }
    }
    
    /**
     * Called av TowerDefenseGame när projectile från detta torn träffar
     */
    onProjectileHit(projectile, hitEnemy, hitPosition) {
        const center = hitPosition || projectile.position
        
        // Skapa explosion effect
        this.explosions.push({
            position: center.clone(),
            radius: this.splashRadius,
            lifetime: 0,
            maxLifetime: 300  // 300ms animation
        })
        
        // Hitta alla enemies inom splash radius
        const enemiesInRange = this.findEnemiesInRange(center, this.splashRadius)
        
        // Applicera splash damage
        const splashDamage = Math.floor(projectile.damage * this.splashDamagePercent)
        
        enemiesInRange.forEach(enemy => {
            // Main target får full damage (redan appliced), andra får splash
            if (enemy === hitEnemy) return
            
            if (enemy.takeDamage) {
                const killed = enemy.takeDamage(splashDamage)
                
                // Om enemy dog, ge gold och score
                if (killed) {
                    this.game.gold += enemy.goldValue || 25
                    this.game.score += enemy.scoreValue || 10
                    
                    // Register kill
                    if (this.tower.registerKill) {
                        this.tower.registerKill()
                    }
                    
                    this.game.events.emit('enemyKilled', {
                        enemy,
                        tower: this.tower,
                        position: enemy.position.clone(),
                        splashKill: true
                    })
                }
                
                // Register damage
                if (this.tower.registerDamage) {
                    this.tower.registerDamage(splashDamage)
                }
            }
        })
        
        // Emit splash event
        this.game.events.emit('splashDamage', {
            tower: this.tower,
            position: center.clone(),
            radius: this.splashRadius,
            damage: splashDamage,
            enemiesHit: enemiesInRange.length
        })
    }
    
    /**
     * Hitta alla enemies inom radius från center
     */
    findEnemiesInRange(center, radius) {
        const enemies = []
        
        this.game.enemies.forEach(enemy => {
            if (enemy.health <= 0 || enemy.markedForDeletion) return
            
            const distance = center.distanceTo(enemy.position)
            if (distance <= radius) {
                enemies.push(enemy)
            }
        })
        
        return enemies
    }
    
    /**
     * Draw splash radius och explosions
     */
    draw(ctx, camera) {
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        
        // Rita explosions
        this.explosions.forEach(explosion => {
            const progress = explosion.lifetime / explosion.maxLifetime
            const alpha = 1 - progress  // Fade out
            const currentRadius = explosion.radius * (1 + progress * 0.5)  // Expand
            
            ctx.fillStyle = `rgba(255, 165, 0, ${alpha * 0.5})`
            ctx.beginPath()
            ctx.arc(
                explosion.position.x - offsetX,
                explosion.position.y - offsetY,
                currentRadius,
                0,
                Math.PI * 2
            )
            ctx.fill()
            
            // Ring
            ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(
                explosion.position.x - offsetX,
                explosion.position.y - offsetY,
                currentRadius,
                0,
                Math.PI * 2
            )
            ctx.stroke()
        })
        
        // Debug: Visa splash radius på tower
        if (this.game.inputHandler.debugMode && this.tower.components) {
            // Hitta shooting component för att få range
            const shootingComp = this.tower.components.find(c => c.constructor.name === 'ShootingComponent')
            if (shootingComp && shootingComp.currentTarget) {
                const center = this.tower.position.add(
                    new Vector2(this.tower.width / 2, this.tower.height / 2)
                )
                
                ctx.strokeStyle = 'rgba(255, 165, 0, 0.5)'
                ctx.lineWidth = 2
                ctx.setLineDash([5, 5])
                ctx.beginPath()
                ctx.arc(
                    center.x - offsetX,
                    center.y - offsetY,
                    this.splashRadius,
                    0,
                    Math.PI * 2
                )
                ctx.stroke()
                ctx.setLineDash([])
            }
        }
    }
}
