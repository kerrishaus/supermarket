import { Vector3 } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { createMoney } from "../../GeometryUtility.js";

import { Entity   } from "../Entity.js";
import { Player	  } from "../Player.js";
import { Employee } from "../Employee.js";
import { Customer, CheckoutAction } from "../Customer.js";

import { TriggerComponent } from "../components/TriggerComponent.js";
import { ModelComponent   } from "../components/ModelComponent.js";

export class Register extends Entity
{
	constructor()
	{
		super();
		
		const trigger = this.addComponent(new TriggerComponent(4, 2, 4));
		trigger.triggerGeometry.position.x -= 1;
		trigger.triggerGeometry.position.y -= 1;
		trigger.triggerGeometry.position.z;
		
		const model = this.addComponent(new ModelComponent("tiles/cash-register")).model;

		model.position.x -= 1;
		model.position.y -= 1;
		model.scale.set(4, 4, 4);
		
		this.name = "register";

		this.handledByEmployee = false;
		
		this.money = [];
		
		this.column_ = 0;
		this.row_ = 0;
		this.layer_ = 0;
		
		this.gridRows = 6;
		this.gridColumns = 6;
		
		this.moneyLength = 0.4;
		this.moneyWidth = 0.2;
		this.moneyThickness = 0.05;
		
		this.waitingCustomers = [];
		
		this.playerIsInContact   = false;
		this.employeeIsInContact = false;
		this.handledByEmployee   = null;
		
		this.addEventListener("trigger", (event) =>
		{
    		if (event.object instanceof Player)
    		{
    			this.transferMoney(event.object);
    			
    			if (!this.playerIsInContact)
    			{
    				console.debug("Player is at register.");
    				this.playerIsInContact = true;
    			}
    		}
    		else if (event.object instanceof Employee)
    		{
    			if (!this.employeeIsInContact)
    			{ 
    				console.debug("Employee is at the register.");
    				this.employeeIsInContact = true;
    			}
    		}
    		else if (event.object instanceof Customer)
    		{
    		    if (event.object.stateMachine.actions[0] instanceof CheckoutAction)
    		    {
        			if (!event.object.checkedOut && !this.waitingCustomers.includes(event.object))
        			{
        				console.debug("Customer is now waiting to check out.", event.object);
        				
        				this.waitingCustomers.push(event.object);
        				
        				$("#waitingCustomers").text(this.waitingCustomers.length);
        			}
    		    }
    		}
		});
		
		this.addEventListener("stopTrigger", (event) =>
		{
    		if (event.object instanceof Player)
    		{
    			console.debug("Player has left the register.");
    			this.playerIsInContact = false;
    		}
    		
    		if (event.object instanceof Employee)
    		{
    			console.debug("Employee has left the register.");
    			this.employeeIsInContact = false;
    		}
		});
	}
	
	update(deltaTime)
	{
		// this checks out 1 waiting customer per frame.
		// TODO: in the future, this could be given a waitTimer and made an upgrade for the register.
		if (this.waitingCustomers.length > 0 && (this.playerIsInContact || this.employeeIsInContact))
		{
			const customer = this.waitingCustomers[0];
			
			for (let i = 0; i < customer.getComponent("ContainerComponent").carriedItems.length; i++)
				this.addMoney(customer.position);
				
			console.log("Sold " + customer.getComponent("ContainerComponent").carriedItems.length + " items.");
			
			customer.finishCheckout();
			
			this.waitingCustomers.shift();
		}
		
		super.update(deltaTime);
	}
	
	addMoney()
	{
		this.calculateGrid();
		
		const money = createMoney();
		money.forPlayer = true;
		
		money.position.copy(this.position);
		money.getComponent("CarryableComponent").setTarget(this.position, new Vector3(this.column_ * this.moneyLength - 0.6 - 1,
		                                                   this.position.z - (this.scale.z / 2) + (this.layer_ * this.moneyThickness) + this.moneyThickness / 2),
														   this.row_ * this.moneyWidth - 0.5);
		
		scene.add(money);
		this.money.push(money);
	}
	
	transferMoney(player)
	{
		if (this.money.length <= 0)
			return;
			
		const money = this.money[this.money.length - 1];
		
		money.getComponent("CarryableComponent").setTarget(player.position, new Vector3(0, 0, 0));
		
		player.carriedMoney.push(money);
		
		this.money.pop();
		
		this.calculateGrid();
		
		player.addMoney(5);
	}
	
	calculateGrid()
	{
		this.column_ = 0;
		this.row_	 = 0;
		this.layer_  = 0;
		
		for (let i = 0; i < this.money.length; i++)
		{
			this.column_ += 1;
			
			if (this.column_ >= this.gridColumns)
			{
				this.column_ = 0;
				this.row_ += 1;
			}
			
			if (this.row_ >= this.gridRows)
			{
				this.row_ = 0;
				this.layer_ += 1;
			}
		}
	}
};
