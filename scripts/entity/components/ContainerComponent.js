import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Player   } from "../../Player.js";
import { Customer } from "../../Customer.js";
import { Employee } from "../../Employee.js";

import { EntityComponent } from "./EntityComponent.js";

export class ContainerComponent extends EntityComponent
{
    init(name = null, itemType = null)
    {
        this.carriedItems = new Array();
        this.maxItems = 9;

        this.name     = name;
        // if item type is not specified, the container will take any itemtype
        this.itemType = itemType;

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

        for (const item of this.carriedItems)
            item.destructor();
    }

    transferFromCarrier(carrier)
    {
        if (this.carriedItems.length >= this.maxItems)
            return;
        
        for (const item of carrier.getComponent("ContainerComponent").carriedItems)
        {
            // if the item is not specified, it will take any item
            if (item.type == (this.itemType ?? item.type))
            {
                carrier.getComponent("ContainerComponent").carriedItems.splice(carrier.getComponent("ContainerComponent").carriedItems.indexOf(item), 1);
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

        if (carrier.getComponent("ContainerComponent").carriedItems.length > carrier.maxItems)
        {
            console.warn(`Carrier has too many items! Carrying: ${carrier.getComponent("ContainerComponent").carriedItems.length}, Limit: ${carrier.getComponent("ContainerComponent").maxItems}`);
            return;
        }

        if (carrier instanceof Customer)
        {
            this.carriedItems[0].getComponent("CarryableComponent").setTarget(carrier.position, new Vector3(0, 0, 0));
            this.carriedItems[0].autoPositionAfterAnimation = false;

            carrier.getComponent("ContainerComponent").carriedItems.push(this.carriedItems[0]);
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

            this.carriedItems[i].getComponent("CarryableComponent").setTarget(this.parentEntity.position, new Vector3(this.column_ - 1, this.row_ - 1, this.layer_ + 1));
        }
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        // TODO: this is kind of a hack, but it'll work for now
        if (this.parentEntity instanceof Player ||
            this.parentEntity instanceof Customer ||
            this.parentEntity instanceof Employee)
        {
            for (let i = 0; i < this.carriedItems.length; i++)
            {
                let item = this.carriedItems[i];
    
                const carryPos = ((item.scale.z / 2) * i) + this.parentEntity.scale.z + item.scale.z / 2;
                
                item.quaternion.copy(this.parentEntity.quaternion);
    
                if (item.elapsedTime > item.moveTime)
                {
                    item.position.copy(this.parentEntity.position);
                    item.position.z += carryPos;
                    continue;
                }
                
                item.getComponent("CarryableComponent").updateTarget(this.parentEntity.position, new Vector3(0, 0, carryPos));
            }
        }
    }
}