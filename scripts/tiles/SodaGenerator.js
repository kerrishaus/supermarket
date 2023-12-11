import { Vector2 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { GeneratorTile } from "./GeneratorTile.js";

import { SodaCan } from "../items/SodaCan.js";

export class SodaGenerator extends GeneratorTile
{
    constructor()
    {
        super(new Vector2(1, 2), new Vector2(2, 3), 0x1870a3, "Soda Maker", "sodaCan");
    }

    createItem()
    {
        return new SodaCan(this.position);
    }
};
