import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Interactable } from "./InteractableMesh.js";
import { Tomato } from "./Tomato.js";
import { Player } from "./Player.js";

export class TomatoPlant extends Interactable
{
    constructor()
    {
        super(0.2, 0.2, 1, 1, 0xff0000);
        
        this.name = "tomatoPlant";
        
        this.timeSinceLastGrowth = 0;
        this.tomatoes = new Array();
        
        const labelDiv = document.createElement("div");
        labelDiv.id = this.uuid;
        labelDiv.className = 'unitCount';
        labelDiv.textContent = this.tomatoes.length;
        
        this.label = new CSS2DObject(labelDiv);
        this.label.color = "white";
        this.add(this.label);

        return this;
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
        if (this.tomatoes.length < 3)
            if (this.timeSinceLastGrowth > 3)
            {
                this.grow();
                this.timeSinceLastGrowth = 0;
            }
        
        this.timeSinceLastGrowth += deltaTime;
    }
    
    grow()
    {
        const newTomato = new Tomato(this.position);
        newTomato.setTarget(this.position, new Vector3(0, 1, 0));
        this.tomatoes.push(newTomato);
        scene.add(newTomato);
        
        this.label.element.textContent = this.tomatoes.length;
    }
    
    transferTomato(receiver)
    {
        if (this.tomatoes.length <= 0)
            return;
            
        const tomato = this.tomatoes[this.tomatoes.length - 1];
        tomato.carryPos = receiver.carriedItems.length + 1;
        tomato.moveTime = 0.17;
        
        // TODO: I want to set the offset vector here, in the future
        // but right now it's really not required because it will set by
        // updateTarget later in Player#update
        tomato.setTarget(receiver.position, new Vector3(0, 0, 0));
        tomato.autoPositionAfterAnimation = false;
        
        receiver.carriedItems.push(tomato);
        
        this.tomatoes.pop();
        this.label.element.textContent = this.tomatoes.length;
    }
    
    onTrigger(object)
    {
        super.onTrigger(object);
        
        if (object instanceof Player)
            this.transferTomato(object);
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);
    }
};
