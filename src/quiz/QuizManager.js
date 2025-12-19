/**
 * QuizManager - Hanterar quiz frågor och selection
 * 
 * Laddar frågor från JSON-fil och väljer random frågor baserat på difficulty.
 * Håller koll på vilka frågor som redan ställts för att undvika repetition.
 */
export default class QuizManager {
    /**
     * @param {Object} game - Game instance
     */
    constructor(game) {
        this.game = game
        this.questions = []
        this.questionsAsked = new Set()  // Track questions.id som redan ställts
    }
    
    /**
     * Ladda frågor från JSON fil
     * @param {string} jsonPath - Path till questions.json
     */
    async loadQuestions(jsonPath) {
        try {
            const response = await fetch(jsonPath)
            const data = await response.json()
            
            // Flatten alla categories till en array
            // JSON structure: { "category1": [...], "category2": [...] }
            Object.values(data).forEach(categoryQuestions => {
                this.questions.push(...categoryQuestions)
            })
            
            console.log(`Loaded ${this.questions.length} questions from ${jsonPath}`)
        } catch (error) {
            console.error('Failed to load questions:', error)
        }
    }
    
    /**
     * Hämta random frågor
     * @param {number} count - Antal frågor att hämta
     * @param {string|null} difficulty - Filter på difficulty ('easy', 'medium', 'hard') eller null för alla
     * @returns {Array} Array av question objects
     */
    getRandomQuestions(count, difficulty = null) {
        // Filtrera bort redan ställda frågor
        let available = this.questions.filter(q => !this.questionsAsked.has(q.id))
        
        // Filtrera på difficulty om specified
        if (difficulty) {
            available = available.filter(q => q.difficulty === difficulty)
        }
        
        // Om inte tillräckligt många frågor, reset questionsAsked
        if (available.length < count) {
            console.log('Not enough questions, resetting questionsAsked')
            this.questionsAsked.clear()
            available = this.questions
            
            // Filtrera på difficulty igen om specified
            if (difficulty) {
                available = available.filter(q => q.difficulty === difficulty)
            }
        }
        
        // Om fortfarande inte tillräckligt, ta alla vi har
        if (available.length < count) {
            console.warn(`Only ${available.length} questions available, requested ${count}`)
            count = available.length
        }
        
        // Shuffle och ta count antal
        const shuffled = available.sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, count)
        
        // Markera som asked
        selected.forEach(q => this.questionsAsked.add(q.id))
        
        return selected
    }
}
