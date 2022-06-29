import { BoxGeometry, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { PhysicsMesh } from "./PhysicsMesh.js";

export class KinematicCube extends PhysicsMesh
{
    constructor(size, color, pos, quat)
    {
        const geometry = new BoxGeometry(size.x, size.y, size.z);
        const material = new MeshStandardMaterial({ color: color });
        
        super(geometry, material);

        this.position.copy(pos);
        
        this.castShadow = true;
        this.receiveShadow = true;

        console.log(window);
        
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);
    
        const btSize = new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2);
        this.shape = new Ammo.btBoxShape(btSize);
        this.shape.setMargin(0.05);
    
        this.info = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState, this.shape, this.inertia);
        this.body = new Ammo.btRigidBody(this.info);

        this.body.setActivationState(4); // disable deactivation
        this.body.setCollisionFlags(2); // kinematic object
    
        Ammo.destroy(btSize);
    }
}