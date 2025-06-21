import { BoxGeometry, Vector3, Raycaster, Plane, GridHelper, PointLight, MeshStandardMaterial, TextureLoader, RepeatWrapping, MathUtils } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { PlayerOwnedShop } from "./PlayerOwnedShop.js";

import { SingleSlidingDoor } from "../../entity/tiles/SingleSlidingDoor.js";
import { Register          } from "../../entity/tiles/Register.js";
import { RecycleBin        } from "../../entity/tiles/RecycleBin.js";
import { KetchupMachine    } from "../../entity/tiles/KetchupMachine.js";

import { Entity } from "../../entity/Entity.js";
import { Player } from "../../entity/Player.js";

import { TriggerComponent   } from "../../entity/components/TriggerComponent.js";
import { ContainerComponent } from "../../entity/components/ContainerComponent.js";
import { GeometryComponent  } from "../../entity/components/GeometryComponent.js";
import { GeneratorComponent } from "../../entity/components/GeneratorComponent.js";
import { ModelComponent     } from "../../entity/components/ModelComponent.js";
import { RigidBodyComponent } from "../../entity/components/RigidBodyComponent.js";

import * as GeometryUtil from "../../GeometryUtility.js";

export class SmallShop extends PlayerOwnedShop
{
    constructor()
    {
        super();
        
        this.width  = 12;
        const height = 5;
        this.length = 12;
        this.wallThickness = 1;
        
        const floorTexture = new TextureLoader().load("textures/tile.jpg");
        floorTexture.wrapS = RepeatWrapping;
        floorTexture.wrapT = RepeatWrapping;
        floorTexture.repeat.set(this.width / 2, this.length / 2);
        
        const wallTexture = new TextureLoader().load("textures/brick_wall.png");
        wallTexture.wrapS = RepeatWrapping;
        wallTexture.wrapT = RepeatWrapping;
        wallTexture.repeat.set(this.width / 2, this.length / 4);
        
        const shopFloor = GeometryUtil.createRigidBodyCube(this.width, 1, this.length, { map: floorTexture }, 0);
        shopFloor.position.set(0, -1, 0);
        
        const northWall = GeometryUtil.createRigidBodyCube(this.width, height, this.wallThickness, { map: wallTexture }, 0);
        northWall.position.set(0, height / 2 - 0.5, this.length / 2 + this.wallThickness / 2);
        
        const eastWall = GeometryUtil.createRigidBodyCube(this.wallThickness, height, this.width + this.wallThickness, { map: wallTexture }, 0);
        eastWall.position.set(this.width / 2 + this.wallThickness / 2,  height / 2 - 0.5, this.wallThickness / 2);
        
        const westWall = GeometryUtil.createRigidBodyCube(this.wallThickness, height, this.width + this.wallThickness, { map: wallTexture }, 0);
        westWall.position.set(-this.width / 2 - this.wallThickness / 2, height / 2 - 0.5, this.wallThickness / 2);
        
        this.door = new SingleSlidingDoor(new Vector3(-3, 1.25, northWall.position.z - 0.001), 0x0000ff);
        this.add(this.door);
        
        this.door.addEventListener("startTrigger", (event) =>
        {
            if (event.object instanceof Player)
            {
                if (event.object.interior instanceof PlayerOwnedShop)
                {
                    console.log("Player is exiting shop.");
                    
                    event.object.disableMovement();
                    
                    $("body").fadeOut(1000, () => {
                        event.object.interior = null;
                        event.object.position.copy(this.spawnPosition);
                    });
                }
                else
                {
                    console.log("Player is entering shop.");
                    
                    event.object.disableMovement();
                    
                    $("body").fadeOut(1000, () => {
                        event.object.interior = this;
                        event.object.position.copy(this.readyPosition);
                    });
                }
            }
        });
        
        this.door.addEventListener("stopTrigger", (event) =>
        {
            if (event.object instanceof Player)
            {
                $("body").fadeIn(1000, () => {
                    event.object.enableMovement();
                });
            }
        });
        
        const light = new PointLight(0xffffff, 15, 10);
        light.position.set(0, 3.5, 0);
        light.castShadow = true;
        this.add(light);
        
        this.spawnPosition = new Vector3(this.door.position.x, 0.5, this.door.position.z + 3);
        this.readyPosition = new Vector3(this.door.position.x, 0.5, this.door.position.z - 3);
        this.cameraPosition = new Vector3(0, height * 1.6, -this.width);
        
        const size = 20;
        const divisions = 10;
        this.gridHelper = new GridHelper(size, divisions);
        this.gridHelper.position.y = -0.5;
        
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
        
        this.lifeSales      = 0;
        this.lifeCustomers  = 0;
        this.lifeReputation = 0;
        
        this.allTiles             = [];
        this.containerTiles       = [];
        this.generatorTiles       = [];
        this.registerTiles        = [];
        this.tilesPendingDeletion = [];
        
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
                    
                    model.position.y -= 1;
                    model.scale.set(2.5, 2.5, 2.5);

                    tomatoStand.addEventListener("trigger", (event) =>
                    {
                        if (event.object instanceof Player)
                            tomatoContainer.transferFromCarrier(event.object);
                    });

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
                        new BoxGeometry(1.5, 1, 1.5), 
                        new MeshStandardMaterial({ color: 0xff0000 })
                    )).mesh.position.y -= 0.5;

                    tomatoPlant.addEventListener("trigger", (event) =>
                    {
                        if (event.object instanceof Player)
                            tomatoPlantGenerator.transferToCarrier(event.object);
                    });

                    return tomatoPlant;
                }
            },
            sodaStand: {
                name: "Soda Stand",
                price: 100,
                getTile: () => {
                    const sodaStand = new Entity();
                    sodaStand.name = "sodaStand";

                    const sodaTrigger = sodaStand.addComponent(new TriggerComponent(4, 4, 2));
                    sodaTrigger.triggerGeometry.position.x -= 1;

                    const sodaContainer = sodaStand.addComponent(new ContainerComponent("Soda Stand", "sodaCan"));
                    const model = sodaStand.addComponent(new ModelComponent("tiles/freezers-standing")).model;
                    
                    model.position.x -= 1;
                    model.position.y -= 1;
                    model.scale.set(4, 4, 2);

                    sodaStand.addEventListener("trigger", (event) => {
                        if (event.object instanceof Player)
                            sodaContainer.transferFromCarrier(event.object);
                    });

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
                    
                    model.position.y -= 1;
                    model.scale.set(3, 3, 3);

                    sodaMaker.addEventListener("trigger", (event) => {
                        if (event.object instanceof Player)
                            sodaMachineGenerator.transferToCarrier(event.object);
                    });

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
                    
                    model.position.y -= 1;
                    model.scale.set(2.5, 2.5, 2.5);

                    ketchupStand.addEventListener("trigger", (event) => {
                        if (event.object instanceof Player)
                            ketchupContainer.transferFromCarrier(event.object);
                    });

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
}