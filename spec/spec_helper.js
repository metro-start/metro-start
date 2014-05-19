define([], function specHelper() {
    beforeEach(function() {
        var that = this;
        this.fakeChromeStorage = {};
        chrome = {
            app: {
                getDetails: "function() {}"
            },
            storage: {
                sync: {
                    get: function(key, callback) {},
                    set: function(obj) {}
                }
            }
        };

        spyOn(chrome.app, 'getDetails').andCallFake(function() {
            return {
                version: that.fakeChromeStorage.version
            };
        });
        spyOn(chrome.storage.sync, 'get').andCallFake(function(key, callback) {
            callback(that.fakeChromeStorage);
        });
        spyOn(chrome.storage.sync, 'set').andCallFake(function(obj) {
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
