define(['jquery', '../utils/util', '../utils/storage', 'metro-select'], function(jquery, util, storage, metroSelect) {

    var validPageBases = ['simple', 'grouped', 'paneled'];

    var templates = {
       column: util.createElement('<div class="page"></div>'),
       item: util.createElement('<div class="item"></div>')
    };

    var pagebase = function pagebase() { };

    // Initialize the module.
    pagebase.prototype.init = function(document, name, rootNode, templateFunc) {
        this.elems = {};
        this.name = name;
        this.rootNode = rootNode;
        this.sort = storage.get(this.name + '_sort', false);
        this.currentPage = 0;
        this.templateFunc = templateFunc;
        this.page = 0;

        var that = this;
        var selector = jquery('#' + this.name + '-chooser');
        selector.attr('selectedIndex', this.sort ? 1 : 0);
        selector.metroSelect({
            'onchange': this.sortChanged.bind(this)
        });

        this.elems.internal_selector = document.getElementById('internal_selector_' + this.name);
    };

    // Ordering of elements on the page has changd.
    // sort: New sort order.
    pagebase.prototype.sortChanged = function sortChagned(sort) {
        this.sort = !this.sort;
        storage.save(this.name + '_sort', this.sort);
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
        this.addAllNodes(nodes);
    };

    // Adds all provided HTML nodes to the page.
    // nodes: The nodes to be added.
    pagebase.prototype.addAllNodes = function addAllNodes(nodes) {
      throw "#notmyjob";
    };

    // Returns the pages in the module.
    pagebase.prototype.getPages = function getPages() {
        return Array.prototype.slice.call(this.elems.internal_selector.children);
    };

    // Remove pages.
    // pageNumber: The page to start removing data.
    pagebase.prototype.truncatePages = function truncatePages(pageNumber) {
        // var page_number = this.parentNode.id.remove('pages_');
        var nodes = Array.prototype.slice.call(this.elems.internal_selector.children);
        console.log(parseInt(pageNumber) + 1);
        nodes.splice(0, parseInt(pageNumber) + 1);
        nodes.forEach(function(node) {
            node.remove();
        });
    };

    // Called when the number of items on a page changes.
    // pageItemCount: New number of items per page.
    pagebase.prototype.setPageItemCount = function setPageItemCount(pageItemCount) {
        if (this.pageItemCount !== pageItemCount) {
            this.pageItemCount = Math.max(pageItemCount, 1);
            this.rebuildDom();
        }
    };

    // Called when the visibility of options changes.
    // showOptions: True if options are now visible; false otherwise.
    pagebase.prototype.setShowOptions = function setShowOptions(showOptions) {
        if (this.showOptions !== showOptions) {
            this.showOptions = showOptions;
            this.rebuildDom();
        }
    };

    // Compare two different HTML nodes.
    // a: First node to compare.
    // b: Second node to compare.
    pagebase.prototype.compareFunc = function compareFunc(a, b) {
        return a.firstElementChild.textContent > b.firstElementChild.textContent;
    };

    return pagebase;
});
