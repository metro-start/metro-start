define(['jquery', '../utils/util', '../utils/storage'], function(jquery, util, storage) {
    var overlay = {

        overlayCover: document.getElementById('overlayCover'),
        overlay: document.getElementById('overlay'),
        message: document.getElementById('message'),
        confirm: document.getElementById('confirm-button'),
        cancel: document.getElementById('cancel-button'),

        init: function() {
            this.confirm.addEventListener('click', this.alertClosed.bind(this, true));
            this.cancel.addEventListener('click', this.alertClosed.bind(this, false));
            this.overlayCover.addEventListener('click', this.alertClosed.bind(this, false));
        },

        alert: function(message, callback) {
            this.message.textContent = message;
            util.removeClass(this.overlay, 'hide');
            this.alertCallback = callback;
        },

        alertClosed: function(res) {
            this.message.textContent = '';
            if (res && this.alertCallback) {
                this.alertCallback();
            } 

            util.addClass(this.overlay, 'hide');
        }
    };

    return overlay;
});
