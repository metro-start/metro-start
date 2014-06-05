/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
define(['utils/util'], function(util) {
    var templates = {
       column: util.createElement('<div class="page"></div>'),
       item: util.createElement('<div class="item"></div>')
    };

    var pagebase = function pagebase(rootNode, sorted, pageItemCount, templateFunc) {
        this.rootNode = rootNode;
        this.sorted = sorted;
        this.templateFunc = templateFunc;
        if (!this.pageItemCount) {
            this.pageItemCount = pageItemCount;
        }
    };

    pagebase.prototype.buildDom = function buildDom(rows) {
        //Remove all existing nodes.
        while(this.rootNode.lastChild) {
            this.rootNode.lastChild.remove();
        }
        //Add each row to an column and create new ones on the pageItemCount boundary.
        var columnNode = templates.column.cloneNode(true);
        for (var i = 0; i < rows.length; i++) {
            if (i !== 0 && i % this.pageItemCount === 0) { //Skip the first row.
                this.rootNode.appendChild(columnNode);
                columnNode = templates.column.cloneNode(true);
            }
            var item = templates.item.cloneNode(true);
            item.firstChild.appendChild(this.templateFunc(rows[i]));
            columnNode.firstChild.appendChild(item);
        }
        if (i % this.pageItemCount !== 0) {
            this.rootNode.appendChild(columnNode);
        }
    };

    pagebase.prototype.setPageItemCount = function setPageItemCount(pageItemCount, rows) {
        this.pageItemCount = Math.max(pageItemCount, 1);
        this.buildDom(rows);
    };

    return pagebase;
});
