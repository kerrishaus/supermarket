export class EntityComponent
{
    constructor(...constructorArgs)
    {
        this.constructorArgs = constructorArgs;

        this.parentEntity = null;
    }

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