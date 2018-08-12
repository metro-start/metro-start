define(['jquery', 'tinycolor2', 'spectrum-colorpicker', 'throttle-debounce', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script', 'metro-select'],
    (jquery, tinycolor, spectrum, throttleDebounce, modal, util, storage, defaults, script) => {
        let themes = {

            isBound: false,

            sessionUpdateCount: 0,

            data: {},

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

            themeAdded: function() {},
            themeRemoved: function() {},

            init: function() {
                // this.data = defaults.defaultTheme;
                this.data = storage.get('currentTheme', defaults.defaultTheme);
                this.data = util.upgradeTheme(this.data, defaults.defaultTheme);

                this.elems.themeEditor.parentNode.removeChild(this.elems.themeEditor);
                this.elems.editThemeButton.addEventListener('click', this.openThemeEditor.bind(this));

                storage.save('currentTheme', script.updateTheme(this.data, false));
            },

            /**
             * Reset the input elements to match this.data.
             */
            resetInputs: function() {
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
            },

            /**
             * Shows the theme editor modal window.
             */
            openThemeEditor: function() {
                this.sessionUpdateCount = 0;

                this.data = storage.get('currentTheme', defaults.defaultTheme);
                storage.save('previousTheme', this.data);

                if (defaults.systemThemes.map((t) => t.title.toLowerCase()).includes(this.data.title.toLowerCase())) {
                    this.data.title = '';
                }

                modal.createModal('themeEditorModal', this.elems.themeEditor, this.themeEditorClosed.bind(this), 'save', 'cancel');

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
            },

            /**
             * Handles whwhen the theme editor modal is closed.
             *
             * @param {any} res How the modal was closed. True if the 'okay' option was selected.
             */
            themeEditorClosed: function(res) {
                util.log(`theme editor closed with result: ${res}`);

                if (!res) {
                    if (this.sessionUpdateCount !== 0) {
                        // If the theme edior was canceled, reset the theme.
                        this.data = storage.get('previousTheme', this.data);
                    }
                } else {
                    if (defaults.systemThemes.map((t) => t.title.toLowerCase()).includes(this.data.title.toLowerCase())) {
                        this.data.title = '';
                        modal.createModal(
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
                    let themesLocal = storage.get('themesLocal', []);
                    for (themeIndex in themesLocal) {
                        if (themesLocal[themeIndex].title.toLowerCase() === this.data.title.toLowerCase()) {
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
            bindTextInput: function(inputElement) {
                jquery(inputElement).on('input', (event) => {
                    let target = jquery(event.target);
                    if (target.data('lastval') !== target.val()) {
                        target.data('lastval', target.val());

                        this.data[inputElement.id] = target.val();
                    }
                });
            },

            /**
             * Create new metro-select for the given inputElement.
             *
             * @param {any} inputElement The name of the field to turn into a metro-select.
             */
            bindSelectInput: function(inputElement) {
                jquery(inputElement).metroSelect({
                    'initial': this.data[inputElement.id],
                    'onchange': this.updateSelect.bind(this, inputElement.id),
                });

                this.updateSelect(inputElement.id, this.data[inputElement.id]);
            },

            /**
             * Create new color picker element for the given inputElement.
             *
             * @param {any} inputElement The name of the field to turn into a spectrum.
             */
            bindColorInput: function(inputElement) {
                jquery(inputElement).spectrum({
                    chooseText: 'save color',
                    replacerClassName: 'spectrum-replacer',
                    appendTo: inputElement.parentNode,
                    showButtons: false,
                    color: this.data[inputElement.id],
                    move: throttleDebounce.throttle(250, this.updateColor.bind(this, inputElement.id), true),
                });
            },

            /**
             * Handles changes to metro-select elements.
             *
             * @param {any} inputId The name of the metro-select that's changing.
             * @param {any} val The new value.
             */
            updateSelect: function(inputId, val) {
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
                                util.removeClass(elems[i], 'hide');
                                // Otherwise ensure its hidden.
                            } else if (!util.hasClass(elems[i], 'hide')) {
                                util.addClass(elems[i], 'hide');
                            }
                        }
                        break;
                }

                this.updateCurrentTheme(inputId, val);
            },

            /**
             * Handles changes to color elements.
             *
             * @param {any} inputId The name of the color field that's changing.
             * @param {any} color The new color.
             */
            updateColor: function(inputId, color) {
                this.updateCurrentTheme(inputId, color.toHexString());
            },

            /**
             * Share a locally saved theme to the community.
             *
             * @param {any} theme The theme to be shared.
             */
            shareTheme: function(theme) {
                let url = `${defaults.defaultWebservice}/newtheme`;
                jquery.ajax({
                    url: url,
                    type: 'POST',
                    data: JSON.stringify(theme),
                    dataType: 'json',
                    success: function() {
                        util.log('Theme shared to the web.');
                    },
                    error: function(e) {
                        util.error('Theme was not shared to the web: ', e);
                    },
                });
            },

            /**
             * Removes the provided theme from the local storage.
             *
             * @param {any} theme The theme to be removed. Only checks by name.
             */
            removeTheme: function(theme) {
                let themesLocal = storage.get('themesLocal', []);

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
            updateCurrentTheme: function(inputId, val) {
                if (this.data[inputId] === val) {
                    return;
                }

                if (this.data['palette-chooser'] === 'automatic') {
                    this.autoPaletteAdjust();
                }

                this.sessionUpdateCount++;
                util.logChange(inputId, typeof val === 'object' ? JSON.stringify(val) : val);

                if (inputId === 'currentTheme') {
                    this.data = util.clone(val);

                    // Create an id, if one does not exist.
                    if (this.data.id) {
                        this.data.id = this.data.title + this.data.author + new Date().getUTCSeconds;
                    }

                    // If its an online theme, clear the 'metadata'.
                    if (this.data.isOnline) {
                        this.data.title = '';
                        this.data.author = '';
                    }

                    let updatedTheme = script.updateTheme(this.data, true);
                    storage.save('currentTheme', updatedTheme);
                } else {
                    this.data[inputId] = val;
                    script.updateTheme(this.data, true);
                }
            },

            autoPaletteAdjust: function() {
                let baseColor = tinycolor(this.data.baseColor);
                this.data.backgroundColor = baseColor.toHexString();
                this.data.titleColor = this.getReadable(tinycolor(this.data.baseColor), -1.6);
                this.data.mainColor = this.getReadable(tinycolor(this.data.baseColor), 1.8);
                this.data.optionsColor = this.getReadable(tinycolor(this.data.baseColor), 1.25);
            },

            /**
             * Generates a palette of colors and then returns the most readable.
             *
             * @param {any} color The color to base the palette on.
             * @param {any} multiplier A value to scale the spin by to add some variance.
             * @return {any} The most readable color.
             */
            getReadable: function(color, multiplier) {
                return tinycolor.mostReadable(color, [
                    // My reckons for good color stops :shrug:
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
                ], {
                    includeFallbackColors: false,
                }).toHexString();
            },
        };

        return themes;
    });
