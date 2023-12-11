import { Entity             } from "../entity/Entity.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { ModelComponent     } from "../entity/components/ModelComponent.js";

export class Tomato extends Entity
{
    constructor()
    {
        super();

        this.addComponent(new ModelComponent("tomato"));
        this.addComponent(new CarryableComponent);
        
        this.type = "tomato";
    }
};