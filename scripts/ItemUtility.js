import { Tomato  } from "./items/Tomato.js";
import { SodaCan } from "./items/SodaCan.js";
import { Ketchup } from "./items/Ketchup.js";

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
    
    scene.add(newItem);

    return newItem;
}
