import { ContainerTile } from "./ContainerTile.js";

export class TomatoStand extends ContainerTile
{
    constructor(xPos, yPos)
    {
        super(1, 1, 2, 2, 0x4d220b);
        
        this.name = "tomatoStand";
        this.itemType = "tomato";
        
        this.position.x = xPos;
        this.position.y = yPos;
    }
};
