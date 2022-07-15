import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EffectComposer } from "https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from 'https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/RenderPass.js';

import { UnrealBloomPass } from 'https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/UnrealBloomPass.js';

import { ShaderPass } from "https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/ShaderPass.js";
import { PixelShader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/shaders/PixelShader.js';

import { TransformControls } from 'https://kerrishaus.com/assets/threejs/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'https://kerrishaus.com/assets/threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'https://kerrishaus.com/assets/threejs/examples/jsm/environments/RoomEnvironment.js';

import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import AmmoLib from "https://kerrishaus.com/assets/ammojs/ammo.module.js";

import { PhysicsScene } from "../PhysicsScene.js";
import { Shop } from "../Shop.js";
import { Player } from "../Player.js";

import * as PageUtility from "../PageUtility.js";

import { MainMenuState } from "./MainMenuState.js";

export class LoadingState extends State
{
    init(stateMachine)
    {
        this.stateMachine = stateMachine;

        PageUtility.addStyle("loading");

        this.loadingDiv = document.createElement("div");
        this.loadingDiv.id = "loadingDiv";
        this.loadingDiv.classList = "display-flex align-center justify-center";
        this.loadingDiv.textContent = "Loading...";
        document.body.appendChild(this.loadingDiv);

        window.collisionConfiguration_ = null;
        window.dispatcher_ 			   = null;
        window.broadphase_             = null;
        window.solver_				   = null;
        window.physicsWorld            = null;
        window.physicsBodies 		   = new Array();
        window.tmpTransform 		   = null;
        
        function prepareThree()
        {
            console.log("Preparing Three.");

            window.renderer = new THREE.WebGLRenderer({
                antialias: true,
                shadowMap: true
            });
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);
            $(renderer.domElement).hide();

            window.htmlRenderer = new CSS2DRenderer();
            htmlRenderer.setSize(window.innerWidth, window.innerHeight);
            htmlRenderer.domElement.style.position = 'absolute';
            htmlRenderer.domElement.style.top = '0px';
            document.body.appendChild(htmlRenderer.domElement).style.pointerEvents = "none";
            $(htmlRenderer.domElement).hide();

            window.scene = new PhysicsScene(); // TODO: FIXME: I don't really feel great about this, but it works, so it stays.
            
            const light = new THREE.DirectionalLight(0xffffff, 0.5);
            light.position.set(0, 5, 5);
            light.target.position.set(0, 0, 0);
            light.castShadow = true
            light.shadow.mapSize.width = 4096;
            light.shadow.mapSize.height = 4096;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 40;
            light.shadow.camera.left = -40;
            light.shadow.camera.right = 40;
            light.shadow.camera.top = 40;
            light.shadow.camera.bottom = -40;
            scene.add(light);

            const light2 = new THREE.AmbientLight(0xaaaaaa);
            scene.add(light2);
            
            window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
            camera.position.z = 10;
            camera.position.y = -12;
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            
            window.addEventListener('resize', (event) =>
            {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                console.log("Window resized.");
            });

            window.freeControls = new OrbitControls(camera, renderer.domElement);
            freeControls.target.set(0, 0, 0);
            freeControls.update();
            freeControls.enabled = false;

            /*
            dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('https://kerrishaus.com/assets/threejs/examples/js/libs/draco/gltf/');

            loader = new GLTFLoader();
            loader.setDRACOLoader(dracoLoader);
            loader.load('models/LittlestTokyo_placeholder.glb', function(gltf)
            {
                const model = gltf.scene;
                //model.position.set(5, 26, 11.45); // for right out front
                model.position.set(5, 30, 11.45);
                model.rotation.x = 1.5708;
                //model.rotation.y = 1.5708;
                model.scale.set(0.06, 0.06, 0.06);
                scene.add(model);

                mixer = new THREE.AnimationMixer(model);
                mixer.clipAction(gltf.animations[0]).play();
            }, undefined, function(e)
            {
                console.error(e);
            });
            */

            window.composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));

            //composer.addPass(new UnrealBloomPass(new THREE.Vector2(2048, 2048), 1, 0.4, 0.8));
            
            const pixelPass = new ShaderPass(PixelShader);
            pixelPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
            pixelPass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);
            pixelPass.uniforms[ 'pixelSize' ].value = 6;
            composer.addPass(pixelPass);

            console.log("Three is ready.");
        }

        function prepareAmmo(lib)
        {
            console.log("Preparing Ammo.");

            let Ammo = lib;
            window.Ammo = lib;

            collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
            dispatcher_  			= new Ammo.btCollisionDispatcher(collisionConfiguration_);
            broadphase_  			= new Ammo.btDbvtBroadphase();
            solver_      			= new Ammo.btSequentialImpulseConstraintSolver();
            physicsWorld 			= new Ammo.btDiscreteDynamicsWorld(dispatcher_, broadphase_, solver_, collisionConfiguration_);
            physicsWorld.setGravity(new Ammo.btVector3(0, 0, -100));

            tmpTransform = new Ammo.btTransform();

            console.log("Ammo is ready.");
        }

        window.addEventListener('DOMContentLoaded', async () =>
        {
            AmmoLib().then((lib) =>
            {
                prepareThree();
                prepareAmmo(lib);

                this.stateMachine.changeState(new MainMenuState());
            });
        });
        
        console.log("LoadingState ready.");
    }
    
    cleanup()
    {
        PageUtility.removeStyle("loading");
        
        loadingDiv.remove();
        
        console.log("LoadingState cleaned up.");
    }
};