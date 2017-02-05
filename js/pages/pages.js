define(['jquery', 'jss', '../utils/storage', './links', './apps', './bookmarks', './themes'],
function Pages(jquery, jss, storage, links, apps, bookmarks, themes) {
  var pages = {

    name: 'pages',

    elems: {},

    data: Array.prototype.slice.call(arguments, 3),

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

      this.showOptions = false;
      this.changePage(storage.get('page', 'links'));

      jquery(this.elems.chooser).metroSelect({
        'onchange': this.changePage.bind(this)
      });

      var that = this;
      jquery(window).bind('resize', this.onWindowResized.bind(this));
      this.onWindowResized();
    },

    changePage: function changePage(page) {
      this.page = page;
      if (page != 'themes') {
        storage.save('page', page);
      }

      this.elems.chooser = document.getElementById(this.name + '-chooser');
      jquery(this.elems.chooser).attr('selectedIndex', this.indexOfModule(this.page));
      jquery(this.elems.chooser).change();

      jss.set('.external .internal', {
        'margin-left': (this.indexOfModule(page) * -100) + '%'
      });
    },

    // Compare document height to element height to fine the number of elements per page.
    onWindowResized: function() {
      var height = this.getContentHeight();

      jss.set('.external', {
        'height': '' + height
      });
      jss.set('.bookmark-page', {
        'height': '' + height
      });

      var pageItemCount = this.getPageItemCount();
      this.forEachModule('setPageItemCount', pageItemCount);
      this.forEachModule('setHeight', height);
    },

    // Gets the current height of the content page.
    getContentHeight: function() {
      var pageHeight = jquery('body').height();
      var headerHeight = jquery('h1').outerHeight(true);
      var navBarHeight = jquery('.' + this.name + '-chooser').outerHeight(true);
      var footerHeight = jquery('.footer').outerHeight(true);
      return pageHeight - (headerHeight + navBarHeight + footerHeight);
    },

    // Sets the new number of pages for the block.
    // pageItemCount: The maximum number of pages able to be displayed.
    getPageItemCount: function() {
      return Math.floor((this.getContentHeight()) / 60);
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
    }
  };

  return pages;
});
