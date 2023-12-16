export class EntityComponent
{
    constructor(...constructorArgs)
    {
        this.constructorArgs = constructorArgs;

        this.parentEntity = null;
    }

    // In general, Components are not initialised until they are added to the entity.
    init()
    {

    }

    destructor()
    {
    }

    setParentEntity(entity)
    {
        this.parentEntity = entity;
    }

    update(deltaTime)
    {

    }
}