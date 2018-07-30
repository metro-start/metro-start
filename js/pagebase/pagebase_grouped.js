import {Util} from '../utils/utils';
import Pagebase from './pagebase';

let Templates = {
    group: Util.createElement('<div class="group"></div>'),
    column: Util.createElement('<div class="page"></div>'),
    item: Util.createElement('<div class="item"></div>'),
    heading: Util.createElement('<div class="options-color"></div>'),
};

/**
 * Pages with grouped sections.
 *
 * @export
 * @class PagebaseGrouped
 * @extends {Pagebase}
 */
export default class PagebaseGrouped extends Pagebase {
    /**
     * Creates an instance of PagebaseGrouped.
     * @param {*} document The render document.
     * @param {*} name The name of the pagebae.
     * @param {*} rootNode The root DOM node to render into.
     * @param {*} templateFunc Row generator function.
     * @memberof Pagebase
     */
    constructor(document, name, rootNode, templateFunc) {
        super(document, name, rootNode, templateFunc);
    }

    /**
     * All all rows to the pagebase as a group.
     *
     * @param {any} rows The rows to be added.
     */
    addAll(rows) {
        let group = {};
        group.heading = rows.heading;
        group.nodes = [];

        if (!!rows && !!rows.data) {
            for (let i = 0; i < rows.data.length; i++) {
                if (rows.data[i] !== null) {
                    let item = Templates.item.cloneNode(true);
                    item.id = `${this.name}_${i}`;
                    item.firstElementChild.id = `${this.name}_${i}`;
                    item.firstElementChild.appendChild(this.templateFunc(rows.data[i], this.currentPage));
                    group.nodes.push(item);
                }
            }
            this.addAllNodes(group);
        }
    }

    /**
     * All all nodes to the page.
     *
     * @param {any} group The group of nodes to be added.
     */
    addAllNodes(group) {
        let nodes = group.nodes;
        let groupNode = Templates.group.cloneNode(true);

        let heading = Templates.heading.cloneNode(true);
        heading.firstElementChild.textContent = group.heading;
        groupNode.firstElementChild.appendChild(heading);

        let columnNode = Templates.column.cloneNode(true);

        if (nodes.length) {
            for (let i = 0; i < nodes.length; i++) {
                columnNode.firstElementChild.appendChild(nodes[i]);
            }
        }

        groupNode.firstElementChild.appendChild(columnNode);
        this.rootNode.appendChild(groupNode);
    }

    /**
     * Clear the list of groups in the page.
     */
    clear() {
        while (this.rootNode.lastChild) {
            this.rootNode.removeChild(this.rootNode.lastChild);
        }
    }

    /**
     * Called when the sort order has been changed.
     *
     * @param {any} newSort The new sort order.
     */
    sortChanged(newSort) {
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
    }
}
