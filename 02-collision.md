# Steg 2 - Kollisionsdetektering

I den här delen lär vi oss om kollisionsdetektering - hur vi kan upptäcka när två objekt i spelet kolliderar med varandra. Detta är fundamentalt för att skapa interaktiva spel där spelaren kan plocka upp föremål, stöta på hinder, eller ta skada från fiender.

## Vad lär vi oss?

I detta steg fokuserar vi på:
- **AABB Collision Detection** - Axis-Aligned Bounding Box, den vanligaste kollisionsformen
- **Separation of Concerns** - Vem ansvarar för kollisionskontroll?
- **Single Responsibility Principle** - Game organiserar, GameObject tillhandahåller verktyg
- **Inkapsling av algoritmer** - Kollisionslogik dold bakom enkla metoder

### Varför är kollision så viktig?

Kollision är grunden för **all interaktivitet** i spel:
- Spelaren står på plattformar (fysik)
- Spelaren plockar upp mynt (collectibles)
- Spelaren tar skada från fiender (combat)
- Spelaren trycker på knappar (interaction)

Utan kollisionsdetektering skulle allt bara glida igenom varandra!

## Förutsättningar

Innan du börjar med kollisioner bör du ha:
- En fungerande `GameObject`-klass
- En `Player`-klass som kan röra sig (se [01-player.md](01-player.md))
- Minst en annan typ av objekt (t.ex. `Rectangle`)

## Vad är AABB-kollision?

AABB står för **Axis-Aligned Bounding Box** - det är den enklaste och snabbaste formen av kollisionsdetektering för rektanglar.

**Varför kallas det "Axis-Aligned"?**
- Bounding Box = En osynlig låda runt objektet
- Axis-Aligned = Lådan är alltid parallell med X- och Y-axlarna (inte roterad)

**Fördelar:**
- Extremt snabb att beräkna (bara 4 jämförelser)
- Fungerar perfekt för rektangulära objekt
- Enkel att förstå och implementera

**Begränsningar:**
- Fungerar inte för roterade objekt
- Inte perfekt för cirklar (men ofta tillräckligt bra)
- Kan ge "false positives" i hörnen

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

### Implementering i GameObject - Inkapsling av komplexitet

I `GameObject`-klassen finns redan metoden `intersects()` som kontrollerar AABB-kollision. Den fungerar så att den tar ett annat `GameObject`, `other`, som parameter och returnerar `true` om de kolliderar, annars `false`.

```javascript
intersects(other) {
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y
}
```

**OOP-principer här:**
- **Inkapsling**: Den komplexa matematiken är dold bakom ett enkelt interface - `intersects(other)`
- **Återanvändbarhet**: Alla GameObject-subklasser får denna metod automatiskt
- **Polymorfism**: `other` kan vara vilken GameObject som helst (Player, Enemy, Coin...)

**Varför i GameObject?**
Detta är en **generell** operation som alla spelobjekt kan behöva. Istället för att duplicera koden i Player, Enemy, Coin, etc., placerar vi den i basklassen.

**Reflektion:** Detta är ett exempel på "Don't Repeat Yourself" (DRY) principen - skriv inte samma kod flera gånger!

## Var ska kollision kontrolleras? - Arkitekturbeslut

Om vi minns så har vi pratat en hel del om vad som ansvarar för vad i den kod vi skriver. I det här fallet måste vi fråga oss: **Var ska kollisionskontrollen ske?**

### Tre möjliga ansatser:

**1. I Player-klassen?**
```javascript
// I Player.update()
this.gameObjects.forEach(obj => {
    if (this.intersects(obj)) {
        // hantera kollision
    }
})
```
- **Problem:** Player måste känna till alla andra objekt
- **Problem:** Tight coupling - Player är beroende av andra klasser
- **Problem:** Vad händer när vi vill kolla Enemy vs Enemy?

**2. I GameObject-klassen?**
```javascript
// I GameObject.update()
checkCollisions() {
    // ...
}
```
- **Problem:** Varje objekt måste känna till alla andra objekt
- **Problem:** N² kollisionskontroller (varje objekt kollar mot varje annat)

**3. I Game-klassen?** ✅
```javascript
// I Game.update()
if (this.player.intersects(obj)) {
    // hantera kollision
}
```
- **Fördelar:** Game har överblick över alla objekt
- **Fördelar:** Centraliserad kollisionslogik
- **Fördelar:** Följer Single Responsibility Principle

### Single Responsibility Principle (SRP)

**Player ansvarar för:** Sin egen rörelse och rendering
**Enemy ansvarar för:** Sin egen AI och rendering
**Game ansvarar för:** Att organisera och koordinera alla objekt

Detta följer **Single Responsibility Principle** - varje klass ska ha ett tydligt, avgränsat ansvar.

**Varför Game?**
- Game har överblick över alla objekt
- Spelets regler hanteras centralt
- Player behöver inte veta om andra objekt
- Lättare att lägga till nya objekttyper

**Viktigt:** Vi sparar spelaren separat i `Game`, inte som en del av `gameObjects`-arrayen. Detta gör det enklare att hantera spelaren direkt och undviker onödig iteration.

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

## Nästa steg

**Vad du lärt dig:**
- AABB Collision Detection - den vanligaste kollisionsalgoritmen
- Single Responsibility Principle - Game organiserar, GameObject tillhandahåller verktyg
- Inkapsling av algoritmer - komplex logik dold bakom enkla metoder
- Tight coupling vs Loose coupling - varför centralisering är viktigt
- DRY-principen - återanvänd kod genom arv

**Nästa:** Fysik med gravitation och hopp! Vi kommer använda kollisionsdetektering för att låta spelaren stå på plattformar.

Byt till `03-physics` branchen:

```bash
git checkout 03-physics
```

Läs sedan **[Steg 3 - Physics](03-physics.md)** för att fortsätta!

**Tips:** I nästa steg kommer vi introducera `getCollisionData()` - en mer avancerad kollisionsmetod som ger oss **riktning** på kollisionen. Detta blir viktigt för att avgöra om spelaren landar på en plattform eller träffar sidan!