import { State } from "./State.js";

import * as PageUtility from "../PageUtility.js";

export class SettingsState extends State
{
    init(stateMachine)
    {
        this.stateMachine = stateMachine;

        PageUtility.addStyle("settings");

        this.settingsMenu = document.createElement("div");
        this.settingsMenu.id = "settings";
        this.settingsMenu.classList = "display-flex justify-center align-center flex-column flex-gap";
        document.body.appendChild(this.settingsMenu);

        const button = document.createElement("button");
        button.id = "playGame";
        button.textContent = "Back";
        button.addEventListener("click", (event) =>
        {
            this.stateMachine.popState();
        });
        this.settingsMenu.appendChild(button);

        console.log("SettingsState ready.");
    }

    cleanup()
    {
        PageUtility.removeStyle("settings");

        this.settingsMenu.remove();

        console.log("SettingsState cleaned up.");
    }
};