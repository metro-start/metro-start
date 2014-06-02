define([], function() {
    var bookmarks = {
        data: {},

        init: function() {

        },

        setPageItemCount: function(pageItemCount) {
            // this.links.setPageItemCount(pageItemCount);
        },

        loadBookmarks: function() {
            chrome.bookmarks.getTree(function(data) {
                $scope.$apply(function() {
                    $scope.bookmarks = [data[0].children];
                });
            });
        },

        /**
            Click event handler for bookmarks.
            Allows me to capture folder clicks.
            bookmark: The bookmark that was clicked.
            pageIndex: The page that contains the bookmark.
        */
        clickBookmark: function(bookmark, page) {
            if (bookmark.children.length > 0) {
                // Deactiviate bookmark and its siblings.
                siblings = $scope.bookmarks[page];
                for(i = 0; i < siblings.length; i++) {
                    siblings[i].active = false;
                }

                // Activate bookmark after it and it's siblings are deactiveated.
                bookmark.active = true;

                // Deactive children.
                for(i = 0; i < bookmark.children.length; i++) {
                    bookmark.children[i].active = false;
                }

                $scope.bookmarks.length = page + 1; // Remove all pages ahead of this.
                if ($scope.sort.bookmarks) {
                    $scope.bookmarks.push(bookmark.children.sort(function(a, b) {
                        if (a.title.toLocaleLowerCase() > b.title.toLocaleLowerCase()) {
                            return 1;
                        } else if(a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }));
                } else {
                    $scope.bookmarks.push(bookmark.children);
                }
                _gaq.push(['_trackEvent', 'Bookmarks', 'Bookmarked Folder']);
                return false;
            }
            _gaq.push(['_trackEvent', 'Bookmarks', 'Bookmarked Page']);
        },

        /**
            Remove the given bookmark.
            bookmark: The bookmark to be removed.
            page: The page where the bookmark is.
            index: The index for the bookmark.
        */
        removeBookmark: function(bookmark, page, index) {
            chrome.bookmarks.removeTree(bookmark.id, function() {
                $scope.$apply(function() {
                    $scope.bookmarks[page].splice(index, 1);
                });
            });

            _gaq.push(['_trackEvent', 'Bookmarks', 'Remove Bookmarked']);
        }
    };

    return bookmarks;
});
