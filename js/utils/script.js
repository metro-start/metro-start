define(['jquery', 'tinycolor2', 'jss', 'trianglify', './util', './storage', './defaults'],
    (jquery, tinycolor, jss, trianglify, util, storage, defaults) => {
        let script = {
            init: function() {},

            /**
             * Changes the style to whatever is in the scope.
             *
             * @param {any} data: The new theme to change to.
             * @param {any} transition: A bool indicating whether to slowly transition or immediately change.
             * @return {any} The upgrade and applied theme.
             */
            updateTheme: function(data, transition) {
                let duration = (transition === true ? 800 : 0);
                let theme = util.upgradeTheme(data, defaults.defaultTheme);

                if (theme.title === 'randomize') {
                    theme['background-chooser'] = util.randomize(['none', 'trianglify']);
                    theme['trivariance-chooser'] = util.randomize(['uniform', 'bent', 'freeform']);
                    theme['trisize-chooser'] = util.randomize(['small', 'medium', 'large', 'yuge']);
                    theme['tristyle-chooser'] = util.randomize(['triad', 'tetrad', 'monochromatic', 'split complements']);

                    theme.mainColor = tinycolor.random().toHexString();
                    theme.baseColor = tinycolor.random().toHexString();
                    theme.titleColor = tinycolor.random().toHexString();
                    theme.optionsColor = tinycolor.random().toHexString();
                    theme.backgroundColor = tinycolor.random().toHexString();

                    theme['font-chooser'] = util.randomize(defaults.defaultFonts);
                    theme['fontfamily-chooser'] = util.randomize(defaults.defaultFonts);
                    theme['fontweight-chooser'] = util.randomize(['normal', 'bold']);
                    theme['fontvariant-chooser'] = util.randomize(['normal', 'small-caps']);
                }

                this.updateFont(theme);
                this.updateBackground(theme, duration);
                this.updateMainColor(theme, duration);
                this.updateTitleColor(theme, duration);
                this.updateOptionsColor(theme, duration);

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
             * @param {any} data Theme object with the new background settings.
             * @param {any} duration How long to animate the transition.
             */
            updateBackground: function(data, duration) {
                let jBody = jquery('body');
                if (data.themeContent['background-chooser'] === 'trianglify') {
                    let xColors = [data.backgroundColor];

                    // Convert variance from my option to actual values.
                    let triVariance = 0.75;
                    switch (data.themeContent['trivariance-chooser'].toLowerCase()) {
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
                            util.error(`Could not recognize trivariance: ${data.themeContent['trivariance-chooser']}`);
                            break;
                    }

                    let triSize = 70;
                    switch (data.themeContent['trisize-chooser'].toLowerCase()) {
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
                            util.error(`Could not recognize trisize: ${data.themeContent['trisize-chooser']}`);
                            break;
                    }

                    switch (data.themeContent['tristyle-chooser'].toLowerCase()) {
                        case 'triad':
                            xColors = tinycolor(data.themeContent.backgroundColor).triad().map((v) => v.toHexString());
                            break;
                        case 'tetrad':
                            xColors = tinycolor(data.themeContent.backgroundColor).tetrad().map((v) => v.toHexString());
                            break;
                        case 'monochromatic':
                            xColors = tinycolor(data.themeContent.backgroundColor).monochromatic().map((v) => v.toHexString());
                            break;
                        case 'split complements':
                            xColors = tinycolor(data.themeContent.backgroundColor).splitcomplement().map((v) => v.toHexString());
                            break;
                        default:
                            util.error(`Could not recognize tristyle: ${data.themeContent['tristyle-chooser']}`);
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
                        'background-color': data.themeContent.backgroundColor,
                    });
                } else {
                    jquery('.background-color').animate({
                        'backgroundColor': data.themeContent.backgroundColor,
                    }, {
                        duration: duration,
                        queue: false,
                    });

                    this.jssSetMultiple(['body', '.modal-content', '.background-color'], {
                        'background-image': `none`,
                        'background-color': data.themeContent.backgroundColor,
                    });
                }

                jss.set('::-webkit-scrollbar', {
                    'background-color': data.themeContent.backgroundColor,
                });


                jss.set('input[type="text"]', {
                    'background-color': data.themeContent.optionsColor,
                });
            },
            /**
             * Updates the options elements colors.
             *
             * @param {any} data Theme object with the new color settings.
             * @param {any} duration How long to animate the transition.
             */
            updateMainColor: function(data, duration) {
                let mainColor = data.themeContent.mainColor;

                jquery('body').animate({
                    'color': mainColor,
                    'text-shadow': this.getShadow(data, mainColor),
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
                    'text-shadow': this.getShadow(data, mainColor),
                });
                jss.set('input', {
                    'color': mainColor,
                    'text-shadow': this.getShadow(data, mainColor),
                });
                jss.set('.theme-section-title', {
                    'border-bottom-color': mainColor,
                });
            },

            /**
             * Updates the title elements colors.
             *
             * @param {any} data Theme object with the new color settings.
             * @param {any} duration How long to animate the transition.
             */
            updateTitleColor: function(data, duration) {
                let titleColor = data.themeContent.titleColor;

                jquery('.title-color').animate({
                    'color': titleColor,
                    'text-shadow': this.getShadow(data, titleColor),
                }, {
                    duration: duration,
                    queue: false,
                });

                jss.set('.title-color', {
                    'color': titleColor,
                    'text-shadow': this.getShadow(data, titleColor),
                });
            },

            /**
             * Updates the options elements colors.
             *
             * @param {any} data Theme object with the new color settings.
             * @param {any} duration How long to animate the transition.
             */
            updateOptionsColor: function(data, duration) {
                let optionsColor = data.themeContent.optionsColor;
                jquery('.options-color').animate({
                    'color': optionsColor,
                    'text-shadow': this.getShadow(data, optionsColor),
                }, {
                    duration: duration,
                    queue: false,
                });

                jss.set('.options-color', {
                    'color': optionsColor,
                    'text-shadow': this.getShadow(data, optionsColor),
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
             * @param {any} data The theme object with the new font settings.
             */
            updateFont: function(data) {
                // If the current font group is not custom, make it active.
                if (data.themeContent['font-chooser'] !== 'custom') {
                    data.themeContent['fontfamily-chooser'] = data.themeContent['font-chooser'];
                }

                // If the current font is not system, at it to the font list.
                let font = `"Segoe UI", Helvetica, Arial, sans-serif`;
                if (data.themeContent['fontfamily-chooser'] !== 'system') {
                    font = `"${data.themeContent['fontfamily-chooser']}", ${font}`;
                }

                // if (data.themeContent['fontweight-chooser'] !== 'normal' && data.themeContent['fontweight-chooser'] !== 'bold') {
                //     data.themeContent['fontweight-chooser'] = 'normal';
                // }

                // If the current font is small caps, set it to the real values.
                let transform = 'none';
                let variant = 'normal';
                if (data.themeContent['fontvariant-chooser'] === 'small-caps') {
                    transform = 'lowercase';
                    variant = 'small-caps';
                }

                this.jssSetMultiple(['body', 'input::placeholder', 'input[type="text"]'], {
                    'font-family': font,
                    'font-weight': data.themeContent['fontweight-chooser'],
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
