define(['jquery', '../pagebase/pagebase_grouped', '../widgets/themes', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults'],
    (jquery, PagebaseGrouped, themesWidget, modal, util, storage, defaults) => {
        let themes = {
            name: 'themes',

            data: {},

            elems: {},

            themes: {},

            themesLocal: {},

            onlineThemes: {},

            themesWidget: themesWidget,

            templates: {
                itemFragment: util.createElement('<div class="theme_item"></div>'),
                titleFragment: util.createElement('<span class="panel-item theme-item clickable"></span>'),
                titleWrapFragment: util.createElement('<div class="panel-item-wrap"></div>'),
                removeFragment: util.createElement('<span class="option options-color small-text clickable">remove</span>'),
                shareFragment: util.createElement('<span class="option options-color small-text clickable">share</span>'),
                authorFragment: util.createElement('<a class="options-color gallery-bio small-text" title="author"></a>'),
                infoFragment: util.createElement('<span class="info"></span>'),
            },

            init: function() {
                this.elems.rootNode = document.getElementById('internal-selector-themes');
                this.themes = new PagebaseGrouped();
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
            sortChanged: function(newSort) {
                this.themes.sortChanged(newSort, false);
            },

            /**
             * Loads the available themes from local and web storage
             */
            loadThemes: function() {
                this.themes.clear();
                this.themes.addAll({
                    'heading': 'my themes',
                    'data': storage.get('themesLocal', []),
                });

                this.themes.addAll({
                    'heading': 'system themes',
                    'data': defaults.systemThemes,
                });

                // Load online themes.
                jquery.get(
                    `${defaults.defaultWebservice}/themes.json`,
                    (themes) => {
                        if (!themes || themes.length === 0) {
                            util.warn('No online themes available.');
                            return;
                        }

                        themes = JSON.parse(themes);
                        for (let theme of themes) {
                            theme.online = true;
                        }

                        this.onlineThemes = themes;
                        this.themes.addAll({
                                'heading': 'online themes',
                                'data': themes,
                            },
                            (error) => {
                                util.error('Could not load online themes', error);
                            });
                    });
            },


            /**
             * Templates a provided theme into an HTML element.
             *
             * @param {any} theme The theme that should be turned into an element.
             * @return {any} The HTML element.
             */
            templateFunc: function(theme) {
                let fragment = util.createElement('');

                let title = this.templates.titleFragment.cloneNode(true);
                title.firstElementChild.id = `theme_${theme.id}`;
                title.firstElementChild.textContent = theme.title;
                title.firstElementChild.addEventListener('click', this.applyTheme.bind(this, title.firstElementChild, theme));

                let titleWrap = this.templates.titleWrapFragment.cloneNode(true);
                titleWrap.firstElementChild.appendChild(title);

                if (this.themesWidget.data.title === theme.title) {
                    util.addClass(titleWrap.firstElementChild, 'active');
                }

                fragment.appendChild(titleWrap);

                let options = this.templates.infoFragment.cloneNode(true);
                let author = this.templates.authorFragment.cloneNode(true);
                author.firstElementChild.textContent = theme.author;
                options.firstElementChild.appendChild(author);

                if (!theme.online) {
                    let share = this.templates.shareFragment.cloneNode(true);
                    share.firstElementChild.addEventListener('click', this.shareTheme.bind(this, theme));
                    options.firstElementChild.appendChild(share);

                    let remove = this.templates.removeFragment.cloneNode(true);
                    remove.firstElementChild.addEventListener('click', this.removeTheme.bind(this, theme));
                    options.firstElementChild.appendChild(remove);
                }

                fragment.appendChild(options);

                return fragment;
            },

            applyTheme: function(themeNode, theme) {
                this.themesWidget.updateCurrentTheme('currentTheme', theme);

                let itemNode = themeNode.parentNode;
                let siblings = jquery(this.elems.rootNode).find('.panel-item-wrap');
                Array.prototype.slice.call(siblings).forEach((item) => {
                    util.removeClass(item, 'active');
                });
                util.addClass(itemNode, 'active');
            },

            shareTheme: function(theme) {
                let title = theme.title;
                let message;
                let okay;
                let cancel;
                let callback;

                if (this.onlineThemes.map((t) => t.title.toLowerCase()).includes(title.toLowerCase())) {
                    message = 'already exists in the theme gallery.';
                    cancel = `okay`;
                } else if (defaults.systemThemes.map((t) => t.title.toLowerCase()).includes(title.toLowerCase())) {
                    message = 'already exists as a system theme.';
                    cancel = `okay`;
                } else {
                    message = 'will be shared to the theme gallery.';
                    okay = 'okay';
                    cancel = 'cancel';
                    callback = (result) => {
                        if (result) {
                            this.themesWidget.shareTheme(theme);
                            this.loadThemes();
                        }
                    };
                }

                modal.createModal('shareThemeAlert', `${title} ${message}`, callback, okay, cancel);
            },

            removeTheme: function(theme) {
                modal.createModal('removeThemeAlert', `${theme.title} will be removed.`,
                    (result) => {
                        if (result) {
                            this.themesWidget.removeTheme(theme);
                            this.loadThemes();
                        }
                    },
                    'okay',
                    'cancel');
            },

            themeAdded: function() {
                this.loadThemes();
            },

            themeRemoved: function() {
                this.loadThemes();
            },
        };

        return themes;
    });
