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
    
    serialise()
    {
        const data = {
            position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
            },
            rotation: {
                x: this.rotation.x,
                y: this.rotation.y,
                z: this.rotation.z
            }
        };
        
        if ('name' in this)
            data.type = this.name;
        
        if (this.components.size > 0)
        {
            data.components = {};
            
            this.components.forEach((component, componentType, map) => {
                data.components[componentType] = component.serialise();
            });
        }
        
        return data;
    }
    
    deserialise(data)
    {
        if ("position" in data)
        {
            this.position.x = data.position.x;
            this.position.y = data.position.y;
            this.position.z = data.position.z;
        }
         
        if ("rotation" in data)   
        {
            this.rotation.x = data.rotation.x;
            this.rotation.y = data.rotation.y;
            this.rotation.z = data.rotation.z;
        }
        
        if ("components" in data)
            for (const [componentName, componentData] of Object.entries(data.components))
                this.getComponent(componentName).deserialise(componentData);
    }
}
