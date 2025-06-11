import { BoxGeometry, MeshStandardMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/r177/examples/jsm/renderers/CSS2DRenderer.js";

import { Entity } from "./Entity.js";

import { ContainerComponent } from "./components/ContainerComponent.js";
import { GeometryComponent  } from "./components/GeometryComponent.js";

import * as MathUtility from "../MathUtility.js";

export class ActionStateMachine
{
    constructor(entity)
    {
        this.entity = entity;
        
        this.actions = [];
    }
    
    pushAction(action)
    {
        action.controller = this;
        
        this.actions.push(action);
        
        console.debug("Pushed new customer action.", action);
        
        if (this.actions.length == 1)
            action.onStart?.();
    }
    
    nextAction()
    {
		const lastAction = this.actions.shift();
		
		lastAction.onComplete?.();
		
		console.debug(`Finished last action, starting next customer action. ${this.actions.length} remaining.`);
        
		this.actions[0]?.onStart?.();
    }
    
    update(deltaTime)
    {
        this.actions[0]?.update?.(deltaTime);
    }
}

export class Action
{
    constructor()
    {
        this.controller = null;
        this.elapsedTime = 0;
    }
    
    update(deltaTime)
    {
        this.elapsedTime += deltaTime;
    }
    
    onStart() {}
    
    onPause() {}
    
    onResume() {}
    
    onComplete() {}
}

export class WaitAction extends Action
{
    constructor(time)
    {
        super();
        
        this.debug = `waiting for ${time} seconds`;
        
        this.waitTime = time;
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
        if (this.elapsedTime > this.waitTime)
            this.controller.nextAction();
    }
    
    onStart()
    {
        this.elapsedTime = 0;
    }
}

export class CheckoutAction extends WaitAction
{
    constructor(register)
    {
        super();
        
        this.register = register;
        
        this.maxWaitTime = 10;
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
        // TODO: check if register still exists
        
        if (this.elapsedTime > this.maxWaitTime)
        {
            console.error("Customer waited too long to checkout and is leaving the store without paying.");
            this.controller.entity.leaveStore();
            return;
        }
    }
    
    onStart()
    {
        this.elapsedTime = 0;
        
        console.debug("Started customer CheckoutAction.");
    }
    
    onComplete()
    {
        this.totalWaitTime += this.elapsedTime;
    }
}

export class MoveAction extends Action
{
    constructor(targetPosition)
    {
        super();
        
        this.targetPosition = targetPosition;
        
        this.debug = `moving to ${targetPosition.x}, ${targetPosition.y}, ${targetPosition.z}`;
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
		this.controller.entity.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.time);
		this.controller.entity.rotation.y = MathUtility.angleToPoint(this.controller.entity.position, this.targetPosition);
		
		if (this.elapsedTime > this.time)
		{
		    this.controller.entity.position.copy(this.targetPosition);
		    this.controller.nextAction();
		}
    }
    
    onStart()
    {
        super.onStart();
        
        this.startPosition = new Vector3();
        this.startPosition.copy(this.controller.entity.position);
        
        this.time = this.controller.entity.position.distanceTo(this.targetPosition) / 4;
        
        this.elapsedTime = 0;
        
        console.debug(`Started move action to ${this.targetPosition.x}, ${this.targetPosition.y}, ${this.targetPosition.z}.`);
    }
}

export class PickAction extends Action
{
    constructor(container, amount)
    {
        super();
        
        this.container = container;
        this.amount    = amount;
        this.pickedUp  = 0;

        this.maxWaitTime = 10;
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
        this.debug = `pick items<br/>${this.elapsedTime}s/${this.maxWaitTime}.<br/>${this.pickedUp}/${this.amount} items.`;
        
		const container = this.container.getComponent("ContainerComponent");
        
	    while (container.carriedItems.length > 0 && // the container has items
			   this.controller.entity.container.carriedItems.length < this.controller.entity.container.maxItems && // the customer hasn't hit their limit
			   this.pickedUp < this.amount) // we've picked up fewer than the requested items for this action
        {
		    this.container.getComponent("ContainerComponent").transferToCarrier(this.controller.entity);
			this.pickedUp++;
		    console.debug(`Picked up item ${this.pickedUp} (carrying ${this.controller.entity.container.carriedItems.length}) of ${this.amount}`);
        }
        
		// once they have all their items, start the next action
		if (this.controller.entity.container.carriedItems.length >= this.amount)
		{
			this.controller.entity.mood += 3;
			this.controller.entity.mood -= this.waitTime;
			
			console.debug("Customer finished picking.");
			
			this.controller.nextAction();
			return;
		}
		
		if (this.elapsedTime > this.maxWaitTime)
        {
		    
            if (this.controller.entity.container.carriedItems.length > 0)
            {
                console.error("Customer spent too much time waiting to pick, skipping to checkout.");
                this.controller.entity.cancelAndMoveToRegister();
            }
            else
            {
                console.error("Customer spent too much time waiting to pick and had no items, leaving store.");
                this.controller.entity.leaveStore();
            }
            
            return;
        }
    }
    
    onStart()
    {
        this.elapsedTime = 0;
    }
    
    onComplete()
    {
        this.totalWaitTime += this.elapsedTime;
    }
}

export class Customer extends Entity
{
	constructor(shop)
	{
		super();
		
		this.addComponent(new GeometryComponent(
			new BoxGeometry(1, 2, 1),
			new MeshStandardMaterial({ color: 0xaabbcc })
		));
		
		this.shop = shop;
		
		this.container = this.addComponent(new ContainerComponent);
		this.container.maxItems = 4;
		
		this.stateMachine = new ActionStateMachine(this);
		
		this.mood = 0;
		this.totalWaitTime = 0;
		
		this.checkedOut = false;
		
		this.labelDiv = document.createElement("div");
		this.labelDiv.textContent = "i bringeth pain";
		
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

	buyFromContainer(container, amount)
	{
	    this.stateMachine.pushAction(new MoveAction(container.position));
		this.stateMachine.pushAction(new PickAction(container, amount));
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
		
		console.debug("Customer leaving store.");
		
		this.stateMachine.actions.length = 0;
		this.stateMachine.pushAction(new MoveAction(this.shop.readyPosition));
		this.stateMachine.pushAction(new MoveAction(this.shop.spawnPosition));
	}
	
	cancelAndMoveToRegister()
	{
	    console.debug("Customer cancelled future actions and is heading to nearest register.");
	    
	    this.stateMachine.actions.length = 0;
	    this.stateMachine.pushAction(new MoveAction(this.findNearestRegister().position));
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
        this.stateMachine.update(deltaTime);
        
		super.update(deltaTime);
		
		this.labelDiv.innerHTML = `Action: ${this.stateMachine.actions[0]?.debug ?? "none"}<br/>Mood: ${this.mood}`;
	}
};