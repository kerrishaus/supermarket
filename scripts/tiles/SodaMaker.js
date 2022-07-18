import { Vector2 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { GeneratorTile } from "./GeneratorTile.js";

import { SodaCan } from "../items/SodaCan.js";

export class SodaMaker extends GeneratorTile
{
    constructor()
    {
        super(new Vector2(1, 2), new Vector2(2, 3), 0x000000, "Soda Maker", "sodaCan");
    }

    createItem()
    {
        return new SodaCan(this.position);
    }
};
