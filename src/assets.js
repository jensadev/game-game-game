/**
 * Asset Manifest - Alla sprites för Tower Defense
 * 
 * Vite importerar sprites som URL strings som sedan används av SpriteManager.
 * Alla assets preloadas innan spelet startar för att undvika loading under gameplay.
 */

// Tower Buildings - Different colors for different tower types
import towerBlack from './assets/Tiny Swords/Buildings/Black Buildings/Tower.png'
import towerBlue from './assets/Tiny Swords/Buildings/Blue Buildings/Tower.png'
import towerPurple from './assets/Tiny Swords/Buildings/Purple Buildings/Tower.png'
import towerRed from './assets/Tiny Swords/Buildings/Red Buildings/Tower.png'

// Castle - Home base that enemies attack
import castle from './assets/Tiny Swords/Buildings/Red Buildings/Castle.png'

// Decorations - Clouds for atmosphere
import cloud1 from './assets/Tiny Swords/Terrain/Decorations/Clouds/Clouds_01.png'
import cloud2 from './assets/Tiny Swords/Terrain/Decorations/Clouds/Clouds_02.png'
import cloud3 from './assets/Tiny Swords/Terrain/Decorations/Clouds/Clouds_03.png'
import cloud4 from './assets/Tiny Swords/Terrain/Decorations/Clouds/Clouds_04.png'

// Trees for random decorations - 1536x256 (8 frames @ 192x256)
import tree1 from './assets/Tiny Swords/Terrain/Resources/Wood/Trees/Tree1.png'
import tree2 from './assets/Tiny Swords/Terrain/Resources/Wood/Trees/Tree2.png'

// Static decorations (rocks, bushes) - 64x64
import rock1 from './assets/Tiny Swords/Terrain/Decorations/Rocks/Rock1.png'
import rock2 from './assets/Tiny Swords/Terrain/Decorations/Rocks/Rock2.png'
import rock3 from './assets/Tiny Swords/Terrain/Decorations/Rocks/Rock3.png'
import rock4 from './assets/Tiny Swords/Terrain/Decorations/Rocks/Rock4.png'
import bush1 from './assets/Tiny Swords/Terrain/Decorations/Bushes/Bushe1.png'
import bush2 from './assets/Tiny Swords/Terrain/Decorations/Bushes/Bushe2.png'
import bush3 from './assets/Tiny Swords/Terrain/Decorations/Bushes/Bushe3.png'

// Ground tiles
import groundFlat from './assets/Tiny Swords/Terrain/Ground/Tilemap_Flat.png'

// Enemies - Goblins
import goblinPurple from './assets/Tiny Swords/Factions/Goblins/Troops/Torch/Purple/Torch_Purple.png'

// Export organized by category
export const towers = {
    black: towerBlack,   // Default tower
    blue: towerBlue,     // Ice tower
    purple: towerPurple, // Poison tower
    red: towerRed        // Splash tower
}

export const structures = {
    castle
}

export const decorations = {
    clouds: [cloud1, cloud2, cloud3, cloud4],
    trees: [tree1, tree2],
    rocks: [rock1, rock2, rock3, rock4],
    bushes: [bush1, bush2, bush3]
}

export const ground = {
    flat: groundFlat
}

export const enemies = {
    goblinPurple
}

// Array för preloading - alla assets som ska laddas innan spelet startar
export const PRELOAD_ASSETS = [
    // Towers
    ...Object.values(towers),
    // Structures
    ...Object.values(structures),
    // Decorations
    ...decorations.clouds,
    ...decorations.trees,
    ...decorations.rocks,
    ...decorations.bushes,
    // Ground
    ...Object.values(ground),
    // Enemies
    ...Object.values(enemies)
]