import { Mesh, Box3, BoxGeometry, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EntityComponent } from "./EntityComponent.js";

export class TriggerComponent extends EntityComponent
{
    init()
    {
        this.triggerGeometry = new Mesh(
            new BoxGeometry(2, 2, 2), 
            new MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 })
        );

        this.triggerGeometry.geometry.computeBoundingBox();

        // TODO: make sure it gets removed from the scene properly.
        // right now it just sits around wherever it was last
        this.parentEntity.add(this.triggerGeometry);

        this.box = new Box3();
    }

    destructor()
    {
        super.destructor();

        scene.remove(this.triggerGeometry);
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        this.box.copy(this.triggerGeometry.geometry.boundingBox).applyMatrix4(this.triggerGeometry.matrixWorld);
    }
};