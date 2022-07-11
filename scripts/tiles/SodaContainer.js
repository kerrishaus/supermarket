import { BackstockContainer } from "./BackstockContainer.js";

import { SodaCan } from "../SodaCan.js";

export class SodaContainer extends BackstockContainer
{
    createItem()
    {
        return new SodaCan(this.position);
    }
};
