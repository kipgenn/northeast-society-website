//if youre seeing this please dont inject anything please please pleaese please im not paid for this please please

(function () {
    if (sessionStorage.getItem('hasLoadedBefore')) {
        return;
    }

    var loaderHTML = `
        <div id="page-loader">
            <div class="loader-inner">
               <img src="https://res.cloudinary.com/dniy8inc1/image/upload/w_150,f_auto,q_auto/v1780009978/neslogo_wqwnsd.jpg" alt="NES Logo" class="loader-logo">
                <div class="loader-wordmark">
                    <div class="loader-title">
                        ${"NORTHEAST SOCIETY".split('').map((c, i) => 
                            c === ' ' 
                            ? `<span class="letter space" style="animation-delay: ${i * 0.08}s">&nbsp;</span>` 
                            : `<span class="letter" style="animation-delay: ${i * 0.08}s">${c}</span>`
                        ).join('')}
                    </div>
                    <div class="loader-sub">IIT Delhi</div>
                </div>
            </div>
        </div>`;
        
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);

    var loader = document.getElementById('page-loader');
    document.body.style.overflow = 'hidden';

    function dismissLoader() {
        document.body.style.overflow = '';
        loader.classList.add('loader-hidden');
        sessionStorage.setItem('hasLoadedBefore', 'true');
        loader.addEventListener('transitionend', function () {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, { once: true });
    }

    var minDisplayMs = 1200;
    var imagesLoaded = false;
    var minTimeMet = false;

    function tryDismiss() {
        if (imagesLoaded && minTimeMet) dismissLoader();
    }

    function checkAllImages() {
        const images = Array.from(document.images);
        let loadedCount = 0;

        if (images.length === 0) {
            imagesLoaded = true;
            tryDismiss();
            return;
        }

        images.forEach(img => {
            if (img.complete) {
                loadedCount++;
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        imagesLoaded = true;
                        tryDismiss();
                    }
                }, { once: true });
                img.addEventListener('error', () => {
                    loadedCount++; 
                    if (loadedCount === images.length) {
                        imagesLoaded = true;
                        tryDismiss();
                    }
                }, { once: true });
            }
        });

        if (loadedCount === images.length) {
            imagesLoaded = true;
            tryDismiss();
        }
    }

    window.addEventListener('load', checkAllImages);

    setTimeout(function () {
        minTimeMet = true;
        tryDismiss();
    }, minDisplayMs);

    setTimeout(function () {
        if (!loader.classList.contains('loader-hidden')) dismissLoader();
    }, 10000);
})();

// 2. UI UTILITIES
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

    const timelineBtns = document.querySelectorAll('.timeline-year');
    const batchSections = document.querySelectorAll('.batch-section');
    if (timelineBtns.length > 0 && batchSections.length > 0) {
        timelineBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                timelineBtns.forEach(b => b.classList.remove('active'));
                batchSections.forEach(s => s.classList.remove('active'));
                
                this.classList.add('active');
                const targetYear = this.getAttribute('data-year');
                const targetSection = document.getElementById('batch-' + targetYear);
                
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            });
        });
    }

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
});

// 3. CLOUDINARY GALLERY & STAGGER REVEAL
document.addEventListener("DOMContentLoaded", function() {
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

function scrollCarousel(direction, trackId) {
    const track = document.getElementById(trackId);
    if (track) {
        const scrollAmount = track.clientWidth / 1.5;
        track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
}

// 4. MAGNETIC CURSOR
document.addEventListener("DOMContentLoaded", function() {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let activeTarget = null;
        let targetRect = null; 

        let isCursorTicking = false;
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!isCursorTicking) {
                window.requestAnimationFrame(() => {
                    if (activeTarget && targetRect) {
                        const x = targetRect.left + targetRect.width / 2;
                        const y = targetRect.top + targetRect.height / 2;
                        
                        cursor.style.transform = `translate(calc(-50% + ${(mouseX - x) * 0.2}px), calc(-50% + ${(mouseY - y) * 0.2}px))`;
                        cursor.style.left = x + 'px';
                        cursor.style.top = y + 'px';
                        
                        activeTarget.style.transform = `translate(${(mouseX - x) * 0.1}px, ${(mouseY - y) * 0.1}px)`;
                    } else {
                        cursor.style.transform = 'translate(-50%, -50%)';
                        cursor.style.left = mouseX + 'px';
                        cursor.style.top = mouseY + 'px';
                    }
                    isCursorTicking = false;
                });
                isCursorTicking = true;
            }
        });

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a:not(.bento-card), button:not(.yt-btn), .masonry-item, .lightbox-close, .filter-btn, .glass-dock a');
            if (target) {
                cursor.classList.add('hover-image');
                activeTarget = target;
                targetRect = target.getBoundingClientRect();
                target.style.transition = 'transform 0.1s linear';
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('a:not(.bento-card), button:not(.yt-btn), .masonry-item, .lightbox-close, .filter-btn, .glass-dock a');
            if (target) {
                cursor.classList.remove('hover-image');
                activeTarget = null;
                targetRect = null;
                target.style.transform = 'translate(0px, 0px)';
                target.style.transition = 'transform 0.3s ease';
            }
        });
    }
});

// 5. SMOOTH PARALLAX ENGINE
let targetScroll = window.scrollY;
let currentScroll = window.scrollY;

document.addEventListener("scroll", function() {
    targetScroll = window.scrollY;
}, { passive: true });

function renderParallax() {
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

//global header
document.addEventListener("DOMContentLoaded", function() {
    const globalHeaderHTML = `
        <header id="main-nav">
            <div class="g1">
                <a href="index.html" style="display: flex; align-items: center; text-decoration: none; gap: 1rem;">
                    <img src="https://res.cloudinary.com/dniy8inc1/image/upload/w_120,q_auto,f_auto/v1780009978/neslogo_wqwnsd.jpg" alt="NEO Logo" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">
                    <div>
                        <h1 style="color: #ffffff !important; font-size: 1.2rem; margin: 0;">Northeast Society</h1>
                        <h2 style="color: #cbd5e1 !important; font-size: 0.85rem; margin: 0;">IIT Delhi</h2>
                    </div>
                </a>
            </div>
            
            <nav class="desktop-nav">
                <a href="about.html">About</a>
                <a href="events.html">Events</a>
                <a href="gallery.html">Gallery</a>
                <a href="teams.html">Team</a>
                <a href="alumni.html">Alumni</a>
            </nav>

            <button class="mobile-menu-btn" aria-label="Toggle Menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </header>

        <div class="mobile-nav-overlay">
            <nav class="mobile-nav-links">
                <a href="about.html">About</a>
                <a href="events.html">Events</a>
                <a href="gallery.html">Gallery</a>
                <a href="teams.html">Team</a>
                <a href="alumni.html">Alumni</a>
            </nav>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', globalHeaderHTML);

    const headerElement = document.getElementById('main-nav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const overlay = document.querySelector('.mobile-nav-overlay');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 150) {
            headerElement.classList.add('header-scrolled');
        } else {
            headerElement.classList.remove('header-scrolled');
        }
    });

    // Hamburger Menu Logic
    menuBtn.addEventListener('click', () => {
        overlay.classList.toggle('active');
        // Swaps the icon from 3 lines to an 'X' when open
        if(overlay.classList.contains('active')) {
            menuBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            document.body.style.overflow = 'hidden'; // Prevents scrolling while menu is open
        } else {
            menuBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
            document.body.style.overflow = ''; 
        }
    });
});

window.addEventListener('scroll', () => {
    const dynamicText = document.querySelector('.dynamic-text-container');
    
    if (dynamicText) {
        const scrollY = window.scrollY;
        const opacity = Math.max(0, 1 - (scrollY / 500));
        const translateY = scrollY * 0.35; 
        const scale = Math.max(0.85, 1 - (scrollY / 1000));

        dynamicText.style.transform = `translateY(${translateY}px) scale(${scale})`;
        dynamicText.style.opacity = opacity;
    }
});

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, {
    rootMargin: "0px 0px 250px 0px",
    threshold: 0.1
});

document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    scrollObserver.observe(el);
});

// 7. EVENTS PAGE: SIDEBAR TABS & PARALLAX
document.addEventListener("DOMContentLoaded", function() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const batchSections = document.querySelectorAll('.batch-section');

    if (sidebarBtns.length > 0) {
        sidebarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sidebarBtns.forEach(b => b.classList.remove('active'));
                batchSections.forEach(s => s.classList.remove('active'));

                btn.classList.add('active');

                const targetYear = btn.getAttribute('data-year'); 
                const targetSection = document.getElementById('batch-' + targetYear);
                
                if (targetSection) {
                    targetSection.classList.add('active');
                    if (window.innerWidth <= 1024) {
                        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    const eventsHero = document.querySelector('.events-hero');
    
    if (eventsHero) {
        const heading = eventsHero.querySelector('h1');
        const paragraph = eventsHero.querySelector('p');

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            
            if (scrolled < window.innerHeight && heading && paragraph) {
                if (scrolled > 5) {
                    heading.style.animation = 'none';
                    paragraph.style.animation = 'none';
                }

                const opacity = Math.max(0, 1 - (scrolled / (window.innerHeight * 0.4)));
                const scale = Math.max(0.85, 1 - (scrolled * 0.0004));
                const yMove = scrolled * 0.5;

                heading.style.opacity = opacity;
                heading.style.transform = `translateY(${yMove}px) scale(${scale})`;
                
                paragraph.style.opacity = opacity;
                paragraph.style.transform = `translateY(${yMove}px) scale(${scale})`;
            }
        });
    }
});

const dropdown = document.getElementById('gallery-year-dropdown');
const dropdownBtn = document.getElementById('dropdown-btn');
const dropdownItems = document.querySelectorAll('.dropdown-item');
const batchSections = document.querySelectorAll('.batch-section');

if (dropdown && dropdownBtn) {
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            dropdownItems.forEach(i => i.classList.remove('active'));
            batchSections.forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            dropdownBtn.innerText = this.innerText;
            
            const targetCategory = this.getAttribute('data-year');
            const targetSection = document.getElementById('batch-' + targetCategory);
            
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            dropdown.classList.remove('open');
        });
    });
}

const mainHeader = document.querySelector('header');

if (mainHeader) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const quotes = document.querySelectorAll(".alumni-quote");

    quotes.forEach(quote => {
        if (quote.scrollHeight > quote.clientHeight) {
            const btn = document.createElement("button");
            btn.innerText = "View More";
            btn.className = "read-more-btn";

            btn.addEventListener("click", () => {
                quote.classList.toggle("expanded");
                btn.innerText = quote.classList.contains("expanded") ? "View Less" : "View More";
            });

            quote.parentNode.insertBefore(btn, quote.nextSibling);
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px 250px 0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
        observer.observe(el);
    });
    document.querySelectorAll('.scroll-reveal, .reveal-on-scroll').forEach((el) => {
        observer.observe(el);
    });
});

// Secret Background Preloader
window.addEventListener('load', function() {
    setTimeout(function() {
        const bentoImages = document.querySelectorAll('.bento-img-bg');
        
        bentoImages.forEach(img => {
            const secretLoader = new Image();
            secretLoader.src = img.src; 
        });
    }, 2500); 
});