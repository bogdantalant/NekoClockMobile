// controls.js
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
    let currentSpeed = 100;

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
            void icon.offsetWidth; // Триггер рефлоу для перезапуска анимации
            icon.classList.add('rotate-animation');
        }
    }

    const runAutoZoom = (delta) => {
        currentScale += delta;
        applyScale();
        currentSpeed = Math.max(10, currentSpeed - 5);
        zoomInterval = setTimeout(() => runAutoZoom(delta), currentSpeed);
    };

    const startZoom = (delta) => {
        currentScale += delta;
        applyScale();
        currentSpeed = 100;
        delayTimeout = setTimeout(() => runAutoZoom(delta), 400);
    };

    const stopZoom = () => {
        clearTimeout(delayTimeout);
        clearTimeout(zoomInterval);
    };

    function setupEventListeners() {
        const ui = {
            in: document.getElementById('btn-zoom-in'),
            out: document.getElementById('btn-zoom-out'),
            reset: document.getElementById('btn-reset'),
            settings: document.getElementById('btn-settings'),
            fs: document.getElementById('btn-fullscreen'),
            container: document.querySelector('.controls-container')
        };

        // Логика зума (нажатие и удержание)
        [{ btn: ui.in, d: CONFIG.step }, { btn: ui.out, d: -CONFIG.step }].forEach(({ btn, d }) => {
            if (!btn) return;
            btn.addEventListener('mousedown', (e) => { if(e.button === 0) startZoom(d); });
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); startZoom(d); }, {passive: false});
        });

        window.addEventListener('mouseup', stopZoom);
        window.addEventListener('touchend', stopZoom);

        // Сброс масштаба
        if (ui.reset) {
            ui.reset.onclick = () => {
                currentScale = CONFIG.defaultScale;
                applyScale();
                triggerRotation(ui.reset, '.icon-reset');
            };
        }

        // ОТКРЫТИЕ НАСТРОЕК
        if (ui.settings) {
            ui.settings.onclick = () => {
                triggerRotation(ui.settings, '.icon-settings');
                // Вызываем функцию из settings.js
                if (typeof window.toggleSettings === 'function') {
                    window.toggleSettings();
                } else {
                    console.log('Меню настроек еще не загружено');
                }
            };
        }

        // Полноэкранный режим
        if (ui.fs) {
            ui.fs.onclick = () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(()=>{});
                } else {
                    document.exitFullscreen();
                }
            };
        }

        // Скрытие/показ панели управления при клике по пустому месту
        document.addEventListener('click', (e) => {
            if (ui.container && !e.target.closest('.controls-bar')) {
                ui.container.classList.toggle('hidden');
            }
        });

        // Показываем панель с задержкой после загрузки
        setTimeout(() => ui.container?.classList.add('visible'), 500);
    }

    window.addEventListener('DOMContentLoaded', () => {
        applyScale(false);
        setupEventListeners();
    });
})();