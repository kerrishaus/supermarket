import { Scene, BoxGeometry, MeshStandardMaterial, Vector3, Raycaster } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "./entity/Entity.js";
import { RigidBodyComponent } from "./entity/components/RigidBodyComponent.js";

export class PhysicsScene extends Scene
{
    constructor()
    {
        super();
        
        window.collisionConfiguration_  = new Ammo.btDefaultCollisionConfiguration();
        window.dispatcher_  			= new Ammo.btCollisionDispatcher(collisionConfiguration_);
        window.broadphase_  			= new Ammo.btDbvtBroadphase();
        window.solver_      			= new Ammo.btSequentialImpulseConstraintSolver();
        window.physicsBodies            = [];
        window.tmpTransform             = new Ammo.btTransform();
        window.physicsWorld 			= new Ammo.btDiscreteDynamicsWorld(dispatcher_, broadphase_, solver_, collisionConfiguration_);
        window.physicsWorld.setGravity(new Ammo.btVector3(0, 0, -9.82));
        
        $(window).keydown((event) =>
        {
            // shoots a small physics cube in from the mouse position away from the camera
            if (event.code == "KeyC")
            {
                const raycaster = new Raycaster();
                raycaster.setFromCamera(screenMousePosition, camera);

                const object = new Entity();
                const phys = object.addComponent(new RigidBodyComponent(
                    new BoxGeometry(1, 1, 1),
                    new MeshStandardMaterial({ color: 0x00FF00 }),
                    10
                ));

                const pos = new Vector3();
                pos.copy(raycaster.ray.direction);
                pos.add(raycaster.ray.origin);
                object.position.copy(pos);

                pos.copy(raycaster.ray.direction);
                pos.multiplyScalar(24);
                phys.body.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));

                scene.add(object);
            }
        });
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
        
        if (object instanceof Entity && object.hasComponent("RigidBodyComponent"))
        {
            const phys = object.getComponent("RigidBodyComponent");
            
            physicsBodies.push({ object: object, motionState: phys.motionState });
            physicsWorld.addRigidBody(phys.body);
        }
    }

    remove(object)
    {
        if (object instanceof Entity && object.hasComponent("RigidBodyComponent"))
        {
            // TODO: probably make physicsBodies and physicsWorld maps
            // remove from physicsBodies
            // remove from physicsWorld
            
            console.error("Remove physics bodies from the scene!");
        }

        super.remove(object);
    }

    physicsStep(deltaTime)
    {
        physicsWorld.stepSimulation(deltaTime, 10);

        for (const body of physicsBodies)
        {
            body.motionState.getWorldTransform(tmpTransform);

            const pos = tmpTransform.getOrigin();
            const quat = tmpTransform.getRotation();
            
            // this intentionally does not use copy
            // because copy has been hijacked by RigidBodyComponent
            body.object.position.x = pos.x();
            body.object.position.y = pos.y();
            body.object.position.z = pos.z();
            
            body.object.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
        }
    }
}

