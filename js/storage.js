var storage = (function () {
    return {
        /**
        Saves the key, value pair to chrome.storage.sync.
        key: The name of the value to be saved.
        value: The value to be saved.
        */
        save: function save(key, value) {
            if (chrome.storage) {
                var obj = {};
                obj[key] = value;
                chrome.storage.sync.set(obj);
            } else {
                if (angular.isObject(value)) {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, value);
                }
            }
        },

        getAll: function getAll(scope, callback) {
            var callbackWrapper = util.maybe(calback);
            chrome.storage.sync.get(null, function(container) {
                container.keys().forEach(function(key) {
                    scope[key] = container[key];
                });
                callbackWrapper();
            });
        },

        /**
        Gets the value from localStorage, syncs chrome.storage and saves it to angularjs scope.
        chrome.storage.sync always wins.
        key: The key to be retrieved.
        defaultValue: The value to initialize all storages if the key does not exist.
        scope: The angularjs scope where the value will be saved.
        callback: A callback function to run when value has been retrieved.
        */
        get: function get(key, defaultValue, scope, callback) {
            var that = this;
            var callbackWrapper = util.maybe(callback);

            if (chrome.storage) {
                chrome.storage.sync.get(key, function(container) {
                    scope[key] = container[key] ? container[key] : defaultValue;
                    callbackWrapper();
                });
            } else {
                var value = util.getJSON(localStorage.getItem(key));
                scope[key] = value ? value : defaultValue;
                callbackWrapper();
            }
        }
    };
})();
