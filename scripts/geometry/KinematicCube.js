import { RigidBodyCube } from "./RigidBodyCube.js";

export class KinematicCube extends RigidBodyCube
{
    constructor(size, color, pos, quat)
    {
        super(size, color, pos, quat, 0);
    }
}