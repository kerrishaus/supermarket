import { GLTFLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/DRACOLoader.js';

import { Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EntityComponent } from "./EntityComponent.js";

export class ModelComponent extends EntityComponent
{
    constructor(model, size)
    {
        super();

        let dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('../models/');

        let loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load("../models/" + model + ".glb", (gltf) =>
        {
            this.model = gltf.scene;
            this.model.position.set(5, 30, 11.45);
            this.model.rotation.x = 1.5708;
            this.model.scale.set(size ?? new Vector3(1, 1, 1));
            scene.add(this.model);

            console.log(this.model);

            //mixer = new THREE.AnimationMixer(model);
            //mixer.clipAction(gltf.animations[0]).play();
        }, undefined, function(e)
        {
            console.error(e);
        });
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        this.model.position.copy(this.parentEntity.position);
    }
}