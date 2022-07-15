import { ItemGenerator } from "./ItemGenerator.js";

import { Tomato } from "../Tomato.js";

export class TomatoPlant extends ItemGenerator
{
    createItem()
    {
        return new Tomato(this.position);
    }
};
