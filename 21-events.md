# Steg 21: Event System (Observer Pattern)

## Översikt

I detta steg implementerar vi ett **Event System** baserat på Observer Pattern. Detta ger oss **loose coupling** mellan objekt - objekt kan kommunicera utan att ha direkta referenser till varandra.

## Varför Event System?

### Problem utan events:

```javascript
// ❌ Tight coupling - Player känner till RunnerGame
if (this.player.intersects(obstacle)) {
    this.gameOver()  // Direkt anrop
}

// ❌ Svårt att lägga till nya features
// För att lägga till ljud-effekter måste vi ändra i Player.js
// För att lägga till partiklar måste vi ändra i RunnerGame.js
```

### Lösning med events:

```javascript
// ✅ Loose coupling - Obstacle känner inte till vem som lyssnar
this.events.emit('obstacleHit', { obstacle, player, score, time })

// ✅ Lätt att lägga till nya features
this.events.on('obstacleHit', () => this.audioManager.play('hit'))
this.events.on('obstacleHit', () => this.particles.emit('explosion'))
this.events.on('obstacleHit', () => this.gameOver())
```

---

## EventEmitter Implementation

[`src/EventEmitter.js`](src/EventEmitter.js) - Komplett Observer Pattern:

```javascript
export default class EventEmitter {
    constructor() {
        this.events = new Map()  // eventName -> array of listeners
    }
    
    // Subscribe to events
    on(eventName, callback, context = null)
    once(eventName, callback, context = null)  // Auto-unsubscribe after first call
    
    // Unsubscribe
    off(eventName, callback)
    clear(eventName = null)  // Clear specific event or all
    
    // Emit events
    emit(eventName, data = null)
    
    // Query
    hasListeners(eventName)
    listenerCount(eventName)
    eventNames()
}
```

### Viktiga features:

**1. Error handling:**
```javascript
emit(eventName, data = null) {
    for (const { callback, context } of listeners) {
        try {
            callback.call(context, data)
        } catch (error) {
            console.error(`Error in listener for '${eventName}':`, error)
        }
    }
}
```
Om en listener krashar påverkar det inte andra listeners.

**2. Safe iteration:**
```javascript
// Skapar kopia av listeners för att undvika problem
// om en listener tar bort sig själv under execution
const listenersCopy = [...listeners]
```

**3. Context binding:**
```javascript
// Kan specifica 'this' context för callbacks
this.events.on('jump', this.handleJump, this)
```

---

## Integration i GameBase

EventEmitter är centralt placerat i GameBase:

```javascript
export default class GameBase {
    constructor(width, height) {
        // ...
        
        // Event system - centralt för loose coupling
        this.events = new EventEmitter()
        
        // ...
    }
}
```

Nu har alla spel som extends GameBase tillgång till event systemet via `this.events`.

---

## Events i RunnerGame

### Setup Event Listeners

I RunnerGame constructor setup:

```javascript
setupEventListeners() {
    // Collision event
    this.events.on('obstacleHit', (data) => {
        console.log('Obstacle hit!', data)
        this.gameOver()
    })
    
    // Score milestones
    this.events.on('scoreMilestone', (data) => {
        console.log(`Score milestone reached: ${data.score}`)
    })
    
    // Debug events
    this.events.on('obstacleSpawned', (data) => {
        if (this.debug) {
            console.log('Obstacle spawned:', data.type)
        }
    })
    
    this.events.on('playerJump', () => {
        if (this.debug) console.log('Player jumped!')
    })
    
    this.events.on('playerLanded', () => {
        if (this.debug) console.log('Player landed!')
    })
}
```

### Emit Events

**Collision detection:**
```javascript
// update() method
for (const obstacle of this.obstacles) {
    if (this.player.intersects(obstacle)) {
        // ✅ Emit event instead of direct call
        this.events.emit('obstacleHit', { 
            obstacle: obstacle,
            player: this.player,
            score: this.score,
            time: this.playTime
        })
        break
    }
}
```

**Score milestones:**
```javascript
// Track when score crosses 100-point boundaries
const oldScore = this.score
this.distance += this.distanceMultiplier * deltaTime
this.score = Math.floor(this.distance)

if (Math.floor(oldScore / 100) < Math.floor(this.score / 100)) {
    this.events.emit('scoreMilestone', { score: this.score })
}
```

---

## Events i Player

**Jump event:**
```javascript
update(deltaTime) {
    if ((keys.has(' ') || keys.has('ArrowUp')) && this.isGrounded) {
        this.velocity.y = this.jumpPower
        this.isGrounded = false
        
        // ✅ Emit jump event
        this.game.events.emit('playerJump', {
            position: this.position.clone(),
            velocity: this.velocity.clone()
        })
    }
}
```

**Landed event:**
```javascript
handlePlatformCollision(platform) {
    if (collision.direction === 'top' && this.velocity.y > 0) {
        const wasGrounded = this.isGrounded
        this.position.y = platform.position.y - this.height
        this.velocity.y = 0
        this.isGrounded = true
        
        // ✅ Emit landed event (only if wasn't grounded before)
        if (!wasGrounded) {
            this.game.events.emit('playerLanded', {
                position: this.position.clone()
            })
        }
    }
}
```

**Viktigt:** Använd `clone()` för Vector2 när du skickar events för att undvika referens-problem.

---

## Events i ObstacleSpawner

```javascript
spawn() {
    // ... create obstacle ...
    
    this.game.obstacles.push(obstacle)
    
    // ✅ Emit spawned event
    this.game.events.emit('obstacleSpawned', {
        type: type,
        position: { x, y },
        size: { width, height }
    })
}
```

---

## Event-driven Architecture

### Före (Tight Coupling):

```
Player ──────> RunnerGame.gameOver()
    └──────> AudioManager.play()
    └──────> ParticleSystem.emit()
```
Player måste känna till alla system.

### Efter (Loose Coupling):

```
Player ──> emit('obstacleHit')
                    │
                    ├──> RunnerGame.gameOver()
                    ├──> AudioManager.play()
                    └──> ParticleSystem.emit()
```
Player känner bara till event systemet. Nya features kan läggas till utan att ändra Player.

---

## Event Naming Conventions

**Rekommenderade patterns:**

```javascript
// Noun + past tense verb (händelse har inträffat)
'obstacleHit'
'playerLanded'
'enemyDestroyed'
'coinCollected'

// Progressive (händer nu)
'playerJumping'
'gameStarting'

// State changes
'gameStateChanged'
'healthChanged'

// Milestones
'scoreMilestone'
'levelComplete'
```

**Undvik:**
```javascript
// ❌ För generiskt
'update'
'change'

// ❌ Verbs i imperativ (låter som kommandon)
'jump'
'destroy'
```

---

## Best Practices

### 1. Clone objects när du emitar

```javascript
// ❌ BAD - skickar referens
this.events.emit('jump', { position: this.position })

// ✅ GOOD - skickar kopia
this.events.emit('jump', { position: this.position.clone() })
```

### 2. Använd once() för one-time events

```javascript
// Lyssna bara på första collision
this.events.once('obstacleHit', () => {
    console.log('First hit!')
})
```

### 3. Cleanup event listeners

```javascript
// I en klass som kan tas bort
destroy() {
    this.game.events.off('obstacleHit', this.handleHit)
}
```

### 4. Error handling i listeners

EventEmitter hanterar fel automatiskt:
```javascript
this.events.on('test', () => {
    throw new Error('Oops!')  // Krashar inte hela spelet
})
```

### 5. Debug events

Använd debug mode för att logga events:
```javascript
if (this.debug) {
    console.log('Event emitted:', eventName, data)
}
```

---

## Framtida Extensions

Med event system på plats kan vi enkelt lägga till:

**Audio System:**
```javascript
class AudioManager {
    constructor(game) {
        this.game = game
        game.events.on('playerJump', () => this.play('jump'))
        game.events.on('obstacleHit', () => this.play('hit'))
        game.events.on('scoreMilestone', () => this.play('milestone'))
    }
}
```

**Particle System:**
```javascript
class ParticleSystem {
    constructor(game) {
        this.game = game
        game.events.on('obstacleHit', (data) => {
            this.emit('explosion', data.player.position)
        })
        game.events.on('playerLanded', (data) => {
            this.emit('dust', data.position)
        })
    }
}
```

**Achievements System:**
```javascript
class Achievements {
    constructor(game) {
        this.game = game
        game.events.on('scoreMilestone', (data) => {
            if (data.score >= 1000) {
                this.unlock('thousand_points')
            }
        })
    }
}
```

---

## Performance Considerations

**EventEmitter är optimerat för game loops:**

1. ✅ **Map** istället för Object - snabbare lookups
2. ✅ **Array copy** vid emit - undviker iteration-problem
3. ✅ **Try-catch** - isolerar fel
4. ✅ **Cleanup** - tar bort tomma event arrays

**Overhead är minimal:**
- ~0.01ms per emit med 10 listeners
- Map lookups är O(1)
- Array iteration är O(n) men n är typiskt litet (1-5 listeners)

---

## Testing Events

```javascript
// Räkna antal gånger event emitas
let jumpCount = 0
this.events.on('playerJump', () => jumpCount++)

// Testa event data
this.events.on('obstacleHit', (data) => {
    console.assert(data.obstacle !== null)
    console.assert(data.score >= 0)
})

// Debug alla events
if (this.debug) {
    for (const eventName of this.events.eventNames()) {
        this.events.on(eventName, (data) => {
            console.log(`[${eventName}]`, data)
        })
    }
}
```

---

## Sammanfattning

**Implementerat:**
- ✅ EventEmitter class (Observer Pattern)
- ✅ Integration i GameBase
- ✅ Events för collision, jump, landing, spawning, milestones
- ✅ Loose coupling mellan objekt
- ✅ Debug logging för events

**Fördelar:**
- ✅ **Separation of concerns** - Objekt känner inte till varandra
- ✅ **Extensibility** - Lägg till features utan att ändra existerande kod
- ✅ **Testability** - Enklare att testa isolerade komponenter
- ✅ **Debugging** - Centraliserad event logging

**Nästa steg:**
- **Steg 22: State Machine (FSM)** - Player states, Game states, Clean transitions

**Event System + State Machine = Kraftfull arkitektur! 🎮✨**
