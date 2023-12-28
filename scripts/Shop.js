import { BoxGeometry, Vector3, Vector2, Raycaster, Plane, GridHelper, Group, PlaneGeometry, MeshStandardMaterial, Mesh, FrontSide } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

import { Door           } from "./Door.js";
import { Register       } from "./tiles/Register.js";
import { RecycleBin     } from "./tiles/RecycleBin.js";
import { KetchupMachine } from "./tiles/KetchupMachine.js";

import { Tomato  } from "./items/Tomato.js";
import { SodaCan } from "./items/SodaCan.js";

import { Player   } from "./Player.js";
import { Employee } from "./Employee.js";
import { Customer } from "./Customer.js";

import { Entity } from "./entity/Entity.js";
import { TriggerComponent } from "./entity/components/TriggerComponent.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";
import { GeneratorComponent } from "./entity/components/GeneratorComponent.js";

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
        this.gridHelper = new GridHelper(size, divisions);
        this.gridHelper.rotation.x = 1.5708;
        this.gridHelper.position.z = -0.5;

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
        const northWall = GeometryUtil.createCube(new Vector3(shopLength, wallThickness, 4), new Vector3(0, shopWidth / 2 - wallThickness / 2 + 1, 1.5), 0xbfbfbf);
        scene.add(northWall);

        // west wall
        //scene.add(GeometryUtil.createCube(new Vector3(wallThickness, shopWidth, 4), new Vector3(shopWidth / 2 - wallThickness / 2 + 1, 0, 1.5), 0xbfbfbf));
        // east wall
        //scene.add(GeometryUtil.createCube(new Vector3(wallThickness, shopWidth, 4), new Vector3(-shopWidth / 2 - wallThickness / 2, 0, 1.5), 0xbfbfbf));
        
        //const backroomFloor = new RigidBodyCube(new Vector3(shopWidth, shopLength / 2, wallThickness), 0x878787, new Vector3(0, -15, -1), new Quaternion(), 0);
        //scene.add(backroomFloor);

        this.doors = new Door(new Vector3(-4.1, northWall.position.y - 0.001, 1.25), 0x0000ff);
        scene.add(this.doors);

        this.containerTiles = new Array();
        this.generatorTiles = new Array();
        this.registerTiles  = new Array();

        this.availableTiles = {
            cashRegister: {
                name: "Cash Register",
                price: 0,
                tile: null,
                getTile: () => {
                    const register = new Register();
                    register.getComponent("TriggerComponent").triggerEnabled = false;
                    this.registerTiles.push(register);
                    return register;
                },
                onAfterPlace: function() {
                    for (let i = 0; i < 100; i++)
                        this.tile.addMoney();
                }
            },
            recycleBin: {
                name: "Recycle Bin",
                price: 25,
                getTile: () => {
                    const recycleBin = new RecycleBin();
                    recycleBin.getComponent("TriggerComponent").triggerEnabled = false;
                    return recycleBin;
                }
            },
            tomatoStand: {
                name: "Tomato Stand",
                price: 50,
                getTile: function() {
                    const tomatoStand     = new Entity();
                    const tomatoTrigger   = tomatoStand.addComponent(new TriggerComponent);
                    tomatoTrigger.triggerEnabled = false;

                    const tomatoContainer = tomatoStand.addComponent(new ContainerComponent("Tomato Stand", "tomato"));
                    tomatoStand.addComponent(new GeometryComponent(
                        new BoxGeometry(1.5, 1.5, 1), 
                        new MeshStandardMaterial({ color: 0xff0000 })
                    )).mesh.position.z -= 0.5;

                    tomatoStand.onTrigger = (object) => {
                        if (object instanceof Player)
                            tomatoContainer.transferFromCarrier(object);
                    }

                    return tomatoStand;
                }
            },
            tomatoPlant: {
                name: "Tomato Plant",
                price: 25,
                getTile: () => {
                    const tomatoPlant          = new Entity();
                    const tomatoPlantTrigger   = tomatoPlant.addComponent(new TriggerComponent);
                    tomatoPlantTrigger.triggerEnabled = false;

                    const tomatoPlantGenerator = tomatoPlant.addComponent(new GeneratorComponent("Tomato Plant", "tomato"));
                    tomatoPlant.addComponent(new GeometryComponent(
                        new BoxGeometry(1.5, 1.5, 1), 
                        new MeshStandardMaterial({ color: 0xff0000 })
                    )).mesh.position.z -= 0.5;

                    tomatoPlantGenerator.createItem = () => { 
                        return new Tomato(tomatoPlant.position);
                    }

                    tomatoPlant.onTrigger = (object) => {
                        if (object instanceof Player)
                            tomatoPlantGenerator.transferToCarrier(object);
                    }

                    return tomatoPlant;
                }
            },
            sodaStand: {
                name: "Soda Stand",
                price: 100,
                getTile: () => {
                    const sodaStand     = new Entity();
                    const sodaTrigger   = sodaStand.addComponent(new TriggerComponent);
                    sodaTrigger.triggerEnabled = false;

                    const sodaContainer = sodaStand.addComponent(new ContainerComponent("Soda Stand", "sodaCan"));
                    sodaStand.addComponent(new GeometryComponent(
                        new BoxGeometry(1.5, 1.5, 1), 
                        new MeshStandardMaterial({ color: 0xff0000 })
                    )).mesh.position.z -= 0.5;

                    sodaStand.onTrigger = (object) => {
                        if (object instanceof Player)
                            sodaContainer.transferFromCarrier(object);
                    }

                    return sodaStand;
                }
            },
            sodaMaker: {
                name: "Soda Maker",
                price: 125,
                getTile: () => {
                    const sodaMaker        = new Entity();
                    const sodaMakerTrigger = sodaMaker.addComponent(new TriggerComponent);
                    sodaMakerTrigger.triggerEnabled = false;

                    const sodaMachineGenerator = sodaMaker.addComponent(new GeneratorComponent("Soda Maker", "sodaCan"));
                    sodaMaker.addComponent(new GeometryComponent(
                        new BoxGeometry(1, 1, 2), 
                        new MeshStandardMaterial({ color: 0xff0000 })
                    ))

                    sodaMachineGenerator.createItem = () => { 
                        return new SodaCan(sodaMaker.position);
                    }

                    sodaMaker.onTrigger = (object) => {
                        if (object instanceof Player)
                            sodaMachineGenerator.transferToCarrier(object);
                    }

                    return sodaMaker;
                }
            },
            ketchupStand: {
                name: "Ketchup Stand",
                price: 150,
                getTile: () => {
                    const ketchupStand   = new Entity();
                    const ketchupTrigger = ketchupStand.addComponent(new TriggerComponent);
                    ketchupTrigger.triggerEnabled = false;

                    const ketchupContainer = ketchupStand.addComponent(new ContainerComponent("Ketchup Stand", "ketchup"));
                    ketchupStand.addComponent(new GeometryComponent(
                        new BoxGeometry(1.5, 1.5, 1), 
                        new MeshStandardMaterial({ color: 0xff0000 })
                    )).mesh.position.z -= 0.5;

                    ketchupStand.onTrigger = (object) => {
                        if (object instanceof Player)
                            ketchupContainer.transferFromCarrier(object);
                    }

                    return ketchupStand;
                }
            },
            ketchupMachine: {
                name: "Ketchup Machine",
                price: 200,
                getTile: () => {
                    const ketchupMachine = new KetchupMachine();
                    ketchupMachine.getComponent("TriggerComponent").triggerEnabled = false;
                    return ketchupMachine;
                }
            },
            /*
            door: {
                name: "Door",
                getTile: () => {

                }
            },
            */
        };

        this.mousePos          = new Vector2(0, 0);
        this.mouseWorldPos     = new Vector3();
        this.intersectionPos   = new Vector3();
        this.intersectionPlane = new Plane(shopFloor.position, 0);
        this.raycaster         = new Raycaster();

        for (const [tileName, tile] of Object.entries(this.availableTiles))
        //for (const tile of this.availableTiles)
        {
            const tileContainer = $("<div class='tile'>").appendTo("#tiles");
            tileContainer.append(`<div class='tile-name'>${tile.name}</div>`);

            const tileBottomBar = $(`
                <div class='tile-bottom-bar'>
                    <div class='tile-price'>$${tile.price}</div>
                </div>
            `).appendTo(tileContainer);

            $("<button class='tile-buy'>Buy</button>").appendTo(tileBottomBar).click(() => 
            {
                this.beginTilePlacement(tile);
            });

            console.log("added tile to buy menu");
        }
        
        this.employees = new Array();
        this.customers = new Array();

        this.maxCustomers                     = 20;
        this.timeUntilNextCustomer            = 14;
        this.timeSinceLastCustomer            = 0;
        this.maxTimeUntilNextCustomer         = 20;
        this.minTimeUntilNextCustomer         = 7;
        this.customerWaitReputationMultiplier = 0.1;

        this.lifeSales                        = 0;
        this.lifeCustomers                    = 0;
        this.lifeReputation                   = 0;

        this.spawnPosition    = new Vector3(-4, 14, 0.5);
        this.readyPosition    = new Vector3(-4, 7, 0.5);
    }

    beginTilePlacement(tile)
    {
        if (player.money < tile.price)
        {
            console.log("Not enough money!");
            return;
        }

        document.dispatchEvent(new CustomEvent("closeBuyMenu"));

        if (this.newTile?.tile instanceof Entity)
            this.cancelTilePlacement();

        this.newTile = tile;
        this.newTile.tile = tile.getTile();

        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Tried to start tile placement process for " + tile.name + " but was not provided with a proper tile Entity.");
            return;
        }

        // have to re-disable player movement because it gets re-enabled when the buy menu is closed
        player.disableMovement();

        scene.add(this.gridHelper);

        $("#interface").append("<div id='newTileMouseCatcher' class='mouse-catcher mouse-pass-through'>");

        // TODO: support touch
        $("#newTileMouseCatcher").on("mousemove", (event) => { this.updateTilePlacement(event); });

        $("#newTileMouseCatcher").on("mousedown", (event) => 
        {
            if (event.button == 0)
                this.confirmTilePlacement();
            else if (event.button == 2)
                this.cancelTilePlacement();
        });

        $("#newTileMouseCatcher").keydown((event) => 
        {
            console.log(event);

            if (event.code == "KeyR")
                this.newTile.tile.rotateX(Math.PI / 2);
            else if (event.code == "Escape")
                this.cancelTilePlacement();
        });

        // TODO: run this once before adding the tile to the scene
        // so that the tile is in the correct mouse position instead of starting
        // in the center of the map
        //this.updateTilePlacement();

        scene.add(this.newTile.tile);

        console.log("Started placement of entity", this.newTile);
    }

    updateTilePlacement(event)
    {
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Trying to update tile placement, but newTile is invalid!", this.newTile);
            return false;
        }

        this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePos.y = - (event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mousePos, camera);
        this.raycaster.ray.intersectPlane(this.intersectionPlane, this.intersectionPos);

        const tileCoordinates = new Vector2(
            Math.floor(this.intersectionPos.x / 2) * 2 + 1,
            Math.floor(this.intersectionPos.y / 2) * 2 + 1,
        );

        this.newTile.tile.position.set(tileCoordinates.x, tileCoordinates.y, 0.5);
    }

    cancelTilePlacement()
    {
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Trying to finish tile placement, but newTile is invalid!", this.newTile);
            this.finallyTilePlacement();
            return false;
        }

        this.newTile.tile.destructor();

        this.finallyTilePlacement();
    }

    confirmTilePlacement()
    {
        // tile must be an instanceof Entity, or something went wrong.
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Trying to finish tile placement, but newTile is invalid!", this.newTile);
            this.finallyTilePlacement();
            return false;
        }

        // TODO: a more elegant fix for this
        if (!(this.newTile.tile instanceof RecycleBin))
        {
            // the ketchup container is used to hold items until they are turned into ketchup
            if (!(this.newTile.tile instanceof KetchupMachine))
                if (this.newTile.tile.hasComponent("ContainerComponent"))
                    this.containerTiles.push(this.newTile.tile);

            if (this.newTile.tile.hasComponent("GeneratorComponent"))
                this.generatorTiles.push(this.newTile.tile);
        }

        this.newTile.tile.getComponent("TriggerComponent").triggerEnabled = true;

        this.newTile.onAfterPlace?.();

        player.takeMoney(this.newTile.price);

        // create a copy of the tile position instead of
        // of referring to it in the loop, because
        // during the timeout it will get deleted
        const pos = this.newTile.tile.position.clone();
        
        // create a money prop for each dollar of the tile price
        // and have it fly from the player into the prop, then despawn
        for (let i = 0; i < this.newTile.price; i++)
        {
            setTimeout(() => {
                const money = GeometryUtil.createMoney();

                money.position.copy(player.position);
                money.getComponent("CarryableComponent").setTarget(pos, new Vector3(0, 0, 0));
                
                scene.add(money);
                player.carriedMoney.push(money);
            }, 5 * i);
        }

        this.finallyTilePlacement();
    }
    
    finallyTilePlacement()
    {
        this.newTile = null;

        player.enableMovement();

        // TODO: this is not properly disposed of
        scene.remove(this.gridHelper);

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
        customer.startPosition.copy(this.spawnPosition);
        customer.targetPosition.copy(this.spawnPosition);
        customer.position.copy(this.spawnPosition);
        customer.pushAction({ type: "move", position: this.readyPosition, debug: "to ready position" });

        let atLeastOneTileSelected = false;
        for (const containerTile of this.containerTiles)
        {
            const chance = MathUtility.getRandomInt(0, 100) + 1;

            if (chance > 50)
            {
                const amount = MathUtility.getRandomInt(0, customer.getComponent("ContainerComponent").maxItems) + 1;

                if (amount > customer.getComponent("ContainerComponent").maxItems)
                {
                    console.error(`Amount is greater than carry limit! Amount: ${amount} maxItems: ${customer.getComponent("ContainerComponent").maxItems}`);
                    return;
                }
                else
                    console.log(`Customer will buy ${amount} from ${containerTile.name}`);

                customer.pushAction({type: "buy", container: containerTile, amount: amount, debug: "buy from " + containerTile.type })

                atLeastOneTileSelected = true;
            }
        }

        if (!atLeastOneTileSelected)
            customer.pushAction({
                type: "buy",
                container: this.containerTiles[0],
                amount: MathUtility.getRandomInt(0, customer.getComponent("ContainerComponent").maxItems) + 1,
                debug: "buying (from only one) container " + this.containerTiles[0].type
            });
        
        customer.pushAction({ type: "move", position: customer.findNearestRegister().position, debug: "to register" });
        customer.pushAction({ type: "waitToCheckout", debug: "waiting to checkout" });

        this.addCustomer(customer);
        scene.add(customer);
    }

    addEmployee(employee = null)
    {
        if (employee == null)
        {
            employee = new Employee(this);
            scene.add(employee);
        }

        this.employees.push(employee);

        $("#employees").prepend("<div class='employee' data-employeeId='" + employee.uuid + "'>");

        console.log("added employee to shop");

        return employee;
    }

    update(deltaTime)
    {
        if (this.timeSinceLastCustomer > this.timeUntilNextCustomer)
        {
            if (this.registerTiles.length > 0 && this.containerTiles.length > 0 && this.customers.length < this.maxCustomers)
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
            if (customer.actions.length <= 0 && customer.checkedOut)
            {
                this.updateReputation(customer.mood);

                customer.destructor();
                this.customers.splice(this.customers.indexOf(customer), 1);

                $("#customerCount").text(this.customers.length);
            }
        }
    }
}
