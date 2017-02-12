define(['detect-dom-ready', './pages/pages', './widgets/widgets', './utils/defaults', './utils/script', './utils/storage'],
  function (domready, pages, widgets, defaults, script, storage) {
    'use strict';

    var app = {
      data: {},

      elems: {
        hideRule: document.getElementById('hideRule')
      },

      showOptions: false,

      modules: [pages, widgets, storage, script],

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

        if (this.showOptions) {
          document.body.removeChild(this.elems.hideRule);
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