define(['jquery', 'jss', '../utils/storage', '../utils/defaults', './links', './apps', './bookmarks', './themes'],
function Pages(jquery, jss, storage, defaults, links, apps, bookmarks, themes) {
  var pages = {

    name: 'pages',

    elems: {
      chooser: document.getElementById('pages-chooser')
    },

    data: [links, apps, bookmarks, themes],

    forEachModule: function(func) {
      var thatArgs = arguments;
      this.data.forEach(function(module) {
        if (module[func]) {
          module[func].apply(module, Array.prototype.slice.call(thatArgs, 1));
        }
      });
    },

    init: function(document) {
      this.showOptions = false;
      this.page = storage.get('page', 'links');

      var that = this;
      this.data.forEach(function(module) {
          module.init(document);

          // jquery('#' + module.name + '-sort-chooser').metroSelect({
          //     initial: that.getSort(module),
          //     onchange: that.updateSort.bind(that, module)
          // });
      });
      
      jquery(this.elems.chooser).metroSelect({
        'initial': this.page,
        'onchange': this.changePage.bind(this)
      });
    },

    getSort: function(module) {
        var sort = storage.get('sort', defaults.defaultSort);
        return sort[module.name];
    },

    updateSort: function (module, newSort) {
        var sort = storage.get('sort', defaults.defaultSort);
        sort[module.name] = newSort;
        storage.save('sort', sort);

        module.sortChanged();
    },

    changePage: function changePage(page) {
      this.page = page;
      storage.save('page', page);

      jss.set('.external .internal', {
        'margin-left': (this.indexOfModule(page) * -100) + '%'
      });
    },

    // Sets whether options are currently showing.
    // showOptions: true, if options are now showing; false otherwise.
    showOptionsChanged: function(showOptions) {
      this.showOptions = showOptions;
      // this.onWindowResized();
      this.forEachModule('setShowOptions', showOptions);
    },

    // Returns the index of a provided module.
    // module: The module to find the index of.
    indexOfModule: function indexOfModule(moduleName) {
      return this.data.map(function(m) { return m.name; }).indexOf(moduleName);
    }
  };

  return pages;
});
