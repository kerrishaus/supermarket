import { State } from "./State.js";

import { PlayState } from "./PlayState.js";

export class MainMenuState extends State
{
    init(stateMachine)
    {
        this.stateMachine = stateMachine;

        this.menuStyles = document.createElement("link");
        this.menuStyles.setAttribute("rel", "stylesheet");
        this.menuStyles.setAttribute("href", "./styles/mainMenu.css");
        this.menuStyles.id = "menuStyles";
        document.head.appendChild(this.menuStyles);

        this.mainMenu = document.createElement("div");
        this.mainMenu.id = "mainMenu";
        this.mainMenu.classList = "display-flex justify-center align-center";
        document.body.appendChild(this.mainMenu);

        const button = document.createElement("button");
        button.id = "playGame";
        button.textContent = "Play Game";

        button.addEventListener("click", (event) =>
        {
            this.stateMachine.changeState(new PlayState());
        });
        
        this.mainMenu.appendChild(button);

        console.log("MainMenuState ready.");
    }

    cleanup()
    {
        menuStyles.remove();
        mainMenu.remove();

        console.log("MainMenuState cleaned up.");
    }
};