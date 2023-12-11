import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "../entity/Entity.js";

export class SodaCan extends Entity
{
    constructor(position)
    {
        super("sodaCan", new Vector3(0.3, 0.3, 0.3));
        
        this.position.copy(position);

        this.type = "sodaCan";
    }
};