/* ASApps Games — Android "Get it on Google Play" smart banner.
   Android-only, dismissible (remembered), self-contained (injects its own CSS).
   iOS uses Apple's native Smart App Banner (apple-itunes-app meta), so this stays hidden there.

   This is a single site-wide "featured Android app" promo. It currently points to
   Sudoku No Pop-up Ads on every Android page. To feature a different app, edit the
   APP object below (id / name / icon) — nothing else. */
(function () {
    'use strict';

    // The featured Android app promoted across the whole site (see note above).
    var APP = {
        id: 'com.ASAppsGamesAU.sudoku',
        name: 'Sudoku No Pop-up Ads',
        icon: '/Images/sudoku/icon.webp?v=2'
    };

    var PLAY_URL = 'https://play.google.com/store/apps/details?id=' + APP.id;
    var STORAGE_KEY = 'asapps_gp_banner_dismissed';

    // Android phones/tablets only — never iOS (native banner) or desktop.
    var ua = navigator.userAgent || '';
    if (!/Android/i.test(ua)) return;

    // Game detail pages have their own sticky GET bar at the bottom — don't double up.
    if (document.querySelector('.ghero')) return;

    try { if (localStorage.getItem(STORAGE_KEY) === '1') return; } catch (e) { /* private mode: show anyway */ }

    function build() {
        if (document.getElementById('gp-smart-banner')) return;

        var css = document.createElement('style');
        css.textContent =
            '#gp-smart-banner{position:relative;z-index:200;box-sizing:border-box;width:100vw;overflow:hidden;' +
            'display:flex;align-items:center;gap:12px;' +
            'padding:9px 14px;background:rgba(12,11,17,.96);border-bottom:1px solid rgba(255,255,255,.10);' +
            'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
            'font-family:"Poppins",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
            'color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.35)}' +
            '#gp-smart-banner .gp-close{flex:0 0 auto;width:22px;height:22px;border:0;background:transparent;' +
            'color:rgba(255,255,255,.55);font-size:20px;line-height:1;cursor:pointer;padding:0;' +
            'display:flex;align-items:center;justify-content:center;border-radius:50%}' +
            '#gp-smart-banner .gp-close:hover{color:#fff;background:rgba(255,255,255,.10)}' +
            '#gp-smart-banner .gp-icon{flex:0 0 auto;width:44px;height:44px;border-radius:10px;object-fit:cover;' +
            'box-shadow:0 2px 6px rgba(0,0,0,.4)}' +
            '#gp-smart-banner .gp-text{flex:1 1 auto;min-width:0;line-height:1.25}' +
            '#gp-smart-banner .gp-title{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            '#gp-smart-banner .gp-sub{font-size:12px;color:rgba(255,255,255,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            '#gp-smart-banner .gp-cta{flex:0 0 auto;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.3px;' +
            'color:#fff;padding:8px 18px;border-radius:999px;background:linear-gradient(180deg,#01a971,#01875a);' +
            'box-shadow:0 3px 10px rgba(1,135,90,.4);white-space:nowrap}' +
            '#gp-smart-banner .gp-cta:active{transform:scale(.96)}' +
            '@keyframes gpSlideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}' +
            '@media(prefers-reduced-motion:no-preference){#gp-smart-banner{animation:gpSlideDown .28s ease}}';
        document.head.appendChild(css);

        var bar = document.createElement('div');
        bar.id = 'gp-smart-banner';
        bar.setAttribute('role', 'complementary');
        bar.setAttribute('aria-label', 'Get ' + APP.name + ' on Google Play');

        var close = document.createElement('button');
        close.className = 'gp-close';
        close.type = 'button';
        close.setAttribute('aria-label', 'Dismiss');
        close.innerHTML = '&times;';
        close.addEventListener('click', function () {
            bar.remove();
            try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
        });

        var icon = document.createElement('img');
        icon.className = 'gp-icon';
        icon.src = APP.icon;
        icon.alt = '';
        icon.width = 44;
        icon.height = 44;
        icon.loading = 'eager';

        var text = document.createElement('div');
        text.className = 'gp-text';
        var title = document.createElement('div');
        title.className = 'gp-title';
        title.textContent = APP.name;
        var sub = document.createElement('div');
        sub.className = 'gp-sub';
        sub.textContent = 'Free on Google Play';
        text.appendChild(title);
        text.appendChild(sub);

        var cta = document.createElement('a');
        cta.className = 'gp-cta';
        cta.href = PLAY_URL;
        cta.rel = 'noopener';
        cta.target = '_blank';
        cta.textContent = 'GET';

        bar.appendChild(close);
        bar.appendChild(icon);
        bar.appendChild(text);
        bar.appendChild(cta);

        document.body.insertBefore(bar, document.body.firstChild);
    }

    if (document.body) build();
    else document.addEventListener('DOMContentLoaded', build);
})();
