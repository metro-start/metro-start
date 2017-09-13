define(['jquery', '../utils/util', '../utils/storage'], function(jquery, util) {
    var modal = {
        templates: {
            overlay: util.createElement('<div id="overlay" class="overlay-wrap"></div>'),
            overlayCover: util.createElement('<div class="overlay" id="overlayCover"></div>'),
            modalContent: util.createElement('<div class="modal-content"></div>'),

            info: util.createElement('<div class="info">'),
            confirm: util.createElement('<span id="confirm-button" class="main-color clickable small-text"></span>'),
            cancel: util.createElement('<span id="cancel-button" class="main-color clickable small-text"></span>')
        },

        modalCallbacks: { },

        init: function() { },

        createModal: function (id, content, callback, confirmText, cancelText) {
            this.modalCallbacks[id] = callback;

            var modalElement = this.templates.overlay.cloneNode(true);
            var modalContent = this.templates.modalContent.cloneNode(true);
            var info = this.templates.info.cloneNode(true);
            var overlayCover = this.templates.overlayCover.cloneNode(true);
            overlayCover.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));

            if (confirmText !== '') {
                var confirm = this.templates.confirm.cloneNode(true);
                confirm.firstElementChild.textContent = confirmText;
                confirm.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, true));
            }

            if(cancelText !== '') {
                var cancel = this.templates.cancel.cloneNode(true);
                cancel.firstElementChild.textContent = cancelText;
                cancel.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));
                info.firstElementChild.appendChild(cancel);
            }

            modalContent.firstElementChild.appendChild(content);
            modalContent.firstElementChild.appendChild(info);

            // modalElement.firstElementChild.id = id;
            // modalElement.firstElementChild.appendChild(modalContent);

            var body = jquery('body');
            body.append(modalElement);
            body.append(modalContent);
        },

        modalClosed: function(id, res) {
            if (res && !!this.modalCallback) {
                this.modalCallbacks[id](res);
            }

            var overlayElement = document.getElementById(overlayId);
            overlayElement.parentNode.removeChild(overlayElement);
        }
    };

    return modal;
});
