import { BoxGeometry, Vector3, TextureLoader, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Triggerable } from "../geometry/Triggerable.js";
import { Player } from "../Player.js";
import { Entity } from "../entity/Entity.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { GeometryComponent } from "../entity/components/GeometryComponent.js";

export class BuyableTile extends Triggerable
{
    constructor(width, length, xPos, yPos, price, name)
    {
        super(width, length, width + 2, length + 2, 0xff0000);
        
        this.position.x = xPos;
        this.position.y = yPos;
        
        const labelDiv = document.createElement("div");
        labelDiv.id = this.uuid;
        labelDiv.className = 'buyableTileTitle';
        labelDiv.textContent = name;
        
        this.label = new CSS2DObject(labelDiv);
        this.label.color = "white";
        this.add(this.label);

        this.name = name;
        
        this.carriedMoney = new Array();
        
        this.price = price;
        this.pricePaid = 0;
        
        this.onFullyPaid = function() {};

        // TODO: make this static and let everyone use it
        this.moneyTexture = new TextureLoader().load('textures/dollar_placeholder.jpeg');
        this.moneyMaterial = new MeshStandardMaterial({ map: this.moneyTexture });
    }
    
    takeMoneyFrom(player)
    {
        if (!(player instanceof Player))
            return;

        if (player.money <= 0)
            return;

        if (this.pricePaid >= this.price)
            return;
        
        // TODO: use standard money size variables from register
        const money = new Entity();
        money.addComponent(new CarryableComponent);
        money.addComponent(new GeometryComponent(
            new BoxGeometry(0.3, 0.2, 0.02),
            this.moneyMaterial
        ));

        money.position.copy(this.position);
        money.getComponent("CarryableComponent").setTarget(this.position, new Vector3(0, 0, 0));
        money.getComponent("CarryableComponent").startPosition.copy(player.position);
        scene.add(money);
        
        this.carriedMoney.push(money);
        this.pricePaid += 1;
        player.takeMoney(1);
        
        this.label.element.textContent = this.price - this.pricePaid;

        if (this.pricePaid == this.price)
            this.onFullyPaid();
    }
    
    update(deltaTime)
    {
        super.update();
     
        for (const money of this.carriedMoney)
        {
            if (money.elapsedTime > money.moveTime)
            {
                scene.remove(money);
                this.carriedMoney.splice(this.carriedMoney.indexOf(money), 1);
                continue;
            }
            
            //money.startPosition.copy(player.position);
        }
    }
    
    onTrigger(object)
    {
        super.onTrigger(object);
        
        if (object instanceof Player)
            this.takeMoneyFrom(object);
    }
};