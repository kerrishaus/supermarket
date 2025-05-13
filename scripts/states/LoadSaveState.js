import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { PlayState } from "./PlayState.js";
import { Shop } from "../Shop.js";
import { Player } from "../Player.js";
import { Customer } from "../Customer.js";
import { Employee } from "../Employee.js";
import { Tomato } from "../items/Tomato.js";
import { SodaCan } from "../items/SodaCan.js";
import { Ketchup } from "../items/Ketchup.js";

import * as SaveLoader from "../SaveLoader.js";
import * as ItemUtility from "../ItemUtility.js";

export class LoadSaveState extends State
{
    init()
    {
        // these are created here because player and shop need themb
        $(document.body).append(`
            <div id='interface' class="gameInterfaceContainer">
                <div id="pauseMenu" class="game-menu" data-visibility="hidden">
                    <button id="resetSave">reset save file</button>
                    <label>
                        Movement Type
                        <select>
                            <option>First Person</option>
                            <option>Third Person Free Angle</option>
                            <option>Third Person Fixed Angle</option>
                            <option>Top Down</option>
                        </select>
                    </label>
                    <label>
                        <input id="pixelShader" type="checkbox" />Pixel Shader
                    </label>
                    <label>
                        <input id="bloomShader" type="checkbox" />Bloom Shader
                    </label>
                </div>
                
                <div id="businessStats">
                    <div id="moneyContainer">
                        <i class='fa fa-money'></i> Money: $<span id='money'>0</span>
                    </div>
                    <div id="reputationContainer">
                        <i class='fa fa-shield'></i> Reputation: <span id='reputation'>0</span>
                    </div>
                    <div>
                        <i class='fa fa-users'></i> Customers in store: <span id="customerCount">0</span>
                    </div>
                    <div>
                        <i class='fa fa-users'></i> Customers waiting to checkout: <span id="waitingCustomers">0</span>
                    </div>
                </div>
                
                <div id="buyMenu" class="game-menu" data-visibility="hidden">
                    <div class="titlebar display-flex space-between">
                        <h1>Buy Menu</h1>
                        <div id="buyMenuClose">
                            <i class="fas fa-times"></i>
                        </div>
                    </div>
                    <hr />
                    <div class="buy-menu-container">
                        <h1>Shop Upgrades</h1>
                        <div id="shopUpgrades">
                        </div>
                    </div>
                    <div class="buy-menu-container">
                        <h1>Tiles</h1>
                        <div id="tiles" class="display-flex flex-wrap">
                        </div>
                    </div>
                    <div class="buy-menu-container">
                        <h1>Employees</h1>
                        <button id="hireEmployee">Hire Employee</button>
                        <div id="employees">
                        </div>
                    </div>
                </div>
                
                <div id="saveIcon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>
        `);

        const saveVersion = 1;

        let saveData = SaveLoader.getSaveData();

        /*
        if (saveData.version != saveVersion)
            saveData = SaveLoader.getDefaultSave();
        */
        
        window.player = new Player();
        
        player.setMoney(saveData.player.money);
        
        player.deserialise(saveData.player);
        
        player.registerEventListeners();
        
        scene.add(player);
        
        console.log("loading shop");
        
        window.shop = new Shop();
        
        if ("tiles" in saveData.shop)
            for (const tile of saveData.shop.tiles)
                this.loadTile(tile);

        if ("customers" in saveData.shop)
            for (const customer of saveData.shop.customers)
                this.loadCustomer(customer);

        if ("employees" in saveData.shop)
            for (const employeeData of saveData.shop.employees)
            {
                console.log("loaded employee");
                const employee = shop.addEmployee();
                employee.deserialise(employeeData);
                scene.add(employee);
            }
        
        scene.add(shop);
        
        this.stateMachine.changeState(new PlayState());
    }
    
    cleanup()
    {
    }
    
    loadCarriedItems(carriedItems, carrier)
    {
        const container = carrier.getComponent("ContainerComponent");

        for (const item of carriedItems)
        {
            let newItem = ItemUtility.instantiateItem(item);
    
            scene.add(newItem);
            container.addItem(newItem);
        }
    }
    
    loadTile(tileData)
    {
        const tile = shop.availableTiles[tileData.type];

        if (!'price' in tile)
        {
            console.error("tile did not contain price, skipping. Tile type: " + tileData.type, tile);
            return null;
        }

        // add the price of the tile to the player's money, because it will be spent by beginTilePlacement
        player.addMoney(tile.price);

        shop.beginTilePlacement(tile);

        // deserialise does this too, might not be necessary to keep anymore
        shop.newTile.tile.position.set(
            tileData.position.x,
            tileData.position.y,
            tileData.position.z,
        );
        
        shop.newTile.tile.rotateZ(tileData.rotation?.z ?? 0)

        shop.confirmTilePlacement();

        console.log(tileData);

        tile.tile.deserialise(tileData);

        return tile.tile;
    }
    
    loadCustomer(customerData)
    {
        console.log("loading customer");
        
        let customer = new Customer(shop);
        
        customer.position.set(
            customerData.position.x,
            customerData.position.y,
            customerData.position.z
        );
        
        customer.rotation.set(
            customerData.rotation.x,
            customerData.rotation.y,
            customerData.rotation.z
        );
        
        this.loadCarriedItems(customerData.carriedItems, customer);
    
        for (const action of customerData.actions)
            this.loadCustomerAction(action);

        shop.addCustomer(customer);
        scene.add(customer);
    }
    
    loadCustomerAction(actionData)
    {

    }
};