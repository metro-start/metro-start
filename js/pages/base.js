/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
define(['utils/util'], function(util) {
    var base = function (rootDom, newRows, sorted, pageItemCount, getFunction, itemGenerator) {
        this.rootDom = rootDom;
        this.pageItemCount = pageItemCount;
        this.sorted = sorted;
        this.pages = [[]];
        this.itemGenerator = itemGenerator;

        this.buildDom = function() {
            var pageDomTemplate = util.createElement('<div class="page"></div>');
            var itemDomTemplate = util.createElement('<div class="item"></div>');
            for (var i = 0; i < this.pages.length; i++) {
                var page = this.pages[i];
                var pageDom = pageDomTemplate.cloneNode(true);
                for (var j = 0; j < page.length; j++) {
                    var item = page[j];
                    var itemDom = itemDomTemplate.cloneNode(true);
                    this.itemGenerator(itemDom.childNodes[0], item);
                    pageDom.childNodes[0].appendChild(itemDom);
                }
                this.rootDom.appendChild(pageDom);
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
            row.$$hashKey = undefined;
            // If the last column is full, add a new column.
            if (this.pages[this.pages.length - 1].length >= this.pageItemCount) {
                this.pages.push([]);
            }
            // Add item to last column.
            this.pages[this.pages.length - 1].push(row);
            if (this.sorted) this.sort();
        };

        /**
            Get an item from the collection.
            page: The page/column where the item is located.
            index: The item's index in that page.
        */
        this.get = function get(col, row) {
            return this.pages[col][row];
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
            for (index = 0; index < newRows.length; index++) {
                this.add(newRows[index]);
            }
            if (this.sorted) this.sort();
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
        this.setPageItemCount = function(pageItemCount) {
            this.pageItemCount = pageItemCount;
            var list = this.flatten();
            this.pages = [[]];
            this.addAll(list);
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
