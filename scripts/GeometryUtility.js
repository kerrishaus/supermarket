import { BoxGeometry, MeshBasicMaterial, Mesh, Quaternion } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { RigidBodyCube } from "./RigidBodyCube.js";

export function createCube(color)
{
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: color });
    
    return new Mesh(geometry, material);
}

export function createObject(size, position, color)
{
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const material = new MeshBasicMaterial({color: color});
    
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(position);
    
    return mesh;
}

export function createScaledCube(width, height, thickness, color)
{
    const geometry = new BoxGeometry(width, height, thickness);
    const material = new MeshBasicMaterial({ color: color });
    
    return new Mesh(geometry, material);
}

export function createPhysCube(size, position, color, mass = 10)
{
    return new RigidBodyCube(size, color, position, new Quaternion(), mass);
}

export function createPhysSphere(radius, position, color, mass = 10)
{
    return new RigidBodyCube(radius, color, position, new Quaternion(), mass);
}