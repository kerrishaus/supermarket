import { Mesh, Quaternion } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { OBB } from 'https://kerrishaus.com/assets/threejs/examples/jsm/math/OBB.js';

import { EntityComponent } from "./EntityComponent.js";

export class RigidBodyCubeComponent extends EntityComponent
{
    init(geometry, material)
    {
        geometry.computeBoundingBox();
        geometry.userData.obb = new OBB().fromBox3(geometry.boundingBox);
        
        this.mesh = new Mesh(geometry, material);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // TODO: make sure it gets removed from the scene properly.
        // right now it just sits around wherever it was last
        // i think this is fixed tho
        this.parentEntity.attach(this.mesh);

        // phys below here

        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(this.parentEntity.position.x, this.parentEntity.position.y, this.parentEntity.position.z));
        this.transform.setRotation(new Ammo.btQuaternion(this.parentEntity.quaternion.x, this.parentEntity.quaternion.y, this.parentEntity.quaternion.z, this.parentEntity.quaternion.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);

        this.shape = new Ammo.btBoxShape(new Ammo.btVector3(geometry.parameters.width / 2, geometry.parameters.height / 2, geometry.parameters.depth / 2));
        this.shape.setMargin(0.05);

        let mass = 10;
    
        this.inertia = new Ammo.btVector3(0, 0, 0);
        this.shape.calculateLocalInertia(mass, this.inertia);
    
        this.info = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState, this.shape, this.inertia);
        this.body = new Ammo.btRigidBody(this.info);
    }

    destructor()
    {
        super.destructor();

        scene.remove(this.mesh);
        this.mesh.removeFromParent();

        this.dispose(this.mesh);
        this.mesh = null;
    }

    dispose(object)
    {
        if (!object)
        {
            console.error("Object provided to dispose was invalid!");
            return;
        }
        
        object.geometry?.dispose()

        if (object.material)
            if (object.material.length)
                for (const material of object.material)
                    material.dispose()
            else
                object.material.dispose()
        
        scene.remove(object);

        Ammo.destroy(this.body);
        Ammo.destroy(this.info);
        Ammo.destroy(this.shape);
        Ammo.destroy(this.motionState);
        Ammo.destroy(this.transform);
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

        this.mesh.userData.obb.copy(this.mesh.geometry.userData.obb);
        this.mesh.userData.obb.applyMatrix4(this.mesh.matrixWorld);
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
            // TODO: find out what these numbers meand
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

    setPosition(position, rotation = null)
    {
        if (rotation === null)
            rotation = new Quaternion(0, 0, 0, 1);

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        transform.setRotation(new Ammo.btQuaternion(rotation.x, rotation.y, rotation.z, rotation.w));
        this.motionState.setWorldTransform(transform);
        this.body.setWorldTransform(transform);

        this.parentEntity.position.copy(position);
    }
};
