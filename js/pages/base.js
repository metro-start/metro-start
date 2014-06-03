/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
define(['utils/util'], function(util) {
    var base = function (rootDom, newRows, sorted, pageItemCount, getFunction, itemGenerator) {
        this.rootDom = rootDom;
        this.pageItemCount = pageItemCount;
        this.sorted = sorted;
        this.columns = [];
        this.columnsCount = [];
        this.itemGenerator = itemGenerator;
        this.templates = {
            column: util.createElement('<div class="page"></div>'),
            item: util.createElement('<div class="item"></div>')
        };

        this.buildDom = function() {
            while(this.rootDom.lastChild) {
                this.rootDom.lastChild.remove();
            }
            for (var i = 0; i < this.columns.length; i++) {
                this.rootDom.appendChild(this.columns[i]);
            }
        };

        /**
            Defult function to retrieve the actionable member of the collection's items.
            elem: The object that contains the element to be used.
            returns: The element that should be used.
        */
        this.getFunction = function getFunction(elem) { return elem; };

        /**
            Add an item to the collection.
            row: The item being added.
        */
        this.add = function add(row) {
            var last = this.columns.length -1;
            if (last === -1 || this.columnsCount[last] >= this.pageItemCount) {
                this.columns.push(this.templates.column.cloneNode(true));
                this.columnsCount.push(0);
                last++;
            }
            var item = this.templates.item.cloneNode(true);
            this.itemGenerator.func(item.childNodes[0], row);
            this.columns[last].childNodes[0].appendChild(item);
            this.columnsCount[last]++;
        };

        /**
            Get an item from the collection.
            page: The page/column where the item is located.
            index: The item's index in that page.
        */
        this.get = function get(col, row) {
        //    return this.pages[col][row];
        };
        /**
            Remove an item from the collection.
            page: The page/column where the item is located.
            index: The item's index in that page.
        */
        this.remove = function remove(page, index) {
            this.pages[page].splice(index, 1);
            // Shift items back from forward pages to fill the hole.
            for (var i = page; i < this.pages.length - 1; i++) {
                this.pages[i].push(this.pages[i + 1].shift());
            }
            // The the last page is now empty, pop it.
            if (this.pages.length > 1 && this.pages[this.pages.length - 1].length === 0)
                this.pages.pop();
            if (this.sorted) this.sort();
        };

        /**
            Add all elements in the array to the object.
            newRows: The array of elements to be added.
        */
        this.addAll = function addAll(newRows) {
            for (var i = 0; i < newRows.length; i++) {
                this.add(newRows[i]);
            }
//            if (this.sorted) this.sort();
        };

        /**
            Sort elements in the collection alphabetically in descending order
        */
        this.sort = function sort() {
            if (this.sorted === false) {
                this.sorted = true;
                var sorted = this.flatten().sort(function(a, b) {
                    if (getFunction(a) > getFunction(b)) {
                        return 1;
                    } else if(getFunction(a) < getFunction(b)) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                this.pages = [[]];
                this.addAll(sorted);
            }
        };
        /**
            Flatten the collection and turn it into a 1D array.
            returns: The array in 1D format.
        */
        this.flatten = function fltten() {
            return this.pages.reduce(function(a, b) { return a.concat(b); });
        };

        /**
            Set the number of items per page.
            pageItemCount: The new number of items per page.
        */
        this.setPageItemCount = function(pageItemCount, rows) {
            this.pageItemCount = pageItemCount;
            this.columns = [];
            this.columnsCount = [];
            this.addAll(rows);
            this.buildDom();
            // var list = this.flatten();
            // this.pages = [[]];
            // this.addAll(list);
            // this.buildDom();
        };

        /**
            Flatten the collection and turn it into a 1D array.
            returns: The array in 1D format.
        */
        this.flatten = function() {
            return this.pages.reduce(function(a, b) { return a.concat(b); });
        };

        /*
            Ininitializes the collection.
        */
        this.getFunction = getFunction;
        if (newRows) this.addAll(newRows);
    };

    return base;
});


/**
    Get functions that retrieve different types of data from various things
    that could be in the pages object.
*/
var getFunctions = {
    'name': function(elem) {
        return elem.name.toLocaleLowerCase();
    },
    'title': function(elem) {
        return elem.title.toLocaleLowerCase();
    },
};
