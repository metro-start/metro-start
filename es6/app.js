import utils from './utils/utils';
import widgets from './widgets/widgets';
import pages from './pages/pages';
import './../scss/reset.scss';
import './../scss/main.scss';
import 'metro-select/metro-select.css';

const app = {
    data: {},

    elems: {
        hideRule: document.getElementById('hideRule'),
    },

    showOptions: false,

    utils,

    modules: [utils, widgets, pages],

    init() {
        this.modules.forEach((module) => {
            module.init(document);
        });

        const wrench = document.getElementById('wrench');
        wrench.addEventListener('click', () => {
            this.clickWrench();
            pages.changeToValidPage();
        });
    },

    /**
     * Shows the options on the page when the wrench is clicked.
     */
    clickWrench() {
        this.showOptions = !this.showOptions;

        if (this.showOptions) {
            document.body.classList.add('show-options');
            document.body.removeChild(this.elems.hideRule);
        } else {
            document.body.classList.remove('show-options');
            document.body.appendChild(this.elems.hideRule);
        }
    },
};

// Initialize the app after the storage is done initializing.
// This ensures we can retrieve our data before rendering the page.
utils.storage.init().then(() => {
    if (document.readyState !== 'loading') {
        app.init();
    } else {
        document.addEventListener('DOMContentLoaded', () => app.init(), {
            once: true,
        });
    }
});

export default app;
