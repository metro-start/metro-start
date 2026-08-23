import PagebaseGrouped from '../pagebase/pagebase_grouped';
import util from '../utils/util';
import ext from '../utils/extension';
export default {
    name: 'sessions',
    enabled: false,
    supported: Boolean(ext.sessions && (ext.sessions.getDevices || ext.sessions.getRecentlyClosed)),

    setPermissionVisibility(visible, cb) {
        const that = this;
        if (visible) {
            util.log('request sessions', ext.permissions);
            ext.permissions.request({
                permissions: ['sessions']
            },
            (granted) => {
                that.enabled = granted;
                if (cb) {
                    cb(granted);
                }
                that.loadSessions();
            }
            );
        } else {
            ext.permissions.remove({
                permissions: ['sessions']
            },
            (granted) => {
                that.enabled = !granted;
                if (cb) {
                    cb(granted);
                }
                that.loadSessions();
            }
            );
        }
    },

    data: {},

    elems: {},

    sessions: {},

    templates: {
        itemFragment: util.createElement(
            '<div class="session_item"></div>'
        ),
        titleFragment: util.createElement(
            '<a class="title clickable"></a>'
        ),
    },

    init() {
        this.elems.rootNode = document.getElementById(
            'internal-selector-sessions'
        );
        this.sessions = new PagebaseGrouped();
        this.sessions.init(
            document,
            this.name,
            this.elems.rootNode,
            this.templateFunc.bind(this)
        );

        this.loadSessions();
    },

    /**
     * Called when the sort order has been changed.
     *
     * @param {any} newSort The new sort order.
     */
    sortChanged(newSort) {
        this.sessions.sortChanged(newSort, false);
    },

    //
    /**
     * Loads the available sessions from local and web storage
     */
    loadSessions() {
        this.sessions.clear();
        if (!this.enabled) {
            this.sessions.addAll({
                heading: 'sessions',
                data: [{
                    title: 'Show open tabs and sessions.'
                }],
            });
            return;
        }

        const that = this;
        if (ext.sessions.getDevices) {
            ext.sessions.getDevices(null, (devices) => {
                const deviceList = Array.isArray(devices) ? devices : [];
                for (const device of deviceList) {
                    let data = [];
                    const sessionList = Array.isArray(device.sessions) ? device.sessions : [];
                    for (const session of sessionList) {
                        if (session.tab) {
                            data = data.concat(session);
                        } else if (session.window) {
                            data = data.concat(session.window.tabs);
                        }
                    }
                    that.sessions.addAll({
                        heading: device.deviceName,
                        data,
                    });
                }
            });
        } else {
            ext.sessions.getRecentlyClosed(null, (sessions) => {
                let data = [];
                const sessionList = Array.isArray(sessions) ? sessions : [];
                for (const session of sessionList) {
                    if (session.tab) {
                        data = data.concat(session);
                    } else if (session.window) {
                        data = data.concat(session.window.tabs);
                    }
                }
                that.sessions.addAll({
                    heading: 'recently closed',
                    data,
                });
            });
        }
    },

    /**
     * Templates a provided tab into an HTML element.
     *
     * @param {any} tab The tab session that should be turned into an element.
     * @return {any} The HTML element.
     */
    templateFunc(tab) {
        const fragment = util.createElement('');

        const title = this.templates.titleFragment.cloneNode(true);
        title.firstElementChild.id = `session_${tab.index}`;
        title.firstElementChild.href = tab.url;
        title.firstElementChild.textContent = tab.title;
        fragment.appendChild(title);

        return fragment;
    },
};
