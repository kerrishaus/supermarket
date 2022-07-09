import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Interactable } from "../geometry/InteractableMesh.js";

import { Player } from "../Player.js";
import { Customer } from "../Customer.js";

export class ContainerTile extends Interactable
{
    // TODO: improve this constructor
    constructor(a, b, c, d, e,)
    {
        super(a, b, c, d, e);

        this.carriedItems = new Array();
        this.maxItems = 9;

        this.name     = null;
        this.itemType = null;

        this.daySales  = 0;
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

        if (carrier instanceof Customer)
        {
            this.carriedItems[0].setTarget(carrier.position, new Vector3(0, 0, 0));

            carrier.carriedItems.push(this.carriedItems[0]);
            this.carriedItems.shift();

            this.lifeSales += 1;
            this.daySales += 1;
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