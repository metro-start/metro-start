define(['pages/pagebase','utils/storage', 'utils/util'], function(pagebase, storage, util) {
    var links = {
        data: {},

        links: {},

        elems: {},

        init: function(document, sort, pageItemCount) {
            this.elems.rootDom = document.getElementById('internal_selector_links');
            this.elems.newUrlTitle = document.getElementById('newUrlTitle');
            this.elems.newUrl = document.getElementById('newUrl');
            this.elems.addLink = document.getElementById('addLink');
            this.elems.addLink.addEventListener('submit', this.addLink.bind(this));

            this.data = storage.get('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}]);
            this.links = new pagebase(this.elems.rootDom, sort, pageItemCount, this.callback.bind(this));
            this.links.buildDom(this.data);
        },

        setPageItemCount: function(pageItemCount) {
            this.links.setPageItemCount(pageItemCount - 1, this.data); //-1 to account for form
        },

        templates: {
            linkFragment: util.createElement('<a class="title"></a>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            editFragment: util.createElement('<span class="remove option options-color small-text clickable">edit</span>'),
        },

        callback: function(elem, item) {
            var link = this.templates.linkFragment.cloneNode(true);
            link.firstChild.href = item.url;
            link.firstChild.textContent = item.name;
            elem.appendChild(link);

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstChild.addEventListener('click', this.removeLink.bind(this, item));
            elem.appendChild(remove);

            var edit = this.templates.editFragment.cloneNode(true);
            edit.firstChild.addEventListener('click', this.editLink.bind(this, item));
            elem.appendChild(edit);
        },

        addLink: function(event) {
            var newUrlTitle = this.elems.newUrlTitle.value.trim();
            var newUrl = this.elems.newUrl.value.trim();
            if (newUrl !== '') {
                if (!newUrl.match(/https?\:\/\//)) {
                    newUrl = 'http://' + newUrl;
                }
                var formatTitle = function(title) {
                    return newUrlTitle ? newUrlTitle : newUrl.toLocaleLowerCase().replace(/^https?\:\/\//i, '').replace(/^www\./i, '');
                };
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
