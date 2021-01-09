export function makeVideos(){
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

    for (let i=0; i<7; i++){
        const cockroachVidOne = document.createElement("video");
        cockroachVidOne.id = `cockroach-vid-${i}`;
        cockroachVidOne.className = 'invisible-video';
        document.body.appendChild(cockroachVidOne);
        const cockroachVidOneSource = document.createElement('source');
        cockroachVidOneSource.setAttribute('src',`texture/cockroach/${i}.mp4`);
        cockroachVidOne.appendChild(cockroachVidOneSource);     
        cockroachVidOne.load();

    }

    
    for (let i=0; i<7; i++){
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