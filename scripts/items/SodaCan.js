import { Item               } from "../items/Item.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { ModelComponent     } from "../entity/components/ModelComponent.js";

export class SodaCan extends Item
{
    constructor(position)
    {
        super();

        this.position.copy(position);

        this.addComponent(new ModelComponent("items/sodaCan"));
        this.addComponent(new CarryableComponent);
        
        this.type = "sodaCan";
    }
};