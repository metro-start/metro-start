import jquery from 'jquery';
import Tinycolor from 'tinycolor2';
import 'spectrum-colorpicker';
import 'metro-select';

import {
    DefaultWebservice,
    DefaultTheme,
    SystemThemes,
} from '../utils/utils';
import {Script} from '../utils/utils';
import {Storage} from '../utils/utils';
import {Util} from '../utils/utils';
import {Modal} from '../utils/utils';
import ThrottleDebounce from 'throttle-debounce';

/**
 * Update the current theme.
 *
 * @export
 * @class Themes
 */
export default class Themes {
    /**
     *Creates an instance of Themes.
     * @memberof Themes
     */
    constructor() {
        this.isBound = false;

        this.sessionUpdateCount = 0;

        this.data = {};

        this.elems = {
            themeEditor: document.getElementById('themeEditor'),
            trianglify: document.getElementById('trianglifyButton'),
            editThemeButton: document.getElementById('editThemeButton'),
            solidSection: document.getElementById('solid'),
            trianglifySection: document.getElementById('trianglify'),
        };

        this.textInputs = [
            document.getElementById('title'),
            document.getElementById('author'),
        ];

        this.colorInputs = [
            document.getElementById('baseColor'),
            document.getElementById('backgroundColor'),
            document.getElementById('titleColor'),
            document.getElementById('mainColor'),
            document.getElementById('optionsColor'),
        ];

        this.selectInputs = [
            document.getElementById('font-chooser'),
            document.getElementById('fontreadability-chooser'),
            document.getElementById('fontfamily-chooser'),
            document.getElementById('fontweight-chooser'),
            document.getElementById('fontvariant-chooser'),

            document.getElementById('palette-chooser'),
            document.getElementById('background-chooser'),
            document.getElementById('trivariance-chooser'),
            document.getElementById('trisize-chooser'),
            document.getElementById('tristyle-chooser'),
        ];

        this.themeAdded = () => {};
        this.themeRemoved = () => {};

        // this.data = defaults.defaultTheme;
        this.data = Storage.get('currentTheme', DefaultTheme);
        this.data = Util.upgradeTheme(this.data, DefaultTheme);

        this.elems.themeEditor.parentNode.removeChild(this.elems.themeEditor);
        this.elems.editThemeButton.addEventListener('click', this.openThemeEditor.bind(this));

        Storage.set('currentTheme', Script.updateTheme(this.data, false));
    }

    /**
     * Reset the input elements to match this.data.
     */
    resetInputs() {
        // Do not try to reset inputs if they haven't been bound.
        if (this.isBound) {
            for (let i = 0; i < this.textInputs.length; i++) {
                let inputElement = this.textInputs[i];
                inputElement.value = this.data[inputElement.id] ? this.data[inputElement.id] : '';
            }

            for (let j = 0; j < this.colorInputs.length; j++) {
                let value = this.data[this.colorInputs[j].id];
                let color = jquery(this.colorInputs[j]);
                color.spectrum('set', value);
            }

            for (let k = 0; k < this.selectInputs.length; k++) {
                let text = this.data[this.selectInputs[k].id];
                jquery(`#${this.selectInputs[k].id}`).metroSelect().set_active(text);
            }
        }
    }

    /**
     * Shows the theme editor modal window.
     */
    openThemeEditor() {
        this.sessionUpdateCount = 0;

        this.data = Storage.get('currentTheme', DefaultTheme);
        Storage.set('previousTheme', this.data);

        if (SystemThemes.map((t) => t.title.toLowerCase()).includes(this.data.title.toLowerCase())) {
            this.data.title = '';
        }

        Modal.createModal('themeEditorModal', this.elems.themeEditor, this.themeEditorClosed.bind(this), 'save', 'cancel');

        if (!this.isBound) {
            for (let i = 0; i < this.selectInputs.length; i++) {
                this.bindTextInput(this.textInputs[i]);
            }

            for (let j = 0; j < this.colorInputs.length; j++) {
                this.bindColorInput(this.colorInputs[j]);
            }

            for (let k = 0; k < this.selectInputs.length; k++) {
                this.bindSelectInput(this.selectInputs[k]);
            }
            this.isBound = true;
        }
    }

    /**
     * Handles whwhen the theme editor modal is closed.
     *
     * @param {any} res How the modal was closed. True if the 'okay' option was selected.
     */
    themeEditorClosed(res) {
        Util.log(`theme editor closed with result: ${res}`);

        if (!res) {
            if (this.sessionUpdateCount !== 0) {
                // If the theme edior was canceled, reset the theme.
                this.data = Storage.get('previousTheme', this.data);
            }
        } else {
            if (SystemThemes.map((t) => t.title.toLowerCase()).includes(this.data.title.toLowerCase())) {
                this.data.title = '';
                Modal.createModal(
                    'themeEditorModal',
                    `${this.data.title} already exists as a system theme.`,
                    null,
                    null,
                    'okay');
            }
            // If the title or author are empty, make them untitled.
            if (!this.data.title) {
                this.data.title = 'untitled';
            }

            if (!this.data.author) {
                this.data.author = 'anonymous';
            }

            this.data.online = false;

            // Ensure no duplicate local themes are created.
            let themeFound = false;
            let themeIndex = 0;
            let themesLocal = Storage.get('themesLocal', []);
            for (themeIndex in themesLocal) {
                if (themesLocal[themeIndex].title.toLowerCase() === this.data.title.toLowerCase()) {
                    themesLocal[themeIndex] = this.data;
                    themeFound = true;
                }
            }

            if (themeFound === false) {
                themesLocal.push(this.data);
            }

            Storage.set('themesLocal', themesLocal);
            this.themeAdded();
        }

        this.updateCurrentTheme('currentTheme', this.data);
    }

    /**
     * Bind updates to text input elements.
     *
     * @param {any} inputElement The name of the field to collect inputs from.
     */
    bindTextInput(inputElement) {
        jquery(inputElement).on('input', (event) => {
            let target = jquery(event.target);
            if (target.data('lastval') !== target.val()) {
                target.data('lastval', target.val());

                this.data[inputElement.id] = target.val();
            }
        });
    }

    /**
     * Create new metro-select for the given inputElement.
     *
     * @param {any} inputElement The name of the field to turn into a metro-select.
     */
    bindSelectInput(inputElement) {
        jquery(inputElement).metroSelect({
            'initial': this.data[inputElement.id],
            'onchange': this.updateSelect.bind(this, inputElement.id),
        });

        this.updateSelect(inputElement.id, this.data[inputElement.id]);
    }

    /**
     * Create new color picker element for the given inputElement.
     *
     * @param {any} inputElement The name of the field to turn into a spectrum.
     */
    bindColorInput(inputElement) {
        jquery(inputElement).spectrum({
            chooseText: 'save color',
            replacerClassName: 'spectrum-replacer',
            appendTo: inputElement.parentNode,
            showButtons: false,
            color: this.data[inputElement.id],
            move: ThrottleDebounce.throttle(250, this.updateColor.bind(this, inputElement.id), true),
        });
    }

    /**
     * Handles changes to metro-select elements.
     *
     * @param {any} inputId The name of the metro-select that's changing.
     * @param {any} val The new value.
     */
    updateSelect(inputId, val) {
        switch (inputId.toLowerCase()) {
            // These are the choosers that have something to hide.
            case 'background-chooser':
            case 'palette-chooser':
            case 'font-chooser':
            case 'fontfamily-chooser':
                let elems = document.getElementsByClassName(`${inputId}-section`);
                for (let i = 0; i < elems.length; i++) {
                    // If this element has the same id as our new select value, make it visible.
                    if (elems[i].id === val) {
                        Util.removeClass(elems[i], 'hide');
                        // Otherwise ensure its hidden.
                    } else if (!Util.hasClass(elems[i], 'hide')) {
                        Util.addClass(elems[i], 'hide');
                    }
                }
                break;
        }

        this.updateCurrentTheme(inputId, val);
    }

    /**
     * Handles changes to color elements.
     *
     * @param {any} inputId The name of the color field that's changing.
     * @param {any} color The new color.
     */
    updateColor(inputId, color) {
        this.updateCurrentTheme(inputId, color.toHexString());
    }

    /**
     * Share a locally saved theme to the community.
     *
     * @param {any} theme The theme to be shared.
     */
    shareTheme(theme) {
        let url = `${DefaultWebservice}/newtheme`;
        jquery.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(theme),
            dataType: 'json',
            success() {
                Util.log('Theme shared to the web.');
            },
            error(e) {
                Util.error('Theme was not shared to the web: ', e);
            },
        });
    }

    /**
     * Removes the provided theme from the local storage.
     *
     * @param {any} theme The theme to be removed. Only checks by name.
     */
    removeTheme(theme) {
        let themesLocal = Storage.get('themesLocal', []);

        for (let i = 0; i < themesLocal.length; i++) {
            if (theme.title === themesLocal[i].title) {
                themesLocal.splice(i, 1);
                break;
            }
        }

        Storage.set('themesLocal', themesLocal);
        this.themeRemoved();
    }

    /**
     * Updates the values provided in storage and then updates the theme.
     *
     * @param {any} inputId The theme setting that has changed.
     * @param {any} val The new theme setting.
     */
    updateCurrentTheme(inputId, val) {
        if (this.data[inputId] === val) {
            return;
        }

        this.sessionUpdateCount++;
        Util.logChange(inputId, typeof val === 'object' ? JSON.stringify(val) : val);

        if (inputId === 'currentTheme') {
            this.data = Util.clone(val);

            this.autoPaletteAdjust();

            // Create an id, if one does not exist.
            if (this.data.id) {
                this.data.id = this.data.title + this.data.author + new Date().getUTCSeconds;
            }

            // If its an online theme, clear the 'metadata'.
            if (this.data.isOnline) {
                this.data.title = '';
                this.data.author = '';
            }

            let updatedTheme = Script.updateTheme(this.data, true);
            Storage.set('currentTheme', updatedTheme);
        } else {
            this.data[inputId] = val;
            Script.updateTheme(this.data, true);
        }
    }

    /**
     * Adjust current colors to be readable.
     *
     * @memberof Themes
     */
    autoPaletteAdjust() {
        if (this.data['palette-chooser'] === 'automatic') {
            let baseColor = new Tinycolor(this.data.baseColor);
            this.data.backgroundColor = baseColor.toHexString();
            this.data.titleColor = this.getReadable(new Tinycolor(this.data.baseColor), -1.6);
            this.data.mainColor = this.getReadable(new Tinycolor(this.data.baseColor), 1.8);
            this.data.optionsColor = this.getReadable(new Tinycolor(this.data.baseColor), 1.25);
        }
    }

    /**
     * Generates a palette of colors and then returns the most readable.
     *
     * @param {any} color The color to base the palette on.
     * @param {any} multiplier A value to scale the spin by to add some variance.
     * @return {any} The most readable color.
     */
    getReadable(color, multiplier) {
        return Tinycolor.mostReadable(color, [
            // My reckons for good color stops ::shrug::
            new Tinycolor(color.toHexString()).spin(multiplier * 38),
            new Tinycolor(color.toHexString()).spin(multiplier * 100),
            new Tinycolor(color.toHexString()).spin(multiplier * 190),
            new Tinycolor(color.toHexString()).spin(multiplier * 242),
            new Tinycolor(color.toHexString()).spin(multiplier * 303),
            new Tinycolor(color.toHexString()).spin(multiplier * 38).darken(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 100).darken(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 190).darken(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 242).darken(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 303).darken(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 38).brighten(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 100).brighten(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 190).brighten(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 242).brighten(25),
            new Tinycolor(color.toHexString()).spin(multiplier * 303).brighten(25),
        ], {
            includeFallbackColors: false,
        }).toHexString();
    }
}
