define(['util'], function (util) {
    describe('Util', function() {
        describe('has maybe', function() {
            it('that works on null', function() {
                util.maybe(void 0)();
            });

            it('that works on functions', function() {
                spy = jasmine.createSpy('maybe spy');
                util.maybe(spy)();
                expect(spy).toHaveBeenCalled();
            });
        });
    });
});
