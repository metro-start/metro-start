
var Storage = function (localStorage) {
    this.localStorage = localStorage;

    /**
    Saves the key, value pair to localStorage.
    key: The name of the value to be saved.
    value: The value to be saved.
    */
    this.saveOnce = function saveOnce(key, value) {
        if (angular.isObject(value)) {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
    };

    /**
    Saves the key, value pair to localStorage and chrome.storage.
    key: The name of the value to be saved.
    value: The value to be saved.
    */
    this.saveTwice = function saveTwice(key, value) {
        if (chrome.storage) chrome.storage.sync.set({ key: value });
        saveOnce(key, value);
    };

    /**
    Saves the key, value pair to angularjs scope, localStorage and chrome.storage.
    key: The name of the value to be saved.
    value: The value to be saved.
    scope: The angularjs scope of the current app.
    */
    this.saveThrice = function saveThrice(key, value, scope) {
        scope[key] = value;
        saveTwice(key, value);
    };
};
