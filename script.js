document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.game-slider');
    
    sliders.forEach(async slider => {
        const gameFolder = slider.dataset.game;
        const screenshots = [];
        let currentIndex = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        // Function to check if an image exists
        async function imageExists(url) {
            try {
                const img = new Image();
                img.src = url;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                return true;
            } catch {
                return false;
            }
        }

        // Function to find all available screenshots
        async function findScreenshots() {
            let index = 1;
            while (true) {
                const imagePath = `/Images/${gameFolder}/screenshot${index}.png`;
                if (await imageExists(imagePath)) {
                    screenshots.push({
                        path: imagePath,
                        number: index
                    });
                    index++;
                } else {
                    break;
                }
            }
            // Sort screenshots by number
            screenshots.sort((a, b) => a.number - b.number);
            initializeSlider();
        }

        // Function to create screenshot elements
        function initializeSlider() {
            // Create screenshot containers
            screenshots.forEach((screenshot, index) => {
                const container = document.createElement('div');
                container.className = `screenshot-container ${index === 0 ? 'active' : ''}`;
                const img = document.createElement('img');
                img.src = screenshot.path;
                img.alt = `${gameFolder} Gameplay`;
                img.className = 'game-screenshot';
                img.loading = 'lazy';
                container.appendChild(img);
                slider.insertBefore(container, slider.querySelector('.slider-nav'));
            });

            // Create navigation dots
            const nav = slider.querySelector('.slider-nav');
            screenshots.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                nav.appendChild(dot);
            });

            // Add click events to dots and touch events for swipe
            if (window.innerWidth < 769) {
                // Dot navigation
                const dots = slider.querySelectorAll('.slider-dot');
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        currentIndex = index;
                        updateSlider();
                    });
                });

                // Touch events for swipe
                slider.addEventListener('touchstart', (e) => {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                });

                slider.addEventListener('touchmove', (e) => {
                    touchEndX = e.touches[0].clientX;
                    touchEndY = e.touches[0].clientY;

                    // Calculate horizontal and vertical distance
                    const deltaX = Math.abs(touchEndX - touchStartX);
                    const deltaY = Math.abs(touchEndY - touchStartY);

                    // If horizontal swipe is more prominent than vertical scroll
                    if (deltaX > deltaY && deltaX > 10) {
                        e.preventDefault(); // Prevent scrolling only during horizontal swipes
                    }
                });

                slider.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].clientX;
                    touchEndY = e.changedTouches[0].clientY;
                    handleSwipe();
                });

                // Auto-slide every 5 seconds on mobile
                setInterval(() => {
                    if (window.innerWidth < 769) {
                        currentIndex = (currentIndex + 1) % screenshots.length;
                        updateSlider();
                    }
                }, 5000);
            }
        }

        // Function to handle swipe
        function handleSwipe() {
            const swipeThreshold = 50; // Minimum swipe distance
            const deltaX = touchEndX - touchStartX;
            const deltaY = Math.abs(touchEndY - touchStartY);

            // Only handle horizontal swipes that are more significant than vertical movement
            if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > deltaY) {
                if (deltaX > 0) {
                    // Swipe right - go to previous
                    currentIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
                } else {
                    // Swipe left - go to next
                    currentIndex = (currentIndex + 1) % screenshots.length;
                }
                updateSlider();
            }
        }

        // Function to update slider state
        function updateSlider() {
            const containers = slider.querySelectorAll('.screenshot-container');
            const dots = slider.querySelectorAll('.slider-dot');

            containers.forEach((container, index) => {
                if (index === currentIndex) {
                    container.classList.add('active');
                } else {
                    container.classList.remove('active');
                }
            });

            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Start initialization
        await findScreenshots();
    });
});

// --- Scroll Animations ---
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.game-card, .contact-container, .privacy-container, .game-detail-container');

    animatedElements.forEach(function(el) {
        el.classList.add('animate-on-scroll');
    });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px 80px 0px'
    });

    animatedElements.forEach(function(el) {
        observer.observe(el);
    });
});

// --- Mobile Hamburger Menu ---
document.addEventListener('DOMContentLoaded', function() {
    var hamburger = document.querySelector('.hamburger');
    var navLinks = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    // Create overlay element
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function toggleMenu() {
        var isOpen = navLinks.classList.toggle('is-open');
        hamburger.classList.toggle('is-active');
        hamburger.setAttribute('aria-expanded', isOpen);
        overlay.classList.toggle('is-visible');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        overlay.classList.remove('is-visible');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    // Close on link click
    navLinks.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeMenu();
    });
});

// --- Cursor Glow + Card Tilt (desktop only) ---
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth < 769 || 'ontouchstart' in window) return;

    var cursorGlow = document.getElementById('cursorGlow');
    var cards = document.querySelectorAll('.game-card');
    var mouseX = 0;
    var mouseY = 0;
    var glowX = 0;
    var glowY = 0;
    var rafId = null;

    // Smooth cursor glow with lerp
    function updateGlow() {
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        rafId = requestAnimationFrame(updateGlow);
    }

    // --- Particle Trail ---
    var POOL_SIZE = 50;
    var pool = [];
    var poolIndex = 0;
    var lastTrailX = 0;
    var lastTrailY = 0;
    var prevTrailX = 0;
    var prevTrailY = 0;
    var trailColors = [
        'rgba(0, 102, 255, 0.5)',
        'rgba(60, 130, 255, 0.45)',
        'rgba(128, 0, 255, 0.4)',
        'rgba(100, 60, 255, 0.45)',
        'rgba(0, 170, 255, 0.4)'
    ];

    // Pre-create particle elements
    for (var i = 0; i < POOL_SIZE; i++) {
        var p = document.createElement('div');
        p.className = 'trail-particle';
        p.style.display = 'none';
        document.body.appendChild(p);
        pool.push(p);
    }

    function spawnParticle(x, y, vx, vy) {
        var p = pool[poolIndex];
        poolIndex = (poolIndex + 1) % POOL_SIZE;

        var size = 3 + Math.random() * 5;
        var color = trailColors[Math.floor(Math.random() * trailColors.length)];
        var duration = 0.6 + Math.random() * 0.6;
        // Slight random spread perpendicular to movement
        var spread = (Math.random() - 0.5) * 20;
        var dx = vx * -8 + spread;
        var dy = vy * -8 + spread;

        p.style.display = 'block';
        p.style.left = x - size / 2 + 'px';
        p.style.top = y - size / 2 + 'px';
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.background = color;
        p.style.setProperty('--trail-color', color);
        p.style.setProperty('--trail-duration', duration + 's');
        p.style.setProperty('--trail-dx', dx + 'px');
        p.style.setProperty('--trail-dy', dy + 'px');
        // Restart animation
        p.style.animation = 'none';
        p.offsetHeight; // force reflow
        p.style.animation = '';

        // Hide after animation ends
        setTimeout(function() { p.style.display = 'none'; }, duration * 1000);
    }

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!cursorGlow.classList.contains('is-active')) {
            cursorGlow.classList.add('is-active');
        }

        // Spawn trail particles at distance intervals
        var dx = mouseX - lastTrailX;
        var dy = mouseY - lastTrailY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 12) {
            // Velocity direction (normalized)
            var vx = dx / dist;
            var vy = dy / dist;
            spawnParticle(mouseX, mouseY, vx, vy);
            // Occasionally spawn an extra particle for density
            if (dist > 30 && Math.random() > 0.4) {
                spawnParticle(
                    mouseX - dx * 0.4 + (Math.random() - 0.5) * 6,
                    mouseY - dy * 0.4 + (Math.random() - 0.5) * 6,
                    vx, vy
                );
            }
            lastTrailX = mouseX;
            lastTrailY = mouseY;
        }
    });

    document.addEventListener('mouseleave', function() {
        cursorGlow.classList.remove('is-active');
    });

    rafId = requestAnimationFrame(updateGlow);

    // Card tilt + shine effect (desktop only)
    cards.forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;

            // Tilt: max 4 degrees
            var rotateX = ((y - centerY) / centerY) * -4;
            var rotateY = ((x - centerX) / centerX) * 4;

            card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
            card.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';

            // Update shine/glow position via CSS custom properties
            var percentX = (x / rect.width) * 100;
            var percentY = (y / rect.height) * 100;
            card.style.setProperty('--mouse-x', percentX + '%');
            card.style.setProperty('--mouse-y', percentY + '%');
        });

        card.addEventListener('mouseleave', function() {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease, border-color 0.5s ease';
            card.style.removeProperty('--mouse-x');
            card.style.removeProperty('--mouse-y');
        });
    });
});

// --- Back to Top Button ---
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            btn.classList.add('is-visible');
        } else {
            btn.classList.remove('is-visible');
        }
    });

    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// --- Animated Stats Counter ---
document.addEventListener('DOMContentLoaded', function() {
    var statsSection = document.querySelector('.hero-stats');
    if (!statsSection) return;

    var animated = false;

    function animateCounter(el) {
        var target = parseFloat(el.dataset.target);
        var decimals = parseInt(el.dataset.decimals) || 0;
        var duration = 1500;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = start + (target - start) * eased;
            el.textContent = current.toFixed(decimals);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toFixed(decimals);
            }
        }

        requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !animated) {
                animated = true;
                var counters = statsSection.querySelectorAll('.stat-number');
                counters.forEach(function(counter) {
                    animateCounter(counter);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
});

// --- Star Rating Rounding ---
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.stars').forEach(function(starsEl) {
        var rating = parseFloat(starsEl.dataset.rating);
        var rounded = Math.round(rating);
        var stars = starsEl.querySelectorAll('svg');
        stars.forEach(function(star, index) {
            if (index < rounded) {
                star.classList.remove('star-partial');
            } else {
                star.classList.add('star-partial');
            }
        });
    });
});

// --- Clickable Game Cards ---
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.game-card').forEach(function(card) {
        var titleLink = card.querySelector('.game-title a');
        if (!titleLink) return;
        var href = titleLink.getAttribute('href');
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            if (e.target.closest('a, button')) return;
            document.body.classList.remove('page-transition-in');
            document.body.classList.add('page-transition-out');
            setTimeout(function() {
                window.location.href = href;
            }, 350);
        });
    });
});

// --- Page Transitions ---
document.addEventListener('DOMContentLoaded', function() {
    // Only intercept internal navigation links (not hash links or external)
    var links = document.querySelectorAll('a[href]');
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            var href = link.getAttribute('href');
            // Skip hash links, external links, mailto, tel, javascript
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('http')) return;

            e.preventDefault();
            document.body.classList.remove('page-transition-in');
            document.body.classList.add('page-transition-out');

            setTimeout(function() {
                window.location.href = href;
            }, 350);
        });
    });
});

// --- Back Button Fix (bfcache) ---
window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
        document.body.classList.remove('page-transition-out');
        document.body.classList.add('page-transition-in');
    }
});