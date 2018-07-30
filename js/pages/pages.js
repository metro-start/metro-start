import jquery from 'jquery';
import jss from 'jss';
import 'metro-select';

import Themes from './themes';
import Bookmarks from './bookmarks';
import Apps from './apps';
import Sessions from './sessions';
import Todos from './todos';
import {Storage} from '../utils/utils';

/**
 * Switchable pages.
 *
 * @export
 * @class Pages
 */
export default class Pages {
    /**
     *Creates an instance of Pages.
     * @param {*} document Current document.
     * @memberof Pages
     */
    constructor() {
        this.name = 'pages';

        this.todos = new Todos();
        this.sessions = new Sessions();
        this.apps = new Apps();
        this.bookmarks = new Bookmarks();
        this.themes = new Themes();

        this.showOptions = false;

        this.elems = {
            chooser: document.getElementById('pages-chooser'),
        };
        this.page = Storage.get('page', 'todos');

        jquery(this.elems.chooser).metroSelect({
            'initial': this.page,
            'onchange': this.changePage.bind(this),
        });

        // Set the initial page.
        this.changePage(this.page);
    }

    /**
     * Change the currently selected page.
     *
     * @param {any} page The new page.
     */
    changePage(page) {
        this.page = page;
        Storage.set('page', page);

        let moduleIndex = this.modules.map((m) => {
            return m.name;
        }).indexOf(page);

        jss.set('.external .internal', {
            'margin-left': `${moduleIndex * -100}%`,
        });
    }
}
