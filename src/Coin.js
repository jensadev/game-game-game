import GameObject from './GameObject.js'

export default class Coin extends GameObject {
    constructor(game, x, y, size = 20, value = 10) {
        super(game, x, y, size, size)
        this.size = size
        this.color = 'yellow'
        this.value = value // Poäng för detta mynt
        
        // Bob animation
        this.bobOffset = 0
        this.bobSpeed = 0.006 // hur snabbt myntet gungar
        this.bobDistance = 5 // hur långt upp/ner myntet rör sig
    }

    update(deltaTime) {
        // Gungar myntet upp och ner
        this.bobOffset += this.bobSpeed * deltaTime
    }

    draw(ctx, camera = null) {
        // Om vi har en sprite, använd den
        if (this.sprite) {
            // Beräkna y-position med bob för sprite
            const bobY = Math.sin(this.bobOffset) * this.bobDistance
            const originalY = this.y
            this.y += bobY // Tillfälligt justera y
            super.draw(ctx, camera)
            this.y = originalY // Återställ y
            return
        }
        
        // Fallback: rita myntet som en cirkel
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        // Beräkna y-position med bob
        const bobY = Math.sin(this.bobOffset) * this.bobDistance
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(screenX + this.size / 2, screenY + this.size / 2 + bobY, this.size / 2, 0, Math.PI * 2)
        ctx.fill()
    }
}
