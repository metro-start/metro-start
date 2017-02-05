define(['../pagebase/pagebase_simple','../utils/storage', '../utils/util'], function(pagebase_simple, storage, util) {
    var links = {
        name: 'links',

        data: {},

        elems: {},

        templates: {
            linkFragment: util.createElement('<a class="title"></a>'),
            removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
            editFragment: util.createElement('<span class="edit option options-color small-text clickable">edit</span>'),
        },

        // Initialize this module.
        init: function(document, pageItemCount) {
            this.elems.rootDom = document.getElementById('internal_selector_links');
            this.elems.newUrl = document.getElementById('newUrl');
            this.elems.newUrlTitle = document.getElementById('newUrlTitle');
            this.elems.addLink = document.getElementById('addLink');
            this.elems.addLink.addEventListener('submit', this.addLink.bind(this));

            this.links = new pagebase_simple();
            this.links.init(document, this.name, this.elems.rootDom, this.templateFunc.bind(this));
            this.links.setPageItemCount(pageItemCount);
        },

        // Loads the links from storage into the DOM.
        loadLinks: function() {
          this.data = storage.get('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}]);
          this.links.buildDom(this.data);
        },

        // Sets the new number of pages for the block.
        // pageItemCount: The maximum number of pages able to be displayed.
        setPageItemCount: function(pageItemCount) {
            this.links.setPageItemCount(pageItemCount, this.data);
        },

        // Sets whether options are currently showing.
        // showOptions: true, if options are now showing; false otherwise.
        setShowOptions: function setShowOptions(showOptions) {
            this.links.setShowOptions(showOptions);
        },

        // Returns an HTML link node item.
        // item: The link item to be converted into a node.
        templateFunc: function(item) {
            var fragment = util.createElement('');
            var link = this.templates.linkFragment.cloneNode(true);
            link.firstElementChild.href = item.url;
            link.firstElementChild.textContent = item.name;
            fragment.appendChild(link);

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeLink.bind(this, item));
            fragment.appendChild(remove);

            var edit = this.templates.editFragment.cloneNode(true);
            edit.firstElementChild.addEventListener('click', this.editLink.bind(this, item));
            fragment.appendChild(edit);

            return fragment;
        },

        // Adds a new link, or completes editing an exiting link.
        // event: Callback event data.
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

                // If a link is currently being edited.
                if (this.linkToEdit) {
                    this.linkToEdit.name = formatTitle(newUrlTitle);
                    this.linkToEdit.url = newUrl;

                    
                } else {
                    this.data.push({
                        'name': formatTitle(newUrlTitle),
                        'url': newUrl
                    });

                    
                }
                storage.save('links', this.data);
                this.links.buildDom(this.data);
                this.linkToEdit = null;
                this.elems.addLink.reset();
            }
            event.preventDefault();
        },

        // Begins editing a link.
        // link: The link to be edited.
        editLink: function(link) {
            this.linkToEdit = link;
            this.elems.newUrlTitle.value = link.name;
            this.elems.newUrl.value = link.url;
            
        },

        // Removes a link from the app.
        // link: The link to be removed.
        removeLink: function(link){
            for(var i = 0; i < this.data.length; i++) {
                if (this.data[i] === link) {
                    this.data.splice(i, 1);
                    break;
                }
            }
            storage.save('links', this.data);
            this.links.buildDom(this.data);
            
        }
    };

    return links;
});
