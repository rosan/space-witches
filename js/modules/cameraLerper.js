import * as THREE from  'https://unpkg.com/three@0.121.1/build/three.module.js';

export const cameraLerper = {
    alpha: 1,
    alphaThreshold: 0.5,
    postLerpAction: null, 
    currentTarget: null,
    currentFocalPoint: null,
    lerpTo: function ( ct, cfp, snap=false, pla){

        if (snap){
            this.alpha = 1;
        } else {
            this.alpha = 0;
        }
        this.currentTarget = ct;
        this.currentFocalPoint = cfp;
        this.postLerpAction = pla;
    
    },
    
    exitLerp: function (){
        this.currentTarget = null;
        this.currentFocalPoint = null;
    },

    update: function (delta, camera, controls){

        if (!this.currentTarget || !this.currentFocalPoint){
            return;
        }
        
        this.currentTarget.updateMatrixWorld();
    
        let vector = new THREE.Vector3();
        this.currentTarget.getWorldPosition(vector);
        let destination = vector;
    
        let vector1 = new THREE.Vector3();
        this.currentFocalPoint.getWorldPosition(vector1);
        let focalPointDestination = vector1;
    
        let quaternion = new THREE.Quaternion();
        this.currentTarget.getWorldQuaternion( quaternion);
        let quaternionDestination =  quaternion;
        
        this.alpha = this.alpha + 0.01*delta;
    
        if (this.alpha > 0.03){
            if (this.postLerpAction){
                this.postLerpAction();
                this.postLerpAction = null;
            }
        }
    
    
        if(this.alpha > this.alphaThreshold){
            
            this.alpha = 1;
    
        }
    
        camera.position.lerp(destination.clone(), this.alpha);
    
        controls.target.lerp(focalPointDestination, this.alpha);
    
        camera.quaternion.slerp(quaternionDestination, this.alpha);
        
    }
    

}