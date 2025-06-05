import { SpotLight, SpotLightHelper, PointLight, PointLightHelper, ConeGeometry, MeshStandardMaterial, Mesh, TextureLoader, MathUtils, Vector3 } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { Entity } from "./Entity.js";

import { ModelComponent } from "./components/ModelComponent.js";

export class StreetLamp extends Entity
{
    constructor()
    {
        super();

        this.model = this.addComponent(new ModelComponent("roads/light-square")).model;
        this.model.scale.set(10, 10, 10);

        //this.light = new PointLight(0xd6cc9a, 40);
        this.light = new SpotLight(0xd6cc9a, 10, 0, 0.9, 0.7, 0);
        this.light.castShadow = true;
        this.light.position.set(0, 5.5, -2);
        this.add(this.light);
        this.add(this.light.target);
        this.light.target.position.set(0, 0, -3);
        
        //scene.add(new SpotLightHelper(this.light));

        const lampGlowTexture = new TextureLoader().load("textures/lampglow.png");
        lampGlowTexture.rotation = MathUtils.degToRad(90);
        
        this.cone = new Mesh(
            new ConeGeometry(3.3, 6, 16, 1, true),
            new MeshStandardMaterial({ 
                transparent: true,
                map: lampGlowTexture,
            })
        );
        
        this.cone.position.copy(this.light.position);
        this.cone.position.y -= 2.5;
        this.cone.position.z += 0.35;
        
        this.add(this.cone);
    }
}