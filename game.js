/* ASApps Games — game detail page script (gallery + mobile menu + reveal) */
document.addEventListener('DOMContentLoaded', function () {

    /* --- Screenshot gallery: build device-framed strip ---
       The first screenshot is static HTML (so it is the LCP image and reserves its
       space — no layout shift). data-count says how many exist, so the rest are added
       without probing for a missing file (no 404 in the console). Falls back to
       probing when data-count is absent. --- */
    document.querySelectorAll('.game-slider').forEach(function (slider) {
        var folder = slider.dataset.game;
        if (!folder) return;
        var nav = slider.querySelector('.slider-nav');
        var count = parseInt(slider.dataset.count, 10) || 0;
        var index = slider.querySelectorAll('.screenshot-container').length + 1;
        var titleEl = document.querySelector('.game-detail-header h1');
        var label = titleEl ? titleEl.textContent.trim() : folder.replace(/-/g, ' ');

        function pathFor(i) { return '/Images/' + folder + '/screenshot' + i + '.webp?v=2'; }

        function add(path, i) {
            var container = document.createElement('div');
            container.className = 'screenshot-container';
            var img = document.createElement('img');
            img.src = path;
            img.alt = label + ' gameplay screenshot ' + i;
            img.className = 'game-screenshot';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.width = 640;
            img.height = (folder === 'solitaire' || folder === 'blocks') ? 1391 : 1385;
            container.appendChild(img);
            if (nav) slider.insertBefore(container, nav); else slider.appendChild(container);
        }

        function probe() {
            var test = new Image();
            var path = pathFor(index);
            test.onload = function () { add(path, index); index++; probe(); };
            test.onerror = function () { /* stop at first missing */ };
            test.src = path;
        }

        if (count) { for (; index <= count; index++) add(pathFor(index), index); }
        else probe();
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


    /* --- Mobile bottom bar: install bar on game pages, tab bar elsewhere --- */
    (function () {
        if (document.querySelector('.tabs,.installbar')) return;
        var accent = document.body.getAttribute('data-accent');
        var badges = document.querySelector('.store-badges a, .app-store-button');
        var titleEl = document.querySelector('.game-detail-header h1');

        if (accent && badges && titleEl) {
            // game detail page -> sticky install bar for THIS game
            var icon = document.querySelector('.game-detail-icon');
            var bar = document.createElement('div');
            bar.className = 'installbar';
            var img = document.createElement('img');
            img.src = icon ? icon.getAttribute('src') : '/Images/common/icon-192.png';
            img.alt = '';
            img.width = 42; img.height = 42; img.loading = 'eager';
            var t = document.createElement('div');
            t.className = 't';
            var b = document.createElement('b');
            b.textContent = titleEl.textContent.trim();
            var sp = document.createElement('span');
            sp.textContent = 'Free · No pop-up ads';
            t.appendChild(b); t.appendChild(sp);
            var get = document.createElement('a');
            get.className = 'get';
            get.textContent = 'GET';
            get.href = badges.getAttribute('href');
            get.rel = 'noopener'; get.target = '_blank';
            bar.appendChild(img); bar.appendChild(t); bar.appendChild(get);
            document.body.appendChild(bar);
            document.body.classList.add('has-installbar');
        } else {
            // every other page -> persistent tab bar
            var items = [
                { i: '\uD83E\uDDE9', l: 'Games', h: '/' },
                { i: '\uD83D\uDCD6', l: 'Guides', h: '/guides/' },
                { i: '\u2139\uFE0F', l: 'About', h: '/about/' },
                { i: '\u2709\uFE0F', l: 'Contact', h: '/contact.html' }
            ];
            var nav = document.createElement('nav');
            nav.className = 'tabs';
            nav.setAttribute('aria-label', 'Primary');
            var here = location.pathname.replace(/\/$/, '') || '/';
            items.forEach(function (it) {
                var a = document.createElement('a');
                a.className = 'tab' + (here === it.h.replace(/\/$/, '') ? ' on' : '');
                a.href = it.h;
                var ic = document.createElement('i'); ic.textContent = it.i;
                a.appendChild(ic); a.appendChild(document.createTextNode(it.l));
                nav.appendChild(a);
            });
            document.body.appendChild(nav);
        }
    })();

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
