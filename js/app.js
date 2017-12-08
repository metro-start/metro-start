define(['detect-dom-ready', './utils/utils', './widgets/widgets', './pages/pages'],
  function (domready, utils, widgets, pages) {
    'use strict';

    var app = {
      data: {},

      elems: {
        hideRule: document.getElementById('hideRule')
      },

      showOptions: false,

      utils: utils,

      modules: [utils, widgets, pages],

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

      /**
       * Shows the options on the page when the wrench is clicked.
       */
      clickWrench: function () {
        this.showOptions = !this.showOptions;

        if (this.showOptions) {
          document.body.removeChild(this.elems.hideRule);
        } else {
          document.body.appendChild(this.elems.hideRule);
        }
      }
    };

    // Initialize the app after the storage is done initializing.
    // This ensures we can retrieve our data before rendering the page.
    utils.storage.init().done(function () {
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