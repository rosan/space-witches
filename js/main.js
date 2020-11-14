import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';

import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, cube1, controls, starField3, starFieldMaterial3, destination ;

let zombieMouse = {
    gltfScene: null,
    boundingBox: null,
    mesh: null,
    animations: null,
    materialMap: null,
    hoverTexture: null,
    hoverMaterial: null,
    mixer: null,
    sound: null,
    speech: null,
}

let mouse = {
    click: null,
    move: null,
    over: null,
    down: null,
}

const raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2(1,1);

const clock = new THREE.Clock();
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

//changing orbital controls target
let alpha=1;
function changeTarget(){
    alpha = alpha + 0.1*delta;

    if(alpha > 0.15){
        alpha = 1;
    }
    controls.target.lerp(destination, alpha);
    console.log(alpha);
}

//Starfield
function starField(){
    const starDisk = new THREE.TextureLoader().load( 'texture/disc.png' );

    const starGeometry = new THREE.Geometry();
    for (let i = 0; i < 2000; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-500;
        vertex.y = Math.random()*1000-500;
        vertex.z = Math.random()*1000-500;
        starGeometry.vertices.push(vertex);
    }
    const starField = new THREE.Points(starGeometry, new THREE.PointsMaterial({
        map: starDisk,
        size: 0.1,
        color: 0xffffff
        })
    ); 
    scene.add(starField);
    starField.position.z = 100;


    const starGeometry2 = new THREE.Geometry();
    for (let i = 0; i < 1000; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-800;
        vertex.y = Math.random()*1000-800;
        vertex.z = Math.random()*1000-800;
        starGeometry2.vertices.push(vertex);
    }
    const starField2 = new THREE.Points(starGeometry2, new THREE.PointsMaterial({
        map: starDisk,
        size: 0.7,
        color: 0xa8e6ff
        })
    ); 
    scene.add(starField2);
    starField2.position.z = 150;


    const starGeometry3 = new THREE.Geometry();
    for (let i = 0; i < 1000; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-500;
        vertex.y = Math.random()*1000-500;
        vertex.z = Math.random()*1000-200;
        starGeometry3.vertices.push(vertex);
    }
    starFieldMaterial3 = new THREE.PointsMaterial({
        map: starDisk,
        size: 0.4,
        color: 0xffc47d
        })
    starField3 = new THREE.Points(starGeometry3, starFieldMaterial3);
    scene.add(starField3);
    starField3.position.z = 130;
}

//Bounding boxes
function makeZombiMouseBoundingBox (){
    const geometry = new THREE.BoxGeometry(6,17,7);

    // const texture = new THREE.TextureLoader().load('texture/brick-texture.jpg')
    // const material = new THREE.MeshBasicMaterial();
    cube1 = new THREE.Mesh(geometry);
    cube1.visible = false;
    cube1.position.x = 0;
    cube1.position.y = 7;
    cube1.position.z = -3;
    cube1.name = 'zombie-mouse-bounding-box';
    cube1.parent = zombieMouse.gltfScene;
    console.log(zombieMouse.gltfScene);

    // scene.add(cube1)
}

function loadZombieMouse(){
    // Loading in zombie mouse model
    const loader = new GLTFLoader();
    loader.load('models/full-mouse-2-animation.gltf', function (gltf) {
        zombieMouse.gltfScene = gltf.scene;
        zombieMouse.gltfScene.position.x = 20;
        zombieMouse.gltfScene.position.y = 5;
        zombieMouse.gltfScene.position.z = 3;

        zombieMouse.animations = gltf.animations;

        scene.add(gltf.scene);
        console.log(zombieMouse.gltfScene.children[0]);
        console.log(zombieMouse.animations);

        //Extracting material: make this more elegant: breadth first search
        zombieMouse.mesh = zombieMouse.gltfScene.children[0].children.filter(function(m){return m.name=='prelim-mouse-blender-3'});
        zombieMouse.materialMap = zombieMouse.mesh[0].material.map;

        makeZombiMouseBoundingBox ();
        zombieMouse.gltfScene.add(cube1);
        
        console.log(zombieMouse.gltfScene)

        //Animation
        zombieMouse.mixer = new THREE.AnimationMixer( zombieMouse.gltfScene.children[0] );
        const clips = zombieMouse.animations;

        const action = zombieMouse.mixer.clipAction(clips[0]);
        action.play();

    }, undefined, function ( error ) {

        console.error( error );

    } );

}

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
    controls.enableDamping = true;
    controls.dampingFactor = 0.00008;
    destination = controls.target;    
    
    //Light
    const light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    camera.position.z = 40;

    //sky
    const skySphere = new THREE.SphereGeometry(500,60,40);
    const equiMaterial = new THREE.MeshBasicMaterial( {
       map: new THREE.TextureLoader().load( 'texture/Nasa-sky-map.jpg' ),   side: THREE.BackSide
    });

    const skyMesh = new THREE.Mesh(skySphere, equiMaterial);
    // scene.add(skyMesh);

    //make starfield

    starField()

    loadZombieMouse()

    zombieMouse.hoverTexture = new THREE.TextureLoader().load('texture/brick-texture.jpg');
    zombieMouse.hoverMaterial = new THREE.MeshStandardMaterial({map: zombieMouse.hoverTexture});

    
    // Mousemodel ambient audio
    zombieMouse.sound = new THREE.PositionalAudio( listener );
    audioLoader.load( 'Audio/NASA_sun_sonification.wav', function (buffer) {
        zombieMouse.sound.setBuffer(buffer);
        zombieMouse.sound.setRefDistance(10);
        zombieMouse.sound.play();
    });

    // Mousemodel on click audio dialogue
    zombieMouse.speech = new THREE.PositionalAudio( listener );
    audioLoader.load( 'Audio/Test-recording.m4a', function (buffer) {
        zombieMouse.speech.setBuffer(buffer);
        zombieMouse.speech.setRefDistance(10);
        
    });
    
    // mouse controls
    function onMouseMove( event ) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   
        console.log(event.buttons);
        
    }

    function onMouseOver( event ){
        mouse.over = true;
        console.log('mouse is over');	
    }

    function onMouseOut( event ){
        mouse.over = false;
        console.log('mouse is out');	
    }

    function onMouseClick ( event ){
        mouse.click = true;
        console.log('mouse click');	
    }

    window.addEventListener( 'mousemove', onMouseMove, false );
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
    zombieMouse.gltfScene.add( zombieMouse.sound);
    zombieMouse.gltfScene.add( zombieMouse.speech);

    
    // starField3.material.color.set(0x852121);

    // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject( cube1, true );

    if(intersects.length > 0){
        console.log('cube intersected');
    }

    if(intersects.length > 0 && intersects[0].object.name=='zombie-mouse-bounding-box'){
        // console.log(controls.target);

        zombieMouse.hoverTexture.wrapS = THREE.RepeatWrapping;
        zombieMouse.hoverTexture.wrapT = THREE.RepeatWrapping;
        zombieMouse.hoverTexture.flipY = false;
        zombieMouse.mesh[0].material.map = zombieMouse.hoverTexture;
    }
    else{
        zombieMouse.mesh[0].material.map = zombieMouse.materialMap;
    }


    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'zombie-mouse-bounding-box'){
        
        console.log('Intersection click', intersects[0].object.name)
        zombieMouse.speech.play();

        // controls.target = zombieMouse.gltfScene.position;
        alpha = 0;
        destination = zombieMouse.gltfScene.position;


        //silent audio and captions play
        const audio = document.getElementById("audio-1");
        audio.play();    
    }
    
    changeTarget();

    controls.update();

    
    renderer.render(scene, camera);

    mouse.click = false;

};

