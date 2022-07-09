import { Vector3, Quaternion, TextureLoader, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Carryable } from "../Carryable.js";
import { Interactable } from "../geometry/InteractableMesh.js";
import { Player } from "../Player.js";
import { Customer } from "../Customer.js";
import { Employee } from "../Employee.js";

export class BackstockContainer extends Interactable
{
    constructor()
    {
        super(2, 2, 2, 4, 0xad723e);

        this.name = "backstockContainer";
        this.itemType = null;
        
        this.carriedItems = new Array();
        
        this.column_ = 0;
        this.row_ = 0;
        this.layer_ = 0;
        
        this.gridRows = 6;
        this.gridColumns = 6;
        
        this.itemLength = 0.4;
        this.itemWidth = 0.2;
        this.itemThickness = 0.1;

        const labelDiv = document.createElement("div");
        labelDiv.id = this.uuid;
        labelDiv.className = 'backstockTileLabel';
        labelDiv.textContent = this.name;
        
        this.label = new CSS2DObject(labelDiv);
        this.label.color = "white";
        this.add(this.label);
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);
    }

    // this can be overriden by derived classes
    // as long as the returned item inherits Carryable
    createItem()
    {
        return new Carryable(this.itemLength, this.itemWidth, this.itemThickness, 0x48c942);
    }
    
    addItem(amount)
    {
        for (let i = 0; i < amount; i++)
        {
            this.calculateGrid();
            
            const item = this.createItem();
            
            item.position.copy(this.position);
            item.setTarget(this.position, new Vector3(this.column_ * this.itemLength - 0.6 - 1,
                                                    this.row_ * this.itemWidth - 0.5,
                                                    (this.scale.z / 2) + (this.layer_ * this.itemThickness) + this.itemThickness / 2));
            
            scene.add(item);
            this.carriedItems.push(item);
        }

        this.label.element.textContent = this.carriedItems.length;
    }
    
    transferItem(carrier)
    {
        if (this.carriedItems.length <= 0)
            return;

        if (carrier instanceof Player || carrier instanceof Employee)
            if (carrier.carriedItems.length > carrier.carryLimit)
                return;
            
        const item = this.carriedItems[this.carriedItems.length - 1];
        item.carryPos = carrier.carriedItems.length + 1;
        item.moveTime = 0.17;
        
        // TODO: I want to set the offset vector here, in the future
        // but right now it's really not required because it will set by
        // updateTarget later in Player#update
        item.setTarget(carrier.position, new Vector3(0, 0, 0));
        item.autoPositionAfterAnimation = false;
        
        carrier.carriedItems.push(item);
        
        this.carriedItems.pop();
        this.label.element.textContent = this.carriedItems.length;
        
        // TODO: don't think this is necessary
        this.calculateGrid();
    }
    
    calculateGrid()
    {
        this.column_ = 0;
        this.row_    = 0;
        this.layer_  = 0;
        
        for (let i = 0; i < this.carriedItems.length; i++)
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
            this.transferItem(object);
    }
    
    onStopTrigger(object)
    {
        super.onStopTrigger(object);
    }
};
