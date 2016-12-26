define(['jquery', 'jss', '../utils/storage', '../utils/defaults', './links', './apps', './bookmarks', './themes'],
function Pages(jquery, jss, storage, defaults, links, apps, bookmarks, themes) {
  var pages = {

    name: 'pages',

    elems: {
      chooser: document.getElementById('pages-chooser')
    },

    modules: [links, apps, bookmarks, themes],
    
    data: Array.prototype.slice.call(arguments, 4),

    showOptions: false,

    forEachModule: function(func) {
      var thatArgs = arguments;
      this.data.forEach(function(module) {
        if (module[func]) {
          module[func].apply(module, Array.prototype.slice.call(thatArgs, 1));
        }
      });
    },

    init: function(document) {
      this.forEachModule('init', document);

      this.page = storage.get('page', 'links');
      jquery(this.elems.chooser).metroSelect({
        initial: this.page,
        onchange: this.changePage.bind(this)
      });
    },

    changePage: function changePage(page) {
      this.page = page;
      if (page !== 'themes') {
        storage.save('page', page);
      }

      jss.set('.internal', {
        'margin-left': (this.indexOfModule(page) * -100) + '%'
      });
    },

    // Returns the index of a provided module.
    // module: The module to find the index of.
    indexOfModule: function indexOfModule(moduleName) {
      return this.data.map(function(m) { return m.name; }).indexOf(moduleName);
    },

    wrenchClicked: function() {
        // If we're on the theme when wrench was clicked, navigate to the last page.
        if (this.page === 'themes') {
          jquery(this.elems.chooser).metroSelect().select_child(storage.get('page', 'links'));
        }
      }
  };

  return pages;
});
