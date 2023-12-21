import { Object3D } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

// TODO: rename componentType to componentName
export class Entity extends Object3D
{
    constructor()
    {
        super();

        this.components = new Map();
    }

    destructor()
    {
        this.components.forEach((component, componentType, map) => {
            component.destructor();
        })

        scene.remove(this);
    }

    update(deltaTime)
    {
        this.components.forEach((component, componentType, map) => {
            component.update(deltaTime);
        })
    }

    addComponent(component)
    {
        if (this.components.has(component.constructor.name))
        {
            console.warn("attempted to add component " + component.constructor.name + " to entity that already has it", this);
            return false;
        }

        this.components.set(component.constructor.name, component);

        component.setParentEntity(this);

        component.init.apply(component, component.constructorArgs);

        return component;
    }

    removeComponent(componentType)
    {
        if (!this.components.has(componentType))
        {
            console.error("tried to remove component" + componentType + " but it does not exist in object", this);
            return false;
        }

        this.components.get(componentType).destructor();

        this.components.delete(componentType);
    }

    hasComponent(componentType)
    {
        return this.components.has(componentType);
    }

    getComponent(componentType)
    {
        return this.components.get(componentType) ?? null;
    }
}