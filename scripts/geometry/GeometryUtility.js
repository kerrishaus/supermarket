import { Vector3, BoxGeometry, MeshStandardMaterial, Mesh, Quaternion } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { RigidBodyCube } from "./RigidBodyCube.js";

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