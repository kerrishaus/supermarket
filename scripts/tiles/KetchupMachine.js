import { BoxGeometry, MeshStandardMaterial, Vector2 } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { Entity } from "../entity/Entity.js";
import { Player } from "../entity/Player.js";

import { GeometryComponent  } from "../entity/components/GeometryComponent.js";
import { ContainerComponent } from "../entity/components/ContainerComponent.js";
import { GeneratorComponent } from "../entity/components/GeneratorComponent.js";
import { TriggerComponent   } from "../entity/components/TriggerComponent.js";

export class KetchupMachine extends Entity
{
    constructor()
    {
        super();

        this.name = "ketchupMachine";

        this.trigger = this.addComponent(new TriggerComponent(7, 2, 3));

        this.addComponent(new GeometryComponent(
            new BoxGeometry(6, 1, 2),
            new MeshStandardMaterial({ color: 0xff0000 })
        )).mesh.position.y -= 0.5;

        this.container = this.addComponent(new ContainerComponent("Tomatoes", "tomato"));
        
        this.generator = this.addComponent(new GeneratorComponent("Ketchup", "ketchup"));
        this.generator.noAutomaticGeneration = true;

        this.transformTime = 5;
        this.timeSinceLastTransformation = 0;
        
        this.addEventListener("trigger", (event) =>
        {
            if (event.object instanceof Player)
            {
                this.container.transferFromCarrier(event.object);
                this.generator.transferToCarrier(event.object);
            }
        });
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        if (this.generator.carriedItems.length < this.generator.maxItems)
            if (this.timeSinceLastTransformation > this.transformTime)
                if (this.container.carriedItems.length >= 2)
                {
                    console.debug("juicing 2 tomatoes from " + this.container.carriedItems.length);

                    // remove and destroy 2 items from the tomato container, then recalculate the grid
                    this.container.carriedItems.shift().destructor();
                    this.container.carriedItems.shift().destructor();
                    this.container.calculateGrid();

                    console.debug(this.container.carriedItems.length + " tomatos left");
                    
                    this.generator.addItemToQueue();

                    this.timeSinceLastTransformation = 0;
                }

        this.timeSinceLastTransformation += deltaTime;
    }
}