import jquery from 'jquery';

import Util from './util';

let Templates = {
    overlay: Util.createElement('<div class="metro-modal overlay-wrap"></div>'),
    modalContent: Util.createElement('<div class="metro-modal modal-content"></div>'),

    info: Util.createElement('<div class="modal-info">'),
    confirm: Util.createElement('<span id="confirm-button" class="main-color clickable"></span>'),
    cancel: Util.createElement('<span id="cancel-button" class="main-color clickable"></span>'),
};

/**
 * Manages modal views.
 *
 * @export
 * @class Modal
 */
export default class Modal {
    /**
     *Creates an instance of Modal.
     * @memberof Modal
     */
    constructor() {
        this.modalCallbacks = {};
    }

    /**
     * Creates a new modal window.
     *
     * @param {any} id The id of the new modal that will be created.
     * @param {any} content The content to embed in the modal window.
     * @param {any} callback Function to call when the modal window closes.
     * @param {any} confirmText The text to display for confirmation. If empty, no confirm button will be shown.
     * @param {any} cancelText The tex to display for cancellation. If empty, no cancel button will be shown.
     */
    createModal(id, content, callback, confirmText, cancelText) {
        this.modalCallbacks[id] = callback;

        let overlay = Templates.overlay.cloneNode(true);
        overlay.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));
        Util.addClass(overlay.firstElementChild, id);

        let modalContent = Templates.modalContent.cloneNode(true);
        let info = Templates.info.cloneNode(true);

        if (confirmText) {
            // Do not show confirm button if the text is empty.
            let confirm = Templates.confirm.cloneNode(true);
            confirm.firstElementChild.textContent = confirmText;
            confirm.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, true));
            info.firstElementChild.appendChild(confirm);
        }

        if (cancelText) {
            // Do not show cancel button if the text is empty.
            let cancel = Templates.cancel.cloneNode(true);
            cancel.firstElementChild.textContent = cancelText;
            cancel.firstElementChild.addEventListener('click', this.modalClosed.bind(this, id, false));
            info.firstElementChild.appendChild(cancel);
        }

        modalContent.firstElementChild.id = id;
        Util.addClass(modalContent.firstElementChild, id);
        modalContent.firstElementChild.appendChild(typeof content === 'string' ? Util.createElement(`<p>${content}</p>`) : content);
        modalContent.firstElementChild.appendChild(info);

        let body = jquery('body');
        body.append(overlay);
        body.append(modalContent);
    }

    /**
     * Called when any modal window closes.
     *
     * @param {any} id The id of the modal that closed.
     * @param {any} res The result of the closing modal.
     */
    modalClosed(id, res) {
        let elems = document.getElementsByClassName(id);
        while (elems.length > 0) {
            elems[0].remove();
        }

        // If there are any callbacks for this modal.
        if (!!this.modalCallbacks && !!this.modalCallbacks[id]) {
            this.modalCallbacks[id](res);
        }
    }
}
