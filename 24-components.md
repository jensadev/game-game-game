# Branch 24: Component System

## Översikt

I detta steg implementerar vi ett **Component System** för våra torn. Detta är en kraftfull design pattern som låter oss bygga komplexa behaviors genom att kombinera små, återanvändbara delar.

---

## 🧩 Vad är ett Component System?

### Grundidén

Ett component system bygger på principen **"Composition over Inheritance"**:

```
❌ Inheritance (arv):
Tower
├── CannonTower
├── IceTower
├── SplashTower
└── PoisonTower

Problem: Vad om vi vill ha en IceTower som också gör splash damage?
         Vi skulle behöva IceSplashTower, IcePoisonTower, etc.
         Exponentiell komplexitet!

✅ Composition (komponenter):
Tower + [Components]
├── Tower + [ShootingComponent]                    → Cannon
├── Tower + [ShootingComponent, SlowComponent]     → Ice
├── Tower + [ShootingComponent, SplashComponent]   → Splash
└── Tower + [ShootingComponent, PoisonComponent]   → Poison

Fördel: Mix and match! Vill du ha Ice + Splash?
        Tower + [ShootingComponent, SlowComponent, SplashComponent] ✓
```

### Definition

> **Component:** En liten, återanvändbar del som implementerar EN specifik behavior.

Varje component ansvarar för **en sak**:
- `ShootingComponent` → Skjuta projektiler
- `SlowComponent` → Sakta fiender
- `SplashComponent` → Area damage
- `PoisonComponent` → Damage över tid

---

## 🏗️ Arkitektur

### System Overview

```
┌─────────────────────────────────────────────┐
│              TowerDefenseGame                │
│  (äger alla towers, enemies, projectiles)    │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    ┌───▼────┐          ┌───▼────┐
    │ Tower  │          │ Tower  │
    │ (Ice)  │          │(Splash)│
    └───┬────┘          └───┬────┘
        │                   │
   ┌────┴─────┐        ┌────┴──────┐
   │          │        │           │
┌──▼───┐  ┌──▼───┐ ┌──▼────┐  ┌───▼────┐
│Shoot │  │ Slow │ │ Shoot  │  │ Splash │
│Comp  │  │ Comp │ │ Comp   │  │ Comp   │
└──────┘  └──────┘ └────────┘  └────────┘
```

### Tower som Container

```javascript
class Tower {
    constructor(game, x, y, towerType) {
        this.components = []  // ← Container för components
        
        // Lägg till components från config
        towerType.components.forEach(compConfig => {
            const component = new compConfig.type(this, compConfig.config)
            this.components.push(component)
        })
    }
    
    update(deltaTime) {
        // Kör alla components
        this.components.forEach(comp => comp.update(deltaTime))
    }
    
    draw(ctx, camera) {
        // Rita tower base
        // ...
        
        // Låt components rita (range circles, effects)
        this.components.forEach(comp => comp.draw(ctx, camera))
    }
}
```

---

## 🔄 Hur fungerar det? (Flödesschema)

### 1. Tower Creation Flow

```
Start
  │
  ▼
User clicks to build tower
  │
  ▼
TowerDefenseGame.handleMouseClick()
  │
  ├─→ Get selected tower type (CANNON, ICE, SPLASH, POISON)
  │
  ├─→ Hämta TowerType config från TowerTypes.js
  │   {
  │     id: 'ice',
  │     cost: 150,
  │     components: [
  │       { type: ShootingComponent, config: {...} },
  │       { type: SlowComponent, config: {...} }
  │     ]
  │   }
  │
  ▼
Create Tower instance
  │
  ├─→ Tower.constructor()
  │     │
  │     ├─→ Loop genom components config
  │     │     │
  │     │     ├─→ Create ShootingComponent(tower, config)
  │     │     │     │
  │     │     │     └─→ this.components.push(shootingComp)
  │     │     │
  │     │     └─→ Create SlowComponent(tower, config)
  │     │           │
  │     │           └─→ this.components.push(slowComp)
  │     │
  │     └─→ Call component.onAdd() for each
  │
  ▼
Tower ready med alla components!
  │
  ▼
Add till game.towers[]
  │
  ▼
End
```

### 2. Game Loop Flow

```
┌──────────────────────────────┐
│     Game Loop (varje frame)   │
└───────────┬──────────────────┘
            │
    ┌───────▼────────┐
    │ Update Phase   │
    └───────┬────────┘
            │
    ┌───────▼────────────────────────┐
    │ For each tower in towers[]     │
    └───────┬────────────────────────┘
            │
    ┌───────▼────────────────────────┐
    │ tower.update(deltaTime)        │
    └───────┬────────────────────────┘
            │
    ┌───────▼───────────────────────────────┐
    │ For each component in tower.components │
    └───────┬───────────────────────────────┘
            │
        ┌───┴────┐
        │        │
    ┌───▼───┐ ┌─▼────┐
    │Shoot  │ │ Slow │
    │.update│ │.update│
    └───┬───┘ └──┬───┘
        │        │
        │        └─→ Apply slow effect to enemies
        │
        └─→ Find target, shoot projectile
            │
            └─→ game.projectiles.push(projectile)
```

### 3. Component Interaction Flow

```
Projectile träffar enemy
        │
        ▼
TowerDefenseGame collision detection
        │
        ├─→ enemy.takeDamage(projectile.damage)
        │
        ├─→ Get projectile.tower
        │     │
        │     ├─→ tower.getComponent(PoisonComponent)
        │     │     │
        │     │     └─→ If exists → poisonComp.applyPoison(enemy)
        │     │                         │
        │     │                         └─→ enemy.poisonEffects.push({...})
        │     │
        │     └─→ tower.getComponent(SplashComponent)
        │           │
        │           └─→ If exists → splashComp.onProjectileHit(...)
        │                             │
        │                             ├─→ Find enemies in splash radius
        │                             │
        │                             └─→ Apply splash damage to all
        │
        ▼
Enemy updated med effects!
```

---

## 💻 Pseudokod

### Component Base Class

```javascript
// Pseudokod för att förstå strukturen
class Component {
    constructor(tower) {
        this.tower = tower
        this.game = tower.game
        this.enabled = true
    }
    
    // Kallas varje frame
    update(deltaTime) {
        // Override i subclass
    }
    
    // Kallas för rendering
    draw(ctx, camera) {
        // Override i subclass
    }
    
    // Lifecycle hooks
    onAdd() { }     // När component läggs till
    onRemove() { }  // När component tas bort
}
```

### ShootingComponent (exempel)

```javascript
// Pseudokod - förenklad för förståelse
class ShootingComponent extends Component {
    constructor(tower, config) {
        super(tower)
        
        // Stats från config
        this.damage = config.damage
        this.fireRate = config.fireRate
        this.range = config.range
        
        // State
        this.cooldown = 0
        this.currentTarget = null
    }
    
    update(deltaTime) {
        // Cooldown management
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime
            return
        }
        
        // Find target
        this.currentTarget = this.findClosestEnemy()
        
        // Shoot if target found
        if (this.currentTarget) {
            this.shoot(this.currentTarget)
            this.cooldown = this.fireRate
        }
    }
    
    findClosestEnemy() {
        // Hitta närmaste enemy inom range
        closest = null
        closestDistance = this.range
        
        för varje enemy i game.enemies:
            distance = avstånd från tower till enemy
            
            om distance < closestDistance:
                closest = enemy
                closestDistance = distance
        
        return closest
    }
    
    shoot(target) {
        // Skapa projectile
        direction = (target.position - tower.position).normalize()
        velocity = direction * projectileSpeed
        
        projectile = {
            position: tower.center,
            velocity: velocity,
            damage: this.damage,
            tower: this.tower
        }
        
        game.projectiles.push(projectile)
    }
}
```

### Tower Setup (pseudokod)

```javascript
// Hur ett torn skapas med components
function createTower(type) {
    // 1. Hämta config
    config = TowerTypes[type]
    // {
    //   components: [
    //     { type: ShootingComponent, config: { damage: 50 } },
    //     { type: SlowComponent, config: { slowAmount: 0.5 } }
    //   ]
    // }
    
    // 2. Skapa tower
    tower = new Tower(game, x, y, config)
    
    // 3. Tower constructor lägger till components:
    för varje componentConfig i config.components:
        ComponentClass = componentConfig.type
        componentConfig = componentConfig.config
        
        component = new ComponentClass(tower, componentConfig)
        tower.components.push(component)
        component.onAdd()
    
    // 4. Tower är redo!
    return tower
}
```

---

## 🎯 Praktiska Exempel

### Exempel 1: Cannon Tower (Basic)

```javascript
// TowerTypes.js
CANNON: {
    id: 'cannon',
    name: 'Cannon Tower',
    cost: 100,
    color: 'gray',
    components: [
        {
            type: ShootingComponent,
            config: {
                damage: 50,
                fireRate: 1000,    // 1 sekund
                range: 200
            }
        }
    ]
}

// Result:
// ┌─────────┐
// │ Cannon  │
// │ Tower   │
// └────┬────┘
//      │
//   ┌──▼──────────┐
//   │  Shooting   │
//   │  Component  │
//   └─────────────┘
//
// Behavior: Skjuter yellow projektiler var 1s
```

### Exempel 2: Ice Tower (Multi-Component)

```javascript
// TowerTypes.js
ICE: {
    id: 'ice',
    name: 'Ice Tower',
    cost: 150,
    color: 'lightblue',
    components: [
        {
            type: ShootingComponent,
            config: {
                damage: 30,           // Mindre damage än Cannon
                fireRate: 1200,       // Långsammare
                range: 180,
                projectileColor: 'cyan'
            }
        },
        {
            type: SlowComponent,
            config: {
                range: 150,
                slowAmount: 0.5,      // 50% slower
                duration: 3000,       // 3 sekunder
                tickRate: 500         // Applicera var 500ms
            }
        }
    ]
}

// Result:
// ┌─────────┐
// │   Ice   │
// │  Tower  │
// └────┬────┘
//      │
//   ┌──┴──────────┐
//   │             │
// ┌─▼──────────┐ ┌▼────────────┐
// │  Shooting  │ │    Slow     │
// │ Component  │ │  Component  │
// └────────────┘ └─────────────┘
//
// Behavior:
// 1. ShootingComponent → Skjuter cyan projektiler
// 2. SlowComponent → Alla enemies inom 150 radius får 50% slower speed
// 3. Kombinerad effekt: Skjuter OCH saktar!
```

### Exempel 3: Splash Tower (Component Interaction)

```javascript
// TowerTypes.js
SPLASH: {
    id: 'splash',
    name: 'Splash Tower',
    cost: 200,
    color: 'orange',
    components: [
        {
            type: ShootingComponent,
            config: {
                damage: 40,
                fireRate: 1500,
                range: 220,
                projectileColor: 'orange'
            }
        },
        {
            type: SplashComponent,
            config: {
                splashRadius: 80,
                splashDamagePercent: 0.5  // 50% av main damage
            }
        }
    ]
}

// Interaction Flow:
// 
// 1. ShootingComponent skjuter projectile (40 damage)
//    │
//    ▼
// 2. Projectile träffar Enemy A
//    │
//    ├─→ Enemy A tar 40 damage (full)
//    │
//    ▼
// 3. Game loop kollar: Har tower SplashComponent?
//    │
//    ├─→ JA! Call splashComp.onProjectileHit(projectile, enemyA)
//    │
//    ▼
// 4. SplashComponent:
//    │
//    ├─→ Hitta alla enemies inom 80 pixels från träffpunkt
//    │   Enemy B: 50 pixels away ✓
//    │   Enemy C: 30 pixels away ✓
//    │   Enemy D: 100 pixels away ✗ (för långt)
//    │
//    ├─→ Applicera splash damage: 40 * 0.5 = 20 damage
//    │   Enemy B tar 20 damage (splash)
//    │   Enemy C tar 20 damage (splash)
//    │
//    └─→ Visa explosion effect (orange circle)
//
// Result: EN projectile skadar FLERA enemies!
```

### Exempel 4: Poison Tower (DoT Effect)

```javascript
// TowerTypes.js
POISON: {
    id: 'poison',
    name: 'Poison Tower',
    cost: 175,
    color: 'green',
    components: [
        {
            type: ShootingComponent,
            config: {
                damage: 20,              // Låg initial damage
                fireRate: 1000,
                range: 200,
                projectileColor: 'lime'
            }
        },
        {
            type: PoisonComponent,
            config: {
                poisonDuration: 5000,    // 5 sekunder
                poisonDamage: 10,        // Per tick
                tickRate: 500            // Var 500ms = 10 ticks
            }
        }
    ]
}

// Damage Calculation:
// Initial hit: 20 damage
// Poison ticks: 10 damage × 10 ticks = 100 damage
// Total: 120 damage over 5 seconds!
//
// Interaction Flow:
//
// 1. ShootingComponent skjuter lime projectile
//    │
//    ▼
// 2. Projectile träffar enemy
//    │
//    ├─→ Enemy tar 20 damage (initial)
//    │
//    ▼
// 3. Game loop kollar: Har tower PoisonComponent?
//    │
//    ├─→ JA! Call poisonComp.applyPoison(enemy)
//    │
//    ▼
// 4. PoisonComponent lägger till poison effect på enemy:
//    enemy.poisonEffects.push({
//        damage: 10,
//        tickRate: 500,
//        endTime: now + 5000
//    })
//    │
//    ▼
// 5. Varje frame (PoisonComponent.update):
//    │
//    ├─→ För varje poisoned enemy:
//    │     │
//    │     ├─→ tickTimer += deltaTime
//    │     │
//    │     ├─→ Om tickTimer >= 500ms:
//    │     │     ├─→ enemy.takeDamage(10)
//    │     │     └─→ Visa ☠ symbol
//    │     │
//    │     └─→ Om endTime nådd: Ta bort effect
//    │
//    └─→ Draw poison cloud (green aura)
```

---

## ⚡ Avancerade Kombinationer

### Teoretisk: Super Tower (alla components)

```javascript
// Tänk dig ett torn med ALLA components!
SUPER: {
    components: [
        ShootingComponent,   // Skjuter
        SlowComponent,       // Saktar
        SplashComponent,     // Area damage
        PoisonComponent      // DoT
    ]
}

// Vad händer när detta torn skjuter?
// 
// 1. ShootingComponent → Skjuter projectile
//    ↓
// 2. SlowComponent → Alla enemies i range blir slowed
//    ↓
// 3. Projectile träffar Enemy A
//    ├─→ 40 damage (initial)
//    ├─→ PoisonComponent → Applicera poison (10/tick i 5s)
//    └─→ SplashComponent → Hitta enemies i radius
//        ├─→ Enemy B tar splash damage + poison
//        └─→ Enemy C tar splash damage + poison
//
// Result: Massiv AoE slow + damage + DoT!
// Cost: Skulle vara 500G+ (balanced!)
```

### Custom Tower Example

```javascript
// Students kan skapa egna kombinationer!

// Support Tower - saktar men skjuter inte
SUPPORT: {
    components: [
        SlowComponent  // Bara slow, ingen shooting
    ]
}

// Sniper Tower - långsam men powerful
SNIPER: {
    components: [
        {
            type: ShootingComponent,
            config: {
                damage: 150,        // Hög damage
                fireRate: 3000,     // Långsam (3s)
                range: 300,         // Lång range
                projectileSpeed: 1.2 // Snabb projektil
            }
        }
    ]
}

// Artillery Tower - splash utan initial damage
ARTILLERY: {
    components: [
        {
            type: ShootingComponent,
            config: {
                damage: 10,  // Låg initial damage
                fireRate: 2000
            }
        },
        {
            type: SplashComponent,
            config: {
                splashRadius: 120,
                splashDamagePercent: 3.0  // 300%! Main target tar minst damage
            }
        }
    ]
}
```

---

## 🎓 Fördelar med Component System

### 1. **Flexibilitet**

```javascript
// Lätt att lägga till nya behaviors
class FireComponent extends Component {
    update(deltaTime) {
        // Eldskada över tid
    }
}

// Lägg till i vilket torn som helst!
FIRE_CANNON: {
    components: [
        ShootingComponent,
        FireComponent  // ← Ny component!
    ]
}
```

### 2. **Återanvändbarhet**

```javascript
// ShootingComponent används av ALLA shooting towers
// Ingen kod-duplicering!

CANNON: { components: [ShootingComponent] }
ICE: { components: [ShootingComponent, SlowComponent] }
SPLASH: { components: [ShootingComponent, SplashComponent] }
POISON: { components: [ShootingComponent, PoisonComponent] }

// 1 implementation → 4 towers ✓
```

### 3. **Testbarhet**

```javascript
// Testa components isolerat
test('ShootingComponent finds closest enemy', () => {
    const tower = new Tower(...)
    const shootComp = new ShootingComponent(tower, {range: 200})
    
    const enemy1 = { position: {x: 100, y: 100} }
    const enemy2 = { position: {x: 50, y: 50} }
    
    const closest = shootComp.findClosestEnemy()
    expect(closest).toBe(enemy2)  // Närmare!
})
```

### 4. **Underhållbarhet**

```javascript
// Bug i slow effect?
// ✓ Fixa i SlowComponent.js
// ✓ Alla torn med SlowComponent fixas automatiskt!

// Jämför med inheritance:
// ❌ Fixa i IceTower
// ❌ Fixa i FrostTower
// ❌ Fixa i BlizzardTower
// ❌ Miss ett? Bug kvarstår!
```

### 5. **Skalbarhet**

```javascript
// Lägg till 100 nya tower types:
// Kombinera befintliga components på nya sätt!

// Ingen ny kod behövs för basic combinations
TOXIC_ICE: [ShootingComponent, SlowComponent, PoisonComponent]
FLAME_SPLASH: [ShootingComponent, SplashComponent, FireComponent]
FROST_ARTILLERY: [ShootingComponent, SlowComponent, SplashComponent]

// Endast nya components behöver skrivas för helt nya behaviors
```

---

## 🆚 Jämförelse: Inheritance vs Composition

### Scenario: Vi vill ha 4 tower types

**Med Inheritance (Branch 23):**

```javascript
class Tower {
    update() { /* basic logic */ }
}

class CannonTower extends Tower {
    shoot() { /* shooting logic */ }
}

class IceTower extends Tower {
    shoot() { /* shooting logic - DUPLICERAD */ }
    slow() { /* slow logic */ }
}

class SplashTower extends Tower {
    shoot() { /* shooting logic - DUPLICERAD */ }
    splash() { /* splash logic */ }
}

class PoisonTower extends Tower {
    shoot() { /* shooting logic - DUPLICERAD */ }
    poison() { /* poison logic */ }
}

// Problem:
// - Shooting logic duplicerad 4 gånger
// - Vill ha IceSplash? Skapa ny klass!
// - Vill ändra shooting? Ändra på 4 ställen!
```

**Med Composition (Branch 24):**

```javascript
class Tower {
    constructor(type) {
        this.components = []
        type.components.forEach(comp => {
            this.components.push(new comp.type(this, comp.config))
        })
    }
    
    update(deltaTime) {
        this.components.forEach(c => c.update(deltaTime))
    }
}

class ShootingComponent { /* EN gång */ }
class SlowComponent { /* EN gång */ }
class SplashComponent { /* EN gång */ }
class PoisonComponent { /* EN gång */ }

// Skapa towers:
CANNON = Tower + [Shooting]
ICE = Tower + [Shooting, Slow]
SPLASH = Tower + [Shooting, Splash]
POISON = Tower + [Shooting, Poison]

// Fördelar:
// ✓ Shooting logic EN gång
// ✓ Vill ha IceSplash? Tower + [Shooting, Slow, Splash]
// ✓ Vill ändra shooting? Ändra ShootingComponent
```

### Komplexitet vid skalning

```
Antal tower types: 1    2    3    4    5    10
                   │    │    │    │    │    │
Inheritance:       1    2    3    4    5    10   (linjär)
                   │    │    │    │    │    │
Composition:       1    2    3    4    5    10   (linjär)

Men med kombinationer:
Vill ha X + Y kombinationer:
                   
Inheritance:       Nya klasser för varje kombination
                   IceSplashTower, PoisonSlowTower, etc.
                   Exponentiell ökning!
                   
Composition:       Mix components
                   [Ice, Splash], [Poison, Slow], etc.
                   Ingen ny kod! ✓
```

---

## 📝 Uppgift för Students

### Nivå 1: Skapa en ny tower type

```javascript
// Skapa en RAPID tower:
// - Låg damage (20)
// - Snabb fire rate (500ms)
// - Normal range (200)
// 
// Vilken component behöver du?
// Vad ska config vara?
```

### Nivå 2: Skapa en ny component

```javascript
// Skapa HealComponent:
// - Healar torn inom range
// - 5 HP per sekund
// - Range: 150
//
// Vilka metoder behöver du?
// Hur interagerar den med andra torn?
```

### Nivå 3: Kombinera components

```javascript
// Skapa ULTIMATE tower:
// - Skjuter (medium damage)
// - Saktar enemies (30%)
// - Gör splash damage (40 radius)
// - Healar nearby towers (5 HP/s)
//
// Vilka components behöver du?
// Vad blir totala damage output?
// Vad borde cost vara? (balanced!)
```

---

## 🎯 Sammanfattning

### Component System i 3 steg:

1. **Skapa små, fokuserade components**
   - En component = En behavior
   - ShootingComponent, SlowComponent, etc.

2. **Tower är en container**
   - Tower äger components
   - Tower.update() kör alla components

3. **Kombinera components för att skapa tower types**
   - Cannon = [Shooting]
   - Ice = [Shooting, Slow]
   - Splash = [Shooting, Splash]

### Varför detta är bra:

✅ **Flexibelt** - Mix and match behaviors  
✅ **Återanvändbart** - Skriv EN gång, använd överallt  
✅ **Testbart** - Testa components isolerat  
✅ **Underhållbart** - Fixa på ETT ställe  
✅ **Skalbart** - Lägg till nya combinations utan ny kod  

### Design Philosophy:

> **"Composition over Inheritance"**  
> Bygg komplex funktionalitet genom att kombinera enkla delar,  
> istället för att skapa komplexa arvshierarkier.

---

## 📚 Relaterade Koncept

- **Entity Component System (ECS)** - Används i game engines som Unity
- **Decorator Pattern** - Lägga till functionality dynamiskt
- **Strategy Pattern** - Olika behaviors som kan bytas ut
- **Single Responsibility Principle** - En klass = Ett ansvar

---

## 🔗 Nästa Steg

**Branch 25: FSM (Finite State Machine)**
- State management för enemies
- Patrol → Attack → Die states
- Component system för AI behaviors
