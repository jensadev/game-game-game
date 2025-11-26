# Steg 4 - Collectibles - Mynt och Score system

I detta steg lägger vi till samlarbara objekt (mynt) och ett score-system med UI. Detta ger spelet en gameplay-loop där spelaren har ett mål: samla så många mynt som möjligt.

## Vad lär vi oss?

I detta steg fokuserar vi på:
- **markedForDeletion pattern** - Ett säkert ta bort objekt under iteration.
- **State management** - Hålla reda på spelets tillstånd (score, coins).
- **UI as presentation layer** - Separation mellan data och visning. Att förstå att det användaren ser är en presentation av spelets tillstånd. Variablerna håller värden i sig, men vi måste rita dem på skärmen för att spelaren ska se dem.
- **DRY-principen** - Do not repeat yourself. Återanvändbart borttagnings-mönster i GameObject.
- **Vem äger vad, eller är ansvarig för** - Coin äger sitt value, Game äger totalen.

### Varför är detta viktigt?

Detta steg introducerar **gameplay-loop**:
1. Spelaren rör sig runt
2. Plockar upp mynt
3. Får poäng
4. Ser feedback (UI uppdateras)
5. Känner progression!

Utan mål och feedback är ett spel bara en sandlåda. Collectibles skapar **motivation** och **progression**.

## Översikt

För att skapa ett collectibles-system behöver vi:
1. **markedForDeletion i GameObject** - Ett gemensamt sätt att markera objekt för borttagning
2. **Coin-klass** - Objekt som spelaren kan plocka upp
3. **Game State** - Hålla reda på score och antal mynt samlade
4. **UI-klass** - Visa score och statistik på skärmen
5. **Pickup-logik** - Detektera när spelaren plockar upp mynt

## markedForDeletion - Ett designmönster

När en spelare plockar upp ett mynt vill vi ta bort det från spelet. Men att **direkt ta bort objekt från en array under iteration är farligt**!

### Problemet med direkt borttagning:

```javascript
// FARLIGT! ❌
this.coins.forEach((coin, index) => {
    if (this.player.intersects(coin)) {
        this.coins.splice(index, 1) // Modifierar arrayen under iteration!
    }
})
```

**Vad går fel?**
- När vi tar bort element ändras index för alla efterföljande element
- forEach fortsätter med gamla index-värden
- Vissa objekt kan "hoppas över" eller kontrolleras två gånger
- Bugs som är svåra att reproducera!

### Lösningen: markedForDeletion pattern

Vi använder ett **tvåstegs-mönster**:
1. **Markera** objekt för borttagning under iteration
2. **Ta bort** alla markerade objekt efter iteration

```javascript
export default class GameObject {
    constructor(game, x = 0, y = 0, width = 0, height = 0) {
        ...
        this.markedForDeletion = false // Ny!
    }
}
```

**Varför i GameObject?**
- **DRY-principen**: Alla GameObjects kan använda samma pattern.
- **Återanvändbart**: Fungerar för coins, enemies, projectiles, particles, etc.
- **Ingen duplicerad kod**: Behöver inte implementeras i varje subklass.
- **Välkänt mönster**: Används i de flesta spelmotorer.

### Hur det fungerar:

**Steg 1 - Markera:**
```javascript
// Under update-cykeln
if (this.player.intersects(coin)) {
    coin.markedForDeletion = true // Säkert att markera under iteration
}
```

**Steg 2 - Ta bort:**
```javascript
// Efter alla uppdateringar
this.coins = this.coins.filter(coin => !coin.markedForDeletion)
```

**Vem äger vad:**
- **GameObject/Coin ansvarar för:** Att veta om den ska tas bort (`markedForDeletion = true`)
- **Game ansvarar för:** Att faktiskt ta bort objekt från arrayen (`filter`)
- Varje klass har sitt ansvarsområde och blandar inte ihop logik

**Fördelar:**
- **Säkert**: Ingen modifiering av arrays under iteration.
- **Förutsägbart**: Alla objekt kontrolleras en gång per frame.
- **Flexibelt**: Objekt kan markeras när som helst under update-cykeln.
- **Tydligt**: Cleanup sker på ett ställe efter alla uppdateringar.

**Reflektion:** Detta är ett exempel på hur vi löser vanliga problem i spelutveckling med etablerade designmönster!

## Coin-klassen - Game juice!

För att representera samlarbara mynt skapar vi en `Coin` klass med en enkel men effektiv animation:

```javascript
export default class Coin extends GameObject {
    constructor(game, x, y, size = 20, value = 10) {
        super(game, x, y, size, size)
        this.size = size
        this.color = 'yellow' 
        this.value = value // Poäng för detta mynt
        
        // Bob animation
        this.bobOffset = 0
        this.bobSpeed = 0.002
        this.bobDistance = 5
    }

    update(deltaTime) {
        // Gungar myntet upp och ner
        this.bobOffset += this.bobSpeed * deltaTime
    }

    draw(ctx) {
        // Beräkna y-position med bob
        const bobY = Math.sin(this.bobOffset) * this.bobDistance
        // Rita myntet som en cirkel
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2 + bobY, this.size / 2, 0, Math.PI * 2)
        ctx.fill()
    }
}
```

### Vem äger vad - Coin äger sitt värde

**Viktigt designbeslut:** `value` är en property i `Coin`, inte i `Game`! 

```javascript
this.value = value // Myntet vet sitt eget värde
```

**Varför?**
- **Inkapsling**: Myntet äger sin egen data.
- **Flexibilitet**: Olika mynt kan ha olika värden.
- **Separation**: Game behöver inte veta om varje mynts värde i förväg.

**Exempel:**
```javascript
new Coin(this, 200, 100, 20, 10)  // Vanligt mynt, 10 poäng
new Coin(this, 300, 150, 30, 50)  // Stort mynt, 50 poäng
new Coin(this, 400, 200, 15, 5)   // Litet mynt, 5 poäng
```

Game frågar bara myntet om dess värde när det plockas upp: `coin.value` och använder det för att uppdatera score.

### Game juice - Bob animation

"Game juice" = små detaljer som gör spelet kännas levande! Om du inte sett eller minns så rekommenderas följande video: [Juice it or lose it](https://www.youtube.com/watch?v=Fy0aCDmgnxg).

**Hur bob-animationen fungerar:**

```javascript
this.bobOffset += this.bobSpeed * deltaTime  // Ökar kontinuerligt
const bobY = Math.sin(this.bobOffset) * this.bobDistance
```

**Matematiken:**
- `Math.sin()` ger värde mellan -1 och 1
- Multiplicerat med `bobDistance` (5 pixels) = rör sig 5 pixels upp/ner
- `bobSpeed` styr hur snabbt gungningen sker
- `deltaTime` gör animationen framerate-oberoende

**Resultat:** Myntet "svävar" mjukt upp och ner → känns mer levande än statiska objekt!

**Game juice exempel:**
- Bob animation på mynt.
- Partikel-effekter när mynt plockas upp.
- Ljud-effekter för pickup.
- Screen shake när spelaren tar skada.

Små detaljer = stor skillnad i spelkänsla!

## Game State - Hålla reda på progression

**State management** = Hålla reda på spelets nuvarande status.

Vi sparar state i `Game.js` för att ha en central plats:

```javascript
// Game state
this.score = 0
this.coinsCollected = 0
```

**Varför i Game?**
- **Centraliserat**: Ett ställe för all spelstatus.
- **Lätt att läsa**: UI kan hämta från `this.game.score`.
- **Lätt att spara**: Senare kan vi spara `this.score` till localStorage.
- **Lätt att debugga**: `console.log(this.game)` visar allt.

### Vem äger vad - Separation of data

**Viktigt:**
- **Coin äger:** `value` (hur mycket myntet är värt)
- **Game äger:** `score` (totala poängen) och `coinsCollected` (antal samlade)

```javascript
// När mynt plockas upp:
this.score += coin.value  // Game frågar myntet om dess värde
this.coinsCollected++     // Game håller räkningen
```

**Varför denna separation?**
- Myntet vet sitt eget värde (inkapsling).
- Game behöver inte hålla en lista över alla möjliga mynt-värden.
- Flexibelt: olika mynt kan ha olika värden.

## UI - Presentation Layer

För att visa score och mynt på skärmen skapar vi en dedikerad `UserInterface` klass. Det ger oss en sammanhängande plats för all UI-relaterad rendering.

```javascript
export default class UserInterface {
    constructor(game) {
        this.game = game
        this.fontSize = 24
        this.fontFamily = 'Arial'
        this.textColor = '#FFFFFF'
        this.shadowColor = '#000000'
    }

    draw(ctx) {
        ctx.save()
        
        // Konfigurera text
        ctx.font = `${this.fontSize}px ${this.fontFamily}`
        ctx.fillStyle = this.textColor
        ctx.shadowColor = this.shadowColor
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        ctx.shadowBlur = 3
        
        // Rita score
        const scoreText = `Score: ${this.game.score}`
        ctx.fillText(scoreText, 20, 40)
        
        // Rita coins collected
        const coinsText = `Coins: ${this.game.coinsCollected}`
        ctx.fillText(coinsText, 20, 70)
        
        ctx.restore()
    }
}
```

### Model-View Separation (MV-pattern)

**UI är "View" - presentationslagret:**
- **Model** (Game state): `this.game.score`, `this.game.coinsCollected`
- **View** (UI): Läser från model och ritar på skärmen

**Separation:**
```javascript
// Game äger DATA
this.score = 100

// UI läser DATA och visar den
const scoreText = `Score: ${this.game.score}`
ctx.fillText(scoreText, 20, 40)
```
**Varför separera?**
- **Testbarhet**: Kan testa game state utan UI.
- **Flexibilitet**: Kan byta UI-stil utan att ändra game logic.
- **Återanvändbarhet**: Samma UI-klass för olika spel.
- **Klarhet**: Presentation och logik blandar inte ihop sig.

### Varför en separat UI-klass?

**Istället för att rita text direkt i Game.draw():**
```javascript
// ❌ Blandar logik och presentation
draw(ctx) {
    ctx.fillText(`Score: ${this.score}`, 20, 40)
    // ... massa mer UI-kod i Game
}
```

**Vi separerar:**
```javascript
// ✅ Tydlig separation
class Game {
    draw(ctx) {
        this.ui.draw(ctx)  // UI ansvarar för sin egen rendering
    }
}
```

**Fördelar:**
- All UI-styling på ett ställe
- Lätt att lägga till nya UI-element
- Game-klassen blir inte bloated med UI-kod

**Reflektion:** När UI växer (health bars, minimaps, menus) är denna separation väldigt tacksam!

## Make it rain! Skapa mynt i nivån

I `Game.js` konstruktor skapar vi en array med mynt. I nuläget så har vårt spel bara en "nivå", så vi hårdkodar detta.

```javascript
this.coins = [
    new Coin(this, 200, this.height - 180),
    new Coin(this, 240, this.height - 180),
    new Coin(this, 450, this.height - 240),
    // ... fler mynt
]
```

Mynten placeras strategiskt för att skapa utmaning och intresse:
- Vid plattformar
- Mellan plattformar (kräver hopp)
- Olika höjder för variation

## Plocka upp mynt - Två-stegsprocessen

För att plocka upp mynt använder vi **markedForDeletion pattern** i två steg:

### Steg 1 - Markera mynt vid kollision

```javascript
// Kontrollera kollision med mynt
this.coins.forEach(coin => {
    if (this.player.intersects(coin) && !coin.markedForDeletion) {
        // Plocka upp myntet
        this.score += coin.value
        this.coinsCollected++
        coin.markedForDeletion = true
    }
})
```

**Varför `!coin.markedForDeletion`?**
Utan denna check skulle spelaren kunna få poäng flera gånger för samma mynt! 

**Scenario utan check:**
```
Frame 1: Kollision → score += 10, markedForDeletion = true
Frame 2: Mynt finns kvar i arrayen, kollision finns kvar → score += 10 igen!
Frame 3: Mynt tas bort
```

Med check:
```
Frame 1: Kollision → score += 10, markedForDeletion = true
Frame 2: markedForDeletion = true → check misslyckas, inget händer 
Frame 3: Mynt tas bort
```

### Steg 2 - Ta bort markerade mynt

När ett mynt plockats upp så har du satt `markedForDeletion = true`. Nu behöver vi ta bort dessa mynt från `this.coins` arrayen, vi behöver alltså städa efter oss.

```javascript
// Efter alla uppdateringar
this.coins = this.coins.filter(coin => !coin.markedForDeletion)
```

**Array.filter():**
- Skapar en ny array med endast objekt där villkoret är `true`
- `!coin.markedForDeletion` = behåll mynt som INTE är markerade
- Säkert att göra efter iteration

**Visualisering:**
```javascript
// Före filter:
coins = [coin1, coin2(marked), coin3, coin4(marked)]

// Efter filter:
coins = [coin1, coin3]
```

### Hela flödet i Game.update()

```javascript
update(deltaTime) {
    // 1. Uppdatera alla objekt
    this.coins.forEach(coin => coin.update(deltaTime))
    this.player.update(deltaTime)
    
    // 2. Kolla kollisioner och MARKERA
    this.coins.forEach(coin => {
        if (this.player.intersects(coin) && !coin.markedForDeletion) {
            this.score += coin.value
            this.coinsCollected++
            coin.markedForDeletion = true
        }
    })
    
    // 3. TA BORT markerade objekt
    this.coins = this.coins.filter(coin => !coin.markedForDeletion)
}
```

**Ordningen är kritisk:**
1. Update först (animationer, rörelse)
2. Kollisionskontroll och markering
3. Cleanup sist

**Reflektion:** Detta pattern kommer användas för enemies, projectiles, particles - alla objekt som tas bort dynamiskt!

### Varför intersects() och inte getCollisionData()?

För mynt behöver vi bara veta **OM** kollision sker, inte från vilken riktning. `intersects()` är:
- Snabbare (ingen riktningsberäkning)
- Enklare att läsa
- Perfekt för triggers och pickups

## Att rita på canvas och varför ordningen är viktig

När vi ritar alla objekt på canvas i `Game.js` `draw()` metoden är ordningen viktig. Varför? För att ordningen avgör vad som hamnar framför vad visuellt.

```javascript
draw(ctx) {
    this.platforms.forEach(platform => platform.draw(ctx))  // Bakgrund
    this.coins.forEach(coin => coin.draw(ctx))              // Mynt
    this.gameObjects.forEach(obj => obj.draw(ctx))          // Andra objekt
    this.player.draw(ctx)                                   // Spelare
    this.ui.draw(ctx)                                       // UI överst
}
```

## Nu är du redo att samla digital rikedomar!

Nu kan du:
1. **Samla mynt** - Spring/hoppa in i mynt för att plocka upp dem.
2. **Se score öka** - Score visas i övre vänstra hörnet.
3. **Räkna mynt** - Antal samlade mynt visas också.

Vi har alltså skapat ett första steg för att spelets ska ha mål och vara intressant att spela.

## Uppgifter

### Silver och guld

**Du lär dig mer om och övar på att skapa klasser och arv.**

Skapa två olika mynttyper med olika värden och färger. Det kan vara guldmynt (värde 50) och silvermynt (värde 10). Du kan antingen sätta olika värden när du skapar mynten i `Game.js`, eller skapa två nya klasser `GoldCoin` och `SilverCoin` som ärver från `Coin` klassen.

### Skriv ut totalt antal mynt i nivån

**Du övar på att använda spelets state och uppdatera UI.**

Lägg till en egenskap i `Game.js` som håller reda på totalt antal mynt i nivån. Uppdatera UI för att visa detta som `Coins: X/Y` där X är samlade mynt och Y är totalt antal mynt. Det gör målet för gameloopen tydligt för spelaren.

### Roterande mynt

**Du lär dig om canvas transformationer och rotation.**

Lägg till en roterande animation på mynten för att göra dem mer visuellt tilltalande. Du kan använda `ctx.rotate()` i `Coin.draw()` metoden för att rotera myntet baserat på tid eller en intern räknare.

När du använder en funktion som `ctx.rotate()` måste du spara och återställa canvasens tillstånd med `ctx.save()` och `ctx.restore()` för att undvika att påverka andra ritningar.

```javascript
ctx.save()
// Rotationslogik 
ctx.rotate(angleInRadians)
// Rita myntet här
ctx.restore()
```
## Sammanfattning

I detta steg har vi utforskat flera viktiga design patterns och arkitekturkoncept:

**markedForDeletion Pattern:**
- Två-stegs process: markera → ta bort
- Säker array-hantering (ingen modification under iteration)
- Återanvändbart pattern för alla dynamiska objekt

**Vem äger vad:**
- `Coin` äger sin `value` (inkapsling)
- `Game` äger total `score` (centraliserad state)
- Tydliga ansvarsområden mellan klasser

**State Management:**
- Centralisera game state i `Game` klassen
- Skalbart för framtida features (achievements, combos, powerups)
- Ett ställe att läsa och modifiera kritisk data

**Model-View Separation:**
- `Game` = Model (äger data och logik)
- `UI` = View (läser och presenterar)
- Separation gör UI-ändringar enkla
- Förberedelse för responsiv UI, olika vyer, debug-overlays

**Game Juice:**
- Bob-animation med `Math.sin()` för smooth rörelse
- Visuell feedback gör pickups mer satisfying
- Enkla matematiska formler för organisk rörelse

**Reflektion framåt:**
När vi nu har Player, Platforms, och Coins i `Game.js` börjar vi se ett mönster - vår `Game` klass växer för varje feature. Detta är naturligt i början, men snart kommer vi behöva fundera på **hur vi strukturerar kod när komplexiteten ökar**. Det är precis vad nästa steg handlar om!

### Testfrågor

#### Grundläggande förståelse

1. **Förklara `markedForDeletion` pattern i två steg:**
   - Vad händer i markering-steget?
   - Vad händer i cleanup-steget?
   - Varför gör vi detta i två separata steg istället för `splice()` direkt?

2. **Varför lägger vi till `markedForDeletion` i `GameObject` istället för i `Coin`?**
   - Vilka andra objekt kommer använda samma pattern?
   - Hur främjar detta återanvändbarhet?

3. **Vad händer om vi glömmer checken `!coin.markedForDeletion`?**
   - Rita ett scenario med frames som visar buggen
   - Hur många gånger får spelaren poäng för samma mynt?

#### Vem äger vad - ansvar och inkapsling

4. **Förklara "who owns what" principen:**
   - Varför äger `Coin` sin egen `value`?
   - Varför äger `Game` totala `score`?
   - Vad skulle hända om alla mynt delade en global `score` variabel?

5. **Vem ansvarar för vad?**
   - Vilken klass ansvarar för att rita ett mynt?
   - Vilken klass ansvarar för att avgöra OM ett mynt ska ritas?
   - Vilken klass ansvarar för att räkna samman total score?

#### State management och centralisering

6. **Varför centraliserar vi score i `Game` klassen?**
   - Vilka problem löser detta?
   - Hur skulle alternativet (score i Player) se ut?
   - Tänk framåt: Om vi har achievements, powerups, combo-multipliers - var ska de vara?

7. **Game state vs Game logic:**
   - Ge exempel på 3 saker som är "state" i vårt spel
   - Ge exempel på 3 saker som är "logic" i vårt spel
   - Varför är det viktigt att skilja på dessa?

#### Model-View separation

8. **Förklara Model-View separation i vårt spel:**
   - Vilken klass är "Model"? (Vad den äger och gör)
   - Vilken klass är "View"? (Vad den äger och gör)
   - Varför låter vi UI läsa från Game istället för att Game skriver direkt på canvas?

9. **Vad händer om vi blandar Model och View?**
   - Ge exempel på hur kod skulle se ut om Game innehöll all UI-ritnings-kod
   - Vilka problem får vi vid UI-ändringar?
   - Hur gör separation detta enklare?

#### Collision och spelkänsla

10. **Varför använder vi `intersects()` för mynt men `getCollisionData()` för plattformar?**
    - Vad är skillnaden mellan metoderna?
    - När behöver vi riktningsinformation?
    - När räcker det med ja/nej-svar?

11. **Game juice i Coin klassen:**
    - Förklara `Math.sin(this.bobTimer * 5) * 3` - vad gör varje del?
    - Varför använder vi sinus för bob-animation?
    - Hur skulle du ändra koden för snabbare/långsammare bob?

#### Design patterns och skalbarhet

12. **Rita flödet från kollision till borttagning:**
    ```
    Frame N:   [Rita hela flödet med metodanrop]
    Frame N+1: [Vad händer nästa frame?]
    Frame N+2: [När försvinner myntet?]
    ```

13. **Hur används samma pattern för andra objekt?**
    - En projectile flyger utanför skärmen - skriv pseudo-kod
    - En enemy dör (health = 0) - skriv pseudo-kod
    - En particle effekt är färdig - skriv pseudo-kod

14. **Ordning i `Game.draw()`:**
    - Varför ritas UI sist?
    - Vad händer om vi ritar mynt efter spelare?
    - Skulle ordningen vara viktig om vi hade en particle-system?

#### Arkitektur och framtid

15. **Reflektion - Vad händer när Game växer?**
    - Just nu har vi player, platforms, coins i Game
    - Om vi lägger till enemies, projectiles, particles, powerups, traps...
    - Vilka problem ser du komma?
    - Hur skulle en array `this.entities = []` hjälpa?

16. **Separation of Concerns:**
    - Hur många olika ansvarsområden har Game just nu?
    - Vilka skulle kunna separeras ut i egna klasser?
    - Jämför med tidigare steg - växer Game's ansvar?

## Nästa steg - Refactoring och fiender

**Vad du har lärt dig i detta steg:**
- **markedForDeletion pattern** - Säker två-stegs borttagning
- **Vem äger vad?** - Vem äger vilken data och ansvar
- **State management** - Centraliserad state i Game
- **Model-View separation** - Game äger data, UI presenterar
- **Game juice** - Bob-animation med Math.sin()

Byt branch till `05-enemies` och fortsätt!

```bash
git checkout 05-enemies
```

Öppna sedan filen [Steg 5, enemies.md](05-enemies.md) för att fortsätta!