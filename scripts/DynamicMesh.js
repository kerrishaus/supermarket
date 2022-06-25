import { Mesh } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

export class DynamicMesh extends Mesh
{
    constructor(geometry, material)
    {
        super(geometry, material);
    }
    
    update()
    {
        
    }
};