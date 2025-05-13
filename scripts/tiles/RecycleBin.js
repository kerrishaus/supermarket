import { Vector3, BoxGeometry, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Player } from "../Player.js";

import { Entity             } from "../entity/Entity.js";
import { TriggerComponent   } from "../entity/components/TriggerComponent.js";
import { GeometryComponent  } from "../entity/components/GeometryComponent.js";

export class RecycleBin extends Entity
{
    constructor()
    {
        super();
        
        this.name = "recycleBin";
        
        this.addComponent(new TriggerComponent);
        
        this.addComponent(new GeometryComponent(
            new BoxGeometry(1.5, 1.5, 1), 
            new MeshStandardMaterial({ color: 0xff0000 })
        )).mesh.position.z -= 0.5;
        
        this.itemBuffer = [];
        
        this.timeSinceLastRecycle = 0;
        this.recycleInterval = 0.2;
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
            
        const item = holderContainer.carriedItems[holderContainer.carriedItems.length - 1]
        holderContainer.carriedItems.splice(holderContainer.carriedItems.indexOf(holder), 1);
        
        this.itemBuffer.push(item);
        
        item.getComponent("CarryableComponent").setTarget(this.position, new Vector3(0, 0, -1));
    }
    
    onTrigger(object)
    {
        if (object instanceof Player)
            if (this.timeSinceLastRecycle > this.recycleInterval)   
            {
                this.recycleItem(object);
                this.timeSinceLastRecycle = 0;
            }
    }
}
