import { Vector3, Quaternion, BoxGeometry, MeshStandardMaterial, PerspectiveCamera } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { ItemCarrier } from "./ItemCarrier.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";

export class Player extends ItemCarrier
{
    constructor()
    {
        const geometry = new BoxGeometry(1, 1, 2);
        const material = new MeshStandardMaterial({ color: 0x0000ff });
        
        super(geometry, material);

        const nose = GeometryUtil.createScaledCube(0.4, 1, 0.2, 0x0000aa);
        nose.position.z = 0.8;
        nose.position.y = 0.5;
        this.add(nose);
        
        this.money = 0;
        
        this.carriedMoney = new Array();

        //this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
		        
        this.maxSpeed = 0.3;
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

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