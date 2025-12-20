import Tower from '../Tower.js'
import { getTowerType, getAllTowerTypes } from '../TowerTypes.js'

/**
 * TowerManager - Manages tower selection, building, and UI
 * 
 * Responsibilities:
 * - Tower type selection
 * - Tower placement and validation
 * - Tower cost management
 * - DOM UI for tower selection
 * - Mouse input for tower building
 */
export default class TowerManager {
    constructor(game, grid) {
        this.game = game
        this.grid = grid
        
        // Tower state
        this.towers = []
        this.selectedTowerType = 'CANNON'
        
        // Setup DOM UI
        this.setupTowerSelectionUI()
        
        // Setup event listeners
        this.setupEventListeners()
    }
    
    setupEventListeners() {
        // Listen for mouse clicks to build towers
        // This will be called from the game's input handling
    }
    
    /**
     * Setup DOM UI for tower selection
     */
    setupTowerSelectionUI() {
        const towerList = document.getElementById('tower-list')
        const towerTemplate = document.getElementById('tower-template')
        
        if (!towerList || !towerTemplate) {
            console.warn('Tower UI elements not found')
            return
        }
        
        const towerTypes = getAllTowerTypes()
        
        // Loop through tower types and create list items from template
        towerTypes.forEach((towerType, index) => {
            const templateContent = towerTemplate.content.cloneNode(true)
            const li = templateContent.querySelector('.tower-option')
            
            // Set tower data
            li.dataset.tower = towerType.id
            li.dataset.key = index + 1
            
            // Set tower icon styling
            const icon = li.querySelector('.tower-icon')
            icon.style.backgroundColor = towerType.color
            icon.style.borderColor = towerType.barrelColor
            
            // Set tower info
            const name = li.querySelector('.tower-name')
            name.textContent = `[${index + 1}] ${towerType.name}`
            
            const cost = li.querySelector('.tower-cost')
            cost.textContent = `${towerType.cost}G`
            
            // Add click handler
            li.addEventListener('click', () => {
                this.selectTowerType(towerType.id)
                
                // Update selected state
                document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'))
                li.classList.add('selected')
            })
            
            // Append to list
            towerList.appendChild(templateContent)
        })
        
        // Set initial selection
        const firstOption = towerList.querySelector('.tower-option')
        if (firstOption) {
            firstOption.classList.add('selected')
        }
    }
    
    /**
     * Select tower type
     */
    selectTowerType(typeId) {
        const towerType = getTowerType(typeId)
        if (towerType) {
            this.selectedTowerType = typeId
            console.log(`Selected: ${towerType.name} (${towerType.cost}G)`)
            
            this.game.events.emit('towerSelected', {
                towerType: typeId,
                cost: towerType.cost
            })
        }
    }
    
    /**
     * Handle mouse click to build tower
     */
    handleMouseClick(mouseX, mouseY, gold) {
        // Convert to grid position
        const { row, col } = this.grid.getGridPosition(mouseX, mouseY)
        
        // Check if can build here
        if (!this.grid.canBuildAt(row, col)) {
            console.log('Cannot build here!')
            return false
        }
        
        // Get tower type config
        const towerType = getTowerType(this.selectedTowerType)
        
        // Check if can afford
        if (gold < towerType.cost) {
            console.log(`Not enough gold! Need ${towerType.cost}G`)
            return false
        }
        
        // Build tower
        const worldPos = this.grid.getWorldPosition(row, col)
        const tower = new Tower(this.game, worldPos.x, worldPos.y, towerType)
        
        // Place in grid
        if (this.grid.placeTower(row, col, tower)) {
            this.towers.push(tower)
            
            console.log(`Built ${towerType.name} for ${towerType.cost}G`)
            
            // Emit event with cost so game can deduct gold
            this.game.events.emit('towerBuilt', {
                tower,
                towerType: towerType.id,
                row,
                col,
                cost: towerType.cost
            })
            
            return true
        }
        
        return false
    }
    
    /**
     * Handle keyboard input for tower selection
     */
    handleKeyPress(key) {
        const keyMap = {
            '1': 'CANNON',
            '2': 'ICE',
            '3': 'SPLASH',
            '4': 'POISON'
        }
        
        if (keyMap[key]) {
            this.selectTowerType(keyMap[key])
            
            // Update DOM selection
            const towerOption = document.querySelector(`[data-tower="${keyMap[key]}"]`)
            if (towerOption) {
                document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'))
                towerOption.classList.add('selected')
            }
        }
    }
    
    /**
     * Update all towers
     */
    update(deltaTime) {
        this.towers.forEach(tower => {
            tower.update(deltaTime)
        })
    }
    
    /**
     * Draw all towers
     */
    draw(ctx, camera) {
        this.towers.forEach(tower => {
            tower.draw(ctx, camera)
        })
    }
    
    /**
     * Get selected tower type
     */
    getSelectedTowerType() {
        return getTowerType(this.selectedTowerType)
    }
    
    /**
     * Get all towers (for projectile access, etc.)
     */
    getTowers() {
        return this.towers
    }
    
    /**
     * Reset tower manager
     */
    reset() {
        this.towers = []
        this.selectedTowerType = 'CANNON'
    }
}
