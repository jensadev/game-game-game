/**
 * CollisionManager - Centralized collision detection and response
 * 
 * Handles all collision logic so entities don't need to know about platforms.
 * Checks entity-platform collisions and resolves them properly.
 */
export default class CollisionManager {
    constructor(game) {
        this.game = game
    }
    
    /**
     * Phase 1: Update ground state BEFORE physics runs
     * This determines isGrounded so Physics can apply gravity correctly
     */
    updateGroundState() {
        // Check if player is grounded
        if (this.game.player) {
            this.updateEntityGroundState(this.game.player)
        }
        
        // Check if enemies are grounded
        if (this.game.enemies) {
            this.game.enemies.forEach(enemy => {
                this.updateEntityGroundState(enemy)
            })
        }
    }
    
    /**
     * Phase 2: Resolve collisions AFTER physics runs
     * This fixes overlaps and handles collision interactions
     */
    resolveCollisions() {
        // Resolve player vs platforms
        if (this.game.player) {
            this.resolveEntityPlatformCollisions(this.game.player)
        }
        
        // Resolve enemies vs platforms
        if (this.game.enemies) {
            this.game.enemies.forEach(enemy => {
                this.resolveEntityPlatformCollisions(enemy)
            })
        }
        
        // Player vs coins
        this.checkPlayerCoinCollisions()
        
        // Player vs enemies
        this.checkPlayerEnemyCollisions()
        
        // Projectiles vs enemies
        this.checkProjectileEnemyCollisions()
        
        // Projectiles vs platforms
        this.checkProjectilePlatformCollisions()
        
        // Enemies vs enemies (bounce off each other)
        this.checkEnemyEnemyCollisions()
    }
    
    /**
     * Check if entity is standing on ground (doesn't modify position)
     * Sets isGrounded flag for Physics to use
     */
    updateEntityGroundState(entity) {
        const physics = entity.getComponent?.('Physics')
        if (!physics) return
        
        // Check if entity is on or very close to a platform
        const groundTolerance = 2  // pixels
        let foundGround = false
        
        this.game.platforms.forEach(platform => {
            // Check if entity is above platform and close to it
            const isAbove = entity.y + entity.height <= platform.y + groundTolerance
            const isNearby = entity.y + entity.height >= platform.y - groundTolerance
            const isAlignedX = entity.x + entity.width > platform.x && entity.x < platform.x + platform.width
            
            // Entity is grounded if: on platform surface, not moving up, aligned horizontally
            if (isAbove && isNearby && isAlignedX && physics.velocity.y >= 0) {
                foundGround = true
            }
        })
        
        physics.isGrounded = foundGround
    }
    
    /**
     * Resolve entity-platform collisions by correcting overlaps
     * This runs AFTER physics has moved entities
     */
    resolveEntityPlatformCollisions(entity) {
        const physics = entity.getComponent?.('Physics')
        if (!physics) return
        
        // Check collision with each platform and resolve overlaps
        this.game.platforms.forEach(platform => {
            const collision = this.getCollisionData(entity, platform)
            
            if (collision) {
                if (collision.direction === 'top' && physics.velocity.y >= 0) {
                    // Landing on platform from above - snap to surface
                    entity.y = platform.y - entity.height
                    physics.velocity.y = 0
                } else if (collision.direction === 'bottom' && physics.velocity.y < 0) {
                    // Hit head on platform from below
                    entity.y = platform.y + platform.height
                    physics.velocity.y = 0
                } else if (collision.direction === 'left' && physics.velocity.x > 0) {
                    // Hit platform from left
                    entity.x = platform.x - entity.width
                    physics.velocity.x = 0
                } else if (collision.direction === 'right' && physics.velocity.x < 0) {
                    // Hit platform from right
                    entity.x = platform.x + platform.width
                    physics.velocity.x = 0
                }
            }
        })
    }
    
    /**
     * Check if two entities intersect
     */
    intersects(entityA, entityB) {
        const colliderA = entityA.getComponent?.('Collider')
        const colliderB = entityB.getComponent?.('Collider')
        
        if (colliderA && colliderB) {
            return colliderA.intersects(entityB)
        }
        
        // Fallback to entity bounds
        return entityA.x < entityB.x + entityB.width &&
               entityA.x + entityA.width > entityB.x &&
               entityA.y < entityB.y + entityB.height &&
               entityA.y + entityA.height > entityB.y
    }
    
    /**
     * Get collision data with direction
     */
    getCollisionData(entityA, entityB) {
        if (!this.intersects(entityA, entityB)) {
            return null
        }
        
        // Calculate overlap from each direction
        const overlapLeft = (entityA.x + entityA.width) - entityB.x
        const overlapRight = (entityB.x + entityB.width) - entityA.x
        const overlapTop = (entityA.y + entityA.height) - entityB.y
        const overlapBottom = (entityB.y + entityB.height) - entityA.y
        
        // Find minimum overlap to determine collision direction
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)
        
        // Determine direction based on minimum overlap
        if (minOverlap === overlapTop) return { direction: 'top' }
        if (minOverlap === overlapBottom) return { direction: 'bottom' }
        if (minOverlap === overlapLeft) return { direction: 'left' }
        if (minOverlap === overlapRight) return { direction: 'right' }
        
        return null
    }
    
    /**
     * Check player vs coins
     */
    checkPlayerCoinCollisions() {
        if (!this.game.player || !this.game.coins) return
        
        this.game.coins.forEach(coin => {
            if (this.intersects(this.game.player, coin) && !coin.markedForDeletion) {
                // Emit event - game will handle score
                this.game.eventBus.emit('coin:collected', {
                    value: coin.value,
                    position: { x: coin.x, y: coin.y },
                    coinType: 'gold'
                })
                coin.collect()  // Coin plays sound and marks for deletion
            }
        })
    }
    
    /**
     * Check player vs enemies
     */
    checkPlayerEnemyCollisions() {
        if (!this.game.player || !this.game.enemies) return
        
        this.game.enemies.forEach(enemy => {
            if (this.intersects(this.game.player, enemy) && !enemy.markedForDeletion) {
                this.game.player.takeDamage(enemy.damage)
            }
        })
    }
    
    /**
     * Check projectiles vs enemies
     */
    checkProjectileEnemyCollisions() {
        if (!this.game.projectiles || !this.game.enemies) return
        
        this.game.projectiles.forEach(projectile => {
            this.game.enemies.forEach(enemy => {
                if (this.intersects(projectile, enemy) && !enemy.markedForDeletion) {
                    // Emit event
                    this.game.eventBus.emit('enemy:killed', {
                        points: enemy.points || 50,
                        position: { x: enemy.x, y: enemy.y },
                        enemyType: enemy.constructor.name
                    })
                    
                    enemy.markedForDeletion = true
                    projectile.markedForDeletion = true
                    this.game.score += enemy.points || 50
                }
            })
        })
    }
    
    /**
     * Check projectiles vs platforms
     */
    checkProjectilePlatformCollisions() {
        if (!this.game.projectiles || !this.game.platforms) return
        
        this.game.projectiles.forEach(projectile => {
            this.game.platforms.forEach(platform => {
                if (this.intersects(projectile, platform)) {
                    projectile.markedForDeletion = true
                }
            })
        })
    }
    
    /**
     * Check enemies vs enemies (bounce off each other)
     */
    checkEnemyEnemyCollisions() {
        if (!this.game.enemies) return
        
        this.game.enemies.forEach((enemy, index) => {
            this.game.enemies.slice(index + 1).forEach(otherEnemy => {
                if (this.intersects(enemy, otherEnemy)) {
                    enemy.handleEnemyCollision?.(otherEnemy)
                    otherEnemy.handleEnemyCollision?.(enemy)
                }
            })
        })
    }
}
