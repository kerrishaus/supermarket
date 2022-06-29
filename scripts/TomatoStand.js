import { Interactable } from "./InteractableMesh.js";

export class TomatoStand extends Interactable
{
    constructor(xPos, yPos)
    {
        super(1, 1, 2, 2, 0x4d220b);
        
        this.name = "tomatoStand";
        
        this.position.x = xPos;
        this.position.y = yPos;
        
        this.carriedItems = new Array();
        this.maxItems = 9;
    }
    
    captureHeldTomato(holder)
    {
        if (this.carriedItems.length >= this.maxItems)
            return;
        
        for (const item of holder.carriedItems)
        {
            if (item instanceof Tomato)
            {
                holder.carriedItems.splice(holder.carriedItems.indexOf(item), 1);
                this.carriedItems.push(item);
                
                const rows = 3;
                const columns = 3;
                const totalPerStack = rows * columns;
                
                let stacks = Math.floor(this.carriedItems.length / totalPerStack);
                let currentStack = this.carriedItems.length - (stacks * totalPerStack);
                let row = Math.floor(currentStack / rows);
                let column = currentStack - (row * columns);
                
                item.setTarget(this.position, new THREE.Vector3(column - 1, row - 1, 1));
                item.autoPositionAfterAnimation = true;
            }
        }
    }
    
    onTrigger(object)
    {
        super.onTrigger(object);
        
        if (object instanceof Player)
            this.captureHeldTomato(player);
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);
    }
};
