define(['jquery'], function Storage(jquery) {
    // Saves the key, value pair to chrome.storage.sync.
    // key: The name of the value to be saved.
    // value: The value to be saved.
    var storage = {
        cache: undefined,

        deferred: undefined,

        // Initializes the module.
        init: function() {
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

        // Savs the provded data to both lcoal and shared stoarge.
        // key: The name of the property to save.
        // value: The value to be saved.
        // scope: A location to store the value after it has been written.
        // Remarks: Scope is generally used to update an object with
        // the new value after saving it.
        save: function save(key, value, scope) {
            if (scope) scope[key] = value;
            if (this.cache) this.cache[key] = value;

            var obj = {};
            obj[key] = value;
            chrome.storage.sync.set(obj);
        },

        // Gets a value from the cache; note that chrome.storage.sync always wins.
        // key: The key to be retrieved.
        // defaultValue: The value to initialize all storages if the key does not exist.
        // scope: The angularjs scope where the value will be saved.
        // callback: A callback function to run when value has been retrieved.
        get: function get(key, defaultValue, scope) {
            var val = (this.cache !== null && this.cache[key] !== null) ? this.cache[key] : defaultValue;
            if (scope) {
                scope[key] = val;
            }
            return val;
        }
    };

    return storage;
});
