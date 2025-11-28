export default class ImageManager {
    constructor() {
        this.images = {}
        this.loadedCount = 0
        this.totalCount = 0
    }
    
    loadImage(name, path) {
        this.totalCount++
        
        return new Promise((resolve, reject) => {
            const img = new Image()
            
            img.onload = () => {
                this.images[name] = img
                this.loadedCount++
                console.log(`Loaded image: ${name}`)
                resolve(img)
            }
            
            img.onerror = () => {
                console.error(`Failed to load image: ${path}`)
                reject(new Error(`Failed to load ${path}`))
            }
            
            img.src = path
        })
    }
    
    loadImages(imageData) {
        const promises = imageData.map(data => 
            this.loadImage(data.name, data.path)
        )
        return Promise.all(promises)
    }
    
    getImage(name) {
        return this.images[name]
    }
    
    isLoaded() {
        return this.loadedCount === this.totalCount
    }
    
    getProgress() {
        if (this.totalCount === 0) return 100
        return (this.loadedCount / this.totalCount) * 100
    }
}
