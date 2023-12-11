import { BoxGeometry, Vector3, TextureLoader, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Triggerable } from "../geometry/Triggerable.js";
import { Player      } from "../Player.js";
import { Customer    } from "../Customer.js";
import { Employee    } from "../Employee.js";

import { Entity             } from "../entity/Entity.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { GoemetryComponent  } from "../entity/components/GeometryComponent.js";

export class Register extends Triggerable
{
    constructor()
    {
        super(6, 2, 8, 4, 0xad723e);

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
        
        this.moneyTexture = new TextureLoader().load('textures/dollar_placeholder.jpeg');
        this.moneyMaterial = new MeshStandardMaterial({ map: this.moneyTexture });

        this.waitingCustomers = new Map();

        this.playerIsInContact   = false;
        this.employeeIsInContact = false;
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

        if (this.waitingCustomers.size > 0 && (this.playerIsInContact || this.employeeIsInContact))
        {
            console.log("taking care of customers at the register");

            // TODO: don't do this all in one go in the future

            this.waitingCustomers.forEach((customer, uuid, map) => 
            {
                console.log("selling " + customer.carriedItems.length + " items");

                for (let i = 0; i < customer.carriedItems.length; i++)
                    this.addMoney(customer.position);

                this.waitingCustomers.delete(uuid);

                // FIXME: this is a hack to stop customers from freezing in place.
                // if you're in the register trigger at the same time that a customer
                // is added to the waitingCustomers list, they will freeze.
                customer.actions.length = 0;
                customer.pushAction({type: "move", position: shop.readyPosition});
                customer.pushAction({type: "move", position: shop.spawnPosition});

                // their current action should be waitToCheckout
                customer.nextAction();
            });

            $("#waitingCustomers").text(this.waitingCustomers.size);
        }
    }
    
    addMoney(position = this.position)
    {
        this.calculateGrid();
        
        const money = new Entity();
        money.addComponent(new CarryableComponent);
        money.addComponent(new GoemetryComponent(
            new BoxGeometry(this.moneyLength, this.moneyWidth, this.moneyThickness),
            this.moneyMaterial
        ));
        
        money.position.copy(position);
        money.getComponent("CarryableComponent").setTarget(this.position, new Vector3(this.column_ * this.moneyLength - 0.6 - 1,
                                                            this.row_ * this.moneyWidth - 0.5,
                                                            (this.scale.z / 2) + (this.layer_ * this.moneyThickness) + this.moneyThickness / 2));
        
        scene.add(money);
        this.money.push(money);
    }
    
    transferMoney(player)
    {
        if (this.money.length <= 0)
            return;
            
        const money = this.money[this.money.length - 1];
        
        money.setTarget(player.position, new Vector3(0, 0, 0));
        
        player.carriedMoney.push(money);
        
        this.money.pop();
        
        this.calculateGrid();
        
        player.money += 5;
        $("#money").html(player.money);
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
        super.onTrigger(object);

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
            if (!this.waitingCustomers.has(object.uuid))
            {
                console.log("customer is now waiting to check out");
                
                this.waitingCustomers.set(object.uuid, object);

                $("#waitingCustomers").text(this.waitingCustomers.size);
            }
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);

        if (object instanceof Player)
            this.playerIsInContact = false;

        if (object instanceof Employee)
            this.employeeIsInContact = false;
    }
};
