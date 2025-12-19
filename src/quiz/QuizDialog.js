/**
 * QuizDialog - Modal dialog för att visa quiz-frågor
 * 
 * Visar quiz-frågor med multipla alternativ mellan tower defense waves.
 * Ger spelaren gold för rätt svar som kan användas för att köpa torn.
 */
export default class QuizDialog {
    /**
     * @param {Object} game - Game instance
     * @param {Array} questions - Array av question objects från JSON
     * @param {Function} onComplete - Callback när quiz är färdigt (får totalGold som parameter)
     */
    constructor(game, questions, onComplete) {
        this.game = game
        this.questions = questions
        this.currentQuestionIndex = 0
        this.onComplete = onComplete
        
        // State
        this.selectedAnswer = 0
        this.hasAnswered = false
        this.isCorrect = false
        this.totalGold = 0
        
        // Visual styling
        this.backgroundColor = 'rgba(0, 0, 0, 0.9)'
        this.correctColor = '#4CAF50'
        this.incorrectColor = '#F44336'
        this.neutralColor = '#FFFFFF'
        this.selectedColor = '#FFD700'
        
        // Input tracking (för att förhindra key repeat)
        this.lastKeys = new Set()
    }
    
    /**
     * Hämta current question
     */
    get currentQuestion() {
        return this.questions[this.currentQuestionIndex]
    }
    
    /**
     * Update quiz state och input handling
     * @param {number} deltaTime - Tid sedan förra frame
     */
    update(deltaTime) {
        const keys = this.game.inputHandler.keys
        
        // Om vi har svarat, vänta på Enter för nästa fråga
        if (this.hasAnswered) {
            if (keys.has('Enter') && !this.lastKeys.has('Enter')) {
                this.nextQuestion()
            }
            this.lastKeys = new Set(keys)
            return
        }
        
        // Navigation med arrow keys
        if (keys.has('ArrowDown') && !this.lastKeys.has('ArrowDown')) {
            this.selectedAnswer = (this.selectedAnswer + 1) % this.currentQuestion.options.length
        }
        if (keys.has('ArrowUp') && !this.lastKeys.has('ArrowUp')) {
            this.selectedAnswer = (this.selectedAnswer - 1 + this.currentQuestion.options.length) % this.currentQuestion.options.length
        }
        
        // Submit svar med Enter
        if (keys.has('Enter') && !this.lastKeys.has('Enter')) {
            this.submitAnswer(this.selectedAnswer)
        }
        
        // Quick-select med A-D keys
        const quickKeys = ['a', 'b', 'c', 'd']
        quickKeys.forEach((key, index) => {
            if (keys.has(key) && !this.lastKeys.has(key) && index < this.currentQuestion.options.length) {
                this.submitAnswer(index)
            }
        })
        
        // Uppdatera lastKeys för nästa frame
        this.lastKeys = new Set(keys)
    }
    
    /**
     * Submit svar och kolla om det är rätt
     * @param {number} answerIndex - Index för valt svar
     */
    submitAnswer(answerIndex) {
        this.hasAnswered = true
        this.isCorrect = answerIndex === this.currentQuestion.correctIndex
        
        if (this.isCorrect) {
            this.totalGold += this.currentQuestion.reward
            
            // Emit event för rätt svar
            this.game.events.emit('quizCorrect', {
                question: this.currentQuestion,
                reward: this.currentQuestion.reward
            })
        } else {
            // Emit event för fel svar
            this.game.events.emit('quizIncorrect', {
                question: this.currentQuestion
            })
        }
    }
    
    /**
     * Gå till nästa fråga eller avsluta quiz
     */
    nextQuestion() {
        this.currentQuestionIndex++
        
        if (this.currentQuestionIndex >= this.questions.length) {
            // Quiz färdigt - anropa callback med total gold
            this.onComplete(this.totalGold)
        } else {
            // Reset state för nästa fråga
            this.hasAnswered = false
            this.selectedAnswer = 0
        }
    }
    
    /**
     * Rita quiz dialog
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Rita mörk bakgrund
        ctx.fillStyle = this.backgroundColor
        ctx.fillRect(0, 0, this.game.width, this.game.height)
        
        ctx.save()
        
        const question = this.currentQuestion
        
        // Rita progress (Question 1/3)
        ctx.fillStyle = '#888888'
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
            `Question ${this.currentQuestionIndex + 1}/${this.questions.length}`, 
            this.game.width / 2, 
            40
        )
        
        // Rita frågan (med text wrapping)
        ctx.fillStyle = this.neutralColor
        ctx.font = 'bold 24px Arial'
        this.drawWrappedText(ctx, question.question, this.game.width / 2, 100, 700, 30)
        
        // Rita alternativ (A, B, C, D)
        const startY = 200
        const lineHeight = 60
        
        question.options.forEach((option, index) => {
            const y = startY + index * lineHeight
            const letter = String.fromCharCode(65 + index) // A, B, C, D
            
            // Bestäm färg baserat på state
            let color = this.neutralColor
            if (this.hasAnswered) {
                if (index === question.correctIndex) {
                    color = this.correctColor  // Grönt för rätt svar
                } else if (index === this.selectedAnswer && !this.isCorrect) {
                    color = this.incorrectColor  // Rött för fel valt svar
                }
            } else if (index === this.selectedAnswer) {
                color = this.selectedColor  // Guld för selected
            }
            
            ctx.fillStyle = color
            ctx.font = '20px Arial'
            ctx.fillText(`[${letter}] ${option}`, this.game.width / 2, y)
        })
        
        // Om svarat, visa resultat, reward och förklaring
        if (this.hasAnswered) {
            const resultY = startY + question.options.length * lineHeight + 40
            
            // Rita resultat text (CORRECT / INCORRECT)
            ctx.font = 'bold 28px Arial'
            ctx.fillStyle = this.isCorrect ? this.correctColor : this.incorrectColor
            ctx.fillText(
                this.isCorrect ? '✓ CORRECT!' : '✗ INCORRECT', 
                this.game.width / 2, 
                resultY
            )
            
            // Rita reward (om rätt svar)
            if (this.isCorrect) {
                ctx.font = '24px Arial'
                ctx.fillStyle = this.selectedColor
                ctx.fillText(`+${question.reward} gold`, this.game.width / 2, resultY + 40)
            }
            
            // Rita förklaring
            ctx.font = '18px Arial'
            ctx.fillStyle = '#CCCCCC'
            this.drawWrappedText(ctx, question.explanation, this.game.width / 2, resultY + 80, 700, 24)
            
            // Rita instruktion för nästa fråga
            ctx.font = '20px Arial'
            ctx.fillStyle = '#888888'
            const instructionText = this.currentQuestionIndex < this.questions.length - 1 
                ? 'Press Enter for next question' 
                : 'Press Enter to continue'
            ctx.fillText(instructionText, this.game.width / 2, this.game.height - 40)
        } else {
            // Rita instruktioner om vi inte svarat än
            ctx.fillStyle = '#888888'
            ctx.font = '18px Arial'
            ctx.fillText(
                'Use Arrow Keys or A-D to select, Enter to submit', 
                this.game.width / 2, 
                this.game.height - 40
            )
        }
        
        // Rita total gold earned (top right)
        ctx.fillStyle = this.selectedColor
        ctx.font = '20px Arial'
        ctx.textAlign = 'right'
        ctx.fillText(`Total Earned: ${this.totalGold} gold`, this.game.width - 20, 40)
        
        ctx.restore()
    }
    
    /**
     * Helper method för att wrappa lång text över flera rader
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text att rita
     * @param {number} x - X position (center)
     * @param {number} y - Y position (start)
     * @param {number} maxWidth - Max bredd innan wrap
     * @param {number} lineHeight - Höjd mellan rader
     */
    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ')
        let line = ''
        let currentY = y
        
        words.forEach(word => {
            const testLine = line + word + ' '
            const metrics = ctx.measureText(testLine)
            
            if (metrics.width > maxWidth && line !== '') {
                // Rita current line och börja ny
                ctx.fillText(line, x, currentY)
                line = word + ' '
                currentY += lineHeight
            } else {
                line = testLine
            }
        })
        
        // Rita sista raden
        ctx.fillText(line, x, currentY)
    }
}
