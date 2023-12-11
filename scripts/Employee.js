import { BoxGeometry, MeshStandardMaterial, Vector3, Box3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as MathUtility from "./MathUtility.js";

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

        if (action.type == "move")
        {
            this.actionTime = this.position.distanceTo(action.position) / this.speedModifier;
            this.setTarget(action.position, this.actionTime);
        }
        
        console.debug("added action");
        
        if (this.actions.length <= 1)
            this.focusAction(action);
    }
    
    focusAction(action)
    {
        if (action.type == "move")
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
        
        console.debug("focused action");
    }

    nextAction()
    {
        console.debug("action complete");

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
        console.log(`Gathering items from ${from.name} for ${to.name}.`);

        this.pushAction({
            type: "move",
            position: from.position,
        });

        this.pushAction({
            type: "pick",
            container: from,
        });

        this.pushAction({
            type: "move",
            position: to.position
        });

        this.pushAction({
            type: "stock",
            container: to,
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

                    if (action.type == "move")
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

                this.rotation.z = MathUtility.angleToPoint(this.position, this.targetPosition);
            }
        }
        else // no more actions, find a new one
        {
            if (this.shop.register.waitingCustomers.size > 0)
            {
                console.log("moving to checkout customers");
                this.pushAction({type: "move", position: this.shop.registerPosition});
            }
            else // nobody is waiting at the register
            {
                let lowestContainer = null;

                for (const container of this.shop.containerTiles)
                {
                    if (container.carriedItems.length < container.maxItems)
                    {
                        if (lowestContainer === null)
                            lowestContainer = container;

                        if (container.carriedItems.length < lowestContainer.carriedItems.length)
                            lowestContainer = container;
                    }
                }

                if (lowestContainer !== null)
                {
                    let highestGenerator = null;
                    
                    for (const generator of this.shop.generatorTiles)
                        if (generator.itemType == lowestContainer.itemType)
                        {
                            if (generator.carriedItems.length <= 0)
                                continue;

                            if (highestGenerator === null)
                                highestGenerator = generator;

                            if (generator.carriedItems.length > highestGenerator.carriedItems.length)
                                highestGenerator = generator;
                        }

                    if (highestGenerator !== null)
                        this.gatherItemsFromAndTakeTo(highestGenerator, lowestContainer);
                }
            }
        }

        super.update(deltaTime);

        this.elapsedTime += deltaTime;
    }
};

