import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Interactable } from "./InteractableMesh.js";
import { Player } from "./Player.js";

export class BuyableTile extends Interactable
{
    constructor(width, length, xPos, yPos, price, name)
    {
        super(width, length, width + 3, length + 3, 0xff0000);
        
        this.position.x = xPos;
        this.position.y = yPos;
        
        const labelDiv = document.createElement("div");
        labelDiv.id = this.uuid;
        labelDiv.className = 'buyableTileTitle';
        labelDiv.textContent = name;
        
        this.label = new CSS2DObject(labelDiv);
        this.label.color = "white";
        this.add(this.label);
        
        this.carriedMoney = new Array();
        
        this.price = price;
        this.pricePaid = 0;
        
        this.onFullyPaid = function() {};
    }
    
    takeMoneyFrom(player)
    {
        if (!(player instanceof Player))
            return;

        if (player.money <= 0)
            return;
            
        const money = new Carryable(0.3, 0.2, 0.02, 0x48c942);
        money.position.copy(this.position);
        money.setTarget(this.position, new THREE.Vector3(0, 0, 0));
        money.startPosition.copy(player.position);
        scene.add(money);
        
        this.carriedMoney.push(money);
        this.pricePaid += 1;
        player.money -= 1;
        
        if (this.pricePaid == this.price)
        {
            this.onFullyPaid();
            return;
        }
        
        this.label.element.textContent = this.price - this.pricePaid;
        $("#money").html(player.money);
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
            
            money.startPosition.copy(player.position);
        }
    }
    
    onTrigger(object)
    {
        super.onTrigger(object);
        
        if (object instanceof Player)
            this.takeMoneyFrom(object);
    }
};