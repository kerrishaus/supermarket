import { Vector3 } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/r177/examples/jsm/renderers/CSS2DRenderer.js";

import { Player   } from "../../Player.js";
import { Employee } from "../../Employee.js";

import { EntityComponent } from "./EntityComponent.js";

import * as ItemUtility from "../../ItemUtility.js";

export class GeneratorComponent extends EntityComponent
{
    #itemGenerationInProgress = false;
    #manualItemGenerationQueue = 0;
    #timeSinceLastItem = 0;

    #column = 0;
    #row    = 0;
    #layer  = 0;

    #labelDiv;
    #progressBar;
    #countLabelDiv;

    init(name, itemType)
    {
        if (!this.parentEntity.hasComponent("TriggerComponent"))
            console.error("GeneratorComponent requires TriggerComponent be added to the parent entity first!");
        
        this.name = name;
        this.itemType = itemType;
        
        this.noAutomaticGeneration = false;

        this.itemTime = 3;
        
        this.carriedItems = new Array();
        this.maxItems = 3;
        
        this.gridRows = 6;
        this.gridColumns = 6;
        
        this.itemLength = 0.4;
        this.itemWidth = 0.2;
        this.itemThickness = 0.1;
        
        // this is set by employees when they are targetting this container,
        // so that it is not targetted by multiple employees
        this.handledByEmployee = null;
        
        this.#labelDiv = document.createElement("div");
        
        this.#progressBar = document.createElement("progress");
        this.#progressBar.setAttribute("value", 0); // TODO: this might need to be set somewhere else, if the itemTime is changed
        this.#progressBar.setAttribute("max", this.itemTime);
        this.#progressBar.style.width = "50px";
        this.#labelDiv.append(this.#progressBar);
        
        const titleLabelDiv = document.createElement("div");
        titleLabelDiv.className = 'tileLabel';
        titleLabelDiv.textContent = this.name;
        this.#labelDiv.append(titleLabelDiv);
        
        this.#countLabelDiv = document.createElement("div");
        this.#countLabelDiv.className = 'countLabel';
        this.#countLabelDiv.textContent = 0;
        this.#labelDiv.append(this.#countLabelDiv);
        
        const label = new CSS2DObject(this.#labelDiv);
        label.color = "white";
        this.parentEntity.add(label);
    }
    
    destructor()
    {
        this.#labelDiv.remove();
        
        for (const item of this.carriedItems)
            item.destructor();
        
        super.destructor();
    }
    
    update(deltaTime)
    {
        super.update(deltaTime);

        if (this.#itemGenerationInProgress || !this.noAutomaticGeneration)
        {
            if (this.itemTime > 0)
                if (this.carriedItems.length < this.maxItems)
                {
                    if (this.#timeSinceLastItem > this.itemTime)
                    {
                        this.addItem();
                        this.#timeSinceLastItem = 0;
                        
                        if (--this.#manualItemGenerationQueue < 1)
                        {
                            this.#itemGenerationInProgress = false;
                            this.#manualItemGenerationQueue = 0;
                        }
                    }
                    
                    // only make generation progress if the generator isn't full
                    this.#timeSinceLastItem += deltaTime;
                    this.#progressBar.setAttribute("value", this.#timeSinceLastItem);
                }
        }
    }
    
    // this can be overriden by derived classes
    // as long as the returned item inherits Carryable
    createItem()
    {
        const entity = ItemUtility.instantiateItem({ type: this.itemType });
        
        entity.position.copy(this.parentEntity.position);
        
        return entity;
    }
    
    addItem(amount = 1)
    {
        for (let i = 0; i < amount; i++)
        {
            const item = this.createItem();
            
            item.position.copy(this.parentEntity.position);
            item.getComponent("CarryableComponent").setTarget(this.parentEntity.position, new Vector3(this.#column * this.itemLength - 0.6 - 1,
                                                    (this.parentEntity.scale.z / 2) + (this.#layer * this.itemThickness) + this.itemThickness / 2),
                                                    this.#row * this.itemWidth - 0.5);
            
            this.carriedItems.push(item);
        }
        
        this.updateItems();
    }
    
    addItemToQueue(amount = 1)
    {
        this.#manualItemGenerationQueue += amount;
        this.#itemGenerationInProgress = true;
    }

    updateItems()
    {
        // keeps all carried items in their proper position
        for (let i = 0; i < this.carriedItems.length; i++)
        {
            let item = this.carriedItems[i];

            const carryPos = ((item.scale.y / 2) * i) + this.parentEntity.scale.y + item.scale.y / 2;
            
            item.quaternion.copy(this.parentEntity.quaternion);
            
            if (item.elapsedTime > item.moveTime)
            {
                item.position.copy(this.parentEntity.position);
                item.position.z += carryPos;
                continue;
            }
            
            item.getComponent("CarryableComponent").setTarget(this.parentEntity.position, new Vector3(0, carryPos, 0));
        }

        this.#countLabelDiv.textContent = this.carriedItems.length;
    }
    
    transferToCarrier(carrier)
    {
        if (this.carriedItems.length <= 0)
            return;
        
        // TODO: figure out if this check can be replaced carrier.hasComponent("ContainerComponent")
        if (carrier instanceof Player || carrier instanceof Employee)
            if (carrier.getComponent("ContainerComponent").carriedItems.length > carrier.getComponent("ContainerComponent").maxItems)
                return;
        
        const item = this.carriedItems[this.carriedItems.length - 1];
        item.carryPos = carrier.getComponent("ContainerComponent").carriedItems.length + 1;
        item.moveTime = 0.17;
        
        // TODO: I want to set the offset vector here, in the future
        // but right now it's really not required because it will set by
        // updateTarget later in Player#update
        item.getComponent("CarryableComponent").setTarget(carrier.position, new Vector3(0, 0, 0));
        
        carrier.getComponent("ContainerComponent").carriedItems.push(item);
        
        this.carriedItems.pop();
        
        this.updateItems();

        console.log("Generator transferred to carrier.");
    }
    
    serialise()
    {
        const data = super.serialise();
        
        data.amount = this.carriedItems.length;
        data.timeSinceLastItem = this.#timeSinceLastItem;
        data.noAutomaticGeneration = this.noAutomaticGeneration;
        data.itemGenerationInProgress = this.#itemGenerationInProgress;
        
        return data;
    }
    
    deserialise(data)
    {
        super.deserialise(data);
        
        this.#timeSinceLastItem = data.timeSinceLastItem;
        this.noAutomaticGeneration = data.noAutomaticGeneration;
        this.#itemGenerationInProgress = data.itemGenerationInProgress;
        
        this.addItem(data.amount);
    }
}