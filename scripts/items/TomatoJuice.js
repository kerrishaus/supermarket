import { Entity             } from "../entity/Entity.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { ModelComponent     } from "../entity/components/ModelComponent.js";

// TODO: rename TomatoJuice to Ketchup
export class TomatoJuice extends Entity
{
    constructor()
    {
        super();

        this.addComponent(new ModelComponent("bottleKetchup"));
        this.addComponent(new CarryableComponent);

        // TODO: this does not work
        this.rotation.y = 1.5708;

        this.type = "tomatoJuice";
    }
};