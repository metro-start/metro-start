define([], function() {
    beforeEach(function() {
        var that = this;
        this.fakeChromeStorage = {};
        chrome = {
            app: {
                getDetails: function() {}
            },
            storage: {
                sync: {
                    getAll: function() {},
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
});
