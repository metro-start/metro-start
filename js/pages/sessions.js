import {Util} from '../utils/utils';
import PagebaseGrouped from '../pagebase/pagebase_grouped';

let Templates = {
    itemFragment: Util.createElement('<div class="session_item"></div>'),
    titleFragment: Util.createElement('<a class="title clickable"></a>'),
};

/**
 * Active sessions on other computers.
 *
 * @export
 * @class Sessions
 */
export default class Sessions {
    /**
     *Creates an instance of Sessions.
     * @memberof Sessions
     */
    constructor() {
        this.name = 'sessions';

        this.data = {};

        this.elems = {};

        this.sessions = {};
        this.elems.rootNode = document.getElementById('internal-selector-sessions');
        this.sessions = new PagebaseGrouped(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
        this.loadSessions();
    }

    /**
     * Called when the sort order has been changed.
     *
     * @param {any} newSort The new sort order.
     */
    sortChanged(newSort) {
        this.sessions.sortChanged(newSort, false);
    }

    //
    /**
     * Loads the available sessions from local and web storage
     */
    loadSessions() {
        let that = this;
        chrome.sessions.getDevices(null, (devices) => {
            for (let device of devices) {
                let data = [];
                for (let session of device.sessions) {
                    if (session.tab) {
                        data = data.concat(session);
                    } else if (session.window) {
                        data = data.concat(session.window.tabs);
                    }
                }
                that.sessions.addAll({
                    'heading': device.deviceName,
                    'data': data,
                });
            }
        });
    }

    /**
     * Templates a provided tab into an HTML element.
     *
     * @param {any} tab The tab session that should be turned into an element.
     * @return {any} The HTML element.
     */
    templateFunc(tab) {
        let fragment = Util.createElement('');

        let title = Templates.titleFragment.cloneNode(true);
        title.firstElementChild.id = `session_${tab.index}`;
        title.firstElementChild.href = tab.url;
        title.firstElementChild.textContent = tab.title;
        fragment.appendChild(title);

        return fragment;
    }
}
