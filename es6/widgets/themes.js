import MetroSelect from 'metro-select';
import '@simonwep/pickr/dist/themes/nano.min.css';
import {throttle} from 'throttle-debounce';
import modal from '../utils/modal';
import util from '../utils/util';
import storage from '../utils/storage';
import defaults from '../utils/defaults';
import script from '../utils/script';
import {shareTheme as postTheme} from '../utils/api';
// Lazy-load the color tools only when the theme editor is used.
let _tinycolor = null;
const getTinycolor = async () => {
    if (!_tinycolor) {
        const mod = await import('tinycolor2');
        _tinycolor = mod.default || mod;
    }
    return _tinycolor;
};
let pickrModule;
const getPickr = async () => {
    if (!pickrModule) {
        const module = await import('@simonwep/pickr');
        pickrModule = module.default;
    }
    return pickrModule;
};

export default {
    isBound: false,

    sessionUpdateCount: 0,

    data: {},

    oldTheme: {},

    colorPickers: new Map(),

    selectControls: new Map(),

    elems: {
        themeEditor: document.getElementById('themeEditor'),
        trianglify: document.getElementById('trianglifyButton'),
        editThemeButton: document.getElementById('editThemeButton'),
        solidSection: document.getElementById('solid'),
        trianglifySection: document.getElementById('trianglify'),
    },

    textInputs: [
        document.getElementById('title'),
        document.getElementById('author'),
    ],

    colorInputs: [
        document.getElementById('baseColor'),
        document.getElementById('backgroundColor'),
        document.getElementById('titleColor'),
        document.getElementById('mainColor'),
        document.getElementById('optionsColor'),
    ],

    selectInputs: [
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
    ],

    themeAdded() {},
    themeRemoved() {},

    init() {
        // this.data = defaults.defaultTheme;
        this.data = storage.get('currentTheme', defaults.defaultTheme);
        this.data = util.upgradeTheme(this.data, defaults.defaultTheme);
        this.oldTheme = this.data;

        this.elems.themeEditor.parentNode.removeChild(
            this.elems.themeEditor
        );
        this.elems.editThemeButton.addEventListener(
            'click',
            this.openThemeEditor.bind(this)
        );

        storage.save(
            'currentTheme',
            script.updateTheme(this.data, null, false)
        );
    },

    /**
     * Reset the input elements to match this.data.
     */
    resetInputs() {
        // Do not try to reset inputs if they haven't been bound.
        if (this.isBound) {
            for (let i = 0; i < this.textInputs.length; i++) {
                const inputElement = this.textInputs[i];
                inputElement.value = this.data[inputElement.id] || '';
            }

            for (let j = 0; j < this.colorInputs.length; j++) {
                const value = this.data.themeContent[this.colorInputs[j].id];
                this.colorPickers.get(this.colorInputs[j])?.setColor(value, true);
            }

            for (let k = 0; k < this.selectInputs.length; k++) {
                const text = this.data.themeContent[this.selectInputs[k].id];
                this.selectControls.get(this.selectInputs[k])?.select(text, {
                    emit: false,
                });
            }
        }
    },

    /**
     * Shows the theme editor modal window.
     */
    openThemeEditor() {
        this.sessionUpdateCount = 0;

        this.data = storage.get('currentTheme', defaults.defaultTheme);
        storage.save('previousTheme', this.data);

        if (
            defaults.systemThemes
                .map((t) => t.title.toLowerCase())
                .includes(this.data.title.toLowerCase())
        ) {
            this.data.title = '';
        }

        modal.createModal(
            'themeEditorModal',
            this.elems.themeEditor,
            this.themeEditorClosed.bind(this),
            'save',
            'cancel'
        );

        if (!this.isBound) {
            for (let i = 0; i < this.textInputs.length; i++) {
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
    },

    /**
     * Handles whwhen the theme editor modal is closed.
     *
     * @param {any} res How the modal was closed. True if the 'okay' option was selected.
     */
    themeEditorClosed(res) {
        util.log(`theme editor closed with result: ${res}`);

        if (!res) {
            if (this.sessionUpdateCount !== 0) {
                // If the theme edior was canceled, reset the theme.
                this.data = storage.get('previousTheme', this.data);
            }
        } else {
            if (
                defaults.systemThemes
                    .map((t) => t.title.toLowerCase())
                    .includes(this.data.title.toLowerCase())
            ) {
                this.data.title = '';
                modal.createModal(
                    'themeEditorModal',
                    `${this.data.title} already exists as a system theme.`,
                    null,
                    null,
                    'okay'
                );
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
            const themesLocal = storage.get('themesLocal', []);
            for (themeIndex in themesLocal) {
                if (
                    themesLocal[themeIndex].title.toLowerCase() ===
                    this.data.title.toLowerCase()
                ) {
                    themesLocal[themeIndex] = this.data;
                    themeFound = true;
                }
            }

            if (themeFound === false) {
                themesLocal.push(this.data);
            }

            storage.save('themesLocal', themesLocal);
            this.themeAdded();
        }

        this.updateCurrentTheme('currentTheme', this.data);
    },

    /**
     * Bind updates to text input elements.
     *
     * @param {any} inputElement The name of the field to collect inputs from.
     */
    bindTextInput(inputElement) {
        inputElement.addEventListener('input', (event) => {
            this.data[inputElement.id] = event.target.value;
        });
    },

    /**
     * Create new metro-select for the given inputElement.
     *
     * @param {any} inputElement The name of the field to turn into a metro-select.
     */
    bindSelectInput(inputElement) {
        const control = new MetroSelect(inputElement, {
            initial: this.data.themeContent[inputElement.id],
            onChange: this.updateSelect.bind(this, inputElement.id),
        });
        this.selectControls.set(inputElement, control);

        this.updateSelect(
            inputElement.id,
            this.data.themeContent[inputElement.id]
        );
    },

    /**
     * Create a Pickr color picker for the given input element.
     *
     * @param {any} inputElement The name of the field to turn into a color picker.
     */
    async bindColorInput(inputElement) {
        try {
            const Pickr = await getPickr();
            const picker = Pickr.create({
                el: inputElement,
                theme: 'nano',
                default: this.data.themeContent[inputElement.id],
                components: {
                    preview: true,
                    hue: true,
                    interaction: {
                        hex: true,
                        input: true,
                        save: true,
                    },
                },
            });
            const updateColor = throttle(125, (color) => {
                if (color) {
                    this.updateColor(inputElement.id, color.toHEXA().toString());
                }
            });
            picker.on('change', updateColor);
            picker.on('save', (color) => {
                updateColor(color);
                picker.hide();
            });
            this.colorPickers.set(inputElement, picker);
        } catch (error) {
            util.error(`Failed to load Pickr: ${error}`);
        }
    },


    /**
     * Handles changes to metro-select elements.
     *
     * @param {any} inputId The name of the metro-select that's changing.
     * @param {any} val The new value.
     */
    updateSelect(inputId, val) {
        if (this.data[inputId] === val) {
            return;
        }
        switch (inputId.toLowerCase()) {
        // These are the choosers that have something to hide.
        case 'background-chooser':
        case 'palette-chooser':
        case 'font-chooser':
        case 'fontfamily-chooser': {
            const elems = document.getElementsByClassName(
                `${inputId}-section`
            );
            for (let i = 0; i < elems.length; i++) {
                // If this element has the same id as our new select value, make it visible.
                const choice = elems[i].dataset.choice || elems[i].id;
                if (choice === val) {
                    util.removeClass(elems[i], 'hide');
                    // Otherwise ensure its hidden.
                } else if (!util.hasClass(elems[i], 'hide')) {
                    util.addClass(elems[i], 'hide');
                }
            }
            break;
        }
        }

        this.updateCurrentTheme(inputId, val);
    },

    /**
     * Handles changes to color elements.
     *
     * @param {any} inputId The name of the color field that's changing.
     * @param {string} color The new color.
     */
    updateColor(inputId, color) {
        if (this.data[inputId] === color) {
            return;
        }
        this.updateCurrentTheme(inputId, color);
    },

    /**
     * Share a locally saved theme to the community.
     *
     * @param {any} theme The theme to be shared.
     * @param {function} callback Function to call sharing completes.
     */
    async shareTheme(theme, callback) {
        try {
            await postTheme(defaults.defaultWebservice, theme);
            util.log('Theme shared to the web.');
            callback(true, '');
        } catch (error) {
            util.error(`Theme was not shared to the web: ${error}`);
            callback(false, String(error));
        }
    },

    /**
     * Removes the provided theme from the local storage.
     *
     * @param {any} theme The theme to be removed. Only checks by name.
     */
    removeTheme(theme) {
        const themesLocal = storage.get('themesLocal', []);

        for (let i = 0; i < themesLocal.length; i++) {
            if (theme.title === themesLocal[i].title) {
                themesLocal.splice(i, 1);
                break;
            }
        }

        storage.save('themesLocal', themesLocal);
        this.themeRemoved();
    },

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

        if (
            this.data.themeContent &&
            this.data.themeContent['palette-chooser'] === 'automatic'
        ) {
            this.autoPaletteAdjust();
        }

        this.sessionUpdateCount++;
        util.logChange(
            inputId,
            typeof val === 'object' ? JSON.stringify(val) : val
        );

        if (inputId === 'currentTheme') {
            this.data = util.clone(val);

            // Create an id, if one does not exist.
            if (!this.data.id) {
                this.data.id =
                    this.data.title +
                    this.data.author +
                    new Date().getTime();
            }

            // If its an online theme, clear the 'metadata'.
            if (this.data.online) {
                this.data.title = '';
                this.data.author = '';
                this.data.online = false;
            }

            const updatedTheme = script.updateTheme(
                this.data,
                this.oldTheme,
                true
            );
            this.oldTheme = updatedTheme;
            storage.save('currentTheme', updatedTheme);
        } else {
            this.data.themeContent[inputId] = val;
            const updatedTheme = script.updateTheme(
                this.data,
                this.oldTheme,
                true
            );
            this.oldTheme = updatedTheme;
        }
    },

    autoPaletteAdjust() {
        // Lazy-load tinycolor and compute palette asynchronously
        getTinycolor().then((tinycolor) => {
            try {
                const baseColor = tinycolor(this.data.themeContent.baseColor);
                this.data.themeContent.backgroundColor = baseColor.toHexString();

                const computeReadable = (color, multiplier) => {
                    return tinycolor
                        .mostReadable(
                            color,
                            [
                                tinycolor(color.toHexString()).spin(multiplier * 38),
                                tinycolor(color.toHexString()).spin(multiplier * 100),
                                tinycolor(color.toHexString()).spin(multiplier * 190),
                                tinycolor(color.toHexString()).spin(multiplier * 242),
                                tinycolor(color.toHexString()).spin(multiplier * 303),
                                tinycolor(color.toHexString()).spin(multiplier * 38).darken(25),
                                tinycolor(color.toHexString()).spin(multiplier * 100).darken(25),
                                tinycolor(color.toHexString()).spin(multiplier * 190).darken(25),
                                tinycolor(color.toHexString()).spin(multiplier * 242).darken(25),
                                tinycolor(color.toHexString()).spin(multiplier * 303).darken(25),
                                tinycolor(color.toHexString()).spin(multiplier * 38).brighten(25),
                                tinycolor(color.toHexString()).spin(multiplier * 100).brighten(25),
                                tinycolor(color.toHexString()).spin(multiplier * 190).brighten(25),
                                tinycolor(color.toHexString()).spin(multiplier * 242).brighten(25),
                                tinycolor(color.toHexString()).spin(multiplier * 303).brighten(25),
                            ],
                            { includeFallbackColors: false }
                        )
                        .toHexString();
                };

                this.data.themeContent.titleColor = computeReadable(
                    tinycolor(this.data.themeContent.baseColor),
                    -1.6
                );
                this.data.themeContent.mainColor = computeReadable(
                    tinycolor(this.data.themeContent.baseColor),
                    1.8
                );
                this.data.themeContent.optionsColor = computeReadable(
                    tinycolor(this.data.themeContent.baseColor),
                    1.25
                );

                // Apply updated theme
                const updatedTheme = script.updateTheme(this.data, this.oldTheme, true);
                this.oldTheme = updatedTheme;
                storage.save('currentTheme', updatedTheme);
            } catch (e) {
                util.error(`Failed to compute auto palette: ${  e}`);
            }
        }).catch((e) => {
            util.error(`Could not load tinycolor for auto palette: ${  e}`);
        });
    },

    /**
     * Generates a palette of colors and then returns the most readable.
     *
     * @param {any} color The color to base the palette on.
     * @param {any} multiplier A value to scale the spin by to add some variance.
     * @return {any} The most readable color.
     */
};
