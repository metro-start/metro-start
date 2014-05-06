(function() {
    describe('Util', function() {
        beforeEach(function() {
            that = this;
            this.fakeNewVersion = '5.0.0';
            this.fakeOldVersion = '4.0,0';

            chrome.storage.sync.set({ version: this.fakeNewVersion });
        });

        describe('can upgrade app', function() {
            it('on first install', function() {
                localStorage.setItem('version', undefined);
                util.checkAndUpgradeVersion();

                expect(localStorage.getItem('version')).toEqual(this.fakeNewVersion);
            });

            it('on newer version', function() {
                localStorage.setItem('version', this.fakeOldVersion);
                util.checkAndUpgradeVersion();

                expect(localStorage.getItem('version')).toEqual(this.fakeNewVersion);
            });

            it('on same version', function() {
                localStorage.setItem('version', this.fakeNewVersion);
                util.checkAndUpgradeVersion();

                expect(localStorage.getItem('version')).toEqual(this.fakeNewVersion);
            });
        });
    });
})();
