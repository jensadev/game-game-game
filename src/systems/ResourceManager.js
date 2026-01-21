/**
 * ResourceManager - Simple asset storage for Vite-imported resources
 * 
 * Vite handles the actual loading - we just organize the imported assets
 * This way users import their assets at the top of files like normal:
 *   import playerSprite from './assets/player.png'
 * Then store them here for easy access:
 *   resources.add('player', playerSprite)
 * 
 * Benefits:
 * - No complex promise/async code for beginners
 * - Vite handles optimization and bundling
 * - Type-safe imports with IDE support
 * - Fast HMR during development
 */
export default class ResourceManager {
    constructor() {
        // Simple object to store resources by key
        this.resources = {}
    }

    /**
     * Store a resource
     * @param {string} key - Unique identifier
     * @param {*} resource - The imported asset (image, audio, etc.)
     */
    add(key, resource) {
        this.resources[key] = resource
    }

    /**
     * Get a resource
     * @param {string} key - Resource identifier
     * @returns {*} The resource, or null if not found
     */
    get(key) {
        if (!this.resources[key]) {
            console.warn(`Resource "${key}" not found`)
            return null
        }
        return this.resources[key]
    }

    /**
     * Check if a resource exists
     * @param {string} key - Resource identifier
     * @returns {boolean} True if resource exists
     */
    has(key) {
        return key in this.resources
    }

    /**
     * Remove a resource
     * @param {string} key - Resource identifier
     */
    remove(key) {
        delete this.resources[key]
    }

    /**
     * Clear all resources
     */
    clear() {
        this.resources = {}
    }

    /**
     * Get all resource keys
     * @returns {string[]} Array of keys
     */
    keys() {
        return Object.keys(this.resources)
    }
}

/**
 * Example usage:
 * 
 * // At top of file - Vite imports
 * import playerIdle from './assets/player-idle.png'
 * import playerRun from './assets/player-run.png'
 * import coinSound from './assets/coin.mp3'
 * 
 * // In game setup
 * const resources = new ResourceManager()
 * resources.add('player_idle', playerIdle)
 * resources.add('player_run', playerRun)
 * resources.add('coin_sound', coinSound)
 * 
 * // Later in game
 * const sprite = resources.get('player_idle')
 * ctx.drawImage(sprite, x, y)
 */
