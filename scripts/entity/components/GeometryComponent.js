import { Mesh, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EntityComponent } from "./EntityComponent.js";

export class GeometryComponent extends EntityComponent
{
    init(geometry, material)
    {
        this.mesh = new Mesh(geometry, material);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mesh.geometry.computeBoundingBox();

        // TODO: make sure it gets removed from the scene properly.
        // right now it just sits around wherever it was last
        this.parentEntity.attach(this.mesh);

        this.box = new Box3();

        this.dontTrigger = false;
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
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

        this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
    }
};