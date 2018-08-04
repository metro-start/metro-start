define(['jss', '../pagebase/pagebase_paneled', '../utils/modal', '../utils/util'],
    (jss, PagebasePaneled, modal, util) => {
        let bookmarks = {
            name: 'bookmarks',

            data: {},

            elems: {
                rootNode: document.getElementById('internal-selector-bookmarks'),
            },

            bookmarks: {},

            templates: {
                titleFragment: util.createElement('<a class="panel-item bookmark-item clickable"></a>'),
                titleWrapFragment: util.createElement('<div class="panel-item-wrap"></div>'),
                slashFragment: util.createElement('<span class="options-color clickable slash">/</span>'),
                removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
            },

            init: function() {
                this.bookmarks = new PagebasePaneled();
                this.bookmarks.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
                this.loadBookmarks();
            },

            /**
             * Called when the sort order has been changed.
             *
             * @param {any} newSort The new sort order.
             */
            sortChanged: function(newSort) {
                this.bookmarks.sortChanged(newSort);
            },

            /**
             * Load the current set of bookmarks.
             */
            loadBookmarks: function() {
                let that = this;
                chrome.bookmarks.getTree((data) => {
                    that.data = data[0].children;
                    that.bookmarks.addAll(that.data);
                });
            },

            /**
             * Templates a provided bookmark into an HTML element.
             *
             * @param {any} bookmark The bookmark that should be turned into an element.
             * @return {any} The HTML element.
             */
            templateFunc: function(bookmark) {
                let fragment = util.createElement('');
                let titleWrap = this.templates.titleWrapFragment.cloneNode(true);
                let title = this.templates.titleFragment.cloneNode(true);
                title.firstElementChild.textContent = bookmark.title;
                title.firstElementChild.id = `bookmark_${bookmark.id}`;

                if (bookmark.url) {
                    title.firstElementChild.href = bookmark.url;
                }

                titleWrap.firstElementChild.appendChild(title);

                if (!bookmark.url) {
                    titleWrap.firstElementChild.addEventListener('click', this.clickBookmark.bind(this, bookmark, titleWrap.firstElementChild));
                    titleWrap.firstElementChild.appendChild(this.templates.slashFragment.cloneNode(true));
                }

                let remove = this.templates.removeFragment.cloneNode(true);
                remove.firstElementChild.addEventListener('click', this.removeBookmark.bind(this, bookmark, titleWrap.firstElementChild));

                fragment.appendChild(titleWrap);
                fragment.appendChild(remove);

                return fragment;
            },

            /**
             * Handle clicks on bookmarks.
             *
             * @param {any} bookmark The bookmark that was clicked.
             * @param {any} bookmarkNode The bookmark node has the data to be activated.
             */
            clickBookmark: function(bookmark, bookmarkNode) {
                let currentPage = bookmarkNode.parentNode.parentNode.id;
                let itemNode = bookmarkNode.parentNode;
                let siblings = itemNode.parentNode.children;
                Array.prototype.slice.call(siblings).forEach((item) => {
                    util.removeClass(item.firstElementChild, 'active');
                });
                util.addClass(itemNode.firstElementChild, 'active');

                let that = this;
                this.bookmarks.truncatePages(currentPage.replace('bookmarks_', ''));
                chrome.bookmarks.getChildren(bookmark.id, (data) => {
                    if (data.length !== 0) {
                        that.bookmarks.addAll(data);
                    }
                });
            },

            /**
             * Removes a bookmark.
             *
             * @param {any} bookmark The bookmark element that will be removed.
             * @param {any} bookmarkNode The bookmark node that has the data to be removed.
             */
            removeBookmark: function(bookmark, bookmarkNode) {
                modal.createModal(
                    `bookmark-${bookmark.id}`,
                    `${bookmark.title} will be removed.`,
                    (res) => {
                        if (res) {
                            chrome.bookmarks.removeTree(bookmark.id, () => {
                                bookmarkNode.parentNode.remove();
                            });
                        }
                    },
                    'okay', 'cancel');
            },
        };

        return bookmarks;
    });
