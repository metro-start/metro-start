define([ 'jquery', '../pagebase/pagebase_grouped', '../widgets/themes', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults'],
function(jquery, pagebase_grouped, themesWidget, modal, util, storage, defaults) {
    var themes = {
        name: 'themes',

        data: {},

        elems: {},

        themes: {},

        themesLocal: {},

        onlineThemes: {},

        themesWidget: themesWidget,

        templates: {
            itemFragment: util.createElement('<div class="theme_item"></div>'),
            titleFragment: util.createElement('<span class="title clickable"></span>'),
            removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
            shareFragment: util.createElement('<span class="option options-color small-text clickable">share</span>'),
            authorFragment: util.createElement('<a class="options-color gallery-bio small-text"></a>'),
            infoFragment: util.createElement('<span class="info"></span>')
        },

        init: function() {
            this.elems.rootNode = document.getElementById('internal_selector_themes');
            this.themes = new pagebase_grouped();
            this.themes.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.loadThemes();

            this.themesWidget.themeAdded = this.themeAdded.bind(this);
            this.themesWidget.themeRemoved = this.themeRemoved.bind(this);
        },
        
        /**
         * Called when the sort order has been changed.
         * 
         * @param {any} newSort The new sort order.
         */
        sortChanged: function (newSort) {
            this.themes.sortChanged(newSort, false);
        },

        /**
         * Loads the available themes from local and web storage
         */
        loadThemes: function() {
            var that = this;

            that.themes.clear();
            that.themes.addAll({
              'heading': 'my themes',
              'data': storage.get('themesLocal', [])
            });

            that.themes.addAll({
                'heading': 'system themes',
                'data': defaults.systemThemes
            });

            // Load online themes.
            jquery.get(defaults.defaultWebservice + '/themes.json', function(data) {
                data = JSON.parse(data);
                for (var i in data) {
                    data[i] = util.upgradeTheme(data[i], defaults.defaultTheme);
                    data[i].online = true;
                }

                that.themes.addAll({
                  'heading': 'online themes',
                  'data': data
                },
                function(error)
                {
                    console.log(error);
                });
            });
        },


        /**
         * Templates a provided theme into an HTML element.
         * 
         * @param {any} theme The theme that should be turned into an element.
         * @returns The HTML element.
         */
        templateFunc: function(theme) {
            var fragment = util.createElement('');

            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.id = 'theme_' + theme.id;
            title.firstElementChild.textContent = theme.title;
            title.firstElementChild.addEventListener('click', this.applyTheme.bind(this, title.firstElementChild, theme));

            if (this.themesWidget.data.title === theme.title) {
                util.addClass(title.firstElementChild, 'theme-active');
            }

            fragment.appendChild(title);

            var options = this.templates.infoFragment.cloneNode(true);
            var author = this.templates.authorFragment.cloneNode(true);
            author.firstElementChild.textContent = theme.author;
            options.firstElementChild.appendChild(author);
            
            if (!theme.online) {
                var share = this.templates.shareFragment.cloneNode(true);
                share.firstElementChild.addEventListener('click', this.shareTheme.bind(this, theme));
                options.firstElementChild.appendChild(share);

                var remove = this.templates.removeFragment.cloneNode(true);
                remove.firstElementChild.addEventListener('click', this.removeTheme.bind(this, theme));
                options.firstElementChild.appendChild(remove);
            }

            fragment.appendChild(options);

            return fragment;
        },

        applyTheme: function(themeNode, theme) {
            if (theme.title === 'random theme') {
                this.themesWidget.randomTheme();
            } else {
                theme.title = '';
                theme.author = '';
                this.themesWidget.updateCurrentTheme('currentTheme', theme);
            }

            var itemNode = themeNode.parentNode;
            var siblings = themeNode.parentNode.parentNode.children;
            Array.prototype.slice.call(siblings).forEach(function(item) {
                util.removeClass(item.firstElementChild, 'theme-active');
            });
            util.addClass(itemNode.firstElementChild, 'theme-active');
        },

        shareTheme: function(theme) {
            var that = this;
            modal.createModal('shareThemeAlert', `${theme.title} will be shared to the theme gallery.`, 
                function(result) {
                    if (result) {
                        that.themesWidget.shareTheme(theme);
                        that.loadThemes();
                    }
                },
                'okay',
                'cancel');
        },

        removeTheme: function(theme) {
            var that = this;
            modal.createModal('shareThemeAlert', `${theme.title} will be removed.`, 
                function(result) {
                    if (result) {
                        that.themesWidget.removeTheme(theme);
                        that.loadThemes();
                    }
                },
                'okay',
                'cancel');
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
