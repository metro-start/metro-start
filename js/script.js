(() => {
    'use strict';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvases = [...document.querySelectorAll('.background__layer')];
    const track = document.querySelector('.slideshow__track');
    const pauseButton = document.getElementById('pause_bg');
    const palettes = [
        ['#151133', '#355ca8', '#e6447c'],
        ['#102f33', '#138b8c', '#b7d339'],
        ['#291339', '#77428c', '#e15465'],
        ['#17214a', '#336f91', '#63c5b5'],
    ];
    let backgroundIndex = 0;
    let activeCanvas = 0;
    let slideIndex = 0;
    let backgroundTimer;
    let slideTimer;
    let resizeTimer;
    let paused = reducedMotion.matches;
    const hexToRgb = hex => [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16));
    const mix = (a, b, amount) => a.map((value, index) => Math.round(value + (b[index] - value) * amount));

    const drawBackground = (canvas, palette) => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        const context = canvas.getContext('2d');
        context.scale(ratio, ratio);
        const colors = palette.map(hexToRgb);
        const size = Math.max(72, Math.min(150, width / 9));
        const columns = Math.ceil(width / size) + 2;
        const rows = Math.ceil(height / size) + 2;
        const points = Array.from({length: rows}, (_, row) => Array.from({length: columns}, (_, column) => ({
            x: (column - 1) * size + (row % 2 ? size / 2 : 0),
            y: (row - 1) * size,
        })));
        for (let row = 0; row < rows - 1; row++) {
            for (let column = 0; column < columns - 1; column++) {
                const triangles = row % 2
                    ? [[points[row][column], points[row + 1][column], points[row][column + 1]], [points[row][column + 1], points[row + 1][column], points[row + 1][column + 1]]]
                    : [[points[row][column], points[row + 1][column], points[row + 1][column + 1]], [points[row][column], points[row + 1][column + 1], points[row][column + 1]]];
                for (const triangle of triangles) {
                    const position = Math.min(1, Math.max(0, triangle[0].x / Math.max(width, 1)));
                    const band = position < .5 ? mix(colors[0], colors[1], position * 2) : mix(colors[1], colors[2], (position - .5) * 2);
                    const shade = .78 + Math.random() * .35;
                    context.fillStyle = `rgb(${band.map(value => Math.min(255, Math.round(value * shade))).join(' ')})`;
                    context.beginPath();
                    context.moveTo(triangle[0].x, triangle[0].y);
                    context.lineTo(triangle[1].x, triangle[1].y);
                    context.lineTo(triangle[2].x, triangle[2].y);
                    context.closePath();
                    context.fill();
                }
            }
        }
    };

    const advanceBackground = () => {
        backgroundIndex = (backgroundIndex + 1) % palettes.length;
        const nextCanvas = activeCanvas === 0 ? 1 : 0;
        drawBackground(canvases[nextCanvas], palettes[backgroundIndex]);
        canvases[nextCanvas].classList.add('background__layer--active');
        canvases[activeCanvas].classList.remove('background__layer--active');
        activeCanvas = nextCanvas;
    };
    const advanceSlide = () => {
        slideIndex = (slideIndex + 1) % 3;
        track.style.transform = `translateX(-${slideIndex * 33.3333}%)`;
    };
    const startBackground = () => {
        window.clearInterval(backgroundTimer);
        if (paused) return;
        backgroundTimer = window.setInterval(advanceBackground, 12000);
    };
    const startSlides = () => {
        window.clearInterval(slideTimer);
        if (reducedMotion.matches) return;
        slideTimer = window.setInterval(advanceSlide, 5000);
    };

    drawBackground(canvases[0], palettes[0]);
    drawBackground(canvases[1], palettes[1]);
    pauseButton.textContent = paused ? '(resume background)' : '(pause background)';
    pauseButton.setAttribute('aria-pressed', String(paused));
    startBackground();
    startSlides();
    pauseButton.addEventListener('click', () => {
        paused = !paused;
        pauseButton.textContent = paused ? '(resume background)' : '(pause background)';
        pauseButton.setAttribute('aria-pressed', String(paused));
        startBackground();
    });
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => drawBackground(canvases[activeCanvas], palettes[backgroundIndex]), 150);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.clearInterval(backgroundTimer);
            window.clearInterval(slideTimer);
        } else {
            startBackground();
            startSlides();
        }
    });
})();
