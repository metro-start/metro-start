define(['jquery', '../utils/util', '../utils/storage'], function(jquery, util) {
    var modal = {
        templates: {
            overlay: util.createElement('<div id="overlay" class="metro-modal overlay-wrap options-color"></div>'),
            modalContent: util.createElement('<div class="metro-modal modal-content"></div>'),

            info: util.createElement('<div class="info">'),
            confirm: util.createElement('<span id="confirm-button" class="main-color clickable small-text"></span>'),
            cancel: util.createElement('<span id="cancel-button" class="main-color clickable small-text"></span>')
        },

        modalCallbacks: { },

        init: function() { },

        createModal: function (id, content, callback, confirmText, cancelText) {
            this.modalCallbacks[id] = callback;

            var overlay = this.templates.overlay.cloneNode(true);
            overlay.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));
            util.addClass(overlay.firstElementChild, id);

            var modalContent = this.templates.modalContent.cloneNode(true);
            var info = this.templates.info.cloneNode(true);

            if (!!confirmText) {
                var confirm = this.templates.confirm.cloneNode(true);
                confirm.firstElementChild.textContent = confirmText;
                confirm.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, true));
            }

            if(!!cancelText) {
                var cancel = this.templates.cancel.cloneNode(true);
                cancel.firstElementChild.textContent = cancelText;
                cancel.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));
                info.firstElementChild.appendChild(cancel);
            }

            util.addClass(modalContent.firstElementChild, id);
            modalContent.firstElementChild.appendChild(content);
            modalContent.firstElementChild.appendChild(info);

            var body = jquery('body');
            body.append(overlay);
            body.append(modalContent);
        },

        modalClosed: function(id, res) {
            var elems = document.getElementsByClassName(id);
            while (elems.length > 0) { elems[0].remove(); }
            
            if (!!this.modalCallbacks && !!this.modalCallbacks[id]) {
                this.modalCallbacks[id](res);
            }

        }
    };

    return modal;
});
