import styles from './styles';
import util from './util';
import defaults from './defaults';

// Lazy-load heavy color/graphics libraries when needed to reduce initial bundle size
let _tinycolor = null;
let _trianglify = null;
const getTinycolor = async () => {
    if (!_tinycolor) {
        const mod = await import('tinycolor2');
        _tinycolor = mod.default || mod;
    }
    return _tinycolor;
};
const getTrianglify = async () => {
    if (!_trianglify) {
        const mod = await import('trianglify');
        _trianglify = mod.default || mod;
    }
    return _trianglify;
};

export default {
    init() {},

    animate(selector, styles, duration) {
        if (!duration) {
            return;
        }

        document.querySelectorAll(selector).forEach((element) => {
            const computed = getComputedStyle(element);
            const from = Object.fromEntries(
                Object.keys(styles).map((property) => [
                    property,
                    computed.getPropertyValue(property),
                ])
            );
            element.animate([from, styles], {
                duration,
                easing: 'linear',
            });
        });
    },

    /**
     * Changes the style to whatever is in the scope.
     *
     * @param {any} newTheme: The new theme to change to.
     * @param {any} oldTheme: The old theme to change from.
     * @param {any} transition: A bool indicating whether to slowly transition or immediately change.
     * @return {any} The upgrade and applied theme.
     */
    updateTheme(newTheme, oldTheme, transition) {
        const duration = transition === true ? 800 : 0;
        const theme = util.upgradeTheme(newTheme, defaults.defaultTheme);

        if (theme.title === 'randomize') {
            theme.themeContent['background-chooser'] = util.randomize([
                'none',
                'trianglify',
            ]);
            theme.themeContent['trivariance-chooser'] = util.randomize([
                'uniform',
                'bent',
                'freeform',
            ]);
            theme.themeContent['trisize-chooser'] = util.randomize([
                'small',
                'medium',
                'large',
                'yuge',
            ]);
            theme.themeContent['tristyle-chooser'] = util.randomize([
                'triad',
                'tetrad',
                'monochromatic',
                'split complements',
            ]);

            // Use lazy tinycolor
            getTinycolor().then((tinycolor) => {
                theme.themeContent.mainColor = tinycolor.random().toHexString();
                theme.themeContent.baseColor = tinycolor.random().toHexString();
                theme.themeContent.titleColor = tinycolor
                    .random()
                    .toHexString();
                theme.themeContent.optionsColor = tinycolor
                    .random()
                    .toHexString();
                theme.themeContent.backgroundColor = tinycolor
                    .random()
                    .toHexString();
            }).catch((e) => { util.error(`Could not load tinycolor: ${  e}`); });

            theme.themeContent['font-chooser'] = util.randomize(
                defaults.defaultFonts
            );
            theme.themeContent['fontfamily-chooser'] = util.randomize(
                defaults.defaultFonts
            );
            theme.themeContent['fontweight-chooser'] = util.randomize([
                'normal',
                'bold',
            ]);
            theme.themeContent['fontvariant-chooser'] = util.randomize([
                'normal',
                'small-caps',
            ]);
        }

        this.clearJss(oldTheme);
        this.updateFont(theme, oldTheme);
        this.updateBackground(theme, oldTheme, duration);
        this.updateMainColor(theme, oldTheme, duration);
        this.updateTitleColor(theme, oldTheme, duration);
        this.updateOptionsColor(theme, oldTheme, duration);

        return theme;
    },

    /**
     * Updates the current background to a new random one.
     */
    updateRandomBackground() {
        // Lazy load trianglify
        getTrianglify().then((trianglify) => {
            const bodyPattern = trianglify({
                width: window.innerWidth,
                height: window.innerHeight,
                cellSize: Math.random() * 200 + 40,
                xColors: 'random',
                variance: Math.random(),
            }).toCanvas();

            styles.set('body', {
                'background-image': `url(${bodyPattern.toDataURL('image/png').toString()})`,
            });

            styles.set('.modal-content', {
                'background-image': `url(${bodyPattern.toDataURL('image/png').toString()})`,
            });
        }).catch((e) => { util.error(`Could not load trianglify: ${  e}`); });
    },

    /**
     * Updates the current background.
     *
     * @param {any} theme Theme object with the new background settings.
     * @param {any} oldTheme Theme object with the old background settings.
     * @param {any} duration How long to animate the transition.
     */
    updateBackground(theme, oldTheme, duration) {
        // console.log('changing to', theme);
        const body = document.body;
        if (theme.themeContent['background-chooser'] === 'trianglify') {
            if (
                oldTheme &&
                oldTheme.themeContent &&
                theme.themeContent.backgroundColor ===
                oldTheme.themeContent.backgroundColor &&
                theme.themeContent.optionsColor ===
                oldTheme.themeContent.optionsColor &&
                theme.themeContent['trisize-chooser'] ===
                oldTheme.themeContent['trisize-chooser'] &&
                theme.themeContent['tristyle-chooser'] ===
                oldTheme.themeContent['tristyle-chooser'] &&
                theme.themeContent['trivariance-chooser'] ===
                oldTheme.themeContent['trivariance-chooser']
            ) {
                // return;
            }

            // Lazy compute colors and trianglify background
            getTinycolor().then((tinycolor) => {
                let xColors = [theme.themeContent.backgroundColor];

                // Convert variance from my option to actual values.
                let triVariance = 0.75;
                switch (
                    theme.themeContent['trivariance-chooser'].toLowerCase()
                ) {
                case 'uniform':
                    triVariance = 0;
                    break;

                case 'bent':
                    triVariance = 0.375;
                    break;

                case 'freeform':
                    triVariance = 0.75;
                    break;

                default:
                    util.error(
                        `Could not recognize trivariance: ${theme.themeContent['trivariance-chooser']}`
                    );
                    break;
                }

                let triSize = 70;
                switch (theme.themeContent['trisize-chooser'].toLowerCase()) {
                case 'small':
                    triSize = 25;
                    break;

                case 'medium':
                    triSize = 70;
                    break;

                case 'large':
                    triSize = 125;
                    break;

                case 'yuge':
                    triSize = 240;
                    break;

                default:
                    util.error(
                        `Could not recognize trisize: ${theme.themeContent['trisize-chooser']}`
                    );
                    break;
                }

                switch (theme.themeContent['tristyle-chooser'].toLowerCase()) {
                case 'triad':
                    xColors = tinycolor(theme.themeContent.backgroundColor)
                        .triad()
                        .map((v) => v.toHexString());
                    break;
                case 'tetrad':
                    xColors = tinycolor(theme.themeContent.backgroundColor)
                        .tetrad()
                        .map((v) => v.toHexString());
                    break;
                case 'monochromatic':
                    xColors = tinycolor(theme.themeContent.backgroundColor)
                        .monochromatic()
                        .map((v) => v.toHexString());
                    break;
                case 'split complements':
                    xColors = tinycolor(theme.themeContent.backgroundColor)
                        .splitcomplement()
                        .map((v) => v.toHexString());
                    break;
                default:
                    util.error(
                        `Could not recognize tristyle: ${theme.themeContent['tristyle-chooser']}`
                    );
                    break;
                }

                // Now load trianglify and render
                getTrianglify().then((trianglify) => {
                    try {
                        const bodyPattern = trianglify({
                            width: body.scrollWidth,
                            height: body.scrollHeight,
                            variance: triVariance,
                            cellSize: triSize,
                            xColors,
                            seed: 'metro-start',
                        }).toCanvas();
                        styles.set('.background-color', {
                            'background-color': theme.themeContent.backgroundColor,
                        });
                        styles.set('body', {
                            'background-image': `url(${bodyPattern.toDataURL('image/png').toString()})`,
                        });

                        const modalPattern = trianglify({
                            width: body.scrollWidth * 0.75,
                            height: body.scrollHeight * 0.85,
                            variance: triVariance,
                            cellSize: triSize,
                            xColors,
                        }).toCanvas();

                        styles.set('.modal-content', {
                            'background-image': `url(${modalPattern.toDataURL('image/png').toString()})`,
                        });
                    } catch (e) {
                        util.error(`Failed to render trianglify background: ${  e}`);
                    }
                }).catch((e) => { util.error(`Could not load trianglify: ${  e}`); });
            }).catch((e) => { util.error(`Could not load tinycolor: ${  e}`); });
        } else {
            this.animate('.background-color', {
                backgroundColor: theme.themeContent.backgroundColor,
            }, duration);

            this.setStyles(
                ['body', '.modal-content', '.background-color'], {
                    'background-image': 'none',
                    'background-color': theme.themeContent.backgroundColor ?? '',
                }
            );
        }

        styles.set('::-webkit-scrollbar', {
            'background-color': theme.themeContent.backgroundColor ?? '',
        });

        styles.set('input[type="text"]', {
            'background-color': theme.themeContent.optionsColor ?? '',
        });
    },
    /**
     * Updates the options elements colors.
     *
     * @param {any} theme Theme object with the new color settings.
     * @param {any} oldTheme Theme object with the old color settings.
     * @param {any} duration How long to animate the transition.
     */
    updateMainColor(theme, oldTheme, duration) {
        const mainColor = theme.themeContent.mainColor ?? '';

        if (
            oldTheme &&
            oldTheme.themeContent &&
            oldTheme.themeContent.mainColor &&
            mainColor === oldTheme.themeContent.mainColor
        ) {
            return;
        }

        this.animate('body', {
            color: mainColor,
            'text-shadow': this.getShadow(theme, mainColor),
        }, duration);
        this.animate('input', {
            color: mainColor,
        }, duration);

        styles.set('body', {
            color: mainColor,
            'text-shadow': this.getShadow(theme, mainColor),
        });
        styles.set('input', {
            color: mainColor,
            'text-shadow': this.getShadow(theme, mainColor),
        });
        styles.set('.theme-section-title', {
            'border-bottom-color': mainColor,
        });
    },

    /**
     * Updates the title elements colors.
     *
     * @param {any} theme Theme object with the new color settings.
     * @param {any} oldTheme Theme object with the old color settings.
     * @param {any} duration How long to animate the transition.
     */
    updateTitleColor(theme, oldTheme, duration) {
        const titleColor = theme.themeContent.titleColor ?? '';
        if (
            oldTheme &&
            oldTheme.themeContent &&
            oldTheme.themeContent.titleColor &&
            titleColor === oldTheme.themeContent.titleColor
        ) {
            return;
        }

        this.animate('.title-color', {
            color: titleColor,
            'text-shadow': this.getShadow(theme, titleColor),
        }, duration);

        styles.set('.title-color', {
            color: titleColor,
            'text-shadow': this.getShadow(theme, titleColor),
        });
    },

    /**
     * Updates the options elements colors.
     *
     * @param {any} theme Theme object with the new color settings.
     * @param {any} oldTheme Theme object with the new color settings.
     * @param {any} duration How long to animate the transition.
     */
    updateOptionsColor(theme, oldTheme, duration) {
        const optionsColor = theme.themeContent.optionsColor ?? '';
        if (
            oldTheme &&
            oldTheme.themeContent &&
            oldTheme.themeContent.optionsColor &&
            optionsColor === oldTheme.themeContent.optionsColor
        ) {
            return;
        }
        this.animate('.options-color', {
            color: optionsColor,
            'text-shadow': this.getShadow(theme, optionsColor),
        }, duration);

        styles.set('.options-color', {
            color: optionsColor,
            'text-shadow': this.getShadow(theme, optionsColor),
        });

        styles.set('*', {
            'border-color': optionsColor,
        });

        this.setStyles(
            [
                '.modal-info .clickable',
                '.active',
                'input::placeholder',
                '::-webkit-scrollbar-thumb',
                '::-webkit-input-placeholder',
            ], {
                'background-color': optionsColor,
            }
        );
    },

    /**
     * Upates the currently selected font.
     *
     * @param {any} theme The theme object with the new font settings.
     * @param {any} oldTheme The theme object with the old font settings.
     */
    updateFont(theme, oldTheme) {
        if (
            oldTheme &&
            oldTheme.themeContent &&
            theme.themeContent['font-chooser'] ===
            oldTheme.themeContent['font-chooser'] &&
            theme.themeContent['fontfamily-chooser'] ===
            oldTheme.themeContent['fontfamily-chooser'] &&
            theme.themeContent['fontweight-chooser'] ===
            oldTheme.themeContent['fontweight-chooser'] &&
            theme.themeContent['fontvariant-chooser'] ===
            oldTheme.themeContent['fontvariant-chooser']
        ) {
            return;
        }

        // If the current font group is not custom, make it active.
        if (theme.themeContent['font-chooser'] !== 'custom') {
            theme.themeContent['fontfamily-chooser'] =
                theme.themeContent['font-chooser'];
        }

        // If the current font is not system, at it to the font list.
        let font = '"Segoe UI", Helvetica, Arial, sans-serif';
        if (theme.themeContent['fontfamily-chooser'] !== 'system') {
            font = `"${theme.themeContent['fontfamily-chooser']}", ${font}`;
        }

        if (
            theme.themeContent['fontweight-chooser'] !== 'normal' &&
            theme.themeContent['fontweight-chooser'] !== 'bold'
        ) {
            theme.themeContent['fontweight-chooser'] = 'normal';
        }

        // If the current font is small caps, set it to the real values.
        let transform = 'none';
        let variant = 'normal';
        if (theme.themeContent['fontvariant-chooser'] === 'small-caps') {
            transform = 'lowercase';
            variant = 'small-caps';
        }

        this.setStyles(
            ['body', 'input::placeholder', 'input[type="text"]'], {
                'font-family': font,
                'font-weight': theme.themeContent['fontweight-chooser'],
                'text-transform': transform,
                'font-variant': variant,
            }
        );
    },

    getShadow(data, color) {
        // Avoid importing tinycolor synchronously here. If tinycolor has been
        // lazy-loaded already, use it; otherwise return a simple fallback so
        // the UI doesn't force tinycolor into the main bundle.
        if (!color) {return 'none';}
        try {
            if (_tinycolor) {
                const tc = _tinycolor(color);
                return data.themeContent['fontreadability-chooser'] === 'on'
                    ? `${tc.spin(90)} 0 0 0.1em, ${tc.spin(180)} 0 0 0.2em`
                    : 'none';
            }
        } catch {
            // fallthrough to fallback
        }
        return data.themeContent['fontreadability-chooser'] === 'on'
            ? `${color} 0 0 0.1em, ${color} 0 0 0.2em`
            : 'none';
    },


    setStyles(selectors, style) {
        for (const selector of selectors) {
            styles.set(selector, style);
        }
    },

    clearJss(oldTheme) {
        if (oldTheme && oldTheme.themeContent) {
            oldTheme.themeContent.mainColor = '';
            oldTheme.themeContent.baseColor = '';
            oldTheme.themeContent.titleColor = '';
            oldTheme.themeContent.backgroundColor = '';
            oldTheme.themeContent.optionsColor = '';
            oldTheme.themeContent['font-chooser'] = '';
            oldTheme.themeContent['fontfamily-chooser'] = '';
            oldTheme.themeContent['fontweight-chooser'] = '';
            oldTheme.themeContent['fontvariant-chooser'] = '';
            oldTheme.themeContent['fontreadability-chooser'] = '';
            oldTheme.themeContent['trisize-chooser'] = '';
            oldTheme.themeContent['tristyle-chooser'] = '';
            oldTheme.themeContent['trivariance-chooser'] = '';
        }

        ['body', '.background-color', '.modal-content'].forEach(
            (element) => {
                styles.remove(element);
            }
        );
    },
};
