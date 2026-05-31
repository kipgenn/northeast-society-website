// 1. Load the YouTube IFrame API dynamically
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var timeUpdater; 

// 2. THIS MUST BE IN THE GLOBAL SCOPE (Do not wrap it in anything)
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player-node', {
        videoId: '-SL63myuzIE', /* Your new YouTube video ID */
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
            'vq': 'hd1080' /* NEW: Tells YouTube to prioritize 1080p HD */
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

// 3. THIS ALSO MUST BE IN THE GLOBAL SCOPE
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

    // Utility: Format seconds into M:SS
    function formatTime(seconds) {
        if (!seconds) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // Set initial duration
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
    });

    // Mute / Unmute Toggle
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
    
    // Run the updater every 100ms
    timeUpdater = setInterval(updateProgressBar, 100);

    // Seek Logic (Dragging the slider)
    seekSlider.addEventListener('input', () => {
        const seekTo = seekSlider.value;
        player.seekTo(seekTo, true);
        
        const total = player.getDuration();
        if (total > 0) {
            const percentage = (seekTo / total) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    });

    // ==========================================
    // FULLSCREEN LOGIC
    // ==========================================
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const iconExpand = document.getElementById('icon-expand');
    const iconCompress = document.getElementById('icon-compress');
    const container = document.querySelector('.custom-yt-container');

    // Toggle Fullscreen on click
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
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
        });
    }

    // Listen for state changes to correct the icons
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

    // ==========================================
    // CLICK SCREEN TO PLAY/PAUSE & WAKE UI
    // ==========================================
    const clickOverlay = document.getElementById('video-click-overlay');
    const ytContainer = document.querySelector('.custom-yt-container');
    let controlsTimeout;

    if (clickOverlay) {
        clickOverlay.addEventListener('click', () => {
            // 1. Toggle Play/Pause
            if (player.getPlayerState() == YT.PlayerState.PLAYING) {
                player.pauseVideo();
                iconPlay.classList.remove('hidden');
                iconPause.classList.add('hidden');
            } else {
                player.playVideo();
                iconPlay.classList.add('hidden');
                iconPause.classList.remove('hidden');
            }

            // 2. Wake up the UI controls
            ytContainer.classList.add('force-controls');
            
            // 3. Clear any existing timer
            clearTimeout(controlsTimeout);

            // 4. Set a timer to hide the UI after 3 seconds (if playing)
            controlsTimeout = setTimeout(() => {
                if (player.getPlayerState() == YT.PlayerState.PLAYING) {
                    ytContainer.classList.remove('force-controls');
                }
            }, 3000);
        });
    }
}