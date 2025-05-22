import { getModel } from "../../ModelLoader.js";

import { EntityComponent } from "./EntityComponent.js";

export class ModelComponent extends EntityComponent
{
    init(modelName)
    {
        this.modelName = modelName;

        this.model = getModel(modelName);
        
        // sets the model upgright because i fucked up the coordinate system when i was prototyping the game lmao
        this.model.rotation.x = Math.PI / 2;

        this.parentEntity.add(this.model);
    }

    destructor()
    {
        super.destructor();
        
        this.parentEntity.remove(this.model);
    }
}