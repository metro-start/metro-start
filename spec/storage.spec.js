(function() {
    describe('Storage', function() {
        beforeEach(function() {
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
                expect(this.fakeScope.index).toEqual(that.testObj);
                expect(this.callbackSpy).toHaveBeenCalled();
                expect(this.callbackSpy.calls.count()).toBe(2);
            });
        });
    });
})();
