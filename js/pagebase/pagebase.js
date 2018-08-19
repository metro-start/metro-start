define(['jquery', '../utils/util', '../utils/storage', '../utils/defaults', 'metro-select'],
    (jquery, util, storage, defaults) => {
        let templates = {
            column: util.createElement('<div class="page"></div>'),
            item: util.createElement('<div class="item"></div>'),
        };

        let pagebase = function pagebase() {};

        pagebase.prototype.className = 'pagebase';

        pagebase.prototype.init = function(document, name, rootNode, templateFunc) {
            this.name = name;
            this.rootNode = rootNode;
            this.sort = storage.get(`${this.name}_sort`, false);
            this.currentPage = 0;
            this.templateFunc = templateFunc;
            this.page = 0;

            util.addClass(this.rootNode, this.className);

            if (jquery(`#${this.name}-sort-chooser`).length !== 0) {
                jquery(`#${this.name}-sort-chooser`).metroSelect({
                    initial: this.getSort(),
                    onchange: this.sortChanged.bind(this),
                });
            }
        };

        /**
         * Build the dom.
         *
         * @param {any} rows HTML rows to be added to the Dom.
         */
        pagebase.prototype.buildDom = function buildDom(rows) {
            this.clear();
            this.addAll(rows);
        };

        /**
         * Add all rows to the page.
         *
         * @param {any} rows The new ros to be added to the page.
         */
        pagebase.prototype.addAll = function addAll(rows) {
            let nodes = [];
            for (let i = 0; i < rows.length; i++) {
                let item = templates.item.cloneNode(true);
                item.id = `${this.name}_${i}`;
                item.firstElementChild.id = `${this.name}_${i}`;
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

        /**
         * Adds all the given HTML nodes to the DOM, in a naive way (top to bottom, left to right).
         *
         * @param {any} nodes List of nodes to be added.
         */
        pagebase.prototype.addAllNodes = function addAllNodes(nodes) {
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
         * Clear the list of elements in the page.
         */
        pagebase.prototype.clear = function clear() {
            this.currentPage = 0;
            while (this.rootNode.firstElementChild) {
                this.rootNode.firstElementChild.remove();
            }
        };

        /**
         * Called when the sort options on the page chagnes.
         *
         * @param {any} newSort The new sort order.
         * @param {any} saveSort Whether the new sort should be saved.
         */
        pagebase.prototype.sortChanged = function sortChanged(newSort, saveSort) {
            let currentSort = this.getSort();
            if (saveSort === currentSort) {
                return;
            }

            this.updateSort(newSort);

            if (!!this.rootNode && this.rootNode.childElementCount !== 0) {
                let items = Array.prototype.slice.call(this.rootNode.children);
                while (this.rootNode.lastChild) {
                    this.rootNode.removeChild(this.rootNode.lastChild);
                }

                if (newSort === 'sorted') {
                    items.sort(this.sortFunc.bind(this));
                } else {
                    items.sort(this.unsortFunc.bind(this));
                }

                for (let i = 0; i < items.length; i++) {
                    this.rootNode.appendChild(items[i]);
                }
            }
        };

        /**
         * Sort the provided elements in order.
         *
         * @param {any} a The first element being compared.
         * @param {any} b The second element being compared.
         * @return {any} True if the first element is larger, false otherwise.
         */
        pagebase.prototype.sortFunc = function sortFunc(a, b) {
            return pagebase.prototype.compareFunc(a.textContent, b.textContent);
        };

        /**
         * Revert the sorting on the elements.
         *
         * @param {any} a The first element being compared.
         * @param {any} b The second element being compared.
         * @return {any} True if the first element was naturally first.
         */
        pagebase.prototype.unsortFunc = function unsortFunc(a, b) {
            return pagebase.prototype.compareFunc(a.id, b.id);
        };

        /**
         * Compare the two fields for sorting.
         *
         * @param {any} a The first element being compared.
         * @param {any} b The second element being compared.
         * @return {any} True if the first element is larger, false otherwise.
         */
        pagebase.prototype.compareFunc = function compareFunc(a, b) {
            let nameA = a.toUpperCase();
            let nameB = b.toUpperCase();
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            }
        };

        /**
         * Gets the sort order for the current page.
         *
         * @return {any} True if the page should be sorted, false otherwise.
         */
        pagebase.prototype.getSort = function getSort() {
            let sort = storage.get('sort', defaults.defaultSort);
            return sort[this.name];
        };

        /**
         * Updates the current sort options.
         *
         * @param {any} newSort The new sort order.
         */
        pagebase.prototype.updateSort = function updateSort(newSort) {
            let sort = storage.get('sort', defaults.defaultSort);
            sort[this.name] = newSort;
            storage.save('sort', sort);
        };

        return pagebase;
    });
