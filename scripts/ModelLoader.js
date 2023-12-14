import { GLTFLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/DRACOLoader.js';

let modelCache = new Map();

let dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://kerrishaus.com/assets/threejs/examples/js/libs/draco/gltf/');

let loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

export async function loadModel(modelName)
{
    if (modelCache.has(modelName))
        return modelCache.get(modelName).clone();

    console.log("loading model " + modelName);

    const model = await loader.loadAsync(`models/${modelName}.glb`);

    console.log(model);

    // TODO: there is probably a better solution to this
    // all models currently need a metalness of 0 or they
    // are rendered with very little lighting
    model.scene.traverse((object) => {
        if ('material' in object)
            object.material.metalness = 0;
    });

    modelCache.set(modelName, model.scene);

    console.log("loaded model " + modelName);
}

export function getModel(modelName)
{
    return modelCache.get(modelName)?.clone() ?? null;
}