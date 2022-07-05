import { Vector3, Quaternion, TextureLoader, MeshBasicMaterial, RepeatWrapping, Group } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as GeometryUtil from "./GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

import { DynamicMesh } from "./DynamicMesh.js";
import { RigidBodyCube } from "./RigidBodyCube.js";

import { Door } from "./Door.js";
import { Register } from "./Register.js";
import { RecycleBin } from "./RecycleBin.js";
import { BuyableTile } from "./BuyableTile.js";
import { TomatoPlant } from "./TomatoPlant.js";
import { TomatoStand } from "./TomatoStand.js";
import { Customer } from "./Customer.js";

export class Shop extends Group
{
    constructor()
    {
        super();

        const shopWidth  = 20;
        const shopLength = 20;
        const wallThickness = 1;
        
        const shopFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength, wallThickness), 0xE0E0E0, new Vector3(0, 0, -1), new Quaternion(), 0);

        scene.add(shopFloor);

        // shop north wall
        scene.add(GeometryUtil.createObject(new Vector3(shopLength, wallThickness, 4), new Vector3(0, shopWidth / 2 - wallThickness / 2 + 1, 1.5), 0xbfbfbf));
        // west wall
        scene.add(GeometryUtil.createObject(new Vector3(wallThickness, shopWidth, 4), new Vector3(shopWidth / 2 - wallThickness / 2 + 1, 0, 1.5), 0xbfbfbf));
        // east wall
        scene.add(GeometryUtil.createObject(new Vector3(wallThickness, shopWidth, 4), new Vector3(-shopWidth / 2 - wallThickness / 2, 0, 1.5), 0xbfbfbf));
        
        const farmFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength, wallThickness), 0x449c5d, new Vector3(0, -shopLength, -1), new Quaternion(), 0);
        scene.add(farmFloor);

        this.doors = new Door(new Vector3(-4, 10.491, 0.5), 0x0000ff);
        scene.add(this.doors);

        this.containerTiles = new Array();
        
        this.register = new Register();
        this.register.position.x = -8;
        this.register.position.y = -7;
        for (let i = 0; i < 100; i++)
            this.register.addMoney();
        scene.add(this.register);
        
        let tomatoStandBuyTile = new BuyableTile(1, 1, 7, 7, 100, "Buy \"Soft drink cooler\"");
        tomatoStandBuyTile.onFullyPaid = () =>
        {
            console.log("i'm done!");
            
            const tomatoStand = new TomatoStand(1, 4);
            tomatoStand.position.copy(tomatoStandBuyTile.position);

            scene.add(tomatoStand);
            tomatoStandBuyTile.remove(tomatoStandBuyTile.label);
            scene.remove(tomatoStandBuyTile);
            this.containerTiles.push(tomatoStand);
        };
        scene.add(tomatoStandBuyTile);

        tomatoStandBuyTile.onFullyPaid();
        
        const tomatoPlant1 = new TomatoPlant();
        tomatoPlant1.position.x = -8;
        tomatoPlant1.position.y = -12;
        scene.add(tomatoPlant1);

        const recycleBin = new RecycleBin();
        recycleBin.position.x = -9;
        recycleBin.position.y = 9;
        scene.add(recycleBin);
        
        this.customers = new Array();
        this.customerTimer = 6;
        this.timeSinceLastCustomer = this.customerTimer;

        this.spawnPosition = new Vector3(-4, 15, 0);
        this.readyPosition = new Vector3(-4, 7, 0);
        this.registerPosition = new Vector3(-7.5, -5, 0);

        return this;
    }
    
    update(deltaTime)
    {
        if (this.timeSinceLastCustomer > this.customerTimer)
        {
            if (this.containerTiles.length > 0)
            {
                let customer = new Customer(this);
                customer.position.copy(this.spawnPosition);
                customer.pushAction({type: "move", position: this.readyPosition});

                for (const containerTile of this.containerTiles)
                {
                    const chance = MathUtility.getRandomInt(100);

                    if (chance > 50)
                    {
                        const amount = MathUtility.getRandomInt(containerTile.maxItems / 2) + 1;

                        console.log("buying from " + containerTile.name + " amount " + amount);

                        customer.pushAction({type: "buy", container: containerTile, amount: amount})
                    }
                }
                
                customer.pushAction({type: "move", position: this.registerPosition});
                customer.pushAction({type: "move", position: this.readyPosition});
                customer.pushAction({type: "move", position: this.spawnPosition});
                this.customers.push(customer);
                scene.add(customer);

                this.timeSinceLastCustomer = 0;
                console.log("added customer");
            }
        }
        else
            this.timeSinceLastCustomer += deltaTime;

        for (const customer of this.customers)
        {
            if (customer.actions.length <= 0)
            {
                for (const carriedItem of customer.carriedItems)
                    scene.remove(carriedItem);

                this.customers.splice(this.customers.indexOf(customer), 1);
                scene.remove(customer);
            }
        }
    }
}
