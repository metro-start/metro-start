define(['util', 'jquery'], function Storage(util, jquery) {
    var storage = {
        /**
        Saves the key, value pair to chrome.storage.sync.
        key: The name of the value to be saved.
        value: The value to be saved.
        */
        cache: undefined,

        deferred: undefined,

        save: function save(key, value, scope) {
            var obj = {};
            obj[key] = value;
            if (scope) scope[key] = value;
            chrome.storage.sync.set(obj);
        },

        getAll: function getAll() {
            if (!this.deferred) {
                this.cache = {};
                this.deferred = jquery.Deferred();
                var that = this;
                chrome.storage.sync.get(null, function(container) {
                    jquery.each(container, function (key, value) {
                        that.cache[key] = value;
                    });
                    that.deferred.resolve(that);
                });
            }
            return this.deferred.promise();
        },

        /**
        Gets the value from the cache.
        chrome.storage.sync always wins.
        key: The key to be retrieved.
        defaultValue: The value to initialize all storages if the key does not exist.
        scope: The angularjs scope where the value will be saved.
        callback: A callback function to run when value has been retrieved.
        */
        get: function get(key, defaultValue, scope) {
            var val = (this.cache && this.cache[key]) ? this.cache[key] : defaultValue;
            if (scope) {
                scope[key] = val;
            }
            return val;
        }
    };

    return storage.getAll();
});
