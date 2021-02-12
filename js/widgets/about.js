import jquery from 'jquery';
import modal from '../utils/modal';
let about = {
    elems: {
        aboutModal: document.getElementById('aboutModal'),
        aboutButton: document.getElementById('aboutButton'),
    },

    init() {
        this.elems.aboutModal.parentNode.removeChild(this.elems.aboutModal);
        this.elems.aboutButton.addEventListener(
            'click',
            this.openAboutModal.bind(this)
        );
    },

    /**
     * Shows the about modal modal window.
     */
    openAboutModal() {
        modal.createModal(
            'aboutModal',
            this.elems.aboutModal,
            this.aboutModalClosed.bind(this)
        );
    },

    /**
     * This function is unused.
     */
    aboutModalClosed() {},
};

export default about;
