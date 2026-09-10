(() => {
    'use strict';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const track = document.querySelector('.slideshow__track');
    const canvas = document.getElementById('background_canvas');

    // --------------------------------------------------------------------- log
    // Set localStorage.setItem('metro-start:debug', '0') (or run
    // log.level = 'silent') to quieten this; 'debug' is the default because the
    // background is randomised per load and is otherwise hard to reason about.
    const log = {
        level: (() => {
            try {
                return window.localStorage.getItem('metro-start:debug') || 'debug';
            } catch (error) {
                return 'debug';
            }
        })(),
        tag: '[metro-start:bg]',
        enabled(kind) {
            const order = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
            return (order[kind] ?? 4) <= (order[this.level] ?? 4);
        },
        emit(kind, message, ...rest) {
            if (!this.enabled(kind)) return;
            const method = kind === 'debug' ? 'log' : kind;
            const label = `${this.tag} ${kind.toUpperCase().padEnd(5)}`;
            (console[method] || console.log)(label, message, ...rest);
        },
        debug(message, ...rest) { this.emit('debug', message, ...rest); },
        info(message, ...rest) { this.emit('info', message, ...rest); },
        warn(message, ...rest) { this.emit('warn', message, ...rest); },
        error(message, ...rest) { this.emit('error', message, ...rest); },
        group(label) { if (this.enabled('debug')) console.groupCollapsed(`${this.tag} ${label}`); },
        groupEnd() { if (this.enabled('debug')) console.groupEnd(); },
    };
    window.metroStartBackground = { log, palettes: null, lastRender: null };

    // ---------------------------------------------------------------- palettes
    // A fresh Trianglify mesh is generated on every page load: random cell size,
    // random variance, and one of these palettes. Each palette runs light ->
    // dark, matching the way Trianglify shades a mesh (lightest corner to
    // darkest), and stays inside one or two adjacent hues so nothing clashes.
    //
    // Most palettes lead with a pastel. That is safe because the page sets a
    // dark text shadow (see --text-shadow in css/main.css), which carries the
    // contrast for white text over even the brightest cell.
    // tools/check-palettes.js verifies both facts against the real vendored
    // Trianglify colour maths.
    const palettes = [
        ['#b8a9e8', '#5f4a9e', '#33285c', '#171430'],   // lavender
        ['#a9c8e8', '#41729e', '#26415c', '#141d30'],   // periwinkle
        ['#b5d6b0', '#4a7d5c', '#2a4a38', '#141f1a'],   // sage
        ['#e8b8c8', '#9e5a72', '#5c3446', '#241521'],   // blush
        ['#a8d8d0', '#3f8a84', '#275654', '#121f22'],   // sea glass
        ['#f0cba8', '#b07a4a', '#6b4526', '#2a1a10'],   // sand
        ['#c8d8a8', '#6b8a4a', '#3f5528', '#1a2013'],   // pistachio
        ['#d8b8e0', '#8a5f9e', '#4f3460', '#1e1428'],   // lilac
    ];
    window.metroStartBackground.palettes = palettes;

    const pick = list => list[Math.floor(Math.random() * list.length)];
    const round = (value, places = 2) => Number(value.toFixed(places));

    // ------------------------------------------------------------------ render
    let renderCount = 0;

    const drawBackground = (reason = 'initial') => {
        const started = performance.now();
        const index = Math.floor(Math.random() * palettes.length);
        const palette = palettes[index];
        // Trianglify's `scaling: 'auto'` multiplies the canvas backing store by
        // devicePixelRatio for us and pins the CSS size to these logical
        // dimensions, so we must pass logical pixels here, not device pixels.
        const width = Math.max(window.innerWidth, 1);
        const height = Math.max(window.innerHeight, 1);
        const cellSize = 55 + Math.random() * 105;
        const variance = 0.55 + Math.random() * 0.5;
        const options = {
            width,
            height,
            // No seed, so Trianglify generates a fresh mesh every time.
            cellSize,
            variance,
            xColors: palette,
        };

        log.group(`render #${++renderCount} (${reason})`);
        log.debug('viewport', {
            innerWidth: width,
            innerHeight: height,
            devicePixelRatio: window.devicePixelRatio,
            scaling: 'auto (trianglify applies devicePixelRatio)',
        });
        log.info(`palette ${index + 1}/${palettes.length}`, {
            name: palette[0],
            stops: palette.join(' -> '),
            lightEnd: palette[0],
            darkEnd: palette[palette.length - 1],
        });
        log.debug('trianglify options', {
            width: options.width,
            height: options.height,
            cellSize: round(cellSize),
            variance: round(variance),
            seed: null,
        });

        if (typeof window.trianglify !== 'function') {
            log.error('window.trianglify is not available - is js/trianglify.bundle.js loaded before this script?');
            log.groupEnd();
            return;
        }

        try {
            const pattern = window.trianglify(options);
            const polys = pattern && pattern.polys ? pattern.polys.length : 0;
            log.debug(`mesh built: ${polys} triangles`);

            const rendered = pattern.toCanvas(canvas);
            if (!rendered) {
                log.error('toCanvas returned nothing');
                log.groupEnd();
                return;
            }

            // The backing store should be the logical size times the ratio
            // Trianglify chose; anything else means the canvas is misconfigured.
            const expectedRatio = Math.min(window.devicePixelRatio || 1, 2);
            const expectedWidth = Math.round(width * expectedRatio);
            if (canvas.width !== expectedWidth) {
                log.warn('canvas backing store is not the expected size', {
                    expected: `${expectedWidth}x${Math.round(height * expectedRatio)}`,
                    actual: `${canvas.width}x${canvas.height}`,
                    devicePixelRatio: window.devicePixelRatio,
                });
            }

            const elapsed = performance.now() - started;
            window.metroStartBackground.lastRender = {
                reason,
                palette: index,
                cellSize: round(cellSize),
                variance: round(variance),
                triangles: polys,
                logicalWidth: width,
                logicalHeight: height,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                elapsedMs: round(elapsed, 1),
            };
            log.info(`rendered in ${round(elapsed, 1)}ms`, {
                canvas: `${canvas.width}x${canvas.height}`,
                css: `${width}x${height}`,
                triangles: polys,
                trianglesPerMs: elapsed > 0 ? round(polys / elapsed, 2) : 'n/a',
            });
        } catch (error) {
            log.error('failed to render background', error);
        }
        log.groupEnd();
    };

    // --------------------------------------------------------------- slideshow
    let slideIndex = 0;
    let slideTimer;
    let resizeTimer;
    const advanceSlide = () => {
        slideIndex = (slideIndex + 1) % 3;
        log.debug(`slideshow -> index ${slideIndex}`);
        track.style.transform = `translateX(-${slideIndex * 33.3333}%)`;
    };
    const startSlides = () => {
        window.clearInterval(slideTimer);
        if (reducedMotion.matches) {
            log.info('slideshow paused: prefers-reduced-motion is set');
            return;
        }
        slideTimer = window.setInterval(advanceSlide, 5000);
        log.debug('slideshow timer started (5000ms)');
    };

    log.info('background initialising', {
        level: log.level,
        palettes: palettes.length,
        reducedMotion: reducedMotion.matches,
        trianglify: typeof window.trianglify,
    });
    if (typeof window.trianglify !== 'function') {
        log.error('trianglify bundle missing; check the script order in index.html');
    }
    drawBackground('initial');
    startSlides();

    window.addEventListener('resize', () => {
        log.debug('resize observed; regenerating shortly', {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
        });
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => drawBackground('resize'), 150);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            log.debug('tab hidden; stopping the slideshow timer');
            window.clearInterval(slideTimer);
        } else {
            log.debug('tab visible; restarting the slideshow timer');
            startSlides();
        }
    });

    reducedMotion.addEventListener('change', event => {
        log.info(`prefers-reduced-motion changed to ${event.matches}`);
        startSlides();
    });
})();
