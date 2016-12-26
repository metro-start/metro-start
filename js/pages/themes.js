define([ 'jquery', '../pagebase/pagebase', '../utils/util', '../utils/script', '../utils/storage', '../utils/defaults', '../widgets/themes'],
function(jquery, pagebase_grouped, util, script, storage, defaults, themesWidget) {
    var themes = {
        name: 'themes',

        data: {},

        elems: {
            rootNode: document.getElementById('internal_selector_themes'),
            localRootNode: document.getElementById('internal_selector_themes_local'),
            onlineRootNode: document.getElementById('internal_selector_themes_online')
        },

        themes: {},

        localThemes: {},

        onlineThemes: {},

        themesWidget: themesWidget,

        templates: {
            headingFragment: util.createElement('<div class="options-color"></div>'),
            containerFragment: util.createElement('<div class="internal_container"></div>'),
            internalFragment: util.createElement('<div class="internal_internal"></div>'),

            itemFragment: util.createElement('<div class="theme_item"></div>'),
            titleFragment: util.createElement('<span class="title"></span>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            shareFragment: util.createElement('<span class="options-color small-text clickable">share</span>'),
            updateFragment: util.createElement('<span class="options-color small-text clickable">update</span>'),
            authorFragment: util.createElement('<a class="options-color gallery-bio small-text"></a>')
        },

        init: function() {
            this.localThemes = new pagebase_grouped();
            // this.localThemes.init(document, this.name + '_local', this.elems.localRootNode, this.templateFunc.bind(this));
            
            this.onlineThemes = new pagebase_grouped();
            // this.onlineThemes.init(document, this.name + '_online', this.elems.onlineRootNode, this.templateFunc.bind(this));
           
            this.loadThemes();

            this.themesWidget.themeAdded = this.themeAdded.bind(this);
            this.themesWidget.themeRemoved = this.themeRemoved.bind(this);
        },

        addGroup: function(group, groupName, data) {
            var heading = this.templates.headingFragment.cloneNode(true);
            heading.firstElementChild.textContent = groupName;

            var internal = this.templates.internalFragment.cloneNode(true);
            group.init(document, this.name + '_' + groupName.replace(' ', '_'), internal.firstElementChild, this.templateFunc.bind(this));
            group.buildDom(data);
            
            var container = this.templates.containerFragment.cloneNode(true);
            container.firstElementChild.appendChild(heading);
            container.firstElementChild.appendChild(internal);
            this.elems.rootNode.appendChild(container);
        },

        // loadOnlineThemes: function() {
        //     var that = this;
        //     jquery.get('http://metro-start.appspot.com/themes.json', function(data) {
        //         data = JSON.parse(data);
        //         for (var i in data) {
        //             data[i].colors = {
        //                 'options-color': data[i].options_color,
        //                 'main-color': data[i].main_color,
        //                 'title-color': data[i].title_color,
        //                 'background-color': data[i].background_color,
        //             };
        //         }

        //         // that.themes.addAll({
        //         //   local: false,
        //         //   heading: 'online themes',
        //         //   themes: data
        //         // });
        //     });
        // },

        loadThemes: function() {
            var localData = storage.get('localThemes', defaults.getDefaultTheme(0));
            this.addGroup(this.localThemes, 'my themes', localData);

            var that = this;
            jquery.get('http://metro-start.appspot.com/themes.json', function(data) {
                data = JSON.parse(data);
                for (var i in data) {
                    data[i].colors = {
                        'options-color': data[i].options_color,
                        'main-color': data[i].main_color,
                        'title-color': data[i].title_color,
                        'background-color': data[i].background_color,
                    };
                }

                that.addGroup(that.onlineThemes, 'online themes', data);
            });

            // var that = this;
            // jquery.get('http://metro-start.appspot.com/themes.json', function(data) {
            //     data = JSON.parse(data);
            //     for (var i in data) {
            //         data[i].colors = {
            //             'options-color': data[i].options_color,
            //             'main-color': data[i].main_color,
            //             'title-color': data[i].title_color,
            //             'background-color': data[i].background_color,
            //         };
            //     }

            //     // if (that.sort === "sorted") {
            //     //     // data.sort(function(obj1, obj2) {
            //     //     //     return obj1.title.toLowerCase() > obj2.title.toLowerCase() ? 1 : -1;
            //     //     // });
            //     //     data.sort(function(a, b) {
            //     //         var nameA = a.title.toUpperCase(); // ignore upper and lowercase
            //     //         var nameB = b.title.toUpperCase(); // ignore upper and lowercase
            //     //         if (nameA < nameB) {
            //     //             return -1;
            //     //         } else if (nameA > nameB) {
            //     //             return 1;
            //     //         }
            //     //         return 0;
            //     //     });
            //     // }

            //     that.themes.addAll({
            //       local: false,
            //       heading: 'online themes',
            //       themes: data
            //     });
            // });
        },

        // Sets the new number of pages for the block.
        // pageItemCount: The maximum number of pages able to be displayed.
        setPageItemCount: function(pageItemCount) {
        //   this.themes.setPageItemCount(pageItemCount, this.data); //-1 to account for addLink
        },

        // Sets the new number of pages for the block.
        // pageItemCount: The maximum number of pages able to be displayed.
        setShowOptions: function setShowOptions(showOptions) {
            this.themes.setShowOptions(showOptions);
        },

        sortChanged: function(newSort) {
            // this.sort = newSort;
            // var sortOrder = storage.get('sort', defaults.getDefaultSort());
            // sortOrder.themes = newSort;
            // storage.save('sort', sortOrder);

            // this.themes.sort = newSort;
            // this.themes.sortChanged();
            // this.loadThemes();
        },

        // Returns an HTML link node item.
        // item: The link item to be converted into a node.
        // local: Local theme, or online?
        templateFunc: function(theme, page, local) {
            var fragment = util.createElement('');

            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.id = 'theme_' + theme.id;
            title.firstElementChild.textContent = theme.title;
            title.firstElementChild.addEventListener('click', this.applyTheme.bind(this, theme));
            fragment.appendChild(title);

            if (local) {
                var share = this.templates.shareFragment.cloneNode(true);
                share.firstElementChild.addEventListener('click', this.shareTheme.bind(this, theme));
                fragment.appendChild(share);

                var update = this.templates.updateFragment.cloneNode(true);
                update.firstElementChild.addEventListener('click', this.updateTheme.bind(this, theme));
                fragment.appendChild(update);

                var remove = this.templates.removeFragment.cloneNode(true);
                remove.firstElementChild.addEventListener('click', this.removeTheme.bind(this, theme));
                fragment.appendChild(remove);
            } else {
                var author = this.templates.authorFragment.cloneNode(true);
                author.firstElementChild.textContent = theme.author.name;
                author.firstElementChild.href = theme.author.link;
                fragment.appendChild(author);
            }

            return fragment;
        },

        applyTheme: function(theme) {
            this.themesWidget.applyTheme(theme);
        },

        shareTheme: function(theme) {
            this.themesWidget.shareTheme(theme);
        },

        removeTheme: function(theme) {
            this.themesWidget.removeTheme(theme);
        },

        updateTheme: function(theme) {
            this.themesWidget.updateTheme(theme);
        },

        themeAdded: function() {
            this.loadThemes();
        },

        themeRemoved: function() {
            this.loadThemes();
        }
    };

    return themes;
});
