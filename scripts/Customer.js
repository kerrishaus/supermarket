import { BoxGeometry, MeshStandardMaterial, Vector3, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { DynamicMesh } from "./DynamicMesh.js";

export class Customer extends DynamicMesh
{
    constructor()
    {
        const geometry = new BoxGeometry(1, 1, 2);
        const material = new MeshStandardMaterial({color: 0xaabbcc});
        
        super(geometry, material);
        
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

        if (action.type == "buy")
            console.log("buying from " + action.container.name + " amount " + action.amount);
        
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
        else if (action.type == "buy")
        {
            this.setTarget(action.container.position, this.actionTime);
        }
            
        console.log("focused action");
    }

    nextAction()
    {
        console.log("action complete");

        this.actions.shift();
                
        if (this.actions.length > 0)
        {
            this.focusAction(this.actions[0]);
            return; // prevents jumping to endPosition and then doing the movement
        }
    }
    
    setTarget(endPosition, actionTime)
    {
        if (!(endPosition instanceof Vector3))
        {
            console.error("endPosition must be a Vector3");
            return;
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
                if (this.actions[0].type == "move")
                {
                    this.nextAction();
                    return;
                }
                else if (this.actions[0].type == "buy")
                {
                    if (this.actions[0].container.carriedItems.length > 0)
                    {
                        this.actions[0].container.transferToCarrier(this);

                        console.log("taking item from container. " + this.actions[0].amount + " " + this.carriedItems.length);

                        if (this.carriedItems.length >= this.actions[0].amount)
                        {
                            this.nextAction();
                            return;
                        }
                    } // else, keep waiting for enough items to become available
                }
            }
            
            this.position.copy(this.targetPosition);
            return;
        }
        
        this.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.actionTime);
        
        let y2 = this.targetPosition.y, y1 = this.position.y;
        let x2 = this.targetPosition.x, x1 = this.position.x;
        let angle = Math.atan2( y2 - y1, x2 - x1 ) - 1.5708;
        this.rotation.z = angle;

        let iterations = 0;
        for (const item of this.carriedItems)
        {
            const carryPos = this.scale.z + (item.scale.z * iterations);
            
            if (item.elapsedTime > item.moveTime)
            {
                item.position.copy(this.position);
                item.position.z += carryPos;
                continue;
            }
            
            item.updateTarget(this.position, new Vector3(0, 0, carryPos));
        }
        
        super.update(deltaTime);

        this.elapsedTime += deltaTime;
    }
};

