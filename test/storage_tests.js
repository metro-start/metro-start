(function() {
    'use strict';

    describe('Storage', function() {
        var storage;

        beforeEach(function() {
            spyOn(localStorage, 'getItem').andCallFake(function (key) {
                return store[key];
            });
            spyOn(localStorage, 'setItem').andCallFake(function (key, value) {
                store[key] = value + '';
                return store[key];
            });
            spyOn(localStorage, 'clear').andCallFake(function () {
                store = {};
            });
        });

        it("is real", function() {
            expect(true).toBe(true);
        });
    });
})();
