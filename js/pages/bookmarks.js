define(['pages/pagebase', 'utils/util'], function(pagebase, util) {
    var bookmarks = {
        name: 'bookmarks',

        data: {},

        elems: {},

        bookmarks: {},

        templates: {
            titleFragment: util.createElement('<a class="bookmark_item"></a>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable" ng-click="removeBookmark(bookmark, $parent.$index, $index)">remove</span>'),
            slashFragment: util.createElement('<span class="options-color">/</span>'),
        },

        init: function() {
            this.elems.rootNode = document.getElementById('internal_selector_bookmarks');
            this.bookmarks = new pagebase(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.bookmarks.pageItemCount = -1;
            this.loadBookmarks();
        },

        loadBookmarks: function() {
            var that = this;
            chrome.bookmarks.getTree(function(data) {
                that.data = data[0].children;
                that.bookmarks.addAll(that.data);
            });
        },

        clickBookmark: function(bookmark, bookmarkNode, event) {
            if (bookmark.children && bookmark.children.length > 0) {
                var currentPage = bookmarkNode.parentNode.parentNode.id;
                this.activateBookmark(bookmarkNode);
                this.bookmarks.truncatePages(currentPage.replace('bookmarks_', ''));
                this.bookmarks.addAll(bookmark.children);
                event.preventDefault();
                _gaq.push(['_trackEvent', 'Bookmarks', 'Click Bookmark Folder']);
            }
            _gaq.push(['_trackEvent', 'Bookmarks', 'Click Bookmarked Page']);
        },

        removeBookmark: function(bookmark, page, index) {
            chrome.bookmarks.removeTree(bookmark.id, function() {
                $scope.$apply(function() {
                    $scope.bookmarks[page].splice(index, 1);
                });
            });
            _gaq.push(['_trackEvent', 'Bookmarks', 'Remove Bookmarked']);
        },

        setShowOptions: function setShowOptions(showOptions) {
            this.bookmarks.setShowOptions(showOptions);
        },

        activateBookmark: function activateBookmark(bookmarkElem) {
            var itemNode = bookmarkElem.parentNode;
            var siblings = itemNode.parentNode.children;
            Array.prototype.slice.call(siblings).forEach(function(item) {
                util.removeClass(item, 'active');
            });
            util.addClass(itemNode, 'active');
        },

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
            remove.firstElementChild.addEventListener('click', this.removeBookmark.bind(this, bookmark));
            fragment.appendChild(remove);

            return fragment;
        }
    };
    return bookmarks;
});
