import { Vector3, Quaternion, BoxGeometry, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { DynamicMesh } from "./geometry/DynamicMesh.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";

export class Player extends DynamicMesh
{
    constructor()
    {
        const geometry = new BoxGeometry(1, 1, 2);
        const material = new MeshStandardMaterial({ color: 0x0000ff });
        
        super(geometry, material);

        this.nose = GeometryUtil.createScaledCube(0.4, 1, 0.2, 0x0000aa);
        this.nose.position.z = 0.8;
        this.nose.position.y = 0.5;
        this.add(this.nose);
        
        this.money = 0;
        
        this.carriedItems = new Array();
        this.carriedMoney = new Array();

        this.carryLimit = 4;
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

        // keeps all carried items in their proper position
        for (let i = 0; i < this.carriedItems.length; i++)
        {
            let item = this.carriedItems[i];

            const carryPos = ((item.scale.z / 2) * i) + 1.25;
            
            item.quaternion.copy(this.quaternion);

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
            
            money.updateTarget(this.position, new Vector3(0, 0, 0.5));
        }
    }
};