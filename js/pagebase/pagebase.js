define(['jquery', '../utils/util', '../utils/storage', '../utils/defaults', 'metro-select'], function (jquery, util, storage, defaults, metroSelect) {
    var templates = {
        item: util.createElement('<div class="item"></div>')
    };

    var pagebase = function pagebase() {};

    pagebase.prototype.init = function (document, name, rootNode, templateFunc) {
        this.elems = {};
        this.name = name;
        this.rootNode = rootNode;
        this.templateFunc = templateFunc;

        if (jquery('#' + this.name + '-sort-chooser').length !== 0)
        {
            jquery('#' + this.name + '-sort-chooser').metroSelect({
                initial: this.getSort(),
                onchange: this.sortChanged.bind(this)
            });
        }
    };

    pagebase.prototype.buildDom = function buildDom(rows) {
        var nodes = [];
        for (var i = 0; i < rows.length; i++) {
            var item = templates.item.cloneNode(true);
            if (!item.id) {
                item.id = this.name + '_' + i;
            }
            item.firstElementChild.id = this.name + '_' + i;
            item.firstElementChild.appendChild(this.templateFunc(rows[i]));
            nodes.push(item);
        }

        if (this.getSort() === 'sorted') {
            var that = this;
            nodes.sort(function (a, b) {
                return that.compareFunc(a.textContent, b.textContent);
            });
        }

        for (var j = 0; j < nodes.length; j++) {
            this.rootNode.appendChild(nodes[j]);
        }
    };

    pagebase.prototype.sortChanged = function sortChanged(newSort) {
        this.updateSort(newSort);

        var items = Array.prototype.slice.call(this.rootNode.childNodes);
        if (items.length !== 0) {
            while (this.rootNode.lastChild) {
                this.rootNode.removeChild(this.rootNode.lastChild);
            }

            if (newSort === 'sorted') {
                items.sort(this.sortFunc.bind(this));
            } else {
                items.sort(this.unsortFunc.bind(this));
            }

            for (var i = 0; i < items.length; i++) {
                this.rootNode.appendChild(items[i]);
            }
        }
    };

    pagebase.prototype.sortFunc = function sortFunc(a, b) {
        return this.compareFunc(a.textContent, b.textContent);
    };

    pagebase.prototype.unsortFunc = function unsortFunc(a, b) {
        return this.compareFunc(a.id, b.id);
    };

    pagebase.prototype.compareFunc = function compareFunc(a, b) {
        var nameA = a.toUpperCase();
        var nameB = b.toUpperCase();
        if (nameA < nameB) {
            return -1;
        } else if (nameA > nameB) {
            return 1;
        }
    };

    pagebase.prototype.getSort = function getSort() {
        var sort = storage.get('sort', defaults.getDefaultSort());
        return sort[this.name];
    };


    pagebase.prototype.updateSort = function updateSort(newSort) {
        var sort = storage.get('sort', defaults.getDefaultSort());
        sort[this.name] = newSort;
        storage.save('sort', sort);
    };

    return pagebase;
});