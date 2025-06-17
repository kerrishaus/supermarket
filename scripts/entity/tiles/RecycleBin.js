import { Vector3, BoxGeometry, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { Entity } from "../Entity.js";
import { Player } from "../Player.js";

import { TriggerComponent   } from "../components/TriggerComponent.js";
import { GeometryComponent  } from "../components/GeometryComponent.js";

export class RecycleBin extends Entity
{
    constructor()
    {
        super();
        
        this.name = "recycleBin";
        
        this.addComponent(new TriggerComponent);
        
        this.addComponent(new GeometryComponent(
            new BoxGeometry(1.5, 1, 1.5), 
            new MeshStandardMaterial({ color: 0xff0000 })
        )).mesh.position.y -= 0.5;
        
        this.itemBuffer = [];
        
        this.timeSinceLastRecycle = 0;
        this.recycleInterval = 0.2;
        
        this.addEventListener("trigger", (event) =>
        {
            if (event.object instanceof Player)
                if (this.timeSinceLastRecycle > this.recycleInterval)   
                {
                    this.recycleItem(event.object);
                    this.timeSinceLastRecycle = 0;
                }
        });
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
        this.timeSinceLastRecycle += deltaTime;
        
        for (const item of this.itemBuffer)
            if (item.getComponent("CarryableComponent").elapsedTime > item.getComponent("CarryableComponent").moveTime)
            {
                this.itemBuffer.splice(this.itemBuffer.indexOf(item), 1);
                item.destructor();
            }
    }
    
    recycleItem(holder)
    {
        const holderContainer = holder.getComponent("ContainerComponent");

        if (holderContainer.carriedItems.length <= 0)
            return;
            
        const item = holderContainer.carriedItems[holderContainer.carriedItems.length - 1];
        holderContainer.carriedItems.splice(holderContainer.carriedItems.indexOf(holder), 1);
        
        this.itemBuffer.push(item);
        
        item.getComponent("CarryableComponent").setTarget(this.position, new Vector3(0, 0, -1));
    }
}