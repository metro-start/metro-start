/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
define(['jquery', 'utils/util'], function(jquery, util) {
    var templates = {
       column: util.createElement('<div class="page"></div>'),
       item: util.createElement('<div class="item"></div>')
    };

    var pagebase = function pagebase(rootNode, sorted, pageItemCount, templateFunc) {
        this.rootNode = rootNode;
        this.pageItemCount = pageItemCount;
        this.sorted = sorted;
        this.templateFunc = templateFunc;
    };

    pagebase.prototype.buildDom = function buildDom(rows) {
        //first remove all nodes.
        while(this.rootNode.lastChild) {
            this.rootNode.lastChild.remove();
        }
        //create columns for each row
        var columnNode = templates.column.cloneNode(true);
        for (var i = 0; i < rows.length; i++) {
            if (i !== 0 && i % this.pageItemCount === 0) {
                this.rootNode.appendChild(columnNode);
                columnNode = templates.column.cloneNode(true);
            }
            var item = templates.item.cloneNode(true);
            this.templateFunc(item.firstChild, rows[i]);
            columnNode.firstChild.appendChild(item);
        }
        if (i % this.pageItemCount === 0) {
            this.rootNode.appendChild(columnNode);
        }
    };

    pagebase.prototype.setPageItemCount = function setPageItemCount(pageItemCount, rows) {
        this.pageItemCount = pageItemCount;
        this.buildDom(rows);
    };

    return pagebase;
});
