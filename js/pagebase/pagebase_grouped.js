define(['../utils/util', '../utils/storage', './pagebase'],
    (util, storage, pagebase) => {
        let templates = {
            group: util.createElement('<div class="group"></div>'),
            column: util.createElement('<div class="page"></div>'),
            item: util.createElement('<div class="item"></div>'),
            heading: util.createElement('<div class="options-color"></div>'),
        };

        let PagebaseGrouped = function PagebaseGrouped() {};

        PagebaseGrouped.prototype = Object.create(pagebase.prototype);
        PagebaseGrouped.prototype.className = 'pagebase-grouped';

        /**
         * All all rows to the pagebase as a group.
         *
         * @param {any} rows The rows to be added.
         */
        PagebaseGrouped.prototype.addAll = function addAll(rows) {
            let group = {};
            group.heading = rows.heading;
            group.nodes = [];

            if (!!rows && !!rows.data) {
                for (let i = 0; i < rows.data.length; i++) {
                    if (rows.data[i] !== null) {
                        let item = templates.item.cloneNode(true);
                        item.id = `${this.name}_${i}`;
                        item.firstElementChild.id = `${this.name}_${i}`;
                        item.firstElementChild.appendChild(this.templateFunc(rows.data[i], this.currentPage));
                        group.nodes.push(item);
                    }
                }
                this.addAllNodes(group);
            }
        };

        /**
         * All all nodes to the page.
         *
         * @param {any} group The group of nodes to be added.
         */
        PagebaseGrouped.prototype.addAllNodes = function addAllNodes(group) {
            let nodes = group.nodes;
            let groupNode = templates.group.cloneNode(true);

            let heading = templates.heading.cloneNode(true);
            heading.firstElementChild.textContent = group.heading;
            groupNode.firstElementChild.appendChild(heading);

            let columnNode = templates.column.cloneNode(true);

            if (nodes.length) {
                for (let i = 0; i < nodes.length; i++) {
                    columnNode.firstElementChild.appendChild(nodes[i]);
                }
            }

            groupNode.firstElementChild.appendChild(columnNode);
            this.rootNode.appendChild(groupNode);
        };

        /**
         * Clear the list of groups in the page.
         */
        PagebaseGrouped.prototype.clear = function clear() {
            while (this.rootNode.lastChild) {
                this.rootNode.removeChild(this.rootNode.lastChild);
            }
        };

        /**
         * Called when the sort order has been changed.
         *
         * @param {any} newSort The new sort order.
         */
        PagebaseGrouped.prototype.sortChanged = function sortChanged(newSort) {
            let currentSort = this.getSort();
            if (newSort === currentSort) {
                return;
            }

            this.updateSort(newSort);

            let groups = this.rootNode.children;
            for (let i = 0; i < groups.length; i++) {
                let column = groups[i].children[1];
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
                }
            }
        };

        return PagebaseGrouped;
    });
