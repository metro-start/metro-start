define(['./defaults'], (defaults) => {
    // Speed up calls to hasOwnProperty
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
         * @param {any} data The theme to be upgraded.
         * @param {any} defaultTheme The theme to use to back-fill.
         * @return {any} The upgraded theme.
         */
        upgradeTheme: function(data, defaultTheme) {
            let theme = Object.assign({}, defaultTheme, data);

            // Upgrade the font.
            if (!defaults.defaultFonts.concat(['custom']).includes(data['font-chooser'])) {
                    theme['font-chooser'] = defaultTheme['font-chooser'];
            }

            // Upgrade any underscored colors.
            if (!!data.options_color && !data.optionsColor) {
                theme.optionsColor = data.options_color;
            }
            if (!!data.main_color && !data.mainColor) {
                theme.mainColor = data.main_color;
            }
            if (!!data.background_color && !data.backgroundColor) {
                theme.backgroundColor = data.background_color;
            }
            if (!!data.title_color && !data.titleColor) {
                theme.titleColor = data.title_color;
            }

            // Upgrade any theme.colors.
            if (data.colors) {
                if (!!data.colors.options_color && !data.optionsColor) {
                    theme.optionsColor = data.colors.options_color;
                }
                if (!!data.colors.main_color && !data.mainColor) {
                    theme.mainColor = data.colors.main_color;
                }
                if (!!data.colors.background_color && !data.backgroundColor) {
                    theme.backgroundColor = data.colors.background_color;
                }
                if (!!data.colors.title_color && !data.titleColor) {
                    theme.titleColor = data.colors.title_color;
                }
            }

            return theme;
        },
    };

    return util;
});
