import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { addStyle, removeStyle } from "../PageUtility.js";

export class SettingsState extends State
{
    init()
    {
        addStyle("SettingsState");

        $("body").append("<div id='SettingsMenu' class='display-flex justify-center align-center flex-column flex-gap'>");

        $("#SettingsMenu")
            .append("<button id='CloseMenu'>Close Menu</button>")
            .click((event) => {
                this.stateMachine.popState();
            });
    }

    cleanup()
    {
        removeStyle("SettingsState");

        $("#SettingsMenu").remove();
    }
};