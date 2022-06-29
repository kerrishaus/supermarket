import { DynamicMesh } from "./DynamicMesh.js";

export class PhysicsMesh extends DynamicMesh
{
    constructor(geometry, material)
    {
        super(geometry, material);
    }

    update(deltaTime)
    {
        super.update(deltaTime);
    }
}