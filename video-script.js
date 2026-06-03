// 1.load yt
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var timeUpdater; 

function onYouTubeIframeAPIReady() {
    
    player = new YT.Player('youtube-player-node', {
        videoId: '-SL63myuzIE', 
        playerVars: {
            'autoplay': 1,
            'controls': 0, 
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1,
            'playsinline': 1,
            'mute': 1, 
            'rel': 0,
            'wmode': 'transparent',
            'vq': 'hd1080' 
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    const playBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const seekSlider = document.getElementById('seek-slider');
    const progressFill = document.getElementById('progress-fill');
    const currentTimeText = document.getElementById('current-time');
    const totalTimeText = document.getElementById('total-time');
    
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const iconVol = document.getElementById('icon-vol');
    const iconMute = document.getElementById('icon-mute');

      
    // timer 
    let controlsTimeout;
    const ytContainer = document.querySelector('.custom-yt-container');

    // wakes up the ui for 3 seconds
    function wakeControls() {
        if (!ytContainer) return;
        ytContainer.classList.add('force-controls');
        clearTimeout(controlsTimeout);
        
        controlsTimeout = setTimeout(() => {
            // only hide controls if the video is actually playing
            if (player && player.getPlayerState() == YT.PlayerState.PLAYING) {
                ytContainer.classList.remove('force-controls');
            }
        }, 3000);
    }

    function formatTime(seconds) {
        if (!seconds) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    const duration = player.getDuration();
    totalTimeText.textContent = formatTime(duration);
    seekSlider.max = duration;

    // Play / Pause Toggle
    playBtn.addEventListener('click', () => {
        if (player.getPlayerState() == YT.PlayerState.PLAYING) {
            player.pauseVideo();
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        } else {
            player.playVideo();
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
        }
        wakeControls(); // Reset timer
    });

    // mute/unmute toggle
    muteBtn.addEventListener('click', () => {
        if (player.isMuted()) {
            player.unMute();
            iconVol.classList.remove('hidden');
            iconMute.classList.add('hidden');
        } else {
            player.mute();
            iconVol.classList.add('hidden');
            iconMute.classList.remove('hidden');
        }
        wakeControls(); // Reset timer
    });

    // Update Progress Bar
    function updateProgressBar() {
        if (player && player.getCurrentTime) {
            const current = player.getCurrentTime();
            const total = player.getDuration();
            
            currentTimeText.textContent = formatTime(current);
            seekSlider.value = current;
            
            if (total > 0) {
                const percentage = (current / total) * 100;
                progressFill.style.width = `${percentage}%`;
            }
        }
    }
    
    timeUpdater = setInterval(updateProgressBar, 100);

    // Dragging the slider
    seekSlider.addEventListener('input', () => {
        const seekTo = seekSlider.value;
        player.seekTo(seekTo, true);
        
        const total = player.getDuration();
        if (total > 0) {
            const percentage = (seekTo / total) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        wakeControls(); //Reset timer
    });

    // Fullscreen Logic
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const iconExpand = document.getElementById('icon-expand');
    const iconCompress = document.getElementById('icon-compress');

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                if (ytContainer.requestFullscreen) {
                    ytContainer.requestFullscreen();
                } else if (ytContainer.webkitRequestFullscreen) {
                    ytContainer.webkitRequestFullscreen();
                } else if (ytContainer.msRequestFullscreen) {
                    ytContainer.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
            wakeControls(); //Reset timer
        });
    }

    const updateFullscreenIcons = () => {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            iconExpand.classList.add('hidden');
            iconCompress.classList.remove('hidden');
        } else {
            iconExpand.classList.remove('hidden');
            iconCompress.classList.add('hidden');
        }
    };

    document.addEventListener('fullscreenchange', updateFullscreenIcons);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcons);

    // Center Screen Click (The invisible shield)
    const clickOverlay = document.getElementById('video-click-overlay');
    if (clickOverlay) {
        clickOverlay.addEventListener('click', () => {
            if (player.getPlayerState() == YT.PlayerState.PLAYING) {
                player.pauseVideo();
                iconPlay.classList.remove('hidden');
                iconPause.classList.add('hidden');
            } else {
                player.playVideo();
                iconPlay.classList.add('hidden');
                iconPause.classList.remove('hidden');
            }
            wakeControls(); //Reset timer
        });
    }
}