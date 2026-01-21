import GameObject from '../core/GameObject.js'
import StateMachine from '../core/StateMachine.js'
import IdleState from './player-states/IdleState.js'
import RunningState from './player-states/RunningState.js'
import JumpingState from './player-states/JumpingState.js'
import FallingState from './player-states/FallingState.js'

import idleSprite from '../assets/Pixel Adventure 1/Main Characters/Ninja Frog/Idle (32x32).png'
import runSprite from '../assets/Pixel Adventure 1/Main Characters/Ninja Frog/Run (32x32).png'
import jumpSprite from '../assets/Pixel Adventure 1/Main Characters/Ninja Frog/Jump (32x32).png'
import fallSprite from '../assets/Pixel Adventure 1/Main Characters/Ninja Frog/Fall (32x32).png'

export default class Player extends GameObject {
    constructor(game, x, y, width, height, color) {
        super(game, x, y, width, height)
        this.color = color
        
        // Nuvarande hastighet (pixels per millisekund)
        this.velocityX = 0
        this.velocityY = 0

        // Rörelsehastighet (hur snabbt spelaren accelererar/rör sig)
        this.moveSpeed = 0.3
        this.directionX = 0
        this.directionY = 0

        // Fysik egenskaper
        this.jumpPower = -0.6 // negativ hastighet för att hoppa uppåt
        this.isGrounded = false // om spelaren står på marken
        
        // Health system
        this.maxHealth = 3
        this.health = this.maxHealth
        this.invulnerable = false // Immun mot skada efter att ha blivit träffad
        this.invulnerableTimer = 0
        this.invulnerableDuration = 1000 // 1 sekund i millisekunder
        
        // Shooting system
        this.canShoot = true
        this.shootCooldown = 300 // millisekunder mellan skott
        this.shootCooldownTimer = 0
        this.lastDirectionX = 1 // Kom ihåg senaste riktningen för skjutning
        
        // Sprite animation system - ladda sprites med olika hastigheter
        this.loadSprite('idle', idleSprite, 11, 150)  // Långsammare idle
        this.loadSprite('run', runSprite, 12, 80)     // Snabbare spring
        this.loadSprite('jump', jumpSprite, 1)
        this.loadSprite('fall', fallSprite, 1)
        
        this.currentAnimation = 'idle'
        
        // Setup state machine
        this.stateMachine = new StateMachine(this)
        this.stateMachine.addState('idle', new IdleState())
        this.stateMachine.addState('running', new RunningState())
        this.stateMachine.addState('jumping', new JumpingState())
        this.stateMachine.addState('falling', new FallingState())
        this.stateMachine.setState('idle')
    }

    update(deltaTime) {
        // Apply physics
        this.velocityY += this.game.gravity * deltaTime
        
        // Apply friction
        if (this.velocityY > 0) {
            this.velocityY -= this.game.friction * deltaTime
            if (this.velocityY < 0) this.velocityY = 0
        }

        // Update position
        this.x += this.velocityX * deltaTime
        this.y += this.velocityY * deltaTime
        
        // Update state machine (handles movement and animations)
        this.stateMachine.update(deltaTime)
        
        // Update animation frame
        this.updateAnimation(deltaTime)
        
        // Shooting
        if ((this.game.inputHandler.keys.has('x') || this.game.inputHandler.keys.has('X')) && this.canShoot) {
            this.shoot()
        }
        
        // Uppdatera invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer -= deltaTime
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false
            }
        }
        
        // Uppdatera shoot cooldown
        if (!this.canShoot) {
            this.shootCooldownTimer -= deltaTime
            if (this.shootCooldownTimer <= 0) {
                this.canShoot = true
            }
        }
    }
    
    shoot() {
        // Skjut i senaste riktningen spelaren rörde sig
        const projectileX = this.x + this.width / 2
        const projectileY = this.y + this.height / 2
        
        this.game.addProjectile(projectileX, projectileY, this.lastDirectionX)
        
        // Sätt cooldown
        this.canShoot = false
        this.shootCooldownTimer = this.shootCooldown
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return
        
        this.health -= amount
        if (this.health < 0) this.health = 0
        
        // Sätt invulnerability efter att ha tagit skada
        this.invulnerable = true
        this.invulnerableTimer = this.invulnerableDuration
    }
    
    handlePlatformCollision(platform) {
        const collision = this.getCollisionData(platform)
        
        if (collision) {
            if (collision.direction === 'top' && this.velocityY > 0) {
                // Kollision från ovan - spelaren landar på plattformen
                this.y = platform.y - this.height
                this.velocityY = 0
                this.isGrounded = true
            } else if (collision.direction === 'bottom' && this.velocityY < 0) {
                // Kollision från nedan - spelaren träffar huvudet
                this.y = platform.y + platform.height
                this.velocityY = 0
            } else if (collision.direction === 'left' && this.velocityX > 0) {
                // Kollision från vänster
                this.x = platform.x - this.width
            } else if (collision.direction === 'right' && this.velocityX < 0) {
                // Kollision från höger
                this.x = platform.x + platform.width
            }
        }
    }

    draw(ctx, camera = null) {
        // Blinka när spelaren är invulnerable
        if (this.invulnerable) {
            const blinkSpeed = 100 // millisekunder per blink
            if (Math.floor(this.invulnerableTimer / blinkSpeed) % 2 === 0) {
                return // Skippa rendering denna frame för blink-effekt
            }
        }
        
        // Beräkna screen position (om camera finns)
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        // Försök rita sprite, annars fallback till rektangel
        const spriteDrawn = this.drawSprite(ctx, camera, this.lastDirectionX === -1)
    }
}