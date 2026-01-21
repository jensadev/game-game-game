/**
 * EventBus - Simple event system for game communication
 * Lets parts of the game talk to each other without tight coupling
 * 
 * Usage:
 *   eventBus.on('coin:collect', (data) => { ... })
 *   eventBus.emit('coin:collect', { points: 10 })
 */
export default class EventBus {
    constructor() {
        // Store callbacks in a simple object
        // Each event name has an array of callback functions
        this.events = {}
    }

    /**
     * Listen for an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Function to call when event happens
     */
    on(eventName, callback) {
        // Create array for this event if it doesn't exist
        if (!this.events[eventName]) {
            this.events[eventName] = []
        }
        // Add callback to the list
        this.events[eventName].push(callback)
    }

    /**
     * Stop listening for an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - The callback to remove
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return

        // Find and remove the callback
        const index = this.events[eventName].indexOf(callback)
        if (index > -1) {
            this.events[eventName].splice(index, 1)
        }
    }

    /**
     * Trigger an event
     * @param {string} eventName - Name of the event
     * @param {*} data - Data to pass to listeners
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return

        // Call all callbacks for this event
        for (const callback of this.events[eventName]) {
            callback(data)
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} eventName - Name of the event (optional - clears all if not provided)
     */
    clear(eventName) {
        if (eventName) {
            delete this.events[eventName]
        } else {
            this.events = {}
        }
    }
}
