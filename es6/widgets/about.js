import modal from '../utils/modal';
export default {
    elems: {
        aboutModal: document.getElementById('aboutModal'),
        aboutButton: document.getElementById('aboutButton'),
    },

    init: function() {
        this.elems.aboutModal.parentNode.removeChild(this.elems.aboutModal);
        this.elems.aboutButton.addEventListener(
            'click',
            this.openAboutModal.bind(this)
        );
    },

    /**
     * Shows the about modal modal window.
     */
    openAboutModal: function() {
        modal.createModal(
            'aboutModal',
            this.elems.aboutModal,
            this.aboutModalClosed.bind(this)
        );
    },

    /**
     * This function is unused.
     */
    aboutModalClosed: function() {},
};
