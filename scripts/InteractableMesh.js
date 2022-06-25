import { BoxGeometry, MeshBasicMaterial, Mesh, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { DynamicMesh } from "./DynamicMesh.js";

export class Interactable extends DynamicMesh
{
    constructor(width, length, triggerWidth, triggerLength, color)
    {
        const geometry = new BoxGeometry(width, length, 1);
        const material = new MeshBasicMaterial({ color: color });
        
        super(geometry, material);
        
        const triggerGeometry = new BoxGeometry(triggerWidth, triggerLength, 0.1);
        const triggerMaterial = new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });
        
        this.triggerObject = new Mesh(triggerGeometry, triggerMaterial);
        this.triggerObject.geometry.computeBoundingBox();
        this.attach(this.triggerObject);
        this.triggerObject.position.z -= 0.4;
        
        this.trigger = new Box3();
        
        this.triggered = false;
        this.triggeringObjects = new Array();
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
        this.trigger.copy(this.triggerObject.geometry.boundingBox).applyMatrix4(this.triggerObject.matrixWorld);
    }
    
    onTrigger(object)
    {
        if (this.triggeringObjects.includes(object))
            return;
        
        this.triggered = true;
        this.triggeringObjects.push(object);
        
        this.triggerObject.material.color.setHex(0x00ff00);
    }
    
    onStopTrigger(object)
    {
        if (!this.triggered)
            return;
            
        if (!this.triggeringObjects.includes(object))
            return;
            
        this.triggeringObjects.splice(this.triggeringObjects.indexOf(object), 1);
        
        if (this.triggeringObjects.length <= 0)
        {
            this.triggered = false;
            this.triggerObject.material.color.setHex(0xff0000);
        }
    }
};