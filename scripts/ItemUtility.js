import { Tomato  } from "./entity/items/Tomato.js";
import { SodaCan } from "./entity/items/SodaCan.js";
import { Ketchup } from "./entity/items/Ketchup.js";

export function instantiateItem(itemData)
{
    let newItem = null;

    switch (itemData.type)
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
            console.log("Unknown item: " + itemData);
            return null;
    }

    newItem.getComponent("ModelComponent").model.rotation.z = 0.2;
    newItem.getComponent("ModelComponent").model.scale.set(2, 2, 2);
    
    scene.add(newItem);

    return newItem;
}
