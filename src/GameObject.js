// Basklass för alla objekt i spelet
export default class GameObject {
    constructor(game, x = 0, y = 0, width = 0, height = 0) {
        this.game = game // referens till spelet
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.markedForDeletion = false
        
        // Sprite support
        this.sprite = null
        this.flipX = false // Vänd sprite horisontellt
    }
    
    setSprite(spriteName) {
        if (this.game.imageManager) {
            this.sprite = this.game.imageManager.getImage(spriteName)
        }
    }

    draw(ctx, camera = null) {
        // Beräkna screen position
        const screenX = camera ? this.x - camera.x : this.x
        const screenY = camera ? this.y - camera.y : this.y
        
        if (this.sprite) {
            ctx.save()
            
            // Flippa om flipX är true
            if (this.flipX) {
                ctx.translate(screenX + this.width, screenY)
                ctx.scale(-1, 1)
                ctx.drawImage(this.sprite, 0, 0, this.width, this.height)
            } else {
                ctx.drawImage(this.sprite, screenX, screenY, this.width, this.height)
            }
            
            ctx.restore()
        }
    }

    // Kolla om detta objekt kolliderar med ett annat
    // AABB kollision - funkar för rektanglar
    intersects(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y
    }

    // Returnerar kollisionsdata med riktning
    getCollisionData(other) {
        if (!this.intersects(other)) return null
        
        // Beräkna överlappning från varje riktning
        const overlapLeft = (this.x + this.width) - other.x
        const overlapRight = (other.x + other.width) - this.x
        const overlapTop = (this.y + this.height) - other.y
        const overlapBottom = (other.y + other.height) - this.y
        
        // Hitta minsta överlappningen för att bestämma riktning
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)
        
        // Bestäm riktning baserat på minsta överlappningen
        if (minOverlap === overlapTop) return { direction: 'top' }
        if (minOverlap === overlapBottom) return { direction: 'bottom' }
        if (minOverlap === overlapLeft) return { direction: 'left' }
        if (minOverlap === overlapRight) return { direction: 'right' }
        
        return null
    }
}
