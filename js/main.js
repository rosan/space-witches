import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';

import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

let scene, renderer, videoCube, videoSphere, controls, starFieldMaterial3, destination, testcube, cameraTestCube;

let centralCube, centralMouseCube, centralRoachCube;

let cube1, cube2, cube3, spaceWitchFocalPoint, cockroachFocalPoint, zombieMouseFocalPoint, initialDestination, quaternionDestination, initialCameraCube;

let camera, spaceWitchCamera, zombieMouseCamera, cockroachCamera;


let cockroach = {
    gltfScene: null,
    boundingBox: null,
    mesh: null,
    animations: null,
    materialMap: null,
    hoverMaterial: null,
    hoverMaterial: null,
    mixer: null,
    sound: null,
    speech: null,
    body: null,
    array: null,
    helmet: {
        material: null,
        mesh: null,
    },

}

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

let spaceWitch= {
    gltfScene: null,
    boundingBox: null,
    focalPoint: null,
    mesh: null,
    animations: null,
    materialMap: null,
    hoverMaterial: null,
    hoverMaterial: null,
    mixer: null,
    sound: null,
    speech: null,
    body: null,
    array: null,
    hat: {
        material: null,
        mesh: null,
    },
}

let mouse = {
    click: null,
    move: null,
    over: null,
    down: null,
}

let projectionScreen = {
    gltfScene: null,
    boundingBox: null,
    mesh: null,
    originalMaterial: null,
    material: null,
    animations: null,
    materialMap: null,
    video: null,
    videoTexture: null,
    videoMaterial: null,
    mixer: null,
    sound: null,
    speech: null,
}

const raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2(1,1);

const clock = new THREE.Clock();
let delta = 0;


function makeVideo(){
    const video = document.createElement("video");
    video.id = 'video-1';
    document.body.appendChild(video);
    const source = document.createElement('source');
    source.setAttribute('src','texture/mouse-on-white-30fps.mp4');
    video.appendChild(source);    
}


makeVideo();

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
let alphaThreshold= 0.1;
function changeTarget(){
    
    alpha = alpha + 0.01*delta;

    // if (alpha > 0.1){
    //     currentTarget=null;
    // }

    if(alpha > alphaThreshold){
        
        // currentCamera=zombieMouseCamera;
        alpha = 1;
        // currentTarget=null;

    }

    camera.position.lerp(destination.clone(), alpha);

    controls.target.lerp(focalPointDestination, alpha);

    camera.quaternion.slerp(quaternionDestination, alpha);

    // console.log(camera.position)
    
}

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{	
	// note: texture passed by reference, will be updated by the update function.
		
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;
		
	this.update = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};
}	

//roach group
let roachTextureAnimation
let roachAlphaAnimation
function roachBabies(){
    const roachTexture = new THREE.TextureLoader().load('texture/anim-cockroach.png')
    const roachAlphaMap = new THREE.TextureLoader().load('texture/anim-cockroach-alpha-map.png')
    roachTextureAnimation = new TextureAnimator( roachTexture, 12, 1, 12, 110 ); // texture, #horiz, #vert, #total, duration.
    roachAlphaAnimation = new TextureAnimator( roachAlphaMap, 12, 1, 12, 110 ); // texture, #horiz, #vert, #total, duration.


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

    const roachBabies = new THREE.Points(roachGeometry, material);
    cockroach.gltfScene.add(roachBabies);   
    roachBabies.position.x = 1; 
    roachBabies.position.y = 4;
    roachBabies.position.z = -5; 

}


let starField1, starField2, starField3;

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
    starField1 = new THREE.Points(starGeometry, new THREE.PointsMaterial({
        map: starDisk,
        size: 0.1,
        color: 0xffffff
        })
    ); 
    scene.add(starField1);
    starField1.position.z = 100;


    const starGeometry2 = new THREE.Geometry();
    for (let i = 0; i < 1000; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-800;
        vertex.y = Math.random()*1000-800;
        vertex.z = Math.random()*1000-800;
        starGeometry2.vertices.push(vertex);
    }
    starField2 = new THREE.Points(starGeometry2, new THREE.PointsMaterial({
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

function cockroachBoundingBox (){
    const geometry = new THREE.BoxGeometry(3,7,3);
    cube3 = new THREE.Mesh(geometry);
    cube3.visible = false;
    cube3.position.x = 0;
    cube3.position.y = 3;
    cube3.position.z = -1;
    cube3.name = 'cockroach-bounding-box';
    cube3.parent = cockroach.gltfScene;
    scene.add(cube3);
}
function makeZombiMouseBoundingBox (){
    const geometry = new THREE.BoxGeometry(6,17,7);

    cube1 = new THREE.Mesh(geometry);
    cube1.visible = false;
    cube1.position.x = 0;
    cube1.position.y = 7;
    cube1.position.z = -3;
    cube1.name = 'zombie-mouse-bounding-box';
    cube1.parent = zombieMouse.gltfScene;
    // console.log(zombieMouse.gltfScene);

    scene.add(cube1)
}

function makeSpaceWitchBoundingBox (){
    const geometry = new THREE.BoxGeometry(3,9,4);
    cube2= new THREE.Mesh(geometry);
    cube2.visible = false;
    cube2.position.y=4;
    cube2.visible = false;
    cube2.name = 'space-witch-bounding-box';
    cube2.parent = spaceWitch.gltfScene;
    scene.add(cube2);

    // console.log(getBoundingBoxCenter (spaceWitch, cube2));

 
 
}

// function getBoundingBoxCenter (object, mesh){
//     object.focalPoint = new THREE.Vector3();
//     let geometry = mesh.geometry;
//     geometry.computeBoundingBox();

//     // object.focalPoint.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
//     // object.focalPoint.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
//     // object.focalPoint.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
    
//     mesh.localToWorld( object.focalPoint );

//     return object.focalPoint;
// }


function makeCentralElement(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    centralCube = new THREE.Mesh(geometry);
    centralCube.name = 'central cube'
    centralCube.visible = false;
    scene.add(centralCube);
}

function makeCentralMouseElement(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    centralMouseCube = new THREE.Mesh(geometry);
    centralMouseCube.name = 'central mouse cube'
    centralMouseCube.visible = false;

    scene.add(centralMouseCube);
}

function makeCentralRoachElement(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    centralRoachCube = new THREE.Mesh(geometry);
    centralRoachCube.name = 'central roach cube'
    centralRoachCube.visible = false;
    scene.add(centralRoachCube);
}

function makeInitialCameraCube(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    initialCameraCube = new THREE.Mesh(geometry);
    initialCameraCube.position.z= 35;
    initialCameraCube.position.x= 35;
    initialCameraCube.position.y= 35;

    initialCameraCube.name = 'initial camera cube'
    initialCameraCube.visible = false;
    scene.add(initialCameraCube);

}

function loadProjectionScreen (){
    const loader = new GLTFLoader();
    loader.load('models/projection-screen-v7.gltf', function (gltf) {
        projectionScreen.gltfScene = gltf.scene;

        gltf.scene.name = 'projection-screen';
        scene.add(gltf.scene);
        projectionScreen.mesh = projectionScreen.gltfScene.children[7];
        projectionScreen.material = projectionScreen.mesh.material;
        projectionScreen.originalMaterial = projectionScreen.mesh.material;
        projectionScreen.gltfScene.position.x = 5;
        projectionScreen.gltfScene.rotation.y = -2;

        cockroach.gltfScene.add(projectionScreen.gltfScene);


    
    }, undefined, function ( error ) {

        console.error( error );

    } );

}

function loadCockroach(){
    // Loading in zombie mouse model
    const loader = new GLTFLoader();

    loader.load('models/cockroach-combined-anim-1.gltf', function (gltf) {
        cockroach.gltfScene = gltf.scene;
        cockroach.gltfScene.position.x = 15;
        cockroach.gltfScene.position.y = 15;
        cockroach.gltfScene.position.z = 15;
        cockroach.gltfScene.name = 'Cockroach Scene';

        cockroach.animations = gltf.animations;

        scene.add(gltf.scene);
        console.log('cockroach');
        console.log(gltf);
        console.log(cockroach.gltfScene);

        cockroachBoundingBox ();
        cockroach.gltfScene.add(cube3);
        loadProjectionScreen();
        
        roachBabies();


        cockroach.gltfScene.add(cockroachCamera);
        cockroachCamera.position.x = 0;
        cockroachCamera.position.y = 5;
        cockroachCamera.position.z = 10;

        let center = new THREE.Vector3(2,2,0);

        // center.x += 10;

        const geometry = new THREE.BoxGeometry(1,1,1);
        cockroachFocalPoint = new THREE.Mesh(geometry);
        cockroachFocalPoint.position.x = center.x;
        cockroachFocalPoint.position.y = center.y;
        cockroachFocalPoint.position.z = center.z;
        cockroach.gltfScene.add(cockroachFocalPoint );
        cockroachFocalPoint.visible = false;
       
        //Animations
       const tapeRecorder = cockroach.gltfScene.children.filter(function(m){return m.name=="tape-recorder"})[0];
       tapeRecorder.animation = cockroach.animations.filter(function(m){return m.name=="tape-recorderAction"})[0];
       cockroach.mixer = new THREE.AnimationMixer(cockroach.gltfScene);
       const tapeRecorderAction = cockroach.mixer.clipAction(tapeRecorder.animation, tapeRecorder);

       const l1Leg = cockroach.gltfScene.children.filter(function(m){return m.name=="l-1-leg-armature"})[0];
       l1Leg.animation = cockroach.animations.filter(function(m){return m.name=="ArmatureAction"})[0];
       const l1LegAction = cockroach.mixer.clipAction(l1Leg.animation, l1Leg);

       const r2Leg = cockroach.gltfScene.children.filter(function(m){return m.name=="r-2-leg-armature"})[0];
       r2Leg.animation = cockroach.animations.filter(function(m){return m.name=="Armature.001Action"})[0];
       const r2LegAction = cockroach.mixer.clipAction(r2Leg.animation, r2Leg);

       const lAntenna = cockroach.gltfScene.children.filter(function(m){return m.name=="l-attena-armature"})[0];
       lAntenna.animation = cockroach.animations.filter(function(m){return m.name=="Armature.002Action"})[0];
       const lAntennaAction = cockroach.mixer.clipAction(lAntenna.animation, lAntenna);

       const rAntenna = cockroach.gltfScene.children.filter(function(m){return m.name=="r-1-antenna"})[0];
       rAntenna.animation = cockroach.animations.filter(function(m){return m.name=="Armature.003Action"})[0];
       const rAntennaAction = cockroach.mixer.clipAction(rAntenna.animation, rAntenna);

       const r1Leg = cockroach.gltfScene.children.filter(function(m){return m.name=="r-1-leg-armature"})[0];
       r1Leg.animation = cockroach.animations.filter(function(m){return m.name=="Armature.004Action"})[0];
       const r1LegAction = cockroach.mixer.clipAction(r1Leg.animation, r1Leg);

       const l3Leg = cockroach.gltfScene.children.filter(function(m){return m.name=="Armature005"})[0];
       l3Leg.animation = cockroach.animations.filter(function(m){return m.name=="Armature.005Action"})[0];
       const l3LegAction = cockroach.mixer.clipAction(l3Leg.animation, l3Leg);

       const r3Leg = cockroach.gltfScene.children.filter(function(m){return m.name=="Armature006"})[0];
       r3Leg.animation = cockroach.animations.filter(function(m){return m.name=="Armature.006Action"})[0];
       const r3LegAction = cockroach.mixer.clipAction(r3Leg.animation, r3Leg);

       const l2Leg = cockroach.gltfScene.children.filter(function(m){return m.name=="Armature007"})[0];
       l2Leg.animation = cockroach.animations.filter(function(m){return m.name=="Armature.007Action"})[0];
       const l2LegAction = cockroach.mixer.clipAction(l2Leg.animation, l2Leg);


    tapeRecorderAction.play();
    l1LegAction.play();
    r2LegAction.play();
    lAntennaAction.play();
    rAntennaAction.play();
    r1LegAction.play();
    l3LegAction.play();
    r3LegAction.play();
    l2LegAction.play();


    makeCentralRoachElement()
    cockroach.gltfScene.parent = centralRoachCube;


    //    spaceWitch.hat.mesh = spaceWitch.gltfScene.getObjectByName("hat-2001_0",true);
    //    spaceWitch.hat.material = spaceWitch.hat.mesh.material;


    }, undefined, function ( error ) {

        console.error( error );

    } );
}


function loadSpaceWitch(){
     // Loading in zombie mouse model
     const loader = new GLTFLoader();
     loader.load('models/space-witch-rehat-top-update.gltf', function (gltf) {
        spaceWitch.gltfScene = gltf.scene;
        spaceWitch.gltfScene.position.x = 10;
        spaceWitch.gltfScene.position.y = 10;
        spaceWitch.gltfScene.position.z = 10;
        spaceWitch.gltfScene.name = 'Space Witch Scene';
 
        spaceWitch.animations = gltf.animations;
 
        scene.add(gltf.scene);
        
        makeSpaceWitchBoundingBox();
        spaceWitch.gltfScene.add(cube2);
        spaceWitch.gltfScene.add(spaceWitchCamera);
        spaceWitchCamera.position.x = -15;
        spaceWitchCamera.position.y = 5;
        spaceWitchCamera.position.z = 0;

        let center = new THREE.Vector3(0,5,0);

        // center.x += 10;

        const geometry = new THREE.BoxGeometry(2,2,2);
        spaceWitchFocalPoint = new THREE.Mesh(geometry);
        spaceWitchFocalPoint.position.x = center.x;
        spaceWitchFocalPoint.position.y = center.y;
        spaceWitchFocalPoint.position.z = center.z;
        spaceWitch.gltfScene.add(spaceWitchFocalPoint );
        spaceWitchFocalPoint.visible = false;



         //Animations
        const leftArm = spaceWitch.gltfScene.children.filter(function(m){return m.name=="left-arm-armature"})[0];
        leftArm.animation = spaceWitch.animations.filter(function(m){return m.name=="Armature.002Action.001"})[0];
        spaceWitch.mixer = new THREE.AnimationMixer(spaceWitch.gltfScene);
        const leftArmAction = spaceWitch.mixer.clipAction(leftArm.animation, leftArm);

        const rightArm = spaceWitch.gltfScene.children.filter(function(m){return m.name=="right-arm-armature"})[0];
        rightArm.animation = spaceWitch.animations.filter(function(m){return m.name=="Armature.001Action"})[0];
        const rightArmAction = spaceWitch.mixer.clipAction(rightArm.animation, rightArm);

        const top = spaceWitch.gltfScene.children.filter(function(m){return m.name=="top"})[0];
        top.animation = spaceWitch.animations.filter(function(m){return m.name=="topAction"})[0];
        const topAction = spaceWitch.mixer.clipAction(top.animation, top);

        const hat = spaceWitch.gltfScene.children.filter(function(m){return m.name=="hat"})[0];
        hat.animation = spaceWitch.animations.filter(function(m){return m.name=="hatAction"})[0];

        const hatAction = spaceWitch.mixer.clipAction(hat.animation, hat);

        spaceWitch.body = spaceWitch.gltfScene.children.filter(function(m){return m.name=="belly-legs-feet-armature"})[0];
        spaceWitch.body.animation = spaceWitch.animations.filter(function(m){return m.name=="Armature.003Action"})[0];
        const bodyAction = spaceWitch.mixer.clipAction(spaceWitch.body.animation, spaceWitch.body);

        leftArmAction.play();
        rightArmAction.play();
        hatAction.play();
        bodyAction.play();
        topAction.play();

        makeCentralElement();

        spaceWitch.gltfScene.parent = centralCube;


        spaceWitch.hat.mesh = spaceWitch.gltfScene.getObjectByName("hat-2001_0",true);
        spaceWitch.hat.material = spaceWitch.hat.mesh.material;

 
     }, undefined, function ( error ) {
 
         console.error( error );
 
     } );
}


function loadZombieMouse(){
    // Loading in zombie mouse model
    const loader = new GLTFLoader();
    loader.load('models/full-mouse-2-animation.gltf', function (gltf) {
        zombieMouse.gltfScene = gltf.scene;
        zombieMouse.gltfScene.position.x = -20;
        zombieMouse.gltfScene.position.y = -5;
        zombieMouse.gltfScene.position.z = -3;

        zombieMouse.animations = gltf.animations;

        scene.add(gltf.scene);
        // console.log(zombieMouse.gltfScene.children[0]);
        // console.log(zombieMouse.animations);

        //Extracting material: make this more elegant: breadth first search
        zombieMouse.mesh = zombieMouse.gltfScene.children[0].children.filter(function(m){return m.name=='prelim-mouse-blender-3'});
        zombieMouse.materialMap = zombieMouse.mesh[0].material.map;

        makeZombiMouseBoundingBox ();
        zombieMouse.gltfScene.add(cube1);

        zombieMouse.gltfScene.add(zombieMouseCamera);
        zombieMouseCamera.position.x = 18;
        zombieMouseCamera.position.y = 5;
        zombieMouseCamera.position.z = 5;


        let center = new THREE.Vector3(0,5,-3);

        // center.x += 10;

        const geometry = new THREE.BoxGeometry(2,2,2);
        zombieMouseFocalPoint = new THREE.Mesh(geometry);
        zombieMouseFocalPoint.position.x = center.x;
        zombieMouseFocalPoint.position.y = center.y;
        zombieMouseFocalPoint.position.z = center.z;
        zombieMouse.gltfScene.add(zombieMouseFocalPoint);
        zombieMouseFocalPoint.visible = false;

        // cameraTestCube = new THREE.Mesh(geometry);
        // cameraTestCube.position.x = 18;
        // cameraTestCube.position.y = 5;
        // cameraTestCube.position.z = 5;
        // zombieMouse.gltfScene.add(cameraTestCube);

        
        // console.log(zombieMouse.gltfScene)

        //Animation
        zombieMouse.mixer = new THREE.AnimationMixer( zombieMouse.gltfScene.children[0] );
        const clips = zombieMouse.animations;

        const action = zombieMouse.mixer.clipAction(clips[0]);
        action.play();

        makeCentralMouseElement();
        zombieMouse.gltfScene.parent = centralMouseCube;

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
    scene.add(camera);
    camera.name = 'global-camera';
    spaceWitchCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    spaceWitchCamera.name = 'space-witch-camera';
    cockroachCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cockroachCamera.name = 'cockroach-camera';
    zombieMouseCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    zombieMouseCamera.name = 'zombie-mouse-camera';
    currentCamera = camera;

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
    controls.dampingFactor = 0.02;
    initialDestination = new THREE.Vector3(10,10,10);
    destination =  initialDestination;   
    
    //Light
    const light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    camera.position.z = 1000;


    // put this in later w timing for narrative
    // const near = 10;
    // const far = 100;
    // const color = 'blue';
    // scene.fog = new THREE.Fog(color, near, far);


    starField();

    loadZombieMouse();
    
    loadSpaceWitch();

    loadCockroach();
   
    makeInitialCameraCube()

    zombieMouse.hoverTexture = new THREE.TextureLoader().load('texture/brick-texture.jpg');
    zombieMouse.hoverMaterial = new THREE.MeshStandardMaterial({map: zombieMouse.hoverTexture});

    spaceWitch.hoverMaterial = new THREE.MeshBasicMaterial();
    

    //make starfield

    function loadVideoTexture(){
        projectionScreen.video = document.getElementById('video-1');
        projectionScreen.videoTexture = new THREE.VideoTexture( projectionScreen.video );
        projectionScreen.videoTexture.flipY = false;
        // projectionScreen.videoTexture.rotation = Math.Pi/2;
        projectionScreen.videoTexture.format = THREE.RGBFormat;
        const color2 = new THREE.Color( 0x2194ce );
        projectionScreen.videoMaterial = new THREE.MeshBasicMaterial({map: projectionScreen.videoTexture});
        projectionScreen.videoMaterial.name = 'videoMaterial';

        projectionScreen.video.addEventListener('ended', function(){
            console.log('video is done');
            projectionScreen.mesh.material = projectionScreen.originalMaterial;
    
        });

    }

    loadVideoTexture()


    // //sky
    // const skySphere = new THREE.SphereGeometry(5,6,4);
    // const equiMaterial = new THREE.MeshLambertMaterial( {
    //     map: projectionScreen.videoTexture, 
    // });

    // const skyMesh = new THREE.Mesh(skySphere, equiMaterial);
    // scene.add(skyMesh);
    
    // const videoCubeGeometry = new THREE.BoxGeometry(100,100,100)
    const videoSphereGeometry = new THREE.SphereGeometry(500,6,50);
    const video = document.getElementById('video-1');
    const videoTexture = new THREE.VideoTexture( video );
    videoTexture.format = THREE.RGBFormat;
    const videoMaterial = new THREE.MeshBasicMaterial({map: videoTexture});
    videoMaterial.side =  THREE.BackSide;
    videoSphere = new THREE.Mesh(videoSphereGeometry, videoMaterial);

    

    
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
        // console.log(event.buttons);
        
    }

    function onMouseOver( event ){
        mouse.over = true;
        console.log('mouse is over');	
    }

    function onMouseOut( event ){
        mouse.over = false;
        // console.log('mouse is out');	
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

    // this makes it possible to actually get close to objects in orbital controls instead of infinetly slowing down as you approach
    controls.dollyOut = function(){
        this.object.position.z -= 100;
    }
    controls.dollyIn = function(){
        this.object.position.z += 100;
    }

    function makeTestCube(){
        const geometry = new THREE.BoxGeometry(2,2,2);
        testcube = new THREE.Mesh(geometry);
        scene.add(testcube);
    }
    // makeTestCube()
 };

let currentTarget;
let currentCamera;
let currentFocalPoint;
let focalPointDestination;
let doOnce = 1;



const animate = function animate () { 
    requestAnimationFrame(animate);
    if(!zombieMouse.gltfScene||!spaceWitch.gltfScene||!cockroach.gltfScene||!projectionScreen.gltfScene ||!starField1 ||!starField2 ||!starField3 ){return;}

    if (doOnce==1){
        console.log(camera.position);
        currentTarget = initialCameraCube;
        currentFocalPoint=centralCube;
        alpha = 0;
        doOnce = null;
    }



    delta = clock.getDelta();
    zombieMouse.mixer.update (delta);
    spaceWitch.mixer.update (delta);
    cockroach.mixer.update (delta);
 
    // todo deltaSeconds
  
    zombieMouse.gltfScene.rotation.x += 0.2 * delta;
    zombieMouse.gltfScene.rotation.y += 0.1 * delta;
    zombieMouse.gltfScene.add( zombieMouse.sound);
    zombieMouse.gltfScene.add( zombieMouse.speech);
    

    spaceWitch.gltfScene.rotation.x +=-0.1 * delta;
    spaceWitch.gltfScene.rotation.y +=-0.04 * delta;

    cockroach.gltfScene.rotation.z += -0.01 * delta;
    cockroach.gltfScene.rotation.x += -0.04 * delta;


    centralCube.rotation.z += 0.1* delta;

    centralMouseCube.rotation.y += -0.05* delta;

    centralRoachCube.rotation.x += -0.03* delta;


    let raycasterArray = [cube1, cube2, cube3, projectionScreen.gltfScene]
    // array of intersects objects for performance, so we don't have to calculate intersects on all scene.children

    // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, currentCamera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( raycasterArray, true );


    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'screen'){
        console.log(projectionScreen.mesh.material);
        console.log(projectionScreen.videoMaterial);
        projectionScreen.video.play();
        projectionScreen.mesh.material = projectionScreen.videoMaterial;
        console.log(projectionScreen.mesh.material);

    }

    // if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'Plane'){
    //     alpha = 0;
    //     destination = projectionScreen.gltfScene.position;
    // }


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


        scene.add(videoSphere);   
        const video = document.getElementById('video-1');
        video.play();
        video.addEventListener('ended', function(){
            scene.remove(videoSphere);
    
        });

        // currentCamera = zombieMouseCamera;
        currentFocalPoint = zombieMouseFocalPoint;
        currentTarget = zombieMouseCamera;
        alpha = 0;
        alphaThreshold= 0.15


        //silent audio and captions play
        const audio = document.getElementById("audio-1");
        audio.play();    
    }

    if(intersects.length > 0 && intersects[0].object.name=='space-witch-bounding-box'){
        console.log('space-witch-hover');

        spaceWitch.hat.mesh.material=spaceWitch.hoverMaterial;

    }
    else{
        spaceWitch.hat.mesh.material = spaceWitch.hat.material;
    }


    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'space-witch-bounding-box'){
        
        console.log('space witch Intersection click', intersects[0].object.name)
        // currentCamera = spaceWitchCamera;
        currentFocalPoint = spaceWitchFocalPoint;

        currentTarget = spaceWitchCamera;
        alpha = 0;
        alphaThreshold= 0.15
    }


    
    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'cockroach-bounding-box'){
        
        console.log('cockroach witch Intersection click', intersects[0].object.name)

    
        // currentCamera = cockroachCamera;
        currentFocalPoint = cockroachFocalPoint;
        alpha = 0;
        alphaThreshold= 0.15
        currentTarget = cockroachCamera;
        // controls.enabled = false;


    }

    if (mouse.click && intersects.length == 0){
            
        destination = initialDestination;
        currentFocalPoint = null;

    }
    

    if (currentTarget && currentFocalPoint){

        currentTarget.updateMatrixWorld();

        let vector = new THREE.Vector3();
        currentTarget.getWorldPosition(vector);
        destination = vector;

        let vector1 = new THREE.Vector3();
        currentFocalPoint.getWorldPosition(vector1);
        focalPointDestination = vector1;

        let quaternion = new THREE.Quaternion();
        currentTarget.getWorldQuaternion( quaternion);
        quaternionDestination =  quaternion;
        
        changeTarget();
    }



    let vector1 = spaceWitchFocalPoint.geometry.vertices[0].clone();
    vector1.applyMatrix4(spaceWitchFocalPoint.matrixWorld); 
    spaceWitchCamera.lookAt(vector1);

    let vector2 = cockroachFocalPoint.geometry.vertices[0].clone();
    vector2.applyMatrix4(cockroachFocalPoint.matrixWorld); 
    cockroachCamera.lookAt(vector2);

    let vector3 = zombieMouseFocalPoint.geometry.vertices[0].clone();
    vector3.applyMatrix4(zombieMouseFocalPoint.matrixWorld); 
    zombieMouseCamera.lookAt(vector3);
 
    roachTextureAnimation.update(1000 * delta);
    roachAlphaAnimation.update(1000 * delta);



    controls.update();

    
    renderer.render(scene, currentCamera);

    mouse.click = false;

};

