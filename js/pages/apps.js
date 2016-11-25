define(['../pagebase/pagebase_simple','../utils/storage', '../utils/util'], function(pagebase_simple, storage, util) {
    var apps = {
        name: 'apps',

        data: {},

        elems: {},

        templates: {
            titleFragment: util.createElement('<a class="title"></a>'),
            uninstallFragment: util.createElement('<span class="option options-color small-text clickable">uninstall</span>'),
            optionsFragment: util.createElement('<a class="option options-color small-text">options</a>'),
        },

        // Initialize this module.
        init: function(document) {
            this.elems.rootNode = document.getElementById('internal_selector_apps');
            this.apps = new pagebase_simple();
            this.apps.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.loadApps();
        },

        // Loads the apps from Chrome app API.
        loadApps: function() {
            var that = this;
            chrome.management.getAll(function(res) {
                that.data = [{
                    'name': 'Chrome Webstore',
                    'appLaunchUrl': 'https://chrome.google.com/webstore'
                }];

                // Remove extensions and limit to installed apps.
                that.data = that.data.concat(res.filter(function(item) { return item.isApp; }));
                that.apps.buildDom(that.data);
            });
        },

        // Sets the new number of pages for the block.
        // pageItemCount: The maximum number of pages able to be displayed.
        setPageItemCount: function(pageItemCount) {
            if (this.apps) {
                this.apps.setPageItemCount(pageItemCount);
            }
        },

        // Sets whether options are currently showing.
        // showOptions: true, if options are now showing; false otherwise.
        setShowOptions: function setShowOptions(showOptions) {
            this.apps.setShowOptions(showOptions);
        },

        // Returns an HTML link node item.
        // item: The link item to be converted into a node.
        templateFunc: function(app) {
            var fragment = util.createElement('');
            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.href = app.launchUrl;
            title.firstElementChild.textContent = app.name;
            fragment.appendChild(title);

            var uninstall = this.templates.uninstallFragment.cloneNode(true);
            uninstall.firstElementChild.addEventListener('click', this.uninstallApp.bind(this, app));
            fragment.appendChild(uninstall);

            var options = this.templates.optionsFragment.cloneNode(true);
            options.firstElementChild.href = app.optionsUrl;
            fragment.appendChild(options);

            return fragment;
        },

        // Uninistall an app from Chrome.
        // app: THe app to be uninstalled.
        uninstallApp: function(app) {
            var that = this;
            chrome.management.uninstall(app.id, { showConfirmDialog: true}, function() {
                that.loadApps();
            });
            
        }
    };

    return apps;
});
