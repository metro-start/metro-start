define(['./defaults', './storage'], function Utils(defaults, storage) {
    var utils = {
        init: function() { },

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
            if(index !== -1) {
                oldClass.splice(index, 1);
                elem.className = oldClass.join(' ');
            }
        }
    };

    return utils;
});
