




import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';

import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, cube1,  mouse, mouseDown, mouseMove, mouseClick, mouseOver, mouseSound, mouseSpeech, controls ;

let zombieMouse = {
    gltfScene: null,
    mesh: null,
    animations: null,
    materialMap: null,
    hoverTexture: null,
    hoverMaterial: null,
    mixer: null,
}

const raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2(1,1);

const clock = new THREE.Clock();
let speed = 2;
let delta = 0;

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
    const geometry = new THREE.BoxGeometry(6,17,7);
    // const texture = new THREE.TextureLoader().load('texture/brick-texture.jpg')
    // const material = new THREE.MeshLambertMaterial({map: texture});
    cube1 = new THREE.Mesh(geometry);
    cube1.position.x = 0;
    cube1.position.y = 7;
    cube1.position.z = -3;

    cube1.name = 'zombie-mouse-bounding-box'
    // scene.add(cube);

    console.log(cube1);

    // scene.add(cube);

    // Loading in zombie mouse model
    const loader = new GLTFLoader();
    loader.load('models/full-mouse-1-animation-embed-4.gltf', function (gltf) {
        zombieMouse.gltfScene = gltf.scene;
        zombieMouse.animations = gltf.animations;

        scene.add(gltf.scene);
        console.log(zombieMouse.gltfScene.children[0]);
        console.log(zombieMouse.animations);


        //make this more elegant: breadth first search
        zombieMouse.mesh = zombieMouse.gltfScene.children[0].children.filter(function(m){return m.name=='prelim-mouse-blender-3'});
        zombieMouse.materialMap = zombieMouse.mesh[0].material.map;


        //Animation
        zombieMouse.mixer = new THREE.AnimationMixer( zombieMouse.gltfScene.children[0] );
        const clips = zombieMouse.animations;

        const action = zombieMouse.mixer.clipAction(clips[0]);
        action.play();

    }, undefined, function ( error ) {

        console.error( error );

    } );


    


    zombieMouse.hoverTexture = new THREE.TextureLoader().load('texture/brick-texture.jpg');
    zombieMouse.hoverMaterial = new THREE.MeshStandardMaterial({map: zombieMouse.hoverTexture});

    
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


        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   
        console.log(event.buttons);

        
    }

    function onMouseDown( event ) {     
        mouseDown = true;
        console.log('mouse is down');	 
    }

    function onMouseUp( event ) {
        mouseDown = false;
        console.log('mouse is up');	
    }

    function onMouseOver( event ){
        mouseOver = true;
        console.log('mouse is over');	
    }

    function onMouseOut( event ){
        mouseOver = false;
        console.log('mouse is out');	
    }

    function onMouseClick ( event ){
        mouseClick = true;
        console.log('mouse click');	
    }


    window.addEventListener( 'mousemove', onMouseMove, false );
    // window.addEventListener( 'mousedown', onMouseDown, false );
    // window.addEventListener( 'mouseup', onMouseUp, false );
    window.addEventListener( 'mouseover', onMouseOver, false );
    window.addEventListener( 'mouseout', onMouseOut, false );
    window.addEventListener( 'click', onMouseClick, false );

    //resize canvas with window
    function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);

};

    window.addEventListener('resize', onWindowResize, false);



};




const animate = function animate () { 
    requestAnimationFrame(animate);
    if(!zombieMouse.gltfScene){return;}

    delta = clock.getDelta();
    zombieMouse.mixer.update (delta);
    // todo deltaSeconds

    
    zombieMouse.gltfScene.rotation.x += 0.3 * delta;
    zombieMouse.gltfScene.rotation.y += 0.3 * delta;
    zombieMouse.gltfScene.add(mouseSound);
    zombieMouse.gltfScene.add(mouseSpeech);

    cube1.rotation.x += 0.3 * delta;
    cube1.rotation.y += 0.3 * delta;






    // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject( cube1, true );

    if(intersects.length > 0){
        console.log('cube intersected');
    }




    if(intersects.length > 0 && intersects[0].object.name=='zombie-mouse-bounding-box'){

        
        zombieMouse.hoverTexture.wrapS = THREE.RepeatWrapping;
        zombieMouse.hoverTexture.wrapT = THREE.RepeatWrapping;
        zombieMouse.hoverTexture.flipY = false;
        zombieMouse.mesh[0].material.map = zombieMouse.hoverTexture;
    }
    else{
        zombieMouse.mesh[0].material.map = zombieMouse.materialMap;
    }


    if (mouseClick && intersects.length > 0 && intersects[0].object.name=='zombie-mouse-bounding-box'){
        
        console.log('Intersection click', intersects[0].object.name)
        mouseSpeech.play();

        //silent audio and captions play
        const audio = document.getElementById("audio-1");
        audio.play();    
    }
    
        
 
    
    renderer.render(scene, camera);

    mouseClick = false;

};

