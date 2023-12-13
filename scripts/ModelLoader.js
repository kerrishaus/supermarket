import { GLTFLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/DRACOLoader.js';

let modelCache = new Map();

let dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://kerrishaus.com/assets/threejs/examples/js/libs/draco/gltf/');

let loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

export function loadModel(modelName)
{
    if (modelCache.has(modelName))
        return modelCache.get(modelName).clone();

    console.log("loading model");

    loader.load(`models/${modelName}.glb`, (gltf) =>
    {
        modelCache.set(modelName, gltf.scene);

        console.log("loaded model " + modelName);
    }, undefined, function(e)
    {
        console.error("failed to load model for " + modelName, e);
    });

    setTimeout(() => 
    {
        if (modelCache.get(modelName) == "unloaded")
        {
            modelCache.delete(modelName);
            console.log("Failed to load model")
        }
    }, 5000);
}