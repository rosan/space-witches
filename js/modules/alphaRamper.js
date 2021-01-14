let increase = true;

export function rampAlpha(renderer, delta){
    let a = renderer.getClearAlpha();
    if (increase){
        renderer.setClearAlpha(a+0.2*delta);
        if (a<0.7){
            increase=true;
        }else{
            increase = false;
        }
    } else{
        renderer.setClearAlpha(a-0.2*delta);
        if (a>0.2){
            increase = false;
        } else {
            increase = true}
        }  
        
}