define([ 'jquery', '../pagebase/pagebase_grouped', '../utils/util', '../utils/script', '../utils/storage', '../utils/defaults', '../widgets/themes'],
function(jquery, pagebase_grouped, util, script, storage, defaults, themesWidget) {
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
            titleFragment: util.createElement('<span class="title"></span>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            shareFragment: util.createElement('<span class="options-color small-text clickable">share</span>'),
            updateFragment: util.createElement('<span class="options-color small-text clickable">update</span>'),
            authorFragment: util.createElement('<a class="options-color gallery-bio small-text"></a>')
        },

        init: function() {
            this.elems.rootNode = document.getElementById('internal_selector_themes');
            this.themes = new pagebase_grouped();
            this.themes.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.loadThemes();

            this.themesWidget.themeAdded = this.themeAdded.bind(this);
            this.themesWidget.themeRemoved = this.themeRemoved.bind(this);
        },

        loadThemes: function() {
            this.themes.clear();
            var localThemes = storage.get('localThemes', [defaults.getDefaultTheme()]);
            if (this.sort === "sorted") {
                localThemes.sort(function(a, b) {
                    return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                });
            }
            this.themes.addAll({
              local: true,
              heading: 'my themes',
              themes: localThemes
            });

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

                if (that.sort === "sorted") {
                    data.sort(function(obj1, obj2) {
                        return obj1.title.toLowerCase() > obj2.title.toLowerCase() ? 1 : -1;
                    });
                }

                that.themes.addAll({
                  local: false,
                  heading: 'online themes',
                  themes: data
                });
            });
        },

        // Sets the new number of pages for the block.
        // pageItemCount: The maximum number of pages able to be displayed.
        setPageItemCount: function(pageItemCount) {
          this.themes.setPageItemCount(pageItemCount, this.data); //-1 to account for addLink
        },

        // Sets the new number of pages for the block.
        // pageItemCount: The maximum number of pages able to be displayed.
        setShowOptions: function setShowOptions(showOptions) {
            this.themes.setShowOptions(showOptions);
        },

        sortChanged: function(newSort) {
            this.sort = newSort;
            var sortOrder = storage.get('sort', defaults.getDefaultSort());
            sortOrder.themes = newSort;
            storage.save('sort', sortOrder);

            this.loadThemes();
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
