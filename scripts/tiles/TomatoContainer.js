import { BackstockContainer } from "./BackstockContainer.js";

import { Tomato } from "../Tomato.js";

export class TomatoContainer extends BackstockContainer
{
    createItem()
    {
        return new Tomato(this.position);
    }
};
