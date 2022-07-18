import { Vector3, Quaternion, MeshBasicMaterial, RepeatWrapping, Group } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

import { RigidBodyCube } from "./geometry/RigidBodyCube.js";

import { Door } from "./Door.js";
import { Register } from "./tiles/Register.js";
import { RecycleBin } from "./tiles/RecycleBin.js";
import { BuyableTile } from "./tiles/BuyableTile.js";

import { Customer } from "./Customer.js";

import { TomatoStand } from "./tiles/TomatoStand.js";
import { TomatoPlant } from "./tiles/TomatoPlant.js";

import { SodaMachine } from "./tiles/SodaMachine.js";
import { SodaMaker } from "./tiles/SodaMaker.js";
import { Employee } from "./Employee.js";

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
        
        const backroomFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength / 2, wallThickness), 0x878787, new Vector3(0, -15, -1), new Quaternion(), 0);
        scene.add(backroomFloor);

        this.doors = new Door(new Vector3(-4, 10.491, 0.5), 0x0000ff);
        scene.add(this.doors);

        this.containerTiles = new Array();
        this.generatorTiles = new Array();
        
        this.register = new Register();
        this.register.position.x = -8;
        this.register.position.y = -7;
        for (let i = 0; i < 25; i++)
            this.register.addMoney();
        scene.add(this.register);

        this.recycleBin = new RecycleBin(6, 4);
        this.recycleBin.position.x = -9;
        this.recycleBin.position.y = 9;
        scene.add(this.recycleBin);
        
        let tomatoStandBuyTile = new BuyableTile(1, 1, 7, 7, 100, "Buy \"Tomato Stand\"");
        tomatoStandBuyTile.onFullyPaid = () =>
        {
            const tomatoStand = new TomatoStand(1, 4);
            tomatoStand.position.copy(tomatoStandBuyTile.position);
            scene.add(tomatoStand);
            this.containerTiles.push(tomatoStand);

            tomatoStandBuyTile.remove(tomatoStandBuyTile.label);
            scene.remove(tomatoStandBuyTile);

            this.tomatoPlant1 = new TomatoPlant();
            this.tomatoPlant1.position.x = -5;
            this.tomatoPlant1.position.y = -18;
            this.generatorTiles.push(this.tomatoPlant1);
            scene.add(this.tomatoPlant1);

            let tomatoPlant2BuyTile = new BuyableTile(0.3, 0.3, -3, -18, 50, "Buy \"Tomato Plant\"");
            tomatoPlant2BuyTile.onFullyPaid = () =>
            {
                tomatoPlant2BuyTile.remove(tomatoPlant2BuyTile.label);
                scene.remove(tomatoPlant2BuyTile);

                this.tomatoPlant2 = new TomatoPlant();
                this.tomatoPlant2.position.x = -3;
                this.tomatoPlant2.position.y = -18;
                scene.add(this.tomatoPlant2);

                let tomatoPlant3BuyTile = new BuyableTile(0.3, 0.3, -1, -18, 50, "Buy \"Tomato Plant\"");
                tomatoPlant3BuyTile.onFullyPaid = () =>
                {
                    tomatoPlant3BuyTile.remove(tomatoPlant3BuyTile.label);
                    scene.remove(tomatoPlant3BuyTile);

                    this.tomatoPlant3 = new TomatoPlant();
                    this.tomatoPlant3.position.x = -1;
                    this.tomatoPlant3.position.y = -18;
                    scene.add(this.tomatoPlant3);

                    this.minTimeUntilNextCustomer -= 1;
                    this.maxTimeUntilNextCustomer -= 1;
                };
                scene.add(tomatoPlant3BuyTile);

                this.minTimeUntilNextCustomer -= 1;
                this.maxTimeUntilNextCustomer -= 1;
            };
            scene.add(tomatoPlant2BuyTile);

            let sodaMachineBuyTile = new BuyableTile(0.2, 0.2, 7, 3, 100, "Buy \"Soda Machine\"");
            sodaMachineBuyTile.onFullyPaid = () =>
            {
                const sodaMachine = new SodaMachine(1, 4);
                sodaMachine.position.copy(sodaMachineBuyTile.position);
    
                scene.add(sodaMachine);
                sodaMachineBuyTile.remove(sodaMachineBuyTile.label);
                scene.remove(sodaMachineBuyTile);
                this.containerTiles.push(sodaMachine);

                this.sodaMaker = new SodaMaker();
                this.sodaMaker.position.x = 3;
                this.sodaMaker.position.y = -18;
                this.sodaMaker.addItem(55);
                this.backstockTiles.push(this.sodaMaker);
                scene.add(this.sodaMaker);

                console.log("Bought soda machine.");
            };
            scene.add(sodaMachineBuyTile);

            this.minTimeUntilNextCustomer -= 3;
            this.maxTimeUntilNextCustomer -= 3;
        };
        scene.add(tomatoStandBuyTile);

        tomatoStandBuyTile.onFullyPaid();

        const employee1 = new Employee(this);
        scene.add(employee1);

        this.customers = new Array();
        this.timeUntilNextCustomer = 14;
        this.minTimeUntilNextCustomer = 7;
        this.maxTimeUntilNextCustomer = 20;
        this.maxCustomers  = 20;
        this.timeSinceLastCustomer = this.timeUntilNextCustomer;

        this.lifeSales      = 0;
        this.lifeCustomers  = 0;
        this.lifeReputation = 0;

        this.spawnPosition    = new Vector3(-4, 14, 0);
        this.readyPosition    = new Vector3(-4, 7, 0);
        this.registerPosition = new Vector3(this.register.position.x, this.register.position.y + 2, 0);
    }

    spawnCustomer()
    {
        let customer = new Customer(this);
        customer.position.copy(this.spawnPosition);
        customer.pushAction({type: "move", position: this.readyPosition});

        let atLeastOneTileSelected = false;
        for (const containerTile of this.containerTiles)
        {
            const chance = MathUtility.getRandomInt(0, 100) + 1;

            if (chance > 50)
            {
                const amount = MathUtility.getRandomInt(0, customer.carryLimit) + 1;

                if (amount > customer.carryLimit)
                {
                    console.error(`Amount is greater than carry limit! Amount: ${amount} carryLimit: ${customer.carryLimit}`);
                    return;
                }
                else
                    console.log(`Customer will buy ${amount} from ${containerTile.name}`);

                customer.pushAction({type: "buy", container: containerTile, amount: amount})

                atLeastOneTileSelected = true;
            }
        }

        if (!atLeastOneTileSelected)
            customer.pushAction({
                type: "buy",
                container: this.containerTiles[0],
                amount: MathUtility.getRandomInt(0, customer.carryLimit) + 1
            });
        
        customer.pushAction({type: "move", position: this.registerPosition});
        customer.pushAction({type: "move", position: this.readyPosition});
        customer.pushAction({type: "move", position: this.spawnPosition});
        this.customers.push(customer);
        scene.add(customer);

        this.timeSinceLastCustomer = 0;
        console.log("added customer");

        this.timeUntilNextCustomer = MathUtility.getRandomInt(this.minTimeUntilNextCustomer, this.maxTimeUntilNextCustomer);
        console.log("Next customer will spawn in " + this.timeUntilNextCustomer + " seconds");

        $("#customerCount").text(this.customers.length);
    }

    update(deltaTime)
    {
        if (this.timeSinceLastCustomer > this.timeUntilNextCustomer)
        {
            if (this.containerTiles.length > 0 && this.customers.length < this.maxCustomers)
                this.spawnCustomer();
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

                $("#customerCount").text(this.customers.length);
            }
            else if (customer.waitTime > customer.leaveTime)
            {
                customer.waitTime = 0;

                console.log("Customer waited too long and is leaving.");

                customer.actions.length = 0;

                if (customer.carriedItems.length > 0)
                    customer.pushAction({type: "move", position: this.registerPosition});

                customer.pushAction({type: "move", position: this.readyPosition});
                customer.pushAction({type: "move", position: this.spawnPosition});

                this.lifeReputation -= 1;
            }
        }
    }
}
