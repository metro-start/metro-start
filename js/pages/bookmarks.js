define(['jss', '../pagebase/pagebase_paneled', '../utils/util'], function(jss, pagebase_paneled, util) {
    var bookmarks = {
        name: 'bookmarks',

        data: {},

        elems: {},

        bookmarks: {},

        templates: {
            titleFragment: util.createElement('<a class="bookmark_item"></a>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            slashFragment: util.createElement('<span class="options-color">/</span>'),
        },

        // Initialize this module.
        init: function() {
            this.elems.rootNode = document.getElementById('internal_selector_bookmarks');
            this.bookmarks = new pagebase_paneled();
            this.bookmarks.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.bookmarks.pageItemCount = -1;
            this.loadBookmarks();
        },

        // Loads the bookmarks from Chrome local synced storage.
        loadBookmarks: function() {
            var that = this;
            chrome.bookmarks.getTree(function(data) {
                that.data = data[0].children;
                that.bookmarks.addAll(that.data);
            });
        },

        // Sets the new number of pages for the block.
        // pageItemCount: The maximum number of pages able to be displayed.
        setPageItemCount: function(pageItemCount) {
            jss.set('.bookmark-page', {
                'height': (pageItemCount * 60) + 'px'
            });
        },

        // Sets whether options are currently showing.
        // showOptions: true, if options are now showing; false otherwise.
        setShowOptions: function setShowOptions(showOptions) {
            this.bookmarks.setShowOptions(showOptions);
        },

        // Returns an HTML link node item.
        // item: The link item to be converted into a node.
        templateFunc: function(bookmark) {
            var fragment = util.createElement('');
            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.href = bookmark.url;
            title.firstElementChild.textContent = bookmark.title;
            title.firstElementChild.id = 'bookmark_' + bookmark.id;
            if (bookmark.children && bookmark.children.length > 0) {
                title.firstElementChild.appendChild(this.templates.slashFragment.cloneNode(true));
            }
            title.firstElementChild.addEventListener('click', this.clickBookmark.bind(this, bookmark, title.firstElementChild));
            fragment.appendChild(title);

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeBookmark.bind(this, bookmark, fragment));
            fragment.appendChild(remove);

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
        removeBookmark: function(bookmark, page, index) {
            chrome.bookmarks.removeTree(bookmark.id, function() {
              bookmarkNode.remove();
            });
            
        },

        // Sets the height of the bookmark module. This tells when to begin scrolling.
        // height: The new height of the bookmark page.
        setHeight: function(height) {
          jss.set('.bookmark-page', {
              'height': height + 'px'
          });
        }
    };
    return bookmarks;
});
