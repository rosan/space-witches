import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.121.1//examples/jsm/loaders/GLTFLoader.js';

import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

import {audioMuter} from './modules/audioMuter.js';

import {makeVideos} from './modules/makeVideos.js';

import {makeStarField} from './modules/starfieldMaker.js';

import {cameraLerper} from './modules/cameraLerper.js';

import {TextureAnimator} from './modules/textureAnimator.js';

import {rampAlpha} from './modules/alphaRamper.js';

import {audioSubtitleAdder} from './modules/audioSubtitleAdder.js';

import {makeRoachBabies} from './modules/roachBabiesMaker.js';

import {teeth} from './modules/teethLoader.js';

import { trees } from './modules/trees.js';





let scene, renderer, videoCube, videoSphere, controls,  testcube, cameraTestCube;

let centralCube, centralMouseCube, centralRoachCube, centralCauldronCube;

let cube1, cube2, cube3, sphere1, spaceWitchFocalPoint, cockroachFocalPoint, zombieMouseFocalPoint, cauldronFocalPoint, initialCameraCube, porjectionScreenFocalPoint;

let spaceWitchFocalPointClose, spaceWitchPointClose;

let camera, spaceWitchCamera, zombieMouseCamera, cockroachCamera, cauldronCamera, projectionScreenCamera;

let envMap;

let currentlyPlaying;

let listener;

let heartSound;


let cockroach = {
    gltfScene: null,
    boundingBox: null,
    mesh: null,
    animations: null,
    materialMap: null,
    hoverMaterial: null,
    mixer: null,
    sound: null,
    speech: [],
    body: null,
    meshes: [],
    clickAnimationOne: null,
    clickAnimationTwo: null,
    stateCounter: 0,
    sequence: [],

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
    meshes: [], 
    speech: [],
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
    normalRamp: null,
    normalRampVector: new THREE.Vector2(1, 1),
    playNext: [],
    loadCauldronVideoTextures: function(envMap){
  
        for (let i = 0; i < 9; i++) {
            this.video[i] = document.getElementById(`cauldron-vid-${i}`);
            const videoTexture = new THREE.VideoTexture(this.video[i]);
            videoTexture.flipY = false;
            videoTexture.format = THREE.RGBFormat;
            this.videoMaterial[i] = new THREE.MeshStandardMaterial({ map: videoTexture });
            this.videoMaterial[i].name = `cauldronVideoMaterial-${i}`;
    
    
            const normalsVid = document.getElementById('normals-vid');
            const normalsTexture = new THREE.VideoTexture(normalsVid);
            normalsVid.play();
    
            this.videoMaterial[i].envMap = envMap;
    
            this.videoMaterial[i].roughness = 1;
            this.videoMaterial[i].metalness = 0.3;
            this.videoMaterial[i].emissiveMap = videoTexture;
            this.videoMaterial[i].emissive = new THREE.Color(0xfa9898);
    
    
            console.log(this.mesh.material);
            console.log(this.videoMaterial[i]);

            this.playNext.push(false);
    
    
    
            if (i != 4) {
    
                this.videoMaterial[i].normalMap = normalsTexture;
    
                this.video[i].addEventListener('ended', (event) =>{
                    console.log('cauldron video is done');
                    if (this.playNext[i] !== false){
                        this.mesh.material = cauldron.videoMaterial[this.playNext[i]];
                        this.video[this.playNext[i]].play();

                    }else{
                        this.mesh.material = cauldron.videoMaterial[4];
                        this.video[4].play();
                        this.video[4].loop = true;
                    }

                });
            }
            else if (i == 4) {
    
                this.mesh.material = this.videoMaterial[4];
                this.video[4].play();
                this.video[4].loop = true;
    
            }
    
        }
    
    
    }   
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

//roach group

const roachBabies= makeRoachBabies();

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

        cauldron.loadCauldronVideoTextures(envMap);
        cauldronBoundingSphere();
    
        teeth.load(function(){
            console.log('teeth-loaded');
        }); 


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


        // cockroach.gltfScene.add(roachBabies.points);  

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


        spaceWitch.gltfScene.traverse(function(o){
            if(o.type == "Mesh" || o.type == "SkinnedMesh" ){
                if (o.material.name!="helmetlight-material.001"){
                    o.material.envMap = envMap;
                    spaceWitch.meshes.push({
                        mesh: o,
                        material: o.material,
                        materialMap: o.material.map,
                        opacity: o.material.opacity,
                        emissive: o.material.emissive,
                        emissiveIntensity: o.material.emissiveIntensity,
                    })
    
                }
                
            }
        })

        console.log('space witch meshes');
        console.log(spaceWitch.meshes);
 
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


function zombieMouseSequenceOne(done){
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
        done();
        console.log('zombieMouse audio ended');
    }
    console.log(`zombiemouse state counter is ${zombieMouse.stateCounter}`);
    zombieMouse.stateCounter = zombieMouse.stateCounter + 1;
}


function zombieMouseSequenceTwo(done){
    zombieMouse.sound.stop();

    zombieMouse.speech[1].play();
    startCaptions('zombie-mouse',2);
    
    zombieMouse.speech[1].source.onended = (event) => {
        zombieMouse.sound.play();
        done();
        console.log('zombieMouse audio ended');
    }
    console.log(`zombiemouse state counter is ${zombieMouse.stateCounter}`);
    zombieMouse.stateCounter = zombieMouse.stateCounter + 1;
}

function zombieMouseSequenceThree(done){
    
    zombieMouse.sound.stop();

    zombieMouse.speech[2].play();
    startCaptions('zombie-mouse',3);
    
    zombieMouse.speech[2].source.onended = (event) => {
        cameraLerper.lerpTo(spaceWitchCamera, spaceWitchFocalPoint, true);      
        console.log('zombieMouse audio ended');
        spaceWitch.speech[12].play();
        startCaptions('space-witch', 13);

        spaceWitch.speech[12].source.onended = (event) => {
            console.log('space witch audio ended');
            done();
            cameraLerper.lerpTo(zombieMouseCamera, zombieMouseFocalPoint, true);      
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


function spaceWitchSequenceOne(done){
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
                done();
            }

        }

    }
    console.log(`space witch state counter is ${spaceWitch.stateCounter}`);
    spaceWitch.stateCounter = spaceWitch.stateCounter + 1;

}

function spaceWitchSequenceTwo(done){
    // spaceWitch.sound.stop();

    spaceWitch.speech[2].play();
    startCaptions('space-witch', 3);

    setTimeout(function (){ 
        // cauldron.mesh.material =spaceWitch.hoverMaterial;

        cameraLerper.lerpTo(cauldronCamera, cauldronFocalPoint);
  
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
            cauldron.normalRamp = true;

            setTimeout(function (){
                scene.add(trees.points);
                cameraLerper.lerpTo(initialCameraCube, cauldronFocalPoint, true);
                setTimeout(function (){
                    cameraLerper.lerpTo(cauldronCamera, cauldronFocalPoint);

                },2*1000)

            },6500)
            
 

            setTimeout(function (){
                cameraLerper.lerpTo(initialCameraCube, cauldronFocalPoint, true);

                setTimeout(function (){
                    cameraLerper.lerpTo(spaceWitchPointClose, spaceWitchFocalPointClose, true);
                    scene.remove(tree.points);

                },4000)
            },15*1000)

        },3*1000)
    },1*1000),

    
    spaceWitch.speech[2].source.onended = (event) => {
        console.log('space witch audio ended');
        done();
        
        cameraLerper.lerpTo(spaceWitchCamera, spaceWitchFocalPoint);
     
    }

    console.log(`space witch state counter is ${spaceWitch.stateCounter}`);
    spaceWitch.stateCounter = spaceWitch.stateCounter + 1;

}

function spaceWitchSequenceThree(done){
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
        done();

        cameraLerper.lerpTo(spaceWitchCamera, spaceWitchFocalPoint);     
    }

    console.log(`space witch state counter is ${spaceWitch.stateCounter}`);
    spaceWitch.stateCounter = spaceWitch.stateCounter + 1;

}

function spaceWitchSequenceFour(done){
    // During the accumulation, the land was expropriated and we were gathered together and cloven in two. 
    // On the one side, were made the waged workers, alien and disconnected from the means of production. 
    // video of space witch]On the other, we, who could produce these workers, we who cared for each other, we were set against one another, so that our power might be broken, so that we too would be accumulated, be controlled. 

}
function spaceWitchSequenceFive(done){
    // spaceWitch.sound.stop();

    spaceWitch.speech[5].play();
    startCaptions('space-witch', 6);
    
    spaceWitch.speech[5].source.onended = (event) => {
        console.log('space witch audio ended');
        cameraLerper.lerpTo(cockroachCamera, cockroachFocalPoint);

        setTimeout(function(){
            cockroach.speech[6].play();
            startCaptions('cockroach', 7);
            cockroach.sound.stop();

            console.log(projectionScreen.mesh.material);
            console.log(projectionScreen.videoMaterial[6]);
            projectionScreen.video[6].play();
            projectionScreen.mesh.material = projectionScreen.videoMaterial[6];
            console.log(projectionScreen.mesh.material);

            setTimeout(function (){
                cockroach.clickAnimationOne.stop();
                cockroach.clickAnimationTwo.stop();
                cockroach.clickAnimationOne.play();
                cockroach.clickAnimationTwo.play();

            },500);

            setTimeout(function (){

                currentCamera = projectionScreenCamera;

            }, cockroach.clickAnimationTwo.getClip().duration*1000-4000)

            cockroach.speech[6].source.onended = (event) =>{
                console.log('audio over');
                projectionScreen.mesh.material = projectionScreen.originalMaterial;
                currentCamera = camera;
    
                cameraLerper.lerpTo(spaceWitchCamera, spaceWitchFocalPoint, true);
                done();   
            };

        },2*1000);

        const audioObject = document.getElementById( `cockroach-${7}`);
        console.log(audioObject.duration);
        console.log(cockroach.clickAnimationTwo.getClip().duration);
    
        setTimeout(function (){
            cockroach.clickAnimationOne.stop();
            cockroach.clickAnimationTwo.stop();
            cockroach.clickAnimationOne.play();
            cockroach.clickAnimationTwo.play();   
    
            console.log('timer')
    
        }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+6000)


    }

    cameraLerper.lerpTo(spaceWitchCamera, spaceWitchFocalPoint);


    console.log(`space witch state counter is ${spaceWitch.stateCounter}`);
    spaceWitch.stateCounter = spaceWitch.stateCounter + 1;

}


function spaceWitchSequenceSix(done){

    spaceWitch.speech[6].play();
    startCaptions('space-witch', 7);

    spaceWitch.speech[6].source.onended = (event) => {
        console.log('space witch audio ended');

        const video = document.getElementById('space-witch-vid-4');
        console.log(video);
        const div = document.getElementById('space-witch-video-div-4');
        div.classList.add('dream-video-div');
        div.classList.remove('invisible-video');
        video.play();
        
        video.onended = (event) => {
            div.classList.add('invisible-video');
            div.classList.remove('dream-video-div');
            console.log('video ended');

            alphaRamp = true;
            cauldron.mesh.material = cauldron.videoMaterial[8];    
            cauldron.video[8].play();
            cauldron.videoMaterial[8].normalMap = false;
            cauldron.playNext[8] = 2;
            cameraLerper.lerpTo(cauldronCamera, cauldronFocalPoint, true);

            renderer.setClearAlpha(0.6);
            const density = 0.02;
            const color = new THREE.Color(0xff6281);
            scene.fog = new THREE.FogExp2(color, density); 

            heartSound.play();

            cauldron.gltfScene.add(teeth.points);

            spaceWitch.speech[7].play();
            startCaptions('space-witch', 8);

 
                
            setTimeout(function(){
                spaceWitch.speech[8].play();
                startCaptions('space-witch', 9);

                spaceWitch.speech[8].source.onended = (event) => {
                    cameraLerper.lerpTo(zombieMouseCamera, zombieMouseFocalPoint, true);
                    setTimeout(function(){
                        zombieMouse.speech[5].play();
                        startCaptions('zombie-mouse', 6);

                        zombieMouse.speech[5].source.onended = (event) => {
                            cameraLerper.lerpTo(spaceWitchCamera, spaceWitchFocalPoint, true);

                            setTimeout(function(){
                                spaceWitch.speech[9].play();
                                startCaptions('space-witch', 10);

                                spaceWitch.speech[9].source.onended = (event) => {
                                    cameraLerper.lerpTo(cauldronCamera, cauldronFocalPoint, true);
                                    cauldron.mesh.material = cauldron.videoMaterial[2];
                                    cauldron.video[2].play();
                                    cauldron.videoMaterial[2].normalMap = false;
                                    zombieMouse.speech[6].play();

                                    startCaptions('zombie-mouse', 7);    
                                    zombieMouse.speech[6].source.onended = (event) => {
                                        cameraLerper.lerpTo(initialCameraCube, cauldronFocalPoint, true);
                                        done();
                                    }
                                }
                            },2000)
    
                        }
                    },3000)

                }
            }, 20000)    



                
                    
                
            }
            

    

    }

    
    console.log(`space witch state counter is ${spaceWitch.stateCounter}`);
    spaceWitch.stateCounter = spaceWitch.stateCounter + 1;

}




function initializespaceWitchSequences(){
    spaceWitch.sequence[0] = spaceWitchSequenceOne;
    spaceWitch.sequence[1] = spaceWitchSequenceTwo;
    spaceWitch.sequence[2] = spaceWitchSequenceThree;
    spaceWitch.sequence[5] = spaceWitchSequenceFour;
    spaceWitch.sequence[3] = spaceWitchSequenceFive;
    spaceWitch.sequence[4] = spaceWitchSequenceSix;

    //remember to set order

}

function cockroachSequenceOne(done){

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
            cameraLerper.lerpTo(cockroachCamera, cockroachFocalPoint);

        }, 5000)

    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        done();
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}
function cockroachSequenceTwo(done){
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
            cameraLerper.lerpTo(cockroachCamera, cockroachFocalPoint);

        }, 5000)

    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        done();
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}

function cockroachSequenceThree(done){
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
            cameraLerper.lerpTo(cockroachCamera, cockroachFocalPoint);

        }, 5000)

    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        done();
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}

function cockroachSequenceFour(done){
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
        cameraLerper.lerpTo(spaceWitchPointClose, spaceWitchFocalPointClose, true);   
        
        setTimeout(function (){
            cameraLerper.lerpTo(cockroachCamera, cockroachFocalPoint, true);

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
        done();
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;
}

function cockroachSequenceFive(done){

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
            cameraLerper.lerpTo(cockroachCamera,cockroachFocalPoint);
        }, 5000)

    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        done();
        console.log('cockroach audio ended');
    }
    cockroach.stateCounter = cockroach.stateCounter + 1;

}

function cockroachSequenceSix(done){
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

        cockroach.gltfScene.add(roachBabies.points);

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
            cameraLerper.lerpTo(cockroachCamera, cockroachFocalPoint);

        }, 5000)


    }, (audioObject.duration-cockroach.clickAnimationTwo.getClip().duration)*1000+4000)

    

    cockroach.speech[cockroach.stateCounter].source.onended = (event) => {
        cockroach.sound.play();
        done();
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
    
    heartSound = new THREE.Audio( listener );

    audioLoader.load( 'Audio/heartbeat-01a.mp3', function( buffer ) {
        console.log('heart sound is playing');
        heartSound.setBuffer( buffer );
        heartSound.setLoop( true );
        const initialVolume = 0.3
        heartSound.setVolume( initialVolume );
        audioMuter.addAudio(heartSound, initialVolume);

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
 
    
    //Light
    const light = new THREE.PointLight(0xFFFFFF, 0.2, 500);
    light.position.set(0, 0, 0);
    scene.add(light);

    camera.position.z = 500;



    // cockroach on click audio dialogue
    for (let i = 0; i<7; i++){
        cockroach.speech[i] = new THREE.PositionalAudio( listener );
        audioLoader.load( `Audio/cockroach/${i+1}.mp3`, function (buffer) {
            cockroach.speech[i].setBuffer(buffer);
            cockroach.speech[i].setRefDistance(20);   
            const initialVolume = 1;
            audioMuter.addAudio(cockroach.speech[i], initialVolume);

        });
        audioSubtitleAdder('cockroach', i+1 );
    }


    for (let i = 0; i<7; i++){
        zombieMouse.speech[i] = new THREE.PositionalAudio( listener );
        audioLoader.load( `Audio/zombie-mouse/${i+1}.mp3`, function (buffer) {
            zombieMouse.speech[i].setBuffer(buffer);
            zombieMouse.speech[i].setRefDistance(20);   
            const initialVolume = 1;
            audioMuter.addAudio(zombieMouse.speech[i], initialVolume);
        });
        audioSubtitleAdder('zombie-mouse', i+1 );
    }

    for (let i = 0; i<14; i++){
        spaceWitch.speech[i] = new THREE.PositionalAudio( listener );
        audioLoader.load( `Audio/space-witch/${i+1}.mp3`, function (buffer) {
            spaceWitch.speech[i].setBuffer(buffer);
            spaceWitch.speech[i].setRefDistance(20);   
            const initialVolume = 1;
            audioMuter.addAudio(spaceWitch.speech[i], initialVolume);
        });
        audioSubtitleAdder('space-witch', i+1 );
    }
   
    let starfieldArray = makeStarField();

    scene.add(...starfieldArray);


    loadZombieMouse();
    
    loadSpaceWitch();

    loadCockroach();
   
    makeInitialCameraCube();

    loadCauldron();

    initializeZombieMouseSequences();

    initializespaceWitchSequences();

    initializeCockroachSequences();

    trees.load(function(){
        console.log('trees-loaded');

    }); 
    

    renderer.setClearColor(0xff6281);
    renderer.setClearAlpha(0);



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


    for (let i = 0; i<7; i++){
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

let intensity = 1;
function normalEnvMapRamp(intensity){
    if (cauldron.normalRamp && cauldron.normalRampVector.x>0){
        cauldron.normalRampVector.x +=-0.2*delta*intensity;
        cauldron.normalRampVector.y +=-0.2*delta*intensity;
        cauldron.mesh.material.normalScale = cauldron.normalRampVector;
        cauldron.mesh.material.roughness +=-0.2*delta;
    }
    
    else{
        cauldron.normalRamp = false;
    }
}

let alphaRamp = false;



let currentCamera;
let doOnce = 1;
let up = true;



const animate = function animate () { 
    requestAnimationFrame(animate);


    if(!zombieMouse.gltfScene||!spaceWitch.gltfScene||!cockroach.gltfScene||!projectionScreen.gltfScene||!trees.points ){return;}




    if (doOnce==1){
        const div = document.getElementById('loading-screen');
        div.classList.add('invisible');
        div.classList.remove('dream-video-div');

        console.log(camera.position);
        cameraLerper.lerpTo(initialCameraCube, centralCube);
        zombieMouse.sound.play();
        cockroach.sound.play();
        doOnce = null;

    }

    delta = clock.getDelta();
    zombieMouse.mixer.update (delta);
    spaceWitch.mixer.update (delta);
    cockroach.mixer.update (delta);
    cauldron.mixer.update (delta);
 
    // todo deltaSeconds
    normalEnvMapRamp(intensity);

    if (alphaRamp){
        rampAlpha(renderer, delta);
    }
    
    if (cameraLerper.currentFocalPoint==spaceWitchFocalPoint){
        spaceWitch.gltfScene.rotation.x +=-0.1 * delta;
        spaceWitch.gltfScene.rotation.y +=-0.04 * delta;
    }
    
    if (cameraLerper.currentFocalPoint==cockroachFocalPoint){
        cockroach.gltfScene.rotation.z += -0.01 * delta;
        cockroach.gltfScene.rotation.x += -0.1 * delta;
    }

    if (cameraLerper.currentFocalPoint==zombieMouseFocalPoint){
        zombieMouse.gltfScene.rotation.x += 0.2 * delta;
        zombieMouse.gltfScene.rotation.y += 0.1 * delta;
    }


    if (cameraLerper.currentFocalPoint!=cauldronFocalPoint){
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

        if (zombieMouse.stateCounter <(zombieMouse.sequence.length)&& !currentlyPlaying){
            cameraLerper.lerpTo(zombieMouseCamera, zombieMouseFocalPoint, false, function(){
                currentlyPlaying = true;
                zombieMouse.sequence[zombieMouse.stateCounter](function(){ 
                    currentlyPlaying= false;
                });
            });

        }else{
            cameraLerper.lerpTo(zombieMouseCamera, zombieMouseFocalPoint);

        }  

        //silent audio and captions play
   
    }

    if(intersects.length > 0 && intersects[0].object.name=='space-witch-bounding-box' && (mouse.hoverTouch === null || mouse.hoverTouch)&& !currentlyPlaying){
        console.log('space-witch-hover');
        // setSpaceWitchHoverTexture();
        
        spaceWitch.meshes.forEach(function(o){
            o.material.map = spaceWitch.hoverTexture;
            o.material.transparent=true;
            o.material.opacity = 0.7;
            o.material.emissiveIntensity = 0.02;
            if (o.material.emissive){
                o.material.emissive.set(0x0d10ba);

            }

            // o.material.envMapIntensity = 1;


        })


    }
    else { 
        spaceWitch.meshes.forEach(function(o){
            o.material.map = o.materialMap;
            o.material.opacity = o.opacity;
            o.material.emissiveIntensity = o.emissiveIntensity;
            if (o.material.emissive){
                o.material.emissive.set(0x000000);
            }   

        })


    }
    // else{ 
    //     unsetSpaceWitchHoverTexture()

    // }



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
 
        if (spaceWitch.stateCounter <(spaceWitch.sequence.length)&& !currentlyPlaying){
            cameraLerper.lerpTo(spaceWitchCamera, spaceWitchFocalPoint, false,function(){
                currentlyPlaying = true;
                spaceWitch.sequence[spaceWitch.stateCounter](function(){ 
                    currentlyPlaying= false;
                });
                
            });

              
        }else{
            cameraLerper.lerpTo(spaceWitchCamera, spaceWitchFocalPoint);

        }  
    }


    
    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'cockroach-bounding-box'){
        
        console.log('cockroach witch Intersection click', intersects[0].object.name)


        
        if (cockroach.stateCounter <(cockroach.sequence.length)&& !currentlyPlaying){
            cameraLerper.lerpTo(cockroachCamera, cockroachFocalPoint, false, function(){
                currentlyPlaying = true;
                cockroach.sequence[cockroach.stateCounter](function(){ 
                    currentlyPlaying= false;
                });
            })  

        } else {
            cameraLerper.lerpTo(cockroachCamera, cockroachFocalPoint);
        }

    }

    if (mouse.click && intersects.length > 0 && intersects[0].object.name== 'cauldron-bounding-sphere'){
        console.log('cauldron click', intersects[0].object.name)

        cameraLerper.lerpTo(initialCameraCube, cauldronFocalPoint);
    }

    if (mouse.click && intersects.length == 0){
        cameraLerper.exitLerp();            
    }
    else if (mouse.wheel){
            
        cameraLerper.exitLerp();            
    }
    else if (mouse.down&& intersects.length == 0){
            
        cameraLerper.exitLerp();            
    }
    

    cameraLerper.update(delta, camera, controls);


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

 
    roachBabies.textureAnimation.update(1000 * delta);
    roachBabies.alphaAnimation.update(1000 * delta);
    if (cauldron.normalsAnimation){
        cauldron.normalsAnimation.update(1000 * delta);
    }



    controls.update();

    
    renderer.render(scene, currentCamera);

    mouse.click = false;
    mouse.wheel = false;
    mouse.down = false;

};

