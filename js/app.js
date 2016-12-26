define(['detect-dom-ready', './pages/pages', './widgets/widgets', './utils/defaults', './utils/script', './utils/storage', './utils/util'],
  function (domready, pages, widgets, defaults, script, storage, util) {
    'use strict';

    var app = {
      data: {},

      elems: {
        wrench: document.getElementById('wrench'),
        hideRule: document.getElementById('hideRule')
      },

      showOptions: false,

      modules: Array.prototype.slice.call(arguments, 1),

      init: function () {
        this.modules.forEach(function (module) {
          module.init(document);
        });
        this.elems.wrench.addEventListener('click', this.clickWrench.bind(this));
      },

      clickWrench: function () {
        this.showOptions = !this.showOptions;

        pages.wrenchClicked();
        
        if (this.showOptions) {
          this.elems.hideRule.remove();
        } else {
          document.body.appendChild(this.elems.hideRule);
        }
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