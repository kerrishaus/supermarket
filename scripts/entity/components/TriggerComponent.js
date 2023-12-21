import { Mesh, Box3, BoxGeometry, MeshStandardMaterial } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EntityComponent } from "./EntityComponent.js";

export class TriggerComponent extends EntityComponent
{
    init(x = 2, y = 2, z = 2)
    {
        this.triggerGeometry = new Mesh(
            new BoxGeometry(x, y, z),
            new MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 })
        );

        this.triggerGeometry.geometry.computeBoundingBox();

        // TODO: make sure it gets removed from the scene properly.
        // right now it just sits around wherever it was last
        this.parentEntity.attach(this.triggerGeometry);

        this.box = new Box3();

        this.triggeringEntitiesLastUpdate = [];
        this.triggeringEntities           = [];

        this.triggerEnabled = true;

        this.triggered = false;
    }

    destructor()
    {
        super.destructor();

        // TODO: this is not properly disposed of
        scene.remove(this.triggerGeometry);
    }

    update(deltaTime)
    {
        super.update(deltaTime);

        this.box.copy(this.triggerGeometry.geometry.boundingBox).applyMatrix4(this.triggerGeometry.matrixWorld);

        if (!this.triggerEnabled)
            return;

        this.triggered = this.triggeringEntities.length > 0;
        this.triggerGeometry.material.color.setHex(this.triggered > 0 ? 0x0ff00 : 0xff0000);

        // TODO: maybe skip all this if both triggering arrays are empty
        // TODO: when object.trigger?.(this.parentEntity)
        // is enabled, the trigger functions are somehow called twice
        // as if object and this.parentEntity are the same objects?

        for (const object of this.triggeringEntities)
        {
            if (!this.triggeringEntitiesLastUpdate.includes(object))
            {
                //object.onStartTrigger?.(this.parentEntity);
                this.parentEntity.onStartTrigger?.(object);
            }

            //object.onTrigger?.(this.parentEntity);
            this.parentEntity.onTrigger?.(object);
        }

        const noLongerTriggeringEntities = this.triggeringEntitiesLastUpdate.filter((object) => {
            return this.triggeringEntities.indexOf(object) == -1;
        });

        for (const object of noLongerTriggeringEntities)
        {
            //object.onStopTrigger?.(this.parentEntity);
            this.parentEntity.onStopTrigger?.(object);
        }

        this.triggeringEntitiesLastUpdate = this.triggeringEntities.slice();
        this.triggeringEntities.length = 0;
    }
};