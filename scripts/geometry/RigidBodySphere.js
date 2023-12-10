import { SphereGeometry, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { RigidBodyMesh } from "./RigidBodyMesh.js";

export class RigidBodySphere extends RigidBodyMesh
{
    constructor(radius, color, pos, quat, mass)
    {
        const geometry = new SphereGeometry(radius);
        const material = new MeshStandardMaterial({ color: color });
        
        super(geometry, material);
    
        this.castShadow = true;
        this.receiveShadow = true;
        
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);
    
        this.shape = new Ammo.btSphereShape(radius);
        this.shape.setMargin(0.05);
    
        this.inertia = new Ammo.btVector3(0, 0, 0);
        if (mass > 0)
            this.shape.calculateLocalInertia(mass, this.inertia);
    
        this.info = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState, this.shape, this.inertia);
        this.body = new Ammo.btRigidBody(this.info);
    }
    
    setRestitution(restitution)
    {
        this.body.setRestitution(restitution);
    }

    setFriction(friction)
    {
        this.body.setFriction(friction);
    }

    setRollingFriction(rollingFriction)
    {
        this.body.setRollingFriction(rollingFriction);
    }
}