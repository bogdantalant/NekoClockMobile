(function() {
    const CONFIG = {
        storageKey: 'app-ui-scale',
        minScale: 0.5,
        maxScale: 5.0,
        defaultScale: 1.0,
        step: 0.01
    };

    let currentScale = parseFloat(localStorage.getItem(CONFIG.storageKey)) || CONFIG.defaultScale;
    let zoomInterval = null;
    let delayTimeout = null;

    function applyScale(save = true) {
        currentScale = Math.round(Math.min(Math.max(currentScale, CONFIG.minScale), CONFIG.maxScale) * 100) / 100;
        document.documentElement.style.setProperty('--ui-scale', currentScale);
        const zoomText = document.getElementById('zoom-value');
        if (zoomText) zoomText.textContent = `${Math.round(currentScale * 100)}%`;
        if (save) localStorage.setItem(CONFIG.storageKey, currentScale);
    }

    function triggerRotation(buttonElement, iconClass) {
        const icon = buttonElement.querySelector(iconClass);
        if (icon) {
            icon.classList.remove('rotate-animation');
            void icon.offsetWidth;
            icon.classList.add('rotate-animation');
        }
    }

    const startZoom = (delta) => {
        currentScale += delta;
        applyScale();
        delayTimeout = setTimeout(() => {
            zoomInterval = setInterval(() => {
                currentScale += delta;
                applyScale();
            }, 50);
        }, 400);
    };

    const stopZoom = () => {
        clearTimeout(delayTimeout);
        clearInterval(zoomInterval);
    };

    function setupEventListeners() {
        const ui = {
            in: document.getElementById('btn-zoom-in'),
            out: document.getElementById('btn-zoom-out'),
            reset: document.getElementById('btn-reset'),
            fs: document.getElementById('btn-fullscreen'),
            container: document.querySelector('.controls-container')
        };

        document.addEventListener('click', (e) => {
            if (ui.container && !e.target.closest('.controls-bar')) {
                ui.container.classList.toggle('hidden');
            }
        });

        [{ btn: ui.in, d: CONFIG.step }, { btn: ui.out, d: -CONFIG.step }].forEach(({ btn, d }) => {
            if (!btn) return;
            btn.addEventListener('mousedown', (e) => { if(e.button === 0) startZoom(d); });
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); startZoom(d); }, {passive: false});
        });

        window.addEventListener('mouseup', stopZoom);
        window.addEventListener('touchend', stopZoom);

        if (ui.reset) {
            ui.reset.onclick = (e) => { 
                e.stopPropagation(); 
                currentScale = CONFIG.defaultScale; 
                applyScale(); 
                triggerRotation(ui.reset, '.icon-reset'); 
            };
        }

        if (ui.fs) {
            ui.fs.onclick = (e) => { 
                e.stopPropagation(); 
                !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen(); 
            };
        }

        setTimeout(() => ui.container?.classList.add('visible'), 500);
    }

    window.addEventListener('DOMContentLoaded', () => {
        applyScale(false);
        setupEventListeners();
    });
})();