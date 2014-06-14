var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25604585-1']);
_gaq.push(['_trackPageview']);

var modules = ['domReady!', 'jss', 'pages/pages', 'widgets/widgets', 'utils/defaults', 'utils/script', 'utils/storage', 'utils/util'];
define(modules, function (document, jss, pages, widgets, defaults, script, storage, util) {
        'use strict';

        var that = this;
        var app = {
            data: {},

            elems: {},

            showOptions: false,

            modules: Array.prototype.slice.call(arguments, 2),

            init: function() {
                this.modules.forEach(function(module) {
                    module.init(document);
                });

                var that = this;
                var wrench = document.getElementById('wrench');
                wrench.addEventListener('click', function() {
                    that.clickWrench();
                });

                this.elems.hideRule = document.getElementById('hideRule');
                // script.updateStyle(false);
                // $scope.updateWeather(false);
            },

            clickWrench: function() {
                this.data.showOptions = !this.data.showOptions;

                var that = this;
                if (this.data.showOptions) {
                    document.body.removeChild(this.elems.hideRule);
                } else {
                    document.body.appendChild(this.elems.hideRule);
                }

                // If we're on the theme when wrench was clicked, navigate to the last page.
                if (this.data.page == 3) {
                    this.data.page = storage.get('page', 0);
                }
                this.modules.forEach(function(module) {
                    if (module.showOptionsChanged) {
                        module.showOptionsChanged(that.data.showOptions);
                    }
                });
                // $scope.editThemeText = 'edit theme'; // Hide the theme editing panel.
                _gaq.push(['_trackEvent', 'Page', 'Wrench']);
            },

            setPageItemCount: function(pageItemCount) {
                this.data.pageItemCount = pageItemCount;
                pages.setPageItemCount(pageItemCount);
            },

            changeSorting: function(key, newSorting) {
                $scope.sort[key] = newSorting;
                storage.save('sort', $scope.sort);
                if ($scope.sort[key] === 0) {
                    if (key == 'links') {
                        $scope.loadLinks();
                    } else if(key == 'apps') {
                        $scope.loadApps();
                    } else if(key == 'themes') {
                        $scope.loadThemes();
                    } else if (key == 'bookmarks') {
                        var handleBookmarks = function(res) {
                            $scope.$apply(function() {
                                $scope.bookmarks[i] = res;
                            });
                        };
                        for (i = $scope.bookmarks.length - 1; i >= 0; i--) {
                            var parentId = typeof $scope.bookmarks[i][0].parentId;
                            if (typeof parentId !== 'undefined') {
                                chrome.bookmarks.getChildren(parentId, handleBookmarks);
                            }
                        }
                    }
                    _gaq.push(['_trackEvent', 'Page', 'Show Unsorted Items']);
                }
                else if ($scope.sort[key] == 1) {
                    if (key == 'themes') {
                        $scope.localThemes.sort();
                        $scope.onlineThemes.sort();
                    } else if (key == 'bookmarks') {
                        var compareFunction = function(a, b) {
                            if (a.title.toLocaleLowerCase() > b.title.toLocaleLowerCase()) {
                                return 1;
                            } else if(a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()) {
                                return -1;
                            } else {
                                return 0;
                            }
                        };
                        for (i = 0; i < $scope.bookmarks.length; i++) {
                            $scope.bookmarks[i].sort(compareFunction);
                        }
                    } else {
                        $scope[key].sort();
                    }
                    _gaq.push(['_trackEvent', 'Page', 'Show Sorted Items']);
                }
            }
        };

        return app;
    });
