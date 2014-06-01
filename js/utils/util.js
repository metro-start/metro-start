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
        }
    };

    return utils;
});
