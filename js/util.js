define([], function Util() {
    return {
        maybe: function maybe(func) {
            return function() {
                if(func) return func(this.arguments);
            };
        },

        getJSON: function getJSON(str) {
            try {
                return JSON.parse(str);
            } catch(e) {
                return str;
            }
        }
    };
});
