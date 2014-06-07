define([], function() {
    var themes = {
        data: undefined,

        init: function() {
// storage.get('theme', defaults.defaultTheme, $scope);
//
// storage.get('font', 0, $scope);

        },

        setPageItemCount: function(pageItemCount) {
            // this.links.setPageItemCount(pageItemCount);
        },

        loadThemes: function() {
            // Load local themes.
            storage.get('localThemes', [defaults.defaultTheme], $scope);
            $scope.localThemes = new Pages($scope.localThemes, $scope.sort.themes, $scope.pageItemCount, getFunctions.title);

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
        },

        updateTheme: function() {
            save('theme', $scope.theme,$scope);
        },

        /**
            Reset to default theme.
        */
        resetTheme: function() {
            storage.save('theme', defaults.defaultTheme, $scope);

            script.updateStyle(true);

            _gaq.push(['_trackEvent', 'Theme', 'Reset Theme']);
        },

        /**
            Change the currently enabled theme.
            newTheme: The theme to be enabled.
        */
        changeTheme: function(newTheme) {
            storage.save('theme', newTheme, $scope);

            script.updateStyle(true);

            _gaq.push(['_trackEvent', 'Theme', 'Change Theme', newTheme.title]);
        },

        /**
            Change the currently enabled font.
            newFont: The font to be enabled.
        */
        changeFont: function(newFont) {
            storage.save('font', newFont, $scope);

            script.updateStyle(true);
            if (newFont === 0) {
                _gaq.push(['_trackEvent', 'Theme', 'Change Font', 'Segoe/Helvetica']);
            } else {
                _gaq.push(['_trackEvent', 'Theme', 'Change Font', 'Raleway']);
            }
        },

        /**
            Navigate the user to the share theme page.
            theme: The theme being shared.
        */
        shareTheme: function(theme) {
            var url = 'http://metro-start.appspot.com/newtheme?' +
                'title=' + encodeURIComponent(theme.title) +
                '&maincolor=' + encodeURIComponent(theme.colors['main-color']) +
                '&optionscolor=' + encodeURIComponent(theme.colors['options-color']) +
                '&titlecolor=' + encodeURIComponent(theme.colors['title-color']) +
                '&backgroundcolor=' + encodeURIComponent(theme.colors['background-color']);
            window.open(url);
            _gaq.push(['_trackEvent', 'Theme', 'Share Theme']);
        },

        /**
            Remove the given local theme.
            page: The page that contains the theme to be removed.
            index: The index of the theme to be removed.
        */
        removeTheme: function(page, index) {
            $scope.localThemes.remove(page, index);
            storage.save('localThemes', $scope.localThemes.flatten());
            _gaq.push(['_trackEvent', 'Theme', 'Remove Theme']);
        },

        /**
            Handle the editTheme button click. if what is being edited has a name, save it.
            Otherwise, just close (temp theme).
        */
        clickEditTheme: function() {
            if ($scope.editThemeText == 'save theme') {
                if ($scope.newThemeTitle && $scope.newThemeTitle.trim() !== '') {
                    $scope.theme.title = $scope.newThemeTitle;
                    $scope.newThemeTitle = '';
                    $scope.localThemes.add($scope.theme);
                    storage.save('theme', $scope.theme);
                    storage.save('localThemes', $scope.localThemes.flatten());
                }

                _gaq.push(['_trackEvent', 'Theme', 'Stop Editing Theme']);
            } else {
                _gaq.push(['_trackEvent', 'Theme', 'Start Editing Theme']);
            }

            $scope.editThemeText = 'edit themesave theme'.replace($scope.editThemeText, '');
        }
    };

    return themes;
});
