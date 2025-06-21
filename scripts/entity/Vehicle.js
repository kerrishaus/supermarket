import { BoxGeometry, Object3D, Vector3, Vector2, Raycaster, Quaternion, MeshStandardMaterial, CylinderGeometry, Mesh } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { Entity } from "./Entity.js";
import { RigidBodyComponent } from "./components/RigidBodyComponent.js";
import { InteractableComponent } from "./components/InteractableComponent.js";

import { getModel } from "../ModelLoader.js";

export class Vehicle extends Entity
{
    #chassisWidth  = 2.8;
    #chassisHeight = 3;
    #chassisLength = 6.5;
    #vehicleMass   = 600;

	#wheelAxisFrontPosition = 2;
	#wheelHalfTrackFront    = 1.1;
	#wheelRadiusFront       = 0.5;
	#wheelWidthFront        = 0.4;
	#wheelAxisHeightFront   = -0.8;
    
	#wheelAxisPositionBack = -1.25;
	#wheelHalfTrackBack    = 1.1;
	#wheelRadiusBack       = 0.5;
	#wheelWidthBack        = 0.4;
	#wheelAxisHeightBack   = -0.8;
	
	#FRONT_LEFT  = 0;
	#FRONT_RIGHT = 1;
	#BACK_LEFT   = 2;
	#BACK_RIGHT  = 3;

    #friction              = 1000;
    #suspensionStiffness   = 20.0;
    #suspensionDamping     = 2.3;
    #suspensionCompression = 4.4;
    #suspensionRestLength  = 0.6;
	#rollInfluence         = 0;

	#steeringIncrement = 0.04;
	#steeringClamp     = 0.5;
	#maxEngineForce    = 1200;
	#maxBrakingForce  = 10;
	
	#engineForce = 0;
	#vehicleSteering = 0;
	#brakingForce = 0;
	
	#wheelMeshes = [];
	
    constructor(x = 0, y = 0, z = 0)
    {
        super();
        
        console.log("Creating vehicle...");
        
        this.actions = {};
    	this.keysActions = {
    		"KeyW"    : "acceleration",
    		"KeyS"    : "braking",
    		"KeySpace": "handbrake",
    		"KeyA"    : "left",
    		"KeyD"    : "right"
    	};
        
		this.transform = new Ammo.btTransform();
		this.transform.setIdentity();
		this.transform.setOrigin(new Ammo.btVector3(x, y, z));
		this.transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
		this.motionState = new Ammo.btDefaultMotionState(this.transform);
		
		this.box = new Ammo.btBoxShape(new Ammo.btVector3(this.#chassisWidth / 2, this.#chassisHeight / 2, this.#chassisLength / 2));
		
		this.inertia = new Ammo.btVector3(0, 0, 0);
		this.box.calculateLocalInertia(this.#vehicleMass, this.inertia);
		
		this.body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(this.#vehicleMass, this.motionState, this.box, this.inertia));
		this.body.setActivationState(RigidBodyComponent.DISABLE_DEACTIVATION);
		
		physicsWorld.addRigidBody(this.body);
		//physicsBodies.push({ object: this, motionState: this.motionState });
		
		this.chassisMesh = getModel("vehicles/delivery");
		this.chassisMesh.scale.x = 2;
		this.chassisMesh.scale.y = 2;
		this.chassisMesh.scale.z = 2;
		this.chassisMesh.position.y -= 1.8;
		
		let toRemove = [];
		
		for (const child of this.chassisMesh.children)
		    if (child.name.startsWith("wheel"))
		        toRemove.push(child);
		        
		for (const object of toRemove)
		    this.chassisMesh.remove(object);
		    
		this.add(this.chassisMesh);
		
        this.tuning    = new Ammo.btVehicleTuning();
        this.raycaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
        this.vehicle   = new Ammo.btRaycastVehicle(this.tuning, this.body, this.raycaster);
        this.vehicle.setCoordinateSystem(0, 1, 2);
        physicsWorld.addAction(this.vehicle);
        
    	var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    	var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
        
    	const addWheel = (isFront, pos, radius, width, index) =>
    	{
    		var wheelInfo = this.vehicle.addWheel(
				pos,
				wheelDirectionCS0,
				wheelAxleCS,
				this.#suspensionRestLength,
				radius,
				this.tuning,
				isFront
			);
            
    		wheelInfo.set_m_suspensionStiffness(this.#suspensionStiffness);
    		wheelInfo.set_m_wheelsDampingRelaxation(this.#suspensionDamping);
    		wheelInfo.set_m_wheelsDampingCompression(this.#suspensionCompression);
    		wheelInfo.set_m_frictionSlip(this.#friction);
    		wheelInfo.set_m_rollInfluence(this.#rollInfluence);
            
    		this.#wheelMeshes[index] = this.createWheelMesh(radius, width);
    		
    		console.log("Created wheel.");
    	}
        
    	addWheel(true,  new Ammo.btVector3(this.#wheelHalfTrackFront , this.#wheelAxisHeightFront, this.#wheelAxisFrontPosition), this.#wheelRadiusFront, this.#wheelWidthFront, this.#FRONT_LEFT);
    	addWheel(true,  new Ammo.btVector3(-this.#wheelHalfTrackFront, this.#wheelAxisHeightFront, this.#wheelAxisFrontPosition), this.#wheelRadiusFront, this.#wheelWidthFront, this.#FRONT_RIGHT);
    	addWheel(false, new Ammo.btVector3(this.#wheelHalfTrackBack  , this.#wheelAxisHeightBack , this.#wheelAxisPositionBack) , this.#wheelRadiusBack , this.#wheelWidthBack , this.#BACK_LEFT);
    	addWheel(false, new Ammo.btVector3(-this.#wheelHalfTrackBack , this.#wheelAxisHeightBack , this.#wheelAxisPositionBack) , this.#wheelRadiusBack , this.#wheelWidthBack , this.#BACK_RIGHT);
    	
		this.dismountPosition = new Object3D();
		this.dismountPosition.position.x += 2.5;
		this.dismountPosition.position.y = -0.5;
		this.dismountPosition.position.z += 1.2;
		this.attach(this.dismountPosition);

		this.cameraPosition = new Object3D();
		this.cameraPosition.position.z -= this.#chassisLength;
		this.cameraPosition.position.y += this.#chassisHeight;
		this.attach(this.cameraPosition);

    	const interact = this.addComponent(new InteractableComponent(this.#chassisWidth, this.#chassisHeight, this.#chassisLength));
    	
		// TODO: eventually get the wheels and thing added this entity so the position is right.
		// after it works.
		// remove code that sets position of things, just set position of this,
		// and keep quaternion code.
		//this.position.copy(0, 0, 10);
		//this.mesh.position.copy(0, 0, 10);
		
		console.log("Vehicle is ready.");
    }
    
    dispose()
    {
        this.removeEventListeners();
    }
    
    startDriving(driver)
    {
        this.driver = driver;
        this.driver.vehicle = this;
        
        driver.removeEventListeners?.();
        this.driver.phys.disableSimulation();
        
        this.registerEventListeners();
    }
    
    stopDriving()
    {
        this.removeEventListeners();
        
		// TODO: I know there's a better way to do this, but I'm not quite sure what it is.
		// I'd like to not have the dismount position object at all.
		const tempPos = new Vector3();
		tempPos.copy(this.position);
		tempPos.setFromMatrixPosition(this.dismountPosition.matrixWorld);
		this.driver.position.copy(tempPos);

        this.driver.phys.enableSimulation();

        this.driver.registerEventListeners();
        
        this.driver.vehicle = null;
        this.driver = null;
    }
    
    registerEventListeners()
    {
        window.addEventListener("keydown", player.vehicle.keydown);
		window.addEventListener("keyup", player.vehicle.keyup);
		window.addEventListener("blur", player.vehicle.blur);
		
		console.log("added vehicle event listeners");
    }
    
    removeEventListeners()
    {
        window.removeEventListener("keydown", player.vehicle.keydown);
		window.removeEventListener("keyup", player.vehicle.keyup);
		window.removeEventListener("blur", player.vehicle.blur);
		
		console.log("removed vehicle event listeners");
    }
    
	keyup(e)
	{
		if (player.vehicle.keysActions[e.code]) 
		{
			player.vehicle.actions[player.vehicle.keysActions[e.code]] = false;
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}
	
	keydown(e)
	{
        if (e.code == "KeyE")
        {
            player.vehicle.stopDriving();
            return;
        }
        
		if (player.vehicle.keysActions[e.code])
		{
			player.vehicle.actions[player.vehicle.keysActions[e.code]] = true;
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}

	blur(event)
	{
		player.vehicle.actions = [];
	}
    
    createWheelMesh(radius, width)
    {
        console.log("Creating wheel mesh...");
        
        const t = new CylinderGeometry(radius, radius, width, 24, 1);
        t.rotateZ(Math.PI / 2);
        
        const mesh = new Mesh(t, new MeshStandardMaterial({ color: 0x000000 }));
        
        mesh.add(new Mesh(
            new BoxGeometry(width * 1.5, radius * 1.75, radius * .25), 
            new MeshStandardMaterial({ color: 0x000000 })
        ));
        
        scene.add(mesh);
        return mesh;
    }
    
    update(deltatime)
    {
		var speed = this.vehicle.getCurrentSpeedKmHour();

		$("#speed").text((speed < 0 ? "(R) " : "") + Math.abs(speed).toFixed(1) + " km/h");

		this.#brakingForce = 0;
		this.#engineForce = 0;

		if (this.actions.acceleration)
		{
			if (speed < -1)
				this.#brakingForce = this.#maxBrakingForce;
			else
			    this.#engineForce = this.#maxEngineForce;
		}
		else if (this.actions.braking)
		{
			if (speed > 1)
				this.#brakingForce = this.#maxBrakingForce;
			else
			    this.#engineForce = -this.#maxEngineForce / 2;
		}
		else
		{
			this.#brakingForce = this.#maxBrakingForce / 10;
		}

		$("#brakingForce").text(this.#brakingForce);
		$("#engineForce").text(this.#engineForce);

		$("#forward").text(this.actions.acceleration);
		$("#braking").text(this.actions.braking);
		
		if (this.actions.left)
		{
			if (this.#vehicleSteering < this.#steeringClamp)
				this.#vehicleSteering += this.#steeringIncrement;
		}
		else
		{
			if (this.actions.right)
			{
				if (this.#vehicleSteering > -this.#steeringClamp)
					this.#vehicleSteering -= this.#steeringIncrement;
			}
			else
			{
				if (this.#vehicleSteering < -this.#steeringIncrement)
					this.#vehicleSteering += this.#steeringIncrement;
				else
				{
					if (this.#vehicleSteering > this.#steeringIncrement)
						this.#vehicleSteering -= this.#steeringIncrement;
					else
						this.#vehicleSteering = 0;
				}
			}
		}
        
		this.vehicle.applyEngineForce(this.#engineForce, this.#BACK_LEFT);
		this.vehicle.applyEngineForce(this.#engineForce, this.#BACK_RIGHT);

		this.vehicle.setBrake(this.#brakingForce / 2, this.#FRONT_LEFT);
		this.vehicle.setBrake(this.#brakingForce / 2, this.#FRONT_RIGHT);

		if (this.actions.handbraking)
		{
			this.vehicle.setBrake(this.#maxBrakingForce, this.#BACK_LEFT);
			this.vehicle.setBrake(this.#maxBrakingForce, this.#BACK_RIGHT);
		}
		else
		{
			this.vehicle.setBrake(this.#brakingForce, this.#BACK_LEFT);
			this.vehicle.setBrake(this.#brakingForce, this.#BACK_RIGHT);
		}

		this.vehicle.setSteeringValue(this.#vehicleSteering, this.#FRONT_LEFT);
		this.vehicle.setSteeringValue(this.#vehicleSteering, this.#FRONT_RIGHT);

        let tm, p, q, i;
		var n = this.vehicle.getNumWheels();
		
		for (i = 0; i < n; i++)
		{
			this.vehicle.updateWheelTransform(i, true);
			tm = this.vehicle.getWheelTransformWS(i);
			p = tm.getOrigin();
			q = tm.getRotation();
			this.#wheelMeshes[i].position.set(p.x(), p.y(), p.z());
			this.#wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
		}
		
		tm = this.vehicle.getChassisWorldTransform();
		p = tm.getOrigin();
		q = tm.getRotation();
		
		this.position.set(p.x(), p.y(), p.z());
		this.quaternion.set(q.x(), q.y(), q.z(), q.w());
		
		this.driver?.position.copy(this.position);
		this.driver?.quaternion.copy(this.quaternion);
    }
}
