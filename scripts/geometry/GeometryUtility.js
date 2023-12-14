import { Vector3, BoxGeometry, MeshStandardMaterial, Mesh, Quaternion, TextureLoader } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { RigidBodyCube } from "./RigidBodyCube.js";

import { Entity } from "../entity/Entity.js";
import { CarryableComponent } from "../entity/components/CarryableComponent.js";
import { GeometryComponent } from "../entity/components/GeometryComponent.js";

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

export function createPhysCube(size, position, color, mass = 10)
{
    return new RigidBodyCube(size, color, position, new Quaternion(), mass);
}

export function createPhysSphere(radius, position, color, mass = 10)
{
    return new RigidBodyCube(radius, color, position, new Quaternion(), mass);
}

export const moneyGeometry = new BoxGeometry(0.4, 0.2, 0.1);
export const moneyMaterial = new MeshStandardMaterial({ map: new TextureLoader().load('textures/dollar_placeholder.jpeg') });

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