define(['jquery', 'tinycolor2', 'jss', 'trianglify', './util', './storage', './defaults'],
    function (jquery, tinycolor, jss, trianglify, util, storage, defaults) {
        var script = {
            init: function () { },

            /**
            * Changes the style to whatever is in the scope.
            *
            * @param {any} data: The new theme to change to.
            * @param {any} transition: A bool indicating whether to slowly transition or immediately change.
            */
            updateTheme: function (data, transition) {
                var duration = (transition === true ? 800 : 0);
                var theme = util.upgradeTheme(data, defaults.defaultTheme);

                if (theme.title === 'randomize') {
                    this.updateRandomize(theme, duration);
                } else {
                    this.updateFont(theme);
                    this.updateBackground(theme, duration);
                    this.updateOptionsColor(theme.optionsColor, duration);
                    this.updateMainColor(theme.mainColor, duration);
                    this.updateTitleColor(theme.titleColor, duration);
                }


                // Animate the color transition.
            },

            /**
             * Updates the current background to a new random one.
             * 
             * @param {any} data The theme to use as a base.
             */
            updateRandomize: function (data, duration) {
                var bodyPattern = trianglify({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    cell_size: Math.random() * 200 + 40,
                    x_colors: 'random',
                    variance: Math.random(),
                });

                jss.set('body', {
                    'background': 'url(' + bodyPattern.png() + ')'
                });
                    
                jss.set('.modal-content', {
                    'background': 'url(' + bodyPattern.png() + ')'
                });

                this.updateMainColor(tinycolor.random().toHexString(), duration);
                this.updateTitleColor(tinycolor.random().toHexString(), duration);
                this.updateOptionsColor(tinycolor.random().toHexString(), duration);
            },

            /**
             * Updates the current background.
             * 
             * @param {any} data Theme object with the new background settings.
             */
            updateBackground: function (data, duration) {
                var jBody = jquery('body');
                if (data['background-chooser'] === 'trianglify') {
                    var xColors = [data.backgroundColor];

                    // Convert variance from my option to actual values.
                    var triVariance = 0.75;
                    switch (data['trivariance-chooser'].toLowerCase()) {
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
                            util.error("Could not recognize trivariance: " + data['trivariance-chooser']);
                            break;
                    }

                    var triSize = 70;
                    switch (data['trisize-chooser'].toLowerCase()) {
                        case 'small':
                            triSize = 25;
                            break;

                        case 'medium':
                            triSize = 70;
                            break;

                        case 'large':
                            triSize = 125;
                            break;

                        default:
                            util.error("Could not recognize trisize: " + data['trisize-chooser']);
                            break;
                    }

                    switch (data['tristyle-chooser'].toLowerCase()) {
                        case 'engulfed in flames':
                            xColors = [
                                tinycolor.mix(data.backgroundColor, 'red', 100).toHexString(),
                                tinycolor.mix(data.backgroundColor, 'red', 64).toHexString(),
                                tinycolor.mix(data.backgroundColor, 'red', 8).toHexString(),
                                tinycolor.mix(data.backgroundColor, 'red', 64).toHexString(),
                                tinycolor.mix(data.backgroundColor, 'red', 100).toHexString()
                            ];
                            break;
                        case 'triad':
                            xColors = tinycolor(data.backgroundColor).triad().map(function(v) {return v.toHexString();});
                            break;
                        case 'tetrad':
                            xColors = tinycolor(data.backgroundColor).tetrad().map(function(v) {return v.toHexString();});
                            break;
                        case 'monochromatic':
                            xColors = tinycolor(data.backgroundColor).monochromatic().map(function(v) {return v.toHexString();});
                            break;
                        case 'split complements':
                            xColors = tinycolor(data.backgroundColor).splitcomplement().map(function(v) {return v.toHexString();});
                            break;
                        default:
                            util.error("Could not recognize tristyle: " + data['tristyle-chooser']);
                            break;
                    }

                    var bodyPattern = trianglify({
                        width: jBody.prop('scrollWidth'),
                        height: jBody.prop('scrollHeight'),
                        variance: triVariance,
                        cell_size: triSize,
                        x_colors: xColors
                    });
                    jss.set('body', {
                        'background': 'url(' + bodyPattern.png() + ')'
                    });

                    var modalPattern = trianglify({
                        width: jBody.prop('scrollWidth') * 0.75,
                        height: jBody.prop('scrollHeight') * 0.85,
                        variance: triVariance,
                        cell_size: triSize,
                        x_colors: xColors
                    });
                    jss.set('.modal-content', {
                        'background': 'url(' + modalPattern.png() + ')'
                    });
                } else {
                    jquery('.background-color').animate({ 'backgroundColor': data.backgroundColor }, { duration: duration, queue: false });

                    jss.set('body', {
                        'background': data.backgroundColor
                    });
                    jss.set('.modal-content', {
                        'background': data.backgroundColor
                    });
                    jss.set('.background-color', {
                        'background-color': data.backgroundColor
                    });
                }

                jss.set('::-webkit-scrollbar', {
                    'background': data.backgroundColor
                });
            },
            /**
             * Updates the options elements colors.
             * 
             * @param {any} mainColor The new main color.
             */
            updateMainColor: function(mainColor, duration) {
                util.logChange('mainColor', mainColor);
                jquery('body').animate({ 'color': mainColor }, { duration: duration, queue: false });
                jquery('input').animate({ 'color': mainColor }, { duration: duration, queue: false });

                jss.set('body', {
                    'color': mainColor,
                });
                jss.set('input', {
                    'color': mainColor,
                });
                jss.set('.theme-section-title', {
                    'border-bottom-color': mainColor
                });
            },

            /**
             * Updates the title elements colors.
             * 
             * @param {any} titleColor The new title color.
             */
            updateTitleColor: function(titleColor, duration) {
                jquery('.title-color').animate({ 'color': titleColor }, { duration: duration, queue: false });

                jss.set('.title-color', {
                    'color': titleColor
                });
            },

            /**
             * Updates the options elements colors.
             * 
             * @param {any} optionsColor The new options color.
             */
            updateOptionsColor: function(optionsColor, duration) {
                jquery('.options-color').animate({ 'color': optionsColor }, { duration: duration, queue: false });

                jss.set('*', {
                    'border-color': optionsColor
                });

                jss.set('::-webkit-scrollbar-thumb', {
                    'background': optionsColor
                });

                jss.set('::-webkit-input-placeholder', {
                    'background': optionsColor
                });

                jss.set('.options-color', {
                    'color': optionsColor
                });
                jss.set('.theme-active', {
                    'background-color': optionsColor
                });
                jss.set('.bookmark-active', {
                    'background-color': optionsColor
                });
                jss.set('.pagebase-grouped > .group > .page', {
                    'border-top-style': 'solid',
                    'border-top-width': '1px',
                    'border-top-color': optionsColor
                });
                jss.set('.pagebase-grouped > .group > .page', {
                    'border-top-style': 'solid',
                    'border-top-width': '1px',
                    'border-top-color': optionsColor
                });
                jss.set('.modal-info .clickable', {
                    'border': '2px solid ' + optionsColor
                });
            },

            /**
             * Upates the currently selected font.
             * 
             * @param {any} data The theme object with the new font settings.
             */
            updateFont: function (data) {
                var checkFont = function (text) {
                    switch (text) {
                        case 'custom':
                        case 'system':
                            return '"Segoe UI", Helvetica, Arial, sans-serif';

                        case 'raleway':
                            return 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif';

                        case 'serif':
                            return 'serif';
                    }
                };

                if (data['font-chooser'] === 'custom') {
                    jss.set('body', {
                        'font-family': checkFont(data['fontfamily-chooser']),
                        'font-weight': data['fontweight-chooser'],
                        'font-variant': data['fontvariant-chooser']
                    });
                } else {
                    jss.set('body', {
                        'font-family': checkFont(data['font-chooser'])
                    });
                }

                if (data['fontreadability-chooser'] === 'on') {
                    var shadowColor = tinycolor(data.mainColor).spin(180).toHexString();
                    jss.set('body', {
                        'text-shadow': shadowColor + ' 0px 0px 0.5em, ' + shadowColor + ' 0px 0px 0.2em'
                    });
                    jss.set('body .sp-dd, .theme-active, .bookmark-active', {
                        'text-shadow': 'none'
                    });
                } else {
                    jss.set('body', {
                        'text-shadow': 'none',
                    });
                }
            },
        };

        return script;
    });
