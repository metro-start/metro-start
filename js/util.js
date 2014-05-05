/**
    Upgrades the version of metrostart installed by moving all saved data to new format.
*/
var util = (function() {
    return {
        checkAndUpgradeVersion: function() {
            var newVersion = chrome.app.getDetails().version;
            var lastVersion = localStorage.getItem('version');

            if(lastVersion !== newVersion) {
                localStorage.setItem('version', newVersion);

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
                }
            }
        },
    };
})();
