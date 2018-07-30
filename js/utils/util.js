/**
 * Shared utilities.
 *
 * @export
 * @class Util
 */
export default class Util {
    /**
     *Creates an instance of Util.
     * @memberof Util
     */
    constructor() {
        this.lastLogTime = Date.now();
    }

    /**
     * Log a message with a marker for how long since an event was logged.
     *
     * @param {any} msg The message to log.
     */
    static log(msg) {
        let time = Date.now();
        // eslint-disable-next-line no-console
        console.log(`[+${Math.floor((time - this.lastLogTime) / 1000)}s] ${msg}`);

        this.lastLogTime = time;
    }

    /**
     * Log a warning with a marker for how long since an event was logged.
     *
     * @param {any} msg The warning to log.
     */
    static warn(msg) {
        let time = Date.now();
        // eslint-disable-next-line no-console
        console.warn(`[+${Math.floor((time - this.lastLogTime) / 1000)}s] ${msg}`);

        this.lastLogTime = time;
    }

    /**
     * Log an error with a marker for how long since an event was logged.
     *
     * @param {any} msg  The error to log.
     */
    static error(msg) {
        let time = Date.now();
        // eslint-disable-next-line no-console
        console.error(`[+${Math.floor((time - this.lastLogTime) / 1000)}s] ${msg}`);

        this.lastLogTime = time;
    }

    /**
     * Log a message that a field has changed.
     *
     * @param {any} key The field that has been changed.
     * @param {any} val The value that was changed to.
     */
    static logChange(key, val) {
        this.log(`setting [${key}] to ${val}`);
    }

    /**
     * Converts an HTML string to a DOM fragment.
     *
     * @memberof Util
     * @return {*} The converted fragment.
     * @param {*} htmlStr The string to convert.
     */
    static createElement(htmlStr) {
        let fragment = document.createDocumentFragment();
        if (htmlStr) {
            let temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            fragment.appendChild(temp.firstElementChild);
        }
        return fragment;
    }

    /**
     * Add a CSS class to a DOM element.
     *
     * @param {any} elem The DOM element to be mondified.
     * @param {any} newClass The class to be applied to the node.
     */
    static addClass(elem, newClass) {
        if (newClass) {
            let oldClasses = elem.className ? elem.className.split(' ') : [];
            if (oldClasses.indexOf(newClass) === -1) {
                oldClasses.unshift(newClass);
                elem.className = oldClasses.join(' ');
            }
        }
    }

    /**
     * Checks is a DOM element has a CSS class.
     *
     * @param {any} elem The DOM element to be checked.
     * @param {any} testClass The class to be checked for.
     * @return {any} True if the elem has the class; false otherwise.
     */
    static hasClass(elem, testClass) {
        let oldClass = elem.className.split(' ');
        return oldClass.indexOf(testClass) !== -1;
    }

    /**
     * Removes a CSS class from a DOM element.
     *
     * @param {any} elem The DOM element to be modified.
     * @param {any} className The class to be addded to the node.
     */
    static removeClass(elem, className) {
        let oldClass = elem.className.split(' ');
        let index = oldClass.indexOf(className);
        if (index !== -1) {
            oldClass.splice(index, 1);
            elem.className = oldClass.join(' ');
        }
    }

    /**
     * Clones an element using JSON.
     *
     * @param {*} elem The element to clone.
     * @return {any} The cloned element.
     * @memberof Util
     */
    static clone(elem) {
        return JSON.parse(JSON.stringify(elem));
    }

    /**
     * Checks if the provided object is empty.
     * http://stackoverflow.com/questions/4994201/is-object-empty
     *
     * @param {any} obj The obj to test.
     * @return {any} True if the object is null, undefined or empty. False otherwise.
     */
    static isEmpty(obj) {
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
    }

    /**
     * Selects an item from an array at random.
     * @param {any} arr Array to retrieve a random element of.
     * @return {any} A random item.
     */
    static randomize(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Upgrade a provided theme to ensure it has all the right fields.
     *
     * @param {any} data The theme to be upgraded.
     * @param {any} backfillTheme The theme to use to back-fill.
     * @return {any} The upgraded theme.
     */
    static upgradeTheme(data, backfillTheme) {
        let theme = Object.assign({}, backfillTheme, data);

        // Upgrade the font.
        switch (data['font-chooser']) {
            case 'system':
            case 'raleway':
            case 'custom':
                break;

            default:
                theme['font-chooser'] = backfillTheme['font-chooser'];
                break;
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
    }
}
