import { State } from "./State.js";

import AmmoLib from "https://kerrishaus.com/assets/ammojs/ammo.module.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/r177/examples/jsm/renderers/CSS2DRenderer.js";

import { EffectComposer } from "https://kerrishaus.com/assets/threejs/r177/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from 'https://kerrishaus.com/assets/threejs/r177/examples/jsm/postprocessing/RenderPass.js';
import { OrderedDitherPass } from '../passes/OrderedDitherPass.js'

import { PhysicsScene } from "../PhysicsScene.js";

import { loadModel } from "../ModelLoader.js";
import { MainMenuState } from "./MainMenuState.js";
import { LoadSaveState } from "./LoadSaveState.js";

import { addStyle, removeStyle } from "../PageUtility.js";

export class StartupState extends State
{
    init()
    {
        addStyle("StartupState");

        $("body").prepend(
            `<div id='LoadingCover'>
                 <div id='logos'>
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
            console.log("Preparing Three...");
            $("#progressText").text("Preparing Three.js");
            
            // this is a very important override of Object3D#traverse,
            // becasue it prevents traverse from being called on children
            // which may no longer exist in the scene.
            THREE.Object3D.prototype.traverse = function(callback)
            {
                callback(this);

                const children = this.children;

                for (let i = 0, l = children.length; i < l; i++)
                    children[i]?.traverse(callback);
            }

            // TODO: need to probably override Scene#remove
            // because sometimes items are not removed from the scene they were added to ?
            // that would remove the need for the override above, I think, but don't know for sure.

            window.sizes = {
                width: window.innerWidth / 5,
                height: window.innerHeight / 5
            };

            window.stretched = true;
            
            window.renderer = new THREE.WebGLRenderer({
                antialias: false,
            });
            
            //renderer.shadowMap.enabled = false;
            //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            renderer.setSize(sizes.width, sizes.height)
            renderer.domElement.style.width = "";
            renderer.domElement.style.height = "";
            renderer.setPixelRatio(1)
            renderer.domElement.classList.add("webgl");

            const renderTarget = new THREE.WebGLRenderTarget(
                window.innerWidth, window.innerHeight,
                {
                    samples: renderer.getPixelRatio() === 1 ? 2 : 0
                }
            )
            
            $("body").append(renderer.domElement);
            $(renderer.domElement).hide();
            
            window.htmlRenderer = new CSS2DRenderer();
            htmlRenderer.setSize(window.innerWidth, window.innerHeight);
            htmlRenderer.domElement.style.position = "absolute";
            htmlRenderer.domElement.style.top = "0px";
            htmlRenderer.domElement.style.pointerEvents = "none";
            $("body").append(htmlRenderer.domElement);
            $(htmlRenderer.domElement).hide();
            
            window.camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 5000);

            window.scene = new PhysicsScene(); // TODO: FIXME: I don't really feel great about this, but it works, so it stays.
            
            const color = '#1b1b1b'; // #B8B8B3
            scene.fog = new THREE.FogExp2(color, 0.04);
            scene.background = new THREE.Color(color);

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

                    composer.setSize(sizes.width, sizes.height);
                    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

                    orderedDitherEffect.updateResolution(sizes.width, sizes.height);
                    orderedDitherEffect.updateDitherScale(1);
                    orderedDitherEffect.updateDitherIntensity(0.1);
                }
                else
                {
                    sizes.width = window.innerWidth / 5;
                    sizes.height = window.innerHeight / 5;
                    
                    camera.aspect = sizes.width / sizes.height;
                    camera.updateProjectionMatrix();
                    
                    renderer.setSize(sizes.width, sizes.height);
                    renderer.setPixelRatio(1);
                    renderer.domElement.style.width = "";
                    renderer.domElement.style.height = "";
                    
                    composer.setSize(sizes.width, sizes.height);
                    composer.setPixelRatio(1);
                    
                    orderedDitherEffect.updateResolution(sizes.width, sizes.height);
                    orderedDitherEffect.updateDitherScale(0.01);
                    orderedDitherEffect.updateDitherIntensity(0.05);
                }
            };
            
            $(window).resize(resize);

            window.screenMousePosition = new THREE.Vector2();

            $(window).mousemove(function(event)
            {
                window.screenMousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
                window.screenMousePosition.y = - (event.clientY / window.innerHeight) * 2 + 1;
            });
        
            console.log("Three is ready.");
        }
        
        async function prepareAmmo()
        {
            console.log("Preparing Ammo...");
            $("#progressText").text("Preparing Ammo.js");
        
            window.Ammo = await new AmmoLib();
        
            console.log("Ammo is ready.");
        }
        
        window.addEventListener("DOMContentLoaded", async () =>
        {
            try
            {
                await prepareAmmo();

                prepareThree();
    
                // TODO: have every model loaded automatically
                console.log("Loading models...");
                $("#progressText").text("Loading models...");

                // models need to be loaded before game starts,
                // because model loader is async and cannot be
                // called by any functions in the game loop.
                const models = [
                    "items/bottleKetchup",
                    "items/sodaCan",
                    "items/tomato",

                    "tiles/shelf-boxes",
                    "tiles/cash-register",
                    "tiles/bottle-return",
                    "tiles/freezers-standing",

                    "roads/light-square",
                    "roads/road-straight",
                    "roads/road-crossroad-path",

                    "buildings/commercial/building-a",
                    
                    "vehicles/delivery",
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

                console.log("Loading is complete.");
                $("#progressText").text("Click to continue...");

                $("body").on("click.postStartup", () =>
                {
                    $("body").off("click.postStartup");

                    this.stateMachine.changeState(new LoadSaveState());
                });

                $("#LoadingCover").addClass("ready");
            }
            catch (exception)
            {
                console.error("Exception occured while starting the game.", exception);
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