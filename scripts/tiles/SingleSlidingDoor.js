import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { createCube } from "../GeometryUtility.js";

import { Entity } from "../entity/Entity.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { TriggerComponent } from "../entity/components/TriggerComponent.js";

export class SingleSlidingDoor extends Entity
{
    constructor(position)
    {
        super();

        this.trigger = this.addComponent(new TriggerComponent(2, 3.5, 4));
        
        this.leftDoor = new Entity();
        this.add(this.leftDoor);

        this.leftDoor.addComponent(new CarryableComponent)
            .setTarget(this.leftDoor.position, new Vector3(0, 0, 0));
        
        // main door
        this.leftDoor.add(createCube(new Vector3(1.95, 3.45, 0.2), new Vector3(0, 0, 0), 0x00d1e8));

        // vertical frames
        this.leftDoor.add(createCube(new Vector3(0.2, 3.5, 0.1), new Vector3(-0.9, 0, -0.1), 0x919191));
        this.leftDoor.add(createCube(new Vector3(0.2, 3.5, 0.1), new Vector3(0.9, 0, -0.1), 0x919191));
        
        // horizontal frames
        this.leftDoor.add(createCube(new Vector3(1.6, 0.2, 0.1), new Vector3(0, 1.65, -0.1), 0x919191));
        this.leftDoor.add(createCube(new Vector3(1.6, 0.2, 0.1), new Vector3(0, 0, -0.1), 0x919191));
        this.leftDoor.add(createCube(new Vector3(1.6, 0.2, 0.1), new Vector3(0, -1.65, -0.1), 0x919191));

        // the black "void" behind the door
        this.add(createCube(new Vector3(2, 3.5, 0.2), new Vector3(0, 0, 0.0005), 0x000000));

        this.position.copy(position);
    }

    onStartTrigger()
    {
        this.leftDoor.getComponent("CarryableComponent").setTarget(
            new Vector3(-2, 0, 0),
            new Vector3(0, 0, 0),
        );

        console.debug("opening door");
    }
    
    onStopTrigger()
    {
        // always open the door when triggered, in case it was shut for some reason
        // only close the door when nothing else is left in the trigger.
        if (this.trigger.triggered)
            return;
        
        this.leftDoor.getComponent("CarryableComponent").setTarget(
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
        );

        console.debug("closing door");
    }
}
