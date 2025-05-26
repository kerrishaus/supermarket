import { BoxGeometry, Vector3, Vector2, Raycaster, Plane, GridHelper, Group, PlaneGeometry, PointLight, MeshStandardMaterial, Mesh, FrontSide, Quaternion, TextureLoader, RepeatWrapping } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { SingleSlidingDoor } from "./tiles/SingleSlidingDoor.js";
import { Register          } from "./tiles/Register.js";
import { RecycleBin        } from "./tiles/RecycleBin.js";
import { KetchupMachine    } from "./tiles/KetchupMachine.js";

import { Player   } from "./Player.js";
import { Employee } from "./Employee.js";
import { Customer } from "./Customer.js";

import { Entity } from "./entity/Entity.js";

import { TriggerComponent } from "./entity/components/TriggerComponent.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";
import { GeneratorComponent } from "./entity/components/GeneratorComponent.js";
import { ModelComponent } from "./entity/components/ModelComponent.js";
import { RigidBodyComponent } from "./entity/components/RigidBodyComponent.js";

import * as GeometryUtil from "./GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

export class Shop extends Group
{
    constructor()
    {
        super();
        
        const shopWidth  = 12;
        const shopLength = 12;
        const wallHeight = 4;
        const wallThickness = 1;
        
        const floorTexture = new TextureLoader().load("textures/tile.jpg");
        floorTexture.wrapS = RepeatWrapping;
        floorTexture.wrapT = RepeatWrapping;
        floorTexture.repeat.set(shopWidth / 2, shopLength / 2);
        
        const shopFloor = new Entity();
        shopFloor.addComponent(new RigidBodyComponent(
            new BoxGeometry(shopWidth, shopLength, 1),
            new MeshStandardMaterial({ map: floorTexture }),
            0
        ));
        shopFloor.position.copy(new Vector3(0, 0, -1));
        shopFloor.dontTrigger = true;
        scene.add(shopFloor);
        
        const backroomFloor = GeometryUtil.createRigidBodyCube(shopWidth, shopLength / 2, 1, { color: 0x878787 }, 0);
        backroomFloor.position.set(0, ((shopLength / 2) + ((shopLength / 2) / 2)) * -1, -1);
        backroomFloor.dontTrigger = true;
        scene.add(backroomFloor);
        
        const northWall = GeometryUtil.createRigidBodyCube(shopWidth, wallThickness, wallHeight, { color: 0xbfbfbf }, 0);
        northWall.position.set(0, shopLength / 2 - wallThickness / 2 + 1, 1.5);
        scene.add(northWall);
        
        const westWall = GeometryUtil.createRigidBodyCube(wallThickness, shopWidth + 1, wallHeight, { color: 0xbfbfbf }, 0);
        westWall.position.set(shopWidth / 2 - wallThickness / 2 + 1, 0 + 0.5, 1.5);
        scene.add(westWall);
        
        const eastWall = GeometryUtil.createRigidBodyCube(wallThickness, shopWidth + 1, wallHeight, { color: 0xbfbfbf }, 0);
        eastWall.position.set(-shopWidth / 2 - wallThickness / 2, 0 + 0.5, 1.5);
        scene.add(eastWall);
        
        this.door = new SingleSlidingDoor(new Vector3(-1, northWall.position.y - 0.001, 1.25), 0x0000ff);
        scene.add(this.door);
        
        const light = new PointLight(0xffffff, 0.5);
        light.position.set(0, 0, 5);
        light.castShadow = true
        scene.add(light);
        
        this.spawnPosition = new Vector3(this.door.position.x, this.door.position.y + 4, 0.5);
        this.readyPosition = new Vector3(this.door.position.x, this.door.position.y - 3, 0.5);
        
        const size = 20;
        const divisions = 10;
        this.gridHelper = new GridHelper(size, divisions);
        this.gridHelper.rotation.x = 1.5708;
        this.gridHelper.position.z = -0.5;
        
        this.mousePos          = new Vector2(0, 0);
        this.mouseWorldPos     = new Vector3();
        this.intersectionPos   = new Vector3();
        this.intersectionPlane = new Plane(shopFloor.position, 0);
        this.raycaster         = new Raycaster();
        
        this.newTile = null;
        this.inDeletionMode = false;
        
        this.employees = [];
        this.customers = [];
        
        this.maxCustomers                     = 20;
        this.timeUntilNextCustomer            = 14;
        this.timeSinceLastCustomer            = 0;
        this.maxTimeUntilNextCustomer         = 20;
        this.minTimeUntilNextCustomer         = 7;
        this.customerWaitReputationMultiplier = 0.1;
        
        this.lifeSales                        = 0;
        this.lifeCustomers                    = 0;
        this.lifeReputation                   = 0;
        
        this.allTiles       = [];
        this.containerTiles = [];
        this.generatorTiles = [];
        this.registerTiles  = [];
        
        this.availableTiles = {
            register: {
                name: "Cash Register",
                price: 0,
                tile: null,
                getTile: () => {
                    return new Register();
                },
            },
            recycleBin: {
                name: "Recycle Bin",
                price: 25,
                getTile: () => {
                    return new RecycleBin();
                }
            },
            tomatoStand: {
                name: "Tomato Stand",
                price: 50,
                getTile: function() {
                    const tomatoStand = new Entity();
                    tomatoStand.name = "tomatoStand";

                    tomatoStand.addComponent(new TriggerComponent);

                    const tomatoContainer = tomatoStand.addComponent(new ContainerComponent("Tomato Stand", "tomato"));
                    const model = tomatoStand.addComponent(new ModelComponent("tiles/shelf-boxes")).model;
                    
                    model.position.z -= 1;
                    model.scale.set(2.5, 2.5, 2.5);

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
                    const tomatoPlant = new Entity();
                    tomatoPlant.name = "tomatoPlant";

                    tomatoPlant.addComponent(new TriggerComponent);

                    const tomatoPlantGenerator = tomatoPlant.addComponent(new GeneratorComponent("Tomato Plant", "tomato"));
                    tomatoPlant.addComponent(new GeometryComponent(
                        new BoxGeometry(1.5, 1.5, 1), 
                        new MeshStandardMaterial({ color: 0xff0000 })
                    )).mesh.position.z -= 0.5;

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
                    const sodaStand = new Entity();
                    sodaStand.name = "sodaStand";

                    const sodaTrigger = sodaStand.addComponent(new TriggerComponent(4, 2, 4));
                    sodaTrigger.triggerGeometry.position.x -= 1;

                    const sodaContainer = sodaStand.addComponent(new ContainerComponent("Soda Stand", "sodaCan"));
                    const model = sodaStand.addComponent(new ModelComponent("tiles/freezers-standing")).model;
                    
                    model.position.z -= 1;
                    model.position.x -= 1;
                    model.scale.set(4, 4, 2);

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
                    const sodaMaker = new Entity();
                    sodaMaker.name = "sodaMaker";

                    sodaMaker.addComponent(new TriggerComponent);

                    const sodaMachineGenerator = sodaMaker.addComponent(new GeneratorComponent("Soda Maker", "sodaCan"));
                    sodaMachineGenerator.itemLength = 4;
                    
                    const model = sodaMaker.addComponent(new ModelComponent("tiles/bottle-return")).model;
                    
                    model.position.z -= 1;
                    model.scale.set(3, 3, 3);

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
                    const ketchupStand = new Entity();
                    ketchupStand.name = "ketchupStand";

                    ketchupStand.addComponent(new TriggerComponent);

                    const ketchupContainer = ketchupStand.addComponent(new ContainerComponent("Ketchup Stand", "ketchup"));
                    const model = ketchupStand.addComponent(new ModelComponent("tiles/shelf-boxes")).model;
                    
                    model.position.z -= 1;
                    model.scale.set(2.5, 2.5, 2.5);

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
                    return new KetchupMachine();
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
        
        this.populateTilesInBuyMenu();
        
        $(window).mousemove(this.mousemove);
    }

    populateTilesInBuyMenu()
    {
        $("#tiles").empty();

        for (const [tileName, tile] of Object.entries(this.availableTiles))
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
    }
    
    mousemove()
    {
        shop.raycaster.setFromCamera(screenMousePosition, camera);
    }

    keydownDuringTilePlacement(event)
    {
        if (event.code == "KeyR")
            shop.newTile.tile.rotateZ(Math.PI / 2);
        else if (event.code == "Escape")
            shop.cancelTilePlacement();
    }

    // TODO: support touch
    // https://stackoverflow.com/a/69023543/6745382 use pointermove instead of touch/mouse move
    mousemoveDuringTilePlacement(event)
    {
        shop.updateTilePlacement();
    }
    
    mousedownDuringTilePlacement(event)
    {
        if (event.button == 0)
            shop.confirmTilePlacement();
        else if (event.button == 2) // right click to cancel
            shop.cancelTilePlacement();
    }
    
    beginTilePlacement(tile)
    {
        if (player.money < tile.price)
        {
            console.error("Not enough money!");
            return false;
        }
        
        document.dispatchEvent(new CustomEvent("closeBuyMenu"));
        player.disableMovement(); // buy menu closing re-enables player movement
        
        if (this.newTile?.tile instanceof Entity)
            this.cancelTilePlacement();
        
        this.newTile = tile;
        this.newTile.tile = tile.getTile();
        
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Tried to start tile placement process for " + tile.name + " but was not provided with a proper tile Entity.");
            return;
        }
        
        if (this.newTile.tile.hasComponent("TriggerComponent"))
        {
            this.newTile.originalTriggerState = this.newTile.tile.getComponent("TriggerComponent").triggerEnabled;
            this.newTile.tile.getComponent("TriggerComponent").triggerEnabled = false;
        }
            
        if (this.newTile.tile.hasComponent("GeneratorComponent"))
        {
            this.newTile.generatorState = this.newTile.tile.getComponent("GeneratorComponent").noAutomaticGeneration;
            this.newTile.tile.getComponent("GeneratorComponent").noAutomaticGeneration = true;
        }
        
        scene.add(this.gridHelper);
        
        // TODO: have these buttons move up and down as the keys are pressed
        $("#interface").append(`<div id='newTileOverlay' class='mouse-pass-through'>
            <div>
                <span><kbd>Escape</kbd>&nbsp;or&nbsp;<kbd>Right-Click</kbd>&nbsp;Cancel</span>
                <br/>
                <br/>
                <span><kbd>R</kbd>&nbsp;Rotate 90 degrees</span>
                <br/>
                <br/>
                <span><kbd>Left-Click</kbd>&nbsp;Confirm</span>
            </div>
        </div>`);
        
        // TODO: there is a better way to do this, but right now I can't figure it out.
        // Need to get events but can't use this. in the event, have to use shop.
        // So these are global. There is an ugly line that checks if shop.tile is null in Playtate
        // that I also don't like, but who cares as long as the player can do what they want, right?
        $(window).keydown(this.keydownDuringTilePlacement);
        $(window).mousemove(this.mousemoveDuringTilePlacement);
        $(window).mousedown(this.mousedownDuringTilePlacement);
        
        this.updateTilePlacement();
        
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
        
        // TODO: check if placement intersects with any other objets, set invalid flag if so
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
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Trying to finish tile placement, but newTile is invalid!", this.newTile);
            this.finallyTilePlacement();
            return false;
        }
        
        this.allTiles.push(this.newTile.tile);
        
        if (this.newTile.tile.hasComponent("ContainerComponent"))
            this.containerTiles.push(this.newTile.tile);
        
        if (this.newTile.tile.hasComponent("GeneratorComponent"))
            this.generatorTiles.push(this.newTile.tile);
            
        if (this.newTile.tile instanceof Register)
            this.registerTiles.push(this.newTile.tile);
        
        if (this.newTile.tile.hasComponent("TriggerComponent"))
            this.newTile.tile.getComponent("TriggerComponent").triggerEnabled = this.newTile.originalTriggerState;
            
        if (this.newTile.tile.hasComponent("GeneratorComponent"))
            this.newTile.tile.getComponent("GeneratorComponent").noAutomaticGeneration = this.newTile.generatorState;

        this.newTile.onAfterPlace?.();

        player.takeMoney(this.newTile.price);

        // create a copy of the tile position instead of
        // of referring to it in the loop, because
        // during the timeout it will get deleted
        const pos = this.newTile.tile.position.clone();
        
        // create a money prop for each dollar of the tile price
        // and have it fly from the player into the prop
        for (let i = 0; i < this.newTile.price; i++)
        {
            setTimeout(() => {
                const money = GeometryUtil.createMoney();

                money.position.copy(player.position);
                money.getComponent("CarryableComponent").setTarget(pos, new Vector3(0, 0, 0));
                
                scene.add(money);
                
                // player's update function deletes carried money when it's done moving
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

        $(window).off("keydown",   this.keydownDuringTilePlacement);
        $(window).off("mousemove", this.mousemoveDuringTilePlacement);
        $(window).off("mousedown", this.mousedownDuringTilePlacement);

        $("#newTileOverlay").remove();

        console.log("Tile placement is finished.");
    }
    
    keydownDuringDeletion(event)
    {
        if (event.code == "Escape")
            shop.stopDeletionMode();
    }
    
    mousemoveDuringDeletion(event)
    {
        // TODO: highlight hovered items
    }
    
    mousedownDuringDeletion(event)
    {
        if (event.button == 0)
        {
            const intersects = shop.raycaster.intersectObjects(shop.allTiles);
            
            for (let i = 0; i < intersects.length; i ++)
            {
                let object = intersects[i].object;
                
                // need to get the parent of the object,
                // because raycaster picks up the GeometryComponent's
                // object and not the actual Entity object.
                if (!("parent" in object))
                    continue;
                
                object = object.parent;
                
                // for now, don't allow a tile to be deleted if an employee is using it.
                if (object.handledByEmployee)
                {
                    console.warn("Tile is being handled by an employee, will not delete.");
                    break;
                }
                
                const index = shop.allTiles.indexOf(object);
                const containersIndex = shop.containerTiles.indexOf(object);
                const generatorsIndex = shop.generatorTiles.indexOf(object);
                const registersIndex  = shop.registerTiles.indexOf(object);
                
                // for some dumbass god damn reason, any number in JS
                // other than 0 or NaN evaluates to true!!! STUPID!!
                // also, 0 is a valid index
                if (index != -1)
                {
                    shop.allTiles.splice(index, 1);
                    shop.containerTiles.splice(containersIndex, 1);
                    shop.generatorTiles.splice(generatorsIndex, 1);
                    shop.registerTiles.splice(registersIndex, 1);
                    
                    player.addMoney(shop.availableTiles[object.name].price / 2);
                    
                    object.destructor();
                    
                    break;
                }
            }
        }
        else if (event.button == 2) // right click to cancel
            shop.stopDeletionMode();
    }
    
    startDeletionMode()
    {
        this.inDeletionMode = true;
        
        document.dispatchEvent(new CustomEvent("closeBuyMenu"));
        player.disableMovement(); // closeBuyMenu enables player movement
        
        $(window).keydown(this.keydownDuringDeletion);
        $(window).mousemove(this.mousemoveDuringDeletion);
        $(window).mousedown(this.mousedownDuringDeletion);
        
        scene.add(this.gridHelper);
        
        $("#interface").append(`<div id="deletionModeOverlay" class="mouse-pass-through">
            <div>
                <span><kbd>Escape</kbd>&nbsp;or&nbsp;<kbd>Right-Click</kbd>&nbsp;Cancel</span>
                <br/>
                <br/>
                <span><kbd>Left-Click</kbd>&nbsp;Confirm</span>
            </div>
        </div>`);
        
        this.tileDeletionTarget = null;
    }
    
    stopDeletionMode()
    {
        player.enableMovement();
        
        $(window).off("keydown", this.keydownDuringDeletion);
        $(window).off("mousemove", this.mousemoveDuringDeletion);
        $(window).off("mousedown", this.mousedownDuringDeletion);
        
        scene.remove(this.gridHelper);
        
        delete this.tileDeletionTarget;
        
        $("#deletionModeOverlay").remove();
        
        this.inDeletionMode = false;
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
                
                customer.buyFromContainer(containerTile, amount);
                
                atLeastOneTileSelected = true;
            }
        }
        
        if (!atLeastOneTileSelected)
        {
            console.debug("No tiles were selected, using first shop container tile.");
            customer.buyFromContainer(this.containerTiles[0], MathUtility.getRandomInt(0, customer.getComponent("ContainerComponent").maxItems) + 1);
        }
        
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
        
        $("#employees").prepend(`<div class="employee" data-employeeId="${employee.uuid}"><button class="fire-employee">Fire</button></div>`);
        
        console.log("added employee to shop");
        
        return employee;
    }

    fireEmployee(uuid)
    {
        for (const index in this.employees)
        {
            const employee = this.employees[index];

            if (employee.uuid == uuid)
            {
                this.employees.splice(this.employees.indexOf(index), 1);
                employee.destructor();
                console.log("Fired employee.", uuid);
                return true;
            }
        }

        console.error("Failed to find requested employee to fire.", uuid);
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
                
                // TODO: make customers come faster 
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
            // if the customer has no actions, delete them.
            if (customer.actions.length <= 0)
            {
                this.updateReputation(customer.mood);
                
                this.customers.splice(this.customers.indexOf(customer), 1);
                $("#customerCount").text(this.customers.length);
                
                customer.destructor();
            }
        }
        
        // TODO: optimise this
        let waitingCustomerCount = 0;
        
        for (const register of this.registerTiles)
            waitingCustomerCount += register.waitingCustomers.length;
        
        $("#waitingCustomers").text(waitingCustomerCount);
    }
}