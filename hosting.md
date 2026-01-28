# Hur hostar du spelet?

För att hosta så kommer vi använda GitHub pages tillsammans med GitHub actions. Vi behöver actions för att bygga projektet med Vite när vi pushar det till GitHub.

1. Slå på GitHub pages i ditt repo:
   - Gå till `Settings` > `Pages`
   - Under `Source`, välj `GitHub Actions` och spara.
2. Skapa mapp för konfiguration av GitHub actions:

   ```bash
   mkdir -p .github/workflows
   ```

3. Skapa en en konfigurationsfil `.github/workflows/main.yaml`
4. Du hittar innehållet till filen [här](./github/workflows/main.yaml). Kopiera innehållet och klistra in det i `main.yaml`.
5. Se till att du har rätt `base` i `vite.config.js` för att peka på rätt sökväg för ditt repo. Om ditt repo heter `game-game-game` så ska `base` vara `/game-game-game/`. Filen ska ligga o roten av ditt projekt.
    ```js
    // vite.config.js
    import { defineConfig } from 'vite'
    
    export default defineConfig({
      base: '/game-game-game/', // Ändra detta till ditt repo-namn
    })
    ```
6. Innan du pushar till GitHub, se till att bygga projektet lokalt för att verifiera att allt fungerar:
   ```bash
   npm run build
   ```
   Du bör se en `dist`-mapp skapas i ditt projekt.
7. Commit och pusha dina ändringar till GitHub.
8. Gå till fliken `Actions` i ditt GitHub-repo för att se byggprocessen. När den är klar, gå tillbaka till `Settings` > `Pages` för att se länken till din hostade sida.

Fira din seger över det digitala gudarna! Ditt spel är nu live på GitHub Pages.