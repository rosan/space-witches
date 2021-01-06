//plays at same time as on click audio to facilitate captions (AudioListerner does not have captions support)
export function audioSubtitleAdder (directory, audioNumber){
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
            document.getElementById('caption-span').innerText = '';
            console.log('silence');
        }

    },false)

}