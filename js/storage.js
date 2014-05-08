var storage = (function () {
    return {
        /**
        Saves the key, value pair to localStorage.
        key: The name of the value to be saved.
        value: The value to be saved.
        */
        saveLocal: function saveLocal(key, value) {
            if (angular.isObject(value)) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, value);
            }
        },

        /**
        Saves the key, value pair to chrome.storage.sync.
        key: The name of the value to be saved.
        value: The value to be saved.
        */
        saveRemote: function saveRemote(key, value) {
            if (chrome.storage) {
                var obj = {};
                obj[key] = value;
                chrome.storage.sync.set(obj);
            }
        },

        /**
        Saves the key, value pair to localStorage and chrome.storage.
        key: The name of the value to be saved.
        value: The value to be saved.
        */
        saveModel: function saveModel(key, value) {
            this.saveLocal(key, value);
            this.saveRemote(key, value);
        },

        /**
        Saves the key, value pair to angularjs scope, localStorage and chrome.storage.
        key: The name of the value to be saved.
        value: The value to be saved.
        scope: The angularjs scope of the current app.
        */
        saveAll: function saveAll(key, value, scope) {
            this.saveModel(key, value);
            scope[key] = value;
        },

        /**
        Figures out if the passed parameter is JSON or not.
        str: String to test.
        */
        getJSON: function getJSON(str) {
            var res = {};
            try {
                return JSON.parse(str);
            } catch(e) {
                return str;
            }
        },

        /**
        Gets the value from localStorage, syncs chrome.storage and saves it to angularjs scope.
        chrome.storage.sync always wins.
        key: The key to be retrieved.
        defaultValue: The value to initialize all storages if the key does not exist.
        scope: The angularjs scope where the value will be saved.
        callback: A callback function to run when value has been retrieved.
    */
        get: function (key, defaultValue, scope, callback) {
            var that = this;
            callback = util.maybe(callback);

            var value = this.getJSON(localStorage.getItem(key));
            scope[key] = value ? value : defaultValue;
            callback();
            chrome.storage.sync.get(key, function(container) {
                if (container[key]) {
                    that.saveLocal(key, container[key]);
                    scope.$apply(function () {
                        scope[key] = container[key];
                        callback();
                    });
                }
            });
        }
    };
})();
