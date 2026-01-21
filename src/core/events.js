import EventBus from './EventBus.js'

/**
 * Global event bus instance for game-wide events
 * 
 * Usage:
 * import { gameEvents } from './core/events.js'
 * 
 * // Listen for events
 * gameEvents.on('player:jump', (data) => {
 *     console.log('Player jumped!')
 * })
 * 
 * // Emit events
 * gameEvents.emit('player:jump', { height: 100 })
 */
export const gameEvents = new EventBus()

/**
 * Common game event names for reference
 * Use these as strings when emitting/listening to events
 */
export const EVENT_NAMES = {
    // Player events
    PLAYER_JUMP: 'player:jump',
    PLAYER_LAND: 'player:land',
    PLAYER_HIT: 'player:hit',
    PLAYER_DEATH: 'player:death',
    
    // Enemy events
    ENEMY_HIT: 'enemy:hit',
    ENEMY_DEATH: 'enemy:death',
    
    // Collectible events
    COIN_COLLECTED: 'coin:collected',
    
    // Level events
    LEVEL_COMPLETE: 'level:complete',
    LEVEL_START: 'level:start',
    
    // Game events
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_OVER: 'game:over'
}
