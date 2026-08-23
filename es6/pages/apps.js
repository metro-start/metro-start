import Pagebase from '../pagebase/pagebase_grouped';
import util from '../utils/util';
import ext from '../utils/extension';
export default {
    name: 'apps',
    enabled: false,
    supported: Boolean(ext.management.getAll),
    
    setPermissionVisibility(visible, cb) {
        const that = this;
        if (visible) {
            ext.permissions.request({
                permissions: ['management']
            },
            (granted) => {
                that.enabled = granted;
                if (cb) {
                    cb(granted);
                }
                that.loadApps();
            }
            );
        } else {
            ext.permissions.remove({
                permissions: ['management']
            },
            (granted) => {
                that.enabled = !granted;
                if (cb) {
                    cb(granted);
                }
                that.loadApps();
            }
            );
        }
    },

    data: {},

    elems: {},

    templates: {
        titleFragment: util.createElement(
            '<span class="title clickable"></span>'
        ),
        homepageFragment: util.createElement(
            '<span class="option options-color small-text clickable">homepage</span>'
        ),
        removeFragment: util.createElement(
            '<span class="option options-color small-text clickable">remove</span>'
        ),
        disableFragment: util.createElement(
            '<span class="option options-color small-text clickable">disable</span>'
        ),
        enableFragment: util.createElement(
            '<span class="option options-color small-text clickable">enable</span>'
        ),
        optionsFragment: util.createElement(
            '<span class="option options-color small-text clickable">options</span>'
        ),
    },

    init(document) {
        this.elems.rootNode = document.getElementById(
            'internal-selector-apps'
        );

        this.apps = new Pagebase();
        this.apps.init(
            document,
            this.name,
            this.elems.rootNode,
            this.templateFunc.bind(this)
        );

        this.loadApps();
    },

    /**
     * Called when the sort order has been changed.
     *
     * @param {any} newSort The new sort order.
     */
    sortChanged(newSort) {
        this.apps.sortChanged(newSort, false);
    },

    loadApps() {
        this.apps.clear();
        if (!this.enabled) {
            this.apps.addAll({
                heading: 'apps',
                data: [{
                    name: 'Manage installed apps.',
                    enabled: true,
                }, ],
            });
            return;
        }

        const that = this;
        ext.management.getAll((res) => {
            const items = Array.isArray(res) ? res : [];
            that.apps.clear();
            that.apps.addAll({
                heading: 'apps',
                data: [{
                    name: 'Chrome Webstore',
                    appLaunchUrl: 'https://chrome.google.com/webstore',
                    enabled: true,
                }, ].concat(
                    items.filter((item) => {
                        return (
                            item.type !== 'extension' &&
                            item.type !== 'theme'
                        );
                    })
                ),
            });
            that.apps.addAll({
                heading: 'extensions',
                data: items.filter((item) => {
                    return item.type === 'extension';
                }),
            });
            that.apps.addAll({
                heading: 'themes',
                data: items.filter((item) => {
                    return item.type === 'theme';
                }),
            });
        });
    },

    /**
     * Templates a provided app into an HTML element.
     *
     * @param {any} app The app that should be turned into an element.
     * @return {any} The HTML element.
     */
    templateFunc(app) {
        const fragment = util.createElement('');

        const title = this.templates.titleFragment.cloneNode(true);
        title.firstElementChild.textContent = app.name;
        if (app.appLaunchUrl) {
            title.firstElementChild.addEventListener(
                'click',
                this.openAppLaunchUrl.bind(this, app)
            );
        } else {
            util.removeClass(title.firstElementChild, 'clickable');
        }

        if (!app.enabled) {
            util.addClass(title.firstElementChild, 'disabled');
        }

        fragment.appendChild(title);

        if (app.homepageUrl) {
            const homepage = this.templates.homepageFragment.cloneNode(
                true
            );
            homepage.firstElementChild.addEventListener(
                'click',
                this.openHomepageUrl.bind(this, app)
            );
            fragment.appendChild(homepage);
        }

        if (app.optionsUrl) {
            const options = this.templates.optionsFragment.cloneNode(true);
            options.firstElementChild.addEventListener(
                'click',
                this.openOptionsUrl.bind(this, app)
            );
            fragment.appendChild(options);
        }

        if (app.type) {
            const toggle = (app.enabled
                ? this.templates.disableFragment
                : this.templates.enableFragment
            ).cloneNode(true);
            toggle.firstElementChild.addEventListener(
                'click',
                this.toggleEnabled.bind(this, app)
            );
            fragment.appendChild(toggle);
        }

        if (app.type) {
            const remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener(
                'click',
                this.removeApp.bind(this, app)
            );
            fragment.appendChild(remove);
        }

        return fragment;
    },

    /**
     * Open an app's homepage.
     *
     * @param {any} app The app to open launch URl.
     */
    openAppLaunchUrl(app) {
        window.location.href = app.appLaunchUrl;
    },

    /**
     * Open an app's homepage.
     *
     * @param {any} app The app to open its homepage.
     */
    openHomepageUrl(app) {
        window.location.href = app.homepageUrl;
    },

    /**
     * Open an app's options page.
     *
     * @param {any} app The app to open its options.
     */
    openOptionsUrl(app) {
        window.location.href = app.optionsUrl;
    },

    /**
     * Enables/disables the selected app.
     *
     * @param {any} app The app to disable.
     */
    toggleEnabled(app) {
        const that = this;
        ext.management.setEnabled(app.id, !app.enabled, () => {
            that.loadApps();
        });
    },

    /**
     * Uninstall an app.
     *
     * @param {any} app The app to be uninstalled.
     */
    removeApp(app) {
        const that = this;

        ext.management.uninstall(
            app.id, {
                showConfirmDialog: true,
            }, () => {
                that.loadApps();
            }
        );
    },
};
