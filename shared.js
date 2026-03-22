/* Scroll to top on load */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* Loader */
document.body.style.overflow = 'hidden';
(function initLoader() {
    const fill = document.getElementById('ldFill');
    const pct = document.getElementById('ldPct');
    const loader = document.getElementById('loader');
    if (!fill || !pct || !loader) {
        document.body.style.overflow = '';
        return;
    }

    let progress = 0;
    const duration = 2200;
    const start = performance.now();

    function easeOutExpo(t) {
        return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
        const elapsed = now - start;
        const raw = Math.min(elapsed / duration, 1);
        progress = Math.round(easeOutExpo(raw) * 100);
        fill.style.width = progress + '%';
        pct.textContent = progress + '%';
        if (raw < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);

    window.addEventListener('load', () => {
        // Prepare audio
        window.welcomeAudio = new Audio();
        window.welcomeAudio.volume = 0.8;
        
        setTimeout(() => {
            fill.style.width = '100%';
            pct.textContent = '100%';
        }, 200);
        setTimeout(() => {
            loader.classList.add('out');
        }, 2400);
        setTimeout(() => {
            loader.classList.add('reveal');
            document.body.style.overflow = '';
            // Attempt to play audio on homepage only, not on menu page
            if (typeof playWelcomeVoice === 'function' && window.location.pathname.indexOf('menu.html') === -1) {
                playWelcomeVoice(localStorage.getItem('ildiz-lang') || 'uz');
            }
        }, 2900);
        setTimeout(() => {
            loader.classList.add('done');
        }, 3800);
    });
})();

/* Custom cursor */
const C = document.getElementById('c'),
    CR = document.getElementById('cr');

if (C && CR) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        C.style.left = mx + 'px';
        C.style.top = my + 'px';
    });

    (function tick() {
        rx += (mx - rx) * 0.1;
        ry += (my - ry) * 0.1;
        CR.style.left = rx + 'px';
        CR.style.top = ry + 'px';
        requestAnimationFrame(tick);
    })();

    function cursorBig() {
        CR.style.width = '60px';
        CR.style.height = '60px';
        CR.style.borderColor = 'rgba(250, 169, 84, 0.9)';
    }

    function cursorSmall() {
        CR.style.width = '40px';
        CR.style.height = '40px';
        CR.style.borderColor = 'rgba(250, 169, 84, 0.5)';
    }

    window.bindCursorHovers = function(root) {
        (root || document).querySelectorAll('a,button,.m-card,.h-card,.gallery-img').forEach(el => {
            el.addEventListener('mouseenter', cursorBig);
            el.addEventListener('mouseleave', cursorSmall);
        });
    };

    bindCursorHovers();

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.style.cursor = '';
        document.querySelectorAll('a,button,input,textarea').forEach(el => el.style.cursor = '');
        C.style.display = 'none';
        CR.style.display = 'none';
    }
}

/* Language switching and Audio */
let ildizLang = localStorage.getItem('ildiz-lang') || 'uz';

window.playWelcomeVoice = function(l) {
    if (!window.welcomeAudio) {
        window.welcomeAudio = new Audio();
        window.welcomeAudio.volume = 0.8;
    }
    
    // Stop current audio if playing
    window.welcomeAudio.pause();
    window.welcomeAudio.currentTime = 0;
    
    // Set correct source
    if (l === 'ru') {
        window.welcomeAudio.src = 'voice_rus.mp3';
    } else if (l === 'en') {
        window.welcomeAudio.src = 'voice_en.mp3';
    } else {
        window.welcomeAudio.src = 'voice_uzb.mp3'; // Default to UZ
    }
    
    // Play with catch for autoplay restrictions
    window.welcomeAudio.play().catch(e => {
        console.log("Autoplay blocked by browser. User interaction needed.", e);
    });
};

function sL(l) {
    ildizLang = l;
    localStorage.setItem('ildiz-lang', l);
    document.querySelectorAll('[data-l]').forEach(el =>
        el.classList.toggle('on', el.dataset.l === l)
    );
    document.querySelectorAll('.lb').forEach((b, i) =>
        b.classList.toggle('on', ['uz', 'ru', 'en'][i] === l)
    );
    document.documentElement.classList.toggle('lang-ru', l === 'ru');
    
    if (typeof onLangChange === 'function') onLangChange(l);
}

if (ildizLang !== 'uz') sL(ildizLang);
