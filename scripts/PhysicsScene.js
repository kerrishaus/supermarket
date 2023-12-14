import { Scene } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { RigidBodyMesh } from "./geometry/RigidBodyMesh.js";

export class PhysicsScene extends Scene
{
    constructor()
    {
        super();
    }

    // this is a very important override of Object3D#traverse,
    // becasue it prevents traverse from being called on children
    // which may no longer exist in the scene.
    traverse = function(callback)
    {
        callback(this);

        const children = this.children;

        for (let i = 0, l = children.length; i < l; i++)
            children[i]?.traverse(callback);
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

