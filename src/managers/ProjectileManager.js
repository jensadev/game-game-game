import SplashComponent from '../components/SplashComponent.js'
import PoisonComponent from '../components/PoisonComponent.js'

/**
 * ProjectileManager - Manages projectile lifecycle and collisions
 * 
 * Responsibilities:
 * - Spawn projectiles from tower shoot events
 * - Update projectile physics
 * - Handle collision detection with enemies
 * - Apply damage and special effects (splash, poison)
 * - Clean up dead projectiles
 */
export default class ProjectileManager {
    constructor(game) {
        this.game = game
        
        // Projectile array
        this.projectiles = []
        
        // Setup event listeners
        this.setupEventListeners()
    }
    
    setupEventListeners() {
        // Listen for tower shoot events to spawn projectiles
        this.game.events.on('towerShoot', (data) => {
            this.addProjectile(data.projectile)
        })
    }
    
    /**
     * Add a projectile
     */
    addProjectile(projectile) {
        this.projectiles.push(projectile)
    }
    
    /**
     * Update all projectiles
     */
    update(deltaTime, enemies) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i]
            
            // Move projectile
            projectile.position.addScaled(projectile.velocity, deltaTime)
            projectile.distanceTraveled += projectile.velocity.length() * deltaTime
            
            // Check max distance
            if (projectile.distanceTraveled > projectile.maxDistance) {
                projectile.markedForDeletion = true
            }
            
            // Check collisions
            if (!projectile.markedForDeletion) {
                this.checkCollisions(projectile, enemies)
            }
            
            // Remove if marked for deletion
            if (projectile.markedForDeletion) {
                this.projectiles.splice(i, 1)
            }
        }
    }
    
    /**
     * Check projectile collision with enemies
     */
    checkCollisions(projectile, enemies) {
        for (const enemy of enemies) {
            if (enemy.markedForDeletion || enemy.health <= 0) {
                continue
            }
            
            // Simple AABB collision
            const projectileRect = {
                x: projectile.position.x - projectile.width / 2,
                y: projectile.position.y - projectile.height / 2,
                width: projectile.width,
                height: projectile.height
            }
            
            const enemyRect = {
                x: enemy.position.x - enemy.width / 2,
                y: enemy.position.y - enemy.height / 2,
                width: enemy.width,
                height: enemy.height
            }
            
            if (this.checkAABBCollision(projectileRect, enemyRect)) {
                this.handleHit(projectile, enemy)
                break
            }
        }
    }
    
    /**
     * AABB collision check
     */
    checkAABBCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
    }
    
    /**
     * Handle projectile hit
     */
    handleHit(projectile, enemy) {
        // Apply damage
        if (enemy.takeDamage) {
            const killed = enemy.takeDamage(projectile.damage)
            
            // Apply poison if tower has PoisonComponent
            if (projectile.tower) {
                const poisonComp = projectile.tower.getComponent(PoisonComponent)
                if (poisonComp) {
                    poisonComp.applyPoison(enemy)
                }
            }
            
            // If enemy died, emit event (game handles gold/score)
            if (killed) {
                // Register kill on tower
                if (projectile.tower) {
                    projectile.tower.registerKill()
                }
                
                this.game.events.emit('enemyKilled', {
                    enemy,
                    tower: projectile.tower,
                    position: enemy.position.clone()
                })
            }
            
            // Register damage on tower
            if (projectile.tower) {
                projectile.tower.registerDamage(projectile.damage)
            }
        }
        
        // Apply splash damage if tower has SplashComponent
        if (projectile.tower) {
            const splashComp = projectile.tower.getComponent(SplashComponent)
            if (splashComp) {
                splashComp.onProjectileHit(projectile, enemy, projectile.position.clone())
            }
        }
        
        // Mark projectile for deletion
        projectile.markedForDeletion = true
        
        // Emit hit event
        this.game.events.emit('projectileHit', {
            projectile,
            enemy,
            damage: projectile.damage
        })
    }
    
    /**
     * Draw all projectiles
     */
    draw(ctx, camera) {
        const offsetX = camera ? camera.position.x : 0
        const offsetY = camera ? camera.position.y : 0
        
        this.projectiles.forEach(projectile => {
            ctx.fillStyle = projectile.color || 'yellow'
            ctx.beginPath()
            ctx.arc(
                projectile.position.x - offsetX,
                projectile.position.y - offsetY,
                4,
                0,
                Math.PI * 2
            )
            ctx.fill()
        })
    }
    
    /**
     * Get all projectiles
     */
    getProjectiles() {
        return this.projectiles
    }
    
    /**
     * Reset projectile manager
     */
    reset() {
        this.projectiles = []
    }
}
