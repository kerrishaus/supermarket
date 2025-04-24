import { BoxGeometry, MeshStandardMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Entity } from "./entity/Entity.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";

import * as MathUtility from "./MathUtility.js";

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
		
		this.labelDiv = document.createElement("div");
		this.labelDiv.textContent = "i am in pain";
		
		const label = new CSS2DObject(this.labelDiv);
		label.color = "white";
		this.add(label);
	}

	// TODO: the label should automatically be destroyed when Customer is destroyed
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
			this.actionTime = this.position.distanceTo(action.position) / 4;
			this.setTarget(action.position, this.actionTime);
		}
		else if (action.type == "buy")
		{
			console.log("buying from " + action.container.name + " amount " + action.amount);
			this.actionTime = this.position.distanceTo(action.container.position) / 4;
			this.setTarget(action.container.position, this.actionTime);
		}
		else if (action.type == "waitToCheckout")
		{
		    this.waitTime = 0;
		}
		
		this.labelDiv.textContent = action.debug ?? "no debug info";
		console.debug("focused action:" + action.type, action);
	}

	nextAction()
	{
		console.debug("starting next action");
		
		const lastAction = this.actions.shift();
		
		if (this.actions.length > 0)
			this.focusAction(this.actions[0]);
		else
        {
            if (lastAction.type == "waitToCheckout")
                this.leaveStore();
            else
			    this.labelDiv.textContent = "finished all actions";
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
    
	findNearestRegister()
	{
		let closestRegister = null;
		// TODO: this could be improved
		let closestRegisterPosition = 99999999999;
		
		for (const register of shop.registerTiles)
			if (this.position.distanceTo(register.position) < closestRegisterPosition)
				closestRegister = register;
		
		return closestRegister;
	}
	
	leaveStore()
	{
		// TODO: if they have items, discard them
		
		this.actions.length = 0;
		this.pushAction({ type: "move", position: this.shop.readyPosition, debug: "to ready position, leaving" });
		this.pushAction({ type: "move", position: this.shop.spawnPosition, debug: "to spawn position, leaving" });
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
					
					if (this.getComponent("ContainerComponent").carriedItems.length > 0)
					{
					    // give up and move to the next action. If there is no next action, move to the register.
					    if (this.actions.length >= 1)
                            this.nextAction();
                        else
                        {
                            this.actions.length = 0;
                            this.pushAction({type: "move", position: this.findNearestRegister().position, debug: "moving angrily to the register" });
                        }
					}
					else
					    // TODO: need to drop the items, they just steal them right now lmao
					    this.leaveStore();
					
					this.mood -= this.waitTime;
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
							
							console.debug(`Picked up item ${this.getComponent("ContainerComponent").carriedItems.length} of ${this.actions[0].amount}`);
							
							this.mood -= this.waitTime;
							
							// once they have all their items, start the next action
							if (this.getComponent("ContainerComponent").carriedItems.length >= this.actions[0].amount)
								this.nextAction();
						}
						else // keep waiting for enough items to become available
						{
							this.waitTime += deltaTime;
							this.labelDiv.textContent = this.waitTime;
						}
					}
					else if (this.actions[0].type == "waitToCheckout")
					{
					    this.waitTime += deltaTime;
						this.labelDiv.textContent = this.waitTime;
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