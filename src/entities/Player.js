import Entity from '../core/Entity.js'
import Physics from '../components/Physics.js'
import Sprite from '../components/Sprite.js'
import Animator from '../components/Animator.js'
import Collider from '../components/Collider.js'
import StateMachine from '../core/StateMachine.js'
import IdleState from './player-states/IdleState.js'
import RunningState from './player-states/RunningState.js'
import JumpingState from './player-states/JumpingState.js'
import FallingState from './player-states/FallingState.js'

import idleSprite from '../assets/Pixel Adventure 1/Main Characters/Ninja Frog/Idle (32x32).png'
import runSprite from '../assets/Pixel Adventure 1/Main Characters/Ninja Frog/Run (32x32).png'
import jumpSprite from '../assets/Pixel Adventure 1/Main Characters/Ninja Frog/Jump (32x32).png'
import fallSprite from '../assets/Pixel Adventure 1/Main Characters/Ninja Frog/Fall (32x32).png'

export default class Player extends Entity {
    constructor(game, x, y, width, height, color) {
        super(game, x, y, width, height)
        this.color = color
        
        // Register sprites in ResourceManager
        if (!game.resources) {
            console.error('ResourceManager not found in game!')
        } else {
            game.resources.add('player_idle', idleSprite)
            game.resources.add('player_run', runSprite)
            game.resources.add('player_jump', jumpSprite)
            game.resources.add('player_fall', fallSprite)
        }
        
        // Add Physics component (velocity, gravity, handles position updates)
        const physics = new Physics(0, 0)
        physics.useGravity = true
        this.addComponent(physics)
        
        // Add Sprite component (rendering)
        const sprite = new Sprite(null, width, height)
        sprite.frameWidth = 32
        sprite.frameHeight = 32
        this.addComponent(sprite)
        
        // Add Animator component (frame-based animation)
        const animator = new Animator()
        // Add animations: name, resourceKey, frameCount, frameInterval
        animator.addAnimation('idle', 'player_idle', 11, 150)
        animator.addAnimation('run', 'player_run', 12, 80)
        animator.addAnimation('jump', 'player_jump', 1, 100)
        animator.addAnimation('fall', 'player_fall', 1, 100)
        animator.play('idle')
        this.addComponent(animator)
        
        // Add Collider component (collision box, slightly smaller than sprite)
        const collider = new Collider(width - 4, height - 4, 2, 2)
        this.addComponent(collider)
        
        // Player-specific properties
        this.moveSpeed = 0.3
        this.jumpPower = -0.8
        this.lastDirectionX = 1 // Remember last direction for shooting
        
        // Health system
        this.maxHealth = 3
        this.health = this.maxHealth
        this.invulnerable = false
        this.invulnerableTimer = 0
        this.invulnerableDuration = 1000
        
        // Shooting system
        this.canShoot = true
        this.shootCooldown = 300
        this.shootCooldownTimer = 0
        
        // Setup state machine
        this.stateMachine = new StateMachine(this)
        this.stateMachine.addState('idle', new IdleState())
        this.stateMachine.addState('running', new RunningState())
        this.stateMachine.addState('jumping', new JumpingState())
        this.stateMachine.addState('falling', new FallingState())
        this.stateMachine.setState('idle')
    }

    update(deltaTime) {
        // Update all components (Physics, Sprite, Animator, Collider)
        super.update(deltaTime)
        
        // Handle input (Player's responsibility, NOT states')
        this.handleInput(deltaTime)
        
        // Determine state based on physics (NOT input)
        this.updateState()
        
        // Update state machine (handles animations only)
        this.stateMachine.update(deltaTime)
        
        // Shooting
        if ((this.game.inputHandler.isKeyPressed('x') || this.game.inputHandler.isKeyPressed('X')) && this.canShoot) {
            this.shoot()
        }
        
        // Update invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer -= deltaTime
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false
            }
        }
        
        // Update shoot cooldown
        if (!this.canShoot) {
            this.shootCooldownTimer -= deltaTime
            if (this.shootCooldownTimer <= 0) {
                this.canShoot = true
            }
        }
    }
    
    /**
     * Handle input and update physics (Player's job, not states')
     */
    handleInput(deltaTime) {
        const input = this.game.inputHandler
        const physics = this.getComponent('Physics')
        
        if (!physics) return
        
        // Horizontal movement
        if (input.isKeyHeld('ArrowLeft')) {
            physics.velocity.x = -this.moveSpeed
            this.lastDirectionX = -1
        } else if (input.isKeyHeld('ArrowRight')) {
            physics.velocity.x = this.moveSpeed
            this.lastDirectionX = 1
        } else {
            physics.velocity.x = 0
        }
        
        // Jumping (only when grounded)
        if (input.isKeyPressed(' ') && physics.isGrounded) {
            physics.velocity.y = this.jumpPower
            // Note: isGrounded will be updated by CollisionManager next frame
        }
    }
    
    /**
     * Determine state based on physics (NOT input)
     * States react to what's happening, they don't control it
     */
    updateState() {
        const physics = this.getComponent('Physics')
        if (!physics) return
        
        // Determine state based on physics state
        if (!physics.isGrounded) {
            // In air
            if (physics.velocity.y < 0) {
                this.stateMachine.setState('jumping')
            } else {
                this.stateMachine.setState('falling')
            }
        } else {
            // On ground
            if (Math.abs(physics.velocity.x) > 0.01) {
                this.stateMachine.setState('running')
            } else {
                this.stateMachine.setState('idle')
            }
        }
    }
    
    shoot() {
        // Shoot in last direction player moved
        const projectileX = this.x + this.width / 2
        const projectileY = this.y + this.height / 2
        
        this.game.addProjectile(projectileX, projectileY, this.lastDirectionX)
        
        // Set cooldown
        this.canShoot = false
        this.shootCooldownTimer = this.shootCooldown
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return
        
        this.health -= amount
        if (this.health < 0) this.health = 0
        
        // Emit event
        this.game.eventBus.emit('player:damaged', {
            amount: amount,
            source: 'enemy',
            newHealth: this.health
        })
        
        // Set invulnerability after taking damage
        this.invulnerable = true
        this.invulnerableTimer = this.invulnerableDuration
    }
    
    // Helper method for states to set animation
    setAnimation(animationName) {
        const animator = this.getComponent('Animator')
        if (animator) {
            animator.play(animationName)
        }
    }

    draw(ctx, camera = null) {
        // Blink when player is invulnerable
        if (this.invulnerable) {
            const blinkSpeed = 100
            if (Math.floor(this.invulnerableTimer / blinkSpeed) % 2 === 0) {
                return // Skip rendering this frame for blink effect
            }
        }
        
        // Update sprite flip based on direction
        const sprite = this.getComponent('Sprite')
        if (sprite) {
            sprite.flipX = this.lastDirectionX === -1
        }
        
        // Draw all components (Sprite component will handle rendering)
        super.draw(ctx, camera)
    }
}