# Sprites Directory

This directory should contain the game's sprite images.

## Required Sprites

Create these sprite files (PNG format recommended):

1. **player.png** - 50x50 pixels
   - Player character sprite
   - Should face right by default (will be flipped for left movement)

2. **enemy.png** - 40x40 pixels
   - Enemy character sprite

3. **coin.png** - 20x20 pixels
   - Collectible coin sprite

4. **projectile.png** - 12x6 pixels
   - Player projectile sprite
   - Should point right by default (will be flipped for left direction)

5. **platform.png** - Any size (will be stretched)
   - Ground/platform tile
   - Can be 32x32 for a basic tile that repeats

## Quick Placeholder Creation

You can create simple colored squares as placeholders using any image editor or online tools like:
- https://placeholder.com/
- https://dummyimage.com/
- GIMP, Photoshop, Aseprite, etc.

### Example URLs for quick placeholders:
- `https://via.placeholder.com/50x50/4CAF50/FFFFFF?text=P` (player - green)
- `https://via.placeholder.com/40x40/F44336/FFFFFF?text=E` (enemy - red)
- `https://via.placeholder.com/20x20/FFC107/FFFFFF?text=C` (coin - yellow)
- `https://via.placeholder.com/12x6/2196F3/FFFFFF?text=B` (projectile - blue)
- `https://via.placeholder.com/32x32/795548/FFFFFF?text=T` (platform - brown)

### Using ImageMagick (if installed):
```bash
# Create simple colored squares
convert -size 50x50 xc:#4CAF50 player.png
convert -size 40x40 xc:#F44336 enemy.png
convert -size 20x20 xc:#FFC107 coin.png
convert -size 12x6 xc:#2196F3 projectile.png
convert -size 32x32 xc:#795548 platform.png
```

## Note

The sprite system will fall back to colored rectangles if images fail to load, so the game will still be playable without sprites.
