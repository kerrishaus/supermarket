import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { createCube } from "./geometry/GeometryUtility.js";

import { Triggerable } from "./geometry/Triggerable.js";

import { Entity } from "./entity/Entity.js";
import { CarryableComponent } from "./entity/components/CarryableComponent.js";

export class Door extends Triggerable
{
    constructor(position)
    {
        super(3, 3, 6, 4, 0x000000);
        
        this.name = "door";
        
        this.position.copy(position);
        this.material.transparent = true;
        this.material.opacity = 0;
        
        this.leftDoor = new Entity();
        this.leftDoor.addComponent(new CarryableComponent);
        this.leftDoor.position.copy(position);
        this.leftDoor.position.x -= 1;
        this.leftDoor.position.y -= 0.01;
        this.leftDoor.getComponent("CarryableComponent").setTarget(this.leftDoor.position, new Vector3(0, 0, 0.5));
        
        // main door
        this.leftDoor.add(createCube(new Vector3(2, 1, 4), new Vector3(0, 0, 0), 0x00d1e8));

        // vertical frames
        this.leftDoor.add(createCube(new Vector3(0.2, 0.1, 4), new Vector3(-0.9, -0.55, 0), 0x919191));
        this.leftDoor.add(createCube(new Vector3(0.2, 0.1, 4), new Vector3(0.9, -0.55, 0), 0x919191));
        
        // horizontal frames
        this.leftDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 1.9), 0x919191));
        this.leftDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 0.1), 0x919191));
        this.leftDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, -1.4), 0x919191));
        
        this.rightDoor = new Entity();
        this.rightDoor.addComponent(new CarryableComponent);
        this.rightDoor.position.copy(position);
        this.rightDoor.position.x += 1;
        this.rightDoor.position.y -= 0.01;
        this.rightDoor.getComponent("CarryableComponent").setTarget(this.rightDoor.position, new Vector3(0, 0, 0.5));

        // main door
        this.rightDoor.add(createCube(new Vector3(2, 1, 4), new Vector3(0, 0, 0), 0x00d1e8));

        // vertical frames
        this.rightDoor.add(createCube(new Vector3(0.2, 0.1, 4), new Vector3(-0.9, -0.55, 0), 0x919191));
        this.rightDoor.add(createCube(new Vector3(0.2, 0.1, 4), new Vector3(0.9, -0.55, 0), 0x919191));
        
        // horizontal frames
        this.rightDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 1.9), 0x919191));
        this.rightDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 0.1), 0x919191));
        this.rightDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, -1.4), 0x919191));
        
        // the black "void" behind the doors
        this.attach(createCube(new Vector3(4, 1, 5), position, 0x000000));
        
        scene.add(this.leftDoor);
        scene.add(this.rightDoor);
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
    }
    
    onTrigger(object)
    {
        // if the door is triggered, add the triggering object
        // to the list, but don't set a target for the doors again.
        if (this.triggered)
        {
            super.onTrigger(object);
            return;
        }

        super.onTrigger(object);

        this.rightDoor.getComponent("CarryableComponent").setTarget(new Vector3(3, -0.1, 0.5), this.position);
        this.leftDoor.getComponent("CarryableComponent").setTarget(new Vector3(-3, -0.1, 0.5), this.position);

        console.debug("opening door");
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);

        if (this.triggered)
            return;

        this.rightDoor.getComponent("CarryableComponent").setTarget(new Vector3(1, -0.1, 0.5), this.position);
        this.leftDoor.getComponent("CarryableComponent").setTarget(new Vector3(-1, -0.1, 0.5), this.position);

        console.debug("closing door");
    }
}
