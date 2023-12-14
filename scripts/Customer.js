import { BoxGeometry, MeshStandardMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import * as MathUtility from "./MathUtility.js";

import { Entity } from "./entity/Entity.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";

export class Customer extends Entity
{
    constructor(shop)
    {
        super();

        let containerComponent = this.addComponent(new ContainerComponent);
        containerComponent.maxItems = 4;

        this.addComponent(new GeometryComponent(
            new BoxGeometry(1, 1, 2),
            new MeshStandardMaterial({ color: 0xaabbcc })
        ));

        this.shop = shop;

        this.elapsedTime = 0;
        this.actionTime = 3;
        this.startPosition = new Vector3(0, 0, 0);
        this.targetPosition = new Vector3(0, 0, 0);

        this.waitTime = 0;
        this.leaveTime = 10; // in seconds
        this.mood = 0;

        this.checkedOut = false;
        
        this.actions = new Array();
    }

    pushAction(action)
    {
        this.actions.push(action);

        console.debug("added action: " + action.type);
        
        // if there are no actions,
        // focus this action immediately
        // TODO: make this < 1
        // it has to be <= because of a bug that causes customers to spawn in the middle of the store,
        // then walk to their ready position,
        // then do their shopping
        if (this.actions.length <= 1)
            this.focusAction(action);
    }
    
    focusAction(action)
    {
        if (action.type == "move")
        {
            console.debug("moving to", action.position);
            this.actionTime = this.position.distanceTo(action.position) / 4;
            this.setTarget(action.position, this.actionTime);
        }
        else if (action.type == "buy")
        {
            console.log("buying from " + action.container.name + " amount " + action.amount);
            this.actionTime = this.position.distanceTo(action.container.position) / 4;
            this.setTarget(action.container.position, this.actionTime);
        }
            
        console.debug("focused action:" + action.type, action);
    }

    nextAction()
    {
        console.debug("starting next action");

        this.actions.shift();
                
        if (this.actions.length > 0)
            this.focusAction(this.actions[0]);
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

    findNearestRegister()
    {
        let closestRegister = null;
        let closestRegisterPosition = 99999999999;
        for (const register of shop.registerTiles)
            if (this.position.distanceTo(register.position) < closestRegisterPosition)
                closestRegister = register;

        return closestRegister;
    }
    
    update(deltaTime)
    {
        if (this.elapsedTime > this.actionTime)
        {
            if (this.actions.length > 0)
            {                
                if (this.waitTime > this.leaveTime)
                {
                    this.waitTime = 0;

                    console.log("Customer waited too long and is leaving.");

                    this.actions.length = 0;

                    if (this.getComponent("ContainerComponent").carriedItems.length > 0)
                        this.pushAction({type: "move", position: this.findNearestRegister().position});

                    this.pushAction({type: "move", position: this.readyPosition});
                    this.pushAction({type: "move", position: this.spawnPosition});

                    this.mood -= 8;
                }
                else
                {
                    if (this.actions[0].type == "move")
                        this.nextAction();
                    else if (this.actions[0].type == "buy")
                    {
                        if (this.actions[0].container.getComponent("ContainerComponent").carriedItems.length > 0)
                        {
                            this.actions[0].container.getComponent("ContainerComponent").transferToCarrier(this);
                            
                            console.log(`Picked up item ${this.getComponent("ContainerComponent").carriedItems.length} of ${this.actions[0].amount}`);

                            this.mood += 1;
                            
                            // once they have all their items, start the next action
                            if (this.getComponent("ContainerComponent").carriedItems.length >= this.actions[0].amount)
                                this.nextAction();
                        }
                        else // keep waiting for enough items to become available
                            this.waitTime += deltaTime;
                    }
                }
            }
            else
                this.position.copy(this.targetPosition);
        }
        else // moving somewhere
        {
            this.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.actionTime);
            
            this.rotation.z = MathUtility.angleToPoint(this.position, this.targetPosition);
        }
        
        super.update(deltaTime);

        this.elapsedTime += deltaTime;
    }
};

