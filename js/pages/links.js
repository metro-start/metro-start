define(['../pagebase/pagebase_simple','../utils/storage', '../utils/util'], function(pagebase_simple, storage, util) {
    var links = {
        name: 'links',

        data: [],

        elems: {
            rootDom: document.getElementById('internal_selector_links'),
            newUrl: document.getElementById('newUrl'),
            newUrlTitle: document.getElementById('newUrlTitle'),
            addLink: document.getElementById('addLink')
        },

        templates: {
            linkFragment: util.createElement('<span class="title clickable"></span>'),
            removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
            editFragment: util.createElement('<span class="edit option options-color small-text clickable">edit</span>'),
        },

        // Initialize this module.
        init: function(document) {
            this.elems.addLink.addEventListener('submit', this.addLink.bind(this));

            this.links = new pagebase_simple();
            this.links.init(document, this.name, this.elems.rootDom, this.templateFunc.bind(this));
        },

        // Loads the links from storage into the DOM.
        loadLinks: function() {
          this.data = storage.get('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}]);
          this.links.buildDom(this.data);
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
            // link.firstElementChild.href = item.url;
            link.firstElementChild.textContent = item.name;
            fragment.appendChild(link);

            var options = util.createElement('<span></span>');
            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeLink.bind(this, item));
            options.appendChild(remove);

            var edit = this.templates.editFragment.cloneNode(true);
            edit.firstElementChild.addEventListener('click', this.editLink.bind(this, item));
            options.appendChild(edit);

            fragment.appendChild(options);

            return fragment;
        },

        // Adds a new link, or completes editing an exiting link.
        // event: Callback event data.
        addLink: function(event) {
            event.preventDefault();
            var newUrl = this.elems.newUrl.value.trim();
            var title = this.elems.newUrlTitle.value.trim();
            title = title ? title : newUrl.toLocaleLowerCase().replace(/^https?\:\/\//i, '').replace(/^www\./i, '');

            if (!newUrl.match(/https?\:\/\//)) {
                newUrl = 'http://' + newUrl;
            }

            // If a link is currently being edited.
            if (this.linkToEdit) {
                this.linkToEdit.name = title;
                this.linkToEdit.url = newUrl;
            } else {
                this.data.push({
                    'name': title,
                    'url': newUrl
                });
            }
            
            storage.save('links', this.data);
            this.links.buildDom(this.data);
            this.linkToEdit = null;
            this.elems.addLink.reset();
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
