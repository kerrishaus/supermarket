import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { ContainerTile } from "./ContainerTile.js";

import { Tomato } from "./Tomato.js";
import { Customer } from "./Customer.js";
import { Player } from "./Player.js";

export class TomatoStand extends ContainerTile
{
    constructor(xPos, yPos)
    {
        super(1, 1, 2, 2, 0x4d220b);
        
        this.name = "tomatoStand";
        
        this.position.x = xPos;
        this.position.y = yPos;

        this.column_ = 0;
        this.row_ = 0;
        this.layer_ = 0;
        
        this.gridRows = 3;
        this.gridColumns = 3;

        return this;
    }
    
    transferFromCarrier(holder)
    {
        if (this.carriedItems.length >= this.maxItems)
            return;
        
        for (const item of holder.carriedItems)
        {
            if (item instanceof Tomato)
            {
                holder.carriedItems.splice(holder.carriedItems.indexOf(item), 1);
                this.carriedItems.push(item);
                
                this.calculateGrid();
                
                //item.setTarget(this.position, new Vector3(this.column_ - 1, this.row_ - 1, this.layer_ + 1));
                item.autoPositionAfterAnimation = true;
            }
        }
    }

    transferToCarrier(object)
    {
        if (this.carriedItems.length <= 0)
            return;

        if (object instanceof Customer)
        {
            this.carriedItems[0].setTarget(object.position, new Vector3(0, 0, 0));

            object.carriedItems.push(this.carriedItems[0]);
            this.carriedItems.shift();
        }
    }

    calculateGrid()
    {
        this.column_ = 0;
        this.row_    = 0;
        this.layer_  = 0;
        
        for (let i = 0; i < this.carriedItems.length; i++)
        {
            this.column_ += 1;
            
            if (this.column_ >= this.gridColumns)
            {
                this.column_ = 0;
                this.row_ += 1;
            }
            
            if (this.row_ >= this.gridRows)
            {
                this.row_ = 0;
                this.layer_ += 1;
            }

            this.carriedItems[i].setTarget(this.position, new Vector3(this.column_ - 1, this.row_ - 1, this.layer_ + 1));
        }
    }
    
    onTrigger(object)
    {
        super.onTrigger(object);
        
        if (object instanceof Player)
            this.transferFromCarrier(object);
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);
    }
};
