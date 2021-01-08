import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {TextureAnimator} from './textureAnimator.js';


export function makeRoachBabies(){

    const roachTexture = new THREE.TextureLoader().load('texture/anim-cockroach.png')
    const roachAlphaMap = new THREE.TextureLoader().load('texture/anim-cockroach-alpha-map.png')
    const roachTextureAnimation = new TextureAnimator( roachTexture, 12, 1, 12, 110 ); // texture, #horiz, #vert, #total, duration.
    const roachAlphaAnimation = new TextureAnimator( roachAlphaMap, 12, 1, 12, 110 ); // texture, #horiz, #vert, #total, duration.

    const roachGeometry = new THREE.SphereGeometry(8,5,6);
    for (let i = 0; i < 30; i++) {
        const vertex = new THREE.Vector3();
        // vertex.x = Math.random()*5-50;
        // vertex.y = Math.random()*5-50;
        // vertex.z = Math.random()*5-50;
        roachGeometry.vertices.push(vertex);
    }
    const material = new THREE.PointsMaterial({
        transparent: true,
        alphaMap: roachAlphaMap,
        map: roachTexture,
        size: 2.5,
        color: 0xffffff
        })
    material.side =  THREE.BackSide;

    const roachBabiesPoints = new THREE.Points(roachGeometry, material);
 
    roachBabiesPoints.position.x = 1; 
    roachBabiesPoints.position.y = 4;
    roachBabiesPoints.position.z = -5;
    
    const roachBabies = {
        textureAnimation: roachTextureAnimation, 
        alphaAnimation: roachAlphaAnimation,
        points: roachBabiesPoints,
    };
    return roachBabies;

}