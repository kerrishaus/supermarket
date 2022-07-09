import { ContainerTile } from "./ContainerTile.js";

export class SodaMachine extends ContainerTile
{
    constructor(xPos, yPos)
    {
        super(1, 1, 2, 2, 0x4d220b);
        
        this.name = "sodaMachine";
        this.itemType = "sodaCan";
        
        this.position.x = xPos;
        this.position.y = yPos;
    }
};
