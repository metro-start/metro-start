define(['pages/base','utils/storage', 'utils/util'], function(base, storage, util) {
    var links = {
        data: {},

        links: {},

        elems: {},

        init: function(document, sort, pageItemCount) {
            this.elems.rootDom = document.getElementById('internal_selector_links');
            this.loadLinks(sort, pageItemCount);
        },

        setPageItemCount: function(pageItemCount) {
            this.links.setPageItemCount(pageItemCount - 1); //TODO: Why -1?
        },

        // Load list of links
        // If there's no existing links (local or online) initiliazes with message.
        loadLinks: function(sort, pageItemCount) {
            this.data = storage.get('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}]);
            this.links = new base(this.elems.rootDom, this.data, sort, pageItemCount, getFunctions.name, this.itemGenerator);
            this.links.buildDom();
        },

        itemGenerator: function(elem, item) {
            var fragment = util.createElement('<a class="title"></a>');
            var linkDom = fragment.childNodes[0];
            linkDom.href = item.url;
            linkDom.textContent = item.name;
            elem.appendChild(fragment);

            fragment = util.createElement('<span class="remove option options-color small-text clickable">remove</span>');
            elem.appendChild(fragment);

            fragment = util.createElement('<span class="remove option options-color small-text clickable">edit</span>');
            elem.appendChild(fragment);
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
