# Steg 0 - Spelmotor med Vite och JavaScript

## Introduktion

Det här repot är skapat med Vite och innehåller en enkel spelmotor för 2D-spel med JavaScript och HTML5 Canvas. Spelmotorn hanterar grundläggande funktioner som spelobjekt, uppdateringsloop, rendering och input-hantering.

Vi använder Vite för att snabbt kunna starta och utveckla spelet med moderna JavaScript-funktioner och modulhantering. Kommandot för att initiera ett projekt med Vite är:

```bash
npm create vite@latest
```

Men det är redan gjort i detta repo, så du kan klona det direkt och börja utveckla ditt spel.

```bash
git clone <repo-url>
cd <repo-directory>
npm install
npm run dev
```

## Filstruktur

- `index.html`: Huvud-HTML-filen som laddar spelet.
- `src/`: Källkoden för spelet.
  - `Game.js`: Huvudklassen för spelet som hanterar spelloopen och spelobjekten.
  - `GameObject.js`: Bas-klass för alla spelobjekt.
  - `Rectangle.js`: Exempel på ett spelobjekt som är en rektangel.
  - `InputHandler.js`: Hanterar användarinput från tangentbordet.
- `style.css`: Grundläggande CSS för spelet.

## Kodstil

I det här projektet så använder vi import och export för att hantera moduler. Varje klass är sin egen fil och importeras där den behövs.

**Namnkonventioner:**
- Variabler och funktioner: `camelCase` (t.ex. `deltaTime`, `gameObjects`)
- Klasser: `PascalCase` (t.ex. `GameObject`, `Rectangle`)
- Klassfiler: `PascalCase.js` (t.ex. `Game.js`, `GameObject.js`)
- Konstanter: `UPPER_SNAKE_CASE` (t.ex. `MAX_SPEED`, `CANVAS_WIDTH`)

**Kodformat:**
- Inga semikolon i slutet av rader (modern JavaScript-standard)
- 4 mellanslag för indentering
- En klass per fil

## Förklaring av koden

### index.html

Din webbläsare kommer först att ladda denna fil. Den innehåller en `<canvas>`-element där spelet ritas upp, samt länkar till CSS och JavaScript-filer.

> 🎮 Gör spelet till ditt, ändra titeln på webbsidan!

### main.js

Denna fil startar spelet genom att skapa en instans av `Game`-klassen och initiera spelloopen. Det är alltså setup-koden för spelet.

### Game.js

Denna fil innehåller `Game`-klassen som är hjärtat i spelmotorn. Den hanterar:
- Skapandet av spelobjekt.
- Uppdateringsloopen som körs varje frame.
- Rendering av spelobjekt på canvas.
- Hantering av användarinput via `InputHandler`-klassen.

### InputHandler.js

Denna fil innehåller `InputHandler`-klassen som lyssnar på tangentbordsinput. Klassen sparar status för nedtryckta tangenter och tillhandahåller metoder för att kontrollera dessa.

Vi kan använda detta för att påverka spelobjekt i `Game.js`, till exempel genom att öka hastigheten på en rektangel när en viss tangent är nedtryckt.

I exemplet kan du använda tangenterna 'r' och 'b' för att sätta fart på rektanglarna.

### GameObject.js

Denna fil innehåller bas-klass för alla spelobjekt. Den definierar grundläggande egenskaper som position, storlek och metoder för uppdatering och rendering. Alla specifika spelobjekt (som rektanglar) kommer att ärva från denna klass.

#### Rectangle.js

Denna fil innehåller en specifik implementation av ett spelobjekt, nämligen en rektangel. Den ärver från `GameObject`-klassen och implementerar egna metoder för att rita sig själv på canvas.

## Uppgifter

### Rita något med rektanglar!

Använd Rectangle-klassen för att skapa något med rektanglar. Det kan vara ett hus, en bil, ett träd eller vad du vill. Använd din fantasi!

Du kan styra canvasets bakgrundsfärg genom att ändra `style.css`-filen.

### En ny form

Skapa en ny klass som ärver från GameObject, till exempel en cirkel eller en triangel. Implementera dess egna render-metod för att rita den på canvas. Lägg sedan till några instanser av denna nya klass i spelet och se hur de beter sig tillsammans med rektanglarna.

För att rita cirklar på canvas så behöver du använda `arc`-metoden.

```javascript
ctx.beginPath();
ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
ctx.fill();
```

### Visa tid

Rita en text på canvas som visar hur många sekunder spelet har varit igång. Använd `fillText`-metoden på canvas-kontexten för att rita text.

```javascript
ctx.fillStyle = 'black';
ctx.font = '20px Arial';
ctx.fillText(`Tid: ${(this.elapsedTime / 1000).toFixed(2)} s`, 10, 30);
```

### Kombinera former för att rita en figur

Använd både rektanglar och din nya form (t.ex. cirklar) för att skapa en mer komplex figur, som en robot eller ett djur. Placera formerna på rätt positioner för att få dem att se ut som en enhetlig figur.

Om du önskar kan du placera figuren i en separat klass som hanterar dess delar och deras positioner relativt till varandra.

```
   .---.
  /     \
 | o   o |
 |   ^   |
 \_/\_/\_/
 ```

## Sammanfattning

Det här repot ger en grundläggande struktur för att skapa 2D-spel med JavaScript och HTML5 Canvas. Genom att använda klasser och moduler kan vi organisera koden på ett tydligt sätt och enkelt utöka funktionaliteten. 

> 🛟 Känns det som mycket kod att hålla reda på redan nu (Main, Game, GameObject)? Det är lugnt. Du behöver inte memorera allt. Tänk på `main.js` som startnyckeln till en bil och `Game.js` som motorn. Just nu behöver vi bara veta att bilen startar.

### Testfrågor

1. Vad är de tre huvudsakliga ansvarsområdena för Game-klassen?
2. Vad betyder deltaTime och varför används det i uppdateringsloopen?
3. Vilka tre egenskaper definierar position och storlek i GameObject-klassen?
4. Hur fungerar arv i spelmotorn? Ge ett exempel.
5. Vilken namnkonvention används för konstanter och ge ett exempel?
6. Vad händer i main.js och varför behövs requestAnimationFrame?
7. Hur sparar InputHandler information om nedtryckta tangenter?
8. Vilken Canvas-metod rensar skärmen mellan varje frame och varför behövs det?
9. Varför måste vi rensa canvas varje frame? Vad händer om vi skippar `clearRect()`?
10. Beskriv hela flödet från tangent-tryck till pixlar på skärmen. Vilka klasser är involverade?

## Nästa steg

Denna tutorial är uppdelad i steg som följer en logisk progression. Varje steg bygger på det föregående. När du har jobbat klart med materialet i det här steget, byt till nästa branch för att fortsätta till nästa del i guiden.

```bash
git checkout 01-player
```

Öppna sedan filen [Steg 1 - Player](01-player.md) för att fortsätta!

### All dokumentation

All dokumentation för spelet finns i `docs/`-mappen. Varje steg i guiden har sin egen markdown-fil som förklarar koncepten och koden i detalj. Det kan vara så att filerna inte är den senaste eller refererar till kod, byt då till rätt branch för att se koden som hör till dokumentationen.

```bash
git checkout <branch-name>
```
