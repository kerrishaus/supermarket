import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { DynamicMesh } from "./geometry/DynamicMesh.js";

export class ItemCarrier extends DynamicMesh
{
    constructor(geometry, material)
    {
        super(geometry, material);

        this.carriedItems = new Array();
        this.carryLimit = 4;
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        // keeps all carried items in their proper position
        for (let i = 0; i < this.carriedItems.length; i++)
        {
            let item = this.carriedItems[i];

            const carryPos = ((item.scale.z / 2) * i) + this.scale.z + item.scale.z / 2;
            
            item.quaternion.copy(this.quaternion);

            if (item.elapsedTime > item.moveTime)
            {
                item.position.copy(this.position);
                item.position.z += carryPos;
                continue;
            }
            
            item.getComponent("CarryableComponent").updateTarget(this.position, new Vector3(0, 0, carryPos));
        }
    }
}