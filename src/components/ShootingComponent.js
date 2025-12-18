import Component from './Component.js'
import Vector2 from '../Vector2.js'

/**
 * ShootingComponent - Hantera shooting logic för torn
 * 
 * Detta är den basic shooting behavior som alla shooting towers delar.
 * Hittar target, skjuter, cooldown management.
 */
export default class ShootingComponent extends Component {
    constructor(tower, config = {}) {
        super(tower)
        
        // Shooting stats (kan overridas av config)
        this.damage = config.damage || 50
        this.fireRate = config.fireRate || 1000  // ms mellan skott
        this.range = config.range || 200
        this.projectileSpeed = config.projectileSpeed || 0.6
        this.projectileColor = config.projectileColor || 'yellow'
        
        // State
        this.cooldown = 0
        this.currentTarget = null
    }
    
    update(deltaTime) {
        if (!this.enabled) return
        
        // Cooldown
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime
            return
        }
        
        // Hitta target
        this.currentTarget = this.findClosestEnemy()
        
        if (this.currentTarget) {
            this.shoot(this.currentTarget)
            this.cooldown = this.fireRate
        }
    }
    
    /**
     * Hitta närmaste enemy inom range
     */
    findClosestEnemy() {
        let closest = null
        let closestDistance = this.range
        
        const center = this.tower.position.add(
            new Vector2(this.tower.width / 2, this.tower.height / 2)
        )
        
        this.game.enemies.forEach(enemy => {
            if (enemy.health <= 0 || enemy.markedForDeletion) return
            
            const distance = center.distanceTo(enemy.position)
            if (distance < closestDistance) {
                closest = enemy
                closestDistance = distance
            }
        })
        
        return closest
    }
    
    /**
     * Skjut på target
     */
    shoot(target) {
        const center = this.tower.position.add(
            new Vector2(this.tower.width / 2, this.tower.height / 2)
        )
        
        const targetCenter = target.position.add(
            new Vector2(target.width / 2, target.height / 2)
        )
        
        const direction = targetCenter.subtract(center).normalize()
        
        // Uppdatera tower rotation (för visuals)
        this.tower.targetAngle = Math.atan2(direction.y, direction.x)
        
        // Skapa projectile
        const projectile = {
            position: center.clone(),
            velocity: direction.multiply(this.projectileSpeed),
            damage: this.damage,
            tower: this.tower,
            component: this,  // Referens till component
            width: 8,
            height: 8,
            color: this.projectileColor,
            distanceTraveled: 0,
            maxDistance: this.range * 1.5,
            markedForDeletion: false
        }
        
        this.game.projectiles.push(projectile)
        
        // Emit event
        this.game.events.emit('towerShoot', {
            tower: this.tower,
            target,
            position: center.clone()
        })
    }
    
    /**
     * Draw range circle (för debug)
     */
    draw(ctx, camera) {
        if (!this.game.inputHandler.debugMode) return
        
        const center = this.tower.position.add(
            new Vector2(this.tower.width / 2, this.tower.height / 2)
        )
        
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        
        // Range circle
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)'
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
        
        // Target line
        if (this.currentTarget && !this.currentTarget.markedForDeletion) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
            ctx.beginPath()
            ctx.moveTo(center.x - offsetX, center.y - offsetY)
            ctx.lineTo(
                this.currentTarget.position.x - offsetX,
                this.currentTarget.position.y - offsetY
            )
            ctx.stroke()
        }
    }
}
