import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as MathUtility from "../MathUtility.js";
import * as PageUtility from "../PageUtility.js";

import { Entity } from "../entity/Entity.js";

export class PlayState extends State
{
    init()
    {
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

        this.clock = new THREE.Clock();

        window.oncontextmenu = (event) =>
        {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };

        $("#hireEmployee").click(() => { shop.addEmployee() });

        window.addEventListener("keydown", (event) =>
        {
            if (event.code == "KeyO")
            {
                this.freeCam = !this.freeCam;
                freeControls.enabled = this.freeCam;
                freeControls.target.copy(player.position);
                freeControls.update();

                camera.position.z = 10;
                camera.position.y = -12;
                camera.lookAt(new THREE.Vector3(0, 0, 0));

                console.log("freecam toggled");
            }
            else if (event.code == "KeyB")
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
        });

        $("#buyMenuClose").click(() =>
        {
            this.closeBuyMenu();
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

        for (const tile of shop.containerTiles)
            saveData.shop.tiles.push({
                type: tile.name,
                position: tile.position
            });

        for (const tile of shop.generatorTiles)
            saveData.shop.tiles.push({
                type: tile.name,
                position: tile.position
            });

        for (const tile of shop.registerTiles)
            saveData.shop.tiles.push({
                type: tile.name,
                position: tile.position
            });

        saveData.customers = [];

        for (const customer of shop.customers)
            saveData.customers.push({
                position: customer.position,
                rotation: customer.rotation
            });

        saveData.employees = [];

        for (const employee of shop.employees)
            saveData.employees.push({
                position: employee.position,
                rotation: employee.rotation
            });

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
            
            object.position.copy(pos3);
            object.quaternion.copy(quat3);
        }

        detectCollision();
    }

    detectCollision()
    {
        let dispatcher = physicsWorld.getDispatcher();
        let numManifolds = dispatcher.getNumManifolds();

        for ( let i = 0; i < numManifolds; i ++ )
        {
            let contactManifold = dispatcher.getManifoldByIndexInternal( i );
            let numContacts = contactManifold.getNumContacts();

            for ( let j = 0; j < numContacts; j++ )
            {
                let contactPoint = contactManifold.getContactPoint( j );
                let distance = contactPoint.getDistance();

                if (distance > 0.0)
                    continue;

                //console.log({manifoldIndex: i, contactIndex: j, distance: distance});
            }
        }
    }
    
    animate()
    {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        if (!this.freeCam && player.move !== null)
        {
            let position = new THREE.Vector2(), target = new THREE.Vector2();
            let velocity = 0;

            if (player.move == player.MoveType.Touch)
            {
                position = player.pointerMoveOrigin;
                target = player.mouse;

                velocity = player.pointerMoveOrigin.distanceTo(new THREE.Vector3(player.mouse.x, player.mouse.y)) / 2;
            }
            else
            {
                if (player.move == player.MoveType.Keyboard)
                {
                    const moveAmount = player.maxSpeed;

                    if (player.keys["KeyW"] || player.keys["ArrowUp"])
                        player.moveTarget.translateY(moveAmount);
                    if (player.keys["KeyA"] || player.keys["ArrowLeft"])
                        player.moveTarget.translateX(-moveAmount);
                    if (player.keys["KeyS"] || player.keys["ArrowDown"])
                        player.moveTarget.translateY(-moveAmount);
                    if (player.keys["KeyD"] || player.keys["ArrowRight"])
                        player.moveTarget.translateX(moveAmount);

                    player.moveTarget.quaternion.copy(player.quaternion);
                }
                else if (player.move == player.MoveType.Mouse)
                {
                    player.raycaster.setFromCamera(player.mouse, camera);
                    player.raycaster.ray.intersectPlane(player.plane, player.intersects);
                    player.moveTarget.position.copy(player.intersects);
                }

                position.x = player.position.x;
                position.y = player.position.y

                target.x = player.moveTarget.position.x;
                target.y = player.moveTarget.position.y;

                velocity = player.position.distanceTo(player.moveTarget.position) / 20;
            }

            // set the player's direction
            //player.rotation.z = Math.atan2(y2 - y1, x2 - x1) - 1.5708;
            player.rotation.z = MathUtility.angleToPoint(position, target);

            // clamp the player's velocity
            velocity = MathUtility.clamp(velocity, 0, player.maxSpeed);

            // move the player their direction
            player.translateY(velocity);

            // TODO: do this in Shop class maybe
            shop.gridHelper.position.x = Math.floor(player.position.x / 2) * 2;
            shop.gridHelper.position.y = Math.floor(player.position.y / 2) * 2;
        }

        if (!this.freeCam)
        {
            // TODO: put the camera in Player
            camera.position.x = player.position.x;
            camera.position.y = player.position.y - 6;
            camera.lookAt(player.position);
        }

        scene.traverse((object) =>
        {
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

            if ('update' in object)
                object.update(deltaTime);
        });

        //physicsStep(deltaTime);

        if (this.freeCam)
            freeControls.update();

            /*
        if (mixer)
            mixer.update(deltaTime);
            */
        
        composer.render();
        htmlRenderer.render(scene, camera);
    };
}