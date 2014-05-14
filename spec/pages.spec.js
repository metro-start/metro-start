(function() {
    describe('Pages', function() {
        beforeEach(function() {
            this.generate = function(fields, number) {
                var list = [];
                for(var i = 0; i < number; i++) {
                    var obj = {};
                    for(var key in fields) {
                        obj[key] = Math.random().toString();
                    }
                    list.push(obj);
                }
                return list;
            };
            this.getFunction = function(obj) {
                return obj.name;
            };
        });

        it('can be created', function() {
            var pages = new Pages();
            var items = this.generate(['name', 'title'], 30);
            pages.addAll(items);
            expect(pages).toBeDefined();
            expect(pages).not.toBe(null);
        });

        it('can support multiple pages', function() {
            var items = this.generate(['name', 'title'], 30);
            var pages = new Pages(items, false, 4);
            expect(pages.pages.length).toBe(8);
        });

        it('can be flattened', function() {
            var items = this.generate(['name', 'title'], 30);
            var pages = new Pages(items, false, 4);
            expect(pages.flatten()).toEqual(items);
        });

        it('can be sorted', function() {
            var items = this.generate(['name', 'title'], 30);
            var pages = new Pages(items, false, 4, this.getFunction);

            var sortedItems = items.sort(function(a, b) {
                return a.name > b.name;
            });

            pages.sort();
            expect(pages.flatten()).toEqual(sortedItems);
        });

        it('can remove elements', function() {
            var items = this.generate(['name', 'title'], 30);
            var pages = new Pages(items, false, 4);

            items.splice(8, 1);
            pages.remove(2, 0);
            expect(pages.flatten()).toEqual(items);
        });
    });
})();
