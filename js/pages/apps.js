import {Util} from '../utils/utils';
import Pagebase from '../pagebase/pagebase_grouped';

let Templates = {
    titleFragment: Util.createElement('<span class="title clickable"></span>'),
    homepageFragment: Util.createElement('<span class="option options-color small-text clickable">homepage</span>'),
    removeFragment: Util.createElement('<span class="option options-color small-text clickable">remove</span>'),
    disableFragment: Util.createElement('<span class="option options-color small-text clickable">disable</span>'),
    enableFragment: Util.createElement('<span class="option options-color small-text clickable">enable</span>'),
    optionsFragment: Util.createElement('<span class="option options-color small-text clickable">options</span>'),
};

/**
 * Installed chrome apps.
 *
 * @export
 * @class Apps
 */
export default class Apps {
    /**
     *Creates an instance of Apps.
     * @param {*} document
     * @memberof Apps
     */
    constructor() {
        this.name = 'apps';
        this.data = {};

        this.elems = {};
        this.elems.rootNode = document.getElementById('internal-selector-apps');

        this.apps = new Pagebase(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
        this.loadApps();
    }

    /**
     * Called when the sort order has been changed.
     *
     * @param {any} newSort The new sort order.
     */
    sortChanged(newSort) {
        this.bookmarks.sortChanged(newSort, false);
    }

    /**
     * Loads installed apps, extensions and theems from chrome.
     *
     * @memberof Apps
     */
    loadApps() {
        const that = this;
        chrome.management.getAll((res) => {
            that.apps.clear();
            that.apps.addAll({
                'heading': 'apps',
                'data': [{
                    'name': 'Chrome Webstore',
                    'appLaunchUrl': 'https://chrome.google.com/webstore',
                    'enabled': true,
                }].concat(res.filter((item) => {
                    return item.type !== 'extension' && item.type !== 'theme';
                })),
            });
            that.apps.addAll({
                'heading': 'extensions',
                'data': res.filter((item) => {
                    return item.type === 'extension';
                }),
            });
            that.apps.addAll({
                'heading': 'themes',
                'data': res.filter((item) => {
                    return item.type === 'theme';
                }),
            });
        });
    }

    /**
     * Templates a provided app into an HTML element.
     *
     * @param {any} app The app that should be turned into an element.
     * @return {any} The HTML element.
     */
    templateFunc(app) {
        const fragment = Util.createElement('');

        const title = Templates.titleFragment.cloneNode(true);
        title.firstElementChild.textContent = app.name;
        title.firstElementChild.addEventListener('click', this.openAppLaunchUrl.bind(this, app));

        if (!app.enabled) {
            Util.addClass(title.firstElementChild, 'disabled');
        }

        fragment.appendChild(title);

        if (app.homepageUrl !== '') {
            const homepage = Templates.homepageFragment.cloneNode(true);
            homepage.firstElementChild.addEventListener('click', this.openHomepageUrl.bind(this, app));
            fragment.appendChild(homepage);
        }

        if (app.optionsUrl) {
            const options = Templates.optionsFragment.cloneNode(true);
            options.firstElementChild.addEventListener('click', this.openOptionsUrl.bind(this, app));
            fragment.appendChild(options);
        }

        if (app.type) {
            let toggle = null;
            if (app.enabled) {
                toggle = Templates.disableFragment.cloneNode(true);
            } else {
                toggle = Templates.enableFragment.cloneNode(true);
            }
            toggle.firstElementChild.addEventListener('click', this.toggleEnabled.bind(this, app));
            fragment.appendChild(toggle);
        }

        if (app.type) {
            const remove = Templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeApp.bind(this, app));
            fragment.appendChild(remove);
        }

        return fragment;
    }

    /**
     * Open an app's homepage.
     *
     * @param {any} app The app to open launch URl.
     */
    openAppLaunchUrl(app) {
        window.location.href = app.appLaunchUrl;
    }

    /**
     * Open an app's homepage.
     *
     * @param {any} app The app to open its homepage.
     */
    openHomepageUrl(app) {
        window.location.href = app.homepageUrl;
    }

    /**
     * Open an app's options page.
     *
     * @param {any} app The app to open its options.
     */
    openOptionsUrl(app) {
        window.location.href = app.optionsUrl;
    }

    /**
     * Enables/disables the selected app.
     *
     * @param {any} app The app to disable.
     */
    toggleEnabled(app) {
        const that = this;
        chrome.management.setEnabled(app.id, !app.enabled, () => {
            that.loadApps();
        });
    }

    /**
     * Uninstall an app.
     *
     * @param {any} app The app to be uninstalled.
     */
    removeApp(app) {
        const that = this;

        chrome.management.uninstall(app.id, {
            showConfirmDialog: true,
        }, () => {
            that.loadApps();
        });
    }
}
