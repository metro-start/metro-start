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
            storage.saveTwice('page', localStorage.getItem('active'));
            storage.saveTwice('links', localStorage.getItem('links'));
            storage.saveTwice('localThemes', localStorage.getItem('themes'));

            var theme = {
                'title': '',
                'colors': {
                    'options-color': localStorage.getItem('options-color'),
                    'main-color': localStorage.getItem('main-color'),
                    'title-color': localStorage.getItem('title-color'),
                    'background-color': localStorage.getItem('background-color')
                }
            };
            storage.saveTwice('theme', theme);

            storage.saveTwice('font', localStorage.getItem('font'));

            storage.saveTwice('locat', localStorage.getItem('locat'));

            if (localStorage.getItem('unit') == 'fahrenheit') {
                storage.saveTwice('weatherUnit', 0);
            } else {
                storage.saveTwice('weatherUnit', 1);
            }

            if (localStorage.getItem('hide_weather') === false) {
                storage.saveTwice('weatherToggleText', 'hide weather');
            } else {
                storage.saveTwice('weatherToggleText', 'show weather');
            }
        }
        localStorage.setItem('version', newVersion);
    } else if(lastVersion != newVersion) {
        localStorage.setItem('version', newVersion);
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
