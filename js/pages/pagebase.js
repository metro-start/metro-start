define(['utils/util', 'utils/storage', 'metro-select'], function(util, storage, metroSelect) {
    var templates = {
       column: util.createElement('<div class="page"></div>'),
       item: util.createElement('<div class="item"></div>')
    };

    var pagebase = function pagebase(document, name, rootNode, templateFunc) {
        this.elems = {};
        this.name = name;
        this.rootNode = rootNode;
        this.sort = storage.get(this.name + '_sort', false);
        this.templateFunc = templateFunc;

        this.init(document);
    };

    pagebase.prototype.init = function(document) {
        var that = this;
        var selector = $('#' + this.name + '-chooser');
        selector.attr('selectedIndex', this.sort ? 1 : 0);
        selector.metroSelect({
            'onchange': this.sortChanged.bind(this)
        });
    };

    pagebase.prototype.sortChanged = function sortChagned(sort) {
        this.sort = !this.sort;
        storage.save(this.name + '_sort', this.sort);

        this.rebuildDom();
    };

    pagebase.prototype.compareFunc = function compareFunc(a, b) {
        return a.firstElementChild.textContent > b.firstElementChild.textContent;
    };

    pagebase.prototype.rebuildDom = function() {
        var nodes = [];
        while (this.rootNode.firstElementChild) {
            var column = this.rootNode.firstElementChild;
            while (column.firstElementChild) {
                nodes.push(column.firstElementChild);
                column.firstElementChild.remove();
            }
            column.remove();
        }
        this.addAllNodes(nodes);
    };

    pagebase.prototype.buildDom = function buildDom(rows) {
        while (this.rootNode.firstElementChild) {
            this.rootNode.firstElementChild.remove();
        }
        var nodes = [];
        for (var i = 0; i < rows.length; i++) {
            var item = templates.item.cloneNode(true);
            item.id = this.name + '_' + i;
            item.firstElementChild.id = this.name + '_' + i;
            item.firstElementChild.appendChild(this.templateFunc(rows[i]));
            nodes.push(item);
        }
        this.addAllNodes(nodes);
    };

    pagebase.prototype.addAllNodes = function addAllNodes(nodes) {
        if (this.sort) {
            nodes.sort(this.compareFunc);
        } else {
            nodes.sort(function(a, b) {
                return a.id.toLocaleLowerCase() > b.id.toLocaleLowerCase();
            });
        }
        if (nodes.length) {
            var columnNode = templates.column.cloneNode(true);
            var pageItemCount = this.pageItemCount;
            if (this.showOptions) {
                pageItemCount--; // If the options are showing, account for sort options.
            }
            if (this.name === 'link') {
                pageItemCount--; // If its links page, accoutn for add link options.
            }
            //Add each row to an column and create new ones on the pageItemCount boundary.
            for (var i = 0; i < nodes.length; i++) {
                if (i !== 0 && i % pageItemCount === 0) { //Skip the first row.
                    this.rootNode.appendChild(columnNode);
                    columnNode = templates.column.cloneNode(true);
                }
                columnNode.firstElementChild.appendChild(nodes[i]);
            }
            if ((i - 1) % this.pageItemCount !== 0) { // - 1 to account for the for loop going one past last good index.
                this.rootNode.appendChild(columnNode);
            }
        }
    };

    pagebase.prototype.setPageItemCount = function setPageItemCount(pageItemCount) {
        if (pageItemCount !== this.pageItemCount) {
            this.pageItemCount = Math.max(pageItemCount, 1);
            this.rebuildDom();
        }
    };

    pagebase.prototype.setShowOptions = function setShowOptions(showOptions) {
        this.showOptions = showOptions;
        this.rebuildDom();
    };

    return pagebase;
});
