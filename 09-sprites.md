# Steg 9: Sprites och bildrendering

I detta steg ersätter vi färgade rektanglar med riktiga bilder (sprites). Detta gör spelet mer visuellt tilltalande och professionellt.

## Koncept: Sprites

En **sprite** är en 2D-bild som representerar ett spelobjekt. Istället för att rita former med Canvas-metoder laddar vi in bilder och ritar dem.

**Fördelar med sprites:**
- Professionellt utseende
- Enklare att skapa konst (pixelart, teckningar)
- Stöd för transparens (PNG)
- Lättare att animera (sprite sheets senare)

**Vad behövs:**
1. Bildhantering - ladda in bilder
2. Image rendering - rita bilder istället för former
3. Sprite assets - faktiska bildfiler

## Steg 1: Bildhanterare (ImageManager)

Skapa `src/ImageManager.js`:

```javascript
export default class ImageManager {
    constructor() {
        this.images = {}
        this.loadedCount = 0
        this.totalCount = 0
    }
    
    loadImage(name, path) {
        this.totalCount++
        
        return new Promise((resolve, reject) => {
            const img = new Image()
            
            img.onload = () => {
                this.images[name] = img
                this.loadedCount++
                resolve(img)
            }
            
            img.onerror = () => {
                console.error(`Failed to load image: ${path}`)
                reject(new Error(`Failed to load ${path}`))
            }
            
            img.src = path
        })
    }
    
    loadImages(imageData) {
        const promises = imageData.map(data => 
            this.loadImage(data.name, data.path)
        )
        return Promise.all(promises)
    }
    
    getImage(name) {
        return this.images[name]
    }
    
    isLoaded() {
        return this.loadedCount === this.totalCount
    }
    
    getProgress() {
        if (this.totalCount === 0) return 100
        return (this.loadedCount / this.totalCount) * 100
    }
}
```

### Förklaring

**Promise-baserad laddning:**
```javascript
loadImage(name, path) {
    return new Promise((resolve, reject) => {
        // Laddning sker asynkront
    })
}
```
- Bilder laddas asynkront (tar tid)
- Promise låter oss vänta på att alla bilder laddat
- `resolve()` när bilden är klar
- `reject()` om något går fel

**Image.onload:**
```javascript
img.onload = () => {
    this.images[name] = img
    this.loadedCount++
    resolve(img)
}
```
- Kallas när bilden är färdigladdad
- Sparar bilden i objekt med namn som nyckel
- Räknar upp `loadedCount`

**Promise.all:**
```javascript
loadImages(imageData) {
    const promises = imageData.map(data => 
        this.loadImage(data.name, data.path)
    )
    return Promise.all(promises)
}
```
- Laddar flera bilder samtidigt
- Väntar tills ALLA är klara
- Returnerar en Promise som blir klar när allt är laddat

## Steg 2: Skapa enkla sprites

Skapa en `public/sprites/` mapp för dina bilder.

För test kan vi börja med enkla färgade PNG-bilder eller använda placeholder:

**Alternativ 1: Skapa egna enkla sprites**
- Använd ett bildprogram (Paint, GIMP, Aseprite)
- Skapa små bilder (t.ex. 32x32 eller 50x50 pixlar)
- Spara som PNG med transparens

**Alternativ 2: Placeholder service**
```javascript
// Använd tjänst som genererar färgade bilder
// https://via.placeholder.com/50x50/00FF00/FFFFFF?text=P
```

**Rekommenderat för test:**
Skapa följande filer i `public/sprites/`:
- `player.png` (50x50, grön fyrkant med ögon)
- `enemy.png` (40x40, röd cirkel)
- `coin.png` (20x20, gul cirkel)
- `projectile.png` (12x6, orange oval)
- `platform.png` (1x1, brun - vi stretchar den)

## Steg 3: Uppdatera GameObject för sprites

Lägg till sprite-stöd i `GameObject.js`:

```javascript
export default class GameObject {
    constructor(game, x = 0, y = 0, width = 0, height = 0) {
        this.game = game
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        
        // Sprite support
        this.sprite = null
        this.flipX = false // Vänd sprite horisontellt
        
        // State
        this.active = true
        this.visible = true
    }

    setSprite(spriteName) {
        this.sprite = this.game.imageManager.getImage(spriteName)
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
    
    // ... intersects metod behålls
}
```

### Förklaring

**drawImage med scaling:**
```javascript
ctx.drawImage(image, dx, dy, dWidth, dHeight)
```
- `image`: Bilden att rita
- `dx, dy`: Position på canvas
- `dWidth, dHeight`: Storlek (kan skala bilden)

**Flippa sprite:**
```javascript
if (this.flipX) {
    ctx.translate(screenX + this.width, screenY) // Flytta till höger kant
    ctx.scale(-1, 1) // Vänd horisontellt
    ctx.drawImage(this.sprite, 0, 0, this.width, this.height)
}
```
- Används för att vända sprite (t.ex. när spelaren går åt vänster)
- `translate()`: Flyttar koordinatsystemet
- `scale(-1, 1)`: Spegelvänder X-axeln
- `save()` och `restore()`: Återställer transformationer

## Steg 4: Uppdatera Game.js

Importera ImageManager:

```javascript
import ImageManager from './ImageManager.js'
```

I konstruktorn, skapa ImageManager:

```javascript
constructor(width, height) {
    this.width = width
    this.height = height
    
    this.imageManager = new ImageManager()
    this.imagesLoaded = false
    
    // ... rest av konstruktor
}
```

Lägg till metod för att ladda bilder:

```javascript
async loadAssets() {
    const images = [
        { name: 'player', path: '/sprites/player.png' },
        { name: 'enemy', path: '/sprites/enemy.png' },
        { name: 'coin', path: '/sprites/coin.png' },
        { name: 'projectile', path: '/sprites/projectile.png' },
        { name: 'platform', path: '/sprites/platform.png' }
    ]
    
    try {
        await this.imageManager.loadImages(images)
        this.imagesLoaded = true
        console.log('All images loaded!')
    } catch (error) {
        console.error('Failed to load images:', error)
    }
}
```

I `init()`, sätt sprites på objekt efter de skapats:

```javascript
init() {
    // ... skapa player, platforms, coins, enemies
    
    // Sätt sprites om de är laddade
    if (this.imagesLoaded) {
        this.player.setSprite('player')
        
        this.platforms.forEach(platform => {
            platform.setSprite('platform')
        })
        
        this.coins.forEach(coin => {
            coin.setSprite('coin')
        })
        
        this.enemies.forEach(enemy => {
            enemy.setSprite('enemy')
        })
    }
}
```

## Steg 5: Uppdatera main.js

Ändra `setupGame` för att vänta på bilder:

```javascript
const setupGame = async (canvas) => {
    canvas.width = 854
    canvas.height = 480
    const ctx = canvas.getContext('2d')

    const game = new Game(canvas.width, canvas.height)
    
    // Visa loading screen
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff'
    ctx.font = '24px Arial'
    ctx.fillText('Loading...', canvas.width / 2 - 50, canvas.height / 2)
    
    // Ladda alla bilder innan spelet startar
    await game.loadAssets()
    
    // Nu kan vi initiera med sprites
    game.init()
    
    let lastTime = 0

    const runGame = (timeStamp) => {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.update(deltaTime)
        game.draw(ctx)
        
        requestAnimationFrame(runGame)
    }
    
    requestAnimationFrame(runGame)
}

setupGame(document.querySelector('#game'))
```

**async/await förklaring:**
```javascript
const setupGame = async (canvas) => {
    await game.loadAssets() // Väntar här tills bilderna laddat
    game.init() // Körs först EFTER bilderna är klara
}
```

## Steg 6: Uppdatera specifika klasser

### Player.js

Lägg till sprite-flipping i update:

```javascript
update(deltaTime) {
    // Horisontell rörelse
    if (this.game.inputHandler.keys.has('ArrowLeft')) {
        this.velocityX = -this.moveSpeed
        this.directionX = -1
        this.lastDirectionX = -1
        this.flipX = true // Vänd sprite åt vänster
    } else if (this.game.inputHandler.keys.has('ArrowRight')) {
        this.velocityX = this.moveSpeed
        this.directionX = 1
        this.lastDirectionX = 1
        this.flipX = false // Vänd sprite åt höger
    }
    
    // ... rest av update
}
```

Ta bort den gamla draw-metoden (ögon, mun etc) om du vill, eller behåll som fallback:

```javascript
draw(ctx, camera = null) {
    const screenX = camera ? this.x - camera.x : this.x
    const screenY = camera ? this.y - camera.y : this.y
    
    if (this.sprite) {
        // Rita sprite (använd GameObject.draw)
        super.draw(ctx, camera)
    } else {
        // Fallback: Rita som förut
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
        // ... ögon och mun
    }
}
```

### Projectile.js

Uppdatera draw för att använda sprite:

```javascript
draw(ctx, camera = null) {
    const screenX = camera ? this.x - camera.x : this.x
    const screenY = camera ? this.y - camera.y : this.y
    
    if (this.sprite) {
        // Rita med rotation baserat på riktning
        ctx.save()
        
        if (this.directionX < 0) {
            ctx.translate(screenX + this.width, screenY + this.height / 2)
            ctx.scale(-1, 1)
            ctx.drawImage(this.sprite, 0, -this.height / 2, this.width, this.height)
        } else {
            ctx.drawImage(this.sprite, screenX, screenY, this.width, this.height)
        }
        
        ctx.restore()
    } else {
        // Fallback
        ctx.fillStyle = this.color
        ctx.fillRect(screenX, screenY, this.width, this.height)
    }
}
```

I Game.js när projektil skapas:

```javascript
addProjectile(x, y, directionX) {
    const projectile = new Projectile(this, x, y, directionX)
    if (this.imagesLoaded) {
        projectile.setSprite('projectile')
    }
    this.projectiles.push(projectile)
}
```

## Viktiga koncept

### 1. Asynkron laddning

Bilder laddas inte omedelbart:

```javascript
const img = new Image()
img.src = 'player.png' // Börjar ladda
// img är INTE klar här!

img.onload = () => {
    // NU är den klar!
}
```

**Promise löser detta:**
```javascript
await loadImages() // Väntar tills alla är klara
// Nu kan vi använda bilderna!
```

### 2. drawImage parametrar

Flera sätt att använda `drawImage()`:

```javascript
// Enkel: Rita i original storlek
ctx.drawImage(img, x, y)

// Med skalning: Rita i specifik storlek
ctx.drawImage(img, x, y, width, height)

// Med clipping: Rita del av bilden (sprite sheets)
ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
```

### 3. Canvas transformationer

```javascript
ctx.save() // Spara nuvarande state
ctx.translate(x, y) // Flytta koordinatsystem
ctx.rotate(angle) // Rotera
ctx.scale(sx, sy) // Skala
// ... rita något
ctx.restore() // Återställ till sparat state
```

**Varför save/restore?**
- Transformationer är kumulativa
- Utan restore: nästa ritning påverkas också
- save/restore skapar en "bubbla" för transformationer

### 4. Sprite flipping

Istället för att ha separata bilder för vänster/höger:

```javascript
// Rita åt höger (normal)
ctx.drawImage(sprite, x, y, w, h)

// Rita åt vänster (flippat)
ctx.save()
ctx.translate(x + w, y) // Flytta till höger kant
ctx.scale(-1, 1) // Spegelvänd X
ctx.drawImage(sprite, 0, 0, w, h) // Rita på 0 (pga translate)
ctx.restore()
```

## Utmaningar

### Utmaning 1: Loading bar

Visa progress när bilder laddas:

```javascript
const loadWithProgress = async (game, ctx, canvas) => {
    const checkProgress = setInterval(() => {
        const progress = game.imageManager.getProgress()
        
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Progress bar
        const barWidth = 400
        const barHeight = 30
        const barX = (canvas.width - barWidth) / 2
        const barY = canvas.height / 2
        
        ctx.strokeStyle = '#fff'
        ctx.strokeRect(barX, barY, barWidth, barHeight)
        
        ctx.fillStyle = '#0f0'
        ctx.fillRect(barX, barY, barWidth * (progress / 100), barHeight)
        
        ctx.fillStyle = '#fff'
        ctx.font = '20px Arial'
        ctx.fillText(`${Math.floor(progress)}%`, canvas.width / 2 - 20, barY + 50)
        
    }, 100)
    
    await game.loadAssets()
    clearInterval(checkProgress)
}
```

### Utmaning 2: Sprite cache/preload

```javascript
// Preload sprites för bättre prestanda
const preloadImages = (imageArray) => {
    imageArray.forEach(src => {
        const img = new Image()
        img.src = src
    })
}

preloadImages([
    '/sprites/player.png',
    '/sprites/enemy.png',
    // ... etc
])
```

### Utmaning 3: Tiled backgrounds

Repetera en liten tile för bakgrund:

```javascript
drawBackground(ctx) {
    const tile = this.imageManager.getImage('tile')
    const tileSize = 32
    
    for (let y = 0; y < this.height; y += tileSize) {
        for (let x = 0; x < this.width; x += tileSize) {
            ctx.drawImage(tile, x, y, tileSize, tileSize)
        }
    }
}
```

### Utmaning 4: Sprite sheets (förhandsvisning)

En sprite sheet är en bild med flera frames:

```
+-----+-----+-----+-----+
| F1  | F2  | F3  | F4  |  Player animation
+-----+-----+-----+-----+
```

```javascript
drawFrame(ctx, frameIndex) {
    const frameWidth = this.sprite.width / 4 // 4 frames
    const sx = frameIndex * frameWidth
    
    ctx.drawImage(
        this.sprite,
        sx, 0, frameWidth, this.sprite.height, // Källa
        this.x, this.y, this.width, this.height // Destination
    )
}
```

## Testfrågor

1. Varför använder vi Promises för att ladda bilder?

2. Vad är skillnaden mellan `ctx.drawImage(img, x, y)` och `ctx.drawImage(img, x, y, w, h)`?

3. Förklara vad `ctx.save()` och `ctx.restore()` gör. Varför behövs de?

4. Hur flippar vi en sprite horisontellt? Vilka tre steg behövs?

5. Varför sätter vi `imagesLoaded` till true efter `loadAssets()`? Vad händer om vi inte gör det?

6. Vad händer om vi anropar `ctx.drawImage()` innan bilden är färdigladdad?

7. I `async/await`, vad betyder `await`? Vad händer på raden efter `await`?

8. Hur skulle du centera en sprite på en position istället för att rita från top-left?

9. Varför är det bra att ha en fallback (rita rektanglar) när sprites inte laddats?

10. Om en sprite är 64x64 men vi ritar den som 32x32, vad händer med bildkvaliteten?

## Nästa steg

Nu har vi sprites! Spelet ser mycket bättre ut. I nästa steg kan vi:
- Animera sprites (sprite sheet animations)
- Lägga till particle effects
- Implementera nivåladdning

Byt till nästa branch för att fortsätta!
