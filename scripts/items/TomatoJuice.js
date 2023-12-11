import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "../entity/Entity.js";

// TODO: rename TomatoJuice to Ketchup
export class TomatoJuice extends Entity
{
    constructor(position)
    {
        super("bottleKetchup", new Vector3(0.1, 0.1, 0.1));

        // TODO: this does not work
        this.rotation.y = 1.5708;
        
        this.position.copy(position);

        this.type = "tomatoJuice";
    }
};