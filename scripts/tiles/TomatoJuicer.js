import { Triggerable } from "../geometry/Triggerable";
import { ContainerTile } from "./ContainerTile";
import { GeneratorTile } from "./GeneratorTile";

export class TomatoJuicer extends Triggerable
{
    constructor(position)
    {
        this.generator = new GeneratorTile();
        this.container = new ContainerTile();
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