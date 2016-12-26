define(['../pagebase/pagebase','../utils/storage', '../utils/util', '../utils/defaults'], function(pagebase_simple, storage, util, defaults) {
    var apps = {
        name: 'apps',

        data: {},

        elems: {
            rootNode: document.getElementById('internal_selector_apps')
        },

        templates: {
            titleFragment: util.createElement('<a class="title"></a>'),
            uninstallFragment: util.createElement('<span class="option options-color small-text clickable">uninstall</span>'),
            optionsFragment: util.createElement('<a class="option options-color small-text">options</a>'),
        },

        // Initialize this module.
        init: function(document) {
            // this.sort = storage.get('sort', defaults.getDefaultSort()).apps;

            this.apps = new pagebase_simple();
            this.apps.init(document, this.name, this.elems.rootNode, this.nameFunc.bind(this), this.templateFunc.bind(this));
            this.loadApps();
        },

        // Loads the apps from Chrome app API.
        loadApps: function() {
            var that = this;
            chrome.management.getAll(function(res) {
                that.data = [{
                    name: 'Chrome Webstore',
                    appLaunchUrl: 'https://chrome.google.com/webstore'
                }];

                // Remove extensions and limit to installed apps.
                res = res.filter(function(item) { 
                    return item.isApp; 
                });

                // if (that.sort === 'sorted')
                // {
                //     res = res.sort(function(a, b) { 
                //         return a.name < b.name ? -1 : 1;
                //     });
                // }
                that.data = that.data.concat(res);
                that.apps.buildDom(that.data);
            });
        },

        // Sets the new number of pages for the block.
        // pageItemCount: The maximum number of pages able to be displayed.
        setPageItemCount: function(pageItemCount) {
            // if (this.apps) {
            //     this.apps.setPageItemCount(pageItemCount);
            // }
        },

        // Sets whether options are currently showing.
        // showOptions: true, if options are now showing; false otherwise.
        setShowOptions: function setShowOptions(showOptions) {
            this.apps.setShowOptions(showOptions);
        },

        // sortChanged: function(newSort) {
        //     this.sort = newSort;
        //     var sortOrder = storage.get('sort', defaults.getDefaultSort());
        //     sortOrder.apps = newSort;
        //     storage.save('sort', sortOrder);

        //     this.apps.sort = newSort;
        //     this.apps.sortChanged();
        //     this.loadApps();
        // },

        nameFunc: function(app) {
            return app.name;
        },

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

        uninstallApp: function(app) {
            var that = this;
            chrome.management.uninstall(app.id, { showConfirmDialog: true}, function() {
                that.loadApps();
            });
            
        }
    };

    return apps;
});
