define(['utils/defaults', 'utils/script', 'utils/storage'], function Utils(defaults, script, storage) {
    var utils = {
        init: function(document) { },

        maybe: function maybe(func) {
            return function() {
                if(func) return func(this.arguments);
            };
        },

        curry: function(arg, func) {
            return function() {
                func(arg);
            };
        },

        getJSON: function getJSON(str) {
            var res = {};
            try {
                return JSON.parse(str);
            } catch(e) {
                return str;
            }
        },

        createElement: function createDom(htmlStr) {
            var fragment = document.createDocumentFragment();
            if (htmlStr) {
                var temp = document.createElement('div');
                temp.innerHTML = htmlStr;
                fragment.appendChild(temp.firstElementChild);
            }
            return fragment;
        },

        addClass: function addClass(elem, newClass) {
            var oldClass = elem.className.split(' ');
            if (oldClass.indexOf(newClass) === -1) {
                oldClass.unshift(newClass);
                elem.className = oldClass.join(' ');
            }
        },

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
