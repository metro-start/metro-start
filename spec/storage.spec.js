define(['require', 'storage'], function storageSpec(require, storage) {
    describe('Storage', function() {
        beforeEach(function() {
            var that = this;

            //Save the result of the deferred getAll() to `this`.
            //It is safe to assume this.storage executes immediately because .done() will
            //  immediately execute if the promise has been resolved.
            //We are also guaranteed that it has been resolved because nothing
            //  in the test environment  is async.
            storage.getAll().done(function(storage) {
                that.storage = storage;
                that.storage.cache = {};
            });

            this.testObj = { first: 'first', second: { first: 'second' }};
        });

        it('can save data', function() {
            var that = this;
            this.storage.save('index', this.testObj);
            chrome.storage.sync.get('index', function(obj) {
                expect(obj.index).toEqual(that.testObj);
            });
        });

        describe('can get data', function() {
            it('when nothing is saved', function() {
                var res = this.storage.get('index', {});
                expect(res).toEqual({});
            });

            it ('when an object is saved', function() {
                var fakeScope = {};
                this.storage.save('index',this.testObj);
                var res = this.storage.get('index', {}, fakeScope);

                expect(res).toEqual(this.testObj);
                expect(fakeScope.index).toEqual(this.testObj);
            });


            if('and save it to scope', function() {
                this.storage.save('index',this.testObj);
                var res = this.storage.get('index', {}, this.fakeScope);

                expect(res).toEqual(this.testObj);
                expect(this.fakeScope.index).toEqual(this.testObj);
            });
        });
    });
});
