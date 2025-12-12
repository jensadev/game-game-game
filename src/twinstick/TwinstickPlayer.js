import GameObject from "../GameObject.js"

export default class TwinstickPlayer extends GameObject {
    constructor(game, x, y, width, height, color) {
        super(game, x, y, width, height)
        this.color = color

        // Nuvarande hastighet (pixels per millisekund)
        this.velocityX = 0
        this.velocityY = 0

        // Rörelsehastighet (hur snabbt spelaren accelererar/rör sig)
        this.moveSpeed = 0.2
        this.directionX = 0
        this.directionY = 0

        // Health system
        this.maxHealth = 5
        this.health = this.maxHealth
        this.invulnerable = false // Immun mot skada efter att ha blivit träffad
        this.invulnerableTimer = 0
        this.invulnerableDuration = 1000 // 1 sekund i millisekunder
        
        // Sprite animations - no assets loaded yet, will fallback to rectangle
        // TODO: Load sprite animations here when assets are ready
        // this.loadSprite('idle', idleSprite, frameCount, frameInterval)
        // this.loadSprite('walk', walkSprite, frameCount, frameInterval)
        this.currentAnimation = 'idle'

    }

    update(deltaTime) {
        if (this.game.inputHandler.keys.has('a')) {
            this.velocityX = -this.moveSpeed
            this.directionX = -1
        } else if (this.game.inputHandler.keys.has('d')) {
            this.velocityX = this.moveSpeed
            this.directionX = 1
        } else {
            this.velocityX = 0
            this.directionX = 0
        }

        if (this.game.inputHandler.keys.has('w')) {
            this.velocityY = -this.moveSpeed
            this.directionY = -1
        } else if (this.game.inputHandler.keys.has('s')) {
            this.velocityY = this.moveSpeed
            this.directionY = 1
        } else {
            this.velocityY = 0
            this.directionY = 0
        }

        // Uppdatera position baserat på hastighet och deltaTime
        this.x += this.velocityX * deltaTime
        this.y += this.velocityY * deltaTime

        // Håll spelaren inom världens gränser
        this.x = Math.max(0, Math.min(this.x, this.game.worldWidth - this.width))
        this.y = Math.max(0, Math.min(this.y, this.game.worldHeight - this.height))
        
        // Uppdatera animation state baserat på movement
        if (this.velocityX !== 0 || this.velocityY !== 0) {
            this.setAnimation('walk')
        } else {
            this.setAnimation('idle')
        }
        
        // Uppdatera animation frame
        this.updateAnimation(deltaTime)
    }

    draw(ctx, camera) {
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        const spriteDrawn = this.drawSprite(ctx, camera, this.lastDirectionX === -1)
        if (!spriteDrawn) {
            // Fallback: Rita spelaren som en rektangel
            ctx.fillStyle = this.color
            ctx.fillRect(screenX, screenY, this.width, this.height)
        }
        
        // Rita debug-information om debug-läge är på
        if (this.game.inputHandler.debugMode) {
            this.drawDebug(ctx, camera)
            this.drawMouseLine(ctx, camera)
        }
    }

    // Rita linje från spelaren till muspekaren (debug)
    drawMouseLine(ctx, camera) {
        const centerX = this.x + this.width / 2
        const centerY = this.y + this.height / 2
        const screenCenterX = camera ? centerX - camera.x : centerX
        const screenCenterY = camera ? centerY - camera.y : centerY
        
        ctx.strokeStyle = 'cyan'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(screenCenterX, screenCenterY)
        ctx.lineTo(this.game.inputHandler.mouseX, this.game.inputHandler.mouseY)
        ctx.stroke()
    }
}