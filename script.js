
// 1. INITIALIZATION & LOADER
(function () {
    var loaderHTML = `
        <div id="page-loader">
            <div class="loader-inner">
                <img src="https://res.cloudinary.com/dniy8inc1/image/upload/v1780009978/neslogo_wqwnsd.jpg" alt="NEO Logo" class="loader-logo">
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


// 2. UI UTILITIES (Nav, Filters, Lightbox)
document.addEventListener("DOMContentLoaded", function() {
    
    // Read More Button
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

    // Mobile Navigation
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

    // Batch Filters
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

    // Generic Lightbox Closure
const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const closeLightbox = document.querySelector('.lightbox-close');

    if (lightbox) {
        const closeBox = () => {
            lightbox.classList.remove('active');
            setTimeout(() => {
                if (lightboxImg) {
                    lightboxImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                }
            }, 500);
        };

        closeLightbox.addEventListener('click', closeBox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeBox();
            }
        });
    }

    // Year Accordion Toggles
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

    // ==========================================
    // 3. CLOUDINARY GALLERY & STAGGER REVEAL
    // ==========================================
    const CLOUD_NAME = 'dniy8inc1';
    const TAG = 'nes_gallery';
    const apiUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json?t=${Date.now()}`;
    const galleryContainer = document.getElementById('dynamic-gallery');
    const galleryLoader = document.getElementById('gallery-loader');

    let staggerQueue = [];
    let isFlushing = false;

    const galleryObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                staggerQueue.push(entry.target);
                observer.unobserve(entry.target);
            }
        });

        if (staggerQueue.length > 0 && !isFlushing) {
            isFlushing = true;
            let flushInterval = setInterval(() => {
                if (staggerQueue.length === 0) {
                    clearInterval(flushInterval);
                    isFlushing = false;
                    return;
                }
                const item = staggerQueue.shift();
                const img = document.createElement('img');
                img.src = item.dataset.gridSrc;
                img.alt = "Northeast Society Event";
                img.onload = () => {
                    item.classList.remove('loading');
                    img.classList.add('loaded');
                };
                item.appendChild(img);
            }, 100); 
        }
    }, { rootMargin: '50px' });

    if (galleryContainer) {
        fetchGalleryImages();
    }

    async function fetchGalleryImages() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (galleryLoader) galleryLoader.style.display = 'none';

            data.resources.forEach(image => {
                const gridImageUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_600,c_fill,q_auto,f_auto/v${image.version}/${image.public_id}.${image.format}`;
                const fullImageUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/v${image.version}/${image.public_id}.${image.format}`;
                
                const galleryItem = document.createElement('div');
                galleryItem.className = 'masonry-item loading';
                galleryItem.style.aspectRatio = `${image.width} / ${image.height}`;
                
                galleryItem.dataset.gridSrc = gridImageUrl;
                galleryItem.dataset.fullSrc = fullImageUrl;

                    galleryItem.addEventListener('click', () => {
                    const dynamicLightbox = document.getElementById('gallery-lightbox');
                    const dynamicLightboxImg = document.getElementById('lightbox-image');
                    
                    if (dynamicLightbox && dynamicLightboxImg) {
                        dynamicLightboxImg.src = galleryItem.dataset.gridSrc;
                        dynamicLightbox.classList.add('active');

                        const highResLoad = new Image();
                        highResLoad.src = galleryItem.dataset.fullSrc;
                        highResLoad.onload = () => {
                            if (dynamicLightbox.classList.contains('active')) {
                                dynamicLightboxImg.src = galleryItem.dataset.fullSrc;
                            }
                        };
                    }
                });

                galleryContainer.appendChild(galleryItem);
                galleryObserver.observe(galleryItem);
            });
        } catch (error) {
            console.error(error);
            if (galleryLoader) galleryLoader.innerHTML = '<p>Will be uploaded soon... Stay tuned :) </p>';
        }
    }
});

// Carousel Helper
function scrollCarousel(direction, trackId) {
    const track = document.getElementById(trackId);
    if (track) {
        const scrollAmount = track.clientWidth / 1.5;
        track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
}

// ==========================================
// 4. MAGNETIC CURSOR (HARDWARE BYPASSED)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let activeTarget = null;

        document.addEventListener('mousemove', (e) => {
            if (activeTarget) {
                const rect = activeTarget.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                cursor.style.transform = `translate(calc(-50% + ${(e.clientX - x) * 0.2}px), calc(-50% + ${(e.clientY - y) * 0.2}px))`;
                cursor.style.left = x + 'px';
                cursor.style.top = y + 'px';
                
                activeTarget.style.transform = `translate(${(e.clientX - x) * 0.1}px, ${(e.clientY - y) * 0.1}px)`;
            } else {
                cursor.style.transform = 'translate(-50%, -50%)';
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a, button, .masonry-item, .lightbox-close, .filter-btn, .glass-dock a');
            if (target) {
                cursor.classList.add('hover-image');
                activeTarget = target;
                target.style.transition = 'transform 0.1s linear';
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('a, button, .masonry-item, .lightbox-close, .filter-btn, .glass-dock a');
            if (target) {
                cursor.classList.remove('hover-image');
                activeTarget = null;
                target.style.transform = 'translate(0px, 0px)';
                target.style.transition = 'transform 0.3s ease';
            }
        });
    }
});

// 5. SMOOTH PARALLAX ENGINE (LERP)

let targetScroll = window.scrollY;
let currentScroll = window.scrollY;

document.addEventListener("scroll", function() {
    targetScroll = window.scrollY;
}, { passive: true });

function renderParallax() {
    // Linear Interpolation (Friction curve: 0.08)
    currentScroll += (targetScroll - currentScroll) * 0.08; 
    
    const parallaxSections = document.querySelectorAll('.hero-fullscreen');
    parallaxSections.forEach(section => {
        const bgWrapper = section.querySelector('.hero-parallax-wrapper');
        const content = section.querySelector('.hero-content-main');

        if (bgWrapper) {
            let rect = section.getBoundingClientRect();
            let sectionTopAbsolute = rect.top + window.scrollY;
            let adjustedTop = sectionTopAbsolute - currentScroll;
            
            if (adjustedTop <= window.innerHeight && (adjustedTop + rect.height) >= 0) {
                let centerOffset = (adjustedTop + rect.height / 2) - (window.innerHeight / 2);
                let p = centerOffset / window.innerHeight; 
                
                let yBg = p * -150; 
                let sBg = 1 + Math.abs(p * 0.1); 
                
                bgWrapper.style.transform = `translate3d(0, ${yBg}px, 0) scale(${sBg})`;
                
                if (content) {
                    let yTxt = p * -250;
                    let op = 1 - Math.abs(p * 1.5);
                    content.style.transform = `translate3d(0, ${yTxt}px, 0)`;
                    content.style.opacity = Math.max(0, op).toFixed(2);
                }
            }
        }
    });
    
    window.requestAnimationFrame(renderParallax);
}
window.requestAnimationFrame(renderParallax);
document.addEventListener("DOMContentLoaded", function() {
    const bentoCards = document.querySelectorAll('.bento-card');
    
    bentoCards.forEach(card => {
        let centerX, centerY, width, height;

        card.addEventListener('mouseenter', () => {
            const rect = card.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            centerX = rect.left + window.scrollX + (width / 2);
            centerY = rect.top + window.scrollY + (height / 2);
            card.style.transition = 'transform 0.1s ease-out';
        });

        card.addEventListener('mousemove', (e) => {
            if (!width) return;
            const mouseX = e.pageX;
            const mouseY = e.pageY;
            
            const rotateY = ((mouseX - centerX) / (width / 2)) * 4;
            const rotateX = -1 * ((mouseY - centerY) / (height / 2)) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease-out, box-shadow 0.4s ease';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            width = null; 
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('.hero-fullscreen');
    if (header && heroSection) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    header.classList.add('header-scrolled');
                } else {
                    header.classList.remove('header-scrolled');
                }
            });
        }, observerOptions);
        heroObserver.observe(heroSection);
    }
});
document.addEventListener("DOMContentLoaded", function() {
    const alumniHero = document.querySelector('.alumni-hero');
    const heroTitle = document.querySelector('.alumni-hero h1');
    const heroDesc = document.querySelector('.alumni-hero p');

    if (alumniHero && heroTitle && heroDesc) {
        window.addEventListener('scroll', () => {
            let scrollY = window.scrollY;
            

            if (scrollY <= alumniHero.offsetHeight) {

                let yOffsetTitle = scrollY * 0.4; 
                let yOffsetDesc = scrollY * 0.3; 
                

                let fade = 1 - (scrollY / 250); 

                heroTitle.style.transform = `translate3d(0, ${yOffsetTitle}px, 0)`;
                heroTitle.style.opacity = Math.max(0, fade);

                heroDesc.style.transform = `translate3d(0, ${yOffsetDesc}px, 0)`;
                heroDesc.style.opacity = Math.max(0, fade);
            }
        }, { passive: true });
    }
});