import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { EffectComposer } from "https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from 'https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/RenderPass.js';

import { UnrealBloomPass } from 'https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/UnrealBloomPass.js';

import { ShaderPass } from "https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/ShaderPass.js";
import { PixelShader } from 'https://kerrishaus.com/assets/threejs/examples/jsm/shaders/PixelShader.js';

import { TransformControls } from 'https://kerrishaus.com/assets/threejs/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'https://kerrishaus.com/assets/threejs/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'https://kerrishaus.com/assets/threejs/examples/jsm/environments/RoomEnvironment.js';

import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import AmmoLib from "https://kerrishaus.com/assets/ammojs/ammo.module.js";

import { PhysicsScene } from "../PhysicsScene.js";

import { addStyle, removeStyle } from "../PageUtility.js";

import { LoadSaveState } from "./LoadSaveState.js";
import { loadModel } from "../ModelLoader.js";

export class StartupState extends State
{
    init()
    {
        addStyle("StartupState");

        $("body").prepend(
            `<div id='loadingCover'>
                 <div id='status'>
                     <img id='kerris' src='https://kerrishaus.com/assets/logo/text-big.png'></img>
                     <img id='threejs' src='https://raw.githubusercontent.com/mrdoob/three.js/43ec48015f23bda9c2a86533343ab3a2e104bfd6/files/icon.svg'></img>
                     <img id='webgl' src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/WebGL_Logo.svg/1024px-WebGL_Logo.svg.png'></img>
                 </div>
                 <div id='progressContainer'>
                     <progress id="progress"></progress>
                     <h1 id="progressText">Loading...</h1>
                 </div>
                 <div id='help'>
                     Copyright &copy;&nbsp;<span translate='no'>Kerris Haus</span>
                 </div>
             </div>`
        );

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
            $("#progressText").text("Preparing Three.js");

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
                //  TODO: need to update CSS23D object here too.
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                console.log("Window resized.");
            });

            window.freeControls = new OrbitControls(camera, renderer.domElement);
            freeControls.target.set(0, 0, 0);
            freeControls.update();
            freeControls.enabled = false;

            window.composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));

            //composer.addPass(new UnrealBloomPass(new THREE.Vector2(2048, 2048), 1, 0.4, 0.8));
            
            const pixelPass = new ShaderPass(PixelShader);
            pixelPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
            pixelPass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);
            pixelPass.uniforms[ 'pixelSize' ].value = 6;
            //composer.addPass(pixelPass);

            console.log("Three is ready.");
        }

        function prepareAmmo(lib)
        {
            console.log("Preparing Ammo.");
            $("#progressText").text("Preparing Ammo.js");

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
            prepareThree();

            AmmoLib().then((lib) =>
            {
                prepareAmmo(lib);

                new Promise(async (resolve) =>
                {
                    // TODO: have every model loaded automatically
                    $("#progressText").text("Loading models");

                    const models = [
                        "bottleKetchup",
                        "sodaCan",
                        "tomato"
                    ];

                    $("#progress").attr("max", models.length);

                    // a traditional for loop is used here
                    // instead of a for...of loop because
                    // we can use i + 1 to conveniently
                    // increment the progress bar.
                    for (let i = 0; i < models.length; i++)
                    {
                        $("#progress").attr("value", i + 1);

                        const model = models[i];

                        $("#progressText").text(model);
                        await loadModel(model);
                    }

                    console.log("all models loaded");

                    resolve(true);
                }).then(() =>
                {
                    console.log("Loading is complete.");
                    $("#progressText").text("Ready!");
                    this.stateMachine.popState();
                });
            });
        });
    }
    
    cleanup()
    {
        setTimeout(() => {
            // load the new state first so that all the assets are loaded
            // and we don't get super bad popping
            this.stateMachine.pushState(new LoadSaveState());
    
            $("#loadingCover").fadeOut(1000, function() {
                $(this).remove(); 
                $("#loadingStyles").remove();
            });
        }, 1000);
    }
};