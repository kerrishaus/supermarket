// https://github.com/samuelOsborne/PS1-demakes/
// https://github.com/samwhitford/threejs-ordered-dithering-effect

import { Vector2 } from "https://kerrishaus.com/assets/threejs/r177/build/three.module.js";

export const OrderedDitherShader = {
    name: 'OrderedDitherShader',

    uniforms: {
        'tDiffuse': { value: null },
        'resolution': { value: new Vector2(300, 150) },
        'ditherScale': { value: 0.01 },
        'colorDepth': { value: 64.0 },
        'brightness': { value: 1 }, // New brightness compensation
        'ditherIntensity': { value: 0.05 } // Adjustable dither noise
    },

    vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

    fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float ditherScale;
    uniform float colorDepth;
    uniform float brightness;
    uniform float ditherIntensity;
    varying vec2 vUv;

    const mat4 bayerMatrix = mat4(
      0.0/16.0, 12.0/16.0, 3.0/16.0, 15.0/16.0,
      8.0/16.0, 4.0/16.0, 11.0/16.0, 7.0/16.0,
      2.0/16.0, 14.0/16.0, 1.0/16.0, 13.0/16.0,
      10.0/16.0, 6.0/16.0, 9.0/16.0, 5.0/16.0
    );

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      vec2 ditherCoord = gl_FragCoord.xy / (4.0 * ditherScale);
      float ditherValue = bayerMatrix[int(ditherCoord.x) % 4][int(ditherCoord.y) % 4];
      
      // Reduce color depth with brightness compensation
      vec3 reducedColor = floor(color.rgb * colorDepth) / colorDepth;
      reducedColor *= brightness;
      
      // Add dither noise with adjustable intensity
      vec3 ditheredColor = reducedColor + (ditherValue - 0.5) * ditherIntensity;
      
      gl_FragColor = vec4(ditheredColor, color.a);
    }
    `
};