import { Vector3, BoxGeometry, MeshStandardMaterial, Mesh, Quaternion, TextureLoader } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "./entity/Entity.js";
import { CarryableComponent } from "./entity/components/CarryableComponent.js";
import { GeometryComponent } from "./entity/components/GeometryComponent.js";
import { RigidBodyCubeComponent } from "./entity/components/RigidBodyCubeComponent.js";

export function createCube(size, position, color)
{
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const material = new MeshStandardMaterial({color: color});
    
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(position);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
}

export function createScaledCube(width, height, thickness, color)
{
    return createCube(new Vector3(width, height, thickness), new Vector3(), color);
}

export function createRigidBodyCube(x, y, z, settings, mass = 10)
{
    const object = new Entity();
    const phys = object.addComponent(new RigidBodyCubeComponent(
        new BoxGeometry(x, y, z),
        new MeshStandardMaterial(settings),
        mass
    ));
    object.dontTrigger = true;
    scene.add(object);
    
    return object;
}

export const moneyGeometry = new BoxGeometry(0.4, 0.2, 0.05);
export const moneyMaterial = new MeshStandardMaterial({ map: new TextureLoader().load("textures/dollar_placeholder.jpg") });

export function createMoney()
{
    const money = new Entity();
    money.dontTrigger = true;
    money.addComponent(new CarryableComponent);
    money.addComponent(new GeometryComponent(
        moneyGeometry.clone(),
        moneyMaterial.clone()
    ));

    return money;
}