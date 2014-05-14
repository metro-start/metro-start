var util = (function() {
    return {
        maybe: function(func) {
            return function() {
                if(func) return func(this.arguments);
            };
        }
    };
})();
