define(['jss', '../pagebase/pagebase_paneled', '../utils/util', '../utils/storage'], function(jss, pagebase_paneled, util, storage) {
    var bookmarks = {
        name: 'bookmarks',

        data: {},

        elems: {
            rootNode: document.getElementById('internal_selector_bookmarks')
        },

        bookmarks: {},

        templates: {
            titleFragment: util.createElement('<a class="bookmark_item"></a>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            slashFragment: util.createElement('<span class="options-color">/</span>'),
        },

        // Initialize this module.
        init: function() {
            this.sort = storage.get('sort', { bookmarks: false }).bookmarks;
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
                height: (pageItemCount * 60) + 'px'
            });
        },

        // Sets whether options are currently showing.
        // showOptions: true, if options are now showing; false otherwise.
        setShowOptions: function setShowOptions(showOptions) {
            this.bookmarks.setShowOptions(showOptions);
        },

        sortChanged: function(newSort) {
            this.sort = newSort;
            this.bookmarks.sortChanged(newSort);
        },

        // Returns an HTML link node item.
        // item: The link item to be converted into a node.
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
        removeBookmark: function(bookmark) {
            var bookmarkNode = document.getElementById('bookmark_' + bookmark.parentId + '_' + bookmark.id);
            chrome.bookmarks.removeTree(bookmark.id, function() {
                bookmarkNode.parentElement.remove();
            });
        },

    //     changeSort: function(newSort) {
    //         var handleBookmarks = function (res) {
    //           $scope.$apply(function () {
    //             $scope.bookmarks[i] = res;
    //           });
    //         };

    //         for (var i = )
    //         for (i = $scope.bookmarks.length - 1; i >= 0; i--) {
    //           var parentId = typeof $scope.bookmarks[i][0].parentId;
    //           if (typeof parentId !== 'undefined') {
    //             chrome.bookmarks.getChildren(parentId, handleBookmarks);
    //           }
    //         }
    //       }
    //     } else if ($scope.sort[key] == 1) {
    //       if (key == 'themes') {
    //         $scope.localThemes.sort();
    //         $scope.onlineThemes.sort();
    //       } else if (key == 'bookmarks') {
    //         var compareFunction = function (a, b) {
    //           if (a.title.toLocaleLowerCase() > b.title.toLocaleLowerCase()) {
    //             return 1;
    //           } else if (a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()) {
    //             return -1;
    //           } else {
    //             return 0;
    //           }
    //         };
    //         for (i = 0; i < $scope.bookmarks.length; i++) {
    //           $scope.bookmarks[i].sort(compareFunction);
    //         }
    //       } else {
    //         $scope[key].sort();
    //       }
    //     }
    //   }
    //     }
    };
    return bookmarks;
});
