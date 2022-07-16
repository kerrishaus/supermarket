import { Vector2 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { ItemGenerator } from "./ItemGenerator.js";

import { Tomato } from "../Tomato.js";

export class TomatoPlant extends ItemGenerator
{
    constructor()
    {
        super(new Vector2(0.3, 0.3), new Vector2(1, 1), 0xad723e, "Tomato Plant");
    }

    createItem()
    {
        return new Tomato(this.position);
    }
};
