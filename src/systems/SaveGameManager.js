/**
 * SaveGameManager - Handles saving and loading game data
 * Uses localStorage to persist game data between sessions
 * Supports multiple save slots
 */
export default class SaveGameManager {
    /**
     * Creates a new SaveGameManager
     * @param {string} prefix - Prefix for localStorage keys
     */
    constructor(prefix = 'game-save') {
        this.prefix = prefix
    }

    /**
     * Save game data to localStorage
     * @param {string} key - Storage key (e.g., 'slot_0')
     * @param {Object} data - Object with data to save
     * @returns {boolean} True if save succeeded, false otherwise
     */
    save(key, data) {
        try {
            const storageKey = `${this.prefix}_${key}`
            const jsonString = JSON.stringify(data)
            localStorage.setItem(storageKey, jsonString)
            console.log(`Game saved to ${key}`)
            return true
        } catch (error) {
            console.error('Failed to save game:', error)
            return false
        }
    }

    /**
     * Load saved game data from localStorage
     * @param {string} key - Storage key (e.g., 'slot_0')
     * @returns {Object|null} Saved data or null if no data found
     */
    load(key) {
        try {
            const storageKey = `${this.prefix}_${key}`
            const jsonString = localStorage.getItem(storageKey)
            
            if (!jsonString) {
                return null
            }
            
            const data = JSON.parse(jsonString)
            console.log(`Game loaded from ${key}`)
            return data
        } catch (error) {
            console.error('Failed to load game:', error)
            return null
        }
    }

    /**
     * Check if a save exists in a slot
     * @param {string} key - Storage key (e.g., 'slot_0')
     * @returns {boolean} True if save data exists
     */
    hasSave(key = 'slot_0') {
        const storageKey = `${this.prefix}_${key}`
        return localStorage.getItem(storageKey) !== null
    }

    /**
     * Delete save data from a slot
     * @param {string} key - Storage key (e.g., 'slot_0')
     */
    delete(key) {
        try {
            const storageKey = `${this.prefix}_${key}`
            localStorage.removeItem(storageKey)
            console.log(`Save deleted from ${key}`)
        } catch (error) {
            console.error('Failed to delete save:', error)
        }
    }

    /**
     * Get info about a save (for UI display)
     * @param {string} key - Storage key (e.g., 'slot_0')
     * @returns {Object|null} Info object or null if no data found
     */
    getSaveInfo(key = 'slot_0') {
        const save = this.load(key)
        if (!save) return null
        
        return {
            timestamp: new Date(save.timestamp).toLocaleString('sv-SE'),
            level: save.level + 1, // +1 since levels are 0-indexed
            score: save.score,
            coinsCollected: save.coinsCollected
        }
    }

    /**
     * Clear ALL save data (all slots)
     */
    clearAll() {
        try {
            // Remove all keys with our prefix
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key)
                }
            })
            console.log('All save data cleared')
        } catch (error) {
            console.error('Failed to clear all saves:', error)
        }
    }

    /**
     * Debug method to see what's saved
     */
    debugPrint() {
        console.log('=== SAVE DATA ===')
        ;[0, 1, 2].forEach(slot => {
            const data = this.load(`slot_${slot}`)
            if (data) {
                console.log(`Slot ${slot}:`, data)
            } else {
                console.log(`Slot ${slot}: Empty`)
            }
        })
        console.log('=================')
    }
}
