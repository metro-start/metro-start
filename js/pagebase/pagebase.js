define(['jquery', '../utils/util', '../utils/storage', '../utils/defaults', 'metro-select'], function (jquery, util, storage, defaults, metroSelect) {
    var templates = {
        column: util.createElement('<div class="page"></div>'),
        item: util.createElement('<div class="item"></div>')
    };

    var pagebase = function pagebase() { };

    // Initialize the module.
    pagebase.prototype.init = function (document, name, rootNode, templateFunc) {
        this.elems = {};
        this.name = name;
        this.rootNode = rootNode;
        this.sort = storage.get(this.name + '_sort', false);
        this.currentPage = 0;
        this.templateFunc = templateFunc;
        this.page = 0;


        if (jquery('#' + this.name + '-sort-chooser').length !== 0) {
            jquery('#' + this.name + '-sort-chooser').metroSelect({
                initial: this.getSort(),
                onchange: this.sortChanged.bind(this)
            });
        }

        this.elems.internal_selector = document.getElementById('internal_selector_' + this.name);
    };

    // Build the dom.
    // rows: HTML rows to be added to the Dom.
    pagebase.prototype.buildDom = function buildDom(rows) {
        this.currentPage = 0;
        while (this.rootNode.firstElementChild) {
            this.rootNode.firstElementChild.remove();
        }
        this.addAll(rows);
    };

    // Rebuild the dom by removing all nodes and re-adding them.
    // This is useful for resetting state.
    pagebase.prototype.rebuildDom = function () {
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

    // Add all rows to the page.
    // rows: The new ros to be added to the page.
    pagebase.prototype.addAll = function addAll(rows) {
        var nodes = [];
        for (var i = 0; i < rows.length; i++) {
            var item = templates.item.cloneNode(true);
            item.id = this.name + '_' + i;
            item.firstElementChild.id = this.name + '_' + i;
            item.firstElementChild.appendChild(this.templateFunc(rows[i], this.currentPage));
            nodes.push(item);
        }

        if (this.getSort() === 'sorted') {
            nodes.sort(this.sortFunc);
        } else {
            nodes.sort(this.unsortFunc);
        }

        this.addAllNodes(nodes);
    };

    // Adds all the given HTML nodes to the DOM, in a naive way (top to bottom, left to right).
    // nodes: List of nodes to be added.
    pagebase.prototype.addAllNodes = function addAllNodes(nodes) {
        if (nodes.length) {
            var pageIndex = this.elems.internal_selector.children.length;
            var columnNode = templates.column.cloneNode(true);
            columnNode.firstElementChild.id = this.name + '_' + pageIndex;

            // Add each row to an column and create new ones on the pageItemCount boundary.
            for (var i = 0; i < nodes.length; i++) {
                columnNode.firstElementChild.appendChild(nodes[i]);
            }

            // i - 1 to account because the for-loop will go one past last good index.
            if (i >= nodes.length) {
                this.rootNode.appendChild(columnNode);
            }
        }
    };

    // Returns the pages in the module.
    pagebase.prototype.getPages = function getPages() {
        return Array.prototype.slice.call(this.elems.internal_selector.children);
    };

    // Remove pages.
    // pageNumber: The page to start removing data.
    pagebase.prototype.truncatePages = function truncatePages(pageNumber) {
        var nodes = Array.prototype.slice.call(this.elems.internal_selector.children);
        nodes.splice(0, parseInt(pageNumber, 10) + 1);
        nodes.forEach(function (node) {
            node.remove();
        });
    };

    // Called when the visibility of options changes.
    // showOptions: True if options are now visible; false otherwise.
    pagebase.prototype.setShowOptions = function setShowOptions(showOptions) {
        if (this.showOptions !== showOptions) {
            this.showOptions = showOptions;
            this.rebuildDom();
        }
    };

    pagebase.prototype.sortChanged = function sortChanged(newSort, saveSort) {
        var currentSort = this.getSort();
        if (saveSort === currentSort) {
            return;
        }

        this.updateSort(newSort);

        if (!!this.rootNode && this.rootNode.childElementCount !== 0) {
            var items = Array.prototype.slice.call(this.rootNode.children);
            while (this.rootNode.lastChild) {
                this.rootNode.removeChild(this.rootNode.lastChild);
            }

            if (newSort === 'sorted') {
                items.sort(this.sortFunc.bind(this));
            } else {
                items.sort(this.unsortFunc.bind(this));
            }

            for (var i = 0; i < items.length; i++) {
                this.rootNode.appendChild(items[i]);
            }
        }
    };

    pagebase.prototype.sortFunc = function sortFunc(a, b) {
        return pagebase.prototype.compareFunc(a.textContent, b.textContent);
    };

    pagebase.prototype.unsortFunc = function unsortFunc(a, b) {
        return pagebase.prototype.compareFunc(a.id, b.id);
    };

    pagebase.prototype.compareFunc = function compareFunc(a, b) {
        var nameA = a.toUpperCase();
        var nameB = b.toUpperCase();
        if (nameA < nameB) {
            return -1;
        } else if (nameA > nameB) {
            return 1;
        }
    };

    pagebase.prototype.getSort = function getSort() {
        var sort = storage.get('sort', defaults.defaultSort);
        return sort[this.name];
    };


    pagebase.prototype.updateSort = function updateSort(newSort) {
        var sort = storage.get('sort', defaults.defaultSort);
        sort[this.name] = newSort;
        storage.save('sort', sort);
    };

    return pagebase;
});
