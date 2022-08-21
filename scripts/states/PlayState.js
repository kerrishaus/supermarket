import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as MathUtility from "../MathUtility.js";
import * as PageUtility from "../PageUtility.js";

import { Triggerable } from "../geometry/Triggerable.js";

export class PlayState extends State
{
    init()
    {
        PageUtility.addStyle("game");
        PageUtility.addStyle("banner");
        PageUtility.addStyle("interface");
        PageUtility.addStyle("buyMenu");

        $(document.body).append(`<div id='interface' class="gameInterfaceContainer">
        <div class='banner'>
            <div>
                $<span id='money'>0</span>
            </div>
            <div>
                rep <span id='reputation'>0</span>
            </div>
            <div>
                customers <span id="customerCount">0</span>
            </div>

            <div>
                <a id="upgradesButton">Upgrades</a>
            </div>

            <div>
                <a id="settingsButton">Settings</a>
            </div>
        </div>
        
        <div class='buttons'>
            <div class='upgrades'>
                
            </div>
        </div>
    </div>`);

        //$(document.body).append(`<div id="buyMenu" class="display-flex flex-wrap flex-gap" data-visiblity="hidden"></div>`);

        this.MoveType = {
            Mouse: 'Mouse',
            Touch: 'Touch',
            Keyboard: 'Keyboard'
        };

        this.move = null;
        this.keys = new Array();
        this.pointerMoveOrigin = new THREE.Vector2();
        this.moving = false;
        this.pointerMove = false;
        this.freeCam = false;
        
        this.moveTarget = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 8), new THREE.MeshPhongMaterial({ color: 0x00ffff, 
                                                                                                             flatShading: true,
                                                                                                             transparent: true,
                                                                                                             opacity: 0.7,
                                                                                                            }));

        scene.add(this.moveTarget);                                                                                                            
        
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 0.5), 0);

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.intersects = new THREE.Vector3();
        
        this.clock = new THREE.Clock();

        window.oncontextmenu = (event) =>
        {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };

        window.addEventListener("mousemove", (event) =>
        {
            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        });
        
        window.addEventListener("touchmove", (event) =>
        {
            this.mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
        });

        window.addEventListener("touchstart", (event) =>
        {
            this.pointerMoveOrigin.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
            this.pointerMoveOrigin.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;

            this.move = this.MoveType.Touch;
        });
        
        window.addEventListener("mousedown", (event) =>
        {
            this.pointerMoveOrigin.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.pointerMoveOrigin.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            this.move = this.MoveType.Mouse;
        });

        $(window).on('mouseup touchend', (event) =>
        {
            this.move = null;
        });

        window.addEventListener("keydown", (event) =>
        {
            this.keys[event.code] = true;

            if (event.code == "KeyO")
            {
                this.freeCam = !this.freeCam;
                freeControls.enabled = this.freeCam;

                camera.position.z = 10;
                camera.position.y = -12;
                camera.lookAt(new THREE.Vector3(0, 0, 0));

                console.log("freecam toggled");
            }
            else
            {
                switch (event.code)
                {
                    case "KeyB":
                        if ($("#buyMenu").attr("data-visiblity") == "shown")
                            $("#buyMenu").attr("data-visiblity", "hidden");
                        else
                            $("#buyMenu").attr("data-visiblity", "shown");
                        break;
                    case "KeyW":
                    case "ArrowUp":
                    case "KeyA":
                    case "ArrowLeft":
                    case "KeyS":
                    case "ArrowDown":
                    case "KeyD":
                    case "ArrowRight":
                        break; // remove this when keyboard movement is allowed
                        this.move = MoveType.Keyboard;
                        this.moveTarget.quaternion.copy(player.quaternion);
                        break;
                };
            }
        });
        
        window.addEventListener("keyup", (event) =>
        {
            this.keys[event.code] = false;

            return; // remove this when keyboard movement is allowed

            if (!(this.keys["KeyW"] || this.keys["ArrowUp"] ||
                  this.keys["KeyA"] || this.keys["ArrowLeft"] ||
                  this.keys["KeyS"] || this.keys["ArrowDown"] ||
                  this.keys["KeyD"] || this.keys["ArrowRight"]))
                  this.move = null;
        });

        window.onbeforeunload = function(event)
        {
            return 'You will lose unsaved progress, are you sure?';
        };

        console.log("PlayState is ready.");

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

        window.onbeforeunload = null;

        console.log("Cleaned up PlayState.");
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

                console.log({manifoldIndex: i, contactIndex: j, distance: distance});
            }
        }
    }
    
    animate()
    {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        if (!this.freeCam && this.move !== null)
        {
            let position = new THREE.Vector2(), target = new THREE.Vector2();
            let velocity = 0;

            if (this.move == this.MoveType.Touch)
            {
                position = this.pointerMoveOrigin;
                target = this.mouse;

                velocity = this.pointerMoveOrigin.distanceTo(new THREE.Vector3(this.mouse.x, this.mouse.y)) / 2;
            }
            else
            {
                if (this.move == this.MoveType.Keyboard)
                {
                    const moveAmount = player.maxSpeed;

                    if (this.keys["KeyW"] || this.keys["ArrowUp"])
                        this.moveTarget.translateY(moveAmount);
                    if (this.keys["KeyA"] || this.keys["ArrowLeft"])
                        this.moveTarget.translateX(-moveAmount);
                    if (this.keys["KeyS"] || this.keys["ArrowDown"])
                        this.moveTarget.translateY(-moveAmount);
                    if (this.keys["KeyD"] || this.keys["ArrowRight"])
                        this.moveTarget.translateX(moveAmount);

                    this.moveTarget.quaternion.copy(player.quaternion);
                }
                else if (this.move == this.MoveType.Mouse)
                {
                    this.raycaster.setFromCamera(this.mouse, camera);
                    this.raycaster.ray.intersectPlane(this.plane, this.intersects);
                    this.moveTarget.position.copy(this.intersects);
                }

                position.x = player.position.x;
                position.y = player.position.y

                target.x = this.moveTarget.position.x;
                target.y = this.moveTarget.position.y;

                velocity = player.position.distanceTo(this.moveTarget.position) / 20;
            }

            // set the player's direction
            //player.rotation.z = Math.atan2(y2 - y1, x2 - x1) - 1.5708;
            player.rotation.z = MathUtility.angleToPoint(position, target);

            // clamp the player's velocity
            velocity = MathUtility.clamp(velocity, 0, player.maxSpeed);

            // move the player their direction
            player.translateY(velocity);
        }

        if (!this.freeCam)
        {
            // TODO: put the camera in Player
            camera.position.x = player.position.x;
            camera.position.y = player.position.y - 6;
            camera.lookAt(player.position);
        }

        scene.children.forEach((object) =>
        {
            if ('update' in object)
                object.update(deltaTime);

            if (object instanceof Triggerable)
            {
                if (player.box.intersectsBox(object.trigger))
                    object.onTrigger(player);
                else if (object.triggeringObjects.includes(player))
                    object.onStopTrigger(player);

                for (const customer of shop.customers)
                {
                    // customer intersects with Triggerable's trigger
                    if (object.trigger.intersectsBox(customer.box))
                    {
                        // object is not currently triggered by the customer
                        if (!object.triggeringObjects.includes(customer))
                            object.onTrigger(customer);
                    }
                    // customer is not intersecting with this trigger
                    else
                    {
                        // if this trigger is triggered by the customer, stop triggering
                        if (object.triggeringObjects.includes(customer))
                            object.onStopTrigger(customer);
                    }
                }
            }
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