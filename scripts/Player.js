import { Vector3, Vector2, Mesh, SphereGeometry, MeshPhongMaterial, BoxGeometry, MeshStandardMaterial, Plane, Raycaster } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "./entity/Entity.js";

import * as GeometryUtil from "./geometry/GeometryUtility.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";

export class Player extends Entity
{
    constructor()
    {
        super();

        this.addComponent(new ContainerComponent);

        this.addComponent(new GeometryComponent(
            new BoxGeometry(1, 1, 2),
            new MeshStandardMaterial({ color: 0x0000ff })
        ));

        const nose = GeometryUtil.createScaledCube(0.4, 1, 0.2, 0x0000aa);
        nose.position.z = 0.8;
        nose.position.y = 0.5;
        this.add(nose);
        
        this.money = 0;
        this.carriedMoney = new Array();

        //this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
		        
        this.maxSpeed = 0.3;

        this.controlsEnabled = true;

        this.MoveType = {
            Mouse: 'Mouse',
            Touch: 'Touch',
            Keyboard: 'Keyboard'
        };

        this.move = null;
        this.keys = new Array();
        this.pointerMoveOrigin = new Vector2();
        this.moving = false;
        this.pointerMove = false;
        
        this.moveTarget = new Mesh(
            new SphereGeometry(0.25, 24, 8), 
            new MeshPhongMaterial({ 
                color: 0x00ffff, 
                flatShading: true,
                transparent: true,
                opacity: 0.7,
            })
        );
        
        this.plane = new Plane(new Vector3(0, 0, 0.5), 0);

        this.mouse      = new Vector2();
        this.raycaster  = new Raycaster();
        this.intersects = new Vector3();
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

        for (const money of this.carriedMoney)
        {
            if (money.getComponent("CarryableComponent").elapsedTime > money.getComponent("CarryableComponent").moveTime)
            {
                console.log("destroying money");
                money.destructor();
                this.carriedMoney.splice(this.carriedMoney.indexOf(money), 1);
                continue;
            }
            
            money.getComponent("CarryableComponent").updateTarget(this.position, new Vector3(0, 0, 0.5));
        }
    }

    disableMovement()
    {
        this.controlsEnabled = false;

        this.move = null;
    }

    enableMovement()
    {
        this.controlsEnabled = true;
    }

    registerEventListeners()
    {
        console.log("registered player controls event listener");

        window.addEventListener("mousemove" , this.mousemove);
        window.addEventListener("touchmove" , this.touchmove);
        window.addEventListener("touchstart", this.touchstart);
        window.addEventListener("mousedown" , this.mousedown);
        window.addEventListener("keyup"     , this.keyup);
        window.addEventListener("keydown"   , this.keydown);
        $(window).on('mouseup touchend'     , this.moveEnd);

        this.controlsEnabled = true;
    }

    removeEventListeners()
    {
        console.log("unregistered player controls event listener");
        
        window.removeEventListener("mousemove" , this.mousemove);
        window.removeEventListener("touchmove" , this.touchmove);
        window.removeEventListener("touchstart", this.touchstart);
        window.removeEventListener("mousedown" , this.mousedown);
        window.removeEventListener("keyup"     , this.keyup);
        window.removeEventListener("keydown"   , this.keydown);
        $(window).off('mouseup touchend'       , this.moveEnd);

        this.controlsEnabled = false;
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
        
        player.pointerMoveOrigin.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
        player.pointerMoveOrigin.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;

        player.move = player.MoveType.Touch;

        scene.add(player.moveTarget);
    }
    
    mousedown(event)
    {
        if (!player.controlsEnabled)
            return;

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
                player.move = MoveType.Keyboard;
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

        player.move = null;

        scene.remove(player.moveTarget);
    }
};