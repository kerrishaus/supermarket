import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { getModel } from '../../ModelLoader.js';

import { EntityComponent } from "./EntityComponent.js";

export class ModelComponent extends EntityComponent
{
    init(modelName, size = null)
    {
        this.modelName = modelName;

        this.model = getModel(modelName);
        this.model.rotation.x = 1.5708;
        this.model.scale.copy(size ?? new Vector3(1, 1, 1));

        this.parentEntity.add(this.model);
    }

    destructor()
    {
        super.destructor();
        
        this.parentEntity.remove(this.model);
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        this.model.rotation.y += 0.01;
    }
}