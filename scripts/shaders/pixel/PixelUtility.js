// Original Author: KodyJKind
// Source: https://github.com/KodyJKing/hello-threejs/tree/main/src

import { NearestFilter, RepeatWrapping } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

export function pixelTex(tex)
{
    tex.minFilter = NearestFilter
    tex.magFilter = NearestFilter
    tex.generateMipmaps = false
    tex.wrapS = RepeatWrapping
    tex.wrapT = RepeatWrapping
    return tex
}