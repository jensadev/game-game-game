# Component System Architecture Design

**Version:** 2.0  
**Created:** 2026-01-21  
**Status:** Design Phase

## Document Status

**Last Verified:** 2026-01-21  
**Implementation Status:** Design Phase - Not Yet Implemented  
**Known Deviations:** None yet (design phase)

**Verification Checklist:**
- [ ] Code matches all examples
- [ ] All described classes exist
- [ ] No undocumented deviations
- [ ] Examples compile and run
- [ ] Components work as described
- [ ] Entity lifecycle tested

## Change History

| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2026-01-21 | Initial design | Component system architecture | AI + User |
| | | | |

**Note:** Update this table when implementation differs from design.

## Overview

Hybrid component-based architecture that balances flexibility with beginner-friendliness. Not full ECS (Entity-Component-System) but component-like pattern using composition over inheritance.

## Core Concepts

### Entity
Container for components. Replaces GameObject.

```javascript
class Entity {
    constructor(game, x, y) {
        this.game = game
        this.components = new Map()
        this.markedForDeletion = false
        
        // Every entity has a transform
        this.addComponent('transform', new Transform(x, y))
    }
    
    addComponent(name, component) {
        this.components.set(name, component)
        component.entity = this
        component.onAttach?.()
        return component
    }
    
    getComponent(name) {
        return this.components.get(name)
    }
    
    hasComponent(name) {
        return this.components.has(name)
    }
    
    removeComponent(name) {
        const component = this.components.get(name)
        if (component) {
            component.onDetach?.()
            this.components.delete(name)
        }
    }
    
    update(deltaTime) {
        this.components.forEach(c => {
            if (c.enabled && c.update) {
                c.update(deltaTime)
            }
        })
    }
    
    draw(ctx, camera) {
        this.components.forEach(c => {
            if (c.enabled && c.draw) {
                c.draw(ctx, camera)
            }
        })
    }
}
```

### Component
Base class for all components. Provides lifecycle hooks and entity reference.

```javascript
class Component {
    constructor() {
        this.entity = null  // Set by Entity.addComponent
        this.enabled = true
    }
    
    // Lifecycle hooks (all optional)
    onAttach() {
        // Called when added to entity
    }
    
    onDetach() {
        // Called when removed from entity
    }
    
    update(deltaTime) {
        // Called every frame
    }
    
    draw(ctx, camera) {
        // Called every frame after update
    }
}
```

## Core Components

### Transform Component
Position, velocity, and scale using Vector2.

```javascript
class Transform extends Component {
    constructor(x = 0, y = 0) {
        super()
        this.position = new Vector2(x, y)
        this.velocity = new Vector2(0, 0)
        this.scale = new Vector2(1, 1)
        this.rotation = 0  // Radians
    }
    
    update(deltaTime) {
        // Integrate velocity
        this.position.x += this.velocity.x * deltaTime
        this.position.y += this.velocity.y * deltaTime
    }
    
    // Helper methods
    translate(x, y) {
        this.position.x += x
        this.position.y += y
    }
    
    setPosition(x, y) {
        this.position.x = x
        this.position.y = y
    }
}
```

### Sprite Component
Renders a single image.

```javascript
class Sprite extends Component {
    constructor(resourceKey, width, height) {
        super()
        this.resourceKey = resourceKey
        this.width = width
        this.height = height
        this.offset = new Vector2(0, 0)
        this.flipX = false
        this.flipY = false
        this.opacity = 1.0
        this.tint = null  // Color tint (future)
    }
    
    draw(ctx, camera) {
        const transform = this.entity.getComponent('transform')
        if (!transform) return
        
        const image = this.entity.game.resources.get(this.resourceKey)
        if (!image) {
            // Fallback: draw error box
            this.drawFallback(ctx, camera, transform)
            return
        }
        
        const screenX = transform.position.x - camera.x + this.offset.x
        const screenY = transform.position.y - camera.y + this.offset.y
        
        ctx.save()
        
        // Apply opacity
        ctx.globalAlpha = this.opacity
        
        // Apply flip
        if (this.flipX || this.flipY) {
            ctx.translate(
                screenX + this.width / 2,
                screenY + this.height / 2
            )
            ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1)
            ctx.drawImage(
                image,
                -this.width / 2,
                -this.height / 2,
                this.width * transform.scale.x,
                this.height * transform.scale.y
            )
        } else {
            ctx.drawImage(
                image,
                screenX,
                screenY,
                this.width * transform.scale.x,
                this.height * transform.scale.y
            )
        }
        
        ctx.restore()
    }
    
    drawFallback(ctx, camera, transform) {
        const screenX = transform.position.x - camera.x
        const screenY = transform.position.y - camera.y
        
        ctx.fillStyle = '#ff00ff'  // Magenta error color
        ctx.fillRect(screenX, screenY, this.width, this.height)
        
        ctx.fillStyle = '#000'
        ctx.font = '10px monospace'
        ctx.fillText('?', screenX + this.width / 2 - 3, screenY + this.height / 2 + 3)
    }
}
```

### Animator Component
Frame-based sprite sheet animation.

```javascript
class Animator extends Component {
    constructor() {
        super()
        this.animations = new Map()
        this.currentAnimation = null
        this.frameIndex = 0
        this.frameTimer = 0
        this.loop = true
        this.onComplete = null
    }
    
    addAnimation(name, resourceKey, frameCount, frameTime, loop = true) {
        this.animations.set(name, {
            resourceKey,
            frameCount,
            frameTime,
            loop
        })
    }
    
    play(name, forceRestart = false) {
        if (this.currentAnimation === name && !forceRestart) return
        
        if (!this.animations.has(name)) {
            console.warn(`Animation "${name}" not found`)
            return
        }
        
        this.currentAnimation = name
        this.frameIndex = 0
        this.frameTimer = 0
        
        const anim = this.animations.get(name)
        this.loop = anim.loop
    }
    
    stop() {
        this.currentAnimation = null
        this.frameIndex = 0
        this.frameTimer = 0
    }
    
    update(deltaTime) {
        if (!this.currentAnimation) return
        
        const anim = this.animations.get(this.currentAnimation)
        if (!anim) return
        
        this.frameTimer += deltaTime
        
        if (this.frameTimer >= anim.frameTime) {
            this.frameTimer = 0
            this.frameIndex++
            
            if (this.frameIndex >= anim.frameCount) {
                if (this.loop) {
                    this.frameIndex = 0
                } else {
                    this.frameIndex = anim.frameCount - 1
                    this.onComplete?.()
                }
            }
        }
    }
    
    draw(ctx, camera) {
        if (!this.currentAnimation) return
        
        const anim = this.animations.get(this.currentAnimation)
        if (!anim) return
        
        const sprite = this.entity.getComponent('sprite')
        const transform = this.entity.getComponent('transform')
        if (!sprite || !transform) return
        
        const image = this.entity.game.resources.get(anim.resourceKey)
        if (!image) return
        
        const screenX = transform.position.x - camera.x
        const screenY = transform.position.y - camera.y
        
        // Draw current frame from horizontal sprite sheet
        ctx.drawImage(
            image,
            this.frameIndex * sprite.width,  // Source X
            0,                                // Source Y
            sprite.width,                     // Source Width
            sprite.height,                    // Source Height
            screenX,                          // Dest X
            screenY,                          // Dest Y
            sprite.width * transform.scale.x,  // Dest Width (scaled)
            sprite.height * transform.scale.y  // Dest Height (scaled)
        )
    }
}
```

### Collider Component
Axis-aligned bounding box collision detection. **Separate from sprite size!**

```javascript
class Collider extends Component {
    constructor(width, height, offsetX = 0, offsetY = 0) {
        super()
        this.width = width
        this.height = height
        this.offset = new Vector2(offsetX, offsetY)
        this.isTrigger = false  // true = no collision response, just events
        this.layer = 'default'  // Collision layer system
    }
    
    getBounds() {
        const transform = this.entity.getComponent('transform')
        if (!transform) return null
        
        return {
            x: transform.position.x + this.offset.x,
            y: transform.position.y + this.offset.y,
            width: this.width,
            height: this.height
        }
    }
    
    intersects(other) {
        const a = this.getBounds()
        const b = other.getBounds()
        
        if (!a || !b) return false
        
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y
    }
    
    getCenter() {
        const bounds = this.getBounds()
        if (!bounds) return null
        
        return new Vector2(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2
        )
    }
}
```

### Physics Component
Simple gravity and friction.

```javascript
class Physics extends Component {
    constructor() {
        super()
        this.useGravity = true
        this.gravityScale = 1.0
        this.isGrounded = false
        this.friction = 0.00015
        this.drag = 0  // Air resistance
    }
    
    update(deltaTime) {
        const transform = this.entity.getComponent('transform')
        if (!transform) return
        
        if (this.useGravity) {
            transform.velocity.y += this.entity.game.gravity * this.gravityScale * deltaTime
            
            // Apply friction to falling
            if (transform.velocity.y > 0) {
                transform.velocity.y -= this.friction * deltaTime
                transform.velocity.y = Math.max(0, transform.velocity.y)
            }
        }
        
        // Apply drag to horizontal movement
        if (this.drag > 0 && !this.isGrounded) {
            transform.velocity.x *= (1 - this.drag * deltaTime)
        }
    }
    
    applyForce(forceX, forceY) {
        const transform = this.entity.getComponent('transform')
        if (transform) {
            transform.velocity.x += forceX
            transform.velocity.y += forceY
        }
    }
}
```

## Usage Example: Player

```javascript
class Player extends Entity {
    constructor(game, x, y) {
        super(game, x, y)
        
        // Add components
        this.addComponent('sprite', new Sprite('player_idle', 32, 32))
        this.addComponent('animator', new Animator())
        this.addComponent('collider', new Collider(28, 45, 2, 3))  // Smaller than sprite!
        this.addComponent('physics', new Physics())
        
        // Setup animations
        const animator = this.getComponent('animator')
        animator.addAnimation('idle', 'player_idle_sheet', 11, 150)
        animator.addAnimation('run', 'player_run_sheet', 12, 80)
        animator.addAnimation('jump', 'player_jump_sheet', 1, 100)
        animator.play('idle')
        
        // Player-specific state
        this.moveSpeed = 0.3
        this.jumpPower = -0.6
        this.health = 3
        this.maxHealth = 3
        this.invulnerable = false
        this.lastDirectionX = 1
    }
    
    update(deltaTime) {
        // Update all components first
        super.update(deltaTime)
        
        // Then player-specific logic
        this.handleInput(deltaTime)
        this.updateAnimation()
        this.updateInvulnerability(deltaTime)
    }
    
    handleInput(deltaTime) {
        const input = this.game.inputHandler
        const transform = this.getComponent('transform')
        
        // Horizontal movement
        if (input.isKeyHeld('ArrowLeft') || input.isKeyHeld('a')) {
            transform.velocity.x = -this.moveSpeed
            this.lastDirectionX = -1
        } else if (input.isKeyHeld('ArrowRight') || input.isKeyHeld('d')) {
            transform.velocity.x = this.moveSpeed
            this.lastDirectionX = 1
        } else {
            transform.velocity.x = 0
        }
        
        // Jump (only fires once per press!)
        if (input.isKeyPressed(' ') || input.isKeyPressed('ArrowUp')) {
            this.jump()
        }
        
        // Shoot
        if (input.isKeyPressed('x') || input.isKeyPressed('X')) {
            this.shoot()
        }
    }
    
    jump() {
        const physics = this.getComponent('physics')
        if (physics.isGrounded) {
            const transform = this.getComponent('transform')
            transform.velocity.y = this.jumpPower
            physics.isGrounded = false
            
            // Emit event
            this.game.eventBus.emit('player:jump', { player: this })
        }
    }
    
    shoot() {
        const transform = this.getComponent('transform')
        const collider = this.getComponent('collider')
        
        // Calculate spawn position
        const center = collider.getCenter()
        
        // Emit event for projectile creation
        this.game.eventBus.emit('projectile:create', {
            x: center.x,
            y: center.y,
            direction: this.lastDirectionX,
            owner: this
        })
    }
    
    updateAnimation() {
        const animator = this.getComponent('animator')
        const transform = this.getComponent('transform')
        const physics = this.getComponent('physics')
        const sprite = this.getComponent('sprite')
        
        // Flip sprite based on direction
        sprite.flipX = this.lastDirectionX < 0
        
        // Choose animation based on state
        if (!physics.isGrounded) {
            if (transform.velocity.y < 0) {
                animator.play('jump')
            } else {
                animator.play('fall')
            }
        } else if (Math.abs(transform.velocity.x) > 0.01) {
            animator.play('run')
        } else {
            animator.play('idle')
        }
    }
    
    onCollision(other, collision) {
        if (other instanceof Platform) {
            this.handlePlatformCollision(other, collision)
        } else if (other instanceof Coin) {
            this.handleCoinCollect(other)
        } else if (other instanceof Enemy) {
            this.handleEnemyHit(other)
        }
    }
    
    handlePlatformCollision(platform, collision) {
        const transform = this.getComponent('transform')
        const physics = this.getComponent('physics')
        const collider = this.getComponent('collider')
        
        // Resolve collision
        if (collision.overlapY < collision.overlapX) {
            // Vertical collision
            if (transform.velocity.y > 0) {
                // Landing on top
                physics.isGrounded = true
                transform.position.y -= collision.overlapY
                transform.velocity.y = 0
            } else {
                // Hitting bottom
                transform.position.y += collision.overlapY
                transform.velocity.y = 0
            }
        } else {
            // Horizontal collision
            if (transform.velocity.x > 0) {
                transform.position.x -= collision.overlapX
            } else {
                transform.position.x += collision.overlapX
            }
            transform.velocity.x = 0
        }
    }
}
```

## Benefits

### Separation of Concerns
- Transform handles position
- Sprite handles rendering
- Collider handles collision detection
- Physics handles movement forces

### Flexibility
- Entities can have different combinations of components
- Components can be added/removed at runtime
- Easy to create new entity types

### Reusability
- Components work with any entity
- No need to duplicate code across entity types
- Behaviors can be mixed and matched

### Debugging
- Collider separate from sprite = easy hitbox debugging
- Components can be toggled on/off
- Clear responsibility boundaries

## Key Differences from Full ECS

1. **Entities have identity** - They're still classes, not just IDs
2. **Components can access entity** - Bidirectional reference
3. **Update order matters** - Components update in insertion order
4. **Game loop integration** - Entities still have update/draw methods
5. **Simpler for beginners** - Less abstraction, more intuitive

## Migration Strategy

1. Create Entity and Component classes
2. Create core components
3. Migrate one entity at a time (start with Player)
4. Keep old GameObject for reference
5. Update game loop to use new entity system
6. Remove old code when all entities migrated
