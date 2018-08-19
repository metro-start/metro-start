define(['../pagebase/pagebase_grouped', '../utils/storage', '../utils/util'],
    (Pagebase, storage, util) => {
        const apps = {
            name: 'apps',

            data: {},

            elems: {},

            templates: {
                titleFragment: util.createElement('<span class="title clickable"></span>'),
                homepageFragment: util.createElement('<span class="option options-color small-text clickable">homepage</span>'),
                removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
                disableFragment: util.createElement('<span class="option options-color small-text clickable">disable</span>'),
                enableFragment: util.createElement('<span class="option options-color small-text clickable">enable</span>'),
                optionsFragment: util.createElement('<span class="option options-color small-text clickable">options</span>'),
            },

            init: function(document) {
                this.elems.rootNode = document.getElementById('internal-selector-apps');

                this.apps = new Pagebase();
                this.apps.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
                this.loadApps();
            },

            /**
             * Called when the sort order has been changed.
             *
             * @param {any} newSort The new sort order.
             */
            sortChanged: function(newSort) {
                this.bookmarks.sortChanged(newSort, false);
            },

            loadApps: function() {
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
            },

            /**
             * Templates a provided app into an HTML element.
             *
             * @param {any} app The app that should be turned into an element.
             * @return {any} The HTML element.
             */
            templateFunc: function(app) {
                const fragment = util.createElement('');

                const title = this.templates.titleFragment.cloneNode(true);
                title.firstElementChild.textContent = app.name;
                title.firstElementChild.addEventListener('click', this.openAppLaunchUrl.bind(this, app));

                if (!app.enabled) {
                    util.addClass(title.firstElementChild, 'disabled');
                }

                fragment.appendChild(title);

                if (app.homepageUrl !== '') {
                    const homepage = this.templates.homepageFragment.cloneNode(true);
                    homepage.firstElementChild.addEventListener('click', this.openHomepageUrl.bind(this, app));
                    fragment.appendChild(homepage);
                }

                if (app.optionsUrl) {
                    const options = this.templates.optionsFragment.cloneNode(true);
                    options.firstElementChild.addEventListener('click', this.openOptionsUrl.bind(this, app));
                    fragment.appendChild(options);
                }

                if (app.type) {
                    let toggle = null;
                    if (app.enabled) {
                        toggle = this.templates.disableFragment.cloneNode(true);
                    } else {
                        toggle = this.templates.enableFragment.cloneNode(true);
                    }
                    toggle.firstElementChild.addEventListener('click', this.toggleEnabled.bind(this, app));
                    fragment.appendChild(toggle);
                }

                if (app.type) {
                    const remove = this.templates.removeFragment.cloneNode(true);
                    remove.firstElementChild.addEventListener('click', this.removeApp.bind(this, app));
                    fragment.appendChild(remove);
                }

                return fragment;
            },

            /**
             * Open an app's homepage.
             *
             * @param {any} app The app to open launch URl.
             */
            openAppLaunchUrl: function(app) {
                window.location.href = app.appLaunchUrl;
            },

            /**
             * Open an app's homepage.
             *
             * @param {any} app The app to open its homepage.
             */
            openHomepageUrl: function(app) {
                window.location.href = app.homepageUrl;
            },

            /**
             * Open an app's options page.
             *
             * @param {any} app The app to open its options.
             */
            openOptionsUrl: function(app) {
                window.location.href = app.optionsUrl;
            },

            /**
             * Enables/disables the selected app.
             *
             * @param {any} app The app to disable.
             */
            toggleEnabled: function(app) {
                const that = this;
                chrome.management.setEnabled(app.id, !app.enabled, () => {
                    that.loadApps();
                });
            },

            /**
             * Uninstall an app.
             *
             * @param {any} app The app to be uninstalled.
             */
            removeApp: function(app) {
                const that = this;

                chrome.management.uninstall(app.id, {
                    showConfirmDialog: true,
                }, () => {
                    that.loadApps();
                });
            },
        };

        return apps;
    });
