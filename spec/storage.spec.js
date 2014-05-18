define(function (require) {
    describe('Storage', function() {
        beforeEach(function() {
            var that = this;
            this.fakeChromeStorage = {};
            if(typeof chrome !== 'undefined') {
                chrome = {
                    app: {
                        getDetails: function() {}
                    },
                    storage: {
                        sync: {
                            get: function() {},
                            set: function() {}
                        }
                    }
                };
            }
            
            spyOn(chrome.app, 'getDetails').and.callFake(function() {
                return {
                    version: that.fakeChromeStorage.version
                };
            });
            spyOn(chrome.storage.sync, 'get').and.callFake(function(key, callback) {
                callback(that.fakeChromeStorage);
            });
            spyOn(chrome.storage.sync, 'set').and.callFake(function(obj) {
                var key = Object.keys(obj)[0];
                that.fakeChromeStorage[key] = obj[key];
            });

            this.fakeScope = {
                $apply: function(func) {
                    func();
                }
            };

            //save the result of the deferred getAll() to `this`.
            //It is safe to assume this.storage executes immediately because .done() will
            //immediately execute if the promise has been resolved.
            //We are also guaranteed that it has been resolved because nothing
            //in the test environment  is async.
            require('storage').getAll().done(function(storage) {
                that.storage = storage;
                that.storage.cache = {};
            });

            this.testObj = { first: 'first', second: { first: 'second' }};
        });

        describe('can save data', function() {
            it('when chrome.storage is unavailable', function() {
                this.storage.save('index', this.testObj);
                expect(JSON.parse(localStorage.getItem('index'))).toEqual(this.testObj);
            });

            it('when chrome.storage is available', function() {
                var that = this;
                this.storage.save('index', this.testObj);
                chrome.storage.sync.get('index', function(obj) {
                    expect(obj.index).toEqual(that.testObj);
                });
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
