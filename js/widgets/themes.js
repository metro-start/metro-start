define(['jquery', 'spectrum-colorpicker', 'throttle-debounce', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'],
    function (jquery, spectrum, throttle_debounce, modal, util, storage, defaults, script) {
        var themes = {

            isBound: false,

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
                document.getElementById('author')
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
                document.getElementById('palette-chooser'),
                document.getElementById('background-chooser'),
                document.getElementById('trivariance-chooser'),
                document.getElementById('trisize-chooser'),
                document.getElementById('tristyle-chooser'),
            ],

            themeAdded: function () { },
            themeRemoved: function () { },

            init: function () {
                // this.data = defaults.defaultTheme;
                this.data = storage.get('currentTheme', defaults.defaultTheme);
                this.data = util.upgradeTheme(this.data, defaults.defaultTheme);

                this.elems.themeEditor.parentNode.removeChild(this.elems.themeEditor);
                this.elems.editThemeButton.addEventListener('click', this.openThemeEditor.bind(this));

                if (this.data.title === 'random theme') {
                    this.randomTheme();
                } else {
                    script.updateTheme(this.data, false);
                }

                // DEBUG
                var that = this;
                setTimeout(function () { that.elems.editThemeButton.click(); }, 500);
            },

            /**
             * Reset the input elements to match this.data.
             */
            resetInputs: function () {
                // Do not try to reset inputs if they haven't been bound.
                if (this.isBound) {
                    for (var i = 0; i < this.textInputs.length; i++) {
                        var inputElement = this.textInputs[i];
                        inputElement.value = !!this.data[inputElement.id] ? this.data[inputElement.id] : '';
                    }

                    for (var j = 0; j < this.colorInputs.length; j++) {
                        var value = this.data[this.colorInputs[j].id];
                        var color = jquery(this.colorInputs[j]);
                        color.spectrum("set", value);
                    }

                    for (var k = 0; k < this.selectInputs.length; k++) {
                        var text = this.data[this.selectInputs[k].id];
                        jquery('#' + this.selectInputs[k].id).metroSelect().set_active(text);
                    }

                }
            },

            /**
             * Shows the theme editor modal window.
             */
            openThemeEditor: function () {
                storage.save('previousTheme', this.data);
                modal.createModal('themeEditorModal', this.elems.themeEditor, this.themeEditorClosed.bind(this), 'save', 'cancel');

                if (!this.isBound) {
                    for (var i = 0; i < this.textInputs.length; i++) {
                        this.bindTextInput(this.textInputs[i]);
                    }

                    for (var j = 0; j < this.colorInputs.length; j++) {
                        this.bindColorInput(this.colorInputs[j]);
                    }

                    for (var k = 0; k < this.selectInputs.length; k++) {
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
            themeEditorClosed: function (res) {
                util.log('theme editor closed with result: ' + res);

                if (!res) {
                    // If the theme edior was canceled, reset the theme.
                    this.undoChanges();
                    return;
                }

                if (!this.data.title) {
                    this.data.title = this.data['trisize-chooser'][0];
                    this.data.title += this.data['tristyle-chooser'][0];
                    this.data.title += this.data['trivariance-chooser'][0];
                    this.data.title = this.data.title.toUpperCase() + ' ';

                    // Generate a title if none was provided.
                    this.data.title += tinycolor(this.data.backgroundColor).toString();
                }

                if (!this.data.author) {
                    this.data.newThemeAuthor = 'unknown';
                }

                this.data.online = false;

                var themesLocal = storage.get('themesLocal', []);
                themesLocal.push(this.data);
                storage.save('themesLocal', themesLocal);
                storage.save('currentTheme', this.data);

                this.themeAdded();
            },

            /**
             * Attaches event handlers to the given text field.
             * 
             * @param {any} inputElement The name of the text field.
             */
            bindTextInput: function (inputElement) {
                inputElement.value = !!this.data[inputElement.id] ? this.data[inputElement.id] : '';
                inputElement.addEventListener('input', this.updateText.bind(this, inputElement.id));
            },

            /**
             * Create new metro-select for the given inputElement.
             * 
             * @param {any} inputElement The name of the field to turn into a metro-select.
             */
            bindSelectInput: function (inputElement) {
                jquery(inputElement).metroSelect({
                    'initial': this.data[inputElement.id],
                    'onchange': this.updateSelect.bind(this, inputElement.id)
                });

                this.updateSelect(inputElement.id, this.data[inputElement.id]);
            },

            /**
             * Create new color picker element for the given inputElement.
             * 
             * @param {any} inputElement The name of the field to turn into a spectrum.
             */
            bindColorInput: function (inputElement) {
                jquery(inputElement).spectrum({
                    chooseText: 'save color',
                    replacerClassName: 'spectrum-replacer',
                    appendTo: inputElement.parentNode,
                    showButtons: false,
                    color: this.data[inputElement.id],
                    move: throttle_debounce.throttle(250, this.updateColor.bind(this, inputElement.id), true)
                });
            },

            /**
             * Handles changes to metro-select elements.
             * 
             * @param {any} inputElement The name of the metro-select that's changing.
             * @param {any} val The new value.
             */
            updateSelect: function (inputId, val) {
                if (inputId === 'background-chooser' || inputId === 'palette-chooser') {
                    var elems = document.getElementsByClassName(inputId.replace('chooser', 'section'));
                    for (var i = 0; i < elems.length; i++) {
                        // If this element has the same id as our new select value, make it visible.
                        if (elems[i].id === val) {
                            util.removeClass(elems[i], 'hide');
                            // Otherwise ensure its hidden.
                        } else if (!util.hasClass(elems[i], 'hide')) {
                            util.addClass(elems[i], 'hide');
                        }
                    }
                }

                this.updateCurrentTheme(inputId, val);
            },

            /**
             * Handles changes to text elements.
             * 
             * @param {any} inputElement The name of the text that's changing.
             * @param {any} event The event that contains the new value.
             */
            updateText: function (inputId, event) {
                this.updateCurrentTheme(inputId, event.target.value);
            },

            /**
             * Handles changes to color elements.
             * 
             * @param {any} inputElement The name of the color field that's changing.
             * @param {any} event The new color.
             */
            updateColor: function (inputId, color) {
                this.updateCurrentTheme(inputId, color.toHexString());
            },

            /**
             * Share a locally saved theme to the community.
             * 
             * @param {any} theme The theme to be shared.
             */
            shareTheme: function (theme) {
                var url = defaults.defaultWebservice + '/newtheme?' +
                    'title=' + encodeURIComponent(theme.title) +
                    '&author=' + encodeURIComponent(theme.author) +
                    '&maincolor=' + encodeURIComponent(theme.mainColor) +
                    '&optionscolor=' + encodeURIComponent(theme.optionsColor) +
                    '&titlecolor=' + encodeURIComponent(theme.titleColor) +
                    '&backgroundcolor=' + encodeURIComponent(themebackgroundColor);
                console.log('Shared theme with URL: ' + url);

                jquery.get(url, function (data) {
                    console.log(data);
                });
            },

            /**
             * Removes the provided theme from the local storage.
             * 
             * @param {any} theme The theme to be removed. Only checks by name.
             */
            removeTheme: function (theme) {
                var themesLocal = storage.get('themesLocal', [defaults.defaultTheme]);

                for (var i = 0; i < themesLocal.length; i++) {
                    if (theme.title === themesLocal[i].title) {
                        themesLocal.splice(i, 1);
                        break;
                    }
                }

                storage.save('themesLocal', themesLocal);
                this.themeRemoved();
            },

            /**
             * Randomizes the current thmee.
             */
            randomTheme: function () {
                for (var i = 0; i < this.colorInputs.length; i++) {
                    var color = util.randomColor();

                    jquery("#" + this.colorInputs[i].id).spectrum('set', color);
                    this.data[this.colorInputs[i].id] = color;
                }

                script.updateTheme(this.data, true);
            },

            /**
             * Updates the values provided in storage and then updates the theme.
             * 
             * @param {any} inputId The theme setting that has changed.
             * @param {any} val The new theme setting.
             */
            updateCurrentTheme: function (inputId, val) {
                util.logChange(inputId, val);

                if (inputId === 'currentTheme') {
                    this.data = val;
                } else {
                    this.data[inputId] = val;
                }

                this.automaticPalette();

                storage.save('currentTheme', this.data);
                script.updateTheme(this.data);
                this.resetInputs();
            },

            automaticPalette: function () {
                if (this.data['palette-chooser'] === 'automatic') {
                    var baseColor = tinycolor(this.data.baseColor);
                    this.data.backgroundColor = baseColor.toHexString();
                    this.data.titleColor = this.getReadable(tinycolor(this.data.baseColor), -1.6);
                    this.data.mainColor = this.getReadable(tinycolor(this.data.baseColor), 1.8);
                    this.data.optionsColor = this.getReadable(tinycolor(this.data.baseColor), 1.25);
                }
            },

            // TODO: Does undo still make sense?
            undoChanges: function () {
                var previousTheme = storage.get('previousTheme', this.data);
                script.updateTheme(previousTheme, true);
            },

            generateTitle: function () {
                var title = '';
                title += this.data['font-chooser'][0];
                title += this.data['palette-chooser'] === 'automatic' ? 'A' : 'C';
            },

            /**
             * Generates a palette of colors and then returns the most readable.
             * 
             * @param {any} color The color to base the palette on.
             * @param {any} multiplier A value to scale the spin by to add some variance.
             * @returns The most readable color.
             */
            getReadable: function (color, multiplier) {
                return tinycolor.mostReadable(color, 
                [
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
                ],
                { includeFallbackColors: false }).toHexString();
            }
        };

        return themes;
    });