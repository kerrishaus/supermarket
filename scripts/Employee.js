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
        this.startPosition = new Vector3(0, 0, 0.5);
        this.targetPosition = new Vector3(0, 0, 0.5);

        this.labelDiv = document.createElement("div");
        this.labelDiv.textContent = "i am in pain";

        const label = new CSS2DObject(this.labelDiv);
        label.color = "white";
        this.add(label);
    }

    destructor()
    {
        super.destructor();

        this.labelDiv.remove();
    }

    pushAction(action)
    {
        // if there are no actions,
        // focus this action immediately
        if (this.actions.length < 1)
        {
            console.debug("focused action because there are no other actions", action);
            this.focusAction(action);
        }
        
        this.actions.push(action);

        console.debug("added action: " + action.type, action);
    }
    
    focusAction(action)
    {
        if (action.type == "move")
        {
            console.debug("moving to", action.position);
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

        this.labelDiv.textContent = action.type;
        
        console.debug("focused action");
    }

    nextAction()
    {
        console.debug("action complete");

        this.actions.shift();
                
        if (this.actions.length > 0)
            this.focusAction(this.actions[0]);
        else
            this.labelDiv.textContent = "idle";
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
                        action.container.getComponent("GeneratorComponent").transferToCarrier(this);

                        // go to next action if we are carrying as much as we can OR
                        // if the container is now empty.
                        if (this.getComponent("ContainerComponent").carriedItems.length >= this.getComponent("ContainerComponent").maxItems ||
                            action.container.getComponent("GeneratorComponent").carriedItems.length <= 0)
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
            if (this.canCheckoutCustomers)
            {
                for (const register of this.shop.registerTiles)
                {
                    if (register.waitingCustomers.length < 1)
                        continue;

                    console.log("moving to checkout customers");
                    this.pushAction({ type: "move", position: register.position });
                }
            }
            else // nobody is waiting at the register
            {
                let lowestContainer = null;

                // looks for container with least items
                for (const tile of this.shop.containerTiles)
                {
                    const container = tile.getComponent("ContainerComponent");

                    // TODO: change this to a not null check
                    if (container.handledByEmployee instanceof Employee)
                        continue;

                    if (container.carriedItems.length < container.maxItems)
                    {
                        if (lowestContainer === null)
                            lowestContainer = tile;

                        if (container.carriedItems.length < lowestContainer.getComponent("ContainerComponent").carriedItems.length)
                            lowestContainer = tile;
                    }
                }

                // now look for generator with highest count of desired item
                if (lowestContainer !== null)
                {
                    let highestGenerator = null;
                    
                    for (const tile of this.shop.generatorTiles)
                    {
                        const generator = tile.getComponent("GeneratorComponent");

                        if (generator.itemType == lowestContainer.getComponent("ContainerComponent").itemType)
                        {
                            if (generator.carriedItems.length < 1)
                                continue;

                            if (highestGenerator === null)
                                highestGenerator = tile;

                            if (generator.carriedItems.length > highestGenerator.getComponent("GeneratorComponent").carriedItems.length)
                                highestGenerator = tile;
                        }
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

