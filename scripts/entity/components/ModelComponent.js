import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { loadModel } from '../../ModelLoader.js';

import { EntityComponent } from "./EntityComponent.js";

export class ModelComponent extends EntityComponent
{
    constructor(modelName, size = null)
    {
        super();

        this.modelName = modelName;

        this.model = loadModel(modelName);
        this.model.rotation.x = 1.5708;
        this.model.scale.copy(size ?? new Vector3(1, 1, 1));
        scene.add(this.model);
    }

    destructor()
    {
        console.warn("destroying " + this.modelName);

        super.destructor();

        scene.remove(this.model);
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        if (this.model === null)
        {
            console.error(this.modelName + " is null!");
        }
        else
        {
            this.model.rotation.y += 0.01;
            this.model.position.copy(this.parentEntity.position);
        }
    }
}