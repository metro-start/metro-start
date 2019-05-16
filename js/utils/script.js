define(['jquery', 'tinycolor2', 'jss', 'trianglify', './util', './storage', './defaults'],
    (jquery, tinycolor, jss, trianglify, util, storage, defaults) => {
        let script = {
            init: function() { },

            /**
             * Changes the style to whatever is in the scope.
             *
             * @param {any} newTheme: The new theme to change to.
             * @param {any} oldTheme: The old theme to change from.
             * @param {any} transition: A bool indicating whether to slowly transition or immediately change.
             * @return {any} The upgrade and applied theme.
             */
            updateTheme: function(newTheme, oldTheme, transition) {
                let duration = (transition === true ? 800 : 0);
                let theme = util.upgradeTheme(newTheme, defaults.defaultTheme);

                if (theme.title === 'randomize') {
                    theme.themeContent['background-chooser'] = util.randomize(['none', 'trianglify']);
                    theme.themeContent['trivariance-chooser'] = util.randomize(['uniform', 'bent', 'freeform']);
                    theme.themeContent['trisize-chooser'] = util.randomize(['small', 'medium', 'large', 'yuge']);
                    theme.themeContent['tristyle-chooser'] = util.randomize(['triad', 'tetrad', 'monochromatic', 'split complements']);

                    theme.themeContent.mainColor = tinycolor.random().toHexString();
                    theme.themeContent.baseColor = tinycolor.random().toHexString();
                    theme.themeContent.titleColor = tinycolor.random().toHexString();
                    theme.themeContent.optionsColor = tinycolor.random().toHexString();
                    theme.themeContent.backgroundColor = tinycolor.random().toHexString();

                    theme.themeContent['font-chooser'] = util.randomize(defaults.defaultFonts);
                    theme.themeContent['fontfamily-chooser'] = util.randomize(defaults.defaultFonts);
                    theme.themeContent['fontweight-chooser'] = util.randomize(['normal', 'bold']);
                    theme.themeContent['fontvariant-chooser'] = util.randomize(['normal', 'small-caps']);
                }

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
            updateRandomBackground: function() {
                let bodyPattern = trianglify({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    cell_size: Math.random() * 200 + 40,
                    x_colors: 'random',
                    variance: Math.random(),
                });

                jss.set('body', {
                    'background-image': `url(${bodyPattern.png()})`,
                });

                jss.set('.modal-content', {
                    'background-image': `url(${bodyPattern.png()})`,
                });
            },

            /**
             * Updates the current background.
             *
             * @param {any} theme Theme object with the new background settings.
             * @param {any} oldTheme Theme object with the old background settings.
             * @param {any} duration How long to animate the transition.
             */
            updateBackground: function(theme, oldTheme, duration) {
                let jBody = jquery('body');
                if (theme.themeContent['background-chooser'] === 'trianglify') {
                    if (theme.themeContent.backgroundColor === oldTheme.themeContent.backgroundColor
                        && theme.themeContent.optionsColor === oldTheme.themeContent.optionsColor
                        && theme.themeContent['trisize-chooser'] === oldTheme.themeContent['trisize-chooser']
                        && theme.themeContent['tristyle-chooser'] === oldTheme.themeContent['tristyle-chooser']
                        && theme.themeContent['trivariance-chooser'] === oldTheme.themeContent['trivariance-chooser']) {
                        return;
                    }

                    let xColors = [theme.themeContent.backgroundColor];

                    // Convert variance from my option to actual values.
                    let triVariance = 0.75;
                    switch (theme.themeContent['trivariance-chooser'].toLowerCase()) {
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
                            util.error(`Could not recognize trivariance: ${theme.themeContent['trivariance-chooser']}`);
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
                            util.error(`Could not recognize trisize: ${theme.themeContent['trisize-chooser']}`);
                            break;
                    }

                    switch (theme.themeContent['tristyle-chooser'].toLowerCase()) {
                        case 'triad':
                            xColors = tinycolor(theme.themeContent.backgroundColor).triad().map((v) => v.toHexString());
                            break;
                        case 'tetrad':
                            xColors = tinycolor(theme.themeContent.backgroundColor).tetrad().map((v) => v.toHexString());
                            break;
                        case 'monochromatic':
                            xColors = tinycolor(theme.themeContent.backgroundColor).monochromatic().map((v) => v.toHexString());
                            break;
                        case 'split complements':
                            xColors = tinycolor(theme.themeContent.backgroundColor).splitcomplement().map((v) => v.toHexString());
                            break;
                        default:
                            util.error(`Could not recognize tristyle: ${theme.themeContent['tristyle-chooser']}`);
                            break;
                    }

                    let bodyPattern = trianglify({
                        width: jBody.prop('scrollWidth'),
                        height: jBody.prop('scrollHeight'),
                        variance: triVariance,
                        cell_size: triSize,
                        x_colors: xColors,
                        seed: 'metro-start',
                    });
                    jss.set('body', {
                        'background-image': `url(${bodyPattern.png()})`,
                    });

                    let modalPattern = trianglify({
                        width: jBody.prop('scrollWidth') * 0.75,
                        height: jBody.prop('scrollHeight') * 0.85,
                        variance: triVariance,
                        cell_size: triSize,
                        x_colors: xColors,
                    });

                    jss.set('.modal-content', {
                        'background-image': `url(${modalPattern.png()})`,
                    });

                    jss.set('.background-color', {
                        'background-color': theme.themeContent.backgroundColor,
                    });
                } else {
                    jquery('.background-color').animate({
                        'backgroundColor': theme.themeContent.backgroundColor,
                    }, {
                            duration: duration,
                            queue: false,
                        });

                    this.jssSetMultiple(['body', '.modal-content', '.background-color'], {
                        'background-image': `none`,
                        'background-color': theme.themeContent.backgroundColor,
                    });
                }

                jss.set('::-webkit-scrollbar', {
                    'background-color': theme.themeContent.backgroundColor,
                });


                jss.set('input[type="text"]', {
                    'background-color': theme.themeContent.optionsColor,
                });
            },
            /**
             * Updates the options elements colors.
             *
             * @param {any} theme Theme object with the new color settings.
             * @param {any} oldTheme Theme object with the old color settings.
             * @param {any} duration How long to animate the transition.
             */
            updateMainColor: function(theme, oldTheme, duration) {
                let mainColor = theme.themeContent.mainColor;

                if (mainColor === oldTheme.mainColor) {
                    return;
                }

                jquery('body').animate({
                    'color': mainColor,
                    'text-shadow': this.getShadow(theme, mainColor),
                }, {
                        duration: duration,
                        queue: false,
                    });
                jquery('input').animate({
                    'color': mainColor,
                }, {
                        duration: duration,
                        queue: false,
                    });

                jss.set('body', {
                    'color': mainColor,
                    'text-shadow': this.getShadow(theme, mainColor),
                });
                jss.set('input', {
                    'color': mainColor,
                    'text-shadow': this.getShadow(theme, mainColor),
                });
                jss.set('.theme-section-title', {
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
            updateTitleColor: function(theme, oldTheme, duration) {
                let titleColor = theme.themeContent.titleColor;
                if (titleColor === oldTheme.themeContent.titleColor) {
                    return;
                }

                jquery('.title-color').animate({
                    'color': titleColor,
                    'text-shadow': this.getShadow(theme, titleColor),
                }, {
                        duration: duration,
                        queue: false,
                    });

                jss.set('.title-color', {
                    'color': titleColor,
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
            updateOptionsColor: function(theme, oldTheme, duration) {
                let optionsColor = theme.themeContent.optionsColor;
                if (optionsColor === oldTheme.themeContent.titleColor) {
                    return;
                }
                jquery('.options-color').animate({
                    'color': optionsColor,
                    'text-shadow': this.getShadow(theme, optionsColor),
                }, {
                        duration: duration,
                        queue: false,
                    });

                jss.set('.options-color', {
                    'color': optionsColor,
                    'text-shadow': this.getShadow(theme, optionsColor),
                });

                jss.set('*', {
                    'border-color': optionsColor,
                });

                this.jssSetMultiple(['.modal-info .clickable', '.active', 'input::placeholder', '::-webkit-scrollbar-thumb', '::-webkit-input-placeholder'], {
                    'background-color': optionsColor,
                });
            },

            /**
             * Upates the currently selected font.
             *
             * @param {any} theme The theme object with the new font settings.
             * @param {any} oldTheme The theme object with the old font settings.
             */
            updateFont: function(theme, oldTheme) {
                if (theme.themeContent['font-chooser'] === oldTheme.themeContent['font-chooser']
                    && theme.themeContent['fontfamily-chooser'] === oldTheme.themeContent['fontfamily-chooser']
                    && theme.themeContent['fontweight-chooser'] === oldTheme.themeContent['fontweight-chooser']
                    && theme.themeContent['fontvariant-chooser'] === oldTheme.themeContent['fontvariant-chooser']) {
                    return;
                }

                // If the current font group is not custom, make it active.
                if (theme.themeContent['font-chooser'] !== 'custom') {
                    theme.themeContent['fontfamily-chooser'] = theme.themeContent['font-chooser'];
                }

                // If the current font is not system, at it to the font list.
                let font = `"Segoe UI", Helvetica, Arial, sans-serif`;
                if (theme.themeContent['fontfamily-chooser'] !== 'system') {
                    font = `"${theme.themeContent['fontfamily-chooser']}", ${font}`;
                }

                if (theme.themeContent['fontweight-chooser'] !== 'normal' && theme.themeContent['fontweight-chooser'] !== 'bold') {
                    theme.themeContent['fontweight-chooser'] = 'normal';
                }

                // If the current font is small caps, set it to the real values.
                let transform = 'none';
                let variant = 'normal';
                if (theme.themeContent['fontvariant-chooser'] === 'small-caps') {
                    transform = 'lowercase';
                    variant = 'small-caps';
                }

                this.jssSetMultiple(['body', 'input::placeholder', 'input[type="text"]'], {
                    'font-family': font,
                    'font-weight': theme.themeContent['fontweight-chooser'],
                    'text-transform': transform,
                    'font-variant': variant,
                });
            },

            getShadow: function(data, color) {
                let shadow = tinycolor(color);
                return data.themeContent['fontreadability-chooser'] === 'on' ?
                    `${shadow.spin(90)} 0 0 0.1em, ${shadow.spin(180)} 0 0 0.2em` :
                    'none';
            },

            jssSetMultiple: function(selectors, style) {
                for (let selector of selectors) {
                    jss.set(selector, style);
                }
            },
        };

        return script;
    });
