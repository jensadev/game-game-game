# Steg 2 - Kollisionsdetektering

Vi lär oss hur två objekt kan upptäcka när de kolliderar - fundamentalt för interaktiva spel.

## Vad lär vi oss?

I detta steg fokuserar vi på:
- **AABB-kollision** - Axis-Aligned Bounding Box, enklaste kollisionsformen
- **Single Responsibility** - Vem äger ansvaret för kollisionskontroll?
- **Riktningsdetektering** - Från vilket håll sker kollisionen?
- **Separation av ansvar** - Player vs Game vs GameObject

## Översikt

För att implementera kollisioner behöver vi:
1. **intersects() metod** - Enkel ja/nej-kontroll av överlapp
2. **Kollisionskontroll i Game.js** - Game organiserar kontrollen
3. **Separation av Player** - Lagra spelaren separat från gameObjects

## Förutsättningar

Innan du börjar med kollisioner bör du ha:
- En fungerande `GameObject`-klass
- En `Player`-klass som kan röra sig (se [player.md](01-player.md))
- Minst en annan typ av objekt (t.ex. `Rectangle`)

## Vad är AABB-kollision?

AABB står för **Axis-Aligned Bounding Box** - det är den enklaste och snabbaste formen av kollisionsdetektering för rektanglar.

> 🛟 Ibland kan det hjälpa att se hitboxes runt spelare och fiender. I draw metoden kan du lägga till `ctx.strokeStyle = 'red' ctx.strokeRect(this.x, this.y, this.width, this.height)` för att rita en röd ram runt objektet. Nu kan du se exakt hur stort objektet är.

### Hur fungerar det?

Två rektanglar kolliderar om de **överlappar varandra**. För att kolla detta måste alla dessa villkor vara sanna:
- Vänster sida av rektangel A är till vänster om höger sida av rektangel B
- Höger sida av rektangel A är till höger om vänster sida av rektangel B
- Toppen av rektangel A är ovanför botten av rektangel B
- Botten av rektangel A är under toppen av rektangel B

**Illustration - Kollision upptäckt:**
```
     A.x            A.x + A.width
      ├──────────────┤
      │   Player A   │
      │              │
      └──────┬───────┘
             │ Överlapp!
      ┌──────┴───────┐
      │   Object B   │
      │              │
      └──────────────┘
     B.x            B.x + B.width
```

**Illustration - Ingen kollision:**
```
      ┌──────────┐              ┌──────────┐
      │ Player A │   Mellanrum  │ Object B │
      └──────────┘              └──────────┘
```

### Implementering i GameObject

I `GameObject`-klassen finns redan metoden `intersects()` som kontrollerar AABB-kollision. Den fungerar så att den tar ett annat `GameObject`, `other`, som parameter och returnerar `true` om de kolliderar, annars `false`.

```javascript
intersects(other) {
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y
}
```

## Var ska kollision kontrolleras?

När vi frågar oss var kollisionskontrollen ska ske tänker vi på ansvar: Är det spelaren som ansvarar för att kolla om den kolliderar med andra objekt, eller är det spelet som helhet?

Det är `Game`-klassens ansvar att kontrollera kollisioner. Detta följer **Single Responsibility Principle**:

**Varför Game?**
- Game har överblick över alla objekt.
- Spelets regler hanteras centralt.
- Player behöver inte veta om andra objekt.

**Viktigt:** Vi behöver sparar spelaren separat i `Game`, inte som en del av `gameObjects`-arrayen. Detta gör det enklare att hantera spelaren direkt och undviker onödig iteration över alla objekt när vi bara vill uppdatera eller rita spelaren.

```javascript
// I Game.js constructor
export default class Game {
    constructor(width, height) {
        this.width = width
        this.height = height
        
        this.inputHandler = new InputHandler(this)
        
        // Spelaren separat
        this.player = new Player(this, 50, 50, 50, 50, 'green')
        
        // Andra objekt i en array
        this.gameObjects = [
            new Rectangle(this, 200, 150, 50, 50, 'red'),
            new Rectangle(this, 300, 200, 100, 30, 'blue')
        ]
    }
}
```

## Grundläggande kollisionskontroll

I `Game`-klassens `update()`-metod lägger vi till kollisionskontroll:

```javascript
update(deltaTime) {
    // Uppdatera alla objekt
    this.player.update(deltaTime)
    this.gameObjects.forEach(obj => obj.update(deltaTime))
    
    // Kolla kollision mellan spelaren och andra objekt
    this.gameObjects.forEach(obj => {
        if (this.player.intersects(obj)) {
            console.log('Kollision!') // För testning
            // Här hanterar vi kollisionen
        }
    })
}
```

## Kollisionsrespons - Stoppa spelaren

När vi upptäcker en kollision måste vi **reagera** på den. Det vanligaste är att stoppa spelaren från att gå igenom objektet.

### Enkel version - Flytta tillbaka spelaren

Vi använder `directionX` och `directionY` från `Player`-klassen för att veta åt vilket håll spelaren rör sig:

```javascript
this.gameObjects.forEach(obj => {
    if (this.player.intersects(obj)) {
        // Hantera kollision baserat på riktning
        if (this.player.directionX > 0) { // rör sig åt höger
            this.player.x = obj.x - this.player.width
        } else if (this.player.directionX < 0) { // rör sig åt vänster
            this.player.x = obj.x + obj.width
        }
        
        if (this.player.directionY > 0) { // rör sig neråt
            this.player.y = obj.y - this.player.height
        } else if (this.player.directionY < 0) { // rör sig uppåt
            this.player.y = obj.y + obj.height
        }
    }
})
```

### Varför fungerar detta?

- När spelaren rör sig **åt höger** (`directionX > 0`), placerar vi spelaren precis till **vänster** om objektet
- När spelaren rör sig **åt vänster** (`directionX < 0`), placerar vi spelaren precis till **höger** om objektet
- Samma logik för vertikal rörelse

**Illustration - Rörelse åt höger:**
```
Före kollision:
   ┌─────┐      ┌────────┐
   │  P  │ →    │ Object │
   └─────┘      └────────┘

Vid kollision (upptäckt):
         ┌─────┬────────┐
         │  P  │ Object │
         └─────┴────────┘

Efter korrigering:
   ┌─────┐┌────────┐
   │  P  ││ Object │  ← Spelaren flyttad till obj.x - player.width
   └─────┘└────────┘
```

**Illustration - Rörelse åt vänster:**
```
Före kollision:
   ┌────────┐      ┌─────┐
   │ Object │    ← │  P  │
   └────────┘      └─────┘

Efter korrigering:
   ┌────────┐┌─────┐
   │ Object ││  P  │  ← Spelaren flyttad till obj.x + obj.width
   └────────┘└─────┘
```

## Rita spelaren korrekt

För att spelaren ska synas ovanpå andra objekt, rita den sist:

```javascript
draw(ctx) {
    // Rita alla andra objekt först
    this.gameObjects.forEach(obj => obj.draw(ctx))
    
    // Rita spelaren sist (hamnar överst)
    this.player.draw(ctx)
}
```

## Uppgifter

### Grundläggande kollision

Implementera kollisionsdetektering mellan spelaren och flera rektanglar. Testa att spelaren inte kan gå igenom dem.

### Visuell feedback

När spelaren kolliderar med ett objekt, byt färg på objektet eller spelaren för att visa att kollision har inträffat. Eller varför inte göra spelarens mun ledsen (då behöver du även byta tillbaka den)?

```javascript
if (this.player.intersects(obj)) {
    obj.color = 'red' // Ändra färg vid kollision
    // ... hantera kollision
}
```

### En labyrint

Bygg en labyrint med rektanglar som spelaren måste navigera genom. Använd flera `Rectangle`-objekt för att skapa väggar och hinder.

### Mål-objekt

Skapa en `Goal`-klass som spelaren kan nå, du gör detta genom att ärva från `GameObject`. Du behöver sedan uppdatera `Game`-klassen för att inkludera ett målobjekt och kolla om spelaren når det.

### Samla objekt

Lägg till samlingsobjekt (t.ex. mynt) som spelaren kan plocka upp. När spelaren kolliderar med ett samlingsobjekt skaffa poäng och ta bort objektet från spelet.

## Sammanfattning

I den här delen så har vi använt våra klasser för att faktiskt implementera lite spelmekanik. Vår spelare kan nu interagera med andra objekt genom kollisioner, och vi har lärt oss hur vi kan hantera dessa kollisioner.

### Testfrågor

1. Vad betyder AABB och vilka former fungerar den med?
2. Varför lagras spelaren separat från `gameObjects`-arrayen?
3. Varför är det `Game`-klassen som ansvarar för kollisionsdetektering?
4. Varför ritar vi spelaren sist i `draw()`-metoden?
5. Vad händer om spelaren rör sig väldigt snabbt mot ett tunt objekt? (detta kallas tunneling)
6. Hur kan vi ändra färgen på ett objekt vid kollision för visuell feedback?
7. Hur skulle du använda AABB-kollision för att detektera om spelaren står på en plattform? Vad behöver du veta?

## Nästa steg

Med kollisionsdetektering på plats kan vi nu gå vidare till att implementera mer avancerad fysik, som gravitation och hopp. Vi kommer också att titta på hur vi kan hantera olika typer av objekt och deras interaktioner med spelaren.

Byt branch till `03-physics` och fortsätt till nästa del i guiden!

```bash
git checkout 03-physics
```

Öppna sedan filen [Steg 3 - Fysik](03-physics.md) för att fortsätta!