import { BoxGeometry, MeshStandardMaterial, MeshBasicMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import AmmoLib from "https://kerrishaus.com/assets/ammojs/ammo.module.js";
let Ammo;

AmmoLib().then((lib) =>
{
    Ammo = lib;
});

import { DynamicMesh } from "./DynamicMesh.js";

export class RigidBodyCube extends DynamicMesh
{
    constructor(size, color, pos, quat, mass)
    {
        const geometry = new BoxGeometry(size.x, size.y, size.z);
        const material = new MeshBasicMaterial({ color: color });
        
        super(geometry, material);

        this.position.copy(pos);
        
        this.castShadow = true;
        this.receiveShadow = true;
        
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);
    
        const btSize = new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2);
        this.shape = new Ammo.btBoxShape(btSize);
        this.shape.setMargin(0.05);
    
        this.inertia = new Ammo.btVector3(0, 0, 0);
        if (mass > 0)
            this.shape.calculateLocalInertia(mass, this.inertia);
    
        this.info = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState, this.shape, this.inertia);
        this.body = new Ammo.btRigidBody(this.info);
    
        Ammo.destroy(btSize);
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