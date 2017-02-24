define([], function Util() {
    // Speed up calls to hasOwnProperty
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    var util = {
        init: function () { },

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

        // Add a CSS class to a DOM element.
        // elem: The DOM element to be mondified.
        // newClass: The class to be applied to the node.
        addClass: function addClass(elem, newClass) {
            if (!!newClass) {
                var oldClasses = !!elem.className ? elem.className.split(' ') : [];
                if (oldClasses.indexOf(newClass) === -1) {
                    oldClasses.unshift(newClass);
                    elem.className = oldClasses.join(' ');
                }
            }
        },

        // Checks is a DOM element has a CSS class.
        // elem: The DOM element to be checked.
        // testlass: The class to be checked for.
        hasClass: function hasClass(elem, testClass) {
            var oldClass = elem.className.split(' ');
            return oldClass.indexOf(testClass) !== -1;
        },

        // Removes a CSS class from a DOM element.
        // elem: The DOM element to be modified.
        // className: The class to be addded to the node.
        removeClass: function removeClass(elem, className) {
            var oldClass = elem.className.split(' ');
            var index = oldClass.indexOf(className);
            if (index !== -1) {
                oldClass.splice(index, 1);
                elem.className = oldClass.join(' ');
            }
        },

        // Checks if the provided object is empty.
        // obj: The obj to test.
        // http://stackoverflow.com/questions/4994201/is-object-empty
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
        }
    };

    return util;
});
