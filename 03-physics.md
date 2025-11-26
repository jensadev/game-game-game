# Steg 3 - Fysik i spelmotorn

I den här delen introducerar vi enkel fysik i spelet. Vi lägger till gravitation, hopp och kollisionshantering mellan spelaren och plattformar. Det ger oss grunden för att skapa ett plattformsspel.

## Vad lär vi oss?

I detta steg fokuserar vi på:
- **Fysik-simulation** - Gravitation, acceleration och friktion
- **State management** - Hålla reda på om spelaren är på marken (`isGrounded`)
- **Riktningsbaserad kollision** - `getCollisionData()` för mer avancerad kollisionshantering
- **Separation of Concerns (igen!)** - Fysikkonstanter i Game, fysikbeteende i Player
- **Game feel** - Hur små tweaks i fysikvärdena påverkar spelkänslan

### Varför är fysik så viktigt?

Fysik skapar **spelkänsla** (game feel):
- Gravitation gör spelet mer realistiskt och förutsägbart
- Hopp ger spelaren kontroll och mobilitet
- Friktion påverkar hur "tung" eller "lätt" spelaren känns
- Kollisionsrespons gör att spelvärlden känns solid

**Game feel** är skillnaden mellan ett spel som känns bra att spela och ett som känns "off". Små ändringar i fysikvärdena kan ha stor effekt!

## Översikt

För att skapa ett fungerande plattformsspel behöver vi:
1. **Plattformar** - Statiska objekt som spelaren kan stå på
2. **Gravitation** - Konstant acceleration nedåt
3. **Hopp** - Ge spelaren initial uppåtgående hastighet
4. **Riktningsbaserad kollision** - Veta om spelaren landar på toppen, träffar sidan, etc.

## Plattformar - Separation of Concerns

För att göra koden tydligare skapar vi en separat klass för plattformarna, även om koden är lik `Rectangle`.

```javascript
export default class Platform extends GameObject {
    constructor(game, x, y, width, height, color = '#8B4513') {
        super(game, x, y, width, height)
        this.color = color
    }

    update(deltaTime) {
        // Plattformar är statiska - ingen uppdatering behövs
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}
```

**Varför en separat klass?**
- **Semantik** - Namnet `Platform` kommunicerar syftet.
- **Öppet för vidareutveckling** - Vi kan lätt lägga till rörliga plattformar senare.
- **Separation** - Plattformar har olika ansvar än andra GameObjects och är inte en generisk rektangel.

**Reflektion:** Även om koden är nästan identisk med Rectangle, ger den semantiska klarhet. Vi vet direkt vad en Platform är. Detta är vad som brukar kallas självförklarande kod, genom att använda namngivning för att förmedla avsikt utan behov av ytterligare kommentarer.

### Organisera plattformar i Game.js

Vi skapar en separat array för plattformar (istället för att lägga dem i `gameObjects`):

```javascript
this.platforms = [
    // Marken
    new Platform(this, 0, this.height - 40, this.width, 40, '#654321'),
    
    // Plattformar
    new Platform(this, 150, this.height - 140, 150, 20, '#8B4513'),
    new Platform(this, 400, this.height - 200, 120, 20, '#8B4513'),
]
```

**Varför separat array?**
- **Prestanda** - Spelaren behöver bara kolla kollision mot plattformar, inte alla objekt.
- **Organiserad kod** - Tydlig separation mellan olika objekttyper. Det går nog att göra en case för att använda en loop för alla spelobjekt, men eventuell vinst försvinner i bristen på tydlighet.
- **Flexibilitet** - Enklare att hantera plattformsspecifik logik.

Detta kräver uppdateringar i `update()` och `draw()` metoden i `Game.js`:

```javascript
update(deltaTime) {
    this.platforms.forEach(platform => platform.update(deltaTime))
}

draw(ctx) {
    this.platforms.forEach(platform => platform.draw(ctx))
}
```

## Gravitation - Fysik-simulation

Gravitation är en **konstant acceleration nedåt** på fancy språk. Varje frame ökar vi spelarens vertikala hastighet (`velocityY`) med gravitationsvärdet multiplicerat med `deltaTime`.

### Fysikkonstanter i Game.js

Vi definierar fysikkonstanter centralt i Game. Vi kan för att öka tydligheten namnge dem efter vår fördefinerade stil-mall:

```javascript
// Fysik
this.GRAVITY = 0.001 // pixels per millisekund²
this.FRICTION = 0.00015 // luftmotstånd för att bromsa fallhastighet
```

**Varför i Game.js?**
- **Centraliserad konfiguration** - Ett ställe där vi definierar och bestämmer fysikvärden.
- **Konsekvent** - Samma fysik gäller för alla objekt (player, enemies, etc.).
- **Separation** - Game äger reglerna, objekten följer dem.

**Spelkänslan:** De värden som vi sätter på sådant som rörelsehastighet, friktion och acceleration är på många sätt slumpmässiga. Det är något som måste testas för att känslans ska bli rätt. För låg gravitation till exempel känns "fladdrigt" och för hög känns "tung". Acceleration i rörelser kan få det att kännas som att "man åker skridskor". Movement kod kan även skapa intressanta buggar som årtioenden senare blir standard i spelindustrin, se [Quake](https://www.youtube.com/watch?v=v3zT3Z5apaM)!

### Applicera gravitation i Player.js

Så även om det är `Game` som äger fysikkonstanterna, är det `Player` som ansvarar för att applicera dem på sin rörelse. I `update()` metoden i `Player.js` lägger vi till:

```javascript
// Applicera gravitation
this.velocityY += this.game.GRAVITY * deltaTime

// Applicera luftmotstånd (friktion)
if (this.velocityY > 0) {
    this.velocityY -= this.game.FRICTION * deltaTime
    if (this.velocityY < 0) this.velocityY = 0
}
```

Nu kan vi även se att det blir tydligt att dessa värden är fysikrelaterade konstanter utifrån hur vi har namngivit dem.

**Så vad händer här?**
1. **Gravitation**: Ökar fallhastigheten varje frame - acceleration.
2. **Friktion**: Minskar fallhastigheten när spelaren faller - luftmotstånd. I det här spelet används friktion endast när spelaren faller nedåt, men det kan såklart även påverka rörelsen i X-led.
3. **Begränsning**: Förhindrar att friktion ger negativ hastighet.

**Varför friktion?**
Utan friktion skulle spelaren accelerera obegränsat och falla allt snabbare. Friktion ger en **terminal velocity** - maximal fallhastighet. Vi kan förenklat koda en maxhastighet, men i det här exemplet så använder vi friktion för att simulera luftmotstånd.

**Fysikformeln:**
```
velocity(t+1) = velocity(t) + (gravity - friction) * deltaTime
```

Detta är en förenklad version av verkliga fysiklagar, men ger en grund för dig att hitta en bra spelkänsla!

### Ögonrörelse baserad på fysiken

Vi uppdaterar `directionY` baserat på hastighet istället för input:

```javascript
// Sätt directionY baserat på vertikal hastighet
if (this.velocityY < -0.1) {
    this.directionY = -1 // tittar upp när man hoppar
} else if (this.velocityY > 0.1) {
    this.directionY = 1 // tittar ner när man faller
} else {
    this.directionY = 0
}
```

**Separation of state:** Vi separerar nu **input state** (tangenter nedtryckta) från **fysik state** (hastighet). Ögonrörelsen reflekterar spelarens rörelse i världen, inte bara vilka tangenter som är nedtryckta.

## Hopp - State management

För att skapa en hoppmekanik ger vi spelaren initial uppåtgående hastighet när en tangent trycks. Vi behöver **state** för att veta om spelaren är på marken. När vi pratar om **state** i ett program eller spel så menar vi ofta variabler som håller reda på olika tillstånd eller lägen som objektet kan befinna sig i. Några exempel på **state** är om en fiende är "levande" eller "död", om en dörr är "öppen" eller "stängd", eller som i vårt fall, om spelaren är "på marken" eller "i luften".

### isGrounded - State tracking

Så för att hantera hopp behöver vi en boolean variabel `isGrounded` i `Player`-klassen som håller reda på om spelaren står på något. Det gör att spelaren inte kan fortsätta hoppa i luften utan bara när den är på marken.

```javascript
// I Player constructor
this.isGrounded = false
this.jumpPower = -0.6 // negativ = uppåt

// I Player update()
if (this.game.inputHandler.keys.has(' ') && this.isGrounded) {
    this.velocityY = this.jumpPower
    this.isGrounded = false
}
```

**State management här:**
- **isGrounded**: Boolean state som spårar om spelaren står på något
- **Guard condition**: `&& this.isGrounded` förhindrar dubbel-hopp
- **State transition**: Hopp sätter `isGrounded = false`

**Varför negativ jumpPower?**
I canvas-koordinater är Y=0 överst, större Y-värden är nedåt. Negativ velocity rör sig uppåt!

**Game feel tweaking:**
- Högre `jumpPower` (mer negativt) = högre hopp
- Lägre `gravity` = "floatier" hopp
- Högre `gravity` = snabbare, mer responsive hopp

**Reflektion:** `isGrounded` är vår första **state variable** som inte är en direkt egenskap (position, hastighet) utan en **tillståndsflagga**. Detta är början på state management!

## Hur landar vi? - Riktningsbaserad kollision

Nu behöver vi veta **från vilken riktning** kollisionen sker:
- Om spelaren landar **ovanifrån** → stanna på plattformen, sätt isGrounded = true
- Om spelaren träffar **underifrån** → studsa nedåt (träffar huvudet)
- Om spelaren träffar **från sidan** → stoppa horisontell rörelse

### getCollisionData() - Mer avancerad kollision

Vi utökar GameObject med en metod som returnerar **kollisionsriktning**:

```javascript
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
```

**Algoritmen:**
1. **Kolla först om kollision finns** - Använd `intersects()` (performance!)
2. **Beräkna överlappning** i alla fyra riktningar
3. **Minsta överlappning** = mest troliga kollisionsriktningen
4. **Returnera riktning** som ett objekt

**Varför minsta överlappning?**
Om spelaren kolliderar med en plattform ovanifrån, kommer överlappningen vertikalt (top/bottom) vara mindre än horisontellt (left/right). Minsta överlappning indikerar senaste kollisionen.

**Inkapsling:** Komplexiteten dold bakom enkelt interface - `getCollisionData(platform)` returnerar `{direction: 'top'}`.

**När använda vilken?**
- `intersects()`: Enkel kollisionskontroll (mynt, fiender) → snabbare
- `getCollisionData()`: Behöver veta riktning (plattformar, väggar) → mer information

### Hantera kollisioner i Game.js - Kollisionsrespons

Nu sätter vi ihop allt! Game itererar genom plattformar och hanterar kollisionsresponsen baserat på riktning.

```javascript
// Antag att spelaren inte står på marken (resettas varje frame)
this.player.isGrounded = false

// Kontrollera kollisioner med plattformar
this.platforms.forEach(platform => {
    const collision = this.player.getCollisionData(platform)
    
    if (collision) {
        if (collision.direction === 'top' && this.player.velocityY > 0) {
            // Kollision från ovan - spelaren landar på plattformen
            this.player.y = platform.y - this.player.height
            this.player.velocityY = 0
            this.player.isGrounded = true
        } else if (collision.direction === 'bottom' && this.player.velocityY < 0) {
            // Kollision från nedan - spelaren träffar huvudet
            this.player.y = platform.y + platform.height
            this.player.velocityY = 0
        } else if (collision.direction === 'left' && this.player.velocityX > 0) {
            // Kollision från vänster
            this.player.x = platform.x - this.player.width
        } else if (collision.direction === 'right' && this.player.velocityX < 0) {
            // Kollision från höger
            this.player.x = platform.x + platform.width
        }
    }
})
```

**Viktiga detaljer:**

**1. Reset isGrounded varje frame:**
```javascript
this.player.isGrounded = false
```
Vi antar att spelaren är i luften tills vi bevisar motsatsen. Om någon kollision hittas från toppen sätts den till `true`.

**2. Velocity checks:**
```javascript
collision.direction === 'top' && this.player.velocityY > 0
```
Vi kollar inte bara riktning, utan också **hastighet**! Annars skulle spelaren "fastna" på plattformen även när den hoppar upp genom den.

**3. Position correction:**
```javascript
this.player.y = platform.y - this.player.height
```
Vi **snappar** spelaren till exakt position på plattformen. Detta förhindrar att spelaren sjunker in i plattformen.

**4. Velocity reset:**
```javascript
this.player.velocityY = 0
```
När spelaren landar nollställs vertikal hastighet. Annars skulle gravitationen fortsätta accelerera spelaren nedåt!

**Separation of Concerns:**
- **Game**: Organiserar kollisionskontroller (vilka objekt ska kollas?)
- **GameObject**: Tillhandahåller kollisionsverktyg (`getCollisionData`)
- **Game**: Hanterar kollisionsrespons (vad händer vid kollision?)

**Reflektion:** Varför hanterar Game kollisionsresponsen istället för Player? För att Game känner till **spelets regler** - hur fysik fungerar. Player vet bara hur den rör sig.

Beräkningarna för kollisioner delas in i fyra fall:

1. **Från ovan** (landar): 
   - Sätt `isGrounded = true`
   - Stoppa vertikal hastighet
   - Placera spelaren ovanpå plattformen

2. **Från nedan** (bonka huvudet):
   - Stoppa vertikal hastighet
   - Placera spelaren under plattformen

3. **Från sidorna**:
   - Stoppa horisontell rörelse
   - Placera spelaren vid plattformens kant

## Testa spelet

När du kör spelet borde du nu kunna:
1. Se spelaren falla nedåt på grund av gravitation.
2. Landa på plattformar.
3. Hoppa mellan plattformar.
4. Navigera runt i nivån.

Testa att justera värdena för gravitation, friktion i `Game.js` och hoppkraft i `Player.js` för att få den känsla du vill ha i spelet.

## Uppgifter

Nu finns det verkligen många möjligheter till nya funktioner i spelet. Du får absolut utforska och experimentera utifrån vad du vill göra, men här är några förslag på vad du kan prova på:

### Dubbelhopp

**Du lär dig att hantera state mer avancerat.**

En ganska vanlig funktion i plattformsspel är dubbelhopp, där spelaren kan hoppa en gång till medan hen är i luften. För att implementera detta kan du lägga till en räknare för hopp i `Player.js` som håller reda på hur många hopp spelaren har gjort sedan senaste markkontakt.

Du kan sen använda detta i villkoret för om spelaren får hoppa igen. Det sätter alltså `isGrounded` ur funktion när spelaren är i luften och bara har hoppat en gång.

### Dash

**Du lär dig använda timers och state för att skapa tidsbegränsade rörelser.**

En annan rolig mekanik är att låta spelaren göra en snabb rörelse i en riktning, ofta kallad "dash". Detta kan ge spelaren möjlighet att snabbt undvika faror eller nå svåra platser. Detta påminner i stort om mekaniken i att göra ett hopp, men vi flyttar istället spelaren horisontellt med en snabb rörelse.

Precis som för ett dubbelhopp behöver du hålla reda på om spelaren har dashat (kan jämföras med isGrounded) och sedan återställa detta när en dash är klar eller en viss tid har gått.

För att tidsbestämma hur länge dashen varar kan du använda `deltaTime` för att räkna ner en timer. **Kom ihåg att alla nya egenskaper du behöver måste läggas till i konstruktorn i `Player.js`.**

```javascript
// Dash, update() i Player.js samt egenskaper i konstruktorn
if (this.game.inputHandler.keys.has('Shift') && !this.hasDashed) {
    this.velocityX = this.facingDirection * this.dashSpeed // dashSpeed är en ny egenskap
    this.hasDashed = true // ny egenskap
    this.dashTimer = this.dashDuration // dashDuration är en ny egenskap
}
// Om spelaren har dashat, räkna ner dashTimer
if (this.hasDashed) {
    this.dashTimer -= deltaTime
    if (this.dashTimer <= 0) {
        this.hasDashed = false
        this.velocityX = 0 // stoppa dash rörelsen
    }
}
```

### Vägghopp

**Du lär dig använda kollisionsdata för att skapa nya rörelsemekanismer.**

Eftersom vi har en kollisionshantering där vi kan avgöra från vilken riktning spelaren kolliderar med plattformar, kan vi implementera vägghopp. Detta innebär att om spelaren kolliderar med en vägg (från vänster eller höger) och trycker på hoppknappen, så kan hen hoppa uppåt från väggen.

Vi behöver här alltså skapa ett undantag i hopp-logiken som tillåter hopp även när spelaren inte är `isGrounded`, men bara om hen kolliderar med en vägg.
Med en ny egenskap `isTouchingWall` som sätts i kollisionshanteringen kan vi börja med en implementation av detta.

```javascript
// Hopp - tillåt hopp från väggar
if (this.game.inputHandler.keys.has(' ') && (this.isGrounded || this.isTouchingWall)) {
    this.velocityY = this.jumpPower
    this.isGrounded = false
}
```

### Rörliga plattformar

**Du lär dig att skapa nya objekt som ärver från befintliga klasser och lägger till ny funktionalitet.**

Rörliga plattformar kan lägga till en extra dimension av utmaning i spelet. Du kan skapa en ny klass `MovingPlatform` som ärver från `Platform` och lägger till rörelse i `update()` metoden. Plattformen kan röra sig horisontellt eller vertikalt mellan två punkter. Du kan skapa och lägga till dessa plattformar i `Game.js` på samma sätt som vanliga plattformar.

## Sammanfattning

Nu har vi testat att lägga till fysik i vårt plattformsspel! Vi har implementerat gravitation, hopp och kollisionshantering mellan spelaren och plattformar. Detta ger oss en solid grund för att bygga vidare på spelet med fler funktioner och mekaniker.

Det är funktioner som detta som faktiskt börjar skapa en gameloop där spelaren kan interagera med världen på ett meningsfullt sätt.

### Testfrågor

**Fysik och spelkänsla:**
1. **Fysikkonstanter:** Var definieras `gravity` och `friction` och varför placeras de där? Diskutera centraliserad konfiguration.
2. **Gravitation:** Hur appliceras gravitation på spelaren i varje frame? Förklara formeln `velocityY += gravity * deltaTime`.
3. **Friktion:** Vad är syftet med `friction` (luftmotståndet) och hur påverkar det spelarens fallhastighet? Vad händer om vi tar bort det?
4. **Terminal velocity:** Varför når spelaren en maximal fallhastighet? Förklara balansen mellan gravity och friction.
5. **Game feel tweaking:** Hur kan du justera hoppkraften för att göra spelet mer utmanande eller lättare? Vilka värden skulle du ändra och varför?

**Kollisionshantering:**

6. **Två kollisionsmetoder:** Förklara skillnaden mellan `intersects()` och `getCollisionData()`. När bör du använda den ena över den andra?
7. **Algoritm:** Hur beräknar `getCollisionData()` från vilken riktning en kollision sker? Beskriv processen steg för steg med overlap-beräkningar.
8. **Minsta overlap:** Varför använder vi minsta överlappningen för att bestämma riktning? Ge ett exempel där detta är viktigt.

**State Management:**

9. **isGrounded reset:** Vad händer med `isGrounded` egenskapen under en frames uppdatering i `Game.js`? Varför sätts den till `false` först?
10. **Velocity checks:** Varför kontrollerar vi `this.player.velocityY > 0` när vi hanterar kollision från 'top'? Vad skulle hända om vi inte hade detta villkor?
11. **Position snapping:** Varför "snappar" vi spelarens position till `platform.y - this.player.height` vid landning? Vad händer utan detta?

**Arkitektur:**

12. **Update-ordning:** I vilken ordning sker uppdateringarna i `Game.js` `update()` metoden och varför är den ordningen viktig? (gameObjects → platforms → player → kollisioner)
13. **Separation of Concerns:** Varför hanterar Game kollisionsresponsen istället för Player? Diskutera spelets regler vs objektens beteende.
14. **Separat array:** Varför har vi en separat `platforms` array istället för att lägga plattformar i `gameObjects`? Diskutera performance och organisation.

**Reflektion och utvidgning:**

15. **Komponenttänk:** Hur skulle en "PhysicsComponent" kunna separera fysiklogiken från Player? Diskutera för/nackdelar.
16. **Rörliga plattformar:** Om plattformar rör sig - hur skulle du hantera att spelaren "åker med" på plattformen?
17. **Wall jump:** Hur skulle du implementera wall jump? Vilken state behöver trackas (`isTouchingWall`)?
18. **Game feel:** Testa olika gravity/friction/jumpPower-kombinationer. Hur påverkar de spelkänslan? Vilka värden ger "floaty" vs "snappy" känsla?

**Reflektionsfrågor:**
- Varför är det viktigt att nollställa `velocityY` när spelaren landar?
- Hur skulle dubbelhopp implementeras med current state management?
- Vad är för/nackdelar med att ha fysikkonstanter i Game vs globalt?

## Nästa steg

**Vad du lärt dig:**
- Fysik-simulation - Gravitation, acceleration, friktion
- State management - `isGrounded` för att spåra spelartillstånd
- Riktningsbaserad kollision - `getCollisionData()` för avancerad kollisionshantering
- Game feel - Hur små tweaks i fysikvärdena påverkar spelkänslan
- Kollisionsrespons - Position snapping och velocity reset
- Separation of Concerns (igen!) - Fysikkonstanter i Game, beteende i Player

**Nästa:** Collectibles! Vi lägger till mynt som spelaren kan plocka upp, score-system och UI. Detta introducerar `markedForDeletion` pattern - ett viktigt designmönster för att ta bort objekt säkert.

Byt till `04-collectibles` branchen:

```bash
git checkout 04-collectibles
```

Läs sedan **[Steg 4 - Collectibles](04-collectibles.md)** för att fortsätta!
