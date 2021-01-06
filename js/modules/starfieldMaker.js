import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

export function makeStarField(){

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
    let starField1 = new THREE.Points(starGeometry, new THREE.PointsMaterial({
        // transparent: true,
        // alphaMap: starDiskAlpha,
        map: starDisk,
        size: 0.5,
        color: 0xffffff
        })
    ); 
    starField1.position.z = 100;


    const starGeometry2 = new THREE.Geometry();
    for (let i = 0; i < 1500; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-800;
        vertex.y = Math.random()*1000-800;
        vertex.z = Math.random()*1000-800;
        starGeometry2.vertices.push(vertex);
    }
    let starField2 = new THREE.Points(starGeometry2, new THREE.PointsMaterial({
        // transparent: true,
        // alphaMap: starDisk,
        map: starDisk,
        size: 0.7,
        color: 0xa8e6ff
        })
    ); 
    starField2.position.z = 150;


    const starGeometry3 = new THREE.Geometry();
    for (let i = 0; i < 3000; i++) {
        const vertex = new THREE.Vector3();
        vertex.x = Math.random()*1000-500;
        vertex.y = Math.random()*1000-500;
        vertex.z = Math.random()*1000-200;
        starGeometry3.vertices.push(vertex);
    }

    let starField3 = new THREE.Points(starGeometry3, new THREE.PointsMaterial({
        // transparent: true,
        // alphaMap: starDisk,
        map: starDisk,
        size: 0.4,
        color: 0xffc47d
        })
    );
    starField3.position.z = 130;

    let starFieldArray=[starField1, starField2, starField3];
    return starFieldArray;

}