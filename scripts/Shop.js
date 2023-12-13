import { Vector3, Vector2, Raycaster, Plane, GridHelper, Group, PlaneGeometry, MeshStandardMaterial, Mesh, FrontSide } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

import { RigidBodyCube } from "./geometry/RigidBodyCube.js";

import { Door        } from "./Door.js";
import { Register    } from "./tiles/Register.js";
import { RecycleBin  } from "./tiles/RecycleBin.js";
import { BuyableTile } from "./tiles/BuyableTile.js";

import { Customer } from "./Customer.js";

import { KetchupGenerator } from "./tiles/KetchupGenerator.js";
import { TomatoPlant  } from "./tiles/TomatoPlant.js";
import { SodaGenerator    } from "./tiles/SodaGenerator.js";

import { SodaMachine } from "./tiles/SodaMachine.js";
import { Employee    } from "./Employee.js";
import { ContainerTile } from "./tiles/ContainerTile.js";

import { Entity } from "./entity/Entity.js";
import { TriggerComponent } from "./entity/components/TriggerComponent.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";

export class Shop extends Group
{
    constructor()
    {
        super();

        const shopWidth  = 20;
        const shopLength = 20;
        const wallThickness = 1;
        
        //const shopFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength, wallThickness), 0xE0E0E0, new Vector3(0, 0, -1), new Quaternion(), 0);

        const size = 20;
        const divisions = 10;
        const gridHelper = new GridHelper(size, divisions);
        gridHelper.rotation.x = 1.5708;
        gridHelper.position.z = -0.5;
        scene.add(gridHelper)

        const shopFloor = new Mesh(
            new PlaneGeometry(shopWidth, shopLength),
            new MeshStandardMaterial({ color: 0xE0E0E0, side: FrontSide })
        );
        shopFloor.castShadow = true;
        shopFloor.receiveShadow = true;
        shopFloor.position.set(0, 0, -0.5);
        scene.add(shopFloor);

        const backroomFloor = new Mesh(
            new PlaneGeometry(shopWidth, shopLength / 2),
            new MeshStandardMaterial({ color: 0x878787, side: FrontSide })
        );
        backroomFloor.castShadow = true;
        backroomFloor.receiveShadow = true;
        backroomFloor.position.set(0, -15, -0.5);
        scene.add(backroomFloor);

        // shop north wall
        scene.add(GeometryUtil.createCube(new Vector3(shopLength, wallThickness, 4), new Vector3(0, shopWidth / 2 - wallThickness / 2 + 1, 1.5), 0xbfbfbf));
        // west wall
        //scene.add(GeometryUtil.createCube(new Vector3(wallThickness, shopWidth, 4), new Vector3(shopWidth / 2 - wallThickness / 2 + 1, 0, 1.5), 0xbfbfbf));
        // east wall
        //scene.add(GeometryUtil.createCube(new Vector3(wallThickness, shopWidth, 4), new Vector3(-shopWidth / 2 - wallThickness / 2, 0, 1.5), 0xbfbfbf));
        
        //const backroomFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength / 2, wallThickness), 0x878787, new Vector3(0, -15, -1), new Quaternion(), 0);
        //scene.add(backroomFloor);

        this.doors = new Door(new Vector3(-4, 10.491, 0.5), 0x0000ff);
        scene.add(this.doors);

        this.containerTiles = new Array();
        this.generatorTiles = new Array();

        this.availableTiles = [
            {
                name: "Cash Register",
                getTile: () => {

                }
            },
            {
                name: "Tomato Stand",
                price: 100,
                getTile: () => {
                    const tomatoStand = new Entity();
                    const tomatoTrigger   = tomatoStand.addComponent(new TriggerComponent);
                    const tomatoContainer = tomatoStand.addComponent(new ContainerComponent);

                    scene.add(tomatoStand);
                    return tomatoStand;
                }
            },
            {
                name: "Tomato Plant",
                getTile: () => {

                }
            },
            {
                name: "Ketchup Stand",
                getTile: () => {

                }
            },
            {
                name: "Ketchup Machine",
                getTile: () => {

                }
            },
            {
                name: "Soda Maker",
                getTile: () => {

                }
            },
            {
                name: "Soda Stand",
                getTile: () => {

                }
            },
            {
                name: "Door",
                getTile: () => {

                }
            },
        ];

        this.mousePos          = new Vector2(0, 0);
        this.mouseWorldPos     = new Vector3();
        this.intersectionPos   = new Vector3();
        this.intersectionPlane = new Plane(new Vector3(0, 0, 0.5), 0);
        this.raycaster         = new Raycaster();

        for (const tile of this.availableTiles)
        {
            const tileContainer = $("<div class='tile'>").appendTo("#tiles");
            tileContainer.append(`<div class='tile-name'>${tile.name}</div>`);
            tileContainer.append(`<div class='tile-price'>$${tile.price}</div>`);

            const buyTileButton = $("<button class='tile-buy'>buy</button>").appendTo(tileContainer).click(() => 
            {
                this.beginTilePlacement(tile);
            });

            console.log("added tile to buy menu");
        }
        
        /*
        this.register = new Register();
        this.register.position.x = -8;
        this.register.position.y = -7;
        for (let i = 0; i < shopData.money * 4; i++)
            this.register.addMoney();
        scene.add(this.register);
        */
        
        /*
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

                let KetchupGeneratorBuyTile = new BuyableTile(3.5, 1, 7, -18, 100, "Buy \"Ketchup Machine\"");
                KetchupGeneratorBuyTile.onFullyPaid = () =>
                {
                    KetchupGeneratorBuyTile.remove(KetchupGeneratorBuyTile.label);
                    scene.remove(KetchupGeneratorBuyTile);

                    this.KetchupGenerator = new KetchupGenerator(7, -18);
                    this.generatorTiles.push(this.KetchupGenerator.generator);
                    scene.add(this.KetchupGenerator);
                    
                    this.ketchupStand = new ContainerTile(1, 1, 2, 2, 0xa12b45);
                    this.ketchupStand.name = "ketchupStand";
                    this.ketchupStand.itemType = "ketchup";
                    this.ketchupStand.position.x = 7;
                    this.ketchupStand.position.y = -1;
                    // TODO: figure out a way to get the employee to stock the ketchup container
                    this.containerTiles.push(this.ketchupStand);
                    scene.add(this.ketchupStand);

                    this.minTimeUntilNextCustomer -= 1;
                    this.maxTimeUntilNextCustomer -= 1;
                };
                scene.add(KetchupGeneratorBuyTile);

                // TODO: remove these for real gameplay
                //KetchupGeneratorBuyTile.onFullyPaid();

                console.log("Unlocked KetchupGenerator buy tile");
            };
            scene.add(sodaMachineBuyTile);

            // TODO: remove these for real gameplay
            //sodaMachineBuyTile.onFullyPaid();

            this.minTimeUntilNextCustomer -= 3;
            this.maxTimeUntilNextCustomer -= 3;
        };
        scene.add(tomatoStandBuyTile);

        let employeeBuyTile = new BuyableTile(1, 1, -12, -15, 100, "Hire Employee");
        employeeBuyTile.onFullyPaid = () =>
        {
            employeeBuyTile.pricePaid = 0;
            this.addEmployee();
        };
        scene.add(employeeBuyTile);
        */

        // TODO: remove these for real gameplay
        //tomatoStandBuyTile.onFullyPaid();
        
        this.employees = new Array();
        this.customers = new Array();

        /*
        this.maxCustomers                     = shopData.maxCustomers;
        this.timeUntilNextCustomer            = shopData.timeUntilNextCustomer;
        this.timeSinceLastCustomer            = shopData.timeSinceLastCustomer;
        this.maxTimeUntilNextCustomer         = shopData.maxTimeUntilNextCustomer;
        this.minTimeUntilNextCustomer         = shopData.minTimeUntilNextCustomer;
        this.customerWaitReputationMultiplier = 0.1;

        this.lifeSales                        = shopData.lifeSales;
        this.lifeCustomers                    = shopData.lifeCustomers;
        this.lifeReputation                   = shopData.lifeReputation;
        */

        this.spawnPosition    = new Vector3(-4, 14, 0);
        this.readyPosition    = new Vector3(-4, 7, 0);
        
        //this.registerPosition = new Vector3(this.register.position.x, this.register.position.y + 2, 0);
    }

    beginTilePlacement(tile)
    {
        document.dispatchEvent(new CustomEvent("closeBuyMenu"));

        if (this.newTile instanceof Entity)
            this.cancelTilePlacement();

        this.newTile = tile.getTile();

        if (!(this.newTile instanceof Entity))
        {
            console.error("Tried to start tile placement process for " + tile.name + " but was not provided with a proper tile Entity.");
            return;
        }

        player.disableMovement();

        $("#interface").append("<div id='newTileMouseCatcher' class='mouse-catcher mouse-pass-through'>");

        // TODO: support touch
        $("#newTileMouseCatcher").on("mousemove", (event) => { this.updateTilePlacement(event) });
        $("#newTileMouseCatcher").on("mousedown", () => { this.confirmTilePlacement() });
        // TODO: press escape to cancel tile placement

        console.log("Started placement of entity", this.newTile);
    }

    updateTilePlacement(event)
    {
        if (!(this.newTile instanceof Entity))
        {
            console.error("Trying to update tile placement, but newTile is invalid!", this.newTile);
            return false;
        }

        this.mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.raycaster.setFromCamera(this.mousePos, camera);
        this.raycaster.ray.intersectPlane(this.intersectionPlane, this.intersectionPos);

        const tileCoordinates = new Vector2(
            Math.floor(this.intersectionPos.x),
            Math.floor(this.intersectionPos.y),
        );

        if (!(tileCoordinates.x % 2))
            tileCoordinates.x += 1;

        if (!(tileCoordinates.y % 2))
            tileCoordinates.y += 1;

        console.log(tileCoordinates);

        this.newTile.position.set(tileCoordinates.x, tileCoordinates.y, 0.5);
    }

    cancelTilePlacement()
    {
        if (!(this.newTile instanceof Entity))
        {
            console.error("Trying to finish tile placement, but newTile is invalid!", this.newTile);
            this.finallyTilePlacement();
            return false;
        }

        scene.remove(this.newTile);

        this.finallyTilePlacement();
    }

    confirmTilePlacement()
    {
        if (!(this.newTile instanceof Entity))
        {
            console.error("Trying to finish tile placement, but newTile is invalid!", this.newTile);
            this.finallyTilePlacement();
            return false;
        }

        if (this.newTile.hasComponent("ContainerComponent"))
            this.containerTiles.push(this.newTile);

        if (this.newTile.hasComponent("GeneratorComponent"))
            this.generatorTiles.push(this.newTile);

        this.finallyTilePlacement();
    }
    
    finallyTilePlacement()
    {
        this.newTile = null;

        player.enableMovement();

        $("#newTileMouseCatcher").remove();

        console.log("Tile placement is finished.");
    }

    updateReputation(amount)
    {
        this.lifeReputation += amount;

        $("#reputation").text(this.lifeReputation);
    }

    // used to re-add saved customers to the scene
    addCustomer(customer)
    {
        this.customers.push(customer);

        $("#customerCount").text(this.customers.length);

        console.log("added customer");
    }

    // creates a new customer and gives them actions
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

    addEmployee(employee = null)
    {
        if (employee == null)
        {
            employee = new Employee(this);
            scene.add(employee);
        }

        this.employees.push(employee);

        $("#employees").prepend("<div class='employee'>");

        console.log("added employee to shop");

        return employee;
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
                    carriedItem.destructor();

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
