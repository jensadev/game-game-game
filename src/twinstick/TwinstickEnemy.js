import GameObject from "../GameObject.js"

export default class TwinstickEnemy extends GameObject {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height)
        this.color = '#FF6B6B' // Röd färg för fiender
        
        // Rörelse
        this.moveSpeed = 0.1 // Långsammare än spelaren
        this.velocityX = 0
        this.velocityY = 0
        
        // Health
        this.maxHealth = 3
        this.health = this.maxHealth
        
        // Shooting
        this.shootCooldown = 0
        this.shootCooldownDuration = 2000 // Skjuter var 2:e sekund
        this.shootRange = 300 // Skjuter bara om spelaren är inom detta avstånd
        
        // AI state
        this.state = 'idle' // idle, chase, shoot
    }
    
    update(deltaTime) {
        const player = this.game.player
        
        // Beräkna avstånd till spelaren
        const dx = player.x - this.x
        const dy = player.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Uppdatera cooldowns
        this.updateCooldown('shootCooldown', deltaTime)
        
        // AI beteende baserat på avstånd
        if (distance < this.shootRange) {
            // Inom skjutavstånd - stanna och skjut
            this.state = 'shoot'
            this.velocityX = 0
            this.velocityY = 0
            
            // Skjut om cooldown är klar
            if (this.shootCooldown <= 0) {
                this.shoot()
                this.startCooldown('shootCooldown', this.shootCooldownDuration)
            }
        } else {
            // Utanför skjutavstånd - jaga spelaren
            this.state = 'chase'
            
            // Normalisera riktningen
            const directionX = dx / distance
            const directionY = dy / distance
            
            // Rör sig mot spelaren
            this.velocityX = directionX * this.moveSpeed
            this.velocityY = directionY * this.moveSpeed
        }
        
        // Uppdatera position
        this.x += this.velocityX * deltaTime
        this.y += this.velocityY * deltaTime
    }
    
    shoot() {
        const player = this.game.player
        
        // Beräkna riktning från fienden till spelaren
        const centerX = this.x + this.width / 2
        const centerY = this.y + this.height / 2
        const playerCenterX = player.x + player.width / 2
        const playerCenterY = player.y + player.height / 2
        
        const dx = playerCenterX - centerX
        const dy = playerCenterY - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Normalisera riktningen
        const directionX = dx / distance
        const directionY = dy / distance
        
        // Skapa fiendens projektil
        this.game.addEnemyProjectile(centerX, centerY, directionX, directionY)
    }
    
    takeDamage(amount) {
        this.health -= amount
        if (this.health <= 0) {
            this.markedForDeletion = true
            // Lägg till poäng när fiende dör
            this.game.score += 100
        }
    }
    
    draw(ctx, camera) {
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        // Rita fienden som en rektangel
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
        
        // Rita kant
        ctx.strokeStyle = '#8B0000' // Mörkröd
        ctx.lineWidth = 2
        ctx.strokeRect(screenX, screenY, this.width, this.height)
        
        // Rita health bar ovanför fienden
        this.drawHealthBar(ctx, screenX, screenY)
        
        // Rita debug-information om debug-läge är på
        if (this.game.inputHandler.debugMode) {
            this.drawDebug(ctx, camera)
            
            // Rita skjutavstånd
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
            ctx.beginPath()
            ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.shootRange, 0, Math.PI * 2)
            ctx.stroke()
        }
    }
    
    drawHealthBar(ctx, screenX, screenY) {
        const barWidth = this.width
        const barHeight = 4
        const healthPercent = this.health / this.maxHealth
        
        // Bakgrund
        ctx.fillStyle = '#333'
        ctx.fillRect(screenX, screenY - 8, barWidth, barHeight)
        
        // Health
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : '#F44336'
        ctx.fillRect(screenX, screenY - 8, barWidth * healthPercent, barHeight)
    }
}
