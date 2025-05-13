import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as PageUtility from "../PageUtility.js";

import { Entity } from "../entity/Entity.js";

export class PlayState extends State
{
    init()
    {
        this.clock = new THREE.Clock();
        
        PageUtility.addStyle("game");
        PageUtility.addStyle("interface");
        PageUtility.addStyle("banner");
        PageUtility.addStyle("buyMenu");
        PageUtility.addStyle("pauseMenu");

        // game ui is added in load save state, because player and shop need it when they are constructed

        $("#resetSave").click(() => 
        {
            localStorage.clear();
            window.location.reload();
        });

        $("#hireEmployee").click(() =>
        { 
            shop.addEmployee()
        });

        $(window).contextmenu(function(event)
        {
            event.preventDefault();
            event.stopPropagation();
            return false;
        });

        $(window).keydown((event) =>
        {
            if (event.code == "KeyO")
            {
                player.freeCam = !player.freeCam;
                freeControls.enabled = player.freeCam;
                freeControls.target.copy(player.position);
                freeControls.update();

                console.log("freecam toggled");
            }
            else if (shop.newTile === null)
            {
                if (event.code == "KeyB")
                {
                    if ($("#buyMenu").attr("data-visibility") == "shown")
                        this.closeBuyMenu();
                    else
                        this.openBuyMenu();
                }
                else if (event.code == "Escape")
                {
                    if ($("#buyMenu").attr("data-visibility") == "shown")
                        this.closeBuyMenu();
                    else
                        if ($("#pauseMenu").attr("data-visibility") == "shown")
                            this.closePauseMenu();
                        else
                            this.openPauseMenu();
                }
            }
        });
        
        $("#buyMenuClose").click(() =>
        {
            document.dispatchEvent(new CustomEvent("closeBuyMenu"));
        });
        
        $(document).on("closeBuyMenu", () =>
        {
            this.closeBuyMenu();
        });
        
        /*
        window.onbeforeunload = function(event)
        {
            return 'You will lose unsaved progress, are you sure?';
        };
        */
        
        setInterval(this.saveGame, 3000);
        
        $(renderer.domElement).show();
        $(htmlRenderer.domElement).show();
        
        this.animate();
    }

    cleanup()
    {
        PageUtility.removeStyle("game");
        PageUtility.removeStyle("banner");
        PageUtility.removeStyle("interface");
        PageUtility.removeStyle("buyMenu");
        PageUtility.removeStyle("pauseMenu");

        player.removeEventListeners();

        window.onbeforeunload = null;
    }

    saveGame()
    {
        console.debug("Saving game...");

        $("#saveIcon").show();

        let saveData = {
            version: 1,
            player: {
                money: player.money,
                position: player.position,
                rotation: {
                    x: player.rotation.x,
                    y: player.rotation.y,
                    z: player.rotation.z
                },
                carriedItems: []
            }
        };

        for (const item of player.getComponent("ContainerComponent").carriedItems)
            saveData.player.carriedItems.push({
                type: item.type
            });

        saveData.shop = {
            maxCustomers: shop.maxCustomers,
            timeUntilNextCustomer: shop.timeUntilNextCustomer,
            timeSinceLastCustomer: shop.timeSinceLastCustomer,
            maxTimeUntilNextCustomer: shop.maxTimeUntilNextCustomer,
            minTimeUntilNextCustomer: shop.minTimeUntilNextCustomer,
            customerWaitReputationMultiplier: shop.customerWaitReputationMultiplier,
            lifeSales: shop.lifeSales,
            lifeCustomers: shop.lifeCustomers,
            lifeReputation: shop.lifeReputation,
            
            tiles: []
        };
        
        // TODO: does not save recycle bin tiles. need to find a way to save all tiles and find type later
        
        for (const tile of shop.allTiles)
            saveData.shop.tiles.push(tile.serialise());
        
        function saveNPC(entity)
        {
            const data = {
                position: entity.position,
                rotation: entity.rotation,
                carriedItems: []
            };
    
            const container = entity.getComponent("ContainerComponent");
    
            for (const item of container.carriedItems)
                data.carriedItems.push({
                    type: item.type
                });
            
            return data;
        }
        
        saveData.customers = [];
        
        for (const customer of shop.customers)
            saveData.customers.push(saveNPC(customer));

        saveData.employees = [];

        for (const employee of shop.employees)
            saveData.employees.push(saveNPC(employee));

        localStorage.setItem("shopSave", JSON.stringify(saveData));

        $("#saveIcon").hide();

        console.log("Saved game.");
    }

    openBuyMenu()
    {
        $(".game-menu").attr("data-visibility", "hidden");
        $("#buyMenu").attr("data-visibility", "shown");
        player.disableMovement();
    }

    closeBuyMenu()
    {
        $("#buyMenu").attr("data-visibility", "hidden");
        player.enableMovement();
    }

    openPauseMenu()
    {
        $(".game-menu").attr("data-visibility", "hidden");

        $("#pauseMenu").attr("data-visibility", "shown");
        player.disableMovement();
    }

    closePauseMenu()
    {
        $("#pauseMenu").attr("data-visibility", "hidden");
        player.enableMovement();
    }

    physicsStep(deltaTime)
    {
        physicsWorld.stepSimulation(deltaTime, 10);

        for (const object of physicsBodies)
        {
            object.motionState.getWorldTransform(tmpTransform);

            const pos = tmpTransform.getOrigin();
            const quat = tmpTransform.getRotation();
            const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
            const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
            
            object.parentEntity.position.copy(pos3);
            object.parentEntity.quaternion.copy(quat3);
        }
    }
    
    animate()
    {
        const deltaTime = this.clock.getDelta();

        scene.traverse((object) =>
        {
            // TODO: this is a really ugly hack, but it prevents
            // anything from being triggered during the first 3 frames of the game
            // giving the oriented bounding boxes time to update into their proper positions.
            if (this.clock.getElapsedTime() > 2)
                // if the object is a trigger, check if any geometry boxes are within it
                if (object instanceof Entity && object.hasComponent("TriggerComponent"))
                {
                    const triggerComponent = object.getComponent("TriggerComponent");

                    scene.children.forEach((object2) =>
                    {
                        if (object2 == object ||
                            object2.dontTrigger ||
                            object2.parentEntity == object ||
                            object.parentEntity == object2)
                            return;

                        if (object2 instanceof Entity && object2.hasComponent("GeometryComponent"))
                        {
                            const geometryComponent = object2.getComponent("GeometryComponent");

                            if (triggerComponent.triggerGeometry.userData.obb.intersectsOBB(geometryComponent.mesh.userData.obb))
                                triggerComponent.triggeringEntities.push(object2);
                        }
                    });
                }

            if ("update" in object)
                object.update(deltaTime);
        });

        this.physicsStep(deltaTime);

        /*
        if (mixer)
            mixer.update(deltaTime);
        */
        
        composer.render();
        htmlRenderer.render(scene, camera);

        requestAnimationFrame(() => this.animate());
    };
}