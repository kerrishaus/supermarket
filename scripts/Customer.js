import { BoxGeometry, MeshStandardMaterial, Vector3, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as MathUtility from "./MathUtility.js";

import { ItemCarrier } from "./ItemCarrier.js";

export class Customer extends ItemCarrier
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

        this.waitTime = 0;
        this.leaveTime = 10; // in seconds
        
        this.actions = new Array();
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
            this.actionTime = this.position.distanceTo(action.position) / 4;
            this.setTarget(action.position, this.actionTime);
        }
        else if (action.type == "buy")
        {
            this.actionTime = this.position.distanceTo(action.container.position) / 4;
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
                    this.nextAction();
                else if (this.actions[0].type == "buy")
                {
                    if (this.actions[0].container.carriedItems.length > 0)
                    {
                        this.actions[0].container.transferToCarrier(this);
                        
                        console.log(`Picking up item ${this.carriedItems.length} of ${this.actions[0].amount}`);
                        
                        if (this.carriedItems.length >= this.actions[0].amount)
                            this.nextAction();
                    } // else, keep waiting for enough items to become available
                    else
                    this.waitTime += deltaTime;
                }
            }
            else
                this.position.copy(this.targetPosition);
        }
        else
        {
            this.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.actionTime);
            
            this.rotation.z = MathUtility.angleToPoint(this.position, this.targetPosition);
        }
        
        super.update(deltaTime);

        this.elapsedTime += deltaTime;
    }
};

