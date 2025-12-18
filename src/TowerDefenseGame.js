import GameBase from './GameBase.js'
import Grid from './Grid.js'
import Tower from './Tower.js'
import Camera from './Camera.js'
import Vector2 from './Vector2.js'

/**
 * TowerDefenseGame - Tower Defense spel
 * 
 * Branch 23: Basic implementation
 * - Grid system för att placera torn
 * - Mouse input för att bygga
 * - Path following för enemies
 * - Basic shooting
 */
export default class TowerDefenseGame extends GameBase {
    constructor(canvas) {
        super(canvas)

        // Grid setup (10 rader, 15 kolumner, 64px per tile)
        this.grid = new Grid(10, 15, 64)
        
        // Camera (fixed för tower defense, ingen scrolling)
        this.camera = new Camera(this, 0, 0)
        
        // Game objects
        this.towers = []
        this.enemies = []
        this.projectiles = []
        
        // Game state
        this.gold = 500          // Startpengar
        this.lives = 20          // Liv
        this.wave = 0            // Nuvarande våg
        this.score = 0
        
        // Tower cost
        this.towerCost = 100
        
        // Temporär: Definiera path (kommer från level data senare)
        this.setupPath()
        
        // Setup event listeners
        this.setupEventListeners()
    }
    
    /**
     * Setup path för enemies
     * Senare kommer detta från level-data
     */
    setupPath() {
        // Definiera path som grid coordinates
        const pathCoords = [
            { row: 5, col: 0 },   // Start vänster
            { row: 5, col: 3 },
            { row: 2, col: 3 },   // Upp
            { row: 2, col: 7 },   // Höger
            { row: 7, col: 7 },   // Ner
            { row: 7, col: 11 },  // Höger
            { row: 4, col: 11 },  // Upp
            { row: 4, col: 14 }   // Slut höger
        ]
        
        // Markera path i grid
        this.grid.setPath(pathCoords)
        
        // Konvertera till world positions för enemies
        this.enemyPath = this.grid.pathToWorld(pathCoords)
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Lyssna på tower events
        this.events.on('towerShoot', (data) => {
            console.log('Tower shot at enemy')
        })
        
        this.events.on('towerBuilt', (data) => {
            console.log(`Tower built at row ${data.row}, col ${data.col}`)
        })
    }
    
    /**
     * Reset spelet
     */
    reset() {
        this.towers = []
        this.enemies = []
        this.projectiles = []
        this.gold = 500
        this.lives = 20
        this.wave = 0
        this.score = 0
    }
    
    /**
     * Hantera mouse click för att bygga torn
     */
    handleMouseClick() {
        const mouseX = this.inputHandler.mouseX
        const mouseY = this.inputHandler.mouseY
        
        // Konvertera till grid position
        const { row, col } = this.grid.getGridPosition(mouseX, mouseY)
        
        // Kolla om kan bygga här
        if (!this.grid.canBuildAt(row, col)) {
            console.log('Cannot build here!')
            return
        }
        
        // Kolla om har råd
        if (this.gold < this.towerCost) {
            console.log('Not enough gold!')
            return
        }
        
        // Bygg torn
        const worldPos = this.grid.getWorldPosition(row, col)
        const tower = new Tower(this, worldPos.x, worldPos.y)
        
        // Placera i grid
        if (this.grid.placeTower(row, col, tower)) {
            this.towers.push(tower)
            this.gold -= this.towerCost
            
            // Emit event
            this.events.emit('towerBuilt', {
                tower,
                row,
                col,
                cost: this.towerCost
            })
        }
    }
    
    /**
     * Skapa projectile (kallas från Tower)
     * @param {Vector2} position - Start position
     * @param {Vector2} direction - Normalized direction
     * @param {number} damage - Skada
     * @param {Tower} tower - Tornet som sköt
     * @returns {Object} Projectile object
     */
    createProjectile(position, direction, damage, tower) {
        return {
            position: position.clone(),
            velocity: direction.scale(0.6),  // Speed
            damage,
            tower,
            width: 8,
            height: 8,
            distanceTraveled: 0,
            maxDistance: tower.range * 1.5,  // Lite längre än range
            markedForDeletion: false
        }
    }
    
    /**
     * Update game
     * @param {number} deltaTime - Tid sedan förra frame
     */
    update(deltaTime) {
        // Hantera mouse click
        if (this.inputHandler.mouseButtons.has(0)) {
            this.handleMouseClick()
            // Rensa så vi inte bygger varje frame
            this.inputHandler.mouseButtons.delete(0)
        }
        
        // Uppdatera towers
        for (const tower of this.towers) {
            tower.update(deltaTime)
        }
        
        // Uppdatera enemies (kommer i nästa steg)
        for (const enemy of this.enemies) {
            if (enemy.update) {
                enemy.update(deltaTime)
            }
        }
        
        // Uppdatera projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i]
            
            // Flytta projectile
            proj.position.addScaled(proj.velocity, deltaTime)
            proj.distanceTraveled += proj.velocity.magnitude() * deltaTime
            
            // Max distance?
            if (proj.distanceTraveled > proj.maxDistance) {
                proj.markedForDeletion = true
            }
            
            // Kollision med enemies
            if (!proj.markedForDeletion) {
                for (const enemy of this.enemies) {
                    if (enemy.markedForDeletion || enemy.health <= 0) {
                        continue
                    }
                    
                    // Simple AABB collision
                    const projRect = {
                        x: proj.position.x,
                        y: proj.position.y,
                        width: proj.width,
                        height: proj.height
                    }
                    
                    const enemyRect = {
                        x: enemy.position.x,
                        y: enemy.position.y,
                        width: enemy.width,
                        height: enemy.height
                    }
                    
                    if (this.checkCollision(projRect, enemyRect)) {
                        // Skada enemy
                        if (enemy.takeDamage) {
                            const killed = enemy.takeDamage(proj.damage)
                            
                            // Om enemy dog, ge gold och score
                            if (killed) {
                                this.gold += enemy.goldValue || 25
                                this.score += enemy.scoreValue || 10
                                
                                // Register kill på tower
                                if (proj.tower) {
                                    proj.tower.registerKill()
                                }
                                
                                this.events.emit('enemyKilled', {
                                    enemy,
                                    tower: proj.tower,
                                    position: enemy.position.clone()
                                })
                            }
                            
                            // Register damage på tower
                            if (proj.tower) {
                                proj.tower.registerDamage(proj.damage)
                            }
                        }
                        
                        proj.markedForDeletion = true
                        
                        this.events.emit('projectileHit', {
                            projectile: proj,
                            enemy,
                            damage: proj.damage
                        })
                        
                        break
                    }
                }
            }
            
            // Ta bort om markerad
            if (proj.markedForDeletion) {
                this.projectiles.splice(i, 1)
            }
        }
        
        // Rensa döda enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].markedForDeletion) {
                this.enemies.splice(i, 1)
            }
        }
    }
    
    /**
     * Simple AABB collision check
     */
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y
    }
    
    /**
     * Draw game
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Rensa canvas
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        
        // Rita grid (alltid synlig i tower defense)
        this.grid.draw(ctx, this.camera, true)
        
        // Rita hover highlight vid mouse
        if (this.gold >= this.towerCost) {
            this.grid.drawHover(
                ctx,
                this.inputHandler.mouseX,
                this.inputHandler.mouseY,
                this.camera,
                this.gold >= this.towerCost
            )
        }
        
        // Rita towers
        for (const tower of this.towers) {
            tower.draw(ctx, this.camera)
        }
        
        // Rita enemies
        for (const enemy of this.enemies) {
            if (enemy.draw) {
                enemy.draw(ctx, this.camera)
            }
        }
        
        // Rita projectiles
        const offsetX = this.camera ? this.camera.position.x : 0
        const offsetY = this.camera ? this.camera.position.y : 0
        
        ctx.fillStyle = 'yellow'
        for (const proj of this.projectiles) {
            ctx.beginPath()
            ctx.arc(
                proj.position.x - offsetX,
                proj.position.y - offsetY,
                4,
                0,
                Math.PI * 2
            )
            ctx.fill()
        }
        
        // Rita UI
        this.drawUI(ctx)
    }
    
    /**
     * Rita UI med gold, lives, etc
     */
    drawUI(ctx) {
        ctx.fillStyle = 'white'
        ctx.font = '20px Arial'
        
        // Gold
        ctx.fillText(`Gold: ${this.gold}`, 10, 30)
        
        // Lives
        ctx.fillText(`Lives: ${this.lives}`, 10, 60)
        
        // Score
        ctx.fillText(`Score: ${this.score}`, 10, 90)
        
        // Wave
        ctx.fillText(`Wave: ${this.wave}`, 10, 120)
        
        // Tower cost
        ctx.fillText(`Tower: ${this.towerCost}G`, 10, 150)
        
        // Instructions
        ctx.font = '14px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.fillText('Click to build tower', 10, this.canvas.height - 40)
        ctx.fillText('Press P for debug mode', 10, this.canvas.height - 20)
    }
}
