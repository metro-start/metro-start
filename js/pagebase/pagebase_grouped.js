define(['../utils/util', '../utils/storage', './pagebase'], function (util, storage, pagebase) {
    var templates = {
        group: util.createElement('<div class="group"></div>'),
        column: util.createElement('<div class="page"></div>'),
        item: util.createElement('<div class="item"></div>'),
        heading: util.createElement('<div class="options-color"></div>')
    };

    var pagebase_grouped = function pagebase_grouped() {};

    pagebase_grouped.prototype = Object.create(pagebase.prototype);
    pagebase_grouped.prototype.className = 'pagebase-grouped';

    pagebase_grouped.prototype.addAll = function addAll(rows) {
        var group = {};
        group.heading = rows.heading;
        group.nodes = [];

        if (!!rows && !!rows.data) {
            for (var i = 0; i < rows.data.length; i++) {
                if (rows.data[i] !== null) {
                    var item = templates.item.cloneNode(true);
                    item.id = this.name + '_' + i;
                    item.firstElementChild.id = this.name + '_' + i;
                    item.firstElementChild.appendChild(this.templateFunc(rows.data[i], this.currentPage));
                    group.nodes.push(item);
                }
            }
            this.addAllNodes(group);
        }
    };

    pagebase_grouped.prototype.addAllNodes = function addAllNodes(group) {
        var nodes = group.nodes;
        var groupNode = templates.group.cloneNode(true);

        var heading = templates.heading.cloneNode(true);
        heading.firstElementChild.textContent = group.heading;
        groupNode.firstElementChild.appendChild(heading);

        var columnNode = templates.column.cloneNode(true);

        if (nodes.length) {
            for (var i = 0; i < nodes.length; i++) {
                columnNode.firstElementChild.appendChild(nodes[i]);
            }
        }

        groupNode.firstElementChild.appendChild(columnNode);
        this.rootNode.appendChild(groupNode);
    };

    pagebase_grouped.prototype.clear = function clear() {
        while (this.rootNode.lastChild) {
            this.rootNode.removeChild(this.rootNode.lastChild);
        }
    };

    pagebase_grouped.prototype.sortChanged = function sortChanged(newSort) {
        var currentSort = this.getSort();
        if (newSort === currentSort) {
            return;
        }

        this.updateSort(newSort);
        var groups = this.rootNode.children;
        for (var i = 0; i < groups.length; i++) {
            var column = groups[i].children[1];
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
            }
        }
    };

    return pagebase_grouped;
});