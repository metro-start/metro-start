define(['jss', '../pagebase/pagebase_paneled', '../widgets/confirm', '../utils/util'], 
function(jss, pagebase_paneled, confirmWidget, util) {
    var bookmarks = {
        name: 'bookmarks',

        data: {},

        elems: {
            rootNode: document.getElementById('internal_selector_bookmarks')
        },

        bookmarks: {},

        templates: {
            titleFragment: util.createElement('<a class="panel-item clickable"></a>'),
            titleWrapFragment: util.createElement('<div class="panel-item-wrap"></div>'),
            slashFragment: util.createElement('<span class="options-color clickable slash">/</span>'),
            removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
        },

        init: function() {
            this.bookmarks = new pagebase_paneled();
            this.bookmarks.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.loadBookmarks();
        },

        sortChanged: function (newSort) {
            this.bookmarks.sortChanged(newSort);
        },

        loadBookmarks: function() {
            var that = this;
            chrome.bookmarks.getTree(function(data) {
                that.data = data[0].children;
                that.bookmarks.addAll(that.data);
            });
        },

        templateFunc: function(bookmark) {
            var fragment = util.createElement('');
            var titleWrap = this.templates.titleWrapFragment.cloneNode(true);
            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.textContent = bookmark.title;
            title.firstElementChild.id = 'bookmark_' + bookmark.id;
                
            if (!!bookmark.url) {
                title.firstElementChild.href = bookmark.url;
            }
            
            titleWrap.firstElementChild.appendChild(title);

            if (!bookmark.url) {
                titleWrap.firstElementChild.addEventListener('click', this.clickBookmark.bind(this, bookmark, titleWrap.firstElementChild));
                titleWrap.firstElementChild.appendChild(this.templates.slashFragment.cloneNode(true));
            } 

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeBookmark.bind(this, bookmark, titleWrap.firstElementChild));
            
            fragment.appendChild(titleWrap);
            fragment.appendChild(remove);

            return fragment;
        },

        clickBookmark: function(bookmark, bookmarkNode) {
            var currentPage = bookmarkNode.parentNode.parentNode.id;
            var itemNode = bookmarkNode.parentNode;
            var siblings = itemNode.parentNode.children;
            Array.prototype.slice.call(siblings).forEach(function(item) {
                util.removeClass(item.firstElementChild, 'bookmark-active');
            });
            util.addClass(itemNode.firstElementChild, 'bookmark-active');
                
            var that = this;
            this.bookmarks.truncatePages(currentPage.replace('bookmarks_', ''));
            chrome.bookmarks.getChildren(bookmark.id, function(data) {
                if (data.length !== 0) {
                    that.bookmarks.addAll(data);
                } 
            });
        },

        removeBookmark: function(bookmark, bookmarkNode) {
            confirmWidget.alert(bookmark.title + ' will be removed.', function () {
                chrome.bookmarks.removeTree(bookmark.id, function () {
                    bookmarkNode.parentNode.remove();
                });
            });
        }
    };
    return bookmarks;
});
