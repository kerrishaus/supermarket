import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import AmmoLib from "https://kerrishaus.com/assets/ammojs/ammo.module.js";

import { EffectComposer } from "https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from 'https://kerrishaus.com/assets/threejs/examples/jsm/postprocessing/RenderPass.js';
import { OrderedDitherPass } from '../passes/OrderedDitherPass.js'

import { OrbitControls } from 'https://kerrishaus.com/assets/threejs/examples/jsm/controls/OrbitControls.js';
import { PhysicsScene } from "../PhysicsScene.js";

import { loadModel } from "../ModelLoader.js";
import { LoadSaveState } from "./LoadSaveState.js";

import { addStyle, removeStyle } from "../PageUtility.js";

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

        function prepareThree()
        {
            console.log("Preparing Three.");
            $("#progressText").text("Preparing Three.js");

            window.sizes = {
                width: 300,
                height: 150
            };

            window.stretched = true;
            
            window.renderer = new THREE.WebGLRenderer({
                antialias: false,
            });
            
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            renderer.setSize(sizes.width, sizes.height)
            renderer.domElement.style.width = "";
            renderer.domElement.style.height = "";
            renderer.setPixelRatio(1)
            renderer.setClearColor(new THREE.Color('#6EB1FF'))
            renderer.domElement.classList.add("webgl");

            const renderTarget = new THREE.WebGLRenderTarget(
                window.innerWidth, window.innerHeight,
                {
                    samples: renderer.getPixelRatio() === 1 ? 2 : 0
                }
            )
            
            document.body.appendChild(renderer.domElement);
            $(renderer.domElement).hide();
            
            window.htmlRenderer = new CSS2DRenderer();
            htmlRenderer.setSize(window.innerWidth, window.innerHeight);
            htmlRenderer.domElement.style.position = "absolute";
            htmlRenderer.domElement.style.top = "0px";
            document.body.appendChild(htmlRenderer.domElement).style.pointerEvents = "none";
            $(htmlRenderer.domElement).hide();
            
            window.camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 5000);

            window.scene = new PhysicsScene(); // TODO: FIXME: I don't really feel great about this, but it works, so it stays.

            window.composer = new EffectComposer(renderer, renderTarget);
            composer.setPixelRatio(1);
            composer.setSize(sizes.width, sizes.height);

            const renderPass = new RenderPass(scene, camera);
            composer.addPass(renderPass);

            const orderedDitherEffect = new OrderedDitherPass(sizes.width, sizes.height);
            composer.addPass(orderedDitherEffect);

            // https://github.com/samuelOsborne/PS1-demakes/
            window.resize = () =>
            {
                if (!stretched)
                {
                    sizes.width = window.innerWidth;
                    sizes.height = window.innerHeight;

                    camera.aspect = sizes.width / sizes.height;
                    camera.updateProjectionMatrix();

                    renderer.setSize(sizes.width, sizes.height);
                    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

                    effectComposer.setSize(sizes.width, sizes.height);
                    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

                    orderedDitherEffect.updateResolution(sizes.width, sizes.height);
                    orderedDitherEffect.updateDitherScale(1);
                    orderedDitherEffect.updateDitherIntensity(0.1);
                }
                else
                {
                    sizes.width = 300;
                    sizes.height = 150;

                    camera.aspect = sizes.width / sizes.height;
                    camera.updateProjectionMatrix();

                    renderer.setSize(sizes.width, sizes.height);
                    renderer.setPixelRatio(1);
                    renderer.domElement.style.width = "";
                    renderer.domElement.style.height = "";

                    effectComposer.setSize(sizes.width, sizes.height);
                    effectComposer.setPixelRatio(1);

                    orderedDitherEffect.updateResolution(sizes.width, sizes.height);
                    orderedDitherEffect.updateDitherScale(0.01);
                    orderedDitherEffect.updateDitherIntensity(0.05);

                }
            };

            $(window).resize(resize);
            
            window.freeControls = new OrbitControls(camera, renderer.domElement);
            freeControls.target.set(0, 0, 0);
            freeControls.update();
            freeControls.enabled = false;
        
            console.log("Three is ready.");
        }
        
        function prepareAmmo(lib)
        {
            console.log("Preparing Ammo.");
            $("#progressText").text("Preparing Ammo.js");
        
            let Ammo = lib;
            window.Ammo = lib;
        
            window.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
            window.dispatcher_  			= new Ammo.btCollisionDispatcher(collisionConfiguration_);
            window.broadphase_  			= new Ammo.btDbvtBroadphase();
            window.solver_      			= new Ammo.btSequentialImpulseConstraintSolver();
            window.physicsBodies    = [];
            window.tmpTransform     = null;
            window.physicsWorld 			= new Ammo.btDiscreteDynamicsWorld(dispatcher_, broadphase_, solver_, collisionConfiguration_);
            window.physicsWorld.setGravity(new Ammo.btVector3(0, 0, -100));
        
            tmpTransform = new Ammo.btTransform();
        
            console.log("Ammo is ready.");
        }
        
        window.addEventListener("DOMContentLoaded", async () =>
        {
            try
            {
                prepareThree();
    
                AmmoLib().then((lib) =>
                {
                    prepareAmmo(lib);
    
                    new Promise(async (resolve) =>
                    {
                        // TODO: have every model loaded automatically
                        $("#progressText").text("Loading models");
    
                        // models need to be loaded before game starts,
                        // because model loader is async and cannot be
                        // called by any functions in the game loop.
                        const models = [
                            "bottleKetchup",
                            "sodaCan",
                            "tomato",
                            "shelf-boxes",
                            "cash-register",
                            "bottle-return",
                            "freezers-standing"
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
                        this.stateMachine.pushState(new LoadSaveState());
                    });
                });
            }
            catch (exception)
            {
                console.error("Exception occured trying to create ThreeJS WebGLRenderer.", exception);
                $("#progressText").text("Fatal error.");
                $("#progress").remove();
                
                stateMachine.popState();
                
                return;
            }
        });
    }
    
    cleanup()
    {
        // loading cover is removed once PlayState is ready.
    }
};