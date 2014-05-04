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
            spyOn(chrome.storage.sync, 'get').and.callFake(function(key) {
                return that.fakeChromeStorage[key];
            });
            spyOn(chrome.storage.sync, 'set').and.callFake(function(obj) {
                var key = Object.keys(obj)[0];
                that.fakeChromeStorage[key] = obj[key];
            });

            this.fakeScope = {};

            this.testObj = { first: 'first', second: { first: 'second' }};
        });

        it('can saveOnce to localStorage', function() {
            storage.saveOnce('index', this.testObj);
            expect(JSON.parse(localStorage.getItem('index'))).toEqual(this.testObj);
            expect(chrome.storage.sync.get('index')).toBeUndefined();
            expect(this.fakeScope.index).toBeUndefined();
        });

        it('can saveTwice to localStorage and chromeStorage', function() {
            storage.saveTwice('index', this.testObj);
            expect(JSON.parse(localStorage.getItem('index'))).toEqual(this.testObj);
            expect(chrome.storage.sync.get('index')).toEqual(this.testObj);
            expect(this.fakeScope.index).toBeUndefined();
        });

        it('can saveThrice to localStorage, chromeStorage and $scope', function() {
            storage.saveThrice('index', this.testObj, this.fakeScope);
            expect(JSON.parse(localStorage.getItem('index'))).toEqual(this.testObj);
            expect(chrome.storage.sync.get('index')).toEqual(this.testObj);
            expect(this.fakeScope.index).toEqual(this.testObj);
        });
    });
})();
