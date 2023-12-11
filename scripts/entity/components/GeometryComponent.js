import { Mesh, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EntityComponent } from "./EntityComponent.js";

export class GoemetryComponent extends EntityComponent
{
    constructor(geometry, material)
    {
        super();

        this.mesh = new Mesh(geometry, material);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mesh.geometry.computeBoundingBox();

        this.box = new Box3();
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

        this.mesh.position.copy(this.parentEntity.position);

        this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
    }
};