var util = (function() {
    return {
        maybe: function(func) {
            return function() {
                if(func) func(this.arguments);
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
})();
