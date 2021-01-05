import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';

import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

import {audioMuter} from './modules/audioMuter.js';

let scene, renderer, videoCube, videoSphere, controls, starFieldMaterial3, destination, testcube, cameraTestCube;

let centralCube, centralMouseCube, centralRoachCube, centralCauldronCube;

let cube1, cube2, cube3, sphere1, spaceWitchFocalPoint, cockroachFocalPoint, zombieMouseFocalPoint, cauldronFocalPoint, initialDestination, quaternionDestination, initialCameraCube, porjectionScreenFocalPoint;

let spaceWitchFocalPointClose, spaceWitchPointClose;

let camera, spaceWitchCamera, zombieMouseCamera, cockroachCamera, cauldronCamera, projectionScreenCamera;

let envMap;

let currentlyPlaying;


let ramp;
let rampVector; 

let listener;

let roachBabiesPoints;

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
    speech: [],
    body: null,
    array: null,
    helmet: {
        material: null,
        mesh: null,
    },
    meshes: [],
    clickAnimationOne: null,
    clickAnimationTwo: null,
    stateCounter: 0,
    sequence: [],

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
    speech: [],
    stateCounter: 0,
    sequence: [],
    video: [],
    videoMaterial: [],
}

let cauldron = {
    gltfScene: null,
    boundingSphere: null,
    mesh: null,
    animations: null,
    materialMap: null,
    hoverTexture: null,
    hoverMaterial: null,
    mixer: null,
    sound: null,
    speech: null,
    video: [],
    videoMaterial: [],
    normalsAnimation: null,
}

let spaceWitch= {
    gltfScene: null,
    boundingBox: null,
    focalPoint: null,
    mesh: null,
    animations: null,
    materialMap: null,
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
    cloak1: {
        material: null,
        mesh: null,
    },
    cloak2: {
        material: null,
        mesh: null,
    },
    top: {
        material: null,
        mesh: null,
    },
    legs1: {
        material: null,
        mesh: null,
    },
    legs2: {
        material: null,
        mesh: null,
    },
    legs3: {
        material: null,
        mesh: null,
    },

    rightArm: {
        material: null,
        mesh: null,
    },

    leftArm: {
        material: null,
        mesh: null,
    },
    speech: [],
    stateCounter: 0,
    sequence: [],
}

let mouse = {
    position: new THREE.Vector2(1,1),
    click: null,
    move: null,
    over: null,
    down: null,
    wheel: null,
    hoverTouch: null,
}

let projectionScreen = {
    gltfScene: null,
    boundingBox: null,
    mesh: null,
    originalMaterial: null,
    material: null,
    animations: null,
    materialMap: null,
    video: [],
    videoMaterial: [],
    mixer: null,
    sound: null,
    speech: null,
}

const raycaster = new THREE.Raycaster();

const clock = new THREE.Clock();
let delta = 0;




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

function makeVideos(){
    const video = document.createElement("video");
    video.id = 'video-1';
    video.className = 'invisible-video';
    document.body.appendChild(video);
    const source = document.createElement('source');
    source.setAttribute('src','texture/mouse-on-white-30fps.mp4');
    video.appendChild(source);   
    video.addEventListener('loadeddata', function(){
        console.log('video has loaded');
    });
    video.load();

    const normalsVideo = document.createElement("video");
    normalsVideo.id = 'normals-vid';
    normalsVideo.loop = true;
    normalsVideo.className = 'invisible-video';
    document.body.appendChild(normalsVideo);
    const normalsVideoSource = document.createElement('source');
    normalsVideoSource.setAttribute('src','texture/normal/normals-vid-intense-2.mp4');
    normalsVideo.appendChild(normalsVideoSource);   
    normalsVideo.addEventListener('loadeddata', function(){
        console.log('video has loaded');
    });
    normalsVideo.load();
    
    
    
    const cauldronDefaultVideo = document.createElement("video");
    cauldronDefaultVideo.id = 'cauldron-default-video';
    cauldronDefaultVideo.className = 'invisible-video';
    document.body.appendChild(cauldronDefaultVideo);
    const cauldronDefaultVideoSource = document.createElement('source');
    cauldronDefaultVideoSource.setAttribute('src','texture/mouse-on-white-30fps.mp4');
    cauldronDefaultVideo.appendChild(cauldronDefaultVideoSource);     
    cauldronDefaultVideo.load();


    const spaceWitchSummonsVideo = document.createElement("video");
    spaceWitchSummonsVideo.id = 'space-witch-summons-video';
    const spaceWitchSummonsVideoSource = document.createElement('source');
    spaceWitchSummonsVideoSource.setAttribute('src','texture/summons.mp4');
    spaceWitchSummonsVideo.appendChild(spaceWitchSummonsVideoSource);   
    
    const div =  document.createElement('div');
    div.id = 'space-witch-summons-video-div';
    div.className = 'invisible-video';
    div.appendChild(spaceWitchSummonsVideo);
   

    document.body.appendChild(div);

    
    spaceWitchSummonsVideo.load();

    for (let i=0; i<6; i++){
        const cockroachVidOne = document.createElement("video");
        cockroachVidOne.id = `cockroach-vid-${i}`;
        cockroachVidOne.className = 'invisible-video';
        document.body.appendChild(cockroachVidOne);
        const cockroachVidOneSource = document.createElement('source');
        cockroachVidOneSource.setAttribute('src',`texture/cockroach/${i}.mp4`);
        cockroachVidOne.appendChild(cockroachVidOneSource);     
        cockroachVidOne.load();

    }

    
    for (let i=0; i<6; i++){
        const cauldronVid = document.createElement("video");
        cauldronVid.id = `cauldron-vid-${i}`;
        cauldronVid.className = 'invisible-video';
        document.body.appendChild(cauldronVid);
        const cauldronVidSource = document.createElement('source');
        cauldronVidSource.setAttribute('src',`texture/cauldron/${i}.mp4`);
        cauldronVid.appendChild(cauldronVidSource);     
        cauldronVid.load();
    }

    for (let i=0; i<3; i++){
        const spacWitchVid = document.createElement("video");
        spacWitchVid.id = `space-witch-vid-${i}`;
        spacWitchVid.className = 'invisible-video';
        document.body.appendChild(spacWitchVid);
        const spacWitchVidSource = document.createElement('source');
        spacWitchVidSource.setAttribute('src',`texture/space-witch/${i}.mp4`);
        spacWitchVid.appendChild(spacWitchVidSource);     
        spacWitchVid.load();
    }

    for (let i=0; i<2; i++){
        const mouseVid = document.createElement("video");
        mouseVid.id = `mouse-vid-${i}`;
        mouseVid.className = 'invisible-video';
        document.body.appendChild(mouseVid);
        const mouseVidSource = document.createElement('source');
        mouseVidSource.setAttribute('src',`texture/mouse/${i}.mp4`);
        mouseVid.appendChild(mouseVidSource);     
        mouseVid.load();
    }

    
}

// function makeNormalsGif(){
//     const cauldronNormalsGif = new Image();
//     cauldronNormalsGif.src = 'texture/normal/bubbling-normals.gif';
//     cauldronNormalsGif.className = 'invisible-video';
//     cauldronNormalsGif.id = 'cauldron-normals-gif';
//     document.body.appendChild(cauldronNormalsGif);
// }

// makeNormalsGif()



makeVideos();

function makeLoadingScreen(){
    const div =  document.createElement('div');
    div.id = 'loading-screen';
    div.className = 'invisible';
    div.innerHTML += '<p>Loading</p>'   
    document.body.appendChild(div);
}
makeLoadingScreen();

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
let alphaThreshold= 0.5;
let postLerpAction; 
function changeTarget(){
    
    alpha = alpha + 0.01*delta;

    // if (alpha > 0.1){
    //     currentTarget=null;
    // }

    if (alpha > 0.03){
        if (postLerpAction){
            postLerpAction();
            postLerpAction = null;
        }
    }


    if(alpha > alphaThreshold){
        
        // currentCamera=zombieMouseCamera;
        alpha = 1;


        // currentTarget=null;

    }


    camera.position.lerp(destination.clone(), alpha);

    controls.target.lerp(focalPointDestination, alpha);

    camera.quaternion.slerp(quaternionDestination, alpha);

    // console.log(alpha)
    
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

    roachBabiesPoints = new THREE.Points(roachGeometry, material);
    // cockroach.gltfScene.add(roachBabies);   
    roachBabiesPoints.position.x = 1; 
    roachBabiesPoints.position.y = 4;
    roachBabiesPoints.position.z = -5; 

}


let starField1, starField2, starField3;

//Starfield
function starField(){
    const starDisk = new THREE.TextureLoader().load( 'texture/disc.png' );
    const starDiskAlpha = new THREE.TextureLoader().load( 'texture/disc-alpha.png' );


    const starGeometry = new THREE.Geometry();
    for (let i = 0; i < 2000; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-500;
        vertex.y = Math.random()*1000-500;
        vertex.z = Math.random()*1000-500;
        starGeometry.vertices.push(vertex);
    }
    starField1 = new THREE.Points(starGeometry, new THREE.PointsMaterial({
        // transparent: true,
        // alphaMap: starDiskAlpha,
        map: starDisk,
        size: 0.5,
        color: 0xffffff
        })
    ); 
    scene.add(starField1);
    starField1.position.z = 100;


    const starGeometry2 = new THREE.Geometry();
    for (let i = 0; i < 1500; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-800;
        vertex.y = Math.random()*1000-800;
        vertex.z = Math.random()*1000-800;
        starGeometry2.vertices.push(vertex);
    }
    starField2 = new THREE.Points(starGeometry2, new THREE.PointsMaterial({
        // transparent: true,
        // alphaMap: starDisk,
        map: starDisk,
        size: 0.7,
        color: 0xa8e6ff
        })
    ); 
    scene.add(starField2);
    starField2.position.z = 150;


    const starGeometry3 = new THREE.Geometry();
    for (let i = 0; i < 3000; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-500;
        vertex.y = Math.random()*1000-500;
        vertex.z = Math.random()*1000-200;
        starGeometry3.vertices.push(vertex);
    }
    starFieldMaterial3 = new THREE.PointsMaterial({
        // transparent: true,
        // alphaMap: starDisk,
        map: starDisk,
        size: 0.4,
        color: 0xffc47d
        })
    starField3 = new THREE.Points(starGeometry3, starFieldMaterial3);
    scene.add(starField3);
    starField3.position.z = 130;
}

//Bounding boxes

function cauldronBoundingSphere (){
    const geometry = new THREE.SphereGeometry(9.5, 12, 12);
    sphere1 = new THREE.Mesh(geometry);
    sphere1.position.y = 3;
    sphere1.position.x = -1.5;
    sphere1.position.z = -2;
    sphere1.visible=false;  

    sphere1.name = 'cauldron-bounding-sphere';
    scene.add(sphere1)
}


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

function makeCauldronElement(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    centralCauldronCube = new THREE.Mesh(geometry);
    centralCauldronCube.name = 'central cauldron cube';
    centralCauldronCube.visible = false;
    scene.add(centralCauldronCube);
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
    initialCameraCube.position.z= 30;
    initialCameraCube.position.x= 30;
    initialCameraCube.position.y= 30;

    initialCameraCube.name = 'initial camera cube'
    initialCameraCube.visible = false;
    scene.add(initialCameraCube);

}


function loadCauldronVideoTextures(){

    rampVector = new THREE.Vector2(1, 1);
    
    for (let i = 0; i < 6; i++) {
        cauldron.video[i] = document.getElementById(`cauldron-vid-${i}`);
        const videoTexture = new THREE.VideoTexture(cauldron.video[i]);
        videoTexture.flipY = false;
        videoTexture.format = THREE.RGBFormat;
        cauldron.videoMaterial[i] = new THREE.MeshStandardMaterial({ map: videoTexture });
        cauldron.videoMaterial[i].name = `cauldronVideoMaterial-${i}`;


        const normalsVid = document.getElementById('normals-vid');
        const normalsTexture = new THREE.VideoTexture(normalsVid);
        normalsVid.play();

        cauldron.videoMaterial[i].envMap = envMap;

        cauldron.videoMaterial[i].roughness = 1;
        cauldron.videoMaterial[i].metalness = 0.3;
        cauldron.videoMaterial[i].emissiveMap = videoTexture;
        cauldron.videoMaterial[i].emissive = new THREE.Color(0xfa9898);

    


        console.log(cauldron.mesh.material);
        console.log(cauldron.videoMaterial[i]);



        if (i != 4) {

            cauldron.videoMaterial[i].normalMap = normalsTexture;

            cauldron.video[i].addEventListener('ended', function () {
                console.log('cauldron video is done');
                cauldron.mesh.material = cauldron.videoMaterial[4];
                cauldron.video[4].play();
                cauldron.video[4].loop = true;
            });
        }
        else if (i == 4) {

            cauldron.mesh.material = cauldron.videoMaterial[4];
            cauldron.video[4].play();
            cauldron.video[4].loop = true;

        }

    }


}   


function makeTestCube(){
    const geometry = new THREE.BoxGeometry(10,10,10);
    testcube = new THREE.Mesh(geometry);
    console.log('test cube is made');

}

function loadZombieMouseVideoTextures(){
    for(let i=0; i<2; i++){
        zombieMouse.video[i] = document.getElementById(`mouse-vid-${i}`);
        const videoTexture = new THREE.VideoTexture( zombieMouse.video[i] );
        videoTexture.flipY = false;
        videoTexture.format = THREE.RGBFormat;
        zombieMouse.videoMaterial[i] = new THREE.MeshBasicMaterial({map: videoTexture});
        zombieMouse.videoMaterial[i].name = `zombieMouseMaterial-${i}`;

        console.log(zombieMouse.videoMaterial[i]);


        zombieMouse.video[i].addEventListener('ended', function(){
            console.log('zombieMouse video is done');
        })
    }
}   



function loadProjectionScreen (){
    const loader = new GLTFLoader();
    loader.load('models/projection-screen-v9.gltf', function (gltf) {
        projectionScreen.gltfScene = gltf.scene;

        gltf.scene.name = 'projection-screen';
        scene.add(gltf.scene);
        console.log(`projection screen is `)
        console.log(projectionScreen.gltfScene)

        projectionScreen.mesh = projectionScreen.gltfScene.children.filter(function(m){return m.name=="screen"})[0];    

        projectionScreen.material = projectionScreen.mesh.material;
        projectionScreen.originalMaterial = projectionScreen.mesh.material;
        projectionScreen.gltfScene.position.x = 5;
        projectionScreen.gltfScene.rotation.y = -2;

        const projectionScreenLight = new THREE.PointLight( 0x3461eb, 0.5, 100 );
        projectionScreenLight.position.set( 0.5, 3.5, 0);

        projectionScreen.gltfScene.add( projectionScreenLight );

        const geometry = new THREE.BoxGeometry(1,1,1);
        porjectionScreenFocalPoint = new THREE.Mesh(geometry)
        porjectionScreenFocalPoint.position.set( 4, 3, 0);
        porjectionScreenFocalPoint.visible = false;
        cockroach.gltfScene.add(porjectionScreenFocalPoint);

        cockroach.gltfScene.add(projectionScreenCamera);


        // projectionScreenCamera.parent = porjectionScreenFocalPoint;
        projectionScreenCamera.position.set( 3, 3, 5);
        


        // const box = new THREE.Mesh(geometry)
        // box.position.set( 3, 3, 0);
        // projectionScreen.gltfScene.add(box);

        


        cockroach.gltfScene.add(projectionScreen.gltfScene);



    
    }, undefined, function ( error ) {

        console.error( error );

    } );

}


function loadCauldron (){
    const loader = new GLTFLoader();
    loader.load('models/cauldron-animated-12.gltf', function (gltf) {
        cauldron.gltfScene = gltf.scene;
        gltf.scene.scale.set(2,2,2);
        gltf.scene.name = 'cauldron';
        scene.add(gltf.scene);
        console.log(gltf.animations);
        cauldron.animations = gltf.animations;
        console.log(cauldron.gltfScene);
        cauldron.mesh = cauldron.gltfScene.children.filter(function(m){return m.name=="video-soup"})[0];        
        cauldron.material = cauldron.mesh.material;
        cauldron.originalMaterial = cauldron.mesh.material;

        loadCauldronVideoTextures();
        cauldronBoundingSphere();
    

        let center = new THREE.Vector3(0,5,0);

        const geometry = new THREE.BoxGeometry(2,2,2);
        cauldronFocalPoint = new THREE.Mesh(geometry);
        cauldronFocalPoint.position.x = center.x;
        cauldronFocalPoint.position.y = center.y;
        cauldronFocalPoint.position.z = center.z;
        cauldronFocalPoint.visible = false;
        cauldron.gltfScene.add(cauldronFocalPoint);

        cauldron.gltfScene.add(cauldronCamera);
        cauldronCamera.position.x = 0;
        cauldronCamera.position.y = 8;
        cauldronCamera.position.z = 0;

        const cauldronLight1 = new THREE.PointLight( 0x3461eb, 0.001, 100 );
        cauldronLight1.position.set( 0, 2, 2.5);
        cauldron.gltfScene.add( cauldronLight1 );

        const cauldronLight2 = new THREE.PointLight( 0x3461eb, 0.001, 100 );
        cauldronLight2.position.set( -1, 3, -4);
        cauldron.gltfScene.add( cauldronLight2 );

        const cauldronLight3 = new THREE.PointLight( 0xffbb00, 0.5  , 100 );
        cauldronLight3.position.set( 1, 5, 0);
        cauldron.gltfScene.add( cauldronLight3);

        // const cauldronLight31 = new THREE.PointLight( 0xf7c640d, 2, 100 );
        // cauldronLight31.position.set( -1, 6, 0);
        // cauldron.gltfScene.add( cauldronLight31);

        const cauldronLight32 = new THREE.PointLight( 0x5500ff , 0.3, 100 );
        cauldronLight32.position.set( 0, 5, 1);
        cauldron.gltfScene.add( cauldronLight32);

        const cauldronLight4 = new THREE.PointLight( 0xfcc603, 0.001, 100 );
        cauldronLight4.position.set( 5, 4, 0);
        cauldron.gltfScene.add( cauldronLight4);

        const cauldronLight5 = new THREE.PointLight( 0xfcc603, 0.010, 100 );
        cauldronLight5.position.set( -5, 4, 0);
        cauldron.gltfScene.add( cauldronLight5);

        const windowOne = cauldron.gltfScene.children.filter(function(m){return m.name=="front-window"})[0];
        windowOne.animation = cauldron.animations.filter(function(m){return m.name=="Sphere.003Action"})[0];
        cauldron.mixer = new THREE.AnimationMixer(cauldron.gltfScene);
        const windowOneAction = cauldron.mixer.clipAction(windowOne.animation, windowOne);

        const windowTwo = cauldron.gltfScene.children.filter(function(m){return m.name=="back-window"})[0];
        windowTwo.animation = cauldron.animations.filter(function(m){return m.name=="Sphere.004Action"})[0];
        const windowTwoAction = cauldron.mixer.clipAction(windowTwo.animation, windowTwo);

        const handle = cauldron.gltfScene.children.filter(function(m){return m.name=="handle"})[0];
        handle.animation = cauldron.animations.filter(function(m){return m.name=="Torus.004Action"})[0];
        const handleAction = cauldron.mixer.clipAction(handle.animation, handle);

        const radar = cauldron.gltfScene.children.filter(function(m){return m.name=="Sphere016"})[0];
        radar.animation = cauldron.animations.filter(function(m){return m.name=="Sphere.016Action"})[0];
        const radarAction = cauldron.mixer.clipAction(radar.animation, radar);

        const flameOne = cauldron.gltfScene.children.filter(function(m){return m.name=="flame-1001"})[0];
        flameOne.animation = cauldron.animations.filter(function(m){return m.name=="Armature.001Action.005"})[0];
        const flameOneAction = cauldron.mixer.clipAction(flameOne.animation, flameOne);

        const flameTwo = cauldron.gltfScene.children.filter(function(m){return m.name=="flame-1-armature002"})[0].children[1];
        flameTwo.animation = cauldron.animations.filter(function(m){return m.name=="Armature.001Action.005"})[0];
        const flameTwoAction = cauldron.mixer.clipAction(flameTwo.animation, flameTwo);


        const flameThree = cauldron.gltfScene.children.filter(function(m){return m.name=="flame-1-armature004"})[0].children[1];
        flameThree.animation = cauldron.animations.filter(function(m){return m.name=="Armature.001Action.005"})[0];
        const flameThreeAction = cauldron.mixer.clipAction(flameThree.animation, flameThree);




        // const geometry = new THREE.BoxGeometry(1,1,1);
        // const box = new THREE.Mesh(geometry)
        // box.position.set( 0, 4.5, 0);

        // cauldron.gltfScene.add(box);
        makeCauldronElement();
        cauldron.gltfScene.parent = centralCauldronCube;


        windowOneAction.play();
        windowTwoAction.play(); 
        handleAction.play(); 
        radarAction.play();
        flameOneAction.play();
        flameTwoAction.play();
        flameThreeAction.play();
    
    }, undefined, function ( error ) {

        console.error( error );

    } );

}


function loadCockroach(){
    // Loading in zombie mouse model
    const loader = new GLTFLoader();

    loader.load('models/cockroach-combined-low-poly-small-texture-all-2.gltf', function (gltf) {
        cockroach.gltfScene = gltf.scene;
        // cockroach.gltfScene.position.x = 15;
        cockroach.gltfScene.position.y = 15;
        cockroach.gltfScene.position.z = 20;
        cockroach.gltfScene.rotation.y = 160;
        // cockroach.gltfScene.rotation.x = -20;
        // cockroach.gltfScene.rotation.z = 20;
        gltf.scene.scale.set(1.5, 1.5, 1.5);



        cockroach.gltfScene.name = 'Cockroach Scene';

        cockroach.animations = gltf.animations;

        scene.add(gltf.scene);
        console.log('cockroach');
        console.log(gltf);
        console.log(cockroach.gltfScene);

        cockroach.gltfScene.traverse(function(o){
            if(o.type == "Mesh" || o.type == "SkinnedMesh" ){
                o.material.envMap = envMap;
                cockroach.meshes.push({
                    mesh: o,
                    material: o.material,
                    materialMap: o.material.map,
                    opacity: o.material.opacity,
                    roughness: o.material.roughness,
                    metalness: o.material.metalness,

                })

            }

        });

        console.log(cockroach.meshes); 

        cockroachBoundingBox ();
        cockroach.gltfScene.add(cube3);
        loadProjectionScreen();
        
        roachBabies();

        const cockroachLight = new THREE.PointLight( 0xff0000, 0.1, 100 );
        cockroachLight.position.set( 2, 2, 2 );
        cockroach.gltfScene.add( cockroachLight );

        // cockroach.gltfScene.add( zombieMouse.sound);

        // cockroach.gltfScene.add.apply(this, cockroach.speech);
        for (let i = 0; i < cockroach.speech.length; i++){
            cockroach.gltfScene.add(cockroach.speech[i]);
        }

        for (let i = 0; i < zombieMouse.speech.length; i++){
            zombieMouse.gltfScene.add(zombieMouse.speech[i]);
        }

        for (let i = 0; i < spaceWitch.speech.length; i++){
            spaceWitch.gltfScene.add(spaceWitch.speech[i]);
        }



        cockroach.gltfScene.add(cockroachCamera);
        cockroachCamera.position.x = 0;
        cockroachCamera.position.y = 4;
        cockroachCamera.position.z = 9;

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


        cockroach.clickAnimationOne =  tapeRecorderAction;
        cockroach.clickAnimationTwo = r2LegAction;
        cockroach.clickAnimationOne.setLoop( THREE.LoopOnce );
        cockroach.clickAnimationTwo.setLoop( THREE.LoopOnce );



        r3LegAction.play();
        l3LegAction.play();
        l1LegAction.play();
        lAntennaAction.play();
        rAntennaAction.play();
        r1LegAction.play();
        l2LegAction.play();


        makeCentralRoachElement()
        cockroach.gltfScene.parent = centralRoachCube;


   
        // spaceWitch.rightArm.mesh = spaceWitch.gltfScene.getObjectByName("right-arm-mesh001",true);
        // spaceWitch.rightArm.materialMap = spaceWitch.rightArm.mesh.material.map;


    //    spaceWitch.hat.mesh = spaceWitch.gltfScene.getObjectByName("hat-2001_0",true);
    //    spaceWitch.hat.material = spaceWitch.hat.mesh.material;


    }, undefined, function ( error ) {

        console.error( error );

    } );
}


function loadSpaceWitch(){
     // Loading in zombie mouse model
     const loader = new GLTFLoader();
     loader.load('models/space-witch-revamped-witchy-5.gltf', function (gltf) {
        spaceWitch.gltfScene = gltf.scene;
        spaceWitch.gltfScene.position.x = 30;
        spaceWitch.gltfScene.position.y = 1;
        // spaceWitch.gltfScene.position.z = 10;
        gltf.scene.scale.set(2, 2, 2);

        spaceWitch.gltfScene.name = 'Space Witch Scene';
 
        spaceWitch.animations = gltf.animations;
 
        scene.add(gltf.scene);
        
        makeSpaceWitchBoundingBox();
        spaceWitch.gltfScene.add(cube2);
        spaceWitch.gltfScene.add(spaceWitchCamera);
        spaceWitchCamera.position.x = -8;
        spaceWitchCamera.position.y = 5;
        spaceWitchCamera.position.z = 0;

        let center = new THREE.Vector3(0,5,0);

        // center.x += 10;

        const witchLight = new THREE.PointLight( 0xff0554, 0.1, 10);
        witchLight.position.set(-3,5,0)
        spaceWitch.gltfScene.add(witchLight);

        const geometry = new THREE.BoxGeometry(2,2,2);
        spaceWitchFocalPoint = new THREE.Mesh(geometry);
        spaceWitchFocalPoint.position.x = center.x;
        spaceWitchFocalPoint.position.y = center.y;
        spaceWitchFocalPoint.position.z = center.z;
        spaceWitch.gltfScene.add(spaceWitchFocalPoint );
        spaceWitchFocalPoint.visible = false;

        spaceWitchFocalPointClose =  new THREE.Mesh(geometry);
        spaceWitchFocalPointClose.position.set(0,7,0);
        spaceWitchFocalPointClose.visible = false;
        spaceWitch.gltfScene.add(spaceWitchFocalPointClose);

        spaceWitchPointClose = new THREE.Mesh(geometry)
        spaceWitchPointClose.position.set(-2,7,0);
        spaceWitchPointClose.visible = false;
        spaceWitch.gltfScene.add(spaceWitchPointClose);
        spaceWitchPointClose.lookAt(spaceWitchFocalPointClose);



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
        spaceWitch.hat.materialMap = spaceWitch.hat.mesh.material.map;
        

        console.log('space Witch scene is');
        console.log(spaceWitch.gltfScene);
        spaceWitch.legs1.mesh = spaceWitch.gltfScene.getObjectByName("Cylinder001_0",true);
        spaceWitch.legs1.materialMap = spaceWitch.legs1.mesh.material.map;
        

        spaceWitch.legs2.mesh = spaceWitch.gltfScene.getObjectByName("Cylinder.001_1_1",true);
        spaceWitch.legs2.materialMap = spaceWitch.legs2.mesh.material.map;

        spaceWitch.legs3.mesh = spaceWitch.gltfScene.getObjectByName("Cylinder.001_2_2",true);
        spaceWitch.legs3.materialMap = spaceWitch.legs3.mesh.material.map;

        spaceWitch.cloak1.mesh = spaceWitch.gltfScene.getObjectByName("back-cloak",true);
        spaceWitch.cloak1.materialMap = spaceWitch.cloak1.mesh.material.map;

        spaceWitch.top.mesh = spaceWitch.gltfScene.getObjectByName("top",true);
        spaceWitch.top.materialMap = spaceWitch.top.mesh.material.map;

        spaceWitch.leftArm.mesh = spaceWitch.gltfScene.getObjectByName("left-arm",true);
        spaceWitch.leftArm.materialMap = spaceWitch.leftArm.mesh.material.map;

        spaceWitch.rightArm.mesh = spaceWitch.gltfScene.getObjectByName("right-arm-mesh001",true);
        spaceWitch.rightArm.materialMap = spaceWitch.rightArm.mesh.material.map;




 
     }, undefined, function ( error ) {
 
         console.error( error );
 
     } );
}


function loadZombieMouse(){
    // Loading in zombie mouse model
    const loader = new GLTFLoader();
    loader.load('models/full-mouse-2-animation.gltf', function (gltf) {
        zombieMouse.gltfScene = gltf.scene;
        zombieMouse.gltfScene.position.x = -25;
        zombieMouse.gltfScene.position.y = 1;
        gltf.scene.scale.set(1.1,1.1,1.1);

        // zombieMouse.gltfScene.position.z = -3;

        zombieMouse.animations = gltf.animations;

        scene.add(gltf.scene);
        // console.log(zombieMouse.gltfScene.children[0]);
        // console.log(zombieMouse.animations);

        //Extracting material: make this more elegant: breadth first search
        zombieMouse.mesh = zombieMouse.gltfScene.children[0].children.filter(function(m){return m.name=='prelim-mouse-blender-3'});
        zombieMouse.materialMap = zombieMouse.mesh[0].material.map;

        makeZombiMouseBoundingBox ();
        loadZombieMouseVideoTextures();
        zombieMouse.gltfScene.add(cube1);

        zombieMouse.gltfScene.add(zombieMouseCamera);
        zombieMouseCamera.position.x = 12;
        zombieMouseCamera.position.y = 5;
        zombieMouseCamera.position.z = 5;

        zombieMouse.gltfScene.add( zombieMouse.sound);
        // zombieMouse.gltfScene.add( zombieMouse.speech);

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

function setSpaceWitchHoverTexture(){
    spaceWitch.hat.mesh.material.map=spaceWitch.hoverTexture;
    spaceWitch.hat.mesh.material.transparent=true;
    spaceWitch.hat.mesh.material.opacity = 0.7;
    spaceWitch.hat.mesh.material.emissiveIntensity = 0.02;
    spaceWitch.hat.mesh.material.emissive.set(0x0d10ba);
    
    // spaceWitch.hat.mesh.material.roughness = 0.3;
    // spaceWitch.hat.mesh.material.metalness = 0.5;


    spaceWitch.legs1.mesh.material.map=spaceWitch.hoverTexture;
    spaceWitch.legs1.mesh.material.transparent=true;
    spaceWitch.legs1.mesh.material.opacity = 0.7;
    spaceWitch.legs1.mesh.material.emissiveIntensity = 0.02;
    spaceWitch.legs1.mesh.material.emissive.set(0x5639fa);

    spaceWitch.legs2.mesh.material.map=spaceWitch.hoverTexture;
    spaceWitch.legs2.mesh.material.transparent=true;
    spaceWitch.legs2.mesh.material.opacity = 0.7;
    spaceWitch.legs2.mesh.material.emissiveIntensity = 0.02;
    spaceWitch.legs2.mesh.material.emissive.set(0x5639fa);

    spaceWitch.legs3.mesh.material.map=spaceWitch.hoverTexture;
    spaceWitch.legs3.mesh.material.transparent=true;
    spaceWitch.legs3.mesh.material.opacity = 0.7;
    spaceWitch.legs3.mesh.material.emissiveIntensity = 0.02;
    spaceWitch.legs3.mesh.material.emissive.set(0x5639fa);

    spaceWitch.top.mesh.material.map=spaceWitch.hoverTexture;
    spaceWitch.top.mesh.material.transparent=true;
    spaceWitch.top.mesh.material.opacity = 0.7;
    spaceWitch.top.mesh.material.emissiveIntensity = 0.1;
    spaceWitch.top.mesh.material.emissive.set(0x0d10ba);

    spaceWitch.rightArm.mesh.material.map=spaceWitch.hoverTexture;
    spaceWitch.rightArm.mesh.material.transparent=true;
    spaceWitch.rightArm.mesh.material.opacity = 0.7;
    spaceWitch.rightArm.mesh.material.emissiveIntensity = 0.02;
    spaceWitch.rightArm.mesh.material.emissive.set(0x0d10ba);

    spaceWitch.leftArm.mesh.material.map=spaceWitch.hoverTexture;
    spaceWitch.leftArm.mesh.material.transparent=true;
    spaceWitch.leftArm.mesh.material.opacity = 0.7;
    spaceWitch.leftArm.mesh.material.emissiveIntensity = 0.02;
    spaceWitch.leftArm.mesh.material.emissive.set(0x0d10ba);

    spaceWitch.cloak1.mesh.material.map=spaceWitch.hoverTexture;
    spaceWitch.cloak1.mesh.material.transparent=true;
    spaceWitch.cloak1.mesh.material.opacity = 0.7;
    spaceWitch.cloak1.mesh.material.emissiveIntensity = 0.03;
    spaceWitch.cloak1.mesh.material.emissive.set(0x6b25f7);
}

function unsetSpaceWitchHoverTexture(){
    spaceWitch.hat.mesh.material.map = spaceWitch.hat.materialMap;
    spaceWitch.hat.mesh.material.transparent=false;
    spaceWitch.hat.mesh.material.opacity = 1;
    spaceWitch.hat.mesh.material.emissiveIntensity = 1;
    spaceWitch.hat.mesh.material.emissive.set(0x000000);

    // spaceWitch.hat.mesh.material.roughness = 1;
    // spaceWitch.hat.mesh.material.metalness = 0;

    spaceWitch.legs1.mesh.material.map=spaceWitch.legs1.materialMap;
    spaceWitch.legs1.mesh.material.transparent=false;
    spaceWitch.legs1.mesh.material.opacity = 1;
    spaceWitch.legs1.mesh.material.emissiveIntensity = 1;
    spaceWitch.legs1.mesh.material.emissive.set(0x000000);

    spaceWitch.legs2.mesh.material.map=spaceWitch.legs2.materialMap;
    spaceWitch.legs2.mesh.material.transparent=false;
    spaceWitch.legs2.mesh.material.opacity = 1;
    spaceWitch.legs2.mesh.material.emissiveIntensity = 1;
    spaceWitch.legs2.mesh.material.emissive.set(0x000000);

    spaceWitch.legs3.mesh.material.map=spaceWitch.legs3.materialMap;
    spaceWitch.legs3.mesh.material.transparent=false;
    spaceWitch.legs3.mesh.material.opacity = 1;
    spaceWitch.legs3.mesh.material.emissiveIntensity = 1;
    spaceWitch.legs3.mesh.material.emissive.set(0x000000);

    spaceWitch.top.mesh.material.map=spaceWitch.top.materialMap;
    spaceWitch.top.mesh.material.transparent=false;
    spaceWitch.top.mesh.material.opacity = 1;
    spaceWitch.top.mesh.material.emissiveIntensity = 1;
    spaceWitch.top.mesh.material.emissive.set(0x000000);

    spaceWitch.rightArm.mesh.material.map=spaceWitch.top.materialMap;
    spaceWitch.rightArm.mesh.material.transparent=false;
    spaceWitch.rightArm.mesh.material.opacity = 1;
    spaceWitch.rightArm.mesh.material.emissiveIntensity = 1;
    spaceWitch.rightArm.mesh.material.emissive.set(0x000000);

    spaceWitch.leftArm.mesh.material.map=spaceWitch.top.materialMap;
    spaceWitch.leftArm.mesh.material.transparent=false;
    spaceWitch.leftArm.mesh.material.opacity = 1;
    spaceWitch.leftArm.mesh.material.emissiveIntensity = 1;
    spaceWitch.leftArm.mesh.material.emissive.set(0x000000);

    spaceWitch.cloak1.mesh.material.map=spaceWitch.cloak1.materialMap;
    spaceWitch.cloak1.mesh.material.transparent=false;
    spaceWitch.cloak1.mesh.material.opacity = 1;
    spaceWitch.cloak1.mesh.material.emissiveIntensity = 1;
    spaceWitch.cloak1.mesh.material.emissive.set(0x000000);

}

function zombieMouseSequenceOne(){
    currentlyPlaying = true;
    zombieMouse.sound.stop();

    zombieMouse.gltfScene.add(videoSphere);  
    videoSphere.rotation.y = 1*Math.PI; 
    // videoSphere.rotation.z = 0.2*Math.PI; 


    const video = document.getElementById('video-1');
    video.play();


    zombieMouse.speech[0].play();
    startCaptions('zombie-mouse',1);
    
    zombieMouse.speech[0].source.onended = (event) => {
        zombieMouse.gltfScene.remove(videoSphere);
        zombieMouse.sound.play();
        currentlyPlaying = false;
        console.log('zombieMouse audio ended');
    }
    console.log(`zombiemouse state counter is ${zombieMouse.stateCounter}`);
    zombieMouse.stateCounter = zombieMouse.stateCounter + 1;
}


function zombieMouseSequenceTwo(){
    currentlyPlaying = true;
    zombieMouse.sound.stop();

    zombieMouse.speech[1].play();
    startCaptions('zombie-mouse',2);
    
    zombieMouse.speech[1].source.onended = (event) => {
        zombieMouse.sound.play();
        currentlyPlaying = false;
        console.log('zombieMouse audio ended');
    }
    console.log(`zombiemouse state counter is ${zombieMouse.stateCounter}`);
    zombieMouse.stateCounter = zombieMouse.stateCounter + 1;
}

function zombieMouseSequenceThree(){
    
    currentlyPlaying = true;
    zombieMouse.sound.stop();

    zombieMouse.speech[2].play();
    startCaptions('zombie-mouse',3);
    
    zombieMouse.speech[2].source.onended = (event) => {
        currentFocalPoint = spaceWitchFocalPoint;
        currentTarget = spaceWitchCamera;        
        console.log('zombieMouse audio ended');
        spaceWitch.speech[12].play();
        startCaptions('space-witch', 13);
        spaceWitch.speech[12].source.onended = (event) => {
            console.log('space witch audio ended');
            currentlyPlaying = false;
            currentFocalPoint = zombieMouseFocalPoint;
            currentTarget = zombieMouseCamera; 
            zombieMouse.sound.play();

        }
    console.log(`zombiemouse state counter is ${zombieMouse.stateCounter}`);
    zombieMouse.stateCounter = zombieMouse.stateCounter + 1;

    }

}


function initializeZombieMouseSequences(){
    zombieMouse.sequence[0] = zombieMouseSequenceOne;
    zombieMouse.sequence[1] = zombieMouseSequenceTwo;
    zombieMouse.sequence[2] = zombieMouseSequenceThree; 
}


function spaceWitchSequenceOne(){
    currentlyPlaying = true;
    // spaceWitch.sound.stop();

    spaceWitch.speech[0].play();
    startCaptions('space-witch', 1);
    
    spaceWitch.speech[0].source.onended = (event) => {
        console.log('space witch audio ended');
        const video = document.getElementById('space-witch-summons-video');
        const div = document.getElementById('space-witch-summons-video-div');
        div.classList.add('dream-video-div');
        div.classList.remove('invisible-video');
        
        video.play();
        video.onended = (event) => {
            div.classList.add('invisible-video');
            div.classList.remove('dream-video-div');

            console.log('video ended');
            spaceWitch.speech[1].play();
            startCaptions('space-witch', 2);

            spaceWitch.speech[1].source.onended= (event) => {
                console.log('space witch audio ended');
                // spaceWitch.sound.play();
                currentlyPlaying = false;
            }

        }

    }
    console.log(`space witch state counter is ${spaceWitch.stateCounter}`);
    spaceWitch.stateCounter = spaceWitch.stateCounter + 1;

}

function spaceWitchSequenceTwo(){
    currentlyPlaying = true;
    // spaceWitch.sound.stop();

    spaceWitch.speech[2].play();
    startCaptions('space-witch', 3);

    setTimeout(function (){ 
        // cauldron.mesh.material =spaceWitch.hoverMaterial;
        currentTarget=cauldronCamera;
        currentFocalPoint=cauldronFocalPoint;

        const normalsTexture = new THREE.TextureLoader().load('texture/normal/bubbling-normals-sheet.jpg');
        cauldron.normalsAnimation = new TextureAnimator( normalsTexture, 24, 3, 72, 110 ); // texture, #horiz, #vert, #total, duration.
        const material = new THREE.MeshStandardMaterial({map: normalsTexture});
        cauldron.mesh.material = material;
        cauldron.mesh.material.envMap = envMap;
        cauldron.mesh.material.roughness = 0;
        cauldron.mesh.material.metalness = 0.2;

        setTimeout(function (){
           
            console.log(cauldron.video[5].name);
            cauldron.mesh.material = cauldron.videoMaterial[5];    
            cauldron.video[5].play();
            cauldron.mesh.material.roughness = 1;
            ramp = true;
 
    


            setTimeout(function (){
                alpha = 0;
                currentTarget=spaceWitchCamera;
                currentFocalPoint=spaceWitchFocalPoint; 


                setTimeout(function (){
                    currentTarget=spaceWitchPointClose;
                    currentFocalPoint=spaceWitchFocalPointClose; 
                },4000)
            },15*1000)

        },3*1000)
    },1*1000),

    
    spaceWitch.speech[2].source.onended = (event) => {
        console.log('space witch audio ended');
        currentlyPlaying = false;  
        currentTarget=spaceWitchCamera;
        currentFocalPoint=spaceWitchFocalPoint;       
    }

    console.log(`space witch state counter is ${spaceWitch.stateCounter}`);
    spaceWitch.stateCounter = spaceWitch.stateCounter + 1;

}

function spaceWitchSequenceThree(){
    currentlyPlaying = true;
    // spaceWitch.sound.stop();

    spaceWitch.speech[3].play();
    startCaptions('space-witch', 4);

    // setTimeout(function (){
    //     currentTarget=cauldronCamera;
    //     currentFocalPoint=cauldronFocalPoint;
    //     console.log(cauldron.video[5].name);
    //     cauldron.mesh.material = cauldron.videoMaterial[5];
    //     cauldron.video[5].play();

    //     setTimeout(function (){
    //         alpha = 0;
    //         currentTarget=spaceWitchCamera;
    //         currentFocalPoint=spaceWitchFocalPoint; 


    //         setTimeout(function (){
    //             currentTarget=spaceWitchPointClose;
    //             currentFocalPoint=spaceWitchFocalPointClose; 
    //         },10*1000)
    //     },10*1000)

    // },1*1000),
    
    spaceWitch.speech[3].source.onended = (event) => {
        console.log('space witch audio ended');
        currentlyPlaying = false;  
        currentTarget=spaceWitchCamera;
        currentFocalPoint=spaceWitchFocalPoint;       
    }

    console.log(`space witch state counter is ${spaceWitch.stateCounter}`);
    spaceWitch.stateCounter = spaceWitch.stateCounter + 1;

}


function initializespaceWitchSequences(){
    spaceWitch.sequence[0] = spaceWitchSequenceOne;
    spaceWitch.sequence[1] = spaceWitchSequenceTwo;
    spaceWitch.sequence[2] = spaceWitchSequenceThree;

}

function cockroachSequenceOne(){
    currentlyPlaying = true;
    cockroach.speech[cockroach.stateCounter].play();
  
    console.log(projectionScreen.mesh.material);
    console.log(projectionScreen.videoMaterial[0]);
    projectionScreen.video[0].play();
    projectionScreen.mesh.material = projectionScreen.videoMaterial[0];
    console.log(projectionScreen.mesh.material);

    cockroach.sound.stop();
    cockroach.clickAnimationOne.stop();
    cockroach.clickAnimationTwo.stop();
    cockroach.clickAnimationOne.play();
    cockroach.clickAnimationTwo.play();
    setTimeout(function (){


        // controls.enabled = false;
        currentCamera = projectionScreenCamera;

        // projectionScreenCamera.up()
    
        
    }, cockroach.clickAnimationTwo.getClip().duration*1000-4000)

    startCaptions('cockroach', cockroach.stateCounter+1);

    const audioObject = document.getElementById( `cockroach-${cockroach.stateCounter+1}`);
    console.log(audioObject.duration);
    console.log(cockroach.clickAnimationTwo.getClip().duration);

    setTimeout(function (){
        cockroach.clickAnimationOne.stop();
        cockroach.clickAnimationTwo.stop();
        cockroach.clickAnimationOne.play();
        cockroach.clickAnimationTwo.play();
     

        console.log('timer')

        setTimeout(function (){
            currentCamera = camera;
            currentFocalPoint = cockroachFocalPoint;
            currentTarget = cockroachCamera; 

        }, 5000)

    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        currentlyPlaying = false;
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}
function cockroachSequenceTwo(){
    currentlyPlaying = true;
    cockroach.speech[cockroach.stateCounter].play();
  
    console.log(projectionScreen.mesh.material);
    console.log(projectionScreen.videoMaterial[1]);
    projectionScreen.video[1].play();
    projectionScreen.mesh.material = projectionScreen.videoMaterial[1];
    console.log(projectionScreen.mesh.material);

    cockroach.sound.stop();
    cockroach.clickAnimationOne.stop();
    cockroach.clickAnimationTwo.stop();
    cockroach.clickAnimationOne.play();
    cockroach.clickAnimationTwo.play();
    setTimeout(function (){


        // controls.enabled = false;
        currentCamera = projectionScreenCamera;

        // projectionScreenCamera.up()
    
        
    }, cockroach.clickAnimationTwo.getClip().duration*1000-4000)

    startCaptions('cockroach', cockroach.stateCounter+1);

    const audioObject = document.getElementById( `cockroach-${cockroach.stateCounter+1}`);
    console.log(audioObject.duration);
    console.log(cockroach.clickAnimationTwo.getClip().duration);

    setTimeout(function (){
        cockroach.clickAnimationOne.stop();
        cockroach.clickAnimationTwo.stop();
        cockroach.clickAnimationOne.play();
        cockroach.clickAnimationTwo.play();
     

        console.log('timer')

        setTimeout(function (){
            currentCamera = camera;
            currentFocalPoint = cockroachFocalPoint;
            currentTarget = cockroachCamera; 

        }, 5000)

    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        currentlyPlaying = false;
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}

function cockroachSequenceThree(){
    currentlyPlaying = true;
    cockroach.speech[cockroach.stateCounter].play();
  
    console.log(projectionScreen.mesh.material);
    console.log(projectionScreen.videoMaterial[2]);
    projectionScreen.video[2].play();
    projectionScreen.mesh.material = projectionScreen.videoMaterial[2];
    console.log(projectionScreen.mesh.material);

    cockroach.sound.stop();
    cockroach.clickAnimationOne.stop();
    cockroach.clickAnimationTwo.stop();
    cockroach.clickAnimationOne.play();
    cockroach.clickAnimationTwo.play();
    setTimeout(function (){


        // controls.enabled = false;
        currentCamera = projectionScreenCamera;

        // projectionScreenCamera.up()
    
        
    }, cockroach.clickAnimationTwo.getClip().duration*1000-4000)

    startCaptions('cockroach', cockroach.stateCounter+1);

    const audioObject = document.getElementById( `cockroach-${cockroach.stateCounter+1}`);
    console.log(audioObject.duration);
    console.log(cockroach.clickAnimationTwo.getClip().duration);

    setTimeout(function (){
        cockroach.clickAnimationOne.stop();
        cockroach.clickAnimationTwo.stop();
        cockroach.clickAnimationOne.play();
        cockroach.clickAnimationTwo.play();
     

        console.log('timer')

        setTimeout(function (){
            currentCamera = camera;
            currentFocalPoint = cockroachFocalPoint;
            currentTarget = cockroachCamera; 

        }, 5000)

    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        currentlyPlaying = false;
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}

function cockroachSequenceFour(){
    currentlyPlaying = true;
    cockroach.speech[cockroach.stateCounter].play();
  
    console.log(projectionScreen.mesh.material);
    console.log(projectionScreen.videoMaterial[3]);
    projectionScreen.video[3].play();
    projectionScreen.mesh.material = projectionScreen.videoMaterial[3];
    console.log(projectionScreen.mesh.material);

    cockroach.sound.stop();
    cockroach.clickAnimationOne.stop();
    cockroach.clickAnimationTwo.stop();
    cockroach.clickAnimationOne.play();
    cockroach.clickAnimationTwo.play();
    setTimeout(function (){


        // controls.enabled = false;
        currentCamera = projectionScreenCamera;

        // projectionScreenCamera.up()
    
        
    }, cockroach.clickAnimationTwo.getClip().duration*1000-4000)

    startCaptions('cockroach', cockroach.stateCounter+1);

    const audioObject = document.getElementById( `cockroach-${cockroach.stateCounter+1}`);
    console.log(audioObject.duration);
    console.log(cockroach.clickAnimationTwo.getClip().duration);

    setTimeout(function(){
        currentCamera = camera;
        currentFocalPoint = spaceWitchFocalPointClose;
        currentTarget = spaceWitchPointClose;        
        
        setTimeout(function (){
            currentFocalPoint = cockroachFocalPoint;
            currentTarget = cockroachCamera; 

        }, 3000)
    }, 34*1000)

    setTimeout(function (){
        cockroach.clickAnimationOne.stop();
        cockroach.clickAnimationTwo.stop();
        cockroach.clickAnimationOne.play();
        cockroach.clickAnimationTwo.play();
        console.log('timer')
    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)  

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        currentlyPlaying = false;
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;
}

function cockroachSequenceFive(){

    currentlyPlaying = true;
    cockroach.speech[cockroach.stateCounter].play();
  
    console.log(projectionScreen.mesh.material);
    console.log(projectionScreen.videoMaterial[4]);
    projectionScreen.video[4].play();
    projectionScreen.mesh.material = projectionScreen.videoMaterial[4];
    console.log(projectionScreen.mesh.material);

    cockroach.sound.stop();
    cockroach.clickAnimationOne.stop();
    cockroach.clickAnimationTwo.stop();
    cockroach.clickAnimationOne.play();
    cockroach.clickAnimationTwo.play();
    setTimeout(function (){


        // controls.enabled = false;
        currentCamera = projectionScreenCamera;

        // projectionScreenCamera.up()
    
        
    }, cockroach.clickAnimationTwo.getClip().duration*1000-4000)

    startCaptions('cockroach', cockroach.stateCounter+1);

    const audioObject = document.getElementById( `cockroach-${cockroach.stateCounter+1}`);
    console.log(audioObject.duration);
    console.log(cockroach.clickAnimationTwo.getClip().duration);

    setTimeout(function (){
        cockroach.clickAnimationOne.stop();
        cockroach.clickAnimationTwo.stop();
        cockroach.clickAnimationOne.play();
        cockroach.clickAnimationTwo.play();
     

        console.log('timer')

        setTimeout(function (){
            currentCamera = camera;
            currentFocalPoint = cockroachFocalPoint;
            currentTarget = cockroachCamera; 

        }, 5000)

    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        currentlyPlaying = false;
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}

function cockroachSequenceSix(){
    currentlyPlaying = true;
    cockroach.speech[cockroach.stateCounter].play();
  
   
    cockroach.sound.stop();
    cockroach.clickAnimationOne.stop();
    cockroach.clickAnimationTwo.stop();
    cockroach.clickAnimationOne.play();
    cockroach.clickAnimationTwo.play();

    setTimeout(function (){
        // controls.enabled = false;
        currentCamera = projectionScreenCamera;

        // projectionScreenCamera.up()
        
    }, cockroach.clickAnimationTwo.getClip().duration*1000-4000)

    setTimeout(function (){

        cockroach.gltfScene.add(roachBabiesPoints);

        
    }, 12*1000)

    startCaptions('cockroach', cockroach.stateCounter+1);

    const audioObject = document.getElementById( `cockroach-${cockroach.stateCounter+1}`);
    console.log(audioObject.duration);
    console.log(cockroach.clickAnimationTwo.getClip().duration);

    setTimeout(function (){
        cockroach.clickAnimationOne.stop();
        cockroach.clickAnimationTwo.stop();
        cockroach.clickAnimationOne.play();
        cockroach.clickAnimationTwo.play();
     

        console.log('timer')
        setTimeout(function (){
            currentCamera = camera;
            currentFocalPoint = cockroachFocalPoint;
            currentTarget = cockroachCamera; 

        }, 5000)


    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        currentlyPlaying = false;
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}


function initializeCockroachSequences(){
    cockroach.sequence[0] = cockroachSequenceOne;
    cockroach.sequence[1] = cockroachSequenceTwo;
    cockroach.sequence[2] = cockroachSequenceThree;
    cockroach.sequence[3] = cockroachSequenceFour;
    cockroach.sequence[4] = cockroachSequenceFive;
    cockroach.sequence[5] = cockroachSequenceSix;


}

function runProgram (event) {
    init();
    animate();
}

//get captions working with audio player
function startCaptions(directory, audioNumber){
    const audio = document.getElementById(`${directory}-${audioNumber}`);
    audio.play(); 

    const div = document.getElementById('caption-display');
    div.classList.remove ('invisible');
    audio.onended = function(){
        div.className = 'invisible';
    }
}


//plays at same time as on click audio to facilitate captions (AudioListerner does not have captions support)
function audioControls (directory, audioNumber){
    const audioControls = document.createElement("audio");
    // audioControls.setAttribute('controls', true);
    audioControls.id = `${directory}-${audioNumber}`;
    document.body.appendChild(audioControls);
    audioControls.muted = true;

    const source = document.createElement('source');
    source.setAttribute('src', `Audio/${directory}/${audioNumber}.mp3`)
    source.setAttribute('type', 'audio/mpeg');
    audioControls.appendChild(source);

    const source2 = document.createElement('source');
    source2.setAttribute('src', `Audio/${directory}/${audioNumber}.ogg`)
    source2.setAttribute('type', 'audio/ogg');
    audioControls.appendChild(source2);

    const track = document.createElement("track");
    track.setAttribute('kind', 'captions');
    track.setAttribute('src', `captions/${directory}/${audioNumber}.vtt`);
    track.setAttribute('label', 'English');
    track.setAttribute('default', 'true');
    audioControls.appendChild(track);

    audioControls.textTracks[0].addEventListener('cuechange', function(){
        console.log(directory);
        console.log(audioNumber);
        if (this.activeCues.length>0){
            document.getElementById('caption-span').innerText = this.activeCues[0].text;
            console.log(this.activeCues[0].text);
        }
        else {
            document.getElementById('caption-span').innerText = ' ';
            console.log('silence');
        }

    },false)

}



function init(){
   
    const div = document.getElementById('loading-screen');
    div.classList.add('loading');
    div.classList.remove('invisible');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000);
    scene.add(camera);
    camera.name = 'global-camera';
    spaceWitchCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    spaceWitchCamera.name = 'space-witch-camera';
    cockroachCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cockroachCamera.name = 'cockroach-camera';
    zombieMouseCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    zombieMouseCamera.name = 'zombie-mouse-camera';
    cauldronCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cauldronCamera.name = 'cauldron-camera';
    projectionScreenCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    projectionScreenCamera.name = 'projection-screen-camera';

    currentCamera = camera;

    renderer = new THREE.WebGLRenderer({antialias: true});
    // renderer.setClearColor('red');
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    const captionDisplay = document.createElement('div');
    const captionSpan = document.createElement('span');
    captionDisplay.id = 'caption-display';
    captionDisplay.className = 'invisible';
    captionSpan.id = 'caption-span';
    captionDisplay.appendChild(captionSpan);
    document.body.appendChild(captionDisplay);

    // create an AudioListener and add it to the camera
    listener = new THREE.AudioListener();
    
    camera.add( listener );


    // create a global audio source
    const sound = new THREE.Audio( listener );
    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    //remember to credit audio!
    
    audioLoader.load( 'Audio/Enceladus-Hiss.mp3', function( buffer ) {
        console.log('background sound is playing');
        sound.setBuffer( buffer );
        sound.setLoop( true );
        const initialVolume = 0.03;
        sound.setVolume( initialVolume );
        sound.play();
        audioMuter.addAudio(sound, initialVolume);

    });
        


    const muteCheckBox = document.createElement("input");
    muteCheckBox.id = "mute-trigger";
    muteCheckBox.type = "checkbox";
    const label = document.createElement("label");
    label.setAttribute("for","mute-trigger");
    label.className = "mute-checker";
    label.innerText = "mute";
    document.body.appendChild(muteCheckBox); 
    document.body.appendChild(label); 
    muteCheckBox.addEventListener('change', function(){audioMuter.muteGlobalAudio()}, false);


    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.02;
    initialDestination = new THREE.Vector3(10,10,10);
    destination =  initialDestination;   
    
    //Light
    const light = new THREE.PointLight(0xFFFFFF, 0.2, 500);
    light.position.set(0, 0, 0);
    scene.add(light);

    camera.position.z = 500;


    // put this in later w timing for narrative
    // const near = 10;
    // const far = 100;
    // const color = 'blue';
    // scene.fog = new THREE.Fog(color, near, far);

    // cockroach on click audio dialogue
    for (let i = 0; i<7; i++){
        cockroach.speech[i] = new THREE.PositionalAudio( listener );
        audioLoader.load( `Audio/cockroach/${i+1}.mp3`, function (buffer) {
            cockroach.speech[i].setBuffer(buffer);
            cockroach.speech[i].setRefDistance(20);   
            const initialVolume = 1;
            audioMuter.addAudio(cockroach.speech[i], initialVolume);

        });
        audioControls('cockroach', i+1 );
    }


    for (let i = 0; i<7; i++){
        zombieMouse.speech[i] = new THREE.PositionalAudio( listener );
        audioLoader.load( `Audio/zombie-mouse/${i+1}.mp3`, function (buffer) {
            zombieMouse.speech[i].setBuffer(buffer);
            zombieMouse.speech[i].setRefDistance(20);   
            const initialVolume = 1;
            audioMuter.addAudio(zombieMouse.speech[i], initialVolume);
        });
        audioControls('zombie-mouse', i+1 );
    }

    for (let i = 0; i<14; i++){
        spaceWitch.speech[i] = new THREE.PositionalAudio( listener );
        audioLoader.load( `Audio/space-witch/${i+1}.mp3`, function (buffer) {
            spaceWitch.speech[i].setBuffer(buffer);
            spaceWitch.speech[i].setRefDistance(20);   
            const initialVolume = 1;
            audioMuter.addAudio(spaceWitch.speech[i], initialVolume);
        });
        audioControls('space-witch', i+1 );
    }
   


    starField();

    loadZombieMouse();
    
    loadSpaceWitch();

    loadCockroach();
   
    makeInitialCameraCube();

    loadCauldron();

    initializeZombieMouseSequences();

    initializespaceWitchSequences();

    initializeCockroachSequences();

    function loadEnvTexture(){
        const loader = new THREE.CubeTextureLoader();
        loader.setPath( 'texture/skybox/' );
    
        envMap = loader.load( [
        'test-back.png', 'test-down.png',
        'test-front.png', 'test-left.png',
        'test-right.png', 'test-up.png'
        ] );

    }
    loadEnvTexture()

    zombieMouse.hoverTexture = new THREE.TextureLoader().load('texture/brick-texture.jpg');
    // zombieMouse.hoverMaterial = new THREE.MeshStandardMaterial({map: zombieMouse.hoverTexture});
    zombieMouse.hoverMaterial = new THREE.MeshStandardMaterial({map: zombieMouse.hoverTexture});


    spaceWitch.hoverMaterial = new THREE.MeshBasicMaterial({ envMap: envMap });
    spaceWitch.hoverTexture = new THREE.TextureLoader().load('texture/blue-sky.png');
    spaceWitch.hoverTexture.wrapS = THREE.RepeatWrapping;
    spaceWitch.hoverTexture.wrapT = THREE.RepeatWrapping;
    spaceWitch.hoverTexture.flipY = false;
    // spaceWitch.hoverMaterial.color.set(0xa1ff);
    // spaceWitch.hoverMaterial.emissive.set(0x7100ff);
    // spaceWitch.hoverMaterial.reflectivity = 0.99;

    // const envGeo = new THREE.BoxGeometry(10,10,10);
    // const envCube = new THREE.Mesh(envGeo,spaceWitch.hoverMaterial);
    // scene.add(envCube);

    //make starfield

    function loadVideoTexture(i){
        projectionScreen.video[i] = document.getElementById(`cockroach-vid-${i}`);
        const videoTexture = new THREE.VideoTexture( projectionScreen.video[i] );
        videoTexture.flipY = false;
        // projectionScreen.videoTexture.rotation = Math.Pi/2;
        videoTexture.format = THREE.RGBFormat;
        const color2 = new THREE.Color( 0x2194ce );
        projectionScreen.videoMaterial[i] = new THREE.MeshBasicMaterial({map: videoTexture});
        projectionScreen.videoMaterial[i].name = 'videoMaterial';

        projectionScreen.video[i].addEventListener('ended', function(){
            console.log('video is done');
            projectionScreen.mesh.material = projectionScreen.originalMaterial;
    
        });

    }


    for (let i = 0; i<6; i++){
        loadVideoTexture(i);
    }
    


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
    loadZombieMouseVideoTextures(); 

    
    cockroach.sound = new THREE.PositionalAudio( listener );
    audioLoader.load( 'Audio/branches_1.wav', function (buffer) {
        cockroach.sound.setBuffer(buffer);
        cockroach.sound.setRefDistance(1);
        cockroach.sound.setLoop( true )
        const initialVolume = 0.3;
        cockroach.sound.setVolume(initialVolume);
        audioMuter.addAudio(cockroach.sound, initialVolume);

    });

    
    // Mousemodel ambient audio
    zombieMouse.sound = new THREE.PositionalAudio( listener );
    audioLoader.load( 'Audio/NASA_sun_sonification.wav', function (buffer) {
        zombieMouse.sound.setBuffer(buffer);
        zombieMouse.sound.setRefDistance(1);
        const initialVolume = 0.3;
        zombieMouse.sound.setVolume(0.3);
        audioMuter.addAudio(zombieMouse.sound, initialVolume);

    });


    // Mousemodel on click audio dialogue
    // zombieMouse.speech = new THREE.PositionalAudio( listener );
    // audioLoader.load( 'Audio/Test-recording.m4a', function (buffer) {
    //     zombieMouse.speech.setBuffer(buffer);
    //     zombieMouse.speech.setRefDistance(10);
    //     const initialVolume = 1;
    //     zombieMouse.sound.setVolume(1);
    //     allAudio.push({
    //         audio: zombieMouse.speech,
    //         originalVolume: initialVolume});
   
    // });


    // mouse controls
    function onMouseMove( event ) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.position.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.position.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   
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

    function onMouseDown ( event ){
        mouse.down = true;
        console.log('mouse is down');	
    }

    function onTouchStart ( event ){
        mouse.click = true;
        mouse.hoverTouch = true;
        setTimeout(function (){
            mouse.hoverTouch = false;
        }, 250)
        
        console.log('touch start');	
        mouse.position.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
        mouse.position.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;

    }

    
    function onWheel ( event ){
        mouse.wheel = true;
        console.log('mouse wheel');	
    }


    window.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'mouseover', onMouseOver, false );
    window.addEventListener( 'mouseout', onMouseOut, false );
    controls.domElement.addEventListener( 'click', onMouseClick, false );
    controls.domElement.addEventListener('wheel', onWheel, false);
    controls.domElement.addEventListener('touchstart', onTouchStart, false);
    controls.domElement.addEventListener('pointerdown', onMouseDown, false);
    // controls.domElement.addEventListener('pointerdown', onMouseDown, false);




    //resize canvas with window
    function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    cockroachCamera.aspect = window.innerWidth / window.innerHeight;
    cockroachCamera.updateProjectionMatrix();

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



};


function normalEnvMapRamp(){
    if (ramp && rampVector.x>0){
        rampVector.x +=-0.2*delta;
        rampVector.y +=-0.2*delta;
        cauldron.mesh.material.normalScale = rampVector;
        cauldron.mesh.material.roughness +=-0.2*delta;
    }
    
    else{
        ramp = false;
    }
}

let currentTarget;
let currentCamera;
let currentFocalPoint;
let focalPointDestination;
let doOnce = 1;
let up = true;




const animate = function animate () { 
    requestAnimationFrame(animate);


    if(!zombieMouse.gltfScene||!spaceWitch.gltfScene||!cockroach.gltfScene||!projectionScreen.gltfScene ){return;}




    if (doOnce==1){
        const div = document.getElementById('loading-screen');
        div.classList.add('invisible');
        div.classList.remove('dream-video-div');

        console.log(camera.position);
        currentTarget = initialCameraCube;
        currentFocalPoint=centralCube;
        zombieMouse.sound.play();
        cockroach.sound.play();
        alpha = 0;
        doOnce = null;

    }



    delta = clock.getDelta();
    zombieMouse.mixer.update (delta);
    spaceWitch.mixer.update (delta);
    cockroach.mixer.update (delta);
    cauldron.mixer.update (delta);
 
    // todo deltaSeconds
    normalEnvMapRamp();
    
    if (currentFocalPoint==spaceWitchFocalPoint){
        spaceWitch.gltfScene.rotation.x +=-0.1 * delta;
        spaceWitch.gltfScene.rotation.y +=-0.04 * delta;
    }
    
    if (currentFocalPoint==cockroachFocalPoint){
        cockroach.gltfScene.rotation.z += -0.01 * delta;
        cockroach.gltfScene.rotation.x += -0.1 * delta;
    }

    if (currentFocalPoint==zombieMouseFocalPoint){
        zombieMouse.gltfScene.rotation.x += 0.2 * delta;
        zombieMouse.gltfScene.rotation.y += 0.1 * delta;
    }



    if (currentFocalPoint!=cauldronFocalPoint){
        if(up){
            cauldron.gltfScene.position.y+= Math.random()*0.05-0.3 * delta;
            if(cauldron.gltfScene.position.y>=2){
                up=false;
            }
        }else {
            cauldron.gltfScene.position.y+= Math.random()*-0.01-0.03 * delta;
            if(cauldron.gltfScene.position.y<=0){
                up=true;
            }
        }
    }
    

    centralCauldronCube.rotation.y += 0.04* delta;

    centralCube.rotation.z += 0.04* delta;
    centralCube.rotation.y += 0.03* delta;


    centralMouseCube.rotation.y += -0.03* delta;
    centralRoachCube.rotation.x += 0.01* delta;


    centralRoachCube.rotation.x += 0.02* delta;
    centralRoachCube.rotation.y += 0.05* delta;



    let raycasterArray = [cube1, cube2, cube3, sphere1, projectionScreen.gltfScene]
    // array of intersects objects for performance, so we don't have to calculate intersects on all scene.children

    // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse.position, currentCamera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( raycasterArray, true );


    // if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'Plane'){
    //     alpha = 0;
    //     destination = projectionScreen.gltfScene.position;
    // }

    if(intersects.length > 0 && intersects[0].object.name=='zombie-mouse-bounding-box'&& (mouse.hoverTouch === null || mouse.hoverTouch)&& !currentlyPlaying){
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

        // currentCamera = zombieMouseCamera;
        currentFocalPoint = zombieMouseFocalPoint;
        currentTarget = zombieMouseCamera;
        alpha = 0;

        if (zombieMouse.stateCounter <(zombieMouse.sequence.length)){
            postLerpAction = function(){
                zombieMouse.sequence[zombieMouse.stateCounter]();
            };  

        }  

        //silent audio and captions play
   
    }

    if(intersects.length > 0 && intersects[0].object.name=='space-witch-bounding-box' && (mouse.hoverTouch === null || mouse.hoverTouch)&& !currentlyPlaying){
        console.log('space-witch-hover');

        setSpaceWitchHoverTexture();


    }
    else{ 
        unsetSpaceWitchHoverTexture()

    }



    if(intersects.length > 0 && intersects[0].object.name=='cockroach-bounding-box' && (mouse.hoverTouch === null || mouse.hoverTouch)&& !currentlyPlaying){
        console.log('cockroach hover');

        cockroach.meshes.forEach(function(o){
            o.material.map = spaceWitch.hoverTexture;
            o.material.transparent=true;
            o.material.emissiveIntensity = 0.02;
            o.material.emissive.set(0xff0044);
            o.material.roughness = 0;
            o.material.metalness = 1;
            // o.material.envMapIntensity = 1;


        })


    }
    else{ 
        cockroach.meshes.forEach(function(o){
            o.material.map = o.materialMap;
            o.material.opacity = o.opacity;
            o.material.emissiveIntensity = 1;
            o.material.emissive.set(0x000000);
            o.material.roughness = o.roughness;
            o.material.metalness = o.metalness;

        })

    }


    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'space-witch-bounding-box'){
        
        console.log('space witch Intersection click', intersects[0].object.name)
        // currentCamera = spaceWitchCamera;
        currentFocalPoint = spaceWitchFocalPoint;

        currentTarget = spaceWitchCamera;
        alpha = 0;

        if (spaceWitch.stateCounter <(spaceWitch.sequence.length)){
            postLerpAction = function(){
                spaceWitch.sequence[spaceWitch.stateCounter]();
            };  

        }  
    }


    
    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'cockroach-bounding-box'){
        
        console.log('cockroach witch Intersection click', intersects[0].object.name)

        // currentCamera = cockroachCamera;
        currentFocalPoint = cockroachFocalPoint;
        alpha = 0;
        currentTarget = cockroachCamera;
        // controls.enabled = false;

        
        if (cockroach.stateCounter <(cockroach.sequence.length)){
            postLerpAction = function(){
                cockroach.sequence[cockroach.stateCounter]();
            };  

        } 

    }

    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'cauldron-bounding-sphere'){
        console.log('cauldron click', intersects[0].object.name)

        // currentCamera = cockroachCamera;
        currentFocalPoint = cauldronFocalPoint;
        currentTarget = initialCameraCube;
        alpha = 0;
    }

    if (mouse.click && intersects.length == 0){
            
        destination = initialDestination;
        currentFocalPoint = null;
    }
    else if (mouse.wheel){
            
        destination = initialDestination;
        currentFocalPoint = null;
    }
    else if (mouse.down&& intersects.length == 0){
            
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

    let vector4 = cauldronFocalPoint.geometry.vertices[0].clone();
    vector4.applyMatrix4(cauldronFocalPoint.matrixWorld); 
    cauldronCamera.lookAt(vector4);

    // let vector5 = spaceWitchFocalPointClose.geometry.vertices[0].clone();
    // vector5.applyMatrix4(spaceWitchFocalPointClose.matrixWorld); 
    // spaceWitchPointClose.lookAt(vector5);

 
    roachTextureAnimation.update(1000 * delta);
    roachAlphaAnimation.update(1000 * delta);
    if (cauldron.normalsAnimation){
        cauldron.normalsAnimation.update(1000 * delta);
    }



    controls.update();

    
    renderer.render(scene, currentCamera);

    mouse.click = false;
    mouse.wheel = false;
    mouse.down = false;

};

