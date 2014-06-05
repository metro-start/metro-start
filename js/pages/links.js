define(['pages/pagebase','utils/storage', 'utils/util'], function(pagebase, storage, util) {
    var links = {
        name: 'links',

        data: {},

        elems: {},

        templates: {
            linkFragment: util.createElement('<a class="title"></a>'),
            removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
            editFragment: util.createElement('<span class="edit option options-color small-text clickable">edit</span>'),
        },

        init: function(document, sort, pageItemCount) {
            this.elems.rootDom = document.getElementById('internal_selector_links');
            this.elems.newUrl = document.getElementById('newUrl');
            this.elems.newUrlTitle = document.getElementById('newUrlTitle');
            this.elems.addLink = document.getElementById('addLink');
            this.elems.addLink.addEventListener('submit', this.addLink.bind(this));

            this.data = storage.get('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}]);
            this.links = new pagebase(document, this.name, this.elems.rootDom, pageItemCount, this.templateFunc.bind(this));
            this.links.buildDom(this.data);
        },

        setPageItemCount: function(pageItemCount) {
            this.links.setPageItemCount(pageItemCount, this.data); //-1 to account for addLink
        },

        templateFunc: function(item) {
            var fragment = util.createElement('');
            var link = this.templates.linkFragment.cloneNode(true);
            link.firstChild.href = item.url;
            link.firstChild.textContent = item.name;
            fragment.appendChild(link);

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstChild.addEventListener('click', this.removeLink.bind(this, item));
            fragment.appendChild(remove);

            var edit = this.templates.editFragment.cloneNode(true);
            edit.firstChild.addEventListener('click', this.editLink.bind(this, item));
            fragment.appendChild(edit);

            return fragment;
        },

        addLink: function(event) {
            var newUrl = this.elems.newUrl.value.trim();
            var newUrlTitle = this.elems.newUrlTitle.value.trim();
            if (newUrl !== '') {
                var formatTitle = function(title) {
                    return newUrlTitle ? newUrlTitle : newUrl.toLocaleLowerCase().replace(/^https?\:\/\//i, '').replace(/^www\./i, '');
                };

                if (!newUrl.match(/https?\:\/\//)) {
                    newUrl = 'http://' + newUrl;
                }
                if (this.linkToEdit) {
                    this.linkToEdit.name = formatTitle(newUrlTitle);
                    this.linkToEdit.url = newUrl;

                    _gaq.push(['_trackEvent', 'Links', 'Finished Editing Link']);
                } else {
                    this.data.push({
                        'name': formatTitle(newUrlTitle),
                        'url': newUrl
                    });

                    _gaq.push(['_trackEvent', 'Links', 'Add New Link']);
                }
                storage.save('links', this.data);
                this.links.buildDom(this.data);
                this.linkToEdit = null;
                this.elems.addLink.reset();
            }
            event.preventDefault();
        },

        editLink: function(link) {
            this.linkToEdit = link;
            this.elems.newUrlTitle.value = link.name;
            this.elems.newUrl.value = link.url;
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
            this.links.buildDom(this.data);
            _gaq.push(['_trackEvent', 'Links', 'Remove Link']);
        }
    };

    return links;
});
