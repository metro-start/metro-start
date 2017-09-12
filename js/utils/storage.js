define(['jquery', './util'], function Storage(jquery, util) {
    var storage = {
        cache: {},
        deferred: undefined,

        init: function() {
            if (!this.deferred) {
                this.deferred = jquery.Deferred();
                var that = this;
                chrome.storage.sync.get(null, function(container) {
                    that.cache = jquery.extend(that.cache, container);
                    that.deferred.resolve(that);
                });
            }
            
            return this.deferred.promise();
        },

        // Savs the provded data to both lcoal and shared stoarge.
        // key: The name of the property to save.
        // value: The value to be saved.
        save: function save(key, value) {
            if (this.cache) this.cache[key] = value;

            var obj = {};
            obj[key] = value;
            chrome.storage.sync.set(obj);
        },

        // Gets a value from the cache; note that chrome.storage.sync always wins.
        // key: The key to be retrieved.
        // defaultValue: The value to initialize all storages if the key does not exist.
        get: function get(key, defaultValue) {
            return util.isEmpty(this.cache[key]) ? defaultValue : this.cache[key];
        }
    };

    return storage;
});
