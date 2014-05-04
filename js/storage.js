
var storage = (function () {
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
        }
    };
})();
