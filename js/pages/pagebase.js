/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
define(['utils/util', 'utils/storage'], function(util, storage) {
    var templates = {
       column: util.createElement('<div class="page"></div>'),
       item: util.createElement('<div class="item"></div>')
    };

    var pagebase = function pagebase(document, name, rootNode, pageItemCount, templateFunc, compareFunc) {
        this.elems = {};
        this.name = name;
        this.rootNode = rootNode;
        this.sort = storage.get(this.name + '_sort') ? storage.get(this.name + '_sort') : false;
        this.templateFunc = templateFunc;
        this.compareFunc = compareFunc;
        if (!this.pageItemCount) {
            this.pageItemCount = pageItemCount;
        }

        this.init(document);
    };

    pagebase.prototype.init = function(document) {
        this.elems.sort = document.getElementById('sort_' + this.name);
        this.elems.sort.addEventListener('click', this.enableSort.bind(this));

        this.elems.unsort = document.getElementById('unsort_' + this.name);
        this.elems.unsort.addEventListener('click', this.disableSort.bind(this));

        if (this.sort) {
            util.addClass(this.elems.sort, 'sel-active');
        } else {
            util.addClass(this.elems.unsort, 'sel-active');
        }
    };

    pagebase.prototype.enableSort = function() {
        if (this.sort === false) {
            util.addClass(this.elems.sort, 'sel-active');
            util.removeClass(this.elems.unsort, 'sel-active');
            this.toggleSort();
        }
    };

    pagebase.prototype.disableSort = function() {
        if (this.sort === true) {
            util.removeClass(this.elems.sort, 'sel-active');
            util.addClass(this.elems.unsort, 'sel-active');
            this.toggleSort();
        }
    };

    pagebase.prototype.defaultCompareFunc = function defaultCompareFunc(a, b) {
        return a.firstChild.textContent > b.firstChild.textContent;
    };

    pagebase.prototype.buildDom = function buildDom(rows) {
        //Remove all existing nodes.
        while(this.rootNode.lastChild) {
            this.rootNode.lastChild.remove();
        }
        //Add each row to an column and create new ones on the pageItemCount boundary.
        var columnNode = templates.column.cloneNode(true);
        for (var i = 0; i < rows.length; i++) {
            if (i !== 0 && i % this.pageItemCount === 0) { //Skip the first row.
                this.rootNode.appendChild(columnNode);
                columnNode = templates.column.cloneNode(true);
            }
            var item = templates.item.cloneNode(true);
            item.firstChild.id = this.name + '_' + i;
            item.firstChild.appendChild(this.templateFunc(rows[i]));
            columnNode.firstChild.appendChild(item);
        }
        if (i % this.pageItemCount !== 0) {
            this.rootNode.appendChild(columnNode);
        }
    };

    pagebase.prototype.setPageItemCount = function setPageItemCount(pageItemCount, rows) {
        this.pageItemCount = Math.max(pageItemCount, 1);
        this.buildDom(rows);
    };

    pagebase.prototype.toggleSort = function toggleSort() {
        this.sort = !this.sort;
        storage.save(this.name + '_sort', this.sort);
        if (this.sort) {
            this.sortData(function(a, b) {
                return a.id.toLocaleLowerCase() > b.id.toLocaleLowerCase();
            });
        } else {
            this.sortData(this.compareFunc ? this.compareFunc : this.defaultCompareFunc);
        }
    };

    pagebase.prototype.sortData = function sortData(compareFunc) {
        var nodes = [];
        while(this.rootNode.lastChild) {
            nodes.push(this.rootNode.lastChild);
            this.rootNode.lastChild.remove();
        }
        nodes.sort(compareFunc);

        var fragment = util.createElement();
        for(var i = 0; i < nodes.length; i++) {
            fragment.appendChild(nodes[i]);
        }
        this.rootNode.appendChild(fragment);
    };

    return pagebase;
});
