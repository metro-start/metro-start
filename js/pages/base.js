/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
define(['utils/util'], function(util) {
    var base = function (rootDom, newRows, sorted, pageItemCount, templateCallback) {
        this.rootDom = rootDom;
        this.pageItemCount = pageItemCount;
        this.sorted = sorted;
        this.columns = [];
        this.columnsCount = [];
        this.templateCallback = templateCallback;
        this.templates = {
            column: util.createElement('<div class="page"></div>'),
            item: util.createElement('<div class="item"></div>')
        };

        this.buildDom = function() {
            while(this.rootDom.lastChild) {
                this.rootDom.lastChild.remove();
            }
            for (var i = 0; i < this.columns.length; i++) {
                this.rootDom.appendChild(this.columns[i]);
            }
        };

        this.add = function add(row) {
            var last = this.columns.length -1;
            if (last === -1 || this.columnsCount[last] >= this.pageItemCount) {
                this.columns.push(this.templates.column.cloneNode(true));
                this.columnsCount.push(0);
                last++;
            }
            var item = this.templates.item.cloneNode(true);
            this.templateCallback(item.firstChild, row);
            this.columns[last].firstChild.appendChild(item);
            this.columnsCount[last]++;
        };

        this.addAll = function addAll(newRows) {
            for (var i = 0; i < newRows.length; i++) {
                this.add(newRows[i]);
            }
        };

        this.setPageItemCount = function(pageItemCount, rows) {
            this.pageItemCount = pageItemCount;
            this.relayout(rows);
        };

        this.relayout = function(rows) {
            this.columns = [];
            this.columnsCount = [];
            this.addAll(rows);
            this.buildDom();
        };

        if (newRows) this.addAll(newRows);
    };

    return base;
});
