import { ContainerTile } from "./ContainerTile.js";

export class TomatoJuiceShelf extends ContainerTile
{
    constructor(xPos, yPos)
    {
        super(1, 1, 2, 2, 0x4d220b);
        
        this.name = "tomatoJuiceShelf";
        this.itemType = "tomatoJuice";
        
        this.position.x = xPos;
        this.position.y = yPos;
    }
};
