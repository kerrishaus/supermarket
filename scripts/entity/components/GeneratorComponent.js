import { BoxGeometry, MeshStandardMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Player   } from "../../Player.js";
import { Employee } from "../../Employee.js";

import { Entity             } from "../Entity.js";
import { EntityComponent    } from "./EntityComponent.js";
import { CarryableComponent } from "./CarryableComponent.js";
import { GeometryComponent  } from "./GeometryComponent.js";

export class GeneratorComponent extends EntityComponent
{
    init(name, itemType)
    {
        if (!this.parentEntity.hasComponent("TriggerComponent"))
            console.error("GeneratorComponent requires TriggerComponent be added to the parent entity first!");

        this.name = name;
        this.itemType = itemType;

        // 0 or less to stop the generator from automatically creating items
        this.itemTime = 3;
        this.timeSinceLastItem = 0;

        this.carriedItems = new Array();
        this.maxItems = 3;
        
        this.column_ = 0;
        this.row_ = 0;
        this.layer_ = 0;
        
        this.gridRows = 6;
        this.gridColumns = 6;
        
        this.itemLength = 0.4;
        this.itemWidth = 0.2;
        this.itemThickness = 0.1;

        const labelDiv = document.createElement("div");

        this.titleLabelDiv = document.createElement("div");
        this.titleLabelDiv.className = 'tileLabel';
        this.titleLabelDiv.textContent = this.name;
        labelDiv.append(this.titleLabelDiv);
        
        this.countLabelDiv = document.createElement("div");
        this.countLabelDiv.className = 'countLabel';
        this.countLabelDiv.textContent = 0;
        labelDiv.append(this.countLabelDiv);

        this.label = new CSS2DObject(labelDiv);
        this.label.color = "white";
        this.parentEntity.add(this.label);
    }

    destructor()
    {
        super.destructor();
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        if (this.itemTime > 0)
            if (this.carriedItems.length < this.maxItems)
                if (this.timeSinceLastItem > this.itemTime)
                {
                    this.addItem();
                    this.timeSinceLastItem = 0;
                }

        this.timeSinceLastItem += deltaTime;
    }

    // this can be overriden by derived classes
    // as long as the returned item inherits Carryable
    createItem()
    {
        const entity = new Entity;
        entity.addComponent(new CarryableComponent);
        entity.addComponent(new GeometryComponent(
            new BoxGeometry(this.itemLength, this.itemWidth, this.itemThickness),
            new MeshStandardMaterial({ color: 0x48c92 })
        ));

        return entity;
    }
    
    addItem(amount = 1)
    {
        for (let i = 0; i < amount; i++)
        {
            const item = this.createItem();
            
            item.position.copy(this.parentEntity.position);
            item.getComponent("CarryableComponent").setTarget(this.parentEntity.position, new Vector3(this.column_ * this.itemLength - 0.6 - 1,
                                                    this.row_ * this.itemWidth - 0.5,
                                                    (this.parentEntity.scale.z / 2) + (this.layer_ * this.itemThickness) + this.itemThickness / 2));
            
            scene.add(item);
            this.carriedItems.push(item);
        }

        this.updateItems();
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
        item.autoPositionAfterAnimation = false;
        
        carrier.getComponent("ContainerComponent").carriedItems.push(item);
        
        this.carriedItems.pop();
        
        this.updateItems();
    }
    
    updateItems()
    {
        // keeps all carried items in their proper position
        for (let i = 0; i < this.carriedItems.length; i++)
        {
            let item = this.carriedItems[i];

            const carryPos = ((item.scale.z / 2) * i) + this.parentEntity.scale.z + item.scale.z / 2;
            
            item.quaternion.copy(this.parentEntity.quaternion);

            if (item.elapsedTime > item.moveTime)
            {
                item.position.copy(this.parentEntity.position);
                item.position.z += carryPos;
                continue;
            }
            
            item.getComponent("CarryableComponent").setTarget(this.parentEntity.position, new Vector3(0, 0, carryPos));
        }

        this.countLabelDiv.textContent = this.carriedItems.length;
    }
}