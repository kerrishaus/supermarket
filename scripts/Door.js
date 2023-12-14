import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { createCube } from "./geometry/GeometryUtility.js";

import { Entity } from "./entity/Entity.js";
import { CarryableComponent } from "./entity/components/CarryableComponent.js";
import { TriggerComponent } from "./entity/components/TriggerComponent.js";

export class Door extends Entity
{
    constructor(position)
    {
        super();

        this.addComponent(new TriggerComponent(4, 4, 3.5));
        
        this.leftDoor = new Entity();
        this.add(this.leftDoor);
        this.leftDoor.position.x -= 1;

        this.leftDoor.addComponent(new CarryableComponent)
            .setTarget(this.leftDoor.position, new Vector3(0, 0, 0));
        
        // main door
        this.leftDoor.add(createCube(new Vector3(2, 1, 3.5), new Vector3(0, 0, 0), 0x00d1e8));

        // vertical frames
        this.leftDoor.add(createCube(new Vector3(0.2, 0.1, 3.5), new Vector3(-0.9, -0.55, 0), 0x919191));
        this.leftDoor.add(createCube(new Vector3(0.2, 0.1, 3.5), new Vector3(0.9, -0.55, 0), 0x919191));
        
        // horizontal frames
        this.leftDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 1.65), 0x919191));
        this.leftDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 0), 0x919191));
        this.leftDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, -1.65), 0x919191));

        this.rightDoor = new Entity();
        this.add(this.rightDoor);
        this.rightDoor.position.x += 1;
        
        this.rightDoor.addComponent(new CarryableComponent)
            .setTarget(this.rightDoor.position, new Vector3(0, 0, 0));

        // main door
        this.rightDoor.add(createCube(new Vector3(2, 1, 3.5), new Vector3(0, 0, 0), 0x00d1e8));

        // vertical frames
        this.rightDoor.add(createCube(new Vector3(0.2, 0.1, 3.5), new Vector3(-0.9, -0.55, 0), 0x919191));
        this.rightDoor.add(createCube(new Vector3(0.2, 0.1, 3.5), new Vector3(0.9, -0.55, 0), 0x919191));
        
        // horizontal frames
        this.rightDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 1.65), 0x919191));
        this.rightDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, 0), 0x919191));
        this.rightDoor.add(createCube(new Vector3(1.6, 0.1, 0.2), new Vector3(0, -0.55, -1.65), 0x919191));
        
        // the black "void" behind the doors
        this.add(createCube(new Vector3(4, 1, 3.5), new Vector3(0, 0.005, 0), 0x000000));

        this.position.copy(position);
    }

    onStartTrigger()
    {
        this.rightDoor.getComponent("CarryableComponent").setTarget(
            new Vector3(3, 0, 0),
            new Vector3(0, 0, 0),
        );
            
        this.leftDoor.getComponent("CarryableComponent").setTarget(
            new Vector3(-3, 0, 0),
            new Vector3(0, 0, 0),
        );

        console.debug("opening door");
    }
    
    onStopTrigger()
    {
        this.rightDoor.getComponent("CarryableComponent").setTarget(
            new Vector3(1, 0, 0),
            new Vector3(0, 0, 0),
        );

        this.leftDoor.getComponent("CarryableComponent").setTarget(
            new Vector3(-1, 0, 0),
            new Vector3(0, 0, 0),
        );

        console.debug("closing door");
    }
}
