define([], function() {
    var apps = {
        data: {},

        init: function() {
            //this.loadApps();
        },

        setPageItemCount: function(pageItemCount) {
            // this.apps.setPageItemCount(pageItemCount);
        },

        // Load list of apps
        loadApps: function() {
            chrome.management.getAll(function(res) {
                var apps = [{
                    'name': 'Chrome Webstore',
                    'appLaunchUrl': 'https://chrome.google.com/webstore'
                }];
                // Remove extensions and limit to apps.
                var apps = apps.concat(res.filter(function(item) { return item.isApp; }));
                $scope.$apply(function() {
                    $scope.apps = new Pages(apps, $scope.sort.apps, $scope.pageItemCount, getFunctions.name);
                });
            });
        },

        /**
            Uninstall the given application.
            app: The app to be uninstalled.
            page: The page where the app is.
            index: The index in the page.
        */
        uninstallApp: function(app, page, index) {
            for (var id in $scope.apps) {
                if ($scope.apps[id].id == app.id) {
                    chrome.management.uninstall(app.id);
                    $scope.apps.remove(page, index);
                    break;
                }
            }

            _gaq.push(['_trackEvent', 'Apps', 'Uninstall App']);
        },
    };

    return apps;
});
