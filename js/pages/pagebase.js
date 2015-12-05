define(['utils/util', 'utils/storage', 'metro-select'], function(util, storage, metroSelect) {
    var templates = {
       column: util.createElement('<div class="page"></div>'),
       item: util.createElement('<div class="item"></div>')
    };

    var pagebase = function pagebase(document, name, rootNode, templateFunc) {
        this.elems = {};
        this.name = name;
        this.rootNode = rootNode;
        this.sort = storage.get(this.name + '_sort', false);
        this.currentPage = 0;
        this.templateFunc = templateFunc;
        this.page = 0;

        this.init(document);
    };

    pagebase.prototype.init = function(document) {
        var that = this;
        var selector = $('#' + this.name + '-chooser');
        selector.attr('selectedIndex', this.sort ? 1 : 0);
        selector.metroSelect({
            'onchange': this.sortChanged.bind(this)
        });

        this.elems.internal_selector = document.getElementById('internal_selector_' + this.name);
    };

    pagebase.prototype.sortChanged = function sortChagned(sort) {
        this.sort = !this.sort;
        storage.save(this.name + '_sort', this.sort);

        this.rebuildDom();
    };

    pagebase.prototype.compareFunc = function compareFunc(a, b) {
        return a.firstElementChild.textContent > b.firstElementChild.textContent;
    };

    pagebase.prototype.rebuildDom = function() {
        var nodes = [];
        this.currentPage = 0;

        while (this.rootNode.firstElementChild) {
            var column = this.rootNode.firstElementChild;
            while (column.firstElementChild) {
                nodes.push(column.firstElementChild);
                column.firstElementChild.remove();
            }
            column.remove();
        }
        this.addAllNodes(nodes);
    };

    pagebase.prototype.buildDom = function buildDom(rows) {
        this.currentPage = 0;
        while (this.rootNode.firstElementChild) {
            this.rootNode.firstElementChild.remove();
        }
        this.addAll(rows);
    };

    pagebase.prototype.addAll = function addAll(rows) {
        var nodes = [];
        for (var i = 0; i < rows.length; i++) {
            var item = templates.item.cloneNode(true);
            item.id = this.name + '_' + i;
            item.firstElementChild.id = this.name + '_' + i;
            item.firstElementChild.appendChild(this.templateFunc(rows[i], this.currentPage));
            nodes.push(item);
        }
        this.addAllNodes(nodes);
    };

    pagebase.prototype.getPages = function getPages() {
        return Array.prototype.slice.call(this.elems.internal_selector.children);
    };

    pagebase.prototype.addAllNodes = function addAllNodes(nodes) {
        if (this.sort) {
            nodes.sort(this.compareFunc);
        } else {
            nodes.sort(function(a, b) {
                return a.id.toLocaleLowerCase() > b.id.toLocaleLowerCase();
            });
        }
        if (nodes.length) {
            // this.page = 0;
            var pageIndex = this.elems.internal_selector.children.length;
            var columnNode = templates.column.cloneNode(true);
            columnNode.firstElementChild.id = this.name + '_' + pageIndex;
            var pageItemCount = this.pageItemCount;
            if (this.showOptions) {
                pageItemCount--; // If the options are showing, account for sort options.
            }
            if (this.name === 'link') {
                pageItemCount--; // If its links page, account for add link options.
            }
            if (this.name === 'bookmarks') {
                util.addClass(columnNode.firstElementChild, 'bookmark-page');
            }
            //Add each row to an column and create new ones on the pageItemCount boundary.
            for (var i = 0; i < nodes.length; i++) {
                if (i !== 0 && i % pageItemCount === 0 && pageItemCount > 0) { //Skip the first row.
                    this.rootNode.appendChild(columnNode);
                    columnNode = templates.column.cloneNode(true);
                    columnNode.firstElementChild.id = this.name + '_' + pageIndex++;
                }
                columnNode.firstElementChild.appendChild(nodes[i]);
            }
            if ((i - 1) % this.pageItemCount !== 0 || this.pageItemCount === -1) { // - 1 to account for the for loop going one past last good index.
                this.rootNode.appendChild(columnNode);
            }
        }
    };

    pagebase.prototype.setPageItemCount = function setPageItemCount(pageItemCount) {
        if (pageItemCount !== this.pageItemCount) {
            this.pageItemCount = Math.max(pageItemCount, 1);
            this.rebuildDom();
        }
    };

    pagebase.prototype.setShowOptions = function setShowOptions(showOptions) {
        this.showOptions = showOptions;
        this.rebuildDom();
    };

    pagebase.prototype.truncatePages = function truncatePages(pageNumber) {
        // var page_number = this.parentNode.id.remove('pages_');
        var nodes = Array.prototype.slice.call(this.elems.internal_selector.children);
        console.log(parseInt(pageNumber) + 1);
        nodes.splice(0, parseInt(pageNumber) + 1);
        nodes.forEach(function(node) {
            node.remove();
        });
    };

    return pagebase;
});
