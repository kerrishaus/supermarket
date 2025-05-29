import { Group, AmbientLight, BoxGeometry, Vector3, Vector2, Raycaster, Plane, PointLight, PointLightHelper, MeshStandardMaterial, TextureLoader, RepeatWrapping } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "./entity/Entity.js";

import { TriggerComponent } from "./entity/components/TriggerComponent.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";
import { GeneratorComponent } from "./entity/components/GeneratorComponent.js";
import { ModelComponent } from "./entity/components/ModelComponent.js";
import { RigidBodyComponent } from "./entity/components/RigidBodyComponent.js";

import { StreetLamp } from "./tiles/StreetLamp.js";

import * as GeometryUtil from "./GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

export class World extends Group
{
    constructor()
    {
        super();

        //const sunLight = new AmbientLight(0x404040); // soft white light
        //scene.add(sunLight);

        const tile1 = this.getRoadTile("road-straight");
        tile1.position.set(0, -0.5, 14);

        const tile2 = this.getRoadTile("road-straight");
        tile2.position.set(14, -0.5, 0);

        const tile3 = this.getRoadTile("road-crossroad-path");
        tile3.position.set(14, -0.5, 14);

        const tile4 = this.getRoadTile("road-straight");
        tile4.position.set(14, -0.5, 28);

        const tile5 = this.getRoadTile("road-straight");
        tile5.position.set(28, -0.5, 14);

        const tile6 = this.getRoadTile("road-straight");
        tile6.position.set(14, -0.5, -14);

        const lamp1 = new StreetLamp();
        lamp1.position.set(20.25, -0.5, 7.75);
        lamp1.rotation.y = Math.PI / 4;
        this.add(lamp1);

        const lamp2 = new StreetLamp();
        lamp2.position.set(20.25, -0.5, 20.25);
        lamp2.rotation.y = Math.PI / 1.4;
        this.add(lamp2);

        const lamp3 = new StreetLamp();
        lamp3.position.set(7.75, -0.5, 20.25);
        lamp3.rotation.y = -Math.PI / 1.4;
        this.add(lamp3);
    }

    getRoadTile(name)
    {
        const tile = new Entity();

        const model = tile.addComponent(new ModelComponent(`roads/${name}`)).model;
        model.scale.set(14, 14, 14);

        this.add(tile);

        return tile;
    }

    getBuilding(name)
    {
        const tile = new Entity();

        const model = tile.addComponent(new ModelComponent(`buildings/${name}`)).model;
        model.scale.set(16, 16, 16);

        this.add(tile);

        return tile;
    }
}