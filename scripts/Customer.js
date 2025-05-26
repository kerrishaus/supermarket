import { BoxGeometry, MeshStandardMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Entity } from "./entity/Entity.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { RigidBodyComponent } from "./entity/components/RigidBodyComponent.js";

import * as MathUtility from "./MathUtility.js";

export class Customer extends Entity
{
	#container;

	constructor(shop)
	{
		super();
		
		this.#container = this.addComponent(new ContainerComponent);
		this.#container.maxItems = 4;
		
		this.addComponent(new RigidBodyComponent(
			new BoxGeometry(1, 1, 2),
			new MeshStandardMaterial({ color: 0xaabbcc }),
			0
		));
		
		this.shop = shop;
		
		this.actions = [];
		
		this.elapsedTime = 0;
		this.actionTime = 3;
		this.startPosition = new Vector3(0, 0, 0);
		this.targetPosition = new Vector3(0, 0, 0);
		
		this.waitTime = 0;
		this.leaveTime = 10; // in seconds
		this.mood = 0;
		
		this.checkedOut = false;
		
		this.labelDiv = document.createElement("div");
		this.labelDiv.textContent = "i am in pain";
		
		const label = new CSS2DObject(this.labelDiv);
		label.color = "white";
		this.add(label);
	}
    
	// TODO: the label should automatically be destroyed when Customer is destroyed
	destructor()
	{
		this.labelDiv.remove();
		
		super.destructor();
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

	buyFromContainer(container, amount)
	{
		this.pushAction({
			type: "buy",
			container: container,
			amount: amount,
			pickedUp: 0, // used to track how many of the desired item the customer has picked up so far
			debug: `Buy from ${container.name}.`
		});
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

	finishCheckout()
	{
		this.checkedOut = true;
		this.mood += 3;
		this.mood -= this.waitTime;
		this.leaveStore();
	}
	
	update(deltaTime)
	{
	    this.elapsedTime += deltaTime;
	    
		if (this.elapsedTime > this.actionTime)
		{
			if (this.actions.length > 0)
			{				
				if (this.waitTime > this.leaveTime)
				{
					console.log("Customer waited too long and is leaving.");
					
					if (this.#container.carriedItems.length > 0)
					{
					    // give up and move to the next action. If there is no next action, move to the register.
					    if (this.actions.length >= 1)
                            this.nextAction();
                        else
                        {
                            this.actions.length = 0;
                            this.pushAction({type: "move", position: this.findNearestRegister().position, debug: "moving angrily to the register" });
                        }

						this.mood -= this.waitTime / 2;
					}
					else // waited too long at the register
					{
						this.mood -= this.waitTime;
						// TODO: need to drop the items or something. right now they just take them lol
					    this.leaveStore();
					}

					this.waitTime = 0;
				}
				else
				{
					if (this.actions[0].type == "move")
						this.nextAction();
					else if (this.actions[0].type == "buy")
					{
						const action = this.actions[0];
						const container = action.container.getComponent("ContainerComponent");

					    while (container.carriedItems.length > 0 && // the container has items
							   this.#container.carriedItems.length < this.#container.maxItems && // the customer hasn't hit their limit
							   action.pickedUp < action.amount) // we've picked up fewer than the requested items for this action
					    {
						    action.container.getComponent("ContainerComponent").transferToCarrier(this);
							action.pickedUp++;
						    console.debug(`Picked up item ${action.pickedUp} (carrying ${this.#container.carriedItems.length}) of ${action.amount}`);
					    }
					    
						// once they have all their items, start the next action
						if (this.#container.carriedItems.length >= action.amount)
						{
							this.mood += 3;
							this.mood -= this.waitTime;
							
							this.nextAction();
						}
						else // otherwise keep waiting for enough items to become available
						{
							this.waitTime += deltaTime;
						}
					}
					else if (this.actions[0].type == "waitToCheckout")
					{
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
		
		this.labelDiv.innerHTML = `Action: ${this.actions[0]?.debug ?? "none"}<br/>Wait: ${this.waitTime}<br/>Mood: ${this.mood}`;
	}
};