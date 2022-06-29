import { Vector3, Quaternion } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { KinematicCube } from "./KinematicCube.js";

export class Player extends KinematicCube
{
    constructor()
    {
        super(new Vector3(1, 1, 2), 0x0000ff, new Vector3(0, 0, 0.5), new Quaternion());
        
        this.money = 0;
        
        this.carriedItems = new Array();
        this.carriedMoney = new Array();
    }
    
    update(deltaTime)
    {
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