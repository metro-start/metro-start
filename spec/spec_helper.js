(function() {
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
    });
})();
