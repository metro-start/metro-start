define([ 'jquery', '../pagebase/pagebase_grouped', '../widgets/themes', '../widgets/confirm', '../utils/util', '../utils/storage', '../utils/defaults'],
function(jquery, pagebase_grouped, themesWidget, confirmWidget, util, storage, defaults) {
    var themes = {
        name: 'themes',

        data: {},

        elems: {},

        themes: {},

        localThemes: {},

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

        // Initialize this module.
        init: function() {
            this.elems.rootNode = document.getElementById('internal_selector_themes');
            this.themes = new pagebase_grouped();
            this.themes.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.loadThemes();

            this.themesWidget.themeAdded = this.themeAdded.bind(this);
            this.themesWidget.themeRemoved = this.themeRemoved.bind(this);
        },
        
        sortChanged: function (newSort) {
            this.themes.sortChanged(newSort, false);
        },

        // Loads the available themes from local and web storage
        loadThemes: function() {
            var that = this;

            that.themes.clear();
            that.themes.addAll({
              'heading': 'my themes',
              'data': storage.get('localThemes', [])
            });

            console.log(this.themesWidget.currentTheme);
            that.themes.addAll({
                'heading': 'system themes',
                'data': defaults.systemThemes
            });

            // Load online themes.
            jquery.get(defaults.defaultWebservice + '/themes.json', function(data) {
                data = JSON.parse(data);
                for (var i in data) {
                    data[i].online = true;
                    data[i].colors = {
                        'options-color': data[i].options_color,
                        'main-color': data[i].main_color,
                        'title-color': data[i].title_color,
                        'background-color': data[i].background_color,
                    };
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

        // Returns an HTML link node item.
        // item: The link item to be converted into a node.
        templateFunc: function(theme) {
            var fragment = util.createElement('');

            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.id = 'theme_' + theme.id;
            title.firstElementChild.textContent = theme.title;
            title.firstElementChild.addEventListener('click', this.applyTheme.bind(this, theme));

            if (this.themesWidget.currentTheme.title === theme.title) {
                util.addClass(title.firstElementChild, 'bookmark-active');
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

        applyTheme: function(theme) {
            if (theme.title === 'random theme') {
                theme = jquery.extend({}, theme);
            }
            this.themesWidget.applyTheme(theme);
            console.log(theme);
        },

        shareTheme: function(theme) {
            var that = this;
            confirmWidget.alert(theme.title + ' will be shared to the theme gallery.', function() {
                that.themesWidget.shareTheme(theme);
                that.loadThemes();
            });
        },

        removeTheme: function(theme) {
            var that = this;
            confirmWidget.alert(theme.title + ' will be removed.', function() {
                that.themesWidget.removeTheme(theme);
            });
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
