import jquery from 'jquery';

import {Storage} from '../utils/utils';
import {Util} from '../utils/utils';
import {Modal} from '../utils/utils';
import ThemesWidget from '../widgets/themes';
import PagebaseGrouped from '../pagebase/pagebase_grouped';
import {SystemThemes, DefaultWebservice} from '../defaults';

let Templates = {
    itemFragment: Util.createElement('<div class="theme_item"></div>'),
    titleFragment: Util.createElement('<span class="panel-item clickable"></span>'),
    titleWrapFragment: Util.createElement('<div class="panel-item-wrap"></div>'),
    removeFragment: Util.createElement('<span class="option options-color small-text clickable">remove</span>'),
    shareFragment: Util.createElement('<span class="option options-color small-text clickable">share</span>'),
    authorFragment: Util.createElement('<a class="options-color gallery-bio small-text" title="author"></a>'),
    infoFragment: Util.createElement('<span class="info"></span>'),
};

/**
 * Page of available themes.
 *
 * @export
 * @class Themes
 */
export default class Themes {
    /**
     *Creates an instance of Themes.
     * @memberof Themes
     */
    constructor() {
        this.name = 'themes';

        this.data = {};

        this.elems = {};

        this.themes = {};

        this.themesLocal = {};

        this.onlineThemes = {};

        this.elems.rootNode = document.getElementById('internal-selector-themes');
        this.themes = new PagebaseGrouped(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
        this.loadThemes();

        ThemesWidget.themeAdded = this.themeAdded.bind(this);
        ThemesWidget.themeRemoved = this.themeRemoved.bind(this);
    }

    /**
     * Called when the sort order has been changed.
     *
     * @param {any} newSort The new sort order.
     */
    sortChanged(newSort) {
        this.themes.sortChanged(newSort, false);
    }

    /**
     * Loads the available themes from local and web storage
     */
    loadThemes() {
        this.themes.clear();
        this.themes.addAll({
            'heading': 'my themes',
            'data': Storage.get('themesLocal', []),
        });

        this.themes.addAll({
            'heading': 'system themes',
            'data': SystemThemes,
        });

        // Load online themes.
        jquery.get(
            `${DefaultWebservice}/themes.json`,
            (themes) => {
                if (!themes || themes.length == 0) {
                    Util.warn('No online themes available.');
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
                        Util.error('Could not load online themes', error);
                    });
            });
    }

    /**
     * Templates a provided theme into an HTML element.
     *
     * @param {any} theme The theme that should be turned into an element.
     * @return {any} The HTML element.
     */
    templateFunc(theme) {
        let fragment = Util.createElement('');

        let title = Templates.titleFragment.cloneNode(true);
        title.firstElementChild.id = `theme_${theme.id}`;
        title.firstElementChild.textContent = theme.title;
        title.firstElementChild.addEventListener('click', this.applyTheme.bind(this, title.firstElementChild, theme));

        let titleWrap = Templates.titleWrapFragment.cloneNode(true);
        titleWrap.firstElementChild.appendChild(title);

        if (ThemesWidget.data.title === theme.title) {
            Util.addClass(titleWrap.firstElementChild, 'active');
        }

        fragment.appendChild(titleWrap);

        let options = Templates.infoFragment.cloneNode(true);
        let author = Templates.authorFragment.cloneNode(true);
        author.firstElementChild.textContent = theme.author;
        options.firstElementChild.appendChild(author);

        if (!theme.online) {
            let share = Templates.shareFragment.cloneNode(true);
            share.firstElementChild.addEventListener('click', this.shareTheme.bind(this, theme));
            options.firstElementChild.appendChild(share);

            let remove = Templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeTheme.bind(this, theme));
            options.firstElementChild.appendChild(remove);
        }

        fragment.appendChild(options);

        return fragment;
    }

    /**
     * Applies the selected theme.
     *
     * @param {*} themeNode The node to apply.
     * @param {*} theme The theme to apply.
     * @memberof Themes
     */
    applyTheme(themeNode, theme) {
        ThemesWidget.updateCurrentTheme('currentTheme', theme);

        let itemNode = themeNode.parentNode;
        let siblings = jquery(this.elems.rootNode).find('.panel-item-wrap');
        Array.prototype.slice.call(siblings).forEach((item) => {
            Util.removeClass(item, 'active');
        });
        Util.addClass(itemNode, 'active');
    }

    /**
     * Share theme to the web service.
     *
     * @param {*} theme The theme to share.
     * @memberof Themes
     */
    shareTheme(theme) {
        let title = theme.title;
        let message;
        let okay;
        let cancel;
        let callback;

        if (this.onlineThemes.map((t) => t.title.toLowerCase()).includes(title.toLowerCase())) {
            message = 'already exists in the theme gallery.';
            cancel = `okay`;
        } else if (SystemThemes.map((t) => t.title.toLowerCase()).includes(title.toLowerCase())) {
            message = 'already exists as a system theme.';
            cancel = `okay`;
        } else {
            message = 'will be shared to the theme gallery.';
            okay = 'okay';
            cancel = 'cancel';
            callback = (result) => {
                if (result) {
                    ThemesWidget.shareTheme(theme);
                    this.loadThemes();
                }
            };
        }

        Modal.createModal('shareThemeAlert', `${title} ${message}`, callback, okay, cancel);
    }

    /**
     * Removes a theme.
     *
     * @param {*} theme Theme to be removed.
     * @memberof Themes
     */
    removeTheme(theme) {
        Modal.createModal('removeThemeAlert', `${theme.title} will be removed.`,
            (result) => {
                if (result) {
                    ThemesWidget.removeTheme(theme);
                    this.loadThemes();
                }
            },
            'okay',
            'cancel');
    }

    /**
     * A theme has been added.
     *
     * @memberof Themes
     */
    themeAdded() {
        this.loadThemes();
    }

    /**
     * A theme has been removed.
     *
     * @memberof Themes
     */
    themeRemoved() {
        this.loadThemes();
    }
}
