import { Mesh, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EntityComponent } from "./EntityComponent.js";

export class GeometryComponent extends EntityComponent
{
    constructor(geometry, material)
    {
        super();

        this.mesh = new Mesh(geometry, material);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mesh.geometry.computeBoundingBox();

        // TODO: make sure it gets removed from the scene properly.
        // right now it just sits around wherever it was last
        scene.add(this.mesh);

        this.box = new Box3();
    }

    destructor()
    {
        super.destructor();

        scene.remove(this.mesh);
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        this.mesh.position.copy(this.parentEntity.position);

        this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
    }
};