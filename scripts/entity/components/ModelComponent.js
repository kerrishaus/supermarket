import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { getModel } from '../../ModelLoader.js';

import { EntityComponent } from "./EntityComponent.js";

export class ModelComponent extends EntityComponent
{
    init(modelName, size = null)
    {
        this.modelName = modelName;

        this.model = getModel(modelName);
        this.model.scale.copy(size ?? new Vector3(2, 2, 2));
        
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