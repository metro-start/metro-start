var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25604585-1']);
_gaq.push(['_trackPageview']);

function MetroStart($scope, $http) {
    $scope.total = ['links', 'apps', 'bookmarks', 'themes'];
    $scope.units = ['fahrenheit', 'celsius'];

    // These elements are refreshed on every page load.
    $scope.editThemeButton = 'edit theme';
    $scope.editThemeText = 'edit theme';
    $scope.hideOptions = true;
    $scope.linkToEdit = {};
    $scope.pageItemCount = 4;

    storage.get('sort', defaults.defaultSort, $scope, true);

    storage.get('page', 0, $scope, false);

    storage.get('theme', defaults.defaultTheme, $scope, true);

    storage.get('font', 0, $scope, false);

    storage.get('weatherUpdateTime', 0, $scope, false);

    storage.get('locat', 'seattle, wa', $scope, false);

    storage.get('weather', null, $scope, true);

    storage.get('weatherUnit', 0, $scope, false);

    storage.get('weatherToggleText', 'hide weather', $scope, false);

    // Load list of links
    // If there's no existing links (local or online) initiliazes with message.
    $scope.loadLinks = function() {
        storage.get('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}], $scope, true, function(links) {
            $scope.links = new Pages($scope.links, $scope.sort.links, $scope.pageItemCount, getFunctions.name);
        });
    };

    // Load list of apps
    $scope.loadApps = function() {
        chrome.management.getAll(function(res) {
            var apps = [{
                'name': 'Chrome Webstore',
                'appLaunchUrl': 'https://chrome.google.com/webstore'
            }];
            // Remove extensions and limit to apps.
            apps = apps.concat(res.filter(function(item) { return item.isApp; }));
            $scope.$apply(function() {
                $scope.apps = new Pages(apps, $scope.sort.apps, $scope.pageItemCount, getFunctions.name);
            });
        });
    };

    // Load list of bookmarks
    $scope.loadBookmarks = function() {
        chrome.bookmarks.getTree(function(data) {
            $scope.$apply(function() {
                $scope.bookmarks = [data[0].children];
            });
        });
    };

    $scope.loadThemes = function() {
        // Load local themes.
        storage.get('localThemes', [defaults.defaultTheme], $scope, true, function() {
            $scope.localThemes = new Pages($scope.localThemes, $scope.sort.themes, $scope.pageItemCount, getFunctions.title);
        });

        // Load online themes.
        $http.get('http://metro-start.appspot.com/themes.json').success(function(data) {
            for (var i in data) {
                data[i].colors = {
                    'options-color': data[i].options_color,
                    'main-color': data[i].main_color,
                    'title-color': data[i].title_color,
                    'background-color': data[i].background_color,
                };
            }
            $scope.onlineThemes = new Pages(data, $scope.sort.themes, $scope.pageItemCount, getFunctions.title);
        });
    };

    // Attach a watcher to the page to see page changes and save the value.
    $scope.$watch('page', function(newValue, oldValue) {
        if (newValue != 3) { // Do not save navigation to themes page.
            storage.saveModel('page', newValue);
        }
    }, true);

    $scope.setPageItemCount = function(pageItemCount) {
        $scope.pageItemCount = pageItemCount;
        if (typeof $scope.links !== 'undefined')
            $scope.links.setPageItemCount(pageItemCount - 1);

        if (typeof $scope.apps !== 'undefined')
            $scope.apps.setPageItemCount(pageItemCount);

        if (typeof $scope.localThemes !== 'undefined')
            $scope.localThemes.setPageItemCount(pageItemCount);

        if (typeof $scope.onlineThemes !== 'undefined')
            $scope.onlineThemes.setPageItemCount(pageItemCount);
    };

    $scope.clickWrench = function() {
        $scope.hideOptions = !$scope.hideOptions;
        $scope.loadThemes();
        // If we're on the theme when wrench was clicked, navigate to the last page.
        if ($scope.page == 3) {
            storage.get('page', 0, $scope, false);
        }
        $scope.editThemeText = 'edit theme'; // Hide the theme editing panel.
        _gaq.push(['_trackEvent', 'Page', 'Wrench']);
    };

    $scope.changeSorting = function(key, newSorting) {
        $scope.sort[key] = newSorting;
        storage.saveModel('sort', $scope.sort, $scope);
        if ($scope.sort[key] === 0) {
            if (key == 'links') {
                $scope.loadLinks();
            } else if(key == 'apps') {
                $scope.loadApps();
            } else if(key == 'themes') {
                $scope.loadThemes();
            } else if (key == 'bookmarks') {
                var handleBookmarks = function(res) {
                    $scope.$apply(function() {
                        $scope.bookmarks[i] = res;
                    });
                };
                for (i = $scope.bookmarks.length - 1; i >= 0; i--) {
                    var parentId = typeof $scope.bookmarks[i][0].parentId;
                    if (typeof parentId !== 'undefined') {
                        chrome.bookmarks.getChildren(parentId, handleBookmarks);
                    }
                }
            }
            _gaq.push(['_trackEvent', 'Page', 'Show Unsorted Items']);
        }
        else if ($scope.sort[key] == 1) {
            if (key == 'themes') {
                $scope.localThemes.sort();
                $scope.onlineThemes.sort();
            } else if (key == 'bookmarks') {
                var compareFunction = function(a, b) {
                    if (angular.lowercase(a.title) > angular.lowercase(b.title)) {
                        return 1;
                    } else if(angular.lowercase(a.title) < angular.lowercase(b.title)) {
                        return -1;
                    } else {
                        return 0;
                    }
                };
                for (i = 0; i < $scope.bookmarks.length; i++) {
                    $scope.bookmarks[i].sort(compareFunction);
                }
            } else {
                $scope[key].sort();
            }
            _gaq.push(['_trackEvent', 'Page', 'Show Sorted Items']);
        }
    };

    $scope.addLink = function() {
        if(!$scope.newUrl.match(/https?\:\/\//)) {
            $scope.newUrl = 'http://' + $scope.newUrl;
        }
        if (!$.isEmptyObject($scope.linkToEdit)) {
            $scope.linkToEdit.name =  $scope.newUrlTitle ? $scope.newUrlTitle : angular.lowercase($scope.newUrl).replace(/^https?\:\/\//i, '').replace(/^www\./i, '');
            $scope.linkToEdit.url = $scope.newUrl;
            $scope.linkToEdit = {};

            _gaq.push(['_trackEvent', 'Links', 'Save Edited Link']);
        } else {
            $scope.links.add({
                'name': $scope.newUrlTitle ? $scope.newUrlTitle : angular.lowercase($scope.newUrl).replace(/^https?\:\/\//i, '').replace(/^www\./i, ''),
                'url': $scope.newUrl,
            });

            _gaq.push(['_trackEvent', 'Links', 'Add New Link']);
        }
        $scope.newUrl = '';
        $scope.newUrlTitle = '';
        storage.saveModel('links', $scope.links.flatten());
    };

    $scope.editLink = function(page, index) {
        $scope.linkToEdit = $scope.links.get(page, index);
        $scope.newUrlTitle = $scope.linkToEdit.name;
        $scope.newUrl = $scope.linkToEdit.url;
        _gaq.push(['_trackEvent', 'Links', 'Start Editing Link']);
    };

    $scope.removeLink = function(page, index){
        $scope.links.remove(page, index);
        storage.saveModel('links', $scope.links.flatten());
        _gaq.push(['_trackEvent', 'Links', 'Remove Link']);
    };

    $scope.toggleWeather = function() {
        storage.saveAll('weatherToggleText', 'show weatherhide weather'.replace($scope.weatherToggleText, ''), $scope);

        if ($scope.weatherToggleText == 'show weather') {
            _gaq.push(['_trackEvent', 'Weather', 'Hide Weather']);
        } else {
            _gaq.push(['_trackEvent', 'Weather', 'Show Weather']);
        }
    };

    $scope.saveLocat = function() {
        if ($scope.newLocat && $scope.newLocat.trim() !== '') {
            storage.saveAll('locat', $scope.newLocat, $scope);

            $scope.updateWeather(true);
            _gaq.push(['_trackEvent', 'Weather', 'Save Weather Location']);
        }
    };

    $scope.changeWeatherUnit = function(newWeatherUnit) {
        storage.saveAll('weatherUnit', newWeatherUnit, $scope);

        $scope.updateWeather(true);
        _gaq.push(['_trackEvent', 'Weather', 'Set Weather Unit', $scope.units[$scope.weatherUnit]]);
    };

    /**
        Update the weather data being displayed.

        force: Bypass the 1 hour wait requirement.
    */
    $scope.updateWeather = function(force) {
        var unit = $scope.units[$scope.weatherUnit][0];
        var locat = $scope.locat;
        // If it has been more than an hour since last check.
        if(force || new Date().getTime() > parseInt($scope.weatherUpdateTime, 10)) {
            storage.saveAll('weatherUpdateTime', parseInt(new Date().getTime(), 10) + 3600000, $scope);
            var params = encodeURIComponent('select * from weather.forecast where woeid in (select woeid from geo.places where text="' + locat + '" limit 1) and u="' + unit + '"');
            var url = 'http://query.yahooapis.com/v1/public/yql?q=' + params + '&format=json';
            $http.get(url).success(function(data) {
                // If data was actually returned, save it.
                if (data.query.count) {
                    var elem = data.query.results.channel;
                    var city = elem.location.city + ', ';
                    city += (elem.location.region ? elem.location.region : elem.location.country);
                    $scope.weather = {
                        'city': city.toLowerCase(),
                        'currentTemp': elem.item.condition.temp,
                        'highTemp': elem.item.forecast[0].high,
                        'lowTemp': elem.item.forecast[0].low,
                        'condition': elem.item.condition.text.toLowerCase(),
                        'unit': elem.units.temperature.toLowerCase(),
                    };
                }
                storage.saveModel('weather', $scope.weather);
            });
        }
    };

    /**
        Uninstall the given application.
        app: The app to be uninstalled.
        page: The page where the app is.
        index: The index in the page.
    */
    $scope.uninstallApp = function(app, page, index) {
        for (var id in $scope.apps) {
            if ($scope.apps[id].id == app.id) {
                chrome.management.uninstall(app.id);
                $scope.apps.remove(page, index);
                break;
            }
        }

        _gaq.push(['_trackEvent', 'Apps', 'Uninstall App']);
    };

    /**
        Click event handler for bookmarks.
        Allows me to capture folder clicks.
        bookmark: The bookmark that was clicked.
        pageIndex: The page that contains the bookmark.
    */
    $scope.clickBookmark = function(bookmark, page) {
        if (bookmark.children.length > 0) {
            // Deactiviate bookmark and its siblings.
            siblings = $scope.bookmarks[page];
            for(i = 0; i < siblings.length; i++) {
                siblings[i].active = false;
            }

            // Activate bookmark after it and it's siblings are deactiveated.
            bookmark.active = true;

            // Deactive children.
            for(i = 0; i < bookmark.children.length; i++) {
                bookmark.children[i].active = false;
            }

            $scope.bookmarks.length = page + 1; // Remove all pages ahead of this.
            if ($scope.sort.bookmarks) {
                $scope.bookmarks.push(bookmark.children.sort(function(a, b) {
                    if (angular.lowercase(a.title) > angular.lowercase(b.title)) {
                        return 1;
                    } else if(angular.lowercase(a.title) < angular.lowercase(b.title)) {
                        return -1;
                    } else {
                        return 0;
                    }
                }));
            } else {
                $scope.bookmarks.push(bookmark.children);
            }
            _gaq.push(['_trackEvent', 'Bookmarks', 'Bookmarked Folder']);
            return false;
        }
        _gaq.push(['_trackEvent', 'Bookmarks', 'Bookmarked Page']);
    };

    /**
        Remove the given bookmark.
        bookmark: The bookmark to be removed.
        page: The page where the bookmark is.
        index: The index for the bookmark.
    */
    $scope.removeBookmark = function(bookmark, page, index) {
        chrome.bookmarks.removeTree(bookmark.id, function() {
            $scope.$apply(function() {
                $scope.bookmarks[page].splice(index, 1);
            });
        });

        _gaq.push(['_trackEvent', 'Bookmarks', 'Remove Bookmarked']);
    };

    /**
        Reset to default theme.
    */
    $scope.resetTheme = function() {
        storage.saveAll('theme', defaults.defaultTheme, $scope);

        updateStyle(true);

        _gaq.push(['_trackEvent', 'Theme', 'Reset Theme']);
    };

    /**
        Change the currently enabled theme.
        newTheme: The theme to be enabled.
    */
    $scope.changeTheme = function(newTheme) {
        storage.saveAll('theme', newTheme, $scope);

        updateStyle(true);

        _gaq.push(['_trackEvent', 'Theme', 'Change Theme', newTheme.title]);
    };

    /**
        Change the currently enabled font.
        newFont: The font to be enabled.
    */
    $scope.changeFont = function(newFont) {
        storage.saveAll('font', newFont, $scope);

        updateStyle(true);
        if (newFont === 0) {
            _gaq.push(['_trackEvent', 'Theme', 'Change Font', 'Segoe/Helvetica']);
        } else {
            _gaq.push(['_trackEvent', 'Theme', 'Change Font', 'Raleway']);
        }
    };

    /**
        Navigate the user to the share theme page.
        theme: The theme being shared.
    */
    $scope.shareTheme = function(theme) {
        var url = 'http://metro-start.appspot.com/newtheme?' +
            'title=' + encodeURIComponent(theme.title) +
            '&maincolor=' + encodeURIComponent(theme.colors['main-color']) +
            '&optionscolor=' + encodeURIComponent(theme.colors['options-color']) +
            '&titlecolor=' + encodeURIComponent(theme.colors['title-color']) +
            '&backgroundcolor=' + encodeURIComponent(theme.colors['background-color']);
        window.open(url);
        _gaq.push(['_trackEvent', 'Theme', 'Share Theme']);
    };

    /**
        Remove the given local theme.
        page: The page that contains the theme to be removed.
        index: The index of the theme to be removed.
    */
    $scope.removeTheme = function(page, index) {
        $scope.localThemes.remove(page, index);
        storage.saveModel('localThemes', $scope.localThemes.flatten());
        _gaq.push(['_trackEvent', 'Theme', 'Remove Theme']);
    };

    /**
        Handle the editTheme button click. if what is being edited has a name, save it.
        Otherwise, just close (temp theme).
    */
    $scope.clickEditTheme = function() {
        if ($scope.editThemeText == 'save theme') {
            if ($scope.newThemeTitle && $scope.newThemeTitle.trim() !== '') {
                $scope.theme.title = $scope.newThemeTitle;
                $scope.newThemeTitle = '';
                $scope.localThemes.add($scope.theme);
                storage.saveModel('theme', $scope.theme);
                storage.saveModel('localThemes', $scope.localThemes.flatten());
            }

            _gaq.push(['_trackEvent', 'Theme', 'Stop Editing Theme']);
        } else {
            _gaq.push(['_trackEvent', 'Theme', 'Start Editing Theme']);
        }

        $scope.editThemeText = 'edit themesave theme'.replace($scope.editThemeText, '');
    };

    $scope.loadLinks();
    $scope.loadApps();
    $scope.loadBookmarks();

    updateStyle(false);
    $scope.updateWeather(false);
}
