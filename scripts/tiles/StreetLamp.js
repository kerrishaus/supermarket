import { PointLight } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "../entity/Entity.js";

import { ModelComponent } from "../entity/components/ModelComponent.js";

export class StreetLamp extends Entity
{
    constructor()
    {
        super();

        this.model = this.addComponent(new ModelComponent("roads/light-square")).model;
        this.model.scale.set(10, 10, 10);

        this.light = new PointLight(0xffffff, 0.3);
        this.light.position.set(0, 2, 4.5);
        this.light.castShadow = true;
        this.add(this.light);
    }
};