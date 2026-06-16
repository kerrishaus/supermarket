import { Group, AmbientLight, BoxGeometry, Vector3, Vector2, Raycaster, Plane, PointLight, PointLightHelper, MeshStandardMaterial, TextureLoader, RepeatWrapping, MathUtils } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { Entity } from "./entity/Entity.js";

import { TriggerComponent } from "./entity/components/TriggerComponent.js";
import { ContainerComponent } from "./entity/components/ContainerComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";
import { GeneratorComponent } from "./entity/components/GeneratorComponent.js";
import { ModelComponent } from "./entity/components/ModelComponent.js";
import { RigidBodyComponent } from "./entity/components/RigidBodyComponent.js";

import { StreetLamp } from "./entity/StreetLamp.js";

import * as GeometryUtil from "./GeometryUtility.js";
import * as MathUtility from "./MathUtility.js";

export class World extends Group
{
    constructor()
    {
        super();
        
        const sunLight = new AmbientLight(0x404040, 25); // soft white light
        scene.add(sunLight);
        
        const grass = GeometryUtil.createRigidBodyCube(100, 1, 100, { color: 0xbfbfbf }, 0);
        grass.position.set(0, -1, 0);
        this.add(grass);

        const tile1 = this.getRoadTile("road-straight");
        tile1.position.set(-42, -0.5, 14);

        const tile2 = this.getRoadTile("road-straight");
        tile2.position.set(14, -0.5, 0);
        tile2.rotation.y = MathUtils.degToRad(90);

        const tile3 = this.getRoadTile("road-crossroad-path");
        tile3.position.set(14, -0.5, 14);

        const tile4 = this.getRoadTile("road-straight");
        tile4.position.set(14, -0.5, 28);
        tile4.rotation.y = MathUtils.degToRad(90);

        const tile5 = this.getRoadTile("road-straight");
        tile5.position.set(28, -0.5, 14);

        const tile6 = this.getRoadTile("road-intersection-path");
        tile6.position.set(14, -0.5, -14);
        tile6.rotation.y = MathUtils.degToRad(-90);

        const tile6a = this.getRoadTile("road-straight");
        tile6a.position.set(0, -0.5, -14);

        const tile6b = this.getRoadTile("road-straight");
        tile6b.position.set(-14, -0.5, -14);

        const tile7 = this.getRoadTile("road-straight");
        tile7.position.set(14, -0.5, -28);
        tile7.rotation.y = MathUtils.degToRad(90);

        const tile8 = this.getRoadTile("road-straight");
        tile8.position.set(14, -0.5, -42);
        tile8.rotation.y = MathUtils.degToRad(90);

        const tile9 = this.getRoadTile("road-side-entry");
        tile9.position.set(-28, -0.5, 14);
        tile9.rotation.y = MathUtils.degToRad(180);

        const tile10 = this.getRoadTile("road-side");
        tile10.position.set(-14, -0.5, 14);
        tile10.rotation.y = MathUtils.degToRad(180);

        const tile11 = this.getRoadTile("road-side-exit");
        tile11.position.set(0, -0.5, 14);
        tile11.rotation.y = MathUtils.degToRad(180);

        const tile12 = this.getRoadTile("sign-highway");
        tile12.position.set(14, -0.5, -34);
        tile12.rotation.y = MathUtils.degToRad(90);

        const building1 = GeometryUtil.createRigidBodyCube(14, 6, 14, { color: 0xadadad }, 0);
        building1.position.set(-14, 2.5, 0);

        const building2 = GeometryUtil.createRigidBodyCube(14, 8, 14, { color: 0x757575 }, 0);
        building2.position.set(-28, 3.5, 0);

        const building3 = GeometryUtil.createRigidBodyCube(14, 7, 14, { color: 0x858585 }, 0);
        building3.position.set(-42, 3, 0);

        const building4 = GeometryUtil.createRigidBodyCube(14, 6, 7, { color: 0xa6a6a6 }, 0);
        building4.position.set(28, 2.5, 3.5);

        const building5 = GeometryUtil.createRigidBodyCube(14, 6, 7, { color: 0x858585 }, 0);
        building5.position.set(28, 2.5, -3.5);

        const building6 = GeometryUtil.createRigidBodyCube(14, 6, 14, { color: 0x5e5e5e }, 0);
        building6.position.set(28, 2.5, -14);

        const building7 = GeometryUtil.createRigidBodyCube(14, 6, 14, { color: 0xc4c4c4 }, 0);
        building7.position.set(28, 2.5, -14);

        const building8 = GeometryUtil.createRigidBodyCube(14, 6, 14, { color: 0xadadad }, 0);
        building8.position.set(28, 2.5, -28);

        const building9 = GeometryUtil.createRigidBodyCube(14, 6, 14, { color: 0xFF0000 }, 0);
        building9.position.set(0, 2.5, -28);

        const lamp1 = new StreetLamp();
        lamp1.position.set(20.25, -0.5, 7.75);
        lamp1.rotation.y = MathUtils.degToRad(135);
        this.add(lamp1);

        const lamp2 = new StreetLamp();
        lamp2.position.set(20.25, -0.5, 20.25);
        lamp2.rotation.y = MathUtils.degToRad(45);
        this.add(lamp2);

        const lamp3 = new StreetLamp();
        lamp3.position.set(7.75, -0.5, 20.25);
        lamp3.rotation.y = MathUtils.degToRad(-45);
        this.add(lamp3);
        
        /*
        const tile = new Entity();

        const model = tile.addComponent(new ModelComponent(`buildings/building_1`)).model;
        model.scale.set(1, 1, 1);

        this.add(tile);
        */
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