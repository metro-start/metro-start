var util = (function() {
    return {
        maybe: function(func) {
            return function() {
                if(func) func(this.arguments);
            };
        }
    };
})();
