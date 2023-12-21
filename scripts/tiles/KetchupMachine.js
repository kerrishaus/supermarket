import { BoxGeometry, MeshStandardMaterial, Vector2 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Player } from "../Player.js";

import { Ketchup } from "../items/Ketchup.js";

import { Entity             } from "../entity/Entity.js";
import { GeometryComponent  } from "../entity/components/GeometryComponent.js";
import { ContainerComponent } from "../entity/components/ContainerComponent.js";
import { GeneratorComponent } from "../entity/components/GeneratorComponent.js";
import { TriggerComponent   } from "../entity/components/TriggerComponent.js";
import { Employee } from "../Employee.js";

export class KetchupMachine extends Entity
{
    constructor()
    {
        super();

        this.trigger = this.addComponent(new TriggerComponent(7, 3, 2));

        this.addComponent(new GeometryComponent(
            new BoxGeometry(6, 2, 1),
            new MeshStandardMaterial({ color: 0xff0000 })
        )).mesh.position.z -= 0.5;

        this.container = this.addComponent(new ContainerComponent("Tomatoes", "tomato"));

        this.generator = this.addComponent(new GeneratorComponent("Ketchup", "ketchup"));
        this.generator.itemTime = -1;
        this.generator.createItem = () => { return new Ketchup(this.position); }

        /*
        this.generator = new GeneratorTile(new Vector2(1, 1), new Vector2(2, 2), 0x0000ff, "Ketchup", "ketchup");
        this.generator.createItem = () => { return new Ketchup(this.generator.position) };
        this.generator.position.x = x - 1.25;
        this.generator.position.y = y;
        // this prevents the 
        this.generator.itemTime = -1;
        // TODO: replace scene.add with this.attach
        // right now it prevents the triggers from working for some reason
        scene.add(this.generator);
        //this.attach(this.generator);

        this.container = new ContainerTile(1, 1, 2, 2, 0xff0000);
        this.container.name = "ketchupGeneratorContainer";
        this.container.itemType = "tomato";
        this.container.position.x = x + 1.25;
        this.container.position.y = y;
        // TODO: replace scene.add with this.attach
        // right now it prevents the triggers from working for some reason
        scene.add(this.container);
        //this.attach(this.container);
        */

        this.transformTime = 5;
        this.timeSinceLastTransformation = 0;
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
                    
                    this.generator.addItem();

                    this.timeSinceLastTransformation = 0;
                }

        this.timeSinceLastTransformation += deltaTime;
    }

    onTrigger(object)
    {
        if (object instanceof Player || object instanceof Employee)
        {
            this.container.transferFromCarrier(object);
            this.generator.transferToCarrier(object);
        }
    }
}