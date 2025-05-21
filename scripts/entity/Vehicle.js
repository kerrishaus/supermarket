import { BoxGeometry, Vector3, Vector2, Raycaster, Plane, GridHelper, Group, PlaneGeometry, MeshStandardMaterial, Mesh, FrontSide, PointLight, TextureLoader, RepeatWrapping, CylinderGeometry } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { Entity } from "./Entity.js";
import { TriggerComponent } from "./components/TriggerComponent.js";
import { ContainerComponent } from "./components/ContainerComponent.js";
import { GeometryComponent } from "./components/GeometryComponent.js";
import { GeneratorComponent } from "./components/GeneratorComponent.js";
import { ModelComponent } from "./components/ModelComponent.js";
import { RigidBodyCubeComponent } from "./components/RigidBodyCubeComponent.js";

import * as GeometryUtil from "../GeometryUtility.js";
import * as MathUtility from "../MathUtility.js";

export class Vehicle extends Entity
{
    #frontLeftWheel;
    #frontRightWheel;
    #rearLeftWheel;
    #rearRightWheel;
    
    #body;
    
    constructor(bodyGeometry, wheelGeometries)
    {
        super();
        
        this.#frontLeftWheel  = Vehicle.createWheel();
        this.#frontRightWheel = Vehicle.createWheel();
        this.#rearLeftWheel   = Vehicle.createWheel();
        this.#rearRightWheel  = Vehicle.createWheel();
        
        /*
    	var rightIndex = 0;
    	var upIndex = 1; 
    	var forwardIndex = 2;
    	var wheelDirectionCS0 = new Ammo.btVector3(0,-1,0);
    	var wheelAxleCS = new Ammo.btVector3(-1,0,0);
    	
    	var CUBE_HALF_EXTENTS = 1.03;
    	gEngineForce = 0.0;
    	gBreakingForce = 0.0;
    	
    	maxEngineForce = 1000.0;//th should be engine/velocity dependent
    	maxBreakingForce = 100.0;
    	
    	gVehicleSteering = 0.0;
    	var steeringIncrement = 0.06;
    	var steeringClamp = 0.3;
    	var wheelRadius = 0.4;
    	var wheelWidth = 0.3;
    	var wheelFriction = 100;//BT_LARGE_VAR;
    	var suspensionStiffness = 20.0;
    	var suspensionDamping = 2.3;
    	var suspensionCompression = 4.4;
    	var suspensionRestLength = 0.6;
    	var rollInfluence = 0.1;//1.0f;
    	
    	var m_collisionShapes = [];
    	
    	var localTrans = new Ammo.btTransform();
    	localTrans.setIdentity();
    	
    	var chassisShape = new Ammo.btBoxShape(new Ammo.btVector3(1,0.7,2.5));
    	m_collisionShapes.push(chassisShape);
    	
    	var compound = new Ammo.btCompoundShape();
    	m_collisionShapes.push(compound);
    	var localTrans = new Ammo.btTransform();
    	localTrans.setIdentity();
    	
    	var tr = new Ammo.btTransform();
    	tr.setIdentity();
    	
    	// localTrans effectively shifts the center of mass with respect to the chassis
    	localTrans.setOrigin(new Ammo.btVector3(0,1.3,0));
    	compound.addChildShape(localTrans,chassisShape);
    	tr.setOrigin(new Ammo.btVector3(-6,0,-6));
    	
    	var options = {threemesh:new THREE.Object3D()};
    	options.threemesh.add(bodyGeometry);
    	
    	var m_carChassis = th.localCreateRigidBody(50,tr,compound,options);
    	//m_carChassis.setDamping(0.2,0.2);
    	
    	var m_wheelShape = new Ammo.btCylinderShapeX(new Ammo.btVector3(wheelWidth,wheelRadius,wheelRadius));
    	
    	// --- create vehicle ---
    	var m_tuning = new Ammo.btVehicleTuning();
    	var m_vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster(th.getDynamicsWorld());
    	m_vehicle = new Ammo.btRaycastVehicle(m_tuning, m_carChassis, m_vehicleRayCaster);
    	
    	///never deactivate the vehicle
    	m_carChassis.setActivationState(th.DISABLE_DEACTIVATION);
    	var connectionHeight = 1.3;
    	var isFrontWheel = true;
    	
    	// choose coordinate system
    	m_vehicle.setCoordinateSystem(rightIndex,upIndex,forwardIndex);
    	
    	var connectionPointCS0 = new Ammo.btVector3(CUBE_HALF_EXTENTS-(0.3*wheelWidth),
    		connectionHeight,
    		2*CUBE_HALF_EXTENTS-wheelRadius);
    	
    	m_vehicle.addWheel(connectionPointCS0,
    		wheelDirectionCS0,
    		wheelAxleCS,
    		suspensionRestLength,
    		wheelRadius,
    		m_tuning,
    		isFrontWheel);
    		
    	connectionPointCS0 = new Ammo.btVector3(-CUBE_HALF_EXTENTS+(0.3*wheelWidth),
    		connectionHeight,
    		2*CUBE_HALF_EXTENTS-wheelRadius);
    
    	m_vehicle.addWheel(connectionPointCS0,
    		wheelDirectionCS0,
    		wheelAxleCS,
    		suspensionRestLength,
    		wheelRadius,
    		m_tuning,
    		isFrontWheel);
    
    	connectionPointCS0 = new Ammo.btVector3(-CUBE_HALF_EXTENTS+(0.3*wheelWidth),
    	connectionHeight,
    	-2*CUBE_HALF_EXTENTS+wheelRadius);
    	isFrontWheel = false;
    	m_vehicle.addWheel(connectionPointCS0,
    		wheelDirectionCS0,
    		wheelAxleCS,
    		suspensionRestLength,
    		wheelRadius,
    		m_tuning,
    		isFrontWheel);
    		
    	connectionPointCS0 = new Ammo.btVector3(CUBE_HALF_EXTENTS-(0.3*wheelWidth),
    	connectionHeight,
    	-2*CUBE_HALF_EXTENTS+wheelRadius);
    
    	m_vehicle.addWheel(connectionPointCS0,
    		wheelDirectionCS0,
    		wheelAxleCS,
    		suspensionRestLength,
    		wheelRadius,
    		m_tuning,
    		isFrontWheel);
    		
    	for (var i=0; i<m_vehicle.getNumWheels(); i++){
    		var wheel = m_vehicle.getWheelInfo(i);
    		wheel.set_m_suspensionStiffness(suspensionStiffness);
    		wheel.set_m_wheelsDampingRelaxation(suspensionDamping);
    		wheel.set_m_wheelsDampingCompression(suspensionCompression);
    		wheel.set_m_frictionSlip(wheelFriction);
    		wheel.set_m_rollInfluence(rollInfluence);
    	}
    	th.addVehicle(m_vehicle,m_wheelShape,{threemeshes:wheelGeometries});
    	*/
    }
    
    static createWheel()
    {
        return new CylinderGeometry(
            0.33,
            0.33,
            0.2
        );
    }
}