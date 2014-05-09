(function() {
    describe('Storage', function() {
        beforeEach(function() {
            this.testObj = { first: 'first', second: { first: 'second' }};
        });

        describe('can save data', function() {
            it('when chrome.storage is unavailable', function() {
                chrome = { storage: undefined };
                storage.save('index', this.testObj);
                expect(JSON.parse(localStorage.getItem('index'))).toEqual(this.testObj);
            });

            it('when chrome.storage is available', function() {
                var that = this;
                storage.save('index', this.testObj);
                expect(localStorage.getItem('index')).toBeUndefined();
                chrome.storage.sync.get('index', function(obj) {
                    expect(obj.index).toEqual(that.testObj);
                });
            });
        });

        describe('can get data', function() {
            beforeEach(function() {
                this.callbackSpy = jasmine.createSpy('callback Spy');
            });

            it('when nothing is saved', function() {
                storage.get('index', {}, this.fakeScope, this.callbackSpy);
                expect(this.fakeScope.index).toEqual({});
                expect(this.callbackSpy).toHaveBeenCalled();
                expect(this.callbackSpy.calls.count()).toBe(1);
            });

            it('when chrome.storage is unavailable', function() {
                chrome = { storage: undefined };
                localStorage.setItem('index', JSON.stringify(this.testObj));
                storage.get('index', {}, this.fakeScope, this.callbackSpy);

                expect(this.fakeScope.index).toEqual(this.testObj);
                expect(this.callbackSpy).toHaveBeenCalled();
                expect(this.callbackSpy.calls.count()).toBe(1);
            });

            it ('when chrome.storage is available', function() {
                chrome.storage.sync.set({index: this.testObj});
                storage.get('index', {}, this.fakeScope, this.callbackSpy);

                expect(this.fakeScope.index).toEqual(this.testObj);
                expect(this.callbackSpy).toHaveBeenCalled();
                expect(this.callbackSpy.calls.count()).toBe(1);
            });
        });
    });
})();
