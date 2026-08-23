import PagebaseGrouped from '../pagebase/pagebase_grouped';
import themesWidget from '../widgets/themes';
import modal from '../utils/modal';
import util from '../utils/util';
import storage from '../utils/storage';
import defaults from '../utils/defaults';
import {getThemes} from '../utils/api';
export default {
    name: 'themes',

    data: {},

    elems: {},

    themes: {},

    themesLocal: {},

    onlineThemes: {},

    themesWidget,

    templates: {
        itemFragment: util.createElement('<div class="theme_item"></div>'),
        titleFragment: util.createElement(
            '<span class="panel-item theme-item clickable"></span>'
        ),
        titleWrapFragment: util.createElement(
            '<div class="panel-item-wrap"></div>'
        ),
        removeFragment: util.createElement(
            '<span class="option options-color small-text clickable">remove</span>'
        ),
        shareFragment: util.createElement(
            '<span class="option options-color small-text clickable">share</span>'
        ),
        authorFragment: util.createElement(
            '<a class="options-color gallery-bio small-text" title="author"></a>'
        ),
        infoFragment: util.createElement('<span class="info"></span>'),
    },

    init() {
        this.elems.rootNode = document.getElementById(
            'internal-selector-themes'
        );
        this.themes = new PagebaseGrouped();
        this.themes.init(
            document,
            this.name,
            this.elems.rootNode,
            this.templateFunc.bind(this)
        );

        this.themesWidget.themeAdded = this.themeAdded.bind(this);
        this.themesWidget.themeRemoved = this.themeRemoved.bind(this);

        this.loadThemes();
    },

    /**
     * Called when the sort order has been changed.
     *
     * @param {any} newSort The new sort order.
     */
    sortChanged(newSort) {
        this.themes.sortChanged(newSort, false);
    },

    /**
     * Loads the available themes from local and web storage
     */
    async loadThemes() {
        this.themes.clear();
        this.themes.addAll({
            heading: 'my themes',
            data: storage.get('themesLocal', []),
        });

        this.themes.addAll({
            heading: 'system themes',
            data: defaults.systemThemes,
        });

        // Load online themes.
        try {
            const downloadedThemes = await getThemes(defaults.defaultWebservice);
            if (!downloadedThemes?.length) {
                util.warn('No online themes available.');
                return;
            }

            this.onlineThemes = downloadedThemes.map((theme) => ({
                ...theme,
                online: true,
            }));
            this.themes.addAll({
                heading: 'online themes',
                data: this.onlineThemes,
            }, (error) => util.error('Could not load online themes', error));
        } catch (error) {
            util.error(`Could not load online themes: ${error}`);
        }
    },

    /**
     * Templates a provided theme into an HTML element.
     *
     * @param {any} theme The theme that should be turned into an element.
     * @return {any} The HTML element.
     */
    templateFunc(theme) {
        const fragment = util.createElement('');

        const title = this.templates.titleFragment.cloneNode(true);
        title.firstElementChild.id = `theme_${theme.id}`;
        title.firstElementChild.textContent = theme.title;
        title.firstElementChild.addEventListener(
            'click',
            this.applyTheme.bind(this, title.firstElementChild, theme)
        );

        const titleWrap = this.templates.titleWrapFragment.cloneNode(true);
        titleWrap.firstElementChild.appendChild(title);

        if (this.themesWidget.data.title === theme.title) {
            util.addClass(titleWrap.firstElementChild, 'active');
        }

        fragment.appendChild(titleWrap);

        const options = this.templates.infoFragment.cloneNode(true);
        const author = this.templates.authorFragment.cloneNode(true);
        author.firstElementChild.textContent = theme.author;
        options.firstElementChild.appendChild(author);

        if (!theme.online) {
            const share = this.templates.shareFragment.cloneNode(true);
            share.firstElementChild.addEventListener(
                'click',
                this.shareTheme.bind(this, theme)
            );
            options.firstElementChild.appendChild(share);

            const remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener(
                'click',
                this.removeTheme.bind(this, theme)
            );
            options.firstElementChild.appendChild(remove);
        }

        fragment.appendChild(options);

        return fragment;
    },

    applyTheme(themeNode, theme) {
        this.themesWidget.updateCurrentTheme('currentTheme', theme);

        const itemNode = themeNode.parentNode;
        const siblings = this.elems.rootNode.querySelectorAll('.panel-item-wrap');
        siblings.forEach((item) => {
            util.removeClass(item, 'active');
        });
        util.addClass(itemNode, 'active');
    },

    shareTheme(theme) {
        const title = theme.title;
        let message;
        let okay;
        let cancel;
        let callback;

        if (
            this.onlineThemes
                .map((t) => t.title.toLowerCase())
                .includes(title.toLowerCase())
        ) {
            message = 'already exists in the theme gallery.';
            cancel = 'okay';
        } else if (
            defaults.systemThemes
                .map((t) => t.title.toLowerCase())
                .includes(title.toLowerCase())
        ) {
            message = 'already exists as a system theme.';
            cancel = 'okay';
        } else {
            message = 'will be shared to the theme gallery.';
            okay = 'okay';
            cancel = 'cancel';
            callback = (result) => {
                if (result) {
                    this.themesWidget.shareTheme(
                        theme,
                        this.themeSharedHandler.bind(this, title)
                    );
                }
            };
        }

        modal.createModal(
            'shareThemeAlert',
            `${title} ${message}`,
            callback,
            okay,
            cancel
        );
    },

    removeTheme(theme) {
        modal.createModal(
            'removeThemeAlert',
            `${theme.title} will be removed.`, (result) => {
                if (result) {
                    this.themesWidget.removeTheme(theme);
                    this.loadThemes();
                }
            },
            'okay',
            'cancel'
        );
    },

    themeAdded() {
        this.loadThemes();
    },

    themeRemoved() {
        this.loadThemes();
    },

    themeSharedHandler(title, result, status) {
        if (result) {
            this.loadThemes();
        } else {
            modal.createModal(
                'shareThemeAlert',
                `${title} was not shared to the gallery. ErrorCode: '${status}'`,
                null,
                null,
                'okay'
            );
        }
    },
};
