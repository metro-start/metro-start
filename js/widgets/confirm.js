define(['jquery', '../utils/util', '../utils/storage'], function(jquery, util, storage) {
    var overlay = {

        overlay: document.getElementById('overlay'),
        confirm: document.getElementById('confirm-button'),
        cancel: document.getElementById('cancel-button'),

        init: function(document) {
            this.confirm.addEventListener('click', this.alertClosed.bind(this, true));
            this.cancel.addEventListener('click', this.alertClosed.bind(this, false));
        },

        alert: function(message, callback) {
            util.removeClass(this.overlay, 'hide');
            this.alertCallback = callback;
        },

        alertClosed: function(res) {
            if (res && this.alertCallback) {
                this.alertCallback();
            } 

            util.addClass(this.overlay, 'hide');
        }
    };

    return overlay;
});
