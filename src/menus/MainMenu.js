import Menu from './Menu.js'
import ControlsMenu from './ControlsMenu.js'

export default class MainMenu extends Menu {
    getTitle() {
        return 'Game Menu'
    }
    
    getOptions() {
        const options = []
        
        // Show "Continue" if there's saved data in default slot
        if (this.game.saveManager.hasSave('slot_0')) {
            const saveInfo = this.game.saveManager.getSaveInfo('slot_0')
            options.push({
                text: `Continue (Level ${saveInfo.level})`,
                key: 'c',
                action: () => {
                    this.game.loadGame(0)
                }
            })
        }
        
        // Start Game (or New Game if there's a save)
        options.push({
            text: this.game.saveManager.hasSave('slot_0') ? 'New Game' : 'Start Game',
            key: ' ',
            action: () => {
                this.game.restart() // Restart to start from beginning
            }
        })
        
        // Controls
        options.push({
            text: 'Controls',
            key: 'k',
            action: () => {
                this.game.currentMenu = new ControlsMenu(this.game)
            }
        })
        
        // Clear Save (om det finns sparad data)
        if (this.game.saveManager.hasSave()) {
            options.push({
                text: 'Delete Save',
                key: 'd',
                action: () => {
                    this.game.saveManager.clear()
                    // Uppdatera menyn för att visa nya alternativ
                    this.game.currentMenu = new MainMenu(this.game)
                }
            })
        }
        
        return options
    }
}
