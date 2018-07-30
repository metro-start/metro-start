import {Util} from '../utils/utils';
import {Modal} from '../utils/utils';
import PagebasePaneled from '../pagebase/pagebase_paneled';

let Templates = {
    titleFragment: Util.createElement('<a class="panel-item clickable"></a>'),
    titleWrapFragment: Util.createElement('<div class="panel-item-wrap"></div>'),
    slashFragment: Util.createElement('<span class="options-color clickable slash">/</span>'),
    removeFragment: Util.createElement('<span class="option options-color small-text clickable">remove</span>'),
};

/**
 * Bookmarks.
 *
 * @export
 * @class Bookmarks
 */
export default class Bookmarks {
    /**
     *Creates an instance of Bookmarks.
     * @memberof Bookmarks
     */
    constructor() {
        this.elems = {
            rootNode: document.getElementById('internal-selector-bookmarks'),
        };
        this.name = 'bookmarks';
        this.bookmarks = new PagebasePaneled(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
        this.loadBookmarks();
    }

    /**
     * Called when the sort order has been changed.
     *
     * @param {any} newSort The new sort order.
     */
    sortChanged(newSort) {
        this.bookmarks.sortChanged(newSort);
    }

    /**
     * Load the current set of bookmarks.
     */
    loadBookmarks() {
        let that = this;
        chrome.bookmarks.getTree((data) => {
            that.bookmarks.addAll(data);
        });
    }

    /**
     * Templates a provided bookmark into an HTML element.
     *
     * @param {any} bookmark The bookmark that should be turned into an element.
     * @return {any} The HTML element.
     */
    templateFunc(bookmark) {
        let fragment = Util.createElement('');
        let titleWrap = Templates.titleWrapFragment.cloneNode(true);
        let title = Templates.titleFragment.cloneNode(true);
        title.firstElementChild.textContent = bookmark.title;
        title.firstElementChild.id = `bookmark_${bookmark.id}`;

        if (bookmark.url) {
            title.firstElementChild.href = bookmark.url;
        }

        titleWrap.firstElementChild.appendChild(title);

        if (!bookmark.url) {
            titleWrap.firstElementChild.addEventListener('click', this.clickBookmark.bind(this, bookmark, titleWrap.firstElementChild));
            titleWrap.firstElementChild.appendChild(Templates.slashFragment.cloneNode(true));
        }

        let remove = Templates.removeFragment.cloneNode(true);
        remove.firstElementChild.addEventListener('click', this.removeBookmark.bind(this, bookmark, titleWrap.firstElementChild));

        fragment.appendChild(titleWrap);
        fragment.appendChild(remove);

        return fragment;
    }

    /**
     * Handle clicks on bookmarks.
     *
     * @param {any} bookmark The bookmark that was clicked.
     * @param {any} bookmarkNode The bookmark node has the data to be activated.
     */
    clickBookmark(bookmark, bookmarkNode) {
        let currentPage = bookmarkNode.parentNode.parentNode.id;
        let itemNode = bookmarkNode.parentNode;
        let siblings = itemNode.parentNode.children;
        Array.prototype.slice.call(siblings).forEach((item) => {
            Util.removeClass(item.firstElementChild, 'active');
        });
        Util.addClass(itemNode.firstElementChild, 'active');

        let that = this;
        this.bookmarks.truncatePages(currentPage.replace('bookmarks_', ''));
        chrome.bookmarks.getChildren(bookmark.id, (data) => {
            if (data.length !== 0) {
                that.bookmarks.addAll(data);
            }
        });
    }

    /**
     * Removes a bookmark.
     *
     * @param {any} bookmark The bookmark element that will be removed.
     * @param {any} bookmarkNode The bookmark node that has the data to be removed.
     */
    removeBookmark(bookmark, bookmarkNode) {
        Modal.createModal(
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
    }
}
