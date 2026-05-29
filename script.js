//loader
(function () {
    var loaderHTML = `
        <div id="page-loader">
            <div class="loader-inner">
                <img src="https://res.cloudinary.com/dniy8inc1/image/upload/v1780009978/neslogo_wqwnsd.jpg" alt="NES Logo" class="loader-logo">
                <div class="loader-wordmark">
                    <span class="loader-title">NORTHEAST SOCIETY</span>
                    <span class="loader-sub">IIT Delhi</span>
                </div>
                <div class="loader-bar-track">
                    <div class="loader-bar-fill"></div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);

    var loader = document.getElementById('page-loader');

    document.body.style.overflow = 'hidden';

    function dismissLoader() {
        document.body.style.overflow = '';
        loader.classList.add('loader-hidden');
        loader.addEventListener('transitionend', function () {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, { once: true });
    }

    var minDisplayMs = 1200;
    var startTime = Date.now();
    var pageLoaded = false;
    var minTimeMet = false;

    function tryDismiss() {
        if (pageLoaded && minTimeMet) dismissLoader();
    }

    window.addEventListener('load', function () {
        pageLoaded = true;
        tryDismiss();
    });

    setTimeout(function () {
        minTimeMet = true;
        tryDismiss();
    }, minDisplayMs);

    setTimeout(function () {
        if (!loader.classList.contains('loader-hidden')) dismissLoader();
    }, 6000);
})();


document.addEventListener("DOMContentLoaded", function() {
    const content = document.getElementById('pres-text-content');
    const btn = document.getElementById('read-more-btn');

    if (content && btn) {
        if (content.scrollHeight <= content.clientHeight) {
            btn.style.display = 'none';
        }

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            content.classList.toggle('expanded');
            btn.textContent = content.classList.contains('expanded') ? 'Show Less' : 'View Full Message';
        });
    }

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
        });

        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
            });
        });
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    const batchSections = document.querySelectorAll('.batch-section');

    if (filterBtns.length > 0 && batchSections.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                batchSections.forEach(s => s.classList.remove('active'));

                this.classList.add('active');

                const targetYear = this.getAttribute('data-year');
                const targetSection = document.getElementById('batch-' + targetYear);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }

    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const closeLightbox = document.querySelector('.lightbox-close');

    if (lightbox) {
        closeLightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    const yearToggles = document.querySelectorAll('.year-toggle');
    if (yearToggles.length > 0) {
        yearToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const content = this.nextElementSibling;
                if (content && content.classList.contains('year-content')) {
                    content.classList.toggle('expanded');
                }
            });
        });
    }

    const CLOUD_NAME = 'dniy8inc1';
    const TAG = 'nes_gallery';
    const apiUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;
    
    const galleryContainer = document.getElementById('dynamic-gallery');
    const loader = document.getElementById('gallery-loader');

    if (galleryContainer) {
        fetchGalleryImages();
    }

    async function fetchGalleryImages() {
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (loader) {
                loader.style.display = 'none';
            }

            data.resources.forEach(image => {
                const gridImageUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_600,c_fill,q_auto,f_auto/v${image.version}/${image.public_id}.${image.format}`;
                const fullImageUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/v${image.version}/${image.public_id}.${image.format}`;
                
                const galleryItem = document.createElement('div');
                galleryItem.className = 'masonry-item loading';
                
                const imgElement = document.createElement('img');
                imgElement.src = gridImageUrl;
                imgElement.alt = "Northeast Society Event";
                imgElement.loading = "lazy";

                imgElement.onload = () => {
                    galleryItem.classList.remove('loading');
                    imgElement.classList.add('loaded');
                };

                galleryItem.addEventListener('click', () => {
                    const dynamicLightbox = document.getElementById('gallery-lightbox');
                    const dynamicLightboxImg = document.getElementById('lightbox-image');
                    if (dynamicLightbox && dynamicLightboxImg) {
                        dynamicLightboxImg.src = fullImageUrl;
                        dynamicLightbox.classList.add('active');
                    }
                });

                galleryItem.appendChild(imgElement);
                galleryContainer.appendChild(galleryItem);
            });

        } catch (error) {
            console.error(error);
            if (loader) {
                loader.innerHTML = '<p>Error loading gallery. Please try again later.</p>';
            }
        }
    }
});

function scrollCarousel(direction, trackId) {
    const track = document.getElementById(trackId);
    if (track) {
        const scrollAmount = track.clientWidth / 1.5;
        track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
}