import * as THREE from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { OrbitControls } from "https://kerrishaus.com/assets/threejs/r177/examples/jsm/controls/OrbitControls.js";

import { Entity } from "./Entity.js";
import { Vehicle } from "./Vehicle.js";

import { ContainerComponent } from "./components/ContainerComponent.js";
import { RigidBodyComponent } from "./components/RigidBodyComponent.js";

import * as GeometryUtil from "../GeometryUtility.js";

export class Player extends Entity
{
    constructor()
    {
        super();
        
        this.money = 0;
        this.carriedMoney = new Array();
        this.addComponent(new ContainerComponent());
        
        this.phys = this.addComponent(new RigidBodyComponent(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshStandardMaterial({ color: 0x0000aa }),
            80
        ));
        
        this.phys.setPosition(new THREE.Vector3(0, 0.5, 0));
        
        const nose = GeometryUtil.createScaledCube(0.4, 0.2, 0.5, 0x0000aa);
        nose.position.y = 0.75;
        nose.position.z = 0.75;
        this.add(nose);
        
        this.controlsEnabled = true;
        
        this.maxVelocity = 0.15;
        
        this.MoveType = {
            Mouse: "Mouse",
            Touch: "Touch",
            Keyboard: "Keyboard"
        };

        this.move = null;
        this.keys = [];
        this.pointerMoveOrigin = new THREE.Vector2();
        
        this.moveTarget = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 24, 8), 
            new THREE.MeshPhongMaterial({ 
                color: 0x00ffff, 
                flatShading: true,
                transparent: true,
                opacity: 0.7,
            })
        );
        
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0.5, 0), 0);
        
        this.mouse      = new THREE.Vector2();
        this.raycaster  = new THREE.Raycaster();
        this.intersects = new THREE.Vector3();
        
        this.freeControls = new OrbitControls(camera, renderer.domElement);
        this.freeControls.target.set(0, 0, 0);
        this.freeControls.update();
        this.freeControls.enabled = false;
        
        this.interior = null;
        
        this.currentCameraPosition = new THREE.Vector3();
        this.currentCameraAngle    = new THREE.Vector3();
        
        this.vehicle = null;
        
        /*
        this.interactionHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, 0.5),
            2,
            0xFF0000
        );
        this.add(this.interactionHelper);
        */
    }
    
    update(deltaTime)
    {
        // we fell through the map :(
        if (this.position.y < -0.5)
        {
            /*
            player.raycaster.set(player.position, new THREE.Vector3(0, 1, 0));
            
            const objects = player.raycaster.intersectObjects(scene.children, true);
            
            const arrow = new THREE.ArrowHelper(player.raycaster.ray.direction, player.raycaster.ray.origin, 6, 0xff0000);
            scene.add(arrow);
            
            setTimeout(() => {
                scene.remove(arrow);
            }, 10000);
        
            if (objects.length > 0)
            {
                for (const object of objects)
                {
                    this.position.copy(object.object.position);
                    break;
                }
            }
            else
            */
                this.position.set(0, 3, 0);
            
            console.warn("Player fell out of the world!");
        }
        
        if (!this.freeControls.enabled)
        {
            if (this.move !== null)
            {
                if (this.move == this.MoveType.Keyboard)
                {
                    this.phys.body.activate();
                    
                    if (this.interior == null)
                    {
                        if (this.keys["KeyA"] || this.keys["ArrowLeft"])
                            this.rotateY(Math.PI / 40);
                        if (this.keys["KeyD"] || this.keys["ArrowRight"])
                            this.rotateY(-Math.PI / 40);
                        
                        if (this.keys["KeyW"] || this.keys["ArrowUp"])
                        {
                            /*
                            const direction = new THREE.Vector3(0, 0, 1);
                            direction.applyQuaternion(this.quaternion);
                            direction.multiplyScalar(48);
                            this.phys.body.applyImpulse(new Ammo.btVector3(direction.x, direction.y, direction.z));
                            */
                            
                            this.translateZ(this.maxVelocity);
                        }
                        
                        if (this.keys["KeyS"] || this.keys["ArrowDown"])
                        {
                            /*
                            const direction = new THREE.Vector3(0, 0, -1);
                            direction.applyQuaternion(this.quaternion);
                            direction.multiplyScalar(48);
                            this.phys.body.applyImpulse(new Ammo.btVector3(direction.x, direction.y, direction.z));
                            */
                            
                            this.translateZ(-this.maxVelocity);
                        }
                    }
                    else
                    {
                        if (this.keys["KeyW"] || this.keys["ArrowUp"])
                            this.rotation.set(0, 0, 0);
                        
                        if (this.keys["KeyS"] || this.keys["ArrowDown"])
                            this.rotation.set(0, Math.PI, 0);
                        
                        if (this.keys["KeyA"] || this.keys["ArrowLeft"])
                            this.rotation.set(0, Math.PI / 2, 0);
                        
                        if (this.keys["KeyD"] || this.keys["ArrowRight"])
                            this.rotation.set(0, -Math.PI / 2, 0);
                            
                        this.translateZ(this.maxVelocity / 2);
                    }
                }
                /* disabled because camera is no longer third person fixed
                else
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
                        if (this.move == this.MoveType.Mouse)
                        {
                            this.raycaster.setFromCamera(this.mouse, camera);
                            this.raycaster.ray.intersectPlane(this.plane, this.intersects);
                            this.moveTarget.position.copy(this.intersects);
                        }
                        
                        position.x = this.position.x;
                        position.y = this.position.y;
                        
                        target.x = this.moveTarget.position.x;
                        target.y = this.moveTarget.position.y;
                        
                        velocity = this.position.distanceTo(this.moveTarget.position) / 20;
                    }
                    
                    // TODO: these do not work, or are not being used while vehicle exists?
                    this.rotation.x = 0;
                    this.rotation.y = MathUtility.angleToPoint(position, target);
                    this.rotation.z = 0;
                    
                    velocity = MathUtility.clamp(velocity, 0, this.maxVelocity);
                    
                    this.translateZ(velocity);
                    
                    const direction = new THREE.Vector3(0, 0, 1);
                    direction.applyQuaternion(player.quaternion);
                    direction.multiplyScalar(24);
                    player.phys.body.applyImpulse(new Ammo.btVector3(direction.x, direction.y, direction.z));
                    
                    player.phys.body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
                }
                */
            }
            
            // this is outside of the preceding conditional
            // because if the camera were to change from free to fixed
            // it would not update until the player moves again.
            if (this.vehicle != null || this.interior == null)
            {
                // TODO: this adds a little bit of a stutter to the camera
                
                const pos = this.vehicle instanceof Vehicle ? this.vehicle.position : this.position;
                const quat = this.vehicle instanceof Vehicle ? this.vehicle.quaternion : this.quaternion;
                
                const idealOffset = new THREE.Vector3(0, 3, -6);
                idealOffset.applyQuaternion(quat);
                idealOffset.add(pos);
                
                const idealLookat = new THREE.Vector3(0, 1, 0);
                idealLookat.applyQuaternion(quat);
                idealLookat.add(pos);
                
                const t = 1.0 - Math.pow(0.000001, deltaTime);
                
                camera.position.copy(this.currentCameraPosition.lerp(idealOffset, t));
                camera.lookAt(this.currentCameraAngle.lerp(idealLookat, t));
            }
            else
            {
                camera.position.copy(this.interior.interiorCameraPosition);
                camera.lookAt(this.interior.position);
            }
        }
        else
            this.freeControls.update();
        
        // money needs to be moved AFTER the player has moved
        for (const money of this.carriedMoney)
        {
            if (money.getComponent("CarryableComponent").elapsedTime > money.getComponent("CarryableComponent").moveTime)
            {
                money.destructor();
                this.carriedMoney.splice(this.carriedMoney.indexOf(money), 1);
                continue;
            }
            
            if ("forPlayer" in money)
                money.getComponent("CarryableComponent").updateTarget(this.position, new THREE.Vector3(0, 0.5, 0));
        }
        
        // super update coming last prevents carried items from lagging behind the player
        super.update(deltaTime);
    }
    
    setMoney(amount)
    {
        //console.debug("updated player money to " + amount);
        this.money = amount;
        $("#money").html(this.money);
        return this.money;
    }

    takeMoney(amount)
    {
        return this.setMoney(this.money - amount);
    }

    addMoney(amount)
    {
        return this.setMoney(this.money + amount);
    }

    disableMovement()
    {
        this.moveEnd(null);
        
        this.removeEventListeners();
    }

    enableMovement()
    {
        this.registerEventListeners();
    }
    
    applyMovement(velocity)
    {
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(this.quaternion);
        direction.multiplyScalar(24);
        this.phys.body.applyImpulse(new Ammo.btVector3(direction.x, direction.y, direction.z));
    }
    
    registerEventListeners()
    {
        console.log("registered player controls event listener");

        // window.addEventListener("mousemove" , player.mousemove);
        // window.addEventListener("touchmove" , player.touchmove);
        // window.addEventListener("touchstart", player.touchstart);
        // window.addEventListener("mousedown" , player.mousedown);
        window.addEventListener("keyup"  , player.keyup);
        window.addEventListener("keydown", player.keydown);
        window.addEventListener("blur"   , player.blur);
        $(window).on("mouseup touchend"  , player.moveEnd);

        player.controlsEnabled = true;
    }

    removeEventListeners()
    {
        console.log("unregistered player controls event listener");
        
        // window.removeEventListener("mousemove" , player.mousemove);
        // window.removeEventListener("touchmove" , player.touchmove);
        // window.removeEventListener("touchstart", player.touchstart);
        // window.removeEventListener("mousedown" , player.mousedown);
        window.removeEventListener("keyup"  , player.keyup);
        window.removeEventListener("keydown", player.keydown);
        window.removeEventListener("blur"   , player.blur);
        $(window).off("mouseup touchend"    , player.moveEnd);
        
        this.keys = [];

        player.controlsEnabled = false;
    }

    mousemove(event)
    {
        player.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        player.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    };
    
    touchmove(event)
    {
        player.mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
        player.mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
    }

    touchstart(event)
    {
        if (player.move !== null)
            return;
            
        if (!(event instanceof TouchEvent))
            return;
            
        console.debug("Starting move by Touch.");
        
        player.pointerMoveOrigin.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
        player.pointerMoveOrigin.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;

        player.move = player.MoveType.Touch;

        scene.add(player.moveTarget);
    }
    
    mousedown(event)
    {
        if (player.move !== null)
            return;
            
        if (!(event instanceof MouseEvent))
            return;
            
        // left click only
        if (event.button != 0)
            return;
        
        console.debug("Starting move by Mouse.", event);

        player.pointerMoveOrigin.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        player.pointerMoveOrigin.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        player.move = player.MoveType.Mouse;

        scene.add(player.moveTarget);
    }

    keydown(event)
    {
        player.keys[event.code] = true;

        switch (event.code)
        {
            case "KeyO":
                player.freeControls.enabled = !player.freeControls.enabled;
                player.freeControls.target.copy(player.position);
                player.freeControls.update();
                
                console.log("freecam toggled");
                break;

            case "KeyE":
                player.raycaster.set(player.position, (new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion)));
                
                const objects = player.raycaster.intersectObjects(scene.children, true);
            
                const arrow = new THREE.ArrowHelper(player.raycaster.ray.direction, player.raycaster.ray.origin, 6, 0xff0000);
                scene.add(arrow);
                
                setTimeout(() => {
                    scene.remove(arrow);
                }, 10000);
            
                for (const object of objects)
                {
                    if (object.distance > 3)
                        continue;
                        
                    if ("onInteract" in object.object)
                    {
                        if (object.object.parent instanceof Vehicle)
                            object.object.parent.startDriving(player);
                    }
                }
            
                break;

            case "KeyW":
            case "ArrowUp":
            case "KeyA":
            case "ArrowLeft":
            case "KeyS":
            case "ArrowDown":
            case "KeyD":
            case "ArrowRight":
                if (player.move !== null)
                    return;
                
                console.debug("Starting move by Keyboard.");
                
                player.move = player.MoveType.Keyboard;
                player.moveTarget.quaternion.copy(player.quaternion);
                break;
        };
    }
    
    keyup(event)
    {
        player.keys[event.code] = false;

        // it is important to do this this way, because if a player clicks
        // while moving with the keyboard, we don't want to suddnely stop moving.
        // TODO: maybe consider forcing one or the other, ignoring other
        // types of movement if one is already being used.
        if (!(player.keys["KeyW"] || player.keys["ArrowUp"] ||
              player.keys["KeyA"] || player.keys["ArrowLeft"] ||
              player.keys["KeyS"] || player.keys["ArrowDown"] ||
              player.keys["KeyD"] || player.keys["ArrowRight"]))
              player.moveEnd(event);
    }

    blur(event)
    {
        player.keys = [];
    }
    
    moveEnd(event)
    {
        if (event !== null)
        {
            // only stop moving if the left mouse button is released
            if (player.move == player.MoveType.Mouse)
                if (event.button != 0)
                    return;
        }

        player.move = null;

        scene.remove(player.moveTarget);
    }
};