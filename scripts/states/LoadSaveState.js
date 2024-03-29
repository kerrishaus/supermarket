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
import * as SaveLoader from "../SaveLoader.js";
import { Ketchup } from "../items/Ketchup.js";

export class LoadSaveState extends State
{
    init()
    {
        // these are created here because player and shop need themb
        $(document.body).append(`
            <div id='interface' class="gameInterfaceContainer">
                <div id="pauseMenu" class="game-menu" data-visibility="hidden">
                    <button id="resetSave">reset save file</button>
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

        player.position.set(
            saveData.player.position.x,
            saveData.player.position.y,
            saveData.player.position.z
        );

        player.rotation.set(
            saveData.player.rotation.x,
            saveData.player.rotation.y,
            saveData.player.rotation.z
        );

        player.registerEventListeners();

        console.log("loading player's carried items");
 
        for (const item of saveData.player.carriedItems)
        {
            let newItem = null;
 
            switch (item.type)
            {
                case "tomato":
                    newItem = new Tomato(player.position);
                    break;
                case "sodaCan":
                    newItem = new SodaCan(player.position);
                    break;
                case "ketchup":
                    newItem = new Ketchup(player.position);
                    break;
                default:
                    console.log("Unknown item type: " + item);
                    continue;
            }
 
            player.getComponent("ContainerComponent").carriedItems.push(newItem);
        }

        scene.add(player);

        console.log("loading shop");

        window.shop = new Shop();

        if ('tiles' in saveData.shop)
            for (const tile of saveData.shop.tiles)
                this.loadTile(tile);

        if ('customers' in saveData.shop)
            for (const customer of saveData.shop.customers)
                this.loadCustomer(customer);

        if ('employees' in saveData.shop)
            for (const employee of saveData.shop.employees)
                this.loadEmployee(employee);

        scene.add(shop);

        this.stateMachine.changeState(new PlayState());
    }
    
    cleanup()
    {
    }

    loadCarriedItem(carrier, itemType)
    {

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

        shop.newTile.tile.position.set(
            tileData.position.x,
            tileData.position.y,
            tileData.position.z,
        );

        shop.confirmTilePlacement();

        // TODO: this has an error where the tile usually ends up with amount - 1 objects.
        // I think it's because other objects are snatching them up
        tile.tile.getComponent("GeneratorComponent")?.addItem(tileData.amount);

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
        
        for (const item of customerData.carriedItems)
            this.loadCarriedItem(customer, item);
    
        for (const action of customerData.actions)
            this.loadCustomerAction(action);

        shop.addCustomer(customer);
        scene.add(customer);
    }
    
    loadCustomerAction(actionData)
    {

    }

    loadEmployee(employeeData)
    {
        console.log("loading employee");
        
        const employee = new Employee(shop);
        
        employee.position.set(
            employeeData.position.x,
            employeeData.position.y,
            employeeData.position.z
        );
        
        employee.rotation.set(
            employeeData.rotation.x,
            employeeData.rotation.y,
            employeeData.rotation.z
        );
        
        for (const item of employeeData.carriedItems)
            this.loadCarriedItem(employee, item);
    
        for (const action of employeeData.actions)
           this.loadEmployeeAction(action, employee);

        shop.addEmployee(employee);
        scene.add(employee);
    }

    loadEmployeeAction(actionData, employee)
    {

    }
};