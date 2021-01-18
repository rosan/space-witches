import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';

export let trees = {
    gltfScene: null,
    points: null,
    mesh: null,
    load:  function (done){
        const loader = new GLTFLoader();
        loader.load('models/trees.gltf', (gltf) => {
            gltf.scene.name = 'trees';
            console.log(`trees scene is `)
            console.log(gltf.scene);
            this.gltfScene = gltf.scene;

            const color = new THREE.Color(0x2ac7a0)
            const geometry = gltf.scene.children[0].geometry;
            geometry.scale(3, 5, 3)
            const material = new THREE.PointsMaterial({
                size: 0.0001,
                color: color,
                transparent: true,
                opacity: 0.05,
            });
            this.points = new THREE.Points(geometry, material);
            this.points.position.z = -15;
            this.points.position.x = -4;
            this.points.position.y = -10;

            // const meshMaterial = new THREE.MeshBasicMaterial();
            // this.mesh = new THREE.Mesh(geometry, meshMaterial);
            // this.mesh.position.z = 8;
            // console.log('mesh tree is')
            // console.log(this.mesh);

            done();
        }, undefined, function ( error ) {
            console.log('trees model not loaded');
            console.error( error );
    
        })
    
    }
}
