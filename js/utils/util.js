define(['utils/defaults', 'utils/script', 'utils/storage'], function Utils(defaults, script, storage) {
    var utils = {
        init: function(document) { },

        maybe: function maybe(func) {
            return function() {
                if(func) return func(this.arguments);
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

        addClass: function addClass(elem, newClass) {
            var oldClass = elem.className.split(' ');
            if(oldClass.indexOf(newClass) !== -1) {
                return;
            } else {
                oldClass.unshift(newClass);
                elem.className = oldClass.join(' ');
            }
        }
    };

    return utils;
});
