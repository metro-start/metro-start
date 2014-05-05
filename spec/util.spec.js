(function() {
    describe('Util', function() {
        beforeEach(function() {
            that = this;
            this.fakeNewVersion = '5.0.0';
            this.fakeOldVersion = '4.0,0';

            chrome.storage.sync.set({ version: this.fakeNewVersion });
        });

        describe('can upgrade app', function() {
            it('when there no older versions', function() {
                localStorage.setItem('version', undefined);
                util.checkAndUpgradeVersion();

                expect(localStorage.getItem('version')).toEqual('5.0.0');
            });
        });
    });
})();
