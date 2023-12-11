import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Triggerable } from "../geometry/Triggerable.js";

import { Player } from "../Player.js";
import { Customer } from "../Customer.js";

export class ContainerTile extends Triggerable
{
    // TODO: improve this constructor
    constructor(width, height, triggerWidth, triggerHeight, color)
    {
        super(width, height, triggerWidth, triggerHeight, color);

        this.carriedItems = new Array();
        this.maxItems = 9;

        this.name     = null;
        this.itemType = null;

        this.lifeSales = 0;

        this.column_     = 0;
        this.row_        = 0;
        this.layer_      = 0;
        
        this.gridRows    = 3;
        this.gridColumns = 3;
    }

    transferFromCarrier(carrier)
    {
        if (this.carriedItems.length >= this.maxItems)
            return;
        
        for (const item of carrier.carriedItems)
        {
            if (item.type == this.itemType)
            {
                carrier.carriedItems.splice(carrier.carriedItems.indexOf(item), 1);
                this.carriedItems.push(item);
                
                this.calculateGrid();
                
                //item.setTarget(this.position, new Vector3(this.column_ - 1, this.row_ - 1, this.layer_ + 1));
                item.autoPositionAfterAnimation = true;
            }
        }
    }

    transferToCarrier(carrier)
    {
        if (this.carriedItems.length <= 0)
            return;

        if (carrier.carriedItems.length > carrier.carryLimit)
        {
            console.warn(`Carrier has too many items! Carrying: ${carrier.carriedItems.length}, Limit: ${carrier.carryLimit}`);
            return;
        }

        if (carrier instanceof Customer)
        {
            this.carriedItems[0].setTarget(carrier.position, new Vector3(0, 0, 0));
            this.carriedItems[0].autoPositionAfterAnimation = false;

            carrier.carriedItems.push(this.carriedItems[0]);
            this.carriedItems.shift();

            this.calculateGrid();

            this.lifeSales += 1;
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