/**
    The default theme for metro start.
*/
var defaultTheme = {
    'title': 'metro start',
    'colors': {
        'options-color': '#ff0000',
        'main-color': '#ffffff',
        'title-color': '#4a4a4a',
        'background-color': '#000000'
    }
};

var defaultSort = {
    'links': false,
    'apps': false,
    'bookmarks': false,
    'themes': false
};

/**
    Saves the key, value pair to localStorage.
    key: The name of the value to be saved.
    value: The value to be saved.
*/
var saveOnce = function(key, value) {
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
var saveTwice = function(key, value) {
    if (chrome.storage) chrome.storage.sync.set({ key: value });
    if (angular.isObject(value)) {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        localStorage.setItem(key, value);
    }
};

/**
    Saves the key, value pair to angularjs scope, localStorage and chrome.storage.
    key: The name of the value to be saved.
    value: The value to be saved.
    scope: The angularjs scope of the current app.
*/
var saveThrice = function(key, value, scope) {
    scope[key] = value;
    saveTwice(key, value);
};

/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
var Pages = function(newRows, sorted, pageItemCount, getFunction) {
    this.pageItemCount = pageItemCount;
    this.sorted = sorted;
    this.pages = [[]];

    /**
        Defult function to retrieve the actionable member of the collection's items.
        elem: The object that contains the element to be used.
        returns: The element that should be used.
    */
    this.getFunction = function(elem) { return elem; };

    /**
        Add an item to the collection.
        row: The item being added.
    */
    this.add = function(row) {
        // If the last column is full, add a new column.
        if (this.pages[this.pages.length - 1].length >= this.pageItemCount) {
            this.pages.push([]);
        }
        // Add item to last column.
        this.pages[this.pages.length - 1].push(row);
        if (this.sorted) this.sort();
    };

    /**
        Get an item from the collection.
        page: The page/column where the item is located.
        index: The item's index in that page.
    */
    this.get = function(col, row) {
        return this.pages[col][row];
    };
    /**
        Remove an item from the collection.
        page: The page/column where the item is located.
        index: The item's index in that page.
    */
    this.remove = function(page, index) {
        this.pages[page].splice(index, 1);
        // Shift items back from forward pages to fill the hole.
        for (var i = page; i < this.pages.length - 1; i++) {
            this.pages[i].push(this.pages[i + 1].shift());
        }
        // The the last page is now empty, pop it.
        if (this.pages.length > 1 && this.pages[this.pages.length - 1].length === 0)
            this.pages.pop();

        if (this.sorted) this.sort();
    };

    /**
        Add all elements in the array to the object.
        newRows: The array of elements to be added.
    */
    this.addAll = function(newRows) {
        for (index = 0; index < newRows.length; index++) {
            this.add(newRows[index]);
        }
        if (this.sorted) this.sort();
    };

    /**
        Sort elements in the collection alphabetically in descending order
    */
    this.sort = function() {
        if (this.sorted === false) {
            this.sorted = true;
            var sorted = this.flatten().sort(function(a, b) {
                if (getFunction(a) > getFunction(b)) {
                    return 1;
                } else if(getFunction(a) < getFunction(b)) {
                    return -1;
                } else {
                    return 0;
                }
            });
            this.pages = [[]];
            this.addAll(sorted);
        }
    };
    /**
        Flatten the collection and turn it into a 1D array.
        returns: The array in 1D format.
    */
    this.flatten = function() {
        return this.pages.reduce(function(a, b) { return a.concat(b); });
    };

    /**
        Set the number of items per page.
        pageItemCount: The new number of items per page.
    */
    this.setPageItemCount = function(pageItemCount) {
        this.pageItemCount = pageItemCount;
        var list = this.flatten();
        this.pages = [[]];
        this.addAll(list);
    };

    /*
        Ininitializes the collection.
    */
    this.getFunction = getFunction;
    if (newRows) this.addAll(newRows);
};

/**
    Upgrades the version of metrostart installed by moving all saved data to new format.
*/
var checkAndUpgradeVersion = function() {
    var newVersion = chrome.app.getDetails().version;
    var lastVersion = localStorage.getItem('version');
    // This means <= 4.2.2 or first run
    if (lastVersion === null) {
        // Check if links exists. If it does, then its an upgrade.
        if (localStorage.getItem('links') !== null) {
            saveTwice('page', localStorage.getItem('active'));
            saveTwice('links', localStorage.getItem('links'));
            saveTwice('localThemes', localStorage.getItem('themes'));

            var theme = {
                'title': '',
                'colors': {
                    'options-color': localStorage.getItem('options-color'),
                    'main-color': localStorage.getItem('main-color'),
                    'title-color': localStorage.getItem('title-color'),
                    'background-color': localStorage.getItem('background-color')
                }
            };
            saveTwice('theme', theme);

            saveTwice('font', localStorage.getItem('font'));

            saveTwice('locat', localStorage.getItem('locat'));

            if (localStorage.getItem('unit') == 'fahrenheit') {
                saveTwice('weatherUnit', 0);
            } else {
                saveTwice('weatherUnit', 1);
            }

            if (localStorage.getItem('hide_weather') === false) {
                saveTwice('weatherToggleText', 'hide weather');
            } else {
                saveTwice('weatherToggleText', 'show weather');
            }
        }
        localStorage.setItem('version', newVersion);
    } else if(lastVersion != newVersion) {
        localStorage.setItem('version', newVersion);
    }
};

/**
    Tries to get the value from localStorage.
    If it fails, checks chrome.storage.
    Retrieves the value and saves it to the angularjs scope.
    Does not return the value beacuse it might need to make an async call.
    key: The key to be retrieved.
    defaultValue: The value to initialize all storages if the key does not exist.
    scope: The angularjs scope where the value will be saved.
    jsonify: A flag to identify whether the returned value should be parsed as JSON.
        Only applicable to localStorage.
    callback: A callback function to run when value has been retrieved.
*/
var getLocalOrSync = function (key, defaultValue, scope, jsonify, callback) {
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
    if (chrome.strorage) {
        chrome.storage.sync.get(key, function(container) {
            scope.$apply(function () {
                if (container[key]) {
                    // Save retrieved data to localStorage and scope.
                    if (jsonify) {
                        localStorage.setItem(key, JSON.stringify(container[key]));
                    } else {
                        localStorage.setItem(key, container[key]);
                    }

                    if (!foundInLocalStorage){
                        scope[key] = container[key];
                        if (callback) callback();
                    }
                } else {
                    if (foundInLocalStorage) {
                        chrome.storage.sync.set({ key: scope[key] });
                    } else {
                        // Save defaultValue to all three storages.
                        saveTwice(key, defaultValue);
                    }
                }
            });
        });
    }
};

/**
    Get functions that retrieve different types of data from various things
    that could be in the pages object.
*/
var getFunctions = {
    'name': function(elem) {
        return angular.lowercase(elem.name);
    },
    'title': function(elem) {
        return angular.lowercase(elem.title);
    },
};
