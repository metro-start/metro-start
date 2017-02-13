define(['jss', '../pagebase/pagebase_paneled', '../utils/util'], function(jss, pagebase_paneled, util) {
    var bookmarks = {
        name: 'bookmarks',

        data: {},

        elems: {},

        bookmarks: {},

        templates: {
            titleFragment: util.createElement('<span class="panel-item clickable"></span>'),
            manageFragment: util.createElement('<span class="option options-color small-text clickable">manage</span>'),
            slashFragment: util.createElement('<span class="options-color clickable slash">/</span>'),
        },

        // Initialize this module.
        init: function() {
            this.elems.rootNode = document.getElementById('internal_selector_bookmarks');
            this.bookmarks = new pagebase_paneled();
            this.bookmarks.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.loadBookmarks();
        },

        sortChanged: function (newSort) {
            this.bookmarks.sortChanged(newSort);
        },

        // Loads the bookmarks from Chrome local synced storage.
        loadBookmarks: function() {
            var that = this;
            chrome.bookmarks.getTree(function(data) {
                that.data = data[0].children;
                that.bookmarks.addAll(that.data);
            });
        },

        // Returns an HTML link node item.
        // item: The link item to be converted into a node.
        templateFunc: function(bookmark) {
            var fragment = util.createElement('');
            var titleWrap = util.createElement('<div></div>');
            var title = this.templates.titleFragment.cloneNode(true);
            // title.firstElementChild.href = bookmark.url;
            title.firstElementChild.textContent = bookmark.title;
            title.firstElementChild.id = 'bookmark_' + bookmark.id;
            titleWrap.firstElementChild.addEventListener('click', this.clickBookmark.bind(this, bookmark, titleWrap.firstElementChild));
            titleWrap.firstElementChild.appendChild(title);

            if (bookmark.children && bookmark.children.length > 0) {
                titleWrap.firstElementChild.appendChild(this.templates.slashFragment.cloneNode(true));
            }
            
            fragment.appendChild(titleWrap);

            var manage = this.templates.manageFragment.cloneNode(true);
            manage.firstElementChild.addEventListener('click', this.manageBookmark.bind(this, bookmark, fragment));
            fragment.appendChild(manage);

            return fragment;
        },

        // Called when a bookmark has been clicked.
        // bookmark: The bookamrk that was clicked.
        // bookmarkNode: The DOM node of the clicked bookmark.
        // event: The JS event that triggered this function.
        clickBookmark: function(bookmark, bookmarkNode, event) {
            if (bookmark.children && bookmark.children.length > 0) {
                var currentPage = bookmarkNode.parentNode.parentNode.id;
                this.activateBookmark(bookmarkNode);
                this.bookmarks.truncatePages(currentPage.replace('bookmarks_', ''));
                this.bookmarks.addAll(bookmark.children);
                event.preventDefault();
            }
        },

        // Activiates a clicked bookmark folder.
        // bookmarkNode: The DOM node of the clicked bookmark.
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
        manageBookmark: function(bookmark, page, index) {
            // chrome.bookmarks.removeTree(bookmark.id, function() {
            //   bookmarkNode.remove();
            // });
            
        }
    };
    return bookmarks;
});
