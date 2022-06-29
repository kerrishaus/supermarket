import { BoxGeometry, MeshBasicMaterial, Vector3, Quaternion, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { DynamicMesh } from "./DynamicMesh.js";

export class Customer extends DynamicMesh
{
    constructor()
    {
        const geometry = new BoxGeometry(0.8, 0.8, 0.8);
        const material = new MeshBasicMaterial({color: 0xaabbcc});
        
        super(geometry, material);
        
        this.geometry.computeBoundingBox();
        this.box = new Box3();
        
        this.elapsedTime = 0;
        this.actionTime = 3;
        this.startPosition = new Vector3(0, 0, 0);
        this.targetPosition = new Vector3(0, 0, 0);
        
        this.carriedItems = new Array();
        
        this.actions = new Array();
        
        return this;
    }
    
    pushAction(action)
    {
        this.actions.push(action);
        
        console.log("added action");
        
        if (this.actions.length <= 1)
            this.focusAction(action);
    }
    
    focusAction(action)
    {
        if (action.type == "move")
        {
            console.log("moving to", action.position);
            this.setTarget(action.position, this.actionTime);
        }
            
        console.log("focused action");
    }
    
    setTarget(endPosition, actionTime)
    {
        if (!(endPosition instanceof Vector3))
        {
            console.error("endPosition must be a Vector3");
            return
        }
        
        this.elapsedTime = 0;
        this.startPosition.copy(this.position);
        this.targetPosition.copy(endPosition);
        this.actionTime = actionTime;
    }
    
    update(deltaTime)
    {
        if (this.elapsedTime > this.actionTime)
        {
            if (this.actions.length > 0)
            {
                console.log("action complete");
                
                this.actions.shift();
            
                if (this.actions.length > 0)
                {
                    this.focusAction(this.actions[0]);
                    return; // prevents jumping to endPosition and then doing the movement
                }
            }
            
            this.position.copy(this.targetPosition);
            return;
        }
        
        this.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.actionTime);
        
        this.box.copy(this.geometry.boundingBox).applyMatrix4(this.matrixWorld);
        
        this.elapsedTime += deltaTime;
    }
};

