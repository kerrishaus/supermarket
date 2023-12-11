import { CylinderGeometry } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Carryable } from "../Carryable.js";

export class TomatoJuice extends Carryable
{
    constructor(position)
    {
        super(0.4, 0.4, 0.4, 0xA62D48);

        this.geometry.dispose();
        this.geometry = new CylinderGeometry(0.1, 0.1, 0.2, 16);

        // TODO: this does not work
        this.rotation.y = 1.5708;
        
        this.position.copy(position);

        this.type = "tomatoJuice";
    }
};