import { getModel } from "../../ModelLoader.js";

import { EntityComponent } from "./EntityComponent.js";

export class ModelComponent extends EntityComponent
{
    init(modelName)
    {
        this.modelName = modelName;

        this.model = getModel(modelName);
        
        this.parentEntity.add(this.model);
    }

    destructor()
    {
        super.destructor();
        
        this.parentEntity.remove(this.model);
    }
}