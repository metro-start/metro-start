define(['jquery', 'jss', '../utils/storage', '../utils/defaults', './todos', './sessions', './apps', './bookmarks', './themes'],
function Pages(jquery, jss, storage, defaults, todos, sessions, apps, bookmarks, themes) {
  var pages = {

    name: 'pages',

    elems: {
      chooser: document.getElementById('pages-chooser')
    },

    modules: [todos, sessions, apps, bookmarks, themes],

    init: function(document) {
      this.showOptions = false;
      this.page = storage.get('page', 'todos');

      this.modules.forEach(function(module) {
          module.init(document);
      });
      
      jquery(this.elems.chooser).metroSelect({
        'initial': this.page,
        'onchange': this.changePage.bind(this)
      });

      // Set the initial page.
      this.changePage(this.page);
    },

    /**
     * Change the currently selected page.
     * 
     * @param {any} page The new page.
     */
    changePage: function changePage(page) {
      this.page = page;
      storage.save('page', page);

      var moduleIndex = this.modules.map(function(m) { return m.name; }).indexOf(page);

      jss.set('.external .internal', {
        'margin-left': (moduleIndex * -100) + '%'
      });
    }
  };

  return pages;
});
