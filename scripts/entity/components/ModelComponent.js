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
        loader.load("../models/" + "tomato" + ".glb", (gltf) =>
        {
            const model = gltf.scene;
            model.position.set(5, 30, 11.45);
            model.rotation.x = 1.5708;
            model.scale.set(size);
            scene.add(model);

            console.log(model);

            //mixer = new THREE.AnimationMixer(model);
            //mixer.clipAction(gltf.animations[0]).play();
        }, undefined, function(e)
        {
            console.error(e);
        });
    }
}