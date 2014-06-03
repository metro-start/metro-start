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
            this.links.setPageItemCount(pageItemCount, this.data);
        },

        loadLinks: function(sort, pageItemCount) {
//            this.data = storage.get('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}]);
            this.data = [
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
{'name': 'wrench ', 'url': ''},
            ];
            this.links = new base(this.elems.rootDom, this.data, sort, pageItemCount, this.callback.bind(this));
            this.links.buildDom();
        },

        template: {
            linkFragment: util.createElement('<a class="title"></a>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            editFragment: util.createElement('<span class="remove option options-color small-text clickable">edit</span>'),
        },

        callback: function(elem, item) {
            var link = this.template.linkFragment.cloneNode(true);
            link.firstChild.href = item.url;
            link.firstChild.textContent = item.name;
            elem.appendChild(link);

            var remove = this.template.removeFragment.cloneNode(true);
            remove.firstChild.addEventListener('click', this.removeLink.bind(this, item));
            elem.appendChild(remove);

            var edit = this.template.editFragment.cloneNode(true);
            edit.firstChild.addEventListener('click', this.editLink.bind(this, item));
            elem.appendChild(edit);
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

        editLink: function(link) {
            console.log(this);
            console.log(link);
            $scope.linkToEdit = $scope.links.get(page, index);
            $scope.newUrlTitle = $scope.linkToEdit.name;
            $scope.newUrl = $scope.linkToEdit.url;
            _gaq.push(['_trackEvent', 'Links', 'Start Editing Link']);
        },

        removeLink: function(link){
            for(var i = 0; i < this.data.length; i++) {
                if (this.data[i] === link) {
                    this.data.splice(i, 1);
                    break;
                }
            }
            storage.save('links', this.data);
            this.links.relayout(this.data);
            _gaq.push(['_trackEvent', 'Links', 'Remove Link']);
        }
    };

    return links;
});
