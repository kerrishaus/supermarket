import { Mesh } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { OBB } from 'https://kerrishaus.com/assets/threejs/r177/examples/jsm/math/OBB.js';

import { EntityComponent } from "./EntityComponent.js";

export class GeometryComponent extends EntityComponent
{
    init(geometry, material)
    {
        geometry.computeBoundingBox();
        geometry.userData.obb = new OBB().fromBox3(geometry.boundingBox);

        this.mesh = new Mesh(geometry, material);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mesh.userData.obb = new OBB();

        this.parentEntity.add(this.mesh);

        this.dontTrigger = false;
    }
    
    destructor()
    {
        super.destructor();

        this.parentEntity.remove(this.mesh);

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
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

        this.mesh.userData.obb.copy(this.mesh.geometry.userData.obb);
        this.mesh.userData.obb.applyMatrix4(this.mesh.matrixWorld);
    }
};