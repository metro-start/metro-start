define(['../utils/util', '../utils/storage', './pagebase'], function(util, storage, pagebase) {
    var templates = {
       group: util.createElement('<div class="group"></div>'),
       column: util.createElement('<div class="page"></div>'),
       item: util.createElement('<div class="item"></div>'),
       heading: util.createElement('<div class="options-color"></div>')
    };

    var pagebase_grouped = function pagebase_grouped() { };

    pagebase_grouped.prototype = Object.create(pagebase.prototype);

    pagebase_grouped.prototype.rebuildDom = function () {
      console.log("pagebase_grouped.rebuildDom was called.");
    };

    // Converts provided objects into HTML nodes, then adds them to the page.
    // rows: Dictionary of rows to be added to the page.
    // Every time this function is called, it creates a new group.
    pagebase_grouped.prototype.addAll = function addAll(rows) {
        var group = {};
        group.heading = rows.heading;
        group.nodes = [];

        if (!!rows && !!rows.themes) {
                for (var i = 0; i < rows.themes.length; i++) {
                if (rows.themes[i] !== null) {
                    var item = templates.item.cloneNode(true);
                    item.id = this.name + '_' + i;
                    item.firstElementChild.id = this.name + '_' + i;
                    item.firstElementChild.appendChild(this.templateFunc(rows.themes[i], this.currentPage));
                    group.nodes.push(item);
                }
                }
                this.addAllNodes(group);
        }
    };

    // Adds all the given HTML nodes to the DOM as a series of groups.
    // nodes: Dictionary of nodes to be added.
    pagebase_grouped.prototype.addAllNodes = function addAllNodes(group) {
      var nodes = group.nodes;
        if (this.sort) {
            nodes.sort(this.compareFunc);
        } else {
            nodes.sort(function(a, b) {
                return a.id.toLocaleLowerCase() > b.id.toLocaleLowerCase();
            });
        }
        if (nodes.length) {
            var groupNode = templates.group.cloneNode(true);

            var heading = templates.heading.cloneNode(true);
            heading.firstElementChild.textContent = group.heading;
            groupNode.firstElementChild.appendChild(heading);

            var pageIndex = this.elems.internal_selector.children.length;
            var columnNode = templates.column.cloneNode(true);
            columnNode.firstElementChild.id = this.name + '_' + pageIndex;

            var pageItemCount = this.pageItemCount - this.getReservedItemCount();

            //Add each row to an column and create new ones on the pageItemCount boundary.
            for (var i = 0; i < nodes.length; i++) {
                if (i !== 0 && i % pageItemCount === 0 && pageItemCount > 0) { //Skip the first row.
                    groupNode.firstElementChild.appendChild(columnNode);
                    columnNode = templates.column.cloneNode(true);
                    columnNode.firstElementChild.id = this.name + '_' + pageIndex++;
                }
                columnNode.firstElementChild.appendChild(nodes[i]);
            }
            if ((i - 1) % this.pageItemCount !== 0 || this.pageItemCount === -1) { // - 1 to account for the for loop going one past last good index.
                groupNode.firstElementChild.appendChild(columnNode);
            }
            this.rootNode.appendChild(groupNode);
        }
    };

    // Gets how much space to reserve when displaying items.
    pagebase_grouped.prototype.getReservedItemCount = function getReservedItemCount() {
      // If the options are showing, account for sort options.
      if (this.showOptions) {
        // If its links page, account for add link options.
        return 1;
      }

      return 0;
    };

    return pagebase_grouped;
});
