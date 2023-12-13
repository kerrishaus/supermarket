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

        // TODO: find a way to have this useable in the component constructor.
        // right now, it isn't able to get it because I use the constructor in regular code
        // and I don't want to specify the entity in each one.
        // maybe store all constructor args in a variable, then call an init function with those
        component.setParentEntity(this);

        component.init(component.constructorArgs);

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