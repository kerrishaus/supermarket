
import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { createObject } from "./GeometryUtility.js";

import { Interactable } from "./InteractableMesh.js";
import { Carryable } from "./Carryable.js";

export class Door extends Interactable
{
    constructor(position)
    {
        super(3, 3, 6, 4, 0x000000);
        
        this.name = "door";
        
        this.position.copy(position);
        this.material.transparent = true;
        this.material.opacity = 0;
        
        this.leftDoor = new Carryable(2, 1, 4, 0x00d1e8);
        this.leftDoor.position.copy(new Vector3(-8.5, 19.4, 1));
        this.leftDoor.setTarget(this.leftDoor.position, new Vector3(0, 0, 0));
        
        this.leftDoor.add(createObject(new Vector3(0.2, 0.1, 4), new Vector3(-0.9, -0.55, 0), 0x919191));
        this.leftDoor.add(createObject(new Vector3(0.2, 0.1, 4), new Vector3(0.9, -0.55, 0), 0x919191));
        
        this.leftDoor.add(createObject(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 1.9), 0x919191));
        this.leftDoor.add(createObject(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 0.1), 0x919191));
        this.leftDoor.add(createObject(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, -1.4), 0x919191));
        
        this.rightDoor = new Carryable(2, 1, 4, 0x00d1e8)
        this.rightDoor.position.copy(new Vector3(-10.5, 19.4, 1));
        this.rightDoor.setTarget(this.rightDoor.position, new Vector3(0, 0, 0));

        this.rightDoor.add(createObject(new Vector3(0.2, 0.1, 4), new Vector3(-0.9, -0.55, 0), 0x919191));
        this.rightDoor.add(createObject(new Vector3(0.2, 0.1, 4), new Vector3(0.9, -0.55, 0), 0x919191));
        
        this.rightDoor.add(createObject(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 1.9), 0x919191));
        this.rightDoor.add(createObject(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 0.1), 0x919191));
        this.rightDoor.add(createObject(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, -1.4), 0x919191));
        
        // the black "void" behind the doors
        scene.add(createObject(new Vector3(4, 1, 4), new Vector3(-9.5, 19.45, 0.99), 0x000000));
        
        scene.add(this.leftDoor);
        scene.add(this.rightDoor);
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
    }
    
    onTrigger(object)
    {
        super.onTrigger(object);
        
        this.rightDoor.setTarget(new Vector3(-12.5, 19.4, 1), new Vector3(0, 0, 0));
        this.leftDoor.setTarget(new Vector3(-6.5, 19.4, 1), new Vector3(0, 0, 0));
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);

        if (this.triggeringObjects.length <= 0)
        {
            this.rightDoor.setTarget(new Vector3(-10.5, 19.4, 1), new Vector3(0, 0, 0));
            this.leftDoor.setTarget(new Vector3(-8.5, 19.4, 1), new Vector3(0, 0, 0));
        }
    }
}
