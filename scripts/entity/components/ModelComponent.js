import { GLTFLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/DRACOLoader.js';

import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EntityComponent } from "./EntityComponent.js";

export class ModelComponent extends EntityComponent
{
    constructor(modelName, size = null)
    {
        super();

        this.model = null;

        let dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://kerrishaus.com/assets/threejs/examples/js/libs/draco/gltf/');

        let loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load(`models/${modelName}.glb`, (gltf) =>
        {
            this.model = gltf.scene;
            this.model.rotation.x = 1.5708;
            this.model.scale.copy(size ?? new Vector3(1, 1, 1));
            scene.add(this.model);

            //mixer = new THREE.AnimationMixer(model);
            //mixer.clipAction(gltf.animations[0]).play();
        }, undefined, function(e)
        {
            console.error(e);
        });
    }

    destructor()
    {
        super.destructor();

        scene.remove(this.model);
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        this.model.rotation.y += 0.01;

        this.model.position.copy(this.parentEntity.position);
    }
}