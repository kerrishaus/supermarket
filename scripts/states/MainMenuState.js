import { State } from "./State.js";

import { addStyle, removeStyle } from "../PageUtility.js";

import { PlayState } from "./PlayState.js";
import { SettingsState } from "./SettingsState.js";

export class MainMenuState extends State
{
    init()
    {
        addStyle("MainMenuState");

        this.mainMenu = document.createElement("div");
        this.mainMenu.id = "mainMenu";
        this.mainMenu.classList = "display-flex justify-center align-center flex-column flex-gap";
        document.body.appendChild(this.mainMenu);

        const button = document.createElement("button");
        button.id = "playGame";
        button.textContent = "Play Game";
        button.addEventListener("click", (event) =>
        {
            this.stateMachine.changeState(new PlayState());
        });
        this.mainMenu.appendChild(button);

        const settingsButton = document.createElement("button");
        settingsButton.id = "settingsButton";
        settingsButton.textContent = "Settings";
        settingsButton.addEventListener("click", (event) =>
        {
            this.stateMachine.pushState(new SettingsState());
        });
        this.mainMenu.appendChild(settingsButton);
    }

    cleanup()
    {
        removeStyle("MainMenuState");

        this.mainMenu.remove();
    }
};