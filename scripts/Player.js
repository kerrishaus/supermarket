import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

import { Entity } from "./entity/Entity.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";

export class Player extends Entity
{
    constructor()
    {
        super();
        
        this.money = 0;
        this.carriedMoney = new Array();
        this.addComponent(new ContainerComponent());
        
        this.addComponent(new GeometryComponent(
            new THREE.BoxGeometry(1, 1, 2),
            new THREE.MeshStandardMaterial({ color: 0x0000ff })
        ));
        
        const nose = GeometryUtil.createScaledCube(0.4, 1, 0.2, 0x0000aa);
        nose.position.z = 0.8;
        nose.position.y = 0.5;
        this.add(nose);
        
        this.maxSpeed = 0.15;
        
        this.freeCam = false;
        this.controlsEnabled = true;
        
        this.MoveType = {
            Mouse: 'Mouse',
            Touch: 'Touch',
            Keyboard: 'Keyboard'
        };

        this.move = null;
        this.keys = new Array();
        this.pointerMoveOrigin = new THREE.Vector2();
        this.moving = false;
        
        this.moveTarget = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 24, 8), 
            new THREE.MeshPhongMaterial({ 
                color: 0x00ffff, 
                flatShading: true,
                transparent: true,
                opacity: 0.7,
            })
        );
        
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 0.5), 0);

        this.mouse      = new THREE.Vector2();
        this.raycaster  = new THREE.Raycaster();
        this.intersects = new THREE.Vector3();
    }
    
    update(deltaTime)
    {
        if (!this.freeCam)
        {
            if (this.move !== null)
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
                        const moveAmount = this.maxSpeed;
                        
                        if (this.keys["KeyW"] || this.keys["ArrowUp"])
                            this.moveTarget.translateY(moveAmount);
                        if (this.keys["KeyA"] || this.keys["ArrowLeft"])
                            this.moveTarget.translateX(-moveAmount);
                        if (this.keys["KeyS"] || this.keys["ArrowDown"])
                            this.moveTarget.translateY(-moveAmount);
                        if (this.keys["KeyD"] || this.keys["ArrowRight"])
                            this.moveTarget.translateX(moveAmount);
                        
                        this.moveTarget.quaternion.copy(this.quaternion);
                    }
                    else if (this.move == this.MoveType.Mouse)
                    {
                        this.raycaster.setFromCamera(this.mouse, camera);
                        this.raycaster.ray.intersectPlane(this.plane, this.intersects);
                        this.moveTarget.position.copy(this.intersects);
                    }
                    
                    position.x = this.position.x;
                    position.y = this.position.y
                    
                    target.x = this.moveTarget.position.x;
                    target.y = this.moveTarget.position.y;
                    
                    velocity = this.position.distanceTo(this.moveTarget.position) / 20;
                }
                
                // set the player's direction
                this.rotation.z = MathUtility.angleToPoint(position, target);
                
                // clamp the player's velocity
                velocity = MathUtility.clamp(velocity, 0, this.maxSpeed);
                
                // move the player their direction
                this.translateY(velocity);
                
                // TODO: do this in Shop class maybe
                shop.gridHelper.position.x = Math.floor(this.position.x / 2) * 2;
                shop.gridHelper.position.y = Math.floor(this.position.y / 2) * 2;
            }
            
            // this is outside of the preceding conditional
            // because if the camera were to change from free to fixed
            // it would not update until the player moves again.
            camera.position.x = this.position.x;
            camera.position.z = this.position.z + 8;
            camera.position.y = this.position.y - 6;
            camera.lookAt(this.position);
        }
        else
            freeControls.update();
        
        // money needs to be moved AFTER the player has moved
        for (const money of this.carriedMoney)
        {
            if (money.getComponent("CarryableComponent").elapsedTime > money.getComponent("CarryableComponent").moveTime)
            {
                money.destructor();
                this.carriedMoney.splice(this.carriedMoney.indexOf(money), 1);
                continue;
            }
            
            if ('forPlayer' in money)
                money.getComponent("CarryableComponent").updateTarget(this.position, new THREE.Vector3(0, 0, 0.5));
        }
        
        // super update coming last prevents carried items from lagging behind the player
        super.update(deltaTime);
    }

    setMoney(amount)
    {
        console.debug("updated player money to " + amount);
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
        
        this.controlsEnabled = false;
    }

    enableMovement()
    {
        this.controlsEnabled = true;
    }

    registerEventListeners()
    {
        console.log("registered player controls event listener");

        window.addEventListener("mousemove" , player.mousemove);
        window.addEventListener("touchmove" , player.touchmove);
        window.addEventListener("touchstart", player.touchstart);
        window.addEventListener("mousedown" , player.mousedown);
        window.addEventListener("keyup"     , player.keyup);
        window.addEventListener("keydown"   , player.keydown);
        $(window).on('mouseup touchend'     , player.moveEnd);

        player.controlsEnabled = true;
    }

    removeEventListeners()
    {
        console.log("unregistered player controls event listener");
        
        window.removeEventListener("mousemove" , player.mousemove);
        window.removeEventListener("touchmove" , player.touchmove);
        window.removeEventListener("touchstart", player.touchstart);
        window.removeEventListener("mousedown" , player.mousedown);
        window.removeEventListener("keyup"     , player.keyup);
        window.removeEventListener("keydown"   , player.keydown);
        $(window).off('mouseup touchend'       , player.moveEnd);

        player.controlsEnabled = false;
    }

    mousemove(event)
    {
        if (!player.controlsEnabled)
            return;

        player.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        player.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    };
    
    touchmove(event)
    {
        if (!player.controlsEnabled)
            return;

        player.mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
        player.mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
    }

    touchstart(event)
    {
        if (!player.controlsEnabled)
            return;
            
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
        if (!player.controlsEnabled)
            return;
            
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
        if (!player.controlsEnabled)
            return;

        player.keys[event.code] = true;

        switch (event.code)
        {
            case "KeyW":
            case "ArrowUp":
            case "KeyA":
            case "ArrowLeft":
            case "KeyS":
            case "ArrowDown":
            case "KeyD":
            case "ArrowRight":
                break; // remove this when keyboard movement is allowed
                
                if (player.move !== null)
                    return;
                    
                console.debug("Starting move by Keyboard.");
                
                player.move = player.MoveType.Keyboard;
                player.moveTarget.quaternion.copy(player.quaternion);
                scene.add(player.moveTarget);
                break;
        };
    }
    
    keyup(event)
    {
        if (!player.controlsEnabled)
            return;
        
        player.keys[event.code] = false;

        return; // remove this when keyboard movement is allowed

        // it is important to do this this way, because if a player clicks
        // while moving with the keyboard, we don't want to suddnely stop moving.
        // TODO: maybe consider forcing one or the other, ignoring other
        // types of movement if one is already being used.
        if (!(player.keys["KeyW"] || player.keys["ArrowUp"] ||
              player.keys["KeyA"] || player.keys["ArrowLeft"] ||
              player.keys["KeyS"] || player.keys["ArrowDown"] ||
              player.keys["KeyD"] || player.keys["ArrowRight"]))
              this.moveEnd();
    }
    
    moveEnd(event)
    {
        if (!player.controlsEnabled)
            return;
        
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