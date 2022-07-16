import { Interactable } from "../geometry/InteractableMesh";
import { ContainerTile } from "./ContainerTile";
import { GeneratorTile } from "./GeneratorTile";

export class TomatoJuicer extends Interactable
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