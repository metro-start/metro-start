require(['util'], function(util) {
    describe('Util', function() {
        describe('has maybe', function() {
            it('works on null', function() {
                util.maybe(void 0)();
            });

            it('works on functions', function() {
                spy = jasmine.createSpy('maybe spy');
                util.maybe(spy)();
                expect(spy).toHaveBeenCalled();
            });
        });
    });
});
