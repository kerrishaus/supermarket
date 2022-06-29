import { Carryable } from "./Carryable.js";

export class Tomato extends Carryable
{
    constructor(position)
    {
        super(0.4, 0.4, 0.4, 0x852520);
        
        this.position.copy(position);
    }
};