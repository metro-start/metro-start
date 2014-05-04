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
