/**
 * SpriteManager - Singleton för att hantera delad sprite loading
 * 
 * Förhindrar att samma sprite laddas flera gånger genom att cacha Image objekt.
 * Ger också möjlighet att preloada alla assets innan spelet startar.
 */
class SpriteManager {
    constructor() {
        // Cache för att spara laddade images
        this.cache = new Map() // path -> Image object
        this.loadingPromises = new Map() // path -> Promise (för att undvika duplicerade loads)
    }

    /**
     * Hämta en image från cache eller ladda ny
     * @param {string} path - Sökväg till image
     * @returns {Image} - Cached eller ny Image
     */
    getImage(path) {
        // Returnera från cache om den finns
        if (this.cache.has(path)) {
            return this.cache.get(path)
        }

        // Skapa ny image och lägg i cache
        const img = new Image()
        img.src = path
        this.cache.set(path, img)

        return img
    }

    /**
     * Preload en array av asset paths
     * @param {string[]} assetPaths - Array med image paths att ladda
     * @returns {Promise<void>} - Promise som resolvas när alla är laddade
     */
    async preloadAssets(assetPaths) {
        const loadPromises = assetPaths.map(path => this.loadImage(path))
        
        try {
            await Promise.all(loadPromises)
            console.log(`✓ Loaded ${assetPaths.length} assets successfully`)
        } catch (error) {
            console.error('Failed to load some assets:', error)
            throw error
        }
    }

    /**
     * Ladda en enskild image och returnera Promise
     * @param {string} path - Sökväg till image
     * @returns {Promise<Image>} - Promise som resolvas när image är laddad
     */
    loadImage(path) {
        // Om vi redan laddar denna image, returnera existerande Promise
        if (this.loadingPromises.has(path)) {
            return this.loadingPromises.get(path)
        }

        // Skapa ny loading Promise
        const promise = new Promise((resolve, reject) => {
            const img = this.getImage(path)

            // Om image redan är laddad (från cache), resolve direkt
            if (img.complete && img.naturalWidth > 0) {
                resolve(img)
                return
            }

            // Annars vänta på load
            img.onload = () => {
                this.loadingPromises.delete(path)
                resolve(img)
            }

            img.onerror = (error) => {
                this.loadingPromises.delete(path)
                console.error(`Failed to load image: ${path}`, error)
                reject(new Error(`Failed to load image: ${path}`))
            }
        })

        this.loadingPromises.set(path, promise)
        return promise
    }

    /**
     * Preload med progress tracking
     * @param {string[]} assetPaths - Array med image paths att ladda
     * @param {Function} onProgress - Callback (loaded, total) för progress
     * @returns {Promise<void>}
     */
    async preloadAssetsWithProgress(assetPaths, onProgress) {
        let loaded = 0
        const total = assetPaths.length

        const loadPromises = assetPaths.map(async path => {
            await this.loadImage(path)
            loaded++
            if (onProgress) {
                onProgress(loaded, total)
            }
        })

        await Promise.all(loadPromises)
    }

    /**
     * Rensa cache (för testing eller memory management)
     */
    clearCache() {
        this.cache.clear()
        this.loadingPromises.clear()
    }
}

// Singleton instance
export default new SpriteManager()