import { Vector3, Quaternion, TextureLoader, MeshBasicMaterial, RepeatWrapping } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

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

        const shopWidth  = 20;
        const shopLength = 20;
        const wallThickness = 1;
        
        const shopFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength, wallThickness), 0xE0E0E0, new Vector3(0, 0, -1), new Quaternion(), 0);
        shopFloor.setRestitution(0.125);
        shopFloor.setFriction(1);
        shopFloor.setRollingFriction(5);

        scene.add(shopFloor);

        // shop north wall
        scene.add(GeometryUtil.createObject(new Vector3(shopLength, wallThickness, 4), new Vector3(0, shopWidth / 2 - wallThickness / 2 + 1, 1.5), 0xbfbfbf));
        // west wall
        scene.add(GeometryUtil.createObject(new Vector3(wallThickness, shopWidth, 4), new Vector3(shopWidth / 2 - wallThickness / 2 + 1, 0, 1.5), 0xbfbfbf));
        // east wall
        scene.add(GeometryUtil.createObject(new Vector3(wallThickness, shopWidth, 4), new Vector3(-shopWidth / 2 - wallThickness / 2, 0, 1.5), 0xbfbfbf));
        
        this.doors = new Door(new Vector3(-4, 10.491, 0.5), 0x0000ff);
        scene.add(this.doors);

        this.storageTiles = new Array();
        
        this.register = new Register();
        this.register.setPosition(new Vector3(-8, -7, 0));
        for (let i = 0; i < 100; i++)
            this.register.addMoney();
        scene.add(this.register);
        
        let tomatoStandBuyTile = new BuyableTile(1, 1, 7, 7, 100, "Buy \"Soft drink cooler\"");
        tomatoStandBuyTile.onFullyPaid = () =>
        {
            console.log("i'm done!");
            
            const tomatoStand = new TomatoStand(1, 4);

            scene.add(tomatoStand);
            scene.remove(tomatoStandBuyTile.label);
            scene.remove(tomatoStandBuyTile);
            this.storageTiles.push(tomatoStand);
        };
        scene.add(tomatoStandBuyTile);
        
        this.customers = new Array();
        this.customerTimer = 6;
        this.timeSinceLastCustomer = this.customerTimer;
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
