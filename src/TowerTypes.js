import ShootingComponent from './components/ShootingComponent.js'
import SlowComponent from './components/SlowComponent.js'
import SplashComponent from './components/SplashComponent.js'
import PoisonComponent from './components/PoisonComponent.js'

/**
 * TowerTypes - Konfiguration för olika tower types
 * 
 * Varje tower type definierar:
 * - Cost (guld kostnad)
 * - Components (vilka components som ska användas)
 * - Visual (färger, storlek)
 * - Stats (range, damage, etc)
 */

export const TOWER_TYPES = {
    CANNON: {
        id: 'cannon',
        name: 'Cannon Tower',
        description: 'Basic shooting tower',
        cost: 100,
        color: 'gray',
        barrelColor: 'darkblue',
        components: [
            {
                type: ShootingComponent,
                config: {
                    damage: 50,
                    fireRate: 1000,
                    range: 200,
                    projectileSpeed: 0.6,
                    projectileColor: 'yellow'
                }
            }
        ]
    },
    
    ICE: {
        id: 'ice',
        name: 'Ice Tower',
        description: 'Slows enemies + shoots',
        cost: 150,
        color: 'lightblue',
        barrelColor: 'blue',
        components: [
            {
                type: ShootingComponent,
                config: {
                    damage: 30,
                    fireRate: 1200,
                    range: 180,
                    projectileSpeed: 0.5,
                    projectileColor: 'cyan'
                }
            },
            {
                type: SlowComponent,
                config: {
                    range: 150,
                    slowAmount: 0.5,  // 50% slower
                    duration: 3000,   // 3 seconds
                    tickRate: 500
                }
            }
        ]
    },
    
    SPLASH: {
        id: 'splash',
        name: 'Splash Tower',
        description: 'Area damage on hit',
        cost: 200,
        color: 'orange',
        barrelColor: 'darkorange',
        components: [
            {
                type: ShootingComponent,
                config: {
                    damage: 40,
                    fireRate: 1500,
                    range: 220,
                    projectileSpeed: 0.4,
                    projectileColor: 'orange'
                }
            },
            {
                type: SplashComponent,
                config: {
                    splashRadius: 80,
                    splashDamagePercent: 0.5  // 50% splash damage
                }
            }
        ]
    },
    
    POISON: {
        id: 'poison',
        name: 'Poison Tower',
        description: 'Damage over time',
        cost: 175,
        color: 'green',
        barrelColor: 'darkgreen',
        components: [
            {
                type: ShootingComponent,
                config: {
                    damage: 20,
                    fireRate: 1000,
                    range: 200,
                    projectileSpeed: 0.5,
                    projectileColor: 'lime'
                }
            },
            {
                type: PoisonComponent,
                config: {
                    poisonDuration: 5000,  // 5 seconds
                    poisonDamage: 10,      // Per tick
                    tickRate: 500,         // Every 500ms
                    range: 200
                }
            }
        ]
    }
}

/**
 * Hämta tower type config
 */
export function getTowerType(id) {
    return TOWER_TYPES[id.toUpperCase()]
}

/**
 * Hämta alla tower types som array
 */
export function getAllTowerTypes() {
    return Object.values(TOWER_TYPES)
}
