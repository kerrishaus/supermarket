import { BoxGeometry, MeshBasicMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import AmmoLib from "https://kerrishaus.com/assets/ammojs/ammo.module.js";
let Ammo;

AmmoLib().then((lib) =>
{
    Ammo = lib;
});

import { DynamicMesh } from "./DynamicMesh.js";

export class RigidBodyCube extends DynamicMesh
{
    constructor(mass, position, quaternion, size, color)
    {
        const geometry = new BoxGeometry(size.x, size.y, size.z);
        const material = new MeshBasicMaterial({ color: color });

        super(geometry, material);

        this.position.copy(position);
        this.quaternion.copy(quaternion);
        
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        this.transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);

        this.shape = new Ammo.btBoxShape(new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2));
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

    update(deltaTime)
    {
        
    }
};