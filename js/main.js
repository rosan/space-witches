




import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';

import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, cube, mouseModel, mouse, mouseDown, mouseSound, mouseSpeech, controls;

const raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2(1,1);

//make overlay div
const overlay = document.createElement("div");
document.body.appendChild(overlay); 
overlay.id="overlay";


//make button
const button = document.createElement("button");
overlay.appendChild(button); 
button.id = "button";
let text = document.createTextNode("Start");
button.appendChild(text);

button.addEventListener('click', runProgram, false);

function runProgram (event) {
    init();
    animate();
}

//get captions working with audio player
function captionCapture(){
    const audio = document.getElementById("audio-1");
    audio.textTracks[0].addEventListener('cuechange', function(){
        if (this.activeCues.length>0){
            document.getElementById('caption-display').innerText = this.activeCues[0].text;
            console.log(this.activeCues[0].text);
        }
        else {
            document.getElementById('caption-display').innerText = ' ';
            console.log('silence');
        }


    },false)
}

//plays at same time as on click audio to facilitate captions (AudioListerner does not have captions support)
function audioControls (){
    const audioControls = document.createElement("audio");
    // audioControls.setAttribute('controls', true);
    audioControls.id = "audio-1";
    document.body.appendChild(audioControls);

    const source = document.createElement('source');
    source.setAttribute('src', 'Audio/Test-recording.mp3')//Make same length but silent and put here
    source.setAttribute('src', 'Audio/Test-recording.ogg')//Make same length but silent and put here
    source.setAttribute('type', 'audio/mpeg')
    audioControls.appendChild(source);

    const track = document.createElement("track");
    track.setAttribute('kind', 'captions');
    track.setAttribute('src', 'captions/test.vtt');
    track.setAttribute('label', 'English');
    track.setAttribute('default', 'true');
    audioControls.appendChild(track);


    const captionDisplay = document.createElement('div');
    captionDisplay.id = 'caption-display';
    document.body.appendChild(captionDisplay);

}



function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    

 

    renderer = new THREE.WebGLRenderer({antialias: true});
    // renderer.setClearColor('red');
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    audioControls();
    captionCapture();

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );


   
    // create a global audio source
    const sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    //remember to credit audio!
    audioLoader.load( 'audio/Enceladus-Hiss.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.03 );
        sound.play();
    });
        
    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement );   
    
    //Light
    const light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    camera.position.z = 40;
    controls.update();


    // Geometry created
    const geometry = new THREE.BoxGeometry();
    const texture = new THREE.TextureLoader().load('texture/brick-texture.jpg')
    const material = new THREE.MeshLambertMaterial({map: texture});
    cube = new THREE.Mesh(geometry, material);
    cube.position.x = 5;

    scene.add(cube);

    // Loading in the model
    const loader = new GLTFLoader();
    loader.load('models/mouse-rough-v2.gltf', function (gltf) {
        scene.add(gltf.scene);
        mouseModel = gltf.scene;
        

    }, undefined, function ( error ) {

        console.error( error );

    } );

    
    // Mousemodel ambient audio
    mouseSound = new THREE.PositionalAudio( listener );
    audioLoader.load( 'Audio/NASA_sun_sonification.wav', function (buffer) {
        mouseSound.setBuffer(buffer);
        mouseSound.setRefDistance(10);
        mouseSound.play();
    });

    // Mousemodel on click audio dialogue
    mouseSpeech = new THREE.PositionalAudio( listener );
    audioLoader.load( 'Audio/Test-recording.m4a', function (buffer) {
        mouseSpeech.setBuffer(buffer);
        mouseSpeech.setRefDistance(10);
        
    });
    
    // mouse controls
    function onMouseMove( event ) {

        event.preventDefault();

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
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
    if (mouseModel){
        mouseModel.rotation.x += 0.001;
        mouseModel.rotation.y += 0.001;
        mouseModel.add(mouseSound);
        mouseModel.add(mouseSpeech);
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


    if (intersects.length > 0 && mouseDown && intersects[0].object.name=='prelim-mouse-blender-3'){
        console.log('Intersection click', intersects[0])
        console.log(intersects[0].object.name);
       
        mouseSpeech.play();

        //silent audio and captions play
        const audio = document.getElementById("audio-1");
        audio.play();



    }

    
    renderer.render(scene, camera);
};


// animate();