import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import * as PageUtility from "../PageUtility.js";

import { PlayState } from "./PlayState.js";
import { Shop } from "../Shop.js";
import { Player } from "../Player.js";
import { Customer } from "../Customer.js";
import { Employee } from "../Employee.js";
import { Tomato } from "../items/Tomato.js";
import { SodaCan } from "../items/SodaCan.js";
import { RecycleBin } from "../tiles/RecycleBin.js";
import * as SaveLoader from "../SaveLoader.js";
import { Ketchup } from "../items/Ketchup.js";
import { Entity } from "../entity/Entity.js";

export class LoadSaveState extends State
{
    init()
    {
        PageUtility.addStyle("loading");

        this.loadingDiv = document.createElement("div");
        this.loadingDiv.id = "loadingDiv";
        this.loadingDiv.classList = "display-flex align-center justify-center";
        this.loadingDiv.textContent = "Loading...";
        document.body.appendChild(this.loadingDiv);

        const saveVersion = 1;

        const saveData = JSON.parse(SaveLoader.saveDataRaw);

        window.player = new Player();

        player.position.set(
            saveData.player.position.x,
            saveData.player.position.y,
            saveData.player.position.z
        );

        // TODO: see if this can match the above style.
        // i'm not super sure if rotation has a set method.
        player.rotation.x = saveData.player.rotation.x;
        player.rotation.y = saveData.player.rotation.y;
        player.rotation.z = saveData.player.rotation.z;

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

        for (const tile of saveData.shop.tiles)
            this.loadTile(tile);

        for (const customer of saveData.shop.customers)
            this.loadCustomer(customer);

        for (const employee of saveData.shop.employees)
            this.loadEmployee(employee);

        scene.add(shop);

        this.stateMachine.changeState(new PlayState());
    }
    
    cleanup()
    {
        PageUtility.removeStyle("loading");
        
        loadingDiv.remove();
    }

    loadCarriedItem(carrier, itemType)
    {

    }

    loadTile(tileData)
    {
        const tile = shop.availableTiles[tileData.type];

        if (!'price' in tile)
        {
            console.error("tile.newTile was not an instance of Entity, skipping. Tile type: " + tileData.type, tile);
            return null;
        }

        player.money += tile.price;

        shop.beginTilePlacement(tile);

        shop.newTile.tile.position.set(
            tileData.position.x,
            tileData.position.y,
            tileData.position.z,
        );

        shop.confirmTilePlacement();

        return tile.newTile;
    }
    
    loadCustomer(customerData)
    {
        console.log("loading customer");
        
        let customer = new Customer(shop);
        
        customer.position.x = customerData.position.x;
        customer.position.y = customerData.position.y;
        customer.position.z = customerData.position.z;
        
        customer.rotation.x = customerData.rotation.x;
        customer.rotation.y = customerData.rotation.y;
        customer.rotation.z = customerData.rotation.z;
        
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
        
        employee.position.x = employeeData.position.x;
        employee.position.y = employeeData.position.y;
        employee.position.z = employeeData.position.z;
        
        employee.rotation.x = employeeData.rotation.x;
        employee.rotation.y = employeeData.rotation.y;
        employee.rotation.z = employeeData.rotation.z;
        
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