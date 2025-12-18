import GameObject from './GameObject.js'
import Vector2 from './Vector2.js'

/**
 * Tower - Torn som skjuter på enemies
 * 
 * Tornet hittar närmaste enemy inom range och skjuter på den.
 * För branch 23 har vi bara en basic tower typ.
 * I branch 24 kommer vi lägga till komponenter för olika tower types.
 */
export default class Tower extends GameObject {
    /**
     * @param {Object} game - Game instance
     * @param {number} x - World X position
     * @param {number} y - World Y position
     */
    constructor(game, x, y) {
        super(game, x, y, 64, 64)
        
        // Tower stats
        this.range = 200          // Skjutavstånd i pixels
        this.fireRate = 1000      // Millisekunder mellan skott
        this.damage = 50          // Skada per skott
        this.cooldown = 0         // Nuvarande cooldown
        
        // Visuellt
        this.color = 'blue'
        this.barrelColor = 'darkblue'
        this.rangeColor = 'rgba(0, 255, 255, 0.2)'
        
        // Targeting
        this.currentTarget = null
        this.targetAngle = 0      // Riktning mot target (för att rotera barrel)
        
        // Stats för UI
        this.kills = 0
        this.totalDamage = 0
    }
    
    /**
     * Uppdatera tower - hitta target och skjut
     * @param {number} deltaTime - Tid sedan förra frame
     */
    update(deltaTime) {
        // Minska cooldown
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime
        }
        
        // Hitta närmaste enemy inom range
        this.currentTarget = this.findClosestEnemy()
        
        // Om vi har target och cooldown är klar, skjut
        if (this.currentTarget && this.cooldown <= 0) {
            this.shoot(this.currentTarget)
            this.cooldown = this.fireRate
            
            // Emit event
            this.game.events.emit('towerShoot', {
                tower: this,
                target: this.currentTarget,
                position: this.position.clone()
            })
        }
        
        // Uppdatera barrel angle mot target
        if (this.currentTarget) {
            const center = this.position.add(new Vector2(this.width / 2, this.height / 2))
            const direction = this.currentTarget.position.subtract(center)
            this.targetAngle = Math.atan2(direction.y, direction.x)
        }
    }
    
    /**
     * Hitta närmaste enemy inom range
     * @returns {Object|null} Närmaste enemy eller null
     */
    findClosestEnemy() {
        if (!this.game.enemies || this.game.enemies.length === 0) {
            return null
        }
        
        let closest = null
        let closestDist = this.range
        
        const center = this.position.add(new Vector2(this.width / 2, this.height / 2))
        
        for (const enemy of this.game.enemies) {
            // Skippa döda enemies
            if (enemy.markedForDeletion || enemy.health <= 0) {
                continue
            }
            
            const dist = center.distanceTo(enemy.position)
            if (dist < closestDist) {
                closest = enemy
                closestDist = dist
            }
        }
        
        return closest
    }
    
    /**
     * Skjut projectile mot target
     * @param {Object} target - Enemy att skjuta på
     */
    shoot(target) {
        // Skapa projectile från tornets center
        const center = this.position.add(new Vector2(this.width / 2, this.height / 2))
        
        // Beräkna direction till target (använd target center)
        const targetCenter = target.position.add(new Vector2(target.width / 2, target.height / 2))
        const direction = targetCenter.subtract(center).normalize()
        
        // Skapa projectile
        const projectile = this.game.createProjectile(center, direction, this.damage, this)
        
        if (projectile) {
            this.game.projectiles.push(projectile)
        }
    }
    
    /**
     * Kallas när tower får en kill
     */
    registerKill() {
        this.kills++
    }
    
    /**
     * Kallas när tower gör skada
     * @param {number} damage - Skada som gjordes
     */
    registerDamage(damage) {
        this.totalDamage += damage
    }
    
    /**
     * Rita tower
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} [camera=null] - Optional camera
     */
    draw(ctx, camera = null) {
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        
        const screenX = this.position.x - offsetX
        const screenY = this.position.y - offsetY
        
        // Rita range (om debug mode)
        if (this.game.inputHandler.debugMode) {
            ctx.fillStyle = this.rangeColor
            ctx.beginPath()
            ctx.arc(
                screenX + this.width / 2,
                screenY + this.height / 2,
                this.range,
                0,
                Math.PI * 2
            )
            ctx.fill()
            
            // Rita range outline
            ctx.strokeStyle = 'cyan'
            ctx.lineWidth = 1
            ctx.stroke()
        }
        
        // Rita tower base (fyrkant)
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
        
        // Rita tower kant
        ctx.strokeStyle = 'darkblue'
        ctx.lineWidth = 2
        ctx.strokeRect(screenX, screenY, this.width, this.height)
        
        // Rita barrel (riktad mot target)
        ctx.save()
        ctx.translate(
            screenX + this.width / 2,
            screenY + this.height / 2
        )
        ctx.rotate(this.targetAngle)
        
        // Barrel
        ctx.fillStyle = this.barrelColor
        ctx.fillRect(0, -4, 30, 8)
        
        ctx.restore()
        
        // Rita cooldown indicator
        if (this.cooldown > 0) {
            const cooldownPercent = this.cooldown / this.fireRate
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'
            ctx.fillRect(
                screenX,
                screenY + this.height - 4,
                this.width * (1 - cooldownPercent),
                4
            )
        }
        
        // Rita target line (debug mode)
        if (this.game.inputHandler.debugMode && this.currentTarget) {
            const targetCenter = this.currentTarget.position.add(
                new Vector2(this.currentTarget.width / 2, this.currentTarget.height / 2)
            )
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(
                screenX + this.width / 2,
                screenY + this.height / 2
            )
            ctx.lineTo(
                targetCenter.x - offsetX,
                targetCenter.y - offsetY
            )
            ctx.stroke()
        }
    }
}
