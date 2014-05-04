(function() {
    'use strict';

    describe('Storage', function() {
        var storage;

        beforeEach(function() {
            var testStorage = {
                store: {},

                getItem: function(key) {
                    return store[key];
                },
                setItem: function(key, value) {
                    store[key] = value;
                },
                clear: function() {
                    store = {};
                }
            };
            storage = new Storage(testStorage);
        });

        it('is real', function() {
            expect(storage).not.toBe(null);
            expect(storage).not.toBe(undefined);
        });

        it('can save once', function() {

        });
    });
})();
