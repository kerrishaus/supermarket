import { Mesh, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

export class DynamicMesh extends Mesh
{
    constructor(geometry, material)
    {
        super(geometry, material);

        this.castShadow = true;
        this.receiveShadow = true;

        this.geometry.computeBoundingBox();

        this.box = new Box3();
    }
    
    update(deltaTime)
    {
        this.box.copy(this.geometry.boundingBox).applyMatrix4(this.matrixWorld);
    }
};