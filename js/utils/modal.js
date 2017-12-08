define(['jquery', '../utils/util', '../utils/storage'], function(jquery, util) {
    var modal = {
        templates: {
            overlay: util.createElement('<div class="metro-modal overlay-wrap"></div>'),
            modalContent: util.createElement('<div class="metro-modal modal-content"></div>'),

            info: util.createElement('<div class="modal-info">'),
            confirm: util.createElement('<span id="confirm-button" class="main-color clickable"></span>'),
            cancel: util.createElement('<span id="cancel-button" class="main-color clickable"></span>')
        },

        modalCallbacks: { },

        init: function() { },

        /**
         * Creates a new modal window.
         * 
         * @param {any} id The id of the new modal that will be created.
         * @param {any} content The content to embed in the modal window.
         * @param {any} callback Function to call when the modal window closes.
         * @param {any} confirmText The text to display for confirmation. If empty, no confirm button will be shown.
         * @param {any} cancelText The tex to display for cancellation. If empty, no cancel button will be shown.
         */
        createModal: function (id, content, callback, confirmText, cancelText) {
            this.modalCallbacks[id] = callback;

            var overlay = this.templates.overlay.cloneNode(true);
            overlay.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));
            util.addClass(overlay.firstElementChild, id);

            var modalContent = this.templates.modalContent.cloneNode(true);
            var info = this.templates.info.cloneNode(true);

            if (!!confirmText) {
                // Do not show confirm button if the text is empty.
                var confirm = this.templates.confirm.cloneNode(true);
                confirm.firstElementChild.textContent = confirmText;
                confirm.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, true));
                info.firstElementChild.appendChild(confirm);
            }

            if(!!cancelText) {
                // Do not show cancel button if the text is empty.
                var cancel = this.templates.cancel.cloneNode(true);
                cancel.firstElementChild.textContent = cancelText;
                cancel.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));
                info.firstElementChild.appendChild(cancel);
            }

            modalContent.firstElementChild.id = id;
            util.addClass(modalContent.firstElementChild, id);
            modalContent.firstElementChild.appendChild(typeof content === 'string' ? util.createElement('<p>' + content + '</p>') : content);
            modalContent.firstElementChild.appendChild(info);

            var body = jquery('body');
            body.append(overlay);
            body.append(modalContent);
        },

        /**
         * Called when any modal window closes.
         * 
         * @param {any} id The id of the modal that closed.
         * @param {any} res The result of the closing modal.
         */
        modalClosed: function(id, res) {
            var elems = document.getElementsByClassName(id);
            while (elems.length > 0) { elems[0].remove(); }
            
            // If there are any callbacks for this modal.
            if (!!this.modalCallbacks && !!this.modalCallbacks[id]) {
                this.modalCallbacks[id](res);
            }

        }
    };

    return modal;
});
