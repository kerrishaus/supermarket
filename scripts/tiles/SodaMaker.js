import { ItemGenerator } from "./ItemGenerator.js";

import { SodaCan } from "../SodaCan.js";

export class SodaMaker extends ItemGenerator
{
    createItem()
    {
        return new SodaCan(this.position);
    }
};
