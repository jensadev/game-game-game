/**
 * EventEmitter - Observer Pattern Implementation
 * 
 * Allows objects to communicate without tight coupling.
 * Objects can emit events and listen to events from other objects.
 * 
 * Usage:
 *   const emitter = new EventEmitter()
 *   emitter.on('eventName', callback)
 *   emitter.emit('eventName', data)
 *   emitter.off('eventName', callback)
 */
export default class EventEmitter {
    constructor() {
        // Map av event namn -> array av callbacks
        this.events = new Map()
    }
    
    /**
     * Registrera en event listener
     * @param {string} eventName - Namnet på eventet
     * @param {Function} callback - Funktionen som ska anropas
     * @param {Object} context - Optional: kontext för callback (this-värde)
     */
    on(eventName, callback, context = null) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, [])
        }
        
        this.events.get(eventName).push({ callback, context })
    }
    
    /**
     * Registrera en event listener som bara körs en gång
     * @param {string} eventName - Namnet på eventet
     * @param {Function} callback - Funktionen som ska anropas
     * @param {Object} context - Optional: kontext för callback
     */
    once(eventName, callback, context = null) {
        const onceWrapper = (data) => {
            callback.call(context, data)
            this.off(eventName, onceWrapper)
        }
        this.on(eventName, onceWrapper)
    }
    
    /**
     * Ta bort en event listener
     * @param {string} eventName - Namnet på eventet
     * @param {Function} callback - Funktionen som ska tas bort
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return
        
        const listeners = this.events.get(eventName)
        const index = listeners.findIndex(listener => listener.callback === callback)
        
        if (index !== -1) {
            listeners.splice(index, 1)
        }
        
        // Ta bort event helt om inga listeners finns kvar
        if (listeners.length === 0) {
            this.events.delete(eventName)
        }
    }
    
    /**
     * Ta bort alla listeners för ett event (eller alla events)
     * @param {string} eventName - Optional: namnet på eventet
     */
    clear(eventName = null) {
        if (eventName) {
            this.events.delete(eventName)
        } else {
            this.events.clear()
        }
    }
    
    /**
     * Emit (skicka) ett event
     * @param {string} eventName - Namnet på eventet
     * @param {*} data - Data som ska skickas med eventet
     */
    emit(eventName, data = null) {
        if (!this.events.has(eventName)) return
        
        const listeners = this.events.get(eventName)
        
        // Skapa en kopia av listeners array för att undvika problem
        // om en listener tar bort sig själv under execution
        const listenersCopy = [...listeners]
        
        for (const { callback, context } of listenersCopy) {
            try {
                callback.call(context, data)
            } catch (error) {
                console.error(`Error in event listener for '${eventName}':`, error)
            }
        }
    }
    
    /**
     * Kolla om ett event har några listeners
     * @param {string} eventName - Namnet på eventet
     * @returns {boolean}
     */
    hasListeners(eventName) {
        return this.events.has(eventName) && this.events.get(eventName).length > 0
    }
    
    /**
     * Få antal listeners för ett event
     * @param {string} eventName - Namnet på eventet
     * @returns {number}
     */
    listenerCount(eventName) {
        return this.events.has(eventName) ? this.events.get(eventName).length : 0
    }
    
    /**
     * Få alla event namn som har listeners
     * @returns {string[]}
     */
    eventNames() {
        return Array.from(this.events.keys())
    }
}
