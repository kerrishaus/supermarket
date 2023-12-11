import { Entity             } from "../entity/Entity.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { ModelComponent     } from "../entity/components/ModelComponent.js";

export class SodaCan extends Entity
{
    constructor()
    {
        super();

        this.addComponent(new ModelComponent("sodaCan"));
        this.addComponent(new CarryableComponent);
        
        this.type = "sodaCan";
    }
};