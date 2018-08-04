define(['../utils/util', '../utils/storage', './pagebase'],
    (util, storage, pagebase) => {
        let templates = {
            column: util.createElement('<div class="page panel-page"></div>'),
        };

        let PagebasePaneled = function PagebasePaneled() {};

        PagebasePaneled.prototype = Object.create(pagebase.prototype);
        PagebasePaneled.prototype.className = 'pagebase-grouped';

        /**
         * Adds all the given HTML nodes to the DOM in one single column.
         *
         * @param {any} nodes List of nodes to be added.
         */
        PagebasePaneled.prototype.addAllNodes = function addAllNodes(nodes) {
            if (nodes.length) {
                let pageIndex = this.rootNode.children.length;
                let columnNode = templates.column.cloneNode(true);
                columnNode.firstElementChild.id = `${this.name}_${pageIndex}`;

                for (let i = 0; i < nodes.length; i++) {
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
        PagebasePaneled.prototype.sortChanged = function sortChanged(newSort) {
            let currentSort = this.getSort();
            if (newSort === currentSort) {
                return;
            }

            this.updateSort(newSort);

            let columns = this.rootNode.children;
            for (let i = 0; i < columns.length; i++) {
                let column = columns[i];
                let rows = [];
                while (column.lastChild) {
                    rows.push(column.lastChild);
                    column.removeChild(column.lastChild);
                }

                if (newSort === 'sorted') {
                    rows.sort(this.sortFunc);
                } else {
                    rows.sort(this.unsortFunc);
                }

                for (let j = 0; j < rows.length; j++) {
                    column.appendChild(rows[j]);

                    if (util.hasClass(rows[j], 'active')) {
                        util.log('Scrolling to item');
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
            let nodes = Array.prototype.slice.call(this.rootNode.children);
            nodes.splice(0, parseInt(pageNumber, 10) + 1);
            nodes.forEach((node) => {
                node.remove();
            });
        };

        return PagebasePaneled;
    });
