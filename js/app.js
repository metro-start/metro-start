// import domready from 'detect-dom-ready';
import {Utils} from './utils/utils';
import Widgets from './widgets/widgets';
import Pages from './pages/pages';


let elems = {
    hideRule: document.getElementById('hideRule'),
};

let showOptions = false;

[
    new Utils(),
    new Widgets(),
    new Pages(),
];

let wrench = document.getElementById('wrench');
wrench.addEventListener('click', () => {
    showOptions = !showOptions;

    /**
     * Shows the options on the page when the wrench is clicked.
     */
    if (showOptions) {
        document.body.removeChild(elems.hideRule);
    } else {
        document.body.appendChild(elems.hideRule);
    }
});
