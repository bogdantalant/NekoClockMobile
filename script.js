let previousTime = { hours: '', minutes: '' };
let wakeLock = null;
let timeoutId = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock active');
            
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
            });
        }
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
    }
});

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    if (hours !== previousTime.hours || minutes !== previousTime.minutes) {
        updateDigit('hour-tens', hours[0], previousTime.hours[0] !== hours[0]);
        updateDigit('hour-ones', hours[1], previousTime.hours[1] !== hours[1]);
        updateDigit('minute-tens', minutes[0], previousTime.minutes[0] !== minutes[0]);
        updateDigit('minute-ones', minutes[1], previousTime.minutes[1] !== minutes[1]);
        previousTime = { hours, minutes };
    }

    const delay = (60 - seconds) * 1000 - milliseconds;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => updateClock(), delay - 10);
}

function updateDigit(elementId, newDigit, hasChanged) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.style.backgroundImage = `url('images/${newDigit}.gif')`;
    if (hasChanged) {
        element.classList.remove('changed');
        void element.offsetWidth; 
        element.classList.add('changed');
    }
}

function initClock() {
    const clockContainer = document.querySelector('.clock');
    const wrapper = document.querySelector('.clock-wrapper');
    if (!clockContainer) return;

    if (!document.getElementById('separator')) {
        const separator = document.createElement('div');
        separator.className = 'digit';
        separator.id = 'separator';
        separator.style.backgroundImage = "url('images/sep.gif')";
        clockContainer.insertBefore(separator, document.getElementById('hour-ones').nextSibling);
    }

    const now = new Date();
    previousTime.hours = now.getHours().toString().padStart(2, '0');
    previousTime.minutes = now.getMinutes().toString().padStart(2, '0');
    
    updateDigit('hour-tens', previousTime.hours[0], false);
    updateDigit('hour-ones', previousTime.hours[1], false);
    updateDigit('minute-tens', previousTime.minutes[0], false);
    updateDigit('minute-ones', previousTime.minutes[1], false);

    setTimeout(() => {
        if (wrapper) wrapper.classList.add('loaded');
    }, 150);

    updateClock();
    document.addEventListener('click', requestWakeLock, { once: true });
}

window.addEventListener('load', initClock);