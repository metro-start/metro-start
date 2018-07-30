import {Util} from '../utils/utils';
import Pagebase from './pagebase';

let Templates = {
    column: Util.createElement('<div class="page panel-page"></div>'),
};

/**
 * Pages that contain panels.
 *
 * @export
 * @class PagebasePaneled
 * @extends {Pagebase}
 */
export default class PagebasePaneled extends Pagebase {
    /**
     * Creates an instance of PagebasePaneled.
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
     * Adds all the given HTML nodes to the DOM in one single column.
     *
     * @param {any} nodes List of nodes to be added.
     */
    addAllNodes(nodes) {
        if (nodes.length) {
            let pageIndex = this.rootNode.children.length;
            let columnNode = Templates.column.cloneNode(true);
            columnNode.firstElementChild.id = `${this.name}_${pageIndex}`;

            for (let i = 0; i < nodes.length; i++) {
                columnNode.firstElementChild.appendChild(nodes[i]);
            }
            this.rootNode.appendChild(columnNode);
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

                if (Util.hasClass(rows[j], 'active')) {
                    Util.log('Scrolling to item');
                    column.scrollTop = rows[j].offsetTop;
                }
            }
        }
    }

    /**
     * Remove some set of panels.
     *
     * @param {any} pageNumber The panel number to start removing.
     */
    truncatePages(pageNumber) {
        let nodes = Array.prototype.slice.call(this.rootNode.children);
        nodes.splice(0, parseInt(pageNumber, 10) + 1);
        nodes.forEach((node) => {
            node.remove();
        });
    }
}
