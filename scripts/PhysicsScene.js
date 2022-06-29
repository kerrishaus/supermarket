import { Scene } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { PhysicsMesh } from "./PhysicsMesh.js";

export class PhysicsScene extends Scene
{
    constructor()
    {
        super();
    }

    add(object)
    {
        super.add(object);

        if (object instanceof PhysicsMesh)
        {
            physicsBodies.push(object);
            physicsWorld.addRigidBody(object.body);
        }
    }

    remove(object)
    {
        super.remove(object);

        if (object instanceof PhysicsMesh)
        {
            // remove from physicsBodies
            // remove from physicsWorld

            console.error("Remove physics bodies from the scene!");
        }
    }
}

