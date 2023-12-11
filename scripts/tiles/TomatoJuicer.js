import { Group, Vector2 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { ContainerTile } from "./ContainerTile.js";
import { GeneratorTile } from "./GeneratorTile.js";
import { TomatoJuice   } from "../items/TomatoJuice.js";

export class TomatoJuicer extends Group
{
    constructor(x, y)
    {
        super();

        this.generator = new GeneratorTile(new Vector2(1, 1), new Vector2(2, 2), 0x0000ff, "Tomato Juice", "tomatoJuice");
        this.generator.createItem = () => { return new TomatoJuice(this.generator.position) };
        this.generator.position.x = x - 1.25;
        this.generator.position.y = y;
        // this prevents the 
        this.generator.itemTime = -1;
        // TODO: replace scene.add with this.attach
        // right now it prevents the triggers from working for some reason
        scene.add(this.generator);
        //this.attach(this.generator);

        this.container = new ContainerTile(1, 1, 2, 2, 0xff0000);
        this.container.name = "tomatoJuicerContainer";
        this.container.itemType = "tomato";
        this.container.position.x = x + 1.25;
        this.container.position.y = y;
        // TODO: replace scene.add with this.attach
        // right now it prevents the triggers from working for some reason
        scene.add(this.container);
        //this.attach(this.container);

        this.timeSinceLastTransformation = 0;
    }

    update(deltaTime)
    {
        if (this.generator.carriedItems.length < this.generator.maxItems)
            if (this.timeSinceLastTransformation > 5)
            {
                if (this.container.carriedItems.length >= 2)
                {
                    console.debug("juicing 2 tomatoes from " + this.container.carriedItems.length);

                    scene.remove(this.container.carriedItems.shift());
                    scene.remove(this.container.carriedItems.shift());
                    this.container.calculateGrid();

                    console.debug(this.container.carriedItems.length + " tomatos left");
                    
                    this.generator.addItem();

                    this.timeSinceLastTransformation = 0;
                }
            }

        this.timeSinceLastTransformation += deltaTime;
    }

    onTrigger()
    {

    }

    onStopTrigger()
    {

    }
}