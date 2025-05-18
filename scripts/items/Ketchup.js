import { Item               } from "../items/Item.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { ModelComponent     } from "../entity/components/ModelComponent.js";

export class Ketchup extends Item
{
    constructor(position)
    {
        super();

        this.position.copy(position);

        this.addComponent(new ModelComponent("bottleKetchup"));
        this.addComponent(new CarryableComponent);

        // TODO: this does not work
        this.rotation.y = 1.5708;

        this.type = "ketchup";
    }
};