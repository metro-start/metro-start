(() => {
    'use strict';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const palettes = [['#438b73', '#443563'], ['#315d81', '#50364b'], ['#866a35', '#264f4a'], ['#624c80', '#315f59']];
    const layers = [...document.querySelectorAll('.ambient__layer')];
    let paletteIndex = 0;
    let activeLayer = 0;
    const paintLayer = (layer, palette) => {
        layer.style.setProperty('--ambient-a', palette[0]);
        layer.style.setProperty('--ambient-b', palette[1]);
    };
    if (layers.length === 2) {
        paintLayer(layers[0], palettes[0]);
        paintLayer(layers[1], palettes[1]);
        if (!reducedMotion.matches) window.setInterval(() => {
            paletteIndex = (paletteIndex + 1) % palettes.length;
            const nextLayer = activeLayer === 0 ? 1 : 0;
            paintLayer(layers[nextLayer], palettes[paletteIndex]);
            layers[nextLayer].classList.add('ambient__layer--active');
            layers[activeLayer].classList.remove('ambient__layer--active');
            activeLayer = nextLayer;
        }, 14000);
    }
    const slides = [...document.querySelectorAll('.slide')];
    const indicators = [...document.querySelectorAll('.carousel__progress span')];
    let slideIndex = 0;
    let rotation;
    const showSlide = (index) => {
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, position) => slide.classList.toggle('slide--active', position === slideIndex));
        indicators.forEach((indicator, position) => indicator.classList.toggle('active', position === slideIndex));
    };
    const startRotation = () => {
        if (!reducedMotion.matches && slides.length > 1) {
            window.clearInterval(rotation);
            rotation = window.setInterval(() => showSlide(slideIndex + 1), 8000);
        }
    };
    document.querySelector('[data-carousel="previous"]')?.addEventListener('click', () => { showSlide(slideIndex - 1); startRotation(); });
    document.querySelector('[data-carousel="next"]')?.addEventListener('click', () => { showSlide(slideIndex + 1); startRotation(); });
    showSlide(0);
    startRotation();
    document.addEventListener('visibilitychange', () => document.hidden ? window.clearInterval(rotation) : startRotation());
    const year = document.querySelector('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
})();
