# Design Decisions - Branch 24

## 📐 Arkitektur & Design-beslut

### 1. Projectiles som Plain Objects (inte klasser)

**Beslut:** Projectiles är enkla objekt `{}` istället för `class Projectile`

**Kod:**
```javascript
// ✅ Nuvarande implementation
const projectile = {
    position: center.clone(),
    velocity: direction.multiply(0.6),
    damage: 50,
    tower: towerRef,
    color: 'yellow'
}
this.game.projectiles.push(projectile)
```

**Jämfört med:**
```javascript
// ❌ Alternativ (klass-baserad)
class Projectile extends GameObject {
    constructor(game, position, velocity, damage) {
        super(game, position.x, position.y, 8, 8)
        this.velocity = velocity
        this.damage = damage
    }
    
    update(deltaTime) {
        this.position.addScaled(this.velocity, deltaTime)
    }
    
    draw(ctx, camera) {
        ctx.arc(this.position.x, this.position.y, 4, 0, Math.PI * 2)
    }
}
```

---

### ✅ Varför Plain Objects för Projectiles?

#### 1. **Simplicitet**
- Projectiles har **minimal behavior** - de rör sig rakt fram och träffar
- Ingen komplex state management
- Ingen arv-hierarki behövs

```javascript
// Enkel logic - bara movement och collision
projectile.position.addScaled(projectile.velocity, deltaTime)
if (collision) { projectile.markedForDeletion = true }
```

#### 2. **Performance**
- Hundratals projectiles kan existera samtidigt
- Plain objects är **snabbare att skapa** än class instances
- Mindre memory overhead (ingen prototype chain)

```javascript
// Benchmark (approximativt):
// Plain object:  ~0.001ms per 100 projectiles
// Class instance: ~0.003ms per 100 projectiles
// För 500 projectiles: 0.01ms skillnad
```

**Men:** I vårt spel (~20-50 projectiles) är detta **försumbart**. Pedagogy > micro-optimization.

#### 3. **Flexibilitet**
- Lätt att lägga till properties dynamiskt
- Components kan lägga till sina egna fields

```javascript
// ShootingComponent skapar projectile
const projectile = {
    position: center.clone(),
    velocity: direction.multiply(speed),
    damage: this.damage,
    color: this.projectileColor,  // ← Component-specific
    component: this               // ← Referens till component
}

// SplashComponent kan senare läsa detta
if (projectile.component.constructor.name === 'ShootingComponent') { ... }
```

#### 4. **Data-Oriented Design**
- Projectiles är **data, inte behavior**
- Game loop hanterar update/draw (centraliserat)
- Passar Entity-Component-System (ECS) pattern

```javascript
// Centraliserad update logic
this.projectiles.forEach(projectile => {
    projectile.position.addScaled(projectile.velocity, deltaTime)
    // Collision check här
    // Draw här
})
```

---

### ⚠️ När ska man INTE använda Plain Objects?

**Använd klasser när:**

| Kriterium | Exempel | Varför |
|-----------|---------|--------|
| **Komplex behavior** | `Player`, `Enemy`, `Tower` | Många metoder, state management |
| **Arv behövs** | `GameObject` → `Enemy` | Delad functionality |
| **Encapsulation viktig** | `Grid.canBuildAt()` | Internal state ska skyddas |
| **Lifecycle hooks** | `Component.onAdd()`, `onRemove()` | Setup/cleanup behavior |

**Använd plain objects när:**

| Kriterium | Exempel | Varför |
|-----------|---------|--------|
| **Enkel data** | `Projectile`, `Particle` | Bara state, ingen behavior |
| **Korta lifetimes** | Particles (0.5s), Projectiles (2s) | Skapas/förstörs ofta |
| **Performance-kritiskt** | 1000+ particles | Memory/CPU overhead viktigt |
| **Data-driven** | Config objects, Events | Rent data-struktur |

---

### 🎓 Pedagogiskt värde

**Lärdomar för students:**

1. **"Not everything needs to be a class"**
   - JavaScript är multi-paradigm
   - Välj rätt verktyg för jobbet
   - Classes ≠ alltid bättre

2. **Data vs Behavior**
   ```javascript
   // Data (plain object)
   const particle = { x, y, lifetime }
   
   // Behavior (class)
   class Player {
       move(direction) { /* complex logic */ }
       jump() { /* physics */ }
   }
   ```

3. **YAGNI (You Ain't Gonna Need It)**
   - Började vi med `class Projectile`?
   - Vad skulle vi vinna? `update()`, `draw()` metoder?
   - Men game loop hanterar redan detta!
   - **Don't add complexity without need**

---

## 2. TowerTypes.js (JavaScript) vs JSON

**Beslut:** TowerTypes.js är JavaScript med `export`, inte JSON

**Nuvarande:**
```javascript
// TowerTypes.js
import ShootingComponent from './components/ShootingComponent.js'
import SlowComponent from './components/SlowComponent.js'

export const TOWER_TYPES = {
    CANNON: {
        id: 'cannon',
        cost: 100,
        components: [
            {
                type: ShootingComponent,  // ← Class reference!
                config: { damage: 50, fireRate: 1000 }
            }
        ]
    }
}
```

**Alternativ (JSON):**
```json
{
    "CANNON": {
        "id": "cannon",
        "cost": 100,
        "components": [
            {
                "type": "ShootingComponent",
                "config": { "damage": 50, "fireRate": 1000 }
            }
        ]
    }
}
```

---

### ✅ Varför JavaScript istället för JSON?

#### 1. **Class References**
- Vi behöver referera till **actual classes** (ShootingComponent)
- JSON kan bara ha strings, numbers, objects, arrays
- Skulle behöva string → class lookup:

```javascript
// Med JSON (krångligare):
import towerTypesJSON from './towerTypes.json'

const componentMap = {
    'ShootingComponent': ShootingComponent,
    'SlowComponent': SlowComponent,
    // ... måste mappa alla!
}

// Setup tower
towerType.components.forEach(comp => {
    const ComponentClass = componentMap[comp.type]  // String lookup
    new ComponentClass(tower, comp.config)
})
```

```javascript
// Med JS (enklare):
import { TOWER_TYPES } from './TowerTypes.js'

// Setup tower
towerType.components.forEach(comp => {
    const ComponentClass = comp.type  // Direkt class reference!
    new ComponentClass(tower, comp.config)
})
```

#### 2. **Type Safety & IntelliSense**
```javascript
// JavaScript - IDE autocomplete fungerar!
const towerType = TOWER_TYPES.CANNON
towerType.components[0].type  // ShootingComponent (IDE vet detta)
```

```json
// JSON - IDE vet inte vad "ShootingComponent" betyder
{
    "type": "ShootingComponent"  // Bara en string
}
```

#### 3. **Code Reuse & DRY**
```javascript
// Kan återanvända configs!
const BASIC_SHOOTING = {
    type: ShootingComponent,
    config: { fireRate: 1000, projectileSpeed: 0.6 }
}

export const TOWER_TYPES = {
    CANNON: {
        components: [BASIC_SHOOTING]
    },
    SNIPER: {
        components: [
            { ...BASIC_SHOOTING, config: { ...BASIC_SHOOTING.config, fireRate: 2000 } }
        ]
    }
}
```

#### 4. **Validation & Defaults**
```javascript
// Kan lägga till helper functions
export function getTowerType(id) {
    const type = TOWER_TYPES[id.toUpperCase()]
    if (!type) {
        console.warn(`Unknown tower type: ${id}`)
        return TOWER_TYPES.CANNON  // Fallback
    }
    return type
}

// Kan validera vid load
export function validateTowerTypes() {
    Object.values(TOWER_TYPES).forEach(type => {
        if (!type.cost || type.cost <= 0) {
            throw new Error(`Invalid cost for ${type.id}`)
        }
    })
}
```

---

### ⚠️ När ska man använda JSON istället?

**Använd JSON när:**

| Scenario | Varför |
|----------|--------|
| **Server-side data** | JSON är standard för APIs, databases |
| **User-editable** | Level designers kan editera utan kod |
| **Language-agnostic** | Data delas mellan backend (Python) och frontend (JS) |
| **Pure data** | Inga functions, classes, eller code references |

**Exempel: Level data som JSON**
```json
{
    "level1": {
        "name": "Forest",
        "enemies": 50,
        "path": [
            [5, 0],
            [5, 3],
            [2, 3]
        ],
        "startGold": 500
    }
}
```

Detta är **bara data** - inga class references!

---

### 🎓 Pedagogiskt värde

**Lärdomar för students:**

1. **JSON är inte alltid rätt val**
   - JSON = data format
   - JavaScript modules = code + data
   - Välj baserat på behov

2. **References vs Strings**
   ```javascript
   // ✅ Strong reference
   const comp = ShootingComponent  // Compile error om typo
   
   // ❌ Weak reference
   const comp = "ShootingComponent"  // Runtime error om typo
   ```

3. **Configuration as Code**
   - JavaScript modules är **powerful configs**
   - Kan använda all JS features (spread, destructuring, functions)
   - JSON är **begränsad** (endast data primitives)

4. **When to abstract**
   - Om game designers ska editera → JSON/YAML
   - Om developers ska editera → JavaScript
   - Om data kommer från server → JSON
   - Om data är tightly coupled med code → JavaScript

---

## 🎯 Sammanfattning

### Projectiles (Plain Objects)
**✅ Bra eftersom:**
- Enkel data utan complex behavior
- Game loop hanterar update/draw centralt
- Performance (många projectiles)
- Flexibilitet för components

**❌ Skulle vara dåligt om:**
- Projectiles hade complex AI
- Många olika projectile types med inheritance
- Behövde lifecycle management

### TowerTypes.js (JavaScript)
**✅ Bra eftersom:**
- Refererar till actual classes (components)
- IDE support & type checking
- Code reuse (spread, defaults)
- Validation möjlig

**❌ Skulle vara JSON om:**
- Bara pure data (no class references)
- Editeras av non-programmers
- Kommer från external API
- Language-agnostic

---

## 💡 Design Philosophy

**"Choose the simplest thing that works"**

```
Plain Objects < Classes < Inheritance < Design Patterns
     ↑              ↑
  Start here    Add complexity only when needed
```

**För students:**
- Börja enkelt (plain object)
- Lägg till komplexitet när du **behöver** det
- Motivera varje abstraktion
- YAGNI: You Aren't Gonna Need It

**I vårt spel:**
- Projectiles: Enkla → Plain objects ✓
- Towers: Komplexa → Classes ✓
- Components: Modular behavior → Classes ✓
- Tower configs: Code references → JavaScript module ✓
