import GameObject from './GameObject.js'

export default class Enemy extends GameObject {
    constructor(game, x, y, width, height, patrolDistance = null) {
        super(game, x, y, width, height)
        this.color = 'red' // Röd
        
        // Fysik
        this.velocityX = 0
        this.velocityY = 0
        this.isGrounded = false
        this.useGravity = false // Stäng av gravitation för denne enemy
        
        // Patrol AI
        this.startX = x
        this.patrolDistance = patrolDistance
        this.endX = patrolDistance !== null ? x + patrolDistance : null
        this.speed = 0.1
        this.direction = 0// 1 = höger, -1 = vänster
        
        this.damage = 1 // Hur mycket skada fienden gör
        
        // Shooting system
        this.canShoot = true
        this.shootCooldown = 500 // millisekunder mellan skott
        this.shootCooldownTimer = 0

    }

    update(deltaTime) {
        // Applicera gravitation (om enabled)
        if (this.useGravity) {
            this.velocityY += this.game.gravity * deltaTime
            
            // Applicera luftmotstånd
            if (this.velocityY > 0) {
                this.velocityY -= this.game.friction * deltaTime
                if (this.velocityY < 0) this.velocityY = 0
            }
        } else {
            // Ingen gravitation - resetera Y-hastigheten
            this.velocityY = 0
            this.isGrounded = true // Alltid "på marken" utan gravitation
        }
        
        // Patruller när på marken
        if (this.isGrounded) {
            this.velocityX = this.speed * this.direction
            
            // Om vi har en patrolldistans, vänd vid ändpunkter
            if (this.patrolDistance !== null) {
                if (this.x >= this.endX) {
                    this.direction = 0
                    this.x = this.endX
                } else if (this.x <= this.startX) {
                    this.direction = 0
                    this.x = this.startX
                }
            }
            // Annars fortsätter fienden tills den kolliderar med något
        } else {
            this.velocityX = 0
        }
        
        // Uppdatera position
        this.x += this.velocityX * deltaTime
        this.y += this.velocityY * deltaTime
        
        // Uppdatera shoot cooldown
        if (!this.canShoot) {
            this.shootCooldownTimer -= deltaTime
            if (this.shootCooldownTimer <= 0) {
                this.canShoot = true
            }
        }
        
        // Skjut kontinuerligt
        if (this.canShoot) {
            this.shoot()
        }
    }

    handlePlatformCollision(platform) {
        const collision = this.getCollisionData(platform)
        
        if (collision) {
            if (collision.direction === 'top' && this.velocityY > 0) {
                // Fienden landar på plattformen
                this.y = platform.y - this.height
                this.velocityY = 0
                this.isGrounded = true
            } else if (collision.direction === 'bottom' && this.velocityY < 0) {
                // Fienden träffar huvudet
                this.y = platform.y + platform.height
                this.velocityY = 0
            } else if (collision.direction === 'left' && this.velocityX > 0) {
                // Fienden träffar vägg - vänd
                this.x = platform.x - this.width
                this.direction = -1
            } else if (collision.direction === 'right' && this.velocityX < 0) {
                // Fienden träffar vägg - vänd
                this.x = platform.x + platform.width
                this.direction = 1
            }
        }
    }
    
    handleEnemyCollision(otherEnemy) {
        if (this.intersects(otherEnemy)) {
            this.direction *= -1
        }
    }
    
    handleScreenBounds(gameWidth) {
        // Vänd vid skärmkanter (för fiender utan patrolDistance)
        if (this.patrolDistance === null) {
            if (this.x <= 0) {
                this.x = 0
                this.direction = 1
            } else if (this.x + this.width >= gameWidth) {
                this.x = gameWidth - this.width
                this.direction = -1
            }
        }
    }
    
    shoot() {
        // Skjut neråt
        const projectileX = this.x + this.width / 2
        const projectileY = this.y + this.height / 2
        
        this.game.addProjectile(projectileX, projectileY, 0, this, 1)
        //                                               ↑        ↑
        //                                        Horisontell  Vertikal (1 = ner)
        
        // Sätt cooldown
        this.canShoot = false
        this.shootCooldownTimer = this.shootCooldown
    }

    draw(ctx, camera = null) {
        // Beräkna screen position (om camera finns)
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        // Rita fienden som en röd rektangel
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
    }
}

