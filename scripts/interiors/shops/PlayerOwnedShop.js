import { Vector3, Vector2, Group } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { Register } from "../../tiles/Register.js";

import { Employee } from "../../Employee.js";
import { Customer } from "../../Customer.js";

import { Entity } from "../../entity/Entity.js";

import * as GeometryUtil from "../../GeometryUtility.js";
import * as MathUtility from "../../MathUtility.js";

export class PlayerOwnedShop extends Group
{

    populateTilesInBuyMenu()
    {
        $("#tiles").empty();

        for (const [tileName, tile] of Object.entries(this.availableTiles))
        {
            const tileContainer = $("<div class='tile'>").appendTo("#tiles");
            tileContainer.append(`<div class='tile-name'>${tile.name}</div>`);

            const tileBottomBar = $(`
                <div class='tile-bottom-bar'>
                    <div class='tile-price'>$${tile.price}</div>
                </div>
            `).appendTo(tileContainer);

            $("<button class='tile-buy'>Buy</button>").appendTo(tileBottomBar).click(() => 
            {
                this.beginTilePlacement(tile);
            });

            console.log("added tile to buy menu");
        }
    }
    
    mousemove()
    {
        shop.raycaster.setFromCamera(screenMousePosition, camera);
    }

    keydownDuringTilePlacement(event)
    {
        if (event.code == "KeyR")
            shop.newTile.tile.rotateY(Math.PI / 2);
        else if (event.code == "Escape")
            shop.cancelTilePlacement();
    }

    // TODO: support touch
    // https://stackoverflow.com/a/69023543/6745382 use pointermove instead of touch/mouse move
    mousemoveDuringTilePlacement(event)
    {
        shop.updateTilePlacement();
    }
    
    mousedownDuringTilePlacement(event)
    {
        if (event.button == 0)
            shop.confirmTilePlacement();
        else if (event.button == 2) // right click to cancel
            shop.cancelTilePlacement();
    }
    
    beginTilePlacement(tile)
    {
        if (player.money < tile.price)
        {
            console.error("Not enough money!");
            return false;
        }
        
        document.dispatchEvent(new CustomEvent("closeBuyMenu"));
        player.disableMovement(); // buy menu closing re-enables player movement
        
        if (this.newTile?.tile instanceof Entity)
            this.cancelTilePlacement();
        
        this.newTile = tile;
        this.newTile.tile = tile.getTile();
        
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Tried to start tile placement process for " + tile.name + " but was not provided with a proper tile Entity.");
            return;
        }
        
        if (this.newTile.tile.hasComponent("TriggerComponent"))
        {
            this.newTile.originalTriggerState = this.newTile.tile.getComponent("TriggerComponent").triggerEnabled;
            this.newTile.tile.getComponent("TriggerComponent").triggerEnabled = false;
        }
            
        if (this.newTile.tile.hasComponent("GeneratorComponent"))
        {
            this.newTile.generatorState = this.newTile.tile.getComponent("GeneratorComponent").noAutomaticGeneration;
            this.newTile.tile.getComponent("GeneratorComponent").noAutomaticGeneration = true;
        }
        
        this.gridHelper.position.x = Math.floor(player.position.x / 2) * 2;
        this.gridHelper.position.z = Math.floor(player.position.z / 2) * 2;
        scene.add(this.gridHelper);
        
        // TODO: have these buttons move up and down as the keys are pressed
        $("#interface").append(`<div id='newTileOverlay' class='mouse-pass-through'>
            <div>
                <span><kbd>Escape</kbd>&nbsp;or&nbsp;<kbd>Right-Click</kbd>&nbsp;Cancel</span>
                <br/>
                <br/>
                <span><kbd>R</kbd>&nbsp;Rotate 90 degrees</span>
                <br/>
                <br/>
                <span><kbd>Left-Click</kbd>&nbsp;Confirm</span>
            </div>
        </div>`);
        
        // TODO: there is a better way to do this, but right now I can't figure it out.
        // Need to get events but can't use this. in the event, have to use shop.
        // So these are global. There is an ugly line that checks if shop.tile is null in Playtate
        // that I also don't like, but who cares as long as the player can do what they want, right?
        $(window).keydown(this.keydownDuringTilePlacement);
        $(window).mousemove(this.mousemoveDuringTilePlacement);
        $(window).mousedown(this.mousedownDuringTilePlacement);
        
        this.updateTilePlacement();
        
        this.add(this.newTile.tile);
        
        console.log("Started placement of entity", this.newTile);
    }
    
    updateTilePlacement(event)
    {
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Trying to update tile placement, but newTile is invalid!", this.newTile);
            return false;
        }
        
        // TODO: check if placement intersects with any other objets, set invalid flag if so
        this.raycaster.setFromCamera(screenMousePosition, camera);
        this.raycaster.ray.intersectPlane(this.intersectionPlane, this.intersectionPos);
        
        const tileCoordinates = new Vector2(
            Math.floor(this.intersectionPos.x / 2) * 2 + 1,
            Math.floor(this.intersectionPos.z / 2) * 2 + 1,
        );

        this.newTile.tile.position.set(tileCoordinates.x, 0.5, tileCoordinates.y);
    }
    
    cancelTilePlacement()
    {
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Trying to finish tile placement, but newTile is invalid!", this.newTile);
            this.finallyTilePlacement();
            return false;
        }
        
        this.newTile.tile.destructor();
        
        this.finallyTilePlacement();
    }
    
    confirmTilePlacement()
    {
        if (!(this.newTile?.tile instanceof Entity))
        {
            console.error("Trying to finish tile placement, but newTile is invalid!", this.newTile);
            this.finallyTilePlacement();
            return false;
        }
        
        const tileCoordinates = new Vector2(
            Math.floor(this.intersectionPos.x / 2) * 2 + 1,
            Math.floor(this.intersectionPos.z / 2) * 2 + 1,
        );

        if (this.newTile.tile.position.x > this.width / 2 ||
            this.newTile.tile.position.x < -this.width / 2 ||
            this.newTile.tile.position.z > this.length / 2||
            this.newTile.tile.position.z < -this.length / 2)
        {
            console.error("Selected tile position is outside of acceptable area.");
            return false;
        }
        
        this.allTiles.push(this.newTile.tile);
        
        if (this.newTile.tile.hasComponent("ContainerComponent"))
            this.containerTiles.push(this.newTile.tile);
        
        if (this.newTile.tile.hasComponent("GeneratorComponent"))
            this.generatorTiles.push(this.newTile.tile);
            
        if (this.newTile.tile instanceof Register)
            this.registerTiles.push(this.newTile.tile);
        
        if (this.newTile.tile.hasComponent("TriggerComponent"))
            this.newTile.tile.getComponent("TriggerComponent").triggerEnabled = this.newTile.originalTriggerState;
            
        if (this.newTile.tile.hasComponent("GeneratorComponent"))
            this.newTile.tile.getComponent("GeneratorComponent").noAutomaticGeneration = this.newTile.generatorState;

        this.newTile.onAfterPlace?.();

        player.takeMoney(this.newTile.price);

        // create a copy of the tile position instead of
        // of referring to it in the loop, because
        // during the timeout it will get deleted
        const pos = this.newTile.tile.position.clone();
        
        // create a money prop for each dollar of the tile price
        // and have it fly from the player into the prop
        for (let i = 0; i < this.newTile.price; i++)
        {
            setTimeout(() => {
                const money = GeometryUtil.createMoney();

                money.position.copy(player.position);
                money.getComponent("CarryableComponent").setTarget(pos, new Vector3(0, 0, 0));
                
                scene.add(money);
                
                // player's update function deletes carried money when it's done moving
                player.carriedMoney.push(money);
            }, 5 * i);
        }

        this.finallyTilePlacement();
    }
    
    finallyTilePlacement()
    {
        this.newTile = null;

        player.enableMovement();

        // TODO: this is not properly disposed of
        scene.remove(this.gridHelper);

        $(window).off("keydown",   this.keydownDuringTilePlacement);
        $(window).off("mousemove", this.mousemoveDuringTilePlacement);
        $(window).off("mousedown", this.mousedownDuringTilePlacement);

        $("#newTileOverlay").remove();

        console.log("Tile placement is finished.");
    }
    
    startDeletionMode()
    {
        this.inDeletionMode = true;
        
        document.dispatchEvent(new CustomEvent("closeBuyMenu"));
        player.disableMovement(); // closeBuyMenu enables player movement
        
        $(window).keydown(this.keydownDuringDeletion);
        $(window).mousemove(this.mousemoveDuringDeletion);
        $(window).mousedown(this.mousedownDuringDeletion);
        
        shop.gridHelper.position.x = Math.floor(this.position.x / 2) * 2;
        shop.gridHelper.position.z = Math.floor(this.position.z / 2) * 2;
        scene.add(this.gridHelper);
        
        $("#interface").append(`<div id="deletionModeOverlay" class="mouse-pass-through">
            <div>
                <span><kbd>Escape</kbd>&nbsp;or&nbsp;<kbd>Right-Click</kbd>&nbsp;Cancel</span>
                <br/>
                <br/>
                <span><kbd>Left-Click</kbd>&nbsp;Confirm</span>
            </div>
        </div>`);
        
        this.tileDeletionTarget = null;
    }
    
    stopDeletionMode()
    {
        player.enableMovement();
        
        $(window).off("keydown", this.keydownDuringDeletion);
        $(window).off("mousemove", this.mousemoveDuringDeletion);
        $(window).off("mousedown", this.mousedownDuringDeletion);
        
        scene.remove(this.gridHelper);
        
        delete this.tileDeletionTarget;
        
        $("#deletionModeOverlay").remove();
        
        this.inDeletionMode = false;
    }
    
        keydownDuringDeletion(event)
    {
        if (event.code == "Escape")
            shop.stopDeletionMode();
    }
    
    mousemoveDuringDeletion(event)
    {
        // TODO: highlight hovered items
    }
    
    mousedownDuringDeletion(event)
    {
        if (event.button == 0)
        {
            const intersects = shop.raycaster.intersectObjects(shop.allTiles);
            
            for (let i = 0; i < intersects.length; i ++)
            {
                let object = intersects[i].object;
                
                // need to get the parent of the object,
                // because raycaster picks up the GeometryComponent's
                // object and not the actual Entity object.
                if (!("parent" in object))
                    continue;
                
                object = object.parent;
                
                // for now, don't allow a tile to be deleted if an employee is using it.
                if (object.handledByEmployee)
                {
                    console.warn("Tile is being handled by an employee, will not delete.");
                    break;
                }
                
                const allTilesIndex   = shop.allTiles.indexOf(object);
                const containersIndex = shop.containerTiles.indexOf(object);
                const generatorsIndex = shop.generatorTiles.indexOf(object);
                const registersIndex  = shop.registerTiles.indexOf(object);
                
                // for some dumbass god damn reason, any number in JS
                // other than 0 or NaN evaluates to true!!! STUPID!!
                // also, 0 is a valid index
                if (allTilesIndex != -1)
                {
                    shop.tilesPendingDeletion.push({
                        object: object,
                        allTiles: allTilesIndex,
                        containerTiles: containersIndex,
                        generatorTiles: generatorsIndex,
                        registerTIles: registersIndex
                    });
                    
                    break;
                }
            }
        }
        else if (event.button == 2) // right click to cancel
            shop.stopDeletionMode();
    }
    
    updateReputation(amount)
    {
        this.lifeReputation += amount;

        $("#reputation").text(this.lifeReputation);
    }

    // used to re-add saved customers to the scene
    addCustomer(customer)
    {
        this.customers.push(customer);

        $("#customerCount").text(this.customers.length);

        console.log("added customer");
    }
    
    // creates a new customer and gives them actions
    spawnCustomer()
    {
        let customer = new Customer(this);
        customer.startPosition.copy(this.spawnPosition);
        customer.targetPosition.copy(this.spawnPosition);
        customer.position.copy(this.spawnPosition);
        customer.pushAction({ type: "move", position: this.readyPosition, debug: "to ready position" });
        
        let atLeastOneTileSelected = false;
        for (const containerTile of this.containerTiles)
        {
            const chance = MathUtility.getRandomInt(0, 100) + 1;
            
            if (chance > 50)
            {
                const amount = MathUtility.getRandomInt(0, customer.getComponent("ContainerComponent").maxItems) + 1;
                
                if (amount > customer.getComponent("ContainerComponent").maxItems)
                {
                    console.error(`Amount is greater than carry limit! Amount: ${amount} maxItems: ${customer.getComponent("ContainerComponent").maxItems}`);
                    return;
                }
                else
                    console.log(`Customer will buy ${amount} from ${containerTile.name}`);
                
                customer.buyFromContainer(containerTile, amount);
                
                atLeastOneTileSelected = true;
            }
        }
        
        if (!atLeastOneTileSelected)
        {
            console.debug("No tiles were selected, using first shop container tile.");
            customer.buyFromContainer(this.containerTiles[0], MathUtility.getRandomInt(0, customer.getComponent("ContainerComponent").maxItems) + 1);
        }
        
        customer.pushAction({ type: "move", position: customer.findNearestRegister().position, debug: "to register" });
        customer.pushAction({ type: "waitToCheckout", debug: "waiting to checkout" });
        
        this.addCustomer(customer);
        scene.add(customer);
    }
    
    addEmployee(employee = null)
    {
        if (employee == null)
        {
            employee = new Employee(this);
            scene.add(employee);
        }
        
        this.employees.push(employee);
        
        $("#employees").prepend(`<div class="employee" data-employeeId="${employee.uuid}"><button class="fire-employee">Fire</button></div>`);
        
        console.log("added employee to shop");
        
        return employee;
    }

    fireEmployee(uuid)
    {
        for (const index in this.employees)
        {
            const employee = this.employees[index];

            if (employee.uuid == uuid)
            {
                this.employees.splice(this.employees.indexOf(index), 1);
                employee.destructor();
                console.log("Fired employee.", uuid);
                return true;
            }
        }

        console.error("Failed to find requested employee to fire.", uuid);
    }

    update(deltaTime)
    {
        if (this.timeSinceLastCustomer > this.timeUntilNextCustomer)
        {
            if (this.registerTiles.length > 0 && this.containerTiles.length > 0 && this.customers.length < this.maxCustomers)
            {
                this.spawnCustomer();
                
                this.timeSinceLastCustomer = 0;
                console.log("added customer");
                
                this.timeUntilNextCustomer = MathUtility.getRandomInt(this.minTimeUntilNextCustomer, this.maxTimeUntilNextCustomer);
                
                // TODO: make customers come faster 
                //this.timeUntilNextCustomer += this.customerWaitReputationMultiplier * this.lifeReputation;
                
                if (this.timeUntilNextCustomer > this.maxTimeUntilNextCustomer)
                    this.timeUntilNextCustomer = this.maxTimeUntilNextCustomer;
                
                console.log("Next customer will spawn in " + this.timeUntilNextCustomer + " seconds");
            }
        }
        else
            this.timeSinceLastCustomer += deltaTime;
        
        for (const customer of this.customers)
        {
            // if the customer has no actions, delete them.
            if (customer.actions.length <= 0)
            {
                this.updateReputation(customer.mood);
                
                this.customers.splice(this.customers.indexOf(customer), 1);
                $("#customerCount").text(this.customers.length);
                
                customer.destructor();
            }
        }
        
        // TODO: optimise this
        let waitingCustomerCount = 0;
        
        for (const register of this.registerTiles)
            waitingCustomerCount += register.waitingCustomers.length;
        
        $("#waitingCustomers").text(waitingCustomerCount);
        
        // do this here because if the tile is deleted during the mouse event,
        // it could happen in the middle of the update loop and cause an access violation
        if (this.tilesPendingDeletion.length > 0)
        {
            for (const tile of this.tilesPendingDeletion)
            {
                console.log("Deleting tile.", tile);
                
                this.allTiles.splice(tile.allTiles, 1);
                this.containerTiles.splice(tile.containersIndex, 1);
                this.generatorTiles.splice(tile.generatorsIndex, 1);
                this.registerTiles.splice(tile.registersIndex, 1);
                
                player.addMoney(shop.availableTiles[tile.object.name].price / 2);
                
                tile.object.destructor();
                
                tile.object.removeFromParent();
            }
            
            this.tilesPendingDeletion = [];
        }
    }
}