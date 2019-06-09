define(['./defaults'], (defaults) => {
    // Speed up calls to hasOwnProperty
    let loggingEnabled = true;
    let hasOwnProperty = Object.prototype.hasOwnProperty;

    let util = {
        init: function() {
            this.lastLogTime = Date.now();
        },

        /**
         * Log a message with a marker for how long since an event was logged.
         *
         * @param {any} msg The message to log.
         */
        log: function(msg) {
            if (!loggingEnabled) {
                return;
            }

            let time = Date.now();
            // eslint-disable-next-line no-console
            console.log(`[+${Math.floor((time - this.lastLogTime) / 1000)}s] ${msg}`);

            this.lastLogTime = time;
        },

        /**
         * Log a warning with a marker for how long since an event was logged.
         *
         * @param {any} msg The warning to log.
         */
        warn: function(msg) {
            if (!loggingEnabled) {
                return;
            }

            let time = Date.now();
            // eslint-disable-next-line no-console
            console.warn(`[+${Math.floor((time - this.lastLogTime) / 1000)}s] ${msg}`);

            this.lastLogTime = time;
        },

        /**
         * Log an error with a marker for how long since an event was logged.
         *
         * @param {any} msg  The error to log.
         */
        error: function(msg) {
            if (!loggingEnabled) {
                return;
            }

            let time = Date.now();
            // eslint-disable-next-line no-console
            console.error(`[+${Math.floor((time - this.lastLogTime) / 1000)}s] ${msg}`);
            this.lastLogTime = time;
        },

        /**
         * Log a message that a field has changed.
         *
         * @param {any} key The field that has been changed.
         * @param {any} val The value that was changed to.
         */
        logChange: function(key, val) {
            if (!loggingEnabled) {
                return;
            }

            this.log(`setting [${key}] to ${val}`);
        },

        // Converts an HTML string to a DOM fragment.
        // htmlStr: The string to convert.
        createElement: function createDom(htmlStr) {
            let fragment = document.createDocumentFragment();
            if (htmlStr) {
                let temp = document.createElement('div');
                temp.innerHTML = htmlStr;
                fragment.appendChild(temp.firstElementChild);
            }
            return fragment;
        },

        /**
         * Add a CSS class to a DOM element.
         *
         * @param {any} elem The DOM element to be mondified.
         * @param {any} newClass The class to be applied to the node.
         */
        addClass: function addClass(elem, newClass) {
            if (newClass) {
                let oldClasses = elem.className ? elem.className.split(' ') : [];
                if (oldClasses.indexOf(newClass) === -1) {
                    oldClasses.unshift(newClass);
                    elem.className = oldClasses.join(' ');
                }
            }
        },

        /**
         * Checks is a DOM element has a CSS class.
         *
         * @param {any} elem The DOM element to be checked.
         * @param {any} testClass The class to be checked for.
         * @return {any} True if the elem has the class; false otherwise.
         */
        hasClass: function hasClass(elem, testClass) {
            let oldClass = elem.className.split(' ');
            return oldClass.indexOf(testClass) !== -1;
        },

        /**
         * Removes a CSS class from a DOM element.
         *
         * @param {any} elem The DOM element to be modified.
         * @param {any} className The class to be addded to the node.
         */
        removeClass: function removeClass(elem, className) {
            let oldClass = elem.className.split(' ');
            let index = oldClass.indexOf(className);
            if (index !== -1) {
                oldClass.splice(index, 1);
                elem.className = oldClass.join(' ');
            }
        },

        clone: function clone(elem) {
            return JSON.parse(JSON.stringify(elem));
        },

        /**
         * Checks if the provided object is empty.
         * http://stackoverflow.com/questions/4994201/is-object-empty
         *
         * @param {any} obj The obj to test.
         * @return {any} True if the object is null, undefined or empty. False otherwise.
         */
        isEmpty: function isEmpty(obj) {
            // null and undefined are 'empty'
            if (obj === null || obj === undefined) {
                return true;
            }

            // numbers are not empty.
            if (typeof obj === 'number') {
                return false;
            }

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0) {
                return false;
            }
            if (obj.length === 0) {
                return true;
            }

            // If it isn't an object at this point
            // it is empty, but it can't be anything *but* empty
            // Is it empty?  Depends on your application.
            if (typeof obj !== 'object') {
                return true;
            }

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (let key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Selects an item from an array at random.
         * @param {any} arr Array to retrieve a random element of.
         * @return {any} A random item.
         */
        randomize: function(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        },

        /**
         * Upgrade a provided theme to ensure it has all the right fields.
         *
         * @param {any} oldTheme The theme to be upgraded.
         * @param {any} defaultTheme The theme to use to back-fill.
         * @return {any} The upgraded theme.
         */
        upgradeTheme: function(oldTheme, defaultTheme) {
            if (!oldTheme.themeContent) {
                return this.upgradeOldTheme(oldTheme, defaultTheme);
            }

            let themeContent = Object.assign({}, defaultTheme.themeContent, oldTheme.themeContent);
            let theme = Object.assign({}, defaultTheme, oldTheme);

            theme.themeContent = themeContent;

            // Upgrade the font.
            if (!defaults.defaultFonts.concat(['custom']).includes(oldTheme.themeContent['font-chooser'])) {
                theme.themeContent['font-chooser'] = defaultTheme.themeContent['font-chooser'];
            }

            // Upgrade any underscored colors.
            if (!!oldTheme.themeContent.options_color && !oldTheme.themeContent.optionsColor) {
                theme.themeContent.optionsColor = oldTheme.themeContent.options_color;
            }
            if (!!oldTheme.themeContent.main_color && !oldTheme.themeContent.mainColor) {
                theme.themeContent.mainColor = oldTheme.themeContent.main_color;
            }
            if (!!oldTheme.themeContent.background_color && !oldTheme.themeContent.backgroundColor) {
                theme.themeContent.backgroundColor = oldTheme.themeContent.background_color;
            }
            if (!!oldTheme.themeContent.title_color && !oldTheme.themeContent.titleColor) {
                theme.themeContent.titleColor = oldTheme.themeContent.title_color;
            }

            // Upgrade any theme.colors.
            if (oldTheme.themeContent.colors) {
                if (!!oldTheme.themeContent.colors.options_color && !oldTheme.themeContent.optionsColor) {
                    theme.themeContent.optionsColor = oldTheme.themeContent.colors.options_color;
                }
                if (!!oldTheme.themeContent.colors.main_color && !oldTheme.themeContent.mainColor) {
                    theme.themeContent.mainColor = oldTheme.themeContent.colors.main_color;
                }
                if (!!oldTheme.themeContent.colors.background_color && !oldTheme.themeContent.backgroundColor) {
                    theme.themeContent.backgroundColor = oldTheme.themeContent.colors.background_color;
                }
                if (!!oldTheme.themeContent.colors.title_color && !oldTheme.themeContent.titleColor) {
                    theme.themeContent.titleColor = oldTheme.themeContent.colors.title_color;
                }
            }

            return theme;
        },

        upgradeOldTheme: function(oldTheme, defaultTheme) {
            let metadataFields = ['title', 'author', 'online'];
            let themeContentFields = {
                'optionsColor': 'options_color',
                'mainColor': 'main_color',
                'titleColor': 'title_color',
                'backgroundColor': 'background_color',
            };

            // Ensure we don't miss any field names.
            for (let defaultField in defaultTheme.themeContent) {
                if (!Object.keys(themeContentFields).includes(defaultField)) {
                    themeContentFields[defaultField] = defaultField;
                }
            }

            const valueForMetadata = (obj, field) => {
                if (obj[field]) {
                    return obj[field];
                }
                // Do not try to re-use default metadata.
                return '';
            };
            const valueForPossibleField = (obj, field) => {
                if (obj.themeContent) {
                    // If we have themecontent, that's the most up to date so grab that first.
                    return valueForPossibleField(obj.themeContent, field);
                }
                if (obj.colors) {
                    // If we have colors, that probably something we need so grab that next.
                    return valueForPossibleField(obj.colors, field);
                }
                if (obj[field]) {
                    // If we have it in the current object.
                    return obj[field];
                }
                if (obj[themeContentFields[field]]) {
                    // Check the old name just in case.
                    return obj[themeContentFields[field]];
                }
                // Fallback to default.
                return defaultTheme[field];
            };

            let newTheme = {themeContent: {}};

            for (let metadataField of metadataFields) {
                newTheme[metadataField] = valueForMetadata(oldTheme, metadataField);
            }

            for (let valueField of Object.keys(themeContentFields)) {
                newTheme.themeContent[valueField] = valueForPossibleField(oldTheme, valueField);
            }

            // Upgrade the font.
            if (!defaults.defaultFonts.concat(['custom']).includes(newTheme.themeContent['font-chooser'])) {
                newTheme.themeContent['font-chooser'] = defaultTheme.themeContent['font-chooser'];
            }

            return newTheme;
        },
    };

    return util;
});
