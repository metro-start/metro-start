(function() {
    describe('Storage', function() {
        beforeEach(function() {
            var that = this;
            this.fakeLocalStorage = {};
            spyOn(localStorage, 'getItem').and.callFake(function(key) {
                return that.fakeLocalStorage[key];
            });
            spyOn(localStorage, 'setItem').and.callFake(function(key, value) {
                that.fakeLocalStorage[key] = value;
            });
            spyOn(localStorage, 'clear').and.callFake(function() {
                that.fakeLocalStorage = {};
            });

            this.fakeChromeStorage = {};
            chrome = { storage: { sync: {get: function() {}, set: function() {}}}};
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

            this.testObj = { first: 'first', second: { first: 'second' }};
        });

        describe('can save data', function() {
            it('to localStorage', function() {
                storage.saveOnce('index', this.testObj);
                expect(JSON.parse(localStorage.getItem('index'))).toEqual(this.testObj);
                chrome.storage.sync.get('index', function(obj) {
                    expect(obj.index).toBeUndefined();
                });
                expect(this.fakeScope.index).toBeUndefined();
            });

            it('to localStorage and chromeStorage', function() {
                var that = this;
                storage.saveTwice('index', this.testObj);
                expect(JSON.parse(localStorage.getItem('index'))).toEqual(this.testObj);
                chrome.storage.sync.get('index', function(obj) {
                    expect(obj.index).toEqual(that.testObj);
                });
                expect(this.fakeScope.index).toBeUndefined();
            });

            it('to localStorage, chromeStorage and $scope', function() {
                var that = this;
                storage.saveThrice('index', this.testObj, this.fakeScope);
                expect(JSON.parse(localStorage.getItem('index'))).toEqual(this.testObj);
                chrome.storage.sync.get('index', function(obj) {
                    expect(obj.index).toEqual(that.testObj);
                });
                expect(this.fakeScope.index).toEqual(this.testObj);
            });
        });

        describe('can get data', function() {
            beforeEach(function() {
                this.callbackSpy = jasmine.createSpy('callback Spy');
            });

            it('when nothing is saved', function() {
                storage.get('index', {}, this.fakeScope, true, this.callbackSpy);
                expect(this.fakeScope.index).toEqual({});
                expect(this.callbackSpy).toHaveBeenCalled();
                expect(this.callbackSpy.calls.count()).toBe(1);
            });

            it('when saved only to localStorage', function() {
                var that = this;
                localStorage.setItem('index', JSON.stringify(this.testObj));
                storage.get('index', {}, this.fakeScope, true, this.callbackSpy);

                chrome.storage.sync.get('index', function(obj) {
                    expect(obj.index).toEqual(that.testObj);
                });
                expect(this.fakeScope.index).toEqual(this.testObj);
                expect(this.callbackSpy).toHaveBeenCalled();
                expect(this.callbackSpy.calls.count()).toBe(1);
            });

            it ('when saved only to chromeStorage', function() {
                chrome.storage.sync.set({index: this.testObj});
                storage.get('index', {}, this.fakeScope, true, this.callbackSpy);

                expect(localStorage.getItem('index')).toEqual(JSON.stringify(this.testObj));
                expect(this.fakeScope.index).toEqual(this.testObj);
                expect(this.callbackSpy).toHaveBeenCalled();
                expect(this.callbackSpy.calls.count()).toBe(2);
            });

            it('when different data saved to localStorage and chromeStorage', function() {
                var that = this;
                localStorage.setItem('index', JSON.stringify({bad: 'bad'}));
                chrome.storage.sync.set({index: this.testObj});
                storage.get('index', {}, this.fakeScope, true, this.callbackSpy);

                chrome.storage.sync.get('index', function(obj) {
                    expect(obj.index).toEqual(that.testObj);
                });
                expect(this.fakeScope.index).toEqual(this.testObj);
                expect(this.callbackSpy).toHaveBeenCalled();
                expect(this.callbackSpy.calls.count()).toBe(2);
            });
        });
    });
})();
