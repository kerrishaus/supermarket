import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { PhysicsScene } from "../PhysicsScene.js";

import * as PageUtility from "../PageUtility.js";

import { MainMenuState } from "./MainMenuState.js";
import { PlayState } from "./PlayState.js";
import { Shop } from "../Shop.js";
import { Player } from "../Player.js";
import { Customer } from "../Customer.js";
import { Employee } from "../Employee.js";

export class LoadSaveState extends State
{
    init(stateMachine)
    {
        this.stateMachine = stateMachine;

        PageUtility.addStyle("loading");

        this.loadingDiv = document.createElement("div");
        this.loadingDiv.id = "loadingDiv";
        this.loadingDiv.classList = "display-flex align-center justify-center";
        this.loadingDiv.textContent = "Loading...";
        document.body.appendChild(this.loadingDiv);

        const saveVersion = 1;

        const saveDataRaw = 
        `
        {
            "version": 1,
            "shop": {
              "type": 1,
              "money": 25,
              "maxCustomers": 20,
              "timeUntilNextCustomer": 14,
              "timeSinceLastCustomer": 0,
              "minTimeUntilNextCustomer": 7,
              "maxTimeUntilNextCustomer": 20,
              "lifeSales": 0,
              "lifeCustomers": 0,
              "lifeReputation": 0,
              "containers": [
                {
                  "itemType": "tomato",
                  "position": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                  },
                  "amount": 0
                }
              ],
              "customers": [
                {
                  "reputation": 0,
                  "position": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                  },
                  "rotation": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                  },
                  "carriedItems": [
                    {
                      "itemType": "tomato"
                    }
                  ],
                  "actions": [
                    {
                      "name": {},
                      "type": {},
                      "amount": {},
                      "container": {},
                      "position": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                      }
                    }
                  ]
                }
              ],
              "employees": [
                {
                  "position": {
                    "x": 0,
                    "y": 0,
                    "z": 0.5
                  },
                  "rotation": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                  },
                  "carriedItems": [
                    {
                      "itemType": "tomato"
                    }
                  ],
                  "actions": []
                }
              ]
            },
            "player": {
              "position": {
                "x": 0,
                "y": 0,
                "z": 0
              },
              "rotation": {
                "x": 0,
                "y": 0,
                "z": 0.5
              },
              "carriedItems": [
                {
                  "itemType": {},
                  "position": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                  }
                }
              ]
            }
          }
        `;

        const saveData = JSON.parse(saveDataRaw);

        window.shop = new Shop(saveData.shop);
        scene.add(shop);

        for (const customer of saveData.shop.customers)
            this.loadCustomer(customer);

        for (const employee of saveData.shop.employees)
            this.loadEmployee(employee);

        window.player = new Player();
        scene.add(player);

        player.position.x = saveData.player.position.x
        player.position.y = saveData.player.position.y
        player.position.z = saveData.player.position.z

        player.rotation.x = saveData.player.rotation.x
        player.rotation.y = saveData.player.rotation.y
        player.rotation.z = saveData.player.rotation.z
        
        console.log("LoadSaveState complete.");

        this.stateMachine.changeState(new PlayState());
    }
    
    cleanup()
    {
        PageUtility.removeStyle("loading");
        
        loadingDiv.remove();
        
        console.log("LoadingState cleaned up.");
    }

    loadCarriedItem(carrier, itemType)
    {

    }

    loadContainer(containerData)
    {

    }

    loadCustomerAction(actionData)
    {

    }

    loadCustomer(customerData)
    {
        console.log("loading customer");

        let customer = new Customer(shop);
        scene.add(customer);
        shop.addCustomer(customer);
        
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
    }

    loadEmployeeAction(actionData, employee)
    {

    }

    loadEmployee(employeeData)
    {
        console.log("loading employee");

        const employee = new Employee(shop);
        scene.add(employee);
        shop.employees.push(employee);

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
    }
};