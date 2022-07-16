import { Carryable } from "../Carryable.js";

export class TomatoJuice extends Carryable
{
    constructor(position)
    {
        super(0.4, 0.4, 0.4, 0x00ff00);
        
        this.position.copy(position);

        this.type = "tomatoJuice";
    }
};