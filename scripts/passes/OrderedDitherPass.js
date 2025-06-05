// https://github.com/samuelOsborne/PS1-demakes/
// https://github.com/samwhitford/threejs-ordered-dithering-effect

import { ShaderMaterial, UniformsUtils, Vector2 } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

import { Pass, FullScreenQuad } from "./Pass.js";
import { OrderedDitherShader } from "../shaders/OrderedDitherShader.js";

export class OrderedDitherPass extends Pass
{
    constructor(width, height)
    {
        super();

        const shader = OrderedDitherShader;

        this.uniforms = UniformsUtils.clone(shader.uniforms);

        // this.uniforms['thresholdMapSize'].value = (thresholdMapSize !== undefined) ? thresholdMapSize : 4.0;
        // this.uniforms['scale'].value = (scale !== undefined) ? scale : 1.0;

        console.log(width, height);

        this.uniforms['resolution'].value = new Vector2(width, height);

        this.material = new ShaderMaterial({
            name: shader.name,
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });

        this.fsQuad = new FullScreenQuad(this.material);
    }

    updateResolution(width, height)
    {
        this.width = width;
        this.height = height;
        this.uniforms['resolution'].value = new Vector2(width, height);
    }

    updateDitherScale(scale)
    {
        this.uniforms['ditherScale'].value = scale;
    }

    updateDitherIntensity(intensity)
    {
        this.uniforms['ditherIntensity'].value = intensity
    }

    // 'colorDepth': { value: 64.0 },
    // 'brightness': { value: 1 }, // New brightness compensation
    // 'ditherIntensity': { value: 0.05 } // Adjustable dither noise

    render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */)
    {
        this.uniforms['tDiffuse'].value = readBuffer.texture;

        if (this.renderToScreen)
        {
            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);
        }
        else
        {
            renderer.setRenderTarget(writeBuffer);

            if (this.clear)
                renderer.clear();

            this.fsQuad.render(renderer);
        }
    }

    dispose()
    {
        this.material.dispose();

        this.fsQuad.dispose();
    }
}