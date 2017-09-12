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

        init: function() { },

        createModal: function (id, content, callback, confirmText, cancelText) {
            this.modalCallback = callback;

            var modalElement = this.templates.overlay.cloneNode(true);
            var modalContent = this.templates.modalContent.cloneNode(true);
            var info = this.templates.info.cloneNode(true);
            var confirm = this.templates.confirm.cloneNode(true);
            var cancel = this.templates.cancel.cloneNode(true);
            var overlayCover = this.templates.overlayCover.cloneNode(true);

            if (!!confirmText) {
                confirm.firstElementChild.textContent = confirmText;
            }

            if (!!cancelText) {
                cancel.firstElementChild.textContent = cancelText;
            }

            confirm.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, true));
            cancel.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));
            overlayCover.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));

            info.firstElementChild.appendChild(confirm);
            info.firstElementChild.appendChild(cancel);

            util.addClass(content, 'modal-custom');
            modalContent.firstElementChild.appendChild(content);
            modalContent.firstElementChild.appendChild(info);

            modalElement.firstElementChild.id = id;
            modalElement.firstElementChild.appendChild(modalContent);

            var body = jquery('body');
            body.append(modalElement);
        },

        modalClosed: function(overlayId, res) {
            if (res && !!this.modalCallback) {
                this.modalCallback();
            }

            var overlayElement = document.getElementById(overlayId);
            overlayElement.parentNode.removeChild(overlayElement);
        }
    };

    return modal;
});
