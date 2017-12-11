define(['../pagebase/pagebase_grouped','../utils/storage', '../utils/util'], function(pagebase, storage, util) {
    var apps = {
        name: 'apps',

        data: {},

        elems: {},

        templates: {
            titleFragment: util.createElement('<span class="title clickable"></span>'),
            homepageFragment: util.createElement('<span class="option options-color small-text clickable">homepage</span>'),
            removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
            disableFragment: util.createElement('<span class="option options-color small-text clickable">disable</span>'),
            enableFragment: util.createElement('<span class="option options-color small-text clickable">enable</span>'),
            optionsFragment: util.createElement('<span class="option options-color small-text clickable">options</span>')
        },

        init: function(document) {
            this.elems.rootNode = document.getElementById('internal_selector_apps');

            this.apps = new pagebase();
            this.apps.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.loadApps();
        },

        /**
         * Called when the sort order has been changed.
         * 
         * @param {any} newSort The new sort order.
         */
        sortChanged: function (newSort) {
            this.bookmarks.sortChanged(newSort, false);
        },

        loadApps: function() {
            var that = this;
            chrome.management.getAll(function(res) {
                that.apps.clear();
                that.apps.addAll({
                    'heading': 'apps',
                    'data': [{
                        'name': 'Chrome Webstore',
                        'appLaunchUrl': 'https://chrome.google.com/webstore',
                        'enabled': true
                    }].concat(res.filter(function(item) { return item.type !== 'extension' && item.type !== 'theme'; }))
                });
                that.apps.addAll({
                    'heading': 'extensions',
                    'data': res.filter(function(item) { return item.type === 'extension'; })
                });
                that.apps.addAll({
                    'heading': 'themes',
                    'data': res.filter(function(item) { return item.type === 'theme'; })
                });
            });
        },

        /**
         * Templates a provided app into an HTML element.
         * 
         * @param {any} app The app that should be turned into an element.
         * @returns The HTML element.
         */
        templateFunc: function(app) {
            var fragment = util.createElement('');
            
            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.href = app.launchUrl;
            title.firstElementChild.textContent = app.name;

            if (!app.enabled) {
                util.addClass(title.firstElementChild, 'disabled');
            } 

            fragment.appendChild(title);

            if (app.homepageUrl !== '') {
                var homepage = this.templates.homepageFragment.cloneNode(true);
                homepage.firstElementChild.addEventListener('click', this.openHomepageUrl.bind(this, app));
                fragment.appendChild(homepage);
            }
            
            if (!!app.optionsUrl) {
                var options = this.templates.optionsFragment.cloneNode(true);
                options.firstElementChild.addEventListener('click', this.openOptionsUrl.bind(this, app));
                fragment.appendChild(options);
            }
            
            if (!!app.type) {
                var toggle = null;
                if (!!app.enabled) {
                    toggle = this.templates.disableFragment.cloneNode(true);
                } else {
                    toggle = this.templates.enableFragment.cloneNode(true);
                }
                toggle.firstElementChild.addEventListener('click', this.toggleEnabled.bind(this, app));
                fragment.appendChild(toggle);
            }

            if (!!app.type) {
                var remove = this.templates.removeFragment.cloneNode(true);
                remove.firstElementChild.addEventListener('click', this.removeApp.bind(this, app));
                fragment.appendChild(remove);
            }

            return fragment;
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
            var that = this;
            chrome.management.setEnabled(app.id, !app.enabled, function() {
                that.loadApps();
            });
        },

        /**
         * Uninstall an app.
         * 
         * @param {any} app The app to be uninstalled.
         */
        removeApp: function(app) {
            var that = this;

            chrome.management.uninstall(app.id, { showConfirmDialog: true }, function() {
                that.loadApps();
            });
        }
    };

    return apps;
});
