import { BoxGeometry, MeshStandardMaterial, Vector3, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { ItemCarrier } from "./ItemCarrier.js";

export class Employee extends ItemCarrier
{
    constructor(shop)
    {
        const geometry = new BoxGeometry(1, 1, 2);
        const material = new MeshStandardMaterial({color: 0x42b6f5});
        
        super(geometry, material);

        this.shop = shop;
        
        this.elapsedTime = 0;
        this.actionTime = 3;
        this.speedModifier = 4;
        this.startPosition = new Vector3(0, 0, 0);
        this.targetPosition = new Vector3(0, 0, 0);

        this.actions = new Array();
    }

    pushAction(action)
    {
        this.actions.push(action);

        if (action.type == "goto")
        {
            this.actionTime = this.position.distanceTo(action.position) / this.speedModifier;
            this.setTarget(action.position, this.actionTime);
        }
        
        console.log("added action");
        
        if (this.actions.length <= 1)
            this.focusAction(action);
    }
    
    focusAction(action)
    {
        if (action.type == "goto")
        {
            console.log("moving to", action.position);
            this.actionTime = this.position.distanceTo(action.position) / this.speedModifier;
            this.setTarget(action.position, this.actionTime);
        }
        else if (action.type == "pick")
        {
            this.actionTime = this.position.distanceTo(action.container.position) / this.speedModifier;
            this.setTarget(action.container.position, this.actionTime);
        }
        else if (action.type == "stock")
        {
            this.actionTime = this.position.distanceTo(action.container.position) / this.speedModifier;
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

    gatherItemsFromAndTakeTo(from, to)
    {
        console.log("Gathering items from and taking them to");

        this.pushAction({
            type: "goto",
            position: from.position,
        });

        this.pushAction({
            type: "pick",
            container: from,
        });

        this.pushAction({
            type: "goto",
            position: to.position
        });

        this.pushAction({
            type: "stock",
            container: to,
        });

        this.pushAction({
            type: "goto",
            position: new Vector3(0, 0, 0)
        });
    }
    
    update(deltaTime)
    {
        if (this.actions.length > 0)
        {
            // carry out the actions queue

            if (this.elapsedTime > this.actionTime)
            {
                // finish the current action, and move on to the next
                if (this.actions.length > 0)
                {
                    const action = this.actions[0];

                    if (action.type == "goto")
                        this.nextAction();   
                    else if (action.type == "pick")
                    {
                        action.container.transferToCarrier(this);

                        // go to next action after picking as many items as we can carry
                        if (this.carriedItems.length >= this.carryLimit)
                            this.nextAction();
                    }
                    else if (action.type == "stock")
                    {
                        action.container.transferFromCarrier(this);

                        // go to next action after stocking all carried items
                        if (this.carriedItems.length <= 0)
                            this.nextAction();
                    }
                }
                // there are no remaining actions, do nothing
                else
                    this.position.copy(this.targetPosition);
            }
            else
            {
                this.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.actionTime);
            
                let y2 = this.targetPosition.y, y1 = this.position.y;
                let x2 = this.targetPosition.x, x1 = this.position.x;
                let angle = Math.atan2( y2 - y1, x2 - x1 ) - 1.5708;
                this.rotation.z = angle;
            }
        }
        else
        {
            for (const container of this.shop.containerTiles)
            {
                if (container.carriedItems < container.maxItems)
                {
                    let actionStarted = false;

                    for (const generator of this.shop.generatorTiles)
                    {
                        if (generator.itemType == container.itemType)
                        {
                            if (generator.carriedItems.length > 0)
                            {
                                this.gatherItemsFromAndTakeTo(generator, container);
                                actionStarted = true;
                                break;
                            }
                        }
                    }

                    if (actionStarted)
                        break;
                }
            }
        }

        super.update(deltaTime);

        this.elapsedTime += deltaTime;
    }
};

