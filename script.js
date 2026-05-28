document.addEventListener("DOMContentLoaded", function() {
    const content = document.getElementById('pres-text-content');
    const btn = document.getElementById('read-more-btn');

    if (!content || !btn) return;

    if (content.scrollHeight <= content.clientHeight) {
        btn.style.display = 'none';
    }

    btn.addEventListener('click', function(e) {
        e.preventDefault();
        content.classList.toggle('expanded');
        btn.textContent = content.classList.contains('expanded') ? 'Show Less' : 'View Full Message';
    });

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (hamburgerBtn && mobileNav) {
        // 1. Toggle the menu open/closed when button is clicked
        hamburgerBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
        });

        // 2. Automatically close the menu when a link is clicked
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
            });
        });
    }
});

