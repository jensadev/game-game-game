export default class InputHandler {
    constructor(game) {
        this.game = game
        this.keys = new Set()
        this.debugMode = false // Debug-läge för att visa hitboxes och grid
        
        // Musinput
        this.mouseX = 0
        this.mouseY = 0
        this.mouseButtons = new Set() // 0 = vänster, 1 = mitten, 2 = höger
        
        // Tangentbord
        window.addEventListener('keydown', (event) => {
            console.log(event.key)
            this.keys.add(event.key)
            
            // Toggla debug-läge med 'p'
            if (event.key === 'p') {
                this.debugMode = !this.debugMode
                console.log('Debug mode:', this.debugMode)
            }
        })
        window.addEventListener('keyup', (event) => {
            this.keys.delete(event.key)
        })
        
        // Mus - lyssna på window för att få musposition även utanför canvas
        const canvas = game.canvas
        
        window.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect()
            this.mouseX = event.clientX - rect.left
            this.mouseY = event.clientY - rect.top
        })
        
        canvas.addEventListener('mousedown', (event) => {
            this.mouseButtons.add(event.button)
            console.log('Mouse button pressed:', event.button)
        })
        
        window.addEventListener('mouseup', (event) => {
            this.mouseButtons.delete(event.button)
        })
        
        // Förhindra context menu på högerklick
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault()
        })
    }
}