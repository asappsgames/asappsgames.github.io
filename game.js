/* ASApps Games — game detail page script (gallery + mobile menu + reveal) */
document.addEventListener('DOMContentLoaded', function () {

    /* --- Screenshot gallery: auto-discover screenshots, build device-framed strip --- */
    document.querySelectorAll('.game-slider').forEach(function (slider) {
        var folder = slider.dataset.game;
        if (!folder) return;
        var nav = slider.querySelector('.slider-nav');
        var index = 1;

        function add(path) {
            var container = document.createElement('div');
            container.className = 'screenshot-container';
            var img = document.createElement('img');
            img.src = path;
            img.alt = folder.replace('-', ' ') + ' gameplay screenshot';
            img.className = 'game-screenshot';
            img.loading = 'lazy';
            container.appendChild(img);
            if (nav) slider.insertBefore(container, nav); else slider.appendChild(container);
        }

        function probe() {
            var test = new Image();
            var path = '../Images/' + folder + '/screenshot' + index + '.png';
            test.onload = function () { add(path); index++; probe(); };
            test.onerror = function () { /* stop at first missing */ };
            test.src = path;
        }
        probe();
    });

    /* --- Mobile hamburger menu --- */
    var hamburger = document.querySelector('.hamburger');
    var navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        var overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);

        function close() {
            navLinks.classList.remove('is-open');
            hamburger.classList.remove('is-active');
            hamburger.setAttribute('aria-expanded', 'false');
            overlay.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
        hamburger.addEventListener('click', function () {
            var open = navLinks.classList.toggle('is-open');
            hamburger.classList.toggle('is-active', open);
            hamburger.setAttribute('aria-expanded', open);
            overlay.classList.toggle('is-visible', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });
        overlay.addEventListener('click', close);
        navLinks.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }

    /* --- Scroll reveal (reduced-motion aware, no-JS safe) --- */
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reveal-on');
        var targets = document.querySelectorAll('.game-detail-container, .game-detail-cta, .more-games');
        targets.forEach(function (el) { el.classList.add('animate-on-scroll'); });
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
        }, { threshold: 0.06, rootMargin: '0px 0px 60px 0px' });
        targets.forEach(function (el) { io.observe(el); });
    }
});
