define(['angular'], function(angular) {
        return {
        /**
        Saves the key, value pair to localStorage.
        key: The name of the value to be saved.
        value: The value to be saved.
        */
        saveOnce: function saveOnce(key, value) {
            if (angular.isObject(value)) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, value);
            }
        },

        /**
        Saves the key, value pair to localStorage and chrome.storage.
        key: The name of the value to be saved.
        value: The value to be saved.
        */
        saveTwice: function saveTwice(key, value) {
            if (chrome.storage) {
                var obj = {};
                obj[key] = value;
                chrome.storage.sync.set(obj);
            }
            this.saveOnce(key, value);
        },

        /**
        Saves the key, value pair to angularjs scope, localStorage and chrome.storage.
        key: The name of the value to be saved.
        value: The value to be saved.
        scope: The angularjs scope of the current app.
        */
        saveThrice: function saveThrice(key, value, scope) {
            scope[key] = value;
            this.saveTwice(key, value);
        },

        /**
        Gets the value from localStorage, syncs chrome.storage and saves it to angularjs scope.
        Does not return the value beacuse it might need to make an async call.
        key: The key to be retrieved.
        defaultValue: The value to initialize all storages if the key does not exist.
        scope: The angularjs scope where the value will be saved.
        jsonify: A flag to identify whether the returned value should be parsed as JSON. Only applicable to localStorage.
        callback: A callback function to run when value has been retrieved.
    */
        get: function (key, defaultValue, scope, jsonify, callback) {
            var that = this;
            // If the value is in localStorage, retieve from there.
            var foundInLocalStorage = false;
            if (localStorage.getItem(key)) {
                if (jsonify) {
                    scope[key] = JSON.parse(localStorage.getItem(key));
                } else {
                    scope[key] = localStorage.getItem(key);
                }
                if (callback) callback();
                foundInLocalStorage = true;
                // If we found it, still make the async call for synced data to update the storages.
            } else {
                scope[key] = defaultValue;
                if (callback) callback();
            }
            if (chrome.storage) {
                chrome.storage.sync.get(key, function(container) {
                    scope.$apply(function () {
                        if (container[key]) {
                            // Save retrieved data to localStorage and scope.
                            that.saveOnce(key, container[key]);

                            that.saveThrice(key, container[key], scope);
                            if (callback) callback();
                            //
                            // if (!foundInLocalStorage) {
                            //     scope[key] = container[key];
                            // } else {
                            //     saveTwice()
                            // }
                        } else {
                            if (foundInLocalStorage) {
                                var obj = {};
                                obj[key] = scope[key];
                                chrome.storage.sync.set(obj);
                            } else {
                                // Save defaultValue to all three storages.
                                that.saveTwice(key, defaultValue);
                            }
                        }
                    });
                });
            }
        }
    };
});
