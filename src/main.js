import './style.css'
import TowerDefenseGame from './TowerDefenseGame.js'

const setupGame = (canvas) => {
    // Set canvas size for tower defense (960x640 for 15x10 grid with 64px tiles)
    canvas.width = 960
    canvas.height = 640
    
    // Get context for drawing
    const ctx = canvas.getContext('2d')

    // Create tower defense game
    const game = new TowerDefenseGame(canvas)
    let lastTime = 0
    let gameLoop

    const runGame = (timeStamp) => {
        // Prevent large deltaTime values (first frame, tab-switch, etc.)
        if (lastTime === 0) {
            lastTime = timeStamp
        }
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        
        // Cap deltaTime (max 100ms)
        const cappedDeltaTime = Math.min(deltaTime, 100)
        
        // Update and draw
        game.update(cappedDeltaTime)
        game.draw(ctx)
        
        // Run next frame
        gameLoop = requestAnimationFrame(runGame)
    }
    
    // Start game loop
    gameLoop = requestAnimationFrame(runGame)
}

// Start the game
setupGame(document.querySelector('#game'))