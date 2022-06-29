import { Vector3, Quaternion } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as GeometryUtil from "./GeometryUtility.js";

import { DynamicMesh } from "./DynamicMesh.js";
import { RigidBodyCube } from "./RigidBodyCube.js";

import { Door } from "./Door.js";
import { Register } from "./Register.js";
import { RecycleBin } from "./RecycleBin.js";
import { BuyableTile } from "./BuyableTile.js";
import { TomatoPlant } from "./TomatoPlant.js";
import { Customer } from "./Customer.js";

export class Shop extends DynamicMesh
{
    constructor()
    {
        super();
        
        const shopFloor = new RigidBodyCube(new Vector3(40, 20, 1), 0xE0E0E0, new Vector3(0, 10, -1), new Quaternion(), 0);
        shopFloor.setRestitution(0.125);
        shopFloor.setFriction(1);
        shopFloor.setRollingFriction(5);

        // shop floor
        scene.add(shopFloor);

        // shop north wall
        scene.add(GeometryUtil.createObject(new Vector3(40, 1, 4), new Vector3(0, 19.5, 1.5), 0xbfbfbf));
        // west wall
        scene.add(GeometryUtil.createObject(new Vector3(1, 20, 4), new Vector3(-19.5, 10, 1.5), 0xbfbfbf));
        // east wall
        scene.add(GeometryUtil.createObject(new Vector3(1, 20, 4), new Vector3(19.5, 10, 1.5), 0xbfbfbf));
        
        this.doors = new Door(new Vector3(-9.5, 19.4, 0), 0x0000ff);
        scene.add(this.doors);
        
        // farm floor
        scene.add(GeometryUtil.createObject(new Vector3(40, 20, 1), new Vector3(0, -10, -1), 0x44CD32));
        
        this.register = new Register();
        this.register.position.x = -16;
        this.register.position.y = 15;
        for (let i = 0; i < 100; i++)
            this.register.addMoney();
        scene.add(this.register);
        
        this.recycleBin = new RecycleBin(6, 4);
        this.recycleBin.position.x = -4;
        this.recycleBin.position.y = 17;
        scene.add(this.recycleBin);
        
        let tomatoStandBuyTile = new BuyableTile(1, 1, 1, 4, 100, "Tomato Stand");
        tomatoStandBuyTile.onFullyPaid = function()
        {
            console.log("i'm done!");
            
            scene.add(new TomatoStand(1, 4));
            scene.remove(tomatoStandBuyTile.label);
            scene.remove(tomatoStandBuyTile);
        };
        scene.add(tomatoStandBuyTile);
        
        const tomatoPlant1 = new TomatoPlant();
        tomatoPlant1.position.x = -10;
        tomatoPlant1.position.y = -3;
        scene.add(tomatoPlant1);
        
        const tomatoPlant2 = new TomatoPlant();
        tomatoPlant2.position.x = -10;
        tomatoPlant2.position.y = -6;
        scene.add(tomatoPlant2);
        
        this.customers = new Array();
        this.customerTimer = 10;
        this.timeSinceLastCustomer = 0;
    }
    
    update(deltaTime)
    {
        if (this.timeSinceLastCustomer > this.customerTimer)
        {
            let customer = new Customer(this);
            customer.position.copy(new Vector3(-9.5, 22, 0));
            customer.pushAction({type: "move", position: new Vector3(-9.5, 16, 0)});
            customer.pushAction({type: "move", position: new Vector3(0, 0, 0)});
            customer.pushAction({type: "move", position: new Vector3(-14, 15, 0)});
            customer.pushAction({type: "move", position: new Vector3(-9.5, 16, 0)});
            customer.pushAction({type: "move", position: new Vector3(-9.5, 22, 0)});
            this.customers.push(customer);
            scene.add(customer);

            this.timeSinceLastCustomer = 0;
            console.log("added customer");
        }
        else
            this.timeSinceLastCustomer += deltaTime;

        for (const customer of this.customers)
        {
            if (customer.actions.length <= 0)
            {
                this.customers.splice(this.customers.indexOf(customer), 1);
                scene.remove(customer);
            }
        }
    }
}
