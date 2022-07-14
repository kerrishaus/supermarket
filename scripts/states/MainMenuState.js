import { State } from "./State.js";

import * as PageUtility from "../PageUtility.js";

import { PlayState } from "./PlayState.js";

export class MainMenuState extends State
{
    init(stateMachine)
    {
        this.stateMachine = stateMachine;

        PageUtility.addStyle("mainMenu");

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
        PageUtility.removeStyle("mainMenu");

        mainMenu.remove();

        console.log("MainMenuState cleaned up.");
    }
};