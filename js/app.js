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

        var that = this;
        this.modules.forEach(function (module) {
          if (module.showOptionsChanged) {
            module.showOptionsChanged(that.showOptions);
          }
        });
      },

      setPageItemCount: function (pageItemCount) {
        pages.pageItemCount = pageItemCount;
        pages.setPageItemCount(pageItemCount);
      },

      // changeSorting: function (key, newSorting) {
      //   $scope.sort[key] = newSorting;
      //   storage.save('sort', $scope.sort);
      //   if ($scope.sort[key] === 0) {
      //     if (key == 'links') {
      //       $scope.loadLinks();
      //     } else if (key == 'apps') {
      //       $scope.loadApps();
      //     } else if (key == 'themes') {
      //       $scope.loadThemes();
      //     } else if (key == 'bookmarks') {
      //       var handleBookmarks = function (res) {
      //         $scope.$apply(function () {
      //           $scope.bookmarks[i] = res;
      //         });
      //       };
      //       for (i = $scope.bookmarks.length - 1; i >= 0; i--) {
      //         var parentId = typeof $scope.bookmarks[i][0].parentId;
      //         if (typeof parentId !== 'undefined') {
      //           chrome.bookmarks.getChildren(parentId, handleBookmarks);
      //         }
      //       }
      //     }
      //   } else if ($scope.sort[key] == 1) {
      //     if (key == 'themes') {
      //       $scope.localThemes.sort();
      //       $scope.onlineThemes.sort();
      //     } else if (key == 'bookmarks') {
      //       var compareFunction = function (a, b) {
      //         if (a.title.toLocaleLowerCase() > b.title.toLocaleLowerCase()) {
      //           return 1;
      //         } else if (a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()) {
      //           return -1;
      //         } else {
      //           return 0;
      //         }
      //       };
      //       for (i = 0; i < $scope.bookmarks.length; i++) {
      //         $scope.bookmarks[i].sort(compareFunction);
      //       }
      //     } else {
      //       $scope[key].sort();
      //     }
      //   }
      // }
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