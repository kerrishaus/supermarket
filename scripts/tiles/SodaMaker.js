import { ItemGenerator } from "./ItemGenerator.js";

import { SodaCan } from "../SodaCan.js";

export class SodaMaker extends ItemGenerator
{
    constructor()
    {
        super(new Vector2(1, 2), new Vector2(2, 3), 0x000000, "Soda Maker");
    }

    createItem()
    {
        return new SodaCan(this.position);
    }
};
