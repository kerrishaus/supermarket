import { BoxGeometry } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EntityComponent } from "./EntityComponent.js";
import { GeometryComponent } from "./GeometryComponent.js";

export class RigidBodyComponent extends EntityComponent
{
    #parentPositionCopy;
    #parentPositionAdd;
    #parentPositionSet;
    #parentPositionLerpVectors;
    
    static DISABLE_DEACTIVATION = 4;
    
    init(geometry, material, mass = 10)
    {
        if (!this.parentEntity.hasComponent("GeometryComponent"))
            this.parentEntity.addComponent(new GeometryComponent(geometry, material));
        
        // physics
        
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(this.parentEntity.position.x, this.parentEntity.position.y, this.parentEntity.position.z));
        this.transform.setRotation(new Ammo.btQuaternion(this.parentEntity.quaternion.x, this.parentEntity.quaternion.y, this.parentEntity.quaternion.z, this.parentEntity.quaternion.w));
        this.motionState = new Ammo.btDefaultMotionState(this.transform);
        
        if (geometry instanceof BoxGeometry)
            this.shape = new Ammo.btBoxShape(new Ammo.btVector3(geometry.parameters.width / 2, geometry.parameters.height / 2, geometry.parameters.depth / 2));
        else
            console.error("Invalid geometry type passed to RigidBodyComponent.", geometry);
        
        this.inertia = new Ammo.btVector3(0, 0, 0);
        this.shape.calculateLocalInertia(mass, this.inertia);
        
        this.body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, this.motionState, this.shape, this.inertia));
        
        if (mass < 0)
            this.phys.body.setActivationState(RigidBodyComponent.DISABLE_DEACTIVATION);
        
        this.setRestitution(0.125);
        this.setFriction(1);
        this.setRollingFriction(0.2);
        
        // end physics

        this.#parentPositionCopy        = this.parentEntity.position.copy;
        this.#parentPositionAdd         = this.parentEntity.position.add;
        this.#parentPositionSet         = this.parentEntity.position.set;
        this.#parentPositionLerpVectors = this.parentEntity.position.lerpVectors;
        
        // scritcly speaking, these functions are wasteful because they
        // 1 set the position of the geometry
        // 2 update the physics box to match
        // 3 geometry is moved to physics box location in global update after all entity updates are finished
        // so the geometry position is set twice. however, I do not want to rewrite the add and lerpVectors functions
        // so we use them and set the geometry twice anyway :)

        this.parentEntity.position.copy = (position) => {
            return this.setPosition(this.#parentPositionCopy.apply(this.parentEntity.position, [ position ]));
        };

        this.parentEntity.position.add = (position) => {
            return this.setPosition(this.#parentPositionAdd.apply(this.parentEntity.position, [ position ]));
        };

        this.parentEntity.position.set = (x, y, z) => {
            return this.setPosition(this.#parentPositionSet.apply(this.parentEntity.position, [ x, y, z ]));
        };
        
        this.parentEntity.position.lerpVectors = (start, end, time) => {
            return this.setPosition(this.#parentPositionLerpVectors.apply(this.parentEntity.position, [ start, end, time ]));
        };
    }
    
    destructor()
    {
        super.destructor();

        this.parentEntity.position.copy                      = this.#parentPositionCopy;
        this.parentEntity.position.add                       = this.#parentPositionAdd;
        this.parentEntity.position.set                       = this.#parentPositionSet;
        this.parentEntity.position.parentPositionLerpVectors = this.#parentPositionLerpVectors;
        
        Ammo.destroy(this.body);
        Ammo.destroy(this.shape);
        Ammo.destroy(this.motionState);
        Ammo.destroy(this.transform);
    }

    setKinematic(kinematic = true)
    {
        // This function causes shit to float on the floor like it's water.
        return;

        if (kinematic)
        {
            this.body.setCollisionFlags(2); // kinematic
            this.body.setActivationState(4); // never sleep
        }
        else
        {
            // TODO: find out what these numbers meand
            this.body.setCollisionFlags(1);
            this.body.setActivationState(1);
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
    
    // TODO: rigidbodycube probably doesn't need this
    setRollingFriction(rollingFriction)
    {
        this.body.setRollingFriction(rollingFriction);
    }

    setPosition(position, rotation = null)
    {
        if (rotation === null)
            rotation = this.parentEntity.quaternion;

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        transform.setRotation(new Ammo.btQuaternion(rotation.x, rotation.y, rotation.z, rotation.w));
        this.motionState.setWorldTransform(transform);
        this.body.setWorldTransform(transform);

        return position;
    }
    
    deserialise(data)
    {
        // parentEntity has already been deserialised when components are deserialised,
        // so position is already set. we can then use that position to update the physics body
        this.setPosition(this.parentEntity.position);
    }
};
