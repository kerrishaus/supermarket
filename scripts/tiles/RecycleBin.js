import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Triggerable } from "../geometry/TriggerableMesh.js";
import { Player } from "../Player.js";

export class RecycleBin extends Triggerable
{
    constructor(xPos, yPos)
    {
        super(1, 1, 2, 2, 0x00ff00);
        
        this.position.x = xPos;
        this.position.y = yPos;
        
        this.timeSinceLastRecycle = 0;
        this.recycleInterval = 0.2;
        
        this.carriedItems = new Array();
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
        
        this.timeSinceLastRecycle += deltaTime;
        
        for (const item of this.carriedItems)
            if (item.elapsedTime > item.moveTime)
            {
                this.carriedItems.splice(this.carriedItems.indexOf(item), 1);
                scene.remove(item);
            }
    }
    
    recycleItem(holder)
    {
        if (holder.carriedItems.length <= 0)
            return;
            
        const item = holder.carriedItems[holder.carriedItems.length - 1]
        holder.carriedItems.splice(holder.carriedItems.indexOf(holder), 1);
        this.carriedItems.push(item);
        item.setTarget(this.position, new Vector3(0, 0, 0));
    }
    
    onTrigger(object)
    {
        super.onTrigger(object);
        
        if (object instanceof Player)
            if (this.timeSinceLastRecycle > this.recycleInterval)   
            {
                this.recycleItem(object);
                this.timeSinceLastRecycle = 0;
            }
            
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);
    }
}