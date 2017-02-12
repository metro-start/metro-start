define(['detect-dom-ready', './pages/pages', './widgets/widgets', './utils/defaults', './utils/script', './utils/storage'],
  function (domready, pages, widgets, defaults, script, storage) {
    'use strict';

    var app = {
      data: {},

      elems: {
        hideRule: document.getElementById('hideRule')
      },

      showOptions: false,

      modules: Array.prototype.slice.call(arguments, 1),

      init: function () {
        this.modules.forEach(function (module) {
          module.init(document);
        });

        var that = this;
        var wrench = document.getElementById('wrench');
        wrench.addEventListener('click', function () {
          that.clickWrench();
        });
      },

      clickWrench: function () {
        this.showOptions = !this.showOptions;

        var that = this;
        if (this.showOptions) {
          document.body.removeChild(this.elems.hideRule);
        } else {
          document.body.appendChild(this.elems.hideRule);
        }

        // If we're on the theme when wrench was clicked, navigate to the last page.
        if (pages.page === 'themes') {
          pages.changePage(storage.get('page', 'links'));
        }

        this.modules.forEach(function (module) {
          if (module.showOptionsChanged) {
            module.showOptionsChanged(that.showOptions);
          }
        });
      }
    };

    storage.init().done(function () {
      if (!!document) {
        app.init();
      } else {
        domready(function () {
          app.init();
        });
      }
    });

    return app;
  });