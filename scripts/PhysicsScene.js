import { Scene } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { RigidBodyMesh } from "./geometry/RigidBodyMesh.js";

export class PhysicsScene extends Scene
{
    constructor()
    {
        super();
    }

    add(object)
    {
        super.add(object);

        if (object instanceof RigidBodyMesh)
        {
            physicsBodies.push(object);
            physicsWorld.addRigidBody(object.body);
        }
    }

    remove(object)
    {
        super.remove(object);

        if (object instanceof RigidBodyMesh)
        {
            // TODO: probably make physicsBodies and physicsWorld maps
            // remove from physicsBodies
            // remove from physicsWorld

            console.error("Remove physics bodies from the scene!");
        }
    }
}

