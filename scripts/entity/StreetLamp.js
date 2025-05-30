import { PointLight, PointLightHelper, ConeGeometry, MeshStandardMaterial, Mesh, TextureLoader, MathUtils } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "./Entity.js";

import { ModelComponent } from "./components/ModelComponent.js";

export class StreetLamp extends Entity
{
    constructor()
    {
        super();

        this.model = this.addComponent(new ModelComponent("roads/light-square")).model;
        this.model.scale.set(10, 10, 10);

        this.light = new PointLight(0xd6cc9a, 0.3);
        this.light.position.set(0, 4.5, -2);
        this.light.castShadow = true;
        this.add(this.light);
        
        // const pointLightHelper = new PointLightHelper(this.light);
        // scene.add(pointLightHelper);

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
        this.cone.position.y -= 1.5;
        this.cone.position.z += 0.35;
        
        this.add(this.cone);
    }
}