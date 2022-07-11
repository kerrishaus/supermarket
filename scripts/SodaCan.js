import { Carryable } from "./Carryable.js";

export class SodaCan extends Carryable
{
    constructor(position)
    {
        super(0.4, 0.4, 0.4, 0xc2c2c2);
        
        this.position.copy(position);

        this.type = "sodaCan";
    }
};