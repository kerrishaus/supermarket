import { BoxGeometry, MeshStandardMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import * as MathUtility from "./MathUtility.js";

import { Entity } from "./entity/Entity.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";

export class Employee extends Entity
{
    constructor(shop)
    {
        super();

        this.addComponent(new ContainerComponent);

        this.addComponent(new GeometryComponent(
            new BoxGeometry(1, 1, 2),
            new MeshStandardMaterial({color: 0x42b6f5})
        ));

        this.shop = shop;

        this.speedModifier = 4;
        this.canCheckoutCustomers = false;

        this.actions = new Array();

        // time since last action was started
        this.elapsedTime = 0;
        // actionTime is the amount of time it will take to get
        // from the current position to the position of the action
        this.actionTime = 0;
        this.startPosition = new Vector3(0, 0, 0);
        this.targetPosition = new Vector3(0, 0, 0);

        const labelDiv = document.createElement("div");
        labelDiv.id = this.uuid;
        labelDiv.className = 'buyableTileTitle';
        labelDiv.textContent = name;

        this.label = new CSS2DObject(labelDiv);
        this.label.color = "white";
        this.add(this.label);
        this.label.element.textContent = "i am in pain";
    }

    pushAction(action)
    {
        this.actions.push(action);

        /*
        if (action.type == "move")
        {
            this.actionTime = this.position.distanceTo(action.position) / this.speedModifier;
            this.setTarget(action.position, this.actionTime);
        }
        */
        
        console.debug("added action");
        
        // if there are no actions,
        // focus this action immediately
        if (this.actions.length < 1)
            this.focusAction(action);
    }
    
    focusAction(action)
    {
        if (action.type == "move")
        {
            console.log("moving to", action.position);
            this.actionTime = this.position.distanceTo(action.position) / this.speedModifier;
            this.setTarget(action.position, this.actionTime);

            this.label.element.textContent = "moving";
        }
        else if (action.type == "pick")
        {
            this.actionTime = this.position.distanceTo(action.container.position) / this.speedModifier;
            this.setTarget(action.container.position, this.actionTime);

            this.label.element.textContent = "picking";
        }
        else if (action.type == "stock")
        {
            this.actionTime = this.position.distanceTo(action.container.position) / this.speedModifier;
            this.setTarget(action.container.position, this.actionTime);

            this.label.element.textContent = "stocking";
        } 
        
        console.debug("focused action");
    }

    nextAction()
    {
        console.debug("action complete");

        this.actions.shift();
                
        if (this.actions.length > 0)
            this.focusAction(this.actions[0]);
        else
            this.label.element.textContent = "idle";
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

        to.handledByEmployee = this;

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
                        action.container.getComponent("ContainerComponent").transferToCarrier(this);

                        // go to next action if we are carrying as much as we can OR
                        // if the container is now empty.
                        if (this.getComponent("ContainerComponent").carriedItems.length >= this.getComponent("ContainerComponent").maxItems ||
                            action.container.getComponent("ContainerComponent").carriedItems.length <= 0)
                            this.nextAction();
                    }
                    else if (action.type == "stock")
                    {
                        action.container.getComponent("ContainerComponent").transferFromCarrier(this);

                        // go to next action after stocking all carried items
                        if (this.getComponent("ContainerComponent").carriedItems.length <= 0)
                        {
                            action.container.getComponent("ContainerComponent").handledByEmployee = null;
                            this.nextAction();
                        }
                    }
                }
                // there are no remaining actions, do nothing
                else
                    this.position.copy(this.targetPosition);
            }
            else // the action time has not elapsed, meaning we should still be moving
            {
                this.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.actionTime);

                this.rotation.z = MathUtility.angleToPoint(this.position, this.targetPosition);
            }
        }
        else // no more actions, find a new one
        {
            /*
            if (this.shop.register.waitingCustomers.size > 0 && this.canCheckoutCustomers)
            {
                console.log("moving to checkout customers");
                this.pushAction({type: "move", position: this.shop.registerPosition});
            }
            else // nobody is waiting at the register
            */
            {
                let lowestContainer = null;

                // looks for the container with the lowest items, in order to fill it
                for (let container of this.shop.containerTiles)
                {
                    container = container.getComponent("ContainerComponent");

                    // TODO: change this to a not null check
                    if (container.handledByEmployee instanceof Employee)
                        continue;

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

        this.elapsedTime += deltaTime;

        super.update(deltaTime);
    }
};

