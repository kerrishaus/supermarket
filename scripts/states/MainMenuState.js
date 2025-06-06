import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { LoadSaveState } from "./LoadSaveState.js";
import { SettingsState } from "./SettingsState.js";

import { addStyle, removeStyle } from "../PageUtility.js";

export class MainMenuState extends State
{
    init()
    {
        addStyle("MainMenuState");

        $("body").append("<div id='MainMenu' class='display-flex justify-center align-center flex-column flex-gap'>");

        $("<button id='PlayGame'>Play Game</button>")
            .appendTo("#MainMenu")
            .click((event) => {
                $("body").fadeOut(1000);
                setTimeout(() => {
                    this.stateMachine.changeState(new LoadSaveState());
                }, 1000);
            });
        
        $("<button id='OpenSettings'>Settings</button>")
            .appendTo("#MainMenu")
            .click((event) => {
                this.stateMachine.pushState(new SettingsState());
            });

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // create a global audio source
        const sound = new THREE.Audio(listener);

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load("music/title.mp3", function(buffer)
        {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        });

        $("#LoadingCover").fadeOut(1000, function()
        {
            $(this).remove(); 
            $("#loadingStyles").remove();
        });
    }

    cleanup()
    {
        $("#MainMenu").remove();

        removeStyle("MainMenuState");
    }
};