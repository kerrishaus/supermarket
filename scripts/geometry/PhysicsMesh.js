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

    setRestitution(restitution)
    {
        this.body.setRestitution(restitution);
    }

    setBounciness(factor)
    {
        this.body.setRestitution(factor);
    }

    setFriction(friction)
    {
        this.body.setFriction(friction);
    }

    setRollingFriction(rollingFriction)
    {
        this.body.setRollingFriction(rollingFriction);
    }

    setPosition(position)
    {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
        this.motionState.setWorldTransform(transform);
        this.body.setWorldTransform(transform);

        this.position.copy(position);

        console.log("sff");
    }
}