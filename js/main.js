




import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';

import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, cube, model, INTERSECTED, mouse, mouseDown, mouseUp;

//On mouse event
const raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2(1,1);

let controls;



function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // camera.updateProjectionMatrix();

    

    renderer = new THREE.WebGLRenderer({antialias: true});
    // renderer.setClearColor('red');
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;


   document.body.appendChild(renderer.domElement);

 
// Controls
 controls = new OrbitControls(camera, renderer.domElement );
    
     


// Geometry created
    const geometry = new THREE.BoxGeometry();
    const texture = new THREE.TextureLoader().load('texture/brick-texture.jpg')
    const material = new THREE.MeshLambertMaterial({map: texture});
    cube = new THREE.Mesh(geometry, material);
    cube.position.x = 5;

    scene.add(cube);

    


    //Light
    const light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    camera.position.z = 20;
    controls.update();

    // Loading in the model
    const loader = new GLTFLoader();
    loader.load('models/mouse-rough-v2.gltf', function (gltf) {
        scene.add(gltf.scene);
        model = gltf.scene;

    }, undefined, function ( error ) {

        console.error( error );

    } );


// mouse controls

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   
    console.log(event.buttons);
}

function onMouseDown( event ) {

    event.preventDefault();
    
    mouseDown = true;
    console.log('mouse is down');	 
}

function onMouseUp( event ) {

    event.preventDefault();
    mouseDown = false;
    console.log('mouse is up');	
}

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mouseup', onMouseUp, false );

};

//resize canvas with window

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);

};

window.addEventListener('resize', onWindowResize, false);



const animate = function animate () { 
    requestAnimationFrame(animate);
    if (model){
        model.rotation.x += 0.01;
        model.rotation.y += 0.01;
    } else {
        console.log('model not loaded');
    }
    
    // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
     const  intersects = raycaster.intersectObjects( scene.children, true );


    if (intersects.length > 0){
        controls.enabled=false;
    } else {
        controls.enabled=true;
    }


    if (intersects.length > 0 && mouseDown){
        console.log('Intersection click', intersects[0])
    }

    
    renderer.render(scene, camera);
};


init();
animate();