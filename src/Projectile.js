import GameObject from './GameObject.js'

export default class Projectile extends GameObject {
    constructor(game, x, y, directionX) {
        super(game, x, y, 12, 6)
        this.directionX = directionX // -1 för vänster, 1 för höger
        this.speed = 0.5 // pixels per millisekund
        this.startX = x // Spara startposition
        this.maxDistance = 800 // Max en skärm långt
        this.color = 'orange'
        
        // Vänd spriten om den skjuts åt vänster
        this.flipX = directionX < 0
    }
    
    update(deltaTime) {
        // Flytta projektilen
        this.x += this.directionX * this.speed * deltaTime
        
        // Kolla om projektilen har flugit för långt
        const distanceTraveled = Math.abs(this.x - this.startX)
        if (distanceTraveled > this.maxDistance) {
            this.markedForDeletion = true
        }
    }
    
    draw(ctx, camera = null) {
        // Om vi har en sprite, använd den från GameObject.draw()
        if (this.sprite) {
            super.draw(ctx, camera)
            return
        }
        
        // Fallback: rita som färgad rektangel
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
    }
}
