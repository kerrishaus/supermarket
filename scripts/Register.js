import { Vector3, Quaternion, TextureLoader, MeshBasicMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Carryable } from "./Carryable.js";
import { RigidBodyCube } from "./RigidBodyCube.js";

export class Register extends RigidBodyCube
{
    constructor()
    {
        super(new Vector3(2, 4, 1), 0xad723e, new Vector3(0, 0, 0), new Quaternion(), 0);

        this.setRestitution(0.125);
        this.setFriction(1);
        this.setRollingFriction(5);
        
        this.name = "register";
        
        this.money = new Array();
        this.timeSinceLastMoney = 0;
        
        this.column_ = 0;
        this.row_ = 0;
        this.layer_ = 0;
        
        this.gridRows = 9;
        this.gridColumns = 4;
        
        this.moneyLength = 0.4;
        this.moneyWidth = 0.2;
        this.moneyThickness = 0.1;
        
        this.moneyTexture = new TextureLoader().load('textures/dollar.jpeg');
        this.moneyMaterial = new MeshBasicMaterial({ map: this.moneyTexture });

        window.addEventListener("keydown", (event) =>
        {
            if (event.code == "KeyP")
                this.floppyMoney();
        });
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
        if (this.timeSinceLastMoney >= 0.1)
        {
            this.addMoney();
            this.timeSinceLastMoney = 0;
        }
        
        this.timeSinceLastMoney += deltaTime
    }
    
    addMoney()
    {
        this.calculateGrid();
        
        const money = new Carryable(this.moneyLength, this.moneyWidth, this.moneyThickness, 0x48c942);
        money.material = this.moneyMaterial;
        
        money.position.copy(this.position);
        money.setTarget(this.position, new Vector3(this.column_ * this.moneyLength - 0.6,
                                                         this.row_ * this.moneyWidth,
                                                         (this.scale.z / 2) + (this.layer_ * this.moneyThickness) + this.moneyThickness / 2));
        
        scene.add(money);
        this.money.push(money);
    }
    
    transferMoney(player)
    {
        if (this.money.length <= 0)
            return;
            
        const money = this.money[this.money.length - 1];
        
        //money.parent.remove(money);
        //money.matrixWorld.decompose(money.position, money.quaternion, money.scale);
        money.setTarget(player.position, new Vector3(0, 0, 0));
        
        player.carriedMoney.push(money);
        
        this.money.pop();
        
        this.calculateGrid();
        
        player.money += 1;
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
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);
    }

    floppyMoney()
    {
        console.log("Floppa money!");

        for (const money of this.money)
        {
            const physMoney = new RigidBodyCube(new Vector3(this.moneyLength, this.moneyWidth, this.moneyThickness), 0x00ff00, new Vector3(money.position.x, money.position.y, money.position.z), new Quaternion(), 10);
            physMoney.material = this.moneyMaterial;
            physMoney.setRestitution(0);
            physMoney.setFriction(1);
            physMoney.setRollingFriction(0.125);

            scene.remove(money);
            scene.add(physMoney);
        }

        this.money.length = 0;
    }
};
