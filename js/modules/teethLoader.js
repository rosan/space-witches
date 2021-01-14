
import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';


export let teeth = {
    gltfScene: null,
    points: null,
    load:  function (done){
        const loader = new GLTFLoader();
        loader.load('models/teeth.gltf', (gltf) => {
            gltf.scene.name = 'teeth';
            console.log(`teeth scene is `)
            console.log(gltf.scene);
            this.gltfScene = gltf.scene;

            const geometry = gltf.scene.children[0].geometry;
            geometry.scale(0.5, 0.5, 0.5)
            const material = new THREE.PointsMaterial({
                size: 0.01,
            });
            this.points = new THREE.Points(geometry, material);
            this.points.position.z = -0.3;
            // this.points.position.x = -0.3;
            this.points.position.y = 5;
            
            done();
        }, undefined, function ( error ) {
            console.log('teeth model not loaded');
            console.error( error );
    
        })
    
    }
}


