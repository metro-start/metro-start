define(['jquery', 'jss', '../pagebase/pagebase', '../utils/util', '../utils/storage', '../utils/defaults'], function(jquery, jss, pagebase, util, storage, defaults) {
    var bookmarks = {
        name: 'bookmarks',

        data: {},

        pages: [],

        elems: {
            rootNode: document.getElementById('internal_selector_bookmarks')
        },

        bookmarks: {},

        templates: {
            containerFragment: util.createElement('<div class="internal_container"></div>'),
            internalFragment: util.createElement('<div class="internal_internal bookmark_page"></div>'),

            titleFragment: util.createElement('<a class="bookmark_item"></a>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            slashFragment: util.createElement('<span class="options-color">/</span>'),
        },

        // Initialize this module.
        init: function() {
            this.bookmarks = new pagebase();
            this.loadBookmarks();

            jquery('#bookmarks-sort-chooser').metroSelect({
                initial: this.getSort(),
                onchange: this.sortChanged.bind(this)
            });
        },

        // Loads the bookmarks from Chrome local synced storage.
        loadBookmarks: function() {
            var that = this;
            chrome.bookmarks.getTree(function(data) {
                that.data = data[0].children;
                that.addPanel('bookmark_' + data[0].id, data[0].children);
            });
        },

        addPanel: function(panelName, data) {
            var internal = this.templates.internalFragment.cloneNode(true);

            var panel = new pagebase();
            panel.init(document, this.name + '_' + panelName.replace(' ', '_'), internal.firstElementChild, this.templateFunc.bind(this));
            panel.getSort = this.getSort.bind(this);
            panel.buildDom(data);
            this.pages.push(panel);

            var container = this.templates.containerFragment.cloneNode(true);
            container.id = panelName;
            container.firstElementChild.appendChild(internal);

            this.elems.rootNode.appendChild(container);
        },

        templateFunc: function(bookmark) {
            var fragment = util.createElement('');
            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.href = bookmark.url;
            title.firstElementChild.textContent = bookmark.title;
            title.firstElementChild.id = 'bookmark_' + bookmark.parentId + '_' + bookmark.id;
            if (bookmark.children && bookmark.children.length > 0) {
                title.firstElementChild.appendChild(this.templates.slashFragment.cloneNode(true));
            }
            title.firstElementChild.addEventListener('click', this.clickBookmark.bind(this, bookmark, title.firstElementChild));
            fragment.appendChild(title);

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeBookmark.bind(this, bookmark));
            fragment.appendChild(remove);

            return fragment;
        },

        sortChanged: function(newSort) {
            this.updateSort(newSort);
            for (var i = 0; i < this.pages.length; i++) {
                this.pages[i].sortChanged(newSort, false);
            }
        },

        // Called when a bookmark has been clicked.
        // bookmark: The bookamrk that was clicked.
        // bookmarkNode: The DOM node of the clicked bookmark.
        // event: The JS event that triggered this function.
        clickBookmark: function(bookmark, bookmarkNode, event) {
            if (bookmark.children && bookmark.children.length > 0) {
                this.activateBookmark(bookmarkNode);

                this.truncatePages(bookmarkNode);

                this.addPanel('panel_' + bookmark.id, bookmark.children);

                event.preventDefault();
            }
        },

        truncatePages: function(bookmarkNode) {
            var searchNode = bookmarkNode;
            while (!!searchNode && searchNode.className !== "internal_container") {
                searchNode = searchNode.parentNode;
            }

            var localRoot = this.elems.rootNode;
            while (!!localRoot.lastElementChild && localRoot.lastElementChild !== searchNode) {
                localRoot.lastElementChild.remove();
            }

            // Assuming this.pages and this.elems.rootNode were kept up to date...
            this.pages.splice(localRoot.childElementCount - 1);
        },

        activateBookmark: function activateBookmark(bookmarkNode) {
            var itemNode = bookmarkNode.parentNode;
            var siblings = itemNode.parentNode.children;
            Array.prototype.slice.call(siblings).forEach(function(item) {
                util.removeClass(item.firstElementChild, 'bookmark-active');
            });
            util.addClass(itemNode.firstElementChild, 'bookmark-active');
        },

        // Removes a bookmark from the DOM and the chrome bookmark storage.
        // bookmark: The bookmark to be removed.
        // bookmarkNode: The DOM node of the bookmark to be removed.
        removeBookmark: function(bookmark) {
            var bookmarkNode = document.getElementById('bookmark_' + bookmark.parentId + '_' + bookmark.id);
            chrome.bookmarks.removeTree(bookmark.id, function() {
                bookmarkNode.parentElement.remove();
            });
        },

        getSort: function getSort() {
            var sort = storage.get('sort', defaults.getDefaultSort());
            return sort[this.name];
        },

        updateSort: function updateSort(newSort) {
            var sort = storage.get('sort', defaults.getDefaultSort());
            sort[this.name] = newSort;
            storage.save('sort', sort);
        }
    };

    return bookmarks;
});
