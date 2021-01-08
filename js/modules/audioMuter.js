
export const audioMuter ={
    allAudio: [],
    volumeState: true,
    addAudio: function(sound, initialVolume){
        this.allAudio.push({
            audio: sound,
            originalVolume: initialVolume
        });

    },
    muteGlobalAudio: function (){
        const button = document.getElementById('mute-trigger');
    
        if (this.volumeState){
            for (let i = 0; i < this.allAudio.length; i++){
                console.log(this.allAudio[i]);
                this.allAudio[i].audio.setVolume(0);
            } 
            button.textContent = "unmute";
            this.volumeState=false;
    
        }else{
            for (let i = 0; i < this.allAudio.length; i++){
                this.allAudio[i].audio.setVolume(this.allAudio[i].originalVolume);
            }  
            button.textContent = 'mute';
            this.volumeState=true;
        }
    }
    
}