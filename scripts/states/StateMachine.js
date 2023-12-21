export class StateMachine
{
    constructor()
    {
        this.states = new Array();
        
        console.log("StateMachine is ready.");
    }
    
    cleanup()
    {
        for (state of this.states)
        {
            state.cleanup();
            state = null;
        }
        
        this.states.length = 0;
        
        console.log("StateMachine is cleaned up.");
    }
    
    pushState(state)
    {
        this.states[this.states.length - 1]?.pause();
            
        state.stateMachine = this;
        this.states.push(state);

        console.log("StateMachine: Initialising " + state.constructor.name + "...");
        state.init.apply(state, state.constructorArgs);
        console.log("StateMachine: Finished initialising " + state.constructor.name + ".");

        $("#debug-state").text(state.constructor.name);
    }
    
    popState()
    {
        const state = this.states[this.states.length - 1];

        console.log("StateMachine: Cleaning up " + state.constructor.name + "...");
        state.cleanup();
        console.log("StateMachine: Cleaned up " + state.constructor.name + ".");

        this.states.pop();
        
        this.states[this.states.length - 1]?.resume();
            
        console.log("StateMachine: Popped state.");
    }
    
    changeState(state)
    {
        this.popState();
        this.pushState(state);
        
        console.log("Changed state.");
    }
    
    update(deltaTime)
    {
        this.states[this.states.length - 1]?.update(deltaTime);
    }
};