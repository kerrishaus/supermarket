import { BoxGeometry, MeshStandardMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Entity } from "./entity/Entity.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";

import * as MathUtility from "./MathUtility.js";
import { Register } from "./tiles/Register.js";

export class Employee extends Entity
{
    #container;

    constructor(shop)
    {
        super();
        
        this.#container = this.addComponent(new ContainerComponent());
        
        this.addComponent(new GeometryComponent(
            new BoxGeometry(1, 1, 2),
            new MeshStandardMaterial({color: 0x42b6f5})
        ));
        
        this.shop = shop;
        
        this.speedModifier = 4;
        
        // TODO: add a $50 button to train them that will enable this
        this.canCheckoutCustomers = true;
        
        this.actions = [];
        
        this.elapsedTime = 0;
        this.actionTime = 0;
        this.startPosition = new Vector3(0, 0, 0.5);
        this.targetPosition = new Vector3(0, 0, 0.5);

        this.position.copy(this.startPosition);
        
        this.labelDiv = document.createElement("div");
        this.labelDiv.textContent = "i am in pain";
        
        const label = new CSS2DObject(this.labelDiv);
        label.color = "white";
        this.add(label);
    }
    
    destructor()
    {
        this.labelDiv.remove();
        
        super.destructor();
    }
    
    pushAction(action)
    {
        // if there are no actions,
        // focus this action immediately
        if (this.actions.length < 1)
        {
            console.debug("focused action because there are no other actions", action);
            this.focusAction(action);
        }
        
        this.actions.push(action);
        
        console.debug("Pushed action: " + action.type, action);
    }
    
    focusAction(action)
    {
        if (action.type == "move")
        {
            this.actionTime = this.position.distanceTo(action.position) / this.speedModifier;
            this.setTarget(action.position, this.actionTime);
        }
        else if (action.type == "pick")
        {
            this.actionTime = this.position.distanceTo(action.container.position) / this.speedModifier;
            this.setTarget(action.container.position, this.actionTime);
        }
        else if (action.type == "stock")
        {
            this.actionTime = this.position.distanceTo(action.container.position) / this.speedModifier;
            this.setTarget(action.container.position, this.actionTime);
        } 
        
        this.labelDiv.textContent = action.type;
        
        console.debug("focused action");
    }

    nextAction()
    {
        console.debug(`Action "${this.actions[0].type}" completed.`);
        
        this.actions[0].onFinish?.();
        
        this.actions.shift();

        this.elapsedTime = 0;
                
        if (this.actions.length > 0)
            this.focusAction(this.actions[0]);
        else
            this.labelDiv.textContent = "idle";
    }
    
    setTarget(endPosition, actionTime)
    {
        if (!(endPosition instanceof Vector3))
        {
            console.error("endPosition must be a Vector3");
            return;
        }
        
        this.elapsedTime = 0;
        this.startPosition.copy(this.position);
        this.targetPosition.copy(endPosition);
        this.actionTime = actionTime;
    }
    
    gatherItemsAndStock(from, to)
    {
        console.log(`Gathering items from ${from.name} for ${to.name}.`);
        
        const generator = from.getComponent("GeneratorComponent")
        const container = to.getComponent("ContainerComponent"); 
        
        generator.handledByEmployee = this;
        
        this.pushAction({
            type: "move",
            position: from.position,
        });
        
        this.pushAction({
            type: "pick",
            container: from,
            amount: container.itemDeficit,
            pickedUp: 0,
            onFinish: () => {
                generator.handledByEmployee = null;
            }
        });
        
        this.stockContainer(to);
    }
    
    stockContainer(container)
    {
        container.handledByEmployee = this;
        
        this.pushAction({
            type: "move",
            position: container.position
        });
        
        this.pushAction({
            type: "stock",
            container: container,
            onFinish: () => {
                container.handledByEmployee = null;
            }
        });
    }

    findClosestRegisterWithWaitingCustomers()
    {
        if (!this.canCheckoutCustomers)
            return false;

        let closestRegister = null;
        let closestRegisterDistance = Infinity;
        
        for (const register of this.shop.registerTiles)
        {
            if (register.waitingCustomers.length < 1)
                continue;

            if (register.handledByEmployee !== null)
                continue;
            
            const distance = this.position.distanceTo(register.position);

            if (distance < closestRegisterDistance)
            {
                closestRegister = register;
                closestRegisterDistance = distance;
            }
        }

        if (closestRegister instanceof Register)
        {
            closestRegister.handledByEmployee = this;

            this.pushAction({
                type: "move",
                position: closestRegister.position,
                onFinish: () => {
                    closestRegister.handledByEmployee = null;
                } 
            });

            return true;
        }

        return false;
    }

    getTilesFromListByType(list, type)
    {
        const containers = [];

        for (const container of list)
        {
            const testType = (container.getComponent("ContainerComponent")?.itemType ?? 
                          container.getComponent("GeneratorComponent")?.itemType ??
                          null);

            if (testType == type)
            {
                containers.push(container);
                console.debug(`${testType} == ${type}`);
            }
            else
                console.debug(`${testType} != ${type}`);
        }
        
        return containers;
    }
    
    findEmptiestContainerInList(containers)
    {
        let emptiest = { container: null, amount: Infinity };
        
        for (const container of containers)
        {
            const containerComponent = container.getComponent("ContainerComponent");
            
            if (containerComponent.handledByEmployee !== null)
                continue;
            
            // skip if container is full
            if (containerComponent.carriedItems.length >= containerComponent.maxItems)
                continue;
            
            if (containerComponent.carriedItems.length < emptiest.amount)
                emptiest = { container: container, amount: containerComponent.carriedItems.length };
        }
        
        return emptiest.container;
    }
    
    findFullestGeneratorInList(generators)
    {
        let fullest = { generator: null, amount: 0 };

        for (const generator of generators)
        {
            const generatorComponent = generator.getComponent("GeneratorComponent");
            
            if (generatorComponent.handledByEmployee !== null)
                continue;
                
            // skip if generator is empty
            if (generatorComponent.carriedItems.length < 1)
                continue;

            if (generatorComponent.carriedItems.length > fullest.amount)
                fullest = { generator: generator, amount: generatorComponent.carriedItems.amount };
        }

        return fullest.generator;
    }
    
    findClosestGeneratorInList(generators)
    {
        let closest = { generator: null, distance: Infinity };
        
        for (const generator of generators)
        {
            if (generator.getComponent("GeneratorComponent").handledByEmployee !== null)
                continue;
                
            // skip if generator is empty
            if (generator.getComponent("GeneratorComponent").carriedItems.length < 1)
                continue;
            
            const distance = this.position.distanceTo(generator.position);

            if (distance < closest.distance)
                closest = { generator: generator, distance: distance };
        }
        
        return closest.generator;
    }
    
    findSomethingToDo()
    {
        if (this.findClosestRegisterWithWaitingCustomers())
            return;
        
        // if the employee is carrying items,
        // try to find an applicable container
        if (this.#container.carriedItems.length > 0)
        {
            console.debug("Searching for containers for carried items...");

            let lastItemType = null;
            
            // check for nearest container of each carried item type
            for (const item of this.#container.carriedItems)
            {
                if (lastItemType == item.type)
                    continue;

                const containers = this.getTilesFromListByType(this.shop.containerTiles, item.type);

                console.debug(`Containers of type ${item.type}:`, containers);

                const container = this.findEmptiestContainerInList(containers);
                
                if (container instanceof Entity)
                {
                    console.debug(`Employee will stock container of type ${container.getComponent("ContainerComponent").itemType} from inventory because they are carrying that type.`, container, item.type);
                    this.stockContainer(container);
                    return;
                }

                lastItemType = item.type;

                //console.debug(`Did not find any containers of type ${item.type}.`);
            }

            // if we couldn't find any containers for any of the item types we are carrying,
            // and we do not have any more room to carry a different item type, do nothing.
            // TODO: find recycle bin if there are no containers for a given item type?
            if (this.#container.carriedItems.length >= this.#container.maxItems)
            {
                //console.debug("Did not find any applicable containers for items Employee is carrying, and cannot pickup any more items.");
                return;
            }
        }

        //console.debug("Did not find any applicable containers for items Employee is carrying, will search for other nearby empty containers.");
        
        const container = this.findEmptiestContainerInList(this.shop.containerTiles);
        
        // if there are no empty containers at all, do nothing.
        if (!(container instanceof Entity))
            return;
        
        //console.debug(`Searching for generator of type ${container.getComponent("ContainerComponent").itemType} to stock. ${container.getComponent("ContainerComponent").itemDeficit}.`);

        // find the closest generator for a given item type
        const generator = this.findClosestGeneratorInList(this.getTilesFromListByType(this.shop.generatorTiles, container.getComponent("ContainerComponent").itemType));
        
        if (container instanceof Entity && generator instanceof Entity)
        {
            console.log(generator, container);
            this.gatherItemsAndStock(generator, container);
        }
    }
    
    update(deltaTime)
    {
        this.elapsedTime += deltaTime;

        if (this.actions.length > 0)
        {
            // the current action is finished
            if (this.elapsedTime > this.actionTime)
            {
                // there are future actions
                if (this.actions.length > 0)
                {
                    const action = this.actions[0];
                    
                    if (action.type == "move")
                        this.nextAction();   
                    else if (action.type == "pick")
                    {
                        while (this.#container.carriedItems.length < this.#container.maxItems && // employee is full
                               action.container.getComponent("GeneratorComponent").carriedItems.length > 0 && // container is empty
                               action.pickedUp < action.amount) // all requested items ahve been picked)
                        {
                            action.container.getComponent("GeneratorComponent").transferToCarrier(this);
                            action.pickedUp++;
                            console.debug(`Picked up item ${action.pickedUp} (carrying ${this.#container.carriedItems.length}) of ${action.amount}`);
                        }

                        // if the employee has picked up at least one item, and can not pick up any more
                        // then skip to stocking the item. if the employee has not picked up any items,
                        // then sit and wait for at least one item for 10 seconds.
                        if (action.pickedUp > 0 || this.elapsedTime > 10)
                            this.nextAction();
                    }
                    else if (action.type == "stock")
                    {
                        const container = action.container.getComponent("ContainerComponent");
                        
                        // Transfers as many items of a certain type that the Employee is carrying as will fit into a given container.
                        for (const item of this.#container.carriedItems)
                        {
                            if (item.type != container.itemType)
                            {
                                console.debug("Skipping item of different type.", item.type, container.itemType);
                                continue;
                            }

                            if (container.carriedItems.length >= container.maxItems)
                            {
                                console.warn("Stopped stocking early because container is full.");
                                break;
                            }

                            container.transferFromCarrier(this);
                            console.debug("Stocked 1 item.");
                        }

                        this.nextAction();
                    }
                }
                // there are no remaining actions, do nothing
                else
                    this.position.copy(this.targetPosition);
            }
            // the action time has not elapsed, meaning we should still be moving
            else
            {
                this.position.lerpVectors(this.startPosition, this.targetPosition, this.elapsedTime / this.actionTime);
                
                this.rotation.z = MathUtility.angleToPoint(this.position, this.targetPosition);
            }
        }
        // no more actions, find a new one
        else
            this.findSomethingToDo();

        super.update(deltaTime);
    }
};
