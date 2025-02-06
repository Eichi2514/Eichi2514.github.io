window.onerror = function() {
    window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
    return true;
};

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateVh() {
    const vh = window.innerHeight * 0.01;
    const vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
}

updateVh();

window.addEventListener('resize', updateVh);

$(document).ready(function () {
    const slime = $('.restricted_slime');
    let Xcode1 = 10;
    let Ycode1 = 0;

    function moveSlime() {
        let Xcode2 = getRandom(0, 99);
        let Ycode2 = getRandom(0, 89);

        if (Xcode2 > Ycode2) {
            if (Ycode1 !== 0) Ycode2 = (Math.random() < 0.5) ? 0 : 89;
            else Xcode2 = (Math.random() < 0.5) ? 0 : 99;
        } else {
            if (Xcode1 !== 10) Xcode2 = (Math.random() < 0.5) ? 0 : 99;
            else Ycode2 = (Math.random() < 0.5) ? 0 : 89;
        }

        Xcode1 = Xcode2;
        Ycode1 = Ycode2;

        let Sin = Xcode1 === 0 ? '0' : `calc(${Xcode1}vw - calc(var(--vh) * 10))`;

        slime.css({
            'left': Sin,
            'top': `${Ycode1}vh`,
            'animation': 'spin 10s infinite linear'
        });
    }

    moveSlime();
    setInterval(moveSlime, 5000);
});