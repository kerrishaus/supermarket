import { Triggerable } from "../geometry/Triggerable";
import { ContainerTile } from "./ContainerTile";
import { GeneratorTile } from "./GeneratorTile";

export class TomatoJuicer extends Triggerable
{
    constructor(position)
    {
        this.generator = new GeneratorTile(new Vector2(1, 1), new Vector2(2, 1), 0xff0000, "tomatoJuiceGenerator");
        this.container = new ContainerTile(1, 1, 2, 1, 0x00ff00);

        this.generator.position.copy(position);
        this.container.position.copy(position);

        scene.add(this.generator);
        scene.add(this.generator);
    }

    update()
    {

    }

    onTrigger()
    {

    }

    onStopTrigger()
    {

    }
}