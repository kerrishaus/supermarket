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

    setKinematic(kinematic = true)
    {
        if (kinematic)
        {
            this.body.setCollisionFlags(2); // kinematic
            this.body.setActivationState(4); // never sleep
        }
        else
        {
            this.body.setCollisionFlags(1); // kinematic
            this.body.setActivationState(1); // never sleep
        }
    }

    isKinematic()
    {
        return this.body.isStaticOrKinematicObject();
    }
}