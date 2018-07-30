import jquery from 'jquery';
import trianglify from 'trianglify';
import tinycolor from 'tinycolor2';
import jss from 'jss';

import Util from './util';
import {
    DefaultTheme,
} from '../defaults';

/**
 * Manages styles.
 *
 * @export
 * @class Script
 */
export default class Script {
    /**
     *Creates an instance of Script.
     * @memberof Script
     */
    constructor() {}

    /**
     * Changes the style to whatever is in the scope.
     *
     * @param {any} data: The new theme to change to.
     * @param {any} transition: A bool indicating whether to slowly transition or immediately change.
     * @return {any} The upgrade and applied theme.
     */
    static updateTheme(data, transition) {
        let duration = (transition === true ? 800 : 0);
        let theme = Util.upgradeTheme(data, DefaultTheme);

        if (theme.title === 'randomize') {
            theme['background-chooser'] = Util.randomize(['none', 'trianglify']);
            theme['trivariance-chooser'] = Util.randomize(['uniform', 'bent', 'freeform']);
            theme['trisize-chooser'] = Util.randomize(['small', 'medium', 'large', 'yuge']);
            theme['tristyle-chooser'] = Util.randomize(['triad', 'tetrad', 'monochromatic', 'split complements']);

            theme.mainColor = tinycolor.random().toHexString();
            theme.baseColor = tinycolor.random().toHexString();
            theme.titleColor = tinycolor.random().toHexString();
            theme.optionsColor = tinycolor.random().toHexString();
            theme.backgroundColor = tinycolor.random().toHexString();

            theme['font-chooser'] = Util.randomize(['custom', 'system', 'raleway']);
            theme['fontfamily-chooser'] = Util.randomize(['system', 'raleway']);
            theme['fontweight-chooser'] = Util.randomize(['normal', 'lighter', 'bolder']);
            theme['fontvariant-chooser'] = Util.randomize(['normal', 'small-caps']);
        }

        this.updateFont(theme);
        this.updateBackground(theme, duration);
        this.updateMainColor(theme, duration);
        this.updateTitleColor(theme, duration);
        this.updateOptionsColor(theme, duration);

        return theme;
    }

    /**
     * Updates the current background to a new random one.
     */
    static updateRandomBackground() {
        let bodyPattern = trianglify({
            width: window.innerWidth,
            height: window.innerHeight,
            cell_size: Math.random() * 200 + 40,
            x_colors: 'random',
            variance: Math.random(),
        });

        jss.set('body', {
            'background': `url(${bodyPattern.png()})`,
        });

        jss.set('.modal-content', {
            'background': `url(${bodyPattern.png()})`,
        });
    }

    /**
     * Updates the current background.
     *
     * @param {any} data Theme object with the new background settings.
     * @param {any} duration How long to animate the transition.
     */
    static updateBackground(data, duration) {
        let jBody = jquery('body');
        if (data['background-chooser'] === 'trianglify') {
            let xColors = [data.backgroundColor];

            // Convert variance from my option to actual values.
            let triVariance = 0.75;
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
                    Util.error(`Could not recognize trivariance: ${data['trivariance-chooser']}`);
                    break;
            }

            let triSize = 70;
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

                case 'yuge':
                    triSize = 240;
                    break;

                default:
                    Util.error(`Could not recognize trisize: ${data['trisize-chooser']}`);
                    break;
            }

            switch (data['tristyle-chooser'].toLowerCase()) {
                case 'triad':
                    xColors = tinycolor(data.backgroundColor).triad().map((v) => {
                        return v.toHexString();
                    });
                    break;
                case 'tetrad':
                    xColors = tinycolor(data.backgroundColor).tetrad().map((v) => {
                        return v.toHexString();
                    });
                    break;
                case 'monochromatic':
                    xColors = tinycolor(data.backgroundColor).monochromatic().map((v) => {
                        return v.toHexString();
                    });
                    break;
                case 'split complements':
                    xColors = tinycolor(data.backgroundColor).splitcomplement().map((v) => {
                        return v.toHexString();
                    });
                    break;
                default:
                    Util.error(`Could not recognize tristyle: ${data['tristyle-chooser']}`);
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
                'background': `url(${bodyPattern.png()})`,
            });

            let modalPattern = trianglify({
                width: jBody.prop('scrollWidth') * 0.75,
                height: jBody.prop('scrollHeight') * 0.85,
                variance: triVariance,
                cell_size: triSize,
                x_colors: xColors,
            });
            jss.set('.modal-content', {
                'background': `url(${modalPattern.png()})`,
            });
        } else {
            jquery('.background-color').animate({
                'backgroundColor': data.backgroundColor,
            }, {
                duration: duration,
                queue: false,
            });

            jss.set('body', {
                'background': data.backgroundColor,
            });
            jss.set('.modal-content', {
                'background': data.backgroundColor,
            });
            jss.set('.background-color', {
                'background-color': data.backgroundColor,
            });
        }

        jss.set('::-webkit-scrollbar', {
            'background': data.backgroundColor,
        });
    }

    /**
     * Updates the options elements colors.
     *
     * @param {any} data Theme object with the new color settings.
     * @param {any} duration How long to animate the transition.
     */
    static updateMainColor(data, duration) {
        let mainColor = data.mainColor;

        jquery('body').animate({
            'color': mainColor,
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
        });
        jss.set('input', {
            'color': mainColor,
        });
        jss.set('.theme-section-title', {
            'border-bottom-color': mainColor,
        });
    }

    /**
     * Updates the title elements colors.
     *
     * @param {any} data Theme object with the new color settings.
     * @param {any} duration How long to animate the transition.
     */
    static updateTitleColor(data, duration) {
        let titleColor = data.titleColor;

        jquery('.title-color').animate({
            'color': titleColor,
        }, {
            duration: duration,
            queue: false,
        });

        jss.set('.title-color', {
            'color': titleColor,
        });
    }

    /**
     * Updates the options elements colors.
     *
     * @param {any} data Theme object with the new color settings.
     * @param {any} duration How long to animate the transition.
     */
    static updateOptionsColor(data, duration) {
        let optionsColor = data.optionsColor;

        jquery('.options-color').animate({
            'color': optionsColor,
        }, {
            duration: duration,
            queue: false,
        });

        jss.set('*', {
            'border-color': optionsColor,
        });

        jss.set('::-webkit-scrollbar-thumb', {
            'background': optionsColor,
        });

        jss.set('input::placeholder', {
            'background': optionsColor,
        });
        jss.set('::-webkit-input-placeholder', {
            'background': optionsColor,
        });

        jss.set('.options-color', {
            'color': optionsColor,
        });
        jss.set('.active', {
            'background-color': optionsColor,
        });
        jss.set('.pagebase-grouped > .group > .page', {
            'border-top-style': 'solid',
            'border-top-width': '1px',
        });
        jss.set('.modal-info .clickable', {
            'border': `2px solid ${optionsColor}`,
        });
    }

    /**
     * Upates the currently selected font.
     *
     * @param {any} data The theme object with the new font settings.
     */
    static updateFont(data) {
        let checkFont = function(font) {
            switch (font) {
                case 'system':
                    return '"Segoe UI", Helvetica, Arial, sans-serif';

                case 'raleway':
                    return '"Raleway", "Segoe UI", Helvetica, Arial, sans-serif';
            }
        };

        let jssSetMultiple = (selectors, style) => {
            for (let selector of selectors) {
                jss.set(selector, style);
            }
        };

        switch (data['font-chooser']) {
            case 'system':
                data['fontfamily-chooser'] = 'system';
                data['fontweight-chooser'] = 'normal';
                data['fontvariant-chooser'] = 'normal';
                break;

            case 'raleway':
                data['fontfamily-chooser'] = 'raleway';
                data['fontweight-chooser'] = 'normal';
                data['fontvariant-chooser'] = 'normal';
                break;
        }

        jssSetMultiple(['body', 'input::placeholder', 'input[type="text"]'], {
            'font-family': checkFont(data['fontfamily-chooser']),
            'font-weight': data['fontweight-chooser'],
        });

        switch (data['fontvariant-chooser']) {
            case 'small-caps':
                jssSetMultiple(['body', 'input::placeholder', 'input[type="text"]'], {
                    'text-transform': 'lowercase',
                    'font-variant': 'small-caps',
                });
                break;

            case 'normal':
                jssSetMultiple(['body', 'input::placeholder', 'input[type="text"]'], {
                    'text-transform': 'none',
                    'font-variant': 'normal',
                });
                break;
        }

        switch (data['fontreadability-chooser']) {
            case 'on':
                let shadowColor = tinycolor(data.mainColor).spin(180).toHexString();
                jss.set('body', {
                    'text-shadow': `${shadowColor} 0px 0px 0.5em, ${shadowColor } 0px 0px 0.2em`,
                });
                jss.set('body .sp-dd, .active', {
                    'text-shadow': 'none',
                });
                break;

            case 'off':
                jss.set('body', {
                    'text-shadow': 'none',
                });
                break;
        }
    }
}
