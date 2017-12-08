define(['../utils/util', '../utils/storage', './pagebase'], function(util, storage, pagebase) {
    var templates = {
       column: util.createElement('<div class="page panel-page"></div>'),
       item: util.createElement('<div class="item"></div>')
    };

    var pagebase_paneled = function pagebase_paneled() { };

    pagebase_paneled.prototype = Object.create(pagebase.prototype);
    pagebase_paneled.prototype.className = 'pagebase-grouped';

    /**
     * Adds all the given HTML nodes to the DOM in one single column.
     * 
     * @param {any} nodes List of nodes to be added.
     */
    pagebase_paneled.prototype.addAllNodes = function addAllNodes(nodes) {
        if (nodes.length) {
            var pageIndex = this.rootNode.children.length;
            var columnNode = templates.column.cloneNode(true);
            columnNode.firstElementChild.id = this.name + '_' + pageIndex;

            for (var i = 0; i < nodes.length; i++) {
                columnNode.firstElementChild.appendChild(nodes[i]);
            }
            this.rootNode.appendChild(columnNode);
        }
    };

    /**
     * Called when the sort order has been changed.
     * 
     * @param {any} newSort The new sort order.
     */
    pagebase_paneled.prototype.sortChanged = function sortChanged(newSort) {
        var currentSort = this.getSort();
        if (newSort === currentSort) {
            return;
        }

        this.updateSort(newSort);

        var columns = this.rootNode.children;
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            var rows = [];
            while (column.lastChild) {
                rows.push(column.lastChild);
                column.removeChild(column.lastChild);
            }

            if (newSort === 'sorted') {
                rows.sort(this.sortFunc);
            } else {
                rows.sort(this.unsortFunc);
            }

            for (var j = 0; j < rows.length; j++) {
                column.appendChild(rows[j]);

                if (util.hasClass(rows[j], 'bookmark-active') || util.hasClass(rows[j], 'theme-active')) {
                    console.log("Scrolling");
                    column.scrollTop = rows[j].offsetTop;
                }
            }
        }
    };

    /**
     * Remove some set of panels.
     * 
     * @param {any} pageNumber The panel number to start removing.
     */
    pagebase.prototype.truncatePages = function truncatePages(pageNumber) {
        var nodes = Array.prototype.slice.call(this.rootNode.children);
        nodes.splice(0, parseInt(pageNumber, 10) + 1);
        nodes.forEach(function (node) {
            node.remove();
        });
    };

    return pagebase_paneled;
});
