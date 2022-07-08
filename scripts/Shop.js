import { Vector3, Quaternion, MeshBasicMaterial, RepeatWrapping, Group } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

import { RigidBodyCube } from "./geometry/RigidBodyCube.js";

import { Door } from "./Door.js";
import { Register } from "./tiles/Register.js";
import { RecycleBin } from "./tiles/RecycleBin.js";
import { BuyableTile } from "./tiles/BuyableTile.js";

import { TomatoPlant } from "./tiles/TomatoPlant.js";
import { TomatoStand } from "./tiles/TomatoStand.js";

import { SodaMachine } from "./tiles/SodaMachine.js";

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
            tomatoStandBuyTile.remove(tomatoStandBuyTile.label);
            scene.remove(tomatoStandBuyTile);
            this.containerTiles.push(tomatoStand);

            let tomatoPlant2BuyTile = new BuyableTile(0.2, 0.2, -8, -14, 100, "Buy \"Tomato Plant\"");
            tomatoPlant2BuyTile.onFullyPaid = () =>
            {
                // create tomatoPlant
                const tomatoPlant2 = new TomatoPlant();
                tomatoPlant2.position.copy(tomatoPlant2BuyTile.position);

                scene.add(tomatoPlant2);
                tomatoPlant2BuyTile.remove(tomatoPlant2BuyTile.label);
                scene.remove(tomatoPlant2BuyTile);
                
                let tomatoPlant3BuyTile = new BuyableTile(0.2, 0.2, -8, -16, 100, "Buy \"Tomato Plant\"");
                tomatoPlant3BuyTile.onFullyPaid = () =>
                {
                    const tomatoPlant3 = new TomatoPlant();
                    tomatoPlant3.position.copy(tomatoPlant3BuyTile.position);

                    scene.add(tomatoPlant3);
                    tomatoPlant3BuyTile.remove(tomatoPlant3BuyTile.label);
                    scene.remove(tomatoPlant3BuyTile);

                    console.log("all tomato plants have been constructed");
                };
                scene.add(tomatoPlant3BuyTile);
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

                console.log("Bought soda machine.");
            };
            scene.add(sodaMachineBuyTile);
        };
        scene.add(tomatoStandBuyTile);

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
        this.maxCustomers  = 20;
        this.timeSinceLastCustomer = this.customerTimer;

        //this.dayLength = 600; // in seconds
        this.dayLength = 60;
        this.dayTimer  = 0;
        this.dayOver = false;

        this.daySales       = 0;
        this.lifeSales      = 0;
        this.dayCustomers   = 0;
        this.lifeCustomers  = 0;
        this.dayReputation  = 0;
        this.lifeReputation = 0;

        this.spawnPosition    = new Vector3(-4, 15, 0);
        this.readyPosition    = new Vector3(-4, 7, 0);
        this.registerPosition = new Vector3(-7.5, -5, 0);

        return this;
    }

    spawnCustomer()
    {
        let customer = new Customer(this);
        customer.position.copy(this.spawnPosition);
        customer.pushAction({type: "move", position: this.readyPosition});

        let atLeastOneTileSelected = false;
        for (const containerTile of this.containerTiles)
        {
            const chance = MathUtility.getRandomInt(100);

            if (chance > 50)
            {
                const amount = MathUtility.getRandomInt(containerTile.maxItems / 2) + 1;

                customer.pushAction({type: "buy", container: containerTile, amount: amount})

                atLeastOneTileSelected = true;
            }
        }

        if (!atLeastOneTileSelected)
            customer.pushAction({type: "buy", container: this.containerTiles[0], amount: MathUtility.getRandomInt(this.containerTiles[0].maxItems / 2) + 1});
        
        customer.pushAction({type: "move", position: this.registerPosition});
        customer.pushAction({type: "move", position: this.readyPosition});
        customer.pushAction({type: "move", position: this.spawnPosition});
        this.customers.push(customer);
        scene.add(customer);

        this.timeSinceLastCustomer = 0;
        console.log("added customer");

        this.customerTimer = MathUtility.getRandomInt(15) + 1;
        console.log("Next customer will spawn in " + this.customerTimer + " seconds");
    }

    startDay()
    {
        console.log("Starting new day.");

        this.dayTimer = 0;

        this.dayCustomers = 0;
        this.daySales     = 0;

        for (const container of this.containerTiles)
        {
            container.dayCustomers = 0;
            container.daySales     = 0;
        }

        this.dayOver = false;

        console.log("Day started.");
    }

    endDay()
    {
        console.log("Ending day.");

        this.dayOver = true;

        $(".endDay > div > .day-stats > .daySales > thead").empty();
        $(".endDay > div > .day-stats > .daySales > tbody").empty();

        $(".endDay > div > .day-stats > .lifeSales > thead").empty();
        $(".endDay > div > .day-stats > .lifeSales > tbody").empty();

        for (const container of this.containerTiles)
        {
            this.lifeSales += this.daySales += container.daySales;
            this.lifeCustomers += this.dayCustomers += container.dayCustomers;

            $(".endDay > div > .day-stats > .daySales > thead").append(`<th>${container.name}</th>`);
            $(".endDay > div > .day-stats > .daySales > tbody").append(`<td>${container.daySales}</td>`);

            $(".endDay > div > .day-stats > .lifeSales > thead").append(`<th>${container.name}</th>`);
            $(".endDay > div > .day-stats > .lifeSales > tbody").append(`<td>${container.lifeSales}</td>`);
        }

        $(".endDay > div > .day-stats > .daySales > thead").prepend("<th>Total</td>");
        $(".endDay > div > .day-stats > .daySales > tbody").prepend(`<th>${this.daySales}</th>`);

        $(".endDay > div > .day-stats > .lifeSales > thead").prepend("<th>Total</td>");
        $(".endDay > div > .day-stats > .lifeSales > tbody").prepend(`<th>${this.lifeSales}</th>`);

        $("#endDay").attr("data-visibility", "shown");

        console.log("Ended day.");
    }
    
    update(deltaTime)
    {
        if (this.dayTimer < this.dayLength)
        {
            if (this.timeSinceLastCustomer > this.customerTimer)
            {
                if (this.containerTiles.length > 0 && this.customers.length < this.maxCustomers)
                    this.spawnCustomer();
            }
            else
                this.timeSinceLastCustomer += deltaTime;

            this.dayTimer += deltaTime;

            $("#dayTime").text(Math.floor(this.dayTimer));
        }
        else // day is over
            if (this.customers.length <= 0)
                this.endDay();

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
