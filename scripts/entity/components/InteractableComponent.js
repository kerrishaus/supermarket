import { Mesh, BoxGeometry, MeshBasicMaterial } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { OBB } from "https://kerrishaus.com/assets/threejs/examples/jsm/math/OBB.js";

import { EntityComponent } from "./EntityComponent.js";

export class InteractableComponent extends EntityComponent
{
    init(sizeX, sizeY, sizeZ)
    {
        this.triggerGeometry = new Mesh(
            new BoxGeometry(sizeX, sizeY, sizeZ),
            new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 })
        );
        
        this.triggerGeometry.geometry.computeBoundingBox();
        this.triggerGeometry.geometry.userData.obb = new OBB().fromBox3(this.triggerGeometry.geometry.boundingBox);

        this.triggerGeometry.userData.obb = new OBB();
        
        // reference to this function lol
        this.triggerGeometry.onInteract = () => { this.onInteract(); };

        this.parentEntity.add(this.triggerGeometry);
    }

    destructor()
    {
        super.destructor();

        this.parentEntity.remove(this.triggerGeometry);
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        // TODO: this kind of thing needs to be updated immediately when the object is moved, otherwise
        this.triggerGeometry.userData.obb.copy(this.triggerGeometry.geometry.userData.obb);
        this.triggerGeometry.userData.obb.applyMatrix4(this.triggerGeometry.matrixWorld);
    }
    
    onInteract(object)
    {
        console.log("Unused interaction!");
    }
};