import { Entity } from "../entity/Entity.js";

export class Item extends Entity
{
    update(deltaTime)
    {
        super.update(deltaTime);

        this.model = this.getComponent("ModelComponent").model.rotation.y += 0.01;
    }
};