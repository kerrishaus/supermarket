import { PointLight, PointLightHelper, ConeGeometry, MeshBasicMaterial, Mesh } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

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
        
        this.cone = new Mesh(
            new ConeGeometry(3.3, 6, 32),
            new MeshBasicMaterial({ color: 0xd6cc9a, transparent: true, opacity: 0.05 })
        );
        
        this.cone.position.copy(this.light.position);
        this.cone.position.y -= 1.5;
        this.cone.position.z += 0.35;
        
        this.add(this.cone);
    }
}