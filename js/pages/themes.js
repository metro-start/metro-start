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
            this.onlineThemes = new pagebase_grouped();
           
            this.loadThemes();

            this.themesWidget.themeAdded = this.themeAdded.bind(this);
            this.themesWidget.themeRemoved = this.themeRemoved.bind(this);

            jquery('#' + this.name + '-sort-chooser').metroSelect({
                initial: this.getSort(),
                onchange: this.sortChanged.bind(this)
            });
        },

        getSort: function() {
            var sort = storage.get('sort', defaults.getDefaultSort());
            return sort[this.name];
        },

        updateSort: function (newSort) {
            var sort = storage.get('sort', defaults.getDefaultSort());
            sort[this.name] = newSort;
            storage.save('sort', sort);
        },

        addGroup: function(group, groupName, data) {
            var heading = this.templates.headingFragment.cloneNode(true);
            heading.firstElementChild.textContent = groupName;

            var internal = this.templates.internalFragment.cloneNode(true);
            group.init(document, this.name + '_' + groupName.replace(' ', '_'), internal.firstElementChild, this.templateFunc.bind(this, groupName === 'my themes'));
            group.buildDom(data);
            
            var container = this.templates.containerFragment.cloneNode(true);
            container.firstElementChild.appendChild(heading);
            container.firstElementChild.appendChild(internal);
            this.elems.rootNode.appendChild(container);
        },

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
        },

        templateFunc: function(local, theme) {
            var fragment = util.createElement('');

            var title = this.templates.titleFragment.cloneNode(true);
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
                author.firstElementChild.textContent = theme.author;
                author.firstElementChild.href = theme.website;
                fragment.appendChild(author);
            }

            return fragment;
        },

        sortChanged: function (newSort) {
            this.updateSort(newSort);

            if (this.localThemes.sortChanged)
            {
                this.localThemes.sortChanged(newSort, false);
            }
            if (this.onlineThemes.sortChanged)
            {
                this.onlineThemes.sortChanged(newSort, false);
            }
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
