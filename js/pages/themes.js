define([ 'jquery', '../pagebase/pagebase_grouped', '../widgets/themes', '../utils/util', '../utils/storage', '../utils/defaults'],
function(jquery, pagebase_grouped, themesWidget, util, storage, defaults) {
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
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            shareFragment: util.createElement('<span class="options-color small-text clickable">share</span>'),
            authorFragment: util.createElement('<a class="options-color gallery-bio small-text"></a>')
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
            if (this.themes.sortChanged)
            {
                this.themes.sortChanged(newSort, false);
            }
        },

        // Loads the available themes from local and web storage
        loadThemes: function() {
            var that = this;

            that.themes.addAll({
              'heading': 'my themes',
              'themes': storage.get('localThemes', [defaults.defaultTheme])
            });

            // Load online themes.
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

                that.themes.addAll({
                  'heading': 'online themes',
                  'themes': data
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
            fragment.appendChild(title);

            var options = util.createElement('<span></span>');
            var author = this.templates.authorFragment.cloneNode(true);
            author.firstElementChild.textContent = theme.author;
            author.firstElementChild.href = theme.website;
            options.firstElementChild.appendChild(author);
            
            var share = this.templates.shareFragment.cloneNode(true);
            share.firstElementChild.addEventListener('click', this.shareTheme.bind(this, theme));
            options.firstElementChild.appendChild(share);

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeTheme.bind(this, theme));
            options.firstElementChild.appendChild(remove);

            fragment.appendChild(options);

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
