import { EntityComponent } from "./EntityComponent.js";

export class ContainerComponent extends EntityComponent
{
    init()
    {
        if (!this.parentEntity.hasComponent("TriggerComponent"))
            console.error("ContainerComponent requires TriggerComponent be added to the parent entity first!");

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

        // this is set by employees when they are targetting this container,
        // so that it is not targetted by multiple employees
        this.handledByEmployee = null;
    }

    destructor()
    {
        super.destructor();
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
                
                //item.getComponent("CarryableComponent").setTarget(this.position, new Vector3(this.column_ - 1, this.row_ - 1, this.layer_ + 1));
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
            this.carriedItems[0].getComponent("CarryableComponent").setTarget(carrier.position, new Vector3(0, 0, 0));
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

            this.carriedItems[i].getComponent("CarryableComponent").setTarget(this.position, new Vector3(this.column_ - 1, this.row_ - 1, this.layer_ + 1));
        }
    }

    update(deltaTime)
    {
        super.update(deltaTime);
    }
}