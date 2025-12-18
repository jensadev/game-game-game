import './style.css'
import TowerDefenseGame from './TowerDefenseGame.js'

const setupGame = (canvas) => {
    // Sätt storlek på canvas för tower defense (960x640 för 15x10 grid med 64px tiles)
    canvas.width = 960
    canvas.height = 640
    // ctx är "ritkontexten", används för att rita på canvas
    const ctx = canvas.getContext('2d')

    // Skapa tower defense-spelet
    const game = new TowerDefenseGame(canvas)
    let lastTime = 0
    // Game loop variabel så att vi kan stoppa den senare om vi vill
    let gameLoop

    const runGame = (timeStamp) => {
        // Förhindra för stora deltaTime värden (första frame, tab-switch, etc)
        if (lastTime === 0) {
            lastTime = timeStamp
        }
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        
        // Säkerhets-cap för deltaTime (max 100ms)
        const cappedDeltaTime = Math.min(deltaTime, 100)
        
        // Rensa canvas (görs i game.draw() för tower defense)
        // ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Uppdatera och rita
        game.update(cappedDeltaTime)
        game.draw(ctx)
        
        // Kör nästa frame
        gameLoop = requestAnimationFrame(runGame)
    }
    
    // Starta game loop
    gameLoop = requestAnimationFrame(runGame)
}

// Kör igång spelet
setupGame(document.querySelector('#game'))