import { Interactable } from "./InteractableMesh.js";

export class ContainerTile extends Interactable
{
    constructor(a, b, c, d, e,)
    {
        //super(1, 1, 2, 2, 0x4d220b);
        super(a, b, c, d, e);

        this.carriedItems = new Array();
        this.maxItems = 9;
    }

    // Sends the last carried item to the top of
    // object's carriedItems list
    transferToCarrier(object) {}

    // Takes the last carried item of object
    // and sends it to the top of our carriedItems list
    transferFromCarrier(object) {}
};