define([], function Util() {
    // Speed up calls to hasOwnProperty
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    var util = {
        init: function () { 
            this.lastLogTime = Date.now();
        },

        /**
         * Log a message with a marker for how long since an event was logged.
         * 
         * @param {any} msg The message to log.
         */
        log: function(msg) {
            var time = Date.now();
            console.log('[+' + Math.floor((time - this.lastLogTime) / 1000) + 's] ' + msg);

            this.lastLogTime = time;
        },

        /**
         * Log a message that a field has changed.
         * 
         * @param {any} key The field that has been changed.
         * @param {any} val The value that was changed to.
         */
        logChange: function(key, val) {
            this.log('setting [' + key + '] to ' + val);
        },

        // Converts an HTML string to a DOM fragment.
        // htmlStr: The string to convert.
        createElement: function createDom(htmlStr) {
            var fragment = document.createDocumentFragment();
            if (htmlStr) {
                var temp = document.createElement('div');
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
            if (!!newClass) {
                var oldClasses = !!elem.className ? elem.className.split(' ') : [];
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
         * @returns 
         */
        hasClass: function hasClass(elem, testClass) {
            var oldClass = elem.className.split(' ');
            return oldClass.indexOf(testClass) !== -1;
        },

        /**
         * Removes a CSS class from a DOM element.
         * 
         * @param {any} elem The DOM element to be modified.
         * @param {any} className The class to be addded to the node.
         */
        removeClass: function removeClass(elem, className) {
            var oldClass = elem.className.split(' ');
            var index = oldClass.indexOf(className);
            if (index !== -1) {
                oldClass.splice(index, 1);
                elem.className = oldClass.join(' ');
            }
        },

        /**
         * Checks if the provided object is empty.
         * http://stackoverflow.com/questions/4994201/is-object-empty
         * 
         * @param {any} obj The obj to test.
         * @returns True if the object is null, undefined or empty. False otherwise.
         */
        isEmpty: function isEmpty(obj) {
            // null and undefined are "empty"
            if (obj === null || obj === undefined) return true;

            // numbers are not empty.
            if (typeof obj === 'number') return false;

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0) return false;
            if (obj.length === 0) return true;

            // If it isn't an object at this point
            // it is empty, but it can't be anything *but* empty
            // Is it empty?  Depends on your application.
            if (typeof obj !== "object") return true;

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        },

        /**
         * Genreates a random color.
         * http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
         * 
         * @returns A random color hex value.
         */
        randomColor: function () {
            var golden_ratio_conjugate = 0.618033988749895; // use golden ratio
            var h = Math.random(); // use random start value
            var s = 0.74;
            var v = 0.95;

            // HSV values in [0..1]
            h += golden_ratio_conjugate;
            h %= 1;

            // returns [r, g, b] values from 0 to 255
            var h_i = Math.floor(h * 6);
            var f = h * 6 - h_i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);
            var r = 0, g = 0, b = 0;

            if (h_i === 0) { r = v; g = t; b = p; }
            if (h_i === 1) { r = q; g = v; b = p; }
            if (h_i === 2) { r = p; g = v; b = t; }
            if (h_i === 3) { r = p; g = q; b = v; }
            if (h_i === 4) { r = t; g = p; b = v; }
            if (h_i === 5) { r = v; g = p; b = q; }

            var toHex = function (c) {
                var hex = Math.floor(c * 256).toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            };

            return '#' + toHex(r) + toHex(g) + toHex(b);
        },

        /**
         * Upgrade a provided theme to ensure it has all the right fields.
         * 
         * @param {any} data The theme to be upgraded.
         * @param {any} defaultTheme The theme to use to back-fill.
         * @returns The upgraded theme.
         */
        upgradeTheme: function(data, defaultTheme) {
            var theme = Object.assign({}, defaultTheme, data);
      
            if (!!data.author) {
              theme.author = data.author;
            }
            if (!!data.title) {
              theme.title = data.title;
            }
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
      
            return theme;
        }
    };

    return util;
});
