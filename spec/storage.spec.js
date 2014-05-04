(function() {
    'use strict';

    describe('Storage', function() {
        beforeEach(function() {
            this.testStorage = (function() {
                return {
                    store: {},
                    getItem: function(key) {
                        return this.store[key];
                    },
                    setItem: function(key, value) {
                        this.store[key] = value;
                    },
                    clear: function() {
                        this.store = {};
                    }
                };
            })();
            this.storage = new Storage(this.testStorage);
        });

        it('is real', function() {
            expect(this.storage).not.toBeNull();
            expect(this.storage).toBeDefined();
            expect(this.storage).toBeTruthy();
        });

        describe('has saveOnce', function() {
            it('that can save primitive', function() {
                this.storage.saveOnce('index', 'value');
                expect(this.testStorage.getItem('index')).toEqual('value');
            });

            it('that can save object', function() {
                var obj = { first: 'first', second: { first: 'second' }};
                this.storage.saveOnce('index', obj);
                expect(JSON.parse(this.testStorage.getItem('index'))).toEqual(obj);
            });
        });
    });
})();
