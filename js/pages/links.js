define(['utils/storage'], function(storage, base) {
    var links = {
        data: {},

        elems: {},

        init: function(document) {
            //this.loadLinks();
        },

        // Load list of links
        // If there's no existing links (local or online) initiliazes with message.
        loadLinks: function() {
            var links = storage.get('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}]);
            this.data = new base(links, $scope.sort.links, $scope.pageItemCount, getFunctions.name);
        },

        addLink: function() {
            if(!$scope.newUrl.match(/https?\:\/\//)) {
                $scope.newUrl = 'http://' + $scope.newUrl;
            }
            if (!$.isEmptyObject($scope.linkToEdit)) {
                $scope.linkToEdit.name =  $scope.newUrlTitle ? $scope.newUrlTitle : $scope.newUrl.toLocaleLowerCase().replace(/^https?\:\/\//i, '').replace(/^www\./i, '');
                $scope.linkToEdit.url = $scope.newUrl;
                $scope.linkToEdit = {};

                _gaq.push(['_trackEvent', 'Links', 'Save Edited Link']);
            } else {
                $scope.links.add({
                    'name': $scope.newUrlTitle ? $scope.newUrlTitle : $scope.newUrl.toLocaleLowerCase().replace(/^https?\:\/\//i, '').replace(/^www\./i, ''),
                    'url': $scope.newUrl,
                });

                _gaq.push(['_trackEvent', 'Links', 'Add New Link']);
            }
            $scope.newUrl = '';
            $scope.newUrlTitle = '';
            storage.save('links', $scope.links.flatten());
        },

        editLink: function(page, index) {
            $scope.linkToEdit = $scope.links.get(page, index);
            $scope.newUrlTitle = $scope.linkToEdit.name;
            $scope.newUrl = $scope.linkToEdit.url;
            _gaq.push(['_trackEvent', 'Links', 'Start Editing Link']);
        },

        removeLink: function(page, index){
            $scope.links.remove(page, index);
            storage.save('links', $scope.links.flatten());
            _gaq.push(['_trackEvent', 'Links', 'Remove Link']);
        }
    };

    return links;
});
