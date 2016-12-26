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
      this.forEachModule('init', document, this.getPageItemCount());

      this.page = storage.get('page', 'links');
      jquery(this.elems.chooser).metroSelect({
        initial: this.page,
        onchange: this.changePage.bind(this)
      });

      var sortOrder = storage.get('sort', defaults.getDefaultSort());
      for (var i = 0; i < this.data.length; i++) {
        var module = this.data[i];
        if (module.sortChanged) {
          module.sort = sortOrder[module.name];
          jquery("#" + module.name + "-sort-chooser").metroSelect({ 
            initial: module.sort,
            onchange: module.sortChanged.bind(module)
          });
        }
      }

      jquery(window).bind('resize', this.onWindowResized.bind(this));
      this.onWindowResized();
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

    // Compare document height to element height to fine the number of elements per page.
    onWindowResized: function() {
      // var height = this.getContentHeight();
      // jss.set('.internal_selector', {
      //   height: height + 'px'
      // });
      // jss.set('.bookmark-page', {
      //   height: height + 'px'
      // });
      // console.log("content height: " + height);

      // var pageItemCount = this.getPageItemCount();
      // this.forEachModule('setPageItemCount', pageItemCount);
    },

    // Gets the current height of the content page.
    getContentHeight: function() {
      var pageHeight = jquery('body').height();
      var headerHeight = jquery('h1').outerHeight(true);
      var navBarHeight = jquery('.pages-chooser').outerHeight(true);
      var footerHeight = jquery('.footer').outerHeight(true);
      console.log("page: " + pageHeight + ", header: " + headerHeight + ", navBar: " + navBarHeight + ", footer: " + footerHeight);
      return pageHeight - (headerHeight + navBarHeight + footerHeight);
    },

    // Sets the new number of pages for the block.
    // pageItemCount: The maximum number of pages able to be displayed.
    getPageItemCount: function() {
      return Math.floor((this.getContentHeight()) / 65);
    },

    // Sets whether options are currently showing.
    // showOptions: true, if options are now showing; false otherwise.
    showOptionsChanged: function(showOptions) {
      this.showOptions = showOptions;
      this.onWindowResized();
      this.forEachModule('setShowOptions', showOptions);
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
