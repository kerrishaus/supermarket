import { BoxGeometry, MeshBasicMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { DynamicMesh } from "./DynamicMesh.js";

export class Carryable extends DynamicMesh
{
    constructor(width, height, thickness, color)
    {
        const geometry = new BoxGeometry(width, height, thickness);
        const material = new MeshBasicMaterial({color: color});
        
        super(geometry, material);
        
        this.offset         = new Vector3(0, 0, 0);
        this.owner          = new Vector3(0, 0, 0);
        this.targetPosition = new Vector3(0, 0, 0);
        this.startPosition  = new Vector3(0, 0, 0);
        
        this.elapsedTime = 0;
        this.moveTime = 0.4;
        
        this.autoPositionAfterAnimation = true;
    }
    
    setTarget(owner, offset)
    {
        this.startPosition.copy(this.position);
        this.updateTarget(owner, offset);
        this.elapsedTime = 0;
    }
    
    updateTarget(owner, offset)
    {
        if (!(owner instanceof Vector3))
        {
            console.error("owner not instance of Vector3", owner);
            return
        }
        
        if (!(offset instanceof Vector3))
        {
            console.error("offset not instance of Vector3", offset);
            return
        }
        
        this.owner.copy(owner);
        this.offset.copy(offset);
        
        this.targetPosition = new Vector3(this.owner.x + this.offset.x,
                                                this.owner.y + this.offset.y,
                                                this.owner.z + this.offset.z);
    }
    
    update(deltaTime)
    {
        if (this.elapsedTime > this.moveTime)
        {
            if (this.autoPositionAfterAnimation)
                this.position.copy(this.targetPosition);
                
            return;
        }
        
        this.elapsedTime += deltaTime;
        this.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.moveTime);
    }
};