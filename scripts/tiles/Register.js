import { BoxGeometry, Vector3, TextureLoader, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { createMoney } from "../geometry/GeometryUtility.js";

import { Player      } from "../Player.js";
import { Customer    } from "../Customer.js";
import { Employee    } from "../Employee.js";

import { Entity             } from "../entity/Entity.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { TriggerComponent   } from "../entity/components/TriggerComponent.js";
import { GeometryComponent  } from "../entity/components/GeometryComponent.js";

export class Register extends Entity
{
    constructor()
    {
        super();

        this.addComponent(new TriggerComponent(7, 3, 2));

        this.addComponent(new GeometryComponent(
            new BoxGeometry(6, 2, 1), 
            new MeshStandardMaterial({ color: 0xB27641 })
        )).mesh.position.z -= 0.5;

        this.name = "register";
        
        this.money = new Array();
        
        this.column_ = 0;
        this.row_ = 0;
        this.layer_ = 0;
        
        this.gridRows = 6;
        this.gridColumns = 6;
        
        this.moneyLength = 0.4;
        this.moneyWidth = 0.2;
        this.moneyThickness = 0.1;

        this.waitingCustomers = new Map();

        this.playerIsInContact   = false;
        this.employeeIsInContact = false;
    }

    update(deltaTime)
    {
        if (this.waitingCustomers.size > 0 && (this.playerIsInContact || this.employeeIsInContact))
        {
            console.log("taking care of customers at the register");
            
            // TODO: don't do this all in one go in the future
            
            this.waitingCustomers.forEach((customer, uuid, map) => 
            {
                console.log("selling " + customer.getComponent("ContainerComponent").carriedItems.length + " items");
                
                for (let i = 0; i < customer.getComponent("ContainerComponent").carriedItems.length; i++)
                    this.addMoney(customer.position);

                this.waitingCustomers.delete(uuid);

                customer.checkedOut = true;
                
                // clear the customer's actions and then set it to leave
                customer.actions.length = 0;
                customer.pushAction({ type: "move", position: shop.readyPosition, debug: "to ready position, leaving" });
                customer.pushAction({ type: "move", position: shop.spawnPosition, debug: "to spawn position, leaving" });
            });
            
            $("#waitingCustomers").text(this.waitingCustomers.size);
        }

        super.update(deltaTime);
    }
    
    addMoney()
    {
        this.calculateGrid();
        
        const money = createMoney();
        money.forPlayer   = true;
        
        money.position.copy(this.position);
        money.getComponent("CarryableComponent").setTarget(this.position, new Vector3(this.column_ * this.moneyLength - 0.6 - 1,
                                                            this.row_ * this.moneyWidth - 0.5,
                                                            this.position.z - (this.scale.z / 2) + (this.layer_ * this.moneyThickness) + this.moneyThickness / 2));
        
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
        this.row_    = 0;
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
    
    onTrigger(object)
    {
        if (object instanceof Player)
        {
            this.transferMoney(object);
            
            if (!this.playerIsInContact)
            {
                console.log("player is at register");
                this.playerIsInContact = true;
            }
        }

        if (object instanceof Employee)
            if (!this.employeeIsInContact)
            { 
                console.log("employee is at the register")
                this.employeeIsInContact = true;
            }

        if (object instanceof Customer)
            if (!object.checkedOut)
                if (!this.waitingCustomers.has(object.uuid))
                {
                    console.log("customer is now waiting to check out");
                    
                    this.waitingCustomers.set(object.uuid, object);

                    $("#waitingCustomers").text(this.waitingCustomers.size);
                }
    }
    
    onStopTrigger(object)
    {
        if (object instanceof Player)
        {
            console.log("player has left the register");
            this.playerIsInContact = false;
        }

        if (object instanceof Employee)
        {
            console.log("employee has left the register");
            this.employeeIsInContact = false;
        }
    }
};
