import { Vector3, Quaternion, TextureLoader, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Carryable } from "../Carryable.js";
import { Triggerable } from "../geometry/Triggerable.js";
import { Player } from "../Player.js";
import { Customer } from "../Customer.js";

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
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
    }
    
    addMoney()
    {
        this.calculateGrid();
        
        const money = new Carryable(this.moneyLength, this.moneyWidth, this.moneyThickness, 0x48c942);
        money.material = this.moneyMaterial;
        
        money.position.copy(this.position);
        money.setTarget(this.position, new Vector3(this.column_ * this.moneyLength - 0.6 - 1,
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
            this.transferMoney(object);

        if (object instanceof Customer)
        {
            console.log("selling " + object.carriedItems.length + " items");

            for (let i = 0; i < object.carriedItems.length; i++)
                this.addMoney();
        }
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);
    }
};
