import { BoxGeometry, MeshBasicMaterial, Box3, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { DynamicMesh } from "./DynamicMesh.js";

export class Player extends DynamicMesh
{
    constructor()
    {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x0000ff });
        
        super(geometry, material);
        
        this.geometry.computeBoundingBox();
        
        this.box = new Box3();
        
        this.money = 0;
        
        this.carriedItems = new Array();
        this.carriedMoney = new Array();
    }
    
    update(deltaTime)
    {
        this.box.copy(this.geometry.boundingBox).applyMatrix4(this.matrixWorld);
        
        // keeps all carried items in their proper position
        for (const item of this.carriedItems)
        {
            const carryPos = 1 + (item.scale.z * item.carryPos);
            
            if (item.elapsedTime > item.moveTime)
            {
                item.position.copy(this.position);
                item.position.z += carryPos;
                continue;
            }
            
            item.updateTarget(this.position, new Vector3(0, 0, carryPos));
        }

        for (const money of this.carriedMoney)
        {
            if (money.elapsedTime > money.moveTime)
            {
                scene.remove(money);
                this.carriedMoney.splice(this.carriedMoney.indexOf(money), 1);
                continue;
            }
            
            money.updateTarget(this.position, new Vector3(0, 0, 0));
        }
    }
};