import { Vector3, Quaternion, Group } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

import { RigidBodyCube } from "./geometry/RigidBodyCube.js";

import { Door        } from "./Door.js";
import { Register    } from "./tiles/Register.js";
import { RecycleBin  } from "./tiles/RecycleBin.js";
import { BuyableTile } from "./tiles/BuyableTile.js";

import { Customer } from "./Customer.js";

import { TomatoJuicer } from "./tiles/TomatoJuicer.js";
import { TomatoPlant  } from "./tiles/TomatoPlant.js";
import { SodaGenerator    } from "./tiles/SodaGenerator.js";

import { SodaMachine } from "./tiles/SodaMachine.js";
import { Employee    } from "./Employee.js";
import { ContainerTile } from "./tiles/ContainerTile.js";

export class Shop extends Group
{
    constructor(shopData)
    {
        super();

        const shopWidth  = 20;
        const shopLength = 20;
        const wallThickness = 1;
        
        const shopFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength, wallThickness), 0xE0E0E0, new Vector3(0, 0, -1), new Quaternion(), 0);

        scene.add(shopFloor);

        // shop north wall
        scene.add(GeometryUtil.createCube(new Vector3(shopLength, wallThickness, 4), new Vector3(0, shopWidth / 2 - wallThickness / 2 + 1, 1.5), 0xbfbfbf));
        // west wall
        scene.add(GeometryUtil.createCube(new Vector3(wallThickness, shopWidth, 4), new Vector3(shopWidth / 2 - wallThickness / 2 + 1, 0, 1.5), 0xbfbfbf));
        // east wall
        scene.add(GeometryUtil.createCube(new Vector3(wallThickness, shopWidth, 4), new Vector3(-shopWidth / 2 - wallThickness / 2, 0, 1.5), 0xbfbfbf));
        
        const backroomFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength / 2, wallThickness), 0x878787, new Vector3(0, -15, -1), new Quaternion(), 0);
        scene.add(backroomFloor);

        this.doors = new Door(new Vector3(-4, 10.491, 0.5), 0x0000ff);
        scene.add(this.doors);

        this.containerTiles = new Array();
        this.generatorTiles = new Array();
        
        this.register = new Register();
        this.register.position.x = -8;
        this.register.position.y = -7;
        for (let i = 0; i < shopData.money * 4; i++)
            this.register.addMoney();
        scene.add(this.register);
        
        let tomatoStandBuyTile = new BuyableTile(1, 1, 7, 7, 100, "Buy \"Tomato Stand\"");
        tomatoStandBuyTile.onFullyPaid = () =>
        {
            const tomatoStand = new ContainerTile(1, 1, 2, 2, 0x4d220b);
            tomatoStand.name = "tomatoStand";
            tomatoStand.itemType = "tomato";
            tomatoStand.position.x = 1;
            tomatoStand.position.y = 4;
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
                this.generatorTiles.push(this.tomatoPlant2);
                scene.add(this.tomatoPlant2);

                let tomatoPlant3BuyTile = new BuyableTile(0.3, 0.3, -1, -18, 50, "Buy \"Tomato Plant\"");
                tomatoPlant3BuyTile.onFullyPaid = () =>
                {
                    tomatoPlant3BuyTile.remove(tomatoPlant3BuyTile.label);
                    scene.remove(tomatoPlant3BuyTile);

                    this.tomatoPlant3 = new TomatoPlant();
                    this.tomatoPlant3.position.x = -1;
                    this.tomatoPlant3.position.y = -18;
                    this.generatorTiles.push(this.tomatoPlant3);
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

                this.sodaGenerator = new SodaGenerator();
                this.sodaGenerator.position.x = 3;
                this.sodaGenerator.position.y = -18;
                this.generatorTiles.push(this.sodaGenerator);
                scene.add(this.sodaGenerator);

                console.log("Bought soda machine.");

                let tomatoJuicerBuyTile = new BuyableTile(3.5, 1, 7, -18, 100, "Buy \"Tomato Juicer\"");
                tomatoJuicerBuyTile.onFullyPaid = () =>
                {
                    tomatoJuicerBuyTile.remove(tomatoJuicerBuyTile.label);
                    scene.remove(tomatoJuicerBuyTile);

                    this.tomatoJuicer = new TomatoJuicer(7, -18);
                    this.generatorTiles.push(this.tomatoJuicer.generator);
                    scene.add(this.tomatoJuicer);
                    
                    this.tomatoJuiceStand = new ContainerTile(1, 1, 2, 2, 0xa12b45);
                    this.tomatoJuiceStand.name = "tomatoJuiceStand";
                    this.tomatoJuiceStand.itemType = "tomatoJuice";
                    this.tomatoJuiceStand.position.x = 7;
                    this.tomatoJuiceStand.position.y = -1;
                    // TODO: figure out a way to get the employee to stock the juicer container
                    this.containerTiles.push(this.tomatoJuiceStand);
                    scene.add(this.tomatoJuiceStand);

                    this.minTimeUntilNextCustomer -= 1;
                    this.maxTimeUntilNextCustomer -= 1;
                };
                scene.add(tomatoJuicerBuyTile);

                // TODO: remove these for real gameplay
                //tomatoJuicerBuyTile.onFullyPaid();

                console.log("Unlocked TomatoJuicer buy tile");
            };
            scene.add(sodaMachineBuyTile);

            // TODO: remove these for real gameplay
            //sodaMachineBuyTile.onFullyPaid();

            this.minTimeUntilNextCustomer -= 3;
            this.maxTimeUntilNextCustomer -= 3;
        };
        scene.add(tomatoStandBuyTile);

        // TODO: remove these for real gameplay
        //tomatoStandBuyTile.onFullyPaid();
        
        this.employees = new Array();
        this.customers = new Array();

        this.maxCustomers                     = shopData.maxCustomers;
        this.timeUntilNextCustomer            = shopData.timeUntilNextCustomer;
        this.timeSinceLastCustomer            = shopData.timeSinceLastCustomer;
        this.maxTimeUntilNextCustomer         = shopData.maxTimeUntilNextCustomer;
        this.minTimeUntilNextCustomer         = shopData.minTimeUntilNextCustomer;
        this.customerWaitReputationMultiplier = 0.1;

        this.lifeSales                        = shopData.lifeSales;
        this.lifeCustomers                    = shopData.lifeCustomers;
        this.lifeReputation                   = shopData.lifeReputation;

        this.spawnPosition    = new Vector3(-4, 14, 0);
        this.readyPosition    = new Vector3(-4, 7, 0);
        this.registerPosition = new Vector3(this.register.position.x, this.register.position.y + 2, 0);
    }

    updateReputation(amount)
    {
        this.lifeReputation += amount;

        $("#reputation").text(this.lifeReputation);
    }

    addCustomer(customer)
    {
        this.customers.push(customer);

        $("#customerCount").text(this.customers.length);

        console.log("added customer");
    }

    spawnCustomer()
    {
        let customer = new Customer(this);
        scene.add(customer);
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
        customer.pushAction({type: "waitToCheckout" });
        //customer.pushAction({type: "move", position: this.readyPosition});
        //customer.pushAction({type: "move", position: this.spawnPosition});

        this.addCustomer(customer);
    }

    update(deltaTime)
    {
        if (this.timeSinceLastCustomer > this.timeUntilNextCustomer)
        {
            if (this.containerTiles.length > 0 && this.customers.length < this.maxCustomers)
            {
                this.spawnCustomer();

                this.timeSinceLastCustomer = 0;
                console.log("added customer");
        
                this.timeUntilNextCustomer = MathUtility.getRandomInt(this.minTimeUntilNextCustomer, this.maxTimeUntilNextCustomer);

                //this.timeUntilNextCustomer += this.customerWaitReputationMultiplier * this.lifeReputation;

                if (this.timeUntilNextCustomer > this.maxTimeUntilNextCustomer)
                    this.timeUntilNextCustomer = this.maxTimeUntilNextCustomer;
                
                console.log("Next customer will spawn in " + this.timeUntilNextCustomer + " seconds");
            }
        }
        else
            this.timeSinceLastCustomer += deltaTime;

        for (const customer of this.customers)
        {
            // if the customer has no actions
            // TODO: make sure the customer actually made it to the register
            if (customer.actions.length <= 0)
            {
                for (const carriedItem of customer.carriedItems)
                    scene.remove(carriedItem);

                this.updateReputation(customer.mood);

                this.customers.splice(this.customers.indexOf(customer), 1);
                scene.remove(customer);

                $("#customerCount").text(this.customers.length);
            }
            // if the customer does have actions
            else if (customer.waitTime > customer.leaveTime)
            {
                customer.waitTime = 0;

                console.log("Customer waited too long and is leaving.");

                customer.actions.length = 0;

                if (customer.carriedItems.length > 0)
                    customer.pushAction({type: "move", position: this.registerPosition});

                customer.pushAction({type: "move", position: this.readyPosition});
                customer.pushAction({type: "move", position: this.spawnPosition});
            }
        }
    }
}
